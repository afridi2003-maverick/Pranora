-- ── SVC-TRN: Pet Training Service (Phase 3 / S9) ────────────────────────────
-- Stores verified pet trainers, training packages, and training bookings

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name_bn text not null,
  full_name_en text not null,
  bio_bn text not null,
  bio_en text not null,
  certifications text[] not null default array['Positive Reinforcement Certified'],
  specialties text[] not null default array['obedience', 'puppy_socialization'],
  session_rate integer not null default 800,
  package_rate integer not null default 4500,
  experience_years integer not null default 3,
  accepted_species text[] not null default array['dog', 'cat'],
  areas text[] not null default array['ধানমন্ডি (Dhanmondi)'],
  district text not null default 'Dhaka',
  rating numeric(3,2) not null default 4.90,
  review_count integer not null default 15,
  phone text not null default '+880 1711-000000',
  is_verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug in ('obedience', 'puppy_socialization', 'behavior_correction', 'agility')),
  title_bn text not null,
  title_en text not null,
  description_bn text not null,
  description_en text not null,
  sessions_count integer not null default 6,
  duration_minutes integer not null default 60,
  base_price integer not null,
  target_species text[] not null default array['dog'],
  created_at timestamptz not null default now()
);

create table if not exists public.training_bookings (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  package_type text not null check (package_type in ('obedience', 'puppy_socialization', 'behavior_correction', 'agility')),
  booking_mode text not null default 'package' check (booking_mode in ('single_session', 'package')),
  training_format text not null default 'home_visit' check (training_format in ('home_visit', 'center')),
  start_date date not null default current_date,
  preferred_time text not null default '04:00 PM',
  sessions_total integer not null default 6,
  sessions_completed integer not null default 0,
  total_price integer not null default 4500,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'bkash', 'nagad', 'rocket', 'card')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  address text not null,
  pet_behavior_notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.trainers enable row level security;
alter table public.training_packages enable row level security;
alter table public.training_bookings enable row level security;

-- Trainers policies
create policy "Verified trainers are readable by all"
  on public.trainers
  for select
  using (is_verified = true);

create policy "Trainers can update their own profile"
  on public.trainers
  for update
  using (auth.uid() = user_id);

-- Training packages policies
create policy "Training packages are readable by all"
  on public.training_packages
  for select
  using (true);

-- Training bookings policies
create policy "Owners can view their own training bookings"
  on public.training_bookings
  for select
  using (auth.uid() = owner_id);

create policy "Owners can insert their own training bookings"
  on public.training_bookings
  for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own training bookings"
  on public.training_bookings
  for update
  using (auth.uid() = owner_id);

create policy "Trainers can view bookings assigned to them"
  on public.training_bookings
  for select
  using (
    exists (
      select 1 from public.trainers t
      where t.id = training_bookings.trainer_id and t.user_id = auth.uid()
    )
  );

-- Indexes
create index if not exists idx_trainers_district on public.trainers (district);
create index if not exists idx_trainers_verified on public.trainers (is_verified);
create index if not exists idx_training_bookings_owner on public.training_bookings (owner_id);
create index if not exists idx_training_bookings_trainer on public.training_bookings (trainer_id);
create index if not exists idx_training_bookings_status on public.training_bookings (status);

-- Seed Training Packages
insert into public.training_packages (
  slug, title_bn, title_en, description_bn, description_en, sessions_count, duration_minutes, base_price, target_species
) values
(
  'obedience',
  'বেসিক ওবিডিয়েন্স ট্রেনিং',
  'Basic Obedience Training',
  'বসা (Sit), থাকা (Stay), আসা (Come) এবং লিশ ট্রেনিংসহ দৈনন্দিন শৃঙ্খলাবোধ তৈরি।',
  'Core commands (Sit, Stay, Come, Heel) and leash manners using gentle positive reinforcement.',
  6, 60, 4500, array['dog']
),
(
  'puppy_socialization',
  'পাপি ও কিটেন সোশ্যালাইজেশন',
  'Puppy & Kitten Socialization',
  'পটি ট্রেনিং, কামড়ানো কমানো এবং নতুন পরিবেশ ও মানুষের সাথে অভ্যস্ত করা।',
  'Potty training, bite inhibition, crate comfort, and safe socialization for young pets.',
  5, 45, 3800, array['dog', 'cat']
),
(
  'behavior_correction',
  'বিহেভিয়ার কারেকশন',
  'Behavior Modification',
  'অতিরিক্ত ঘেউ ঘেউ, অ্যাংজাইটি এবং আক্রমণাত্মক আচরণ সংশোধনের বিশেষ সেশন।',
  'Targeted behavior work for separation anxiety, excessive barking, leash reactivity, and fear.',
  8, 60, 6200, array['dog', 'cat']
),
(
  'agility',
  'অ্যাজিলিটি ও অ্যাডভান্সড ট্রেনিং',
  'Agility & Advanced Skills',
  'অফ-লিশ কমান্ড, অবস্ট্যাকল কোর্স এবং মানসিক ও শারীরিক সক্ষমতা বৃদ্ধি।',
  'Off-leash reliability, obstacle courses, scent games, and advanced mental stimulation.',
  8, 60, 6800, array['dog']
)
on conflict (slug) do nothing;

-- Seed Initial Verified Trainers
insert into public.trainers (
  id,
  full_name_bn,
  full_name_en,
  bio_bn,
  bio_en,
  certifications,
  specialties,
  session_rate,
  package_rate,
  experience_years,
  accepted_species,
  areas,
  district,
  rating,
  review_count,
  phone,
  is_verified
) values
(
  'f1111111-1111-1111-1111-111111111111',
  'ক্যাপ্টেন আরিফুর রহমান',
  'Arifur Rahman',
  '৬ বছরের অভিজ্ঞতাসম্পন্ন সার্টিফায়েড কে-৯ ট্রেইনার। পজিটিভ রিইনফোর্সমেন্ট পদ্ধতিতে কুকুরের ওবিডিয়েন্স ও বিহেভিয়ার কারেকশনে বিশেষ দক্ষ।',
  'Certified K9 trainer with 6 years of experience specializing in positive-reinforcement obedience and leash reactivity.',
  array['K9 Certified Trainer', 'Fear-Free Pets'],
  array['obedience', 'behavior_correction', 'agility'],
  900,
  4800,
  6,
  array['dog'],
  array['ধানমন্ডি (Dhanmondi)', 'মোহাম্মদপুর (Mohammadpur)', 'লালমাটিয়া (Lalmatia)'],
  'Dhaka',
  4.96,
  42,
  '+880 1711-556677',
  true
),
(
  'f2222222-2222-2222-2222-222222222222',
  'ফারহানা তাসনিম',
  'Farhana Tasnim',
  'বিড়াল ও ছোট জাতের কুকুরের পটি ট্রেনিং এবং সোশ্যালাইজেশন বিশেষজ্ঞ। বাসায় গিয়ে অত্যন্ত ধৈর্য ও যত্নের সাথে প্রশিক্ষণ দেন।',
  'Feline & small-breed specialist focused on litter habits, puppy socialization, and stress-free home adaptation.',
  array['CCPDT-KA', 'Cat Behavior Specialist'],
  array['puppy_socialization', 'behavior_correction'],
  800,
  4200,
  4,
  array['cat', 'dog'],
  array['গুলশান (Gulshan)', 'বনানী (Banani)', 'বারিধারা (Baridhara)'],
  'Dhaka',
  4.92,
  31,
  '+880 1819-334455',
  true
),
(
  'f3333333-3333-3333-3333-333333333333',
  'মেহেদী হাসান সজীব',
  'Mehedi Hasan Sojib',
  'বড় জাতের কুকুরের অ্যাজিলিটি, গার্ড ট্রেনিং এবং অফ-লিশ কমান্ডে ৫ বছরের বাস্তব অভিজ্ঞতা।',
  '5+ years training working breeds in agility, recall reliability, and structured outdoor obedience.',
  array['BD Kennel Club Mentor', 'Agility Coach'],
  array['obedience', 'agility'],
  850,
  4600,
  5,
  array['dog'],
  array['উত্তরা (Uttara)', 'মিরপুর (Mirpur)', 'বসুন্ধরা (Bashundhara)'],
  'Dhaka',
  4.89,
  27,
  '+880 1912-778899',
  true
),
(
  'f4444444-4444-4444-4444-444444444444',
  'সাব্বির চৌধুরী',
  'Sabbir Chowdhury',
  'চট্টগ্রামে পজিটিভ রিইনফোর্সমেন্ট ও পাপি ট্রেনিংয়ে পরিচিত মুখ। মালিকদেরও সঠিক হ্যান্ডলিং শিখিয়ে থাকেন।',
  'Chattogram-based positive trainer helping first-time pet parents build confident, well-mannered companions.',
  array['Positive Reinforcement Coach'],
  array['obedience', 'puppy_socialization'],
  750,
  4000,
  3,
  array['dog', 'cat'],
  array['নাসিরাবাদ (Nasirabad)', 'জিইসি (GEC)', 'খুলশী (Khulshi)'],
  'Chattogram',
  4.90,
  19,
  '+880 1678-112233',
  true
)
on conflict (id) do nothing;
