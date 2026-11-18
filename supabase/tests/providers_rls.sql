-- ============================================================
-- DB-4 pgTAP tests: providers, provider_locations, location_hours,
--                   location_vets, provider_services
-- Owner: zimia | Branch: zimia | Sprint: S2
-- ============================================================

begin;

select plan(24);

-- ── 1. Table existence ──────────────────────────────────────

select has_table('public', 'providers',
  'table public.providers exists');

select has_table('public', 'provider_locations',
  'table public.provider_locations exists');

select has_table('public', 'location_hours',
  'table public.location_hours exists');

select has_table('public', 'location_vets',
  'table public.location_vets exists');

select has_table('public', 'provider_services',
  'table public.provider_services exists');

select has_table('public', 'provider_documents',
  'table public.provider_documents exists');

select has_table('public', 'clinic_suggestions',
  'table public.clinic_suggestions exists');

-- ── 2. Column & constraint tests ────────────────────────────

select has_column('public', 'providers', 'owner_user_id',
  'providers has owner_user_id column');

select has_column('public', 'providers', 'type',
  'providers has type column');

select has_column('public', 'providers', 'verification',
  'providers has verification column');

select has_column('public', 'provider_locations', 'location',
  'provider_locations has PostGIS location column');

select has_column('public', 'provider_locations', 'is_24h',
  'provider_locations has is_24h column');

select has_column('public', 'provider_locations', 'has_emergency',
  'provider_locations has has_emergency column');

select has_column('public', 'provider_locations', 'offers_home_visit',
  'provider_locations has offers_home_visit column');

select has_column('public', 'location_hours', 'weekday',
  'location_hours has weekday column');

select has_column('public', 'provider_services', 'price',
  'provider_services has price column');

-- ── 3. Row Level Security Enabled ───────────────────────────

select table_privs_are(
  'public', 'providers', 'anon',
  array['SELECT'],
  'anon can only select from providers'
);

-- ── 4. Functionality & RLS isolation tests ──────────────────

-- Setup test users
insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'owner1@pranora.bd'),
  ('22222222-2222-2222-2222-222222222222', 'owner2@pranora.bd')
on conflict do nothing;

insert into public.profiles (id, full_name_en, preferred_locale)
values
  ('11111111-1111-1111-1111-111111111111', 'Provider Owner One', 'en'),
  ('22222222-2222-2222-2222-222222222222', 'Provider Owner Two', 'en')
on conflict do nothing;

-- Create test providers
insert into public.providers (
  id, owner_user_id, type, name_en, phone, verification
) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'vet_clinic', 'Verified Clinic', '+8801700000001', 'verified'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'vet_clinic', 'Draft Clinic', '+8801700000002', 'draft');

-- Create test provider location
insert into public.provider_locations (
  id, provider_id, name_en, location, is_active
) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Main Branch', st_setsrid(st_makepoint(90.4125, 23.8103), 4326), true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Draft Branch', st_setsrid(st_makepoint(90.4125, 23.8103), 4326), true);

-- Test Anon / Public Access
set local role anon;

select results_eq(
  'select count(*)::int from public.providers',
  array[1],
  'Anon sees only verified providers (1 of 2)'
);

select results_eq(
  'select name_en from public.providers',
  array['Verified Clinic'],
  'Anon sees the verified clinic by name'
);

select results_eq(
  'select count(*)::int from public.provider_locations',
  array[1],
  'Anon sees only locations of verified providers'
);

-- Test Owner 2 Access (Draft Clinic owner)
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222"}';

select results_eq(
  'select count(*)::int from public.providers',
  array[2],
  'Owner 2 sees verified providers plus their own draft provider'
);

select ok(
  exists(select 1 from public.providers where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  'Owner 2 can access their own draft provider'
);

select results_eq(
  'select count(*)::int from public.provider_locations where provider_id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
  array[1],
  'Owner 2 can access their own draft provider location'
);

select * from finish();

rollback;
