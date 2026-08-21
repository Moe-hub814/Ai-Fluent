-- Name capture after sign-in (NameStep). Idempotent; safe to re-run.
alter table public.profiles add column if not exists display_name text;

-- Clear the placeholder that a column default/trigger was writing ("AI"), so
-- the app asks these users for their real name on next visit.
alter table public.profiles alter column display_name drop default;
update public.profiles
   set display_name = null
 where lower(trim(coalesce(display_name,''))) in ('', 'ai', 'aifluent', 'ai fluent', 'lumicamp', 'learner', 'explorer');
