// packages/api/src/shop/index.ts
// Owner: Brehat (@brihoth) | Sprint: S7 | Task: SVC-SHOP
// Pet shop catalog, orders, and order items with Cash on Delivery & online payment support

import type { TypedSupabaseClient } from '../client';
import type {
  Product,
  ProductFilter,
  CreateShopOrderInput,
  ShopOrder,
  PaymentMethod,
} from '@pranora/validation';

export const MOCK_SHOP_PRODUCTS: Product[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    provider_id: 'c0000000-0000-0000-0000-000000000001',
    name_bn: 'রয়্যাল ক্যানিন ম্যাক্সি অ্যাডাল্ট ডগ ফুড (১৫ কেজি)',
    name_en: 'Royal Canin Maxi Adult Dry Dog Food (15kg)',
    description_bn: 'প্রাপ্তবয়স্ক মাঝারি ও বড় জাতের কুকুরের সম্পূর্ণ সুষম পুষ্টিকর ড্রাই ফুড। হাড় ও জয়েন্ট সুরক্ষায় কার্যকরী।',
    description_en: 'Balanced complete nutrition for adult large breed dogs. Formulated for digestive health and joint support.',
    category: 'food',
    species: ['dog'],
    price: 9800,
    sale_price: 9200,
    stock: 24,
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&auto=format&fit=crop&q=60'],
    requires_prescription: false,
    is_active: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    provider_id: 'c0000000-0000-0000-0000-000000000001',
    name_bn: 'হুইস্কাস ওশান ফিশ ক্যাট ফুড (৩ কেজি)',
    name_en: 'Whiskas Ocean Fish Adult Cat Food (3kg)',
    description_bn: 'বিড়ালের পছন্দের সুস্বাদু সামুদ্রিক মাছের স্বাদযুক্ত ড্রাই ফুড। লোম উজ্জ্বল রাখে ও চোখের দৃষ্টি ভালো রাখে।',
    description_en: 'Delicious ocean fish flavor for healthy skin, shiny coat, and clear eyesight in adult cats.',
    category: 'food',
    species: ['cat'],
    price: 1850,
    sale_price: 1720,
    stock: 45,
    images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&auto=format&fit=crop&q=60'],
    requires_prescription: false,
    is_active: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    provider_id: 'c0000000-0000-0000-0000-000000000001',
    name_bn: 'ফ্রন্টলাইন প্লাস ফ্লিয়া ও টিক ড্রপস (কুকুর)',
    name_en: 'Frontline Plus Flea & Tick Spot-on for Dogs',
    description_bn: 'উকুন, আঠালি ও মাছি থেকে দ্রুত মুক্তির জন্য ভেটেরিনারি চিকিৎসকদের বিশ্বস্ত স্পট-অন ড্রপ।',
    description_en: 'Fast-acting, long-lasting treatment and prevention of flea and tick infestations.',
    category: 'medicine',
    species: ['dog'],
    price: 1450,
    sale_price: null,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&auto=format&fit=crop&q=60'],
    requires_prescription: false,
    is_active: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    provider_id: 'c0000000-0000-0000-0000-000000000001',
    name_bn: 'বেন্টোনাইট সুবাসিত ক্যাট লিটার (১০ লিটার)',
    name_en: 'Lavender Scented Clumping Cat Litter (10L)',
    description_bn: 'তাত্ক্ষণিক দলা পাকানো প্রিমিয়াম বেন্টোনাইট ক্যাট লিটার। দুর্গন্ধ দূর করে ও পরিষ্কার করা সহজ।',
    description_en: 'Instant clumping natural bentonite clay cat litter with light lavender scent and 99% dust free.',
    category: 'hygiene',
    species: ['cat'],
    price: 850,
    sale_price: 780,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60'],
    requires_prescription: false,
    is_active: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    provider_id: 'c0000000-0000-0000-0000-000000000001',
    name_bn: 'অ্যাডজাস্টেবল রিফ্লেক্টিভ ডগ হারনেস ও লিশ সেট',
    name_en: 'Adjustable Reflective Dog Harness with Leash',
    description_bn: 'রাতে হাঁটার জন্য নিরাপদ রিফ্লেক্টিভ স্ট্র্যাপ এবং সহজে নিয়ন্ত্রণযোগ্য আরামদায়ক ডগ হারনেস।',
    description_en: 'Breathable mesh chest harness with 3M reflective threads and sturdy leash attachment.',
    category: 'accessories',
    species: ['dog'],
    price: 1200,
    sale_price: 990,
    stock: 18,
    images: ['https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&auto=format&fit=crop&q=60'],
    requires_prescription: false,
    is_active: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    provider_id: 'c0000000-0000-0000-0000-000000000001',
    name_bn: 'ইন্টারেক্টিভ ক্যাট লেজার ও ফেদার টিজার খেলনা',
    name_en: 'Interactive Cat Feather Teaser & Laser Wand',
    description_bn: 'বিড়ালের চটপটে ভাব এবং মানসিক উদ্দীপনা বৃদ্ধির জন্য মজাদার ফেদার টিজার ও লেজার পয়েণ্টার।',
    description_en: 'Multi-function interactive wand with real bird feathers and safe LED light tracker.',
    category: 'toys',
    species: ['cat'],
    price: 450,
    sale_price: 380,
    stock: 35,
    images: ['https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&auto=format&fit=crop&q=60'],
    requires_prescription: false,
    is_active: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    provider_id: 'c0000000-0000-0000-0000-000000000001',
    name_bn: 'অ্যালোভেরা ও নিম অর্গানিক পেট শ্যাম্পু (৫০০ মিলি)',
    name_en: 'Organic Aloe & Neem Pet Shampoo (500ml)',
    description_bn: 'কুকুর ও বিড়ালের ত্বকের চুলকানি দূর করতে ভেষজ নিম ও ময়েশ্চারাইজিং অ্যালোভেরা শ্যাম্পু।',
    description_en: 'Soothes itchy skin, deep cleans fur naturally, and prevents fungal or bacterial irritation.',
    category: 'hygiene',
    species: ['dog', 'cat'],
    price: 650,
    sale_price: 590,
    stock: 40,
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=60'],
    requires_prescription: false,
    is_active: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    provider_id: 'c0000000-0000-0000-0000-000000000001',
    name_bn: 'ক্যাটাভিট মাল্টিভিটামিন জেল সাপ্লিমেন্ট (১০০ গ্রাম)',
    name_en: 'Catavit Multi-Vitamin Nutritional Gel (100g)',
    description_bn: 'অসুস্থতা বা অপারেশনের পর দ্রুত রোগ প্রতিরোধ ক্ষমতা বৃদ্ধিতে প্রয়োজনীয় ভিটামিন ও মিনারেল জেল।',
    description_en: 'High calorie nutritional supplement paste for appetite stimulation and vitality.',
    category: 'medicine',
    species: ['cat'],
    price: 950,
    sale_price: null,
    stock: 22,
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&auto=format&fit=crop&q=60'],
    requires_prescription: false,
    is_active: true,
  },
];

/**
 * Fetch products with optional filtering (category, species, search query).
 */
export async function getProducts(
  client: TypedSupabaseClient | null,
  filter?: ProductFilter
): Promise<Product[]> {
  if (client) {
    try {
      let query = client
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (filter?.category) {
        query = query.eq('category', filter.category);
      }

      if (filter?.inStockOnly) {
        query = query.gt('stock', 0);
      }

      if (filter?.minPrice !== undefined) {
        query = query.gte('price', filter.minPrice);
      }

      if (filter?.maxPrice !== undefined) {
        query = query.lte('price', filter.maxPrice);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        let results = data as Product[];
        if (filter?.species) {
          results = results.filter((p) => p.species.includes(filter.species!));
        }
        if (filter?.query) {
          const q = filter.query.toLowerCase();
          results = results.filter(
            (p) =>
              p.name_bn.toLowerCase().includes(q) ||
              p.name_en.toLowerCase().includes(q) ||
              (p.description_bn && p.description_bn.toLowerCase().includes(q)) ||
              (p.description_en && p.description_en.toLowerCase().includes(q))
          );
        }
        return results;
      }
    } catch {
      // Fallback to local mock data
    }
  }

  // Filter mock products
  let results = [...MOCK_SHOP_PRODUCTS];

  if (filter?.category) {
    results = results.filter((p) => p.category === filter.category);
  }

  if (filter?.species) {
    results = results.filter((p) => p.species.includes(filter.species!));
  }

  if (filter?.inStockOnly) {
    results = results.filter((p) => p.stock > 0);
  }

  if (filter?.minPrice !== undefined) {
    results = results.filter((p) => (p.sale_price ?? p.price) >= filter.minPrice!);
  }

  if (filter?.maxPrice !== undefined) {
    results = results.filter((p) => (p.sale_price ?? p.price) <= filter.maxPrice!);
  }

  if (filter?.query) {
    const q = filter.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name_bn.toLowerCase().includes(q) ||
        p.name_en.toLowerCase().includes(q) ||
        (p.description_bn && p.description_bn.toLowerCase().includes(q)) ||
        (p.description_en && p.description_en.toLowerCase().includes(q))
    );
  }

  return results;
}

/**
 * Fetch a single product by ID.
 */
export async function getProductById(
  client: TypedSupabaseClient | null,
  id: string
): Promise<Product | null> {
  if (client) {
    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as Product;
    } catch {
      // Fallback
    }
  }

  return MOCK_SHOP_PRODUCTS.find((p) => p.id === id) ?? null;
}

/**
 * Creates a new shop order via RPC or fallback mock.
 */
export async function createShopOrder(
  client: TypedSupabaseClient | null,
  input: CreateShopOrderInput
): Promise<{
  success: boolean;
  order_id: string;
  order_code: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
}> {
  if (client) {
    try {
      const { data, error } = await client.rpc('create_shop_order', {
        p_provider_id: input.provider_id,
        p_address_id: input.address_id ?? null,
        p_shipping_address: input.shipping_address,
        p_phone: input.phone,
        p_items: input.items,
        p_payment_method: input.payment_method as any,
        p_delivery_fee: input.delivery_fee,
        p_notes: input.notes ?? null,
      });

      if (error) throw error;
      if (data) return data as any;
    } catch {
      // Fallback below
    }
  }

  // Fallback mock order creation
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
  const randCode = Math.floor(1000 + Math.random() * 9000);
  const mockCode = `PR-ORD-${dateStr}-${randCode}`;
  const mockOrderId = `b${Date.now().toString(16)}-0000-0000-0000-000000000001`;

  let subtotal = 0;
  for (const item of input.items) {
    const prod = MOCK_SHOP_PRODUCTS.find((p) => p.id === item.product_id);
    const unitPrice = prod?.sale_price ?? prod?.price ?? 500;
    subtotal += unitPrice * item.quantity;
  }

  const deliveryFee = input.delivery_fee ?? 60;
  const total = subtotal + deliveryFee;

  return {
    success: true,
    order_id: mockOrderId,
    order_code: mockCode,
    subtotal,
    delivery_fee: deliveryFee,
    total,
    payment_method: input.payment_method,
    payment_status: input.payment_method === 'cash' ? 'pending' : 'pending',
    status: 'placed',
  };
}

/**
 * Cancels a placed/confirmed order.
 */
export async function cancelShopOrder(
  client: TypedSupabaseClient | null,
  orderId: string,
  reason?: string
): Promise<{ success: boolean; order_id: string; status: string }> {
  if (client) {
    try {
      const { data, error } = await client.rpc('cancel_shop_order', {
        p_order_id: orderId,
        p_reason: reason ?? null,
      });

      if (error) throw error;
      if (data) return data as any;
    } catch {
      // Fallback
    }
  }

  return {
    success: true,
    order_id: orderId,
    status: 'cancelled',
  };
}

/**
 * Initiates online payment for a shop order.
 */
export async function initOrderOnlinePayment(
  client: TypedSupabaseClient | null,
  orderId: string,
  method: PaymentMethod = 'card'
): Promise<{
  paymentId?: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
}> {
  if (client) {
    try {
      const { data, error } = await client.rpc('init_order_online_payment', {
        p_order_id: orderId,
        p_method: method as any,
        p_gateway: 'sslcommerz',
      });

      if (error) throw error;
      if (data) return data as any;
    } catch {
      // Fallback
    }
  }

  return {
    paymentId: `pay-${Date.now()}`,
    orderId,
    transactionId: `PRN-ORD-${Date.now()}`,
    amount: 1500,
    currency: 'BDT',
    method,
    status: 'pending',
  };
}

/**
 * Get orders placed by a specific user.
 */
export async function getMyOrders(
  client: TypedSupabaseClient | null,
  userId: string
): Promise<ShopOrder[]> {
  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            order_id,
            product_id,
            quantity,
            unit_price,
            products (
              id,
              name_bn,
              name_en,
              images,
              category
            )
          )
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((o: any) => ({
          ...o,
          items: (o.order_items || []).map((oi: any) => ({
            id: oi.id,
            order_id: oi.order_id,
            product_id: oi.product_id,
            quantity: oi.quantity,
            unit_price: Number(oi.unit_price),
            product: oi.products,
          })),
        })) as ShopOrder[];
      }
    } catch {
      // Fallback
    }
  }

  // Return realistic mock orders for development
  return [
    {
      id: 'b1111111-1111-1111-1111-111111111111',
      code: 'PR-ORD-261125-4821',
      owner_id: userId,
      provider_id: 'c0000000-0000-0000-0000-000000000001',
      address_id: null,
      shipping_address: 'House 42, Road 11, Banani, Dhaka-1213',
      phone: '01711000111',
      status: 'shipped',
      subtotal: 3570,
      delivery_fee: 60,
      total: 3630,
      payment_method: 'cash',
      payment_status: 'pending',
      notes: 'Please call before delivery',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      items: [
        {
          id: 'item-1',
          order_id: 'b1111111-1111-1111-1111-111111111111',
          product_id: MOCK_SHOP_PRODUCTS[1]!.id,
          quantity: 2,
          unit_price: 1720,
          product: MOCK_SHOP_PRODUCTS[1]!,
        },
      ],
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      code: 'PR-ORD-261120-1934',
      owner_id: userId,
      provider_id: 'c0000000-0000-0000-0000-000000000001',
      address_id: null,
      shipping_address: 'Flat 4B, Green Road, Dhanmondi, Dhaka',
      phone: '01711000111',
      status: 'delivered',
      subtotal: 990,
      delivery_fee: 60,
      total: 1050,
      payment_method: 'bkash',
      payment_status: 'paid',
      notes: null,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      items: [
        {
          id: 'item-2',
          order_id: 'b2222222-2222-2222-2222-222222222222',
          product_id: MOCK_SHOP_PRODUCTS[4]!.id,
          quantity: 1,
          unit_price: 990,
          product: MOCK_SHOP_PRODUCTS[4]!,
        },
      ],
    },
  ];
}
