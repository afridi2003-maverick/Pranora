BEGIN;
SELECT plan(6);

-- 1. Tables exist
SELECT has_table('public', 'trainers', 'trainers table exists');
SELECT has_table('public', 'training_packages', 'training_packages table exists');
SELECT has_table('public', 'training_bookings', 'training_bookings table exists');

-- 2. RLS is enabled
SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'trainers'),
  'RLS enabled on trainers'
);
SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'training_bookings'),
  'RLS enabled on training_bookings'
);

-- 3. Seeded packages count >= 4
SELECT ok(
  (SELECT count(*) >= 4 FROM public.training_packages),
  'At least 4 training packages seeded'
);

SELECT * FROM finish();
ROLLBACK;
