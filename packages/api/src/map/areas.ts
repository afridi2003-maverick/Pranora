/**
 * MAP-4: Bangladesh Division / District / Upazila Hierarchy & Area Search
 * Conforms to DB-2 (seed/locations.sql) & schema.md §4.1
 * Owner: Zimia | Sprint: S6
 */

export interface DivisionItem {
  id: number;
  nameBn: string;
  nameEn: string;
}

export interface DistrictItem {
  id: number;
  divisionId: number;
  nameBn: string;
  nameEn: string;
}

export interface UpazilaItem {
  id: number;
  districtId: number;
  nameBn: string;
  nameEn: string;
  lat: number;
  lng: number;
}

export interface AreaSearchResult {
  id: number;
  type: 'upazila' | 'district' | 'division';
  nameBn: string;
  nameEn: string;
  parentNameBn?: string;
  parentNameEn?: string;
  lat: number;
  lng: number;
}

export const DIVISIONS: DivisionItem[] = [
  { id: 1, nameBn: 'বরিশাল', nameEn: 'Barishal' },
  { id: 2, nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram' },
  { id: 3, nameBn: 'ঢাকা', nameEn: 'Dhaka' },
  { id: 4, nameBn: 'খুলনা', nameEn: 'Khulna' },
  { id: 5, nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh' },
  { id: 6, nameBn: 'রাজশাহী', nameEn: 'Rajshahi' },
  { id: 7, nameBn: 'রংপুর', nameEn: 'Rangpur' },
  { id: 8, nameBn: 'সিলেট', nameEn: 'Sylhet' },
];

export const DISTRICTS: DistrictItem[] = [
  // Barishal (1)
  { id: 1, divisionId: 1, nameBn: 'বরগুনা', nameEn: 'Barguna' },
  { id: 2, divisionId: 1, nameBn: 'বরিশাল', nameEn: 'Barishal' },
  { id: 3, divisionId: 1, nameBn: 'ভোলা', nameEn: 'Bhola' },
  { id: 4, divisionId: 1, nameBn: 'ঝালকাঠি', nameEn: 'Jhalokati' },
  { id: 5, divisionId: 1, nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali' },
  { id: 6, divisionId: 1, nameBn: 'পিরোজপুর', nameEn: 'Pirojpur' },

  // Chattogram (2)
  { id: 7, divisionId: 2, nameBn: 'বান্দরবান', nameEn: 'Bandarban' },
  { id: 8, divisionId: 2, nameBn: 'ব্রাহ্মণবাড়িয়া', nameEn: 'Brahmanbaria' },
  { id: 9, divisionId: 2, nameBn: 'চাঁদপুর', nameEn: 'Chandpur' },
  { id: 10, divisionId: 2, nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram' },
  { id: 11, divisionId: 2, nameBn: 'কক্সবাজার', nameEn: "Cox's Bazar" },
  { id: 12, divisionId: 2, nameBn: 'কুমিল্লা', nameEn: 'Cumilla' },
  { id: 13, divisionId: 2, nameBn: 'ফেনী', nameEn: 'Feni' },
  { id: 14, divisionId: 2, nameBn: 'খাগড়াছড়ি', nameEn: 'Khagrachhari' },
  { id: 15, divisionId: 2, nameBn: 'লক্ষ্মীপুর', nameEn: 'Lakshmipur' },
  { id: 16, divisionId: 2, nameBn: 'নোয়াখালী', nameEn: 'Noakhali' },
  { id: 17, divisionId: 2, nameBn: 'রাঙ্গামাটি', nameEn: 'Rangamati' },

  // Dhaka (3)
  { id: 18, divisionId: 3, nameBn: 'ঢাকা', nameEn: 'Dhaka' },
  { id: 19, divisionId: 3, nameBn: 'ফরিদপুর', nameEn: 'Faridpur' },
  { id: 20, divisionId: 3, nameBn: 'গাজীপুর', nameEn: 'Gazipur' },
  { id: 21, divisionId: 3, nameBn: 'গোপালগঞ্জ', nameEn: 'Gopalganj' },
  { id: 22, divisionId: 3, nameBn: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj' },
  { id: 23, divisionId: 3, nameBn: 'মাদারীপুর', nameEn: 'Madaripur' },
  { id: 24, divisionId: 3, nameBn: 'মানিকগঞ্জ', nameEn: 'Manikganj' },
  { id: 25, divisionId: 3, nameBn: 'মুন্সীগঞ্জ', nameEn: 'Munshiganj' },
  { id: 26, divisionId: 3, nameBn: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj' },
  { id: 27, divisionId: 3, nameBn: 'নরসিংদী', nameEn: 'Narsingdi' },
  { id: 28, divisionId: 3, nameBn: 'রাজবাড়ী', nameEn: 'Rajbari' },
  { id: 29, divisionId: 3, nameBn: 'শরীয়তপুর', nameEn: 'Shariatpur' },
  { id: 30, divisionId: 3, nameBn: 'টাঙ্গাইল', nameEn: 'Tangail' },

  // Khulna (4)
  { id: 31, divisionId: 4, nameBn: 'বাগেরহাট', nameEn: 'Bagerhat' },
  { id: 32, divisionId: 4, nameBn: 'চুয়াডাঙ্গা', nameEn: 'Chuadanga' },
  { id: 33, divisionId: 4, nameBn: 'যশোর', nameEn: 'Jashore' },
  { id: 34, divisionId: 4, nameBn: 'ঝিনাইদহ', nameEn: 'Jhenaidah' },
  { id: 35, divisionId: 4, nameBn: 'খুলনা', nameEn: 'Khulna' },
  { id: 36, divisionId: 4, nameBn: 'কুষ্টিয়া', nameEn: 'Kushtia' },
  { id: 37, divisionId: 4, nameBn: 'মাগুরা', nameEn: 'Magura' },
  { id: 38, divisionId: 4, nameBn: 'মেহেরপুর', nameEn: 'Meherpur' },
  { id: 39, divisionId: 4, nameBn: 'নড়াইল', nameEn: 'Narail' },
  { id: 40, divisionId: 4, nameBn: 'সাতক্ষীরা', nameEn: 'Satkhira' },

  // Mymensingh (5)
  { id: 41, divisionId: 5, nameBn: 'জামালপুর', nameEn: 'Jamalpur' },
  { id: 42, divisionId: 5, nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh' },
  { id: 43, divisionId: 5, nameBn: 'নেত্রকোণা', nameEn: 'Netrokona' },
  { id: 44, divisionId: 5, nameBn: 'শেরপুর', nameEn: 'Sherpur' },

  // Rajshahi (6)
  { id: 45, divisionId: 6, nameBn: 'বগুড়া', nameEn: 'Bogura' },
  { id: 46, divisionId: 6, nameBn: 'জয়পুরহাট', nameEn: 'Joypurhat' },
  { id: 47, divisionId: 6, nameBn: 'নওগাঁ', nameEn: 'Naogaon' },
  { id: 48, divisionId: 6, nameBn: 'নাটোর', nameEn: 'Natore' },
  { id: 49, divisionId: 6, nameBn: 'চাঁপাইনবাবগঞ্জ', nameEn: 'Chapainawabganj' },
  { id: 50, divisionId: 6, nameBn: 'পাবনা', nameEn: 'Pabna' },
  { id: 51, divisionId: 6, nameBn: 'রাজশাহী', nameEn: 'Rajshahi' },
  { id: 52, divisionId: 6, nameBn: 'সিরাজগঞ্জ', nameEn: 'Sirajganj' },

  // Rangpur (7)
  { id: 53, divisionId: 7, nameBn: 'দিনাজপুর', nameEn: 'Dinajpur' },
  { id: 54, divisionId: 7, nameBn: 'গাইবান্ধা', nameEn: 'Gaibandha' },
  { id: 55, divisionId: 7, nameBn: 'কুড়িগ্রাম', nameEn: 'Kurigram' },
  { id: 56, divisionId: 7, nameBn: 'লালমনিরহাট', nameEn: 'Lalmonirhat' },
  { id: 57, divisionId: 7, nameBn: 'নীলফামারী', nameEn: 'Nilphamari' },
  { id: 58, divisionId: 7, nameBn: 'পঞ্চগড়', nameEn: 'Panchagarh' },
  { id: 59, divisionId: 7, nameBn: 'রংপুর', nameEn: 'Rangpur' },
  { id: 60, divisionId: 7, nameBn: 'ঠাকুরগাঁও', nameEn: 'Thakurgaon' },

  // Sylhet (8)
  { id: 61, divisionId: 8, nameBn: 'হবিগঞ্জ', nameEn: 'Habiganj' },
  { id: 62, divisionId: 8, nameBn: 'মৌলভীবাজার', nameEn: 'Moulvibazar' },
  { id: 63, divisionId: 8, nameBn: 'সুনামগঞ্জ', nameEn: 'Sunamganj' },
  { id: 64, divisionId: 8, nameBn: 'সিলেট', nameEn: 'Sylhet' },
];

export const UPAZILAS: UpazilaItem[] = [
  // Dhaka Metro Thanas (District 18)
  { id: 1801, districtId: 18, nameBn: 'ধানমন্ডি', nameEn: 'Dhanmondi', lat: 23.7461, lng: 90.3742 },
  { id: 1802, districtId: 18, nameBn: 'গুলশান', nameEn: 'Gulshan', lat: 23.7925, lng: 90.4152 },
  { id: 1803, districtId: 18, nameBn: 'বনানী', nameEn: 'Banani', lat: 23.7937, lng: 90.4037 },
  { id: 1804, districtId: 18, nameBn: 'উত্তরা', nameEn: 'Uttara', lat: 23.8759, lng: 90.398 },
  { id: 1805, districtId: 18, nameBn: 'মিরপুর', nameEn: 'Mirpur', lat: 23.8071, lng: 90.3654 },
  { id: 1806, districtId: 18, nameBn: 'মোহাম্মদপুর', nameEn: 'Mohammadpur', lat: 23.7658, lng: 90.3617 },
  { id: 1807, districtId: 18, nameBn: 'তেজগাঁও', nameEn: 'Tejgaon', lat: 23.76, lng: 90.3923 },
  { id: 1808, districtId: 18, nameBn: 'খিলগাঁও', nameEn: 'Khilgaon', lat: 23.7516, lng: 90.4285 },
  { id: 1809, districtId: 18, nameBn: 'বাড্ডা', nameEn: 'Badda', lat: 23.7805, lng: 90.4262 },
  { id: 1810, districtId: 18, nameBn: 'পল্লবী', nameEn: 'Pallabi', lat: 23.8262, lng: 90.3644 },
  { id: 1811, districtId: 18, nameBn: 'মতিঝিল', nameEn: 'Motijheel', lat: 23.7331, lng: 90.4172 },
  { id: 1812, districtId: 18, nameBn: 'লালবাগ', nameEn: 'Lalbagh', lat: 23.7196, lng: 90.3872 },
  { id: 1813, districtId: 18, nameBn: 'রমনা', nameEn: 'Ramna', lat: 23.7415, lng: 90.4043 },
  { id: 1814, districtId: 18, nameBn: 'সাভার', nameEn: 'Savar', lat: 23.8583, lng: 90.2647 },
  { id: 1815, districtId: 18, nameBn: 'কেরানীগঞ্জ', nameEn: 'Keraniganj', lat: 23.6844, lng: 90.3114 },
  { id: 1816, districtId: 18, nameBn: 'ধামরাই', nameEn: 'Dhamrai', lat: 23.9189, lng: 90.2114 },

  // Chattogram (District 10)
  { id: 1001, districtId: 10, nameBn: 'পাঁচলাইশ', nameEn: 'Panchlaish', lat: 22.3687, lng: 91.8248 },
  { id: 1002, districtId: 10, nameBn: 'কোতোয়ালী (চট্টগ্রাম)', nameEn: 'Kotwali (Chattogram)', lat: 22.3353, lng: 91.834 },
  { id: 1003, districtId: 10, nameBn: 'ডবলমুরিং', nameEn: 'Double Mooring', lat: 22.3385, lng: 91.8105 },
  { id: 1004, districtId: 10, nameBn: 'হালিশহর', nameEn: 'Halishahar', lat: 22.3274, lng: 91.7854 },
  { id: 1005, districtId: 10, nameBn: 'পতেঙ্গা', nameEn: 'Patenga', lat: 22.2464, lng: 91.7925 },
  { id: 1006, districtId: 10, nameBn: 'চান্দগাঁও', nameEn: 'Chandgaon', lat: 22.3789, lng: 91.854 },
  { id: 1007, districtId: 10, nameBn: 'হাটহাজারী', nameEn: 'Hathazari', lat: 22.508, lng: 91.808 },

  // Gazipur (District 20)
  { id: 2001, districtId: 20, nameBn: 'গাজীপুর সদর', nameEn: 'Gazipur Sadar', lat: 23.9999, lng: 90.4286 },
  { id: 2002, districtId: 20, nameBn: 'টঙ্গী', nameEn: 'Tongi', lat: 23.8969, lng: 90.4 },
  { id: 2003, districtId: 20, nameBn: 'কালিয়াকৈর', nameEn: 'Kaliakair', lat: 24.0667, lng: 90.2167 },

  // Narayanganj (District 26)
  { id: 2601, districtId: 26, nameBn: 'নারায়ণগঞ্জ সদর', nameEn: 'Narayanganj Sadar', lat: 23.6238, lng: 90.5 },
  { id: 2602, districtId: 26, nameBn: 'সোনারগাঁও', nameEn: 'Sonargaon', lat: 23.65, lng: 90.6167 },

  // Sylhet (District 64)
  { id: 6401, districtId: 64, nameBn: 'সিলেট সদর', nameEn: 'Sylhet Sadar', lat: 24.8949, lng: 91.8687 },
  { id: 6402, districtId: 64, nameBn: 'শ্রীমঙ্গল', nameEn: 'Sreemangal', lat: 24.3065, lng: 91.7336 },
];

/**
 * Returns all 8 administrative divisions of Bangladesh.
 */
export function getDivisions(): DivisionItem[] {
  return DIVISIONS;
}

/**
 * Returns districts for a given division ID.
 */
export function getDistrictsByDivision(divisionId: number): DistrictItem[] {
  return DISTRICTS.filter((d) => d.divisionId === divisionId);
}

/**
 * Returns upazilas/thanas for a given district ID.
 */
export function getUpazilasByDistrict(districtId: number): UpazilaItem[] {
  return UPAZILAS.filter((u) => u.districtId === districtId);
}

/**
 * Returns an upazila by its unique ID.
 */
export function getUpazilaById(id: number): UpazilaItem | undefined {
  return UPAZILAS.find((u) => u.id === id);
}

/**
 * Instant search across upazilas, districts, and divisions by name (Bangla or English).
 */
export function searchAreas(query: string): AreaSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: AreaSearchResult[] = [];

  // 1. Search Upazilas
  for (const u of UPAZILAS) {
    if (u.nameBn.toLowerCase().includes(q) || u.nameEn.toLowerCase().includes(q)) {
      const dist = DISTRICTS.find((d) => d.id === u.districtId);
      const div = dist ? DIVISIONS.find((v) => v.id === dist.divisionId) : undefined;
      results.push({
        id: u.id,
        type: 'upazila',
        nameBn: u.nameBn,
        nameEn: u.nameEn,
        parentNameBn: dist ? `${dist.nameBn}, ${div?.nameBn ?? ''}` : undefined,
        parentNameEn: dist ? `${dist.nameEn}, ${div?.nameEn ?? ''}` : undefined,
        lat: u.lat,
        lng: u.lng,
      });
    }
  }

  // 2. Search Districts (default to district center)
  for (const d of DISTRICTS) {
    if (d.nameBn.toLowerCase().includes(q) || d.nameEn.toLowerCase().includes(q)) {
      const div = DIVISIONS.find((v) => v.id === d.divisionId);
      // Find upazila in this district as center reference
      const firstUpazila = UPAZILAS.find((u) => u.districtId === d.id);
      results.push({
        id: d.id,
        type: 'district',
        nameBn: d.nameBn,
        nameEn: d.nameEn,
        parentNameBn: div ? `${div.nameBn} বিভাগ` : undefined,
        parentNameEn: div ? `${div.nameEn} Division` : undefined,
        lat: firstUpazila?.lat ?? 23.7465,
        lng: firstUpazila?.lng ?? 90.3752,
      });
    }
  }

  return results.slice(0, 10);
}
