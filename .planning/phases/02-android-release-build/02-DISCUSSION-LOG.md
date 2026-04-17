# Phase 2: Android Release Build - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 02-android-release-build
**Areas discussed:** Keystore git cleanup, Keystore backup plan, Build & upload process

---

## Keystore Git Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Gitignore only (Recommended) | Uncomment *.keystore and add keystore.properties to .gitignore. Password stays in git history but repo is private. | ✓ |
| Gitignore + new password | Gitignore the files AND regenerate the keystore with a fresh password. Old password is burned. | |
| Rewrite git history | Use git filter-branch or BFG to scrub the files from all history. Most thorough but destructive. | |

**User's choice:** Gitignore only
**Notes:** Repo is private, simplest approach. No history rewrite or keystore regeneration needed.

---

## Keystore Backup Plan

| Option | Description | Selected |
|--------|-------------|----------|
| Password manager (Recommended) | Store keystore file + password in password manager (Bitwarden, 1Password). Encrypted, synced, accessible. | ✓ |
| Cloud drive | Copy to Google Drive / OneDrive in a dedicated encrypted folder. | |
| Manual / already handled | User handles backup — just include as a reminder step in the plan. | |

**User's choice:** Password manager
**Notes:** Critical item — losing keystore = can never update the app on Google Play.

---

## Build & Upload Process

| Option | Description | Selected |
|--------|-------------|----------|
| Sign check + install test (Recommended) | Verify AAB with jarsigner, upload to Internal Testing, install on device. | ✓ |
| Sign check only | Just verify signature, skip device install. | |
| Full QA pass | Sign check + install + walk through all features on release build. | |

**User's choice:** Sign check + install test
**Notes:** Balanced approach — verify signing is correct and confirm app launches from Internal Testing track.

---

## Claude's Discretion

- Exact commit message wording for gitignore fix
- Duplicate keystore cleanup (android/app/ copy)
- Order of operations between git cleanup and build

## Deferred Ideas

None — discussion stayed within phase scope
