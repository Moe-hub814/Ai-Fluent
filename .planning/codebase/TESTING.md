# Testing Patterns

**Analysis Date:** 2026-04-16

## Test Framework

**Status:** No test framework detected in codebase

**Runner:**
- Not installed — no test runner dependency in `package.json`
- No Jest, Vitest, Mocha, or other test framework configured
- No test files found in source tree

**Assertion Library:**
- Not used — no testing infrastructure present

**Build Configuration:**
- `vite.config.js` is minimal — only React plugin configured
- No test configuration or preprocessors

## Test File Organization

**Location:**
- No test files exist in this codebase
- No `__tests__`, `tests/`, or `.test.` / `.spec.` file patterns found
- No separate test directory structure

**Naming:**
- Would follow convention: `[ComponentName].test.jsx` or `[module].spec.js` if present

## Development Testing Strategy

**Manual Testing Approach:**

The codebase uses manual testing through browser interaction:

1. **Dev Server:**
   - `npm run dev` via Vite development server
   - Hot module replacement enabled by default
   - Real-time feedback in browser

2. **Local Storage Testing:**
   - Persistent state via `localStorage` (theme, language, progress, streak)
   - Testable by opening DevTools Console: `localStorage.getItem("ai_fluent_...")`
   - Can be cleared in DevTools → Application → Storage

3. **Visual/UI Testing:**
   - Component rendering verified visually in browser
   - Multiple themes testable: dark/light mode toggle in UI
   - Multiple languages testable: language selector in UI
   - Responsive design testable by resizing browser window

4. **API Testing:**
   - Supabase integration tested via real API calls to `jedeqqkrmgsemnnmufjo.supabase.co`
   - Claude proxy tested via POST to `/functions/v1/claude-proxy` edge function
   - Errors can be inspected in Network tab of DevTools

## Test Patterns (If Testing Were to Be Added)

**Unit Test Pattern (Proposed):**

For utility functions like `Streak` system, tests would follow this pattern:

```javascript
// Example: Streak.test.js
describe('Streak', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('recordActivity increments streak on consecutive days', () => {
    const day1 = Streak.recordActivity();
    expect(day1.current).toBe(1);
    
    // Simulate next day
    localStorage.setItem('ai_fluent_streak', JSON.stringify({
      lastActive: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      current: 1
    }));
    const day2 = Streak.recordActivity();
    expect(day2.current).toBe(2);
  });

  test('check() returns zeros when streak is lost without freeze', () => {
    // Set lastActive to 2 days ago
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().slice(0, 10);
    localStorage.setItem('ai_fluent_streak', JSON.stringify({
      lastActive: twoDaysAgo,
      current: 5,
      freezes: 0
    }));
    
    const result = Streak.check();
    expect(result.current).toBe(0);
  });
});
```

**Component Test Pattern (Proposed):**

For React components, tests would mock state and user interactions:

```javascript
// Example: AuthScreen.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthScreen } from './App';

describe('AuthScreen', () => {
  test('shows error when email/password empty', async () => {
    render(<AuthScreen />);
    const button = screen.getByText('Start Climbing');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Please fill in both fields')).toBeInTheDocument();
    });
  });

  test('switches between signin and signup modes', () => {
    render(<AuthScreen />);
    const signupBtn = screen.getByText('Sign Up');
    fireEvent.click(signupBtn);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });
});
```

**Integration Test Pattern (Proposed):**

For Supabase interactions, tests would mock the API:

```javascript
// Example: db.test.js
import { db } from './lib/supabase';
import * as supabaseModule from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('Database Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('signUp calls supabase auth with email and password', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({ error: null });
    supabaseModule.createClient.mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    await db.signUp('test@example.com', 'password123');
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  test('getProfile returns empty object on not found', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null })
      })
    });
    supabaseModule.createClient.mockReturnValue({
      from: jest.fn().mockReturnValue({ select: mockSelect })
    });

    const result = await db.getProfile('user123');
    expect(result).toEqual({});
  });
});
```

## Mocking Strategy (If Testing Were to Be Added)

**Framework:** Would use Jest for unit/component tests, React Testing Library for UI

**Patterns:**

1. **localStorage Mock:**
   ```javascript
   const localStorageMock = {
     getItem: jest.fn(),
     setItem: jest.fn(),
     removeItem: jest.fn(),
     clear: jest.fn(),
   };
   global.localStorage = localStorageMock;
   ```

2. **Supabase Mock:**
   ```javascript
   jest.mock('@supabase/supabase-js');
   const mockSupabase = {
     auth: { signUp: jest.fn(), signIn: jest.fn(), signOut: jest.fn() },
     from: jest.fn().mockReturnValue({
       select: jest.fn().mockReturnValue({
         eq: jest.fn().mockReturnValue({ single: jest.fn() })
       })
     })
   };
   ```

3. **Web Audio API Mock:**
   ```javascript
   window.AudioContext = jest.fn(() => ({
     createOscillator: jest.fn().mockReturnValue({
       connect: jest.fn(),
       start: jest.fn(),
       stop: jest.fn(),
       frequency: { value: 0 }
     }),
     createGain: jest.fn(),
     currentTime: 0,
     destination: {}
   }));
   ```

**What to Mock:**
- External API calls (Supabase)
- Browser APIs (localStorage, AudioContext, navigator.share)
- Date/time for testing streak logic
- fetch() calls for edge functions

**What NOT to Mock:**
- React hooks (useState, useEffect, useRef, useCallback)
- Component rendering logic
- Theme/language switching logic
- Style calculation functions
- Utility functions like `locName()`, `locSub()`

## Test Coverage Gaps

**Untested Areas:**

1. **Audio System (SFX):**
   - File: `src/App.jsx` lines 246-273
   - What's not tested: Sound generation, frequency calculations, timing
   - Risk: Audio effects fail silently; users don't hear feedback sounds
   - Priority: Low (graceful degradation with try-catch)

2. **Supabase Integration:**
   - File: `src/lib/supabase.js`
   - What's not tested: All database operations, auth flows, error handling
   - Risk: Data corruption, auth bypasses, missing error messages
   - Priority: High (core business logic)

3. **Share Functionality:**
   - File: `src/App.jsx` lines 600-609 (ShareCard component)
   - What's not tested: Canvas rendering, blob conversion, navigator.share API
   - Risk: Share buttons fail, images don't generate correctly
   - Priority: Medium (user-facing feature)

4. **Streak Logic:**
   - File: `src/App.jsx` lines 366-426 (Streak object)
   - What's not tested: Date calculations, freeze mechanics, calendar generation
   - Risk: Streaks calculated incorrectly, freezes don't work, calendar displays wrong
   - Priority: High (core gamification)

5. **Translation/Localization:**
   - File: `src/App.jsx` lines 107-113 (TCache)
   - What's not tested: Cache persistence, JSON parsing, fallback logic
   - Risk: Translations fail to load, cache fills up, wrong language displayed
   - Priority: Medium (affects multiple languages)

6. **Lesson/Content Rendering:**
   - File: `src/App.jsx` lines 159-194 (LESSONS constant)
   - What's not tested: Section rendering, practice questions, explanations
   - Risk: Content fails to display, questions not interactive, hints don't appear
   - Priority: High (core learning experience)

7. **Theme Switching:**
   - File: `src/App.jsx` lines 8-47 (THEMES, setTheme)
   - What's not tested: Theme persistence, color application, RTL switching
   - Risk: Theme doesn't save, colors incorrect, RTL layout breaks
   - Priority: Medium (visual presentation)

8. **Component Integration:**
   - File: `src/App.jsx` (main component - 1643 lines)
   - What's not tested: Page transitions, event handlers, state flow between components
   - Risk: Pages don't route correctly, buttons don't work, data doesn't update
   - Priority: Critical (entire app flow)

## Recommended Testing Setup

**If testing were to be implemented:**

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  jest \
  jest-environment-jsdom \
  @babel/preset-react
```

**jest.config.js (would be created):**
```javascript
export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  moduleFileExtensions: ['js', 'jsx'],
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { presets: ['@babel/preset-react'] }],
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/main.jsx',
  ],
};
```

**Coverage Target (if enforced):** None currently — no coverage requirements exist

---

*Testing analysis: 2026-04-16*
