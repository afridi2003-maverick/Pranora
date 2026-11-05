<div align="center">

# 🐾 Pranora · প্রাণোরা

**আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায়।**
*Complete care for your pet, all in one place.*

Adoption · Rescue · Vet care — for Bangladesh · **Android · iOS · Web**

`বাংলা (default)` · `English`

</div>

---

## ✨ What is Pranora?

Pranora brings three things together in one Bangla-first app and website:

| | Module | What it does |
|---|---|---|
| 🏡 | **দত্তক / Adoption** | Shelters and approved people list animals, adopters apply, **a human always decides**, ownership is handed over in the app |
| 🚑 | **উদ্ধার / Rescue** | Anyone can report an injured, lost, found or abandoned animal; a rescuer is assigned and the case is tracked to the end |
| 🩺 | **পশুচিকিৎসা / Vet care** | Find vets on a map, book by time slot or **serial number (সিরিয়াল)**, keep treatment and vaccine records |

**One animal, one profile:** a rescued animal gets a single profile, so its treatment and vaccine records move with it to the new owner after adoption.

> প্রাণোরা দিয়ে আপনি পোষা প্রাণী দত্তক নিতে পারবেন, আহত বা হারানো প্রাণীর উদ্ধারের জন্য রিপোর্ট করতে পারবেন, ম্যাপে নিকটস্থ পশু ডাক্তার খুঁজে অ্যাপয়েন্টমেন্ট বা সিরিয়াল নিতে পারবেন, আর পোষা প্রাণীর চিকিৎসা ও টিকার রেকর্ড এক জায়গায় রাখতে পারবেন — বাংলায় বা ইংরেজিতে।

The features come from the team's Bangla feature list, [PetCare_BD_Feature_List_Bangla.pdf](docs/PetCare_BD_Feature_List_Bangla.pdf) (its working title was "PetCare BD"). Pranora adds a **nearest-vet map** and a **services catalog** on top of it.

---

## ⭐ Highlight Features

Tags: 🟢 MVP · 🔵 Phase 2 · ⚪ Phase 3. See the [Roadmap](#-roadmap).

### 👤 Account, Roles & Pet Profile
- 🟢 Login with **mobile number (OTP) or email**; Bangla by default, English anytime
- 🟢 **One person, several roles** — pet owner, rescuer, shelter, vet, service provider (verified by admin)
- 🟢 Multiple pet profiles with vaccine and health info; **one profile for life**, even after adoption
- 🔵 QR pet ID card, weight chart, health record PDF export · ⚪ share profile with family

### 🚑 Rescue — উদ্ধার
- 🟢 Report an animal — **আহত / injured · হারানো / lost · পাওয়া / found · পরিত্যক্ত / abandoned** — with photo, area and urgency
- 🟢 **Lost & found is part of rescue:** owners report their own lost pet from its profile, with last-seen time
- 🟢 Urgent reports reach a human reviewer immediately (push + SMS); one rescuer is assigned and can accept or decline
- 🟢 Case page with notes and photos; the reporter sees only the status: জমা · দেখা হচ্ছে · উদ্ধার চলছে · শেষ
- 🔵 Duplicate report merge, nearby rescuer search, **public lost & found board** (area rounded to ~1 km, no phone numbers)

### 🏡 Adoption — দত্তক
- 🟢 Browse **without login**; filter by species, age and district
- 🟢 Listings only from verified shelters and approved individuals
- 🟢 One application form → জমা হয়েছে · দেখা হচ্ছে · অনুমোদিত / বাতিল — **a human always decides, never AI**
- 🟢 Two-sided handover; the pet's profile and records move to the new owner (one handover per listing)
- 🔵 Save listings, report fake listings, post-adoption follow-up · ⚪ smart matching

### 🩺 Vet Care & 📍 Nearest Vet on Map — নিকটস্থ পশু চিকিৎসক
Available on both the app and the website.
- 🟢 Live map + list of vets, clinics and pet hospitals, sorted by distance
- 🟢 Filters: **এখন খোলা** (open now), **২৪/৭**, **জরুরি** (emergency), species, fee, government/private
- 🟢 One tap to **কল করুন** (call), **পথ দেখুন** (directions) or **বুক করুন** (book)
- 🟢 🚨 **Emergency mode** — only clinics open now or 24/7, nearest first, big call button
- 🟢 No GPS? Search by area (ধানমন্ডি, Mirpur 10) or division → district → upazila
- 🟢 Vet profiles with degree, **BVC registration** and verified badge
- 🟢 Book by **time slot or serial number**; cancel/reschedule until the clinic's cut-off; no double booking
- 🟢 Visit notes, medical history and vaccine records — **written only by vets**, readable by the owner
- 🔵 Reminders (push + SMS), prescriptions, home visit, online consultation, owner–vet audio/video calls, ratings, radius slider & clustering, "suggest a clinic"
- ⚪ Offline nearby cache, livestock vets

### 🧰 Services — সেবাসমূহ
The MVP catalog shows only the 🟢 services; the others appear when their phase ships.

| | Service | সেবা | Phase |
|---|---|---|---|
| 🩺 | Vet appointment (clinic) | ক্লিনিকে ডাক্তার দেখানো | 🟢 |
| 💉 | Vaccination (at clinic; at home with home visit 🔵) | টিকা | 🟢 |
| 🚨 | Emergency help | জরুরি সেবা | 🟢 |
| 🚑 | Animal rescue (incl. lost & found) | উদ্ধার (হারানো/পাওয়া সহ) | 🟢 |
| 🏡 | Adoption | দত্তক | 🟢 |
| 🏠 | Home visit | বাসায় ডাক্তার | 🔵 |
| 💬 | Online consultation | অনলাইন পরামর্শ | 🔵 |
| ✂️ | Grooming | গ্রুমিং | 🔵 |
| 🛒 | Pet shop (food, medicine, accessories) | পেট শপ | 🔵 |
| 🏨 | Boarding / pet hotel | পেট হোটেল | 🔵 |
| 📚 | Tips & community | টিপস ও কমিউনিটি | 🔵 |
| 🤖 | AI assistant (chat & voice) | এআই সহকারী | 🔵 |
| 🚶 | Pet sitting & walking | পেট সিটিং | ⚪ |
| 🎓 | Training | প্রশিক্ষণ | ⚪ |
| 🚕 | Pet taxi | পেট ট্যাক্সি | ⚪ |

### 💳 Payments
- 🟢 **Cash at the clinic**
- 🔵 **bKash, Nagad, Rocket and cards** via SSLCommerz, with invoices, refunds and provider payouts; cash on delivery for the pet shop
- Payment success is decided only by the server, never by the app.

### 🤖 AI Assistant & 📞 Calls (Phase 2)
- 🔵 AI chat in Bangla and English for general care questions; spots emergency signs (breathing trouble, seizures, bleeding) and sends you to a vet; books only after you say **হ্যাঁ / Yes**; voice if Bangla speech quality is good enough
- 🔵 Owner–vet audio and video calls with call history · ⚪ recording, only with both people's consent

### 🛡️ Admin & Dashboards
- 🟢 Vet and shelter dashboards (bookings, serial list, schedule, rescue queue, adoption applications)
- 🟢 Admin verification of vets, shelters, rescuers and adoption listers; removal of fake listings/reports; urgent rescue queue
- 🔵 Audit log, dashboards for other providers, content & analytics

---

## 🗺 Roadmap

| Phase | Scope |
|---|---|
| 🟢 **MVP** — modules 1–4 of the PDF build order | ① account (phone or email), roles, বাংলা/English, pet profile → ② rescue incl. lost & found → ③ adoption: listing to handover → ④ vet: profiles, verification, **nearest-vet map + emergency mode**, booking by slot or serial, visit notes, treatment & vaccine records. Plus: notifications (OTP, urgent rescue alerts, booking updates), cash at clinic, vet & shelter dashboards, admin verification & moderation, services catalog (MVP services only). |
| 🔵 **Phase 2** | ⑤ reminders (push + SMS) → ⑥ AI chat, then calls & AI voice. Also online payments (bKash, Nagad, Rocket, cards) with invoices/refunds/payouts, home visit, prescriptions, online consultation, reviews, audit log, adoption & rescue extras (incl. public lost & found board), grooming, pet shop, boarding, tips. |
| ⚪ **Phase 3** | Smart adoption matching, call recording (with consent), sitting & walking, training, pet taxi, livestock vets, offline map cache. |

**Before launch:** a native Bangla speaker reviews all Bangla text (especially AI and SMS messages), and a licensed vet reviews the BVC verification process, medicine and vaccine lists, and legal rules.

Task-level status: [docs/tracker.md](docs/tracker.md).

---

## 🔒 Safety & Privacy

- 🧑‍⚖️ **Adoption decisions are always made by a human**, never AI.
- 🩺 **Diagnosis, prescriptions and medical records — vets only.** Owners can read them and upload old reports, which are labelled as their own uploads.
- 📍 **An animal's exact location and personal phone numbers are never shown publicly.** Rescue locations are visible only to the reviewer, assigned rescuer and admins; adoption shows the district only; photos have GPS data removed.
- 🔐 Medical information is visible only to the owner and people they allow.
- 🤖 **The AI never** diagnoses, names medicines or doses, pretends to be human, says something is done before the system confirms it, or asks for passwords or payment details.
- 🎙️ Call recording is off by default and needs both people's consent.

> এটি চিকিৎসকের পরামর্শের বিকল্প নয় / This is not a substitute for a vet.

---

## 🎨 Color Palette

Only these colors are used — a green scale plus white, black and red. Red is for **emergency and errors only**. Details and contrast rules: [docs/design.md §3](docs/design.md#3-color-palette).

| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| `green-50` | `#E1F3E1` | | `green-600` · **primary** | `#2F7B53` |
| `green-100` | `#B8E6B5` | | `green-700` | `#256E4C` |
| `green-200` | `#8CD2A3` | | `green-800` | `#1D5A3F` |
| `green-300` | `#6BBF8B` | | `green-900` | `#154537` |
| `green-400` | `#4BA772` | | `white` | `#FFFFFF` |
| `green-500` | `#3A9A63` | | `black` | `#000000` |
| | | | `red` · emergency | `#FF0000` |

Fonts: **Hind Siliguri** (Bangla, ~1.6 line height, never below 14 px) · **Inter** (English).

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Monorepo | Turborepo + pnpm |
| Mobile | Expo (React Native), Expo Router, NativeWind |
| Web | Next.js (App Router), Tailwind CSS, shadcn/ui |
| Backend | Supabase — PostgreSQL + **PostGIS**, Auth (phone OTP / email), Storage, Realtime, Edge Functions |
| Maps | Google Maps (react-native-maps, @vis.gl/react-google-maps), Places; Barikoi optional |
| i18n | i18next / next-intl — Bangla default, English |
| Payments | Cash in MVP; SSLCommerz (bKash, Nagad, Rocket, cards) from Phase 2 |
| Notifications | Expo Push / FCM, local SMS gateway |
| Calls & AI (Phase 2) | Agora / Daily.co audio + video; LLM API with Bangla speech-to-text / text-to-speech via Edge Functions |
| Quality | TypeScript strict, Zod, Vitest, Playwright, Maestro, pgTAP, Sentry, PostHog |

---

## 📁 Project Structure

```
pranora/
├── apps/
│   ├── mobile/              # Expo app (Android + iOS) — features/<feature>/
│   └── web/                 # Next.js website + /provider + /admin
├── packages/
│   ├── ui/                  # design tokens, shared components
│   ├── i18n/                # locales/{bn,en}/<namespace>.json, formatters
│   ├── api/                 # Supabase client + query hooks
│   ├── types/               # generated DB types
│   └── validation/          # Zod schemas
├── supabase/
│   ├── migrations/          # <timestamp>_<area>_<name>.sql (source of truth)
│   ├── functions/           # Edge Functions
│   └── seed/                # locations, services, vaccines, clinics
├── docs/                    # product, technical & team docs + feature list PDF
├── .cursor/rules/           # Cursor rules (team ownership)
├── .github/CODEOWNERS       # review owners per area
├── .cursorrules
└── .pranora-member.example  # copy to .pranora-member (git-ignored)
```

> The codebase isn't scaffolded yet — see [tracker.md](docs/tracker.md) task `SET-1`.

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

# tell your Cursor agent who you are (git-ignored): zihad | afridi | zimia | brehat | tain
echo zihad > .pranora-member     # PowerShell: Set-Content .pranora-member zihad

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
| `supabase migration new <area>_<name>` | Create a DB migration in your area |

---

## 🌐 Language Support

- **বাংলা** is the default for all screens, notifications, SMS and PDFs.
- **English** can be switched anytime from onboarding or settings.
- Prices, dates and distances are localized: `৳ ১,২০০ · ২.৩ কি.মি.` / `৳1,200 · 2.3 km`.
- Search understands Bangla, English and Banglish ("dhanmondi" = "ধানমন্ডি").

---

## 👥 Team

Five members, each owning one area with both frontend and backend work. The split is **proposed** and the team should confirm it — details in [docs/team.md](docs/team.md).

| Member | GitHub | Branch | Owns |
|---|---|---|---|
| Zihad | [@zihad2003](https://github.com/zihad2003) | `zihad` | Docs, design system, i18n, pets & health records, services catalog, AI assistant |
| Afridi | [@afridi2003-maverick](https://github.com/afridi2003-maverick) | `afridi` (merges to `main`) | Repo/CI, core DB & auth, onboarding & roles, notifications, payments, admin panel |
| Zimia | TBD | `Zimia` | Nearest-vet map, clinic data, emergency mode, home visit, grooming, boarding, reviews |
| Brehat | TBD | `brehat` | Rescue (incl. lost & found), adoption, pet shop |
| Tain | TBD | `tain` | Vet booking (slots/serials), vet & shelter dashboards, online consultation, calls |

**Workload (সমান ভাগ)** — open tasks per phase, matching the tracker:

| Member | Phase 0 | MVP | Phase 2 | Phase 3 | Total |
|---|---|---|---|---|---|
| Zihad | 1 | 12 | 7 | 1 | 21 |
| Afridi | 1 | 13 | 7 | 1 | 22 |
| Zimia | 1 | 13 | 7 | 2 | 23 |
| Brehat | 1 | 13 | 7 | 1 | 22 |
| Tain | 1 | 12 | 6 | 2 | 21 |

🤖 **AI agents stay in their lane.** Every member uses their own Cursor agent. The always-on rule [`.cursor/rules/team-ownership.mdc`](.cursor/rules/team-ownership.mdc) has the agent:
- read `.pranora-member` to know who you are;
- only edit files in your area from [team.md](docs/team.md), and refuse to touch anyone else's;
- make only small, flagged additions to shared files;
- check `git diff` before committing, and commit only to your own branch.

To change another member's area, add a request in [team.md §8](docs/team.md#8-change-requests) or open an issue.

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Feature list (PDF, Bangla)](docs/PetCare_BD_Feature_List_Bangla.pdf) | Original feature list and phases ("PetCare BD") that the docs follow |
| [PRD](docs/prd.md) | Product requirements, features, personas, safety rules, release plan |
| [TRD](docs/trd.md) | Architecture, tech stack, nearest-vet, rescue/adoption, payments, AI & calls design, security |
| [App Flow](docs/app-flow.md) | Screens, navigation and user flows |
| [Design Brief](docs/design.md) | Brand, colors, Bangla typography, components, key screens |
| [Schema](docs/schema.md) | Database tables, PostGIS functions, RLS, storage |
| [Rules](docs/rules.md) | Product, coding, i18n, git, ownership and security rules |
| [Tracker](docs/tracker.md) | Tasks, owners, sizes, status and decisions |
| [Team](docs/team.md) | Who owns what, shared files, workload balance, change requests |

---

## 🤝 Contributing

1. **Set up your identity:** create the git-ignored `.pranora-member` with your id (see [`.pranora-member.example`](.pranora-member.example)).
2. **Claim a task:** pick one of *your* rows in [tracker.md](docs/tracker.md), set Status 🟨 and commit.
3. **Use your own branch:** `zihad`, `afridi`, `Zimia`, `brehat`, `tain`, or `<member>/<task-id>-short-name` (e.g. `brehat/RSC-1-report-form`). Never push to `main`.
4. **Stay in your area:** change only your paths from [team.md](docs/team.md); flag any shared-file edit in the PR.
5. **Bilingual always:** every UI string goes in **both** `bn` and `en`, in your own i18n namespace; use the shared formatters for ৳, dates and distances.
6. **Commit with Conventional Commits and the task ID:** `feat(map): MAP-3 open-now filter`, `fix(booking): APT-1a prevent double serial`.
7. **Open a PR:** reviewed by the CODEOWNERS of every touched area, CI green, tracker updated → Afridi merges to `main`.

Full rules: [docs/rules.md](docs/rules.md).

---

<div align="center">

Made with ❤️ for the pets of Bangladesh · বাংলাদেশের পোষা প্রাণীদের জন্য ভালোবাসায় তৈরি

</div>
