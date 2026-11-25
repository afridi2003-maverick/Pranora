import { createSupabaseClient, type TypedSupabaseClient } from '@pranora/api';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';

let browserClient: TypedSupabaseClient | null = null;

/**
 * Returns true when real (non-placeholder) Supabase credentials are configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !key.includes('dummy_anon_key')
  );
}

/**
 * Browser-safe Supabase client singleton.
 */
export function getSupabaseBrowserClient(): TypedSupabaseClient {
  if (!browserClient) {
    browserClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}
