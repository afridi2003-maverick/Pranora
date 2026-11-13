# Google Maps Platform Setup & Key Restrictions (SET-3)

**Owner:** Zimia (@zimia-zannat-samia) · **Sprint:** S1 · **Task:** SET-3

This document guides the setup, billing, API restrictions, and security policies for Google Maps Platform keys in Pranora across Web (`apps/web`) and Mobile (`apps/mobile`).

---

## 1. Required Google Cloud Project & APIs

1. Create or select a Google Cloud project: **`pranora-prod`** (and `pranora-dev`).
2. Attach a billing account (required to receive API traffic and the monthly $200 recurring credit).
3. Enable only the following APIs in **APIs & Services > Library**:
   - **Maps SDK for Android** (for `apps/mobile` on Android via `react-native-maps`)
   - **Maps SDK for iOS** (for `apps/mobile` on iOS via `react-native-maps`)
   - **Maps JavaScript API** (for `apps/web` via `@vis.gl/react-google-maps`)
   - **Places API (New)** (for search and area autocomplete)
   - **Geocoding API** (for reverse geocoding coordinates to administrative divisions)

---

## 2. API Key Provisioning & Restrictions

Never use an unrestricted API key. Create two separate keys in **APIs & Services > Credentials**:

### Key 1: Mobile (`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`)
- **Name:** `pranora-mobile-maps-key`
- **Application restrictions:**
  - Select **Android apps**:
    - Package name: `com.pranora.app`
    - SHA-1 certificate fingerprints:
      - Development keystore SHA-1 (Expo Go / local debug build)
      - Production Google Play App Signing key SHA-1
  - Select **iOS apps**:
    - Bundle ID: `com.pranora.app`
- **API restrictions:**
  - Restrict key to:
    - *Maps SDK for Android*
    - *Maps SDK for iOS*
    - *Places API (New)*

### Key 2: Web (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
- **Name:** `pranora-web-maps-key`
- **Application restrictions:**
  - Select **Websites (HTTP referrers)**:
    - `https://pranora.com.bd/*`
    - `https://*.pranora.com.bd/*`
    - `https://*.vercel.app/*` (preview deployments)
    - `http://localhost:3000/*` (local web development)
    - `http://127.0.0.1:3000/*`
- **API restrictions:**
  - Restrict key to:
    - *Maps JavaScript API*
    - *Places API (New)*
    - *Geocoding API*

---

## 3. Cost Control & Quotas (docs/rules.md §5 & docs/trd.md §4.5)

To prevent unexpected billing spikes:
1. **Budget alerts:** Set billing budget alerts in Google Cloud Console at $50, $100, and $180.
2. **Viewport optimization:** Never make Places or Geocoding API calls during map pan / drag operations. Panning re-queries the local database via Postgres PostGIS (`nearby_clinics` RPC) with a 500 ms debounce.
3. **Explicit search only:** Places Autocomplete / Geocoding is only invoked when the user explicitly taps and types in the search bar. Autocomplete calls must be restricted to Bangladesh (`country: 'bd'`).
4. **Marker clustering:** Enable marker clustering whenever there are > 30 clinic markers visible in the viewport.
5. **Client caching:** Results are cached client-side with TanStack Query and AsyncStorage/localStorage for offline resilience.

---

## 4. Environment Variables Configuration

Copy the keys into your local environment file (`.env.local`):

```bash
# Web Google Maps Key (HTTP referrer restricted)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# Mobile Google Maps Key (Android Package & iOS Bundle restricted)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

*Note:* Both keys are verified by `@pranora/validation` via `googleMapsConfigSchema`.
