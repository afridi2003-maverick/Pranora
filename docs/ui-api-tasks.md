# Pranora — UI & API Implementation Task Tracker

**Owner:** Zihad (Product, Design, Pet Health, AI, Care Services)
**Branch:** `zihad`
**Created:** 25 November 2026
**Goal:** UI 100% complete + all pages wired to real Supabase API (zero mock data in production paths)

> **Priority Order:** P1 → P2 → P3. Complete each priority group before moving to next.
> **Rule:** Every page must have Loading state, Empty state, and Error state before marking done.

---

## Status Legend
| Icon | Meaning |
|------|---------|
| 🔴 | Not started — UI is placeholder/empty |
| 🟡 | UI exists but wired to MOCK data only |
| 🔵 | UI complete, API exists but not connected |
| ✅ | Done — real API connected, loading/empty/error states present |

---

## P1 — Critical User Flows (Must work for demo)

### 1.1 Home & Navigation
| Task | File | Status | Notes |
|------|------|--------|-------|
| Home page hero — proper nav links | `apps/web/app/page.tsx` | ✅ | Upgraded with `AppShell` + `HomeDashboard` |
| `[locale]/page.tsx` — real dashboard (not re-export of root) | `app/[locale]/page.tsx` | ✅ | Renders full `HomeDashboard` (Hero, Service tiles, Rescue & Booking cards) |
| Bottom navigation bar (web) | `packages/ui/src/components/BottomNav.tsx` | ✅ | Mounted in `AppShell.tsx` for mobile viewports (`md:hidden`) |
| Auth guard — session-aware nav & redirect | `app/[locale]/layout.tsx` | ✅ | Wrapped in `SessionProvider` + `AppShell` + `LanguageHeader` auth status |

### 1.2 Authentication
| Task | File | Status | Notes |
|------|------|--------|-------|
| Login page — phone OTP input + send OTP | `app/[locale]/(auth)/login/page.tsx` | ✅ | Wired to `signInWithPhoneOtp()` & `signInWithEmailOtp()` |
| OTP verify step | `app/[locale]/(auth)/login/page.tsx` | ✅ | Wired to `verifyPhoneOtp()` & `verifyEmailOtp()` + redirect |
| Session persistence & `useSession` hook | `apps/web/hooks/useSession.tsx` | ✅ | `SessionProvider` + `useSession()` active across app |
| Supabase client provider (`createSupabaseClient`) | `apps/web/lib/supabase.ts` | ✅ | Browser singleton created with env var check |

### 1.3 Pets Management
| Task | File | Status | Notes |
|------|------|--------|-------|
| List my pets — call `listMyPets()` | `app/[locale]/pets/page.tsx` | ✅ | Wired to `listMyPets(supabase)` with Skeleton & demo fallback |
| Load real breeds — call `listBreeds()` | `app/[locale]/pets/page.tsx` | ✅ | Wired to `listBreeds(supabase)` |
| Add pet — call `addPet()` | `app/[locale]/pets/page.tsx` | ✅ | Wired to `addPet(supabase, payload)` + Toast |
| Edit pet — call `editPet()` | `app/[locale]/pets/page.tsx` | ✅ | Wired to `editPet(supabase, ...)` + Toast |
| Delete pet — call `deletePet()` | `app/[locale]/pets/page.tsx` | ✅ | Wired to `deletePet(supabase, id)` + Toast |
| Transfer pet — call `transferPetOwnership()` | `app/[locale]/pets/page.tsx` | ✅ | Wired to `transferPetOwnership(supabase, ...)` |
| Fetch ownership history — call `getPetOwnershipHistory()` | `app/[locale]/pets/page.tsx` | ✅ | Wired to `getPetOwnershipHistory(supabase, petId)` |
| Pet photo upload (Supabase Storage) | `features/pets/PetForm.tsx` | 🔴 | photo_url field present but no upload UI |

### 1.4 Clinics Directory
| Task | File | Status | Notes |
|------|------|--------|-------|
| List clinics — call real API (not `getAllMockClinics()`) | `app/[locale]/clinics/page.tsx` | ✅ | Queries `provider_locations` + `providers` with mock fallback |
| Clinic detail page — real data | `app/[locale]/clinics/[id]/page.tsx` | ✅ | Passes `supabase` to `getClinicFullDetail(clinicId, supabase)` |
| Search & filter (real data) | `app/[locale]/clinics/page.tsx` | ✅ | Filters live or fallback clinics |
| Book appointment from clinic detail | `app/[locale]/clinics/[id]/page.tsx` | ✅ | Routes to `/${locale}/book` with clinic params |

### 1.5 Booking Flow
| Task | File | Status | Notes |
|------|------|--------|-------|
| BookingFlow — load vet slots | `features/booking/BookingFlow.tsx` | ✅ | Wired `getAvailableSlots(supabase, ...)` with fallback |
| BookingFlow — submit `createBooking()` | `features/booking/BookingFlow.tsx` | ✅ | Wired `createBooking(supabase, payload)` |
| BookingFlow — pet picker from real pets | `features/booking/BookingFlow.tsx` | ✅ | Wired `listMyPets(supabase)` |
| My Bookings — `listMyBookings()` | `features/booking/MyBookings.tsx` | ✅ | Wired `listUserBookings(supabase)` |
| Cancel booking — `cancelBooking()` | `features/booking/MyBookings.tsx` | ✅ | Wired `cancelBooking(supabase, ...)` & `rescheduleBooking` |

### 1.6 Reminders
| Task | File | Status | Notes |
|------|------|--------|-------|
| Load user pets for reminder pet-picker | `app/[locale]/reminders/page.tsx` | ✅ | Wired `listMyPets(supabase)` |
| List reminders — `listReminders()` from API | `app/[locale]/reminders/page.tsx` | ✅ | Wired `listReminders(supabase)` with Skeleton |
| Create reminder — `createReminder()` | `app/[locale]/reminders/page.tsx` | ✅ | Wired `createReminder(supabase, params)` |
| Delete reminder — `deleteReminder()` | `app/[locale]/reminders/page.tsx` | ✅ | Wired `deleteReminder` & `markReminderDone` |

---

## P2 — Core Feature Pages

### 2.1 Adoption
| Task | File | Status | Notes |
|------|------|--------|-------|
| Adoption listing — `listAdoptionListings()` | `features/adoption/AdoptionList.tsx` | ✅ | Wired `getPublicAdoptionListings(supabase)` with fallback |
| Save/unsave listing — `saveAdoptionListing()` | `features/adoption/AdoptionList.tsx` | ✅ | Wired `getMyFavoriteListingIds` + `toggleAdoptionFavorite` |
| Apply for adoption — `createAdoptionApplication()` | `app/[locale]/adoption/apply/[id]/page.tsx` | 🟡 | Form exists, no API submit |
| My applications — `listMyAdoptionApplications()` | `app/[locale]/adoption/applications/page.tsx` | 🟡 | Mock applications list |
| Saved listings page — `listSavedAdoptionListings()` | `app/[locale]/adoption/saved/page.tsx` | 🟡 | Mock saved IDs |
| Create adoption listing form + `createAdoptionListing()` | `app/[locale]/adoption/create/page.tsx` | 🟡 | Form exists, mock submit |
| Application status tracker | `features/adoption/AdoptionApplicationStatusTracker.tsx` | 🟡 | Mock status steps |
| Handover confirmation — `confirmAdoptionHandover()` | `app/[locale]/adoption/handover/[id]/page.tsx` | 🟡 | Mock |
| Follow-up checklist — `submitAdoptionFollowup()` | `app/[locale]/adoption/followup/[id]/page.tsx` | 🟡 | Mock |
| Review queue (admin/shelter) — `listPendingApplications()` | `app/[locale]/adoption/review/page.tsx` | 🟡 | Mock queue |

### 2.2 Rescue
| Task | File | Status | Notes |
|------|------|--------|-------|
| Report form — `createRescueCase()` | `app/[locale]/rescue/report/page.tsx` | ✅ | Wired `listMyPets` + `createAnimalReport(supabase, user.id, payload)` |
| Report status tracker — `getRescueCaseStatus()` | `app/[locale]/rescue/status/page.tsx` | 🟡 | Mock status timeline |
| Case detail — `getRescueCase()` | `app/[locale]/rescue/cases/[id]/page.tsx` | 🟡 | Mock case data |
| Rescuer assignments — `listMyAssignments()` | `app/[locale]/rescue/assignments/page.tsx` | 🟡 | Mock assignments |
| Add case update — `addCaseUpdate()` | `features/rescue/AddCaseUpdateForm.tsx` | 🟡 | Mock |
| Assign rescuer (admin/shelter) — `assignRescuer()` | `features/rescue/AssignRescuerModal.tsx` | 🟡 | Mock |
| Close case — `closeRescueCase()` | `features/rescue/CloseCaseOutcomeModal.tsx` | 🟡 | Mock |

### 2.3 Health & Medical Records
| Task | File | Status | Notes |
|------|------|--------|-------|
| Medical history — `getMedicalHistory()` | `features/health/MedicalHistory.tsx` | ✅ | Wired via `medical/page.tsx` (`listMedicalRecords`) |
| Add medical record — `addMedicalRecord()` | `features/health/AddMedicalRecordModal.tsx` | ✅ | Wired `addMedicalRecord(supabase, payload)` |
| Vaccine list — `listVaccinations()` | `features/health/VaccineList.tsx` | ✅ | Wired via `vaccination/page.tsx` (`listPetVaccinations`) |
| Record vaccine — `recordVaccination()` | `features/health/RecordVaccineModal.tsx` | ✅ | Wired `recordVaccination(supabase, ...)` & `autoGenerateSpeciesSchedule` |
| Vet visit note form — `createVisitNote()` | `features/health/VisitNoteForm.tsx` | 🟡 | Mock |
| Digital prescription — `createPrescription()` | `features/health/DigitalPrescriptionForm.tsx` | 🟡 | Mock |
| Upload document (Supabase Storage) | `features/health/UploadDocumentModal.tsx` | 🟡 | Metadata wired via `addPetDocument`/`deletePetDocument`, Storage bucket pending |
| Medical page wires all health features | `app/[locale]/medical/page.tsx` | ✅ | Wired `listMyPets`, `listMedicalRecords`, `listPetDocuments`, `addMedicalRecord` |
| Vaccination page wires VaccineList + RecordModal | `app/[locale]/vaccination/page.tsx` | ✅ | Wired `listMyPets`, `listPetVaccinations`, `autoGenerateSpeciesSchedule`, `recordVaccination` |

### 2.4 AI Assistant
| Task | File | Status | Notes |
|------|------|--------|-------|
| AI Chat UI — message send + stream response | `features/ai/AIChat.tsx` | 🟡 | UI exists, askAI() mock, no real Gemini API call |
| AI Chat — Bangla language support | `features/ai/AIChat.tsx` | 🟡 | Static response mock in both langs |
| Voice input (AI-5) | `packages/api/src/ai/voice.ts` | 🔴 | Stub only, no actual voice capture |
| Assistant page renders AIChat with real API | `app/[locale]/assistant/page.tsx` | ✅ | Wired `listMyPets(supabase)` to pass real pet context to `AIChat` |

### 2.5 Map & Nearby Services
| Task | File | Status | Notes |
|------|------|--------|-------|
| Map page — load clinic locations | `app/[locale]/map/page.tsx` | 🟡 | Mock clinic pins |
| Leaflet/Google Maps integration | `app/[locale]/map/page.tsx` | 🔴 | No actual map library rendered |
| Nearby search — `getNearbyProviders()` | `packages/api/src/map/index.ts` | 🔵 | API function exists, not used in page |
| District/upazila areas — `listAreas()` | `packages/api/src/map/areas.ts` | 🔵 | API ready, not used |

---

## P3 — Provider, Admin & Supporting Pages

### 3.1 Provider (Vet) Portal
| Task | File | Status | Notes |
|------|------|--------|-------|
| Provider onboarding wizard + `createProvider()` | `features/provider/ProviderOnboarding.tsx` | 🟡 | 16 mock entries |
| Provider dashboard stats | `features/provider/ProviderDashboard.tsx` | 🟡 | 13 hardcoded mock stats |
| Provider bookings list | `features/provider/ProviderBookings.tsx` | 🟡 | Mock bookings |
| Vet schedule manager | `features/provider/VetScheduleManager.tsx` | 🟡 | Mock slot grid |
| Provider prescription history | `app/[locale]/provider/prescription/page.tsx` | 🟡 | Mock prescriptions |

### 3.2 Shelter Portal
| Task | File | Status | Notes |
|------|------|--------|-------|
| Shelter onboarding + `registerShelter()` | `features/shelter/ShelterOnboarding.tsx` | 🟡 | 8 mock entries |
| Shelter dashboard | `features/shelter/ShelterDashboard.tsx` | 🟡 | 14 mock stats |
| Rescue review queue | `features/shelter/RescueReviewQueue.tsx` | 🟡 | Mock cases |

### 3.3 Admin Panel
| Task | File | Status | Notes |
|------|------|--------|-------|
| Admin audit log | `app/[locale]/admin/audit/page.tsx` | 🔴 | Stub page |
| Admin moderation queue | `app/[locale]/admin/moderation/page.tsx` | 🟡 | Mock queue |
| Admin rescue queue | `app/[locale]/admin/rescue-queue/page.tsx` | 🟡 | Mock |
| Admin verifications | `app/[locale]/admin/verifications/page.tsx` | 🟡 | Mock |

### 3.4 Services & Sitting
| Task | File | Status | Notes |
|------|------|--------|-------|
| Services grid — `listServices()` | `features/services/ServiceGrid.tsx` | 🟡 | Static grid |
| Service providers list — `listProvidersByService()` | `app/[locale]/services/[slug]/providers/page.tsx` | 🟡 | Mock |
| Sitting listings — `listSittingProviders()` | `features/sitting/SittingList.tsx` | 🟡 | Mock |
| Book sitting — `createSittingBooking()` | `features/sitting/BookSittingModal.tsx` | 🟡 | Mock |
| My sitting bookings | `features/sitting/SittingBookings.tsx` | 🟡 | Mock |

### 3.5 Tips / Articles
| Task | File | Status | Notes |
|------|------|--------|-------|
| Tips list — `listTips()` | `features/tips/TipsList.tsx` | 🟡 | 5 mock entries |
| Tip detail — `getTip()` | `features/tips/ArticleDetail.tsx` | 🟡 | Mock content |

### 3.6 Notifications
| Task | File | Status | Notes |
|------|------|--------|-------|
| Notification list — `listNotifications()` | `app/[locale]/notifications/page.tsx` | 🟡 | Mock notification array |
| Mark read — `markNotificationRead()` | `app/[locale]/notifications/page.tsx` | 🟡 | Local state only |

---

## UI Component Gaps

| Component | Issue | Priority |
|-----------|-------|---------|
| `BottomNav` — mounted in web layout | Added in `AppShell.tsx` | ✅ |
| `TopAppBar` — unified header nav | Upgraded `LanguageHeader.tsx` with nav links + auth | ✅ |
| Map component — no Leaflet/Mapbox added | Install & wire map lib | P2 |
| `Skeleton` loading — not used in most pages | Replace animate-pulse divs with `<Skeleton>` | P2 |
| `Toast` — global toast provider | Added `ToastProvider.tsx` to `app/layout.tsx` | ✅ |
| Dark mode — `ThemeToggle` wired with `data-theme="dark"` | Persisted in `localStorage` + CSS tokens in `globals.css` | ✅ |

---

## Infrastructure Tasks (Do FIRST — everything depends on these)

| Task | Status | Notes |
|------|--------|-------|
| `.env.local` — `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Created `apps/web/.env.local` with defaults |
| Supabase browser client singleton (`lib/supabase.ts`) | ✅ | `getSupabaseBrowserClient()` + `isSupabaseConfigured()` |
| Auth session context (`hooks/useSession.tsx`) | ✅ | `SessionProvider` + `useSession()` wired in root layout |
| RLS policies verified with real user tokens | 🔴 | Must test |
| Supabase Storage bucket for pet photos | 🔴 | Needed for photo_url uploads |
| Supabase Storage bucket for rescue photos | 🔴 | AnimalReportForm photo upload |
| `NEXT_PUBLIC_GEMINI_API_KEY` env var | 🔴 | Needed for AI Assistant |

---

## Progress Summary

| Priority | Total | ✅ Done | 🟡 Mock | 🔴 Not Started |
|----------|-------|---------|---------|----------------|
| P1 (Critical) | 24 | 23 | 0 | 1 |
| P2 (Core Features) | 34 | 10 | 20 | 4 |
| P3 (Provider/Admin) | 20 | 0 | 18 | 2 |
| UI Components | 6 | 4 | 0 | 2 |
| Infrastructure | 7 | 3 | 0 | 4 |
| **TOTAL** | **91** | **40** | **38** | **13** |

---

## Implementation Session Plan

### Session 1 — Foundation (Everything depends on this)
- [x] Create `.env.local` (Supabase URL + anon key)
- [x] Create `apps/web/lib/supabase.ts` — browser client singleton
- [x] Create `apps/web/hooks/useSession.tsx` — auth session hook
- [x] Add Supabase Provider + ToastProvider + Design Tokens to layout
- [x] Mount `BottomNav` + `LanguageHeader` + `HomeDashboard`
- [x] Wire Login page → phone/email OTP → verify → redirect

### Session 2 — P1 Real API Wiring
- [x] Pets page — `listMyPets()`, `listBreeds()`, `addPet()`, `editPet()`, `deletePet()`, `transferPetOwnership()`, `getPetOwnershipHistory()`
- [x] Reminders — `listMyPets()`, `listReminders()`, `createReminder()`, `markReminderDone()`, `deleteReminder()`
- [x] Clinics — query `provider_locations` + `providers` and pass `supabase` to `getClinicFullDetail()`
- [x] Booking flow — real slot loading, `listMyPets()`, `createBooking()`, `listUserBookings()`, `cancelBooking()`, `rescheduleBooking()`

### Session 3 — P2 Features
- [ ] Adoption full flow (list → apply → track → handover)
- [ ] Rescue full flow (report → track → update → close)
- [ ] Health & medical records all wired
- [ ] AI Assistant → real Gemini API call

### Session 4 — P3 + UI Polish
- [ ] Provider & Shelter portals
- [ ] Admin panel
- [ ] Toast provider + Skeleton states on all pages
- [ ] Map with Leaflet + real clinic pins
- [ ] BottomNav mounted in layout

---

*Last updated: 25 November 2026 — Zihad*
