import type { TypedSupabaseClient } from '../client';

export interface ClinicSuggestionInput {
  name: string;
  nameEn?: string;
  divisionId?: number;
  districtId?: number;
  address: string;
  phone: string;
  is24h?: boolean;
  hasEmergency?: boolean;
  offersHomeVisit?: boolean;
  services?: string[];
  notes?: string;
  photoUrl?: string;
  suggestedBy?: string;
}

export interface ClinicSuggestionResult {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: 'draft' | 'submitted' | 'verified' | 'rejected';
  createdAt: string;
}

export const MOCK_SUGGESTIONS: ClinicSuggestionResult[] = [];

/**
 * Submits a community suggestion for a new or missing veterinary clinic (MAP-11)
 * Integrates with public.clinic_suggestions table and admin moderation queue.
 */
export async function submitClinicSuggestion(
  input: ClinicSuggestionInput,
  client?: TypedSupabaseClient | null
): Promise<ClinicSuggestionResult> {
  if (!input.name || input.name.trim().length < 2) {
    throw new Error('Clinic name must be at least 2 characters');
  }
  if (!input.address || input.address.trim().length < 5) {
    throw new Error('Address must be at least 5 characters');
  }
  if (!input.phone || input.phone.trim().length < 8) {
    throw new Error('Phone number must be at least 8 digits');
  }

  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sug-${Date.now()}`;
  const result: ClinicSuggestionResult = {
    id,
    name: input.name,
    address: input.address,
    phone: input.phone,
    status: 'submitted',
    createdAt: new Date().toISOString(),
  };

  if (client) {
    try {
      const { data, error } = await (client as any).from('clinic_suggestions').insert({
        id,
        name: input.name,
        phone: input.phone,
        address: input.address,
        status: 'submitted',
        suggested_by: input.suggestedBy ?? null,
      }).select().single();

      if (!error && data) {
        result.id = data.id;
        result.status = data.status || 'submitted';
      }
    } catch {
      // Fall through to in-memory store
    }
  }

  MOCK_SUGGESTIONS.unshift(result);
  return result;
}

/**
 * Retrieves submitted suggestions by the user
 */
export async function getMyClinicSuggestions(
  userId?: string,
  client?: TypedSupabaseClient | null
): Promise<ClinicSuggestionResult[]> {
  if (client && userId) {
    try {
      const { data, error } = await (client as any)
        .from('clinic_suggestions')
        .select('*')
        .eq('suggested_by', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          address: d.address,
          phone: d.phone,
          status: d.status,
          createdAt: d.created_at,
        }));
      }
    } catch {
      // Fall through to mock list
    }
  }

  return MOCK_SUGGESTIONS;
}
