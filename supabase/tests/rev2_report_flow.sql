-- supabase/tests/rev2_report_flow.sql
-- Task: REV-2 — Shared report flow (reviews, wrong clinic info)
-- Owner: Afridi | Sprint: S6
-- Tests: submit_content_report RPC for 'review' and 'provider' targets

begin;
select plan(12);

-- ─────────────────────────────────────────────
-- Setup: test user
-- ─────────────────────────────────────────────
do $$
begin
  insert into public.profiles (id, full_name, phone, email, locale)
  values (
    '11111111-rev2-0000-0000-000000000001',
    'REV2 Test Reporter',
    '+8801700000099',
    'rev2reporter@pranora.test',
    'en'
  )
  on conflict (id) do nothing;
end $$;

-- ─────────────────────────────────────────────
-- 1. submit_content_report: provider target (wrong clinic info)
-- ─────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-rev2-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$
    select public.submit_content_report(
      'provider',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'inaccurate_info',
      'Phone number is out of service, clinic moved to new address.',
      '{}'
    )
  $$,
  'submit_content_report: provider target with inaccurate_info reason succeeds'
);

-- 2. Result is a UUID
select ok(
  (select public.submit_content_report(
    'provider',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'fake',
    null,
    '{}'
  ))::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
  'submit_content_report: returns a valid UUID'
);

-- 3. submit_content_report: review target (inappropriate review)
select lives_ok(
  $$
    select public.submit_content_report(
      'review',
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      'fake',
      'This is a paid fake review with 5 stars.',
      '{}'
    )
  $$,
  'submit_content_report: review target with fake reason succeeds'
);

-- 4. submit_content_report: abusive review
select lives_ok(
  $$
    select public.submit_content_report(
      'review',
      'dddddddd-dddd-dddd-dddd-dddddddddddd',
      'abusive',
      'Review contains offensive language targeting the vet.',
      '{}'
    )
  $$,
  'submit_content_report: review target with abusive reason succeeds'
);

-- 5. submit_content_report: provider spam
select lives_ok(
  $$
    select public.submit_content_report(
      'provider',
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      'spam',
      null,
      '{}'
    )
  $$,
  'submit_content_report: provider target with spam reason succeeds'
);

-- 6. submit_content_report: provider duplicate
select lives_ok(
  $$
    select public.submit_content_report(
      'provider',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      'duplicate',
      'Same clinic listed twice with slightly different names.',
      '{}'
    )
  $$,
  'submit_content_report: provider target with duplicate reason succeeds'
);

-- 7. Report is stored in content_reports with status 'open'
do $$
declare
  v_id uuid;
begin
  v_id := public.submit_content_report(
    'provider',
    '12121212-1212-1212-1212-121212121212',
    'inaccurate_info',
    'Hours shown are wrong.',
    '{}'
  );

  perform * from public.content_reports
  where id = v_id and status = 'open' and target_type = 'provider';

  if not found then
    raise exception 'Report not found with open status';
  end if;
end $$;

select ok(true, 'submitted report is stored with status=open and correct target_type');

-- 8. Report is stored with correct reporter_id
do $$
declare
  v_id uuid;
  v_reporter uuid;
begin
  v_id := public.submit_content_report(
    'review',
    '34343434-3434-3434-3434-343434343434',
    'spam',
    null,
    '{}'
  );

  select reporter_id into v_reporter from public.content_reports where id = v_id;

  if v_reporter <> '11111111-rev2-0000-0000-000000000001'::uuid then
    raise exception 'Reporter ID mismatch: got %, expected %', v_reporter, '11111111-rev2-0000-0000-000000000001';
  end if;
end $$;

select ok(true, 'submitted report stores correct reporter_id from auth.uid()');

-- 9. Report action_taken defaults to 'none'
do $$
declare
  v_id uuid;
  v_action text;
begin
  v_id := public.submit_content_report(
    'provider',
    '56565656-5656-5656-5656-565656565656',
    'other',
    'Other issue.',
    '{}'
  );

  select action_taken into v_action from public.content_reports where id = v_id;

  if v_action <> 'none' then
    raise exception 'Expected action_taken=none, got %', v_action;
  end if;
end $$;

select ok(true, 'submitted report defaults to action_taken=none');

-- 10. Anonymous user cannot submit report (unauthenticated)
set local role anon;

select throws_ok(
  $$
    select public.submit_content_report(
      'provider',
      '78787878-7878-7878-7878-787878787878',
      'fake',
      null,
      '{}'
    )
  $$,
  'Authentication required to submit report',
  'submit_content_report: anon user cannot submit report'
);

-- 11. Reporter can read their own reports
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-rev2-0000-0000-000000000001","role":"authenticated"}';

select ok(
  (select count(*) from public.content_reports
   where reporter_id = '11111111-rev2-0000-0000-000000000001') > 0,
  'reporter can select their own content_reports via RLS'
);

-- 12. Report target_type is correctly stored as the enum value
do $$
declare
  v_id uuid;
  v_type text;
begin
  v_id := public.submit_content_report(
    'review',
    '90909090-9090-9090-9090-909090909090',
    'fake',
    'Fake review.',
    '{}'
  );

  select target_type::text into v_type from public.content_reports where id = v_id;

  if v_type <> 'review' then
    raise exception 'Expected target_type=review, got %', v_type;
  end if;
end $$;

select ok(true, 'submitted report stores correct target_type enum value');

select * from finish();
rollback;
