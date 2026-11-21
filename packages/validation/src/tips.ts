import { z } from 'zod';

export const ArticleCategorySchema = z.enum([
  'all',
  'diet',
  'grooming',
  'vaccine',
  'health',
  'seasonal',
  'first_aid',
]);
export type ArticleCategory = z.infer<typeof ArticleCategorySchema>;

export const ArticleSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title_bn: z.string().min(1),
  title_en: z.string().min(1),
  body_bn: z.string().min(1),
  body_en: z.string().min(1),
  excerpt_bn: z.string().optional().nullable(),
  excerpt_en: z.string().optional().nullable(),
  category: ArticleCategorySchema,
  species: z.array(z.string()).default(['all']),
  cover_url: z.string().optional().nullable(),
  read_time_minutes: z.number().int().positive().default(3),
  tags: z.array(z.string()).optional().nullable(),
  is_featured: z.boolean().default(false),
  author_name_bn: z.string().optional().nullable(),
  author_name_en: z.string().optional().nullable(),
  author_id: z.string().uuid().optional().nullable(),
  published_at: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Article = z.infer<typeof ArticleSchema>;

export const ArticleListQuerySchema = z.object({
  category: ArticleCategorySchema.optional().nullable(),
  species: z.string().optional().nullable(),
  search: z.string().optional().nullable(),
  featured: z.boolean().optional().nullable(),
  limit: z.number().int().positive().max(50).optional(),
  offset: z.number().int().min(0).optional(),
});
export type ArticleListQuery = z.infer<typeof ArticleListQuerySchema>;
