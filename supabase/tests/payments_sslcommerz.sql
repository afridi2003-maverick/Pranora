-- supabase/tests/payments_sslcommerz.sql
-- Task: PAY-2 — Online payments: SSLCommerz (bKash, Nagad, Rocket, cards)
-- Owner: Afridi | Sprint: S7

begin;
select plan(11);

-- ─────────────────────────────────────────────
-- Setup: Test user, provider, service, booking
-- ─────────────────────────────────────────────
do $$
declare
  v_user_id uuid := '11111111-pay2-0000-0000-000000000001';
  v_provider_id uuid := '22222222-pay2-0000-0000-000000000001';
  v_service_id uuid := '33333333-pay2-0000-0000-000000000001';
  v_booking_id uuid := '44444444-pay2-0000-0000-000000000001';
begin
  insert into public.profiles (id, full_name, phone, email, locale)
  values (v_user_id, 'PAY-2 Test Owner', '+8801700000091', 'pay2owner@pranora.test', 'en')
  on conflict (id) do nothing;

  insert into public.providers (id, owner_user_id, type, name_en, name_bn, phone)
  values (v_provider_id, v_user_id, 'vet_clinic', 'Test Clinic', 'টেস্ট ক্লিনিক', '+8801700000092')
  on conflict (id) do nothing;

  insert into public.provider_services (id, provider_id, name_en, name_bn, price, duration_minutes)
  values (v_service_id, v_provider_id, 'Consultation', 'পরামর্শ', 500, 30)
  on conflict (id) do nothing;

  insert into public.bookings (id, owner_id, provider_service_id, type, status, price, payment_method, payment_status)
  values (v_booking_id, v_user_id, v_service_id, 'slot', 'pending', 500, 'cash', 'pending')
  on conflict (id) do nothing;
end $$;

-- ─────────────────────────────────────────────
-- Test 1 & 2: Init online payment
-- ─────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-pay2-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$
    select public.init_online_payment(
      '44444444-pay2-0000-0000-000000000001'::uuid,
      'bkash'::public.payment_method,
      500.00,
      'sslcommerz'
    )
  $$,
  'init_online_payment executes successfully for bKash'
);

-- Test 3: Returned session JSON contains transactionId, paymentId, and amount
do $$
declare
  v_res jsonb;
begin
  v_res := public.init_online_payment(
    '44444444-pay2-0000-0000-000000000001'::uuid,
    'nagad'::public.payment_method,
    500.00,
    'sslcommerz'
  );

  if not (v_res ? 'transactionId' and v_res ? 'paymentId' and (v_res->>'amount')::numeric = 500) then
    raise exception 'Unexpected response format: %', v_res;
  end if;
end $$;
select ok(true, 'init_online_payment returns valid transactionId and amount');

-- Test 4: Record inserted in payments table with status 'pending'
select is(
  (select status::text from public.payments where booking_id = '44444444-pay2-0000-0000-000000000001' order by created_at desc limit 1),
  'pending',
  'Newly initiated payment has pending status'
);

-- Test 5: Verify & complete payment with valid transaction ID
do $$
declare
  v_tran_id text;
  v_verify_res jsonb;
begin
  select gateway_tran_id into v_tran_id
  from public.payments
  where booking_id = '44444444-pay2-0000-0000-000000000001'
  order by created_at desc limit 1;

  v_verify_res := public.verify_and_complete_payment(
    v_tran_id,
    'VAL-SSL-9999',
    jsonb_build_object('card_type', 'bKash-MS', 'bank_tran_id', 'BK12345')
  );

  if not (v_verify_res ? 'success' and (v_verify_res->>'status') = 'paid') then
    raise exception 'Verification failed: %', v_verify_res;
  end if;
end $$;
select ok(true, 'verify_and_complete_payment marks payment as paid');

-- Test 6: Booking status updated to paid and confirmed
select is(
  (select payment_status::text from public.bookings where id = '44444444-pay2-0000-0000-000000000001'),
  'paid',
  'Associated booking payment_status is updated to paid'
);

select is(
  (select status::text from public.bookings where id = '44444444-pay2-0000-0000-000000000001'),
  'confirmed',
  'Associated booking status is confirmed after successful online payment'
);

-- Test 7: Double verification is idempotent
do $$
declare
  v_tran_id text;
  v_idem_res jsonb;
begin
  select gateway_tran_id into v_tran_id
  from public.payments
  where booking_id = '44444444-pay2-0000-0000-000000000001'
  order by created_at desc limit 1;

  v_idem_res := public.verify_and_complete_payment(v_tran_id, 'VAL-SSL-9999');

  if not (v_idem_res ? 'success' and (v_idem_res->>'status') = 'paid') then
    raise exception 'Idempotency check failed: %', v_idem_res;
  end if;
end $$;
select ok(true, 'verify_and_complete_payment is idempotent');

-- Test 8: Fail payment
do $$
declare
  v_booking2_id uuid := '55555555-pay2-0000-0000-000000000001';
  v_init_res jsonb;
  v_tran2_id text;
  v_fail_res jsonb;
begin
  insert into public.bookings (id, owner_id, provider_service_id, type, status, price, payment_method, payment_status)
  values (v_booking2_id, '11111111-pay2-0000-0000-000000000001', '33333333-pay2-0000-0000-000000000001', 'slot', 'pending', 500, 'cash', 'pending');

  v_init_res := public.init_online_payment(v_booking2_id, 'card'::public.payment_method, 500.00);
  v_tran2_id := v_init_res->>'transactionId';

  v_fail_res := public.cancel_or_fail_payment(v_tran2_id, 'Card declined by bank');

  if not (v_fail_res ? 'success' and (v_fail_res->>'status') = 'failed') then
    raise exception 'Fail payment failed: %', v_fail_res;
  end if;
end $$;
select ok(true, 'cancel_or_fail_payment correctly marks payment as failed');

-- Test 9: Anonymous cannot initiate payment
set local role anon;

select throws_ok(
  $$
    select public.init_online_payment(
      '44444444-pay2-0000-0000-000000000001'::uuid,
      'bkash'::public.payment_method,
      500.00
    )
  $$,
  'Authentication required to initiate payment',
  'anon user cannot initiate payment'
);

-- Test 10: Non-owner cannot initiate payment for someone elses booking
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"99999999-pay2-0000-0000-000000000001","role":"authenticated"}';

select throws_ok(
  $$
    select public.init_online_payment(
      '44444444-pay2-0000-0000-000000000001'::uuid,
      'bkash'::public.payment_method,
      500.00
    )
  $$,
  'Unauthorized: Booking does not belong to caller',
  'non-owner user cannot initiate payment for other users booking'
);

-- Test 11: Currency defaults to BDT
select is(
  (select currency from public.payments where booking_id = '44444444-pay2-0000-0000-000000000001' limit 1),
  'BDT',
  'Default currency is BDT'
);

select * from finish();
rollback;
