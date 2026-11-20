-- ============================================================
-- HLT-6: pgTAP tests for SMS reminders & preferences
-- Run with: supabase test db
-- ============================================================

begin;

select plan(3);

-- 1. profiles table has sms_opt_in column
select has_column(
  'public',
  'profiles',
  'sms_opt_in',
  'profiles table should have sms_opt_in column'
);

-- 2. profiles table has phone column
select has_column(
  'public',
  'profiles',
  'phone',
  'profiles table should have phone column'
);

-- 3. reminders table has type column supporting vaccine/appointment types
select has_column(
  'public',
  'reminders',
  'type',
  'reminders table should have type column'
);

select * from finish();

rollback;
