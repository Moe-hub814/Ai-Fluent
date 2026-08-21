-- Name capture after sign-in (NameStep). Idempotent; safe to re-run.
alter table public.profiles add column if not exists display_name text;
