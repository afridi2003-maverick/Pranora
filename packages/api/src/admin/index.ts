import type { RoleStatus, UserRole } from '@pranora/types';
import type { TypedSupabaseClient } from '../client';

export interface VerificationRequest {
  id: string;
  user_id: string;
  role: UserRole;
  status: RoleStatus;
  created_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
}

export async function listPendingVerifications(
  client: TypedSupabaseClient
): Promise<VerificationRequest[]> {
  const { data, error } = await client
    .from('user_roles')
    .select('*')
    .eq('status', 'pending');

  if (error) {
    throw error;
  }

  return (data as VerificationRequest[]) ?? [];
}
