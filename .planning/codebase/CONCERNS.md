# Codebase Concerns

**Analysis Date:** 2026-04-16

## Tech Debt

**Monolithic Component Structure:**
- Issue: Entire application logic (1565 lines) concentrated in single `src/App.jsx` file with all routes, views, and state management in one component
- Files: `src/App.jsx`
- Impact: Extremely difficult to test individual features, impossible to lazy-load components, poor code organization makes adding features risky, maintenance nightmare as codebase grows
- Fix approach: Extract views into separate components (LocView, NewsView, ToolsView, ChallengeView, AchievementsView, ProfileView) into their own files; move shared utilities and data structures into separate modules; use React Context or state management library for cross-component state

**Hardcoded Credentials in Source Code:**
- Issue: Supabase public key and URL are hardcoded in `src/lib/supabase.js` (lines 4-5)
- Files: `src/lib/supabase.js` (lines 4-5)
- Impact: Credentials are visible in git history and built binaries; credentials exposed to users in client bundle; if key is revoked, requires code rebuild
- Fix approach: Move to environment variables using `import.meta.env.VITE_*`; ensure `.env.local` is in `.gitignore` (verify it's ignored); document environment setup in README

**Global State Mutations:**
- Issue: Theme and language state mutate global variables (`C`, `T`, `_theme`, `_lang`) outside React state system (lines 44-46, 61-62, 103)
- Files: `src/App.jsx` (lines 44-46, 61-62, 103)
- Impact: Side effects are unpredictable; component re-renders don't reliably sync with theme/language changes; switching theme/language can leave UI in inconsistent state
- Fix approach: Move all theme/language state to React Context; remove global object mutations; use useContext hook throughout

**Inconsistent Error Handling:**
- Issue: Mix of try-catch blocks, silent failures with console.warn, and no error recovery (lines 110-112, 368, 949, 970, 992, 1050, 1227)
- Files: `src/App.jsx`, `src/lib/supabase.js`
- Impact: Some errors silently fail while others show user-facing messages; no consistent error logging; some failures are swallowed making debugging difficult
- Fix approach: Create centralized error handler; establish consistent error reporting strategy; implement proper error boundaries

**Race Conditions in useEffect:**
- Issue: Multiple async operations in useEffect without proper cleanup or race condition handling (lines 1512-1529)
- Files: `src/App.jsx` (lines 1512-1529)
- Impact: If user logs out while profile/progress is loading, stale updates could overwrite empty state; loading timeout doesn't prevent subsequent updates
- Fix approach: Add abort signal for fetch/async operations; track mounted state with useRef; use dependency array correctly

**No Input Validation:**
- Issue: Email/password signup and user input for free-response answers have minimal validation
- Files: `src/App.jsx` (line 668)
- Impact: Could allow invalid data to be submitted to API; free-response grading could send empty strings; no client-side protection against malformed requests
- Fix approach: Add validation functions for all user inputs; validate before API calls; show validation errors to user

## Known Bugs

**Loading Timeout Forced UI State:**
- Symptoms: If Supabase takes more than 5 seconds to respond, user is forcibly shown sign-in screen even if still loading; no way to recover
- Files: `src/App.jsx` (line 1514)
- Trigger: Slow network or Supabase service delays
- Workaround: Refresh page or wait and try again; timeout is hardcoded to 5 seconds

**In-Memory Rate Limiter Resets on Deploy:**
- Symptoms: Rate limiting in Claude proxy is cleared whenever the edge function is redeployed, temporarily allowing more requests than intended
- Files: `supabase/functions/claude-proxy/index.ts` (line 6-9)
- Trigger: Deploy edge function or restart Deno runtime
- Workaround: Use Supabase rate limiting on edge functions instead of in-memory solution

**Lesson Translation Cache Can Fill localStorage:**
- Symptoms: Translation cache can exceed localStorage quota; when full, entire cache is deleted without recovering previously cached translations
- Files: `src/App.jsx` (line 112)
- Trigger: Using app in multiple languages with large lessons
- Workaround: Clear browser storage; translations must be re-fetched (will need more storage quota)

**Fallback to English When Translation Fails:**
- Symptoms: If Claude translation request fails, lesson displays in English with no indication to user that translation was attempted
- Files: `src/App.jsx` (lines 949, 951)
- Trigger: Network error or Claude proxy failure during lesson load
- Workaround: User must refresh; if problem persists, content stays in English

**Navigation State Not Preserved:**
- Symptoms: When user navigates away from a lesson with partial progress and returns, all progress in practice questions is lost
- Files: `src/App.jsx` (line 996 - resetPractice called on navigation)
- Trigger: Navigate to map/other views then back to lesson
- Workaround: Complete lesson fully before navigating; if interrupted, restart from beginning

## Security Considerations

**API Key Exposed in Published Bundle:**
- Risk: Supabase `VITE_SUPABASE_KEY` (publishable key) is intentionally public but embedded in built JS, viewable in browser DevTools and can be extracted from APK
- Files: `src/lib/supabase.js` (line 5), `supabase/functions/claude-proxy/index.ts` (line 4)
- Current mitigation: Edge function validates API key match before processing Claude requests; relies on Supabase row-level security for data access
- Recommendations: Verify Supabase RLS policies are properly configured and tested; add request signing if additional security needed; monitor for API key abuse patterns

**Claude Proxy API Key in Environment:**
- Risk: `ANTHROPIC_API_KEY` used by edge function could be leaked if logs are exposed
- Files: `supabase/functions/claude-proxy/index.ts` (line 3)
- Current mitigation: Stored as Supabase edge function secret
- Recommendations: Verify logs don't include sensitive headers; add request signing; implement IP allowlisting if possible; monitor API usage

**No CSRF Protection:**
- Risk: No CSRF tokens on state-changing operations (lesson completion, profile updates)
- Files: `src/App.jsx`, `src/lib/supabase.js`
- Current mitigation: POST requests from same origin only (Capacitor app or localhost)
- Recommendations: Verify Supabase enforces session validation; consider adding nonce-based CSRF tokens for browser deployment

**User Input in Claude Prompts:**
- Risk: Free-response lesson answers and user questions are directly interpolated into Claude system prompts without sanitization
- Files: `src/App.jsx` (lines 968, 1179, 1274)
- Current mitigation: Claude has guardrails; max token limits prevent huge inputs
- Recommendations: Add input length validation; sanitize special characters; implement prompt injection testing

## Performance Bottlenecks

**Large SVG Rendering in Loop:**
- Problem: Each lesson, practice question, and UI element renders custom SVG icons and components; Lumi character (SVG) re-renders on every state change
- Files: `src/App.jsx` (lines 133-147, custom Icon, Lumi, LumiReaction)
- Cause: No memoization of icon/Lumi components; SVG calculations happen on every render
- Improvement path: Memoize Lumi and Icon components with React.memo(); consider converting to PNG assets for static icons; use requestAnimationFrame for animations instead of CSS transitions

**Full Layout Re-render on Theme/Language Change:**
- Problem: Changing theme or language re-renders entire app tree (1565 lines) with new color values
- Files: `src/App.jsx` (lines 44-46, 1508-1510)
- Cause: Global object mutations trigger re-renders; no selective re-rendering by component
- Improvement path: Implement React Context for theme/language; wrap consumers in Consumer or useContext; only children that use theme values re-render

**Translation Network Request on Every Lesson Load:**
- Problem: Non-English lessons fetch translations from Claude every time they're opened, even if already cached
- Files: `src/App.jsx` (lines 920-951)
- Cause: useEffect checks cache but can be slow; no persistent cache across page reloads (depends on localStorage)
- Improvement path: Use service workers for offline cache; implement persistent IndexedDB cache; add loading skeleton to indicate translation fetch

**No Code Splitting:**
- Problem: All lesson content (350KB+ when uncompressed) is loaded in bundle at startup, including all 22 lessons in 3 languages
- Files: `src/App.jsx` (lines 159-193)
- Cause: LESSONS and CHALLENGES are static JS objects bundled inline
- Improvement path: Move lessons to separate JSON files; load on-demand per location; implement lazy loading with code splitting

**Confetti Animation on Every Pass:**
- Problem: Canvas-based confetti animation runs on full screen on every test pass; can cause jank on low-end devices
- Files: `src/App.jsx` (Confetti component, line 1033)
- Cause: No performance budget; animation runs at full screen resolution
- Improvement path: Reduce particle count on mobile; use CSS animations instead of canvas; disable on low-FPS devices

## Fragile Areas

**Lesson Translation System:**
- Files: `src/App.jsx` (lines 916-951)
- Why fragile: Depends on Claude returning exact JSON format with exact number of sections; if Claude changes response format or returns wrong number of sections, translation is silently skipped; cached translations can become corrupt
- Safe modification: Add strict JSON schema validation with detailed error messages; implement versioning for cache format; add rollback to English if translation incomplete
- Test coverage: No tests for translation parsing; no tests for cache corruption; no tests for network failures during translation

**Practice Question State Machine:**
- Files: `src/App.jsx` (lines 909-1024)
- Why fragile: Complex interdependent state variables (practiceIdx, selected, submitted, feedback, grading, freeAns, practiceScore, totalPossible); order of state updates matters; resetting requires calling multiple setters
- Safe modification: Consolidate practice state into single object or reducer; create state machine to ensure valid transitions; validate state consistency
- Test coverage: No tests for practice flow; no tests for edge cases (skipping questions, rapid submissions)

**Rate Limiting with In-Memory Map:**
- Files: `supabase/functions/claude-proxy/index.ts` (lines 6-20)
- Why fragile: Rate limit map persists across requests but is cleared on deploy; if database goes down rate limiter can't be recovered; doesn't survive Deno restart
- Safe modification: Move rate limiting to Supabase Redis or database; implement sliding window algorithm; add metrics/monitoring
- Test coverage: No tests for rate limiting behavior; no tests for edge cases (clock skew, spoofed IP headers)

**Mobile Safe Area Padding:**
- Files: `src/App.jsx` (lines 52, 1081, 1188)
- Why fragile: BOTTOM_SAFE is hardcoded based on Capacitor detection; if safe area changes it requires code change; different devices have different safe area values
- Safe modification: Use `viewport-fit=cover` and CSS `env(safe-area-inset-*)` variables for all padded elements; test on multiple devices; implement dynamic detection
- Test coverage: Manual testing only on specific devices; no automated tests for different safe areas

## Scaling Limits

**localStorage Cache for Translations:**
- Current capacity: ~5-10MB depending on browser (most store 5MB limit)
- Limit: With 22 lessons × 3 languages × ~10KB per translation = 660KB. Breaks at ~8x growth
- Scaling path: Move to IndexedDB (50MB+ capacity); implement LRU eviction; use service worker for larger cache

**In-Memory Rate Limiter:**
- Current capacity: Map can hold infinite entries but growth is unbounded
- Limit: If millions of users hit service, memory grows indefinitely; stale entries (older than window) are never cleaned up
- Scaling path: Implement sliding window with cleanup; move to Supabase Redis; use bloom filter for seen IPs

**Monolithic App Component:**
- Current capacity: 1565 lines with all state; can handle current feature set
- Limit: At ~100 more lessons or 5+ major features, component becomes unmanageable and bundle size explodes
- Scaling path: Extract components; use code splitting; implement module federation for micro-app architecture

**Lesson Content Bundle Size:**
- Current: ~350KB uncompressed (all lessons, questions, translations inline)
- Limit: At 500KB+, becomes slow on slow networks; impacts perceived performance
- Scaling path: Move to CDN; use lazy loading; implement streaming updates for new lessons

## Dependencies at Risk

**Supabase Client (^2.100.0):**
- Risk: Major version relies on features that could break; no version pinning means minor updates could introduce issues
- Impact: Breaking auth changes, RLS policy changes, realtime subscription changes
- Migration plan: Pin to exact version after testing thoroughly; create abstraction layer in `db` object for easy migration

**React 19.2.0:**
- Risk: Version 19 is relatively new; some edge cases with strict mode, concurrent features might manifest
- Impact: Unexpected behavior with Suspense, useTransition, or other React 19 features if accidentally used
- Migration plan: Monitor React issues; test thoroughly on each minor version; consider upgrading to stable LTS when available

**Claude API Model Versions:**
- Risk: Using specific Claude model versions (claude-sonnet-4-6, claude-haiku-4-5) that could be deprecated
- Impact: Model behavior changes, model discontinuation, cost changes
- Migration plan: Implement model abstraction; switch model via environment variable; monitor Anthropic deprecation notices

**Vite 7.3.1:**
- Risk: Relatively new major version; build process could have undiscovered issues
- Impact: Build failures in edge cases; performance regressions; plugin incompatibilities
- Migration plan: Lock version; monitor Vite issues; keep eye on critical updates

## Missing Critical Features

**No Offline Support:**
- Problem: Lessons, progress, and news require network connection; no service worker or offline cache
- Blocks: Users on unreliable connections can't use app; no airplane mode support; learning streaks interrupted by network issues
- Recommendation: Implement service worker with offline cache strategy; cache lessons locally; queue progress updates

**No Session Recovery:**
- Problem: If user is interrupted mid-lesson and returns, all progress in that lesson is lost
- Blocks: Real-world usage (interruptions are frequent); user frustration; practice progress not saved
- Recommendation: Save practice session state to localStorage; implement auto-save of answers; add resume dialog

**No Analytics:**
- Problem: No way to measure which lessons are difficult, where users drop off, or what's working
- Blocks: Data-driven improvements; understanding which features to build next; identifying bugs in wild
- Recommendation: Implement event tracking; send to analytics service; create dashboard for insights

**No Mobile App Store Distribution:**
- Problem: Android app is built but not published; relies on localhost/Capacitor dev server
- Blocks: Real users can't install; no distribution channel; can't measure adoption
- Recommendation: Build release APK; set up Google Play account; implement app update mechanism

**No Internationalization Beyond UI:**
- Problem: Lesson content translations are manual via Claude; no proper i18n framework for managing translations
- Blocks: Scaling to more languages requires more Claude calls; translations can't be A/B tested or versioned
- Recommendation: Use i18n library (i18next); manage translations in JSON files; add translator workflow

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: All business logic, utilities, calculations (score calculations, streak logic, achievement conditions)
- Files: `src/App.jsx` (Streak object, getAltitude, getScore, grade functions), `src/lib/supabase.js` (all db methods)
- Risk: Streak logic could give wrong streak counts; scores could be calculated wrong; achievements could unlock incorrectly
- Priority: High - core app logic is untested

**No Integration Tests:**
- What's not tested: Auth flow, lesson completion flow, progress persistence, payment integration
- Files: `src/App.jsx`, `src/lib/supabase.js`
- Risk: Auth could silently fail; lessons marked complete without saving; progress lost on refresh
- Priority: High - user data at risk

**No E2E Tests:**
- What's not tested: Full user journeys (sign up, complete lesson, view progress, claim rating)
- Files: All
- Risk: Major regressions could ship undetected; mobile layout issues wouldn't be caught; navigation flows could break
- Priority: High - quality impact

**No Visual Regression Tests:**
- What's not tested: Theme switching, responsive design, component rendering across browsers
- Files: All components using inline styles
- Risk: Theme colors could look wrong; mobile layout could break on new device; CSS could regress
- Priority: Medium - user experience impact

**No Translation Testing:**
- What's not tested: Lesson translation parsing, cache behavior, language switching, RTL rendering
- Files: `src/App.jsx` (translation system, RTL code)
- Risk: Translations could corrupt; RTL languages could render incorrectly; Arabic/French text could overflow
- Priority: Medium - affects 2/3 of languages

**No Performance Tests:**
- What's not tested: Bundle size, page load time, animation performance, re-render frequency
- Files: All
- Risk: Performance regressions ship undetected; slow on low-end devices; poor Core Web Vitals
- Priority: Medium - scalability impact

---

*Concerns audit: 2026-04-16*
