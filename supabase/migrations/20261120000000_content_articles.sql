-- ==============================================================================
-- Migration: 20261120000000_content_articles.sql
-- Module: Content, Tips & Care Articles (§4.12, §8.1, SVC-TIPS)
-- Author: Zihad
-- ==============================================================================

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_bn text not null,
  title_en text not null,
  body_bn text not null,
  body_en text not null,
  excerpt_bn text,
  excerpt_en text,
  category text not null check (category in ('diet', 'grooming', 'vaccine', 'health', 'seasonal', 'first_aid')),
  species text[] not null default array['all'],
  cover_url text,
  read_time_minutes integer not null default 3,
  tags text[] default array[]::text[],
  is_featured boolean not null default false,
  author_name_bn text default 'প্রাণোরা ভেটেরিনারি টিম',
  author_name_en text default 'Pranora Veterinary Team',
  author_id uuid references profiles(id) on delete set null,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_articles_slug on articles(slug);
create index if not exists idx_articles_category on articles(category);
create index if not exists idx_articles_published_at on articles(published_at);
create index if not exists idx_articles_featured on articles(is_featured);

-- Row Level Security
alter table articles enable row level security;

-- Public can view published articles
create policy "Articles are publicly readable when published"
  on articles for select
  using (published_at is not null and published_at <= now());

-- Admins can insert, update, delete
create policy "Admins can manage articles"
  on articles for all
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

-- Seed Initial Curated High-Quality Articles in Bangla & English
insert into articles (
  slug,
  title_bn,
  title_en,
  body_bn,
  body_en,
  excerpt_bn,
  excerpt_en,
  category,
  species,
  read_time_minutes,
  is_featured,
  author_name_bn,
  author_name_en
) values
(
  'hot-weather-cat-hydration-care',
  'তীব্র গরমে বিড়ালের পানিশূন্যতা রোধ ও দৈনন্দিন যত্ন',
  'Preventing Cat Dehydration and Daily Care in Hot Weather',
  'বাংলাদেশে গ্রীষ্মের তাপদাহে বিড়ালরা সহজেই ডিহাইড্রেশন বা পানিশূন্যতার শিকার হয়। বিড়াল প্রকৃতিগতভাবে কম পানি পান করে, যার ফলে মূত্রনালীর ইনফেকশন বা কিডনির জটিলতা সৃষ্টি হতে পারে।

## ১. পানির পাত্র ও পরিষ্কার পরিচ্ছন্নতা
বিড়ালের খাবার ও পানির পাত্র কখনোই পাশাপাশি রাখবেন না। অন্তত দুটি ভিন্ন স্থানে পরিষ্কার মাটির পাত্রে বা সিরামিকের পাত্রে ঠান্ডা পানি রাখুন। বিড়াল চলন্ত পানি পছন্দ করে, তাই সম্ভব হলে পেট ওয়াটার ফাউন্টেন ব্যবহার করতে পারেন।

## ২. ভেজা খাবার বা ওয়েট ফুড
শুকনো ড্রাই ফুডের পাশাপাশি দৈনিক খাবারে ওয়েট ফুড (যেমন- স্যুপ, ক্যান ফুড বা সেদ্ধ মুরগির মাংসের ঝোল) যোগ করুন। এতে তাদের শরীরের ৬০-৭০% পানির চাহিদা খাদ্য থেকেই পূরণ হবে।

## ৩. হিটস্ট্রোকের লক্ষণ
যদি বিড়াল মুখ হাঁ করে কুকুরের মতো দম ফেলে (Panting), লালা ঝরায় বা নিস্তেজ হয়ে পড়ে, তবে অবিলম্বে ভেজা সুতি কাপড় দিয়ে তার পায়ের তালু এবং কান মুছে দিন এবং ফ্যানের নিচে রাখুন। কখনোই বরফ পানি ঢালবেন না।',
  'During scorching summer months in Bangladesh, domestic cats are at high risk of heat exhaustion and dehydration. Naturally, cats have a low thirst drive, which increases the likelihood of feline urinary tract issues and kidney stress.

## 1. Fresh Water Stations
Keep fresh water bowls away from food dishes. Place water stations in quiet, shaded spots. Ceramic or stainless steel bowls keep water cooler. Consider a pet water fountain as running water encourages cats to drink more.

## 2. Incorporate Wet Food
Complement dry kibble with formulated wet food, broth, or boiled chicken broth (without salt or onions). Wet food provides natural hydration and eases digestion.

## 3. Warning Signs of Heatstroke
If your cat pants with mouth open, drools excessively, or becomes unresponsive, gently apply room-temperature damp towels to paw pads and seek veterinary attention immediately. Never submerge in ice water.',
  'গ্রীষ্মের তাপদাহে বিড়ালের সুস্থতা নিশ্চিত করতে বিশুদ্ধ পানি সরবরাহ, ওয়েট ফুড এবং হিটস্ট্রোকের সতর্কতা সম্পর্কে জেনে নিন।',
  'Crucial tips on keeping cats hydrated, encouraging water intake, and recognizing heatstroke signs during peak summer.',
  'diet',
  array['cat'],
  4,
  true,
  'ডাঃ সাকিব হাসান (ভেটেরিনারি সার্জন)',
  'Dr. Sakib Hasan (Veterinary Surgeon)'
),
(
  'puppy-essential-vaccination-schedule-bd',
  'ছানা কুকুরের প্রাথমিক টিকা ও টিকাদান নির্দেশিকা',
  'Essential Puppy Vaccination Guide & Schedule in Bangladesh',
  'ছানা কুকুর (Puppy) ঘরে আনার পর সবচেয়ে গুরুত্বপূর্ণ দায়িত্ব হলো তাদের সময়মতো টিকা দেওয়া। প্রাথমিক টিকা না দিলে পারভো ভাইরাস ও ডিস্টেম্পারের মতো মারাত্মক সংক্রামক রোগে ছানার মৃত্যুঝুঁকি থাকে।

## প্রাথমিক টিকার সময়সূচি:
1. **৬ থেকে ৮ সপ্তাহ:** প্রথম DHPPIL কম্বিনেশন ভ্যাকসিন (পারভো, ডিস্টেম্পার, হেপাটাইটিস ও লেপ্টোস্পাইরোসিস প্রতিরোধী)।
2. **১০ থেকে ১২ সপ্তাহ:** কম্বিনেশন টিকার প্রথম বুস্টার ডোজ।
3. **৩ মাস (১২ সপ্তাহ):** জলাতঙ্ক বা র‍্যাবিস (Rabies) টিকা।
4. **বার্ষিক:** প্রতি বছর একবার র‍্যাবিস ও কম্বিনেশন বুস্টার টিকা নবায়ন করতে হবে।

## টিকাদানের আগে করণীয়:
টিকা দেওয়ার অন্তত ৭ দিন আগে নিবন্ধিত ভেটেরিনারি চিকিৎসকের পরামর্শ অনুযায়ী সঠিক ডোজে কৃমিনাশক (Dewormer) খাওয়াতে হবে। অসুস্থ বা জ্বর থাকা অবস্থায় কখনোই টিকা দেবেন না।',
  'Welcoming a puppy into your home requires an absolute commitment to their core immunization schedule. Unvaccinated puppies face mortality rates over 80% from Parvovirus and Canine Distemper.

## Recommended Schedule:
1. **6-8 Weeks:** First DHPPiL core combination shot.
2. **10-12 Weeks:** Second booster dose.
3. **12 Weeks (3 Months):** Rabies vaccination.
4. **Annual:** Yearly rabies and multi-component booster shots.

## Important Pre-conditions:
Deworm your puppy under clinical supervision at least 7 days before vaccine administration. Never vaccinate an animal that exhibits fever, diarrhea, or acute lethargy.',
  'ছানা কুকুরের জীবন বাঁচাতে পারভোভাইরাস ও জলাতঙ্কের প্রাথমিক টিকাদানের সঠিক সময়সূচি ও নিয়মাবলী।',
  'A complete timeline for puppy core vaccinations, deworming prerequisites, and annual booster routines.',
  'vaccine',
  array['dog'],
  3,
  false,
  'প্রাণোরা ভেটেরিনারি বোর্ড',
  'Pranora Veterinary Board'
),
(
  'monsoon-skin-infection-prevention',
  'বর্ষাকালে পোষা প্রাণীর ত্বকের ছত্রাক ও অ্যালার্জি প্রতিরোধ',
  'Preventing Monsoon Fungal Skin Infections in Pets',
  'বর্ষার স্যাঁতসেঁতে আবহাওয়া এবং উচ্চ আর্দ্রতায় কুকুর ও বিড়ালের ত্বকে ফাঙ্গাল ইনফেকশন ও চুলকানির প্রাদুর্ভাব বেড়ে যায়।

## কীভাবে প্রতিরোধ করবেন:
- **লোম সর্বদা শুকনা রাখুন:** বৃষ্টিতে ভিজলে বা বাইরে থেকে এলে তোয়ালে দিয়ে লোম এবং পায়ের আঙুলের ফাঁক ভালোভাবে মুছে দিন।
- **নিয়মিত ব্রাশ করা:** প্রতিদিন লোম ব্রাশ করলে জমে থাকা ধুলাবালি দূর হয় এবং ত্বকে স্বাভাবিক বাতাস চলাচল করতে পারে।
- **অ্যান্টি-ফাঙ্গাল শ্যাম্পু:** চিকিৎসকের পরামর্শ ছাড়া মানুষের কোনো সাবান বা অ্যান্টিসেপটিক ব্যবহার করবেন না। মাসে দুইবার পেট-সেফ অ্যান্টিফাঙ্গাল শ্যাম্পু দিয়ে গোসল করান।
- **লালচে ভাব বা দুর্গন্ধ:** ত্বকে চুলকানি, লোম ওঠা বা দুর্গন্ধ দেখা দিলে ঘরে চিকিৎসা না করে দ্রুত পশু চিকিৎসকের পরামর্শ নিন।',
  'The humid monsoon season in Bangladesh creates an ideal environment for dermatophytes, yeast infections, and bacterial dermatitis in domestic pets.

## Prevention Essentials:
- **Dry thoroughly:** Dry coat and paw crevices completely after walking in rain.
- **Daily brushing:** Removes trapped dampness and promotes skin aeration.
- **Appropriate shampoo:** Use only vet-recommended antifungal wash; never use human soap or harsh antiseptics.
- **Early clinical signs:** Red circular lesions, persistent scratching, or bad odors warrant professional evaluation.',
  'বর্ষার আর্দ্র আবহাওয়ায় লোমশ বন্ধুদের ত্বকের ছত্রাক সংক্রমণ, রিংওয়ার্ম ও চুলকানি এড়ানোর উপায়।',
  'How to protect dogs and cats from dampness-induced fungal dermatitis and yeast infections during the rainy season.',
  'health',
  array['dog', 'cat'],
  3,
  false,
  'ডাঃ ফারিহা রহমান',
  'Dr. Fariha Rahman'
),
(
  'toxic-household-items-pet-poisoning',
  'ঘরের বিষাক্ত উপাদান: পোষা প্রাণীর জন্য মারাত্মক যে খাবার ও জিনিস',
  'Toxic Household Substances & Dangerous Human Foods for Pets',
  'অনেক সাধারণ খাবার ও গৃহস্থালি পণ্য মানুষের জন্য নিরাপদ হলেও পোষা প্রাণীর জন্য অত্যন্ত বিষাক্ত এমনকি প্রাণঘাতী হতে পারে।

## কখনোই খাওয়াবেন না:
1. **চকলেট ও ক্যাফেইন:** থিওব্রোমিন উপাদান হৃদযন্ত্রের ছন্দ ব্যাহত করে।
2. **পেঁয়াজ ও রসুন:** লোহিত রক্তকণিকা ভেঙে ফেলে রক্তশূন্যতা ঘটায়।
3. **আঙুর ও কিশমিশ:** বিড়াল ও কুকুরের আকস্মিক কিডনি ফেইলিউর ঘটাতে পারে।
4. **প্যারাসিটামল ও মানুষের ব্যথানাশক:** বিড়ালের ক্ষেত্রে একটি প্যারাসিটামল ট্যাবলেট মৃত্যু ঘটাতে পারে।

## বিষক্রিয়া শনাক্ত হলে তাৎক্ষণিক করণীয়:
পোষা প্রাণী যদি বমি করে, মুখ দিয়ে ফেনা তোলে বা কাঁপতে থাকে—তবে ঘরে বসে দুধ বা স্যালাইন জোর করে খাওয়ানোর চেষ্টা করবেন না। অবিলম্বে প্রাণোরার জরুরি ম্যাপ দেখে নিকটস্থ ২৪/৭ জরুরি ভেটেরিনারি ক্লিনিকে নিয়ে যান।',
  'Common kitchen staples and household cleaners can cause catastrophic poisoning in companion animals.

## Strictly Prohibited Items:
1. **Chocolate & Caffeine:** Theobromine causes severe cardiac arrhythmia.
2. **Onions & Garlic:** Causes oxidative damage to red blood cells, resulting in hemolytic anemia.
3. **Grapes & Raisins:** Can trigger sudden acute renal failure.
4. **Paracetamol / Acetaminophen:** Extremely lethal to felines even in microscopic doses.

## Emergency Response:
Never induce vomiting or force-feed milk without medical direction. Locate the nearest 24/7 veterinary hospital on the Pranora emergency map and transport immediately.',
  'পেঁয়াজ, চকলেট, আঙুর ও প্যারাসিটামলের মতো বিষাক্ত খাবার থেকে পোষা প্রাণীকে সুরক্ষিত রাখার নির্দেশিকা।',
  'Recognize toxic human foods and medications that present severe medical emergencies for dogs and cats.',
  'first_aid',
  array['all'],
  4,
  true,
  'প্রাণোরা জরুরি মেডিকেল সেল',
  'Pranora Emergency Medical Cell'
);
