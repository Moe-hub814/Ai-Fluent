-- Lumicamp — 2026-09-03
-- Shared AI News cache. Beta feedback: "AI News takes a while to populate;
-- nobody will stay on the page long enough". The live web search costs
-- 15-30 s per call. With this table only ONE request per language every few
-- hours pays that cost; everyone else gets the same stories in ~200 ms.
-- Run in Supabase → SQL editor. Safe to run more than once.

create table if not exists public.news_cache (
  key         text primary key,            -- e.g. "en:2026-09-03"
  articles    jsonb not null,
  fetched_at  timestamptz not null default now()
);

alter table public.news_cache enable row level security;

-- Only the edge function (service role) reads/writes this table; no client
-- policy is needed. Anonymous/authenticated users get nothing directly.
revoke all on public.news_cache from anon, authenticated;

-- Keep the table tiny: rows older than 7 days are useless.
create or replace function public.news_cache_prune() returns void language sql as $$
  delete from public.news_cache where fetched_at < now() - interval '7 days';
$$;
