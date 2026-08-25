-- Lumicamp — 2026-08-25
-- Cross-device preferences + cleanup. Run in Supabase → SQL editor.
-- Safe to run more than once.

-- 1. Preferences that were only in localStorage (lost on a new device).
--    `language` already exists on profiles; add the other two.
alter table public.profiles add column if not exists theme text;
alter table public.profiles add column if not exists tutorial_seen boolean not null default false;

-- 2. Belt-and-braces: the unique key the app upserts on. Verified present on
--    2026-08-25 (upsert merged correctly); this is a no-op if it already exists.
create unique index if not exists user_progress_user_path_lesson_idx
  on public.user_progress (user_id, path_id, lesson_index);

-- 3. Remove the one test row written while verifying the fix
--    (path "__probe__" in the owner's account — RLS blocks client-side delete).
delete from public.user_progress where path_id = '__probe__';

-- 4. (Optional) let users delete their own progress rows. Not needed by the app
--    today; uncomment only if you add a "reset my progress" feature.
-- create policy user_progress_delete_own on public.user_progress
--   for delete using (auth.uid() = user_id);
