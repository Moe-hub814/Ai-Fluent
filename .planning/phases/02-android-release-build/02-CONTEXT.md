# Phase 2: Android Release Build - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Produce a signed release AAB, verify it is correctly signed, and confirm it installs and runs via the Play Console Internal Testing track. Scope includes keystore security cleanup (gitignore), keystore backup guidance, the `bundleRelease` build, signature verification, and Internal Testing upload. Does not include Play Store listing, screenshots, or metadata — those are Phase 3 and 4.

</domain>

<decisions>
## Implementation Decisions

### Keystore Security
- **D-01:** Add `keystore.properties` and `*.keystore` / `*.jks` to `android/.gitignore` (uncomment the existing keystore lines and add `keystore.properties`). Do NOT rewrite git history or regenerate the keystore — the repo is private and the simplest approach is to just stop tracking them going forward.
- **D-02:** Remove `keystore.properties` and `ai-fluent-release.keystore` from git tracking using `git rm --cached` (keeps the local files but stops tracking). The files already exist on disk and are correctly configured in `build.gradle`.

### Keystore Backup
- **D-03:** Back up the keystore file (`ai-fluent-release.keystore`) and credentials (alias: `aifluent`, password) to a password manager (e.g., Bitwarden, 1Password). This is a user-setup step — the plan should include a checkpoint reminding the user to complete this before proceeding.

### Build Process
- **D-04:** The build pipeline is `npm run build` → `npx cap sync android` → `cd android && ./gradlew bundleRelease`. The signing config in `build.gradle` already reads from `keystore.properties` — no Gradle changes needed.
- **D-05:** Verify the AAB signature using `jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab`. Confirm the certificate alias matches `aifluent`.

### Upload & Verification
- **D-06:** Upload the AAB to Play Console Internal Testing track. Install on a physical Android device from the Internal Testing track link to confirm the release build launches and runs correctly (basic smoke test — not full QA).
- **D-07:** The Play Console Internal Testing upload is a manual user step. The plan should provide exact steps but cannot automate Play Console interactions.

### Version
- **D-08:** Keep `versionCode = 1` and `versionName = "1.0"` as-is. This is the first release — no reason to change.

### Claude's Discretion
- Exact commit message wording for the gitignore fix
- Whether to verify the duplicate keystore at `android/app/ai-fluent-release.keystore` is identical to `android/ai-fluent-release.keystore` and clean up if redundant
- Order of operations between git cleanup and build steps

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Build Configuration
- `android/app/build.gradle` — Release signing config already configured (reads keystore.properties)
- `android/keystore.properties` — Keystore credentials (storeFile, password, alias)
- `android/variables.gradle` — SDK versions (compileSdk 36, minSdk 24, targetSdk 36)
- `android/gradle/wrapper/gradle-wrapper.properties` — Gradle 8.14.3

### Security
- `android/.gitignore` lines 56-58 — Keystore lines currently COMMENTED OUT (must uncomment)
- `android/ai-fluent-release.keystore` — Release keystore (alias: aifluent)
- `android/app/ai-fluent-release.keystore` — Possible duplicate of the above

### Requirements
- `.planning/REQUIREMENTS.md` — BUILD-01 through BUILD-05 define acceptance criteria
- `.planning/PROJECT.md` — Keystore security constraint, JDK 21 requirement

### Prior Phase
- `.planning/phases/01-android-layout-fixes/01-CONTEXT.md` — D-07 already added android.backgroundColor to capacitor.config.json

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `android/app/build.gradle` signingConfigs.release block — already fully configured, reads from keystore.properties
- `android/keystore.properties` — credentials already populated (storeFile, storePassword, keyAlias, keyPassword)
- `android/ai-fluent-release.keystore` — keystore already generated with alias `aifluent`

### Established Patterns
- Capacitor build flow: `npm run build` → `npx cap sync android` → Gradle command
- Debug build already verified working in Phase 1 (`./gradlew assembleDebug` passed)
- `minifyEnabled false` in release build type — correct for Capacitor apps (do not enable)

### Integration Points
- `capacitor.config.json` already has `android.backgroundColor: "#060D1A"` (Phase 1)
- `android/app/src/main/assets/capacitor.config.json` synced copy updated by `npx cap sync`
- Web assets built to `dist/` by `npm run build`, then copied to Android by `cap sync`

</code_context>

<specifics>
## Specific Ideas

- The keystore and signing config are already set up — this phase is primarily about security cleanup, building, and verifying rather than configuration from scratch
- JDK 21 is confirmed available (`openjdk 21.0.10`)
- The duplicate keystore at `android/app/ai-fluent-release.keystore` should be investigated — `build.gradle` references `file(keystoreProperties['storeFile'])` which resolves to `ai-fluent-release.keystore` relative to the `android/` directory, so the copy in `android/app/` may be unnecessary

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-android-release-build*
*Context gathered: 2026-04-17*
