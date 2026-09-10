-- Lumicamp for Teams — org admin dashboard, invite links, certificates, pilot requests
-- Idempotent: safe to paste into the Supabase SQL editor more than once.
-- Tables org_members / org_invites / cert_verification already exist in the live
-- project (created from the dashboard); every ALTER below is "if not exists".

create extension if not exists pgcrypto;

-- ─── ORGS ────────────────────────────────────────────────────────────────────
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  seat_limit int not null default 50,
  open_join boolean not null default true,
  policy_title text,
  policy_body text,
  policy_updated_at timestamptz
);
alter table public.orgs add column if not exists seat_limit int not null default 50;
alter table public.orgs add column if not exists open_join boolean not null default true;
alter table public.orgs add column if not exists policy_title text;
alter table public.orgs add column if not exists policy_body text;
alter table public.orgs add column if not exists policy_updated_at timestamptz;
alter table public.orgs add column if not exists created_by uuid;
alter table public.orgs add column if not exists created_at timestamptz not null default now();

-- ─── ORG MEMBERS ─────────────────────────────────────────────────────────────
create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  email text,
  user_id uuid,
  status text not null default 'invited',
  joined_at timestamptz
);
alter table public.org_members add column if not exists role text not null default 'member';
alter table public.org_members add column if not exists created_at timestamptz not null default now();
alter table public.org_members add column if not exists email text;
alter table public.org_members add column if not exists user_id uuid;
alter table public.org_members add column if not exists status text not null default 'invited';
alter table public.org_members add column if not exists joined_at timestamptz;
create index if not exists org_members_org_idx on public.org_members(org_id);
create index if not exists org_members_user_idx on public.org_members(user_id);
create unique index if not exists org_members_org_email_uidx on public.org_members(org_id, lower(email)) where email is not null;

-- ─── ORG INVITES ─────────────────────────────────────────────────────────────
create table if not exists public.org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  org_name text,
  token text not null unique,
  email text,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now()
);
alter table public.org_invites add column if not exists email text;
alter table public.org_invites add column if not exists created_by uuid;
alter table public.org_invites add column if not exists created_at timestamptz not null default now();
alter table public.org_invites add column if not exists shared boolean not null default false;

-- ─── CERTIFICATES ────────────────────────────────────────────────────────────
create table if not exists public.cert_verification (
  id uuid primary key default gen_random_uuid(),
  verify_code text not null unique,
  user_id uuid,
  org_id uuid,
  display_name text,
  cert_type text,
  issued_at timestamptz not null default now()
);
alter table public.cert_verification add column if not exists user_id uuid;
alter table public.cert_verification add column if not exists org_id uuid;
alter table public.cert_verification add column if not exists lessons_completed int;
alter table public.cert_verification add column if not exists avg_score int;
create index if not exists cert_verification_user_idx on public.cert_verification(user_id);

-- ─── PILOT REQUESTS (from the /teams.html landing page) ─────────────────────
create table if not exists public.pilot_requests (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text,
  email text not null,
  team_size text,
  message text,
  source text,
  created_at timestamptz not null default now()
);

-- ─── HELPERS ─────────────────────────────────────────────────────────────────
create or replace function public.is_org_admin(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = auth.uid() and m.role = 'admin' and m.status = 'active'
  );
$$;

create or replace function public.is_org_member(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = auth.uid() and m.status = 'active'
  );
$$;

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.org_invites enable row level security;
alter table public.cert_verification enable row level security;
alter table public.pilot_requests enable row level security;

drop policy if exists orgs_select_members on public.orgs;
create policy orgs_select_members on public.orgs for select to authenticated
  using (public.is_org_member(id) or created_by = auth.uid());
drop policy if exists orgs_update_admin on public.orgs;
create policy orgs_update_admin on public.orgs for update to authenticated
  using (public.is_org_admin(id)) with check (public.is_org_admin(id));

drop policy if exists org_members_select on public.org_members;
create policy org_members_select on public.org_members for select to authenticated
  using (user_id = auth.uid()
      or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      or public.is_org_admin(org_id));
drop policy if exists org_members_admin_write on public.org_members;
create policy org_members_admin_write on public.org_members for all to authenticated
  using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));
-- No self-service writes on org_members: members join only through the
-- join_org_by_invite() RPC. (A row-level "activate my own row" policy would let
-- a member set role = 'admin' — verified in testing, so it is deliberately absent.)
drop policy if exists org_members_self_activate on public.org_members;

drop policy if exists org_invites_select on public.org_invites;
create policy org_invites_select on public.org_invites for select to authenticated using (true);
drop policy if exists org_invites_admin_write on public.org_invites;
create policy org_invites_admin_write on public.org_invites for all to authenticated
  using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));
drop policy if exists org_invites_accept on public.org_invites;  -- accepted_at is set by the RPC only

-- Belt and braces: even an admin-scoped write can never promote a row to admin
-- unless the caller is already an admin of that org.
create or replace function public.guard_org_member_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if current_setting('lumicamp.bypass_role_guard', true) = '1' then return new; end if;
  if (tg_op = 'INSERT' and new.role = 'admin') or (tg_op = 'UPDATE' and new.role is distinct from old.role) then
    if auth.uid() is not null and not public.is_org_admin(new.org_id) then
      raise exception 'not_admin';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_org_member_role on public.org_members;
create trigger trg_guard_org_member_role before insert or update on public.org_members
  for each row execute function public.guard_org_member_role();

-- Certificates are publicly verifiable by code (the table holds only name/type/date).
drop policy if exists cert_public_read on public.cert_verification;
create policy cert_public_read on public.cert_verification for select to anon, authenticated using (true);

-- Nobody reads pilot requests through the API; the owner reads them in the dashboard.
drop policy if exists pilot_requests_none on public.pilot_requests;
create policy pilot_requests_none on public.pilot_requests for select to authenticated using (false);

-- ─── RPCs ────────────────────────────────────────────────────────────────────

-- Create a team and make the caller its admin.
create or replace function public.create_org(p_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_email text;
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  if length(trim(coalesce(p_name,''))) < 2 then raise exception 'name_too_short'; end if;
  select email into v_email from auth.users where id = auth.uid();
  insert into public.orgs(name, created_by) values (trim(p_name), auth.uid()) returning id into v_org;
  perform set_config('lumicamp.bypass_role_guard', '1', true); -- the creator becomes the first admin
  insert into public.org_members(org_id, email, user_id, status, role, joined_at)
    values (v_org, lower(v_email), auth.uid(), 'active', 'admin', now());
  return v_org;
end $$;

-- Teams the caller belongs to (any role).
create or replace function public.my_orgs()
returns table(org_id uuid, name text, role text, status text, policy_title text, policy_body text, seat_limit int)
language sql stable security definer set search_path = public as $$
  select o.id, o.name, m.role, m.status, o.policy_title, o.policy_body, o.seat_limit
  from public.org_members m join public.orgs o on o.id = m.org_id
  where m.user_id = auth.uid() and m.status = 'active'
  order by (m.role = 'admin') desc, o.created_at;
$$;

-- Shared invite link: reuse the org's live shared token or mint one (90 days).
create or replace function public.org_invite_link(p_org uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_token text; v_name text;
begin
  if not public.is_org_admin(p_org) then raise exception 'not_admin'; end if;
  select token into v_token from public.org_invites
    where org_id = p_org and shared = true and accepted_at is null and (expires_at is null or expires_at > now())
    order by created_at desc limit 1;
  if v_token is not null then return v_token; end if;
  select name into v_name from public.orgs where id = p_org;
  v_token := encode(gen_random_bytes(12), 'hex');
  insert into public.org_invites(org_id, org_name, token, shared, expires_at, created_by)
    values (p_org, v_name, v_token, true, now() + interval '90 days', auth.uid());
  return v_token;
end $$;

-- Admin pre-registers emails (they show as "invited" until the person joins).
create or replace function public.org_add_members(p_org uuid, p_emails text[])
returns int language plpgsql security definer set search_path = public as $$
declare v_added int := 0; v_e text; v_seats int; v_used int;
begin
  if not public.is_org_admin(p_org) then raise exception 'not_admin'; end if;
  select seat_limit into v_seats from public.orgs where id = p_org;
  foreach v_e in array p_emails loop
    v_e := lower(trim(v_e));
    if v_e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then continue; end if;
    select count(*) into v_used from public.org_members where org_id = p_org;
    if v_used >= v_seats then exit; end if;
    insert into public.org_members(org_id, email, status, role) values (p_org, v_e, 'invited', 'member')
      on conflict do nothing;
    if found then v_added := v_added + 1; end if;
  end loop;
  return v_added;
end $$;

-- Join via link. Validates token/expiry/seat cap, then creates or activates the membership.
create or replace function public.join_org_by_invite(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_inv public.org_invites%rowtype; v_org public.orgs%rowtype; v_email text; v_member public.org_members%rowtype; v_used int;
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  select * into v_inv from public.org_invites where token = p_token;
  if v_inv.id is null then raise exception 'invalid_invite'; end if;
  if v_inv.expires_at is not null and v_inv.expires_at < now() then raise exception 'expired_invite'; end if;
  if v_inv.shared = false and v_inv.accepted_at is not null then raise exception 'used_invite'; end if;
  select * into v_org from public.orgs where id = v_inv.org_id;
  select email into v_email from auth.users where id = auth.uid();
  if v_inv.email is not null and lower(v_inv.email) <> lower(v_email) then raise exception 'wrong_email'; end if;

  select * into v_member from public.org_members where org_id = v_inv.org_id and (user_id = auth.uid() or lower(email) = lower(v_email)) limit 1;
  if v_member.id is null then
    if v_org.id is not null and v_org.open_join = false then raise exception 'not_invited'; end if;
    select count(*) into v_used from public.org_members where org_id = v_inv.org_id and status = 'active';
    if v_org.id is not null and v_used >= v_org.seat_limit then raise exception 'seats_full'; end if;
    insert into public.org_members(org_id, email, user_id, status, role, joined_at)
      values (v_inv.org_id, lower(v_email), auth.uid(), 'active', 'member', now());
  else
    update public.org_members set user_id = auth.uid(), status = 'active', joined_at = coalesce(joined_at, now()) where id = v_member.id;
  end if;
  if v_inv.shared = false then update public.org_invites set accepted_at = now() where id = v_inv.id; end if;
  return jsonb_build_object('org_id', v_inv.org_id, 'org_name', coalesce(v_org.name, v_inv.org_name));
end $$;

-- Dashboard: one row per member with progress computed server-side.
-- p_path_sizes = {"basics":4,"writing":3,...} (lesson count per path, from the app).
create or replace function public.org_dashboard(p_org uuid, p_path_sizes jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_total int; v_paths int; v_org public.orgs%rowtype; v_rows jsonb;
begin
  if not public.is_org_admin(p_org) then raise exception 'not_admin'; end if;
  select * into v_org from public.orgs where id = p_org;
  select coalesce(sum((value)::int), 0), count(*) into v_total, v_paths from jsonb_each_text(coalesce(p_path_sizes, '{}'::jsonb));

  select coalesce(jsonb_agg(row_to_json(r) order by r.status, r.display_name), '[]'::jsonb) into v_rows from (
    select m.id as member_id, m.email, m.role, m.status, m.joined_at,
      coalesce(p.display_name, split_part(m.email, '@', 1)) as display_name,
      p.current_streak, p.longest_streak, p.last_active_date, p.language,
      coalesce(pr.lessons_done, 0) as lessons_done,
      pr.avg_score,
      coalesce(pr.paths_complete, 0) as paths_complete,
      coalesce(ch.challenges_done, 0) as challenges_done,
      c.verify_code as cert_code, c.issued_at as cert_issued_at
    from public.org_members m
    left join public.profiles p on p.id = m.user_id
    left join lateral (
      select count(*) filter (where up.status = 'completed') as lessons_done,
             round(avg(up.score)) as avg_score,
             (select count(*) from jsonb_each_text(coalesce(p_path_sizes,'{}'::jsonb)) ps
               where (select count(*) from public.user_progress u2
                       where u2.user_id = m.user_id and u2.path_id = ps.key and u2.status = 'completed') >= (ps.value)::int) as paths_complete
      from public.user_progress up where up.user_id = m.user_id
    ) pr on true
    left join lateral (select count(*) as challenges_done from public.challenge_log cl where cl.user_id = m.user_id) ch on true
    left join lateral (select verify_code, issued_at from public.cert_verification cv where cv.user_id = m.user_id order by issued_at desc limit 1) c on true
    where m.org_id = p_org
  ) r;

  return jsonb_build_object(
    'org', jsonb_build_object('id', v_org.id, 'name', v_org.name, 'seat_limit', v_org.seat_limit, 'open_join', v_org.open_join,
                              'policy_title', v_org.policy_title, 'policy_body', v_org.policy_body, 'policy_updated_at', v_org.policy_updated_at),
    'total_lessons', v_total, 'total_paths', v_paths,
    'members', v_rows
  );
end $$;

create or replace function public.org_remove_member(p_member uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_role text;
begin
  select org_id, role into v_org, v_role from public.org_members where id = p_member;
  if v_org is null then return; end if;
  if not public.is_org_admin(v_org) then raise exception 'not_admin'; end if;
  if v_role = 'admin' and (select count(*) from public.org_members where org_id = v_org and role = 'admin' and status = 'active') <= 1 then
    raise exception 'last_admin';
  end if;
  delete from public.org_members where id = p_member;
end $$;

-- Certificate: issued once the caller has completed every lesson in every path.
create or replace function public.issue_my_certificate(p_path_sizes jsonb, p_cert_type text default 'AI Literacy — Core')
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_code text; v_name text; v_org uuid; v_done int; v_needed int; v_avg int; v_existing public.cert_verification%rowtype;
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  select * into v_existing from public.cert_verification where user_id = auth.uid() order by issued_at desc limit 1;
  if v_existing.id is not null then
    return jsonb_build_object('verify_code', v_existing.verify_code, 'issued_at', v_existing.issued_at, 'display_name', v_existing.display_name, 'cert_type', v_existing.cert_type, 'existing', true);
  end if;
  select coalesce(sum((value)::int), 0) into v_needed from jsonb_each_text(coalesce(p_path_sizes, '{}'::jsonb));
  select count(*), round(avg(score)) into v_done, v_avg from public.user_progress where user_id = auth.uid() and status = 'completed';
  if v_needed = 0 or v_done < v_needed then raise exception 'not_complete'; end if;
  select coalesce(nullif(trim(display_name), ''), 'Learner') into v_name from public.profiles where id = auth.uid();
  select org_id into v_org from public.org_members where user_id = auth.uid() and status = 'active' limit 1;
  v_code := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 10));
  insert into public.cert_verification(verify_code, user_id, org_id, display_name, cert_type, lessons_completed, avg_score)
    values (v_code, auth.uid(), v_org, v_name, p_cert_type, v_done, v_avg);
  return jsonb_build_object('verify_code', v_code, 'issued_at', now(), 'display_name', v_name, 'cert_type', p_cert_type, 'existing', false);
end $$;

create or replace function public.my_certificate()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_build_object('verify_code', verify_code, 'issued_at', issued_at, 'display_name', display_name, 'cert_type', cert_type)
    from public.cert_verification where user_id = auth.uid() order by issued_at desc limit 1), 'null'::jsonb);
$$;

-- Landing-page pilot form (anon). Basic validation + soft rate limit per email.
create or replace function public.request_pilot(p_company text, p_name text, p_email text, p_size text, p_message text, p_source text default 'teams.html')
returns void language plpgsql security definer set search_path = public as $$
begin
  if length(trim(coalesce(p_company,''))) < 2 or lower(coalesce(p_email,'')) !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid'; end if;
  if (select count(*) from public.pilot_requests where lower(email) = lower(p_email) and created_at > now() - interval '1 day') >= 3 then raise exception 'rate_limited'; end if;
  insert into public.pilot_requests(company, contact_name, email, team_size, message, source)
    values (left(trim(p_company), 120), left(trim(coalesce(p_name,'')), 120), lower(trim(p_email)), left(coalesce(p_size,''), 40), left(coalesce(p_message,''), 2000), left(coalesce(p_source,''), 40));
end $$;

grant execute on function public.request_pilot(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.create_org(text), public.my_orgs(), public.org_invite_link(uuid), public.org_add_members(uuid, text[]),
  public.join_org_by_invite(text), public.org_dashboard(uuid, jsonb), public.org_remove_member(uuid),
  public.issue_my_certificate(jsonb, text), public.my_certificate(), public.is_org_admin(uuid), public.is_org_member(uuid) to authenticated;

-- Make sure delete_my_account (round 5) also removes team rows for the user.
-- (Run only if the function exists; harmless otherwise.)
do $$ begin
  if exists (select 1 from pg_proc where proname = 'delete_my_account') then
    -- nothing to alter here; org_members.user_id rows are cleaned by the trigger below
    null;
  end if;
end $$;

create or replace function public.cleanup_org_rows_on_user_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.org_members where user_id = old.id;
  update public.cert_verification set user_id = null where user_id = old.id;
  return old;
end $$;
drop trigger if exists trg_cleanup_org_rows on auth.users;
create trigger trg_cleanup_org_rows before delete on auth.users for each row execute function public.cleanup_org_rows_on_user_delete();
