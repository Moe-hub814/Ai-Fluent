---
phase: 02-android-release-build
plan: "02"
subsystem: infra
tags: [android, capacitor, gradle, aab, signing, jdk21, vite]

# Dependency graph
requires:
  - phase: 02-01
    provides: "android/ai-fluent-release.keystore and android/keystore.properties on disk"
provides:
  - "Signed release AAB at android/app/build/outputs/bundle/release/app-release.aab (3.0 MB)"
  - "jarsigner verification confirming AAB is signed with the aifluent alias keystore"
affects:
  - 02-03

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "keystore.properties storeFile path must be relative to android/app/ (module dir), not android/ (root project dir)"

key-files:
  created:
    - "android/app/build/outputs/bundle/release/app-release.aab (gitignored build artifact)"
  modified:
    - "android/keystore.properties (gitignored — storeFile path corrected to ../ai-fluent-release.keystore)"

key-decisions:
  - "keystore.properties storeFile uses ../ai-fluent-release.keystore (relative to app/ module dir) — Gradle's file() in build.gradle resolves relative to the module, not the root project"

patterns-established:
  - "Build pipeline: npm run build -> npx cap sync android -> ./gradlew bundleRelease"
  - "jarsigner -verify confirms 'jar verified.' with expected self-signed cert warnings (normal)"

requirements-completed: [BUILD-03, BUILD-04]

# Metrics
duration: 12min
completed: 2026-04-19
---

# Phase 02 Plan 02: Build Signed Release AAB Summary

**Signed release AAB (3.0 MB) produced via Vite + Capacitor + Gradle pipeline and verified with jarsigner; keystore path bug in keystore.properties auto-fixed**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-19T11:22:28Z
- **Completed:** 2026-04-19T11:34:00Z
- **Tasks:** 2
- **Files modified:** 1 (gitignored)

## Accomplishments
- Production web bundle built via Vite (`dist/` — 546 KB JS, 0.07 KB CSS)
- Web assets synced to Android project via `npx cap sync android`
- Signed release AAB produced at `android/app/build/outputs/bundle/release/app-release.aab` (3,183,916 bytes)
- `jarsigner -verify` confirms `jar verified.` — AAB signed with aifluent keystore alias, cert valid until 2053-08-23

## Task Commits

Both tasks produced no tracked git changes (build outputs and keystore.properties are gitignored). The auto-fix to keystore.properties is captured in the deviation record below. Plan metadata commit contains the SUMMARY.

**Plan metadata:** (see final commit hash below)

## Files Created/Modified
- `android/app/build/outputs/bundle/release/app-release.aab` — Signed release Android App Bundle (gitignored, ~3 MB)
- `android/keystore.properties` — Gitignored config; `storeFile` corrected from `ai-fluent-release.keystore` to `../ai-fluent-release.keystore`

## Decisions Made
- `storeFile` path in `keystore.properties` must be `../ai-fluent-release.keystore` because Gradle's `file()` function in `build.gradle` resolves relative to `android/app/` (the module directory), not `android/` (the root project directory). The keystore file lives in `android/`, one level up from `app/`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed keystore path in keystore.properties**
- **Found during:** Task 1 (Build signed release AAB)
- **Issue:** `./gradlew bundleRelease` failed with `Keystore file 'C:\Users\hamou\ai-fluent\android\app\ai-fluent-release.keystore' not found`. The `storeFile=ai-fluent-release.keystore` in `android/keystore.properties` was interpreted as relative to `android/app/` (module dir) by Gradle's `file()` call in `build.gradle`, but the keystore lives in `android/`.
- **Fix:** Changed `storeFile=ai-fluent-release.keystore` to `storeFile=../ai-fluent-release.keystore` in `android/keystore.properties`.
- **Files modified:** `android/keystore.properties` (gitignored — no git commit)
- **Verification:** `./gradlew bundleRelease` reported BUILD SUCCESSFUL; AAB produced at expected path.
- **Committed in:** Not committed — file is gitignored (intentionally excluded from git for security)

---

**Total deviations:** 1 auto-fixed (Rule 1 — path bug blocking the build)
**Impact on plan:** Fix was essential to produce the AAB. One-line change to a gitignored config file. No scope creep.

## Issues Encountered
- First Gradle run failed with "Keystore file not found" because `storeFile` path in `keystore.properties` was missing the `../` prefix. Gradle resolves `file()` relative to the module (`android/app/`), not the root project (`android/`). One-line fix to gitignored file resolved it.

## User Setup Required
None - the build runs fully locally. The `keystore.properties` fix was applied to the file on disk and is intentionally not committed (gitignored for security). If this machine is replaced or the file is lost, `keystore.properties` must be recreated with `storeFile=../ai-fluent-release.keystore`.

## Threat Surface Scan
No new security-relevant surface introduced. This plan produces a build artifact only. The AAB itself is signed with the private keystore as designed (T-02-05 mitigated). `keystore.properties` with credentials remains gitignored.

## Next Phase Readiness
- `android/app/build/outputs/bundle/release/app-release.aab` is ready for upload to Google Play Console
- `jarsigner -verify` confirms the AAB is correctly signed — no re-signing needed before upload
- Plan 03 (Play Console upload) can proceed immediately

---
*Phase: 02-android-release-build*
*Completed: 2026-04-19*

## Self-Check: PASSED

- FOUND: android/app/build/outputs/bundle/release/app-release.aab
- FOUND: .planning/phases/02-android-release-build/02-02-SUMMARY.md
- FOUND: git commit 8bf8a44 (docs(02-02): complete build signed release AAB plan)
