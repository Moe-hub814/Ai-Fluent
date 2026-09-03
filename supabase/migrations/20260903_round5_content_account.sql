-- Lumicamp — 2026-09-03 (round 5)
-- Run in Supabase → SQL editor (paste the CONTENTS). Safe to run more than once.
--
--  1. content_cache      shared cache for lesson translations + generated daily
--                        challenges (service role only; read/written by the
--                        claude-proxy edge function)
--  2. lesson_overrides   fix a dated sentence without a deploy: the app merges
--                        these rows over the built-in LESSONS on startup
--  3. challenge_log      one row per user per day — daily challenges finally
--                        persist server-side (streak history, future badges)
--  4. reset_my_progress  / delete_my_account   RPCs (Play Store requires an
--                        in-app account-deletion path for apps with sign-in)

-- 1 ---------------------------------------------------------------------------
create table if not exists public.content_cache (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.content_cache enable row level security;
revoke all on public.content_cache from anon, authenticated;

-- 2 ---------------------------------------------------------------------------
-- `lesson` is a partial lesson object: any of title / sections / questions /
-- practice. Example:
--   insert into public.lesson_overrides (path_id, lesson_index, lesson)
--   values ('basics', 2, '{"sections":[{"h":"...","body":"..."}]}')
--   on conflict (path_id, lesson_index) do update set lesson = excluded.lesson, updated_at = now();
create table if not exists public.lesson_overrides (
  path_id      text not null,
  lesson_index int  not null,
  lesson       jsonb not null,
  updated_at   timestamptz not null default now(),
  primary key (path_id, lesson_index)
);
alter table public.lesson_overrides enable row level security;
drop policy if exists lesson_overrides_read_all on public.lesson_overrides;
create policy lesson_overrides_read_all on public.lesson_overrides
  for select to anon, authenticated using (true);

-- 3 ---------------------------------------------------------------------------
create table if not exists public.challenge_log (
  user_id      uuid not null references auth.users(id) on delete cascade,
  day          date not null,
  challenge_id text not null,
  title        text,
  score        int,
  created_at   timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.challenge_log enable row level security;
drop policy if exists challenge_log_own_select on public.challenge_log;
drop policy if exists challenge_log_own_insert on public.challenge_log;
drop policy if exists challenge_log_own_update on public.challenge_log;
create policy challenge_log_own_select on public.challenge_log for select using (auth.uid() = user_id);
create policy challenge_log_own_insert on public.challenge_log for insert with check (auth.uid() = user_id);
create policy challenge_log_own_update on public.challenge_log for update using (auth.uid() = user_id);

-- 4 ---------------------------------------------------------------------------
create or replace function public.reset_my_progress()
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from public.user_progress  where user_id = auth.uid();
  delete from public.challenge_log  where user_id = auth.uid();
  update public.profiles
     set current_streak = 0, longest_streak = 0, total_tutor_sessions = 0, last_active_date = null
   where id = auth.uid();
end $$;
revoke all on function public.reset_my_progress() from public;
grant execute on function public.reset_my_progress() to authenticated;

create or replace function public.delete_my_account()
returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not signed in'; end if;
  delete from public.user_progress where user_id = uid;
  delete from public.challenge_log where user_id = uid;
  delete from public.profiles      where id = uid;
  -- org memberships / certificates keep their own FK rules; add here if needed.
  delete from auth.users where id = uid;
end $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
