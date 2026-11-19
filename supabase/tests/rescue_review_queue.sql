begin;
select plan(7);

-- Test 1: review_animal_report function exists
select has_function(
  'public',
  'review_animal_report',
  array['uuid', 'boolean', 'uuid'],
  'Function public.review_animal_report(uuid, boolean, uuid) should exist'
);

-- Test 2: Urgency level enum values
select enum_has_labels(
  'public',
  'urgency_level',
  array['low', 'medium', 'high', 'critical'],
  'urgency_level enum should contain low, medium, high, critical'
);

-- Setup test user and reports
create temp table if not exists _test_queue_ctx (
  user_id uuid,
  report_critical uuid,
  report_medium uuid,
  shelter_id uuid
);

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_crit_id uuid;
  v_med_id uuid;
  v_shelter_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, email)
  values (v_user_id, 'tester-rsc2@pranora.test');

  -- Role for review
  insert into public.user_roles (user_id, role, status)
  values (v_user_id, 'admin', 'verified');

  -- Create medium urgency report (earlier timestamp)
  insert into public.animal_reports (
    reporter_id, kind, species, urgency, description,
    location, status, created_at
  ) values (
    v_user_id, 'injured', 'dog', 'medium', 'Medium leg limp',
    st_setsrid(st_makepoint(90.4125, 23.8103), 4326),
    'submitted', now() - interval '2 hours'
  ) returning id into v_med_id;

  -- Create critical urgency report (later timestamp)
  insert into public.animal_reports (
    reporter_id, kind, species, urgency, description,
    location, status, created_at
  ) values (
    v_user_id, 'injured', 'cat', 'critical', 'Critical head trauma',
    st_setsrid(st_makepoint(90.4125, 23.8103), 4326),
    'submitted', now() - interval '30 minutes'
  ) returning id into v_crit_id;

  insert into _test_queue_ctx values (v_user_id, v_crit_id, v_med_id, v_shelter_id);
end $$;

-- Test 3: Query ordering puts critical report first despite created later
select is(
  (
    select id from public.animal_reports
    where id in (
      (select report_critical from _test_queue_ctx),
      (select report_medium from _test_queue_ctx)
    )
    order by urgency desc, created_at asc
    limit 1
  ),
  (select report_critical from _test_queue_ctx),
  'Urgency DESC ordering puts critical report first in review queue'
);

-- Test 4 & 5: review_animal_report RPC accepts report and creates rescue_cases
do $$
declare
  v_user_id uuid;
  v_crit_id uuid;
  v_case_id uuid;
begin
  select user_id, report_critical into v_user_id, v_crit_id from _test_queue_ctx;

  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id::text)::text, true);

  v_case_id := public.review_animal_report(v_crit_id, true, null);
end $$;

select is(
  (select status from public.animal_reports where id = (select report_critical from _test_queue_ctx)),
  'under_review'::public.rescue_status,
  'Accepted report status transitions to under_review'
);

select isnt_empty(
  'select id from public.rescue_cases where report_id = (select report_critical from _test_queue_ctx)',
  'Accepting report creates corresponding rescue_case row'
);

-- Test 6 & 7: review_animal_report RPC declines report
do $$
declare
  v_user_id uuid;
  v_med_id uuid;
begin
  select user_id, report_medium into v_user_id, v_med_id from _test_queue_ctx;

  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id::text)::text, true);

  perform public.review_animal_report(v_med_id, false, null);
end $$;

select is(
  (select status from public.animal_reports where id = (select report_medium from _test_queue_ctx)),
  'rejected'::public.rescue_status,
  'Declined report status transitions to rejected'
);

select is_empty(
  'select id from public.rescue_cases where report_id = (select report_medium from _test_queue_ctx)',
  'Declining report does not create rescue_case row'
);

select * from finish();
rollback;
