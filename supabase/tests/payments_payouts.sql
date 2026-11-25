-- supabase/tests/payments_payouts.sql
-- Task: PAY-4 — Provider payouts & earnings ledger
-- Owner: Afridi | Sprint: S8

begin;
select plan(7);

-- Setup
do $$
declare
  v_user_id uuid := '11111111-pay4-0000-0000-000000000001';
  v_provider_id uuid := '22222222-pay4-0000-0000-000000000001';
  v_booking_id uuid := '33333333-pay4-0000-0000-000000000001';
  v_payment_id uuid := '44444444-pay4-0000-0000-000000000001';
begin
  insert into public.profiles (id, full_name, phone, email, locale)
  values (v_user_id, 'PAY-4 Provider Owner', '+8801700000096', 'provider@pranora.test', 'en')
  on conflict (id) do nothing;

  insert into public.providers (id, owner_user_id, type, name_en, name_bn, phone)
  values (v_provider_id, v_user_id, 'vet_clinic', 'PAY4 Clinic', 'পে৪ ক্লিনিক', '+8801700000097')
  on conflict (id) do nothing;

  -- Add record to provider_earnings_ledger
  insert into public.provider_earnings_ledger (provider_id, gross_amount, platform_fee, net_amount, is_settled)
  values (v_provider_id, 1000.00, 100.00, 900.00, false);
end $$;

-- Test 1: get_provider_earnings_summary calculates 10% platform fee and available balance
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-pay4-0000-0000-000000000001","role":"authenticated"}';

do $$
declare
  v_sum jsonb;
begin
  v_sum := public.get_provider_earnings_summary('22222222-pay4-0000-0000-000000000001'::uuid);

  if not ((v_sum->>'grossEarnings')::numeric = 1000 and (v_sum->>'platformCommission')::numeric = 100 and (v_sum->>'availableBalance')::numeric = 900) then
    raise exception 'Unexpected earnings calculation: %', v_sum;
  end if;
end $$;
select ok(true, 'get_provider_earnings_summary calculates 10% fee and 90% net available balance');

-- Test 2: Request provider payout
select lives_ok(
  $$
    select public.request_provider_payout(
      '22222222-pay4-0000-0000-000000000001'::uuid,
      500.00,
      'bkash',
      jsonb_build_object('accountNumber', '01712345678'),
      'Weekly withdrawal'
    )
  $$,
  'request_provider_payout succeeds for provider owner'
);

-- Test 3: Payout record created with status pending
select is(
  (select status from public.provider_payouts where provider_id = '22222222-pay4-0000-0000-000000000001' limit 1),
  'pending',
  'Payout is created in pending status'
);

-- Test 4: Withdrawal under minimum (500 BDT) fails
select throws_ok(
  $$
    select public.request_provider_payout(
      '22222222-pay4-0000-0000-000000000001'::uuid,
      200.00,
      'bkash',
      jsonb_build_object('accountNumber', '01712345678')
    )
  $$,
  'Minimum withdrawal amount is 500 BDT',
  'withdrawal under 500 BDT is rejected'
);

-- Test 5: Non-owner cannot request payout for provider
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"99999999-pay4-0000-0000-000000000001","role":"authenticated"}';

select throws_ok(
  $$
    select public.request_provider_payout(
      '22222222-pay4-0000-0000-000000000001'::uuid,
      500.00,
      'bkash',
      jsonb_build_object('accountNumber', '01712345678')
    )
  $$,
  'Unauthorized: Only provider owner can request payout',
  'non-owner cannot request payout'
);

-- Test 6: Non-admin cannot process payout
select throws_ok(
  $$
    select public.process_provider_payout(
      (select id from public.provider_payouts limit 1),
      'completed',
      'REF-12345'
    )
  $$,
  'Unauthorized: Only administrators can process provider payouts',
  'non-admin cannot process payout'
);

-- Test 7: Admin can process and complete payout
do $$
begin
  insert into public.user_roles (user_id, role, status)
  values ('11111111-pay4-0000-0000-000000000001', 'admin', 'verified')
  on conflict do nothing;
end $$;

set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-pay4-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$
    select public.process_provider_payout(
      (select id from public.provider_payouts where provider_id = '22222222-pay4-0000-0000-000000000001' limit 1),
      'completed',
      'BK-DISBURSE-9921'
    )
  $$,
  'admin successfully completes payout'
);

select * from finish();
rollback;
