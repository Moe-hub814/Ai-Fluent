<!-- GSD:project-start source:PROJECT.md -->
## Project

**Lumicamp — Google Play Launch**

Lumicamp is a mobile AI literacy learning app — "Duolingo for AI." Users climb a mountain-themed progression system with 7 location nodes, guided by a companion character named Lumi. The app is fully built and functional, with daily challenges, live AI news via Claude web search, 6 guided AI tools, practice mode with altitude ratings, streak tracking, and full i18n (English/Arabic/French). This project covers shipping the existing app to Google Play.

**Core Value:** Users can learn AI concepts through daily structured lessons, practice on real AI tools, and track their progress — all on mobile, in their language.

### Constraints

- **Tech stack**: React + Vite + Capacitor — no framework changes
- **JDK**: Must use JDK 21 for Gradle compatibility in Android release build
- **Android only**: Google Play target, no iOS work this milestone
- **Single-file constraint**: App.jsx is ~1565 lines monolith — layout fixes must be surgical, not refactors
- **Keystore security**: Generated keystore must be backed up safely — losing it means losing ability to update the app forever
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (ES2020+) - Application code in `src/`
- JSX - React components in `src/App.jsx`
- TypeScript - Edge functions in `supabase/functions/claude-proxy/index.ts`
## Runtime
- Node.js - Local development and build
- Deno - Supabase Edge Functions runtime for `claude-proxy` function
- npm (7.x or later)
- Lockfile: `package-lock.json` present
## Frameworks
- React 19.2.0 - UI framework in `src/App.jsx`
- Vite 7.3.1 - Build tool and dev server, configured in `vite.config.js`
- Capacitor 8.3.0 - Cross-platform app framework with Android support
- Not detected in current configuration
- @vitejs/plugin-react 5.1.1 - Fast Refresh support for React in Vite
- ESLint 9.39.1 - Code linting configured in `eslint.config.js`
## Key Dependencies
- @supabase/supabase-js 2.100.0 - Supabase client SDK for authentication and database operations
- React 19.2.0 - User interface rendering
- React DOM 19.2.0 - DOM rendering for React components
## Configuration
- Supabase credentials embedded in `src/lib/supabase.js` (publishable key, not secret)
- Edge function environment variables:
- `vite.config.js` - Vite build configuration with React plugin
- `eslint.config.js` - ESLint configuration with recommended rules, React hooks plugin, and React Refresh plugin
- `capacitor.config.json` - Capacitor app metadata:
## Platform Requirements
- Node.js (latest LTS or matching `.npmrc`)
- npm or compatible package manager
- ESLint compatible IDE/editor
- Web: Deployed to Supabase (static hosting from `dist/`)
- Mobile: Android app built with Capacitor from `android/` directory
- Edge Functions: Supabase Edge Functions runtime (Deno-based) for `claude-proxy`
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase in JSX format (e.g., `App.jsx`, `ShareCard`)
- Regular modules: lowercase with hyphens (e.g., `supabase.js`)
- CSS: inline styles preferred over separate files
- Regular functions and handlers: camelCase (e.g., `recordActivity()`, `getCalendar()`)
- Component functions: PascalCase (e.g., `AuthScreen`, `WorldMap`, `ErrorMsg`)
- Helper functions: camelCase (e.g., `locName()`, `lessonTitle()`)
- Callback functions: camelCase with `on` prefix (e.g., `onOpenLoc`, `onToggleTheme`)
- State: camelCase (e.g., `email`, `loading`, `err`)
- Constants: UPPER_SNAKE_CASE (e.g., `THEMES`, `LANGUAGES`, `DAILY_CHALLENGES`)
- Private/internal: underscore prefix (e.g., `_key`, `_isNative`, `_lang`)
- Object properties and keys: camelCase (e.g., `stopColor`, `fontFamily`)
- Data structures: lowercase descriptive names (e.g., `profile`, `progress`, `data`)
- Configuration objects: UPPER_SNAKE_CASE (e.g., `THEMES`, `LANGS`, `LOCS`)
- Enum-like objects: UPPER_SNAKE_CASE with descriptive keys (e.g., `ACHIEVEMENTS`, `TOOLS`)
## Code Style
- No external formatter detected (no Prettier config)
- Inline styles dominate — `style={}` prop usage throughout
- CSS inserted via `getCss()` function that returns template literal
- Semicolons: consistently used
- Spaces around operators and after keywords
- ESLint with React hooks and refresh plugins
- Config: `eslint.config.js` (flat config format)
- Key rule: `no-unused-vars` with pattern `^[A-Z_]` (allows unused uppercase variables like component props)
- Enforces React hooks rules and refresh functionality
- No strict enforcement observed
- Long property assignments common: `onClick={()=>setStep(step+1)}` on same line
- Complex objects inlined in JSX props
## Import Organization
- Not used — all imports are relative paths
- Examples from `src/App.jsx`:
## Error Handling
## Logging
- `console.warn()` for warnings: cache cleanup notifications
- `console.error()` for errors: API failures, proxy issues
- No structured logging or log levels
- Minimal logging — mostly for debugging/troubleshooting
## Comments
- Section headers for major code blocks (e.g., `// LUMICAMP — SUMMIT EDITION v2`)
- Functional grouping comments (e.g., `// THEME SYSTEM`, `// AUTH`, `// WORLD MAP`)
- Complex logic explanations
- No JSDoc comments used
- Not used in this codebase
- Comments are inline and descriptive
- Single-line comments with `//` for section markers
- All caps for major sections: `// MOBILE DETECTION`, `// LANGUAGE SYSTEM`
## Function Design
- Functions vary widely: from 3-line helpers to 100+ line components
- Component functions can exceed 200 lines (e.g., `WorldMap`)
- Helper functions kept compact: `locName()`, `locSub()` are 1 line
- Destructuring preferred for component props
- Multiple parameters in objects for flexibility
- Default parameters used: `const Icon = ({type, size=24, color="#D4A55A"})`
- Callback pattern common: `onChangeLang`, `onToggleTheme`, `onOpenLoc`
- Components return JSX directly (no intermediate variables)
- Helper functions return data structures or strings
- Callbacks return promises or void
- No explicit return statements in arrow functions when single expression
## Module Design
- All exports are named imports from module
- Main export: `export const db = { ... }` in `supabase.js`
- No default exports in utility modules
- Not used — no index files with re-exports
- Direct imports from source files
## State Management
- `useState` for all component-level state
- Pattern: `const [state, setState] = useState(initialValue)`
- Multiple state variables when needed
- Top-level variables for theme: `let C = {...THEMES[_theme]}`
- Global utility objects: `Streak`, `TCache`
- localStorage for persistence
## Object Patterns
- Large data constants (THEMES, LESSONS, ACHIEVEMENTS) defined at module level
- Nested structures for organization (e.g., `LESSONS.basics`, `TOOLS[0].steps`)
- Spread operator used for merging: `{...THEMES[_theme]}`
- Methods in objects: `db.signUp()`, `Streak.check()`
- Properties accessed with dot notation: `C.bgDark`, `profile?.display_name`
- Optional chaining for safety: `profile?.current_streak`
## Inline Styles
- Inline `style={{}}` objects used exclusively
- No CSS classes (except animation delay classes: `.s1`, `.s2`, etc.)
- Colors from theme object: `C.text`, `C.gold`, `C.bgCard`
- Units in pixels
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Monolithic frontend (all code in single `App.jsx` file)
- Local-first state management with localStorage for persistence
- Backend API integration via Supabase for auth and data
- Mobile-native support via Capacitor/Android
- Theme and language system baked into core state
## Layers
- Purpose: Render UI components and handle user interactions
- Location: `src/App.jsx` (entire UI implementation)
- Contains: React components, styling, SVG icons, animations
- Depends on: React, Theme constants (C), Language constants (T)
- Used by: Main entry point at `src/main.jsx`
- Purpose: Manage application state and persistence
- Location: `src/App.jsx` (useState hooks, localStorage via custom managers)
- Contains: User auth state, profile, progress, theme, language, streak tracking
- Depends on: localStorage API, React hooks
- Used by: All components throughout the app
- Purpose: Handle API communication and data persistence
- Location: `src/lib/supabase.js`
- Contains: Supabase client initialization, auth methods, database CRUD operations, Claude API proxy
- Depends on: `@supabase/supabase-js`, Supabase Edge Functions
- Used by: App authentication, profile fetching, progress tracking
- Purpose: Define constants, translations, and static data structures
- Location: `src/App.jsx` (lines 1-200+)
- Contains: THEMES, LANGS, UI translations, LESSONS content, TOOLS definitions, LOCATIONS, ACHIEVEMENTS
- Depends on: None
- Used by: All components for content and styling
## Data Flow
- **Authentication:** Managed by Supabase auth listener in `useEffect`
- **Profile & Progress:** React state (`user`, `profile`, `progress`) synced from Supabase
- **UI Navigation:** Screen state via `setScreen()` (map, location, news, tools, challenge, achievements, profile)
- **Theme & Language:** Persisted in localStorage, reactive through state
- **Streak System:** Custom manager `Streak` with localStorage, calculated fresh each session
- **Lessons Content:** Static constants in code, not fetched from backend
## Key Abstractions
- Purpose: Define a learning unit with content, questions, and practice problems
- Examples: `LESSONS.basics[0]` (first lesson in Basics path)
- Pattern: `{title, sections: [{h, body}], questions: [], practice: [{type, q, opts?, correct?, explain}]}`
- Accessed in: `LocView` component to render content and grade answers
- Purpose: Organize lessons into 7 learning paths (Base Camp → Summit)
- Examples: `LOCS` array defines Base Camp, Forest Lodge, Artist's Outlook, etc.
- Pattern: `{id, name, icon, desc, color, lessons: count, sub}`
- Used by: `WorldMap` for navigation, progress bars in profile
- Purpose: Guided step-by-step workflows that call Claude API
- Examples: Email Writer, Prompt Builder, Social Post Writer (6 total in `TOOLS`)
- Pattern: `{id, name, desc, steps: [{q, opts?, free}], sys: systemPrompt}`
- Flow: `ToolsView` → user answers questions → build prompt → `db.callClaude()` → render response
- Purpose: Define milestones and how to unlock them
- Examples: `{id, name, desc, icon, condition: (progress, profile) => boolean}`
- Pattern: Dynamically evaluate against user's progress array and profile stats
- Used by: Achievement badge display and milestone celebration modals
- Purpose: Track daily activity, calculate consecutive days, manage freeze tokens
- Examples: `Streak.check()`, `Streak.recordActivity()`, `Streak.getCalendar()`
- Pattern: Custom manager with localStorage persistence, handles date math for streak logic
- Used by: Profile view calendar, stat displays, dailyNotification
## Entry Points
- Location: `src/main.jsx`
- Triggers: Page load
- Responsibilities: Mount React app to DOM root, render `Lumicamp` main component
- Location: `src/App.jsx` (exported as `Lumicamp`)
- Triggers: React initialization
- Responsibilities: Initialize auth, manage app-level state, route between screens, handle theme/language
- Pattern: Conditional rendering based on `screen` state variable
- Screens: map (default), location, news, tools, challenge, achievements, profile
- Loading: Shows `AuthScreen` if no user, `Onboarding` if new user, `Tutorial` if first-time, `WorldMap` as default
- Location: `src/lib/supabase.js`
- Exported as: `db` object (singleton)
- Methods: `signUp()`, `signIn()`, `signOut()`, `getSession()`, `getProfile()`, `updateProfile()`, `getProgress()`, `completeLesson()`, `callClaude()`, `onAuth()`
## Error Handling
- **Network Errors:** Try-catch in async operations, log to console, show `ErrorMsg` component with retry button
- **Profile/Progress Load Failures:** Caught in init effect, set to empty object/array, app continues with defaults
- **API Failures:** Error caught in `callClaude()`, thrown to UI component which displays via `ErrorMsg`
- **Loading Timeout:** 5-second failsafe in init effect forces app to sign-in screen if stuck
- **Audio Errors:** SFX system has try-catch wrapper, silent fail if Web Audio API unavailable
- `Skeleton` component for loading states
- `ErrorMsg` component for failures with retry options
- Validation messages in forms (sign-in errors, etc.)
- Toast-like responses from Claude API in tool views
## Cross-Cutting Concerns
- Form validation in `AuthScreen` for email/password
- Practice answer validation against correct answer in lesson
- Profile completeness check in `Onboarding`
- Supabase session-based auth with auto-refresh
- Token persisted in browser sessionStorage (Supabase default)
- `onAuth()` listener maintains sync across tabs
- Language stored in localStorage as `lumicamp_lang`
- Translations defined in constants (UI, LESSON_TITLES, LOC_NAMES, etc.)
- `setLang()` updates global `_lang` variable and `T` translation object
- HTML lang and dir attributes updated for RTL support
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
