-- ============================================================
-- DB-1: Core initial migration
-- Enums · Extensions · Locations · Users · app_config
-- Owner: afridi | Branch: afridi | Sprint: S2
-- ============================================================

-- ------------------------------------------------------------
-- 0. Extensions
-- ------------------------------------------------------------
create extension if not exists postgis;
create extension if not exists pg_trgm;
create extension if not exists pg_cron;

-- ------------------------------------------------------------
-- 1. Enums
-- ------------------------------------------------------------
create type user_role as enum (
  'owner', 'rescuer', 'shelter', 'adoption_lister',
  'vet', 'provider', 'admin'
);

create type app_locale as enum ('bn', 'en');

create type species_type as enum (
  'dog', 'cat', 'bird', 'rabbit', 'fish',
  'cow', 'goat', 'poultry', 'other'
);

create type pet_gender as enum ('male', 'female', 'unknown');

create type provider_type as enum (
  'vet_clinic', 'pet_hospital', 'govt_vet_hospital', 'freelance_vet',
  'groomer', 'pet_shop', 'boarding', 'trainer', 'sitter', 'pet_taxi', 'shelter'
);

create type verification_status as enum (
  'draft', 'pending', 'verified', 'rejected', 'suspended'
);

create type schedule_mode as enum ('slot', 'serial');

create type booking_type as enum (
  'slot', 'serial', 'home_visit', 'online',
  'date_range', 'order', 'instant', 'listing'
);

create type booking_status as enum (
  'pending', 'confirmed', 'in_progress', 'completed',
  'cancelled_by_owner', 'cancelled_by_provider', 'no_show', 'expired'
);

create type payment_method as enum ('cash', 'bkash', 'nagad', 'rocket', 'card');

create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create type reminder_type as enum (
  'vaccine', 'deworming', 'flea_tick', 'medicine', 'grooming', 'checkup', 'custom'
);

create type order_status as enum (
  'placed', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'
);

-- Adoption enums
create type adoption_listing_status as enum (
  'draft', 'available', 'reserved', 'adopted', 'withdrawn', 'removed'
);

create type adoption_application_status as enum (
  'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'
);

create type home_type as enum (
  'own_house', 'rented_house', 'own_flat', 'rented_flat', 'other'
);

-- Rescue enums
create type animal_report_kind as enum ('injured', 'lost', 'found', 'abandoned');

create type urgency_level as enum ('low', 'medium', 'high', 'critical');

create type rescue_status as enum (
  'submitted', 'under_review', 'assigned', 'rescue_in_progress',
  'closed', 'rejected', 'duplicate'
);

create type assignment_status as enum ('offered', 'accepted', 'declined', 'withdrawn');

create type rescue_outcome as enum (
  'treated', 'sent_to_shelter', 'adopted', 'returned_to_owner',
  'released', 'died', 'not_found', 'other'
);

-- Moderation / AI / calls enums
create type report_target as enum (
  'adoption_listing', 'animal_report', 'review', 'provider', 'user'
);

create type moderation_status as enum ('open', 'actioned', 'dismissed');

create type call_kind as enum ('audio', 'video');

create type call_status as enum (
  'ringing', 'ongoing', 'ended', 'missed', 'declined', 'failed'
);

-- ------------------------------------------------------------
-- 2. Shared trigger: set_updated_at
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 3. Bangladesh administrative areas
-- ------------------------------------------------------------
create table divisions (
  id       smallint primary key,
  name_bn  text not null,
  name_en  text not null
);

create table districts (
  id          smallint primary key,
  division_id smallint not null references divisions(id),
  name_bn     text not null,
  name_en     text not null
);

create table upazilas (
  id          integer primary key,
  district_id smallint not null references districts(id),
  name_bn     text not null,
  name_en     text not null,
  center      geography(Point, 4326)
);

-- RLS: location tables are public read, admin write
alter table divisions  enable row level security;
alter table districts  enable row level security;
alter table upazilas   enable row level security;

create policy "divisions public read"
  on divisions for select using (true);

create policy "districts public read"
  on districts for select using (true);

create policy "upazilas public read"
  on upazilas for select using (true);

-- ------------------------------------------------------------
-- 4. User profiles
-- ------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text unique,            -- +8801XXXXXXXXX
  email       text unique,
  avatar_url  text,
  locale      app_locale not null default 'bn',
  district_id smallint references districts(id),
  push_token  text,
  sms_opt_in  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint phone_format check (phone is null or phone ~ '^\+8801[0-9]{9}$')
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- RLS
alter table profiles enable row level security;

create policy "profiles: owner can read own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: owner can update own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: insert on signup"
  on profiles for insert
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- 5. User roles (one person, multiple roles)
-- ------------------------------------------------------------
create table user_roles (
  user_id     uuid not null references profiles(id) on delete cascade,
  role        user_role not null,
  status      verification_status not null default 'verified',
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  created_at  timestamptz not null default now(),
  primary key (user_id, role)
);

alter table user_roles enable row level security;

create policy "user_roles: owner reads own"
  on user_roles for select
  using (auth.uid() = user_id);

create policy "user_roles: owner inserts own owner role"
  on user_roles for insert
  with check (auth.uid() = user_id and role = 'owner');

-- Note: admin policies for verification are added in DB-6 (has_role / is_admin helpers)

-- ------------------------------------------------------------
-- 6. Addresses
-- ------------------------------------------------------------
create table addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  label        text,                   -- বাসা / অফিস
  address_line text not null,
  upazila_id   integer references upazilas(id),
  location     geography(Point, 4326),
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table addresses enable row level security;

create policy "addresses: owner manages own"
  on addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 7. Rescuer profiles (P1 — RSC-9, behind feature flag)
-- ------------------------------------------------------------
create table rescuer_profiles (
  user_id       uuid primary key references profiles(id) on delete cascade,
  base_location geography(Point, 4326),
  district_id   smallint references districts(id),
  radius_km     numeric(4,1) not null default 5,
  species       species_type[] not null default '{dog,cat}',
  is_available  boolean not null default true,
  updated_at    timestamptz not null default now()
);

create index rescuer_profiles_location_gix on rescuer_profiles using gist (base_location);

alter table rescuer_profiles enable row level security;

create policy "rescuer_profiles: owner manages own"
  on rescuer_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "rescuer_profiles: authenticated read"
  on rescuer_profiles for select
  using (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 8. App config (feature flags + system settings)
-- ------------------------------------------------------------
create table app_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_config enable row level security;

create policy "app_config: authenticated read"
  on app_config for select
  using (auth.role() = 'authenticated');

-- Note: admin write policy added in DB-6

-- Seed default feature flags (all Phase 2+ features off in production)
insert into app_config (key, value) values
  ('feature.payments_online',  'false'),
  ('feature.ai_chat',          'false'),
  ('feature.calls',            'false'),
  ('feature.shop',             'false'),
  ('feature.home_visit',       'false'),
  ('feature.grooming',         'false'),
  ('feature.boarding',         'false'),
  ('feature.pet_taxi',         'false'),
  ('feature.lost_found_board', 'false');

-- ------------------------------------------------------------
-- Done: DB-1 core schema
-- Next: DB-6 (RLS helpers has_role/is_admin + pgTAP harness)
--       DB-2 (seed divisions/districts/upazilas)
-- ------------------------------------------------------------
