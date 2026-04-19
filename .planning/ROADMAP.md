# Roadmap: AI Fluent — Google Play Launch

## Overview

The app is fully built. This milestone ships it to Google Play. Four phases cover the work in dependency order: fix the Android layout bugs that would appear in screenshots, produce a signed release build, create the Play Store visual assets, and complete the store listing and submit for review.

## Phases

- [x] **Phase 1: Android Layout Fixes** - Fix layout bugs before screenshots are taken
- [ ] **Phase 2: Android Release Build** - Produce and verify a signed release AAB
- [ ] **Phase 3: Play Store Assets** - Capture screenshots and create all required graphics
- [ ] **Phase 4: Play Store Listing & Submission** - Complete the Play Console listing and submit

## Phase Details

### Phase 1: Android Layout Fixes
**Goal**: The Android app renders correctly — no UI elements overlapping navigation nodes, greeting shows the real user name, and the screen opens without a white flash
**Depends on**: Nothing (first phase)
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04
**Success Criteria** (what must be TRUE):
  1. The Summit node on the World Map is fully visible and not obscured by the top header bar on Android
  2. The Base Camp node on the World Map is fully visible and not obscured by the bottom navigation bar on Android
  3. The greeting displays the user's actual display name (e.g., "Good afternoon, Moe"), never the string "AI"
  4. The app opens directly to the dark background with no white flash on Android startup
**Plans**: 3 plans
Plans:
- [x] 01-01-PLAN.md — Add TOP_SAFE constant and apply to all top headers (WorldMap, LocView tutor, NewsView chat) — LAYOUT-01, LAYOUT-02
- [x] 01-02-PLAN.md — Thread `user` prop and replace display_name fallback with 3-step chain — LAYOUT-03
- [x] 01-03-PLAN.md — Add android.backgroundColor to capacitor.config.json + device verification checkpoint — LAYOUT-04, LAYOUT-02
**UI hint**: yes

### Phase 2: Android Release Build
**Goal**: A signed release AAB exists, is verified correct, and can be installed via the Play Console Internal Testing track
**Depends on**: Phase 1
**Requirements**: BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05
**Success Criteria** (what must be TRUE):
  1. The keystore file and `keystore.properties` are excluded from git and backed up to a secure offline location
  2. Running `./gradlew bundleRelease` produces `app-release.aab` and `jarsigner -verify` confirms it is signed with the release keystore
  3. The AAB installs and runs correctly on a physical Android device via the Internal Testing track in Play Console
**Plans**: 3 plans
Plans:
- [x] 02-01-PLAN.md — Keystore backup checkpoint + exclude keystore/credentials from git tracking — BUILD-01, BUILD-02
- [x] 02-02-PLAN.md — Build signed release AAB and verify signature with jarsigner — BUILD-03, BUILD-04
- [ ] 02-03-PLAN.md — Upload AAB to Play Console Internal Testing + device smoke test — BUILD-05

### Phase 3: Play Store Assets
**Goal**: All required Play Store graphics exist — screenshots with caption overlays, feature graphic, app icon, and a published privacy policy
**Depends on**: Phase 2
**Requirements**: ASSETS-01, ASSETS-02, ASSETS-03, ASSETS-04, ASSETS-05
**Success Criteria** (what must be TRUE):
  1. At least 5 phone screenshots (1080×1920px, RGB PNG) are captured showing World Map, Lesson, AI News, AI Tools, and Lumi/achievements — all in dark theme with Lumi visible
  2. All screenshots have Canva caption overlays with the app name and feature callouts
  3. A 1024×500px feature graphic and a 512×512px app icon PNG exist and meet Play Store dimension/format requirements
  4. A privacy policy is live at a stable public URL disclosing email collection, Supabase storage, and Anthropic API processing
**Plans**: TBD
**UI hint**: yes

### Phase 4: Play Store Listing & Submission
**Goal**: The Play Console listing is complete and the app is submitted to production review
**Depends on**: Phase 3
**Requirements**: STORE-01, STORE-02, STORE-03, STORE-04, STORE-05, STORE-06, STORE-07, STORE-08, STORE-09, STORE-10, STORE-11, STORE-12
**Success Criteria** (what must be TRUE):
  1. The Play Console listing for `com.aifluent.app` shows the correct title, short description, long description, category, and contact email
  2. The Data Safety section declares that user-generated content (AI tool prompts) is shared with Anthropic as a third party
  3. All screenshots, feature graphic, and AAB are uploaded with no policy warnings shown in Play Console
  4. The app is submitted to the production review track and Play Console shows "In review" status
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Android Layout Fixes | 3/3 | Complete | 2026-04-17 |
| 2. Android Release Build | 0/3 | Active | - |
| 3. Play Store Assets | 0/? | Not started | - |
| 4. Play Store Listing & Submission | 0/? | Not started | - |
