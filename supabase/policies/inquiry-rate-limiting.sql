-- Rate limiting for the property inquiry form (app/properties/[slug]/actions.ts).
-- Limits submissions to 3 per IP address per rolling hour.
--
-- Design: the rate-limit table itself is NOT directly readable or writable
-- through the public API (no RLS policies grant anon/authenticated access to
-- it at all -- RLS is enabled with zero permissive policies, which denies
-- everything by default). The only way to interact with it is through the
-- `check_inquiry_rate_limit` function below, which is SECURITY DEFINER (runs
-- with the privileges of the function owner, bypassing RLS internally) and
-- only exposes a single yes/no answer -- never the underlying rows. This
-- avoids two problems with a naive "just let anon SELECT/INSERT the table"
-- approach: (1) anyone could read all logged IP addresses and timestamps via
-- the REST API, and (2) anyone could insert/delete rows directly to erase or
-- forge their own rate-limit history.

create table public.inquiry_rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  created_at timestamptz not null default now()
);

create index inquiry_rate_limits_ip_created_idx
  on public.inquiry_rate_limits (ip_address, created_at);

alter table public.inquiry_rate_limits enable row level security;
-- No policies added on purpose: RLS enabled + zero policies = no anon/
-- authenticated access at all via PostgREST. Only SECURITY DEFINER
-- functions (which bypass RLS) can touch this table.

create or replace function public.check_inquiry_rate_limit(p_ip text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.inquiry_rate_limits
  where ip_address = p_ip
    and created_at > now() - interval '1 hour';

  if recent_count >= 3 then
    return false;
  end if;

  insert into public.inquiry_rate_limits (ip_address) values (p_ip);
  return true;
end;
$$;

-- Let anonymous site visitors call the function (but not the table).
grant execute on function public.check_inquiry_rate_limit(text) to anon, authenticated;

-- Optional housekeeping: uncomment and run periodically (e.g. via a
-- scheduled Supabase Edge Function or pg_cron) to keep the table small.
-- delete from public.inquiry_rate_limits where created_at < now() - interval '1 day';
