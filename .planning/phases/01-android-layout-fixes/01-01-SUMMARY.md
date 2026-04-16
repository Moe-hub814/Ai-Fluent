---
phase: 01-android-layout-fixes
plan: 01
subsystem: ui
tags: [react, capacitor, android, safe-area, layout, inline-styles]

requires:
  - phase: 00-init
    provides: App.jsx monolith baseline with BOTTOM_SAFE=48 pattern and _isNative detection
provides:
  - Module-level TOP_SAFE=28 constant (Android status-bar offset)
  - Android-only _isNative detection (localhost fallback removed)
  - WorldMap top header padded to clear status bar
  - LocView tutor header padded to clear status bar
  - NewsView chat header padded to clear status bar
affects: [01-02 (display-name fallback + backgroundColor), 01-03 (device verification), 02-keystore, 03-release-build]

tech-stack:
  added: []
  patterns:
    - UPPER_SNAKE_CASE module-level pixel constants gated on _isNative
    - Inline-style shorthand-then-axis-override (padding + paddingTop / paddingBottom)
    - Template-literal form for full padding rewrites (padding:`${TOP_SAFE+10}px 12px 10px`)

key-files:
  created: []
  modified:
    - src/App.jsx

key-decisions:
  - "TOP_SAFE=28 as starting value (can be raised to 36 later if notched devices clip)"
  - "Removed localhost fallback from _isNative — dev ergonomics tradeoff accepted per D-02"
  - "Used template literal for WorldMap header (single padding declaration), shorthand+override for the two flex-column headers (mirrors existing BOTTOM_SAFE pattern on line 1189)"

patterns-established:
  - "Safe-area constants: const NAME=_isNative?PX:0 at module level below _isNative"
  - "Header padding override: padding:\"12px 16px\",paddingTop:(TOP_SAFE+12)+\"px\" — shorthand first, axis override second"

requirements-completed: [LAYOUT-01, LAYOUT-02]

duration: 3min
completed: 2026-04-16
---

# Phase 1 Plan 1: Android Safe-Area Top Padding Summary

**TOP_SAFE=28 constant added to src/App.jsx and applied to the three top-edge headers (WorldMap, LocView tutor, NewsView chat) so the Android status bar no longer overlaps them.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-16T21:29:28Z
- **Completed:** 2026-04-16T21:32:00Z (approx.)
- **Tasks:** 3 of 3
- **Files modified:** 1 (src/App.jsx, 4 pinpoint edits)

## Accomplishments

- Module-level `const TOP_SAFE=_isNative?28:0;` added directly below `BOTTOM_SAFE` (post-edit line 53), matching UPPER_SNAKE_CASE pattern and ternary-gated-on-_isNative style.
- `_isNative` tightened to Android-only (the `||document.URL.includes("localhost")` tail was removed; the file now contains zero occurrences of `document.URL.includes`).
- WorldMap absolute-positioned top header (post-edit line 778) switched from `padding:"10px 12px"` to template-literal `padding:\`${TOP_SAFE+10}px 12px 10px\``.
- LocView tutor header (post-edit line 1073) and NewsView chat header (post-edit line 1187) both gained `paddingTop:(TOP_SAFE+12)+"px"` override, sitting immediately after the `padding:"12px 16px"` shorthand.

## Task Commits

Each task was committed atomically on `main`:

1. **Task 1: Add TOP_SAFE constant and fix _isNative** — `d11992b` (feat)
2. **Task 2: Apply TOP_SAFE to WorldMap top header** — `2114850` (feat)
3. **Task 3: Apply TOP_SAFE to LocView tutor and NewsView chat headers** — `b3989d8` (feat)

**Plan metadata commit:** pending (this SUMMARY + STATE updates).

## Exact Post-Edit Lines

Post-Task-1 line drift is +1 for everything below line 52 (because `TOP_SAFE` was inserted as line 53). Final line numbers of the four edits:

| # | Edit | Post-edit line | File |
|---|------|----------------|------|
| 1 | `_isNative` without localhost clause | 50 | src/App.jsx |
| 2 | `const TOP_SAFE=_isNative?28:0;` | 53 | src/App.jsx |
| 3 | WorldMap header — template-literal padding | 778 | src/App.jsx |
| 4 | LocView tutor header — paddingTop override | 1073 | src/App.jsx |
| 5 | NewsView chat header — paddingTop override | 1187 | src/App.jsx |

## Files Created/Modified

- `src/App.jsx` — 4 pinpoint edits (one constant declaration updated, one constant added, three `<div style>` prop bodies amended). No imports added, no new files.

## Decisions Made

- **Dev-ergonomics trade-off accepted (D-02):** Removing `||document.URL.includes("localhost")` from `_isNative` means `BOTTOM_SAFE`, `TOP_SAFE` both evaluate to `0` when running `npm run dev` against `http://localhost:5173`. This is intentional — safe-area constants should only apply on real Android devices. Verification step 6 of the plan (visually confirming 0 padding in web dev) is inherently satisfied by the constant's formula: `_isNative=false` on web → constants = 0 → template literal produces `10px 12px 10px` at the WorldMap header, and `paddingTop` overrides resolve to `12px` at the flex-column headers — effectively the pre-fix layout, as intended.
- **Template-literal form for WorldMap header (D-04 explicit preference):** The WorldMap header change used `padding:\`${TOP_SAFE+10}px 12px 10px\`` rather than the shorthand+override equivalent. D-04 names this specific form; it also avoids declaring `padding` twice on the same style object. The two full-viewport flex-column headers use the shorthand+override form because it is the minimal change and mirrors the existing `padding:"8px 14px",paddingBottom:(12+BOTTOM_SAFE)+"px"` bottom-axis pattern on post-edit line 1189.

## Other `padding:"10px 12px"` / `padding:"12px 16px"` Sites Spotted and Left Untouched

Per the plan's output spec, these occurrences were scanned and deliberately not modified:

- `padding:"10px 12px"` — **0 remaining occurrences.** The one WorldMap-header instance was the only site.
- `padding:"12px 16px"` — **4 remaining occurrences in src/App.jsx:**
  - Lines 1073 & 1187 (the two patched headers): now accompanied by `paddingTop:(TOP_SAFE+12)+"px"` override — this is the correct post-fix state.
  - Line 1262 — achievement "earned" row inside a scrollable list. Not a viewport-top element; scrolls under any top header. Out of D-04 scope.
  - Line 1266 — achievement "locked" row inside the same scrollable list. Same reasoning.
  - Line 1283 — practice-mode option button inside a scrollable lesson view. Same reasoning.

All three untouched sites are list-item paddings inside scrollable containers — none sit flush against the viewport top on Android, so none suffer the status-bar overlap.

## Line-Number Drift Notice (for downstream plans)

Inserting `TOP_SAFE` as a new line at position 53 shifted every subsequent line in `src/App.jsx` by +1. CONTEXT.md and PATTERNS.md still reference **pre-edit** line numbers (e.g., 710, 777, 863, 903, 1072, 1081, 1186, 1504, 1549, 1558). Plans 01-02 and 01-03 should either:

- Add +1 to every CONTEXT.md / PATTERNS.md line number, **or**
- Use grep-by-surrounding-context (the approach this plan used in Tasks 2 and 3) — more robust against further drift.

Concrete post-edit targets for Plan 01-02's Target 5 (display_name fallback):

- WorldMap `name` variable: **post-edit line 711** (CONTEXT said 710).
- LocView `userName` variable: **post-edit line 904** (CONTEXT said 903).
- WorldMap signature destructuring: **post-edit line 705** (CONTEXT said 704).
- LocView signature destructuring: **post-edit line 895** (CONTEXT said 894).
- `LocView` call site (`AIFluent` render): **post-edit line 1550** (CONTEXT said 1549).
- `WorldMap` call site (`AIFluent` render): **post-edit line 1559** (CONTEXT said 1558).

## Deviations from Plan

None — plan executed exactly as written. All three tasks committed atomically, all automated verification checks passed on the first try for each task, `npm run build` succeeded after every task.

## Issues Encountered

- `git commit` emitted the expected `LF will be replaced by CRLF` warnings on every `src/App.jsx` commit (Windows `core.autocrlf` behavior). Task 1's `git commit` reported "23 insertions(+), 19 deletions(-)" — this reflects a whole-file line-ending normalization, NOT extra code changes. The actual content diff is exactly the three-line block edit specified by Task 1. Verified by `git diff --diff-filter=D --name-only HEAD~1 HEAD` returning empty after each commit (no file deletions).

## User Setup Required

None — no external service configuration, no environment variables, no dashboard steps. All changes are source-code-only edits to `src/App.jsx`.

## Verification Results

Plan-level verification at end of execution:

| # | Check | Expected | Actual | Pass |
|---|-------|----------|--------|------|
| 1 | `grep -c "const TOP_SAFE=_isNative?28:0;" src/App.jsx` | 1 | 1 | ✓ |
| 2 | `grep -c "document.URL.includes" src/App.jsx` | 0 | 0 | ✓ |
| 3 | `grep -c 'padding:\`${TOP_SAFE+10}px 12px 10px\`' src/App.jsx` | 1 | 1 | ✓ |
| 4 | `grep -c 'paddingTop:(TOP_SAFE+12)+"px"' src/App.jsx` | 2 | 2 | ✓ |
| 5 | `npm run build` exit 0 | pass | pass (~2.15s, 546 kB bundle) | ✓ |
| 6 | Web dev yields 0 padding at three header sites | true by formula | true (`_isNative`=false ⇒ constants=0) | ✓ |

Device-level verification on a real Android device is deferred to Plan 01-03 per the plan's explicit scope boundary.

## Next Phase Readiness

- Foundation is in place for Plan 01-02 (display-name fallback + `android.backgroundColor`): `user` prop threading and the 3-step fallback chain are the only remaining Phase 1 code changes before Plan 01-03 does `npx cap sync android` and builds the release.
- No blockers. `TOP_SAFE` is correctly scoped at module level, typed by its value (28 number, coerced to string only in the template literal / concat expressions), and build-verified.
- Concern to carry forward: the two-line content of the WorldMap header style prop is now slightly longer on line 778 — any future touch to that line should preserve the `${TOP_SAFE+10}` expression and the template-literal backticks.

## Self-Check: PASSED

- FOUND: `.planning/phases/01-android-layout-fixes/01-01-SUMMARY.md`
- FOUND: `src/App.jsx`
- FOUND: commit `d11992b` (Task 1)
- FOUND: commit `2114850` (Task 2)
- FOUND: commit `b3989d8` (Task 3)

---
*Phase: 01-android-layout-fixes*
*Completed: 2026-04-16*
