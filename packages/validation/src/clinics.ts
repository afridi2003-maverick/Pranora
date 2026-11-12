import { z } from 'zod';
import { providerTypeSchema, speciesTypeSchema } from './map';

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
