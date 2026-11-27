import { z } from 'zod';
import { SpeciesSchema, PetGenderSchema } from './pets';

// ── Enums ───────────────────────────────────────────────────────────────────

export const AdoptionListingStatusSchema = z.enum([
  'draft',
  'available',
  'reserved',
  'adopted',
  'withdrawn',
  'removed',
]);
export type AdoptionListingStatus = z.infer<typeof AdoptionListingStatusSchema>;

export const AdoptionApplicationStatusSchema = z.enum([
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'withdrawn',
]);
export type AdoptionApplicationStatus = z.infer<
  typeof AdoptionApplicationStatusSchema
>;

export const HomeTypeSchema = z.enum([
  'own_house',
  'rented_house',
  'own_flat',
  'rented_flat',
  'other',
]);
export type HomeType = z.infer<typeof HomeTypeSchema>;

// ── Schemas ─────────────────────────────────────────────────────────────────

export const CreateAdoptionListingSchema = z.object({
  pet_id: z.string().uuid('adoption:validation.invalid_pet_id'),
  shelter_id: z.string().uuid().nullable().optional(),
  species: SpeciesSchema,
  age_months: z.number().int().min(0).max(360).nullable().optional(),
  gender: PetGenderSchema.default('unknown'),
  title_bn: z.string().max(100).nullable().optional(),
  title_en: z.string().max(100).nullable().optional(),
  description_bn: z.string().max(2000).nullable().optional(),
  description_en: z.string().max(2000).nullable().optional(),
  photos: z.array(z.string().url()).max(10).default([]),
  is_vaccinated: z.boolean().default(false),
  is_neutered: z.boolean().default(false),
  district_id: z.number().int().positive('adoption:validation.district_required'),
  upazila_id: z.number().int().positive().nullable().optional(),
  status: AdoptionListingStatusSchema.default('draft'),
});
export type CreateAdoptionListingInput = z.infer<
  typeof CreateAdoptionListingSchema
>;

export const CreateAdoptionApplicationSchema = z.object({
  listing_id: z.string().uuid('adoption:validation.invalid_listing_id'),
  home_type: HomeTypeSchema.default('own_flat'),
  has_other_pets: z.boolean().default(false),
  experience: z.string().max(1000).nullable().optional(),
  reason: z
    .string()
    .min(10, 'adoption:validation.reason_too_short')
    .max(2000, 'adoption:validation.reason_too_long'),
});
export type CreateAdoptionApplicationInput = z.infer<
  typeof CreateAdoptionApplicationSchema
>;

export const DecideAdoptionApplicationSchema = z.object({
  application_id: z.string().uuid(),
  approve: z.boolean(),
  note: z.string().max(1000).nullable().optional(),
});
export type DecideAdoptionApplicationInput = z.infer<
  typeof DecideAdoptionApplicationSchema
>;

export const ConfirmHandoverSchema = z.object({
  handover_id: z.string().uuid(),
});
export type ConfirmHandoverInput = z.infer<typeof ConfirmHandoverSchema>;

export const AdoptionFollowupAnswerSchema = z.object({
  handover_id: z.string().uuid(),
  wellbeing: z.enum(['good', 'okay', 'needs_help']),
  note: z.string().max(1000).nullable().optional(),
  photos: z.array(z.string().url()).max(6).default([]),
});
export type AdoptionFollowupAnswerInput = z.infer<
  typeof AdoptionFollowupAnswerSchema
>;

export const SubmitAdoptionFollowupSchema = z.object({
  followup_id: z.string().uuid(),
  wellbeing: z.enum(['good', 'okay', 'needs_help']),
  note: z.string().max(1000).nullable().optional(),
  photos: z.array(z.string().url()).max(6).default([]),
});
export type SubmitAdoptionFollowupInput = z.infer<
  typeof SubmitAdoptionFollowupSchema
>;

export const ListingReportReasonSchema = z.enum([
  'fake',
  'scam',
  'commercial_sale',
  'animal_cruelty',
  'inaccurate_info',
  'other',
]);
export type ListingReportReason = z.infer<typeof ListingReportReasonSchema>;

export const ReportAdoptionListingSchema = z.object({
  listing_id: z.string().uuid(),
  reason: ListingReportReasonSchema,
  details: z.string().max(1000).optional(),
  evidence_urls: z.array(z.string().url()).max(5).default([]),
});
export type ReportAdoptionListingInput = z.infer<
  typeof ReportAdoptionListingSchema
>;

export const AdoptionAgeGroupSchema = z.enum(['all', 'baby', 'young', 'adult', 'senior']);
export type AdoptionAgeGroup = z.infer<typeof AdoptionAgeGroupSchema>;

export const AdoptionFilterSchema = z.object({
  species: SpeciesSchema.optional(),
  district_id: z.number().int().positive().optional(),
  gender: PetGenderSchema.optional(),
  age_group: AdoptionAgeGroupSchema.optional(),
  status: AdoptionListingStatusSchema.default('available'),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});
export type AdoptionFilterInput = z.infer<typeof AdoptionFilterSchema>;

/**
 * ADP-5: Adoption Application Review Item Schema
 */
export const adoptionReviewItemSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  applicantId: z.string().uuid(),
  applicantName: z.string(),
  applicantPhone: z.string().nullable().optional(),
  applicantEmail: z.string().nullable().optional(),
  petName: z.string(),
  petSpecies: z.string(),
  petPhotoUrl: z.string().nullable().optional(),
  listingTitle: z.string(),
  homeType: HomeTypeSchema,
  hasOtherPets: z.boolean(),
  experience: z.string().nullable().optional(),
  reason: z.string(),
  status: AdoptionApplicationStatusSchema,
  reviewedBy: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  decisionNote: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type AdoptionReviewItem = z.infer<typeof adoptionReviewItemSchema>;

