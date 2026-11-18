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
