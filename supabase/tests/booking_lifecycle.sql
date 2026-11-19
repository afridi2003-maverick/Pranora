-- ============================================================
-- APT-2 pgTAP tests: update_booking_status lifecycle & provider confirm
-- Owner: tain | Branch: tain | Sprint: S3
-- ============================================================

begin;

select plan(8);

-- 1. Function Existence Check
select has_function('public', 'update_booking_status', array['uuid', 'booking_status', 'text'],
  'function update_booking_status(uuid, booking_status, text) exists');

-- 2. Fixture Setup
insert into public.profiles (id, full_name_en, preferred_locale)
values ('c0000000-0000-0000-0000-000000000001', 'Lifecycle Test Client', 'en')
on conflict (id) do nothing;

insert into public.providers (
  id, owner_user_id, type, name_en, phone, verification
) values (
  'c1111111-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'vet_clinic',
  'Lifecycle Clinic',
  '+8801700000088',
  'verified'
) on conflict (id) do nothing;

insert into public.provider_locations (
  id, provider_id, name_en, location, is_24h, cancel_cutoff_hours, is_active
) values (
  'c2222222-0000-0000-0000-000000000001',
  'c1111111-0000-0000-0000-000000000001',
  'Lifecycle Branch',
  ST_SetSRID(ST_MakePoint(90.3752, 23.7465), 4326),
  false,
  2,
  true
) on conflict (id) do nothing;

insert into public.provider_services (
  id, provider_id, service_id, price, is_active
) values (
  'c4444444-0000-0000-0000-000000000001',
  'c1111111-0000-0000-0000-000000000001',
  'general_checkup',
  500,
  true
) on conflict (id) do nothing;

-- Test booking initially in 'pending'
insert into public.bookings (
  id, code, owner_id, location_id, provider_service_id, type, status,
  starts_at, payment_method, payment_status
) values (
  'c5555555-0000-0000-0000-000000000001',
  'PRN-TST001',
  'c0000000-0000-0000-0000-000000000001',
  'c2222222-0000-0000-0000-000000000001',
  'c4444444-0000-0000-0000-000000000001',
  'slot',
  'pending',
  '2026-11-25 10:00:00+00',
  'cash',
  'pending'
) on conflict (id) do update set status = 'pending';

-- 3. Transition: pending -> confirmed
select lives_ok(
  $$ select public.update_booking_status('c5555555-0000-0000-0000-000000000001', 'confirmed'::booking_status) $$,
  'Transition pending -> confirmed succeeds'
);

select results_eq(
  $$ select status from public.bookings where id = 'c5555555-0000-0000-0000-000000000001' $$,
  $$ values ('confirmed'::booking_status) $$,
  'Booking status is now confirmed'
);

-- 4. Transition: confirmed -> in_progress
select lives_ok(
  $$ select public.update_booking_status('c5555555-0000-0000-0000-000000000001', 'in_progress'::booking_status) $$,
  'Transition confirmed -> in_progress succeeds'
);

select results_eq(
  $$ select status from public.bookings where id = 'c5555555-0000-0000-0000-000000000001' $$,
  $$ values ('in_progress'::booking_status) $$,
  'Booking status is now in_progress'
);

-- 5. Transition: in_progress -> completed
select lives_ok(
  $$ select public.update_booking_status('c5555555-0000-0000-0000-000000000001', 'completed'::booking_status) $$,
  'Transition in_progress -> completed succeeds'
);

select results_eq(
  $$ select status from public.bookings where id = 'c5555555-0000-0000-0000-000000000001' $$,
  $$ values ('completed'::booking_status) $$,
  'Booking status is now completed'
);

-- 6. Disallow transition from terminal completed state
select throws_ok(
  $$ select public.update_booking_status('c5555555-0000-0000-0000-000000000001', 'pending'::booking_status) $$,
  'Cannot transition booking from terminal status completed to pending'
);

select * from finish();

rollback;
