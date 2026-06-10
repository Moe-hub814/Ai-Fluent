# Research Summary: AI Fluent - Google Play Launch

**Project:** AI Fluent (com.aifluent.app)
**Domain:** Android app publishing - Capacitor WebView to Google Play
**Researched:** 2026-04-16
**Confidence:** HIGH (stack and architecture verified from codebase); MEDIUM (Play Store policy subject to Google updates)

---

## Executive Summary

AI Fluent is a feature-complete React/Vite/Capacitor app that needs to be packaged and shipped to Google Play, not built. The work is almost entirely configuration, layout fixes, and compliance work. Signing infrastructure is already in place (keystore exists, build.gradle signing config complete), and the build toolchain is correct (AGP 8.13.0, Gradle 8.14.3, targetSdkVersion 36). Recommended release path is direct Gradle: npm run build, npx cap sync android, cd android, ./gradlew bundleRelease. Output: android/app/build/outputs/bundle/release/app-release.aab.

Two layout bugs require surgical fixes before screenshots are worth capturing. BOTTOM_SAFE=48 exists but TOP_SAFE is missing entirely. TOP_SAFE=28 must be added and applied to the World Map top bar. The display name fallback bug (shows string AI instead of real user name) must be fixed before screenshots. Both are 1-3 line changes in App.jsx. Do not pursue env(safe-area-inset-bottom): it reports zero because the theme does not opt into edge-to-edge, and hardcoded constants are the correct established pattern.

The highest-risk item is not technical. android/keystore.properties contains plaintext passwords and is not in .gitignore. The keystore binary is also not excluded. These files must be gitignored and backed up offline before any git add touches android/. As an AI app sending user text to Anthropic Claude API, the Data Safety section must declare user-generated content is shared with a third party. This is the most commonly missed item for AI apps and causes post-review rejections.
---

## Recommended Stack

The build toolchain is already in place. JDK 21 is required (AGP 8.13+ needs JDK 17+; JDK 21 is current LTS). Direct Gradle is more reliable than npx cap build android --release because it is transparent and debuggable.

**Core technologies:**
- JDK 21: required for AGP 8.13.0 / Gradle 8.14.3 compatibility
- ./gradlew bundleRelease: produces signed AAB; do not use assembleRelease (APK, rejected by Play)
- npx cap sync android: must run after every npm run build or AAB will contain stale web assets
- android/app/ai-fluent-release.keystore: exists; alias aifluent; back up offline before proceeding
- Play App Signing: enroll before first upload to make upload key loss recoverable

**Build sequence (non-negotiable order):**

    npm run build
    npx cap sync android
    cd android && ./gradlew bundleRelease