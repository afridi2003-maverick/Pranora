import { getAllMockClinics } from './mock';
import { calculateDistanceMeters } from '../map';

/**
 * Service Catalog item metadata conforming to DB-7 & schema.md §7.2
 */
export interface ServiceCatalogItem {
  id: number;
  slug: string;
  categorySlug: string;
  nameBn: string;
  nameEn: string;
  icon: string;
  descriptionBn: string;
  descriptionEn: string;
  priceRangeBn: string;
  priceRangeEn: string;
  isMvp: boolean;
  howItWorksBn: string[];
  howItWorksEn: string[];
}

/**
 * Provider offering a specific service (SVC-2: schema.md §5.4.5 integration contract 6)
 */
export interface ProviderServiceOffering {
  locationId: string;
  providerId: string;
  clinicNameBn: string;
  clinicNameEn: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  ratingAvg: number;
  ratingCount: number;
  isGovernment: boolean;
  is24h: boolean;
  hasEmergency: boolean;
  offersHomeVisit: boolean;
  isOpenNow: boolean;
  lat: number;
  lng: number;
  distanceM: number;
  serviceId: string;
  serviceSlug: string;
  serviceNameBn: string;
  serviceNameEn: string;
  price: number;
  durationMinutes: number;
  vetsCount: number;
}

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: 1,
    slug: 'clinic_visit',
    categorySlug: 'vet',
    nameBn: 'ক্লিনিকে ডাক্তার দেখানো (জেনারেল চেকআপ)',
    nameEn: 'Clinic Consultation & General Checkup',
    icon: '🩺',
    descriptionBn: 'অভিজ্ঞ বিসিভি নিবন্ধিত ভেটেরিনারি সার্জনের সরাসরি পরামর্শ, শারীরিক পরীক্ষা ও প্রেসক্রিপশন।',
    descriptionEn: 'In-person physical checkup, diagnosis, and prescription by BVC licensed veterinary surgeons.',
    priceRangeBn: '৳৫০ – ৳৮০০',
    priceRangeEn: '৳50 – ৳800',
    isMvp: true,
    howItWorksBn: [
      'আপনার এলাকার নিকটস্থ ক্লিনিক ও সুবিধাজনক সময় বেছে নিন।',
      'আপনার পোষা প্রাণীর প্রোফাইল ও সমস্যার বিবরণ নির্বাচন করুন।',
      'সরাসরি ক্লিনিকে গিয়ে সেবা গ্রহণ করুন ও সহজে অর্থ প্রদান করুন।',
    ],
    howItWorksEn: [
      'Choose a nearby clinic and convenient slot or serial.',
      'Select your pet profile and summarize symptoms.',
      'Visit the clinic for checkup and pay at counter.',
    ],
  },
  {
    id: 2,
    slug: 'vaccine_clinic',
    categorySlug: 'vaccination',
    nameBn: 'টিকা প্রদান ও ডিওয়ার্মিং সেবা',
    nameEn: 'Pet Vaccination & Deworming Clinic',
    icon: '💉',
    descriptionBn: 'র্যাবিস, ডিএইচপিপি (DHPP) ও এফভিআরসিপি (FVRCP) কোল্ড-চেইন নিয়ন্ত্রিত প্রমিত ভ্যাকসিনেশন।',
    descriptionEn: 'Cold-chain certified Rabies, DHPP, and FVRCP vaccinations administered by licensed vets.',
    priceRangeBn: '৳৮০ – ৳১০০০',
    priceRangeEn: '৳80 – ৳1000',
    isMvp: true,
    howItWorksBn: [
      'প্রয়োজনীয় টিকা ও নিকটস্থ ভেরিফায়েড কেন্দ্র বেছে নিন।',
      'টিকার তারিখ বুক করুন এবং অ্যাপে ডিজিটাল ভ্যাকসিন কার্ড পান।',
      'ভ্যাকসিন সম্পন্ন হওয়ার পর পরবর্তী বুস্টার রিমাইন্ডার সক্রিয় হবে।',
    ],
    howItWorksEn: [
      'Select required vaccine and verified vaccination clinic.',
      'Book your date and receive a digital pet vaccine card.',
      'Automated reminder notifications scheduled for next booster.',
    ],
  },
  {
    id: 3,
    slug: 'emergency_care',
    categorySlug: 'emergency',
    nameBn: '২৪/৭ জরুরি চিকিৎসা ও ট্রমা কেয়ার',
    nameEn: '24/7 Emergency & Trauma Critical Care',
    icon: '🚨',
    descriptionBn: 'দুর্ঘটনা, বিষক্রিয়া, গুরুতর শ্বাসকষ্ট বা তীব্র অসুস্থতায় তাৎক্ষণিক রাউন্ড-দ্য-ক্লক চিকিৎসা।',
    descriptionEn: 'Immediate round-the-clock intensive care, trauma surgery, oxygen, and emergency stabilization.',
    priceRangeBn: '৳১০০ – ৳৩০০০',
    priceRangeEn: '৳100 – ৳3000',
    isMvp: true,
    howItWorksBn: [
      'জরুরি মোডে নিকটতম খোলা ২৪/৭ ইমার্জেন্সি ক্লিনিক সনাক্ত করুন।',
      'এক-ট্যাপে সরাসরি হটলাইনে কল করে ক্লিনিকে আসার খবর দিন।',
      'অ্যাপ থেকে এক-ক্লিকে দিকনির্দেশনা (Google Maps) চালু করে দ্রুত পৌঁছান।',
    ],
    howItWorksEn: [
      'Identify nearest open 24/7 emergency clinic on the live radar.',
      'Call emergency hotline directly to alert on-duty surgeon.',
      'Launch Google Maps GPS navigation directly to the clinic.',
    ],
  },
  {
    id: 4,
    slug: 'home_vet_visit',
    categorySlug: 'home_visit',
    nameBn: 'বাসায় পশু চিকিৎসক সেবা (হোম ভিজিট)',
    nameEn: 'Home Vet Visit & Mobile Checkup',
    icon: '🏡',
    descriptionBn: 'পোষা প্রাণীকে ক্লিনিকে নিয়ে যাওয়ার ঝামেলা ছাড়াই অভিজ্ঞ ডাক্তারের বাসায় এসে চিকিৎসা।',
    descriptionEn: 'Licensed vet doctor visits your home for checkups, dressing, and stress-free pet care.',
    priceRangeBn: '৳১০০০ – ৳১৫০০',
    priceRangeEn: '৳1000 – ৳1500',
    isMvp: true,
    howItWorksBn: [
      'আপনার ঠিকানা ও সুবিধাজনক তারিখ-সময় নির্ধারণ করুন।',
      'চিকিৎসক নির্দিষ্ট সময়ে সমস্ত প্রয়োজনীয় ইকুইপমেন্ট নিয়ে উপস্থিত হবেন।',
      'অ্যাপে ভিজিট নোট ও প্রেসক্রিপশন সংরক্ষিত হবে।',
    ],
    howItWorksEn: [
      'Set your home address and preferred date & time window.',
      'Doctor arrives at your doorstep with portable diagnostic kit.',
      'Digital visit notes and prescription added to your pet profile.',
    ],
  },
];

/**
 * Normalizes input slug to match either categorySlug or serviceSlug
 */
export function resolveServiceSlug(inputSlug: string): string {
  const s = inputSlug.trim().toLowerCase();
  const found = SERVICE_CATALOG.find((item) => item.slug === s || item.categorySlug === s);
  return found ? found.slug : s;
}

/**
 * Retrieves service catalog metadata by slug or category slug
 */
export function getServiceBySlug(slug: string): ServiceCatalogItem | undefined {
  const resolved = resolveServiceSlug(slug);
  return SERVICE_CATALOG.find((item) => item.slug === resolved);
}

export interface GetProvidersByServiceOptions {
  lat?: number;
  lng?: number;
  openNow?: boolean;
  govt?: 'all' | 'govt' | 'private';
  maxPrice?: number;
}

/**
 * SVC-2: Returns distance-sorted list of clinics offering a specific service.
 */
export function getProvidersByServiceSlug(
  serviceSlug: string,
  options?: GetProvidersByServiceOptions
): ProviderServiceOffering[] {
  const resolvedSlug = resolveServiceSlug(serviceSlug);
  const userLat = options?.lat ?? 23.7465;
  const userLng = options?.lng ?? 90.3752;

  const allClinics = getAllMockClinics();
  const results: ProviderServiceOffering[] = [];

  for (const clinic of allClinics) {
    const loc = clinic.location;
    const prv = clinic.provider;
    const detail = clinic;

    // Check if clinic has this service
    const matchingService = detail.services.find(
      (s) => (s.serviceSlug === resolvedSlug || s.serviceSlug?.includes(resolvedSlug)) && s.isActive
    );

    if (!matchingService) continue;

    const isGovt = prv.type === 'govt_vet_hospital' || (prv.nameEn?.toLowerCase().includes('central veterinary hospital') ?? false);
    const isOpenNow = loc.is24h || true;

    // Filter checks
    if (options?.openNow && !isOpenNow) continue;
    if (options?.govt === 'govt' && !isGovt) continue;
    if (options?.govt === 'private' && isGovt) continue;
    if (options?.maxPrice && matchingService.price > options.maxPrice) continue;

    const distanceM = calculateDistanceMeters(userLat, userLng, loc.lat, loc.lng);

    results.push({
      locationId: loc.id,
      providerId: prv.id,
      clinicNameBn: (prv.nameBn || prv.nameEn) ?? '',
      clinicNameEn: prv.nameEn ?? '',
      addressBn: (loc.addressBn || loc.addressEn) ?? '',
      addressEn: loc.addressEn ?? '',
      phone: loc.phone ?? '+8801700000000',
      ratingAvg: prv.ratingAvg,
      ratingCount: prv.ratingCount,
      isGovernment: isGovt,
      is24h: loc.is24h,
      hasEmergency: loc.hasEmergency,
      offersHomeVisit: loc.offersHomeVisit,
      isOpenNow,
      lat: loc.lat,
      lng: loc.lng,
      distanceM,
      serviceId: matchingService.serviceId,
      serviceSlug: matchingService.serviceSlug ?? resolvedSlug,
      serviceNameBn: (matchingService.nameBn || matchingService.nameEn) ?? '',
      serviceNameEn: matchingService.nameEn ?? '',
      price: matchingService.price,
      durationMinutes: matchingService.durationMinutes ?? 20,
      vetsCount: detail.vets.length,
    });
  }

  // Sort distance ascending (nearest first)
  results.sort((a, b) => a.distanceM - b.distanceM);

  return results;
}
