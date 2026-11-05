# Pranora — App Flow

Related: [prd.md](./prd.md) · [design.md](./design.md)

All screens exist on mobile app and website unless marked **(app)** or **(web)**. Labels are shown as `বাংলা / English`.

---

## 1. Navigation Map

### Pet owner — bottom tab bar (app) / top nav (web)

| Tab | বাংলা | Contents |
|---|---|---|
| Home | হোম | Greeting, my pets, upcoming reminders, quick actions, emergency button |
| Map | ম্যাপ | Nearest vets & services on map + list |
| Services | সেবা | All services catalog |
| Bookings | বুকিং | Upcoming / past appointments & orders |
| Profile | প্রোফাইল | My pets, health records, settings, language |

A red **জরুরি / Emergency** floating button is visible on Home and Map.

### Provider (vet / clinic / shop)
Dashboard · Bookings · Schedule · Services & Prices · Clinic Profile · Earnings · Reviews

### Admin (web only)
Overview · Provider Verification · Clinics · Users · Bookings · Content · Reports · Settings

---

## 2. Onboarding & Auth

```mermaid
flowchart TD
  S[Splash] --> L{First launch?}
  L -- Yes --> LANG[ভাষা নির্বাচন / Choose language<br/>বাংলা default · English]
  LANG --> INTRO[3 intro slides:<br/>নিকটস্থ ডাক্তার · টিকার রিমাইন্ডার · সব সেবা]
  INTRO --> PHONE
  L -- No --> SESS{Logged in?}
  SESS -- Yes --> HOME[Home]
  SESS -- No --> PHONE[ফোন নম্বর দিন / Enter phone<br/>+880 1XXXXXXXXX]
  PHONE --> OTP[OTP যাচাই / Verify OTP<br/>6 digits · resend after 60s]
  OTP --> NEW{New user?}
  NEW -- No --> HOME
  NEW -- Yes --> ROLE[আপনি কে? / I am a<br/>Pet owner · Vet · Service provider]
  ROLE -- Pet owner --> NAME[Name + district]
  NAME --> LOC[Location permission<br/>with Bangla explanation]
  LOC --> ADDPET[প্রথম পোষা প্রাণী যোগ করুন<br/>Add first pet · Skip]
  ADDPET --> HOME
  ROLE -- Vet/Provider --> PROV[Provider onboarding §8]
```

---

## 3. Home

1. Greeting: "শুভ সকাল, রাফি 👋"
2. My pets carousel → tap to open pet profile; "+" to add
3. Upcoming reminders card (e.g. "মিনুর র‍্যাবিস টিকা — ৩ দিন বাকি") → **বুক করুন / Mark done**
4. Quick actions: নিকটস্থ ডাক্তার · অ্যাপয়েন্টমেন্ট · বাসায় ডাক্তার · পেট শপ · গ্রুমিং
5. Next booking card
6. Tips / articles (Bangla)
7. Emergency button

---

## 4. ⭐ Nearest Veterinary on Map

```mermaid
flowchart TD
  ENTRY[Map tab / নিকটস্থ ডাক্তার quick action / Emergency] --> PERM{Location permission?}
  PERM -- Granted --> GPS[Get current location]
  PERM -- Denied --> AREA[এলাকা খুঁজুন / Search area<br/>or Division → District → Upazila]
  AREA --> CENTER[Use chosen area as center]
  GPS --> Q[Call nearby_clinics<br/>radius 5 km]
  CENTER --> Q
  Q --> RES{Results ≥ 3?}
  RES -- No --> EXP[Expand radius 15 km → 50 km<br/>show 'কাছাকাছি পাওয়া যায়নি, দূরত্ব বাড়ানো হলো']
  EXP --> Q
  RES -- Yes --> MAP[Map with markers + bottom sheet list<br/>sorted by distance]
  MAP --> FILT[Filters: এখন খোলা · ২৪/৭ · জরুরি · বাসায় ভিজিট<br/>প্রাণীর ধরন · রেটিং · সরকারি/বেসরকারি]
  FILT --> Q
  MAP --> PAN[User pans map] --> SEARCHHERE[এই এলাকায় খুঁজুন / Search this area] --> Q
  MAP --> PIN[Tap marker or list item]
  PIN --> CARD[Clinic card: name, distance, open status, rating, fee]
  CARD --> CALL[কল করুন → phone dialer]
  CARD --> DIR[পথ দেখুন → Google Maps directions]
  CARD --> DET[বিস্তারিত → Clinic detail page]
  DET --> BOOK[বুক করুন → Booking flow §6]
```

### Clinic detail page
Photos · Name (bn/en) · Verified badge · Distance & address · Open now / hours for the week · Doctors (with BVC reg. no.) · Services with prices · Species treated · Reviews · Buttons: **কল করুন**, **পথ দেখুন**, **বুক করুন**, **শেয়ার**, **ভুল তথ্য রিপোর্ট করুন**.

### Emergency mode
Red header "জরুরি সেবা" → only open-now / 24-7 clinics → nearest first → big **কল করুন** on each item → hotline numbers at bottom → optional "জরুরি অনুরোধ পাঠান" (sends request to nearby clinics that support it).

### Layers (P1)
Toggle chips on top of map: ডাক্তার · গ্রুমিং · পেট শপ · পেট হোটেল.

### Website differences
Split view: list on the left, map on the right (desktop). On mobile web it behaves like the app (map + draggable bottom sheet). URL keeps state for sharing/SEO: `/map?lat=23.74&lng=90.37&open=1&service=home_visit`, plus static SEO pages like `/vets/dhaka/dhanmondi`.

---

## 5. ⭐ Services Catalog

```mermaid
flowchart TD
  SV[সেবা / Services tab] --> GRID[Category grid with icons]
  GRID --> VET[ডাক্তার দেখান] --> PICK[Choose: ক্লিনিকে · বাসায় · অনলাইন]
  GRID --> VAC[টিকা]
  GRID --> GRM[গ্রুমিং]
  GRID --> SHOP[পেট শপ]
  GRID --> BRD[পেট হোটেল]
  GRID --> ADP[দত্তক]
  GRID --> LF[হারানো ও প্রাপ্তি]
  GRID --> EMG[জরুরি সেবা] --> EMAP[Emergency map §4]
  PICK & VAC & GRM & BRD --> PLIST[Provider list near me<br/>list / map toggle]
  PLIST --> PDET[Provider detail] --> BOOKF[Booking flow by booking_type]
  SHOP --> PRODUCTS[Products → cart → checkout]
  ADP --> ADLIST[Adoption listings → contact / apply]
  LF --> LFLIST[Lost/found posts on map → post new]
```

Each service page shows: what it is, price range, how it works (3 steps), providers near me, FAQs — all bilingual.

---

## 6. Booking Flow (appointment / home visit / vaccination / grooming)

```mermaid
flowchart TD
  B0[বুক করুন] --> B1[সেবা নির্বাচন / Choose service]
  B1 --> B2[পোষা প্রাণী নির্বাচন / Choose pet · + Add]
  B2 --> B3{Home visit?}
  B3 -- Yes --> ADDR[ঠিকানা / Address: saved or pin on map]
  B3 -- No --> B4
  ADDR --> B4[তারিখ ও সময় / Date & slot]
  B4 --> B5[সমস্যা লিখুন / Describe problem + photos optional]
  B5 --> B6[পেমেন্ট: ক্যাশ · bKash · Nagad · কার্ড]
  B6 --> B7[Review & confirm]
  B7 --> B8{Online payment?}
  B8 -- Yes --> GW[SSLCommerz gateway] --> IPN{Success?}
  IPN -- No --> FAIL[পেমেন্ট ব্যর্থ — retry / pay cash]
  IPN -- Yes --> OK
  B8 -- No --> OK[বুকিং সম্পন্ন ✅<br/>status: pending]
  OK --> CONF[Provider confirms → push + SMS]
  CONF --> REM[Reminders 24h & 1h]
  REM --> VISIT[Visit done → provider marks completed<br/>+ prescription]
  VISIT --> REC[Saved to pet health record]
  REC --> RATE[রেটিং দিন / Rate]
```

Booking statuses: `pending → confirmed → in_progress → completed`; side exits `cancelled_by_owner`, `cancelled_by_provider`, `no_show`, `expired`.

---

## 7. Pet Profile & Health Records

```
প্রোফাইল → আমার পোষা প্রাণী → [Pet]
 ├─ Overview: photo, species, breed, age, weight, QR Pet ID
 ├─ টিকা / Vaccines: schedule (done ✅ / due ⏰ / overdue 🔴) → mark done / book
 ├─ চিকিৎসা ইতিহাস / Medical history: visits, prescriptions, reports (upload)
 ├─ রিমাইন্ডার / Reminders: add custom (medicine, deworming, grooming)
 ├─ ওজন / Weight chart
 └─ শেয়ার / Export PDF
```

Adding a pet auto-creates the vaccine schedule from `vaccine_templates` for that species and age.

---

## 8. Provider Onboarding & Dashboard

```mermaid
flowchart TD
  P0[Role: Vet / Provider] --> P1[Type: Vet · Clinic · Groomer · Pet shop · Boarding · Trainer]
  P1 --> P2[Business info bn/en, phone, photos]
  P2 --> P3[Pin location on map + address]
  P3 --> P4[Opening hours, 24/7, emergency]
  P4 --> P5[Services & prices from catalog]
  P5 --> P6[Documents: BVC reg. no. / trade license / NID]
  P6 --> P7[Submitted → status: pending_verification]
  P7 --> ADM{Admin review}
  ADM -- Approved --> LIVE[Visible on map ✅ Verified badge]
  ADM -- Rejected --> FIX[Reason shown → edit & resubmit]
```

Dashboard: today's bookings · accept/decline · mark complete · write prescription · manage slots & days off · edit services/prices · earnings · reviews.

---

## 9. Settings

Language (বাংলা / English) · Notifications (push / SMS toggles) · Saved addresses · Payment methods · Privacy · Help & support (call / WhatsApp / FAQ) · Terms & privacy policy · Logout · Delete account.

---

## 10. Empty, Error & Offline States

| Case | Message (bn) | Action |
|---|---|---|
| No internet | ইন্টারনেট সংযোগ নেই | Show cached nearby list, retry |
| No clinics in radius | এই এলাকায় কোনো ক্লিনিক পাওয়া যায়নি | Expand radius, suggest a clinic |
| Location denied | লোকেশন ছাড়া এলাকা দিয়ে খুঁজুন | Area search |
| No pets yet | এখনো কোনো পোষা প্রাণী যোগ করা হয়নি | Add pet |
| Payment failed | পেমেন্ট সম্পন্ন হয়নি | Retry / pay cash |
| Server error | কিছু একটা সমস্যা হয়েছে | Retry, contact support |
