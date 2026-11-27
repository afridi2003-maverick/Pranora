-- ============================================================
-- RSC-8 pgTAP tests: find_potential_duplicate_reports & merge_animal_reports
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S7
-- ============================================================

begin;

select plan(4);

-- ── 1. Column & Index checks ─────────────────────────────────

select has_column('public', 'animal_reports', 'duplicate_of',
  'animal_reports has duplicate_of column');

-- ── 2. RPC function existence checks ─────────────────────────

select has_function('public', 'find_potential_duplicate_reports',
  array['uuid', 'integer'],
  'function public.find_potential_duplicate_reports exists');

select has_function('public', 'find_potential_duplicate_reports',
  array['uuid'],
  'function public.find_potential_duplicate_reports with default radius exists');

select has_function('public', 'merge_animal_reports',
  array['uuid', 'uuid'],
  'function public.merge_animal_reports exists');

select * from finish();

rollback;
