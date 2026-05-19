# Phase 3: Play Store Assets - Research

**Researched:** 2026-05-14
**Domain:** Android Play Store graphic assets, privacy policy hosting, adb screenshot capture
**Confidence:** HIGH (core requirements verified against official Google Play and GitHub sources)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Capture screenshots from the physical Android device where the release build is installed. Use `adb exec-out screencap -p > screenshot.png` for exact 1080x1920px resolution. Dark theme must be active, user must be signed in with progress visible.
- **D-02:** All screenshots must be RGB PNG (no alpha channel). If `adb screencap` produces RGBA, convert with `convert screenshot.png -alpha off screenshot_rgb.png` (ImageMagick) or equivalent.
- **D-03:** The 5 required screenshot scenes are: World Map, Lesson View, AI News, AI Tools, Achievements/Lumi.
- **D-04:** Each screenshot must show realistic user data — sign in with the test account that has progress from Phase 1/2 testing.
- **D-05:** All screenshots get Canva caption overlays with app name "AI Fluent" and a short feature callout. Manual Canva step — Claude provides text and layout guidance.
- **D-06:** Caption overlay text is locked per screen (World Map, Lesson, AI News, AI Tools, Achievements — text specified in CONTEXT.md).
- **D-07:** Caption style: white or gold text on a semi-transparent dark overlay bar at top or bottom. App name "AI Fluent" on every screenshot.
- **D-08:** Feature graphic is 1024x500px landscape PNG or JPEG (<=1 MB). Design in Canva. Content: dark background (#060D1A), app name, tagline, Lumi, mountain elements.
- **D-09:** App icon is a custom 512x512px PNG (Lumi character or mountain/summit theme, #060D1A background, #D4A55A gold accent). Default Capacitor icons in mipmap-*/ need replacing.
- **D-10:** 512x512px icon is for Play Console upload only (ASSETS-04). In-app launcher icon mipmap density update is out of scope for this phase.
- **D-11:** Host privacy policy as static HTML on GitHub Pages. Create `privacy-policy.html` in repo root or `docs/` folder. URL: `https://Moe-hub814.github.io/Ai-Fluent/privacy-policy.html`
- **D-12:** Privacy policy must disclose: email collection, Supabase storage, Anthropic API processing, and confirm: no ads, no tracking SDKs, no analytics.
- **D-13:** Privacy policy should be simple and readable. Sections: What We Collect, How We Use It, Third-Party Services (Supabase, Anthropic), Data Retention, Contact. Include effective date.

### Claude's Discretion
- Exact Canva template or layout for caption overlays
- Specific font choices for captions and feature graphic
- Privacy policy HTML styling
- Whether to use a custom domain for privacy policy or stick with GitHub Pages default URL
- Exact wording of privacy policy beyond the required disclosures

### Deferred Ideas (OUT OF SCOPE)
None — auto-mode analysis stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ASSETS-01 | Minimum 5 phone screenshots at 1080x1920px, dark theme, RGB PNG no alpha | adb exec-out command verified; alpha removal via ImageMagick magick command |
| ASSETS-02 | Canva caption overlays on all screenshots (app name + feature callouts visible) | Canva workflow documented; WCAG contrast ratios and font guidance included |
| ASSETS-03 | Feature graphic at exactly 1024x500px (landscape, PNG or JPEG, <=1 MB) | Verified against official Google Play spec (support.google.com/googleplay/android-developer/answer/9866151) |
| ASSETS-04 | App icon at 512x512px PNG for Play Console upload | Verified: 32-bit PNG with alpha, <=1024KB, no rounded corners or shadows in asset |
| ASSETS-05 | Privacy policy at stable public URL disclosing email, Supabase, Anthropic API processing | GitHub Pages setup documented; required disclosures mapped to Anthropic API policy |
</phase_requirements>

---

## Summary

Phase 3 creates all graphical and legal assets needed to populate the Play Store listing in Phase 4. The work spans three distinct tracks: (1) screenshot capture via adb on a connected Android device, (2) graphic design in Canva for screenshot captions, feature graphic, and app icon, and (3) a privacy policy HTML page hosted on GitHub Pages.

The good news for planning: the Play Store's actual format requirements are not especially complex. Where most apps get rejected is through invisible traps — screenshots with alpha channels, icons with pre-applied rounded corners, privacy policies that omit third-party AI processing, or GitHub Pages URLs that haven't propagated yet when the Play Console verifier hits them. Research confirms all of these failure modes and provides verified mitigations.

The project is well-positioned: adb is installed and working on this machine, the connected device list was empty at research time (device must be connected and USB debugging enabled when capture tasks run), ImageMagick is not yet installed (quick winget install), and the GitHub repo (Moe-hub814/Ai-Fluent) is ready for Pages configuration. No blockers exist that require decisions from the user.

**Primary recommendation:** Execute this phase in three sequential sub-tracks: (A) capture and convert screenshots first since that requires the physical device, (B) perform all Canva design work offline, (C) publish the privacy policy to GitHub Pages last since it needs to propagate before Phase 4 listing creation.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Screenshot capture | Device (adb) | Local workstation | Requires physical device with release build; adb bridges device to workstation |
| Alpha channel removal | Local workstation | — | ImageMagick post-processes adb output before Canva import |
| Caption overlays | Canva (external tool) | — | Manual graphic design step; no code involved |
| Feature graphic | Canva (external tool) | — | Landscape design asset; no code involved |
| App icon | Canva (external tool) | — | 512x512 PNG export; no code changes (mipmap update is out of scope) |
| Privacy policy content | Local file (HTML) | GitHub Pages CDN | Static HTML committed to repo, served by GitHub Pages |
| Privacy policy hosting | GitHub Pages | — | Free, stable public URL tied to the Moe-hub814/Ai-Fluent repo |

---

## Standard Stack

### Core Tools

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| adb (Android Debug Bridge) | 37.0.0 (installed) | Capture screenshots from device | Official Android tool; only way to get exact device screenshots |
| ImageMagick | 7.x (needs install) | Remove alpha channel from PNG screenshots | Industry standard for CLI image manipulation; `-alpha off` flag is the canonical fix |
| Canva | Web (latest) | Design caption overlays, feature graphic, app icon | Non-technical design tool; no install required |
| GitHub Pages | N/A (config only) | Host privacy policy HTML at stable public URL | Free, permanent URL tied to repo; no separate hosting account needed |

### Supporting Tools

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| git | 2.50.1 (installed) | Commit privacy-policy.html and trigger Pages build | Use for docs/ folder commit to main branch |
| Node.js | 22.17.1 (installed) | Not needed for this phase | Background — already installed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ImageMagick for alpha removal | ffmpeg (`ffmpeg -i in.png -pix_fmt rgb24 out.png`) | ffmpeg also removes alpha; but NOT currently installed; winget install is the same effort — use ImageMagick as it is more purpose-fit for static images |
| GitHub Pages | Netlify Drop, Vercel, Firebase Hosting | All work but require additional accounts; GitHub Pages reuses the existing repo with zero new accounts |
| Canva overlays | GIMP, Photoshop, Figma | All achieve the same result; Canva requires no install and has phone screenshot templates built in |

**Installation (ImageMagick — only missing tool):**
```powershell
winget install ImageMagick.ImageMagick
```
After installation, use `magick` (not `convert`) on Windows:
```powershell
magick screenshot.png -alpha off screenshot_rgb.png
```

**Version verification:** [VERIFIED: winget.run registry] ImageMagick 7.x is current and auto-published to winget from version 7.1.1-31 onward.

---

## Architecture Patterns

### System Architecture Diagram

```
Physical Android Device (release build installed)
       |
       | USB cable (USB debugging enabled)
       |
adb exec-out screencap -p > screenshot_raw.png
       |
       v
Local Workstation (Windows 11)
       |
magick screenshot_raw.png -alpha off screenshot_rgb.png  [ImageMagick]
       |
       v
Canva (web browser)
  - Import screenshot_rgb.png as background
  - Add semi-transparent dark bar (top or bottom)
  - Add "AI Fluent" text + feature callout
  - Export as PNG at 1080x1920
       |
       +-- Feature graphic (1024x500 PNG/JPEG)
       +-- App icon (512x512 PNG, 32-bit with alpha)
       |
       v
Play Store Assets folder (local)
  screenshots/  01-world-map.png ... 05-achievements.png
  feature-graphic.png (or .jpg)
  icon-512.png

       [Parallel track]

docs/privacy-policy.html  [committed to main branch]
       |
       v
GitHub Pages (Moe-hub814.github.io/Ai-Fluent/privacy-policy.html)
  - Enabled via Settings > Pages > main branch > /docs folder
  - Propagates in 2-10 minutes
  - URL is stable and permanent
       |
       v
Play Console (Phase 4) — uploads assets, enters privacy policy URL
```

### Recommended Asset Folder Structure
```
assets/play-store/
├── screenshots/
│   ├── 01-world-map-raw.png         # adb output, RGBA
│   ├── 01-world-map-rgb.png         # after magick alpha removal
│   ├── 01-world-map-captioned.png   # after Canva overlay export
│   ├── 02-lesson-raw.png
│   ├── 02-lesson-rgb.png
│   ├── 02-lesson-captioned.png
│   ├── 03-ai-news-captioned.png
│   ├── 04-ai-tools-captioned.png
│   └── 05-achievements-captioned.png
├── feature-graphic.png              # 1024x500, <=1MB
└── icon-512.png                     # 512x512, 32-bit PNG

docs/
└── privacy-policy.html              # Published on GitHub Pages
```

### Pattern 1: adb Screenshot Capture (Windows PowerShell)

**What:** Capture a lossless PNG directly from the device to the local filesystem in a single command.
**When to use:** Any time you need a pixel-perfect device screenshot without involving device storage.

```powershell
# Source: adbshell.com/commands/adb-shell-screencap (verified)
# Requires: USB debugging enabled, device authorized, adb in PATH

# Capture single screenshot
adb exec-out screencap -p > "C:\Users\hamou\ai-fluent\assets\play-store\screenshots\01-world-map-raw.png"

# Verify it captured (should be ~2MB for 1080x1920)
(Get-Item "01-world-map-raw.png").Length
```

**Important for Windows:** `adb exec-out` is critical. Do NOT use `adb shell screencap -p /sdcard/...` + `adb pull` when on PowerShell — the pipe redirect (`>`) only works correctly with `exec-out`, which sends raw binary stdout. The shell variant requires an intermediate device file and pull step.

**Confirm device is connected before running:**
```powershell
adb devices
# Must show your device, NOT "unauthorized"
```

### Pattern 2: Alpha Channel Removal (ImageMagick on Windows)

**What:** Strip the alpha channel from the raw screenshot PNG so it meets Play Store 24-bit PNG requirement.
**When to use:** After every adb screencap before uploading or importing to Canva.

```powershell
# Source: imagemagick.org/script/convert.php (verified)
# Note: Windows ImageMagick 7 uses "magick" command, not "convert"

magick "01-world-map-raw.png" -alpha off "01-world-map-rgb.png"

# Batch convert all raw screenshots
Get-ChildItem "assets\play-store\screenshots\*-raw.png" | ForEach-Object {
    $rgb = $_.FullName -replace '-raw\.png', '-rgb.png'
    magick $_.FullName -alpha off $rgb
    Write-Host "Converted: $($_.Name)"
}
```

**Verify alpha removed:** A 24-bit PNG has no alpha. File size should be slightly smaller than the raw RGBA file.

### Pattern 3: GitHub Pages Hosting Setup

**What:** Enable GitHub Pages from the /docs folder on the main branch so privacy-policy.html is publicly accessible.
**When to use:** Once, during the privacy policy task. The URL becomes permanent.

Steps (verified against docs.github.com):
1. Create `docs/privacy-policy.html` in repo root and commit to main branch
2. Push to GitHub: `git push origin main`
3. In the GitHub repo (Moe-hub814/Ai-Fluent): Settings > Pages
4. Under "Build and deployment": Source = "Deploy from a branch"
5. Branch dropdown: `main`, Folder dropdown: `/docs`
6. Click Save
7. Wait 2-10 minutes for first build
8. URL: `https://Moe-hub814.github.io/Ai-Fluent/privacy-policy.html`

**URL stability:** GitHub Pages URLs are permanent as long as the repository exists and Pages remains enabled. The URL does not change when the repo has new commits. [VERIFIED: docs.github.com/en/pages]

### Anti-Patterns to Avoid

- **Using `adb shell screencap` + `adb pull` on Windows:** Binary corruption can occur in the shell pipe; always use `adb exec-out screencap -p > file.png` for direct capture.
- **Uploading RGBA PNG to Play Console:** Play Store rejects screenshots with alpha channel. Always run the `magick -alpha off` step before uploading.
- **Pre-applying rounded corners to the 512x512 icon:** Google Play applies rounding dynamically (30% radius). If you round the corners yourself in Canva, the double-rounding creates an ugly artifact.
- **Pre-applying drop shadows to the icon:** Same reason — Google Play adds shadows dynamically. Asset must be flat.
- **Setting the GitHub Pages URL in Play Console before the page is live:** Play Console's privacy policy URL verifier will fail if the page returns 404. Commit and push first, wait for Pages to propagate, then proceed to Phase 4.
- **Using a `docs/` folder that doesn't exist yet when enabling Pages:** GitHub Pages will throw a build error "missing /docs folder." Create and commit the file before enabling Pages in Settings.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Alpha channel removal | Custom script reading PNG binary | `magick -alpha off` | ImageMagick handles all PNG variants, interlacing, bit depths correctly |
| Privacy policy legal text | Write from scratch without reference | Use the required disclosures from CONTEXT.md D-12/D-13 as the structure; see Code Examples section | Missing required disclosures causes Play review rejection |
| Screenshot framing/device mock | Code a custom device frame renderer | Canva has pre-built phone frame templates | Not required for Play Store; plain screenshots with overlay bars are standard and accepted |
| Batch adb capture script | Complex timing loop with UI automation | Manually navigate each screen, run one adb command per scene | 5 screenshots is a small number; automation adds risk without benefit |

**Key insight:** All the complexity in this phase is procedural (do these steps in order), not technical. The tools exist; the risk is in skipping verification steps.

---

## Play Store Asset Specifications (Verified)

Source: [support.google.com/googleplay/android-developer/answer/9866151](https://support.google.com/googleplay/android-developer/answer/9866151) [VERIFIED: official Google Play Help]

### Phone Screenshots (ASSETS-01)
| Property | Requirement |
|----------|-------------|
| Format | JPEG or 24-bit PNG — NO alpha channel |
| Minimum dimension | 320px |
| Maximum dimension | 3840px (no side can exceed 2x the other) |
| Recommended | 1080x1920px portrait (9:16) |
| Minimum required to publish | 2 screenshots |
| Recommended for promotional eligibility | At least 4 screenshots at 1080px+ |
| Maximum file size | 8 MB per screenshot |
| Maximum count | 8 per device type |

**This phase plan: 5 screenshots at 1080x1920px RGB PNG — meets all requirements.**

### Feature Graphic (ASSETS-03)
| Property | Requirement |
|----------|-------------|
| Format | JPEG or 24-bit PNG — NO alpha |
| Dimensions | Exactly 1024px x 500px |
| Maximum file size | 1 MB |

### App Icon (ASSETS-04)
| Property | Requirement |
|----------|-------------|
| Format | 32-bit PNG **WITH alpha** (alpha is required, unlike screenshots) |
| Dimensions | Exactly 512px x 512px |
| Maximum file size | 1024 KB |
| Shape | Full square — Google Play applies dynamic rounding (30% corner radius) |
| Shadows | None in asset — Google Play applies dynamically |

**Note:** The app icon requirement is the opposite of screenshots — it REQUIRES 32-bit PNG with alpha support. A solid background with no transparency is best practice for visual quality, but the format must be 32-bit PNG (not 24-bit).

---

## Privacy Policy Requirements (ASSETS-05)

### Google Play Mandatory Disclosures
Source: [support.google.com/googleplay/android-developer/answer/10144311](https://support.google.com/googleplay/android-developer/answer/10144311) [VERIFIED: official Google Play Help]

For AI Fluent specifically, the policy MUST cover:

| Data Type | What to Disclose |
|-----------|-----------------|
| Email address | Collected at account creation, stored in Supabase Auth |
| User profile data | Display name, lesson progress, streak data, achievements — stored in Supabase (hosted Postgres) |
| User-generated content | Text prompts entered in AI Tools (Email Writer, Prompt Builder, etc.) are sent to Anthropic's Claude API for processing |
| Third-party services | Supabase (auth + database), Anthropic (AI API) — must name them |
| Data not collected | No advertising identifiers, no analytics SDKs, no tracking SDKs |
| Data retention | Supabase: until account deletion. Anthropic API: 7 days (standard retention per Anthropic policy) |
| Security | Data in transit over HTTPS |
| Contact | Developer contact email |

### Anthropic API Data Retention (for disclosure)
Source: [platform.claude.com/docs/en/manage-claude/api-and-data-retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) [VERIFIED: official Anthropic docs]

- Standard API (Messages API): Inputs and outputs are NOT stored by Anthropic beyond the API call. API data is **never used for model training** without express permission.
- Retained data: Reduced from 30 days to **7 days** as of September 2025 (abuse screening only)
- ZDR (Zero Data Retention): Not applicable to this app (requires enterprise agreement)
- **Practical disclosure language:** "When you use AI Tools, your text inputs are sent to Anthropic's Claude API for processing. Anthropic does not use API data for model training. API inputs and outputs are retained for up to 7 days for security purposes, then automatically deleted."

### Common Rejection Reasons (ASSUMED from training knowledge + policy review)
- Missing disclosure of third-party AI API usage (most common for AI apps)
- Privacy policy URL returns 404 at review time (GitHub Pages not yet live)
- Policy exists but is not accessible inside the app (Play requires the URL be entered in Play Console; in-app link is optional but recommended)
- Policy does not list specific third-party services by name

### Required Policy Structure (D-13 compliance)
```html
1. What We Collect
   - Email address (account creation)
   - Display name (profile)
   - Lesson progress, streak, achievements (learning data)
   - Text you enter in AI tools (sent to Anthropic API, not stored by us)

2. How We Use It
   - Account authentication and management
   - Tracking your learning progress
   - Powering AI-generated responses in AI Tools

3. Third-Party Services
   - Supabase (supabase.com): Auth and database hosting
   - Anthropic (anthropic.com): AI API for interactive tools
   
4. Data Retention
   - Your account data: retained until you delete your account
   - Anthropic API processing: up to 7 days per Anthropic policy, then deleted

5. No Advertising or Tracking
   - We do not use advertising networks, analytics SDKs, or tracking

6. Contact
   - [developer email]
   
7. Effective Date: [date]
```

---

## Common Pitfalls

### Pitfall 1: RGBA Screenshots Rejected by Play Console
**What goes wrong:** Play Console upload rejects the PNG with "Invalid format — screenshots cannot have transparency." The raw adb output on many Android devices produces 32-bit RGBA (4 channels, where alpha = 255 for all pixels).
**Why it happens:** `screencap -p` outputs whatever the framebuffer format is. Most modern Android devices use RGBA internally.
**How to avoid:** Always run `magick screenshot-raw.png -alpha off screenshot-rgb.png` after every adb capture. Never upload raw adb output directly.
**Warning signs:** Raw file is exactly 4 bytes per pixel * resolution. A 1080x1920 RGBA PNG will be noticeably larger than an equivalent RGB PNG.

### Pitfall 2: GitHub Pages Not Live When Play Console Verifies
**What goes wrong:** You enter the privacy policy URL in Play Console, it shows as invalid, blocking listing creation.
**Why it happens:** GitHub Pages takes 2-10 minutes for the initial build after enabling. If you enter the URL before the first build completes, the crawler gets a 404.
**How to avoid:** After enabling Pages and pushing `docs/privacy-policy.html`, manually visit `https://Moe-hub814.github.io/Ai-Fluent/privacy-policy.html` in a browser and confirm it loads before proceeding to Phase 4.
**Warning signs:** GitHub's repo "Actions" tab shows a Pages build in progress (yellow dot). Wait for green checkmark.

### Pitfall 3: Icon Has Pre-Applied Rounded Corners
**What goes wrong:** In the Play Store listing, the icon shows a double-rounded effect (corners appear flat and then rounded again by Google), making the icon look unprofessional or malformed.
**Why it happens:** Canva templates for icons often include rounded corners. Developers export the rounded version without realizing Google Play re-applies rounding.
**How to avoid:** In Canva, use a full-square artboard (512x512), keep the icon artwork as a square with no rounded corner treatment on the container. Let Google Play handle the rounding.
**Warning signs:** The Canva design shows rounded corners on the exported PNG itself.

### Pitfall 4: Device Not Authorized for adb
**What goes wrong:** `adb exec-out screencap -p > file.png` produces a 0-byte or corrupt PNG because the device shows "unauthorized" in `adb devices`.
**Why it happens:** USB debugging is enabled but the device has not approved this specific computer's RSA key yet.
**How to avoid:** Before screenshot capture tasks, run `adb devices` and confirm the device shows "device" (not "unauthorized"). On the phone screen, accept the authorization prompt.
**Warning signs:** `adb devices` output shows `[device serial] unauthorized` instead of `[device serial] device`.

### Pitfall 5: Feature Graphic Exceeds 1 MB
**What goes wrong:** Canva exports a PNG that is 2-4 MB; Play Console rejects it with "File too large."
**Why it happens:** 1024x500 PNG with complex artwork can easily exceed 1 MB at 24-bit color depth.
**How to avoid:** Export as JPEG from Canva at 85-90% quality (typically 200-400 KB for this resolution). If PNG is required, enable Canva's compression option. Both JPEG and PNG are accepted by Play Console for the feature graphic.
**Warning signs:** Canva export preview shows file size above 1 MB.

### Pitfall 6: Missing Anthropic API Disclosure in Privacy Policy
**What goes wrong:** App passes initial review but gets flagged post-launch (or at re-review) for undisclosed AI data sharing.
**Why it happens:** Developers focus on Supabase disclosure and forget that user-typed prompts sent to the Anthropic API constitute "sharing with a third party."
**How to avoid:** Privacy policy must explicitly name Anthropic and describe that AI tool text inputs are processed via their API. Reference Anthropic's privacy policy URL.
**Warning signs:** Privacy policy mentions "AI features" generically without naming Anthropic.

---

## Code Examples

### Complete adb Screenshot Workflow (PowerShell)
```powershell
# Source: adbshell.com/commands/adb-shell-screencap (verified pattern)

# Step 1: Verify device is connected
adb devices
# Expect: "device" status (not "unauthorized")

# Step 2: Ensure output directory exists
New-Item -ItemType Directory -Force -Path "assets\play-store\screenshots" | Out-Null

# Step 3: Navigate to the screen on device (manual step), then capture
$scene = "01-world-map"  # change for each screenshot
adb exec-out screencap -p > "assets\play-store\screenshots\$scene-raw.png"

# Step 4: Remove alpha channel
magick "assets\play-store\screenshots\$scene-raw.png" -alpha off "assets\play-store\screenshots\$scene-rgb.png"

# Step 5: Verify dimensions
magick identify "assets\play-store\screenshots\$scene-rgb.png"
# Expect: ...PNG 1080x1920 1080x1920+0+0 8-bit sRGB...
```

### Privacy Policy HTML Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Fluent — Privacy Policy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           max-width: 720px; margin: 40px auto; padding: 0 20px;
           color: #222; line-height: 1.6; }
    h1 { color: #060D1A; }
    h2 { color: #333; margin-top: 2em; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>AI Fluent — Privacy Policy</h1>
  <p><strong>Effective date:</strong> [DATE]</p>

  <h2>What We Collect</h2>
  <ul>
    <li><strong>Email address</strong> — required to create an account</li>
    <li><strong>Display name</strong> — the name you choose during onboarding</li>
    <li><strong>Learning data</strong> — lessons completed, streak history, achievement badges</li>
    <li><strong>AI tool inputs</strong> — text you type in AI Tools (Email Writer, Prompt Builder, etc.)
        is sent to Anthropic's Claude API to generate responses. We do not store these inputs.</li>
  </ul>

  <h2>How We Use It</h2>
  <ul>
    <li>To create and manage your account</li>
    <li>To save and display your learning progress</li>
    <li>To power AI-generated responses in the app's interactive tools</li>
  </ul>

  <h2>Third-Party Services</h2>
  <p>AI Fluent uses the following third-party services:</p>
  <ul>
    <li><strong>Supabase</strong> (<a href="https://supabase.com/privacy">supabase.com</a>)
        — handles account authentication and stores your profile and progress data in a
        hosted database.</li>
    <li><strong>Anthropic</strong> (<a href="https://www.anthropic.com/legal/privacy">anthropic.com</a>)
        — provides the Claude AI API that powers AI Tools. Text you enter in AI Tools
        is processed by Anthropic's API. Anthropic does not use API data for model
        training. Per Anthropic's standard policy, API inputs and outputs may be retained
        for up to 7 days for security purposes, then deleted.</li>
  </ul>

  <h2>What We Do Not Do</h2>
  <ul>
    <li>We do not sell your data to third parties</li>
    <li>We do not use advertising networks or advertising identifiers</li>
    <li>We do not use analytics or tracking SDKs</li>
  </ul>

  <h2>Data Retention</h2>
  <p>Your account data (email, profile, progress) is retained until you delete your account.
  AI tool inputs sent to Anthropic are subject to Anthropic's 7-day retention policy and
  are not stored by AI Fluent.</p>

  <h2>Security</h2>
  <p>All data is transmitted over HTTPS. Supabase enforces encryption at rest.</p>

  <h2>Contact</h2>
  <p>Questions about this privacy policy? Email us at: <a href="mailto:hamoudi98@gmail.com">hamoudi98@gmail.com</a></p>

  <p><em>Last updated: [DATE]</em></p>
</body>
</html>
```

### Canva Caption Overlay Specifications

For each screenshot (1080x1920 canvas in Canva):
- **Canvas size:** 1080 x 1920 px (use "Custom dimensions")
- **Background:** Import the `*-rgb.png` screenshot as the background image
- **Overlay bar:** Rectangle element, full width (1080px), height 200-250px
  - Position: bottom of canvas (or top — choose one style and be consistent)
  - Fill color: #060D1A (app dark color), opacity 85%
- **"AI Fluent" text:**
  - Font: Montserrat Bold or similar clean sans-serif
  - Size: 52-60px
  - Color: #D4A55A (app gold)
  - Position: inside overlay bar, left-aligned with 40px padding
- **Feature callout text:**
  - Font: Same family, Regular weight
  - Size: 36-42px
  - Color: #FFFFFF (white)
  - Position: Below "AI Fluent" text inside overlay bar
- **Export settings:** PNG, original quality (do not compress — Canva PNG at 1080x1920 is well under 8MB limit)

**Contrast verification:** White text on #060D1A at 85% opacity over a dark screenshot background achieves contrast ratio >7:1, exceeding WCAG AA (4.5:1) and AAA (7:1) standards. Gold text (#D4A55A) on #060D1A achieves approximately 4.8:1, meeting WCAG AA. [CITED: wcag.com/blog/content-over-images]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Canva free tier allows custom dimensions up to 1080x1920px | Standard Stack | User may need Canva Pro; workaround is to use 1080x1920 phone mockup template which is free |
| A2 | The physical Android device will appear in `adb devices` when the user connects it for this phase | Common Pitfalls | If device changed or USB debugging was disabled, user needs to re-enable; not a blocker, just a setup step |
| A3 | Anthropic's standard API data retention is 7 days as of research date (reduced from 30 days per September 2025 policy update) | Privacy Policy section | If policy changed again, disclosure should reference Anthropic's privacy page rather than a specific number |

---

## Open Questions

1. **Will the physical device be available during screenshot capture?**
   - What we know: Phase 2 confirmed the release build is installed on a physical device
   - What's unclear: Whether the same device will be available for this phase (user must physically connect it)
   - Recommendation: Plan screenshot capture tasks with a note that the device must be physically connected and USB debugging active

2. **Canva free vs Pro tier for custom canvas dimensions**
   - What we know: Canva free allows some custom sizes; the 1080x1920 phone mockup template is free
   - What's unclear: Whether saving/exporting custom dimensions is gated on Pro in the current Canva version
   - Recommendation: Use the "Phone Mockup" template category (free) as the starting point; if custom dimensions are gated, use 1080x1920 phone template and place screenshot as background

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| adb | ASSETS-01 (screenshot capture) | YES | 37.0.0 | — (no alternative; required for device capture) |
| ImageMagick | ASSETS-01 (alpha removal) | NO | — | Install via `winget install ImageMagick.ImageMagick` (5 min) |
| ffmpeg | ASSETS-01 alternative | NO | — | Not needed if ImageMagick is installed |
| git | ASSETS-05 (GitHub Pages deploy) | YES | 2.50.1 | — |
| Node.js | Not needed this phase | YES | 22.17.1 | N/A |
| Canva | ASSETS-02, 03, 04 | External web tool | N/A | GIMP or Figma (more complex) |
| GitHub Pages | ASSETS-05 | Configurable (not yet enabled) | N/A | — |
| Physical Android device | ASSETS-01 | Unknown at research time | — | Emulator (lower priority; real device preferred for accurate screenshots) |

**Missing dependencies with no fallback:**
- Physical Android device must be available and USB-connected for screenshot capture tasks (ASSETS-01). If unavailable, an emulator running the release APK can substitute, but emulator screenshots may not match real device rendering exactly.

**Missing dependencies with fallback:**
- ImageMagick: install takes under 5 minutes via winget. Include as Wave 0 setup step.

---

## Validation Architecture

> `nyquist_validation` is explicitly `false` in `.planning/config.json` — this section is skipped per configuration.

---

## Security Domain

> This phase creates static assets and a public HTML page. There is no code execution, no user input handling, and no API integration in the deliverables themselves. Standard security controls:

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | No — no code written | N/A |
| V6 Cryptography | No — no data at rest | N/A |
| V2 Authentication | No — no auth code | N/A |

**One security note:** The privacy policy HTML file committed to the `docs/` folder must not contain any secrets (API keys, keystore passwords, etc.). The file is a public static page. [VERIFIED: docs.github.com note that GitHub Pages sites are publicly accessible even from private repos]

---

## Sources

### Primary (HIGH confidence)
- [Google Play Console Help — Preview Assets](https://support.google.com/googleplay/android-developer/answer/9866151) — Screenshot, feature graphic, and icon exact specifications verified
- [Google Play Console Help — User Data Policy](https://support.google.com/googleplay/android-developer/answer/10144311) — Privacy policy required disclosures verified
- [Google Play Icon Design Specifications](https://developer.android.com/distribute/google-play/resources/icon-design-specifications) — 512x512 PNG format, corner radius behavior, prohibited content verified
- [Anthropic API and Data Retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) — API retention model (not stored for Messages API, 7-day max for abuse screening) verified
- [GitHub Docs — Configuring GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) — docs/ folder setup steps verified
- [ADB Shell screencap reference](https://adbshell.com/commands/adb-shell-screencap) — `adb exec-out screencap -p` command syntax verified

### Secondary (MEDIUM confidence)
- [ImageMagick winget publication](https://winget.run/pkg/ImageMagick/ImageMagick) — winget install command and version availability confirmed
- [WCAG — Text over images contrast guidance](https://www.wcag.com/blog/content-over-images-how-does-this-ux-ui-trend-impact-accessibility/) — 4.5:1 contrast ratio standard for readable overlays

### Tertiary (LOW confidence / ASSUMED)
- Canva free tier dimension limits — not verified against current Canva pricing page
- `adb exec-out` binary correctness on this specific Windows 11 + PowerShell 7 environment — should be verified at task execution time by checking output file integrity

---

## Metadata

**Confidence breakdown:**
- Play Store asset specs: HIGH — verified against official Google Play Help page
- adb command syntax: HIGH — verified against official Android tooling documentation
- GitHub Pages setup: HIGH — verified against official GitHub Docs
- Anthropic API data retention: HIGH — verified against official Anthropic API docs (current as of research date)
- Canva workflow: MEDIUM — tool behavior may vary by account tier; general approach is sound
- Privacy policy content: HIGH for required disclosures (Google Play policy), MEDIUM for exact wording (sample template, not legal advice)

**Research date:** 2026-05-14
**Valid until:** 2026-06-14 (Google Play specs are stable; Anthropic data retention policy may change — re-verify the 7-day figure if more than 30 days pass)
