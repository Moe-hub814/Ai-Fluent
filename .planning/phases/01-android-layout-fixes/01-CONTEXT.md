# Phase 1: Android Layout Fixes - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix Android layout bugs so the app renders correctly before screenshots are taken. Scope is limited to: safe area padding constants, header overlaps, and the display_name fallback bug. No new features, no edge-to-edge architecture change.

</domain>

<decisions>
## Implementation Decisions

### Safe Area Constants

- **D-01:** Add `TOP_SAFE = _isNative ? 28 : 0` as a module-level constant directly below the existing `BOTTOM_SAFE` declaration (line 52 of `src/App.jsx`). Use 28px as the starting value (covers most xxhdpi Android devices); can be raised to 36 if notched devices show clipping after testing.
- **D-02:** Fix the `_isNative` detection to be Android-only. Remove the `||document.URL.includes("localhost")` clause. New definition: `const _isNative = (typeof window !== "undefined") && !!(window.Capacitor?.isNativePlatform?.())`. This means safe area constants only apply on actual Android — no more localhost side-effect.
- **D-03:** `BOTTOM_SAFE` stays at 48 (already correct for 3-button and gesture nav). Do not change the value, only verify on device.

### TOP_SAFE Application Scope

- **D-04:** Apply `TOP_SAFE` to ALL screen top headers, not just WorldMap. Target: any header `div` that sits at the very top of a screen and would be obscured by the Android status bar. This includes:
  - WorldMap header (line 777) — `position: absolute, top: 0, padding: "10px 12px"` → change to `padding: \`${TOP_SAFE + 10}px 12px 10px\``
  - NewsView header (line 1072) — `padding: "12px 16px"` → `paddingTop: TOP_SAFE + 12`
  - News article detail header (line 1186) — `padding: "12px 16px"` → `paddingTop: TOP_SAFE + 12`
  - Any other `height: "100vh"` screen whose first element is a header div without existing top offset
  - Do NOT apply to modals, dropdowns, or elements positioned relative to their parent (not the viewport)

### Display Name Bug

- **D-05:** Fix the `name` fallback chain in WorldMap (line 710) from:
  ```
  profile?.display_name?.split(" ")[0] || "Climber"
  ```
  to a 3-step fallback:
  ```
  profile?.display_name?.trim().split(" ")[0] ||
  user?.email?.split("@")[0] ||
  "Climber"
  ```
  The `.trim()` ensures empty strings (whitespace-only display_name) also trigger the fallback. Apply the same 3-step pattern to any other places that display the user's first name (`userName` at line 903).
- **D-06:** Also check/fix the Supabase `profiles` table: the test account likely has `display_name` set to "AI" or "AI Fluent" from an earlier onboarding run. Clear or reset it during testing to verify the fallback works. This is a data fix, not a code-only fix.

### App Startup Flash

- **D-07:** Add `android.backgroundColor: "#060D1A"` to `capacitor.config.json` to prevent white flash on Android startup. After adding, run `npx cap sync android` to propagate to `android/app/src/main/assets/capacitor.config.json`.

### Claude's Discretion

- Exact formatting of the 3-step fallback (ternary vs logical OR chain) — either works, keep it consistent with the existing codebase style (logical OR is already used)
- Whether to add a console.warn when display_name is missing (acceptable but not required)
- How to handle RTL screens (Arabic) — TOP_SAFE padding applies equally regardless of text direction

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Layout Fix Targets
- `src/App.jsx` lines 49-53 — `_isNative` and `BOTTOM_SAFE` constants (TOP_SAFE goes here)
- `src/App.jsx` line 706-712 — WorldMap component, `name` variable and `greet` function
- `src/App.jsx` line 777 — WorldMap top header (position: absolute, top: 0)
- `src/App.jsx` line 863 — WorldMap bottom bar (BOTTOM_SAFE already applied)
- `src/App.jsx` line 1072 — NewsView/Lumi chat header (flex column, needs paddingTop)
- `src/App.jsx` line 1186 — News article detail header (flex column, needs paddingTop)
- `src/App.jsx` line 903 — `userName` fallback in Lumi chat component
- `capacitor.config.json` — Add `android.backgroundColor`

### Requirements
- `.planning/REQUIREMENTS.md` — LAYOUT-01 through LAYOUT-04 define acceptance criteria

### Research Findings
- `.planning/research/ARCHITECTURE.md` — Full safe area analysis: why env() fails, Pattern A rationale, exact pixel values

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BOTTOM_SAFE` (line 52): The established pattern for safe area constants — `TOP_SAFE` follows the same structure
- `_isNative` (line 50): Mobile detection constant that gates safe area behavior — needs the localhost clause removed

### Established Patterns
- All layout uses inline styles (no CSS classes for layout). Padding changes must be inline `style={}` edits
- UPPER_SNAKE_CASE for module-level constants (consistent with `BOTTOM_SAFE`, `THEMES`, `LANGS`)
- Optional chaining (`profile?.display_name`) is already the pattern throughout — extend it with `.trim()` and the email fallback

### Integration Points
- `BOTTOM_SAFE` is referenced at lines 863, 1081, 1489 — these do NOT need changes (bottom already works)
- `capacitor.config.json` → `android/app/src/main/assets/capacitor.config.json` via `npx cap sync android`
- Supabase `profiles` table `display_name` column — the test account may need a DB-level reset

</code_context>

<specifics>
## Specific Ideas

- User wants `_isNative` to be Android-only (remove localhost fallback) — this changes dev behavior: safe area constants will be 0 in web dev, but test on actual Android
- The 3-step name fallback `display_name → email prefix → "Climber"` is the desired final form
- TOP_SAFE = 28 is the starting value; can raise to 36 if testing on notched devices shows clipping

</specifics>

<deferred>
## Deferred Ideas

- Edge-to-edge layout (Pattern B: `@capacitor/status-bar` + WindowCompat) — research says this adds risk before launch; keep for post-launch
- Dynamic safe area via `@capacitor-community/safe-area` plugin — constants approach is sufficient
- iOS safe area support — Android-only for this milestone

</deferred>

---

*Phase: 01-android-layout-fixes*
*Context gathered: 2026-04-16*
