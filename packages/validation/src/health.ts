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

// ── HLT-3: Medical Records & Pet Documents ───────────────────────────────────

export const PrescriptionItemSchema = z.object({
  medicine: z.string().min(1, 'health:validation.medicine_required'),
  dosage: z.string().optional().nullable(),
  frequency: z.string().optional().nullable(),
  duration_days: z.number().int().positive().optional().nullable(),
  instructions: z.string().optional().nullable(),
});
export type PrescriptionItemInput = z.infer<typeof PrescriptionItemSchema>;

export const AddMedicalRecordSchema = z.object({
  pet_id: z.string().uuid(),
  vet_id: z.string().uuid(),
  booking_id: z.string().uuid().optional().nullable(),
  rescue_case_id: z.string().uuid().optional().nullable(),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'health:validation.invalid_date'),
  findings: z.string().max(2000).optional().nullable(),
  diagnosis: z.string().max(500).optional().nullable(),
  treatment: z.string().max(2000).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  attachments: z.array(z.string()).default([]),
  prescriptions: z.array(PrescriptionItemSchema).optional().default([]),
});
export type AddMedicalRecordInput = z.infer<typeof AddMedicalRecordSchema>;

export const AddPetDocumentSchema = z.object({
  pet_id: z.string().uuid(),
  title: z.string().min(1, 'health:validation.title_required').max(120),
  file_path: z.string().min(1, 'health:validation.file_required'),
  document_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'health:validation.invalid_date').optional().nullable(),
});
export type AddPetDocumentInput = z.infer<typeof AddPetDocumentSchema>;

/**
 * APT-5: Digital prescription schema (vet only)
 */
export const digitalPrescriptionSchema = z.object({
  petId: z.string().uuid(),
  bookingId: z.string().uuid().optional().nullable(),
  vetId: z.string().uuid(),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'health:validation.invalid_date'),
  diagnosis: z.string().min(1, 'health:validation.diagnosis_required').max(500),
  findings: z.string().max(2000).optional().nullable(),
  weightKg: z.number().positive().max(200).optional().nullable(),
  temperatureC: z.number().min(30).max(45).optional().nullable(),
  medicines: z.array(PrescriptionItemSchema).min(1, 'health:validation.medicine_required'),
  advice: z.string().max(2000).optional().nullable(),
  followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'health:validation.invalid_date').optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});
export type DigitalPrescriptionInput = z.infer<typeof digitalPrescriptionSchema>;


