import { z } from 'zod';

// ── Species & Gender (mirror DB enums) ─────────────────────────────────────

export const SpeciesSchema = z.enum([
  'dog', 'cat', 'bird', 'rabbit', 'fish', 'cow', 'goat', 'poultry', 'other',
]);
export type Species = z.infer<typeof SpeciesSchema>;

export const PetGenderSchema = z.enum(['male', 'female', 'unknown']);
export type PetGender = z.infer<typeof PetGenderSchema>;

// ── Add Pet ─────────────────────────────────────────────────────────────────

export const PetBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'pets:validation.name_required')
    .max(60, 'pets:validation.name_too_long'),

  species: SpeciesSchema,

  breed_id: z.number().int().positive().nullable().optional(),
  breed_other: z
    .string()
    .max(80, 'pets:validation.breed_too_long')
    .nullable()
    .optional(),

  gender: PetGenderSchema.default('unknown'),

  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'pets:validation.invalid_date')
    .nullable()
    .optional(),

  birth_approx: z.boolean().default(false),

  weight_kg: z
    .number()
    .positive('pets:validation.weight_positive')
    .max(999, 'pets:validation.weight_too_large')
    .nullable()
    .optional(),

  color: z.string().max(60).nullable().optional(),
  photo_url: z.string().url('pets:validation.invalid_url').nullable().optional(),
  microchip_no: z.string().max(50).nullable().optional(),
  is_neutered: z.boolean().nullable().optional(),
  allergies: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const AddPetSchema = PetBaseSchema;
export type AddPetInput = z.infer<typeof AddPetSchema>;

// ── Edit Pet (all fields optional except id) ────────────────────────────────

export const EditPetSchema = PetBaseSchema.partial().extend({
  id: z.string().uuid(),
});

export type EditPetInput = z.infer<typeof EditPetSchema>;

// ── Delete Pet ───────────────────────────────────────────────────────────────

export const DeletePetSchema = z.object({
  id: z.string().uuid(),
});

export type DeletePetInput = z.infer<typeof DeletePetSchema>;

// ── PET-5: Ownership Transfer & Rescue Linking ───────────────────────────────

export const OwnershipReasonSchema = z.enum([
  'registered',
  'rescue_intake',
  'adoption',
  'admin_transfer',
]);
export type OwnershipReason = z.infer<typeof OwnershipReasonSchema>;

export const TransferPetSchema = z.object({
  pet_id: z.string().uuid(),
  to_user_id: z.string().uuid(),
  reason: OwnershipReasonSchema,
  note: z.string().max(500).optional(),
});
export type TransferPetInput = z.infer<typeof TransferPetSchema>;

export const LinkRescuePetSchema = z.object({
  pet_id: z.string().uuid(),
  rescue_case_id: z.string().uuid(),
});
export type LinkRescuePetInput = z.infer<typeof LinkRescuePetSchema>;

