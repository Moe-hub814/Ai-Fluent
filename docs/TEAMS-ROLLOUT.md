# Lumicamp for Teams — rollout steps (2026-09-08)

Everything below is already on this Mac, build-verified in the cloud with the real lockfile, and the SQL was executed twice (idempotency) plus a three-user RLS/RPC scenario on a scratch Postgres. **Nothing is committed or deployed yet.**

## What changed
- `src/App.jsx` — `TeamView` (create team / admin dashboard / member view), `CertButton` (Summit + Team), Profile → Team card, `/teams` → `/teams.html` redirect, `JoinOrgView` now uses the `join_org_by_invite` RPC (legacy flow kept as fallback). EN/AR/FR strings for member-facing text; admin dashboard is English-only for now.
- `src/lib/supabase.js` — `createOrg, myOrgs, orgDashboard, orgInviteLink, orgAddMembers, orgRemoveMember, updateOrg, joinOrg, issueMyCertificate, myCertificate`.
- `supabase/migrations/20260908_teams_dashboard.sql` — `orgs`, `pilot_requests`; columns on `org_members` (role), `org_invites` (shared/email), `cert_verification` (user_id, org_id…); RLS; RPCs; role-guard trigger; cleanup trigger on `auth.users` delete.
- `public/teams.html` — B2B landing page + pilot form (posts to `request_pilot` RPC). `public/privacy-policy.html` copied from `docs/` so the footer link resolves.
- `docs/security-overview.md`, `docs/subprocessors.md`, `docs/dpa-draft.md` — drafts with **[verify]** markers for counsel.
- `.gitignore` — `supabase/.temp/` (CLI state + the two patch scripts used today; safe to delete).

## Do these in order
1. **Mac terminal**
   ```bash
   cd ~/Desktop/Ai-Fluent && rm -f .git/index.lock && npm run build && \
   git add -A && git commit -m "feat(teams): admin dashboard, invite links, certificates, CSV export, policy module, /teams landing + pilot form, security/DPA drafts" && git push
   ```
   (Vercel deploys. The index.lock can't be removed through the Cowork bridge.)
2. **Supabase → SQL editor**: paste the *contents* of `supabase/migrations/20260908_teams_dashboard.sql`, run once. Re-running is safe.
3. **Smoke test on lumicamp.app** (signed in): Profile → Team → Create team → Get invite link → open the link in a private window with a second email → that user should appear as *active* in the dashboard. Complete-all-lessons account → Summit → *Get my certificate* → open the `/verify/CODE` link signed out.
4. **Landing**: open `lumicamp.app/teams`, submit the pilot form with your own email, then check Table editor → `pilot_requests`. Replace `hello@lumicamp.app` in `public/teams.html` if that inbox doesn't exist.
5. **Custom SMTP** (Auth → SMTP) is still the blocker before inviting a real pilot team — Supabase's default sender is rate-limited to a handful of emails per hour.
6. `npx cap sync android` before the next Android build (Team screen and back-button paths are in the bundle).

## What was verified
- Cloud `vite build` OK (3 chunks). ESLint: 55 problems, identical to the pre-change baseline (all pre-existing).
- Browser at 390×844 with a mocked `db`: admin dashboard, member view, signed-out view, certificate issued/not-issued, Profile card — no console errors.
- Scratch Postgres: migration runs twice cleanly; outsider cannot read another org's rows or call `org_dashboard`; open invite link joins; pre-registered email activates; a member **cannot** promote themselves to admin (this was possible in the first draft and is now blocked by policy + trigger); last admin cannot be removed; certificate refused until every lesson is complete, issued once, returned on repeat; anon can verify a certificate and submit a pilot request but cannot read `pilot_requests` or `org_members`; deleting an `auth.users` row cleans team rows.

## Known limits / honest notes
- Seat limit defaults to 50 per org; change `orgs.seat_limit` in the dashboard for a paying customer.
- Dashboard counts a path complete when `completed` rows ≥ lessons in that path (same rule as the map).
- No email is sent when an admin pre-registers someone — they still need the link. Sending invite emails needs SMTP first.
- Admin UI strings are English-only; member-facing strings are translated.
- The two tables were created from the dashboard originally; if a column name there differs from what the app assumes (`org_invites.token`, `org_members.status`), the migration's `add column if not exists` will add a second column rather than fail — check the Table editor once after running.
