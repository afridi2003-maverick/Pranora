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

// ── PET-5: Ownership & Rescue Types ──────────────────────────────────────────

export type OwnershipReason = 'registered' | 'rescue_intake' | 'adoption' | 'admin_transfer';

export interface PetOwnershipHistoryRow {
  id: string;
  pet_id: string;
  from_user_id: string | null;
  to_user_id: string;
  reason: OwnershipReason;
  note: string | null;
  created_at: string;
  from_user?: { id: string; full_name: string | null; phone: string | null } | null;
  to_user?: { id: string; full_name: string | null; phone: string | null } | null;
}

export interface TransferPetPayload {
  pet_id: string;
  to_user_id: string;
  reason: OwnershipReason;
  note?: string | null;
}

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

/**
 * PET-5: Transfer ownership of a pet (callable by current owner or admin).
 * Persists full health records and appends to pet_ownership_history.
 */
export async function transferPetOwnership(
  client: TypedSupabaseClient,
  payload: TransferPetPayload
): Promise<{ success: boolean; error?: string }> {
  const { error } = await client.rpc('transfer_pet_ownership' as never, {
    p_pet_id: payload.pet_id,
    p_to_user_id: payload.to_user_id,
    p_reason: payload.reason,
    p_note: payload.note ?? null,
  } as never);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * PET-5: Get ownership history chain for a pet.
 */
export async function getPetOwnershipHistory(
  client: TypedSupabaseClient,
  petId: string
): Promise<{ data: PetOwnershipHistoryRow[]; error?: string }> {
  const { data, error } = await client
    .from('pet_ownership_history' as never)
    .select(`
      *,
      from_user:profiles!pet_ownership_history_from_user_id_fkey(id, full_name, phone),
      to_user:profiles!pet_ownership_history_to_user_id_fkey(id, full_name, phone)
    `)
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as PetOwnershipHistoryRow[] };
}

/**
 * PET-5: Link pet to rescue case (establishing one profile for life).
 */
export async function linkPetRescueCase(
  client: TypedSupabaseClient,
  petId: string,
  rescueCaseId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await client.rpc('link_pet_rescue_case' as never, {
    p_pet_id: petId,
    p_rescue_case_id: rescueCaseId,
  } as never);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

