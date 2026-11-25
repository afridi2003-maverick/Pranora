# Production Release Runbook: pranora.com.bd, Play Store & App Store (REL-3)
**Owner:** Afridi (Platform & Release Lead)  
**Sprint:** S8  
**Scope:** Production DNS & Web (`pranora.com.bd`), Android AAB (`bd.com.pranora.app`), iOS Archive, and Supabase Production Migration.

---

## Phase 1: Production Web Launch (`pranora.com.bd`)

### 1.1 DNS & Domain Setup (BTCL / Namecheap / Cloudflare)
Configure the following DNS records on your domain registrar for `pranora.com.bd`:

| Type | Name | Content / Value | TTL | Note |
|---|---|---|---|---|
| **A** | `@` | `76.76.21.21` (Vercel IP) | Auto | Apex domain |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Auto | Redirects to apex |
| **CNAME** | `api` | `<supabase-project-ref>.supabase.co.` | Auto | Custom backend domain |

### 1.2 Vercel Production Deployment
1. Set up Vercel project connected to GitHub repository `afridi2003-maverick/Pranora`.
2. Configure **Root Directory:** `apps/web`.
3. Add Environment Variables from `.env.production.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `SENTRY_DSN`
4. Deploy and verify health endpoint:
   ```bash
   curl -i https://pranora.com.bd/api/health
   # Expected: HTTP 200 {"status":"healthy","domain":"pranora.com.bd"}
   ```
5. Verify SEO and robots configuration:
   ```bash
   curl -i https://pranora.com.bd/robots.txt
   curl -i https://pranora.com.bd/sitemap.xml
   ```

---

## Phase 2: Mobile Production Build & Submission

### 2.1 Google Play Store (Android)
1. Build production Android App Bundle (AAB):
   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   ```
2. Download `.aab` from Expo dashboard or run auto-submission:
   ```bash
   eas submit --platform android --profile production
   ```
3. In Google Play Console:
   - Upload AAB to **Internal Testing** track first.
   - Complete **Data Safety** questionnaire according to `docs/releases/play-store.md`.
   - Submit App Content declarations (Financial features: No, Medical info: Yes / Directory, Sensitive permissions: Disclosed).
   - Promote Internal Testing build to **Production**.

### 2.2 Apple App Store (iOS)
1. Build production iOS Archive:
   ```bash
   cd apps/mobile
   eas build --platform ios --profile production
   ```
2. Submit build to TestFlight:
   ```bash
   eas submit --platform ios --profile production
   ```
3. In App Store Connect:
   - Provide test account credentials (`+8801700000001` / OTP `123456`).
   - Confirm Medical Disclaimer compliance per `docs/releases/app-store.md`.
   - Submit for App Review.

---

## Phase 3: Post-Launch Smoke Test Checklist

- [ ] `https://pranora.com.bd/` loads cleanly with bilingual locale switcher (EN / BN).
- [ ] Emergency map `/emergency` and `/map` locate nearby clinics using spatial fallback if location denied.
- [ ] Rescue reporting `/rescue/report` successfully uploads test case.
- [ ] Pet vaccination reminders `/reminders` successfully register reminder.
- [ ] Native mobile build opens without crash, requesting location and camera permissions only when triggered.
- [ ] Uptime monitoring alerts enabled via Sentry and `/api/health`.
