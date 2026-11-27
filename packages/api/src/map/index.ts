import type {
  NearbyClinicsQueryInput,
  NearbyClinicResult,
  ProviderType,
} from '@pranora/validation';
export type { NearbyClinicResult };
import type { TypedSupabaseClient } from '../client';
import { getAllMockClinics } from '../clinics/mock';

/**
 * Raw row shape returned from the Postgres nearby_clinics function (schema.md §5.2)
 */
export interface NearbyClinicsDbRow {
  location_id: string;
  provider_id: string;
  name_bn: string | null;
  name_en: string | null;
  address_bn: string | null;
  address_en: string | null;
  phone: string | null;
  type: ProviderType;
  is_government: boolean;
  is_24h: boolean;
  has_emergency: boolean;
  offers_home_visit: boolean;
  is_open_now: boolean;
  rating_avg: number;
  rating_count: number;
  fee_from: number | null;
  lat: number;
  lng: number;
  distance_m: number;
}

/**
 * Converts DB snake_case row to TypeScript camelCase object
 */
export function mapNearbyClinicRow(row: NearbyClinicsDbRow): NearbyClinicResult {
  return {
    locationId: row.location_id,
    providerId: row.provider_id,
    nameBn: row.name_bn,
    nameEn: row.name_en,
    addressBn: row.address_bn,
    addressEn: row.address_en,
    phone: row.phone,
    type: row.type,
    isGovernment: row.is_government,
    is24h: row.is_24h,
    hasEmergency: row.has_emergency,
    offersHomeVisit: row.offers_home_visit,
    isOpenNow: row.is_open_now,
    ratingAvg: Number(row.rating_avg ?? 0),
    ratingCount: Number(row.rating_count ?? 0),
    feeFrom: row.fee_from !== null ? Number(row.fee_from) : null,
    lat: Number(row.lat),
    lng: Number(row.lng),
    distanceM: Number(row.distance_m ?? 0),
  };
}

/**
 * Integration Contract 5.2 / MAP-1:
 * Calls the Postgres function nearby_clinics via Supabase RPC.
 */
export async function getNearbyClinics(
  client: TypedSupabaseClient,
  params: NearbyClinicsQueryInput
): Promise<NearbyClinicResult[]> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    'nearby_clinics',
    {
      p_lat: params.lat,
      p_lng: params.lng,
      p_radius_m: params.radiusM ?? 5000,
      p_open_now: params.openNow ?? false,
      p_emergency: params.emergency ?? false,
      p_home_visit: params.homeVisit ?? false,
      p_species: params.species ?? null,
      p_service: params.service ?? null,
      p_max_fee: params.maxFee ?? null,
      p_types: params.types,
      p_limit: params.limit ?? 50,
    }
  );

  if (error) {
    throw new Error(`Failed to fetch nearby clinics: ${error.message}`);
  }

  const rows = (data ?? []) as NearbyClinicsDbRow[];
  return rows.map(mapNearbyClinicRow);
}

/**
 * Resolves nearby clinics using Postgres RPC when available,
 * falling back to client-side spatial calculation over seeded clinics.
 */
export async function getNearbyClinicsWithFallback(
  params: NearbyClinicsQueryInput,
  client?: TypedSupabaseClient | null
): Promise<NearbyClinicResult[]> {
  if (client) {
    try {
      const live = await getNearbyClinics(client, params);
      if (live && live.length > 0) return live;
    } catch {
      // Fall through to mock calculation
    }
  }

  const all = getAllMockClinics();
  const results: NearbyClinicResult[] = [];

  for (const item of all) {
    const loc = item.location;
    const prv = item.provider;
    const dist = calculateDistanceMeters(params.lat, params.lng, loc.lat, loc.lng);

    if (params.radiusM && dist > params.radiusM) {
      // skip outside radius
      continue;
    }
    if (params.openNow && !loc.is24h) {
      // Basic check
      continue;
    }
    if (params.emergency && !loc.hasEmergency) {
      continue;
    }
    if (params.homeVisit && !loc.offersHomeVisit) {
      continue;
    }
    if (params.species && !loc.speciesTreated.includes(params.species)) {
      continue;
    }

    const fee = item.vets[0]?.consultationFee ?? item.services[0]?.price ?? 500;
    if (params.maxFee && fee > params.maxFee) {
      continue;
    }

    results.push({
      locationId: loc.id,
      providerId: prv.id,
      nameBn: prv.nameBn ?? null,
      nameEn: prv.nameEn ?? null,
      addressBn: loc.addressBn,
      addressEn: loc.addressEn,
      phone: loc.phone || prv.phone,
      type: prv.type,
      isGovernment: prv.isGovernment,
      is24h: loc.is24h,
      hasEmergency: loc.hasEmergency,
      offersHomeVisit: loc.offersHomeVisit,
      isOpenNow: loc.is24h || loc.isActive,
      ratingAvg: prv.ratingAvg,
      ratingCount: prv.ratingCount,
      feeFrom: fee,
      lat: loc.lat,
      lng: loc.lng,
      distanceM: dist,
    });
  }

  // Sort by distance ascending
  results.sort((a, b) => a.distanceM - b.distanceM);
  return results.slice(0, params.limit ?? 50);
}

/**
 * Integration Contract 5.1:
 * Checks whether a given provider location is currently open (schema.md §5.1).
 */
export async function isLocationOpen(
  client: TypedSupabaseClient,
  locationId: string,
  at?: string
): Promise<boolean> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    'is_location_open',
    {
      p_location_id: locationId,
      p_at: at ?? new Date().toISOString(),
    }
  );

  if (error) {
    throw new Error(`Failed to check if location is open: ${error.message}`);
  }

  return Boolean(data);
}

/**
 * Generates external Google Maps Directions URL (docs/trd.md §4.3)
 */
export function buildGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Generates dialer URL for a given phone number (docs/trd.md §4.3)
 */
export function buildTelUrl(phone: string): string {
  const sanitized = phone.replace(/[^\d+]/g, '');
  return `tel:${sanitized}`;
}

/**
 * Haversine formula for client-side distance calculation (in meters)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export * from './areas';
export * from './clustering';

