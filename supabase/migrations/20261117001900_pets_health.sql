-- ============================================================
-- DB-3: Pets, breeds, ownership history, health tables,
--       pet_documents
-- Owner: zihad | Branch: zihad | Sprint: S2
-- Depends on: DB-1 (enums, profiles, locations, set_updated_at)
--             DB-6 (has_role / is_admin helpers, pgTAP harness)
-- ============================================================

-- ============================================================
-- 1. BREEDS
--    Static catalog seeded in DB-7; owners may add free-text
--    via pets.breed_other when breed_id is null.
-- ============================================================

create table public.breeds (
  id        serial primary key,
  species   species_type not null,
  name_bn   text,
  name_en   text not null,
  constraint breeds_has_name check (name_bn is not null or name_en is not null)
);

-- Public read; admin-only write (admin policies live in DB-6 framework)
alter table public.breeds enable row level security;

create policy "breeds: public read"
  on public.breeds for select
  using (true);

create policy "breeds: admin write"
  on public.breeds for all
  using (public.is_admin())
  with check (public.is_admin());

create index breeds_species_idx on public.breeds (species);

-- ============================================================
-- 2. PETS
--    One profile for life (PET-5): owner_id changes on
--    adoption/rescue-intake; records (vaccinations,
--    medical_records) stay attached to the pet.
--
--    shelter_id & rescue_case_id are forward-FK stubs —
--    added as nullable text columns here, converted to real
--    FKs in DB-8 (rescue) / DB-4 (providers) migrations per
--    schedule.md merge order.
-- ============================================================

create table public.pets (
  id              uuid primary key default gen_random_uuid(),
  -- Current owner / custodian (rescuer or shelter while in transit)
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  -- Forward-FK stubs (nullable; upgraded to real FK by DB-4 & DB-8)
  shelter_id      uuid,            -- set while a shelter holds the animal
  rescue_case_id  uuid,            -- links this profile to a rescue case

  name            text not null,
  species         species_type not null,
  breed_id        integer references public.breeds(id),
  breed_other     text,            -- free text when breed_id is null
  gender          pet_gender not null default 'unknown',
  date_of_birth   date,
  birth_approx    boolean not null default false,  -- approximate DOB flag
  weight_kg       numeric(5,2),
  color           text,
  photo_url       text,
  microchip_no    text,
  is_neutered     boolean,
  allergies       text,
  notes           text,
  -- QR ID card slug (lost-pet use case); generated on first request
  public_qr_slug  text unique,

  deleted_at      timestamptz,     -- soft-delete
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_pets_updated_at
  before update on public.pets
  for each row execute function public.set_updated_at();

-- Performance indexes
create index pets_owner_idx   on public.pets (owner_id) where deleted_at is null;
create index pets_species_idx on public.pets (species)  where deleted_at is null;
create index pets_qr_idx      on public.pets (public_qr_slug) where public_qr_slug is not null;

-- ── RLS ──────────────────────────────────────────────────────
alter table public.pets enable row level security;

-- Owner can CRUD their own active pets
create policy "pets: owner manages own"
  on public.pets for all
  using (auth.uid() = owner_id and deleted_at is null)
  with check (auth.uid() = owner_id);

-- Authenticated users can read non-deleted pets (needed for adoption/rescue flows)
create policy "pets: authenticated read active"
  on public.pets for select
  using (auth.role() = 'authenticated' and deleted_at is null);

-- Admins have full access
create policy "pets: admin all"
  on public.pets for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 3. PET WEIGHTS LOG
-- ============================================================

create table public.pet_weights (
  id          uuid primary key default gen_random_uuid(),
  pet_id      uuid not null references public.pets(id) on delete cascade,
  weight_kg   numeric(5,2) not null check (weight_kg > 0),
  measured_on date not null default current_date,
  created_at  timestamptz not null default now()
);

alter table public.pet_weights enable row level security;

create policy "pet_weights: owner manages via pet"
  on public.pet_weights for all
  using (
    exists (
      select 1 from public.pets p
      where p.id = pet_id and p.owner_id = auth.uid() and p.deleted_at is null
    )
  )
  with check (
    exists (
      select 1 from public.pets p
      where p.id = pet_id and p.owner_id = auth.uid() and p.deleted_at is null
    )
  );

create policy "pet_weights: admin all"
  on public.pet_weights for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 4. PET OWNERSHIP HISTORY
--    Append-only audit trail. Written by:
--      • initial registration (reason = 'registered')
--      • rescue intake      (reason = 'rescue_intake') — DB-8
--      • adoption handover  (reason = 'adoption')     — ADP-6
--      • admin transfer     (reason = 'admin_transfer')
--    Never directly editable by users.
-- ============================================================

create table public.pet_ownership_history (
  id          uuid primary key default gen_random_uuid(),
  pet_id      uuid not null references public.pets(id) on delete cascade,
  from_user_id uuid references public.profiles(id),  -- null on first registration
  to_user_id  uuid not null references public.profiles(id),
  reason      text not null,
  constraint ownership_reason_valid check (
    reason in ('registered', 'rescue_intake', 'adoption', 'admin_transfer')
  ),
  note        text,
  created_at  timestamptz not null default now()
);

create index pet_ownership_pet_idx on public.pet_ownership_history (pet_id, created_at desc);

alter table public.pet_ownership_history enable row level security;

-- Pet owner reads their animal's history
create policy "pet_ownership_history: owner reads via pet"
  on public.pet_ownership_history for select
  using (
    exists (
      select 1 from public.pets p
      where p.id = pet_id and p.owner_id = auth.uid()
    )
  );

-- Only database functions / service-role may insert (enforced at app layer)
create policy "pet_ownership_history: admin all"
  on public.pet_ownership_history for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Function: register_pet ────────────────────────────────────
-- Called once after a pet is first created to log the initial owner.
create or replace function public.register_pet_ownership(p_pet_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
begin
  select owner_id into v_owner_id from public.pets where id = p_pet_id;
  if v_owner_id is null then
    raise exception 'pet not found: %', p_pet_id;
  end if;

  insert into public.pet_ownership_history (pet_id, from_user_id, to_user_id, reason)
  values (p_pet_id, null, v_owner_id, 'registered');
end;
$$;

grant execute on function public.register_pet_ownership(uuid) to authenticated;

-- ============================================================
-- 5. VACCINE TEMPLATES
--    Species-specific standard vaccine schedules.
--    Seeded in DB-7. Read-only for owners.
-- ============================================================

create table public.vaccine_templates (
  id                    serial primary key,
  species               species_type not null,
  name_bn               text not null,
  name_en               text not null,
  first_dose_age_weeks  smallint not null,
  repeat_every_days     integer,     -- null = single-dose vaccine
  doses                 smallint not null default 1
);

alter table public.vaccine_templates enable row level security;

create policy "vaccine_templates: public read"
  on public.vaccine_templates for select
  using (true);

create policy "vaccine_templates: admin write"
  on public.vaccine_templates for all
  using (public.is_admin())
  with check (public.is_admin());

create index vaccine_templates_species_idx on public.vaccine_templates (species);

-- ============================================================
-- 6. VACCINATIONS
--    Both scheduled (due_date set, given_date null) and
--    historical records (given_date set).
--    Forward-FK to bookings.id added after DB-5 merges.
-- ============================================================

create table public.vaccinations (
  id               uuid primary key default gen_random_uuid(),
  pet_id           uuid not null references public.pets(id) on delete cascade,
  template_id      integer references public.vaccine_templates(id),
  name             text not null,     -- denormalised display name
  due_date         date,
  given_date       date,
  given_by_vet_id  uuid references public.vets(id),
  batch_no         text,
  -- booking_id FK stub — will be added as proper FK constraint when
  -- bookings table is created in DB-5; kept as nullable uuid here.
  booking_id       uuid,
  certificate_path text,              -- private bucket path
  created_at       timestamptz not null default now(),
  constraint vaccination_has_date check (due_date is not null or given_date is not null)
);

create index vaccinations_pet_idx      on public.vaccinations (pet_id);
create index vaccinations_due_idx      on public.vaccinations (due_date) where given_date is null;
create index vaccinations_overdue_idx  on public.vaccinations (due_date)
  where given_date is null and due_date < current_date;

alter table public.vaccinations enable row level security;

-- Pet owner reads/manages their own pet's vaccinations
create policy "vaccinations: owner manages via pet"
  on public.vaccinations for all
  using (
    exists (
      select 1 from public.pets p
      where p.id = pet_id and p.owner_id = auth.uid() and p.deleted_at is null
    )
  )
  with check (
    exists (
      select 1 from public.pets p
      where p.id = pet_id and p.owner_id = auth.uid() and p.deleted_at is null
    )
  );

-- Authenticated vets can insert/update (record given vaccinations)
create policy "vaccinations: vet insert"
  on public.vaccinations for insert
  with check (public.has_role('vet'));

create policy "vaccinations: vet update given"
  on public.vaccinations for update
  using (public.has_role('vet'));

create policy "vaccinations: admin all"
  on public.vaccinations for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Function: generate_vaccine_schedule ──────────────────────
-- Given a pet and a template, inserts the upcoming due-date rows.
-- Called from application layer (Edge Function or trigger) after PET-1.
create or replace function public.generate_vaccine_schedule(
  p_pet_id      uuid,
  p_template_id integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pet         record;
  v_tmpl        record;
  v_first_due   date;
  i             integer;
begin
  select * into v_pet  from public.pets             where id = p_pet_id;
  select * into v_tmpl from public.vaccine_templates where id = p_template_id;

  if v_pet.id is null then
    raise exception 'pet not found: %', p_pet_id;
  end if;
  if v_tmpl.id is null then
    raise exception 'vaccine_template not found: %', p_template_id;
  end if;

  -- Compute first due date from date_of_birth; fall back to today
  v_first_due := coalesce(v_pet.date_of_birth, current_date)
                 + (v_tmpl.first_dose_age_weeks * 7);

  for i in 1 .. v_tmpl.doses loop
    insert into public.vaccinations (pet_id, template_id, name, due_date)
    values (
      p_pet_id,
      p_template_id,
      v_tmpl.name_bn,   -- display name; app layer picks locale via pickLocale()
      v_first_due + ((i - 1) * coalesce(v_tmpl.repeat_every_days, 0))
    )
    on conflict do nothing;
  end loop;
end;
$$;

grant execute on function public.generate_vaccine_schedule(uuid, integer) to authenticated;

-- ============================================================
-- 7. MEDICAL RECORDS
--    Written ONLY by vets (enforced by RLS).
--    Owners and admins may read.
--    rescue_case_id is a nullable stub; real FK added in DB-8.
-- ============================================================

create table public.medical_records (
  id              uuid primary key default gen_random_uuid(),
  pet_id          uuid not null references public.pets(id) on delete cascade,
  -- booking_id stub (real FK after DB-5)
  booking_id      uuid,
  -- rescue_case_id stub (real FK after DB-8)
  rescue_case_id  uuid,
  vet_id          uuid not null references public.vets(id),
  visit_date      date not null default current_date,
  findings        text,         -- physical examination notes
  diagnosis       text,
  treatment       text,         -- what was done during the visit
  notes           text,
  attachments     text[] not null default '{}',  -- private bucket paths
  created_by      uuid not null references public.profiles(id),
  created_at      timestamptz not null default now()
);

create index medical_records_pet_idx  on public.medical_records (pet_id, visit_date desc);
create index medical_records_vet_idx  on public.medical_records (vet_id);

alter table public.medical_records enable row level security;

-- Owners read their pet's records
create policy "medical_records: owner reads via pet"
  on public.medical_records for select
  using (
    exists (
      select 1 from public.pets p
      where p.id = pet_id and p.owner_id = auth.uid()
    )
  );

-- Vets who created the record can update it
create policy "medical_records: vet manages own"
  on public.medical_records for all
  using (public.has_role('vet') and created_by = auth.uid())
  with check (public.has_role('vet') and created_by = auth.uid());

-- Any verified vet can insert a new record
create policy "medical_records: vet insert"
  on public.medical_records for insert
  with check (public.has_role('vet') and created_by = auth.uid());

create policy "medical_records: admin all"
  on public.medical_records for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 8. PRESCRIPTIONS
--    Child of medical_records; vet-only write.
-- ============================================================

create table public.prescriptions (
  id                uuid primary key default gen_random_uuid(),
  medical_record_id uuid not null references public.medical_records(id) on delete cascade,
  medicine          text not null,
  dosage            text,
  frequency         text,
  duration_days     smallint,
  instructions      text
);

alter table public.prescriptions enable row level security;

-- Readable by pet owner (via medical_records → pet → owner)
create policy "prescriptions: owner reads via record"
  on public.prescriptions for select
  using (
    exists (
      select 1
      from public.medical_records mr
      join public.pets p on p.id = mr.pet_id
      where mr.id = medical_record_id and p.owner_id = auth.uid()
    )
  );

create policy "prescriptions: vet manages via record"
  on public.prescriptions for all
  using (
    exists (
      select 1
      from public.medical_records mr
      where mr.id = medical_record_id
        and mr.created_by = auth.uid()
        and public.has_role('vet')
    )
  )
  with check (
    exists (
      select 1
      from public.medical_records mr
      where mr.id = medical_record_id
        and mr.created_by = auth.uid()
        and public.has_role('vet')
    )
  );

create policy "prescriptions: admin all"
  on public.prescriptions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 9. PET DOCUMENTS
--    Owner-uploaded files (old reports, lab results).
--    Stored in private 'medical' bucket; never mixed with
--    vet-written medical_records in the UI (docs/rules.md §7).
-- ============================================================

create table public.pet_documents (
  id            uuid primary key default gen_random_uuid(),
  pet_id        uuid not null references public.pets(id) on delete cascade,
  uploaded_by   uuid not null references public.profiles(id),
  title         text,
  file_path     text not null,     -- private 'medical' bucket path
  document_date date,
  created_at    timestamptz not null default now()
);

create index pet_documents_pet_idx on public.pet_documents (pet_id, created_at desc);

alter table public.pet_documents enable row level security;

create policy "pet_documents: owner manages own"
  on public.pet_documents for all
  using (auth.uid() = uploaded_by)
  with check (auth.uid() = uploaded_by);

-- Vets attending a pet can read its documents
create policy "pet_documents: vet reads"
  on public.pet_documents for select
  using (public.has_role('vet'));

create policy "pet_documents: admin all"
  on public.pet_documents for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 10. REMINDERS
--     Owned by the pet owner; driven by pg_cron (HLT-2, P1).
--     The remind_at index is partial (is_done = false) so
--     cron queries stay fast as the table grows.
-- ============================================================

create table public.reminders (
  id             uuid primary key default gen_random_uuid(),
  pet_id         uuid not null references public.pets(id) on delete cascade,
  owner_id       uuid not null references public.profiles(id) on delete cascade,
  type           reminder_type not null,
  title          text not null,
  remind_at      timestamptz not null,
  repeat_days    integer,            -- null = one-shot
  vaccination_id uuid references public.vaccinations(id) on delete set null,
  is_done        boolean not null default false,
  last_sent_at   timestamptz,
  created_at     timestamptz not null default now()
);

create index reminders_due_idx    on public.reminders (remind_at) where is_done = false;
create index reminders_owner_idx  on public.reminders (owner_id);

alter table public.reminders enable row level security;

create policy "reminders: owner manages own"
  on public.reminders for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "reminders: admin all"
  on public.reminders for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 11. VETS TABLE
--     Created here (in Zihad's migration) as a stub because
--     vaccinations and medical_records FK to it.
--     The full provider/location data is Zimia's DB-4.
--     DB-4 must NOT re-create this table; it only adds the
--     location_vets join table and provider-side columns.
-- ============================================================

create table public.vets (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid unique references public.profiles(id),
  full_name_bn        text,
  full_name_en        text not null,
  bvc_reg_no          text unique,       -- Bangladesh Veterinary Council reg no
  degrees             text,              -- DVM, MS …
  specialization      text,
  experience_years    smallint,
  photo_url           text,
  consultation_fee    numeric(10,2),
  online_consult      boolean not null default false,
  verification        verification_status not null default 'draft',
  created_at          timestamptz not null default now(),
  constraint vets_has_name check (full_name_bn is not null or full_name_en is not null)
);

create index vets_user_idx on public.vets (user_id);

alter table public.vets enable row level security;

-- Public read of verified vets
create policy "vets: public read verified"
  on public.vets for select
  using (verification = 'verified');

-- Authenticated read own vet record
create policy "vets: vet reads own"
  on public.vets for select
  using (auth.uid() = user_id);

-- Admin full access
create policy "vets: admin all"
  on public.vets for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 12. pgTAP TESTS
-- ============================================================

do $pgtap_tests$
begin

  -- Only run when pgtap extension is present (CI environment)
  if not exists (
    select 1 from pg_extension where extname = 'pgtap'
  ) then
    raise notice 'pgtap not installed — skipping DB-3 tests';
    return;
  end if;

  -- Delegate to pgtap test file (run via `supabase test db`)
  raise notice 'DB-3 pgtap tests: run tests/pets_health_*.sql via supabase test db';

end;
$pgtap_tests$;

-- ============================================================
-- Done: DB-3
-- Next:  DB-7 seed vaccines + services  (Zihad, S3)
--        DB-4 providers / map tables    (Zimia, S2 — creates provider_locations
--             which then receives the shelter_id FK on pets)
--        DB-8 rescue tables             (Brehat, S2 — receives rescue_case_id FK on pets)
-- Note:  DB-4 & DB-8 must add the real FK constraints on pets
--        for shelter_id and rescue_case_id respectively, since
--        those tables don't exist yet.
-- ============================================================
