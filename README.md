<div align="center">

# 🐾 Pranora · প্রাণোরা

**আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায়।**
*Complete care for your pet, all in one place.*

Bangla-first pet care platform for Bangladesh — **Android · iOS · Web**

`বাংলা (default)` · `English`

</div>

---

## ✨ What is Pranora?

Pranora brings **pet adoption, rescue of injured animals and veterinary care** together in one place for Bangladesh. Pet owners can find the **nearest veterinarian on a map**, book appointments by time slot or serial number, keep their pet's vaccination and health records, and access every pet service — grooming, pet shop, boarding and more — in **Bangla** or **English**.

> প্রাণোরা দিয়ে আপনি পোষা প্রাণী দত্তক নিতে পারবেন, আহত প্রাণীর উদ্ধারের জন্য রিপোর্ট করতে পারবেন, ম্যাপে নিকটস্থ পশু ডাক্তার খুঁজে অ্যাপয়েন্টমেন্ট বা সিরিয়াল নিতে পারবেন, টিকার রিমাইন্ডার পাবেন এবং পোষা প্রাণীর সব সেবা এক জায়গায় পাবেন।

The feature list comes from [PetCare_BD_Feature_List_Bangla.pdf](docs/PetCare_BD_Feature_List_Bangla.pdf) (working title "PetCare BD").

**MVP** = modules 1–4 of that list's build order: account, roles & pet profile → rescue (incl. lost & found) → adoption → vet care (incl. the nearest-vet map). Reminders, online payments, AI assistant, calls and the other pet services come in the next phases — see [tracker.md](docs/tracker.md).

---

## ⭐ Highlight Features

### 🚑 Rescue — উদ্ধার
- Anyone can report an injured, lost, found or abandoned animal with photo, area and urgency — lost & found is part of rescue
- Urgent reports reach a human reviewer immediately; one rescuer is assigned and can accept or decline
- Case page with notes and photos; the reporter sees only the status (জমা · দেখা হচ্ছে · উদ্ধার চলছে · শেষ)
- Exact location is shown only to the people who need it

### 🏡 Adoption — দত্তক
- Browse without login; filter by species, age and district
- Listings only from verified shelters and approved individuals
- One application form; **a human always approves or rejects — never AI**
- Two-sided handover: the pet's profile and medical/vaccine records move to the new owner

### 📍 Nearest Veterinary on Map — নিকটস্থ পশু চিকিৎসক
Available on both the app and the website.
- See vets, clinics and pet hospitals near you on a live map, sorted by distance
- **এখন খোলা** (open now), **২৪/৭**, **জরুরি** (emergency), species, fee and government/private filters (**বাসায় ভিজিট** / home visit filter in the next phase)
- One tap to **কল করুন** (call), **পথ দেখুন** (directions) or **বুক করুন** (book)
- **Emergency mode** — only open clinics, nearest first, big call button
- No GPS? Search by area (ধানমন্ডি, Mirpur 10) or division → district → upazila

### 🧰 Services — সেবাসমূহ
The MVP catalog shows vet appointment, vaccination, emergency, rescue and adoption; the rest are added in later phases.

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
| 🚑 | Animal rescue (incl. lost & found) | উদ্ধার (হারানো/পাওয়া সহ) |
| 📚 | Tips & community | টিপস ও কমিউনিটি |
| 🤖 | AI assistant (chat & voice) | এআই সহকারী |

### More
- 👥 One account, several roles — e.g. pet owner **and** rescuer; login with mobile number or email
- 🐶 Multiple pet profiles with QR pet ID — one profile for life, even after adoption
- 🎫 Book by time slot or **serial number (সিরিয়াল)**; cancel/reschedule until the clinic's cut-off
- 💉 Auto vaccine schedule; push + SMS reminders in the next phase
- 📋 Medical history and visit notes written by vets — export as PDF
- 💬 AI assistant for general care questions — never diagnoses or prescribes (next phase)
- 📞 Owner–vet audio & video calls; recording off by default (next phase)
- 💳 Cash at clinic in the MVP; bKash, Nagad, Rocket, cards (SSLCommerz) in the next phase
- 🏥 Dashboards for vets, clinics, shops and shelters
- 🛡️ Verified vets (BVC registration check) and shelters; admin moderation and audit log

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
| Payments | Cash in MVP; SSLCommerz (bKash, Nagad, Rocket, cards) from Phase 2 |
| Notifications | Expo Push / FCM, local SMS gateway |
| Calls & AI (Phase 2) | Agora / Daily.co audio + video; LLM API with Bangla STT/TTS via Edge Functions |
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

cp .env.example .env.local      # fill in keys (see docs/trd.md §15)

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
| [Feature list (PDF, Bangla)](docs/PetCare_BD_Feature_List_Bangla.pdf) | Original feature list and phases ("PetCare BD") that the docs follow |
| [PRD](docs/prd.md) | Product requirements, features, personas, release plan |
| [TRD](docs/trd.md) | Architecture, tech stack, nearest-vet, rescue/adoption and AI design, security |
| [App Flow](docs/app-flow.md) | Screens, navigation and user flows |
| [Design Brief](docs/design.md) | Brand, colors, Bangla typography, components |
| [Schema](docs/schema.md) | Database tables, PostGIS functions, RLS |
| [Rules](docs/rules.md) | Coding, i18n, git and security rules |
| [Tracker](docs/tracker.md) | Tasks, owners, status and decisions |
| [Team](docs/team.md) | Who owns what, workload balance, change requests |

---

## 🌐 Language Support

- **বাংলা** is the default for all screens, notifications, SMS and PDFs.
- **English** can be switched anytime from onboarding or settings.
- Prices, dates and distances are localized: `৳ ১,২০০ · ২.৩ কি.মি.` / `৳1,200 · 2.3 km`.

---

## 🤝 Contributing

1. Create a git-ignored `.pranora-member` file in the repo root with your member id (`zihad`, `afridi`, `zimia`, `brehat` or `tain`) — see [`.pranora-member.example`](.pranora-member.example). Your Cursor agent uses it to stay inside your area.
2. Check what you own in [docs/team.md](docs/team.md) and claim your task in [tracker.md](docs/tracker.md) (Status 🟨).
3. Work on your own branch (`zihad`, `afridi`, `Zimia`, `brehat`, `tain`) or `<member>/<task-id>-short-name`; never push to `main`.
4. Follow [docs/rules.md](docs/rules.md) and use Conventional Commits (`feat(map): MAP-3 open-now filter`).
5. Add every new UI string to **both** `bn` and `en`, in your own i18n namespace.
6. Open a PR, get review from the owners of every touched area (CODEOWNERS), keep CI green, and update [tracker.md](docs/tracker.md).

---

## 👥 Team

Ownership and the balanced workload split (proposed) are in [docs/team.md](docs/team.md).

| Name | Branch | Owns |
|---|---|---|
| Zihad | `zihad` | Docs, design system, i18n, pets & health records, services catalog, AI assistant |
| Afridi | `afridi` (merges to `main`) | Repo/CI, core DB & auth, onboarding & roles, notifications, payments, admin panel |
| Zimia | `Zimia` | Nearest-vet map, clinic data, emergency mode, home visit, grooming, boarding, reviews |
| Brehat | `brehat` | Rescue (incl. lost & found), adoption, pet shop |
| Tain | `tain` | Vet booking (slots/serials), vet & shelter dashboards, online consultation, calls |

---

<div align="center">

Made with ❤️ for the pets of Bangladesh · বাংলাদেশের পোষা প্রাণীদের জন্য ভালোবাসায় তৈরি

</div>
