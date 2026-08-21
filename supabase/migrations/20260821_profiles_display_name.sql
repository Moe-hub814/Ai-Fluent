-- Name capture after sign-in (NameStep). Idempotent; safe to re-run.
alter table public.profiles add column if not exists display_name text;

-- Clear the placeholder the signup default was writing ("AI Explorer"), so
-- the app asks these users for their real name on next visit.
alter table public.profiles alter column display_name drop default;
update public.profiles
   set display_name = null
 where lower(regexp_replace(trim(coalesce(display_name,'')), '\s+', ' ', 'g'))
       in ('', 'ai', 'ai explorer', 'ai learner', 'aifluent', 'ai fluent', 'lumicamp', 'learner', 'explorer');
