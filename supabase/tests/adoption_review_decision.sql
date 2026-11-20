-- pgTAP test suite for ADP-5: Human review & decision (decide_adoption_application)
begin;

select plan(5);

-- ── 1. Function existence ───────────────────────────────────────────────────

select has_function(
  'public',
  'decide_adoption_application',
  ARRAY['uuid', 'boolean', 'text'],
  'function public.decide_adoption_application(uuid, boolean, text) exists'
);

-- ── 2. Table and column checks ──────────────────────────────────────────────

select has_table('public', 'adoption_applications', 'adoption_applications table exists');
select has_table('public', 'adoption_handovers',    'adoption_handovers table exists');

select col_type_is(
  'public', 'adoption_applications', 'status', 'adoption_application_status',
  'adoption_applications.status is adoption_application_status enum'
);

-- ── 3. Application status values ────────────────────────────────────────────

select ok(
  (
    select count(*) >= 4
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    where t.typname = 'adoption_application_status'
      and e.enumlabel in ('submitted', 'under_review', 'approved', 'rejected')
  ),
  'adoption_application_status enum contains submitted, under_review, approved, rejected'
);

select * from finish();

rollback;
