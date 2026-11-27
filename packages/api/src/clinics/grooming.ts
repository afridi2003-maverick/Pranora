import type { TypedSupabaseClient } from '../client';
import { getAllMockClinics } from './mock.ts';

export type GroomingPackageType = 'bath_brush' | 'full_groom' | 'medicated_bath' | 'nail_ear_care';
export type PetSize = 'small' | 'medium' | 'large';

export interface GroomingPackage {
  id: GroomingPackageType;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  basePrice: number;
  durationMinutes: number;
  featuresBn: string[];
  featuresEn: string[];
}

export interface GroomingAddon {
  id: string;
  nameBn: string;
  nameEn: string;
  price: number;
}

export const GROOMING_PACKAGES: GroomingPackage[] = [
  {
    id: 'bath_brush',
    nameBn: 'বেসিক গোসল ও ব্রাশ',
    nameEn: 'Basic Bath & Brush',
    descriptionBn: 'শ্যাম্পু দিয়ে মৃদু গোসল, লোম শুকানো ও ব্রাশ করা।',
    descriptionEn: 'Gentle shampoo bath, blow dry, and thorough fur brushing.',
    basePrice: 500,
    durationMinutes: 45,
    featuresBn: ['জীবাণুনাশক শ্যাম্পু', 'ব্লো ড্রাই', 'লোম ব্রাশ ও স্প্রে', 'হালকা সুবাস'],
    featuresEn: ['Antiseptic shampoo', 'Blow dry', 'Brushing & coat mist', 'Pet cologne'],
  },
  {
    id: 'full_groom',
    nameBn: 'ফুল গ্রুমিং প্যাকেজ',
    nameEn: 'Full Grooming Package',
    descriptionBn: 'সম্পূর্ণ সাজসজ্জা: গোসল, স্টাইলিশ হেয়ারকাট, নখ কাটা ও কান পরিষ্কার।',
    descriptionEn: 'Complete makeover: bath, haircut/styling, nail trim & ear cleaning.',
    basePrice: 1200,
    durationMinutes: 90,
    featuresBn: ['সম্পূর্ণ গোসল ও কন্ডিশনিং', 'পছন্দসই হেয়ারকাট', 'নখ ট্রিম ও ফাইল', 'কান ও চোখ পরিষ্কার', 'দাঁত ব্রাশ'],
    featuresEn: ['Full bath & conditioning', 'Breed-standard styling', 'Nail clipping & filing', 'Ear & eye cleaning', 'Teeth brushing'],
  },
  {
    id: 'medicated_bath',
    nameBn: 'মেডিকেটেড / অ্যান্টি-টিক বাথ',
    nameEn: 'Medicated / Anti-Tick Bath',
    descriptionBn: 'চুলকানি, অ্যালার্জি ও উকুন/টিক দূর করার বিশেষ ওষুধযুক্ত গোসল।',
    descriptionEn: 'Special medicated treatment for fleas, ticks, fungal & skin allergies.',
    basePrice: 850,
    durationMinutes: 60,
    featuresBn: ['অ্যান্টি-প্যারাসাইটিক দ্রবণ', 'চর্মরোগ নিরাময়কারী শ্যাম্পু', 'টিক চেক', 'স্ক্র্যাচ রিলিফ লোশন'],
    featuresEn: ['Anti-tick deep dip', 'Hypoallergenic soothing wash', 'Thorough tick inspection', 'Skin relief tonic'],
  },
  {
    id: 'nail_ear_care',
    nameBn: 'নখ ও কান পরিচর্যা',
    nameEn: 'Nail & Ear Hygiene',
    descriptionBn: 'নখ কাটা, গ্রাইন্ডিং এবং কানের ময়লা নিরাপদভাবে পরিষ্কার।',
    descriptionEn: 'Safe paw nail trimming, filing and ear canal antiseptic sanitization.',
    basePrice: 350,
    durationMinutes: 25,
    featuresBn: ['নখ ট্রিম ও স্মুথিং', 'প থাবা ম্যাসাজ', 'কানের ওয়াক্স পরিষ্কার', 'অ্যান্টিব্যাকটেরিয়াল ড্রপ'],
    featuresEn: ['Nail clipping & grinding', 'Paw pad balm massage', 'Ear wax sanitizing', 'Ear drop application'],
  },
];

export const GROOMING_ADDONS: GroomingAddon[] = [
  { id: 'fur_deshedding', nameBn: 'অতিরিক্ত লোম ঝরা রোধ (De-shedding)', nameEn: 'De-shedding Treatment', price: 250 },
  { id: 'teeth_cleaning', nameBn: 'দাঁত পরিষ্কার ও দুর্গন্ধ দূর', nameEn: 'Ultrasonic Teeth Hygiene', price: 200 },
  { id: 'aroma_spa', nameBn: 'অ্যারোমা স্পা ও ম্যাসাজ অয়েল', nameEn: 'Aroma Therapy Spa Oil', price: 300 },
];

export function calculateGroomingPrice(
  packageId: GroomingPackageType,
  petSize: PetSize = 'small',
  selectedAddonIds: string[] = []
): { basePrice: number; sizeSurcharge: number; addonsTotal: number; totalAmount: number } {
  const pkg = GROOMING_PACKAGES.find((p) => p.id === packageId) || GROOMING_PACKAGES[0];
  const basePrice = pkg.basePrice;

  let sizeSurcharge = 0;
  if (petSize === 'medium') sizeSurcharge = 200;
  if (petSize === 'large') sizeSurcharge = 400;

  const addonsTotal = selectedAddonIds.reduce((sum, id) => {
    const addon = GROOMING_ADDONS.find((a) => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);

  return {
    basePrice,
    sizeSurcharge,
    addonsTotal,
    totalAmount: basePrice + sizeSurcharge + addonsTotal,
  };
}

export interface GroomingBookingInput {
  clinicId: string;
  locationId: string;
  petName: string;
  petSpecies: 'dog' | 'cat' | 'rabbit';
  petSize: PetSize;
  packageType: GroomingPackageType;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  specialInstructions?: string;
  addons?: string[];
  phone: string;
  paymentMethod?: 'cash' | 'sslcommerz' | 'bkash';
}

export interface GroomingBookingResult {
  bookingId: string;
  code: string;
  petName: string;
  packageName: string;
  appointmentDate: string;
  appointmentTime: string;
  totalAmount: number;
  status: 'pending' | 'confirmed';
  paymentMethod: string;
  createdAt: string;
}

export const MOCK_GROOMING_BOOKINGS: GroomingBookingResult[] = [];

/**
 * Retrieves salons & pet clinics offering grooming services
 */
export async function getGroomingSalons(userLat: number, userLng: number) {
  const allClinics = getAllMockClinics();
  // Filter clinics that offer grooming or full pet services
  return allClinics.map((c) => {
    const pkgPrices = GROOMING_PACKAGES.map((p) => ({
      packageId: p.id,
      price: p.basePrice,
    }));

    return {
      clinicId: c.provider.id,
      locationId: c.location.id,
      nameBn: c.provider.nameBn ?? c.provider.nameEn ?? '',
      nameEn: c.provider.nameEn ?? '',
      addressBn: c.location.addressBn ?? c.location.addressEn ?? '',
      addressEn: c.location.addressEn ?? '',
      phone: c.location.phone ?? '+8801700000000',
      ratingAvg: c.provider.ratingAvg,
      ratingCount: c.provider.ratingCount,
      packages: pkgPrices,
      availableSlots: ['10:00', '11:30', '14:00', '16:00', '18:00'],
    };
  });
}

/**
 * Submits grooming appointment booking
 */
export async function submitGroomingBooking(
  input: GroomingBookingInput,
  client?: TypedSupabaseClient | null
): Promise<GroomingBookingResult> {
  if (!input.petName || input.petName.trim().length === 0) {
    throw new Error('Pet name is required');
  }
  if (!input.appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.appointmentDate)) {
    throw new Error('Valid appointment date is required');
  }
  if (!input.phone || input.phone.trim().length < 8) {
    throw new Error('Valid contact phone is required');
  }

  const cost = calculateGroomingPrice(input.packageType, input.petSize, input.addons ?? []);
  const pkg = GROOMING_PACKAGES.find((p) => p.id === input.packageType) || GROOMING_PACKAGES[0];
  const code = `PR-GRM-${Date.now().toString().slice(-6)}`;
  const bookingId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `grm-${Date.now()}`;

  const result: GroomingBookingResult = {
    bookingId,
    code,
    petName: input.petName,
    packageName: pkg.nameEn,
    appointmentDate: input.appointmentDate,
    appointmentTime: input.appointmentTime,
    totalAmount: cost.totalAmount,
    status: 'pending',
    paymentMethod: input.paymentMethod || 'cash',
    createdAt: new Date().toISOString(),
  };

  if (client) {
    try {
      const { data, error } = await (client as any).from('bookings').insert({
        id: bookingId,
        code,
        location_id: input.locationId,
        booking_type: 'slot',
        status: 'pending',
        problem_note: `Grooming: ${pkg.nameEn}. Size: ${input.petSize}. Note: ${input.specialInstructions ?? 'None'}`,
        payment_method: input.paymentMethod || 'cash',
        starts_at: `${input.appointmentDate}T${input.appointmentTime}:00Z`,
      }).select().single();

      if (!error && data) {
        result.bookingId = data.id;
        result.code = data.code || code;
      }
    } catch {
      // Fall through to in-memory record
    }
  }

  MOCK_GROOMING_BOOKINGS.unshift(result);
  return result;
}
