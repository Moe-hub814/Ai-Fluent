# Phase 1: Android Layout Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 01-android-layout-fixes
**Areas discussed:** TOP_SAFE scope, display_name fix, _isNative detection

---

## TOP_SAFE Scope

| Option | Description | Selected |
|--------|-------------|----------|
| WorldMap only | Fix only the confirmed overlap with Summit node | |
| All top headers | Apply to any screen with a top header that could overlap status bar | ✓ |
| WorldMap + obvious ones | Fix what's broken now, leave rest for screenshot review | |

**User's choice:** All top headers
**Notes:** Apply to every screen whose first element is a top header div — not just WorldMap.

---

## Display Name Fix Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Clear DB value only | Test account has bad data; code is fine | |
| Fix signup flow | New signups get wrong display_name (code fix in onboarding) | |
| Fix both + add guard | Clear DB AND add 3-step fallback in code | ✓ |

**User's choice:** Fix both + add guard
**Notes:** 3-step fallback: `display_name → email prefix → "Climber"`

---

## _isNative Detection

| Option | Description | Selected |
|--------|-------------|----------|
| Keep localhost | Useful for testing layout in browser during dev | |
| Android only | Only apply safe area on actual Android device | ✓ |

**User's choice:** Android only
**Notes:** Remove `||document.URL.includes("localhost")` clause. Dev will now see 0px safe area in browser, which is correct for web preview.

---

## Name Fallback Chain

| Option | Description | Selected |
|--------|-------------|----------|
| display_name → email prefix → 'Climber' | 3-step chain including email as intermediate | ✓ |
| display_name → 'Climber' only | Keep current 2-step, just guard against empty string | |

**User's choice:** display_name → email prefix → 'Climber'

---

## Claude's Discretion

- Exact inline style syntax for padding changes
- Whether to add a console.warn for missing display_name
- RTL/LTR handling (TOP_SAFE applies regardless)

## Deferred Ideas

- Edge-to-edge layout (Pattern B) — post-launch
- `@capacitor-community/safe-area` plugin — not needed, constants suffice
