-- Let a signed-in user create their own profiles row (upsert = insert needs
-- this; previously only UPDATE was allowed, so saving a name returned 42501).
alter table public.profiles enable row level security;
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
