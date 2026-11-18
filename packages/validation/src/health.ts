import { z } from 'zod';
import { SpeciesSchema } from './pets';

// ── HLT-1: Vaccine Schemas ───────────────────────────────────────────────────

export const VaccinationStatusSchema = z.enum(['pending', 'completed', 'overdue']);
export type VaccinationStatus = z.infer<typeof VaccinationStatusSchema>;

export const RecordVaccinationSchema = z.object({
  id: z.string().uuid(),
  given_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'health:validation.invalid_date'),
  batch_no: z.string().max(100).optional().nullable(),
  certificate_path: z.string().optional().nullable(),
});
export type RecordVaccinationInput = z.infer<typeof RecordVaccinationSchema>;

export const AddVaccinationSchema = z.object({
  pet_id: z.string().uuid(),
  template_id: z.number().int().positive().optional().nullable(),
  name: z.string().min(1, 'health:validation.name_required').max(100),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'health:validation.invalid_date').optional().nullable(),
  given_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'health:validation.invalid_date').optional().nullable(),
  batch_no: z.string().max(100).optional().nullable(),
  certificate_path: z.string().optional().nullable(),
}).refine(
  (data) => data.due_date != null || data.given_date != null,
  { message: 'health:validation.date_required' }
);
export type AddVaccinationInput = z.infer<typeof AddVaccinationSchema>;

export const GenerateScheduleSchema = z.object({
  pet_id: z.string().uuid(),
  template_id: z.number().int().positive(),
});
export type GenerateScheduleInput = z.infer<typeof GenerateScheduleSchema>;

export const AutoGenerateSpeciesScheduleSchema = z.object({
  pet_id: z.string().uuid(),
  species: SpeciesSchema,
});
export type AutoGenerateSpeciesScheduleInput = z.infer<typeof AutoGenerateSpeciesScheduleSchema>;
