# Pranora — App Flow

Related: [prd.md](./prd.md) · [design.md](./design.md)

All screens exist on mobile app and website unless marked **(app)** or **(web)**. Labels are shown as `বাংলা / English`.

---

## 1. Navigation Map

### Pet owner — bottom tab bar (app) / top nav (web)

| Tab | বাংলা | Contents |
|---|---|---|
| Home | হোম | Greeting, my pets, quick actions (incl. প্রাণী রিপোর্ট করুন and দত্তক), upcoming reminders (P1), emergency button |
| Map | ম্যাপ | Nearest vets on map + list (other services as layers from P1) |
| Services | সেবা | Services catalog — MVP shows only P0 services: ডাক্তার দেখান · টিকা · জরুরি সেবা · উদ্ধার (হারানো/পাওয়া সহ) · দত্তক |
| Bookings | বুকিং | Upcoming / past appointments & orders, my adoption applications, my animal reports |
| Profile | প্রোফাইল | My pets, health records, my roles, settings, language |

A red **জরুরি / Emergency** floating button is visible on Home and Map. From P1 an **এআই সহকারী / AI assistant** entry sits in the Home header.

The adoption listings page (`/adoption` on web, Services → দত্তক in the app) can be browsed **without logging in**; login is asked only when applying.

### Role switcher
A user with several roles (e.g. pet owner + rescuer) sees a role switcher at the top of Profile. Rescuer and shelter modes add their own tabs; pet-owner tabs stay the same.

### Rescuer (উদ্ধারকারী)
Assigned cases (accept / decline) · Case page · My area & availability (P1)

### Shelter (শেল্টার) — web + app
Rescue report queue · Cases · Adoption listings · Applications · Handovers · Shelter profile

### Provider (vet / clinic / shop)
Dashboard · Bookings · Schedule (slots or serials, holidays) · Services & Prices · Clinic Profile · Earnings · Reviews

### Admin (web only)
Overview · Verification (vets, shelters, rescuers, adoption listers) · Urgent rescue queue · Clinics · Users · Bookings · Adoption listings · Content · Reports (fake listings/reports) · Audit log (P1) · Settings

---

## 2. Onboarding & Auth

```mermaid
flowchart TD
  S[Splash] --> L{First launch?}
  L -- Yes --> LANG[ভাষা নির্বাচন / Choose language<br/>বাংলা default · English]
  LANG -->   INTRO[3 intro slides:<br/>উদ্ধার ও দত্তক · নিকটস্থ ডাক্তার · টিকার রেকর্ড]
  INTRO --> METHOD
  L -- No --> SESS{Logged in?}
  SESS -- Yes --> HOME[Home]
  SESS -- No --> METHOD{মোবাইল নম্বর না ইমেইল?<br/>Phone or email}
  METHOD -- Phone --> PHONE[ফোন নম্বর দিন / Enter phone<br/>+880 1XXXXXXXXX]
  METHOD -- Email --> EMAIL[ইমেইল দিন / Enter email]
  PHONE & EMAIL --> OTP[কোড যাচাই / Verify code<br/>6 digits · resend after 60s]
  OTP --> NEW{New user?}
  NEW -- No --> HOME
  NEW -- Yes --> ROLE[আপনি কে? একাধিক বাছতে পারেন / I am a … pick one or more<br/>Pet owner · Rescuer · Shelter · Vet · Service provider]
  ROLE --> NAME[Name + district]
  NAME --> LOC[Location permission<br/>with Bangla explanation]
  LOC --> ADDPET[প্রথম পোষা প্রাণী যোগ করুন<br/>Add first pet · Skip]
  ADDPET --> HOME
  ROLE -- Rescuer --> RV[Rescuer details + NID → pending verification<br/>can still use the app as owner]
  ROLE -- Shelter/Vet/Provider --> PROV[Provider / shelter onboarding §8]
```

Browsing adoption listings, the map and services works without login; login is asked when the user applies, books or reports.

---

## 3. Home

1. Greeting: "শুভ সকাল, রাফি 👋"
2. My pets carousel → tap to open pet profile; "+" to add
3. Next vaccine due (from the vaccine record) → **বুক করুন**; from P1 this becomes the reminders card (e.g. "মিনুর র‍্যাবিস টিকা — ৩ দিন বাকি") with **Mark done**
4. Quick actions (MVP): নিকটস্থ ডাক্তার · অ্যাপয়েন্টমেন্ট · প্রাণী রিপোর্ট করুন · হারানো প্রাণী · দত্তক · জরুরি; পেট শপ and গ্রুমিং are added in P1
5. Next booking card; status of my latest animal report / adoption application
6. Rescuer mode only: "নতুন কেস" card with accept / decline
7. Tips / articles (Bangla) — P1
8. Emergency button

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
  MAP --> FILT[Filters: এখন খোলা · ২৪/৭ · জরুরি · বাসায় ভিজিট<br/>প্রাণীর ধরন · ফি · রেটিং · সরকারি/বেসরকারি]
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
Toggle chips on top of map: ডাক্তার · গ্রুমিং · পেট শপ · পেট হোটেল · শেল্টার.

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
  GRID --> RSC[উদ্ধার / প্রাণী রিপোর্ট<br/>আহত · হারানো · পাওয়া · পরিত্যক্ত]
  GRID --> EMG[জরুরি সেবা] --> EMAP[Emergency map §4]
  PICK & VAC & GRM & BRD --> PLIST[Provider list near me<br/>list / map toggle]
  PLIST --> PDET[Provider detail] --> BOOKF[Booking flow by booking_type]
  SHOP --> PRODUCTS[Products → cart → checkout]
  ADP --> ADLIST[Adoption flow §11]
  RSC --> RFLOW[Rescue flow §10]
```

MVP grid shows only P0 services (ডাক্তার দেখান · টিকা · জরুরি সেবা · উদ্ধার · দত্তক). Grooming, pet shop, boarding and the rest appear when their phase ships.

Each service page shows: what it is, price range, how it works (3 steps), providers near me, FAQs — all bilingual.

---

## 6. Booking Flow (appointment / home visit / vaccination / grooming)

```mermaid
flowchart TD
  B0[বুক করুন] --> B1[সেবা নির্বাচন / Choose service]
  B1 --> B2[পোষা প্রাণী নির্বাচন / Choose pet · + Add]
  B2 --> B3{Home visit? P1}
  B3 -- Yes --> ADDR[ঠিকানা / Address: saved or pin on map]
  B3 -- No --> B4
  ADDR --> B4[তারিখ / Date]
  B4 --> B4M{Clinic uses serials?}
  B4M -- No --> B4S[সময় বেছে নিন / Pick a time slot]
  B4M -- Yes --> B4N[সিরিয়াল নিন / Take a serial<br/>e.g. 'সন্ধ্যা ৫টা–৯টা · আপনার সিরিয়াল ১২']
  B4S & B4N --> B5[সমস্যা লিখুন / Describe problem + photos optional]
  B5 --> B6[পেমেন্ট: ক্যাশ P0 · bKash · Nagad · Rocket · কার্ড P1]
  B6 --> B7[Review & confirm]
  B7 --> B8{Online payment?}
  B8 -- Yes --> GW[SSLCommerz gateway] --> IPN{Success?}
  IPN -- No --> FAIL[পেমেন্ট ব্যর্থ — retry / pay cash]
  IPN -- Yes --> OK
  B8 -- No --> OK[বুকিং সম্পন্ন ✅<br/>status: pending]
  OK --> CONF[Provider confirms → push + SMS]
  CONF --> REM[Reminders 24h & 1h · P1]
  REM --> VISIT[Visit done → vet marks completed<br/>+ visit note · prescription P1]
  VISIT --> REC[Saved to pet health record]
  REC --> RATE[রেটিং দিন / Rate · P1, only after completed]
```

Booking statuses: `pending → confirmed → in_progress → completed`; side exits `cancelled_by_owner`, `cancelled_by_provider`, `no_show`, `expired`.

Cancel / reschedule buttons are shown until the clinic's cut-off (e.g. "অ্যাপয়েন্টমেন্টের ২ ঘণ্টা আগে পর্যন্ত বাতিল করা যাবে"); after that the screen shows the clinic's call button instead. Reminders (push, in-app and SMS) arrive in P1. Online payment (P1) is offered only when the clinic accepts it; cash stays available.

---

## 7. Pet Profile & Health Records

```
প্রোফাইল → আমার পোষা প্রাণী → [Pet]
 ├─ Overview: photo, species, breed, age, weight, QR Pet ID
 ├─ টিকা / Vaccines: schedule (done ✅ / due ⏰ / overdue 🔴) → mark done / book
 ├─ চিকিৎসা ইতিহাস / Medical history: vet visit notes & prescriptions (read-only for owner)
 │    └─ আমার আপলোড / My uploads: old reports, lab results (labelled "মালিকের আপলোড")
 ├─ রিমাইন্ডার / Reminders (P1): add custom (medicine, deworming, grooming)
 ├─ হারিয়ে গেছে? / Report lost → rescue report of kind "lost", pre-filled from this profile
 ├─ ওজন / Weight chart
 ├─ ইতিহাস / Journey: rescued → treated → adopted (if the pet came through Pranora)
 └─ শেয়ার / Export PDF
```

Adding a pet auto-creates the vaccine schedule from `vaccine_templates` for that species and age. An adopted pet arrives with its full profile, treatment and vaccine records from the rescuer/shelter.

---

## 8. Provider Onboarding & Dashboard

```mermaid
flowchart TD
  P0[Role: Vet / Provider / Shelter] --> P1[Type: Vet · Clinic · Groomer · Pet shop · Boarding · Trainer · Shelter]
  P1 --> P2[Business info bn/en, phone, photos]
  P2 --> P3[Pin location on map + address]
  P3 --> P4[Opening hours, 24/7, emergency]
  P4 --> P4B[Schedule: time slots or সিরিয়াল · holidays · cancel cut-off]
  P4B --> P5[Services & prices from catalog]
  P5 --> P6[Documents: BVC reg. no. / trade license / shelter registration / NID]
  P6 --> P7[Submitted → status: pending_verification]
  P7 --> ADM{Admin review}
  ADM -- Approved --> LIVE[Visible on map ✅ Verified badge]
  ADM -- Rejected --> FIX[Reason shown → edit & resubmit]
```

Dashboard: today's bookings / today's serial list · accept/decline · mark complete · write visit note · write prescription (P1) · manage slots or serials & days off · edit services/prices · earnings · reviews.

Shelter dashboard: rescue report queue (urgent first) · cases · adoption listings · applications · handovers (see §10, §11).

---

## 9. Settings

Language (বাংলা / English) · My roles (add rescuer / shelter / vet role → verification) · Notifications (push / SMS toggles) · Saved addresses · Payment methods (P1) · AI: share pet info with assistant (P1, off by default) · Call recording consent (P2, off by default) · Privacy · Help & support (call / WhatsApp / FAQ) · Terms & privacy policy · Logout · Delete account.

---

## 10. Rescue Flow (উদ্ধার)

```mermaid
flowchart TD
  R0[প্রাণী রিপোর্ট করুন / Report an animal] --> R1[কী হয়েছে? আহত · হারানো · পাওয়া · পরিত্যক্ত<br/>Injured · Lost · Found · Abandoned]
  R1 --> LFQ{Lost or found?}
  LFQ -- Lost, my pet --> LP[Pick my pet · last seen time · contact number not public]
  LFQ -- Found / other --> R2
  LP --> R2[ছবি তুলুন / Add photos]
  R2 --> R3[জায়গা / Location: GPS or pin on map + area note]
  R3 --> R4[জরুরি মাত্রা / Urgency: কম · মাঝারি · বেশি · খুব জরুরি]
  R4 --> R5[জমা দিন / Submit]
  R5 --> U{Urgent?}
  U -- Yes --> ALERT[Push + SMS to on-duty reviewer now<br/>escalate to admins after 15 min]
  U -- No --> QUEUE
  ALERT --> QUEUE[Review queue: urgent first<br/>admin or shelter]
  QUEUE --> DEC{Decision}
  DEC -- Reject / duplicate --> CLOSED
  DEC -- Accept --> CASE[Rescue case created]
  CASE --> ASG[Assign one rescuer]
  ASG --> RESP{Rescuer}
  RESP -- Decline --> ASG
  RESP -- Accept --> PROG[উদ্ধার চলছে · notes & photo updates]
  PROG --> VET[Vet checkup: treatment & vaccines<br/>→ animal gets a pet profile]
  VET --> OUT[ফলাফল / Outcome: treated · sent to shelter · adopted · returned · …]
  PROG --> OUT
  OUT --> CLOSED[শেষ / Closed]
  CLOSED -.-> ADOPT[Can be listed for adoption §11]
```

**Reporter view:** only a 4-step tracker — জমা · দেখা হচ্ছে · উদ্ধার চলছে · শেষ — with a push at each step. No notes, rescuer name or exact location of others.

**Case page (rescuer / shelter / admin):** map with exact location (only these roles), photos, timeline of updates, add note/photo, change status, call reporter via masked call button (number not shown), record outcome.

**Report again / same animal (P1):** before submit, show "কাছাকাছি একই রকম রিপোর্ট আছে" if a similar report exists nearby (also matches a "found" report to an open "lost" one).

**Lost & found is part of rescue:** there is no separate Lost & Found feature. Lost/found reports go through the same queue and case page; the case closes with outcome "মালিকের কাছে ফেরত / returned to owner" when the pet is reunited.

**Lost & found board (P1, RSC-10):** public map/list of open lost and found reports — area rounded to ~1 km, no phone numbers or reporter names. "আমি দেখেছি / I've seen it" sends an in-app message to the reporter, who chooses whether to share their number. Nearby users get an alert for new reports.

---

## 11. Adoption Flow (দত্তক)

```mermaid
flowchart TD
  A0[দত্তক / Adoption — no login needed] --> A1[Filters: প্রজাতি · বয়স · জেলা<br/>Species · Age · District]
  A1 --> A2[Listing card → detail: photos, age, vaccinated, area, shelter ✔]
  A2 --> SAVE[♡ সেভ করুন · P1]
  A2 --> REP[ভুয়া তালিকা রিপোর্ট · P1]
  A2 --> A3[আবেদন করুন / Apply → login if needed]
  A3 --> A4[One form: বাসার ধরন · আগের অভিজ্ঞতা · কেন নিতে চান]
  A4 --> A5[জমা হয়েছে / Submitted]
  A5 --> A6[দেখা হচ্ছে / Under review — shelter or lister, a human]
  A6 -- Reject --> A7[বাতিল + reason]
  A6 -- Approve --> A8[অনুমোদিত / Approved · listing reserved]
  A8 --> A9[হস্তান্তর / Handover: giver confirms + adopter confirms]
  A9 --> A10[মালিকানা বদল ✅ Pet profile + records move to new owner<br/>listing closed · one handover only]
  A10 --> A11[খোঁজখবর / Follow-up after 7 & 30 days · P1]
```

**Create listing (shelter / approved individual):** pick a pet profile → photos, description bn/en, vaccinated/neutered, district & upazila (no exact address) → publish. Applications inbox with status chips; approve/reject buttons always need a human tap — no auto-decision.

---

## 12. AI Assistant (P1)

```mermaid
flowchart TD
  I0[এআই সহকারী / AI assistant<br/>'আমি এআই, ডাক্তার নই'] --> I1{Share pet info?<br/>off by default}
  I1 --> I2[Type or hold-to-talk 🎤 voice]
  I2 --> EM{Emergency signs?<br/>breathing trouble · seizure · bleeding}
  EM -- Yes --> GO[এখনই ভেটের কাছে যান + Emergency map + Call]
  EM -- No --> ANS[General answer: food, vaccines, care]
  ANS --> BK{Wants a vet?}
  BK -- Yes --> PROP[Suggests vets + a draft booking]
  PROP --> YES{User taps হ্যাঁ / Yes?}
  YES -- Yes --> CB[create_booking → 'বুকিং নিশ্চিত' only after the system confirms]
  YES -- No --> ANS
  ANS --> UNS{Not sure?}
  UNS -- Yes --> HUMAN[Call the clinic / contact support]
```

Never shows a diagnosis, medicine name or dose; never asks for password, OTP or payment info.

---

## 13. Calls (P1)

From a confirmed online-consultation booking: **অডিও কল** or **ভিডিও কল** → ringing screen → in-call (mute, speaker, camera flip, end) → call ends → saved in কলের ইতিহাস / Call history (who, when, duration). Recording is off; a "রেকর্ড করুন" option appears only in P2 and only starts after both people agree.

---

## 14. Empty, Error & Offline States

| Case | Message (bn) | Action |
|---|---|---|
| No internet | ইন্টারনেট সংযোগ নেই | Show cached nearby list, retry |
| No clinics in radius | এই এলাকায় কোনো ক্লিনিক পাওয়া যায়নি | Expand radius, suggest a clinic |
| Location denied | লোকেশন ছাড়া এলাকা দিয়ে খুঁজুন | Area search |
| No pets yet | এখনো কোনো পোষা প্রাণী যোগ করা হয়নি | Add pet |
| Payment failed | পেমেন্ট সম্পন্ন হয়নি | Retry / pay cash |
| Server error | কিছু একটা সমস্যা হয়েছে | Retry, contact support |
| Report without location permission | লোকেশন ছাড়া ম্যাপে পিন দিন | Pin drop on map + area text |
| Report offline | রিপোর্ট সেভ হয়েছে, ইন্টারনেট এলে পাঠানো হবে | Queue and auto-send |
| No adoption listings | এই জেলায় এখন দত্তকের জন্য কোনো প্রাণী নেই | Change district / species |
| No rescuer accepted yet | এখনো কোনো উদ্ধারকারী পাওয়া যায়নি | Reviewer reassigns; shelter/admin notified |
| AI unavailable | এআই এখন উত্তর দিতে পারছে না | Call a clinic / emergency map |
