---
phase: 01-android-layout-fixes
plan: 02
subsystem: ui
tags: [react, user-prop, fallback-chain, display-name, layout-03]

requires:
  - phase: 01-android-layout-fixes
    plan: 01
    provides: TOP_SAFE constant and line-drifted (+1) App.jsx baseline
provides:
  - `user` prop threaded from AIFluent into WorldMap and LocView
  - 3-step display_name fallback chain at both render sites (WorldMap `name`, LocView `userName`)
  - Fix for "Good afternoon, AI" greeting bug (LAYOUT-03)
affects: [01-03 (device verification), 02-keystore, 03-release-build]

tech-stack:
  added: []
  patterns:
    - Prop threading preserving existing destructure order (user prepended as first key)
    - Optional-chaining fallback chain extended from 2-step to 3-step with `.trim()` and email-local-part
    - `user?.email?.split("@")[0]` as universal fallback for any Supabase-authenticated user

key-files:
  created: []
  modified:
    - src/App.jsx

key-decisions:
  - "Option A (prop-threading) chosen over Option B (pre-computed emailPrefix) per PATTERNS.md Target 5 — matches existing codebase style of forwarding `profile`/`progress` down the tree"
  - "Terminal literals preserved per component: \"Climber\" (WorldMap greeting voice) and \"friend\" (LocView/Lumi chat voice)"
  - "No console.warn added on missing display_name — D-05 Claude's Discretion said acceptable but not required; omitted per single-concern principle"

patterns-established:
  - "User prop threading: `user={user}` passed alongside existing `uid={user.id}` (LocView) or prepended at the head of the prop list (WorldMap)"
  - "3-step optional-chain fallback: `profile?.field?.trim().split(\" \")[0]||user?.email?.split(\"@\")[0]||<literal>`"

requirements-completed: [LAYOUT-03]

duration: 2min
completed: 2026-04-16
---

# Phase 1 Plan 2: Display Name Fallback + User Prop Threading Summary

**Fixed the "Good afternoon, AI" greeting bug (LAYOUT-03) by threading the `user` object from AIFluent into WorldMap and LocView, then extending the 2-step display_name fallback to a 3-step chain that inserts `.trim()` defence and a `user.email`-local-part fallback before the hardcoded terminal literal.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-16T21:34:41Z
- **Completed:** 2026-04-16T21:36:17Z
- **Tasks:** 2 of 2
- **Files modified:** 1 (src/App.jsx, 6 pinpoint edits across 4 commits — 4 in Task 1, 2 in Task 2)

## Accomplishments

- **Task 1 (prop threading, commit `0d3420e`):** `user` prepended as the first destructured prop of both `WorldMap` (line 705) and `LocView` (line 895). `AIFluent` render now passes `user={user}` to both components — `<LocView user={user} locId={activeLoc}...` at line 1550 and `<WorldMap user={user} profile={profile}...` at line 1559. Existing prop order for all other keys is unchanged.
- **Task 2 (fallback chain, commit `754fdc7`):** Both `profile?.display_name?.split(" ")[0]||<literal>` declarations replaced with the 3-step chain `profile?.display_name?.trim().split(" ")[0]||user?.email?.split("@")[0]||<literal>`. Terminal literals preserved: `"Climber"` in WorldMap (line 711), `"friend"` in LocView (line 904).

## Task Commits

Each task was committed atomically on `main`:

1. **Task 1: Thread `user` prop into WorldMap and LocView** — `0d3420e` (feat)
2. **Task 2: Replace 2-step display_name fallback with 3-step chain (D-05)** — `754fdc7` (fix)

Task 1 preceded Task 2 by design — the 3-step expression `user?.email?.split("@")[0]` inside the WorldMap/LocView component bodies depends on `user` being in scope, which Task 1 establishes.

**Plan metadata commit:** pending (this SUMMARY + STATE/ROADMAP updates).

## Exact Post-Edit Lines

No new lines were inserted in this plan (all six edits are in-place substitutions — same line count before and after). Confirmed post-edit line numbers:

| # | Edit | Post-edit line | File |
|---|------|----------------|------|
| 1 | `const WorldMap = ({user,profile,...})` — signature prepend | 705 | src/App.jsx |
| 2 | `const LocView = ({user,locId,uid,...})` — signature prepend | 895 | src/App.jsx |
| 3 | `<LocView user={user} locId={activeLoc}...` — call site | 1550 | src/App.jsx |
| 4 | `<WorldMap user={user} profile={profile}...` — call site | 1559 | src/App.jsx |
| 5 | `const name=profile?.display_name?.trim().split(" ")[0]||user?.email?.split("@")[0]||"Climber";` | 711 | src/App.jsx |
| 6 | `const userName=profile?.display_name?.trim().split(" ")[0]||user?.email?.split("@")[0]||"friend";` | 904 | src/App.jsx |

These are the exact post-edit targets documented by Plan 01-01's SUMMARY (lines 705/711/895/904/1550/1559) — line drift from Plan 01-01's TOP_SAFE insertion is already accounted for.

## Files Created/Modified

- `src/App.jsx` — 6 pinpoint edits total: 2 component-signature destructure prepends, 2 JSX call-site prop additions, 2 fallback-expression rewrites. No imports added, no new files.

## Decisions Made

- **Option A (prop threading) over Option B (pre-computed emailPrefix) per PATTERNS.md Target 5:** Threading `user` down matches the codebase's established style of forwarding whole `profile` and `progress` objects. Option B (computing an `emailPrefix` string at the `AIFluent` level and passing just that scalar) would diverge from that pattern and require a helper name at the parent level. No functional difference, chose consistency.
- **Terminal literals remain distinct per component voice:** `"Climber"` stays in WorldMap greeting (mountain-climb theme), `"friend"` stays in LocView/Lumi chat (conversational voice). PATTERNS.md Target 5 style observations explicitly called this out.
- **No `console.warn` added on missing display_name:** D-05's Claude's Discretion allowed it but did not require it. Omitted to keep the expression surgically small and single-concerned.

## Verification Results

Plan-level verification at end of execution:

| # | Check | Expected | Actual | Pass |
|---|-------|----------|--------|------|
| 1 | `grep -c 'profile?.display_name?.trim()' src/App.jsx` | 2 | 2 | PASS |
| 2 | `grep -c 'user?.email?.split("@")\[0\]' src/App.jsx` | 2 | 2 | PASS |
| 3 | `grep -c 'user={user}' src/App.jsx` | 2 | 2 | PASS |
| 4 | `grep -c 'const WorldMap = ({user,' src/App.jsx` | 1 | 1 | PASS |
| 5 | `grep -c 'const LocView = ({user,' src/App.jsx` | 1 | 1 | PASS |
| 6 | `grep -c 'profile?.display_name?.split(" ")\[0\]' src/App.jsx` (old 2-step gone) | 0 | 0 | PASS |
| 7 | `npm run build` exit 0 | pass | pass (~2.16s, 546 kB bundle) | PASS |

Manual greeting-in-dev-against-whitespace-display_name verification is deferred to Plan 01-03's device-verification checkpoint — it requires the Supabase `profiles.display_name` DB reset per D-06 (see "Note for Plan 03" below).

## Deviations from Plan

None — plan executed exactly as written. Both tasks committed atomically, all automated verification checks passed on the first try, `npm run build` succeeded after each task.

## Issues Encountered

- `git commit` emitted the expected `LF will be replaced by CRLF` warning on both `src/App.jsx` commits (Windows `core.autocrlf`). No content impact; per-task `git diff --diff-filter=D --name-only HEAD~1 HEAD` returned empty (no file deletions).
- Initial attempt to issue all four Task 1 Edits in parallel was blocked by the read-before-edit hook because the file had not yet been Read in this session. Worked around by Reading the three relevant 20-line windows (lines 700, 890, 1545) first, then re-issuing the Edits sequentially in a single tool-call batch — all four landed cleanly on retry.
- Same pattern recurred for Task 2's two Edits. Since the earlier Read windows already included lines 711 and 904, the Edits succeeded on retry without needing a fresh Read.

## Note for Plan 01-03 (Device Verification)

Per CONTEXT.md D-06, the Supabase `profiles.display_name` manual DB reset remains a required step at device-verification time. The fallback path — display_name → email prefix → literal — cannot be end-to-end verified from code alone:

- If the test account's `profiles.display_name` column is still set to "AI" or "AI Fluent" from an earlier onboarding run, the Task 2 expression will correctly return "AI" on step 1 of the chain and the user-visible bug will persist in the UI even though the code is fixed.
- Plan 01-03's device-verification checkpoint must therefore (a) reset the test profile's `display_name` to NULL or `""` in the Supabase `profiles` table, then (b) sign in on the Android device, then (c) visually confirm the greeting shows the email local-part.

This is a DATA fix, not a CODE fix. It is outside this plan's scope but is documented here so Plan 01-03 does not miss it.

## Threat Surface

No new security-relevant surface introduced beyond what the threat model in the plan already documented. `user.email` is now rendered as a fallback greeting — React's JSX text interpolation auto-escapes, and the value is only visible to the authenticated user on their own device. T-01-02-03 (empty-string display_name bypass) is mitigated by the `.trim()` call, verified in Task 2's acceptance-criteria grep.

## User Setup Required

None for code. For the separate device-verification manual step (Plan 01-03), the test account's Supabase `profiles.display_name` must be cleared manually.

## Next Phase Readiness

- Phase 1 code changes are complete. Plan 01-03 will now perform `npx cap sync android`, build, and device-verify on a real Android.
- No blockers. All Phase-1 code-layer fixes (TOP_SAFE + _isNative tightening in Plan 01-01, user-prop + 3-step fallback in Plan 01-02) are landed and build-verified.
- Concern to carry forward: the two `<LocView>` and `<WorldMap>` JSX call sites now each have `user={user}` as the first prop — any future touch to those JSX blocks should preserve the ordering.

## Self-Check: PASSED

- FOUND: `.planning/phases/01-android-layout-fixes/01-02-SUMMARY.md`
- FOUND: `src/App.jsx`
- FOUND: commit `0d3420e` (Task 1 — prop threading)
- FOUND: commit `754fdc7` (Task 2 — 3-step fallback)

---
*Phase: 01-android-layout-fixes*
*Completed: 2026-04-16*
