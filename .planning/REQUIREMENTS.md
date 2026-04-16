# Requirements: AI Fluent — Google Play Launch

**Defined:** 2026-04-16
**Core Value:** Users can install AI Fluent from Google Play and learn AI through daily lessons, news, and guided tools on their Android device.

---

## v1 Requirements

### Layout Fixes

- [x] **LAYOUT-01**: Android app header does not overlap Summit node (add `TOP_SAFE = _isNative ? 28 : 0` constant applied to WorldMap top bar `paddingTop`)
- [x] **LAYOUT-02**: Android app bottom navigation bar does not overlap Base Camp node (`BOTTOM_SAFE = 48` verified on physical device; adjust if needed)
- [ ] **LAYOUT-03**: Greeting shows user's real display name, not "AI" (fix `display_name` fallback in profile fetch — Supabase `profiles.display_name` is stored but wrong fallback used)
- [ ] **LAYOUT-04**: App startup does not show white flash on Android (add `android.backgroundColor: "#060D1A"` to `capacitor.config.json`)

### Android Build

- [ ] **BUILD-01**: `android/keystore.properties` is excluded from git (`android/.gitignore` updated to exclude `*.keystore`, `*.jks`, and `keystore.properties`)
- [ ] **BUILD-02**: Keystore file and credentials are backed up to secure offline location (password manager) before any git operations
- [ ] **BUILD-03**: Signed release AAB produced at `android/app/build/outputs/bundle/release/app-release.aab` via `npm run build → npx cap sync android → ./gradlew bundleRelease`
- [ ] **BUILD-04**: AAB is signed with the correct release keystore (verified via `jarsigner -verify`)
- [ ] **BUILD-05**: Release build uploaded to Play Console Internal Testing track and confirmed installable on physical device

### Play Store Assets

- [ ] **ASSETS-01**: Minimum 5 phone screenshots captured at 1080×1920px showing: World Map, Lesson screen, AI News, AI Tools, Lumi/achievements (dark theme, RGB PNG — no alpha channel)
- [ ] **ASSETS-02**: Canva caption overlays applied to all screenshots (app name, feature callouts visible)
- [ ] **ASSETS-03**: Feature graphic created at exactly 1024×500px (landscape, PNG or JPEG, ≤1 MB)
- [ ] **ASSETS-04**: App icon exported at 512×512px PNG with transparent background for Play Console upload
- [ ] **ASSETS-05**: Privacy policy written and published at a stable public URL (must disclose: email collection, Supabase storage, Anthropic API processing of user text)

### Play Store Listing

- [ ] **STORE-01**: App listing created in Google Play Console with package name `com.aifluent.app`
- [ ] **STORE-02**: Play Console account verification status confirmed — no pending identity verification or waiting period
- [ ] **STORE-03**: App title set: "AI Fluent" (within 30-char limit)
- [ ] **STORE-04**: Short description set: "Master AI with guided lessons, daily news & hands-on tools. Meet Lumi." (71 chars, within 80-char limit)
- [ ] **STORE-05**: Long description written and published (up to 4,000 chars, keyword-aware, accurate feature claims only)
- [ ] **STORE-06**: Category set to "Education"
- [ ] **STORE-07**: Developer contact email added to listing
- [ ] **STORE-08**: Privacy policy URL entered in Play Console "App content" section
- [ ] **STORE-09**: Data Safety section completed — declares: email, account info, app activity collected; user-generated content (AI tool prompts) shared with Anthropic (third party)
- [ ] **STORE-10**: IARC content rating questionnaire completed — expected "Everyone" / "3+" rating
- [ ] **STORE-11**: All screenshots and feature graphic uploaded to listing
- [ ] **STORE-12**: App submitted to production review track

---

## v2 Requirements

### Post-Launch

- **POST-01**: Localized Play Store listing in Arabic and French (app already supports these languages)
- **POST-02**: Tablet screenshots (1200×1920px) for better Play Store presentation on large screens
- **POST-03**: Promo video (YouTube link) for Play Store listing
- **POST-04**: iOS / App Store submission
- **POST-05**: Push notification support
- **POST-06**: Social sharing features

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| iOS / App Store | Android-first launch; iOS is a separate milestone |
| New feature development | App is feature-complete for v1; no new features before launch |
| Edge-to-edge layout (Pattern B) | Adds risk before launch; Pattern A (pixel constants) is sufficient |
| Capacitor safe-area plugin | Adds async complexity to a monolith; constants approach is established and works |
| ProGuard/R8 minification | `minifyEnabled false` is correct for Capacitor; do not enable |
| CI/CD pipeline | Manual release build is fine for v1 |
| Crash analytics SDK | Out of scope for launch |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYOUT-01 | Phase 1 | Complete |
| LAYOUT-02 | Phase 1 | Complete |
| LAYOUT-03 | Phase 1 | Pending |
| LAYOUT-04 | Phase 1 | Pending |
| BUILD-01 | Phase 2 | Pending |
| BUILD-02 | Phase 2 | Pending |
| BUILD-03 | Phase 2 | Pending |
| BUILD-04 | Phase 2 | Pending |
| BUILD-05 | Phase 2 | Pending |
| ASSETS-01 | Phase 3 | Pending |
| ASSETS-02 | Phase 3 | Pending |
| ASSETS-03 | Phase 3 | Pending |
| ASSETS-04 | Phase 3 | Pending |
| ASSETS-05 | Phase 3 | Pending |
| STORE-01 | Phase 4 | Pending |
| STORE-02 | Phase 4 | Pending |
| STORE-03 | Phase 4 | Pending |
| STORE-04 | Phase 4 | Pending |
| STORE-05 | Phase 4 | Pending |
| STORE-06 | Phase 4 | Pending |
| STORE-07 | Phase 4 | Pending |
| STORE-08 | Phase 4 | Pending |
| STORE-09 | Phase 4 | Pending |
| STORE-10 | Phase 4 | Pending |
| STORE-11 | Phase 4 | Pending |
| STORE-12 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-16 after initial definition*
