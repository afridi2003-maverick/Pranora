-- ============================================================
-- MAP-1 pgTAP tests: is_location_open, nearby_clinics
-- Owner: zimia | Branch: zimia | Sprint: S2
-- ============================================================

begin;

select plan(18);

-- ── 1. Function existence ────────────────────────────────────

select has_function('public', 'is_location_open', array['uuid', 'timestamp with time zone'],
  'function is_location_open(uuid, timestamptz) exists');

select has_function('public', 'nearby_clinics', array[
  'double precision', 'double precision', 'integer', 'boolean', 'boolean', 'boolean',
  'species_type', 'text', 'numeric', 'provider_type[]', 'integer'
], 'function nearby_clinics exists with full parameter signature');

-- ── 2. Test Data Setup ──────────────────────────────────────

-- Test profile
insert into public.profiles (id, full_name_en, preferred_locale)
values ('99999999-9999-9999-9999-999999999999', 'Map Test Owner', 'en')
on conflict do nothing;

-- Verified Provider
insert into public.providers (
  id, owner_user_id, type, name_en, phone, verification
) values (
  '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '99999999-9999-9999-9999-999999999999',
  'vet_clinic',
  'Dhanmondi Pet Clinic',
  '+8801700000001',
  'verified'
);

-- Unverified Provider (should NOT appear in nearby_clinics)
insert into public.providers (
  id, owner_user_id, type, name_en, phone, verification
) values (
  '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '99999999-9999-9999-9999-999999999999',
  'vet_clinic',
  'Draft Pet Hospital',
  '+8801700000002',
  'draft'
);

-- Location 1: 24/7 emergency clinic in Dhanmondi (~1 km from test origin)
-- Origin: 23.7465, 90.3760 (Dhanmondi 27)
insert into public.provider_locations (
  id, provider_id, name_en, location, is_24h, has_emergency, offers_home_visit, species_treated, is_active
) values (
  'aaaaaaaa-1111-1111-1111-111111111111',
  '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Dhanmondi Branch',
  st_setsrid(st_makepoint(90.3750, 23.7450), 4326),
  true,
  true,
  true,
  array['dog', 'cat']::species_type[],
  true
);

-- Location 2: Scheduled clinic in Gulshan (~7 km from test origin)
-- Lat: 23.7925, Lng: 90.4078
insert into public.provider_locations (
  id, provider_id, name_en, location, is_24h, has_emergency, offers_home_visit, species_treated, is_active
) values (
  'bbbbbbbb-2222-2222-2222-222222222222',
  '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Gulshan Branch',
  st_setsrid(st_makepoint(90.4078, 23.7925), 4326),
  false,
  false,
  false,
  array['dog', 'cat', 'bird']::species_type[],
  true
);

-- Hours for Location 2: Wednesday (dow=3) 10:00 to 18:00
insert into public.location_hours (
  location_id, weekday, open_time, close_time
) values (
  'bbbbbbbb-2222-2222-2222-222222222222',
  3,
  '10:00:00',
  '18:00:00'
);

-- Hours for Location 2: Overnight shift Friday (dow=5) 20:00 to 04:00 (Saturday morning)
insert into public.location_hours (
  location_id, weekday, open_time, close_time
) values (
  'bbbbbbbb-2222-2222-2222-222222222222',
  5,
  '20:00:00',
  '04:00:00'
);

-- ── 3. Test is_location_open ────────────────────────────────

-- 24/7 clinic is always open
select is(
  public.is_location_open('aaaaaaaa-1111-1111-1111-111111111111', '2026-11-18 03:00:00+06'::timestamptz),
  true,
  '24h location is open at 3 AM'
);

select is(
  public.is_location_open('aaaaaaaa-1111-1111-1111-111111111111', '2026-11-18 14:00:00+06'::timestamptz),
  true,
  '24h location is open at 2 PM'
);

-- Scheduled clinic on Wednesday (2026-11-18 is Wednesday)
select is(
  public.is_location_open('bbbbbbbb-2222-2222-2222-222222222222', '2026-11-18 14:00:00+06'::timestamptz),
  true,
  'Scheduled clinic is open on Wednesday at 2 PM (window 10:00-18:00)'
);

select is(
  public.is_location_open('bbbbbbbb-2222-2222-2222-222222222222', '2026-11-18 09:00:00+06'::timestamptz),
  false,
  'Scheduled clinic is closed on Wednesday before 10 AM'
);

select is(
  public.is_location_open('bbbbbbbb-2222-2222-2222-222222222222', '2026-11-18 19:00:00+06'::timestamptz),
  false,
  'Scheduled clinic is closed on Wednesday after 6 PM'
);

-- Overnight shift test (Friday 2026-11-20 20:00 to Saturday 2026-11-21 04:00)
select is(
  public.is_location_open('bbbbbbbb-2222-2222-2222-222222222222', '2026-11-20 22:00:00+06'::timestamptz),
  true,
  'Overnight shift is open Friday night at 10 PM'
);

select is(
  public.is_location_open('bbbbbbbb-2222-2222-2222-222222222222', '2026-11-21 02:30:00+06'::timestamptz),
  true,
  'Overnight shift is open Saturday early morning at 2:30 AM'
);

select is(
  public.is_location_open('bbbbbbbb-2222-2222-2222-222222222222', '2026-11-21 05:00:00+06'::timestamptz),
  false,
  'Overnight shift is closed Saturday morning after 4 AM'
);

-- ── 4. Test nearby_clinics ──────────────────────────────────

-- Origin: 23.7465, 90.3760 (Dhanmondi)
-- Within 3000m radius -> only Dhanmondi branch (~180m away)
select results_eq(
  'select count(*)::int from public.nearby_clinics(23.7465, 90.3760, 3000)',
  array[1],
  'Within 3km returns only the Dhanmondi location'
);

-- Within 15000m radius -> both Dhanmondi and Gulshan locations
select results_eq(
  'select count(*)::int from public.nearby_clinics(23.7465, 90.3760, 15000)',
  array[2],
  'Within 15km returns both locations'
);

-- Sorting check: Nearest first (Dhanmondi first, then Gulshan)
select results_eq(
  'select location_id from public.nearby_clinics(23.7465, 90.3760, 15000) limit 1',
  array['aaaaaaaa-1111-1111-1111-111111111111'::uuid],
  'Nearest location (Dhanmondi) is returned first'
);

-- Emergency filter: only Location 1 has emergency/24h
select results_eq(
  'select count(*)::int from public.nearby_clinics(23.7465, 90.3760, 15000, false, true)',
  array[1],
  'Emergency filter returns only the emergency-equipped location'
);

-- Home visit filter: only Location 1 offers home visit
select results_eq(
  'select count(*)::int from public.nearby_clinics(23.7465, 90.3760, 15000, false, false, true)',
  array[1],
  'Home visit filter returns only the home visit provider'
);

-- Species filter: only Location 2 treats bird
select results_eq(
  'select count(*)::int from public.nearby_clinics(23.7465, 90.3760, 15000, false, false, false, ''bird''::species_type)',
  array[1],
  'Species filter for bird returns only Location 2'
);

-- Limit parameter check
select results_eq(
  'select count(*)::int from public.nearby_clinics(23.7465, 90.3760, 15000, false, false, false, null, null, null, array[''vet_clinic'']::provider_type[], 1)',
  array[1],
  'Limit 1 restricts results to 1 row'
);

select * from finish();

rollback;
