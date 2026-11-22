begin;
select plan(6);

-- 1. Functions exist
select has_function(
  'public',
  'cancel_booking',
  array['uuid', 'text'],
  'Function public.cancel_booking(uuid, text) exists'
);

select has_function(
  'public',
  'reschedule_booking',
  array['uuid', 'timestamptz', 'timestamptz', 'smallint', 'text'],
  'Function public.reschedule_booking exists'
);

-- Setup test data context
create temp table if not exists _cutoff_ctx (
  owner_id uuid,
  location_id uuid,
  service_id uuid,
  booking_future_id uuid,
  booking_imminent_id uuid
);

do $$
declare
  v_owner_id uuid := gen_random_uuid();
  v_provider_id uuid := gen_random_uuid();
  v_loc_id uuid := gen_random_uuid();
  v_svc_id uuid := gen_random_uuid();
  v_b_future uuid;
  v_b_imminent uuid;
begin
  insert into auth.users (id, email) values (v_owner_id, 'owner-cutoff@pranora.test');
  insert into public.profiles (id, full_name, phone) values (v_owner_id, 'Cutoff Test User', '+8801700998877');

  insert into public.providers (id, owner_user_id, type, name_en)
  values (v_provider_id, v_owner_id, 'vet_clinic', 'Cutoff Test Clinic');

  -- Location with 2 hours cutoff
  insert into public.provider_locations (
    id, provider_id, name_en, location, cancel_cutoff_hours
  ) values (
    v_loc_id, v_provider_id, 'Cutoff Clinic Main',
    st_setsrid(st_makepoint(90.4125, 23.8103), 4326),
    2
  );

  insert into public.provider_services (id, provider_id, name_en, duration_minutes, price)
  values (v_svc_id, v_provider_id, 'General Vet Consultation', 30, 500);

  -- Booking 1: Far in future (24 hours ahead) -> CAN cancel & reschedule
  insert into public.bookings (
    code, owner_id, location_id, provider_service_id, type, status, starts_at, ends_at
  ) values (
    'PRN-CUT001', v_owner_id, v_loc_id, v_svc_id, 'slot', 'confirmed',
    now() + interval '24 hours', now() + interval '24 hours 30 minutes'
  ) returning id into v_b_future;

  -- Booking 2: Imminent (30 minutes ahead, within 2 hours cutoff) -> CANNOT cancel
  insert into public.bookings (
    code, owner_id, location_id, provider_service_id, type, status, starts_at, ends_at
  ) values (
    'PRN-CUT002', v_owner_id, v_loc_id, v_svc_id, 'slot', 'confirmed',
    now() + interval '30 minutes', now() + interval '1 hour'
  ) returning id into v_b_imminent;

  insert into _cutoff_ctx values (v_owner_id, v_loc_id, v_svc_id, v_b_future, v_b_imminent);
end $$;

-- 3. Owner can cancel booking when well before cut-off (24h before)
do $$
declare
  v_owner_id uuid;
  v_bid uuid;
begin
  select owner_id, booking_future_id into v_owner_id, v_bid from _cutoff_ctx;
  perform set_config('request.jwt.claims', json_build_object('sub', v_owner_id::text)::text, true);
  perform public.cancel_booking(v_bid, 'Schedule conflict');
end $$;

select is(
  (select status from public.bookings where id = (select booking_future_id from _cutoff_ctx)),
  'cancelled_by_owner'::public.booking_status,
  'Booking far in future successfully cancelled by owner'
);

-- 4. Attempting to cancel within 2h cutoff throws exception
select throws_matching(
  format($$
    select public.cancel_booking('%s'::uuid, 'Last minute emergency')
  $$, (select booking_imminent_id from _cutoff_ctx)),
  'Cancellation cut-off time has passed',
  'Cancelling within 2-hour cut-off raises cut-off exception'
);

-- 5. Attempting to reschedule within 2h cutoff throws exception
select throws_matching(
  format($$
    select public.reschedule_booking('%s'::uuid, now() + interval '48 hours', null, null, 'Postpone')
  $$, (select booking_imminent_id from _cutoff_ctx)),
  'Reschedule cut-off time has passed',
  'Rescheduling within 2-hour cut-off raises cut-off exception'
);

-- 6. Booking status remains confirmed when cancellation failed due to cutoff
select is(
  (select status from public.bookings where id = (select booking_imminent_id from _cutoff_ctx)),
  'confirmed'::public.booking_status,
  'Imminent booking remains confirmed after blocked cancellation attempt'
);

select * from finish();
rollback;
