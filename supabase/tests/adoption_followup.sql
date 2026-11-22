-- ============================================================
-- ADP-9 pgTAP tests: submit_adoption_followup,
--                   process_due_adoption_followups & RLS
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S6
-- ============================================================

begin;

select plan(7);

-- ── 1. Table & Column checks ─────────────────────────────────

select has_table('public', 'adoption_followups',
  'table public.adoption_followups exists');

select has_column('public', 'adoption_followups', 'wellbeing',
  'adoption_followups has wellbeing column');

select has_column('public', 'adoption_followups', 'note',
  'adoption_followups has note column');

select has_column('public', 'adoption_followups', 'photos',
  'adoption_followups has photos column');

select has_column('public', 'adoption_followups', 'answered_at',
  'adoption_followups has answered_at column');

-- ── 2. RPC function checks ───────────────────────────────────

select has_function('public', 'submit_adoption_followup',
  array['uuid', 'text', 'text', 'text[]'],
  'function public.submit_adoption_followup exists');

select has_function('public', 'process_due_adoption_followups',
  'function public.process_due_adoption_followups exists');

select * from finish();

rollback;
