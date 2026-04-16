# Technology Stack

**Analysis Date:** 2026-04-16

## Languages

**Primary:**
- JavaScript (ES2020+) - Application code in `src/`
- JSX - React components in `src/App.jsx`

**Secondary:**
- TypeScript - Edge functions in `supabase/functions/claude-proxy/index.ts`

## Runtime

**Environment:**
- Node.js - Local development and build
- Deno - Supabase Edge Functions runtime for `claude-proxy` function

**Package Manager:**
- npm (7.x or later)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.0 - UI framework in `src/App.jsx`
- Vite 7.3.1 - Build tool and dev server, configured in `vite.config.js`

**Mobile/Native:**
- Capacitor 8.3.0 - Cross-platform app framework with Android support
  - `@capacitor/core` 8.3.0 - Core Capacitor runtime
  - `@capacitor/cli` 8.3.0 - CLI for builds and deployments
  - `@capacitor/android` 8.3.0 - Android native integration
  - Configuration in `capacitor.config.json`

**Testing:**
- Not detected in current configuration

**Build/Dev:**
- @vitejs/plugin-react 5.1.1 - Fast Refresh support for React in Vite
- ESLint 9.39.1 - Code linting configured in `eslint.config.js`

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.100.0 - Supabase client SDK for authentication and database operations
  - Used in `src/lib/supabase.js` for auth, profiles, progress tracking, and edge function calls
  - Provides PostgreSQL database access, authentication, and real-time capabilities

**Infrastructure:**
- React 19.2.0 - User interface rendering
- React DOM 19.2.0 - DOM rendering for React components

## Configuration

**Environment:**
- Supabase credentials embedded in `src/lib/supabase.js` (publishable key, not secret)
  - `SUPABASE_URL`: `https://jedeqqkrmgsemnnmufjo.supabase.co`
  - `SUPABASE_KEY`: Publishable/anon key for browser access
- Edge function environment variables:
  - `ANTHROPIC_API_KEY` - Claude API access in `supabase/functions/claude-proxy/index.ts`
  - `SUPABASE_ANON_KEY` - Anon key for edge function validation

**Build:**
- `vite.config.js` - Vite build configuration with React plugin
- `eslint.config.js` - ESLint configuration with recommended rules, React hooks plugin, and React Refresh plugin
- `capacitor.config.json` - Capacitor app metadata:
  - App ID: `com.aifluent.app`
  - App Name: `AI Fluent`
  - Web directory: `dist` (Vite build output)

## Platform Requirements

**Development:**
- Node.js (latest LTS or matching `.npmrc`)
- npm or compatible package manager
- ESLint compatible IDE/editor

**Production:**
- Web: Deployed to Supabase (static hosting from `dist/`)
- Mobile: Android app built with Capacitor from `android/` directory
- Edge Functions: Supabase Edge Functions runtime (Deno-based) for `claude-proxy`

---

*Stack analysis: 2026-04-16*
