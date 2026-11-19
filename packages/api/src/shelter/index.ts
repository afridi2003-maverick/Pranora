import type { TypedSupabaseClient } from '../client';
import type {
  ShelterOnboardingInput,
  ShelterDashboardStats,
  RescueReviewQueueFilter,
} from '@pranora/validation';
import type { AnimalReportRow, RescueCaseRow } from '../rescue';
import type { AdoptionListingRow, AdoptionApplicationRow } from '../adoption';

// ── Types ───────────────────────────────────────────────────────────────────

export interface ShelterProviderRow {
  id: string;
  owner_user_id: string;
  type: 'shelter';
  name_en: string;
  name_bn: string | null;
  phone: string;
  email: string | null;
  verification: 'draft' | 'pending' | 'verified' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface RegisterShelterResponse {
  success: boolean;
  providerId: string;
  locationId: string;
  name: string;
  capacity: number;
  status: string;
}

// ── Client Methods ──────────────────────────────────────────────────────────

/** Register a new shelter via the register_shelter RPC */
export async function registerShelter(
  client: TypedSupabaseClient,
  input: ShelterOnboardingInput
): Promise<RegisterShelterResponse> {
  const { data, error } = await (client.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)(
    'register_shelter',
    {
      p_name_en: input.name,
      p_name_bn: input.nameBn ?? null,
      p_phone: input.phone,
      p_email: input.email ?? null,
      p_address_en: input.address,
      p_address_bn: input.addressBn ?? null,
      p_division_id: input.divisionId ?? null,
      p_district_id: input.districtId ?? null,
      p_upazila_id: input.upazilaId ?? null,
      p_capacity: input.capacity,
      p_supported_species: input.supportedSpecies,
      p_emergency_intake: input.emergencyIntake,
      p_documents: input.documents,
    }
  );

  if (error) throw error;
  return data as RegisterShelterResponse;
}

/** Get the current user's own shelter profile */
export async function getMyShelterProfile(
  client: TypedSupabaseClient
): Promise<ShelterProviderRow | null> {
  const { data: user } = await client.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await client
    .from('providers' as any)
    .select('*')
    .eq('owner_user_id', user.user.id)
    .eq('type', 'shelter')
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ShelterProviderRow | null;
}

/** Get animal_reports with status 'submitted' or 'under_review' for shelter queue, urgency desc */
export async function getShelterRescueQueue(
  client: TypedSupabaseClient,
  _shelterId?: string
): Promise<AnimalReportRow[]> {
  const { data, error } = await client
    .from('animal_reports' as any)
    .select('*')
    .in('status', ['submitted', 'under_review'])
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as AnimalReportRow[];
}

/**
 * RSC-2: Fetch rescue review queue for admin or shelter staff,
 * ordered by urgency DESC (critical first), then created_at ASC (oldest first).
 */
export async function getRescueReviewQueue(
  client: TypedSupabaseClient,
  filter?: Partial<RescueReviewQueueFilter>
): Promise<AnimalReportRow[]> {
  let query = client
    .from('animal_reports' as any)
    .select('*');

  if (filter?.status && filter.status !== 'all') {
    query = query.eq('status', filter.status);
  } else if (!filter?.status) {
    query = query.in('status', ['submitted', 'under_review']);
  }

  if (filter?.urgency) {
    query = query.eq('urgency', filter.urgency);
  }
  if (filter?.species) {
    query = query.eq('species', filter.species);
  }
  if (filter?.districtId) {
    query = query.eq('district_id', filter.districtId);
  }

  // Priority ordering: critical > high > medium > low, then oldest first
  query = query
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: true });

  if (filter?.limit) {
    query = query.limit(filter.limit);
  }
  if (filter?.offset) {
    query = query.range(filter.offset, filter.offset + (filter.limit ?? 50) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as AnimalReportRow[];
}

/** Get active rescue_cases linked to a shelter */
export async function getShelterActiveCases(
  client: TypedSupabaseClient,
  shelterId: string
): Promise<RescueCaseRow[]> {
  const { data, error } = await client
    .from('rescue_cases' as any)
    .select('*')
    .eq('shelter_id', shelterId)
    .neq('status', 'closed')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as RescueCaseRow[];
}

/** Get adoption_listings for a shelter */
export async function getShelterAdoptionListings(
  client: TypedSupabaseClient,
  shelterId: string
): Promise<AdoptionListingRow[]> {
  const { data, error } = await client
    .from('adoption_listings' as any)
    .select('*')
    .eq('shelter_id', shelterId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AdoptionListingRow[];
}

/** Get pending adoption applications for all listings owned by a shelter */
export async function getShelterPendingApplications(
  client: TypedSupabaseClient,
  shelterId: string
): Promise<AdoptionApplicationRow[]> {
  const { data: listings, error: le } = await client
    .from('adoption_listings' as any)
    .select('id')
    .eq('shelter_id', shelterId);

  if (le) throw le;
  const listingIds = (listings ?? []).map((l: any) => l.id as string);
  if (listingIds.length === 0) return [];

  const { data, error } = await client
    .from('adoption_applications' as any)
    .select('*')
    .in('listing_id', listingIds)
    .eq('status', 'submitted')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AdoptionApplicationRow[];
}

/** Aggregate dashboard stats for a shelter */
export async function getShelterDashboardStats(
  client: TypedSupabaseClient,
  shelterId: string
): Promise<ShelterDashboardStats> {
  const [queue, cases, listings, apps] = await Promise.allSettled([
    getShelterRescueQueue(client, shelterId),
    getShelterActiveCases(client, shelterId),
    getShelterAdoptionListings(client, shelterId),
    getShelterPendingApplications(client, shelterId),
  ]);

  return {
    totalCapacity: 50,
    currentOccupancy: cases.status === 'fulfilled' ? cases.value.length : 0,
    pendingQueueCount: queue.status === 'fulfilled' ? queue.value.length : 0,
    activeCasesCount: cases.status === 'fulfilled' ? cases.value.length : 0,
    availableListingsCount:
      listings.status === 'fulfilled'
        ? listings.value.filter((l) => l.status === 'available').length
        : 0,
    pendingApplicationsCount: apps.status === 'fulfilled' ? apps.value.length : 0,
  };
}
