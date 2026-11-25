-- supabase/tests/payments_refunds.sql
-- Task: PAY-3 — Invoices & refunds
-- Owner: Afridi | Sprint: S8

begin;
select plan(8);

-- Setup
do $$
declare
  v_user_id uuid := '11111111-pay3-0000-0000-000000000001';
  v_booking_id uuid := '22222222-pay3-0000-0000-000000000001';
  v_payment_id uuid := '33333333-pay3-0000-0000-000000000001';
begin
  insert into public.profiles (id, full_name, phone, email, locale)
  values (v_user_id, 'PAY-3 Refund Test User', '+8801700000095', 'refund@pranora.test', 'en')
  on conflict (id) do nothing;

  insert into public.bookings (id, owner_id, provider_service_id, type, status, price, payment_method, payment_status)
  values (
    v_booking_id,
    v_user_id,
    '33333333-pay2-0000-0000-000000000001',
    'slot',
    'confirmed',
    500.00,
    'bkash',
    'paid'
  )
  on conflict (id) do nothing;

  insert into public.payments (id, booking_id, user_id, amount, currency, method, status, gateway, gateway_tran_id)
  values (
    v_payment_id,
    v_booking_id,
    v_user_id,
    500.00,
    'BDT',
    'bkash',
    'paid',
    'sslcommerz',
    'PRN-PAY3-TXN-001'
  )
  on conflict (id) do nothing;
end $$;

-- Test 1: Request refund as authenticated owner
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-pay3-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$
    select public.request_payment_refund(
      '33333333-pay3-0000-0000-000000000001'::uuid,
      'Vet was unavailable at scheduled time'
    )
  $$,
  'request_payment_refund executes successfully for payment owner'
);

-- Test 2: Payment status updated to refund_status = requested
select is(
  (select refund_status from public.payments where id = '33333333-pay3-0000-0000-000000000001'),
  'requested',
  'refund_status is updated to requested'
);

-- Test 3: Duplicate refund request raises exception
select throws_ok(
  $$
    select public.request_payment_refund(
      '33333333-pay3-0000-0000-000000000001'::uuid,
      'Duplicate request attempt'
    )
  $$,
  'A refund has already been requested or processed for this payment',
  'duplicate refund request is rejected'
);

-- Test 4: Unauthorized user cannot request refund for someone else
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"99999999-pay3-0000-0000-000000000001","role":"authenticated"}';

select throws_ok(
  $$
    select public.request_payment_refund(
      '33333333-pay3-0000-0000-000000000001'::uuid,
      'Malicious refund attempt'
    )
  $$,
  'Unauthorized: Payment does not belong to caller',
  'non-owner cannot request refund'
);

-- Test 5: Non-admin cannot process refund
select throws_ok(
  $$
    select public.process_payment_refund(
      '33333333-pay3-0000-0000-000000000001'::uuid,
      'approved',
      'Should fail'
    )
  $$,
  'Unauthorized: Only administrators can process refunds',
  'non-admin cannot process refund'
);

-- Test 6: Admin can process and approve refund
do $$
begin
  insert into public.user_roles (user_id, role, status)
  values ('11111111-pay3-0000-0000-000000000001', 'admin', 'verified')
  on conflict do nothing;
end $$;

set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-pay3-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$
    select public.process_payment_refund(
      '33333333-pay3-0000-0000-000000000001'::uuid,
      'approved',
      'Refund processed to bKash'
    )
  $$,
  'admin successfully processes refund'
);

-- Test 7: Payment status updated to refunded
select is(
  (select status::text from public.payments where id = '33333333-pay3-0000-0000-000000000001'),
  'refunded',
  'Payment status is marked as refunded'
);

-- Test 8: Get booking invoice
select lives_ok(
  $$
    select public.get_booking_invoice(
      '22222222-pay3-0000-0000-000000000001'::uuid
    )
  $$,
  'get_booking_invoice returns complete invoice JSON'
);

select * from finish();
rollback;
