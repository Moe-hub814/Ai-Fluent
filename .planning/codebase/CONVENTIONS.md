# Coding Conventions

**Analysis Date:** 2026-04-16

## Naming Patterns

**Files:**
- React components: PascalCase in JSX format (e.g., `App.jsx`, `ShareCard`)
- Regular modules: lowercase with hyphens (e.g., `supabase.js`)
- CSS: inline styles preferred over separate files

**Functions:**
- Regular functions and handlers: camelCase (e.g., `recordActivity()`, `getCalendar()`)
- Component functions: PascalCase (e.g., `AuthScreen`, `WorldMap`, `ErrorMsg`)
- Helper functions: camelCase (e.g., `locName()`, `lessonTitle()`)
- Callback functions: camelCase with `on` prefix (e.g., `onOpenLoc`, `onToggleTheme`)

**Variables:**
- State: camelCase (e.g., `email`, `loading`, `err`)
- Constants: UPPER_SNAKE_CASE (e.g., `THEMES`, `LANGUAGES`, `DAILY_CHALLENGES`)
- Private/internal: underscore prefix (e.g., `_key`, `_isNative`, `_lang`)
- Object properties and keys: camelCase (e.g., `stopColor`, `fontFamily`)

**Types:**
- Data structures: lowercase descriptive names (e.g., `profile`, `progress`, `data`)
- Configuration objects: UPPER_SNAKE_CASE (e.g., `THEMES`, `LANGS`, `LOCS`)
- Enum-like objects: UPPER_SNAKE_CASE with descriptive keys (e.g., `ACHIEVEMENTS`, `TOOLS`)

## Code Style

**Formatting:**
- No external formatter detected (no Prettier config)
- Inline styles dominate — `style={}` prop usage throughout
- CSS inserted via `getCss()` function that returns template literal
- Semicolons: consistently used
- Spaces around operators and after keywords

**Linting:**
- ESLint with React hooks and refresh plugins
- Config: `eslint.config.js` (flat config format)
- Key rule: `no-unused-vars` with pattern `^[A-Z_]` (allows unused uppercase variables like component props)
- Enforces React hooks rules and refresh functionality

**Line Length:**
- No strict enforcement observed
- Long property assignments common: `onClick={()=>setStep(step+1)}` on same line
- Complex objects inlined in JSX props

## Import Organization

**Order:**
1. React and React DOM imports
2. External dependencies (Supabase, Capacitor)
3. Local modules (`.js`, `.jsx` files)

**Path Aliases:**
- Not used — all imports are relative paths
- Examples from `src/App.jsx`:
  ```javascript
  import { useState, useEffect, useRef, useCallback } from "react";
  import { db } from "./lib/supabase";
  ```

**Example from `src/lib/supabase.js`:**
```javascript
import { createClient } from "@supabase/supabase-js";
```

## Error Handling

**Patterns:**

1. **Try-Catch Blocks:**
   - Used for risky operations like JSON parsing
   - In `supabase.js`, line 59: `const err = await res.json().catch(() => ({ error: "Unknown error" }))`
   - In `TCache`, line 110: `try{return JSON.parse(localStorage.getItem...)} catch{return{}}`
   - Graceful fallbacks to empty objects or default values

2. **Error State Management:**
   - Errors stored in component state: `const [err, setErr] = useState("")`
   - Errors displayed via `ErrorMsg` component: `src/App.jsx` lines 356-363
   - Messages cleared on retry: `setErr("")`

3. **API Error Handling:**
   - HTTP errors checked with `if (!res.ok)` before parsing JSON
   - Console warnings for non-critical failures: `console.warn("Cache full, clearing...")`
   - Errors logged to console: `console.error("Claude proxy error:", res.status, err)`

4. **Silent Failures:**
   - Audio context failures caught and ignored: `catch(e) { /* Audio not available */ }`
   - Share API fallback to download if not supported

## Logging

**Framework:** `console` object only

**Patterns:**
- `console.warn()` for warnings: cache cleanup notifications
- `console.error()` for errors: API failures, proxy issues
- No structured logging or log levels
- Minimal logging — mostly for debugging/troubleshooting

**Examples from codebase:**
```javascript
console.warn("Cache full, clearing old translations");
console.error("Claude proxy error:", res.status, err);
```

## Comments

**When to Comment:**
- Section headers for major code blocks (e.g., `// AI FLUENT — SUMMIT EDITION v2`)
- Functional grouping comments (e.g., `// THEME SYSTEM`, `// AUTH`, `// WORLD MAP`)
- Complex logic explanations
- No JSDoc comments used

**JSDoc/TSDoc:**
- Not used in this codebase
- Comments are inline and descriptive

**Comment Style:**
- Single-line comments with `//` for section markers
- All caps for major sections: `// MOBILE DETECTION`, `// LANGUAGE SYSTEM`

## Function Design

**Size:**
- Functions vary widely: from 3-line helpers to 100+ line components
- Component functions can exceed 200 lines (e.g., `WorldMap`)
- Helper functions kept compact: `locName()`, `locSub()` are 1 line

**Parameters:**
- Destructuring preferred for component props
- Multiple parameters in objects for flexibility
- Default parameters used: `const Icon = ({type, size=24, color="#D4A55A"})`
- Callback pattern common: `onChangeLang`, `onToggleTheme`, `onOpenLoc`

**Return Values:**
- Components return JSX directly (no intermediate variables)
- Helper functions return data structures or strings
- Callbacks return promises or void
- No explicit return statements in arrow functions when single expression

## Module Design

**Exports:**
- All exports are named imports from module
- Main export: `export const db = { ... }` in `supabase.js`
- No default exports in utility modules

**Barrel Files:**
- Not used — no index files with re-exports
- Direct imports from source files

**Pattern in `src/lib/supabase.js`:**
```javascript
export const db = {
  async signUp(email, pass) { ... },
  async signIn(email, pass) { ... },
  // ... other methods
}
```

## State Management

**Local Component State:**
- `useState` for all component-level state
- Pattern: `const [state, setState] = useState(initialValue)`
- Multiple state variables when needed

**Global State Approximation:**
- Top-level variables for theme: `let C = {...THEMES[_theme]}`
- Global utility objects: `Streak`, `TCache`
- localStorage for persistence

**Example:**
```javascript
let _theme = localStorage.getItem("ai_fluent_theme") || "dark";
let C = {...THEMES[_theme]};
const setTheme = (t) => { _theme = t; C = {...THEMES[t]}; ... };
```

## Object Patterns

**Configuration Objects:**
- Large data constants (THEMES, LESSONS, ACHIEVEMENTS) defined at module level
- Nested structures for organization (e.g., `LESSONS.basics`, `TOOLS[0].steps`)
- Spread operator used for merging: `{...THEMES[_theme]}`

**Data Access:**
- Methods in objects: `db.signUp()`, `Streak.check()`
- Properties accessed with dot notation: `C.bgDark`, `profile?.display_name`
- Optional chaining for safety: `profile?.current_streak`

## Inline Styles

**Convention:**
- Inline `style={{}}` objects used exclusively
- No CSS classes (except animation delay classes: `.s1`, `.s2`, etc.)
- Colors from theme object: `C.text`, `C.gold`, `C.bgCard`
- Units in pixels

**Example:**
```javascript
style={{
  background: C.bgCard,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: 16,
  color: C.text
}}
```

---

*Convention analysis: 2026-04-16*
