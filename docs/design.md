# Pranora — UI/UX Design Brief

Related: [app-flow.md](./app-flow.md) · [prd.md](./prd.md)

---

## 1. Brand

| | |
|---|---|
| Name | **Pranora / প্রাণোরা** — from "প্রাণ" (life) |
| Tagline (bn) | আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায় |
| Tagline (en) | Complete care for your pet, all in one place |
| Personality | Caring, trustworthy, warm, local, simple |
| Voice | Friendly, respectful Bangla ("আপনি" form), short sentences, no jargon; English is plain and friendly |

---

## 2. Design Principles

1. **Bangla first** — design every screen in Bangla first; Bangla text is ~20–30% longer and taller than English, so layouts must not break when switching.
2. **Emergency is always one tap away** — the red emergency button never hides behind menus.
3. **Map-first discovery** — finding the nearest vet should take under 10 seconds from opening the app.
4. **Low-literacy friendly** — icons + text together, big tap targets, minimal typing.
5. **Works on cheap phones** — light screens, few animations, small images, 360 px width baseline.
6. **Trust signals** — verified badge, BVC registration, real reviews, clear prices in ৳.

---

## 3. Color Palette

| Token | Hex | Use |
|---|---|---|
| `primary-600` | `#0F9D8A` | Teal — main brand, buttons, active tab |
| `primary-50` | `#E7F7F4` | Light backgrounds, chips |
| `secondary-500` | `#FF8A3D` | Warm orange — highlights, pets, CTAs secondary |
| `emergency-600` | `#E53935` | Emergency button, overdue vaccine |
| `success-600` | `#2E7D32` | Open now, completed, vaccine done |
| `warning-500` | `#F9A825` | Due soon, pending |
| `info-600` | `#1E88E5` | Links, info banners |
| `neutral-900` | `#1B1F23` | Main text |
| `neutral-600` | `#5B6470` | Secondary text |
| `neutral-200` | `#E3E7EB` | Borders, dividers |
| `neutral-50` | `#F7F9FA` | App background |
| `white` | `#FFFFFF` | Cards |

Dark mode (P2): same hues, background `#101417`, cards `#1A2026`.
All text/background pairs must pass **WCAG AA (4.5:1)**.

---

## 4. Typography

| Script | Font | Fallback |
|---|---|---|
| Bangla | **Hind Siliguri** (400, 500, 600, 700) | Noto Sans Bengali |
| English / numbers in EN | **Inter** | system-ui |

| Style | Size / line-height (bn) | Weight |
|---|---|---|
| Display | 28 / 40 | 700 |
| H1 | 24 / 34 | 700 |
| H2 | 20 / 30 | 600 |
| H3 | 18 / 28 | 600 |
| Body | 16 / 26 | 400 |
| Body small | 14 / 22 | 400 |
| Caption | 12 / 18 (avoid for Bangla body text) | 500 |

Bangla needs **~1.6 line-height** so কার/ফলা (vowel signs) don't clip. Never set Bangla below 14 px.

Numbers: in Bangla mode use Bangla digits (১২৩) for prices, dates and distance; phone numbers stay in English digits for dialing clarity.

---

## 5. Spacing, Radius, Elevation

- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40 px. Screen padding 16 px (mobile), 24 px (tablet), max content width 1200 px (web).
- Radius: 8 (inputs, chips), 12 (cards), 16 (bottom sheets), full (avatars, FAB).
- Elevation: cards `0 1px 3px rgba(0,0,0,.08)`; bottom sheet `0 -4px 16px rgba(0,0,0,.10)`.
- Tap targets ≥ **48 × 48 px**.

---

## 6. Iconography & Imagery

- Icons: **Lucide** (outline, 2 px stroke) + a small custom set for species (dog, cat, bird, rabbit, fish, cow, goat).
- Illustrations: flat, warm, with Bangladeshi context (local homes, rickshaw for pet taxi, etc.).
- Photos: real pets and local clinics; compressed WebP, ≤ 150 KB.

---

## 7. Core Components

| Component | Notes |
|---|---|
| Button | Primary (teal), Secondary (outline), Danger (red), Ghost; full-width on mobile; loading state |
| Emergency FAB | Red circle, phone/siren icon, label "জরুরি", bottom-right above tab bar |
| Input | Label above, helper/error text below in same language; phone input with fixed `+880` prefix |
| OTP input | 6 boxes, auto-read SMS on Android |
| Chips / Filters | Horizontal scroll: এখন খোলা · ২৪/৭ · জরুরি · বাসায় ভিজিট |
| Clinic card | Photo, name, verified ✔, distance "২.৩ কি.মি.", open status pill, rating ★, fee from ৳, Call + Directions icons |
| Map marker | Teal pin with paw icon; red pin for emergency/24-7; selected = larger with label; clusters show count |
| Bottom sheet | 3 snap points: peek (1 card), half (list), full |
| Pet card | Round photo, name, species icon, age |
| Reminder card | Color strip by status (green done, yellow due, red overdue), CTA |
| Status pill | pending (yellow), confirmed (blue), completed (green), cancelled (grey) |
| Empty state | Illustration + one-line message + single CTA |
| Toast / Snackbar | Bottom, 3 s, bilingual |
| Language switch | "বাংলা | EN" segmented control in settings and web header |

---

## 8. Key Screens

### 8.1 Home
Header with greeting + notification bell → pet carousel → reminder card → quick actions grid (2×3) → next booking → tips → emergency FAB.

### 8.2 ⭐ Map (Nearest Vet)
- Full-screen map; search bar on top "এলাকা বা ক্লিনিক খুঁজুন"; filter chips under it.
- "My location" button bottom-right; "এই এলাকায় খুঁজুন" pill appears after panning.
- Bottom sheet list with clinic cards sorted by distance; result count "৫ কি.মি.-এর মধ্যে ১২টি ক্লিনিক".
- Tapping a marker scrolls the list to that card and highlights it.
- Emergency variant: red top bar, only open clinics, Call button is the primary (largest) action.
- Web desktop: 40% list / 60% map split; hover on card highlights marker.

### 8.3 Services
Category grid (icon + Bangla label + English sub-label in small text optional), then featured providers near me, then "কীভাবে কাজ করে" 3-step explainer.

### 8.4 Clinic / Provider Detail
Hero photo carousel → name + verified → open status + hours → action row (Call · Directions · Share) → services with prices → doctors → reviews → sticky bottom **বুক করুন** button.

### 8.5 Booking
Stepper (৪ ধাপ): service → pet → date/time → payment. Date picker shows Bangla weekday names; slots as chips; disabled slots greyed.

### 8.6 Pet Profile & Health
Tabs: সারসংক্ষেপ · টিকা · চিকিৎসা · রিমাইন্ডার. Vaccine timeline with status colors.

### 8.7 Provider Dashboard (web)
Left sidebar navigation, today's bookings table, calendar view, quick stats cards (today, this week, earnings, rating).

---

## 9. Motion

- Durations 150–250 ms, ease-out. Bottom sheet uses spring.
- Respect "reduce motion" OS setting.
- No auto-playing animations on Home (battery/data).

---

## 10. Accessibility

- Every icon button has an accessible label in the current language.
- Don't rely on color alone — open/closed also uses text "খোলা / বন্ধ".
- Support system font scaling up to 130% without layout break.
- Map results always also available as a list (screen readers can't use maps well).

---

## 11. Copy Guidelines (examples)

| Context | বাংলা | English |
|---|---|---|
| Nearest vet CTA | নিকটস্থ পশু ডাক্তার খুঁজুন | Find nearest vet |
| Open now | এখন খোলা | Open now |
| Closed | বন্ধ · খুলবে সকাল ৯টায় | Closed · Opens 9 AM |
| Call | কল করুন | Call |
| Directions | পথ দেখুন | Directions |
| Book | বুক করুন | Book now |
| Emergency | জরুরি সেবা | Emergency |
| Vaccine due | টিকার সময় হয়েছে | Vaccine due |
| Success | বুকিং সফল হয়েছে! | Booking confirmed! |

---

## 12. Deliverables for Designers

- Figma file with: foundations (colors, type, spacing), components (both languages), all MVP screens for app (360×800) and web (1440 + 390), prototype for the nearest-vet and booking flows.
- Every screen designed in **Bangla first**, then checked in English.
