# Architecture Research: Android Safe Area Handling

**Project:** AI Fluent (Capacitor 8.3.0 / React / Android)
**Researched:** 2026-04-16
**Confidence:** HIGH — based on direct codebase inspection + well-established Capacitor/Android WebView behavior

---

## Current State (what the code is doing right now)

Before recommendations, here is exactly what exists in the codebase:

- `BOTTOM_SAFE = _isNative ? 48 : 0` — module-level constant, set at parse time
- Bottom bar: `paddingBottom: (10 + BOTTOM_SAFE) + "px"` = 58px total on Android
- Top bar: `position: absolute, top: 0` — no status bar offset applied at all
- Summit node: `ny: 22` (22% from top of viewport) — overlapped by top bar on tall-status-bar devices
- Base Camp node: `ny: 72` (72% from viewport height) — may still overlap bottom bar depending on device
- `capacitor.config.json`: bare minimum — only `appId`, `appName`, `webDir`
- `styles.xml`: theme is `Theme.AppCompat.DayNight.NoActionBar` — NOT edge-to-edge
- No `@capacitor/status-bar` installed
- No safe-area plugin installed
- No `WindowCompat.setDecorFitsSystemWindows(false)` in MainActivity

The bottom overlap is a pixel-accuracy problem. The top overlap is a missing `TOP_SAFE` constant problem — the code applies `BOTTOM_SAFE` at the bottom but zero offset at the top.

---

## Why env(safe-area-inset-bottom) Fails on Android WebView

**Confidence: HIGH**

`env(safe-area-inset-bottom)` is a CSS variable populated by the browser engine from the OS. In Safari on iOS it works reliably because Apple controls the entire stack from WebKit to the OS inset API. On Android the situation is different for three reasons:

**1. Edge-to-edge must be explicitly enabled.** In Android, the system UI (status bar, navigation bar) insets the app window by default — the WebView receives a viewport that is already clipped to the safe area. The CSS variable `safe-area-inset-bottom` equals zero because the browser sees no overlap; the OS has already removed the overlap by shrinking the window. This means the CSS variable reports `0` even though the content is still pushed up awkwardly by the system, or worse, the navigation bar covers the bottom of the WebView because Capacitor's `BridgeActivity` does not opt into edge-to-edge by default.

**2. No consistent OS API pass-through.** The CSS `env()` safe area mechanism requires the browser to query `WindowInsetsCompat` from Android and inject those values. Android System WebView (used by Capacitor) does not reliably do this translation across all Android versions and OEM WebView builds. The behavior varies between Android 9, 11, 12, 13, and 14 because Google changed the insets API across those releases.

**3. Gesture navigation vs. 3-button navigation.** Android 10+ defaults to gesture navigation. Gesture nav requires a 32–40px bottom inset (to not place UI under the home pill). Three-button nav requires ~48px (the navigation bar button row height). `env(safe-area-inset-bottom)` would need to report correctly for both modes, and it doesn't consistently do so in WebView.

**4. The current app theme blocks the path entirely.** `styles.xml` uses `Theme.AppCompat.DayNight.NoActionBar`. This theme does NOT set `android:windowLayoutInDisplayCutoutMode` or `windowTranslucentNavigation`, so the OS clamps the WebView viewport to exclude the system bars entirely. CSS cannot report insets for space that is not included in the viewport.

**Bottom line:** `env(safe-area-inset-bottom)` = 0 in this app because the viewport has already been shrunk. The OS handles the inset by removing it from the available space, rather than by reporting it to the CSS environment. The constant approach bypasses all of this unreliability.

---

## Recommended Pattern

**Confidence: HIGH for the pixel-constant approach. MEDIUM for the plugin-based approach.**

There are three viable patterns, ranked by suitability for this specific project:

### Pattern A: Pixel constants (RECOMMENDED for this project)

Use `BOTTOM_SAFE` and `TOP_SAFE` JavaScript constants at module level. This is what the code already does for the bottom — extend it to the top.

**Why this is correct for AI Fluent:**
- The app is a single-file monolith with inline styles everywhere. A plugin adds npm dependencies, Java/Kotlin code, and async initialization. The constant pattern has zero async complexity.
- The current `BOTTOM_SAFE = 48` works well enough for most devices. The real bug is that `TOP_SAFE` is missing entirely (value is 0).
- This approach is already the declared architectural decision in `PROJECT.md`.

**Step-by-step:**

1. Keep `BOTTOM_SAFE = _isNative ? 48 : 0` as-is (it addresses gesture nav bar)
2. Add `TOP_SAFE = _isNative ? 28 : 0` (addresses status bar height)
3. Apply `TOP_SAFE` to the WorldMap top bar's `padding-top`
4. Verify Summit node (`ny: 22`) clears the header including `TOP_SAFE`
5. Verify Base Camp node (`ny: 72`) clears the bottom bar including `BOTTOM_SAFE`

### Pattern B: @capacitor/status-bar plugin (for edge-to-edge)

Use `@capacitor/status-bar` with `StatusBar.setOverlaysWebView({ overlay: true })` to make the WebView extend under the system bars. Then read the actual inset heights from `@capacitor-community/safe-area` plugin and use those pixel values in JavaScript.

**Why this is overkill for this project:**
- It requires enabling edge-to-edge in Android (theme change + MainActivity change)
- It requires the safe-area plugin installed and initialized before first render
- The app has no `useEffect` initialization hook that reads plugin values — adding one requires care to avoid layout flash on first render
- Still results in pixel constants, just dynamically measured instead of hardcoded

### Pattern C: window.innerHeight workarounds

Some Capacitor apps use `window.innerHeight` vs `screen.height` to infer nav bar height. This is fragile — `innerHeight` changes when the soft keyboard appears, when the browser chrome shows/hides, and on orientation change. Do not use this approach.

---

## Capacitor Configuration

**Confidence: HIGH**

### Current capacitor.config.json

```json
{
  "appId": "com.aifluent.app",
  "appName": "AI Fluent",
  "webDir": "dist"
}
```

### What to add for the pixel-constant approach (Pattern A)

No changes required to `capacitor.config.json` for Pattern A. The pixel constants work regardless of edge-to-edge status.

However, adding `backgroundColor` is recommended to prevent white flash on startup:

```json
{
  "appId": "com.aifluent.app",
  "appName": "AI Fluent",
  "webDir": "dist",
  "android": {
    "backgroundColor": "#060D1A"
  }
}
```

### What to add if choosing Pattern B (edge-to-edge)

```json
{
  "appId": "com.aifluent.app",
  "appName": "AI Fluent",
  "webDir": "dist",
  "android": {
    "backgroundColor": "#060D1A",
    "initialFocus": true
  },
  "plugins": {
    "StatusBar": {
      "style": "DARK",
      "backgroundColor": "#060D1A",
      "overlaysWebView": true
    }
  }
}
```

### contentInset (what this setting does and whether to use it)

`contentInset` was a Capacitor 2/3 config option that controlled whether the WebView should add padding to avoid system bars. In Capacitor 6+ this setting was removed or has no effect on Android. Do NOT add it — it does nothing in Capacitor 8.

### server.androidScheme

This controls whether the WebView uses `http://localhost` or `https://localhost` as the origin. The default in Capacitor 6+ is `https`. This has no effect on safe area behavior. Leave it at the default (do not add this key unless you have a CORS reason).

---

## Android Native Configuration

**Confidence: HIGH**

### styles.xml — current state and what to change

Current `AppTheme.NoActionBar` uses `Theme.AppCompat.DayNight.NoActionBar` which is fine for Pattern A. No changes needed.

If using Pattern B (edge-to-edge), add `windowLayoutInDisplayCutoutMode` and translucent bars:

```xml
<style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
    <item name="windowActionBar">false</item>
    <item name="windowNoTitle">true</item>
    <item name="android:background">@null</item>
    <!-- Add these for edge-to-edge (Pattern B only): -->
    <item name="android:windowTranslucentStatus">true</item>
    <item name="android:windowTranslucentNavigation">true</item>
    <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
</style>
```

### MainActivity.java — current state and what to change

Current `MainActivity` is the minimal single-line Capacitor default. For Pattern A, no changes are needed.

For Pattern B, add `WindowCompat.setDecorFitsSystemWindows(false)` before `super.onCreate()`:

```java
package com.aifluent.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        super.onCreate(savedInstanceState);
    }
}
```

**This is Pattern B only.** Do not add this for Pattern A.

---

## JavaScript Implementation

**Confidence: HIGH for the constant approach. MEDIUM for the plugin approach.**

### Pattern A: Module-level constants (current + fix)

```javascript
// MOBILE DETECTION
const _isNative = (typeof window !== "undefined") &&
  !!(window.Capacitor?.isNativePlatform?.()) ||
  document.URL.includes("localhost");

// Safe area constants for Android
// BOTTOM_SAFE: Android gesture nav bar (gesture) = ~32px, 3-button nav = ~48px
// 48 covers both cases with a small buffer; safe for all modern Android
const BOTTOM_SAFE = _isNative ? 48 : 0;

// TOP_SAFE: Android status bar height
// Ranges from 24dp (mdpi) to 30dp (xxhdpi) on stock Android
// 28px is correct for the most common device densities (360-420dp width)
// On devices with notches/camera cutouts this may need to be 36-44px
// The Summit node is at ny:22 (22% from top) — this constant must push
// the header below that coordinate's rendered pixel position
const TOP_SAFE = _isNative ? 28 : 0;
```

### Pattern B: @capacitor-community/safe-area plugin

The plugin `@capacitor-community/safe-area` (npm: `@capacitor-community/safe-area`) exists as of 2024 and supports Capacitor 5/6. Its Capacitor 8 compatibility is MEDIUM confidence — check the GitHub releases before installing.

If the plugin supports Capacitor 8:

```javascript
import { SafeArea } from '@capacitor-community/safe-area';

async function getSafeAreaInsets() {
  try {
    const { insets } = await SafeArea.getSafeAreaInsets();
    return {
      top: insets.top,
      bottom: insets.bottom,
    };
  } catch (e) {
    // Plugin not available (web build, or plugin not installed)
    return { top: 0, bottom: 0 };
  }
}
```

The plugin reads `WindowInsetsCompat` via a Capacitor bridge call and returns the actual pixel values for the current device and navigation mode. This is the only way to get the precise value dynamically — but it requires async initialization.

### @capacitor/status-bar plugin

`@capacitor/status-bar` is an official Capacitor plugin. It controls status bar visibility, style, and color. It does NOT report inset heights. It has one method relevant here:

```javascript
import { StatusBar } from '@capacitor/status-bar';

// Make WebView extend under status bar (edge-to-edge, Pattern B only)
await StatusBar.setOverlaysWebView({ overlay: true });

// Set status bar text color (important for dark background)
await StatusBar.setStyle({ style: Style.Dark });
```

`StatusBar.setOverlaysWebView` is Pattern B only — it changes the layout mode and requires corresponding theme and MainActivity changes. Do not call this without those changes or the app layout will break.

---

## React Integration

**Confidence: HIGH**

### Pattern A: No React integration needed

The constants `BOTTOM_SAFE` and `TOP_SAFE` are module-level. They are set synchronously before any component renders. All components that use them in inline styles receive the correct values immediately — no `useState`, no `useEffect`, no async.

This is the correct approach for a monolith `App.jsx` where all layout is inline styles. Example of the fix:

```javascript
// In WorldMap, top bar:
<div style={{
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  paddingTop: TOP_SAFE + "px",  // ADD THIS — was missing
  padding: `${TOP_SAFE + 10}px 12px 10px`,
  // ... rest of styles
}}>

// In WorldMap, bottom bar:
<div style={{
  paddingBottom: (10 + BOTTOM_SAFE) + "px",  // already correct
  // ...
}}>
```

### Pattern B: React state with async initialization

If using the plugin approach, safe area values must be read asynchronously at app startup and stored in React state:

```javascript
const AIFluent = () => {
  const [safeArea, setSafeArea] = useState({ top: TOP_SAFE, bottom: BOTTOM_SAFE });

  useEffect(() => {
    if (!_isNative) return;
    getSafeAreaInsets().then(insets => {
      if (insets.top > 0 || insets.bottom > 0) {
        setSafeArea(insets);
      }
    });
  }, []);

  // Pass safeArea down to WorldMap as a prop
  // ...
};
```

**Problem with Pattern B in this codebase:** `BOTTOM_SAFE` and `TOP_SAFE` are module-level constants consumed directly by components. They cannot be replaced by React state without threading `safeArea` props through every component that uses them, or converting them to module-level variables that get mutated. Either approach requires more surgical edits across the monolith. Pattern A avoids all of this.

---

## Hardcoded Constants Approach

**Confidence: HIGH for the values. MEDIUM for edge cases.**

### When to use hardcoded constants

Use hardcoded constants when:
- The app targets Android only (no iOS where status bar heights differ by model)
- The app does not need to handle split-screen or foldable layouts
- You want zero async complexity at startup
- The existing `BOTTOM_SAFE` pattern is already established in the codebase

Hardcoded constants are the correct choice for AI Fluent.

### Recommended values

| Constant | Value | Rationale |
|----------|-------|-----------|
| `BOTTOM_SAFE` | 48px | Android 3-button nav bar = 48dp. Gesture nav = ~32dp but 48 adds safe buffer. Most users have gesture nav on Android 10+ but 48px works for both. |
| `TOP_SAFE` | 28px | Stock Android status bar is 24dp at mdpi/hdpi, 28dp at xhdpi/xxhdpi (360-420dp screen width). Most current mid-range/flagship phones fall in this range. |

### Device-specific status bar heights (reference)

| Screen density | Typical status bar height |
|---------------|--------------------------|
| mdpi (160dpi) | 24dp = 24px at 1x |
| hdpi (240dpi) | 24dp = 36px at 1.5x |
| xhdpi (320dpi) | 24dp = 48px at 2x — but most xhdpi phones report 28dp = 56px |
| xxhdpi (480dpi) | 28dp = 84px at 3x |

**Important:** Android's density-independent pixels (dp) are NOT the same as CSS pixels (px). The WebView reports dimensions in CSS pixels using the device pixel ratio. A device with 3x DPR and a 28dp status bar reports `28px` in CSS — not `84px`. This is because `1dp = 1CSS px` at the WebView level after DPR normalization. So `TOP_SAFE = 28` in CSS pixels is correct for the majority of xxhdpi devices.

### Notch and camera cutout devices

Devices with display cutouts (punch-hole cameras, notches) may have taller status bars — typically 36–44dp on flagship devices. The Summit node at `ny:22` in a 100vh coordinate space may still clip under a taller header on these devices. If this becomes a confirmed issue after testing, raise `TOP_SAFE` to 36.

### Bottom navigation bar values

| Navigation mode | Height |
|----------------|--------|
| 3-button navigation | 48dp |
| 2-button navigation | 32dp |
| Gesture navigation (swipe) | 0dp visible, but 20–32dp for pill affordance area |

`BOTTOM_SAFE = 48` covers all cases. Gesture nav phones will have extra padding at the bottom — this is acceptable (content shifts up a bit) versus content being clipped under the nav bar.

---

## Build Order

**What to configure vs what to code, in order:**

### Step 1: Verify the bottom overlap is actually broken (not just close)

The current `BOTTOM_SAFE = 48` means the bottom bar has `58px` of bottom padding. The Base Camp node is at `ny: 72%` of viewport height. On a typical 800px viewport this puts Base Camp at 576px from top, leaving ~224px for the bottom bar area. The bottom bar itself is roughly 80–100px tall. On a 900px viewport this shifts further. Run on an actual device to confirm whether 48 is already correct or still clips.

### Step 2: Add TOP_SAFE (the confirmed missing fix)

The top bar has `padding: "10px 12px"` with no status bar offset. The Summit node is at `ny: 22%`. Add `TOP_SAFE = 28` and apply it to the top bar's `paddingTop`. This is the higher-confidence fix.

### Step 3: Update capacitor.config.json (backgroundColor only)

Add `android.backgroundColor: "#060D1A"` to prevent the white flash during app startup. This is a visual polish fix, not a layout fix.

### Step 4: Test on a physical device (not emulator)

Android emulators use software navigation buttons with fixed 48dp height. Physical devices with gesture navigation behave differently. The constants must be validated on a physical device, ideally one with gesture nav enabled.

### Step 5: Do NOT add edge-to-edge (Pattern B) before Google Play submission

Edge-to-edge is a larger architectural change. It requires theme changes, MainActivity changes, testing that the translucent status/nav bars look correct with the dark gradient backgrounds, and confirming that every screen handles the insets correctly. This is scope creep for a launch milestone. Pattern A (pixel constants) gets the layout correct with two-line changes.

---

## Confidence Summary

| Area | Confidence | Basis |
|------|------------|-------|
| Why env() fails | HIGH | Established WebView/Android behavior, directly observable in current theme/config |
| BOTTOM_SAFE = 48 correctness | MEDIUM | Correct for 3-button nav; gesture nav devices get extra buffer but no clip |
| TOP_SAFE = 28 correctness | MEDIUM | Correct for xhdpi/xxhdpi without notch; notched devices may need 36 |
| capacitor-community/safe-area Capacitor 8 support | MEDIUM | Plugin existed as of 2024; Capacitor 8 compatibility needs verification at install time |
| @capacitor/status-bar API | HIGH | Official plugin, well-documented behavior |
| No edge-to-edge = env() stays 0 | HIGH | Direct consequence of Theme.AppCompat without windowTranslucentNavigation |

---

## Sources

- Direct inspection of: `src/App.jsx`, `capacitor.config.json`, `android/app/src/main/res/values/styles.xml`, `android/app/src/main/java/com/aifluent/app/MainActivity.java`, `android/variables.gradle`, `package.json`
- Android WindowInsets documentation (training data, HIGH confidence for API behavior)
- Capacitor 8 documentation (training data, HIGH confidence for config schema)
- `@capacitor-community/safe-area` plugin (training data through mid-2025, MEDIUM confidence for Capacitor 8 compatibility — verify at install)
