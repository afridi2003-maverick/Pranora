-- ============================================================
-- RSC-10 pgTAP tests: lost_found_board & sightings & nearby alerts
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S8
-- ============================================================

begin;

select plan(6);

-- ── 1. View & Table checks ───────────────────────────────────

select has_view('public', 'lost_found_board',
  'view public.lost_found_board exists');

select has_table('public', 'lost_found_sightings',
  'lost_found_sightings table exists');

select has_column('public', 'lost_found_sightings', 'contact_shared',
  'lost_found_sightings has contact_shared column');

-- ── 2. RPC function existence checks ─────────────────────────

select has_function('public', 'submit_lost_found_sighting',
  array['uuid', 'text', 'text', 'text[]', 'text'],
  'function public.submit_lost_found_sighting exists');

select has_function('public', 'share_sighting_contact',
  array['uuid'],
  'function public.share_sighting_contact exists');

select has_function('public', 'alert_nearby_users_for_lost_found',
  array['uuid', 'numeric'],
  'function public.alert_nearby_users_for_lost_found exists');

select * from finish();

rollback;
