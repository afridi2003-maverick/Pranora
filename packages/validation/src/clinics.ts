import { z } from 'zod';
import { providerTypeSchema, speciesTypeSchema } from './map.ts';

/**
 * Provider / vet verification status according to schema.md
 */
export const verificationStatusSchema = z.enum([
  'draft',
  'submitted',
  'verified',
  'rejected',
  'suspended',
]);
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

/**
 * Location hours for a specific weekday (0 = Sunday .. 6 = Saturday)
 * schema.md §4.4
 */
export const locationHoursSchema = z.object({
  id: z.string().uuid().optional(),
  locationId: z.string().uuid('Invalid location ID'),
  weekday: z.number().int().min(0).max(6, 'Weekday must be between 0 (Sunday) and 6 (Saturday)'),
  openTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be in HH:MM or HH:MM:SS format'),
  closeTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be in HH:MM or HH:MM:SS format'),
});
export type LocationHours = z.infer<typeof locationHoursSchema>;

/**
 * Details of a clinic / provider location branch
 * schema.md §4.4 (provider_locations)
 */
export const providerLocationDetailSchema = z.object({
  id: z.string().uuid(),
  providerId: z.string().uuid(),
  nameBn: z.string().nullable(),
  nameEn: z.string().nullable(),
  addressBn: z.string().nullable(),
  addressEn: z.string().nullable(),
  upazilaId: z.number().int().nullable().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  phone: z.string().nullable(),
  is24h: z.boolean().default(false),
  hasEmergency: z.boolean().default(false),
  offersHomeVisit: z.boolean().default(false),
  homeVisitRadiusKm: z.number().nullable().optional(),
  speciesTreated: z.array(speciesTypeSchema).default(['dog', 'cat']),
  photos: z.array(z.string().url()).default([]),
  cancelCutoffHours: z.number().int().default(2),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
});
export type ProviderLocationDetail = z.infer<typeof providerLocationDetailSchema>;

/**
 * BVC Registration Number Validator (REL-5)
 * Conforms to Bangladesh Veterinary Council format: BVC-XXXX or BVC/YYYY/XXXX or numeric
 */
export const bvcRegNoRegex = /^(BVC[-\s/])?[A-Z0-9/-]{3,15}$/i;

export function validateBvcRegistration(regNo: string | null | undefined): {
  isValid: boolean;
  normalized: string;
  error?: string;
} {
  if (!regNo || !regNo.trim()) {
    return { isValid: false, normalized: '', error: 'BVC registration number is required' };
  }
  const clean = regNo.trim().toUpperCase();
  if (!bvcRegNoRegex.test(clean)) {
    return {
      isValid: false,
      normalized: clean,
      error: 'Invalid BVC registration format. Example: BVC-4521 or 4521/DLS',
    };
  }
  const normalized = clean.startsWith('BVC') ? clean : `BVC-${clean}`;
  return { isValid: true, normalized };
}

/**
 * Vet profile schema (BVC registration, degrees, fees)
 * schema.md §4.4 (vets)
 */
export const vetProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  fullNameBn: z.string().nullable().optional(),
  fullNameEn: z.string().min(1, 'Full name in English is required'),
  bvcRegNo: z.string().nullable().optional(), // Bangladesh Veterinary Council reg
  degrees: z.string().nullable().optional(),   // DVM, MS, etc.
  specialization: z.string().nullable().optional(),
  experienceYears: z.number().int().min(0).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  consultationFee: z.number().positive().nullable().optional(),
  onlineConsult: z.boolean().default(false),
  verification: verificationStatusSchema.default('draft'),
  createdAt: z.string().datetime({ offset: true }).optional(),
});
export type VetProfile = z.infer<typeof vetProfileSchema>;

/**
 * Provider / Business details schema
 * schema.md §4.4 (providers)
 */
export const providerDetailSchema = z.object({
  id: z.string().uuid(),
  ownerUserId: z.string().uuid(),
  type: providerTypeSchema,
  nameBn: z.string().nullable().optional(),
  nameEn: z.string().nullable().optional(),
  descriptionBn: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  whatsapp: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  tradeLicenseNo: z.string().nullable().optional(),
  isGovernment: z.boolean().default(false),
  verification: verificationStatusSchema.default('draft'),
  verifiedAt: z.string().datetime({ offset: true }).nullable().optional(),
  ratingAvg: z.number().min(0).max(5).default(0),
  ratingCount: z.number().int().min(0).default(0),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
});
export type ProviderDetail = z.infer<typeof providerDetailSchema>;

/**
 * Service offered at a specific provider location
 * schema.md §4.4 (provider_services)
 */
export const providerServiceSchema = z.object({
  id: z.string().uuid(),
  providerId: z.string().uuid(),
  locationId: z.string().uuid().nullable().optional(),
  serviceId: z.string().uuid(),
  serviceSlug: z.string().optional(),
  nameBn: z.string().nullable().optional(),
  nameEn: z.string().nullable().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  durationMinutes: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
});
export type ProviderService = z.infer<typeof providerServiceSchema>;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 2: Home Visit Request (SVC-HOME)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const homeVisitTimeSlotSchema = z.enum(['morning', 'afternoon', 'evening']);
export type HomeVisitTimeSlot = z.infer<typeof homeVisitTimeSlotSchema>;

export const homeVisitRequestSchema = z.object({
  clinicId: z.string().uuid('Invalid clinic ID'),
  locationId: z.string().uuid('Invalid location ID'),
  petId: z.string().uuid().optional(),
  petName: z.string().min(1, 'Pet name is required'),
  petSpecies: speciesTypeSchema,
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Visit date must be YYYY-MM-DD'),
  timeSlot: homeVisitTimeSlotSchema,
  address: z.string().min(5, 'Detailed address is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  symptoms: z.string().min(3, 'Please describe symptoms or reason for home visit'),
  phone: z.string().min(8, 'Phone number is required'),
  emergencyNotes: z.string().optional(),
  paymentMethod: z.enum(['cash', 'sslcommerz', 'bkash']).default('cash'),
});
export type HomeVisitRequest = z.infer<typeof homeVisitRequestSchema>;

export function calculateHomeVisitFee(baseFee: number, distanceKm: number, maxRadiusKm: number = 10) {
  const isWithinRadius = distanceKm <= maxRadiusKm;
  // Base consultation fee + travel allowance (e.g. 50 BDT/km, min 150 BDT)
  const travelFee = Math.max(150, Math.round(distanceKm * 50));
  const totalFee = baseFee + travelFee;
  return {
    baseFee,
    travelFee,
    totalFee,
    isWithinRadius,
    distanceKm: Math.round(distanceKm * 10) / 10,
    maxRadiusKm,
  };
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 2: Grooming Booking (SVC-GRM)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const groomingPackageSchema = z.enum([
  'bath_brush',     // বেসিক গোসল ও ব্রাশ
  'full_groom',     // সম্পূর্ণ গ্রুমিং (গোসল, হেয়ারকাট, নখ কাটা, কান পরিষ্কার)
  'medicated_bath', // অ্যান্টি-টিক / মেডিকেটেড গোসল
  'nail_ear_care',  // নখ ও কান পরিচর্যা
]);
export type GroomingPackage = z.infer<typeof groomingPackageSchema>;

export const petSizeSchema = z.enum(['small', 'medium', 'large']); // <5kg, 5-15kg, >15kg
export type PetSize = z.infer<typeof petSizeSchema>;

export const groomingBookingSchema = z.object({
  clinicId: z.string().uuid('Invalid clinic ID'),
  locationId: z.string().uuid('Invalid location ID'),
  petId: z.string().uuid().optional(),
  petName: z.string().min(1, 'Pet name is required'),
  petSpecies: speciesTypeSchema,
  petSize: petSizeSchema,
  packageType: groomingPackageSchema,
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  appointmentTime: z.string().min(1, 'Time slot is required'),
  specialInstructions: z.string().optional(),
  addons: z.array(z.string()).default([]),
  phone: z.string().min(8, 'Phone number is required'),
  paymentMethod: z.enum(['cash', 'sslcommerz', 'bkash']).default('cash'),
});
export type GroomingBooking = z.infer<typeof groomingBookingSchema>;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 2: Boarding Booking (SVC-BRD)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const boardingRoomTypeSchema = z.enum([
  'standard_kennel', // সাধারণ খাঁচা/রুম
  'deluxe_ac',       // ডিলাক্স এসি কেবিন
  'vip_suite',       // ভিআইপি স্যুট
]);
export type BoardingRoomType = z.infer<typeof boardingRoomTypeSchema>;

export const boardingBookingSchema = z.object({
  clinicId: z.string().uuid('Invalid clinic ID'),
  locationId: z.string().uuid('Invalid location ID'),
  petId: z.string().uuid().optional(),
  petName: z.string().min(1, 'Pet name is required'),
  petSpecies: speciesTypeSchema,
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in date must be YYYY-MM-DD'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out date must be YYYY-MM-DD'),
  roomType: boardingRoomTypeSchema,
  vaccinationUpToDate: z.boolean().refine((val) => val === true, {
    message: 'Vaccinations must be up to date for boarding safety',
  }),
  dietaryInstructions: z.string().optional(),
  emergencyContact: z.string().min(8, 'Emergency contact phone is required'),
  phone: z.string().min(8, 'Phone number is required'),
  paymentMethod: z.enum(['cash', 'sslcommerz', 'bkash']).default('cash'),
});
export type BoardingBooking = z.infer<typeof boardingBookingSchema>;

export function calculateBoardingCost(
  checkInDate: string,
  checkOutDate: string,
  nightlyRate: number
) {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  return {
    nights,
    nightlyRate,
    subtotal: nights * nightlyRate,
    foodAndCareFee: nights * 150, // 150 BDT/night food & care
    totalAmount: nights * nightlyRate + nights * 150,
  };
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 2: Suggest a Clinic (MAP-11)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const clinicSuggestionSchema = z.object({
  name: z.string().min(2, 'Clinic name is required'),
  nameEn: z.string().optional(),
  divisionId: z.number().int().optional(),
  districtId: z.number().int().optional(),
  address: z.string().min(5, 'Address details are required'),
  phone: z.string().min(8, 'Contact phone number is required'),
  is24h: z.boolean().default(false),
  hasEmergency: z.boolean().default(false),
  offersHomeVisit: z.boolean().default(false),
  services: z.array(z.string()).default([]),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional(),
});
export type ClinicSuggestion = z.infer<typeof clinicSuggestionSchema>;

