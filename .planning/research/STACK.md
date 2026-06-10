# Stack Research: Android Release Build

**Project:** AI Fluent (com.aifluent.app)
**Researched:** 2026-04-16
**Current state:** Keystore and signing config ALREADY in place. This is a reference for correct usage and gaps.

---

## Current State (verified from disk)

The repo is further along than "keystore not yet generated." Key facts found:

| Item | State |
|------|-------|
| `android/app/ai-fluent-release.keystore` | EXISTS |
| `android/keystore.properties` | EXISTS (passwords in plaintext) |
| `android/app/build.gradle` signing config | COMPLETE — loads from keystore.properties |
| AGP version | 8.13.0 (android/build.gradle) |
| Gradle wrapper | 8.14.3 |
| compileSdk / targetSdk | 36 |
| minSdk | 24 |

The Gradle signing plumbing is done. The outstanding risk is that `keystore.properties` contains plaintext passwords and is NOT in `.gitignore` — it is currently committed to the repo (see critical warning below).

---

## Recommended Toolchain

| Tool | Version | Purpose | Rationale |
|------|---------|---------|-----------|
| JDK | 21 (LTS) | Compile + keytool | AGP 8.x requires JDK 17 minimum; JDK 21 is the current LTS and recommended for AGP 8.13+ / Gradle 8.14. JDK 11 or 17 will also work but 21 is forward-safe. |
| Android Gradle Plugin | 8.13.0 | Android build system | Already in use. Requires JDK 17+. |
| Gradle | 8.14.3 | Build orchestration | Already pinned in wrapper. Requires JDK 17+ to run. |
| Capacitor CLI | 8.3.0 | Web-to-native sync | Already in package.json |
| Vite | 7.3.1 | Web bundle | Already in use |
| Android SDK | compileSdk 36 | Target API level | Already configured |

**JDK note (HIGH confidence):** AGP 8.x officially requires JDK 17 minimum. JDK 21 exceeds that requirement and is safe. The user's stated requirement of "JDK 21 for Gradle compatibility" is correct and conservative — use it.

---

## Keystore Generation

**Status: ALREADY DONE.** `android/app/ai-fluent-release.keystore` exists with alias `aifluent`.

If you ever need to regenerate (e.g., for a new project), the exact command is:

```bash
keytool -genkey -v \
  -keystore android/app/ai-fluent-release.keystore \
  -alias aifluent \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass <STORE_PASSWORD> \
  -keypass <KEY_PASSWORD> \
  -dname "CN=AI Fluent, OU=Mobile, O=AI Fluent, L=Unknown, S=Unknown, C=US"
```

Flag rationale:
- `-keyalg RSA -keysize 2048` — required minimum for Play Store upload key
- `-validity 10000` — ~27 years; Play Store requires validity past Oct 22, 2033
- `-dname` — avoids interactive prompts in CI; values are not verified by Google
- `-alias aifluent` — matches what is in keystore.properties

**CRITICAL: The passwords in `android/keystore.properties` are plaintext and currently committed to git.** See the Security Warning section below.

---

## Gradle Signing Configuration

**Status: ALREADY COMPLETE.** `android/app/build.gradle` lines 19-30 contain the correct pattern.

Current configuration (already in place):

```groovy
// android/app/build.gradle (already present — do not duplicate)
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

The `storeFile` value in `keystore.properties` is `ai-fluent-release.keystore` (relative path). The `file()` call in `build.gradle` resolves relative to the `android/app/` directory, which is where the keystore lives. This is correct.

---

## Build Command

Three approaches exist. Use option 2 for a clean, reliable release AAB.

### Option 1 — `npx cap build android` (Capacitor CLI)
```bash
npx cap sync android
npx cap build android --release
```
- Runs `vite build`, syncs assets, then delegates to Gradle `bundleRelease`
- Convenient but adds a layer of abstraction
- **Confidence: MEDIUM** — works but less transparent; harder to debug if it fails

### Option 2 — Direct Gradle (RECOMMENDED)
```bash
# Step 1: Build the web bundle
npm run build

# Step 2: Sync web assets into the Android project
npx cap sync android

# Step 3: Build the signed release AAB
cd android && ./gradlew bundleRelease
```
Output file: `android/app/build/outputs/bundle/release/app-release.aab`

- Transparent, standard, identical to what Android Studio does internally
- Easiest to debug — Gradle output is verbose and specific
- **Confidence: HIGH**

### Option 3 — Android Studio UI
- Build > Generate Signed Bundle/APK > Android App Bundle > select existing keystore
- Good for one-off builds and visual verification
- Impractical for repeatable builds
- **Confidence: HIGH** (for manual use only)

**Recommended sequence for this project:**
```bash
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

On Windows with PowerShell/CMD replace `./gradlew` with `gradlew.bat`:
```bash
gradlew.bat bundleRelease
```

---

## Verification

### 1. Confirm the AAB exists and has non-trivial size
The output file should be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```
A valid AAB for a React app is typically 5–30 MB. A near-empty file (< 100 KB) means the web assets did not sync.

### 2. Check signing with `apksigner` (bundled with Android SDK build-tools)
```bash
# Path varies; example for SDK installed at ~/Android/Sdk
~/Android/Sdk/build-tools/36.0.0/apksigner verify --verbose \
  android/app/build/outputs/bundle/release/app-release.aab
```

### 3. Check signing with `jarsigner` (bundled with JDK, simpler)
```bash
jarsigner -verify -verbose -certs \
  android/app/build/outputs/bundle/release/app-release.aab
```
Look for: `jar verified` and the certificate CN matching your dname values.

### 4. Gradle signing report (lists all variant signing configs)
```bash
cd android && ./gradlew signingReport
```
Confirms the `release` build type is wired to your keystore, not the debug key.

### 5. Google Play Console pre-check
Upload to Play Console as an Internal Testing track before promoting to production. Play Console rejects unsigned or debug-signed AABs immediately with a clear error, so this is the definitive verification.

---

## Security Warning: Plaintext Credentials in Git

**This is a critical issue.** `android/keystore.properties` currently contains:
```
storePassword=Alsahlani1$
keyPassword=Alsahlani1$
```
These are committed to the repo (not in `.gitignore`). The `.gitignore` files comment out `*.keystore` lines and do NOT exclude `keystore.properties`.

**Immediate actions required:**

1. Add `keystore.properties` to `android/.gitignore` (uncomment or add the line)
2. Add `*.keystore` to `android/.gitignore` (uncomment the existing commented lines)
3. Back up both files to a secure location (password manager, encrypted storage) before removing from git
4. Rotate the password if this repo was ever pushed to a public remote

**For CI/CD** (if needed later), use environment variables:
```groovy
// Alternative build.gradle approach using env vars instead of file
signingConfigs {
    release {
        storeFile file(System.getenv("KEYSTORE_PATH") ?: keystoreProperties['storeFile'])
        storePassword System.getenv("STORE_PASSWORD") ?: keystoreProperties['storePassword']
        keyAlias System.getenv("KEY_ALIAS") ?: keystoreProperties['keyAlias']
        keyPassword System.getenv("KEY_PASSWORD") ?: keystoreProperties['keyPassword']
    }
}
```
For local development, keep `keystore.properties` as a gitignored local file.

---

## What NOT to Use

| Approach | Why Avoid |
|----------|-----------|
| `./gradlew assembleRelease` | Produces a `.apk`, not an `.aab`. Google Play requires AAB for new app submissions as of August 2021. |
| Debug signing config for release | Debug key has a short validity period and is not accepted by Play Store. `build.gradle` already correctly separates debug and release. |
| Checking `*.keystore` into a public repo | Permanent key compromise — anyone with the file and password can sign updates to your app. |
| `npx cap copy android` without `cap sync` | `copy` skips plugin config sync. Always use `cap sync` before building release. |
| Hardcoded passwords in `build.gradle` | Gradle files are typically committed; passwords become part of git history. Use `keystore.properties` (gitignored) or env vars instead. |
| JDK 8 or JDK 11 | AGP 8.13 requires JDK 17+. JDK 8/11 will fail with a build error. |

---

## Confidence Levels

| Recommendation | Confidence | Basis |
|----------------|------------|-------|
| JDK 21 requirement | HIGH | Official AGP 8.x docs require JDK 17+; JDK 21 is the current LTS |
| `./gradlew bundleRelease` as build command | HIGH | Standard Gradle task; same as Android Studio internally; verified against actual build.gradle in repo |
| keystore.properties pattern | HIGH | Official Android signing documentation; matches exactly what is already in the repo |
| `storeFile` relative path resolves to `android/app/` | HIGH | Verified from actual keystore.properties and build.gradle |
| `jarsigner -verify` for signature check | HIGH | JDK bundled tool; works on AAB files |
| Security risk of committed keystore.properties | HIGH | File read directly from disk — passwords are plaintext in git |
| `npx cap build android --release` works | MEDIUM | Documented in Capacitor CLI but adds abstraction; direct Gradle is more reliable for debugging |
| Play App Signing (Google manages app signing key) | HIGH | Required for new apps per Google Play policy 2021+ |
