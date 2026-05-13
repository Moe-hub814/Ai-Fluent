# Phase 3: Play Store Assets - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Create all required Play Store graphics and a published privacy policy. Scope: 5 phone screenshots with Canva caption overlays, a feature graphic (1024×500px), an app icon (512×512px), and a privacy policy at a stable public URL. Does not include Play Store listing creation, metadata, or submission — those are Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Screenshot Capture
- **D-01:** Capture screenshots from the physical Android device where the release build is already installed (from Phase 2 Internal Testing). Use `adb exec-out screencap -p > screenshot.png` for exact 1080×1920px resolution. Dark theme must be active, user must be signed in with progress visible.
- **D-02:** All screenshots must be RGB PNG (no alpha channel). If `adb screencap` produces RGBA, convert with `convert screenshot.png -alpha off screenshot_rgb.png` (ImageMagick) or equivalent.

### Screenshot Scenes (5 Required)
- **D-03:** The 5 screenshots are:
  1. **World Map** — Home screen showing all 7 mountain location nodes with progress bars, greeting with user name, Lumi visible
  2. **Lesson View** — A lesson in progress showing content sections, the tutor chat area with Lumi, and navigation
  3. **AI News** — News feed showing "Live" badge, AI news articles simplified by Lumi
  4. **AI Tools** — Tools list showing the 6 guided workflows (Email Writer, Prompt Builder, etc.)
  5. **Achievements / Lumi** — Achievement badges screen with Lumi character visible and altitude ratings
- **D-04:** Each screenshot should show realistic user data (lessons completed, streak active, achievements earned). Sign in with the test account that has progress from Phase 1/2 testing.

### Caption Overlays (Canva)
- **D-05:** All screenshots get Canva caption overlays. Each overlay includes the app name "AI Fluent" and a short feature callout specific to the screen. This is a manual Canva step — Claude provides the text and layout guidance, the user creates the overlays in Canva.
- **D-06:** Caption overlay text for each screenshot:
  1. World Map: "Climb the AI Mountain — 7 learning paths from basics to mastery"
  2. Lesson: "Interactive lessons with Lumi, your AI guide"
  3. AI News: "Today's AI stories, simplified daily"
  4. AI Tools: "6 hands-on AI tools to practice with"
  5. Achievements: "Track your progress and earn altitude ratings"
- **D-07:** Caption style: white or gold text on a semi-transparent dark overlay bar at the top or bottom of the screenshot. Font should be clean and readable. App name "AI Fluent" appears on every screenshot.

### Feature Graphic
- **D-08:** Feature graphic is 1024×500px landscape PNG or JPEG (≤1 MB). Design in Canva. Content: dark background (#060D1A or similar) with the app name "AI Fluent", tagline "Master AI with guided lessons, daily news & hands-on tools", a Lumi character illustration, and mountain/summit visual elements. This is a manual Canva design step.

### App Icon
- **D-09:** The current app icons in `android/app/src/main/res/mipmap-*/` are the default Capacitor icons (green capacitor logo). A custom 512×512px icon is needed for the Play Store listing. Design in Canva or use an icon generator. The icon should feature the Lumi character or a mountain/summit theme with the app's dark+gold color scheme (#060D1A background, #D4A55A gold accent).
- **D-10:** The 512×512px icon is for Play Console upload only (ASSETS-04). Updating the in-app launcher icons across all mipmap densities is out of scope for this phase — it can be done in a follow-up if desired.

### Privacy Policy
- **D-11:** Host the privacy policy as a static HTML page on GitHub Pages. Create a `privacy-policy.html` file in the repo root (or a `docs/` folder configured for GitHub Pages). The URL will be `https://{username}.github.io/{repo}/privacy-policy.html` — a stable, free, public URL.
- **D-12:** Privacy policy must disclose (per ASSETS-05):
  - **Email collection**: User provides email for account creation, stored in Supabase Auth
  - **Supabase storage**: User profile, lesson progress, streak data, and achievement data stored in Supabase (hosted Postgres)
  - **Anthropic API processing**: User text input from AI Tools (prompts, questions to Lumi) is sent to Anthropic's Claude API for processing. Anthropic's data retention policy applies.
  - **No ads, no tracking SDKs, no analytics**: The app does not use advertising, third-party analytics, or tracking SDKs
- **D-13:** The privacy policy should be simple and readable — not legalese. Include sections: What We Collect, How We Use It, Third-Party Services (Supabase, Anthropic), Data Retention, Contact. Include effective date.

### Claude's Discretion
- Exact Canva template or layout for caption overlays
- Specific font choices for captions and feature graphic
- Privacy policy HTML styling
- Whether to use a custom domain for privacy policy or stick with GitHub Pages default URL
- Exact wording of privacy policy beyond the required disclosures

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — ASSETS-01 through ASSETS-05 define exact dimensions, formats, and content requirements
- `.planning/PROJECT.md` — Short description text, dark theme constraint, screenshot requirements

### Prior Phase Context
- `.planning/phases/01-android-layout-fixes/01-CONTEXT.md` — Layout fixes ensure screenshots show correct rendering (no overlaps, correct greeting)
- `.planning/phases/02-android-release-build/02-CONTEXT.md` — Release build is on Internal Testing, device has the app installed

### App Branding
- `src/App.jsx` lines 134-140 — Lumi character SVG component (for icon/graphic reference)
- `src/App.jsx` THEMES constant — Color scheme definitions (#060D1A dark background, #D4A55A gold accent)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Lumi SVG component at `src/App.jsx:134` — renders the companion character in-app, can be used as reference for icon/graphic design
- THEMES constant in `src/App.jsx` — defines dark theme colors: bgDark (#060D1A), gold (#D4A55A), text colors
- Existing launcher icons at `android/app/src/main/res/mipmap-*/ic_launcher.png` — currently default Capacitor icons (green logo), need replacement

### Established Patterns
- App uses dark theme by default — all screenshots should match
- Lumi appears throughout the app (World Map, lesson tutor, news, achievements) — character should be visible in screenshots

### Integration Points
- GitHub Pages for privacy policy hosting — repo already on GitHub
- Play Console already has the app listing from Phase 2 Internal Testing upload
- Canva for graphic design work — external tool, not code

</code_context>

<specifics>
## Specific Ideas

- "Dark theme screenshots with Lumi" is a project-level decision from PROJECT.md
- Short description already decided: "Master AI with guided lessons, daily news & hands-on tools. Meet Lumi."
- The 7 mountain locations are: Base Camp, Forest Lodge, Artist's Outlook, Crystal Cave, Engineer's Peak, Researcher's Ridge, The Summit
- Gold (#D4A55A) is the primary accent color throughout the app
- The app background is #060D1A (very dark blue-black) which was also set as the Android splash background in Phase 1

</specifics>

<deferred>
## Deferred Ideas

None — auto-mode analysis stayed within phase scope

</deferred>

---

*Phase: 03-play-store-assets*
*Context gathered: 2026-05-13*
