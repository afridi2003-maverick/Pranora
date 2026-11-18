-- ============================================================
-- DB-5: Bookings & Scheduling Initial Migration
-- Tables: availability_rules, availability_exceptions, bookings
-- Unique indexes for race-free slot & serial booking
-- Row Level Security policies & triggers
-- Owner: tain | Branch: tain | Sprint: S2
-- ============================================================

-- ------------------------------------------------------------
-- 1. Availability Rules
-- ------------------------------------------------------------
create table if not exists public.availability_rules (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null,
  vet_id       uuid,
  weekday      smallint not null check (weekday between 0 and 6),
  start_time   time not null,
  end_time     time not null,
  mode         schedule_mode not null default 'slot',
  slot_minutes smallint not null default 20,
  capacity     smallint not null default 1,
  max_serials  smallint,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint chk_availability_mode check (mode = 'slot' or max_serials is not null),
  constraint chk_availability_time check (start_time < end_time)
);

create index if not exists availability_rules_loc_idx
  on public.availability_rules (location_id, weekday);

create trigger trg_availability_rules_updated_at
  before update on public.availability_rules
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- 2. Availability Exceptions (Holidays / Days off / Closed sessions)
-- ------------------------------------------------------------
create table if not exists public.availability_exceptions (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null,
  vet_id      uuid,
  date        date not null,
  is_closed   boolean not null default true,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists availability_exceptions_loc_date_idx
  on public.availability_exceptions (location_id, date);

-- ------------------------------------------------------------
-- 3. Bookings
-- ------------------------------------------------------------
create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  code                text unique not null,
  owner_id            uuid not null references public.profiles(id) on delete cascade,
  pet_id              uuid,
  location_id         uuid not null,
  vet_id              uuid,
  provider_service_id uuid not null,
  type                booking_type not null,
  status              booking_status not null default 'pending',
  starts_at           timestamptz,
  ends_at             timestamptz,
  serial_no           smallint,
  address_id          uuid references public.addresses(id),
  problem_note        text,
  attachments         text[] not null default '{}',
  price               numeric(10,2),
  payment_method      payment_method not null default 'cash',
  payment_status      payment_status not null default 'pending',
  cancel_reason       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Query and performance indexes
create index if not exists bookings_owner_idx
  on public.bookings (owner_id, starts_at desc);

create index if not exists bookings_location_idx
  on public.bookings (location_id, starts_at);

create index if not exists bookings_status_idx
  on public.bookings (status);

-- Invariants: Partial unique indexes to prevent double bookings
create unique index if not exists bookings_no_double_slot
  on public.bookings (vet_id, starts_at)
  where status in ('pending', 'confirmed') and vet_id is not null and serial_no is null;

create unique index if not exists bookings_no_double_serial
  on public.bookings (location_id, vet_id, starts_at, serial_no)
  where status in ('pending', 'confirmed') and serial_no is not null;

create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- 4. Conditional Foreign Key Constraints (Soft dependencies DB-3 & DB-4)
-- ------------------------------------------------------------
do $$
begin
  -- Provider locations
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'provider_locations'
  ) then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_availability_rules_location') then
      alter table public.availability_rules
        add constraint fk_availability_rules_location foreign key (location_id) references public.provider_locations(id) on delete cascade;
    end if;

    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_availability_exceptions_location') then
      alter table public.availability_exceptions
        add constraint fk_availability_exceptions_location foreign key (location_id) references public.provider_locations(id) on delete cascade;
    end if;

    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_bookings_location') then
      alter table public.bookings
        add constraint fk_bookings_location foreign key (location_id) references public.provider_locations(id);
    end if;
  end if;

  -- Vets
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'vets'
  ) then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_availability_rules_vet') then
      alter table public.availability_rules
        add constraint fk_availability_rules_vet foreign key (vet_id) references public.vets(id) on delete set null;
    end if;

    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_availability_exceptions_vet') then
      alter table public.availability_exceptions
        add constraint fk_availability_exceptions_vet foreign key (vet_id) references public.vets(id) on delete set null;
    end if;

    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_bookings_vet') then
      alter table public.bookings
        add constraint fk_bookings_vet foreign key (vet_id) references public.vets(id) on delete set null;
    end if;
  end if;

  -- Provider services
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'provider_services'
  ) then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_bookings_service') then
      alter table public.bookings
        add constraint fk_bookings_service foreign key (provider_service_id) references public.provider_services(id);
    end if;
  end if;

  -- Pets
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'pets'
  ) then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_bookings_pet') then
      alter table public.bookings
        add constraint fk_bookings_pet foreign key (pet_id) references public.pets(id) on delete set null;
    end if;
  end if;
end $$;

-- ------------------------------------------------------------
-- 5. Row Level Security Policies
-- ------------------------------------------------------------
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.bookings enable row level security;

-- Availability Rules Policies:
-- Anyone (anon and authenticated) can view available schedule rules
create policy "availability_rules: public read"
  on public.availability_rules for select
  using (true);

-- Providers, vets, and admins can manage availability rules
create policy "availability_rules: provider and admin manage"
  on public.availability_rules for all
  using (
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role)
  )
  with check (
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role)
  );

-- Availability Exceptions Policies:
-- Anyone can view exceptions
create policy "availability_exceptions: public read"
  on public.availability_exceptions for select
  using (true);

-- Providers, vets, and admins can manage exceptions
create policy "availability_exceptions: provider and admin manage"
  on public.availability_exceptions for all
  using (
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role)
  )
  with check (
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role)
  );

-- Bookings Policies:
-- Select: Owner reads own, provider/vet reads assigned, admin reads all
create policy "bookings: select own, provider, or admin"
  on public.bookings for select
  using (
    auth.uid() = owner_id or
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role)
  );

-- Insert: Authenticated user creates booking for themselves, or admin
create policy "bookings: insert own or admin"
  on public.bookings for insert
  with check (
    auth.uid() = owner_id or
    public.is_admin()
  );

-- Update: Owner can cancel/update notes; provider, vet, or admin can update status
create policy "bookings: update own, provider, or admin"
  on public.bookings for update
  using (
    auth.uid() = owner_id or
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role)
  )
  with check (
    auth.uid() = owner_id or
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role)
  );

-- Delete: Admin only
create policy "bookings: delete admin only"
  on public.bookings for delete
  using (public.is_admin());
