# Pranora — Project Tracker

Status legend: ⬜ Todo · 🟨 In progress · 🟦 In review · ✅ Done · ⛔ Blocked
Priority: P0 = MVP · P1 = Phase 2 · P2 = Phase 3
Feature IDs match [prd.md](./prd.md).

_Last updated: 2026-11-06_

---

## Summary

| Phase | Total | Done | Progress |
|---|---|---|---|
| Phase 0 — Planning & Setup | 12 | 7 | 58% |
| Phase 1 — MVP | 42 | 0 | 0% |
| Phase 2 | 14 | 0 | 0% |
| Phase 3 | 6 | 0 | 0% |

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
| SET-1 | Turborepo + pnpm monorepo scaffold (apps/mobile, apps/web, packages/*) | — | ⬜ |
| SET-2 | Supabase projects (staging, prod — Singapore) + local Docker | — | ⬜ |
| SET-3 | Google Maps API keys (restricted) | — | ⬜ |
| SET-4 | GitHub Actions CI (lint, typecheck, test) | — | ⬜ |
| DES-1 | Figma foundations + components (bn/en) | — | ⬜ |

## Phase 1 — MVP (P0)

### Foundation
| ID | Task | Status |
|---|---|---|
| I18N-1 | `packages/i18n`: bn/en files, formatters (৳, digits, dates, km) | ⬜ |
| I18N-2 | Language switch + persistence (app & web) | ⬜ |
| DB-1 | Migrations: enums, locations, profiles, addresses | ⬜ |
| DB-2 | Seed divisions / districts / upazilas | ⬜ |
| DB-3 | Migrations: pets, breeds, health tables | ⬜ |
| DB-4 | Migrations: providers, locations, hours, vets, services | ⬜ |
| DB-5 | Migrations: bookings, availability | ⬜ |
| DB-6 | RLS policies + pgTAP tests | ⬜ |
| DB-7 | Seed service catalog + vaccine templates | ⬜ |

### Auth & Onboarding
| ID | Task | Status |
|---|---|---|
| AUTH-1 | Phone OTP login (SMS hook → BD gateway) | ⬜ |
| AUTH-3 | Language selection on first launch | ⬜ |
| AUTH-4 | Location permission screen | ⬜ |
| AUTH-5 | Role selection (owner / vet / provider) | ⬜ |

### Pets & Health
| ID | Task | Status |
|---|---|---|
| PET-1 | Add / edit / delete pets | ⬜ |
| HLT-1 | Vaccine schedule auto-generation | ⬜ |
| HLT-2 | Reminders (push + SMS) with pg_cron | ⬜ |
| HLT-3 | Medical history + uploads | ⬜ |

### ⭐ Nearest Vet Map
| ID | Task | Status |
|---|---|---|
| MAP-1 | `nearby_clinics` + `is_location_open` SQL functions | ⬜ |
| MAP-1a | App map screen (react-native-maps) | ⬜ |
| MAP-1b | Web map page (Google Maps, split view) | ⬜ |
| MAP-2 | Distance-sorted list / bottom sheet | ⬜ |
| MAP-3 | Filters (open now, 24/7, emergency, home visit, species, govt) | ⬜ |
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
| APT-1 | Booking flow (service → pet → slot → confirm) | ⬜ |
| APT-1a | `available_slots` + `create_booking` RPC | ⬜ |
| APT-2 | Status lifecycle + provider confirm | ⬜ |
| APT-3 | Reschedule / cancel | ⬜ |
| APT-4 | Booking reminders | ⬜ |
| PAY-1 | Cash payment | ⬜ |

### Provider & Admin
| ID | Task | Status |
|---|---|---|
| PRV-1 | Provider onboarding (info, map pin, hours, services, documents) | ⬜ |
| PRV-2 | Provider dashboard: bookings, schedule | ⬜ |
| ADM-1 | Admin: provider verification | ⬜ |
| ADM-2 | Admin: clinic data moderation, suggestions | ⬜ |

### Release
| ID | Task | Status |
|---|---|---|
| REL-1 | E2E tests for critical flows | ⬜ |
| REL-2 | Privacy policy & terms (bn/en) | ⬜ |
| REL-3 | Play Store + App Store + pranora.com.bd launch | ⬜ |

## Phase 2 (P1)

| ID | Task | Status |
|---|---|---|
| PAY-2 | SSLCommerz: bKash, Nagad, Rocket, cards | ⬜ |
| PAY-3 | Invoices & refunds | ⬜ |
| APT-5 | Digital prescription | ⬜ |
| SVC-ONL | Online consultation (video) | ⬜ |
| SVC-GRM | Grooming booking | ⬜ |
| SVC-SHOP | Pet shop + cart + orders | ⬜ |
| SVC-BRD | Boarding (date range) | ⬜ |
| REV-1 | Reviews & ratings | ⬜ |
| SVC-ADP | Adoption | ⬜ |
| SVC-LF | Lost & found with map | ⬜ |
| SVC-TIPS | Articles / tips (bn) | ⬜ |
| MAP-8/9 | Radius slider + clustering | ⬜ |
| MAP-10 | Service layers on map | ⬜ |
| MAP-11 | Suggest a clinic | ⬜ |

## Phase 3 (P2)

| ID | Task | Status |
|---|---|---|
| SVC-SIT | Pet sitting & walking | ⬜ |
| SVC-TRN | Training | ⬜ |
| SVC-TAXI | Pet taxi | ⬜ |
| AI-1 | AI symptom checker | ⬜ |
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

## Blockers / Open Questions

- Original `PetCare_BD_Feature_List_Bangla.pdf` not yet in repo — align feature list once added.
- Source for initial clinic data (DLS list, partnerships)?
- SMS gateway vendor choice and cost.
