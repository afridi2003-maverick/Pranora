-- ============================================================
-- PAY-1 pgTAP tests: record_cash_payment
-- Owner: tain | Branch: tain | Sprint: S3
-- ============================================================

begin;

select plan(5);

-- 1. Function existence check
select has_function('public', 'record_cash_payment', array['uuid', 'numeric'],
  'function record_cash_payment(uuid, numeric) exists');

-- 2. Fixture setup
insert into public.profiles (id, full_name_en, preferred_locale)
values ('d0000000-0000-0000-0000-000000000001', 'Cash Test Client', 'en')
on conflict (id) do nothing;

insert into public.providers (
  id, owner_user_id, type, name_en, phone, verification
) values (
  'd1111111-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'vet_clinic',
  'Cash Clinic',
  '+8801700000077',
  'verified'
) on conflict (id) do nothing;

insert into public.provider_locations (
  id, provider_id, name_en, location, is_24h, cancel_cutoff_hours, is_active
) values (
  'd2222222-0000-0000-0000-000000000001',
  'd1111111-0000-0000-0000-000000000001',
  'Cash Clinic Branch',
  ST_SetSRID(ST_MakePoint(90.3752, 23.7465), 4326),
  false,
  2,
  true
) on conflict (id) do nothing;

insert into public.provider_services (
  id, provider_id, service_id, price, is_active
) values (
  'd4444444-0000-0000-0000-000000000001',
  'd1111111-0000-0000-0000-000000000001',
  'general_checkup',
  500,
  true
) on conflict (id) do nothing;

insert into public.bookings (
  id, code, owner_id, location_id, provider_service_id, type, status,
  starts_at, price, payment_method, payment_status
) values (
  'd5555555-0000-0000-0000-000000000001',
  'PRN-CSH001',
  'd0000000-0000-0000-0000-000000000001',
  'd2222222-0000-0000-0000-000000000001',
  'd4444444-0000-0000-0000-000000000001',
  'slot',
  'confirmed',
  '2026-11-26 10:00:00+00',
  500,
  'cash',
  'pending'
) on conflict (id) do update set payment_status = 'pending';

-- 3. Execute record_cash_payment
select lives_ok(
  $$ select public.record_cash_payment('d5555555-0000-0000-0000-000000000001', 500) $$,
  'record_cash_payment succeeds'
);

-- 4. Verify payment_status is 'paid'
select results_eq(
  $$ select payment_status from public.bookings where id = 'd5555555-0000-0000-0000-000000000001' $$,
  $$ values ('paid'::payment_status) $$,
  'Booking payment_status is updated to paid'
);

-- 5. Idempotent check (re-calling returns success)
select lives_ok(
  $$ select public.record_cash_payment('d5555555-0000-0000-0000-000000000001', 500) $$,
  'Re-calling record_cash_payment on already paid booking succeeds idempotently'
);

select * from finish();

rollback;
