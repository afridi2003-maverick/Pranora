# Pranora — Product Requirements Document (PRD)

> **প্রাণোরা — আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায়।**
> Version 1.1 · Owner: Pranora Team · Status: Draft
> Source feature list: [PetCare_BD_Feature_List_Bangla.pdf](./PetCare_BD_Feature_List_Bangla.pdf) (v1.0, 5 Nov 2026 — original working title **PetCare BD / পেটকেয়ার বিডি**; the product name is **Pranora**).

---

## 1. Overview

Pranora is a Bangla-first pet care platform for Bangladesh, available as a **mobile app (Android/iOS)** and a **responsive website**. It brings three things together in one place:

1. **দত্তক / Adoption** — shelters and approved people list animals; adopters apply; a human always approves; ownership is handed over in the app.
2. **উদ্ধার / Rescue** — anyone can report an injured, lost, found or abandoned animal; a rescuer is assigned and the case is tracked to the end. Lost & found pets are part of rescue, not a separate feature.
3. **পশুচিকিৎসা / Veterinary care** — find vets and clinics (also on a map), book by time slot or serial number, and keep treatment and vaccine records.

It also connects pet owners with groomers, pet shops, boarding and other pet services (services catalog), and adds an AI assistant and owner–vet calls in later phases.

**One animal, one profile:** a rescued animal gets a single profile, so its vet treatment and vaccine records move with it to the new owner after adoption. Animals that come straight to adoption follow the same path to a vet.

The default language is **Bangla (বাংলা)**; **English** is fully supported and can be switched at any time.

### 1.1 Problem

- Pet owners in Bangladesh struggle to find a trusted vet nearby, especially at night or in an emergency.
- Vaccination and deworming schedules are tracked on paper (or not at all) and are often missed.
- Pet services (grooming, boarding, food delivery) are scattered across Facebook pages with no reviews, pricing or booking.
- Most existing apps are English-only, which excludes a large share of pet owners outside Dhaka.
- Injured and abandoned street animals are reported in scattered Facebook posts; nobody knows who is handling a case or how it ended.
- Adoption happens through informal posts with no screening, no record of the handover and no medical history for the new owner.

### 1.2 Vision

Make quality pet care reachable for every pet owner in Bangladesh — in their own language, a few taps away.

### 1.3 Goals (first 12 months)

| Goal | Metric | Target |
|---|---|---|
| Adoption | Registered pet owners | 50,000 |
| Supply | Verified vets & clinics on the map | 500 across 8 divisions |
| Engagement | Monthly active users | 35% of registered |
| Health impact | Vaccination reminders acted on | 60% |
| Rescue | Rescue cases closed with a recorded outcome | 80% of accepted reports |
| Adoption | Completed adoptions (handover confirmed by both sides) | 2,000 |
| Revenue | Paid bookings + shop orders / month | 10,000 |

---

## 2. Target Users (Personas)

| Persona | Description | Key needs |
|---|---|---|
| **রাফি — First-time pet owner** (Dhaka, 24) | Adopted a cat, knows little about pet care | Tips in Bangla, vaccine schedule, nearest vet |
| **নাসরিন — Experienced owner** (Chattogram, 38) | Two dogs, frequent vet visits | Health records, appointment booking, home visit |
| **Dr. Karim — Veterinarian** | Runs a small clinic | Get bookings (slot or serial number), manage schedule, write visit notes & prescriptions |
| **তানিয়া — Rescuer (উদ্ধারকারী)** (Dhaka, 27) | Volunteer who picks up injured street animals | Get assigned cases nearby, accept/decline, update the case with notes & photos |
| **Shelter (শেল্টার)** | Animal shelter or rescue organization | Review rescue reports, publish adoption listings, review applications, hand over animals |
| **Adopter (দত্তক নিতে আগ্রহী)** | Wants to adopt a pet | Browse without login, filter by species/age/district, apply, track application |
| **Reporter (যে কেউ)** | Anyone who sees an animal in trouble | Report quickly with photo, area and urgency; see only the case status |
| **Service provider** | Groomer, pet shop, boarding, trainer | List services, receive orders/bookings, get paid |
| **Rural farmer / livestock owner** (optional, phase 3) | Cows, goats, poultry | Nearest government/livestock vet, emergency help |
| **Admin** | Pranora operations team | Verify vets & shelters, review urgent rescue reports, remove fake listings/reports, audit log |

One person can hold several roles at the same time — for example a pet owner who is also a rescuer.

---

## 3. Platforms

| Platform | Audience | Notes |
|---|---|---|
| Android app | Pet owners, providers | Primary platform (most BD users) |
| iOS app | Pet owners, providers | Same codebase as Android |
| Website (pet owners) | Pet owners | SEO for "নিকটস্থ পশু ডাক্তার", booking, shop |
| Provider dashboard (web) | Vets, clinics, shops | Schedules, serials, orders, earnings |
| Shelter & rescuer tools (web + app) | Shelters, rescuers | Rescue report queue, assigned cases, adoption listings & applications |
| Admin panel (web) | Pranora team | Verification (vets, shelters), moderation, audit log, analytics |

---

## 4. Features

Priority: **P0** = MVP launch, **P1** = soon after launch, **P2** = later.
These follow the source PDF's phases: **প্রথম ধাপ** (needed to launch) = P0, **পরের ধাপ** (after phase 1 works well) = P1, **ভবিষ্যতে** (can be added later) = P2. **P0 is limited to modules 1–4 of the PDF's build order** (account/roles/language/pet profile · rescue · adoption · vet); reminders (module 5) and AI/calls (module 6) are P1. Team extras are P0 only where they are part of those modules (the nearest-vet map is vet search; the services catalog shows only P0 services in the MVP). Exception by team decision: online payments are P1 (the PDF lists them as future).

### 4.1 Account & Onboarding
| ID | Feature | Priority |
|---|---|---|
| AUTH-1 | Sign up / login with **mobile number (OTP) or email** | P0 |
| AUTH-2 | Google sign-in | P1 |
| AUTH-3 | Language selection on first launch (বাংলা default / English) | P0 |
| AUTH-4 | Location permission with explanation in Bangla | P0 |
| AUTH-5 | Roles: Pet owner / Rescuer / Shelter / Vet / Service provider. **One person can hold several roles at once** (e.g. owner + rescuer). Rescuer, shelter, vet and provider roles need admin verification | P0 |

### 4.2 Pet Profile (পোষা প্রাণীর প্রোফাইল)
| ID | Feature | Priority |
|---|---|---|
| PET-1 | Add multiple pets: name, species (dog, cat, bird, rabbit, fish, other), breed, age/DOB, gender, weight, color, photo, vaccine & health info | P0 |
| PET-2 | Microchip / ID number, neutered status, allergies | P1 |
| PET-3 | Digital Pet ID card with QR code (for lost pets) | P1 |
| PET-4 | Share pet profile with family members | P2 |
| PET-5 | **One profile for life** — a rescued animal gets a profile held by its rescuer/shelter; on adoption the same profile (with treatment and vaccine records) moves to the new owner | P0 |

### 4.3 Health Records & Reminders (স্বাস্থ্য রেকর্ড)
| ID | Feature | Priority |
|---|---|---|
| HLT-1 | Vaccine record: which vaccine was given when, and when the next one is due; auto-generated schedule by species/age | P0 |
| HLT-2 | Reminders in the app + push: vaccine, deworming, flea/tick, medication (build-order module 5) | P1 |
| HLT-3 | Medical history: **only vets write** visits, diagnoses and treatment; the owner can view it. Owners can upload old paper reports / lab results as separate documents marked "মালিকের আপলোড / Uploaded by owner" | P0 |
| HLT-4 | Weight & growth chart | P1 |
| HLT-5 | Export health record as PDF (Bangla/English) | P1 |
| HLT-6 | **SMS reminders** for vaccine dates (and appointments, see APT-4) | P1 |
| HLT-7 | Visit notes: after a visit the vet records what they found and what treatment was given | P0 |

### 4.4 ⭐ Nearest Veterinary on Map (নিকটস্থ পশু চিকিৎসক — ম্যাপে)
The flagship extra feature. Available on **both app and website**.

| ID | Feature | Priority |
|---|---|---|
| MAP-1 | Map view showing vets, clinics and pet hospitals around the user's current location | P0 |
| MAP-2 | List view sorted by distance (km) with "Open now" badge | P0 |
| MAP-3 | Filters: open now, 24/7, emergency, species treated, government / private, price range (home-visit and rating filters arrive with those features in P1) | P0 |
| MAP-4 | Search by area name (e.g. "ধানমন্ডি", "Mirpur 10") or division/district/upazila when GPS is off | P0 |
| MAP-5 | Clinic detail card: name, photo, distance, rating, opening hours, services, fees, doctors | P0 |
| MAP-6 | One-tap actions: **Call (কল করুন)**, **Directions (পথ দেখুন)** via Google Maps, **Book (বুক করুন)** | P0 |
| MAP-7 | Emergency mode: shows only open-now/24-7 clinics nearest first, big call button | P0 |
| MAP-8 | Search radius slider (1–50 km); auto-expand if nothing found | P1 |
| MAP-9 | Marker clustering for dense areas (Dhaka) | P1 |
| MAP-10 | Show other service providers on map (groomers, pet shops, boarding, shelters) with layer toggle | P1 |
| MAP-11 | "Suggest a clinic" — users submit missing clinics for admin verification | P1 |
| MAP-12 | Offline fallback: last fetched nearby list cached | P2 |

### 4.5 ⭐ Services Offered by Pranora (সেবাসমূহ)
A unified services catalog, browsable on app and website, where each service can be booked or ordered. The MVP catalog shows only the P0 services below (vet appointment, vaccination at clinic, emergency, rescue, adoption); other services appear when their phase ships.

| Service | বাংলা | Description | Priority |
|---|---|---|---|
| Vet appointment (in-clinic) | ক্লিনিকে ডাক্তার দেখানো | Book a time slot or a serial number at a clinic | P0 |
| Home visit | বাসায় ডাক্তার | Request a vet to visit the owner's home | P1 |
| Online consultation | অনলাইন পরামর্শ | Audio/video call with a vet | P1 |
| Emergency help | জরুরি সেবা | Nearest open 24-hour clinic + direct call + hotline + ambulance (where available) | P0 |
| Animal rescue (incl. lost & found) | উদ্ধার (হারানো/পাওয়া সহ) | Report an injured, lost, found or abandoned animal; track the rescue case (§4.7) | P0 |
| Vaccination | টিকা | Book vaccine at a clinic (P0); at home with home visit (P1) | P0 |
| Grooming | গ্রুমিং | Bath, haircut, nail trim — at shop or home | P1 |
| Pet shop | পেট শপ | Food, medicine, accessories with home delivery | P1 |
| Boarding / Pet hotel | পেট হোটেল | Stay while the owner travels | P1 |
| Pet sitting & walking | পেট সিটিং | Hourly sitter / dog walker | P2 |
| Training | প্রশিক্ষণ | Obedience and behavior training | P2 |
| Pet taxi | পেট ট্যাক্সি | Transport to clinic/groomer | P2 |
| Adoption | দত্তক | Browse, apply, human review, handover (§4.6) | P0 |
| Community & Tips | কমিউনিটি ও টিপস | Bangla articles, Q&A, forum | P1 |
| AI assistant (chat & voice) | এআই সহকারী | General care questions, emergency-sign detection, help finding/booking a vet (§4.13) — never a diagnosis | P1 |

### 4.6 Adoption (দত্তক)
| ID | Feature | Priority |
|---|---|---|
| ADP-1 | Browse listings **without login**; filter by species, age, district | P0 |
| ADP-2 | Create a listing from a pet profile — only a verified shelter or an admin-approved individual | P0 |
| ADP-3 | Adoption application in one form: home type, previous experience, why they want to adopt | P0 |
| ADP-4 | Application status: জমা হয়েছে / submitted → দেখা হচ্ছে / under review → অনুমোদিত / approved · বাতিল / rejected | P0 |
| ADP-5 | Review & decision — **always a human approves or rejects, never AI** | P0 |
| ADP-6 | Handover: when both sides confirm, the animal's owner changes (its records go with it). **Only one handover per listing** | P0 |
| ADP-7 | Save listings to view later | P1 |
| ADP-8 | Report a fake/suspicious listing to admin | P1 |
| ADP-9 | Post-adoption follow-up: after some days, ask how the animal is doing | P1 |
| ADP-10 | Smart matching: suggest animals that suit the applicant | P2 |

### 4.7 Rescue (উদ্ধার)
| ID | Feature | Priority |
|---|---|---|
| RSC-1 | Report an animal — আহত / injured · হারানো / lost · পাওয়া / found · পরিত্যক্ত / abandoned: photo, area and urgency level. Owners can report their own pet as lost (linked to its pet profile, with last-seen time) | P0 |
| RSC-2 | Report review by admin or shelter; **urgent reports come first** in the queue | P0 |
| RSC-3 | Assign one rescuer to a case; the rescuer can accept or decline | P0 |
| RSC-4 | Case page: status, notes and photo updates | P0 |
| RSC-5 | Reporter tracking: the reporter sees **only the status** — জমা / submitted · দেখা হচ্ছে / under review · উদ্ধার চলছে / rescue in progress · শেষ / closed | P0 |
| RSC-6 | Urgent reports go to a human reviewer immediately (push + SMS to on-duty reviewers) | P0 |
| RSC-7 | Record the outcome: treated, sent to shelter, adopted, etc. | P0 |
| RSC-8 | Detect duplicate reports of the same animal and merge them | P1 |
| RSC-9 | Find nearby rescuers by area | P1 |
| RSC-10 | Public lost & found board (lost/found reports on a map, area rounded to ~1 km, no phone numbers) + alerts to nearby users; "I've seen it" contact goes through the app | P1 |

Privacy: the animal's exact location is visible only to the people who need it (assigned rescuer, reviewing shelter, admins) — never public. Contact phone numbers on lost/found reports are never public.

### 4.8 Appointment Booking (অ্যাপয়েন্টমেন্ট)
Designed for Bangladeshi clinics: serial numbers, SMS, bKash/Nagad, BVC registration.

| ID | Feature | Priority |
|---|---|---|
| APT-1 | Pick clinic/vet → service → pet → date & **time slot or serial number**; the same slot/serial can never go to two people | P0 |
| APT-2 | Booking statuses: pending → confirmed → completed / cancelled / no-show | P0 |
| APT-3 | Reschedule and cancel until a cut-off time set by the clinic | P0 |
| APT-4 | Booking reminder 24h and 1h before (push + in-app; SMS with HLT-6) — build-order module 5 | P1 |
| APT-5 | Digital prescription after visit, saved to pet health record — **written only by the vet, never by AI** | P1 |
| APT-6 | Vet schedule: weekly hours, holidays/days off, hourly slots **or serial numbers (সিরিয়াল)** | P0 |

### 4.9 Payments (পেমেন্ট)
| ID | Feature | Priority |
|---|---|---|
| PAY-1 | Cash at clinic (MVP); cash on delivery when the shop launches | P0 |
| PAY-2 | Online payment: bKash, Nagad (plus Rocket, cards) via SSLCommerz | P1 |
| PAY-3 | Invoices and refunds | P1 |
| PAY-4 | Provider payouts | P1 |

### 4.10 Reviews, Ratings & Reports
| ID | Feature | Priority |
|---|---|---|
| REV-1 | Rate clinic/vet/service only after the visit/booking is completed | P1 |
| REV-2 | Report abusive reviews, fake listings, fake rescue reports or wrong clinic info (one shared report flow) | P1 |

### 4.11 Notifications
In-app inbox, push (FCM) and SMS — all **P0** as channels. SMS is used for OTP and critical alerts (urgent rescue reports, booking confirmed); Reminders for vaccines and appointments (push and SMS) are **P1** (HLT-2, HLT-6, APT-4). All templates in Bangla and English.

### 4.12 Provider Dashboard (web + app)
Profile & clinic info with map pin, opening hours, holidays, services & prices, slot or serial management, booking inbox, visit notes. **P0 (vets)**. Prescriptions, earnings, reviews and other providers' dashboards: **P1**.

Shelters get: rescue report queue, case management, adoption listings, applications and handovers. **P0**

### 4.13 AI Assistant — Chat & Voice (এআই সহকারী)
Helps pet owners, but **is not a vet**.

| ID | Feature | Priority |
|---|---|---|
| AI-1 | AI chat: answers general questions (food, vaccines, care) in Bangla and English | P1 |
| AI-2 | Emergency signs: for symptoms like breathing trouble, seizures or bleeding it immediately tells the user to go to a vet (and shows the emergency map) | P1 |
| AI-3 | Uses the pet's age and species in answers **only if the user allows it** | P1 |
| AI-4 | Booking help: finds a vet; books **only after the user says "হ্যাঁ / Yes"** | P1 |
| AI-5 | Hand-off to humans: when unsure, directs the user to call a clinic or support | P1 |
| AI-6 | AI voice: press-and-hold to speak, answers by voice (if feasible) | P1 |

The AI will **never**: diagnose, name a medicine or dose, pretend to be a human, say something is done (e.g. a booking) until the system confirms it, or ask for passwords or payment details.

### 4.14 Calls (মানুষে মানুষে কল)
| ID | Feature | Priority |
|---|---|---|
| CALL-1 | Audio call between owner and vet | P1 |
| CALL-2 | Video call between owner and vet | P1 |
| CALL-3 | Call history: who called whom and when | P1 |
| CALL-4 | Call recording — **off by default**, never runs without both people's consent | P2 |

### 4.15 Admin Panel
| ID | Feature | Priority |
|---|---|---|
| ADM-1 | Verify vets (BVC registration, documents) and shelters; verify rescuers and approved adoption listers | P0 |
| ADM-2 | Remove fake listings or reports; clinic data moderation; block abusive users | P0 |
| ADM-3 | Urgent rescue report review queue | P0 |
| ADM-4 | Audit log: who changed what and when | P1 |
| ADM-5 | Content (tips/articles), disputes, analytics | P1 |

### 4.16 Safety & Privacy Rules (from the source feature list)
- Medical information is visible only to the owner and people they have allowed (e.g. their vet).
- An animal's exact location and personal phone numbers are never shown publicly.
- Adoption approval is always given by a human, not AI.
- Diagnosis and prescriptions only by a qualified vet.
- AI chat/voice never asks for passwords or payment details.
- Call recording is off by default.

---

## 5. Language & Localization

- Bangla is the **default** language; English is available through a toggle in onboarding and settings.
- All UI strings, notifications, SMS, emails and PDFs exist in both languages.
- Numbers, dates and currency follow the selected locale: `৳ ১,২০০` / `৳1,200`, `৫ নভেম্বর ২০২৬` / `5 Nov 2026`.
- Clinic names, addresses and service names are stored bilingually (`name_bn`, `name_en`); if one is missing, fall back to the other.
- Search must match both Bangla and English/Banglish input ("dhanmondi", "ধানমন্ডি").

---

## 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Nearest-vet results in < 1.5 s on 4G; app cold start < 3 s on mid-range Android |
| Low bandwidth | Works on 3G; images compressed; lazy loading |
| Availability | 99.5% uptime |
| Security | OTP rate limiting, row-level security, encrypted at rest, no card data stored |
| Privacy | Precise location used only when searching; never shown to other users |
| Accessibility | Minimum 16 px Bangla text, WCAG AA contrast, screen-reader labels in both languages |
| Device support | Android 8+, iOS 15+, latest 2 versions of Chrome/Safari/Firefox/Edge |

---

## 7. Success Metrics (KPIs)

- Nearest-vet searches per week and **search → call/direction/booking conversion**
- Bookings completed per week, cancellation rate
- Reminder open rate and vaccination completion rate
- Rescue: time from urgent report to first human review, time to rescuer acceptance, cases closed with an outcome
- Adoption: applications per listing, time to decision, completed handovers, follow-up response rate
- Provider supply: verified clinics per district, verified shelters and rescuers
- Retention: D1 / D7 / D30
- App rating ≥ 4.5 on Play Store

---

## 8. Release Plan

| Phase | Scope |
|---|---|
| **MVP (Phase 1)** | **Only modules 1–4 of the source build order:** ① account (phone or email), roles, Bangla/English, pet profile → ② rescue: report (incl. lost/found) to closed case → ③ adoption: listing to handover → ④ vet: profile, verification, search (incl. the **nearest-vet map** and emergency button), booking (slot or serial, cancel/reschedule), visit notes, treatment & vaccine records. Supporting pieces those modules need: in-app/push/SMS notification channels (OTP, urgent rescue alerts, booking updates), cash at clinic, vet & shelter dashboards, admin verification and moderation, services catalog showing only P0 services. |
| **Phase 2** | ⑤ reminders (push + SMS for vaccines and appointments) → ⑥ AI chat, then owner–vet audio/video calls and AI voice. Also: online payments (bKash, Nagad, Rocket, cards via SSLCommerz) with invoices/refunds and payouts, home visit, prescriptions, reviews, audit log, adoption extras (save, report, follow-up), rescue extras (duplicates, nearby rescuers, public lost & found board), online consultation, grooming, pet shop (cash on delivery + online), boarding, tips, admin content & analytics |
| **Phase 3** | Smart adoption matching, call recording (with consent), sitting/walking, training, pet taxi, livestock vets, subscriptions |

**Before launch:** have a native Bangla speaker review all Bangla text (especially AI messages and SMS), and have a licensed vet check the BVC verification process, the medicine and vaccine lists, and legal requirements.

---

## 9. Out of Scope (v1)

- Pet insurance
- Prescription medicine sale without a vet's prescription
- AI diagnosis, AI prescriptions or medicine dosing (never in scope)
- AI-made adoption decisions (never in scope)
- Cross-border services outside Bangladesh

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Few clinics listed at launch | Seed data from DLS (Department of Livestock Services) upazila vet hospitals + field onboarding team |
| Wrong clinic data (hours, phone) | Provider self-management, user "report wrong info", periodic verification calls |
| Fake vets | Mandatory BVC registration check before "Verified" badge |
| Low trust in online payment | Cash first, then bKash/Nagad |
| Poor GPS indoors | Area search fallback + manual pin drop |
| Fake adoption listings / scams | Only verified shelters and approved individuals can list; report flow; admin removal; human review of every application |
| Urgent rescue reports missed at night | Immediate push + SMS to on-duty reviewers; escalate to admins if not reviewed within 15 minutes |
| Exposing an animal's or person's location | Exact location visible only to assigned rescuer, reviewing shelter and admins; public views show area only; photo EXIF stripped |
| AI gives harmful advice | Strict guardrails (no diagnosis, medicine or dose), emergency-sign detection that points to a vet, hand-off to humans, disclaimer on every chat |
