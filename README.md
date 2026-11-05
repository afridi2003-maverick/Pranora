<div align="center">

# 🐾 Pranora · প্রাণোরা

**আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায়।**
*Complete care for your pet, all in one place.*

Bangla-first pet care platform for Bangladesh — **Android · iOS · Web**

`বাংলা (default)` · `English`

</div>

---

## ✨ What is Pranora?

Pranora helps pet owners in Bangladesh find the **nearest veterinarian on a map**, book appointments or home visits, keep their pet's vaccination and health records, get reminders, and access every pet service — grooming, pet shop, boarding, adoption and more — in **Bangla** or **English**.

> প্রাণোরা দিয়ে আপনি ম্যাপে নিকটস্থ পশু ডাক্তার খুঁজে পাবেন, অ্যাপয়েন্টমেন্ট বা বাসায় ডাক্তার বুক করতে পারবেন, টিকার রিমাইন্ডার পাবেন এবং পোষা প্রাণীর সব সেবা এক জায়গায় পাবেন।

---

## ⭐ Highlight Features

### 📍 Nearest Veterinary on Map — নিকটস্থ পশু চিকিৎসক
Available on both the app and the website.
- See vets, clinics and pet hospitals near you on a live map, sorted by distance
- **এখন খোলা** (open now), **২৪/৭**, **জরুরি** (emergency), **বাসায় ভিজিট** (home visit), species and government/private filters
- One tap to **কল করুন** (call), **পথ দেখুন** (directions) or **বুক করুন** (book)
- **Emergency mode** — only open clinics, nearest first, big call button
- No GPS? Search by area (ধানমন্ডি, Mirpur 10) or division → district → upazila

### 🧰 Services — সেবাসমূহ
| | Service | সেবা |
|---|---|---|
| 🩺 | Vet appointment (clinic) | ক্লিনিকে ডাক্তার দেখানো |
| 🏠 | Home visit | বাসায় ডাক্তার |
| 💬 | Online consultation | অনলাইন পরামর্শ |
| 🚨 | Emergency help | জরুরি সেবা |
| 💉 | Vaccination | টিকা |
| ✂️ | Grooming | গ্রুমিং |
| 🛒 | Pet shop (food, medicine, accessories) | পেট শপ |
| 🏨 | Boarding / pet hotel | পেট হোটেল |
| 🚶 | Pet sitting & walking | পেট সিটিং |
| 🎓 | Training | প্রশিক্ষণ |
| 🚕 | Pet taxi | পেট ট্যাক্সি |
| 🏡 | Adoption | দত্তক |
| 🔎 | Lost & found | হারানো ও প্রাপ্তি |
| 📚 | Tips & community | টিপস ও কমিউনিটি |

### More
- 🐶 Multiple pet profiles with QR pet ID
- 💉 Auto vaccine schedule + reminders (push & SMS)
- 📋 Medical history, prescriptions, reports — export as PDF
- 💳 Cash, bKash, Nagad, Rocket, cards (SSLCommerz)
- 🏥 Provider dashboard for vets, clinics and shops
- 🛡️ Verified vets (BVC registration check)

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Monorepo | Turborepo + pnpm |
| Mobile | Expo (React Native), Expo Router, NativeWind |
| Web | Next.js (App Router), Tailwind CSS, shadcn/ui |
| Backend | Supabase — PostgreSQL + **PostGIS**, Auth (phone OTP), Storage, Realtime, Edge Functions |
| Maps | Google Maps (react-native-maps, @vis.gl/react-google-maps), Places; Barikoi optional |
| i18n | i18next / next-intl — Bangla default, English |
| Payments | SSLCommerz (bKash, Nagad, Rocket, cards) |
| Notifications | Expo Push / FCM, local SMS gateway |
| Quality | TypeScript strict, Zod, Vitest, Playwright, Maestro, Sentry, PostHog |

---

## 📁 Project Structure

```
pranora/
├── apps/
│   ├── mobile/          # Expo app (Android + iOS)
│   └── web/             # Next.js website + /provider + /admin
├── packages/
│   ├── ui/              # design tokens, shared components
│   ├── i18n/            # bn.json, en.json, formatters
│   ├── api/             # Supabase client + query hooks
│   ├── types/           # generated DB types
│   └── validation/      # Zod schemas
├── supabase/
│   ├── migrations/      # database schema (source of truth)
│   ├── functions/       # Edge Functions
│   └── seed.sql
├── docs/                # product & technical docs
└── .cursorrules
```

> The codebase isn't scaffolded yet. See [tracker.md](docs/tracker.md) task `SET-1`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and pnpm 9+
- Docker (for local Supabase)
- Supabase CLI
- Expo Go app or an Android emulator / iOS simulator
- Google Maps API key

### Setup
```bash
git clone https://github.com/afridi2003-maverick/Pranora.git
cd Pranora
pnpm install

cp .env.example .env.local      # fill in keys (see docs/trd.md §13)

supabase start                  # local Postgres + PostGIS
supabase db reset               # run migrations + seed
pnpm db:types                   # generate TypeScript types

pnpm dev                        # web on http://localhost:3000 + Expo dev server
```

### Useful scripts
| Command | What it does |
|---|---|
| `pnpm dev` | Run web and mobile in dev mode |
| `pnpm dev --filter web` | Web only |
| `pnpm dev --filter mobile` | Mobile only |
| `pnpm lint` / `pnpm typecheck` | Lint and type check all packages |
| `pnpm test` | Unit tests |
| `pnpm db:types` | Regenerate Supabase types |
| `supabase migration new <name>` | Create a DB migration |

---

## 📚 Documentation

| Document | Description |
|---|---|
| [PRD](docs/prd.md) | Product requirements, features, personas, release plan |
| [TRD](docs/trd.md) | Architecture, tech stack, nearest-vet design, security |
| [App Flow](docs/app-flow.md) | Screens, navigation and user flows |
| [Design Brief](docs/design.md) | Brand, colors, Bangla typography, components |
| [Schema](docs/schema.md) | Database tables, PostGIS functions, RLS |
| [Rules](docs/rules.md) | Coding, i18n, git and security rules |
| [Tracker](docs/tracker.md) | Tasks, status and decisions |

---

## 🌐 Language Support

- **বাংলা** is the default for all screens, notifications, SMS and PDFs.
- **English** can be switched anytime from onboarding or settings.
- Prices, dates and distances are localized: `৳ ১,২০০ · ২.৩ কি.মি.` / `৳1,200 · 2.3 km`.

---

## 🤝 Contributing

1. Create a branch from `dev` (for example `feature/map-filters`), or use your personal branch (for example `zihad`).
2. Follow [docs/rules.md](docs/rules.md) and use Conventional Commits (`feat(map): add open-now filter`).
3. Add every new UI string to **both** `bn` and `en`.
4. Open a PR, get one review, keep CI green, and update [tracker.md](docs/tracker.md).

---

## 👥 Team

| Name | Branch |
|---|---|
| Afridi | `main` |
| Zimia | `Zimia` |
| Zihad | `zihad` |

---

<div align="center">

Made with ❤️ for the pets of Bangladesh · বাংলাদেশের পোষা প্রাণীদের জন্য ভালোবাসায় তৈরি

</div>
