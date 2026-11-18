-- ============================================================
-- DB-9 pgTAP tests: adoption_listings, adoption_applications,
--                   adoption_handovers, adoption_favorites,
--                   adoption_followups & RPCs
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S2
-- ============================================================

begin;

select plan(24);

-- ── 1. Table existence ──────────────────────────────────────

select has_table('public', 'adoption_listings',
  'table public.adoption_listings exists');

select has_table('public', 'adoption_applications',
  'table public.adoption_applications exists');

select has_table('public', 'adoption_handovers',
  'table public.adoption_handovers exists');

select has_table('public', 'adoption_favorites',
  'table public.adoption_favorites exists');

select has_table('public', 'adoption_followups',
  'table public.adoption_followups exists');

-- ── 2. Column tests: adoption_listings ──────────────────────

select has_column('public', 'adoption_listings', 'pet_id',
  'adoption_listings has pet_id column');

select has_column('public', 'adoption_listings', 'posted_by',
  'adoption_listings has posted_by column');

select has_column('public', 'adoption_listings', 'species',
  'adoption_listings has species column');

select has_column('public', 'adoption_listings', 'district_id',
  'adoption_listings has district_id column');

select has_column('public', 'adoption_listings', 'status',
  'adoption_listings has status column');

select has_column('public', 'adoption_listings', 'photos',
  'adoption_listings has photos column');

-- ── 3. Column tests: adoption_applications ──────────────────

select has_column('public', 'adoption_applications', 'listing_id',
  'adoption_applications has listing_id column');

select has_column('public', 'adoption_applications', 'applicant_id',
  'adoption_applications has applicant_id column');

select has_column('public', 'adoption_applications', 'home_type',
  'adoption_applications has home_type column');

select has_column('public', 'adoption_applications', 'reason',
  'adoption_applications has reason column');

select has_column('public', 'adoption_applications', 'status',
  'adoption_applications has status column');

-- ── 4. Column tests: adoption_handovers ─────────────────────

select has_column('public', 'adoption_handovers', 'listing_id',
  'adoption_handovers has listing_id column');

select has_column('public', 'adoption_handovers', 'application_id',
  'adoption_handovers has application_id column');

select has_column('public', 'adoption_handovers', 'from_user_id',
  'adoption_handovers has from_user_id column');

select has_column('public', 'adoption_handovers', 'to_user_id',
  'adoption_handovers has to_user_id column');

select has_column('public', 'adoption_handovers', 'completed_at',
  'adoption_handovers has completed_at column');

-- ── 5. RPC function existence ───────────────────────────────

select has_function('public', 'decide_adoption_application',
  array['uuid', 'boolean', 'text'],
  'function public.decide_adoption_application exists');

select has_function('public', 'confirm_handover',
  array['uuid'],
  'function public.confirm_handover exists');

select has_function('public', 'toggle_adoption_favorite',
  array['uuid'],
  'function public.toggle_adoption_favorite exists');

select * from finish();

rollback;
