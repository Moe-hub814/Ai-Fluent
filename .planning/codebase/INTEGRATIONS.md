# External Integrations

**Analysis Date:** 2026-04-16

## APIs & External Services

**Claude AI:**
- Anthropic Claude API - AI tutor, news fetching, news chat, practice challenges
  - SDK/Client: Direct REST calls via Supabase Edge Function
  - Models used:
    - `claude-sonnet-4-6` - For tutor, news_fetch, and news_chat features (4096 max tokens)
    - `claude-haiku-4-5-20251001` - For tool, practice, and challenge features (1024 max tokens)
  - Auth: `ANTHROPIC_API_KEY` environment variable (set in Supabase Edge Function environment)
  - Implementation: `supabase/functions/claude-proxy/index.ts` proxies all Claude requests
  - Web Search Tool: Enabled for news_fetch and optional via `use_search` parameter (max 3 uses per request)

## Data Storage

**Databases:**
- PostgreSQL (via Supabase)
  - Connection: Supabase URL `https://jedeqqkrmgsemnnmufjo.supabase.co`
  - Client: @supabase/supabase-js 2.100.0
  - Tables:
    - `profiles` - User profile data (accessed in `src/lib/supabase.js`)
    - `user_progress` - Lesson completion and progress tracking
  - Accessed through `db` object in `src/lib/supabase.js`

**File Storage:**
- Not detected in current implementation

**Caching:**
- Not detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in PostgreSQL auth)
  - Implementation: Email/password authentication
  - Methods in `src/lib/supabase.js`:
    - `db.signUp(email, password)` - Create new account
    - `db.signIn(email, password)` - Login with credentials
    - `db.signOut()` - Logout
    - `db.getSession()` - Retrieve current session
    - `db.onAuth(callback)` - Listen for auth state changes
  - Session persistence: Auto-refresh enabled, session stored in browser

## Monitoring & Observability

**Error Tracking:**
- Not detected - console logging only

**Logs:**
- Console logging in edge function (`supabase/functions/claude-proxy/index.ts`)
- Error handling with descriptive messages returned to client

## CI/CD & Deployment

**Hosting:**
- Supabase - Backend and edge functions
- Web deployment target: Static hosting from `dist/` directory
- Android deployment: Built APK/AAB from `android/` Capacitor project

**CI Pipeline:**
- Not detected

## Environment Configuration

**Required env vars:**
- `ANTHROPIC_API_KEY` - Claude API key (required by edge function)
- `SUPABASE_ANON_KEY` - Publishable key for edge function validation (optional, used for key validation)

**Secrets location:**
- Edge function environment: Supabase project settings
- Browser-exposed keys: Publishable key in `src/lib/supabase.js` (safe for browser; Supabase URL and anon key are meant to be public)

## Rate Limiting & Security

**Edge Function Protection:**
- IP-based rate limiting: 30 requests per minute per IP
- API key validation: All requests must include valid Supabase publishable key
- Request validation: Only allowed feature types accepted (tutor, news_fetch, news_chat, tool, practice, challenge)
- Token limits enforced:
  - news_fetch: max 2048 tokens
  - tutor: max 4096 tokens
  - tool/practice/challenge: max 1024 tokens
- System prompt length capped at 2000 characters
- Message context limited to last 10 messages max
- Message content capped at 3000-8000 characters depending on feature

## Webhooks & Callbacks

**Incoming:**
- Not detected

**Outgoing:**
- Supabase RPC call: `record_activity` function in database
  - Called after lesson completion in `src/lib/supabase.js`
  - Logs activity with `p_user_id` and `p_type: "lesson"`

---

*Integration audit: 2026-04-16*
