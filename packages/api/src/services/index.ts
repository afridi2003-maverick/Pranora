import type { TypedSupabaseClient } from '../client';
export * from './online-consult';

// ── Types ───────────────────────────────────────────────────────────────────

export interface ServiceCategoryRow {
  id: number;
  slug: string;
  name_bn: string;
  name_en: string;
  icon_emoji: string | null;
  display_order: number;
  is_mvp: boolean;
  is_active: boolean;
}

export interface ServiceRow {
  id: number;
  category_id: number;
  slug: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  icon_emoji: string | null;
  is_mvp: boolean;
  is_active: boolean;
  display_order: number;
  // joined
  category?: ServiceCategoryRow | null;
}

// ── API Functions ────────────────────────────────────────────────────────────

/**
 * List all active service categories, ordered by display_order.
 */
export async function listServiceCategories(
  client: TypedSupabaseClient
): Promise<{ data: ServiceCategoryRow[]; error?: string }> {
  const { data, error } = await client
    .from('service_categories' as never)
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as ServiceCategoryRow[] };
}

/**
 * List only MVP services (is_mvp=true), ordered by display_order.
 */
export async function listMvpServices(
  client: TypedSupabaseClient
): Promise<{ data: ServiceRow[]; error?: string }> {
  const { data, error } = await client
    .from('services' as never)
    .select(`
      *,
      category:service_categories(id, slug, name_bn, name_en, icon_emoji, display_order, is_mvp, is_active)
    `)
    .eq('is_active', true)
    .eq('is_mvp', true)
    .order('display_order', { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as ServiceRow[] };
}

/**
 * List all active services for a given category slug.
 */
export async function listServicesByCategory(
  client: TypedSupabaseClient,
  categorySlug: string
): Promise<{ data: ServiceRow[]; error?: string }> {
  const { data, error } = await client
    .from('services' as never)
    .select(`
      *,
      category:service_categories!inner(id, slug, name_bn, name_en, icon_emoji, display_order, is_mvp, is_active)
    `)
    .eq('is_active', true)
    .eq('service_categories.slug', categorySlug)
    .order('display_order', { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as ServiceRow[] };
}
