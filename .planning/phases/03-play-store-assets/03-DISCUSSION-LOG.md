# Phase 3: Play Store Assets - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 03-play-store-assets
**Mode:** auto
**Areas discussed:** Screenshot Capture, Screenshot Scenes, Caption Design, Feature Graphic, App Icon, Privacy Policy Hosting, Privacy Policy Content

---

## Screenshot Capture

| Option | Description | Selected |
|--------|-------------|----------|
| adb screencap from device | Use physical device with release build already installed | ✓ |
| Android emulator screenshot | Set up emulator with specific config | |
| Manual device screenshot | Power+volume buttons on device | |

**User's choice:** [auto] adb screencap from device (recommended)
**Notes:** Release build already installed on physical device from Phase 2 Internal Testing.

---

## Screenshot Scenes

| Option | Description | Selected |
|--------|-------------|----------|
| World Map, Lesson, AI News, AI Tools, Achievements | Matches ASSETS-01 requirements exactly | ✓ |
| Include Profile screen instead of Achievements | Shows streak and stats | |
| Include Daily Challenge instead of AI Tools | Shows gamification | |

**User's choice:** [auto] Standard 5 screens matching requirements (recommended)
**Notes:** Requirements specify these exact 5 screens.

---

## Caption Design

| Option | Description | Selected |
|--------|-------------|----------|
| Dark/gold brand colors + feature callout | Consistent with app theme | ✓ |
| White minimal text | Clean but less branded | |
| Gradient overlay with logo | More elaborate design | |

**User's choice:** [auto] Dark/gold brand colors (recommended)
**Notes:** Matches existing app color scheme.

---

## Feature Graphic

| Option | Description | Selected |
|--------|-------------|----------|
| Mountain theme with Lumi on dark background | Consistent with app branding | ✓ |
| Abstract gradient with app name only | Simpler design | |
| Screenshot collage | Shows app screens | |

**User's choice:** [auto] Mountain theme with Lumi (recommended)
**Notes:** PROJECT.md specifies dark theme with Lumi visible.

---

## App Icon

| Option | Description | Selected |
|--------|-------------|----------|
| Custom icon with Lumi/mountain + dark/gold theme | Branded, distinctive | ✓ |
| Keep default Capacitor icon | Faster but unprofessional | |
| Text-only "AF" icon | Simple but lacks character | |

**User's choice:** [auto] Custom Lumi/mountain icon (recommended)
**Notes:** Current icons are default Capacitor (green logo), unsuitable for Play Store.

---

## Privacy Policy Hosting

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Pages | Free, stable URL, already on GitHub | ✓ |
| Supabase hosted page | Same infra as app backend | |
| Separate hosting (Vercel/Netlify) | Another service to manage | |

**User's choice:** [auto] GitHub Pages (recommended)
**Notes:** Simplest option, no additional infra needed.

---

## Privacy Policy Content

| Option | Description | Selected |
|--------|-------------|----------|
| Simple readable format (not legalese) | User-friendly, covers required disclosures | ✓ |
| Full legal template | More comprehensive but harder to read | |

**User's choice:** [auto] Simple readable format (recommended)
**Notes:** Must disclose email collection, Supabase storage, Anthropic API processing per ASSETS-05.

---

## Claude's Discretion

- Canva template/layout details
- Font choices
- Privacy policy HTML styling
- Exact privacy policy wording beyond required disclosures
