-- ============================================================
-- MAP-SEED pgTAP tests: providers, provider_locations,
--                       location_hours, location_vets, provider_services
-- Owner: zimia | Branch: zimia | Sprint: S3
-- Run with: pnpm db:test  (or supabase test db locally)
-- ============================================================

begin;

select plan(26);

-- ── 1. Table existence ───────────────────────────────────────

select has_table('public', 'providers',
  'table public.providers exists');

select has_table('public', 'provider_locations',
  'table public.provider_locations exists');

select has_table('public', 'location_hours',
  'table public.location_hours exists');

select has_table('public', 'vets',
  'table public.vets exists');

select has_table('public', 'location_vets',
  'table public.location_vets exists');

select has_table('public', 'provider_services',
  'table public.provider_services exists');

-- ── 2. Provider seed counts ─────────────────────────────────

select results_ge(
  'select count(*)::int from public.providers',
  array[7],
  'at least 7 providers seeded'
);

select results_ge(
  'select count(*)::int from public.providers where is_government = true',
  array[3],
  'at least 3 government vet hospitals seeded'
);

select results_ge(
  'select count(*)::int from public.providers where is_government = false',
  array[4],
  'at least 4 private vet clinics seeded'
);

-- ── 3. Expected clinics exist ───────────────────────────────

select ok(
  exists(select 1 from public.providers where name_en = 'Central Veterinary Hospital (CVH)'),
  'Central Veterinary Hospital (CVH) seeded'
);

select ok(
  exists(select 1 from public.providers where name_en = 'Care Pet Clinic & Hospital'),
  'Care Pet Clinic & Hospital seeded'
);

select ok(
  exists(select 1 from public.providers where name_en = 'Gulshan Animal Hospital'),
  'Gulshan Animal Hospital seeded'
);

select ok(
  exists(select 1 from public.providers where name_en = 'Uttara Pet Care & Surgery Centre'),
  'Uttara Pet Care & Surgery Centre seeded'
);

select ok(
  exists(select 1 from public.providers where name_en = 'PAW Life Care Pet Clinic'),
  'PAW Life Care Pet Clinic seeded'
);

select ok(
  exists(select 1 from public.providers where name_en = 'Upazila Livestock Office & Vet Hospital, Savar'),
  'Savar DLS Hospital seeded'
);

select ok(
  exists(select 1 from public.providers where name_en = 'District Veterinary Hospital, Chattogram'),
  'Chattogram District Hospital seeded'
);

-- ── 4. Provider locations and PostGIS points ─────────────────

select results_ge(
  'select count(*)::int from public.provider_locations',
  array[7],
  'at least 7 provider locations seeded'
);

select results_eq(
  'select count(*)::int from public.provider_locations where location is null',
  array[0],
  'all provider locations have valid PostGIS geography points'
);

select results_ge(
  'select count(*)::int from public.provider_locations where is_24h = true',
  array[4],
  'at least 4 24/7 clinic locations seeded'
);

select results_ge(
  'select count(*)::int from public.provider_locations where has_emergency = true',
  array[6],
  'at least 6 emergency-ready clinic locations seeded'
);

select results_ge(
  'select count(*)::int from public.provider_locations where offers_home_visit = true',
  array[3],
  'at least 3 clinic locations offering home visits seeded'
);

-- ── 5. Licensed Vets & Links ────────────────────────────────

select results_ge(
  'select count(*)::int from public.vets where bvc_reg_no is not null and verification = ''verified''',
  array[4],
  'at least 4 verified licensed BVC vets seeded'
);

select ok(
  exists(select 1 from public.vets where bvc_reg_no = 'BVC-2481'),
  'Dr. Md. Tanvir Ahmed (BVC-2481) seeded'
);

select ok(
  exists(select 1 from public.vets where bvc_reg_no = 'BVC-3192'),
  'Dr. Sabrina Yasmin (BVC-3192) seeded'
);

select results_ge(
  'select count(*)::int from public.location_vets',
  array[6],
  'at least 6 clinic-vet associations seeded'
);

-- ── 6. Services & Pricing ───────────────────────────────────

select results_ge(
  'select count(*)::int from public.provider_services where is_active = true',
  array[15],
  'at least 15 active provider service offerings seeded'
);

select * from finish();

rollback;
