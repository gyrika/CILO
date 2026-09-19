-- Brute-force protection for the admin login form (app/login/actions.ts).
-- Blocks further login attempts from an IP after 5 FAILED attempts within
-- a rolling 15-minute window.
--
-- Same locked-down pattern as inquiry-rate-limiting.sql: the table itself
-- grants no direct anon/authenticated access at all (RLS enabled, zero
-- policies = deny everything via the API). The only way to interact with it
-- is through two narrow SECURITY DEFINER functions below.
--
-- Unlike the inquiry form's single check-and-record RPC, login needs TWO
-- separate calls, because we only want to count FAILED attempts, and we
-- don't know whether an attempt failed until after Supabase Auth has
-- actually tried it:
--   1. check_login_rate_limit(ip) -- called BEFORE attempting sign-in, to
--      decide whether to even try. Read-only, no side effects.
--   2. record_login_failure(ip)   -- called AFTER a failed sign-in, to log
--      that failure. A successful login never calls this, so correct
--      logins are never penalized for earlier typos.

create table public.login_rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  created_at timestamptz not null default now()
);

create index login_rate_limits_ip_created_idx
  on public.login_rate_limits (ip_address, created_at);

alter table public.login_rate_limits enable row level security;
-- No policies added on purpose -- see note above.

create or replace function public.check_login_rate_limit(p_ip text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_failures integer;
begin
  select count(*) into recent_failures
  from public.login_rate_limits
  where ip_address = p_ip
    and created_at > now() - interval '15 minutes';

  return recent_failures < 5;
end;
$$;

create or replace function public.record_login_failure(p_ip text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.login_rate_limits (ip_address) values (p_ip);
end;
$$;

-- Let anonymous visitors (nobody is logged in yet at the login form) call
-- both functions, but never touch the table directly.
grant execute on function public.check_login_rate_limit(text) to anon, authenticated;
grant execute on function public.record_login_failure(text) to anon, authenticated;

-- Optional housekeeping: uncomment and run periodically (e.g. via a
-- scheduled Supabase Edge Function or pg_cron) to keep the table small.
-- delete from public.login_rate_limits where created_at < now() - interval '1 day';
