# Features Research: Play Store Listing Requirements

**Project:** AI Fluent (com.aifluent.app)
**Researched:** 2026-04-16
**Overall confidence:** MEDIUM-HIGH — based on training knowledge through August 2025. All specs should be verified in Play Console before submission since Google updates requirements without announcement.

---

## Required Metadata

### App Title
- **Limit:** 30 characters
- **Required:** Yes
- **Notes:** Appears in search results and on the listing page. Keyword stuffing (e.g., "AI Fluent - Learn AI Artificial Intelligence") is against policy. Keep it clean and brandable. "AI Fluent" is well within the limit.

### Short Description
- **Limit:** 80 characters
- **Required:** Yes
- **Notes:** Already finalized: "Master AI with guided lessons, daily news & hands-on tools. Meet Lumi." — verify character count (71 chars — fits).

### Long Description
- **Limit:** 4,000 characters
- **Required:** Yes
- **Notes:** Plain text only — no HTML rendering in Play Store (line breaks are respected). Should cover: what the app does, key features, who it's for, and a call to action. Lead with the strongest hook in the first two sentences since those appear in collapsed form. Keyword placement matters for Play Store search (ASO).

### App Category
- **Required:** Yes — must select at least one
- **Recommended for AI Fluent:** "Education" as primary category. Secondary category is optional.
- **Available education subcategories:** No subcategory selection required for Education — the category alone is sufficient.

### Tags (formerly "App Tags")
- **Limit:** Up to 5 tags
- **Required:** No (optional but helps discoverability)
- **Notes:** Tags are selected from a Google-provided list, not free-form. Expect options like "Learning", "Artificial Intelligence", "Productivity", "Educational", "Technology". Select the 5 most relevant.

### Contact Details (Developer Information)
- **Required:** Yes — at minimum an email address
- **Fields:** Email address, phone number (optional), website (optional)
- **Notes:** The email becomes publicly visible on your listing. Use a support/developer address, not your personal email.

### Website URL
- **Required:** No, but strongly recommended
- **Notes:** If you have a landing page or the Vercel web build, add it here.

### Privacy Policy URL
- **Required:** Yes — mandatory for all apps (see Privacy & Safety section below)

---

## Screenshot Requirements

Google Play requires screenshots per device type. Phone is the only mandatory category for a new submission.

### Phone Screenshots (REQUIRED)
| Property | Requirement |
|----------|-------------|
| Minimum count | 2 screenshots |
| Maximum count | 8 screenshots |
| Format | PNG or JPEG |
| Min dimension | 320px on shortest side |
| Max dimension | 3,840px on longest side |
| Min aspect ratio | 16:9 (landscape or portrait) |
| Max aspect ratio | No stricter limit — standard phone aspect ratios accepted |
| Recommended size | 1080 x 1920px (portrait) or 1920 x 1080px (landscape) |
| Max file size | 8 MB per image |

**Practical guidance for AI Fluent:** Capture at 1080 x 1920px from a physical device or emulator. Dark theme looks strong. Plan for 5-6 screenshots covering: World Map, a Lesson screen, Lumi companion, AI News feed, one Tool (e.g., Email Writer), Achievements/Profile.

### 7-inch Tablet Screenshots (OPTIONAL)
| Property | Requirement |
|----------|-------------|
| Minimum count | 1 (if provided) |
| Format | PNG or JPEG |
| Recommended size | 1200 x 1920px |
| Max file size | 8 MB per image |

### 10-inch Tablet Screenshots (OPTIONAL)
| Property | Requirement |
|----------|-------------|
| Minimum count | 1 (if provided) |
| Format | PNG or JPEG |
| Recommended size | 1600 x 2560px |
| Max file size | 8 MB per image |

### Chromebook Screenshots (OPTIONAL)
| Property | Requirement |
|----------|-------------|
| Format | PNG or JPEG |
| Recommended size | 1920 x 1080px (landscape preferred for Chromebook) |

### Android TV Screenshots (OPTIONAL — not applicable)
Not relevant for AI Fluent.

**Note:** If you skip tablet/Chromebook screenshots, your app may still appear on those devices but Play Store will use phone screenshots scaled up, which looks poor. For a v1 launch, phone-only is acceptable.

---

## Graphic Assets

### Feature Graphic (REQUIRED)
| Property | Requirement |
|----------|-------------|
| Dimensions | 1024 x 500px (landscape, fixed — no flexibility) |
| Format | PNG or JPEG |
| Max file size | 1 MB |
| Required | Yes — mandatory for any app listing |

**What it's used for:** Displayed at the top of your Play Store listing on phones, and used as a banner in promotional slots if Google features your app. It is also the thumbnail shown when a promo video plays.

**Design guidance for AI Fluent:** Show Lumi prominently, use mountain/progression imagery, and include the app name. Do NOT put critical text near the edges (they get cropped on some surfaces). Keep safe zone: leave ~25px margin on all sides. Avoid including device mockups — the listing page already shows screenshots.

### App Icon (High-Resolution, Play Store)
| Property | Requirement |
|----------|-------------|
| Dimensions | 512 x 512px |
| Format | PNG (32-bit with alpha) |
| Max file size | 1 MB |
| Shape | Must be a full square — Google applies the rounded corner mask |
| Required | Yes |

**Critical distinction from APK icon:** The 512x512 PNG uploaded to Play Console is separate from the adaptive icon defined in `android/app/src/main/res/`. The Play Store high-res icon is what users see in search results and the listing page. The adaptive icon in the APK is what appears on the device home screen. Both need to be consistent, but they are uploaded separately to different places. The 512x512 goes to Play Console; the adaptive icon XML/PNGs are compiled into the APK/AAB.

**Design guidance:** Do not embed the icon in a white square — Google adds the rounded corners. Use a transparent or solid background that works on both light and dark surfaces. The icon should be readable at 48x48dp (tiny in search grids).

### Promo Video (OPTIONAL)
- YouTube URL only (no direct upload)
- If provided, the feature graphic becomes the video thumbnail
- Not required for launch — skip for v1

---

## Content Rating

Google Play uses the **IARC (International Age Rating Coalition)** system. You fill out a questionnaire in Play Console and receive ratings from multiple regional boards automatically (ESRB, PEGI, USK, ClassInd, etc.).

### What to Expect for AI Fluent (Educational AI App)

**Questionnaire categories you will encounter:**
1. Violence — Does the app contain violent content? **Answer: No**
2. Sexual content — Does the app contain sexual or suggestive content? **Answer: No**
3. Language — Does the app contain profanity or crude humor? **Answer: No**
4. Controlled substances — Does the app reference drugs/alcohol/tobacco? **Answer: No**
5. Fear/horror — Does the app contain frightening content? **Answer: No**
6. Gambling — Does the app simulate or reference gambling? **Answer: No**
7. Interactive digital purchases — Does the app allow purchases? **Answer: depends on your IAP status — for v1 likely No**
8. User-generated content — Does the app allow users to create/share content? **Answer: Likely No for v1** (users interact with AI tools but don't post public content)
9. Location sharing — Does the app share user location? **Answer: No**
10. Personal information sharing online — Does the app allow communication with others? **Answer: No** (the AI tools call your backend, not user-to-user)

**Expected rating:** "Everyone" (E) on ESRB / "3+" on PEGI — the best possible rating. An educational AI literacy app with no violence, UGC, or mature content will sail through with the lowest age rating.

**One nuance:** If you answer "Yes" to the app having a backend that processes user input (AI tools send prompts to Claude), IARC may ask follow-up questions about content filtering. Be prepared to explain that responses are filtered and the app is educational. This does not change your final rating for a clean educational app.

**Time to complete:** The IARC questionnaire takes approximately 10-15 minutes. The rating is issued instantly after submission.

**Re-rating:** If you later add features (e.g., user-generated content, social sharing), you must re-complete the questionnaire. For v1 scope this is not a concern.

---

## Privacy & Safety

### Privacy Policy URL (REQUIRED)

A privacy policy URL is **mandatory** for all apps on Google Play, with no exceptions. You must:
1. Host the privacy policy at a stable, publicly accessible URL
2. Enter that URL in Play Console under "App content" > "Privacy policy"
3. The same URL should also appear in your app's "About" or settings screen (best practice, not strictly enforced at submission but required by policy)

**What the policy must cover for AI Fluent:**
- What data is collected (email address for auth, usage/progress data, prompts sent to AI tools)
- How data is stored (Supabase — mention cloud storage)
- Third-party services used (Supabase, Anthropic Claude API via your proxy)
- How users can delete their account and data
- Contact information for privacy inquiries

**Minimum viable option:** A single-page hosted document (GitHub Pages, Vercel, or any public URL). Avoid Google Docs links — they can break. A dedicated `/privacy` route on the Vercel web build is clean and reliable.

### Data Safety Section (REQUIRED)

The Data Safety section in Play Console is separate from the privacy policy and is a structured declaration of your data practices. Users see it on your listing page. It consists of:

**Section 1: Data collection and sharing**
You declare what categories of data the app collects. For AI Fluent, expected declarations:

| Data Type | Collected? | Shared? | Encrypted? | User Deletable? |
|-----------|-----------|---------|-----------|----------------|
| Email address | Yes | No | Yes (Supabase) | Yes |
| User ID / account info | Yes | No | Yes | Yes |
| App interactions (progress, streaks) | Yes | No | Yes | Yes |
| User-generated content (AI tool prompts) | Yes | No (sent to Claude proxy, not stored long-term) | Yes (in transit) | N/A |

**Section 2: Security practices**
- Data encrypted in transit: Yes (HTTPS)
- Data encrypted at rest: Yes (Supabase handles this)
- You follow Google Play Families Policy: No (not a children's app)
- You provide a way for users to delete their data: Yes (required if you collect account data)

**Section 3: Types of data collected (categories)**
Select all that apply:
- Account info (email, username)
- App activity (app interactions, in-app search history if any)
- (Do NOT select "Location", "Financial info", "Health & fitness", etc.)

**Time to complete:** 20-30 minutes. Changes to the Data Safety section require re-review if you materially change your data practices.

**Important:** Your Data Safety declarations must match what your privacy policy says. Inconsistencies can cause rejection.

---

## Technical Requirements

### Target API Level (targetSdkVersion)
- **Required for new app submissions (2025):** targetSdkVersion must be **34 or higher** (Android 14)
- Google typically mandates the latest - 1 API level, updated annually each August. As of 2025, API 34 is the floor for new apps; by August 2025 this likely moved to API 35 (Android 15).
- **Action required:** Check your `android/app/build.gradle` or `android/variables.gradle` to confirm `targetSdkVersion`. Capacitor 8.x should target API 34+ by default but verify.
- **Confidence: MEDIUM** — verify the exact current requirement in Play Console when you open the app submission flow, as Google shows the current minimum there.

### Minimum SDK Version (minSdkVersion)
- **No Google-enforced floor** for minSdk, but apps targeting minSdk below 21 (Android 5.0) get significantly reduced distribution.
- **Recommended:** minSdk 24 (Android 7.0) or higher for a new 2025 app. Capacitor 8 defaults to minSdk 22.
- Setting minSdk too low creates compatibility surface you don't need. minSdk 24-26 is a practical sweet spot.

### App Bundle Format (AAB)
- **Required:** Google Play requires Android App Bundle (.aab) format for all new app submissions. APK upload is no longer accepted for new apps.
- This is already noted in PROJECT.md as a confirmed decision.

### App Signing
- **Required:** Use Play App Signing (Google manages the upload key). You generate a keystore and use it to sign the AAB for upload; Google re-signs for distribution. This is the default and recommended flow.
- Your upload keystore must be kept safe — if lost, you cannot publish updates (you'd need to submit a key recovery request to Google, which is not guaranteed).

### APK/AAB Size
- Maximum AAB size: 150 MB
- If your app exceeds this, you'd need Play Asset Delivery (not applicable for AI Fluent — a Capacitor web app is typically 10-30 MB).

### Permissions Declaration
- Any sensitive permissions used by the app (camera, microphone, contacts, location, etc.) will be flagged during review. AI Fluent uses: internet access (always allowed, no declaration needed), storage (check if Capacitor plugins use it). Declare the minimum necessary.

### Review Timeframe
- **New app:** Typically 1-7 days for initial review. First-time submissions from new developer accounts can take up to 7 days. Subsequent updates are usually 1-3 days.
- **Do not submit on a Friday** if you need fast feedback — weekend reviews are slower.

---

## Table Stakes vs Optional

### Absolute Minimums — Cannot Submit Without These
| Requirement | Notes |
|-------------|-------|
| App title (30 chars max) | "AI Fluent" — done |
| Short description (80 chars max) | Already finalized |
| Long description (up to 4,000 chars) | Must write this |
| At least 2 phone screenshots | Must capture from device |
| Feature graphic (1024 x 500px) | Must create in Canva |
| High-res app icon (512 x 512px PNG) | Must export from design assets |
| Category selection | "Education" |
| Content rating (IARC questionnaire) | 10-15 min in Play Console |
| Privacy policy URL | Must publish and host |
| Data safety section | Must complete in Play Console |
| Signed AAB (targetSdk >= 34) | Must build |
| Developer contact email | Must provide in Play Console |

### Strongly Recommended — Impacts Discoverability and Impression
| Requirement | Notes |
|-------------|-------|
| 5-6 phone screenshots (not just 2) | More screenshots = better conversion |
| Tags (up to 5) | Small discoverability boost |
| Developer website URL | Adds credibility |
| Canva caption overlays on screenshots | Communicates features before user reads description |

### Optional — Skip for v1 Launch
| Requirement | Notes |
|-------------|-------|
| Tablet screenshots | Phone-only is fine for launch |
| Promo video | Nice to have, not blocking |
| Chromebook screenshots | Not your target device |
| Multiple listing languages (localized metadata) | App already supports EN/AR/FR — worth doing post-launch |

---

## Known Gaps and Verification Items

The following should be confirmed directly in Play Console before submission, as Google updates requirements without public notice:

1. **Exact targetSdkVersion floor** — The 2025 minimum. Play Console shows a banner during submission with the current requirement. Verify `android/variables.gradle` matches or exceeds it.
2. **Data Safety section UI** — The exact categories and options available may have expanded since training cutoff. The declarations above are accurate in spirit but verify the exact checkboxes.
3. **IARC questionnaire flow** — Questions may have been reworded or expanded. The expected outcome (Everyone/3+) should hold for AI Fluent's content profile.
4. **Tags available** — Google's tag taxonomy changes. "Artificial Intelligence" may or may not be a selectable tag — verify what's actually available in the dropdown.

---

*Source: Google Play Developer documentation and policies, training knowledge through August 2025. Confidence: MEDIUM-HIGH for specs (character limits, dimensions, formats are stable); MEDIUM for policy requirements (subject to Google updates).*
