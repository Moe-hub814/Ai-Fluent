# Phase 3: Play Store Assets - Pattern Map

**Mapped:** 2026-05-19
**Files analyzed:** 3 (1 code file + 2 new directories with file scaffolding)
**Analogs found:** 1 / 1 (for the only code deliverable; graphic assets have no code analog)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `docs/privacy-policy.html` | static-page | none (static content) | `public/index.html` | role-match (same static HTML structure, same branding vocabulary) |
| `assets/play-store/screenshots/` | asset-directory | none (procedural capture) | no code analog | no match — ops procedure |
| `assets/play-store/feature-graphic.png` | design-asset | none (Canva export) | no code analog | no match — external tool |
| `assets/play-store/icon-512.png` | design-asset | none (Canva export) | no code analog | no match — external tool |

---

## Pattern Assignments

### `docs/privacy-policy.html` (static-page)

**Analog:** `public/index.html`

**Why this analog:** `public/index.html` is the only existing standalone HTML document in the project. It establishes every structural and stylistic convention: `<!DOCTYPE html>`, meta viewport, inline `<style>` block with CSS custom properties, the project's color vocabulary, and the Lumi SVG markup. The privacy policy is a far simpler document, but should share the same doc structure and color tokens so the page reads as part of the same product.

**Imports / head pattern** (`public/index.html` lines 1-11):
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Fluent — Your Climb to AI Fluency</title>
<meta name="description" content="...">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">
```

**Note for privacy policy:** The Google Fonts link is optional for a policy page — system fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`) are acceptable and load faster. The RESEARCH.md template uses system fonts; that approach is preferred for a policy page.

**Color token pattern** (`public/index.html` lines 13-14):
```css
:root {
  --gold: #D4A55A;
  --dark: #0A1420;
  --card: #0F1E30;
  --text: #E8EEF4;
  --muted: #8AA0B8;
}
```

**Apply to privacy policy as:** Use the same hex values directly in the `<style>` block. The policy page is light-theme (readable on all devices) so invert: `background: #fff; color: #222` for body, `color: #060D1A` for h1 (per RESEARCH.md template), with `#D4A55A` gold for accents or the page header only.

**Body layout pattern** (`public/index.html` lines 15-16):
```css
body { background: var(--dark); color: var(--text);
       font-family: 'Nunito', sans-serif; overflow-x: hidden; }
```

**Apply to privacy policy as:** Single-column centered layout (max-width: 720px, margin: 40px auto, padding: 0 20px) with `line-height: 1.6` — from the RESEARCH.md template. No navigation, no hero section. Keep it minimal.

**Footer pattern** (`public/index.html` lines 268-272):
```html
<footer>
  <p>AI Fluent — Your climb to AI fluency</p>
  <p style="margin-top:8px">Made with care by <a href="#">Cyber Moe</a>
     · Powered by <a href="https://anthropic.com" target="_blank">Claude AI</a></p>
  <p style="margin-top:12px;font-size:11px">© 2026 AI Fluent. All rights reserved.</p>
</footer>
```

**Apply to privacy policy as:** Minimal footer with copyright line and a link back to the app (optional). No stars animation, no Lumi SVG — the policy page has no JavaScript requirement.

**Lumi SVG reference** (`public/index.html` lines 116-129 — the in-page Lumi):
```html
<svg viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <radialGradient id="lb" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="#FFFDF5"/>
      <stop offset="40%" stop-color="#FFE8C0"/>
      <stop offset="100%" stop-color="#D4A55A"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="32" fill="url(#lb)" stroke="#D4A55A" stroke-width=".5"/>
  <circle cx="42" cy="46" r="2.5" fill="#5D4E37"/>
  <circle cx="58" cy="46" r="2.5" fill="#5D4E37"/>
  <path d="M42 55 Q50 63 58 55" fill="none" stroke="#5D4E37" stroke-width="2" stroke-linecap="round"/>
</svg>
```

**Apply to:** Icon/graphic design reference only. The canonical Lumi component in `src/App.jsx` lines 134-148 uses a `viewBox="0 0 60 60"` coordinate space with a `radialGradient id="lb${s}"` pattern. Either SVG excerpt can be used as source art for the Canva icon/feature graphic.

---

### `assets/play-store/` directory (design assets — no code pattern)

No code analog exists. These files are produced by adb + ImageMagick (screenshots) and Canva (graphics). The planner should reference RESEARCH.md patterns directly:

- **Screenshot capture:** RESEARCH.md "Pattern 1: adb Screenshot Capture" (PowerShell commands)
- **Alpha removal:** RESEARCH.md "Pattern 2: Alpha Channel Removal" (`magick -alpha off`)
- **Feature graphic:** Canva manual step — RESEARCH.md "Canva Caption Overlay Specifications"
- **App icon:** Canva manual step — 512x512, 32-bit PNG with alpha, no rounded corners pre-applied

---

## Shared Patterns

### Branding Colors (apply to privacy-policy.html and Canva designs)

**Source:** `src/App.jsx` lines 8-24 (THEMES.dark) and `public/index.html` lines 13-14

```javascript
// From src/App.jsx THEMES.dark — the canonical color definitions
bgDark:    "#0A1420"   // app background (slightly lighter than splash #060D1A)
bgCard:    "#0F1E30"   // card backgrounds
gold:      "#D4A55A"   // primary accent — use for headings, callout text in Canva
goldLight: "#FFE8C0"   // secondary gold highlight
text:      "#E8EEF4"   // body text on dark backgrounds
textMuted: "#8AA0B8"   // secondary text
```

**Splash/icon background** (from Phase 1 — set in Android config): `#060D1A` — use this for the Canva feature graphic and icon background (slightly darker than `bgDark`).

**Apply to:**
- `docs/privacy-policy.html` — gold (#D4A55A) for the page title or a thin accent bar at the top
- Canva feature graphic — #060D1A background, #D4A55A gold for "AI Fluent" text
- Canva screenshot caption bars — #060D1A at 85% opacity, #D4A55A for "AI Fluent" label, #FFFFFF for callout text
- Canva app icon — #060D1A background, #D4A55A gold for Lumi glow/border

### Document Head / Meta Pattern

**Source:** `index.html` lines 1-13 (bare app shell) and `public/index.html` lines 1-11 (full marketing page)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Fluent – Learn AI Simply</title>
    <meta name="description" content="..." />
  </head>
```

**Apply to `docs/privacy-policy.html`:** Same `<!DOCTYPE html>`, `<html lang="en">`, charset, viewport meta. Title: `AI Fluent — Privacy Policy`. No `maximum-scale=1.0, user-scalable=no` (that is for the app shell only — privacy policy should allow zoom for accessibility).

### Link Color Convention

**Source:** `public/index.html` line 83:
```css
footer a { color: var(--gold); text-decoration: none; }
```

**Apply to privacy policy:** Use `color: #0066cc` (RESEARCH.md template) for inline links on a light background, which meets WCAG contrast on white. Gold (#D4A55A) does not meet contrast on white — do not use gold for links on a light-background page.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `assets/play-store/screenshots/*.png` | design-asset | procedural (adb + ImageMagick) | No existing screenshot capture scripts or asset pipeline in the repo |
| `assets/play-store/feature-graphic.png` | design-asset | none | No existing Play Store graphics exist |
| `assets/play-store/icon-512.png` | design-asset | none | Existing mipmap icons are default Capacitor placeholders, not analogs for custom design |

For all three: planner references RESEARCH.md "Code Examples" section directly.

---

## Key Observations for Planner

1. **The only code deliverable is `docs/privacy-policy.html`.** It is a self-contained static HTML file with no JavaScript, no build step, and no framework dependency. Pattern it after `public/index.html`'s structural conventions but use the simpler system-font + light-background approach from the RESEARCH.md template.

2. **The `docs/` directory does not yet exist.** GitHub Pages requires the folder to exist with at least `privacy-policy.html` committed before enabling Pages in Settings. The planner must include a "create docs/ directory" step before the commit step.

3. **Privacy policy content is fully specified.** RESEARCH.md lines 342-368 contain the complete required section structure. CONTEXT.md D-12/D-13 lock the required disclosures. The Anthropic API data retention disclosure (7 days, no training use) is sourced from the official Anthropic docs and must appear verbatim.

4. **Screenshot tasks require physical device.** There is no code to write — the plan should be a checklist of adb commands and Canva steps. The planner should flag the device-connection prerequisite as a blocker gate before screenshot tasks.

5. **Canva steps are manual and external.** All three Canva deliverables (caption overlays, feature graphic, icon) are human-executed design tasks. Plans for these should provide specifications and guidance text rather than commands.

---

## Metadata

**Analog search scope:** `c:\Users\hamou\ai-fluent` (root), `src/`, `public/`, `dist/`
**HTML files scanned:** `index.html`, `public/index.html`, `dist/index.html`
**Source files read for color/branding:** `src/App.jsx` lines 1-160
**Pattern extraction date:** 2026-05-19
