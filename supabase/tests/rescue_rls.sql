-- ============================================================
-- DB-8 pgTAP tests: animal_reports, rescue_cases,
--                   rescue_assignments, rescue_case_updates,
--                   lost_found_board view & RPCs
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S2
-- ============================================================

begin;

select plan(28);

-- ── 1. Table existence ──────────────────────────────────────

select has_table('public', 'animal_reports',
  'table public.animal_reports exists');

select has_table('public', 'rescue_cases',
  'table public.rescue_cases exists');

select has_table('public', 'rescue_assignments',
  'table public.rescue_assignments exists');

select has_table('public', 'rescue_case_updates',
  'table public.rescue_case_updates exists');

-- ── 2. View existence ───────────────────────────────────────

select has_view('public', 'lost_found_board',
  'view public.lost_found_board exists');

-- ── 3. Column tests: animal_reports ─────────────────────────

select has_column('public', 'animal_reports', 'reporter_id',
  'animal_reports has reporter_id column');

select has_column('public', 'animal_reports', 'kind',
  'animal_reports has kind column');

select has_column('public', 'animal_reports', 'species',
  'animal_reports has species column');

select has_column('public', 'animal_reports', 'urgency',
  'animal_reports has urgency column');

select has_column('public', 'animal_reports', 'location',
  'animal_reports has PostGIS location column');

select has_column('public', 'animal_reports', 'photos',
  'animal_reports has photos column');

select has_column('public', 'animal_reports', 'status',
  'animal_reports has status column');

select has_column('public', 'animal_reports', 'duplicate_of',
  'animal_reports has duplicate_of column');

-- ── 4. Column tests: rescue_cases ───────────────────────────

select has_column('public', 'rescue_cases', 'report_id',
  'rescue_cases has report_id column');

select has_column('public', 'rescue_cases', 'status',
  'rescue_cases has status column');

select has_column('public', 'rescue_cases', 'assigned_rescuer_id',
  'rescue_cases has assigned_rescuer_id column');

select has_column('public', 'rescue_cases', 'outcome',
  'rescue_cases has outcome column');

select has_column('public', 'rescue_cases', 'closed_at',
  'rescue_cases has closed_at column');

-- ── 5. Column tests: rescue_assignments ─────────────────────

select has_column('public', 'rescue_assignments', 'case_id',
  'rescue_assignments has case_id column');

select has_column('public', 'rescue_assignments', 'rescuer_id',
  'rescue_assignments has rescuer_id column');

select has_column('public', 'rescue_assignments', 'status',
  'rescue_assignments has status column');

-- ── 6. Column tests: rescue_case_updates ────────────────────

select has_column('public', 'rescue_case_updates', 'case_id',
  'rescue_case_updates has case_id column');

select has_column('public', 'rescue_case_updates', 'author_id',
  'rescue_case_updates has author_id column');

-- ── 7. RPC function existence ───────────────────────────────

select has_function('public', 'review_animal_report',
  array['uuid', 'boolean', 'uuid'],
  'function public.review_animal_report exists');

select has_function('public', 'assign_rescuer',
  array['uuid', 'uuid'],
  'function public.assign_rescuer exists');

select has_function('public', 'respond_to_assignment',
  array['uuid', 'boolean', 'text'],
  'function public.respond_to_assignment exists');

select has_function('public', 'close_rescue_case',
  array['uuid', 'public.rescue_outcome', 'text', 'uuid'],
  'function public.close_rescue_case exists');

select has_function('public', 'my_report_status',
  array['uuid'],
  'function public.my_report_status exists');

select * from finish();

rollback;
