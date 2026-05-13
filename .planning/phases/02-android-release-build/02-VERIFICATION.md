---
phase: 02-android-release-build
verified: 2026-04-17T00:00:00Z
status: human_needed
score: 6/7
overrides_applied: 0
human_verification:
  - test: "Confirm the AAB uploaded to Play Console Internal Testing is live and not rolled back"
    expected: "Play Console shows the Internal Testing release with status 'Available' or 'Rolling out' for version 1.0 (versionCode 1)"
    why_human: "Cannot programmatically query Play Console upload status — plan relied on user confirmation recorded in SUMMARY"
  - test: "Confirm the app installed from the Internal Testing track on a physical device (5-point smoke test)"
    expected: "App launches without white flash, authentication works, World Map shows all 7 nodes, greeting shows real name, basic navigation works"
    why_human: "Physical device install from Play Store cannot be verified programmatically — plan relied on user confirmation 'verified' recorded in SUMMARY"
---

# Phase 2: Android Release Build — Verification Report

**Phase Goal:** A signed release AAB exists, is verified correct, and can be installed via the Play Console Internal Testing track
**Verified:** 2026-04-17T00:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | keystore.properties is excluded from git tracking | VERIFIED | `android/.gitignore` line 59: `keystore.properties` (uncommented); `git ls-files \| grep keystore` returns 0 matches |
| 2 | *.keystore and *.jks files are excluded from git tracking | VERIFIED | `android/.gitignore` lines 57-58: `*.jks` and `*.keystore` (uncommented); `git ls-files \| grep -E "keystore\|\.jks"` returns 0 matches |
| 3 | Keystore file and credentials are backed up in a password manager before git operations | VERIFIED (human-confirmed) | SUMMARY 02-01 records user confirmed "backed up" — this is a blocking human-action gate; executor recorded completion |
| 4 | Local keystore files still exist on disk after git rm --cached | VERIFIED | `android/ai-fluent-release.keystore` exists (2764 bytes); `android/keystore.properties` exists; `android/app/ai-fluent-release.keystore` correctly removed as duplicate |
| 5 | A signed release AAB file exists at android/app/build/outputs/bundle/release/app-release.aab | VERIFIED | File exists, size 3,183,989 bytes (~3 MB), last modified 2026-04-21 |
| 6 | jarsigner -verify confirms the AAB is correctly signed | VERIFIED | `jarsigner -verify` output: `jar verified.` (exit code 0); warnings about self-signed cert are expected and do not indicate failure |
| 7 | The AAB installs and runs correctly on a physical Android device via Internal Testing | NEEDS HUMAN | SUMMARY 02-03 records user confirmed "verified" with all 5 smoke test checks passed — cannot be independently verified programmatically |

**Score:** 6/7 truths verified (1 requires human confirmation)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `android/.gitignore` | Keystore and credentials exclusion rules | VERIFIED | Lines 57-59 contain `*.jks`, `*.keystore`, `keystore.properties` — all uncommented, all active |
| `android/ai-fluent-release.keystore` | Keystore on disk (not tracked by git) | VERIFIED | File exists on disk, not in `git ls-files`, gitignored via `*.keystore` glob |
| `android/keystore.properties` | Signing credentials on disk (not tracked by git) | VERIFIED | File exists on disk with `storeFile=../ai-fluent-release.keystore`, `keyAlias=aifluent` — not in `git ls-files`, gitignored |
| `android/app/build/outputs/bundle/release/app-release.aab` | Signed release Android App Bundle | VERIFIED | File exists, 3.18 MB, `jarsigner -verify` confirms `jar verified.` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `android/.gitignore` | `android/ai-fluent-release.keystore` | `*.keystore` glob pattern | WIRED | Line 58: `*.keystore` (uncommented) — matches file extension |
| `android/.gitignore` | `android/keystore.properties` | exact filename match | WIRED | Line 59: `keystore.properties` — exact match confirmed |
| `android/app/build.gradle` | `android/keystore.properties` | `signingConfigs.release` reads storeFile, storePassword, keyAlias, keyPassword | WIRED | Lines 19-29: `keystoreProperties['storeFile']` pattern confirmed; release buildType wired to `signingConfig signingConfigs.release` |
| `npm run build` | `dist/` | Vite production build | WIRED | `package.json` `"build": "vite build"`; `dist/` directory exists with `index.html` and `assets/` |
| `npx cap sync android` | `android/app/src/main/assets/public` | Capacitor sync copies web assets | WIRED | `android/app/src/main/assets/public/` exists with `index.html`, `cordova.js`, `assets/` |
| `app-release.aab` | Play Console Internal Testing | Manual upload via web interface | NEEDS HUMAN | SUMMARY 02-03 records user confirmed upload — not verifiable programmatically |

### Data-Flow Trace (Level 4)

Not applicable — this phase produces a binary build artifact (AAB), not a component that renders dynamic data. No Level 4 trace needed.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| No keystore files in git tracking | `git ls-files \| grep -E "keystore\|\.jks" \| wc -l` | `0` | PASS |
| AAB file exists and is non-empty | `wc -c < android/app/build/outputs/bundle/release/app-release.aab` | `3183989` | PASS |
| AAB is correctly signed | `jarsigner -verify android/app/build/outputs/bundle/release/app-release.aab 2>&1 \| grep "jar verified"` | `jar verified.` | PASS |
| Build pipeline produces AAB | `test -f android/app/build/outputs/bundle/release/app-release.aab` | exists | PASS |
| Play Console Internal Testing upload | Manual verification required | User confirmed in SUMMARY | SKIP (human) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| BUILD-01 | 02-01-PLAN.md | `android/keystore.properties` excluded from git; `.gitignore` updated | SATISFIED | `android/.gitignore` has `*.keystore`, `*.jks`, `keystore.properties` — `git ls-files` returns 0 keystore matches; commit `1f8ff7d` |
| BUILD-02 | 02-01-PLAN.md | Keystore and credentials backed up to secure offline location | SATISFIED | SUMMARY 02-01 records user confirmed backup before git operations (blocking human-action checkpoint) |
| BUILD-03 | 02-02-PLAN.md | Signed release AAB at expected path via pipeline | SATISFIED | `app-release.aab` exists at `android/app/build/outputs/bundle/release/` (3.18 MB); build pipeline `npm run build → npx cap sync android → ./gradlew bundleRelease` confirmed via SUMMARY |
| BUILD-04 | 02-02-PLAN.md | AAB signed with correct keystore; `jarsigner -verify` confirms | SATISFIED | `jarsigner -verify` returns `jar verified.` with self-signed cert warnings (expected); cert valid until 2053-08-23 with `aifluent` alias |
| BUILD-05 | 02-03-PLAN.md | Upload to Play Console Internal Testing; confirmed installable on physical device | NEEDS HUMAN | SUMMARY 02-03 records both Task 1 (upload) and Task 2 (5-point smoke test) confirmed by user — cannot be independently verified |

**Orphaned requirements check:** REQUIREMENTS.md maps BUILD-01 through BUILD-05 to Phase 2 — all five are claimed by plans 02-01, 02-02, and 02-03. No orphaned requirements.

**Note:** REQUIREMENTS.md checkboxes for BUILD-01 through BUILD-05 remain `[ ]` (unchecked) in the committed version. The file has an uncommitted working-tree change only for LAYOUT-04. The BUILD requirements traceability table still shows "Pending" for all five. This is a documentation discrepancy — the work is done but the requirements doc was not updated to reflect completion.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `android/app/build.gradle` | 9-10 | `versionCode 2` / `versionName "2.0"` — uncommitted working-tree change, not committed | Warning | The plan (D-08) required keeping versionCode 1 / versionName "1.0". The AAB was built when versionCode was 1 (confirmed by git log — versionCode 1 was committed April 8; AAB built April 21; working-tree bump to 2 is post-build). The built AAB is correct, but this uncommitted change will affect the next build if not intentional. |
| `.planning/REQUIREMENTS.md` | 19-24 | BUILD-01 through BUILD-05 still marked `[ ]` (unchecked) despite work being complete | Info | Documentation discrepancy — does not affect the artifact or build correctness, but creates confusing state in the requirements tracker |

### Human Verification Required

#### 1. Play Console Internal Testing Upload

**Test:** Open Google Play Console at https://play.google.com/console, navigate to the "AI Fluent" app (package: `com.aifluent.app`), then go to Testing → Internal testing and confirm a release is present.
**Expected:** A release with version name "1.0" (versionCode 1) appears with status "Available" or "Rolling out". A testers list containing `hamoudi98@gmail.com` is configured.
**Why human:** Play Console has no public API for status checking. The SUMMARY records user confirmation ("uploaded") but this cannot be independently re-verified programmatically.

#### 2. Physical Device Smoke Test Integrity

**Test:** Verify the SUMMARY 02-03 user confirmation is accurate — the user typed "verified" confirming all 5 smoke test checks passed on a physical Android device.
**Expected:** All 5 checks pass: (1) app launches with dark splash / no white flash, (2) authentication signs in and loads profile, (3) World Map shows all 7 nodes without overlap, (4) greeting shows real user name not "AI", (5) tap on node opens lesson, back returns to World Map.
**Why human:** Physical device install from Play Store internal testing track cannot be tested programmatically. This requires a device with the Internal Testing opt-in URL active.

### Gaps Summary

No automated gaps found. All machine-verifiable must-haves passed:

- Keystore exclusion from git: confirmed via `git ls-files` returning 0 matches
- Local keystore files on disk: both `android/ai-fluent-release.keystore` and `android/keystore.properties` confirmed present
- Redundant duplicate removed: `android/app/ai-fluent-release.keystore` confirmed absent
- AAB exists and is signed: 3.18 MB file at expected path, `jarsigner -verify` confirms `jar verified.`
- Build pipeline wiring: `build.gradle` → `keystore.properties` → `signingConfigs.release` chain fully wired; dist/ and Android assets/ populated

The two human_needed items (Play Console upload confirmation and physical device smoke test) require the developer to independently re-confirm the user confirmations recorded in SUMMARY 02-03 are accurate. If the user already confirmed both tasks in the execution session, those confirmations stand.

**One notable anti-pattern:** `android/app/build.gradle` has an uncommitted working-tree change bumping `versionCode` from 1 to 2 and `versionName` from "1.0" to "2.0". This was not part of any Phase 2 plan task. The AAB on disk was built before this change and is correct at versionCode 1. However, the developer should decide whether to commit or revert this change before the next build.

---

_Verified: 2026-04-17T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
