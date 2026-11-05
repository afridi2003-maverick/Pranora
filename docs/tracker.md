# Pranora — Project Tracker

Status legend: ⬜ Todo · 🟨 In progress · 🟦 In review · ✅ Done · ⛔ Blocked
Priority: P0 = MVP · P1 = Phase 2 · P2 = Phase 3
Size (effort): S = 1 point · M = 2 · L = 3
Feature IDs match [prd.md](./prd.md). Source feature list: [PetCare_BD_Feature_List_Bangla.pdf](./PetCare_BD_Feature_List_Bangla.pdf).

_Last updated: 2026-11-06_

> **How to claim a task:** owners are a **proposed** balanced split (see [team.md](./team.md)). Work only on tasks in your Owner column. Before starting, set Status to 🟨 on your own row and commit on your branch. Edit only the Owner/Status of your own rows. New tasks go to the area owner, or to whoever has the fewest open tasks in that phase ([team.md §4](./team.md#4-workload-balance)).

---

## Summary

| Phase | Total | Done | Progress |
|---|---|---|---|
| Phase 0 — Planning & Setup | 13 | 8 | 62% |
| Phase 1 — MVP | 63 | 0 | 0% |
| Phase 2 | 34 | 0 | 0% |
| Phase 3 | 7 | 0 | 0% |

Per-member workload: [team.md §4](./team.md#4-workload-balance).

---

## Phase 0 — Planning & Setup

| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| DOC-1 | PRD | Zihad | — | ✅ |
| DOC-2 | TRD | Zihad | — | ✅ |
| DOC-3 | App flow | Zihad | — | ✅ |
| DOC-4 | UI/UX design brief | Zihad | — | ✅ |
| DOC-5 | Backend schema doc | Zihad | — | ✅ |
| DOC-6 | Rules + .cursorrules | Zihad | — | ✅ |
| DOC-7 | README + tracker | Zihad | — | ✅ |
| DOC-8 | Align all docs with the PetCare BD feature list PDF | Zihad | — | ✅ |
| SET-1 | Turborepo + pnpm monorepo scaffold (apps/mobile, apps/web, packages/*) | Afridi | L | ⬜ |
| SET-2 | Supabase projects (staging, prod — Singapore) + local Docker | Brehat | M | ⬜ |
| SET-3 | Google Maps API keys (restricted) | Zimia | S | ⬜ |
| SET-4 | GitHub Actions CI (lint, typecheck, test) | Tain | M | ⬜ |
| DES-1 | Figma foundations + components (bn/en) | Zihad | L | ⬜ |

## Phase 1 — MVP (P0)

MVP = only modules 1–4 of the source build order: account & roles → rescue (incl. lost & found) → adoption → vet (incl. nearest-vet map). Reminders (module 5) and AI/calls (module 6) are Phase 2.

### Foundation
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| I18N-1 | `packages/i18n`: bn/en files, formatters (৳, digits, dates, km) | Zihad | L | ⬜ |
| I18N-2 | Language switch + persistence (app & web) | Zihad | M | ⬜ |
| DB-1 | Migrations: enums, locations, profiles, user_roles, addresses | Afridi | L | ⬜ |
| DB-2 | Seed divisions / districts / upazilas | Afridi | S | ⬜ |
| DB-3 | Migrations: pets, breeds, ownership history, health tables, pet_documents | Zihad | L | ⬜ |
| DB-4 | Migrations: providers, locations, hours, vets, services | Zimia | M | ⬜ |
| DB-5 | Migrations: bookings, availability (slots + serials) | Tain | M | ⬜ |
| DB-6 | RLS framework: `has_role`/`is_admin` helpers, pgTAP harness, core-table policies (each owner adds policies + tests for their own tables) | Afridi | L | ⬜ |
| DB-7 | Seed service catalog + vaccine templates | Zihad | M | ⬜ |
| DB-8 | Migrations: rescue (animal_reports, cases, assignments, updates, `lost_found_board`) | Brehat | M | ⬜ |
| DB-9 | Migrations: adoption (listings, applications, handovers, favorites, follow-ups) | Brehat | M | ⬜ |

### Auth & Onboarding
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| AUTH-1 | Login with phone OTP (SMS hook → BD gateway) or email | Afridi | L | ⬜ |
| AUTH-3 | Language selection on first launch | Afridi | S | ⬜ |
| AUTH-4 | Location permission screen | Afridi | S | ⬜ |
| AUTH-5 | Multi-role selection (owner / rescuer / shelter / vet / provider) + role switcher + role verification request | Afridi | M | ⬜ |

### Pets & Health
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| PET-1 | Add / edit / delete pets | Zihad | M | ⬜ |
| PET-5 | One profile for life: rescued animal profile, ownership transfer keeps records | Zihad | M | ⬜ |
| HLT-1 | Vaccine record + schedule auto-generation | Zihad | L | ⬜ |
| HLT-3 | Medical history (vet-written, owner read-only) + owner uploads | Zihad | M | ⬜ |
| HLT-7 | Vet visit notes (findings + treatment) | Zihad | M | ⬜ |

### Rescue (উদ্ধার)
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| RSC-1 | Report an animal (injured / lost / found / abandoned): photos (EXIF stripped), location, urgency; lost links own pet + last seen | Brehat | L | ⬜ |
| RSC-2 | Review queue for admin / shelter, urgent first | Tain | M | ⬜ |
| RSC-3 | Assign rescuer; accept / decline | Brehat | M | ⬜ |
| RSC-4 | Case page: status, notes, photo updates | Brehat | M | ⬜ |
| RSC-5 | Reporter status tracker (`my_report_status`) | Brehat | S | ⬜ |
| RSC-6 | Urgent report alert (push + SMS) + 15-min escalation | Brehat | M | ⬜ |
| RSC-7 | Record outcome and close case | Brehat | S | ⬜ |

### Adoption (দত্তক)
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| ADP-1 | Public listings without login; filters species / age / district | Brehat | M | ⬜ |
| ADP-2 | Create listing from pet profile (verified shelter / approved individual) | Brehat | M | ⬜ |
| ADP-3 | Adoption application form | Brehat | M | ⬜ |
| ADP-4 | Application status tracking | Brehat | S | ⬜ |
| ADP-5 | Human review & decision (`decide_adoption_application`) | Tain | M | ⬜ |
| ADP-6 | Two-sided handover + ownership transfer (one per listing) | Brehat | L | ⬜ |

### ⭐ Nearest Vet Map
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| MAP-1 | `nearby_clinics` + `is_location_open` SQL functions | Zimia | L | ⬜ |
| MAP-1a | App map screen (react-native-maps) | Zimia | M | ⬜ |
| MAP-1b | Web map page (Google Maps, split view) | Zimia | M | ⬜ |
| MAP-2 | Distance-sorted list / bottom sheet | Zimia | M | ⬜ |
| MAP-3 | Filters (open now, 24/7, emergency, species, fee, govt) | Zimia | M | ⬜ |
| MAP-4 | Area search + division/district/upazila picker | Zimia | M | ⬜ |
| MAP-5 | Clinic detail page | Zimia | M | ⬜ |
| MAP-6 | Call / Directions / Book actions | Zimia | S | ⬜ |
| MAP-7 | Emergency mode | Zimia | M | ⬜ |
| MAP-SEED | Seed clinic data (DLS upazila hospitals + Dhaka private clinics) | Zimia | L | ⬜ |

### ⭐ Services
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| SVC-1 | Services tab / `/services` page from catalog | Zihad | M | ⬜ |
| SVC-2 | Provider list per service (list/map toggle) | Zimia | M | ⬜ |

### Booking
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| APT-1 | Booking flow (service → pet → slot or serial → confirm) | Tain | L | ⬜ |
| APT-1a | `available_slots` + `create_booking` RPC (slots + serials) | Tain | L | ⬜ |
| APT-2 | Status lifecycle + provider confirm | Tain | M | ⬜ |
| APT-3 | Reschedule / cancel until clinic cut-off | Tain | M | ⬜ |
| APT-6 | Vet schedule: weekly hours, holidays, slots or serials | Tain | M | ⬜ |
| PAY-1 | Cash at clinic | Tain | S | ⬜ |

### Provider, Shelter & Admin
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| PRV-1 | Provider onboarding (info, map pin, hours, services, documents) | Tain | M | ⬜ |
| PRV-2 | Provider dashboard: bookings, schedule, serial list | Tain | M | ⬜ |
| PRV-3 | Shelter onboarding + dashboard (queue, cases, listings, applications) | Tain | L | ⬜ |
| ADM-1 | Admin: verification of vets, shelters, rescuers, adoption listers | Afridi | M | ⬜ |
| ADM-2 | Admin: remove fake listings/reports, clinic data moderation, suggestions | Afridi | M | ⬜ |
| ADM-3 | Admin: urgent rescue report queue | Afridi | S | ⬜ |

### Notifications
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| NOTIF-1 | In-app inbox + push + SMS channels (OTP, urgent rescue, booking confirmed) | Afridi | L | ⬜ |

### Release
| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| REL-1 | E2E tests for critical flows (harness + CI; each owner writes their flow's test) | Afridi | L | ⬜ |
| REL-2 | Privacy policy & terms (bn/en) | Zihad | S | ⬜ |
| REL-3 | Play Store + App Store + pranora.com.bd launch | Afridi | M | ⬜ |
| REL-4 | Native Bangla speaker review of all text (esp. AI messages and SMS) | Zihad | S | ⬜ |
| REL-5 | Licensed vet review: BVC verification process, medicine & vaccine lists, legal rules | Zimia | S | ⬜ |

## Phase 2 (P1)

| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| HLT-2 | Reminders (push + in-app) with pg_cron | Afridi | M | ⬜ |
| APT-4 | Booking reminders 24h / 1h | Tain | S | ⬜ |
| HLT-6 | SMS reminders (vaccine + appointment) | Afridi | M | ⬜ |
| PAY-2 | Online payments: SSLCommerz (bKash, Nagad, Rocket, cards) | Afridi | L | ⬜ |
| PAY-3 | Invoices & refunds | Afridi | M | ⬜ |
| PAY-4 | Provider payouts | Afridi | M | ⬜ |
| SVC-HOME | Home visit request | Zimia | M | ⬜ |
| APT-5 | Digital prescription (vet only) | Tain | M | ⬜ |
| SVC-ONL | Online consultation | Tain | M | ⬜ |
| CALL-1 | Owner–vet audio call | Tain | L | ⬜ |
| CALL-2 | Owner–vet video call | Tain | L | ⬜ |
| CALL-3 | Call history | Tain | S | ⬜ |
| AI-1 | AI chat (bn/en) with guardrails | Zihad | L | ⬜ |
| AI-2 | Emergency-sign detection → go to vet | Zihad | M | ⬜ |
| AI-3 | Pet context with consent | Zihad | S | ⬜ |
| AI-4 | Booking help (books only after explicit yes) | Zihad | M | ⬜ |
| AI-5 | Hand-off to clinic / support | Zihad | S | ⬜ |
| AI-6 | AI voice (if Bangla STT/TTS is good enough) | Zihad | L | ⬜ |
| ADM-4 | Audit log | Afridi | M | ⬜ |
| ADP-7 | Save listings | Brehat | S | ⬜ |
| ADP-8 | Report fake listing | Brehat | S | ⬜ |
| ADP-9 | Post-adoption follow-up | Brehat | M | ⬜ |
| RSC-8 | Duplicate report detection + merge | Brehat | M | ⬜ |
| RSC-9 | Nearby rescuer search | Brehat | M | ⬜ |
| RSC-10 | Public lost & found board (`lost_found_board`) + nearby alerts | Brehat | M | ⬜ |
| SVC-GRM | Grooming booking | Zimia | M | ⬜ |
| SVC-SHOP | Pet shop + cart + orders (cash on delivery + online payment) | Brehat | L | ⬜ |
| SVC-BRD | Boarding (date range) | Zimia | M | ⬜ |
| REV-1 | Reviews & ratings | Zimia | M | ⬜ |
| REV-2 | Shared report flow (reviews, wrong clinic info) | Afridi | M | ⬜ |
| SVC-TIPS | Articles / tips (bn) | Zihad | M | ⬜ |
| MAP-8/9 | Radius slider + clustering | Zimia | M | ⬜ |
| MAP-10 | Service layers on map | Zimia | S | ⬜ |
| MAP-11 | Suggest a clinic | Zimia | M | ⬜ |

## Phase 3 (P2)

| ID | Task | Owner | Size | Status |
|---|---|---|---|---|
| ADP-10 | Smart adoption matching | Brehat | L | ⬜ |
| CALL-4 | Call recording (both must consent) | Tain | M | ⬜ |
| SVC-SIT | Pet sitting & walking | Zihad | M | ⬜ |
| SVC-TRN | Training | Afridi | M | ⬜ |
| SVC-TAXI | Pet taxi | Tain | M | ⬜ |
| LIV-1 | Livestock vets | Zimia | M | ⬜ |
| MAP-12 | Offline nearby cache | Zimia | M | ⬜ |

---

## Decisions Log

| Date | Decision |
|---|---|
| 2026-11-06 | App name: **Pranora**. Bangla is default language, English supported. |
| 2026-11-06 | Extra feature: nearest veterinary on map + services catalog, on app and website. |
| 2026-11-06 | Stack: Expo + Next.js monorepo, Supabase with PostGIS. |
| 2026-11-06 | Color palette: 10-step green scale + white, black, red (emergency only). Primary `#2F7B53`. See [design.md §3](./design.md#3-color-palette). |
| 2026-11-06 | Docs aligned with [PetCare_BD_Feature_List_Bangla.pdf](./PetCare_BD_Feature_List_Bangla.pdf) ("PetCare BD" = working title; name stays Pranora). Added rescue, full adoption, serial-number booking, multi-role users, AI assistant, calls, audit log; priorities follow the PDF phases (e.g. home visit → P1, online payment → P2 (later changed to P1, see below), SMS reminders → P1). Map and services catalog kept as team extras. |
| 2026-11-06 | MVP trimmed to modules 1–4 of the PDF build order (account/roles/pet profile, rescue, adoption, vet). Nearest-vet map stays P0 as vet search; services catalog shows only P0 services. Push/SMS reminders, booking reminders, tips, admin content/analytics and non-vet services are P1. |
| 2026-11-06 | Lost & Found merged into rescue: `lost`/`found` are rescue report types; `lost_found_posts` dropped; public `lost_found_board` view (no phone, ~1 km area) is P1 (RSC-10). |
| 2026-11-06 | Online payments moved earlier: bKash, Nagad, Rocket, cards via SSLCommerz plus invoices/refunds and provider payouts are P1 (was P2). MVP stays cash at clinic. |

| 2026-11-06 | Team of 5 (Zihad, Afridi, Zimia, Brehat, Tain) with a **proposed** equal split of work by area — see [team.md](./team.md). Each agent works only in its member's area (`.cursor/rules/team-ownership.mdc`). DB-8 split into DB-8 (rescue) and DB-9 (adoption) migrations. |

## Blockers / Open Questions

- Team to confirm the proposed ownership split in [team.md](./team.md), and add the GitHub handles for Zimia, Brehat and Tain (CODEOWNERS).

- Criteria for verifying rescuers and "approved individuals" who can list for adoption (NID? references?).
- AI vendor with good Bangla support, and Bangla speech-to-text / text-to-speech for AI voice.
- Source for initial clinic data (DLS list, partnerships)?
- SMS gateway vendor choice and cost.
