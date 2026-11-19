-- ============================================================
-- PRV-3 pgTAP tests: register_shelter
-- Owner: tain | Branch: tain | Sprint: S4
-- ============================================================

begin;

select plan(5);

-- 1. Function existence check
select has_function('public', 'register_shelter', array[
  'text', 'text', 'text', 'text', 'text', 'text',
  'integer', 'integer', 'integer', 'double precision', 'double precision',
  'integer', 'species_type[]', 'boolean', 'text[]'
], 'function register_shelter exists with complete signature');

-- 2. Fixture setup
insert into public.profiles (id, full_name_en, preferred_locale)
values ('e0000000-0000-0000-0000-000000000001', 'Shelter Manager', 'en')
on conflict (id) do nothing;

-- 3. Execute register_shelter
select lives_ok(
  $$ select public.register_shelter(
    'Dhaka Animal Sanctuary',
    'ঢাকা অ্যানিম্যাল স্যাঙ্কচুয়ারি',
    '+8801711223344',
    'contact@dhakashelter.org',
    'Road 10, Mirpur, Dhaka',
    'রোড ১০, মিরপুর, ঢাকা',
    3, -- Dhaka division
    1, -- Dhaka district
    null,
    23.8041,
    90.3667,
    80,
    array['dog'::species_type, 'cat'::species_type],
    true,
    array['https://example.com/doc.pdf']
  ) $$,
  'register_shelter executes successfully'
);

-- 4. Verify provider was created with type 'shelter'
select results_eq(
  $$ select type from public.providers where name_en = 'Dhaka Animal Sanctuary' $$,
  $$ values ('shelter'::provider_type) $$,
  'Provider record created with type shelter'
);

-- 5. Disallow blank name
select throws_ok(
  $$ select public.register_shelter('', null, null, null, null, null, null, null, null, null, null, null, null, null, null) $$,
  'Shelter name is required'
);

select * from finish();

rollback;
