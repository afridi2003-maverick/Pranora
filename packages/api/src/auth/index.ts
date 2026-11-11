import type { UserRole, RoleStatus } from '@pranora/types';
import type { TypedSupabaseClient } from '../client';

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  status: RoleStatus;
}

export async function getUserRoles(
  client: TypedSupabaseClient,
  userId: string
): Promise<UserRoleRecord[]> {
  const { data, error } = await client
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return (data as UserRoleRecord[]) ?? [];
}

export async function checkHasRole(
  client: TypedSupabaseClient,
  userId: string,
  role: UserRole
): Promise<boolean> {
  const { data, error } = await client.rpc('has_role', {
    target_user_id: userId,
    check_role: role,
  });

  if (error) {
    return false;
  }

  return !!data;
}

