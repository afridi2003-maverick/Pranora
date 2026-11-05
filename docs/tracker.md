# Pranora — Project Tracker

Status legend: ⬜ Todo · 🟨 In progress · 🟦 In review · ✅ Done · ⛔ Blocked
Priority: P0 = MVP · P1 = Phase 2 · P2 = Phase 3
Feature IDs match [prd.md](./prd.md). Source feature list: [PetCare_BD_Feature_List_Bangla.pdf](./PetCare_BD_Feature_List_Bangla.pdf).

_Last updated: 2026-11-06_

---

## Summary

| Phase | Total | Done | Progress |
|---|---|---|---|
| Phase 0 — Planning & Setup | 13 | 8 | 62% |
| Phase 1 — MVP | 64 | 0 | 0% |
| Phase 2 | 29 | 0 | 0% |
| Phase 3 | 9 | 0 | 0% |

---

## Phase 0 — Planning & Setup

| ID | Task | Owner | Status |
|---|---|---|---|
| DOC-1 | PRD | Zihad | ✅ |
| DOC-2 | TRD | Zihad | ✅ |
| DOC-3 | App flow | Zihad | ✅ |
| DOC-4 | UI/UX design brief | Zihad | ✅ |
| DOC-5 | Backend schema doc | Zihad | ✅ |
| DOC-6 | Rules + .cursorrules | Zihad | ✅ |
| DOC-7 | README + tracker | Zihad | ✅ |
| DOC-8 | Align all docs with the PetCare BD feature list PDF | Zihad | ✅ |
| SET-1 | Turborepo + pnpm monorepo scaffold (apps/mobile, apps/web, packages/*) | — | ⬜ |
| SET-2 | Supabase projects (staging, prod — Singapore) + local Docker | — | ⬜ |
| SET-3 | Google Maps API keys (restricted) | — | ⬜ |
| SET-4 | GitHub Actions CI (lint, typecheck, test) | — | ⬜ |
| DES-1 | Figma foundations + components (bn/en) | — | ⬜ |

## Phase 1 — MVP (P0)

Build order from the source feature list: account & roles → rescue → adoption → vet. If time is short, finish these four first.

### Foundation
| ID | Task | Status |
|---|---|---|
| I18N-1 | `packages/i18n`: bn/en files, formatters (৳, digits, dates, km) | ⬜ |
| I18N-2 | Language switch + persistence (app & web) | ⬜ |
| DB-1 | Migrations: enums, locations, profiles, user_roles, addresses | ⬜ |
| DB-2 | Seed divisions / districts / upazilas | ⬜ |
| DB-3 | Migrations: pets, breeds, ownership history, health tables, pet_documents | ⬜ |
| DB-4 | Migrations: providers, locations, hours, vets, services | ⬜ |
| DB-5 | Migrations: bookings, availability (slots + serials) | ⬜ |
| DB-6 | RLS policies + pgTAP tests | ⬜ |
| DB-7 | Seed service catalog + vaccine templates | ⬜ |
| DB-8 | Migrations: rescue (animal_reports, cases, assignments, updates) + adoption (listings, applications, handovers) | ⬜ |

### Auth & Onboarding
| ID | Task | Status |
|---|---|---|
| AUTH-1 | Login with phone OTP (SMS hook → BD gateway) or email | ⬜ |
| AUTH-3 | Language selection on first launch | ⬜ |
| AUTH-4 | Location permission screen | ⬜ |
| AUTH-5 | Multi-role selection (owner / rescuer / shelter / vet / provider) + role switcher + role verification request | ⬜ |

### Pets & Health
| ID | Task | Status |
|---|---|---|
| PET-1 | Add / edit / delete pets | ⬜ |
| PET-5 | One profile for life: rescued animal profile, ownership transfer keeps records | ⬜ |
| HLT-1 | Vaccine record + schedule auto-generation | ⬜ |
| HLT-2 | Reminders (push + in-app) with pg_cron | ⬜ |
| HLT-3 | Medical history (vet-written, owner read-only) + owner uploads | ⬜ |
| HLT-7 | Vet visit notes (findings + treatment) | ⬜ |

### Rescue (উদ্ধার)
| ID | Task | Status |
|---|---|---|
| RSC-1 | Report an animal: kind, photos (EXIF stripped), location, urgency | ⬜ |
| RSC-2 | Review queue for admin / shelter, urgent first | ⬜ |
| RSC-3 | Assign rescuer; accept / decline | ⬜ |
| RSC-4 | Case page: status, notes, photo updates | ⬜ |
| RSC-5 | Reporter status tracker (`my_report_status`) | ⬜ |
| RSC-6 | Urgent report alert (push + SMS) + 15-min escalation | ⬜ |
| RSC-7 | Record outcome and close case | ⬜ |

### Adoption (দত্তক)
| ID | Task | Status |
|---|---|---|
| ADP-1 | Public listings without login; filters species / age / district | ⬜ |
| ADP-2 | Create listing from pet profile (verified shelter / approved individual) | ⬜ |
| ADP-3 | Adoption application form | ⬜ |
| ADP-4 | Application status tracking | ⬜ |
| ADP-5 | Human review & decision (`decide_adoption_application`) | ⬜ |
| ADP-6 | Two-sided handover + ownership transfer (one per listing) | ⬜ |

### ⭐ Nearest Vet Map
| ID | Task | Status |
|---|---|---|
| MAP-1 | `nearby_clinics` + `is_location_open` SQL functions | ⬜ |
| MAP-1a | App map screen (react-native-maps) | ⬜ |
| MAP-1b | Web map page (Google Maps, split view) | ⬜ |
| MAP-2 | Distance-sorted list / bottom sheet | ⬜ |
| MAP-3 | Filters (open now, 24/7, emergency, home visit, species, fee, govt) | ⬜ |
| MAP-4 | Area search + division/district/upazila picker | ⬜ |
| MAP-5 | Clinic detail page | ⬜ |
| MAP-6 | Call / Directions / Book actions | ⬜ |
| MAP-7 | Emergency mode | ⬜ |
| MAP-SEED | Seed clinic data (DLS upazila hospitals + Dhaka private clinics) | ⬜ |

### ⭐ Services
| ID | Task | Status |
|---|---|---|
| SVC-1 | Services tab / `/services` page from catalog | ⬜ |
| SVC-2 | Provider list per service (list/map toggle) | ⬜ |

### Booking
| ID | Task | Status |
|---|---|---|
| APT-1 | Booking flow (service → pet → slot or serial → confirm) | ⬜ |
| APT-1a | `available_slots` + `create_booking` RPC (slots + serials) | ⬜ |
| APT-2 | Status lifecycle + provider confirm | ⬜ |
| APT-3 | Reschedule / cancel until clinic cut-off | ⬜ |
| APT-4 | Booking reminders (push + in-app) | ⬜ |
| APT-6 | Vet schedule: weekly hours, holidays, slots or serials | ⬜ |
| PAY-1 | Cash payment | ⬜ |

### Provider, Shelter & Admin
| ID | Task | Status |
|---|---|---|
| PRV-1 | Provider onboarding (info, map pin, hours, services, documents) | ⬜ |
| PRV-2 | Provider dashboard: bookings, schedule, serial list | ⬜ |
| PRV-3 | Shelter onboarding + dashboard (queue, cases, listings, applications) | ⬜ |
| ADM-1 | Admin: verification of vets, shelters, rescuers, adoption listers | ⬜ |
| ADM-2 | Admin: remove fake listings/reports, clinic data moderation, suggestions | ⬜ |
| ADM-3 | Admin: urgent rescue report queue | ⬜ |

### Notifications
| ID | Task | Status |
|---|---|---|
| NOTIF-1 | In-app inbox + push + SMS channels (OTP, urgent rescue, booking confirmed) | ⬜ |

### Release
| ID | Task | Status |
|---|---|---|
| REL-1 | E2E tests for critical flows | ⬜ |
| REL-2 | Privacy policy & terms (bn/en) | ⬜ |
| REL-3 | Play Store + App Store + pranora.com.bd launch | ⬜ |
| REL-4 | Native Bangla speaker review of all text (esp. AI messages and SMS) | ⬜ |
| REL-5 | Licensed vet review: BVC verification process, medicine & vaccine lists, legal rules | ⬜ |

## Phase 2 (P1)

| ID | Task | Status |
|---|---|---|
| HLT-6 | SMS reminders (vaccine + appointment) | ⬜ |
| SVC-HOME | Home visit request | ⬜ |
| APT-5 | Digital prescription (vet only) | ⬜ |
| SVC-ONL | Online consultation | ⬜ |
| CALL-1 | Owner–vet audio call | ⬜ |
| CALL-2 | Owner–vet video call | ⬜ |
| CALL-3 | Call history | ⬜ |
| AI-1 | AI chat (bn/en) with guardrails | ⬜ |
| AI-2 | Emergency-sign detection → go to vet | ⬜ |
| AI-3 | Pet context with consent | ⬜ |
| AI-4 | Booking help (books only after explicit yes) | ⬜ |
| AI-5 | Hand-off to clinic / support | ⬜ |
| AI-6 | AI voice (if Bangla STT/TTS is good enough) | ⬜ |
| ADM-4 | Audit log | ⬜ |
| ADP-7 | Save listings | ⬜ |
| ADP-8 | Report fake listing | ⬜ |
| ADP-9 | Post-adoption follow-up | ⬜ |
| RSC-8 | Duplicate report detection + merge | ⬜ |
| RSC-9 | Nearby rescuer search | ⬜ |
| SVC-GRM | Grooming booking | ⬜ |
| SVC-SHOP | Pet shop + cart + orders (cash on delivery) | ⬜ |
| SVC-BRD | Boarding (date range) | ⬜ |
| REV-1 | Reviews & ratings | ⬜ |
| REV-2 | Shared report flow (reviews, wrong clinic info) | ⬜ |
| SVC-LF | Lost & found with map | ⬜ |
| SVC-TIPS | Articles / tips (bn) | ⬜ |
| MAP-8/9 | Radius slider + clustering | ⬜ |
| MAP-10 | Service layers on map | ⬜ |
| MAP-11 | Suggest a clinic | ⬜ |

## Phase 3 (P2)

| ID | Task | Status |
|---|---|---|
| PAY-2 | Online payments: SSLCommerz (bKash, Nagad, Rocket, cards) | ⬜ |
| PAY-3 | Invoices & refunds | ⬜ |
| ADP-10 | Smart adoption matching | ⬜ |
| CALL-4 | Call recording (both must consent) | ⬜ |
| SVC-SIT | Pet sitting & walking | ⬜ |
| SVC-TRN | Training | ⬜ |
| SVC-TAXI | Pet taxi | ⬜ |
| LIV-1 | Livestock vets | ⬜ |
| MAP-12 | Offline nearby cache | ⬜ |

---

## Decisions Log

| Date | Decision |
|---|---|
| 2026-11-06 | App name: **Pranora**. Bangla is default language, English supported. |
| 2026-11-06 | Extra feature: nearest veterinary on map + services catalog, on app and website. |
| 2026-11-06 | Stack: Expo + Next.js monorepo, Supabase with PostGIS. |
| 2026-11-06 | Color palette: 10-step green scale + white, black, red (emergency only). Primary `#2F7B53`. See [design.md §3](./design.md#3-color-palette). |
| 2026-11-06 | Docs aligned with [PetCare_BD_Feature_List_Bangla.pdf](./PetCare_BD_Feature_List_Bangla.pdf) ("PetCare BD" = working title; name stays Pranora). Added rescue, full adoption, serial-number booking, multi-role users, AI assistant, calls, audit log; priorities follow the PDF phases (e.g. home visit → P1, online payment → P2, SMS reminders → P1). Map and services catalog kept as team extras. |

## Blockers / Open Questions

- MVP is now larger (rescue + adoption are P0 per the PDF, on top of the map and services catalog). Confirm the team can ship this, or trim to the PDF's "1–4 first" order.
- Lost & Found (owners' own pets) overlaps with rescue reports of kind "lost" — keep both or merge?
- Criteria for verifying rescuers and "approved individuals" who can list for adoption (NID? references?).
- AI vendor with good Bangla support, and Bangla speech-to-text / text-to-speech for AI voice.
- Source for initial clinic data (DLS list, partnerships)?
- SMS gateway vendor choice and cost.
