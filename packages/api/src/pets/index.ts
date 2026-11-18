import type { TypedSupabaseClient } from '../client';
import type { SpeciesType, PetGender } from '@pranora/types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface PetRow {
  id: string;
  owner_id: string;
  shelter_id: string | null;
  rescue_case_id: string | null;
  name: string;
  species: SpeciesType;
  breed_id: number | null;
  breed_other: string | null;
  gender: PetGender;
  date_of_birth: string | null;
  birth_approx: boolean;
  weight_kg: number | null;
  color: string | null;
  photo_url: string | null;
  microchip_no: string | null;
  is_neutered: boolean | null;
  allergies: string | null;
  notes: string | null;
  public_qr_slug: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  breed?: BreedRow | null;
}

export interface BreedRow {
  id: number;
  species: SpeciesType;
  name_bn: string | null;
  name_en: string;
}

export interface AddPetPayload {
  name: string;
  species: SpeciesType;
  breed_id?: number | null;
  breed_other?: string | null;
  gender?: PetGender;
  date_of_birth?: string | null;
  birth_approx?: boolean;
  weight_kg?: number | null;
  color?: string | null;
  photo_url?: string | null;
  microchip_no?: string | null;
  is_neutered?: boolean | null;
  allergies?: string | null;
  notes?: string | null;
}

export type EditPetPayload = Partial<AddPetPayload> & { id: string };

// ── API Functions ────────────────────────────────────────────────────────────

/**
 * List all non-deleted pets owned by the current authenticated user.
 */
export async function listMyPets(
  client: TypedSupabaseClient
): Promise<{ data: PetRow[]; error?: string }> {
  const { data, error } = await client
    .from('pets' as never)
    .select(`
      *,
      breed:breeds(id, species, name_bn, name_en)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as PetRow[] };
}

/**
 * Get a single pet by id (must be owned by authenticated user via RLS).
 */
export async function getPet(
  client: TypedSupabaseClient,
  id: string
): Promise<{ data: PetRow | null; error?: string }> {
  const { data, error } = await client
    .from('pets' as never)
    .select(`
      *,
      breed:breeds(id, species, name_bn, name_en)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as unknown as PetRow };
}

/**
 * Add a new pet for the authenticated user.
 */
export async function addPet(
  client: TypedSupabaseClient,
  payload: AddPetPayload
): Promise<{ data: PetRow | null; error?: string }> {
  const { data, error } = await client
    .from('pets' as never)
    .insert(payload as never)
    .select(`
      *,
      breed:breeds(id, species, name_bn, name_en)
    `)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as unknown as PetRow };
}

/**
 * Edit an existing pet (RLS enforces ownership).
 */
export async function editPet(
  client: TypedSupabaseClient,
  { id, ...updates }: EditPetPayload
): Promise<{ data: PetRow | null; error?: string }> {
  const { data, error } = await client
    .from('pets' as never)
    .update(updates as never)
    .eq('id', id)
    .is('deleted_at', null)
    .select(`
      *,
      breed:breeds(id, species, name_bn, name_en)
    `)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as unknown as PetRow };
}

/**
 * Soft-delete a pet (sets deleted_at = now()).
 * RLS enforces that only the owner can delete their pet.
 */
export async function deletePet(
  client: TypedSupabaseClient,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await client
    .from('pets' as never)
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq('id', id)
    .is('deleted_at', null);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * List all breeds, optionally filtered by species.
 */
export async function listBreeds(
  client: TypedSupabaseClient,
  species?: SpeciesType
): Promise<{ data: BreedRow[]; error?: string }> {
  let query = client
    .from('breeds' as never)
    .select('id, species, name_bn, name_en')
    .order('name_en', { ascending: true });

  if (species) {
    query = query.eq('species', species) as typeof query;
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as BreedRow[] };
}
