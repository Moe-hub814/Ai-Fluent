-- Lumicamp product analytics (2026-09-10)
-- Self-hosted, privacy-friendly: no IPs, no cookies, no third party.
-- Clients can only INSERT; reading is for the owner via the SQL editor / views.

create table if not exists public.events (
  id          bigint generated always as identity primary key,
  ts          timestamptz not null default now(),
  event       text not null check (char_length(event) <= 60),
  props       jsonb not null default '{}'::jsonb,
  anon_id     text not null,
  user_id     uuid,                       -- null for signed-out visitors (not enforced as FK so deletes never fail)
  session_id  text,
  lang        text,
  platform    text,
  app_version text
);
create index if not exists events_ts_idx on public.events (ts desc);
create index if not exists events_event_ts_idx on public.events (event, ts desc);
create index if not exists events_anon_idx on public.events (anon_id);

alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
grant insert on public.events to anon, authenticated;
drop policy if exists events_insert_any on public.events;
create policy events_insert_any on public.events for insert to anon, authenticated with check (true);
-- no select policy: clients cannot read events

-- Account deletion: also wipe that user's events (extend delete_my_account if you want it inline)
create or replace function public.delete_my_events() returns void
language sql security definer set search_path = public as $$
  delete from public.events where user_id = auth.uid();
$$;
grant execute on function public.delete_my_events() to authenticated;

-- ---------------------------------------------------------------------------
-- Funnel views (owner-only via SQL editor / dashboard)
-- ---------------------------------------------------------------------------
-- Daily funnel: distinct devices that opened the app → opened a location →
-- opened a lesson → started practice → submitted an answer → completed a lesson
create or replace view public.v_funnel_daily as
select date_trunc('day', ts)::date as day,
  count(distinct anon_id) filter (where event = 'app_open')          as opened,
  count(distinct anon_id) filter (where event = 'loc_open')          as opened_location,
  count(distinct anon_id) filter (where event = 'lesson_open')       as opened_lesson,
  count(distinct anon_id) filter (where event = 'practice_start')    as started_practice,
  count(distinct anon_id) filter (where event = 'practice_submit')   as submitted_answer,
  count(distinct anon_id) filter (where event = 'lesson_complete')   as completed_lesson,
  count(distinct anon_id) filter (where event = 'signin_success')    as signed_in
from public.events
group by 1 order by 1 desc;

-- Which features get used (last 30 days)
create or replace view public.v_feature_use_30d as
select event, count(*) as events, count(distinct anon_id) as devices
from public.events
where ts > now() - interval '30 days'
group by event order by events desc;

-- Where practice submissions fail
create or replace view public.v_practice_errors_30d as
select props->>'reason' as reason, count(*) as n
from public.events
where event = 'practice_error' and ts > now() - interval '30 days'
group by 1 order by 2 desc;

revoke all on public.v_funnel_daily, public.v_feature_use_30d, public.v_practice_errors_30d from anon, authenticated;
