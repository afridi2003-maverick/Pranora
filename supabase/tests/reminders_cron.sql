-- ============================================================
-- HLT-2: pgTAP smoke tests for cron helper function
-- Run with: supabase test db
-- ============================================================

begin;

select plan(3);

-- 1. Function exists
select has_function(
  'public',
  'trigger_send_reminders',
  'trigger_send_reminders() function should exist'
);

-- 2. Function is security definer
select is(
  (select prosecdef from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'trigger_send_reminders'),
  true,
  'trigger_send_reminders should be SECURITY DEFINER'
);

-- 3. pg_cron job is scheduled
select ok(
  exists(
    select 1 from cron.job where jobname = 'send-reminders'
  ),
  'cron job send-reminders should be scheduled'
);

select * from finish();

rollback;
