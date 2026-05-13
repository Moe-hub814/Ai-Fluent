# AI Fluent — Google Play Launch

## What This Is

AI Fluent is a mobile AI literacy learning app — "Duolingo for AI." Users climb a mountain-themed progression system with 7 location nodes, guided by a companion character named Lumi. The app is fully built and functional, with daily challenges, live AI news via Claude web search, 6 guided AI tools, practice mode with altitude ratings, streak tracking, and full i18n (English/Arabic/French). This project covers shipping the existing app to Google Play.

## Core Value

Users can learn AI concepts through daily structured lessons, practice on real AI tools, and track their progress — all on mobile, in their language.

## Requirements

### Validated

- ✓ Mountain progression system with 7 location nodes (Base Camp → Summit) — existing
- ✓ Companion character Lumi integrated throughout — existing
- ✓ Daily challenges with streak tracking — existing
- ✓ Live AI news powered by Claude web search — existing
- ✓ 6 guided AI tools (Email Writer, Prompt Builder, Social Post Writer, etc.) — existing
- ✓ Practice mode with altitude ratings (Summit/Ridge/Treeline/Base Camp) — existing
- ✓ Full i18n: English, Arabic (RTL), French — existing
- ✓ Auth (email/password, Supabase session) — existing
- ✓ User profiles, progress persistence (Supabase) — existing
- ✓ World map navigation with progress bars — existing
- ✓ Achievement system — existing
- ✓ Web build on Vercel — existing

### Active

- [ ] Fix bottom navigation bar overlapping Base Camp node on Android (pixel-based safe area constant, not CSS env())
- [ ] Fix top header bar overlapping Summit node on Android
- [ ] Fix display name fallback — shows "Good afternoon, AI" instead of user's real name (wrong fallback on display_name in Supabase profile)
- ✓ Generate Android signing keystore (android/app/, alias: aifluent, JDK 21) — Validated in Phase 1
- ✓ Build signed release AAB for Google Play — Validated in Phase 2
- ✓ Keystore backed up and excluded from git tracking — Validated in Phase 2
- ✓ AAB uploaded to Internal Testing and verified on device — Validated in Phase 2
- [ ] Capture app screenshots (dark theme, Lumi visible)
- [ ] Create Play Store screenshot graphics with Canva caption overlays
- [ ] Create app listing in Google Play Console
- [ ] Complete Play Store metadata (descriptions, category, content rating, contact info)
- [ ] Upload screenshots, AAB, and submit for review

### Out of Scope

- iOS / App Store submission — Android-first for launch
- New feature development — app is feature-complete for v1
- Push notifications — deferred post-launch
- Supabase edge function changes — claude-proxy v8 is working
- Social/multiplayer features — deferred

## Context

- **Single-file frontend**: All app logic in `src/App.jsx` (~1565 lines). Inline CSS-in-JS throughout.
- **Capacitor 8.3.0**: Android wrapper in `android/` directory. App ID: `com.aifluent.app`.
- **Android safe area issue**: `env(safe-area-inset-bottom)` does not reliably work in Android WebView — requires a hardcoded pixel constant (`BOTTOM_SAFE`) passed to layout components.
- **Name bug cause**: The greeting falls back to something that resolves to the string "AI" — likely `user.email.split('@')[0]` returning "AI" for an email like `ai@...`, or a missing `display_name` check. `display_name` is stored in Supabase profiles but not correctly read.
- **Google Play Developer account**: Account exists, app listing not yet created.
- **Keystore generated**: Release keystore at `android/ai-fluent-release.keystore` (alias: aifluent), backed up to password manager. Excluded from git tracking.
- **Play Store short description (final)**: "Master AI with guided lessons, daily news & hands-on tools. Meet Lumi."
- **Screenshots**: None yet — need to capture from device/emulator, then create Canva overlays with captions (dark theme, Lumi visible).

## Constraints

- **Tech stack**: React + Vite + Capacitor — no framework changes
- **JDK**: Must use JDK 21 for Gradle compatibility in Android release build
- **Android only**: Google Play target, no iOS work this milestone
- **Single-file constraint**: App.jsx is ~1565 lines monolith — layout fixes must be surgical, not refactors
- **Keystore security**: Generated keystore must be backed up safely — losing it means losing ability to update the app forever

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pixel-based BOTTOM_SAFE constant instead of CSS env() | Android WebView doesn't honor safe-area-inset-bottom reliably | — Pending |
| AAB format (not APK) | Google Play requires AAB for new app submissions | ✓ Phase 2 |
| JDK 21 for build | Gradle compatibility requirement | ✓ Phase 2 |
| Dark theme screenshots with Lumi | Brand identity and visual appeal for Play Store | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-13 after Phase 2 completion*
