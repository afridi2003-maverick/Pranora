-- ============================================================
-- RSC-6 pgTAP tests: Urgent Report Alert & Escalation
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S5
-- ============================================================

begin;

select plan(8);

-- ── 1. Column & Index Checks ──────────────────────────────────

select has_column('public', 'animal_reports', 'escalated_at',
  'animal_reports has escalated_at column');

select has_index('public', 'animal_reports', 'animal_reports_unreviewed_urgent_idx',
  'animal_reports has animal_reports_unreviewed_urgent_idx index');

-- ── 2. Function Existence Checks ──────────────────────────────

select has_function('public', 'notify_urgent_rescue_report', array['uuid'],
  'function notify_urgent_rescue_report(uuid) exists');

select has_function('public', 'escalate_unreviewed_rescue_reports', array[]::text[],
  'function escalate_unreviewed_rescue_reports() exists');

select has_trigger('public', 'animal_reports', 'trg_animal_reports_urgent_alert',
  'table animal_reports has trigger trg_animal_reports_urgent_alert');

-- ── 3. app_config Setting Check ───────────────────────────────

select results_eq(
  $$ select (value#>>'{}')::int from public.app_config where key = 'rescue_escalation_minutes' $$,
  $$ values (15) $$,
  'rescue_escalation_minutes defaults to 15 in app_config'
);

-- ── 4. Execution Smoke Test ───────────────────────────────────

-- escalate_unreviewed_rescue_reports returns success true json
select is(
  (public.escalate_unreviewed_rescue_reports()->>'success')::boolean,
  true,
  'escalate_unreviewed_rescue_reports() executes successfully and returns success = true'
);

-- notify_urgent_rescue_report with non-existent report returns error
select is(
  (public.notify_urgent_rescue_report(gen_random_uuid())->>'success')::boolean,
  false,
  'notify_urgent_rescue_report returns false on missing report'
);

select * from finish();
rollback;
