# Phase 2: Android Release Build - Pattern Map

**Mapped:** 2026-04-17
**Files analyzed:** 1 modified (0 new source files — this is a build/ops phase)
**Analogs found:** 1 / 1

---

## Phase Character

Phase 2 is a build, security, and ops phase. It has **no new application source code**. The only file edit is `android/.gitignore`. The remaining work consists of:

- Shell commands (git, Gradle, jarsigner)
- Manual user steps (keystore backup, Play Console upload, device smoke test)

Pattern guidance here therefore focuses on (a) the `.gitignore` edit shape, (b) the exact Gradle/jarsigner command sequences to follow, and (c) the verified state of the existing signing config that must not be touched.

---

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `android/.gitignore` | config (git exclude rules) | build-time | `android/.gitignore` lines 56-58 (commented keystore block already present) | exact (uncomment + extend the same block) |

---

## Pattern Assignments

### `android/.gitignore` (config, build-time)

**Analog:** `android/.gitignore` lines 55-58 — the existing, commented-out keystore exclusion block.

**Current state** (lines 55-58):
```
# Keystore files
# Uncomment the following lines if you do not want to check your keystore files in.
#*.jks
#*.keystore
```

**What to produce** (per D-01):
```
# Keystore files
# Uncomment the following lines if you do not want to check your keystore files in.
*.jks
*.keystore
keystore.properties
```

**Edit shape:**
1. Remove the `#` prefix from `#*.jks` (line 57).
2. Remove the `#` prefix from `#*.keystore` (line 58).
3. Add `keystore.properties` as a new line immediately after line 58 (no blank line separator — stays within the same thematic block).

**Root `.gitignore` analog for style reference** (`C:/Users/hamou/ai-fluent/.gitignore`):
```
node_modules
dist
dist-ssr
*.local
```
The root `.gitignore` uses bare glob patterns with no trailing comments and no blank-line separators within a block — the same minimal style to follow when adding `keystore.properties`.

---

## Shared Patterns (Shell Command Sequences)

These are not code patterns but are the exact command sequences the planner must embed in action steps. They are derived from the verified project state, not inferred.

### Git Untracking (D-02)

**Context:** Both `android/ai-fluent-release.keystore` and `android/app/ai-fluent-release.keystore` are identical files (confirmed: same MD5 `b031647219e094fb8f4cd9b76e2fb96e`, same size 2764 bytes, same mtime 2026-04-07). The copy at `android/app/` is redundant — `build.gradle` resolves `storeFile` relative to `android/`, not `android/app/`. Both should be untracked.

**Command sequence:**
```bash
git rm --cached android/ai-fluent-release.keystore
git rm --cached android/app/ai-fluent-release.keystore
git rm --cached android/keystore.properties
```

These commands remove the files from git's index (stop tracking) while leaving the physical files on disk. Run only after the `.gitignore` edit is in place so the files are immediately covered by the new rules.

**Commit message pattern** (matching project commit style seen in git log):
```
fix(security): exclude keystore and credentials from git tracking
```

### Build Pipeline (D-04)

**Context:** Debug build already verified in Phase 1 via `./gradlew assembleDebug`. Release build uses the same pipeline with `bundleRelease` instead.

**Prerequisite check:**
```bash
java -version
# Must report: openjdk 21.x (JDK 21 confirmed available on this machine)
```

**Full pipeline:**
```bash
npm run build
npx cap sync android
cd android && ./gradlew bundleRelease
```

**Expected output artifact:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

**Do NOT change** `minifyEnabled false` in `android/app/build.gradle` line 35 — correct for Capacitor apps per REQUIREMENTS.md out-of-scope list.

### AAB Signature Verification (D-05)

**Command:**
```bash
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

**What to confirm in output:**
- Line containing `jar verified.`
- Certificate subject should reference the `aifluent` alias (the CN in the cert will match what was entered during `keytool -genkey` — the alias itself does not appear verbatim in jarsigner output, but the cert's DN should be recognizable as the one generated for this project)
- No `WARNING` lines about untrusted cert chain are expected for a self-signed release keystore (these are normal — not a failure)

### Duplicate Keystore Cleanup (Claude's Discretion)

**Finding:** `android/app/ai-fluent-release.keystore` is confirmed identical to `android/ai-fluent-release.keystore` (same MD5). The `build.gradle` signing config resolves the path relative to the `android/` root directory:

```groovy
// android/app/build.gradle lines 19-21
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
```

```groovy
// android/app/build.gradle line 25
storeFile file(keystoreProperties['storeFile'])
```

`keystore.properties` line 1: `storeFile=ai-fluent-release.keystore` — this resolves to `android/ai-fluent-release.keystore` (relative to `android/`), NOT to `android/app/ai-fluent-release.keystore`. The `android/app/` copy is unused by the build.

**Recommendation for planner:** After untracking both files with `git rm --cached`, note in the plan that `android/app/ai-fluent-release.keystore` can be deleted from disk (it is unused). However, since both files are identical and the backup step (D-03) must happen first, the planner should sequence: backup → gitignore edit → git rm --cached both → optionally delete the app/ copy.

---

## Existing Signing Config — Read-Only Reference

These files are **already correctly configured**. The planner must reference them as-is and must NOT modify them.

### `android/app/build.gradle` — Signing config (lines 19-38)

```groovy
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

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
```

### `android/keystore.properties` — Credentials (lines 1-4)

```
storeFile=ai-fluent-release.keystore
storePassword=Alsahlani1$
keyAlias=aifluent
keyPassword=Alsahlani1$
```

### `android/variables.gradle` — SDK versions (lines 1-5)

```groovy
ext {
    minSdkVersion = 24
    compileSdkVersion = 36
    targetSdkVersion = 36
    ...
}
```

### `android/gradle/wrapper/gradle-wrapper.properties` — Gradle version

```
distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.3-all.zip
```

---

## No Analog Found

None. The single file edit (`android/.gitignore`) has a direct self-analog in the same file (the commented block it extends).

---

## Sequencing Note for Planner

The correct order of operations for this phase is:

1. **Backup first (D-03)** — user manually backs up `android/ai-fluent-release.keystore` + credentials to password manager before any git operations. This is a blocking checkpoint; the planner must surface it as a human gate.
2. **Gitignore edit (D-01)** — uncomment `*.jks`, `*.keystore`, add `keystore.properties`.
3. **Git untrack (D-02)** — `git rm --cached` both keystore files and `keystore.properties`.
4. **Commit** — commit the `.gitignore` change only (the untracked files disappear from staging automatically).
5. **Build (D-04)** — `npm run build → npx cap sync android → ./gradlew bundleRelease`.
6. **Verify (D-05)** — `jarsigner -verify` on the produced AAB.
7. **Upload and smoke test (D-06, D-07)** — manual user steps: upload to Internal Testing, install on device, confirm app launches.

Step 1 must precede step 3 because once the files are untracked and potentially deleted from `android/app/`, only the local on-disk copy and the backup remain.

---

## Metadata

**Analog search scope:** `android/.gitignore`, `android/app/build.gradle`, `android/keystore.properties`, `android/variables.gradle`, `android/gradle/wrapper/gradle-wrapper.properties`, `.gitignore` (root), `.planning/phases/01-android-layout-fixes/01-PATTERNS.md`
**Files scanned:** 7
**Keystores verified:** `android/ai-fluent-release.keystore` and `android/app/ai-fluent-release.keystore` are byte-identical (MD5: `b031647219e094fb8f4cd9b76e2fb96e`, size: 2764 bytes)
**Pattern extraction date:** 2026-04-17
