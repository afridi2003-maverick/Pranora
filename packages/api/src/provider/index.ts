import type { TypedSupabaseClient } from '../client';
import type { ProviderOnboardingInput } from '@pranora/validation';
import type { ProviderType } from '@pranora/validation';

// ── Types ───────────────────────────────────────────────────────────────────

export interface ProviderRow {
  id: string;
  owner_user_id: string;
  type: ProviderType;
  name_en: string;
  name_bn: string | null;
  description_en: string | null;
  description_bn: string | null;
  logo_url: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  trade_license_no: string | null;
  is_government: boolean;
  verification: 'draft' | 'pending' | 'verified' | 'rejected' | 'suspended';
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderLocationRow {
  id: string;
  provider_id: string;
  name_en: string;
  name_bn: string | null;
  address_en: string;
  address_bn: string | null;
  upazila_id: number | null;
  phone: string;
  is_24h: boolean;
  has_emergency: boolean;
  offers_home_visit: boolean;
  home_visit_radius_km: number | null;
  species_treated: string[];
  photos: string[];
  cancel_cutoff_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterProviderResponse {
  success: boolean;
  providerId: string;
  locationId: string;
  name: string;
  status: string;
}

// ── Client Methods ──────────────────────────────────────────────────────────

/** Register a new provider business via register_provider RPC */
export async function registerProvider(
  client: TypedSupabaseClient,
  input: ProviderOnboardingInput
): Promise<RegisterProviderResponse> {
  const formattedHours = input.hours.map((h) => ({
    weekday: h.weekday,
    open_time: h.openTime,
    close_time: h.closeTime,
  }));

  const { data, error } = await (client.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)(
    'register_provider',
    {
      p_type: input.type,
      p_name_en: input.name,
      p_name_bn: input.nameBn ?? null,
      p_phone: input.phone,
      p_email: input.email || null,
      p_trade_license_no: input.tradeLicenseNo || null,
      p_website: input.website || null,
      p_address_en: input.address,
      p_address_bn: input.addressBn ?? null,
      p_latitude: input.latitude ?? 23.8103,
      p_longitude: input.longitude ?? 90.4125,
      p_upazila_id: input.upazilaId ?? null,
      p_is_24h: input.is24h,
      p_has_emergency: input.hasEmergency,
      p_offers_home_visit: input.offersHomeVisit,
      p_cancel_cutoff_hours: input.cancelCutoffHours,
      p_species_treated: input.speciesTreated,
      p_hours: formattedHours,
      p_documents: input.documents,
    }
  );

  if (error) throw error;
  return data as RegisterProviderResponse;
}

/** Fetch provider profile owned by the current authenticated user */
export async function getMyProviderProfile(
  client: TypedSupabaseClient
): Promise<ProviderRow | null> {
  const { data: user } = await client.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await client
    .from('providers' as any)
    .select('*')
    .eq('owner_user_id', user.user.id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ProviderRow | null;
}

/** Fetch physical branches/locations owned by a provider */
export async function getMyProviderLocations(
  client: TypedSupabaseClient,
  providerId: string
): Promise<ProviderLocationRow[]> {
  const { data, error } = await client
    .from('provider_locations' as any)
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ProviderLocationRow[];
}
