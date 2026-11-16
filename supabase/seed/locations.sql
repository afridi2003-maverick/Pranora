-- ============================================================
-- DB-2: Seed divisions, districts, upazilas for Bangladesh
-- Owner: afridi | Branch: afridi | Sprint: S2
-- ============================================================

-- ------------------------------------------------------------
-- 1. Divisions (8 divisions)
-- ------------------------------------------------------------
insert into public.divisions (id, name_bn, name_en) values
  (1, 'বরিশাল', 'Barishal'),
  (2, 'চট্টগ্রাম', 'Chattogram'),
  (3, 'ঢাকা', 'Dhaka'),
  (4, 'খুলনা', 'Khulna'),
  (5, 'ময়মনসিংহ', 'Mymensingh'),
  (6, 'রাজশাহী', 'Rajshahi'),
  (7, 'রংপুর', 'Rangpur'),
  (8, 'সিলেট', 'Sylhet')
on conflict (id) do update set
  name_bn = excluded.name_bn,
  name_en = excluded.name_en;

-- ------------------------------------------------------------
-- 2. Districts (64 districts)
-- ------------------------------------------------------------
insert into public.districts (id, division_id, name_bn, name_en) values
  -- Barishal (1)
  (1, 1, 'বরগুনা', 'Barguna'),
  (2, 1, 'বরিশাল', 'Barishal'),
  (3, 1, 'ভোলা', 'Bhola'),
  (4, 1, 'ঝালকাঠি', 'Jhalokati'),
  (5, 1, 'পটুয়াখালী', 'Patuakhali'),
  (6, 1, 'পিরোজপুর', 'Pirojpur'),

  -- Chattogram (2)
  (7, 2, 'বান্দরবান', 'Bandarban'),
  (8, 2, 'ব্রাহ্মণবাড়িয়া', 'Brahmanbaria'),
  (9, 2, 'চাঁদপুর', 'Chandpur'),
  (10, 2, 'চট্টগ্রাম', 'Chattogram'),
  (11, 2, 'কক্সবাজার', 'Cox''s Bazar'),
  (12, 2, 'কুমিল্লা', 'Cumilla'),
  (13, 2, 'ফেনী', 'Feni'),
  (14, 2, 'খাগড়াছড়ি', 'Khagrachhari'),
  (15, 2, 'লক্ষ্মীপুর', 'Lakshmipur'),
  (16, 2, 'নোয়াখালী', 'Noakhali'),
  (17, 2, 'রাঙ্গামাটি', 'Rangamati'),

  -- Dhaka (3)
  (18, 3, 'ঢাকা', 'Dhaka'),
  (19, 3, 'ফরিদপুর', 'Faridpur'),
  (20, 3, 'গাজীপুর', 'Gazipur'),
  (21, 3, 'গোপালগঞ্জ', 'Gopalganj'),
  (22, 3, 'কিশোরগঞ্জ', 'Kishoreganj'),
  (23, 3, 'মাদারীপুর', 'Madaripur'),
  (24, 3, 'মানিকগঞ্জ', 'Manikganj'),
  (25, 3, 'মুন্সীগঞ্জ', 'Munshiganj'),
  (26, 3, 'নারায়ণগঞ্জ', 'Narayanganj'),
  (27, 3, 'নরসিংদী', 'Narsingdi'),
  (28, 3, 'রাজবাড়ী', 'Rajbari'),
  (29, 3, 'শরীয়তপুর', 'Shariatpur'),
  (30, 3, 'টাঙ্গাইল', 'Tangail'),

  -- Khulna (4)
  (31, 4, 'বাগেরহাট', 'Bagerhat'),
  (32, 4, 'চুয়াডাঙ্গা', 'Chuadanga'),
  (33, 4, 'যশোর', 'Jashore'),
  (34, 4, 'ঝিনাইদহ', 'Jhenaidah'),
  (35, 4, 'খুলনা', 'Khulna'),
  (36, 4, 'কুষ্টিয়া', 'Kushtia'),
  (37, 4, 'মাগুরা', 'Magura'),
  (38, 4, 'মেহেরপুর', 'Meherpur'),
  (39, 4, 'নড়াইল', 'Narail'),
  (40, 4, 'সাতক্ষীরা', 'Satkhira'),

  -- Mymensingh (5)
  (41, 5, 'জামালপুর', 'Jamalpur'),
  (42, 5, 'ময়মনসিংহ', 'Mymensingh'),
  (43, 5, 'নেত্রকোণা', 'Netrokona'),
  (44, 5, 'শেরপুর', 'Sherpur'),

  -- Rajshahi (6)
  (45, 6, 'বগুড়া', 'Bogura'),
  (46, 6, 'জয়পুরহাট', 'Joypurhat'),
  (47, 6, 'নওগাঁ', 'Naogaon'),
  (48, 6, 'নাটোর', 'Natore'),
  (49, 6, 'চাঁপাইনবাবগঞ্জ', 'Chapainawabganj'),
  (50, 6, 'পাবনা', 'Pabna'),
  (51, 6, 'রাজশাহী', 'Rajshahi'),
  (52, 6, 'সিরাজগঞ্জ', 'Sirajganj'),

  -- Rangpur (7)
  (53, 7, 'দিনাজপুর', 'Dinajpur'),
  (54, 7, 'গাইবান্ধা', 'Gaibandha'),
  (55, 7, 'কুড়িগ্রাম', 'Kurigram'),
  (56, 7, 'লালমনিরহাট', 'Lalmonirhat'),
  (57, 7, 'নীলফামারী', 'Nilphamari'),
  (58, 7, 'পঞ্চগড়', 'Panchagarh'),
  (59, 7, 'রংপুর', 'Rangpur'),
  (60, 7, 'ঠাকুরগাঁও', 'Thakurgaon'),

  -- Sylhet (8)
  (61, 8, 'হবিগঞ্জ', 'Habiganj'),
  (62, 8, 'মৌলভীবাজার', 'Moulvibazar'),
  (63, 8, 'সুনামগঞ্জ', 'Sunamganj'),
  (64, 8, 'সিলেট', 'Sylhet')
on conflict (id) do update set
  division_id = excluded.division_id,
  name_bn     = excluded.name_bn,
  name_en     = excluded.name_en;

-- ------------------------------------------------------------
-- 3. Key Upazilas / Thanas (including major Dhaka & metropolitan areas)
-- ------------------------------------------------------------
insert into public.upazilas (id, district_id, name_bn, name_en, center) values
  -- Dhaka City Thanas & Upazilas (District 18)
  (1801, 18, 'ধানমন্ডি', 'Dhanmondi', ST_SetSRID(ST_MakePoint(90.3742, 23.7461), 4326)),
  (1802, 18, 'গুলশান', 'Gulshan', ST_SetSRID(ST_MakePoint(90.4152, 23.7925), 4326)),
  (1803, 18, 'বনানী', 'Banani', ST_SetSRID(ST_MakePoint(90.4037, 23.7937), 4326)),
  (1804, 18, 'উত্তরা', 'Uttara', ST_SetSRID(ST_MakePoint(90.3980, 23.8759), 4326)),
  (1805, 18, 'মিরপুর', 'Mirpur', ST_SetSRID(ST_MakePoint(90.3654, 23.8071), 4326)),
  (1806, 18, 'মোহাম্মদপুর', 'Mohammadpur', ST_SetSRID(ST_MakePoint(90.3617, 23.7658), 4326)),
  (1807, 18, 'তেজগাঁও', 'Tejgaon', ST_SetSRID(ST_MakePoint(90.3923, 23.7600), 4326)),
  (1808, 18, 'খিলগাঁও', 'Khilgaon', ST_SetSRID(ST_MakePoint(90.4285, 23.7516), 4326)),
  (1809, 18, 'বাড্ডা', 'Badda', ST_SetSRID(ST_MakePoint(90.4262, 23.7805), 4326)),
  (1810, 18, 'পল্লবী', 'Pallabi', ST_SetSRID(ST_MakePoint(90.3644, 23.8262), 4326)),
  (1811, 18, 'মতিঝিল', 'Motijheel', ST_SetSRID(ST_MakePoint(90.4172, 23.7331), 4326)),
  (1812, 18, 'লালবাগ', 'Lalbagh', ST_SetSRID(ST_MakePoint(90.3872, 23.7196), 4326)),
  (1813, 18, 'রমনা', 'Ramna', ST_SetSRID(ST_MakePoint(90.4043, 23.7415), 4326)),
  (1814, 18, 'সাভার', 'Savar', ST_SetSRID(ST_MakePoint(90.2647, 23.8583), 4326)),
  (1815, 18, 'কেরানীগঞ্জ', 'Keraniganj', ST_SetSRID(ST_MakePoint(90.3114, 23.6844), 4326)),
  (1816, 18, 'ধামরাই', 'Dhamrai', ST_SetSRID(ST_MakePoint(90.2114, 23.9189), 4326)),

  -- Chattogram Thanas & Upazilas (District 10)
  (1001, 10, 'পাঁচলাইশ', 'Panchlaish', ST_SetSRID(ST_MakePoint(91.8248, 22.3687), 4326)),
  (1002, 10, 'কোতোয়ালী (চট্টগ্রাম)', 'Kotwali (Chattogram)', ST_SetSRID(ST_MakePoint(91.8340, 22.3353), 4326)),
  (1003, 10, 'ডবলমুরিং', 'Double Mooring', ST_SetSRID(ST_MakePoint(91.8105, 22.3385), 4326)),
  (1004, 10, 'হালিশহর', 'Halishahar', ST_SetSRID(ST_MakePoint(91.7854, 22.3274), 4326)),
  (1005, 10, 'পতেঙ্গা', 'Patenga', ST_SetSRID(ST_MakePoint(91.7925, 22.2464), 4326)),
  (1006, 10, 'চান্দগাঁও', 'Chandgaon', ST_SetSRID(ST_MakePoint(91.8540, 22.3789), 4326)),
  (1007, 10, 'হাটহাজারী', 'Hathazari', ST_SetSRID(ST_MakePoint(91.8080, 22.5080), 4326)),

  -- Gazipur (District 20)
  (2001, 20, 'গাজীপুর সদর', 'Gazipur Sadar', ST_SetSRID(ST_MakePoint(90.4286, 23.9999), 4326)),
  (2002, 20, 'টঙ্গী', 'Tongi', ST_SetSRID(ST_MakePoint(90.4000, 23.8969), 4326)),
  (2003, 20, 'কালিয়াকৈর', 'Kaliakair', ST_SetSRID(ST_MakePoint(90.2167, 24.0667), 4326)),

  -- Narayanganj (District 26)
  (2601, 26, 'নারায়ণগঞ্জ সদর', 'Narayanganj Sadar', ST_SetSRID(ST_MakePoint(90.5000, 23.6238), 4326)),
  (2602, 26, 'সোনারগাঁও', 'Sonargaon', ST_SetSRID(ST_MakePoint(90.6167, 23.6500), 4326)),

  -- Sylhet (District 64)
  (6401, 64, 'সিলেট সদর', 'Sylhet Sadar', ST_SetSRID(ST_MakePoint(91.8687, 24.8949), 4326)),
  (6402, 64, 'বিয়ানীবাজার', 'Beanibazar', ST_SetSRID(ST_MakePoint(92.1625, 24.8250), 4326)),
  (6403, 64, 'গোলাপগঞ্জ', 'Golapganj', ST_SetSRID(ST_MakePoint(92.0167, 24.8667), 4326)),

  -- Rajshahi (District 51)
  (5101, 51, 'বোয়ালিয়া', 'Boalia', ST_SetSRID(ST_MakePoint(88.6014, 24.3636), 4326)),
  (5102, 51, 'রাজপাড়া', 'Rajpara', ST_SetSRID(ST_MakePoint(88.5833, 24.3750), 4326)),
  (5103, 51, 'পবা', 'Paba', ST_SetSRID(ST_MakePoint(88.6333, 24.4333), 4326)),

  -- Khulna (District 35)
  (3501, 35, 'খুলনা সদর', 'Khulna Sadar', ST_SetSRID(ST_MakePoint(89.5644, 22.8158), 4326)),
  (3502, 35, 'সোনাডাঙ্গা', 'Sonadanga', ST_SetSRID(ST_MakePoint(89.5417, 22.8250), 4326)),
  (3503, 35, 'খালিশপুর', 'Khalishpur', ST_SetSRID(ST_MakePoint(89.5333, 22.8667), 4326)),

  -- Barishal (District 2)
  (201, 2, 'বরিশাল সদর (কোতোয়ালী)', 'Barishal Sadar (Kotwali)', ST_SetSRID(ST_MakePoint(90.3696, 22.7010), 4326)),

  -- Mymensingh (District 42)
  (4201, 42, 'ময়মনসিংহ সদর', 'Mymensingh Sadar', ST_SetSRID(ST_MakePoint(90.4073, 24.7471), 4326)),

  -- Rangpur (District 59)
  (5901, 59, 'রংপুর সদর', 'Rangpur Sadar', ST_SetSRID(ST_MakePoint(89.2467, 25.7439), 4326)),

  -- Cumilla (District 12)
  (1201, 12, 'কুমিল্লা আদর্শ সদর', 'Cumilla Adarsha Sadar', ST_SetSRID(ST_MakePoint(91.1809, 23.4607), 4326)),

  -- Cox's Bazar (District 11)
  (1101, 11, 'কক্সবাজার সদর', 'Cox''s Bazar Sadar', ST_SetSRID(ST_MakePoint(91.9882, 21.4272), 4326)),

  -- Bogura (District 45)
  (4501, 45, 'বগুড়া সদর', 'Bogura Sadar', ST_SetSRID(ST_MakePoint(89.3730, 24.8465), 4326)),

  -- Jashore (District 33)
  (3301, 33, 'যশোর সদর', 'Jashore Sadar', ST_SetSRID(ST_MakePoint(89.2167, 23.1667), 4326))
on conflict (id) do update set
  district_id = excluded.district_id,
  name_bn     = excluded.name_bn,
  name_en     = excluded.name_en,
  center      = excluded.center;
