# Pranora — Project Tracker

Status legend: ⬜ Todo · 🟨 In progress · 🟦 In review · ✅ Done · ⛔ Blocked
Priority: P0 = MVP · P1 = Phase 2 · P2 = Phase 3
Size (effort): S = 1 point · M = 2 · L = 3
Sprint: planned 1-week sprint (S1, S2, …) from [schedule.md](./schedule.md)
Depends on: `ID` = **hard** (must be ✅ Done, i.e. merged to `dev`, before you start) · `(ID)` = **soft** (start against the agreed contract/stub; your PR merges **after** it)
Feature IDs match [prd.md](./prd.md). Source feature list: [PetCare_BD_Feature_List_Bangla.pdf](./PetCare_BD_Feature_List_Bangla.pdf).

_Last updated: 2026-11-06_

> **How to claim a task:** owners are a **proposed** balanced split (see [team.md](./team.md)). Work only on tasks in your Owner column that are planned for the current sprint ([schedule.md](./schedule.md)). Before starting, check that every hard dependency is ✅ and every soft dependency has an agreed contract ([schedule.md §5](./schedule.md#5-integration-points--contracts)); if not, the task is blocked — tell the owner of the dependency. Then set Status to 🟨 on your own row and commit on your branch. Edit only the Owner/Status of your own rows. New tasks go to the area owner, or to whoever has the fewest open tasks in that phase ([team.md §4](./team.md#4-workload-balance)).

---

## Summary

| Phase | Total | Done | Progress |
|---|---|---|---|
| Phase 0 — Planning & Setup | 13 | 8 | 62% |
| Phase 1 — MVP | 64 | 0 | 0% |
| Phase 2 | 34 | 0 | 0% |
| Phase 3 | 7 | 0 | 0% |

Per-member workload: [team.md §4](./team.md#4-workload-balance). Who works on what each week, milestones and the critical path: [schedule.md](./schedule.md).

---

## Phase 0 — Planning & Setup

| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| DOC-1 | PRD | Zihad | — | — | — | ✅ |
| DOC-2 | TRD | Zihad | — | — | — | ✅ |
| DOC-3 | App flow | Zihad | — | — | — | ✅ |
| DOC-4 | UI/UX design brief | Zihad | — | — | — | ✅ |
| DOC-5 | Backend schema doc | Zihad | — | — | — | ✅ |
| DOC-6 | Rules + .cursorrules | Zihad | — | — | — | ✅ |
| DOC-7 | README + tracker | Zihad | — | — | — | ✅ |
| DOC-8 | Align all docs with the PetCare BD feature list PDF | Zihad | — | — | — | ✅ |
| SET-1 | Turborepo + pnpm monorepo scaffold (apps/mobile, apps/web, packages/*) | Afridi | L | S1 | — | ✅ |
| SET-2 | Supabase projects (staging, prod — Singapore) + local Docker | Brehat | M | S1 | (SET-1) | ⬜ |
| SET-3 | Google Maps API keys (restricted) | Zimia | S | S1 | — | ⬜ |
| SET-4 | GitHub Actions CI (lint, typecheck, test) | Tain | M | S1 | SET-1 | ✅ |
| DES-1 | Figma foundations + components (bn/en) | Zihad | L | S1 | — | ⬜ |

## Phase 1 — MVP (P0)

MVP = only modules 1–4 of the source build order: account & roles → rescue (incl. lost & found) → adoption → vet (incl. nearest-vet map). Reminders (module 5) and AI/calls (module 6) are Phase 2.

### Foundation
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| I18N-1 | `packages/i18n`: bn/en files, formatters (৳, digits, dates, km) | Zihad | L | S1 | SET-1 | ⬜ |
| I18N-2 | Language switch + persistence (app & web) | Zihad | M | S5 | I18N-1, (DB-1) | ⬜ |
| UI-1 | `packages/ui`: design tokens (green scale, type, spacing) + base components (Button, Input, Card, ListItem, EmergencyButton, loading/empty/error states) for app & web | Zihad | L | S2 | SET-1, (DES-1) | ⬜ |
| DB-1 | Migrations: enums, locations, profiles, user_roles, addresses | Afridi | L | S1 | SET-1, (SET-2) | ⬜ |
| DB-2 | Seed divisions / districts / upazilas | Afridi | S | S2 | DB-1 | ⬜ |
| DB-3 | Migrations: pets, breeds, ownership history, health tables, pet_documents | Zihad | L | S2 | DB-1, (DB-6) | ⬜ |
| DB-4 | Migrations: providers, locations, hours, vets, services | Zimia | M | S2 | DB-1, (DB-6) | ⬜ |
| DB-5 | Migrations: bookings, availability (slots + serials) | Tain | M | S2 | DB-1, (DB-3), (DB-4) | ⬜ |
| DB-6 | RLS framework: `has_role`/`is_admin` helpers, pgTAP harness, core-table policies (each owner adds policies + tests for their own tables) | Afridi | L | S2 | DB-1 | ⬜ |
| DB-7 | Seed service catalog + vaccine templates | Zihad | M | S3 | DB-3, (DB-4) | ⬜ |
| DB-8 | Migrations: rescue (animal_reports, cases, assignments, updates, `lost_found_board`) | Brehat | M | S2 | DB-1, (DB-3), (DB-4) | ⬜ |
| DB-9 | Migrations: adoption (listings, applications, handovers, favorites, follow-ups) | Brehat | M | S2 | DB-8 | ⬜ |

### Auth & Onboarding
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| AUTH-1 | Login with phone OTP (SMS hook → BD gateway) or email | Afridi | L | S3 | DB-1, I18N-1, UI-1, (NOTIF-1) | ⬜ |
| AUTH-3 | Language selection on first launch | Afridi | S | S5 | I18N-1, UI-1, (AUTH-1), (I18N-2) | ⬜ |
| AUTH-4 | Location permission screen | Afridi | S | S4 | I18N-1, UI-1, (AUTH-1) | ⬜ |
| AUTH-5 | Multi-role selection (owner / rescuer / shelter / vet / provider) + role switcher + role verification request | Afridi | M | S4 | AUTH-1, DB-6 | ⬜ |

### Pets & Health
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| PET-1 | Add / edit / delete pets | Zihad | M | S3 | DB-3, UI-1, I18N-1, (AUTH-1) | ⬜ |
| PET-5 | One profile for life: rescued animal profile, ownership transfer keeps records | Zihad | M | S4 | PET-1, (DB-8), (AUTH-5) | ⬜ |
| HLT-1 | Vaccine record + schedule auto-generation | Zihad | L | S4 | PET-1, DB-7 | ⬜ |
| HLT-3 | Medical history (vet-written, owner read-only) + owner uploads | Zihad | M | S5 | PET-1, (AUTH-5) | ⬜ |
| HLT-7 | Vet visit notes (findings + treatment) | Zihad | M | S5 | HLT-3, (APT-2) | ⬜ |

### Rescue (উদ্ধার)
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| RSC-1 | Report an animal (injured / lost / found / abandoned): photos (EXIF stripped), location, urgency; lost links own pet + last seen | Brehat | L | S3 | DB-8, UI-1, I18N-1, (AUTH-1), (PET-1) | ⬜ |
| RSC-2 | Review queue for admin / shelter, urgent first | Tain | M | S4 | RSC-1, (PRV-3) | ⬜ |
| RSC-3 | Assign rescuer; accept / decline | Brehat | M | S4 | RSC-1, (RSC-2), (AUTH-5) | ⬜ |
| RSC-4 | Case page: status, notes, photo updates | Brehat | M | S4 | RSC-3 | ⬜ |
| RSC-5 | Reporter status tracker (`my_report_status`) | Brehat | S | S3 | RSC-1 | ⬜ |
| RSC-6 | Urgent report alert (push + SMS) + 15-min escalation | Brehat | M | S5 | RSC-1, NOTIF-1 | ⬜ |
| RSC-7 | Record outcome and close case | Brehat | S | S4 | RSC-4 | ⬜ |

### Adoption (দত্তক)
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| ADP-1 | Public listings without login; filters species / age / district | Brehat | M | S3 | DB-9, UI-1, I18N-1 | ⬜ |
| ADP-2 | Create listing from pet profile (verified shelter / approved individual) | Brehat | M | S5 | ADP-1, PET-5, (AUTH-5), (ADM-1) | ⬜ |
| ADP-3 | Adoption application form | Brehat | M | S5 | ADP-1, (AUTH-1), (ADP-2) | ⬜ |
| ADP-4 | Application status tracking | Brehat | S | S6 | ADP-3 | ⬜ |
| ADP-5 | Human review & decision (`decide_adoption_application`) | Tain | M | S6 | ADP-3, (PRV-3) | ⬜ |
| ADP-6 | Two-sided handover + ownership transfer (one per listing) | Brehat | L | S6 | ADP-3, PET-5, (ADP-5) | ⬜ |

### ⭐ Nearest Vet Map
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| MAP-1 | `nearby_clinics` + `is_location_open` SQL functions | Zimia | L | S2 | DB-4 | ⬜ |
| MAP-1a | App map screen (react-native-maps) | Zimia | M | S4 | SET-3, UI-1, I18N-1, (MAP-1), (AUTH-4) | ⬜ |
| MAP-1b | Web map page (Google Maps, split view) | Zimia | M | S4 | SET-3, UI-1, I18N-1, (MAP-1) | ⬜ |
| MAP-2 | Distance-sorted list / bottom sheet | Zimia | M | S4 | MAP-1, MAP-1a, (MAP-1b), (MAP-SEED) | ⬜ |
| MAP-3 | Filters (open now, 24/7, emergency, species, fee, govt) | Zimia | M | S5 | MAP-2 | ⬜ |
| MAP-4 | Area search + division/district/upazila picker | Zimia | M | S6 | MAP-2, DB-2 | ⬜ |
| MAP-5 | Clinic detail page | Zimia | M | S3 | DB-4, UI-1, I18N-1, (MAP-1) | ⬜ |
| MAP-6 | Call / Directions / Book actions | Zimia | S | S3 | MAP-5, (APT-1) | ⬜ |
| MAP-7 | Emergency mode | Zimia | M | S5 | MAP-3 | ⬜ |
| MAP-SEED | Seed clinic data (DLS upazila hospitals + Dhaka private clinics) | Zimia | L | S3 | DB-1, (DB-4), (DB-2) | ⬜ |

### ⭐ Services
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| SVC-1 | Services tab / `/services` page from catalog | Zihad | M | S3 | DB-7, UI-1, I18N-1 | ⬜ |
| SVC-2 | Provider list per service (list/map toggle) | Zimia | M | S5 | SVC-1, MAP-2 | ⬜ |

### Booking
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| APT-1 | Booking flow (service → pet → slot or serial → confirm) | Tain | L | S3 | APT-1a, UI-1, I18N-1, (PET-1), (MAP-5), (MAP-SEED) | ⬜ |
| APT-1a | `available_slots` + `create_booking` RPC (slots + serials) | Tain | L | S2 | DB-5 | ⬜ |
| APT-2 | Status lifecycle + provider confirm | Tain | M | S3 | APT-1 | ⬜ |
| APT-3 | Reschedule / cancel until clinic cut-off | Tain | M | S5 | APT-2 | ⬜ |
| APT-6 | Vet schedule: weekly hours, holidays, slots or serials | Tain | M | S6 | DB-5, (AUTH-5), (PRV-1) | ⬜ |
| PAY-1 | Cash at clinic | Tain | S | S3 | APT-1 | ⬜ |

### Provider, Shelter & Admin
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| PRV-1 | Provider onboarding (info, map pin, hours, services, documents) | Tain | M | S5 | DB-4, UI-1, I18N-1, (AUTH-5), (ADM-1) | ⬜ |
| PRV-2 | Provider dashboard: bookings, schedule, serial list | Tain | M | S5 | PRV-1, APT-1a, (APT-2) | ⬜ |
| PRV-3 | Shelter onboarding + dashboard (queue, cases, listings, applications) | Tain | L | S4 | DB-8, UI-1, I18N-1, (AUTH-5), (DB-9) | ⬜ |
| ADM-1 | Admin: verification of vets, shelters, rescuers, adoption listers | Afridi | M | S4 | DB-6, DB-4, UI-1, (AUTH-5) | ⬜ |
| ADM-2 | Admin: remove fake listings/reports, clinic data moderation, suggestions | Afridi | M | S5 | ADM-1, RSC-1, ADP-1, (MAP-SEED) | ⬜ |
| ADM-3 | Admin: urgent rescue report queue | Afridi | S | S4 | ADM-1, RSC-1 | ⬜ |

### Notifications
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| NOTIF-1 | In-app inbox + push + SMS channels (OTP, urgent rescue, booking confirmed) | Afridi | L | S3 | DB-1, UI-1, I18N-1 | ⬜ |

### Release
| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| REL-1 | E2E tests for critical flows (harness + CI; each owner writes their flow's test) | Afridi | L | S7 | SET-4, AUTH-5, APT-3, RSC-7, ADP-6, MAP-7, HLT-7 | ⬜ |
| REL-2 | Privacy policy & terms (bn/en) | Zihad | S | S4 | — | ⬜ |
| REL-3 | Play Store + App Store + pranora.com.bd launch | Afridi | M | S8 | REL-1, REL-2, REL-4, REL-5 | ⬜ |
| REL-4 | Native Bangla speaker review of all text (esp. AI messages and SMS) | Zihad | S | S7 | RSC-6, ADP-6, APT-3, NOTIF-1, MAP-7, HLT-7 | ⬜ |
| REL-5 | Licensed vet review: BVC verification process, medicine & vaccine lists, legal rules | Zimia | S | S6 | ADM-1, DB-7, (PRV-1) | ⬜ |

## Phase 2 (P1)

| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| HLT-2 | Reminders (push + in-app) with pg_cron | Afridi | M | S5 | HLT-1, NOTIF-1 | ⬜ |
| APT-4 | Booking reminders 24h / 1h | Tain | S | S8 | APT-2, HLT-2 | ⬜ |
| HLT-6 | SMS reminders (vaccine + appointment) | Afridi | M | S6 | HLT-2 | ⬜ |
| PAY-2 | Online payments: SSLCommerz (bKash, Nagad, Rocket, cards) | Afridi | L | S7 | PAY-1, (SVC-SHOP) | ⬜ |
| PAY-3 | Invoices & refunds | Afridi | M | S8 | PAY-2, (SVC-SHOP) | ⬜ |
| PAY-4 | Provider payouts | Afridi | M | S8 | PAY-2, PRV-2 | ⬜ |
| SVC-HOME | Home visit request | Zimia | M | S7 | APT-1, MAP-3 | ⬜ |
| APT-5 | Digital prescription (vet only) | Tain | M | S6 | HLT-7, APT-2 | ⬜ |
| SVC-ONL | Online consultation | Tain | M | S8 | CALL-2, PAY-2 | ⬜ |
| CALL-1 | Owner–vet audio call | Tain | L | S7 | APT-2 | ⬜ |
| CALL-2 | Owner–vet video call | Tain | L | S7 | CALL-1 | ⬜ |
| CALL-3 | Call history | Tain | S | S8 | CALL-1 | ⬜ |
| AI-1 | AI chat (bn/en) with guardrails | Zihad | L | S6 | AUTH-1, I18N-1, UI-1 | ⬜ |
| AI-2 | Emergency-sign detection → go to vet | Zihad | M | S7 | AI-1, MAP-7 | ⬜ |
| AI-3 | Pet context with consent | Zihad | S | S7 | AI-1, HLT-3 | ⬜ |
| AI-4 | Booking help (books only after explicit yes) | Zihad | M | S7 | AI-1, APT-1a, MAP-1 | ⬜ |
| AI-5 | Hand-off to clinic / support | Zihad | S | S8 | AI-1, MAP-5 | ⬜ |
| AI-6 | AI voice (if Bangla STT/TTS is good enough) | Zihad | L | S6 | AI-1 | ⬜ |
| ADM-4 | Audit log | Afridi | M | S6 | ADM-1 | ⬜ |
| ADP-7 | Save listings | Brehat | S | S7 | ADP-1 | ⬜ |
| ADP-8 | Report fake listing | Brehat | S | S8 | ADP-1, (REV-2) | ⬜ |
| ADP-9 | Post-adoption follow-up | Brehat | M | S6 | ADP-6, HLT-2 | ⬜ |
| RSC-8 | Duplicate report detection + merge | Brehat | M | S7 | RSC-1 | ⬜ |
| RSC-9 | Nearby rescuer search | Brehat | M | S8 | RSC-3 | ⬜ |
| RSC-10 | Public lost & found board (`lost_found_board`) + nearby alerts | Brehat | M | S8 | RSC-1, NOTIF-1 | ⬜ |
| SVC-GRM | Grooming booking | Zimia | M | S7 | APT-1, SVC-2 | ⬜ |
| SVC-SHOP | Pet shop + cart + orders (cash on delivery + online payment) | Brehat | L | S7 | SVC-1, AUTH-1 | ⬜ |
| SVC-BRD | Boarding (date range) | Zimia | M | S8 | APT-1, SVC-2 | ⬜ |
| REV-1 | Reviews & ratings | Zimia | M | S6 | APT-2, MAP-5 | ⬜ |
| REV-2 | Shared report flow (reviews, wrong clinic info) | Afridi | M | S6 | ADM-2, (REV-1) | ⬜ |
| SVC-TIPS | Articles / tips (bn) | Zihad | M | S8 | SVC-1 | ⬜ |
| MAP-8/9 | Radius slider + clustering | Zimia | M | S7 | MAP-3 | ⬜ |
| MAP-10 | Service layers on map | Zimia | S | S8 | MAP-8/9, SVC-2 | ⬜ |
| MAP-11 | Suggest a clinic | Zimia | M | S8 | MAP-5, ADM-2 | ⬜ |

## Phase 3 (P2)

| ID | Task | Owner | Size | Sprint | Depends on | Status |
|---|---|---|---|---|---|---|
| ADP-10 | Smart adoption matching | Brehat | L | S9 | ADP-9 | ⬜ |
| CALL-4 | Call recording (both must consent) | Tain | M | S9 | CALL-2 | ⬜ |
| SVC-SIT | Pet sitting & walking | Zihad | M | S9 | APT-1, PAY-2 | ⬜ |
| SVC-TRN | Training | Afridi | M | S9 | APT-1, PAY-2 | ⬜ |
| SVC-TAXI | Pet taxi | Tain | M | S9 | APT-1, PAY-2, (MAP-1) | ⬜ |
| LIV-1 | Livestock vets | Zimia | M | S9 | MAP-3 | ⬜ |
| MAP-12 | Offline nearby cache | Zimia | M | S9 | MAP-2 | ⬜ |

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
| 2026-11-06 | Dependency-aware plan: every task has `Depends on` (hard / soft) and a planned 1-week `Sprint`; members work only on current-sprint tasks whose dependencies are met; contract-first stubs for soft dependencies; member branches → `dev` (merge order per [schedule.md](./schedule.md)) → `main`. New task **UI-1** (design tokens + base components, Zihad) added because every screen depends on it. MVP launch planned for end of S8. No owner changes needed. |

## Blockers / Open Questions

- Team to confirm the proposed ownership split in [team.md](./team.md), and add the GitHub handles for Zimia, Brehat and Tain (CODEOWNERS).

- Criteria for verifying rescuers and "approved individuals" who can list for adoption (NID? references?).
- AI vendor with good Bangla support, and Bangla speech-to-text / text-to-speech for AI voice.
- Source for initial clinic data (DLS list, partnerships)?
- SMS gateway vendor choice and cost.
