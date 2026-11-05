# Pranora — Product Requirements Document (PRD)

> **প্রাণোরা — আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায়।**
> Version 1.0 · Owner: Pranora Team · Status: Draft

---

## 1. Overview

Pranora is a Bangla-first pet care platform for Bangladesh, available as a **mobile app (Android/iOS)** and a **responsive website**. It connects pet owners with veterinarians, clinics, groomers, pet shops, boarding and other pet services, and keeps every pet's health history in one place.

The default language is **Bangla (বাংলা)**; **English** is fully supported and can be switched at any time.

### 1.1 Problem

- Pet owners in Bangladesh struggle to find a trusted vet nearby, especially at night or in an emergency.
- Vaccination and deworming schedules are tracked on paper (or not at all) and are often missed.
- Pet services (grooming, boarding, food delivery) are scattered across Facebook pages with no reviews, pricing or booking.
- Most existing apps are English-only, which excludes a large share of pet owners outside Dhaka.

### 1.2 Vision

Make quality pet care reachable for every pet owner in Bangladesh — in their own language, a few taps away.

### 1.3 Goals (first 12 months)

| Goal | Metric | Target |
|---|---|---|
| Adoption | Registered pet owners | 50,000 |
| Supply | Verified vets & clinics on the map | 500 across 8 divisions |
| Engagement | Monthly active users | 35% of registered |
| Health impact | Vaccination reminders acted on | 60% |
| Revenue | Paid bookings + shop orders / month | 10,000 |

---

## 2. Target Users (Personas)

| Persona | Description | Key needs |
|---|---|---|
| **রাফি — First-time pet owner** (Dhaka, 24) | Adopted a cat, knows little about pet care | Tips in Bangla, vaccine schedule, nearest vet |
| **নাসরিন — Experienced owner** (Chattogram, 38) | Two dogs, frequent vet visits | Health records, appointment booking, home visit |
| **Dr. Karim — Veterinarian** | Runs a small clinic | Get bookings, manage schedule, digital prescriptions |
| **Service provider** | Groomer, pet shop, boarding, trainer | List services, receive orders/bookings, get paid |
| **Rural farmer / livestock owner** (optional, phase 3) | Cows, goats, poultry | Nearest government/livestock vet, emergency help |
| **Admin** | Pranora operations team | Verify vets, moderate content, handle disputes |

---

## 3. Platforms

| Platform | Audience | Notes |
|---|---|---|
| Android app | Pet owners, providers | Primary platform (most BD users) |
| iOS app | Pet owners, providers | Same codebase as Android |
| Website (pet owners) | Pet owners | SEO for "নিকটস্থ পশু ডাক্তার", booking, shop |
| Provider dashboard (web) | Vets, clinics, shops | Schedules, orders, earnings |
| Admin panel (web) | Pranora team | Verification, moderation, analytics |

---

## 4. Features

Priority: **P0** = MVP launch, **P1** = soon after launch, **P2** = later.

### 4.1 Account & Onboarding
| ID | Feature | Priority |
|---|---|---|
| AUTH-1 | Sign up / login with phone number + OTP (primary) | P0 |
| AUTH-2 | Google sign-in; email + password | P1 |
| AUTH-3 | Language selection on first launch (বাংলা default / English) | P0 |
| AUTH-4 | Location permission with explanation in Bangla | P0 |
| AUTH-5 | Role: Pet owner / Vet / Service provider | P0 |

### 4.2 Pet Profile (পোষা প্রাণীর প্রোফাইল)
| ID | Feature | Priority |
|---|---|---|
| PET-1 | Add multiple pets: name, species (dog, cat, bird, rabbit, fish, other), breed, age/DOB, gender, weight, color, photo | P0 |
| PET-2 | Microchip / ID number, neutered status, allergies | P1 |
| PET-3 | Digital Pet ID card with QR code (for lost pets) | P1 |
| PET-4 | Share pet profile with family members | P2 |

### 4.3 Health Records & Reminders (স্বাস্থ্য রেকর্ড)
| ID | Feature | Priority |
|---|---|---|
| HLT-1 | Vaccination record + auto-generated schedule by species/age | P0 |
| HLT-2 | Reminders: vaccine, deworming, flea/tick, medication (push + SMS) | P0 |
| HLT-3 | Medical history: visits, diagnoses, prescriptions, lab reports (upload photo/PDF) | P0 |
| HLT-4 | Weight & growth chart | P1 |
| HLT-5 | Export health record as PDF (Bangla/English) | P1 |

### 4.4 ⭐ Nearest Veterinary on Map (নিকটস্থ পশু চিকিৎসক — ম্যাপে)
The flagship extra feature. Available on **both app and website**.

| ID | Feature | Priority |
|---|---|---|
| MAP-1 | Map view showing vets, clinics and pet hospitals around the user's current location | P0 |
| MAP-2 | List view sorted by distance (km) with "Open now" badge | P0 |
| MAP-3 | Filters: open now, 24/7, emergency, home visit, species treated, rating, government / private, price range | P0 |
| MAP-4 | Search by area name (e.g. "ধানমন্ডি", "Mirpur 10") or division/district/upazila when GPS is off | P0 |
| MAP-5 | Clinic detail card: name, photo, distance, rating, opening hours, services, fees, doctors | P0 |
| MAP-6 | One-tap actions: **Call (কল করুন)**, **Directions (পথ দেখুন)** via Google Maps, **Book (বুক করুন)** | P0 |
| MAP-7 | Emergency mode: shows only open-now/24-7 clinics nearest first, big call button | P0 |
| MAP-8 | Search radius slider (1–50 km); auto-expand if nothing found | P1 |
| MAP-9 | Marker clustering for dense areas (Dhaka) | P1 |
| MAP-10 | Show other service providers on map (groomers, pet shops, boarding) with layer toggle | P1 |
| MAP-11 | "Suggest a clinic" — users submit missing clinics for admin verification | P1 |
| MAP-12 | Offline fallback: last fetched nearby list cached | P2 |

### 4.5 ⭐ Services Offered by Pranora (সেবাসমূহ)
A unified services catalog, browsable on app and website, where each service can be booked or ordered.

| Service | বাংলা | Description | Priority |
|---|---|---|---|
| Vet appointment (in-clinic) | ক্লিনিকে ডাক্তার দেখানো | Book a time slot at a clinic | P0 |
| Home visit | বাসায় ডাক্তার | Vet visits the owner's home | P0 |
| Online consultation | অনলাইন পরামর্শ | Video/audio/chat with a vet | P1 |
| Emergency help | জরুরি সেবা | Nearest open clinic + hotline + ambulance (where available) | P0 |
| Vaccination | টিকা | Book vaccine at clinic or home | P0 |
| Grooming | গ্রুমিং | Bath, haircut, nail trim — at shop or home | P1 |
| Pet shop | পেট শপ | Food, medicine, accessories with home delivery | P1 |
| Boarding / Pet hotel | পেট হোটেল | Stay while the owner travels | P1 |
| Pet sitting & walking | পেট সিটিং | Hourly sitter / dog walker | P2 |
| Training | প্রশিক্ষণ | Obedience and behavior training | P2 |
| Pet taxi | পেট ট্যাক্সি | Transport to clinic/groomer | P2 |
| Adoption | দত্তক | Adopt or rehome pets | P1 |
| Lost & Found | হারানো ও প্রাপ্তি | Post lost/found pets with location alerts | P1 |
| Community & Tips | কমিউনিটি ও টিপস | Bangla articles, Q&A, forum | P1 |
| AI symptom checker | লক্ষণ যাচাই | Guided questions → urgency level → "see a vet" suggestion (not a diagnosis) | P2 |

### 4.6 Appointment Booking (অ্যাপয়েন্টমেন্ট)
| ID | Feature | Priority |
|---|---|---|
| APT-1 | Pick clinic/vet → service → pet → date & slot | P0 |
| APT-2 | Booking statuses: pending → confirmed → completed / cancelled / no-show | P0 |
| APT-3 | Reschedule and cancel with policy | P0 |
| APT-4 | Booking reminder 24h and 1h before | P0 |
| APT-5 | Digital prescription after visit, saved to pet health record | P1 |

### 4.7 Payments (পেমেন্ট)
| ID | Feature | Priority |
|---|---|---|
| PAY-1 | Cash at clinic / cash on delivery | P0 |
| PAY-2 | bKash, Nagad, Rocket, cards via SSLCommerz | P1 |
| PAY-3 | Invoices and refunds | P1 |
| PAY-4 | Provider payouts | P1 |

### 4.8 Reviews & Ratings
| ID | Feature | Priority |
|---|---|---|
| REV-1 | Rate clinic/vet/service after a completed booking only | P1 |
| REV-2 | Report abusive reviews | P1 |

### 4.9 Notifications
Push (FCM), SMS for critical reminders (OTP, vaccine due, booking confirmed), in-app inbox. All templates in Bangla and English. **P0**

### 4.10 Provider Dashboard (web + app)
Profile & clinic info with map pin, opening hours, services & prices, slot management, booking inbox, prescriptions, earnings, reviews. **P0 (vets), P1 (other providers)**

### 4.11 Admin Panel
Provider verification (BVC registration number for vets), clinic data moderation, user management, content (tips/articles), disputes, analytics. **P0**

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
- Provider supply: verified clinics per district
- Retention: D1 / D7 / D30
- App rating ≥ 4.5 on Play Store

---

## 8. Release Plan

| Phase | Scope |
|---|---|
| **MVP (Phase 1)** | Auth, pet profile, health records & reminders, **nearest vet map**, services catalog, clinic booking, home visit, emergency mode, cash payment, provider dashboard (vets), admin verification |
| **Phase 2** | Online payments, online consultation, grooming, pet shop, boarding, reviews, adoption, lost & found, tips |
| **Phase 3** | Sitting/walking, training, pet taxi, AI symptom checker, livestock vets, subscriptions |

---

## 9. Out of Scope (v1)

- Pet insurance
- Prescription medicine sale without a vet's prescription
- Cross-border services outside Bangladesh

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Few clinics listed at launch | Seed data from DLS (Department of Livestock Services) upazila vet hospitals + field onboarding team |
| Wrong clinic data (hours, phone) | Provider self-management, user "report wrong info", periodic verification calls |
| Fake vets | Mandatory BVC registration check before "Verified" badge |
| Low trust in online payment | Cash first, then bKash/Nagad |
| Poor GPS indoors | Area search fallback + manual pin drop |
