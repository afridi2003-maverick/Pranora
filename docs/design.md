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

Pranora uses **only** the colors below: a 10-step green scale plus white, black and red. Do not add other hues.

### 3.1 Green scale (brand)

| Token | Hex | Use |
|---|---|---|
| `green-50` | `#E1F3E1` | App background tint, selected chip background, info banners |
| `green-100` | `#B8E6B5` | Hover/pressed backgrounds, progress track, "due soon" background |
| `green-200` | `#8CD2A3` | Borders on active cards, disabled primary button |
| `green-300` | `#6BBF8B` | Illustrations, map cluster fill, chart secondary |
| `green-400` | `#4BA772` | Icons, "open now" dot, completed check |
| `green-500` | `#3A9A63` | Map marker, large headings, focus ring — **not for small text on white** |
| `green-600` | `#2F7B53` | **Primary** — buttons, active tab, links, small text on white |
| `green-700` | `#256E4C` | Button hover/pressed, selected tab label |
| `green-800` | `#1D5A3F` | Headers on light backgrounds, dark-mode surfaces |
| `green-900` | `#154537` | Footer, dark hero sections, dark-mode background |

### 3.2 Base colors

| Token | Hex | Use |
|---|---|---|
| `white` | `#FFFFFF` | Cards, sheets, text on `green-600`+ and on red |
| `black` | `#000000` | Main text. Use opacity for softer text: 87% (body), 60% (secondary), 38% (disabled), 12% (dividers/borders) |
| `red` | `#FF0000` | **Emergency only** — emergency button, emergency map pins, overdue vaccine, errors, destructive actions |

### 3.3 Semantic mapping

| Meaning | Color |
|---|---|
| Primary action | `green-600` background, white text |
| Open now / success / done | `green-400` icon + `green-600` text |
| Pending / due soon | `green-100` background + `green-800` text |
| Closed / cancelled / disabled | black 38% text, black 12% border |
| Emergency / error / overdue | `red` |
| Links | `green-600`, underline on hover |

### 3.4 Contrast rules (WCAG AA)

| Pair | Ratio | Allowed for |
|---|---|---|
| White on `green-600` `#2F7B53` | ~5.2 : 1 | All text ✅ |
| White on `green-500` `#3A9A63` | ~3.5 : 1 | Large/bold text ≥ 18 px only |
| White on `red` `#FF0000` | ~4.0 : 1 | Bold text ≥ 18 px only (emergency button uses 18 px bold) |
| Red text on white | ~4.0 : 1 | Bold ≥ 18 px, or always paired with an icon |
| Black on `green-50` / `green-100` | > 15 : 1 | All text ✅ |
| `green-900` on `green-50` | ~9.3 : 1 | All text ✅ |

Never put small (< 18 px regular) text in white on `green-500` or lighter, or in red.

### 3.5 Dark mode (P2)

Background `green-900`, cards `green-800`, text white (87% / 60%), primary actions `green-300` with `green-900` text, emergency stays `red`.

### 3.6 Tokens (Tailwind / NativeWind)

```js
colors: {
  green: {
    50: '#E1F3E1', 100: '#B8E6B5', 200: '#8CD2A3', 300: '#6BBF8B', 400: '#4BA772',
    500: '#3A9A63', 600: '#2F7B53', 700: '#256E4C', 800: '#1D5A3F', 900: '#154537',
  },
  primary: '#2F7B53',
  white: '#FFFFFF',
  black: '#000000',
  emergency: '#FF0000',
}
```

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
| Button | Primary (`green-600`, hover `green-700`), Secondary (`green-600` outline), Danger (`red`), Ghost; full-width on mobile; loading state |
| Emergency FAB | `red` circle, white phone/siren icon, bold label "জরুরি", bottom-right above tab bar |
| Input | Label above, helper/error text below in same language; phone input with fixed `+880` prefix |
| OTP input | 6 boxes, auto-read SMS on Android |
| Chips / Filters | Horizontal scroll: এখন খোলা · ২৪/৭ · জরুরি · বাসায় ভিজিট |
| Clinic card | Photo, name, verified ✔, distance "২.৩ কি.মি.", open status pill, rating ★, fee from ৳, Call + Directions icons |
| Map marker | `green-500` pin with white paw icon; `red` pin for emergency/24-7; selected = `green-800`, larger, with label; clusters `green-300` with count |
| Bottom sheet | 3 snap points: peek (1 card), half (list), full |
| Pet card | Round photo, name, species icon, age |
| Reminder card | Color strip by status (`green-400` done, `green-100` due soon, `red` overdue), CTA |
| Status pill | pending (`green-100` bg / `green-800` text), confirmed (`green-600` bg / white), completed (`green-50` bg / `green-700` text + ✔), cancelled (black 12% border / black 60% text) |
| Empty state | Illustration + one-line message + single CTA |
| Toast / Snackbar | Bottom, 3 s, bilingual |
| Language switch | "বাংলা | EN" segmented control in settings and web header |
| Role switcher | Segmented control / sheet at top of Profile: পোষা প্রাণীর মালিক · উদ্ধারকারী · শেল্টার · ভেট; shows "যাচাই চলছে" for pending roles |
| Urgency selector | 4 large chips with icon + text: কম · মাঝারি · বেশি (`green-800` text on `green-100`) and খুব জরুরি (`red`, white bold ≥ 18 px) — never color alone |
| Status tracker | Horizontal 4-step stepper (জমা · দেখা হচ্ছে · উদ্ধার চলছে · শেষ) or (জমা · দেখা হচ্ছে · অনুমোদিত/বাতিল); done steps `green-600`, current `green-500` ring, upcoming black 38% |
| Adoption card | Photo, name, species icon, age, district (no exact address), "টিকা দেওয়া" / verified-shelter ✔ badges, ♡ save (P1) |
| Rescue case card | Photo, kind (আহত/হারানো/পরিত্যক্ত), urgency chip, area, time since report, distance (rescuer only), Accept / Decline buttons |
| Serial chip | "সিরিয়াল ১২ · সন্ধ্যা ৫টা–৯টা"; shows remaining serials "আর ৮টি বাকি" |
| AI chat bubble | Assistant bubbles `green-50` with a small "এআই" label; fixed disclaimer bar "এটি চিকিৎসকের পরামর্শের বিকল্প নয়"; emergency reply uses a `red` banner with Call + Map buttons; booking proposals as a card with **হ্যাঁ, বুক করুন** / **না** |
| Call screen | Full-screen `green-900`, avatar, name, timer; mute / speaker / camera / end (end button `red`) |

---

## 8. Key Screens

### 8.1 Home
Header with greeting + notification bell → pet carousel → reminder card → quick actions grid (2×3) → next booking → tips → emergency FAB.

### 8.2 ⭐ Map (Nearest Vet)
- Full-screen map; search bar on top "এলাকা বা ক্লিনিক খুঁজুন"; filter chips under it.
- "My location" button bottom-right; "এই এলাকায় খুঁজুন" pill appears after panning.
- Bottom sheet list with clinic cards sorted by distance; result count "৫ কি.মি.-এর মধ্যে ১২টি ক্লিনিক".
- Tapping a marker scrolls the list to that card and highlights it.
- Emergency variant: `red` top bar with white bold title, only open clinics, Call button is the primary (largest) action.
- Web desktop: 40% list / 60% map split; hover on card highlights marker.

### 8.3 Services
Category grid (icon + Bangla label + English sub-label in small text optional), then featured providers near me, then "কীভাবে কাজ করে" 3-step explainer.

### 8.4 Clinic / Provider Detail
Hero photo carousel → name + verified → open status + hours → action row (Call · Directions · Share) → services with prices → doctors → reviews → sticky bottom **বুক করুন** button.

### 8.5 Booking
Stepper (৪ ধাপ): service → pet → date/time or serial → payment. Date picker shows Bangla weekday names; slots as chips; disabled slots greyed. Clinics using serials show session chips with the next serial number instead of time slots.

### 8.6 Pet Profile & Health
Tabs: সারসংক্ষেপ · টিকা · চিকিৎসা · রিমাইন্ডার. Vaccine timeline with status colors.

### 8.7 Provider Dashboard (web)
Left sidebar navigation, today's bookings table (or today's serial list), calendar view, quick stats cards (today, this week, earnings, rating).

### 8.8 Report an Animal (প্রাণী রিপোর্ট)
One screen, minimal typing: kind (3 big icon buttons) → camera-first photo → map with draggable pin + area text → urgency selector → big **জমা দিন** button. Reachable from Home quick actions and Services. After submit: status tracker + "আমরা দেখছি" message.

### 8.9 Rescue Case (rescuer / shelter)
Header with urgency chip and status; map with exact pin (only for these roles) and **পথ দেখুন**; photo strip; timeline of updates; sticky bottom bar: নোট/ছবি যোগ করুন · অবস্থা বদলান · ফলাফল লিখুন. Shelter queue sorts urgent reports first with a `red` left strip on খুব জরুরি.

### 8.10 Adoption
Listing grid (2 columns on mobile, 4 on web) with filter chips প্রজাতি · বয়স · জেলা; detail page with photo carousel, facts, shelter card, sticky **আবেদন করুন**. Application form is a single scrollable page with large radio cards for home type. My applications show the status tracker. Handover screen: two confirm checkmarks (giver / adopter) and a success state "অভিনন্দন! এখন থেকে মিনু আপনার".

### 8.11 AI Assistant (P1)
Chat screen with suggested questions in Bangla, hold-to-talk mic button (≥ 56 px), disclaimer bar always visible, quick "ভেটের সঙ্গে কথা বলুন" hand-off button.

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
| Report an animal | প্রাণী রিপোর্ট করুন | Report an animal |
| Report submitted | রিপোর্ট জমা হয়েছে, আমরা দেখছি | Report submitted, we're on it |
| Adopt | আবেদন করুন | Apply to adopt |
| Application status | আবেদন দেখা হচ্ছে | Application under review |
| Serial | আপনার সিরিয়াল ১২ | Your serial: 12 |
| AI disclaimer | আমি এআই, ডাক্তার নই। এটি চিকিৎসকের পরামর্শের বিকল্প নয়। | I'm an AI, not a vet. This is not a substitute for a vet. |

---

## 12. Deliverables for Designers

- Figma file with: foundations (colors, type, spacing), components (both languages), all MVP screens for app (360×800) and web (1440 + 390), prototypes for the rescue report, adoption, nearest-vet and booking flows.
- Every screen designed in **Bangla first**, then checked in English.
