# Pitfalls Research: Android Play Publishing

**Project:** AI Fluent (com.aifluent.app)
**Researched:** 2026-04-16
**Stack:** Capacitor 8.3.0 / React 19 / Vite 7 / Android targetSdkVersion 36

---

## Critical Pitfalls (App-Breaking)

### Pitfall 1: Keystore loss — permanent inability to update the app

**What goes wrong:** The signing keystore is the only identity Google Play accepts for app updates. If it is lost, deleted, or corrupted after the first upload, you can never push an update to existing users. The app cannot be migrated under the same package name. The only "fix" is a brand-new listing under a different package ID — losing all reviews, installs, and ratings.

**Current project state (specific risk):**
- `android/app/ai-fluent-release.keystore` exists at the correct path
- `android/keystore.properties` contains plaintext credentials including the store and key password (`Alsahlani1$`)
- Neither file is excluded by `.gitignore` — the root `.gitignore` has no keystore entry, and `android/.gitignore` has keystore rules commented out (`#*.jks`, `#*.keystore`). **Both files will be committed to git if `git add .` is run.**
- `keystore.properties` contains a real password in plaintext — if this repo is ever made public or pushed to a shared remote, credentials are exposed permanently (git history cannot be simply deleted)

**Warning signs:**
- `android/.gitignore` shows `#*.jks` and `#*.keystore` commented out — keystore is NOT excluded
- `keystore.properties` is not in any `.gitignore`
- No backup copy exists outside the `android/app/` directory

**Prevention strategy:**
1. Before any `git add`, add to `android/.gitignore`:
   ```
   *.jks
   *.keystore
   keystore.properties
   ```
2. Back up the `.keystore` file to at least two offline locations (encrypted USB, password manager attachment, secure cloud vault). Do this before building the release AAB.
3. Record the alias (`aifluent`), storePassword, and keyPassword in a password manager — not in plaintext files in the repo.
4. Optionally enroll in Google Play App Signing (Play manages the upload key separately from the signing key) — this means losing the upload keystore is recoverable. However this must be opted in before the first upload.
5. Do NOT use `git add .` or `git add -A` for any commit that touches the `android/` directory until `.gitignore` is updated.

**Phase:** Address in the signing/build phase, before any git operations on `android/`.

---

### Pitfall 2: `keystore.properties` plaintext password committed to git

**What goes wrong:** Even if the `.keystore` binary is excluded from git, `keystore.properties` contains plaintext passwords. Once committed, the password is permanently in git history even after deletion — `git log --all -p -- keystore.properties` will show it. For a private repo this is low immediate risk, but it is a ticking time bomb if the repo is ever made public, cloned by a contractor, or leaked.

**Current project state:** The file currently contains `storePassword=Alsahlani1$` and `keyPassword=Alsahlani1$`. It is not excluded by any `.gitignore`.

**Warning signs:** File exists at `android/keystore.properties`, not in `.gitignore`.

**Prevention strategy:**
- Add `keystore.properties` to `android/.gitignore` immediately.
- Use environment variables for CI/CD if automation is ever added. For local builds the file is fine as long as it is never committed.
- If it is accidentally committed, rotate the keystore passwords (re-sign with new passwords, requires re-uploading the keystore to Play Console if using Play App Signing).

**Phase:** Before first git commit that touches `android/`.

---

### Pitfall 3: `npx cap sync` not run before building the release AAB

**What goes wrong:** `npx cap sync` copies the Vite-built web assets (`dist/`) into `android/app/src/main/assets/public/` and regenerates `capacitor.config.json` and `capacitor.plugins.json`. If `vite build` is run but `cap sync` is skipped, the Android build packages stale or empty web assets. The AAB uploads successfully, passes review, and users get a blank screen or an old version of the app.

**Current project state:** The `android/.gitignore` explicitly lists `app/src/main/assets/public` as excluded (generated content). This means the asset directory is always regenerated at build time. If the sync step is omitted, the directory may be empty or contain a previous debug build's assets.

**Warning signs:**
- Testing the release APK on a device shows a blank white screen or old UI
- `android/app/src/main/assets/public/` is empty or shows a stale `index.html` timestamp
- `vite build` output says "built in X" but `cap sync` was never run after it

**Prevention strategy:**
- Always run the complete chain: `npm run build && npx cap sync android && ./gradlew bundleRelease`
- Never run `./gradlew bundleRelease` directly after code changes without the build+sync steps first
- Check `android/app/src/main/assets/public/index.html` exists and has a recent timestamp before building

**Phase:** Build phase — must be in the build checklist as ordered, non-skippable steps.

---

### Pitfall 4: ProGuard/R8 breaking Capacitor's JavaScript bridge

**What goes wrong:** R8 (the default code shrinker) can rename or strip Java classes that Capacitor's WebView JavaScript bridge uses via reflection. If the Capacitor plugin classes are obfuscated, the JS-to-native bridge breaks silently — JavaScript calls to native return undefined or throw errors at runtime. The debug build works fine because minification is disabled; the release build fails only after installation.

**Current project state:**
- `build.gradle` sets `minifyEnabled false` for the release build type. This completely disables R8 for this project.
- `proguard-rules.pro` is empty (no rules defined).
- This is actually safe for the first release — the WebView/bridge will not be broken.

**Warning signs (if `minifyEnabled true` were set):**
- Release APK/AAB shows JavaScript errors or blank screen
- `console.log` in WebView shows `Capacitor` object is undefined
- LogCat shows `ClassNotFoundException` for Capacitor bridge classes

**Prevention strategy:**
- The current `minifyEnabled false` setting is correct and safe for a Capacitor app. Do not change it without adding proper ProGuard keep rules.
- If minification is ever enabled in the future, add to `proguard-rules.pro`:
  ```
  -keep class com.getcapacitor.** { *; }
  -keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
  -keepclassmembers class * {
      @com.getcapacitor.annotation.JavascriptInterface <methods>;
  }
  ```

**Phase:** Not a current risk. Note in build phase documentation as a "do not change" constraint.

---

## Common Pitfalls (Submission Failures)

### Pitfall 5: Debug build submitted instead of release build

**What goes wrong:** Debug builds are signed with the debug keystore (a generic Android dev key), not the release keystore. Google Play rejects any APK/AAB signed with the Android debug keystore outright. Additionally, debug builds may have different behavior (debug flags, different Capacitor server configuration, localhost server mode).

**Current project state:**
- `build.gradle` has a `release` build type with `signingConfig signingConfigs.release` pointing to `keystore.properties`. This is correct.
- The Gradle command for a release AAB is `./gradlew bundleRelease` — not `bundleDebug`.
- Capacitor 8 debug builds use a dev server by default; release builds bundle assets. Getting this wrong produces an AAB that requires a local dev server to function.

**Warning signs:**
- Build output file path contains `/debug/` instead of `/release/`
- AAB filename is `app-debug.aab` instead of `app-release.aab`
- Play Console shows "APK not signed with valid certificate" on upload
- App opens to an error page about a dev server being unreachable

**Prevention strategy:**
- Always use `./gradlew bundleRelease` (not `bundleDebug`) for Play Store uploads
- Verify output path: `android/app/build/outputs/bundle/release/app-release.aab`
- Install and test the release AAB locally before uploading: `bundletool build-apks --bundle=app-release.aab --output=test.apks --local-testing` or use Play Console's internal test track

**Phase:** Build phase.

---

### Pitfall 6: targetSdkVersion below Google Play's minimum

**What goes wrong:** Google Play enforces a minimum `targetSdkVersion` for new app submissions and updates. As of 2025/2026, new apps must target at least API level 35. Apps targeting below this threshold are rejected outright with an error in Play Console before review even begins.

**Current project state:**
- `android/variables.gradle` sets `targetSdkVersion = 36` and `compileSdkVersion = 36`.
- This is current and well above the minimum requirement. No action needed.
- `minSdkVersion = 24` (Android 7.0) is a reasonable minimum that covers ~97%+ of active devices.

**Warning signs (if this were misconfigured):**
- Play Console upload error: "Your app targets an old version of Android"
- `variables.gradle` shows `targetSdkVersion` below 35

**Prevention strategy:** Already handled. Document `targetSdkVersion = 36` as a constraint in build notes — do not downgrade it.

**Phase:** Already safe. Verify in build phase as a pre-upload checklist item.

---

### Pitfall 7: versionCode not incremented between uploads

**What goes wrong:** `versionCode` is an integer used by Android and Play to distinguish builds. If you upload an AAB, find a bug, fix it, and upload again without incrementing `versionCode`, Play Console rejects the second upload with "Version code X has already been used." This is an upload-blocking error.

**Current project state:**
- `android/app/build.gradle` has `versionCode 1` and `versionName "1.0"`.
- For the first-ever upload this is fine. For any subsequent upload (even to fix a bug found during review) the `versionCode` must be at least 2.

**Warning signs:**
- Play Console error: "You need to use a different version code for your APK or Android App Bundle because you already have one with version code X"
- Forgetting to increment before re-building after a rejection or bug fix

**Prevention strategy:**
- Before every release build, increment `versionCode` in `build.gradle` by at least 1
- `versionName` is the human-readable string (e.g. "1.0.1") — update this to match
- Keep a simple changelog or comment in `build.gradle` to track what each version contained
- For the first submission `versionCode 1` is correct; have `versionCode 2` ready for the first update

**Phase:** Build phase — add version bump as step 1 of every release build (except the very first).

---

### Pitfall 8: Missing or mismatched package name in Play Console

**What goes wrong:** The package name (`applicationId`) in `build.gradle` must exactly match the package name entered when creating the app in Play Console. If you create the Play Console listing first with one ID and then build with a different ID (or vice versa), you cannot upload the AAB to that listing.

**Current project state:**
- `android/app/build.gradle`: `applicationId "com.aifluent.app"`
- `capacitor.config.json`: `"appId": "com.aifluent.app"`
- These match — correct.
- Play Console listing has not been created yet. When creating it, use exactly `com.aifluent.app`.

**Warning signs:**
- Play Console upload error about package name mismatch
- Accidentally creating the listing with `com.aifluentapp` or `com.aifluent` (common typos)

**Prevention strategy:**
- When creating the Play Console listing, copy-paste `com.aifluent.app` — do not type it manually
- The package name in Play Console is permanent and cannot be changed after first upload

**Phase:** Play Console setup phase — verify before creating the listing.

---

### Pitfall 9: INTERNET permission missing or unnecessary permissions declared

**What goes wrong:** Play requires that apps declare only the permissions they actually use. Declaring permissions not required for app functionality can cause review rejection or "flagged as potentially harmful." Conversely, missing the INTERNET permission for a web-based Capacitor app causes the app to silently fail to load any content.

**Current project state:**
- `AndroidManifest.xml` declares only `android.permission.INTERNET`. This is correct and minimal.
- No other permissions are declared. Since AI Fluent uses no camera, microphone, location, contacts, or storage, this is accurate.

**Warning signs:**
- App functionality breaks (network requests fail) — INTERNET missing
- Play review rejection citing "permission not justified" — unnecessary permissions declared

**Prevention strategy:** Already handled correctly. Do not add permissions that are not actively used. If future features (e.g., camera, push notifications) are added, add permissions only when that feature is implemented.

**Phase:** Pre-submission review — verify manifest before upload.

---

## Store Listing Pitfalls

### Pitfall 10: Privacy policy is missing, expired, or doesn't match data collection

**What goes wrong:** Google Play requires a privacy policy URL for all apps. The policy must be:
- Hosted at a publicly accessible, non-login-gated URL
- Written in the same language(s) as the app
- Accurately describe what data is collected, how it is used, and with whom it is shared

If there is no privacy policy, Play Console will not allow you to submit the app. If the policy URL is a dead link at review time, the submission may be rejected.

**Current project state:** No privacy policy URL has been created or documented. This is a required blocker for submission.

**Specific disclosures required for AI Fluent:**
- Email address collected at registration (Supabase auth)
- User progress data stored (lesson completions, streak counts, altitude ratings)
- Free-response answers sent to Claude API via Supabase edge function (processed by Anthropic)
- Language preference and theme preference stored
- The fact that AI (Claude) processes user-submitted text must be disclosed

**Warning signs:**
- Play Console submission form shows privacy policy field as required and empty
- Review rejection: "Your app requires a privacy policy"

**Prevention strategy:**
- Create a simple privacy policy page (can be hosted on Vercel, a GitHub Pages page, or a service like Termly/Iubenda)
- The policy must explicitly mention: email collection, progress data, and the fact that free-text responses are sent to a third-party AI service (Anthropic)
- Do not use a generic template that omits third-party AI processing — this is the most commonly missed item for AI apps
- Test that the URL is publicly accessible from an incognito browser before submitting

**Phase:** Store listing phase — must be completed before submission form can be filled out.

---

### Pitfall 11: Data safety section inaccuracy triggers "inaccurate" flag

**What goes wrong:** Play Console's Data Safety section asks granular questions about what data the app collects, processes, and shares. Answering incorrectly (either understating or overstating) can result in a "Policy violation: inaccurate data safety form" rejection, which comes after the full review period — wasting days.

**Current project state — specific answers required for AI Fluent:**

| Data type | Answer |
|-----------|--------|
| Email address | Collected, required for account, not encrypted in transit beyond HTTPS |
| User-generated content (free-response answers) | Collected, sent to third party (Anthropic via Claude API) |
| App activity (lesson completions, streaks) | Collected, stored server-side (Supabase) |
| App interactions (navigation events) | Not collected — no analytics installed |
| Device/app diagnostics | Not collected — no crash reporting SDK |
| Name / display name | Optional, collected if user sets it |
| Personal communications | No |
| Financial info | No (no payments) |

**Key trap:** The "shared with third parties" question must be answered YES for user-generated content because free-response answers are sent to Anthropic's API. Many developers answer NO here because they think of it as "our own service" but Anthropic is a separate data controller.

**Warning signs:**
- Post-review rejection citing "Data safety section doesn't accurately describe data collection"
- Forgetting to check "Data shared with third parties" for AI-processed content

**Prevention strategy:**
- Fill out the Data Safety section last, after the privacy policy is complete
- Use Play Console's own data safety guidance for AI/ML features
- Cross-reference the privacy policy with Data Safety answers — they must be consistent
- When in doubt, err toward disclosing more rather than less

**Phase:** Store listing phase.

---

### Pitfall 12: Screenshot rejection — wrong dimensions or format

**What goes wrong:** Google Play has strict requirements for screenshots:
- Phone screenshots: minimum 320px on short side, maximum 3840px on long side
- Must be JPEG or 24-bit PNG (no alpha)
- Minimum 2 screenshots required for phone
- Screenshots must represent the actual app — using mockups that misrepresent functionality can cause rejection

**Common mistakes:**
- Providing screenshots taken at browser-level zoom (wrong aspect ratio)
- Including device frames in Canva overlays that make the image smaller than 320px usable
- Using PNG with transparency (alpha channel) — must be 24-bit RGB PNG
- Screenshots showing placeholder content or "coming soon" elements

**Current project state:** No screenshots exist yet. Plan is to capture from device/emulator then add Canva overlays.

**Warning signs:**
- Play Console upload error: "Screenshot does not meet size requirements"
- Review note: "Screenshots do not accurately represent app functionality"

**Prevention strategy:**
- Capture screenshots at device native resolution (do not scale down)
- Canva overlay approach is valid as long as the app UI is clearly visible and the final export is RGB PNG or JPEG
- Export from Canva at 2x or the native device resolution, not at 72dpi web resolution
- Take at least 4 screenshots covering: home/map screen, a lesson, a tool, and the Lumi companion — this covers the main value props
- Ensure dark theme is active in screenshots (as planned) and that RTL layout (Arabic) screenshots are not accidentally included unless intentionally adding localized screenshots

**Phase:** Screenshot/listing phase.

---

### Pitfall 13: Short and long description content policy violations

**What goes wrong:** Play's content policies prohibit:
- Keyword stuffing in descriptions ("AI AI AI learning AI tools AI")
- Claims of "#1" or "best" without substantiation
- References to other platforms (mentioning iOS App Store, Apple, etc.)
- Using competitor app names
- Misleading feature claims

The short description already drafted ("Master AI with guided lessons, daily news & hands-on tools. Meet Lumi.") is clean and compliant.

**Warning signs:**
- Review rejection citing "Spam and Minimum Functionality" or "Misleading claims"
- Description contains superlatives without evidence

**Prevention strategy:**
- Do not add "Download now," "Free," or urgency language to descriptions
- Do not promise features not yet in the app (push notifications, social features are out of scope)
- The existing short description is good — keep it

**Phase:** Store listing phase.

---

### Pitfall 14: Content rating questionnaire miscategorization

**What goes wrong:** Play requires a content rating questionnaire (IARC) to be completed. Answering incorrectly can result in a rating that mismatches the app's actual content, which can cause:
- Rejection if rated too mature for an educational app
- Rejection if adult content is present but rated Everyone
- Incorrect age gating in certain regions

**For AI Fluent specifically:**
- The app contains AI-generated content (Claude responses to user free-text input)
- AI-generated content is a specific questionnaire category — answer that user content is generated and processed by AI
- No violence, no sexual content, no gambling — should receive "Everyone" (E) or "Everyone 3+" rating
- The fact that users type free-form text and receive AI responses may trigger a "user-generated content" flag — this requires setting up a content moderation policy even if rudimentary

**Warning signs:**
- Post-review rejection: "Content rating doesn't match app content"
- App flagged for "user-generated content" policies without a moderation statement

**Prevention strategy:**
- In the questionnaire, answer YES to "Does your app allow users to submit or share content?" — because free-response answers are submitted and processed
- Note in the Play Console content policy section that AI-generated responses are filtered through Anthropic's safety systems
- Keep the content rating simple and conservative

**Phase:** Store listing phase.

---

## Timing & Process Pitfalls

### Pitfall 15: First-time submission review delay expectations

**What goes wrong:** Developers expect same-day or next-day approval. First-time app submissions to Google Play typically take 3–7 days for initial review. Some apps take up to 14 days if they trigger additional scrutiny (AI features, user-generated content, or educational apps with in-app purchases are common triggers). Planning around an optimistic 1-day timeline causes missed deadlines.

**Current project state:** This is a first submission. The app has AI-generated content and user-generated content (free-response answers), which are both factors that slow review.

**Warning signs:**
- Building a launch plan assuming "submit Thursday, live Friday"
- Setting marketing or social media announcements before app is approved

**Prevention strategy:**
- Budget 7–14 calendar days from submission to live
- Use the Internal Testing track first (approved instantly, up to 100 testers) to verify the build works before submitting to production review
- Do not announce a public launch date until the app is approved and live
- Check Play Console email regularly — review teams send clarification requests that expire if not answered within ~7 days

**Phase:** Project planning / submission phase.

---

### Pitfall 16: Play Console new developer account additional verification

**What goes wrong:** New Google Play developer accounts (created within the past 12 months) are subject to additional identity verification requirements introduced in 2023. Play may require:
- Government ID verification
- Phone number verification
- A 2-week mandatory "new developer" waiting period before the first app can be published
- D-U-N-S number for organization accounts

If the developer account is brand new and this has not been completed, the submission will be blocked at the "Release to production" step regardless of app quality.

**Current project state:** Developer has a Play developer account but it's unclear when it was created or whether identity verification has been completed.

**Warning signs:**
- Play Console shows a "Complete identity verification" banner
- "Publish" button is greyed out with "Your account requires additional review"
- Console shows a "waiting period" countdown

**Prevention strategy:**
- Log in to Play Console now and check for any outstanding verification requirements before starting the build process
- Complete any identity verification immediately — some steps have processing delays of 3–5 business days
- Do not wait until the AAB is ready to discover the account is locked

**Phase:** Immediate / pre-build phase. Check this before anything else.

---

### Pitfall 17: Submitting to production before testing on internal track

**What goes wrong:** Submitting directly to production (open/closed testing or production track) without first validating the release build on the Internal Testing track is a common mistake. Issues discovered after production submission require: re-building with a higher `versionCode`, waiting for re-review, and potentially receiving a rejection that counts against the account's standing.

**Warning signs:**
- Only one submission attempt planned ("build, upload, submit")
- No physical device or emulator testing of the release AAB planned

**Prevention strategy:**
1. Upload to Internal Testing track first — instant approval, shareable via link
2. Install via the Play Store link (not via `adb install`) to test the production flow
3. Verify: app opens correctly, auth works, lessons load, Claude proxy responds, screenshots match actual app
4. Only then promote to production review

**Phase:** Build and submission phase.

---

### Pitfall 18: Capacitor server mode active in release build

**What goes wrong:** In development, Capacitor can be configured to load the app from a local dev server (`server.url` in `capacitor.config.json`) instead of bundled assets. If this setting is accidentally present in the config when building for release, the AAB will bundle an app that tries to connect to `localhost:5173` — which does not exist on a user's phone. The app will show a blank screen or connection error.

**Current project state:**
- `capacitor.config.json` contains only `appId`, `appName`, and `webDir: "dist"` — no `server` block is present.
- This is correct. No live reload or dev server URL is configured.

**Warning signs:**
- `capacitor.config.json` contains a `"server": { "url": "http://192.168.x.x:5173" }` block
- App shows blank screen after installation from Play Store while working fine in dev
- `android/app/src/main/assets/capacitor.config.json` (the synced copy) contains a server URL

**Prevention strategy:** Already handled. Before building release, verify `capacitor.config.json` has no `server` key. After `cap sync`, inspect `android/app/src/main/assets/capacitor.config.json` to confirm.

**Phase:** Build phase — add to pre-build checklist.

---

## Summary: Phase-to-Pitfall Mapping

| Phase | Pitfall to Address |
|-------|--------------------|
| Pre-build (now) | Pitfall 16: Check Play Console account verification status |
| Pre-build (now) | Pitfall 1: Add keystore and keystore.properties to `android/.gitignore` |
| Pre-build (now) | Pitfall 2: Ensure `keystore.properties` is never committed |
| Pre-build (now) | Pitfall 1: Back up keystore file offline before any git operations |
| Build phase | Pitfall 3: Run full `build → cap sync → bundleRelease` chain in order |
| Build phase | Pitfall 5: Verify output is `app-release.aab` not `app-debug.aab` |
| Build phase | Pitfall 7: versionCode is 1 for first upload; plan to increment for any re-upload |
| Build phase | Pitfall 18: Verify no `server.url` in capacitor.config.json |
| Build phase | Pitfall 6: Confirm targetSdkVersion = 36 (already correct) |
| Build phase | Pitfall 9: Verify manifest has only INTERNET permission (already correct) |
| Play Console setup | Pitfall 8: Copy-paste `com.aifluent.app` exactly when creating listing |
| Play Console setup | Pitfall 16: Complete any outstanding verification before uploading |
| Store listing | Pitfall 10: Create and host privacy policy before filling submission form |
| Store listing | Pitfall 11: Fill Data Safety section — mark user content shared with Anthropic |
| Store listing | Pitfall 14: IARC questionnaire — answer YES to AI/user-generated content |
| Screenshots | Pitfall 12: Export at native resolution, RGB PNG or JPEG, no alpha channel |
| Submission | Pitfall 17: Use Internal Testing track before production |
| Submission | Pitfall 15: Budget 7–14 days for first review; do not announce public launch date early |
| Future update | Pitfall 7: Increment versionCode for every re-upload |
| Future update | Pitfall 4: Do not enable minifyEnabled without adding Capacitor ProGuard rules |

---

*Confidence: HIGH for pitfalls derived from project file inspection (Pitfalls 1–5, 6, 7, 8, 9, 18). MEDIUM for Play Store policy pitfalls (10–17) based on established Play policies as of knowledge cutoff Aug 2025 — verify specific API level minimums and review timeline estimates at submit time as Google updates these periodically.*
