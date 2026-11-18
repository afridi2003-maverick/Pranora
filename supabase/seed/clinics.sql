-- ============================================================
-- MAP-SEED: Seed clinic data (DLS upazila hospitals + Dhaka private clinics)
-- Owner: zimia | Branch: zimia | Sprint: S3
-- Depends on: DB-1, DB-4, DB-2, DB-7
-- ============================================================

-- ------------------------------------------------------------
-- 1. Seed Provider Owner Profiles
-- ------------------------------------------------------------
insert into auth.users (id, email)
values
  ('10000000-0000-0000-0000-000000000001', 'cvh.dhaka@dls.gov.bd'),
  ('10000000-0000-0000-0000-000000000002', 'admin@carepetclinic.com'),
  ('10000000-0000-0000-0000-000000000003', 'info@gulshanpet.com'),
  ('10000000-0000-0000-0000-000000000004', 'contact@uttarapet.com'),
  ('10000000-0000-0000-0000-000000000005', 'care@pawlifecare.com'),
  ('10000000-0000-0000-0000-000000000006', 'dls.savar@dls.gov.bd'),
  ('10000000-0000-0000-0000-000000000007', 'dls.ctg@dls.gov.bd')
on conflict (id) do nothing;

insert into public.profiles (id, full_name_bn, full_name_en, phone, preferred_locale)
values
  ('10000000-0000-0000-0000-000000000001', 'কেন্দ্রীয় পশু হাসপাতাল প্রশাসক', 'CVH Dhaka Admin', '+8801711000001', 'bn'),
  ('10000000-0000-0000-0000-000000000002', 'কেয়ার পেট ক্লিনিক পরিচালক', 'Care Pet Clinic Director', '+8801711000002', 'en'),
  ('10000000-0000-0000-0000-000000000003', 'গুলশান পেট ক্লিনিক পরিচালক', 'Gulshan Pet Clinic Admin', '+8801711000003', 'en'),
  ('10000000-0000-0000-0000-000000000004', 'উত্তরা পেট কেয়ার পরিচালক', 'Uttara Pet Care Admin', '+8801711000004', 'en'),
  ('10000000-0000-0000-0000-000000000005', 'প লাইফ কেয়ার পরিচালক', 'PAW Life Care Admin', '+8801711000005', 'bn'),
  ('10000000-0000-0000-0000-000000000006', 'সাভার প্রাণিসম্পদ কর্মকর্তা', 'Savar Livestock Officer', '+8801711000006', 'bn'),
  ('10000000-0000-0000-0000-000000000007', 'চট্টগ্রাম ভেটেরিনারি কর্মকর্তা', 'Chattogram Vet Officer', '+8801711000007', 'bn')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 2. Seed Providers
-- ------------------------------------------------------------
insert into public.providers (
  id, owner_user_id, type, name_bn, name_en, description_bn, description_en,
  phone, whatsapp, email, website, is_government, verification, rating_avg, rating_count
) values
  -- P1: Central Veterinary Hospital (DLS Govt)
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'govt_vet_hospital',
    'কেন্দ্রীয় ভেটেরিনারি হাসপাতাল (সিভিএইচ)',
    'Central Veterinary Hospital (CVH)',
    'প্রাণিসম্পদ অধিদপ্তর পরিচালিত বাংলাদেশের সর্ববৃহৎ সরকারি পশু হাসপাতাল। ২৪ ঘণ্টা জরুরি সেবা ও স্বল্পমূল্যে চিকিৎসা প্রদান করা হয়।',
    'The premier government veterinary hospital operated by the Department of Livestock Services (DLS), offering 24/7 emergency and affordable veterinary treatment.',
    '+8802223382103',
    null,
    'cvh@dls.gov.bd',
    'http://dls.gov.bd',
    true,
    'verified',
    4.5,
    312
  ),
  -- P2: Care Pet Clinic & Hospital (Dhanmondi)
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'pet_hospital',
    'কেয়ার পেট ক্লিনিক অ্যান্ড হাসপাতাল',
    'Care Pet Clinic & Hospital',
    'ধানমন্ডির সর্বাধুনিক পেট হাসপাতাল। ২৪ ঘণ্টা জরুরি চিকিৎসা, ডিজিটাল এক্স-রে, সার্জারি এবং টিকাদান সুবিধা রয়েছে।',
    'Modern multi-specialty pet hospital in Dhanmondi providing 24/7 emergency care, digital X-ray, specialized surgery, and vaccination.',
    '+8801712345678',
    '+8801712345678',
    'info@carepetclinic.com',
    'https://carepetclinic.com',
    false,
    'verified',
    4.8,
    184
  ),
  -- P3: Gulshan Animal Hospital
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    'pet_hospital',
    'গুলশান অ্যানিমেল হাসপাতাল',
    'Gulshan Animal Hospital',
    'গুলশান ২ এ অবস্থিত পূর্ণাঙ্গ পেট কেয়ার সেন্টার। হোম ভিজিট, আল্ট্রাসনোগ্রাম ও ডেন্টাল স্কেলিং সেবা দেওয়া হয়।',
    'Full-service animal clinic in Gulshan-2 providing specialized surgery, home vet visits, diagnostics, and pet grooming.',
    '+8801723456789',
    '+8801723456789',
    'care@gulshanpet.com',
    'https://gulshanpet.com',
    false,
    'verified',
    4.9,
    142
  ),
  -- P4: Uttara Pet Care & Surgery Centre
  (
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000004',
    'vet_clinic',
    'উত্তরা পেট কেয়ার অ্যান্ড সার্জারি সেন্টার',
    'Uttara Pet Care & Surgery Centre',
    'উত্তরা সেক্টর ৭ এ অবস্থিত সার্বক্ষণিক পোষা প্রাণীর চিকিৎসা কেন্দ্র। টিকা, কৃমিনাশক ও অস্ত্রোপচার সেবা।',
    'Dedicated companion animal clinic in Sector 7 Uttara offering emergency treatment, vaccinations, and soft tissue surgeries.',
    '+8801734567890',
    null,
    'uttarapet@gmail.com',
    null,
    false,
    'verified',
    4.6,
    98
  ),
  -- P5: PAW Life Care Pet Clinic (Mirpur)
  (
    '20000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000005',
    'vet_clinic',
    'প লাইফ কেয়ার পেট ক্লিনিক',
    'PAW Life Care Pet Clinic',
    'মিরপুর ১০ এ অবস্থিত নির্ভরযোগ্য ভেটেরিনারি চিকিৎসালয়। অভিজ্ঞ পশু চিকিৎসক দ্বারা পরামর্শ ও টিকা প্রদান।',
    'Affordable and compassionate veterinary care in Mirpur-10 specializing in cats, dogs, and birds.',
    '+8801745678901',
    '+8801745678901',
    'pawlifecare@gmail.com',
    null,
    false,
    'verified',
    4.7,
    76
  ),
  -- P6: Savar DLS Upazila Veterinary Hospital
  (
    '20000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000006',
    'govt_vet_hospital',
    'উপজেলা প্রাণিসম্পদ দপ্তর ও ভেটেরিনারি হাসপাতাল, সাভার',
    'Upazila Livestock Office & Vet Hospital, Savar',
    'সাভার উপজেলায় প্রাণিসম্পদ অধিদপ্তরের সরকারি পশু হাসপাতাল। পোষা প্রাণী ও খামারিদের সরকারি পরামর্শ ও টিকা।',
    'Official government upazila veterinary clinic in Savar providing subsidized vaccines, disease control, and pet treatments.',
    '+88027743210',
    null,
    'ulo.savar@dls.gov.bd',
    'http://ulo.savar.gov.bd',
    true,
    'verified',
    4.4,
    89
  ),
  -- P7: Chattogram District Veterinary Hospital (DLS)
  (
    '20000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000007',
    'govt_vet_hospital',
    'জেলা ভেটেরিনারি হাসপাতাল, চট্টগ্রাম',
    'District Veterinary Hospital, Chattogram',
    'চট্টগ্রাম কোতোয়ালি এলাকায় প্রাণিসম্পদ অধিদপ্তরের জেলা হাসপাতাল। বিশেষজ্ঞ ভেটেরিনারি সার্জন দ্বারা চিকিৎসা।',
    'District-level DLS veterinary hospital in Kotwali Chattogram providing surgical, medical, and emergency care.',
    '+88031612345',
    null,
    'dls.ctg@gmail.com',
    null,
    true,
    'verified',
    4.5,
    115
  )
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 3. Seed Provider Locations (Branches with PostGIS Points)
-- ------------------------------------------------------------
insert into public.provider_locations (
  id, provider_id, name_bn, name_en, address_bn, address_en, upazila_id,
  location, phone, is_24h, has_emergency, offers_home_visit, home_visit_radius_km,
  species_treated, photos, cancel_cutoff_hours, is_active
) values
  -- L1: CVH Dhaka (Kazi Alauddin Rd, Bangshal) - 24/7, Emergency
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'কেন্দ্রীয় শাখা',
    'Main Branch',
    '৪৮ কাজী আলাউদ্দিন রোড, বংশাল, ঢাকা-১১০০',
    '48 Kazi Alauddin Road, Bangshal, Dhaka-1100',
    1801,
    st_setsrid(st_makepoint(90.4070, 23.7196), 4326),
    '+8802223382103',
    true,
    true,
    false,
    null,
    array['dog', 'cat', 'bird', 'rabbit', 'other']::species_type[],
    array['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800'],
    2,
    true
  ),
  -- L2: Care Pet Clinic (Dhanmondi Road 27) - 24/7, Emergency, Home Visit
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'ধানমন্ডি শাখা',
    'Dhanmondi Branch',
    'বাড়ি ২৭, রোড ২৭ (পুরাতন), ধানমন্ডি, ঢাকা-১২০৯',
    'House 27, Road 27 (Old), Dhanmondi, Dhaka-1209',
    1801,
    st_setsrid(st_makepoint(90.3752, 23.7465), 4326),
    '+8801712345678',
    true,
    true,
    true,
    8.0,
    array['dog', 'cat', 'bird', 'rabbit']::species_type[],
    array['https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800'],
    2,
    true
  ),
  -- L3: Gulshan Animal Hospital (Gulshan-2 Road 50) - Emergency, Home Visit
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    'গুলশান শাখা',
    'Gulshan Branch',
    'বাড়ি ১২, রোড ৫০, গুলশান-২, ঢাকা-১২১২',
    'House 12, Road 50, Gulshan-2, Dhaka-1212',
    1802,
    st_setsrid(st_makepoint(90.4150, 23.7930), 4326),
    '+8801723456789',
    false,
    true,
    true,
    10.0,
    array['dog', 'cat', 'bird']::species_type[],
    array['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800'],
    3,
    true
  ),
  -- L4: Uttara Pet Care (Sector 7) - 24/7, Emergency
  (
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000004',
    'উত্তরা শাখা',
    'Uttara Branch',
    'প্লট ৪, রোড ৭/ডি, সেক্টর ৯, উত্তরা, ঢাকা-১২৩০',
    'Plot 4, Road 7/D, Sector 9, Uttara, Dhaka-1230',
    1804,
    st_setsrid(st_makepoint(90.3980, 23.8760), 4326),
    '+8801734567890',
    true,
    true,
    false,
    null,
    array['dog', 'cat']::species_type[],
    array['https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800'],
    2,
    true
  ),
  -- L5: PAW Life Care (Mirpur-10) - Home Visit
  (
    '30000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000005',
    'মিরপুর শাখা',
    'Mirpur Branch',
    'ব্লক সি, রোড ৩, মিরপুর-১০, ঢাকা-১২১৬',
    'Block C, Road 3, Mirpur-10, Dhaka-1216',
    1805,
    st_setsrid(st_makepoint(90.3660, 23.8070), 4326),
    '+8801745678901',
    false,
    false,
    true,
    5.0,
    array['dog', 'cat', 'bird']::species_type[],
    array['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800'],
    1,
    true
  ),
  -- L6: Savar DLS Hospital
  (
    '30000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000006',
    'সাভার কেন্দ্র',
    'Savar Centre',
    'থানা রোড, সাভার বাজার, ঢাকা-১৩৪০',
    'Thana Road, Savar Bazar, Dhaka-1340',
    1801,
    st_setsrid(st_makepoint(90.2600, 23.8500), 4326),
    '+88027743210',
    false,
    true,
    false,
    null,
    array['dog', 'cat', 'other']::species_type[],
    array[],
    2,
    true
  ),
  -- L7: Chattogram District Hospital (Kotwali) - 24/7, Emergency
  (
    '30000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000007',
    'কোতোয়ালি শাখা',
    'Kotwali Branch',
    'আন্দরকিল্লা, কোতোয়ালি, চট্টগ্রাম-৪০০০',
    'Anderkilla, Kotwali, Chattogram-4000',
    1001,
    st_setsrid(st_makepoint(91.8340, 22.3380), 4326),
    '+88031612345',
    true,
    true,
    false,
    null,
    array['dog', 'cat', 'bird', 'rabbit', 'other']::species_type[],
    array[],
    2,
    true
  )
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 4. Operating Hours
-- ------------------------------------------------------------
-- L3 (Gulshan): Sat-Thu 09:00 - 21:00, Fri 15:00 - 21:00
insert into public.location_hours (location_id, weekday, open_time, close_time) values
  ('30000000-0000-0000-0000-000000000003', 0, '09:00:00', '21:00:00'),
  ('30000000-0000-0000-0000-000000000003', 1, '09:00:00', '21:00:00'),
  ('30000000-0000-0000-0000-000000000003', 2, '09:00:00', '21:00:00'),
  ('30000000-0000-0000-0000-000000000003', 3, '09:00:00', '21:00:00'),
  ('30000000-0000-0000-0000-000000000003', 4, '09:00:00', '21:00:00'),
  ('30000000-0000-0000-0000-000000000003', 5, '15:00:00', '21:00:00'),
  ('30000000-0000-0000-0000-000000000003', 6, '09:00:00', '21:00:00')
on conflict (location_id, weekday, open_time) do nothing;

-- L5 (Mirpur): Sat-Thu 10:00 - 20:00
insert into public.location_hours (location_id, weekday, open_time, close_time) values
  ('30000000-0000-0000-0000-000000000005', 0, '10:00:00', '20:00:00'),
  ('30000000-0000-0000-0000-000000000005', 1, '10:00:00', '20:00:00'),
  ('30000000-0000-0000-0000-000000000005', 2, '10:00:00', '20:00:00'),
  ('30000000-0000-0000-0000-000000000005', 3, '10:00:00', '20:00:00'),
  ('30000000-0000-0000-0000-000000000005', 4, '10:00:00', '20:00:00'),
  ('30000000-0000-0000-0000-000000000005', 6, '10:00:00', '20:00:00')
on conflict (location_id, weekday, open_time) do nothing;

-- L6 (Savar DLS): Sun-Thu 09:00 - 17:00 (Govt office hours)
insert into public.location_hours (location_id, weekday, open_time, close_time) values
  ('30000000-0000-0000-0000-000000000006', 0, '09:00:00', '17:00:00'),
  ('30000000-0000-0000-0000-000000000006', 1, '09:00:00', '17:00:00'),
  ('30000000-0000-0000-0000-000000000006', 2, '09:00:00', '17:00:00'),
  ('30000000-0000-0000-0000-000000000006', 3, '09:00:00', '17:00:00'),
  ('30000000-0000-0000-0000-000000000006', 4, '09:00:00', '17:00:00')
on conflict (location_id, weekday, open_time) do nothing;

-- ------------------------------------------------------------
-- 5. Seed Vets (Licensed BVC Vets)
-- ------------------------------------------------------------
insert into public.vets (
  id, full_name_bn, full_name_en, bvc_reg_no, degrees, specialization,
  experience_years, consultation_fee, online_consult, verification
) values
  (
    '40000000-0000-0000-0000-000000000001',
    'ডা. মো. তানভীর আহমেদ',
    'Dr. Md. Tanvir Ahmed',
    'BVC-2481',
    'DVM (BAU), MS in Surgery (BAU)',
    'পশু শল্যচিকিৎসক ও সার্জারি বিশেষজ্ঞ (Small Animal Surgery)',
    9,
    700.00,
    true,
    'verified'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'ডা. সাবরিনা ইয়াসমিন',
    'Dr. Sabrina Yasmin',
    'BVC-3192',
    'DVM (CVASU), MS in Medicine (BAU)',
    'বিড়াল ও কুকুরের মেডিসিন বিশেষজ্ঞ (Feline & Canine Medicine)',
    6,
    600.00,
    true,
    'verified'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    'ডা. কাজী আসাদুজ্জামান',
    'Dr. Kazi Asaduzzaman',
    'BVC-1820',
    'DVM (BAU), PGD in Wildlife & Exotic Animal',
    'পাখি ও বহিরাগত প্রাণী বিশেষজ্ঞ (Avian & Exotic Pets)',
    14,
    800.00,
    false,
    'verified'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    'ডা. রফিকুল ইসলাম',
    'Dr. Rafiqul Islam',
    'BVC-1430',
    'DVM, BCS (Livestock)',
    'উপজেলা প্রাণিসম্পদ কর্মকর্তা (Government Veterinary Surgeon)',
    18,
    100.00,
    false,
    'verified'
  )
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 6. Link Vets to Locations (location_vets)
-- ------------------------------------------------------------
insert into public.location_vets (location_id, vet_id) values
  -- Care Pet Clinic (Dhanmondi)
  ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002'),
  -- Gulshan Animal Hospital
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003'),
  -- CVH Dhaka
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004'),
  -- Savar DLS
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000004')
on conflict (location_id, vet_id) do nothing;

-- ------------------------------------------------------------
-- 7. Seed Provider Services & Pricing (provider_services)
-- ------------------------------------------------------------
-- Services for Care Pet Clinic Dhanmondi (L2)
insert into public.provider_services (location_id, service_id, price, price_max, duration_min, is_active)
select
  '30000000-0000-0000-0000-000000000002',
  s.id,
  case s.slug
    when 'clinic_visit' then 600.00
    when 'vaccine_clinic' then 800.00
    when 'home_vet_visit' then 1200.00
    when 'emergency_care' then 1500.00
    else 500.00
  end,
  case s.slug
    when 'emergency_care' then 2500.00
    else null
  end,
  case s.slug
    when 'home_vet_visit' then 45
    else 20
  end,
  true
from public.services s
where s.slug in ('clinic_visit', 'vaccine_clinic', 'home_vet_visit', 'emergency_care')
on conflict (location_id, service_id) do nothing;

-- Services for Gulshan Animal Hospital (L3)
insert into public.provider_services (location_id, service_id, price, price_max, duration_min, is_active)
select
  '30000000-0000-0000-0000-000000000003',
  s.id,
  case s.slug
    when 'clinic_visit' then 800.00
    when 'vaccine_clinic' then 1000.00
    when 'home_vet_visit' then 1500.00
    when 'emergency_care' then 2000.00
    else 600.00
  end,
  case s.slug
    when 'emergency_care' then 3000.00
    else null
  end,
  case s.slug
    when 'home_vet_visit' then 60
    else 30
  end,
  true
from public.services s
where s.slug in ('clinic_visit', 'vaccine_clinic', 'home_vet_visit', 'emergency_care')
on conflict (location_id, service_id) do nothing;

-- Services for Central Veterinary Hospital CVH (L1 - Govt subsidized)
insert into public.provider_services (location_id, service_id, price, price_max, duration_min, is_active)
select
  '30000000-0000-0000-0000-000000000001',
  s.id,
  case s.slug
    when 'clinic_visit' then 50.00
    when 'vaccine_clinic' then 100.00
    when 'emergency_care' then 150.00
    else 50.00
  end,
  null,
  15,
  true
from public.services s
where s.slug in ('clinic_visit', 'vaccine_clinic', 'emergency_care')
on conflict (location_id, service_id) do nothing;

-- Services for Uttara Pet Care (L4)
insert into public.provider_services (location_id, service_id, price, price_max, duration_min, is_active)
select
  '30000000-0000-0000-0000-000000000004',
  s.id,
  case s.slug
    when 'clinic_visit' then 500.00
    when 'vaccine_clinic' then 700.00
    when 'emergency_care' then 1200.00
    else 400.00
  end,
  null,
  20,
  true
from public.services s
where s.slug in ('clinic_visit', 'vaccine_clinic', 'emergency_care')
on conflict (location_id, service_id) do nothing;

-- Services for PAW Life Care Mirpur (L5)
insert into public.provider_services (location_id, service_id, price, price_max, duration_min, is_active)
select
  '30000000-0000-0000-0000-000000000005',
  s.id,
  case s.slug
    when 'clinic_visit' then 400.00
    when 'vaccine_clinic' then 600.00
    when 'home_vet_visit' then 1000.00
    else 300.00
  end,
  null,
  20,
  true
from public.services s
where s.slug in ('clinic_visit', 'vaccine_clinic', 'home_vet_visit')
on conflict (location_id, service_id) do nothing;
