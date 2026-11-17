-- ============================================================
-- DB-7 pgTAP tests: service_categories, services, breeds,
--                   vaccine_templates seed data
-- Owner: zihad | Branch: zihad | Sprint: S3
-- Run with: pnpm db:test  (or supabase test db locally)
-- ============================================================

begin;

select plan(28);

-- ── 1. service_categories table structure ───────────────────

select has_table('public', 'service_categories',
  'table public.service_categories exists');

select has_column('public', 'service_categories', 'slug',
  'service_categories has slug column');

select col_is_unique('public', 'service_categories', 'slug',
  'service_categories.slug is unique');

-- ── 2. services table structure ─────────────────────────────

select has_table('public', 'services',
  'table public.services exists');

select has_column('public', 'services', 'category_id',
  'services has category_id column');

select col_is_unique('public', 'services', 'slug',
  'services.slug is unique');

-- ── 3. Seed counts ──────────────────────────────────────────

select results_eq(
  'select count(*)::int from public.service_categories',
  array[13],
  '13 service categories seeded'
);

select results_eq(
  'select count(*)::int from public.services',
  array[21],
  '21 services seeded'
);

select results_eq(
  'select count(*)::int from public.services where is_mvp = true',
  array[9],
  '9 MVP services seeded'
);

-- ── 4. MVP categories present ───────────────────────────────

select ok(
  exists(select 1 from public.service_categories where slug = 'vet'),
  'service_category "vet" exists'
);

select ok(
  exists(select 1 from public.service_categories where slug = 'vaccination'),
  'service_category "vaccination" exists'
);

select ok(
  exists(select 1 from public.service_categories where slug = 'emergency'),
  'service_category "emergency" exists'
);

select ok(
  exists(select 1 from public.service_categories where slug = 'rescue'),
  'service_category "rescue" exists'
);

select ok(
  exists(select 1 from public.service_categories where slug = 'adoption'),
  'service_category "adoption" exists'
);

-- ── 5. MVP services present ──────────────────────────────────

select ok(
  exists(select 1 from public.services where slug = 'clinic_visit' and is_mvp = true),
  'service "clinic_visit" is MVP'
);

select ok(
  exists(select 1 from public.services where slug = 'emergency_care' and is_mvp = true),
  'service "emergency_care" is MVP'
);

select ok(
  exists(select 1 from public.services where slug = 'adopt_pet' and is_mvp = true),
  'service "adopt_pet" is MVP'
);

-- ── 6. vaccine_templates seed ───────────────────────────────

select results_eq(
  'select count(*)::int from public.vaccine_templates',
  array[14],
  '14 vaccine templates seeded'
);

select results_eq(
  $$select count(*)::int from public.vaccine_templates where species = 'dog'$$,
  array[6],
  '6 dog vaccine templates'
);

select results_eq(
  $$select count(*)::int from public.vaccine_templates where species = 'cat'$$,
  array[4],
  '4 cat vaccine templates'
);

select ok(
  exists(
    select 1 from public.vaccine_templates
    where species = 'dog' and name_en ilike '%DHPP%'
  ),
  'DHPP template exists for dog'
);

select ok(
  exists(
    select 1 from public.vaccine_templates
    where species = 'dog' and name_en = 'Rabies'
  ),
  'Rabies template exists for dog'
);

select ok(
  exists(
    select 1 from public.vaccine_templates
    where species = 'cat' and name_en ilike '%FVRCP%'
  ),
  'FVRCP template exists for cat'
);

-- ── 7. breeds seed ──────────────────────────────────────────

select ok(
  (select count(*) from public.breeds) >= 40,
  'at least 40 breeds seeded'
);

select ok(
  exists(select 1 from public.breeds where species = 'dog' and name_en = 'Mixed/Deshi'),
  'Mixed/Deshi dog breed exists'
);

select ok(
  exists(select 1 from public.breeds where species = 'cat' and name_en = 'Persian'),
  'Persian cat breed exists'
);

-- ── 8. RLS — anonymous can read service_categories ──────────

set local role anon;

select ok(
  (select count(*) from public.service_categories) > 0,
  'anon can read service_categories'
);

select ok(
  (select count(*) from public.services where is_active = true) > 0,
  'anon can read active services'
);

reset role;

select * from finish();

rollback;
