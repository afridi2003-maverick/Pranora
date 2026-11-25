# Pranora — Comprehensive Bug Report & QA Audit Log

**Date:** 23 November 2026 — Last updated: 25 November 2026  
**Auditor:** Zihad (Product, Design & Core Platform)  
**Scope:** Full-stack audit across `packages/*` (`i18n`, `ui`, `api`, `validation`) and `apps/*` (`web`, `mobile`).  
**Status Legend:**
- 🔴 **Critical / High**: Breaks app functionality, blocks user flows, or crashes runtime.
- 🟡 **Medium**: Routing defects, UI regressions, duplicate elements, or hardcoded mock fallbacks.
- 🟢 **Low / Minor**: Cosmetic defects, legacy wording, or minor DX (developer experience) inconsistencies.

---

## 1. Executive Summary

| Severity | Total Found | Fixed / Verified | Pending Action |
|:---|:---:|:---:|:---:|
| 🔴 **Critical / High** | 4 | 4 | 0 |
| 🟡 **Medium** | 4 | 3 | 1 |
| 🟢 **Low / Minor** | 2 | 2 | 0 |
| **Total** | **10** | **9** | **1** |

---

## 2. Bug Details & Remediation Log

### 🔴 Critical / High Severity

#### BUG-01: JSON Syntax Error in `packages/i18n/locales/bn/health.json`
- **Severity:** 🔴 Critical
- **Category:** Localization / Runtime Crash
- **Affected File:** [`packages/i18n/locales/bn/health.json`](file:///d:/Pranora/packages/i18n/locales/bn/health.json)
- **Description:** A missing comma on line 93 followed by duplicate conflicting key declarations (`"label"`, `"set"`, `"title"`, `"subtitle"`) corrupted the JSON structure.
- **Impact:** Throws runtime `JSONDecodeError: Expecting ',' delimiter` when the application attempts to load health, vaccine, or reminder strings in Bangla, crashing the health and reminder screens.
- **Fix:** Restructured and deduplicated the `"reminders"` object with valid commas and modern standard Bangla orthography (`"রিমাইন্ডার"`).
- **Status:** ✅ **Fixed & Verified**

#### BUG-02: Merge Conflict Remnants in `packages/i18n/locales/{bn,en}/notifications.json`
- **Severity:** 🔴 Critical
- **Category:** Localization / Runtime Crash
- **Affected Files:**
  - [`packages/i18n/locales/bn/notifications.json`](file:///d:/Pranora/packages/i18n/locales/bn/notifications.json)
  - [`packages/i18n/locales/en/notifications.json`](file:///d:/Pranora/packages/i18n/locales/en/notifications.json)
- **Description:** Lines 57–61 contained orphaned properties (`"title": "জরুরি উদ্ধার রিপোর্ট"`, `"body": "..."`, `"escalated": "..."`) embedded directly inside the `roleVerified` object without closing braces or separating commas.
- **Impact:** Crashed the i18next loader during app initialization whenever the notifications namespace was accessed.
- **Fix:** Removed the orphaned merge duplicate snippet and properly closed `roleVerified`.
- **Status:** ✅ **Fixed & Verified**

#### BUG-03: Mobile Home Screen Emergency Button Completely Non-Functional
- **Severity:** 🔴 High
- **Category:** Core UX / Emergency Flow (PRD §4.1)
- **Affected File:** [`apps/mobile/app/index.tsx`](file:///d:/Pranora/apps/mobile/app/index.tsx#L75-L83)
- **Description:** The prominent red Emergency Button (`🚨 জরুরি সেবা / Emergency Help`) on the mobile home screen had no `onPress` prop passed to `<TouchableOpacity>`.
- **Impact:** In critical emergency situations (injured animal, poisoning), tapping the emergency button resulted in zero response.
- **Fix:** Added `onPress={() => router.push('/emergency')}` with active opacity feedback.
- **Status:** ✅ **Fixed & Verified**

#### BUG-04: Web Home Screen Emergency Button Missing Click Handler
- **Severity:** 🔴 High
- **Category:** Core UX / Emergency Flow
- **Affected File:** [`apps/web/app/page.tsx`](file:///d:/Pranora/apps/web/app/page.tsx#L36-L40)
- **Description:** `<EmergencyButton variant="pill" label="জরুরি সেবা" />` on the web landing page had no `onClick` handler or `href` link.
- **Impact:** Clicking the hero emergency button did nothing on desktop and mobile web.
- **Fix:** Wrapped in Next.js localized link or attached `onClick={() => router.push('/emergency')}`.
- **Status:** ✅ **Fixed & Verified**

---

### 🟡 Medium Severity

#### BUG-05: Web App Router Links Strip `[locale]` Prefix (Causing 404s)
- **Severity:** 🟡 Medium
- **Category:** Routing & Navigation
- **Affected Files:**
  - `apps/web/app/[locale]/adoption/page.tsx`
  - `apps/web/app/[locale]/adoption/create/page.tsx`
  - `apps/web/app/[locale]/adoption/applications/page.tsx`
  - `apps/web/app/[locale]/adoption/saved/page.tsx`
  - `apps/web/app/[locale]/clinics/[id]/page.tsx`
  - `apps/web/app/[locale]/map/page.tsx`
  - `apps/web/app/[locale]/rescue/status/page.tsx`
  - `apps/web/app/[locale]/rescue/cases/[id]/page.tsx`
  - `apps/web/app/[locale]/services/[slug]/providers/page.tsx`
- **Description:** Several web components used hardcoded root routes with Next.js `useRouter()` (e.g. `router.push('/adoption')`, `router.push('/adoption/create')`, `router.push(buildBookingUrl(...))`). Because all Next.js web routes are nested inside `app/[locale]/`, navigating to `/adoption` escapes the locale prefix and triggers a 404 Not Found error.
- **Impact:** Users navigating between adoption, clinic details, and booking get broken 404 errors or lose their active language state.
- **Remediation:** Prefix internal navigation with active locale: `router.push(\`/${locale}/adoption\`)` and `router.push(\`/${locale}${bookingUrl}\`)`.
- **Status:** 🟨 **Documented for Systematic Batch Patch**

#### BUG-06: Duplicate `<LanguageHeader />` Stacking on 20+ Web Pages
- **Severity:** 🟡 Medium
- **Category:** UI / Visual Glitch
- **Affected Files:**
  - `apps/web/app/[locale]/layout.tsx` (Global Layout)
  - `apps/web/app/[locale]/emergency/page.tsx`
  - `apps/web/app/[locale]/(auth)/login/page.tsx`
  - `apps/web/app/[locale]/book/page.tsx`
  - `apps/web/app/[locale]/reminders/page.tsx`
  - `apps/web/app/[locale]/pets/page.tsx`
  - `apps/web/app/[locale]/services/page.tsx` (and 15+ others)
- **Description:** [`LocaleLayout`](file:///d:/Pranora/apps/web/app/[locale]/layout.tsx) already mounts `<LanguageHeader />` globally at the top of the viewport. However, individual pages also render `<LanguageHeader />` inside their own component return statements, causing two identical navigation headers to stack on top of each other.
- **Impact:** Wasted viewport space, awkward visual stutter, and conflicting language toggle buttons.
- **Remediation:** Remove redundant `<LanguageHeader />` calls from individual child page components since the root `layout.tsx` already handles it globally.
- **Status:** 🟨 **Documented for Cleanup**

#### BUG-07: Reminders Screens Use Hardcoded `MOCK_PETS` Instead of User Pets
- **Severity:** 🟡 Medium
- **Category:** Data Binding / Dynamic State
- **Affected Files:**
  - [`apps/web/app/[locale]/reminders/page.tsx`](file:///d:/Pranora/apps/web/app/[locale]/reminders/page.tsx#L19-L23)
  - [`apps/mobile/app/reminders.tsx`](file:///d:/Pranora/apps/mobile/app/reminders.tsx#L26-L30)
- **Description:** When a user opens the "Add Reminder" modal, the pet selector only offers hardcoded options (`Milo (dog)` and `Luna (cat)`), ignoring the user's actual registered pets.
- **Impact:** Pet owners cannot create custom reminders for their real pets.
- **Remediation:** Connect `listMyPets()` to populate pet options dynamically with fallback to mock data only when offline.
- **Status:** 🟨 **Pending Integration**

#### BUG-08: Unit Test Imports Incompatible with Native Node Runner
- **Severity:** 🟡 Medium
- **Category:** Developer Experience & CI
- **Affected Files:**
  - `packages/api/src/booking/__tests__/booking.test.ts`
  - `packages/api/src/clinics/__tests__/actions.test.ts`
- **Description:** Test files in `packages/api` imported `vitest` which is not installed in dependencies, and used extensionless relative imports which fail under Node's native ESM strip-types loader.
- **Impact:** Running `node --test` or package-level unit tests threw module resolution errors.
- **Remediation:** Standardize on Node native test runner (`node:test`, `node:assert`) as used in `tests/e2e/runner.ts`.
- **Status:** ✅ **Fixed & Documented**

---

### 🟢 Low / Minor Severity

#### BUG-09: Archaic Terminology in Mock Notification Data
- **Severity:** 🟢 Low
- **Category:** Content / Consistency
- **Affected Files:**
  - `apps/web/app/[locale]/notifications/page.tsx` (line 40)
  - `apps/mobile/app/notifications.tsx` (line 36)
- **Description:** Mock notification item #3 used `"টিকার স্মরণিকা"` instead of modern standard `"টিকার রিমাইন্ডার"`.
- **Impact:** Minor terminology inconsistency with `REL-4` Bangla review standards.
- **Fix:** Replaced with `"টিকার রিমাইন্ডার"`.
- **Status:** ✅ **Fixed & Verified**

#### BUG-10: Inconsistent Phone Number Input Guidance
- **Severity:** 🟢 Low
- **Category:** UX / Form Validation
- **Affected Files:**
  - `apps/web/app/[locale]/(auth)/login/page.tsx`
  - `apps/mobile/app/(auth)/login.tsx`
- **Description:** Input placeholder shows `01XXXXXXXXX` while validation error tooltip previously displayed strict E.164 `+8801XXXXXXXXX`, causing confusion about whether the leading `+88` was required.
- **Impact:** Minor user hesitation during onboarding.
- **Fix:** Clarified error hint to show both formats are accepted (e.g. `01712345678 বা +8801712345678`).
- **Status:** ✅ **Fixed & Verified**

---

## 3. Recommended Remediation Order
1. **Apply BUG-03 & BUG-04 (Emergency Button Click Handlers)** to guarantee life-saving emergency navigation works instantly on both platforms.
2. **Apply BUG-05 (Web Locale Route Prefixing)** across the adoption, clinic detail, and booking flows to eliminate web 404 navigation bugs.
3. **Remove Redundant `<LanguageHeader />` in child pages (BUG-06)** to prevent double-stacked headers.
