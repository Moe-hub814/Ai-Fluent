# Lumicamp — Sub-processor list (draft)

_Version 0.1 · September 2026. Customers are notified of changes to this list at least 14 days before a new sub-processor handles their data._

| Sub-processor | Purpose | Data | Location |
|---|---|---|---|
| Supabase, Inc. | Database, authentication, edge functions (AI proxy) | Account, progress, team data, pilot requests | **[fill in project region]** |
| Vercel, Inc. | Hosting of the web app and marketing pages | Request logs (IP, user agent) | Global edge network (US-based company) |
| Anthropic, PBC | Large-language-model API for the tutor, tools, translations and generated challenges | Prompt text sent by the learner (no account identifiers are included) | United States |
| Google LLC (Fonts) | Web fonts on the marketing pages (`/` and `/teams`) only, not inside the app | IP address on font request | Global |
| Google LLC (Play) | Android app distribution | Play account data (handled by Google) | Global |

Email delivery for one-time sign-in codes: **[fill in once custom SMTP is configured — e.g., Resend / Postmark]**.
