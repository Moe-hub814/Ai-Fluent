# Lumicamp — Security & Privacy Overview (customer-facing draft)

_Version 0.1 · September 2026 · Draft for counsel and customer review. Statements marked **[verify]** must be confirmed against the live configuration before this is sent to a customer._

## What Lumicamp is
Lumicamp is a web and mobile learning app that teaches non-technical people to use AI safely and well. Lumicamp for Teams adds a company workspace: an admin invites employees, sees completion and scores, publishes the company's AI-use policy inside the app, and employees earn a verifiable certificate.

## Architecture in one paragraph
The app is a static React bundle served by Vercel. Authentication, database and the AI proxy run on Supabase (Postgres, GoTrue auth, Edge Functions). AI features call Anthropic's Claude API **only** through a Supabase Edge Function (`claude-proxy`); the browser never holds an AI API key. Lesson content ships with the app and can be corrected remotely through a small overrides table.

## Data we hold
| Category | Examples | Where | Retention |
|---|---|---|---|
| Account | email, display name, language, theme | Supabase `auth.users`, `profiles` | Until the user deletes the account |
| Learning progress | lesson completions, scores, streaks, daily-challenge log | `user_progress`, `challenge_log`, `profiles` | Until reset or deletion by the user |
| Team data | org name, member emails, roles, status, company AI policy, certificates | `orgs`, `org_members`, `org_invites`, `cert_verification` | Until removed by the admin / account deletion |
| AI interactions | prompts and responses to the tutor and tools | Not stored server-side except short-lived shared caches of non-personal content (translations, news, generated daily challenges) **[verify TTL]** | Tool results are saved only on the learner's device (last 30) |
| Pilot requests | company, contact name, work email, message | `pilot_requests` | Until the request is closed |

We do not collect payment data in the app (billing is invoiced separately) and we do not use advertising SDKs or trackers.

## Access control
- **Row-level security (RLS)** is enabled on every application table. A learner can read and write only rows where `user_id = auth.uid()`; client-side deletes of progress are blocked.
- **Team admins** see only members of their own organisation, through `SECURITY DEFINER` functions that check `is_org_admin(org_id)` on every call. Admins never see a learner's AI conversations.
- **Certificates** are verifiable by code at `lumicamp.app/verify/<code>`; the public record contains only display name, certificate type and issue date.
- **Staff access**: the founder is the only person with Supabase dashboard access **[verify]**; MFA is enabled on the Supabase and Vercel accounts **[verify]**.

## AI proxy controls
- The Edge Function verifies the caller's Supabase JWT against GoTrue before any AI call (5-minute token cache).
- Per-user daily caps (default 150 calls) and a small per-IP trial cap for signed-out visitors (default 6) limit abuse and cost.
- Request bodies are capped at 64 KB; system prompts avoid persona injection patterns.
- Anthropic's API does not train on API inputs and outputs by default **[verify current Anthropic terms]**.

## Data subject rights (GDPR / CCPA)
Inside the app, under Profile → Data & account, every learner can **export** their data (JSON), **reset** their progress, or **delete** their account. Deletion removes progress, challenge log, profile, team membership and the auth user; certificates are anonymised (user link removed). This satisfies Google Play's account-deletion requirement.

## Encryption and hosting
TLS 1.2+ in transit for all endpoints (Vercel, Supabase). Supabase encrypts data at rest (AES-256) **[verify plan/region]**. Project region: **[fill in — e.g., us-east-1]**. Backups: Supabase daily backups **[verify plan]**.

## Sub-processors
See `docs/subprocessors.md` (Supabase, Vercel, Anthropic, Google Fonts on the marketing page only).

## Incident response
Security issues: **security@lumicamp.app [set up]**. Customers are notified of a confirmed personal-data breach affecting their users without undue delay and within 72 hours of confirmation.

## Roadmap items customers ask about
SSO (SAML/OIDC) and SCIM — built to order for Enterprise. LMS export (SCORM/xAPI) — planned. SOC 2 — not yet; controls are documented against NIST CSF **[optional claim — only if you actually map them]**.
