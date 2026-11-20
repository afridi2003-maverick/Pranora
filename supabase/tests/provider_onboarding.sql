begin;
select plan(5);

-- Test 1: Function exists
select has_function(
  'public',
  'register_provider',
  'Function public.register_provider should exist'
);

-- Test 2: Blank name check fails
select throws_matching(
  $$
    select public.register_provider(
      'vet_clinic'::public.provider_type,
      '',
      null,
      '+8801711223344'
    );
  $$,
  'Provider name is required',
  'register_provider should reject empty provider name'
);

-- Test 3: Happy path registration creates provider, location, and role
do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_res jsonb;
begin
  insert into auth.users (id, email) values (v_user_id, 'provider-onboard@pranora.test');
  insert into public.profiles (id, full_name, phone) values (v_user_id, 'Vet Owner', '+8801711223344');

  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id::text)::text, true);

  v_res := public.register_provider(
    'vet_clinic'::public.provider_type,
    'Care Pet Hospital',
    'কেয়ার পেট হসপিটাল',
    '+8801711223344',
    'info@carepet.bd',
    'TRAD/DHAKA/2026/001',
    'https://carepet.bd',
    'House 10, Road 5, Dhanmondi, Dhaka',
    'বাড়ি ১০, রোড ৫, ধানমন্ডি, ঢাকা',
    23.7461,
    90.3742,
    null,
    true,
    true,
    false,
    2::smallint,
    '{dog,cat,bird}'::public.species_type[],
    '[]'::jsonb,
    array['https://storage.pranora.com/docs/license1.pdf']
  );
end $$;

select isnt_empty(
  "select id from public.providers where name_en = 'Care Pet Hospital' and verification = 'pending'",
  'Provider record inserted with pending verification'
);

select isnt_empty(
  "select id from public.provider_locations where address_en = 'House 10, Road 5, Dhanmondi, Dhaka' and is_24h = true and has_emergency = true",
  'Provider location record inserted with coordinates and emergency flags'
);

select isnt_empty(
  "select id from public.provider_documents where doc_type = 'trade_license'",
  'Provider document record inserted'
);

select * from finish();
rollback;
