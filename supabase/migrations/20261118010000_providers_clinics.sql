-- ============================================================
-- DB-4: Providers, Clinics, Locations, Hours, and Services
-- Owner: zimia | Branch: zimia | Sprint: S2
-- Depends on: DB-1 (core schema, profiles, locations, user_roles)
--             DB-6 (RLS framework: has_role, is_admin)
--             DB-7 (services catalog, service_categories)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Providers
--    Any business offering pet services (clinics, hospitals, groomers, etc.)
-- ------------------------------------------------------------

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  type provider_type not null,
  name_bn text,
  name_en text,
  description_bn text,
  description_en text,
  logo_url text,
  phone text not null,
  whatsapp text,
  email text,
  website text,
  trade_license_no text,
  is_government boolean not null default false,
  verification verification_status not null default 'draft',
  verified_at timestamptz,
  rating_avg numeric(2,1) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint providers_has_name check (name_bn is not null or name_en is not null),
  constraint providers_rating_range check (rating_avg >= 0 and rating_avg <= 5)
);

create index if not exists providers_owner_idx on public.providers(owner_user_id);
create index if not exists providers_type_idx on public.providers(type);
create index if not exists providers_verification_idx on public.providers(verification);
create index if not exists providers_is_govt_idx on public.providers(is_government);

create trigger trg_providers_updated_at
  before update on public.providers
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 2. Provider Locations (Branches)
--    Physical locations for providers with PostGIS geography point
-- ------------------------------------------------------------

create table if not exists public.provider_locations (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  name_bn text,                      -- branch name, optional
  name_en text,
  address_bn text,
  address_en text,
  upazila_id integer references public.upazilas(id) on delete set null,
  location geography(Point, 4326) not null,
  phone text,
  is_24h boolean not null default false,
  has_emergency boolean not null default false,
  offers_home_visit boolean not null default false,
  home_visit_radius_km numeric(4,1),
  species_treated species_type[] not null default '{dog,cat}',
  photos text[] not null default '{}',
  cancel_cutoff_hours smallint not null default 2,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists provider_locations_location_gix on public.provider_locations using gist (location);
create index if not exists provider_locations_provider_idx on public.provider_locations (provider_id);
create index if not exists provider_locations_upazila_idx  on public.provider_locations (upazila_id);
create index if not exists provider_locations_active_idx   on public.provider_locations (is_active);

create trigger trg_provider_locations_updated_at
  before update on public.provider_locations
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 3. Location Operating Hours
-- ------------------------------------------------------------

create table if not exists public.location_hours (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.provider_locations(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),  -- 0 = Sunday
  open_time time not null,
  close_time time not null,
  constraint location_hours_uniq unique (location_id, weekday, open_time)
);

create index if not exists location_hours_location_idx on public.location_hours (location_id);
create index if not exists location_hours_weekday_idx on public.location_hours (weekday);

-- ------------------------------------------------------------
-- 4. Location Vets Link
--    Links clinics to vets practicing at that location
-- ------------------------------------------------------------

create table if not exists public.location_vets (
  location_id uuid references public.provider_locations(id) on delete cascade,
  vet_id uuid references public.vets(id) on delete cascade,
  primary key (location_id, vet_id)
);

create index if not exists location_vets_vet_idx on public.location_vets (vet_id);

-- ------------------------------------------------------------
-- 5. Provider Services
--    Links locations to catalog services with pricing and duration
-- ------------------------------------------------------------

create table if not exists public.provider_services (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.provider_locations(id) on delete cascade,
  service_id integer not null references public.services(id) on delete cascade,
  price numeric(10,2),
  price_max numeric(10,2),
  duration_min smallint,
  species species_type[],
  is_active boolean not null default true,
  constraint provider_services_uniq unique (location_id, service_id)
);

create index if not exists provider_services_location_idx on public.provider_services (location_id);
create index if not exists provider_services_service_idx on public.provider_services (service_id);
create index if not exists provider_services_active_idx on public.provider_services (is_active);

-- ------------------------------------------------------------
-- 6. Provider Verification Documents
-- ------------------------------------------------------------

create table if not exists public.provider_documents (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id) on delete cascade,
  vet_id uuid references public.vets(id) on delete cascade,
  doc_type text not null,            -- bvc_certificate, trade_license, nid
  file_path text not null,           -- storage bucket path
  status verification_status not null default 'draft',
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  constraint provider_documents_target_check check (provider_id is not null or vet_id is not null)
);

create index if not exists provider_documents_provider_idx on public.provider_documents (provider_id);
create index if not exists provider_documents_vet_idx on public.provider_documents (vet_id);
create index if not exists provider_documents_status_idx on public.provider_documents (status);

-- ------------------------------------------------------------
-- 7. Community Clinic Suggestions
-- ------------------------------------------------------------

create table if not exists public.clinic_suggestions (
  id uuid primary key default gen_random_uuid(),
  suggested_by uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text,
  address text,
  location geography(Point, 4326),
  status verification_status not null default 'draft',
  created_at timestamptz not null default now()
);

create index if not exists clinic_suggestions_user_idx on public.clinic_suggestions (suggested_by);
create index if not exists clinic_suggestions_status_idx on public.clinic_suggestions (status);

-- ------------------------------------------------------------
-- 8. Row Level Security Policies
-- ------------------------------------------------------------

alter table public.providers enable row level security;
alter table public.provider_locations enable row level security;
alter table public.location_hours enable row level security;
alter table public.location_vets enable row level security;
alter table public.provider_services enable row level security;
alter table public.provider_documents enable row level security;
alter table public.clinic_suggestions enable row level security;

-- Providers
create policy "providers: public read verified or own"
  on public.providers for select
  using (verification = 'verified' or owner_user_id = auth.uid() or public.is_admin());

create policy "providers: insert owner or admin"
  on public.providers for insert
  with check (owner_user_id = auth.uid() or public.is_admin());

create policy "providers: update owner or admin"
  on public.providers for update
  using (owner_user_id = auth.uid() or public.is_admin())
  with check (owner_user_id = auth.uid() or public.is_admin());

create policy "providers: delete owner or admin"
  on public.providers for delete
  using (owner_user_id = auth.uid() or public.is_admin());

-- Provider Locations
create policy "provider_locations: public read verified and active, or own"
  on public.provider_locations for select
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_locations.provider_id
        and (
          (p.verification = 'verified' and provider_locations.is_active = true)
          or p.owner_user_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "provider_locations: insert owner or admin"
  on public.provider_locations for insert
  with check (
    exists (
      select 1 from public.providers p
      where p.id = provider_locations.provider_id
        and (p.owner_user_id = auth.uid() or public.is_admin())
    )
  );

create policy "provider_locations: update owner or admin"
  on public.provider_locations for update
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_locations.provider_id
        and (p.owner_user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.providers p
      where p.id = provider_locations.provider_id
        and (p.owner_user_id = auth.uid() or public.is_admin())
    )
  );

create policy "provider_locations: delete owner or admin"
  on public.provider_locations for delete
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_locations.provider_id
        and (p.owner_user_id = auth.uid() or public.is_admin())
    )
  );

-- Location Hours
create policy "location_hours: read verified or own"
  on public.location_hours for select
  using (
    exists (
      select 1 from public.provider_locations pl
      join public.providers p on p.id = pl.provider_id
      where pl.id = location_hours.location_id
        and (p.verification = 'verified' or p.owner_user_id = auth.uid() or public.is_admin())
    )
  );

create policy "location_hours: write owner or admin"
  on public.location_hours for all
  using (
    exists (
      select 1 from public.provider_locations pl
      join public.providers p on p.id = pl.provider_id
      where pl.id = location_hours.location_id
        and (p.owner_user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.provider_locations pl
      join public.providers p on p.id = pl.provider_id
      where pl.id = location_hours.location_id
        and (p.owner_user_id = auth.uid() or public.is_admin())
    )
  );

-- Location Vets
create policy "location_vets: read verified or own"
  on public.location_vets for select
  using (
    exists (
      select 1 from public.provider_locations pl
      join public.providers p on p.id = pl.provider_id
      where pl.id = location_vets.location_id
        and (p.verification = 'verified' or p.owner_user_id = auth.uid() or public.is_admin())
    )
  );

create policy "location_vets: write owner or admin"
  on public.location_vets for all
  using (
    exists (
      select 1 from public.provider_locations pl
      join public.providers p on p.id = pl.provider_id
      where pl.id = location_vets.location_id
        and (p.owner_user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.provider_locations pl
      join public.providers p on p.id = pl.provider_id
      where pl.id = location_vets.location_id
        and (p.owner_user_id = auth.uid() or public.is_admin())
    )
  );

-- Provider Services
create policy "provider_services: read verified or own"
  on public.provider_services for select
  using (
    exists (
      select 1 from public.provider_locations pl
      join public.providers p on p.id = pl.provider_id
      where pl.id = provider_services.location_id
        and (
          (p.verification = 'verified' and provider_services.is_active = true)
          or p.owner_user_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "provider_services: write owner or admin"
  on public.provider_services for all
  using (
    exists (
      select 1 from public.provider_locations pl
      join public.providers p on p.id = pl.provider_id
      where pl.id = provider_services.location_id
        and (p.owner_user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.provider_locations pl
      join public.providers p on p.id = pl.provider_id
      where pl.id = provider_services.location_id
        and (p.owner_user_id = auth.uid() or public.is_admin())
    )
  );

-- Provider Documents
create policy "provider_documents: select owner or admin"
  on public.provider_documents for select
  using (
    (provider_id is not null and exists (
      select 1 from public.providers p where p.id = provider_documents.provider_id and p.owner_user_id = auth.uid()
    ))
    or
    (vet_id is not null and exists (
      select 1 from public.vets v where v.id = provider_documents.vet_id and v.user_id = auth.uid()
    ))
    or public.is_admin()
  );

create policy "provider_documents: insert owner or admin"
  on public.provider_documents for insert
  with check (
    (provider_id is not null and exists (
      select 1 from public.providers p where p.id = provider_documents.provider_id and p.owner_user_id = auth.uid()
    ))
    or
    (vet_id is not null and exists (
      select 1 from public.vets v where v.id = provider_documents.vet_id and v.user_id = auth.uid()
    ))
    or public.is_admin()
  );

create policy "provider_documents: admin update and delete"
  on public.provider_documents for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "provider_documents: admin delete"
  on public.provider_documents for delete
  using (public.is_admin());

-- Clinic Suggestions
create policy "clinic_suggestions: select own or admin"
  on public.clinic_suggestions for select
  using (suggested_by = auth.uid() or public.is_admin());

create policy "clinic_suggestions: insert authenticated"
  on public.clinic_suggestions for insert
  with check (auth.uid() is not null);

create policy "clinic_suggestions: admin write"
  on public.clinic_suggestions for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "clinic_suggestions: admin delete"
  on public.clinic_suggestions for delete
  using (public.is_admin());
