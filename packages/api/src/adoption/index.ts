import type { TypedSupabaseClient } from '../client';
import type {
  SpeciesType,
  PetGender,
  AdoptionListingStatus,
  AdoptionApplicationStatus,
  HomeType,
} from '@pranora/types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface AdoptionListingRow {
  id: string;
  pet_id: string;
  posted_by: string;
  shelter_id: string | null;
  species: SpeciesType;
  age_months: number | null;
  gender: PetGender;
  title_bn: string | null;
  title_en: string | null;
  description_bn: string | null;
  description_en: string | null;
  photos: string[];
  is_vaccinated: boolean;
  is_neutered: boolean;
  district_id: number;
  upazila_id: number | null;
  status: AdoptionListingStatus;
  created_at: string;
  updated_at: string;
}

export interface AdoptionApplicationRow {
  id: string;
  listing_id: string;
  applicant_id: string;
  home_type: HomeType;
  has_other_pets: boolean;
  experience: string | null;
  reason: string;
  status: AdoptionApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  decision_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdoptionApplicationWithListing {
  application: AdoptionApplicationRow;
  listing: AdoptionListingRow;
}

export interface AdoptionHandoverRow {
  id: string;
  listing_id: string;
  application_id: string;
  pet_id: string;
  from_user_id: string;
  to_user_id: string;
  giver_confirmed_at: string | null;
  adopter_confirmed_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AdoptionFollowupRow {
  id: string;
  handover_id: string;
  due_on: string;
  sent_at: string | null;
  answered_at: string | null;
  wellbeing: 'good' | 'okay' | 'needs_help' | null;
  note: string | null;
  photos: string[];
}

export interface CreateListingPayload {
  pet_id: string;
  shelter_id?: string | null;
  species: SpeciesType;
  age_months?: number | null;
  gender?: PetGender;
  title_bn?: string | null;
  title_en?: string | null;
  description_bn?: string | null;
  description_en?: string | null;
  photos?: string[];
  is_vaccinated?: boolean;
  is_neutered?: boolean;
  district_id: number;
  upazila_id?: number | null;
  status?: AdoptionListingStatus;
}

export interface CreateApplicationPayload {
  listing_id: string;
  home_type?: HomeType;
  has_other_pets?: boolean;
  experience?: string | null;
  reason: string;
}

export interface ListerEligibilityResult {
  isEligible: boolean;
  role: 'shelter' | 'adoption_lister' | 'admin' | null;
  status: 'verified' | 'pending' | 'none';
  shelterId?: string | null;
}

export interface EligiblePetItem {
  id: string;
  name: string;
  species: SpeciesType;
  gender: PetGender;
  date_of_birth: string | null;
  age_months: number | null;
  breed_name?: string | null;
  photo_url: string | null;
  is_neutered: boolean | null;
  has_active_listing: boolean;
}

// ── Client Methods ──────────────────────────────────────────────────────────

/** Browse public adoption listings with optional filters */
export async function getPublicAdoptionListings(
  client: TypedSupabaseClient,
  filters?: {
    species?: SpeciesType;
    district_id?: number;
    gender?: PetGender;
    min_age_months?: number;
    max_age_months?: number;
    limit?: number;
    offset?: number;
  }
): Promise<AdoptionListingRow[]> {
  let query = client
    .from('adoption_listings')
    .select('*')
    .in('status', ['available', 'reserved'])
    .order('created_at', { ascending: false });

  if (filters?.species) {
    query = query.eq('species', filters.species);
  }
  if (filters?.district_id) {
    query = query.eq('district_id', filters.district_id);
  }
  if (filters?.gender) {
    query = query.eq('gender', filters.gender);
  }
  if (filters?.min_age_months !== undefined) {
    query = query.gte('age_months', filters.min_age_months);
  }
  if (filters?.max_age_months !== undefined) {
    query = query.lte('age_months', filters.max_age_months);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit ?? 20) - 1
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as AdoptionListingRow[];
}

/** Get a single adoption listing by ID */
export async function getAdoptionListingById(
  client: TypedSupabaseClient,
  listingId: string
): Promise<AdoptionListingRow | null> {
  const { data, error } = await client
    .from('adoption_listings')
    .select('*')
    .eq('id', listingId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as AdoptionListingRow | null;
}

/** Get listings posted by the user or their shelter */
export async function getMyAdoptionListings(
  client: TypedSupabaseClient,
  userId: string
): Promise<AdoptionListingRow[]> {
  const { data, error } = await client
    .from('adoption_listings')
    .select('*')
    .eq('posted_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AdoptionListingRow[];
}

/**
 * Check whether a user is an approved adoption lister or verified shelter staff (ADP-2)
 */
export async function checkAdoptionListerEligibility(
  client: TypedSupabaseClient,
  userId: string
): Promise<ListerEligibilityResult> {
  const { data: roles, error } = await client
    .from('user_roles')
    .select('role, status')
    .eq('user_id', userId);

  if (error) throw error;

  const rolesList = roles || [];
  const isAdmin = rolesList.some((r) => r.role === 'admin' && r.status === 'verified');
  if (isAdmin) {
    return { isEligible: true, role: 'admin', status: 'verified' };
  }

  const shelterRole = rolesList.find((r) => r.role === 'shelter');
  if (shelterRole?.status === 'verified') {
    // Lookup associated shelter provider id
    const { data: prov } = await client
      .from('providers')
      .select('id')
      .eq('owner_user_id', userId)
      .eq('type', 'shelter')
      .maybeSingle();

    return {
      isEligible: true,
      role: 'shelter',
      status: 'verified',
      shelterId: prov?.id ?? null,
    };
  }

  const listerRole = rolesList.find((r) => r.role === 'adoption_lister');
  if (listerRole?.status === 'verified') {
    return { isEligible: true, role: 'adoption_lister', status: 'verified' };
  }

  if (shelterRole?.status === 'pending' || listerRole?.status === 'pending') {
    return {
      isEligible: false,
      role: (shelterRole ? 'shelter' : 'adoption_lister') as any,
      status: 'pending',
    };
  }

  return { isEligible: false, role: null, status: 'none' };
}

/**
 * Fetch pets owned by the user or their shelter, along with their active listing status (ADP-2)
 */
export async function getEligiblePetsForAdoption(
  client: TypedSupabaseClient,
  userId: string,
  shelterId?: string | null
): Promise<EligiblePetItem[]> {
  // Query pets owned by user or shelter
  let query = client
    .from('pets' as any)
    .select('id, name, species, gender, date_of_birth, photo_url, is_neutered, deleted_at')
    .is('deleted_at', null);

  if (shelterId) {
    query = query.or(`owner_id.eq.${userId},shelter_id.eq.${shelterId}`);
  } else {
    query = query.eq('owner_id', userId);
  }

  const { data: petsData, error: petsError } = await query;
  if (petsError) throw petsError;

  const pets = (petsData || []) as any[];
  if (pets.length === 0) return [];

  const petIds = pets.map((p) => p.id);

  // Check active listings
  const { data: activeListings, error: listingsError } = await client
    .from('adoption_listings')
    .select('pet_id')
    .in('pet_id', petIds)
    .in('status', ['draft', 'available', 'reserved']);

  if (listingsError) throw listingsError;

  const activePetIdSet = new Set((activeListings || []).map((l) => l.pet_id));

  return pets.map((p) => {
    let ageMonths: number | null = null;
    if (p.date_of_birth) {
      const birth = new Date(p.date_of_birth).getTime();
      const diffMs = Date.now() - birth;
      ageMonths = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375)));
    }

    return {
      id: p.id,
      name: p.name,
      species: p.species,
      gender: p.gender,
      date_of_birth: p.date_of_birth,
      age_months: ageMonths,
      photo_url: p.photo_url,
      is_neutered: p.is_neutered,
      has_active_listing: activePetIdSet.has(p.id),
    };
  });
}

/** Create a new adoption listing */
export async function createAdoptionListing(
  client: TypedSupabaseClient,
  postedBy: string,
  payload: CreateListingPayload
): Promise<AdoptionListingRow> {
  const { data, error } = await client
    .from('adoption_listings')
    .insert({
      posted_by: postedBy,
      pet_id: payload.pet_id,
      shelter_id: payload.shelter_id ?? null,
      species: payload.species,
      age_months: payload.age_months ?? null,
      gender: payload.gender ?? 'unknown',
      title_bn: payload.title_bn ?? null,
      title_en: payload.title_en ?? null,
      description_bn: payload.description_bn ?? null,
      description_en: payload.description_en ?? null,
      photos: payload.photos ?? [],
      is_vaccinated: payload.is_vaccinated ?? false,
      is_neutered: payload.is_neutered ?? false,
      district_id: payload.district_id,
      upazila_id: payload.upazila_id ?? null,
      status: payload.status ?? 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as AdoptionListingRow;
}

/** Submit an adoption application */
export async function submitAdoptionApplication(
  client: TypedSupabaseClient,
  applicantId: string,
  payload: CreateApplicationPayload
): Promise<AdoptionApplicationRow> {
  const { data, error } = await client
    .from('adoption_applications')
    .insert({
      applicant_id: applicantId,
      listing_id: payload.listing_id,
      home_type: payload.home_type ?? 'own_flat',
      has_other_pets: payload.has_other_pets ?? false,
      experience: payload.experience ?? null,
      reason: payload.reason,
      status: 'submitted',
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as AdoptionApplicationRow;
}

/** Get applications submitted by current user */
export async function getMyApplications(
  client: TypedSupabaseClient,
  applicantId: string
): Promise<AdoptionApplicationRow[]> {
  const { data, error } = await client
    .from('adoption_applications')
    .select('*')
    .eq('applicant_id', applicantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AdoptionApplicationRow[];
}

/** Get applications submitted by current user with associated listing details (ADP-4) */
export async function getMyApplicationsWithListings(
  client: TypedSupabaseClient,
  applicantId: string
): Promise<AdoptionApplicationWithListing[]> {
  const { data: apps, error: appsError } = await client
    .from('adoption_applications')
    .select('*')
    .eq('applicant_id', applicantId)
    .order('created_at', { ascending: false });

  if (appsError) throw appsError;
  if (!apps || apps.length === 0) return [];

  const listingIds = apps.map((a: any) => a.listing_id);
  const { data: listings, error: listingsError } = await client
    .from('adoption_listings')
    .select('*')
    .in('id', listingIds);

  if (listingsError) throw listingsError;

  const listingMap = new Map((listings || []).map((l: any) => [l.id, l as unknown as AdoptionListingRow]));

  return apps.map((app: any) => ({
    application: app as unknown as AdoptionApplicationRow,
    listing: listingMap.get(app.listing_id) || ({} as AdoptionListingRow),
  }));
}

/** Withdraw an un-decided adoption application */
export async function withdrawAdoptionApplication(
  client: TypedSupabaseClient,
  applicationId: string,
  applicantId: string
): Promise<boolean> {
  const { error } = await client
    .from('adoption_applications')
    .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .eq('applicant_id', applicantId)
    .in('status', ['submitted', 'under_review']);

  if (error) throw error;
  return true;
}

/** Get applications received for a listing (for poster / shelter review) */
export async function getListingApplications(
  client: TypedSupabaseClient,
  listingId: string
): Promise<AdoptionApplicationRow[]> {
  const { data, error } = await client
    .from('adoption_applications')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AdoptionApplicationRow[];
}

/** Fetch handover record for a listing */
export async function getHandoverByListingId(
  client: TypedSupabaseClient,
  listingId: string
): Promise<AdoptionHandoverRow | null> {
  const { data, error } = await client
    .from('adoption_handovers')
    .select('*')
    .eq('listing_id', listingId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as AdoptionHandoverRow | null;
}

/** Fetch handover record by its ID */
export async function getHandoverById(
  client: TypedSupabaseClient,
  handoverId: string
): Promise<AdoptionHandoverRow | null> {
  const { data, error } = await client
    .from('adoption_handovers')
    .select('*')
    .eq('id', handoverId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as AdoptionHandoverRow | null;
}

/** Fetch follow-ups for a handover */
export async function getHandoverFollowups(
  client: TypedSupabaseClient,
  handoverId: string
): Promise<AdoptionFollowupRow[]> {
  const { data, error } = await client
    .from('adoption_followups')
    .select('*')
    .eq('handover_id', handoverId)
    .order('due_on', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as AdoptionFollowupRow[];
}

// ── RPC Invocations ─────────────────────────────────────────────────────────

/** Human reviewer approves or rejects an application */
export async function decideAdoptionApplication(
  client: TypedSupabaseClient,
  applicationId: string,
  approve: boolean,
  note?: string | null
): Promise<boolean> {
  const { data, error } = await client.rpc('decide_adoption_application', {
    p_application_id: applicationId,
    p_approve: approve,
    p_note: note ?? null,
  });

  if (error) throw error;
  return Boolean(data);
}

/** Giver or adopter confirms handover */
export async function confirmHandover(
  client: TypedSupabaseClient,
  handoverId: string
): Promise<boolean> {
  const { data, error } = await client.rpc('confirm_handover', {
    p_handover_id: handoverId,
  });

  if (error) throw error;
  return Boolean(data);
}

/** Toggle favorite/save on an adoption listing */
export async function toggleAdoptionFavorite(
  client: TypedSupabaseClient,
  listingId: string
): Promise<boolean> {
  const { data, error } = await client.rpc('toggle_adoption_favorite', {
    p_listing_id: listingId,
  });

  if (error) throw error;
  return Boolean(data);
}
