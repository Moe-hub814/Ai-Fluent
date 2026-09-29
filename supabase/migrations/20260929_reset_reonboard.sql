-- 2026-09-29 — Reset = fresh start (beta feedback, Allie, Sep 28):
-- "When I reset my data, I didn't get asked that question again."
-- reset_my_progress now also clears the onboarding answers so the role /
-- experience / goals questions are asked again and the path is re-tailored.
create or replace function public.reset_my_progress()
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from public.user_progress  where user_id = auth.uid();
  delete from public.challenge_log  where user_id = auth.uid();
  update public.profiles
     set current_streak = 0, longest_streak = 0, total_tutor_sessions = 0, last_active_date = null,
         onboarded = false, role = null, experience_level = null
   where id = auth.uid();
end $$;
revoke all on function public.reset_my_progress() from public;
grant execute on function public.reset_my_progress() to authenticated;
