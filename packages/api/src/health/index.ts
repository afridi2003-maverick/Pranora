import type { TypedSupabaseClient } from '../client';
import type { SpeciesType } from '@pranora/types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface VaccineTemplateRow {
  id: number;
  species: SpeciesType;
  name_bn: string;
  name_en: string;
  first_dose_age_weeks: number;
  repeat_every_days: number | null;
  doses: number;
}

export interface VaccinationRow {
  id: string;
  pet_id: string;
  template_id: number | null;
  name: string;
  due_date: string | null;
  given_date: string | null;
  given_by_vet_id: string | null;
  batch_no: string | null;
  booking_id: string | null;
  certificate_path: string | null;
  created_at: string;
  template?: VaccineTemplateRow | null;
}

export interface RecordVaccinationPayload {
  id: string;
  given_date: string;
  batch_no?: string | null;
  certificate_path?: string | null;
}

export interface AddVaccinationPayload {
  pet_id: string;
  template_id?: number | null;
  name: string;
  due_date?: string | null;
  given_date?: string | null;
  batch_no?: string | null;
  certificate_path?: string | null;
}

// ── HLT-3: Medical Records & Pet Documents Types ────────────────────────────

export interface PrescriptionRow {
  id: string;
  medical_record_id: string;
  medicine: string;
  dosage: string | null;
  frequency: string | null;
  duration_days: number | null;
  instructions: string | null;
}

export type PrescriptionItemInput = Omit<PrescriptionRow, 'id' | 'medical_record_id'>;


export interface MedicalRecordRow {
  id: string;
  pet_id: string;
  booking_id: string | null;
  rescue_case_id: string | null;
  vet_id: string;
  visit_date: string;
  findings: string | null;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
  attachments: string[];
  created_by: string;
  created_at: string;
  vet?: { id: string; name_en: string; name_bn: string | null } | null;
  prescriptions?: PrescriptionRow[];
}

export interface PetDocumentRow {
  id: string;
  pet_id: string;
  uploaded_by: string;
  title: string | null;
  file_path: string;
  document_date: string | null;
  created_at: string;
  uploader?: { id: string; full_name: string | null } | null;
}

export interface AddMedicalRecordPayload {
  pet_id: string;
  vet_id: string;
  booking_id?: string | null;
  rescue_case_id?: string | null;
  visit_date: string;
  findings?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  notes?: string | null;
  attachments?: string[];
  prescriptions?: Omit<PrescriptionRow, 'id' | 'medical_record_id'>[];
}

export interface AddPetDocumentPayload {
  pet_id: string;
  title: string;
  file_path: string;
  document_date?: string | null;
}


// ── API Functions ────────────────────────────────────────────────────────────

/**
 * List vaccine templates, optionally filtered by animal species.
 */
export async function listVaccineTemplates(
  client: TypedSupabaseClient,
  species?: SpeciesType
): Promise<{ data: VaccineTemplateRow[]; error?: string }> {
  let query = client
    .from('vaccine_templates' as never)
    .select('*')
    .order('first_dose_age_weeks', { ascending: true });

  if (species) {
    query = query.eq('species', species) as typeof query;
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as VaccineTemplateRow[] };
}

/**
 * List all vaccination records (scheduled + completed) for a pet.
 */
export async function listPetVaccinations(
  client: TypedSupabaseClient,
  petId: string
): Promise<{ data: VaccinationRow[]; error?: string }> {
  const { data, error } = await client
    .from('vaccinations' as never)
    .select(`
      *,
      template:vaccine_templates(*)
    `)
    .eq('pet_id', petId)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as VaccinationRow[] };
}

/**
 * Generate schedule for a single template using the database RPC.
 */
export async function generateVaccineSchedule(
  client: TypedSupabaseClient,
  petId: string,
  templateId: number
): Promise<{ success: boolean; error?: string }> {
  const { error } = await client.rpc('generate_vaccine_schedule' as never, {
    p_pet_id: petId,
    p_template_id: templateId,
  } as never);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Auto-generate full vaccination schedule for a pet based on all templates for its species.
 */
export async function autoGenerateSpeciesSchedule(
  client: TypedSupabaseClient,
  petId: string,
  species: SpeciesType
): Promise<{ success: boolean; count: number; error?: string }> {
  const { data: templates, error: fetchErr } = await listVaccineTemplates(client, species);
  if (fetchErr) return { success: false, count: 0, error: fetchErr };

  let count = 0;
  for (const tmpl of templates) {
    const res = await generateVaccineSchedule(client, petId, tmpl.id);
    if (res.success) {
      count++;
    }
  }

  return { success: true, count };
}

/**
 * Record a vaccine dose as administered.
 */
export async function recordVaccination(
  client: TypedSupabaseClient,
  payload: RecordVaccinationPayload
): Promise<{ data: VaccinationRow | null; error?: string }> {
  const { data, error } = await client
    .from('vaccinations' as never)
    .update({
      given_date: payload.given_date,
      batch_no: payload.batch_no ?? null,
      certificate_path: payload.certificate_path ?? null,
    } as never)
    .eq('id', payload.id)
    .select(`*, template:vaccine_templates(*)`)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as unknown as VaccinationRow };
}

/**
 * Add a custom or manual vaccination record.
 */
export async function addVaccination(
  client: TypedSupabaseClient,
  payload: AddVaccinationPayload
): Promise<{ data: VaccinationRow | null; error?: string }> {
  const { data, error } = await client
    .from('vaccinations' as never)
    .insert(payload as never)
    .select(`*, template:vaccine_templates(*)`)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as unknown as VaccinationRow };
}

/**
 * Delete a vaccination record.
 */
export async function deleteVaccination(
  client: TypedSupabaseClient,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await client
    .from('vaccinations' as never)
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── HLT-3: Medical History API Functions ─────────────────────────────────────

/**
 * List all vet-written medical records for a pet.
 * Read-only for owners (enforced by RLS).
 */
export async function listMedicalRecords(
  client: TypedSupabaseClient,
  petId: string
): Promise<{ data: MedicalRecordRow[]; error?: string }> {
  const { data, error } = await client
    .from('medical_records' as never)
    .select(`
      *,
      vet:vets(id, name_en, name_bn),
      prescriptions(*)
    `)
    .eq('pet_id', petId)
    .order('visit_date', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as MedicalRecordRow[] };
}

/**
 * Add a medical record (vet-only via RLS).
 */
export async function addMedicalRecord(
  client: TypedSupabaseClient,
  { prescriptions, ...recordPayload }: AddMedicalRecordPayload
): Promise<{ data: MedicalRecordRow | null; error?: string }> {
  const { data: record, error: recordErr } = await client
    .from('medical_records' as never)
    .insert(recordPayload as never)
    .select(`*, vet:vets(id, name_en, name_bn)`)
    .single();

  if (recordErr || !record) {
    return { data: null, error: recordErr?.message || 'Failed to insert medical record' };
  }

  const typedRecord = record as unknown as MedicalRecordRow;

  // Insert prescriptions if any
  if (prescriptions && prescriptions.length > 0) {
    const presPayload = prescriptions.map((p) => ({
      ...p,
      medical_record_id: typedRecord.id,
    }));
    await client.from('prescriptions' as never).insert(presPayload as never);
  }

  return { data: typedRecord };
}

/**
 * List owner-uploaded documents for a pet.
 */
export async function listPetDocuments(
  client: TypedSupabaseClient,
  petId: string
): Promise<{ data: PetDocumentRow[]; error?: string }> {
  const { data, error } = await client
    .from('pet_documents' as never)
    .select(`
      *,
      uploader:profiles(id, full_name)
    `)
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as PetDocumentRow[] };
}

/**
 * Upload and record an owner document (old report, lab test result).
 */
export async function addPetDocument(
  client: TypedSupabaseClient,
  payload: AddPetDocumentPayload
): Promise<{ data: PetDocumentRow | null; error?: string }> {
  const { data, error } = await client
    .from('pet_documents' as never)
    .insert(payload as never)
    .select(`*, uploader:profiles(id, full_name)`)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as unknown as PetDocumentRow };
}

/**
 * Delete an owner-uploaded document.
 */
export async function deletePetDocument(
  client: TypedSupabaseClient,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await client
    .from('pet_documents' as never)
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

