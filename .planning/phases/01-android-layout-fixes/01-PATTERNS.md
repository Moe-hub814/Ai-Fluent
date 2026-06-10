# Phase 1: Android Layout Fixes - Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 2 modified (0 new)
**Analogs found:** 5 / 5 (all patterns live within the same monolith file)

---

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `src/App.jsx` (module-level constants, ~lines 49-52) | config (module constants) | synchronous-init | Same file: `BOTTOM_SAFE` declaration at line 52 | exact (identical pattern, different axis) |
| `src/App.jsx` (WorldMap top header, line 777) | component (layout-header) | request-response (layout-only) | Same file: WorldMap bottom bar at line 863 (applies `BOTTOM_SAFE`) | exact (mirror pattern, opposite edge) |
| `src/App.jsx` (NewsView tutor header line 1072 / article header line 1186) | component (layout-header) | layout-only | Same file: WorldMap top header (line 777) post-fix, also LocView tutor header at line 1072 | role-match |
| `src/App.jsx` (name fallback lines 710, 903) | utility (inline fallback expression) | data-transform | Same file: existing `profile?.display_name?.split(" ")[0]\|\|"Climber"` chain at line 710 | exact (extend same pattern) |
| `capacitor.config.json` | config (Capacitor JSON) | build-time config | Same file: existing keys `appId`, `appName`, `webDir` | role-match (add sibling key `android`) |

---

## Pattern Assignments

### Target 1: Add `TOP_SAFE` module constant (`src/App.jsx` below line 52)

**Role:** config / module-level constant
**Data flow:** synchronous init (evaluated once at parse time)

**Analog:** `src/App.jsx` lines 49-52 — existing `_isNative` and `BOTTOM_SAFE` constants

**Exact existing pattern** (lines 49-52):
```javascript
// MOBILE DETECTION
const _isNative=(typeof window!=="undefined")&&!!(window.Capacitor?.isNativePlatform?.())||document.URL.includes("localhost");

const BOTTOM_SAFE=_isNative?48:0;
```

**What the planner must copy:**
1. The exact one-line declaration style: `const NAME=_isNative?PIXELS:0;` (no spaces around `=`, `?`, `:`, consistent with adjacent code).
2. UPPER_SNAKE_CASE naming (`TOP_SAFE`, matching `BOTTOM_SAFE`).
3. Ternary gating on `_isNative` so web dev gets `0` and native Android gets the pixel value.
4. Module-level placement — NOT inside a component, NOT behind a hook.

**Code to produce** (per decisions D-01, D-02):
```javascript
// MOBILE DETECTION
const _isNative=(typeof window!=="undefined")&&!!(window.Capacitor?.isNativePlatform?.());

const BOTTOM_SAFE=_isNative?48:0;
const TOP_SAFE=_isNative?28:0;
```

Note the D-02 change: the `||document.URL.includes("localhost")` tail is removed from `_isNative`. This causes `BOTTOM_SAFE` and `TOP_SAFE` to become 0 in web dev — which is the intended behavior.

---

### Target 2: Apply `TOP_SAFE` to WorldMap top header (`src/App.jsx` line 777)

**Role:** component layout (absolute-positioned header)
**Data flow:** layout-only (no data)

**Analog:** `src/App.jsx` line 863 — WorldMap bottom action bar already applies `BOTTOM_SAFE` the exact way TOP_SAFE must be applied at the top.

**Established bottom pattern** (line 863):
```javascript
<div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,paddingBottom:(10+BOTTOM_SAFE)+"px",paddingTop:8,paddingLeft:8,paddingRight:8,background:dk?"rgba(6,13,26,.92)":"rgba(255,255,255,.92)",backdropFilter:"blur(16px)",borderTop:`1px solid ${dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.08)"}`,boxShadow:dk?"none":"0 -2px 20px rgba(0,0,0,.06)"}}>
```

Key excerpt: `paddingBottom:(10+BOTTOM_SAFE)+"px"` — the `10 + constant` formula concatenated with `"px"`, inside an inline `style={}` object, all on one line.

**Current top header** (line 777, BROKEN — no safe area offset):
```javascript
<div style={{position:"absolute",top:0,left:0,right:0,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:20,
  background:dk?"linear-gradient(180deg, rgba(6,13,26,.95) 0%, rgba(6,13,26,.6) 70%, transparent 100%)":"linear-gradient(180deg, rgba(216,232,248,.95) 0%, rgba(216,232,248,.6) 70%, transparent 100%)"}}>
```

**What to copy:** The mirror of line 863's `paddingBottom` approach. Replace the shorthand `padding:"10px 12px"` with an expanded form that includes `TOP_SAFE` in the top value.

**Code to produce** (per D-04):
```javascript
<div style={{position:"absolute",top:0,left:0,right:0,padding:`${TOP_SAFE+10}px 12px 10px`,display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:20,
  background:dk?"linear-gradient(180deg, rgba(6,13,26,.95) 0%, rgba(6,13,26,.6) 70%, transparent 100%)":"linear-gradient(180deg, rgba(216,232,248,.95) 0%, rgba(216,232,248,.6) 70%, transparent 100%)"}}>
```

Alternative equivalent form (matches line 863 style more literally):
```javascript
padding:"10px 12px",paddingTop:(TOP_SAFE+10)+"px"
```

Either works; prefer the template-literal `padding: \`${TOP_SAFE+10}px 12px 10px\`` form because it avoids overriding the same property twice and CONTEXT.md D-04 specifies it explicitly.

---

### Target 3: Apply `TOP_SAFE` to LocView tutor header (`src/App.jsx` line 1072)

**Role:** component layout (flex-column top header inside 100vh container)
**Data flow:** layout-only

**Analog:** `src/App.jsx` line 863 (bottom-edge pattern), and the WorldMap top header fix above serves as the direct sibling for top-edge.

**Current header** (line 1072, BROKEN):
```javascript
<div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}>
```

Parent is at line 1071: `<div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bgDark}}>` — this is a full-viewport screen whose first child is this header. Status bar will overlap it on Android.

**Code to produce** (per D-04):
```javascript
<div style={{padding:"12px 16px",paddingTop:(TOP_SAFE+12)+"px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}>
```

The `paddingTop` override after `padding` shorthand mirrors how line 1081 in the same file already does `padding:"8px 14px",paddingBottom:(12+BOTTOM_SAFE)+"px"` — same syntactic structure, just the opposite edge.

**Existing analog for padding + paddingBottom override** (line 1081):
```javascript
<div style={{padding:"8px 14px",paddingBottom:(12+BOTTOM_SAFE)+"px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,background:C.bgCard}}>
```

This is the exact style-object-with-shorthand-then-override pattern to replicate, flipped to the top axis.

---

### Target 4: Apply `TOP_SAFE` to NewsView article detail header (`src/App.jsx` line 1186)

**Role:** component layout (flex-column chat header inside 100vh container)
**Data flow:** layout-only

**Analog:** Identical to Target 3 — same structural pattern.

**Current header** (line 1186, BROKEN):
```javascript
<div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}>
```

**Code to produce** (per D-04):
```javascript
<div style={{padding:"12px 16px",paddingTop:(TOP_SAFE+12)+"px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}>
```

Same edit shape as Target 3. Both lines 1072 and 1186 should receive the same fix.

---

### Target 5: 3-step display_name fallback (`src/App.jsx` lines 710 and 903)

**Role:** utility (inline data-fallback expression)
**Data flow:** data-transform (profile object -> display string)

**Analog:** `src/App.jsx` line 710 — the existing 2-step fallback is the pattern to extend.

**Current patterns:**

Line 710 (WorldMap):
```javascript
const name=profile?.display_name?.split(" ")[0]||"Climber";
```

Line 903 (LocView, for `userName` used in Lumi chat):
```javascript
const userName=profile?.display_name?.split(" ")[0]||"friend";
```

**Established style observations** (for the planner):
- Optional chaining `?.` on `profile` and on `.split(...)` is already the codebase pattern.
- `||` chain for fallback (logical OR), not ternary. CONTEXT.md Claude's Discretion confirms logical OR is preferred.
- No whitespace around `||` or `=`, one-line declaration.
- String literal fallback differs per call site (`"Climber"` on line 710 for the greeting, `"friend"` on line 903 for Lumi's voice). The planner must preserve that distinction — the final literal in each chain stays as-is.

**Code to produce** (per D-05):

Line 710 (WorldMap):
```javascript
const name=profile?.display_name?.trim().split(" ")[0]||user?.email?.split("@")[0]||"Climber";
```

Line 903 (LocView):
```javascript
const userName=profile?.display_name?.trim().split(" ")[0]||user?.email?.split("@")[0]||"friend";
```

**Dependency the planner MUST resolve:** `user` is NOT currently a prop on either `WorldMap` or `LocView`. The top-level `AIFluent` component owns `user` state (line 1504) but only threads `profile` and `progress` downward. To make `user?.email?.split("@")[0]` work, the planner must either:

- **Option A (preferred, minimal):** Add `user` to the `WorldMap` and `LocView` prop signatures and pass it from `AIFluent` at lines 1549 (`LocView`) and 1558 (`WorldMap`). This matches the existing style of forwarding `profile` and `progress`.
- **Option B (alternative):** Read `user.email` at the `AIFluent` level and pass down a pre-computed `emailPrefix` string. More verbose and diverges from existing prop-passing style.

**Existing analog for prop threading** — from the `AIFluent` render at line 1549:
```javascript
if(screen==="location"&&activeLoc)return<><style>{getCss()}</style><LocView locId={activeLoc} uid={user.id} progress={progress} profile={profile} onBack={goMap} onComplete={refresh}/></>;
```

Note `uid={user.id}` is already passed — so `LocView` already has access to the authenticated user's id. The planner can add `user={user}` alongside it the same way. For `WorldMap` (line 1558), the prop list has no `user` reference yet and must be extended.

**Signature changes required:**
- Line 704: `const WorldMap = ({profile,progress,...})` -> add `user` to the destructured props.
- Line 894: `const LocView = ({locId,uid,progress,onBack,onComplete,profile})` -> add `user`.

---

### Target 6: Add `android.backgroundColor` to `capacitor.config.json`

**Role:** config (Capacitor build-time JSON)
**Data flow:** build-time / native-init

**Analog:** `capacitor.config.json` itself — existing keys at root level are the pattern to extend.

**Current file** (entire contents):
```json
{
  "appId": "com.aifluent.app",
  "appName": "AI Fluent",
  "webDir": "dist"
}
```

**Code to produce** (per D-07):
```json
{
  "appId": "com.aifluent.app",
  "appName": "AI Fluent",
  "webDir": "dist",
  "android": {
    "backgroundColor": "#060D1A"
  }
}
```

**Post-edit action:** run `npx cap sync android` so the value propagates to `android/app/src/main/assets/capacitor.config.json`. CONTEXT.md D-07 makes this explicit. The planner's action plan should include this sync step.

**Color value rationale:** `#060D1A` is the top stop of the dark-mode world-map gradient (see `src/App.jsx` line 725: `linear-gradient(180deg, #060D1A 0%, ...`). Matching the gradient's top color prevents the white-flash-then-dark transition at startup.

---

## Shared Patterns

### Inline-styles-only (apply to all component edits)

**Source:** `src/App.jsx` throughout
**Apply to:** Targets 2, 3, 4
**Rule:** All layout padding changes must be made via inline `style={}` prop edits. The codebase uses zero CSS classes for layout spacing. Do NOT introduce a CSS class, `styled-components` wrapper, or `className` for these fixes.

Excerpt showing the project-wide convention (line 863):
```javascript
<div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,paddingBottom:(10+BOTTOM_SAFE)+"px",paddingTop:8,paddingLeft:8,paddingRight:8,...}}>
```

### Pixel-value concatenation pattern

**Source:** `src/App.jsx` lines 863, 1081, 1489
**Apply to:** Targets 2, 3, 4
**Rule:** Safe-area-aware paddings use one of two equivalent forms:

Form 1 — arithmetic + string concat (used on line 863):
```javascript
paddingBottom:(10+BOTTOM_SAFE)+"px"
```

Form 2 — template literal (implied by CONTEXT.md D-04):
```javascript
padding:`${TOP_SAFE+10}px 12px 10px`
```

Both are acceptable. Pick whichever fits the surrounding line's structure with fewest changes. When replacing a shorthand `padding:"10px 12px"` that needs only the top axis bumped, form 1 with a separate `paddingTop` override is the minimal change. When rewriting the padding entirely, form 2 is cleaner.

### Optional-chaining fallback chain

**Source:** `src/App.jsx` line 710
**Apply to:** Target 5 (both line 710 and line 903)
**Rule:** `profile?.field?.method()||fallback1||fallback2||finalLiteral`. No ternaries, no `if` statements. Each step defends against `undefined` via `?.`, each falsy result cascades to the next via `||`. The final literal anchors the chain so the expression is always truthy.

### UPPER_SNAKE_CASE for module constants

**Source:** `src/App.jsx` lines 52 (`BOTTOM_SAFE`), 55 (`LANGS`), 40ish (`THEMES`)
**Apply to:** Target 1
**Rule:** New module-level constants use UPPER_SNAKE_CASE. `TOP_SAFE` follows this directly.

### No JSDoc / no comments for simple constants

**Source:** `src/App.jsx` line 52
**Apply to:** Target 1
**Rule:** `BOTTOM_SAFE` has no inline explanation comment. `TOP_SAFE` should match — do not add JSDoc or multi-line explanation above it. If any comment is desired, a single `//` line above the pair of constants (e.g., the existing `// MOBILE DETECTION` above `_isNative`) is the pattern.

---

## No Analog Found

All six targets have direct or adjacent analogs in the existing codebase. No gaps — this is a pure surgical bug-fix phase against an established monolith.

---

## Cross-Cutting Risks the Planner Should Note

1. **`_isNative` behavior change (D-02):** Removing `||document.URL.includes("localhost")` means `BOTTOM_SAFE` and `TOP_SAFE` will be `0` in web dev. Anyone running `npm run dev` and opening `http://localhost:5173` will no longer see the padding. Intentional per CONTEXT.md, but the planner should surface this in the plan's "dev ergonomics" note.

2. **`user` prop threading for D-05:** The `user` object is not currently a prop of `WorldMap` or `LocView`. The planner's action for Target 5 must include the prop-signature edits (lines 704, 894) and the call-site edits (lines 1549, 1558). This is a 4-line change beyond the two one-line fallback-expression edits.

3. **Line numbers will drift:** Adding `TOP_SAFE` as a new line at ~52 will shift every later line number by +1. All subsequent line references in this document (710, 777, 863, 903, 1072, 1081, 1186, 1489, 1504, 1558) are PRE-edit line numbers. The planner should either work top-to-bottom (making TOP_SAFE the first edit and accepting +1 drift) or reference code by surrounding context snippet rather than line number in its action list.

4. **`npx cap sync android` ordering (D-07):** The `capacitor.config.json` edit has no effect on the built Android APK until `npx cap sync android` runs. The planner's action checklist must include the sync step, and the screenshot-validation step must occur after the sync + rebuild.

5. **Data-layer side of D-06:** CONTEXT.md D-06 calls out that the test Supabase `profiles` row may have `display_name = "AI"` or `"AI Fluent"`, which would mask the fallback behavior. This is NOT a code fix — it's a manual DB reset. The planner should list it as a validation step, not as an edit action.

---

## Metadata

**Analog search scope:** `src/App.jsx` (monolith, ~1565 lines), `capacitor.config.json`
**Files scanned:** 2
**Pattern extraction date:** 2026-04-16
**Search technique:** Grep for `BOTTOM_SAFE`, `display_name?.split`, `user?.email`, `WorldMap|LocView|NewsView`, followed by direct Read of CONTEXT.md-referenced line ranges (49-53, 700-730, 770-790, 855-870, 890-910, 1065-1090, 1180-1200, 1500-1565).
