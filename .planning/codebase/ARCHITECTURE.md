# Architecture

**Analysis Date:** 2026-04-16

## Pattern Overview

**Overall:** Single-Page Application (SPA) with component-driven architecture built on React and Vite

**Key Characteristics:**
- Monolithic frontend (all code in single `App.jsx` file)
- Local-first state management with localStorage for persistence
- Backend API integration via Supabase for auth and data
- Mobile-native support via Capacitor/Android
- Theme and language system baked into core state

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle user interactions
- Location: `src/App.jsx` (entire UI implementation)
- Contains: React components, styling, SVG icons, animations
- Depends on: React, Theme constants (C), Language constants (T)
- Used by: Main entry point at `src/main.jsx`

**State Management Layer:**
- Purpose: Manage application state and persistence
- Location: `src/App.jsx` (useState hooks, localStorage via custom managers)
- Contains: User auth state, profile, progress, theme, language, streak tracking
- Depends on: localStorage API, React hooks
- Used by: All components throughout the app

**Data Layer:**
- Purpose: Handle API communication and data persistence
- Location: `src/lib/supabase.js`
- Contains: Supabase client initialization, auth methods, database CRUD operations, Claude API proxy
- Depends on: `@supabase/supabase-js`, Supabase Edge Functions
- Used by: App authentication, profile fetching, progress tracking

**Configuration Layer:**
- Purpose: Define constants, translations, and static data structures
- Location: `src/App.jsx` (lines 1-200+)
- Contains: THEMES, LANGS, UI translations, LESSONS content, TOOLS definitions, LOCATIONS, ACHIEVEMENTS
- Depends on: None
- Used by: All components for content and styling

## Data Flow

**Authentication Flow:**

1. User visits app → Check if session exists via `db.getSession()`
2. If no session → Render `AuthScreen` (sign-in/sign-up)
3. User submits credentials → `db.signUp()` or `db.signIn()`
4. Supabase returns session + user object
5. Trigger `onAuth` listener → fetch profile + progress
6. Check if user is onboarded → show `Onboarding` screen or continue
7. First-time users see `Tutorial` screen
8. User state updated, main `WorldMap` renders

**Lesson Completion Flow:**

1. User selects lesson → `LocView` renders with lesson content
2. User reads content and practices → answers questions
3. Submit practice → score calculated against `practice` array in lesson definition
4. If score ≥ 70% → Rating (Summit/Ridge/Treeline/Base Camp) assigned
5. `completeLesson()` called → Supabase upsert to `user_progress` table
6. Activity recorded via `record_activity()` RPC for streak
7. Progress refreshed → `MilestoneCheck` evaluates achievements
8. User returns to map with updated progress

**State Synchronization:**

1. User makes change (complete lesson, use streak freeze, etc.)
2. Change persisted to Supabase via `db.completeLesson()` or `updateProfile()`
3. `refresh()` function called → refetch profile and progress from DB
4. Local state updated → React re-renders affected components
5. All other screens automatically reflect new state

**State Management:**

- **Authentication:** Managed by Supabase auth listener in `useEffect`
- **Profile & Progress:** React state (`user`, `profile`, `progress`) synced from Supabase
- **UI Navigation:** Screen state via `setScreen()` (map, location, news, tools, challenge, achievements, profile)
- **Theme & Language:** Persisted in localStorage, reactive through state
- **Streak System:** Custom manager `Streak` with localStorage, calculated fresh each session
- **Lessons Content:** Static constants in code, not fetched from backend

## Key Abstractions

**Lesson Structure:**
- Purpose: Define a learning unit with content, questions, and practice problems
- Examples: `LESSONS.basics[0]` (first lesson in Basics path)
- Pattern: `{title, sections: [{h, body}], questions: [], practice: [{type, q, opts?, correct?, explain}]}`
- Accessed in: `LocView` component to render content and grade answers

**Location/Path System:**
- Purpose: Organize lessons into 7 learning paths (Base Camp → Summit)
- Examples: `LOCS` array defines Base Camp, Forest Lodge, Artist's Outlook, etc.
- Pattern: `{id, name, icon, desc, color, lessons: count, sub}`
- Used by: `WorldMap` for navigation, progress bars in profile

**Tool Templates:**
- Purpose: Guided step-by-step workflows that call Claude API
- Examples: Email Writer, Prompt Builder, Social Post Writer (6 total in `TOOLS`)
- Pattern: `{id, name, desc, steps: [{q, opts?, free}], sys: systemPrompt}`
- Flow: `ToolsView` → user answers questions → build prompt → `db.callClaude()` → render response

**Achievement Condition System:**
- Purpose: Define milestones and how to unlock them
- Examples: `{id, name, desc, icon, condition: (progress, profile) => boolean}`
- Pattern: Dynamically evaluate against user's progress array and profile stats
- Used by: Achievement badge display and milestone celebration modals

**Streak Management:**
- Purpose: Track daily activity, calculate consecutive days, manage freeze tokens
- Examples: `Streak.check()`, `Streak.recordActivity()`, `Streak.getCalendar()`
- Pattern: Custom manager with localStorage persistence, handles date math for streak logic
- Used by: Profile view calendar, stat displays, dailyNotification

## Entry Points

**Main Application Entry:**
- Location: `src/main.jsx`
- Triggers: Page load
- Responsibilities: Mount React app to DOM root, render `AIFluent` main component

**Primary Component:**
- Location: `src/App.jsx` (exported as `AIFluent`)
- Triggers: React initialization
- Responsibilities: Initialize auth, manage app-level state, route between screens, handle theme/language

**Screen Router:**
- Pattern: Conditional rendering based on `screen` state variable
- Screens: map (default), location, news, tools, challenge, achievements, profile
- Loading: Shows `AuthScreen` if no user, `Onboarding` if new user, `Tutorial` if first-time, `WorldMap` as default

**API Gateway:**
- Location: `src/lib/supabase.js`
- Exported as: `db` object (singleton)
- Methods: `signUp()`, `signIn()`, `signOut()`, `getSession()`, `getProfile()`, `updateProfile()`, `getProgress()`, `completeLesson()`, `callClaude()`, `onAuth()`

## Error Handling

**Strategy:** Graceful degradation with fallback values and user-visible error messages

**Patterns:**

- **Network Errors:** Try-catch in async operations, log to console, show `ErrorMsg` component with retry button
- **Profile/Progress Load Failures:** Caught in init effect, set to empty object/array, app continues with defaults
- **API Failures:** Error caught in `callClaude()`, thrown to UI component which displays via `ErrorMsg`
- **Loading Timeout:** 5-second failsafe in init effect forces app to sign-in screen if stuck
- **Audio Errors:** SFX system has try-catch wrapper, silent fail if Web Audio API unavailable

**User Feedback:**
- `Skeleton` component for loading states
- `ErrorMsg` component for failures with retry options
- Validation messages in forms (sign-in errors, etc.)
- Toast-like responses from Claude API in tool views

## Cross-Cutting Concerns

**Logging:** Basic `console.warn()` and `console.error()` for debugging, no structured logging framework

**Validation:** 
- Form validation in `AuthScreen` for email/password
- Practice answer validation against correct answer in lesson
- Profile completeness check in `Onboarding`

**Authentication:**
- Supabase session-based auth with auto-refresh
- Token persisted in browser sessionStorage (Supabase default)
- `onAuth()` listener maintains sync across tabs

**Internationalization:**
- Language stored in localStorage as `ai_fluent_lang`
- Translations defined in constants (UI, LESSON_TITLES, LOC_NAMES, etc.)
- `setLang()` updates global `_lang` variable and `T` translation object
- HTML lang and dir attributes updated for RTL support

**Styling:** Inline CSS-in-JS throughout (no external CSS file except shared fonts and base styles)

---

*Architecture analysis: 2026-04-16*
