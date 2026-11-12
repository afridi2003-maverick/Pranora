import type {
  ProviderLocationDetail,
  ProviderDetail,
  LocationHours,
  VetProfile,
  ProviderService,
} from '@pranora/validation';
import type { TypedSupabaseClient } from '../client';

export interface ClinicFullDetail {
  location: ProviderLocationDetail;
  provider: ProviderDetail;
  hours: LocationHours[];
  vets: VetProfile[];
  services: ProviderService[];
}

/**
 * Helper to query tables that will be formally added to Database types in DB-4 (S2)
 */
function getUntypedDb(client: TypedSupabaseClient) {
  return client as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (table: string) => any;
  };
}

/**
 * Fetches provider location and basic provider details by location ID (MAP-5)
 */
export async function getClinicById(
  client: TypedSupabaseClient,
  locationId: string
): Promise<ClinicFullDetail | null> {
  const db = getUntypedDb(client);
  const { data: locationData, error: locError } = await db
    .from('provider_locations')
    .select('*, providers(*)')
    .eq('id', locationId)
    .single();

  if (locError) {
    if (locError.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch clinic: ${locError.message}`);
  }

  const raw = locationData as Record<string, unknown>;
  const providerRaw = raw.providers as Record<string, unknown> | undefined;

  const [hours, vets, services] = await Promise.all([
    getClinicHours(client, locationId),
    getClinicVets(client, locationId),
    getClinicServices(client, locationId),
  ]);

  return {
    location: {
      id: raw.id as string,
      providerId: raw.provider_id as string,
      nameBn: (raw.name_bn as string) ?? null,
      nameEn: (raw.name_en as string) ?? null,
      addressBn: (raw.address_bn as string) ?? null,
      addressEn: (raw.address_en as string) ?? null,
      upazilaId: (raw.upazila_id as number) ?? null,
      lat: Number(raw.lat ?? 0),
      lng: Number(raw.lng ?? 0),
      phone: (raw.phone as string) ?? null,
      is24h: Boolean(raw.is_24h),
      hasEmergency: Boolean(raw.has_emergency),
      offersHomeVisit: Boolean(raw.offers_home_visit),
      homeVisitRadiusKm: raw.home_visit_radius_km ? Number(raw.home_visit_radius_km) : null,
      speciesTreated: (raw.species_treated as ('dog' | 'cat')[]) ?? ['dog', 'cat'],
      photos: (raw.photos as string[]) ?? [],
      cancelCutoffHours: Number(raw.cancel_cutoff_hours ?? 2),
      isActive: Boolean(raw.is_active),
    },
    provider: {
      id: (providerRaw?.id as string) ?? (raw.provider_id as string),
      ownerUserId: (providerRaw?.owner_user_id as string) ?? '',
      type: (providerRaw?.type as 'vet_clinic') ?? 'vet_clinic',
      nameBn: (providerRaw?.name_bn as string) ?? null,
      nameEn: (providerRaw?.name_en as string) ?? null,
      descriptionBn: (providerRaw?.description_bn as string) ?? null,
      descriptionEn: (providerRaw?.description_en as string) ?? null,
      logoUrl: (providerRaw?.logo_url as string) ?? null,
      phone: (providerRaw?.phone as string) ?? '',
      whatsapp: (providerRaw?.whatsapp as string) ?? null,
      email: (providerRaw?.email as string) ?? null,
      website: (providerRaw?.website as string) ?? null,
      tradeLicenseNo: (providerRaw?.trade_license_no as string) ?? null,
      isGovernment: Boolean(providerRaw?.is_government),
      verification: (providerRaw?.verification as 'verified') ?? 'draft',
      verifiedAt: (providerRaw?.verified_at as string) ?? null,
      ratingAvg: Number(providerRaw?.rating_avg ?? 0),
      ratingCount: Number(providerRaw?.rating_count ?? 0),
    },
    hours,
    vets,
    services,
  };
}

/**
 * Fetches operating hours for a clinic branch
 */
export async function getClinicHours(
  client: TypedSupabaseClient,
  locationId: string
): Promise<LocationHours[]> {
  const db = getUntypedDb(client);
  const { data, error } = await db
    .from('location_hours')
    .select('*')
    .eq('location_id', locationId)
    .order('weekday', { ascending: true })
    .order('open_time', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch clinic hours: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return rows.map((r) => ({
    id: r.id as string,
    locationId: r.location_id as string,
    weekday: Number(r.weekday),
    openTime: r.open_time as string,
    closeTime: r.close_time as string,
  }));
}

/**
 * Fetches active vets working at a clinic branch
 */
export async function getClinicVets(
  client: TypedSupabaseClient,
  locationId: string
): Promise<VetProfile[]> {
  const db = getUntypedDb(client);
  const { data, error } = await db
    .from('location_vets')
    .select('vet_id, vets(*)')
    .eq('location_id', locationId);

  if (error) {
    throw new Error(`Failed to fetch clinic vets: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return rows
    .map((r) => {
      const v = r.vets as Record<string, unknown> | undefined;
      if (!v) return null;
      return {
        id: v.id as string,
        userId: (v.user_id as string) ?? null,
        fullNameBn: (v.full_name_bn as string) ?? null,
        fullNameEn: (v.full_name_en as string) ?? '',
        bvcRegNo: (v.bvc_reg_no as string) ?? null,
        degrees: (v.degrees as string) ?? null,
        specialization: (v.specialization as string) ?? null,
        experienceYears: v.experience_years ? Number(v.experience_years) : null,
        photoUrl: (v.photo_url as string) ?? null,
        consultationFee: v.consultation_fee ? Number(v.consultation_fee) : null,
        onlineConsult: Boolean(v.online_consult),
        verification: (v.verification as 'verified') ?? 'draft',
      } as VetProfile;
    })
    .filter((v): v is VetProfile => v !== null);
}

/**
 * Fetches active services offered at a clinic branch
 */
export async function getClinicServices(
  client: TypedSupabaseClient,
  locationId: string
): Promise<ProviderService[]> {
  const db = getUntypedDb(client);
  const { data, error } = await db
    .from('provider_services')
    .select('*, services(slug, name_bn, name_en)')
    .eq('location_id', locationId)
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch clinic services: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return rows.map((r) => {
    const s = r.services as Record<string, unknown> | undefined;
    return {
      id: r.id as string,
      providerId: r.provider_id as string,
      locationId: (r.location_id as string) ?? null,
      serviceId: r.service_id as string,
      serviceSlug: s?.slug as string | undefined,
      nameBn: s?.name_bn as string | null | undefined,
      nameEn: s?.name_en as string | null | undefined,
      price: Number(r.price ?? 0),
      durationMinutes: r.duration_minutes ? Number(r.duration_minutes) : null,
      isActive: Boolean(r.is_active),
    };
  });
}
