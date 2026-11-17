-- ============================================================
-- DB-7 (part A): service_categories + services tables + seed
--   Also seeds: breeds catalog
-- Owner: zihad | Branch: zihad | Sprint: S3
-- Depends on: DB-3 (pets/health tables, vaccine_templates)
--             (DB-4) soft — Zimia will add provider_services
--             referencing services(id) in her migration.
-- NOTE: service_categories and services are owned here (DB-7).
--       DB-4 (Zimia) adds: providers, provider_locations,
--       location_hours, provider_services, vets — referencing
--       services(id) from this migration. Merge order:
--       DB-7 → DB-4.
-- ============================================================

-- ============================================================
-- 1. SERVICE CATEGORIES
--    Slug-based catalog; UI uses name_bn / name_en.
-- ============================================================

create table public.service_categories (
  id       smallserial primary key,
  slug     text unique not null,
  name_bn  text not null,
  name_en  text not null,
  icon     text,                     -- icon identifier for UI
  sort_order smallint not null default 0,
  is_active  boolean not null default true
);

alter table public.service_categories enable row level security;

create policy "service_categories: public read"
  on public.service_categories for select
  using (true);

create policy "service_categories: admin write"
  on public.service_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 2. SERVICES
--    Individual bookable or informational service types.
-- ============================================================

create table public.services (
  id              serial primary key,
  category_id     smallint not null references public.service_categories(id),
  slug            text unique not null,
  name_bn         text not null,
  name_en         text not null,
  description_bn  text,
  description_en  text,
  is_active       boolean not null default true,
  is_mvp          boolean not null default false,  -- true = shown in MVP build
  sort_order      smallint not null default 0
);

alter table public.services enable row level security;

create policy "services: public read"
  on public.services for select
  using (true);

create policy "services: admin write"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

create index services_category_idx on public.services (category_id);
create index services_active_idx   on public.services (is_active, is_mvp);

-- ============================================================
-- 3. SEED — service_categories
-- ============================================================

insert into public.service_categories (slug, name_bn, name_en, icon, sort_order, is_active)
values
  -- P0 MVP categories
  ('vet',           'পশু চিকিৎসা',         'Veterinary',           'stethoscope',  1,  true),
  ('vaccination',   'টিকা',                 'Vaccination',          'syringe',      2,  true),
  ('emergency',     'জরুরি সেবা',           'Emergency',            'ambulance',    3,  true),
  ('rescue',        'উদ্ধার ও আশ্রয়',       'Rescue & Shelter',     'shield',       4,  true),
  ('adoption',      'দত্তক',                'Adoption',             'heart',        5,  true),
  -- P1 categories (shown when feature flag active)
  ('grooming',      'গ্রুমিং',              'Grooming',             'scissors',     6,  true),
  ('boarding',      'পেট বোর্ডিং',          'Boarding',             'home',         7,  true),
  ('home_visit',    'হোম ভিজিট',            'Home Visit',           'house-medical',8,  true),
  ('online_consult','অনলাইন পরামর্শ',       'Online Consult',       'video',        9,  true),
  ('pet_shop',      'পেট শপ',              'Pet Shop',             'shopping-bag', 10, true),
  ('training',      'ট্রেনিং',              'Training',             'award',        11, true),
  ('sitting',       'পেট সিটিং',            'Pet Sitting & Walking','paw',          12, true),
  ('taxi',          'পেট ট্যাক্সি',          'Pet Taxi',             'car',          13, true);

-- ============================================================
-- 4. SEED — services  (MVP: is_mvp = true)
-- ============================================================

insert into public.services
  (category_id, slug, name_bn, name_en, description_bn, description_en, is_active, is_mvp, sort_order)
select
  c.id,
  s.slug,
  s.name_bn,
  s.name_en,
  s.description_bn,
  s.description_en,
  s.is_active,
  s.is_mvp,
  s.sort_order
from (values
  -- ── Vet ─────────────────────────────────────────────────────
  ('vet',         'clinic_visit',
   'ক্লিনিক ভিজিট',          'Clinic Visit',
   'ক্লিনিকে সরাসরি পশু চিকিৎসা', 'In-person visit at the vet clinic',
   true, true, 1),

  ('vet',         'home_vet_visit',
   'বাড়িতে ভেটেরিনারি ভিজিট', 'Home Vet Visit',
   'পশু চিকিৎসক বাড়িতে এসে দেখবেন', 'Vet comes to your home',
   true, false, 2),

  ('vet',         'online_vet_consult',
   'অনলাইন ভেটেরিনারি পরামর্শ', 'Online Vet Consult',
   'ভিডিও বা চ্যাটে পশু চিকিৎসকের পরামর্শ', 'Consult a vet via video or chat',
   true, false, 3),

  -- ── Vaccination ─────────────────────────────────────────────
  ('vaccination', 'vaccine_clinic',
   'ক্লিনিকে টিকা',           'Vaccination at Clinic',
   'ক্লিনিকে পোষা প্রাণীর টিকা দেওয়া', 'Get your pet vaccinated at a clinic',
   true, true, 1),

  ('vaccination', 'vaccine_home',
   'বাড়িতে টিকা',             'Vaccination at Home',
   'পশু চিকিৎসক বাড়িতে এসে টিকা দেবেন', 'Vet comes to your home to vaccinate',
   true, false, 2),

  -- ── Emergency ───────────────────────────────────────────────
  ('emergency',   'emergency_care',
   'জরুরি চিকিৎসা',           'Emergency Care',
   '২৪/৭ জরুরি পশু চিকিৎসা সেবা', '24/7 emergency veterinary care',
   true, true, 1),

  -- ── Rescue ──────────────────────────────────────────────────
  ('rescue',      'rescue_report',
   'উদ্ধার রিপোর্ট',           'Rescue Report',
   'আহত বা হারানো পশুর রিপোর্ট করুন', 'Report an injured or lost animal',
   true, true, 1),

  ('rescue',      'shelter_intake',
   'আশ্রয়কেন্দ্র ভর্তি',       'Shelter Intake',
   'পশুকে আশ্রয়কেন্দ্রে রাখুন', 'Place an animal in a shelter',
   true, true, 2),

  -- ── Adoption ────────────────────────────────────────────────
  ('adoption',    'adopt_pet',
   'পোষা প্রাণী দত্তক নিন',   'Adopt a Pet',
   'আশ্রয়কেন্দ্র বা ব্যক্তির কাছ থেকে পোষা প্রাণী দত্তক নিন',
   'Adopt a pet from a shelter or individual',
   true, true, 1),

  ('adoption',    'list_for_adoption',
   'দত্তকের জন্য তালিকাভুক্ত করুন', 'List for Adoption',
   'আপনার পোষা প্রাণীকে দত্তকের জন্য তালিকাভুক্ত করুন',
   'List your pet for adoption',
   true, true, 2),

  -- ── Grooming (P1) ───────────────────────────────────────────
  ('grooming',    'bath_groom',
   'গোসল ও গ্রুমিং',          'Bath & Grooming',
   'পেশাদার গোসল, চুল কাটা ও নখ ছাঁটা', 'Professional bath, haircut & nail trim',
   true, false, 1),

  ('grooming',    'full_groom',
   'ফুল গ্রুমিং',             'Full Grooming',
   'সম্পূর্ণ গ্রুমিং প্যাকেজ', 'Complete grooming package',
   true, false, 2),

  -- ── Boarding (P1) ───────────────────────────────────────────
  ('boarding',    'day_boarding',
   'দিনের বোর্ডিং',           'Day Boarding',
   'দিনের বেলা পেশাদার পরিচর্যা', 'Professional daytime pet care',
   true, false, 1),

  ('boarding',    'overnight_boarding',
   'রাতের বোর্ডিং',           'Overnight Boarding',
   'রাত্রিকালীন পেশাদার পেট বোর্ডিং', 'Overnight professional pet boarding',
   true, false, 2),

  -- ── Pet Shop (P1) ───────────────────────────────────────────
  ('pet_shop',    'pet_food',
   'পোষা প্রাণীর খাবার',      'Pet Food',
   'বিভিন্ন ধরনের পোষা প্রাণীর খাবার', 'Various pet food options',
   true, false, 1),

  ('pet_shop',    'pet_accessories',
   'পোষা প্রাণীর আনুষঙ্গিক',  'Pet Accessories',
   'কলার, লিশ, বিছানা, খেলনা', 'Collars, leashes, beds, toys',
   true, false, 2),

  ('pet_shop',    'pet_medicine',
   'পোষা প্রাণীর ওষুধ',       'Pet Medicine',
   'পশু চিকিৎসা সামগ্রী ও ওষুধ', 'Veterinary supplies and medicines',
   true, false, 3),

  -- ── Training (P1) ───────────────────────────────────────────
  ('training',    'basic_training',
   'বেসিক ট্রেনিং',           'Basic Training',
   'মৌলিক আদেশ ও আচরণ প্রশিক্ষণ', 'Basic commands and behaviour training',
   true, false, 1),

  -- ── Sitting (P3) ────────────────────────────────────────────
  ('sitting',     'pet_sitting',
   'পেট সিটিং',               'Pet Sitting',
   'আপনার বাড়িতে বা সিটারের বাড়িতে পরিচর্যা', 'Care at your home or sitter''s home',
   true, false, 1),

  ('sitting',     'dog_walking',
   'ডগ ওয়াকিং',              'Dog Walking',
   'পেশাদার কুকুর হাঁটানো সেবা', 'Professional dog walking service',
   true, false, 2),

  -- ── Taxi (P3) ───────────────────────────────────────────────
  ('taxi',        'pet_taxi',
   'পেট ট্যাক্সি',             'Pet Taxi',
   'পোষা প্রাণীর জন্য নিরাপদ পরিবহন', 'Safe transportation for pets',
   true, false, 1)

) as s(cat_slug, slug, name_bn, name_en, description_bn, description_en, is_active, is_mvp, sort_order)
join public.service_categories c on c.slug = s.cat_slug;

-- ============================================================
-- 5. SEED — breeds catalog
--    Common breeds in Bangladesh for dogs, cats, birds, fish
-- ============================================================

insert into public.breeds (species, name_en, name_bn) values
  -- Dogs
  ('dog', 'Mixed/Deshi',           'মিশ্র/দেশি'),
  ('dog', 'German Shepherd',       'জার্মান শেফার্ড'),
  ('dog', 'Labrador Retriever',    'ল্যাব্রাডর রিট্রিভার'),
  ('dog', 'Golden Retriever',      'গোল্ডেন রিট্রিভার'),
  ('dog', 'Pomeranian',            'পমেরানিয়ান'),
  ('dog', 'Shih Tzu',              'শিহ জু'),
  ('dog', 'Lhasa Apso',            'লাসা আপসো'),
  ('dog', 'Beagle',                'বিগল'),
  ('dog', 'Pug',                   'পাগ'),
  ('dog', 'Doberman',              'ডোবারম্যান'),
  ('dog', 'Rottweiler',            'রটওয়েলার'),
  ('dog', 'Husky',                 'হাস্কি'),
  ('dog', 'Border Collie',         'বর্ডার কলি'),
  ('dog', 'French Bulldog',        'ফরাসি বুলডগ'),
  ('dog', 'Cocker Spaniel',        'ককার স্প্যানিয়েল'),
  -- Cats
  ('cat', 'Mixed/Deshi',           'মিশ্র/দেশি'),
  ('cat', 'Persian',               'পার্সিয়ান'),
  ('cat', 'Maine Coon',            'মেইন কুন'),
  ('cat', 'Siamese',               'সিয়ামিজ'),
  ('cat', 'Bengal',                'বেঙ্গল'),
  ('cat', 'British Shorthair',     'ব্রিটিশ শর্টহেয়ার'),
  ('cat', 'Ragdoll',               'র‍্যাগডল'),
  ('cat', 'Scottish Fold',         'স্কটিশ ফোল্ড'),
  ('cat', 'Birman',                'বার্মান'),
  ('cat', 'Abyssinian',            'অ্যাবিসিনিয়ান'),
  -- Birds
  ('bird', 'Budgerigar',           'বাজরিগার'),
  ('bird', 'Cockatiel',            'ককাটিয়েল'),
  ('bird', 'African Grey Parrot',  'আফ্রিকান গ্রে তোতা'),
  ('bird', 'Lovebird',             'লাভবার্ড'),
  ('bird', 'Finch',                'ফিঞ্চ'),
  ('bird', 'Canary',               'ক্যানারি'),
  ('bird', 'Pigeon',               'কবুতর'),
  ('bird', 'Mynah',                'ময়না'),
  -- Fish
  ('fish', 'Goldfish',             'গোল্ডফিশ'),
  ('fish', 'Betta',                'বেটা'),
  ('fish', 'Guppy',                'গাপি'),
  ('fish', 'Koi',                  'কই'),
  ('fish', 'Molly',                'মলি'),
  ('fish', 'Flowerhorn',           'ফ্লাওয়ারহর্ন'),
  -- Other
  ('other', 'Rabbit',              'খরগোশ'),
  ('other', 'Guinea Pig',          'গিনি পিগ'),
  ('other', 'Hamster',             'হামস্টার'),
  ('other', 'Turtle',              'কচ্ছপ');

-- ============================================================
-- 6. SEED — vaccine_templates
--    Standard vaccination schedule per species (Bangladesh)
-- ============================================================

insert into public.vaccine_templates
  (species, name_en, name_bn, first_dose_age_weeks, repeat_every_days, doses)
values
  -- ── DOGS ────────────────────────────────────────────────────
  -- DHPP (Distemper, Hepatitis, Parainfluenza, Parvovirus)
  -- Primary series: 3 doses, 3–4 weeks apart; first at 6–8 weeks
  ('dog', 'DHPP (5-in-1)',
   'ডিএইচপিপি (৫ ইন ১)',
   6,    -- first dose at 6 weeks
   365,  -- annual booster after primary series
   3),   -- 3 doses in primary series

  -- Rabies — single dose at 12 weeks, annual booster
  ('dog', 'Rabies',
   'জলাতঙ্ক',
   12,   -- first dose at 12 weeks
   365,  -- annual
   1),

  -- Bordetella (Kennel Cough) — optional but common in BD
  ('dog', 'Bordetella (Kennel Cough)',
   'বোর্ডেটেলা (কেনেল কাশি)',
   8,
   365,
   1),

  -- Leptospirosis — 2-dose primary, annual
  ('dog', 'Leptospirosis',
   'লেপ্টোস্পাইরোসিস',
   12,
   365,
   2),

  -- Deworming — every 3 months for adults; first at 2 weeks
  ('dog', 'Deworming',
   'কৃমিনাশক',
   2,
   90,   -- every 3 months
   1),

  -- Flea & Tick prevention — monthly
  ('dog', 'Flea & Tick Prevention',
   'মাছি ও টিক প্রতিরোধ',
   8,
   30,   -- monthly
   1),

  -- ── CATS ────────────────────────────────────────────────────
  -- FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)
  ('cat', 'FVRCP (3-in-1)',
   'এফভিআরসিপি (৩ ইন ১)',
   6,
   365,
   3),

  -- Rabies — cats
  ('cat', 'Rabies',
   'জলাতঙ্ক',
   12,
   365,
   1),

  -- FeLV (Feline Leukemia Virus) — optional, 2 doses
  ('cat', 'FeLV (Feline Leukemia)',
   'ফেলাইন লিউকেমিয়া',
   8,
   365,
   2),

  -- Deworming — cats
  ('cat', 'Deworming',
   'কৃমিনাশক',
   2,
   90,
   1),

  -- ── BIRDS ───────────────────────────────────────────────────
  -- Annual wellness check (not a traditional vaccine, tracks checkup)
  ('bird', 'Annual Wellness Check',
   'বার্ষিক স্বাস্থ্য পরীক্ষা',
   0,    -- from hatching / first acquisition
   365,
   1),

  -- Deworming — birds
  ('bird', 'Deworming',
   'কৃমিনাশক',
   4,
   180,  -- every 6 months
   1),

  -- ── FISH ────────────────────────────────────────────────────
  -- Parasite / disease treatment tracking
  ('fish', 'Anti-parasite Treatment',
   'পরজীবী চিকিৎসা',
   0,
   180,
   1),

  -- ── OTHER (rabbits, guinea pigs, etc.) ──────────────────────
  ('other', 'Deworming',
   'কৃমিনাশক',
   4,
   90,
   1);
