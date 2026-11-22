-- ============================================================
-- APT-1a pgTAP tests: available_slots, create_booking,
--                    cancel_booking, reschedule_booking
-- Owner: tain | Branch: tain | Sprint: S2
-- ============================================================

begin;

select plan(16);

-- ── 1. Function Existence Checks ──────────────────────────────

select has_function('public', 'available_slots', array['uuid', 'uuid', 'date'],
  'function available_slots(uuid, uuid, date) exists');

select has_function('public', 'create_booking', array[
  'uuid', 'uuid', 'booking_type', 'uuid', 'uuid', 'timestamp with time zone',
  'timestamp with time zone', 'smallint', 'uuid', 'text', 'text[]', 'payment_method'
], 'function create_booking exists with full parameter signature');

select has_function('public', 'cancel_booking', array['uuid', 'text'],
  'function cancel_booking(uuid, text) exists');

select has_function('public', 'reschedule_booking', array[
  'uuid', 'timestamp with time zone', 'timestamp with time zone', 'smallint', 'text'
], 'function reschedule_booking exists');

-- ── 2. Test Fixture Setup ─────────────────────────────────────

-- Test Profile
insert into public.profiles (id, full_name_en, preferred_locale)
values ('b0000000-0000-0000-0000-000000000001', 'Booking Test Client', 'en')
on conflict (id) do nothing;

-- Test Provider
insert into public.providers (
  id, owner_user_id, type, name_en, phone, verification
) values (
  'b1111111-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'vet_clinic',
  'Central Dhaka Pet Care',
  '+8801700000099',
  'verified'
) on conflict (id) do nothing;

-- Test Location
insert into public.provider_locations (
  id, provider_id, name_en, location, is_24h, cancel_cutoff_hours, is_active
) values (
  'b2222222-0000-0000-0000-000000000001',
  'b1111111-0000-0000-0000-000000000001',
  'Dhanmondi Central',
  st_setsrid(st_makepoint(90.3750, 23.7450), 4326),
  false,
  2,
  true
) on conflict (id) do nothing;

-- Test Vet
insert into public.vets (
  id, full_name_en, bvc_reg_no, verification
) values (
  'b3333333-0000-0000-0000-000000000001',
  'Dr. Tain Test Vet',
  'BVC-TEST-999',
  'verified'
) on conflict (id) do nothing;

-- Link vet to location
insert into public.location_vets (location_id, vet_id)
values (
  'b2222222-0000-0000-0000-000000000001',
  'b3333333-0000-0000-0000-000000000001'
) on conflict do nothing;

-- Ensure base catalog service exists
insert into public.services (id, slug, name_bn, name_en, category_id, is_active)
values (99, 'test-general-checkup', 'সাধারণ পরীক্ষা', 'General Checkup', 1, true)
on conflict (id) do nothing;

-- Test Provider Service
insert into public.provider_services (
  id, location_id, service_id, price, duration_min, is_active
) values (
  'b4444444-0000-0000-0000-000000000001',
  'b2222222-0000-0000-0000-000000000001',
  99,
  500.00,
  20,
  true
) on conflict (id) do nothing;

-- Rule 1: Slot schedule on Sundays (weekday 0: 09:00 to 12:00, 20-min slots, cap 1)
insert into public.availability_rules (
  id, location_id, vet_id, weekday, start_time, end_time, mode, slot_minutes, capacity
) values (
  'b5555555-0000-0000-0000-000000000001',
  'b2222222-0000-0000-0000-000000000001',
  'b3333333-0000-0000-0000-000000000001',
  0,
  '09:00:00',
  '12:00:00',
  'slot',
  20,
  1
) on conflict (id) do nothing;

-- Rule 2: Serial schedule on Mondays (weekday 1: 17:00 to 20:00, max 20 serials)
insert into public.availability_rules (
  id, location_id, vet_id, weekday, start_time, end_time, mode, max_serials
) values (
  'b5555555-0000-0000-0000-000000000002',
  'b2222222-0000-0000-0000-000000000001',
  'b3333333-0000-0000-0000-000000000001',
  1,
  '17:00:00',
  '20:00:00',
  'serial',
  20
) on conflict (id) do nothing;

-- Exception: Closed on 2026-11-22 (a Sunday)
insert into public.availability_exceptions (
  location_id, vet_id, date, is_closed, note
) values (
  'b2222222-0000-0000-0000-000000000001',
  'b3333333-0000-0000-0000-000000000001',
  '2026-11-22',
  true,
  'Special Holiday'
);

-- ── 3. available_slots Execution Tests ────────────────────────

-- Test 5: Exception closure check
select is(
  (public.available_slots(
    'b2222222-0000-0000-0000-000000000001',
    'b3333333-0000-0000-0000-000000000001',
    '2026-11-22'::date
  )->>'isClosed')::boolean,
  true,
  'available_slots returns isClosed = true for dates with closure exception'
);

-- Test 6: Slot mode generation on regular Sunday (2026-11-29 is a Sunday)
select is(
  (public.available_slots(
    'b2222222-0000-0000-0000-000000000001',
    'b3333333-0000-0000-0000-000000000001',
    '2026-11-29'::date
  )->>'mode'),
  'slot',
  'available_slots returns mode = slot for slot rule'
);

-- Test 7: Slot count generated (9:00 to 12:00 in 20-min chunks = 9 slots)
select is(
  jsonb_array_length(public.available_slots(
    'b2222222-0000-0000-0000-000000000001',
    'b3333333-0000-0000-0000-000000000001',
    '2026-11-29'::date
  )->'slots'),
  9,
  'available_slots generates 9 twenty-minute slots between 09:00 and 12:00'
);

-- Test 8: Serial mode generation on Monday (2026-11-30 is a Monday)
select is(
  (public.available_slots(
    'b2222222-0000-0000-0000-000000000001',
    'b3333333-0000-0000-0000-000000000001',
    '2026-11-30'::date
  )->>'mode'),
  'serial',
  'available_slots returns mode = serial for serial rule'
);

-- Test 9: Initial next available serial is 1
select is(
  (public.available_slots(
    'b2222222-0000-0000-0000-000000000001',
    'b3333333-0000-0000-0000-000000000001',
    '2026-11-30'::date
  )->>'nextAvailableSerial')::int,
  1,
  'available_slots reports nextAvailableSerial = 1 when no serials are booked'
);

-- ── 4. create_booking Execution Tests ─────────────────────────

-- Test 10: Create slot booking
create temp table _test_slot_booking on commit drop as
select public.create_booking(
  p_location_id := 'b2222222-0000-0000-0000-000000000001',
  p_provider_service_id := 'b4444444-0000-0000-0000-000000000001',
  p_type := 'slot'::booking_type,
  p_vet_id := 'b3333333-0000-0000-0000-000000000001',
  p_starts_at := '2026-11-29 03:00:00+00'::timestamptz,
  p_problem_note := 'Vaccination checkup'
) as res;

select like(
  (_test_slot_booking.res->>'code'),
  'PRN-%',
  'create_booking generates short booking code with PRN- prefix'
) from _test_slot_booking;

-- Test 11: Slot booking status is pending
select is(
  (_test_slot_booking.res->>'status'),
  'pending',
  'create_booking returns status pending'
) from _test_slot_booking;

-- Test 12: Remaining capacity for booked slot becomes 0
select is(
  (select (elem->>'remainingCapacity')::int
   from jsonb_array_elements(public.available_slots(
     'b2222222-0000-0000-0000-000000000001',
     'b3333333-0000-0000-0000-000000000001',
     '2026-11-29'::date
   )->'slots') as elem
   where elem->>'startsAt' = '2026-11-29T03:00:00Z'),
  0,
  'available_slots reflects decremented remainingCapacity after booking'
);

-- Test 13: Create serial booking 1
create temp table _test_serial_booking_1 on commit drop as
select public.create_booking(
  p_location_id := 'b2222222-0000-0000-0000-000000000001',
  p_provider_service_id := 'b4444444-0000-0000-0000-000000000001',
  p_type := 'serial'::booking_type,
  p_vet_id := 'b3333333-0000-0000-0000-000000000001',
  p_starts_at := '2026-11-30 11:00:00+00'::timestamptz
) as res;

select is(
  (_test_serial_booking_1.res->>'serialNo')::int,
  1,
  'create_booking auto-assigns serialNo = 1 for first serial booking in session'
) from _test_serial_booking_1;

-- Test 14: Create second serial booking in same session
create temp table _test_serial_booking_2 on commit drop as
select public.create_booking(
  p_location_id := 'b2222222-0000-0000-0000-000000000001',
  p_provider_service_id := 'b4444444-0000-0000-0000-000000000001',
  p_type := 'serial'::booking_type,
  p_vet_id := 'b3333333-0000-0000-0000-000000000001',
  p_starts_at := '2026-11-30 11:00:00+00'::timestamptz
) as res;

select is(
  (_test_serial_booking_2.res->>'serialNo')::int,
  2,
  'create_booking auto-assigns serialNo = 2 for second serial booking in session'
) from _test_serial_booking_2;

-- ── 5. cancel_booking & reschedule_booking Execution Tests ────

-- Test 15: cancel_booking
select is(
  (public.cancel_booking(
    (_test_slot_booking.res->>'bookingId')::uuid,
    'Client requested cancellation'
  )->>'success')::boolean,
  true,
  'cancel_booking executes successfully and returns success = true'
) from _test_slot_booking;

-- Test 16: reschedule_booking
select is(
  (public.reschedule_booking(
    (_test_serial_booking_1.res->>'bookingId')::uuid,
    '2026-11-30 12:00:00+00'::timestamptz,
    '2026-11-30 12:20:00+00'::timestamptz,
    null,
    'Rescheduling appointment'
  )->>'success')::boolean,
  true,
  'reschedule_booking executes successfully and returns success = true'
) from _test_serial_booking_1;

select * from finish();

rollback;
