import { z } from 'zod';
import { SpeciesSchema } from './pets';
import { paymentMethodSchema } from './booking';

// ── Product Categories ────────────────────────────────────────────────────────

export const ProductCategorySchema = z.enum([
  'food',
  'medicine',
  'accessories',
  'toys',
  'hygiene',
]);
export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const OrderStatusSchema = z.enum([
  'placed',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

// ── Product Schemas ──────────────────────────────────────────────────────────

export const ProductSchema = z.object({
  id: z.string().uuid(),
  provider_id: z.string().uuid(),
  name_bn: z.string().min(1, 'Product name in Bangla is required'),
  name_en: z.string().min(1, 'Product name in English is required'),
  description_bn: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  category: ProductCategorySchema,
  species: z.array(SpeciesSchema).default(['dog', 'cat']),
  price: z.number().min(0, 'Price must be positive'),
  sale_price: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).default([]),
  requires_prescription: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductFilterSchema = z.object({
  category: ProductCategorySchema.optional(),
  species: SpeciesSchema.optional(),
  query: z.string().optional(),
  inStockOnly: z.boolean().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});
export type ProductFilter = z.infer<typeof ProductFilterSchema>;

// ── Cart & Order Item Schemas ────────────────────────────────────────────────

export const OrderItemInputSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});
export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;

export const CartItemSchema = z.object({
  product: ProductSchema,
  quantity: z.number().int().min(1),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CreateShopOrderSchema = z.object({
  provider_id: z.string().uuid('Valid shop provider ID required'),
  address_id: z.string().uuid().optional(),
  shipping_address: z.string().min(5, 'Shipping address is required'),
  phone: z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, 'Valid Bangladeshi phone number required'),
  items: z.array(OrderItemInputSchema).min(1, 'Cart must have at least one product'),
  payment_method: paymentMethodSchema.default('cash'),
  delivery_fee: z.number().min(0).default(60),
  notes: z.string().max(500).optional(),
});
export type CreateShopOrderInput = z.infer<typeof CreateShopOrderSchema>;

export const CancelShopOrderSchema = z.object({
  order_id: z.string().uuid('Valid order ID required'),
  reason: z.string().min(3, 'Cancellation reason is required').max(300),
});
export type CancelShopOrderInput = z.infer<typeof CancelShopOrderSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0),
  product: ProductSchema.optional(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const ShopOrderSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  owner_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  address_id: z.string().uuid().nullable().optional(),
  shipping_address: z.string(),
  phone: z.string(),
  status: OrderStatusSchema,
  subtotal: z.number(),
  delivery_fee: z.number(),
  total: z.number(),
  payment_method: paymentMethodSchema,
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']),
  notes: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  items: z.array(OrderItemSchema).optional(),
});
export type ShopOrder = z.infer<typeof ShopOrderSchema>;
