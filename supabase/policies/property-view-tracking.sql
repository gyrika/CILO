-- View tracking for property detail pages (app/properties/[slug]/page.tsx).
-- Counts at most one view per visitor per property per day.
--
-- Same design as inquiry-rate-limiting.sql: the property_views table has RLS
-- enabled with zero policies, so the public API can't read or write it. The
-- only entry point is the SECURITY DEFINER function below, which records a
-- view and returns just the 7-day count -- never the visitor identifiers.
--
-- viewer_identifier is a SHA-256 hash of the visitor's IP + user agent,
-- computed in the app, so raw IP addresses are never stored here.

alter table public.properties
  add column view_count integer not null default 0;

create table public.property_views (
  property_id uuid not null references public.properties (id) on delete cascade,
  viewer_identifier text not null,
  viewed_date date not null default current_date,
  primary key (property_id, viewer_identifier, viewed_date)
);

create index property_views_property_date_idx
  on public.property_views (property_id, viewed_date);

alter table public.property_views enable row level security;
-- No policies added on purpose: only the function below can touch the table.

-- Records a view (if this visitor hasn't been counted today) and returns the
-- number of distinct daily views over the last 7 days, including today.
-- Returns 0 for unknown or unpublished properties without recording anything.
create or replace function public.record_property_view(
  p_property_id uuid,
  p_viewer text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted integer;
  weekly_count integer;
begin
  if not exists (
    select 1 from public.properties
    where id = p_property_id and is_published
  ) then
    return 0;
  end if;

  insert into public.property_views (property_id, viewer_identifier)
  values (p_property_id, p_viewer)
  on conflict do nothing;
  get diagnostics inserted = row_count;

  if inserted > 0 then
    update public.properties
    set view_count = view_count + 1
    where id = p_property_id;
  end if;

  select count(*) into weekly_count
  from public.property_views
  where property_id = p_property_id
    and viewed_date > current_date - 7;

  return weekly_count;
end;
$$;

-- Let anonymous site visitors call the function (but not the table).
grant execute on function public.record_property_view(uuid, text) to anon, authenticated;

-- Optional housekeeping: only the last 7 days are ever read, so older rows
-- can be deleted periodically (view_count keeps the all-time total).
-- delete from public.property_views where viewed_date < current_date - 30;
