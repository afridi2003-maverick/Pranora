import type { TypedSupabaseClient } from '../client';
import type {
  ProviderOnboardingInput,
  ProviderType,
  ProviderDashboardStats,
  SerialQueueItem,
} from '@pranora/validation';

export type { ProviderDashboardStats, SerialQueueItem };

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

/**
 * PRV-2: Fetch dashboard metric summary for a provider location
 */
export async function getProviderDashboardSummary(
  client: TypedSupabaseClient,
  locationId: string
): Promise<ProviderDashboardStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: bookings, error } = await client
    .from('bookings' as any)
    .select('id, type, status, serial_no, price, payment_status, starts_at')
    .eq('location_id', locationId)
    .gte('starts_at', todayStart.toISOString())
    .lte('starts_at', todayEnd.toISOString());

  if (error) throw error;
  const list = (bookings ?? []) as any[];

  const todayAppointments = list.filter((b) => b.type === 'slot');
  const serialBookings = list.filter((b) => b.type === 'serial');
  const completed = list.filter((b) => b.status === 'completed');
  const pending = list.filter((b) => b.status === 'pending');

  const todayRevenue = list
    .filter((b) => b.payment_status === 'paid' && b.price != null)
    .reduce((acc, curr) => acc + Number(curr.price || 0), 0);

  // Lowest incomplete serial is currently serving
  const activeSerials = serialBookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled_by_owner');
  const currentServing = activeSerials.length > 0
    ? Math.min(...activeSerials.map((s) => s.serial_no ?? 1))
    : 1;

  return {
    todayAppointmentsCount: todayAppointments.length,
    activeSerialsCount: serialBookings.length,
    currentServingSerial: currentServing,
    todayRevenue,
    pendingRequestsCount: pending.length,
    completedTodayCount: completed.length,
  };
}

/**
 * PRV-2: Fetch serial queue list for patient live tracking
 */
export async function getProviderSerialQueue(
  client: TypedSupabaseClient,
  locationId: string
): Promise<SerialQueueItem[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await client
    .from('bookings' as any)
    .select('id, code, serial_no, status, starts_at, problem_note, pets(name, species)')
    .eq('location_id', locationId)
    .eq('type', 'serial')
    .gte('starts_at', todayStart.toISOString())
    .order('serial_no', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    serialNo: row.serial_no ?? 1,
    bookingId: row.id,
    code: row.code,
    patientName: row.pets?.name || 'Patient',
    species: row.pets?.species || 'Pet',
    status: row.status === 'in_progress' ? 'serving' : row.status === 'completed' ? 'completed' : 'waiting',
    estimatedTime: row.starts_at ? new Date(row.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
  }));
}

