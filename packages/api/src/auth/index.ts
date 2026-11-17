import type { UserRole, RoleStatus, Database } from '@pranora/types';
import type { TypedSupabaseClient } from '../client';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface UserRoleRecord {
  user_id: string;
  role: UserRole;
  status: RoleStatus;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at?: string;
}

export interface AuthSessionUser {
  id: string;
  phone?: string | null;
  email?: string | null;
  roles?: UserRoleRecord[];
  profile?: ProfileRow | null;
}

/**
 * Normalizes phone numbers to Bangladeshi E.164 format (+8801XXXXXXXXX)
 */
export function normalizeBdPhone(phone: string): string {
  const digitsOnly = phone.replace(/[^\d+]/g, '');
  if (digitsOnly.startsWith('+8801')) {
    return digitsOnly;
  }
  if (digitsOnly.startsWith('8801')) {
    return `+${digitsOnly}`;
  }
  if (digitsOnly.startsWith('01')) {
    return `+88${digitsOnly}`;
  }
  return digitsOnly;
}

/**
 * Send Phone OTP via Supabase Auth
 */
export async function signInWithPhoneOtp(
  client: TypedSupabaseClient,
  phone: string
): Promise<{ success: boolean; error?: string }> {
  const normalized = normalizeBdPhone(phone);
  const { error } = await client.auth.signInWithOtp({
    phone: normalized,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Verify Phone OTP
 */
export async function verifyPhoneOtp(
  client: TypedSupabaseClient,
  phone: string,
  token: string
): Promise<{ success: boolean; session?: any; error?: string }> {
  const normalized = normalizeBdPhone(phone);
  const { data, error } = await client.auth.verifyOtp({
    phone: normalized,
    token: token.trim(),
    type: 'sms',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, session: data.session };
}

/**
 * Send Email OTP / Magic Link
 */
export async function signInWithEmailOtp(
  client: TypedSupabaseClient,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await client.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Verify Email OTP
 */
export async function verifyEmailOtp(
  client: TypedSupabaseClient,
  email: string,
  token: string
): Promise<{ success: boolean; session?: any; error?: string }> {
  const { data, error } = await client.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, session: data.session };
}

/**
 * Sign out current session
 */
export async function signOut(client: TypedSupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Fetch current user profile
 */
export async function getProfile(
  client: TypedSupabaseClient,
  userId: string
): Promise<ProfileRow | null> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Update current user profile
 */
export async function updateProfile(
  client: TypedSupabaseClient,
  userId: string,
  updates: ProfileUpdate
): Promise<ProfileRow> {
  const { data, error } = await client
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get all roles for a user
 */
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

/**
 * Check if a user holds a specific verified role
 */
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

/**
 * Request a new role for a user (status starts pending)
 */
export async function requestRole(
  client: TypedSupabaseClient,
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  const { error } = await client.from('user_roles').insert({
    user_id: userId,
    role,
    status: role === 'owner' ? 'verified' : 'pending',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
