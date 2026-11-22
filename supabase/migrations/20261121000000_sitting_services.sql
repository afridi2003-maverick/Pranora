-- ── SVC-SIT: Pet Sitting & Dog Walking Service (§4.6, PRD §4.8) ────────────────
-- Stores verified pet sitters, walkers, and owner sitting booking requests

create table if not exists public.sitters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name_bn text not null,
  full_name_en text not null,
  bio_bn text not null,
  bio_en text not null,
  hourly_rate integer not null default 300,
  daily_rate integer not null default 1800,
  experience_years integer not null default 2,
  service_types text[] not null default array['sitting_hourly', 'dog_walking'],
  accepted_species text[] not null default array['cat', 'dog'],
  areas text[] not null default array['ধানমন্ডি (Dhanmondi)'],
  district text not null default 'Dhaka',
  rating numeric(3,2) not null default 4.90,
  review_count integer not null default 12,
  phone text not null default '+880 1711-000000',
  is_verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sitting_bookings (
  id uuid primary key default gen_random_uuid(),
  sitter_id uuid not null references public.sitters(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  service_type text not null check (service_type in ('sitting_hourly', 'dog_walking', 'day_sitting', 'overnight')),
  start_date date not null default current_date,
  start_time text not null default '10:00 AM',
  duration_hours integer not null default 2,
  total_price integer not null default 600,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'bkash', 'nagad', 'card')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  address text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.sitters enable row level security;
alter table public.sitting_bookings enable row level security;

-- Sitters policies: verified sitters are visible to everyone
create policy "Verified sitters are readable by all"
  on public.sitters
  for select
  using (is_verified = true);

create policy "Sitters can update their own profile"
  on public.sitters
  for update
  using (auth.uid() = user_id);

-- Sitting bookings policies
create policy "Owners can view their own sitting bookings"
  on public.sitting_bookings
  for select
  using (auth.uid() = owner_id);

create policy "Owners can insert their own sitting bookings"
  on public.sitting_bookings
  for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own sitting bookings"
  on public.sitting_bookings
  for update
  using (auth.uid() = owner_id);

create policy "Sitters can view bookings for their profile"
  on public.sitting_bookings
  for select
  using (
    exists (
      select 1 from public.sitters s
      where s.id = sitting_bookings.sitter_id and s.user_id = auth.uid()
    )
  );

-- Indexes
create index if not exists idx_sitters_district on public.sitters (district);
create index if not exists idx_sitters_verified on public.sitters (is_verified);
create index if not exists idx_sitting_bookings_owner on public.sitting_bookings (owner_id);
create index if not exists idx_sitting_bookings_sitter on public.sitting_bookings (sitter_id);
create index if not exists idx_sitting_bookings_status on public.sitting_bookings (status);

-- Seed Initial Verified Sitters
insert into public.sitters (
  id,
  full_name_bn,
  full_name_en,
  bio_bn,
  bio_en,
  hourly_rate,
  daily_rate,
  experience_years,
  service_types,
  accepted_species,
  areas,
  district,
  rating,
  review_count,
  phone,
  is_verified
) values
(
  'e1111111-1111-1111-1111-111111111111',
  'তানভীর আহমেদ',
  'Tanvir Ahmed',
  'অভিজ্ঞ পেট লাভার ও প্রফেশনাল ডগ ট্রেইনার। ৩ বছর ধরে পোষা প্রাণীর যত্ন ও হাঁটার সেবা দিয়ে আসছি। পোষা প্রাণীর সাথে বন্ধুত্বপূর্ণ আচরণ ও সুরক্ষাই আমার মূল লক্ষ্য।',
  'Certified animal care enthusiast with 3+ years experience. Specializes in active dog walking and gentle puppy care in central Dhaka.',
  350,
  2000,
  3,
  array['sitting_hourly', 'dog_walking', 'day_sitting'],
  array['dog', 'cat'],
  array['ধানমন্ডি (Dhanmondi)', 'লালমাটিয়া (Lalmatia)', 'মোহাম্মদপুর (Mohammadpur)'],
  'Dhaka',
  4.95,
  28,
  '+880 1711-234567',
  true
),
(
  'e2222222-2222-2222-2222-222222222222',
  'নুসরাত জাহান',
  'Nusrat Jahan',
  'ভেটেরিনারি সায়েন্সের শিক্ষার্থী। বিড়াল ও কুকুরদের ওষুধ খাওয়ানো, খাবার পরিবেশন ও নিয়মিত পরিচর্যায় বিশেষ পারদর্শী। বাসায় এসে নিশ্চিন্তে যত্ন নেব।',
  'Veterinary science student offering loving cat sitting, medication administration, and daytime companionship.',
  300,
  1800,
  2,
  array['sitting_hourly', 'day_sitting', 'overnight'],
  array['cat', 'dog', 'bird'],
  array['গুলশান (Gulshan)', 'বনানী (Banani)', 'বারিধারা (Baridhara)'],
  'Dhaka',
  4.90,
  34,
  '+880 1819-876543',
  true
),
(
  'e3333333-3333-3333-3333-333333333333',
  'রাকিব হাসান',
  'Rakib Hasan',
  'কুকুরদের সকাল-বিকাল এক্সারসাইজ ও আউটডোর ওয়াকিংয়ে পারদর্শী। বড় এবং চঞ্চল জাতের কুকুরদের নিয়ন্ত্রণে দক্ষ। লাইভ জিপিএস লোকেশন শেয়ার সুবিধা রয়েছে।',
  'Energetic dog walker specialized in high-energy breeds and routine outdoor exercise with live tracking.',
  280,
  1600,
  4,
  array['dog_walking', 'sitting_hourly'],
  array['dog'],
  array['উত্তরা (Uttara)', 'বিমানবন্দর (Airport)', 'খিলক্ষেত (Khilkhet)'],
  'Dhaka',
  4.88,
  19,
  '+880 1912-345678',
  true
),
(
  'e4444444-4444-4444-4444-444444444444',
  'সাদিয়া ইসলাম শম্পা',
  'Sadia Islam Shampa',
  'বিড়ালদের প্রতি বিশেষ ভালোবাসা থেকেই এই পেশায়। মালিকরা ছুটিতে থাকলে সম্পূর্ণ নিরাপদ পরিবেশে ডে-সিটিং ও খাবার ব্যবস্থাপনা করে থাকি।',
  'Feline-first dedicated sitter providing stress-free in-home visits and vacation pet sitting.',
  320,
  1900,
  3,
  array['sitting_hourly', 'day_sitting', 'overnight'],
  array['cat', 'rabbit'],
  array['মিরপুর (Mirpur)', 'কল্যাণপুর (Kalyanpur)', 'শ্যামলী (Shyamoli)'],
  'Dhaka',
  4.92,
  22,
  '+880 1678-901234',
  true
)
on conflict (id) do nothing;
