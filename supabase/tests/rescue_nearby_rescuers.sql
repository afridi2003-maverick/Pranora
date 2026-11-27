-- ============================================================
-- RSC-9 pgTAP tests: nearby_rescuers & upsert_rescuer_profile
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S8
-- ============================================================

begin;

select plan(5);

-- ── 1. Table & Index checks ─────────────────────────────────

select has_table('public', 'rescuer_profiles',
  'rescuer_profiles table exists');

select has_column('public', 'rescuer_profiles', 'base_location',
  'rescuer_profiles has base_location column');

select has_column('public', 'rescuer_profiles', 'radius_km',
  'rescuer_profiles has radius_km column');

-- ── 2. RPC function existence checks ─────────────────────────

select has_function('public', 'nearby_rescuers',
  array['double precision', 'double precision', 'integer', 'public.species_type'],
  'function public.nearby_rescuers exists');

select has_function('public', 'upsert_rescuer_profile',
  array['uuid', 'double precision', 'double precision', 'smallint', 'numeric', 'public.species_type[]', 'boolean'],
  'function public.upsert_rescuer_profile exists');

select * from finish();

rollback;
