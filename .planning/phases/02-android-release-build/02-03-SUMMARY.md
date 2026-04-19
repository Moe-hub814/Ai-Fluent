---
phase: 02-android-release-build
plan: 03
subsystem: infra
tags: [google-play, play-console, internal-testing, aab, android, release]

# Dependency graph
requires:
  - phase: 02-android-release-build
    plan: 02
    provides: "Signed release AAB at android/app/build/outputs/bundle/release/app-release.aab"
provides:
  - "AAB uploaded to Play Console Internal Testing track (pending human action)"
  - "Release build verified installable on physical Android device (pending human action)"
affects: [03-play-store-assets, 04-play-store-listing]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified: []

key-decisions:
  - "Internal Testing track chosen as first upload target (fastest path to physical device validation before public listing)"
  - "Tester list restricted to developer email only (hamoudi98@gmail.com) per T-02-09 threat mitigation"

patterns-established: []

requirements-completed: [BUILD-05]

# Metrics
duration: partial
completed: 2026-04-17
---

# Phase 02 Plan 03: Upload AAB to Internal Testing Summary

**Signed AAB (3.1 MB) confirmed ready for upload to Play Console Internal Testing — human action required to complete upload and device smoke test**

## Performance

- **Duration:** ~5 min (automated pre-check only)
- **Started:** 2026-04-17T00:00:00Z
- **Completed:** 2026-04-17T00:00:00Z
- **Tasks:** 0 of 2 completed (both are human-action/human-verify checkpoints)
- **Files modified:** 0

## Accomplishments

- Confirmed the signed AAB exists on disk: `android/app/build/outputs/bundle/release/app-release.aab` (3.1 MB, built April 19)
- Verified app identity: package `com.aifluent.app`, version code 1, version name 1.0
- Presented Play Console upload instructions and smoke test checklist for human execution

## Task Commits

No code tasks to commit — this plan contains only human-action and human-verify checkpoints.

## Files Created/Modified

None — no automated code changes in this plan.

## Decisions Made

- Internal Testing track is the correct first upload target: fastest path to physical device validation, no store review required, and reversible if issues found.
- Tester access restricted to `hamoudi98@gmail.com` only, as specified by threat T-02-09 (Internal Testing access spoofing mitigation).

## Deviations from Plan

None - plan executed exactly as written. Both tasks are blocking human-action/verify checkpoints that cannot be automated. The executor confirmed the AAB artifact exists and presented instructions.

## Issues Encountered

None during the automated pre-check phase.

## User Setup Required

**Task 1 — Play Console upload (BLOCKING):**

1. Open Google Play Console: https://play.google.com/console
2. Select "AI Fluent" app (package: `com.aifluent.app`)
   - If the app does not exist yet: "Create app" -> Title: "AI Fluent", Default language: English, App type: App, Free
3. Navigate to: **Testing** -> **Internal testing**
4. Click **"Create new release"**
5. Upload the AAB file from:
   `C:\Users\hamou\ai-fluent\android\app\build\outputs\bundle\release\app-release.aab`
6. Release name: `1.0 (1)` (or accept the default)
7. Release notes: `Initial internal testing release`
8. Click **"Review release"** then **"Start rollout to Internal testing"**
9. Add yourself as a tester:
   - Go to **Internal testing** -> **Testers** tab
   - Create a testers list (e.g., "Internal") and add email: `hamoudi98@gmail.com`
   - Copy the **opt-in URL** that appears
10. Confirm by pasting the opt-in URL, or type "uploaded"

**Task 2 — Physical device smoke test (after Task 1):**

1. On your Android device, open the Internal Testing opt-in URL in a browser
2. Accept the tester invitation and install from Google Play Store
3. Run 5-point smoke test:
   - App launches (dark splash, no white flash — Phase 1 fix LAYOUT-04)
   - Authentication works (sign in loads profile and progress)
   - World Map renders all 7 nodes (Summit not overlapped by header — LAYOUT-01; Base Camp not overlapped by nav bar — LAYOUT-02)
   - Greeting shows correct name, not "Good afternoon, AI" — LAYOUT-03
   - Basic navigation: tap location node, confirm lesson view opens, press back to return
4. Confirm by typing "verified" or describe any issues found

## Next Phase Readiness

- Blocked pending human upload to Play Console (Task 1) and device smoke test (Task 2)
- Once BUILD-05 is confirmed, Phase 03 (Play Store assets/screenshots) can proceed
- No code blockers — all Phase 1 layout fixes are in the signed release build

## Self-Check

- AAB file existence: FOUND (android/app/build/outputs/bundle/release/app-release.aab, 3.1 MB)
- No code commits to verify (human-action plan)

## Self-Check: PASSED

---
*Phase: 02-android-release-build*
*Completed: 2026-04-17*
