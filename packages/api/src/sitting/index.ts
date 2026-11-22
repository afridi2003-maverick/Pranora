import type { TypedSupabaseClient } from '../client';
import type {
  SitterProfile,
  SittingBooking,
  CreateSittingBookingInput,
  SittingFilter,
  SittingServiceType,
  SittingPaymentMethod,
  SittingBookingStatus,
} from '@pranora/validation';

export type {
  SitterProfile,
  SittingBooking,
  CreateSittingBookingInput,
  SittingFilter,
  SittingServiceType,
  SittingPaymentMethod,
  SittingBookingStatus,
};

// ── In-Memory Mock Sitters for Client Testing / Offline Mode ────────────────

export const MOCK_SITTERS: SitterProfile[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    user_id: 'mock-sitter-user-1',
    full_name_bn: 'তানভীর আহমেদ',
    full_name_en: 'Tanvir Ahmed',
    bio_bn:
      'অভিজ্ঞ পেট লাভার ও প্রফেশনাল ডগ ট্রেইনার। ৩ বছর ধরে পোষা প্রাণীর যত্ন ও হাঁটার সেবা দিয়ে আসছি। পোষা প্রাণীর সাথে বন্ধুত্বপূর্ণ আচরণ ও সুরক্ষাই আমার মূল লক্ষ্য।',
    bio_en:
      'Certified animal care enthusiast with 3+ years experience. Specializes in active dog walking and gentle puppy care in central Dhaka.',
    hourly_rate: 350,
    daily_rate: 2000,
    experience_years: 3,
    service_types: ['sitting_hourly', 'dog_walking', 'day_sitting'],
    accepted_species: ['dog', 'cat'],
    areas: ['ধানমন্ডি (Dhanmondi)', 'লালমাটিয়া (Lalmatia)', 'মোহাম্মদপুর (Mohammadpur)'],
    district: 'Dhaka',
    rating: 4.95,
    review_count: 28,
    phone: '+880 1711-234567',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    user_id: 'mock-sitter-user-2',
    full_name_bn: 'নুসরাত জাহান',
    full_name_en: 'Nusrat Jahan',
    bio_bn:
      'ভেটেরিনারি সায়েন্সের শিক্ষার্থী। বিড়াল ও কুকুরদের ওষুধ খাওয়ানো, খাবার পরিবেশন ও নিয়মিত পরিচর্যায় বিশেষ পারদর্শী। বাসায় এসে নিশ্চিন্তে যত্ন নেব।',
    bio_en:
      'Veterinary science student offering loving cat sitting, medication administration, and daytime companionship.',
    hourly_rate: 300,
    daily_rate: 1800,
    experience_years: 2,
    service_types: ['sitting_hourly', 'day_sitting', 'overnight'],
    accepted_species: ['cat', 'dog', 'bird'],
    areas: ['গুলশান (Gulshan)', 'বনানী (Banani)', 'বারিধারা (Baridhara)'],
    district: 'Dhaka',
    rating: 4.9,
    review_count: 34,
    phone: '+880 1819-876543',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    user_id: 'mock-sitter-user-3',
    full_name_bn: 'রাকিব হাসান',
    full_name_en: 'Rakib Hasan',
    bio_bn:
      'কুকুরদের সকাল-বিকাল এক্সারসাইজ ও আউটডোর ওয়াকিংয়ে পারদর্শী। বড় এবং চঞ্চল জাতের কুকুরদের নিয়ন্ত্রণে দক্ষ। লাইভ জিপিএস লোকেশন শেয়ার সুবিধা রয়েছে।',
    bio_en:
      'Energetic dog walker specialized in high-energy breeds and routine outdoor exercise with live tracking.',
    hourly_rate: 280,
    daily_rate: 1600,
    experience_years: 4,
    service_types: ['dog_walking', 'sitting_hourly'],
    accepted_species: ['dog'],
    areas: ['উত্তরা (Uttara)', 'বিমানবন্দর (Airport)', 'খিলক্ষেত (Khilkhet)'],
    district: 'Dhaka',
    rating: 4.88,
    review_count: 19,
    phone: '+880 1912-345678',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'e4444444-4444-4444-4444-444444444444',
    user_id: 'mock-sitter-user-4',
    full_name_bn: 'সাদিয়া ইসলাম শম্পা',
    full_name_en: 'Sadia Islam Shampa',
    bio_bn:
      'বিড়ালদের প্রতি বিশেষ ভালোবাসা থেকেই এই পেশায়। মালিকরা ছুটিতে থাকলে সম্পূর্ণ নিরাপদ পরিবেশে ডে-সিটিং ও খাবার ব্যবস্থাপনা করে থাকি।',
    bio_en:
      'Feline-first dedicated sitter providing stress-free in-home visits and vacation pet sitting.',
    hourly_rate: 320,
    daily_rate: 1900,
    experience_years: 3,
    service_types: ['sitting_hourly', 'day_sitting', 'overnight'],
    accepted_species: ['cat', 'rabbit'],
    areas: ['মিরপুর (Mirpur)', 'কল্যাণপুর (Kalyanpur)', 'শ্যামলী (Shyamoli)'],
    district: 'Dhaka',
    rating: 4.92,
    review_count: 22,
    phone: '+880 1678-901234',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

let inMemoryBookings: SittingBooking[] = [
  {
    id: 'booking-sit-1',
    sitter_id: 'e1111111-1111-1111-1111-111111111111',
    owner_id: 'mock-user-1',
    pet_id: 'mock-pet-cat-1',
    service_type: 'sitting_hourly',
    start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0]!,
    start_time: '11:00 AM',
    duration_hours: 2,
    total_price: 700,
    payment_method: 'cash',
    payment_status: 'pending',
    address: 'ধানমন্ডি ২৭, ঢাকা',
    notes: 'খাবার সময় দুপুর ১২:৩০ মিনিটে ক্যাট ফুড দিতে হবে।',
    status: 'confirmed',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    sitter: MOCK_SITTERS[0],
  },
];

// ── API Functions ────────────────────────────────────────────────────────────

/**
 * List verified pet sitters and dog walkers with optional filters
 */
export async function listSitters(
  client?: TypedSupabaseClient | null,
  filters?: SittingFilter
): Promise<SitterProfile[]> {
  try {
    if (client) {
      let query = (client as any).from('sitters').select('*').eq('is_verified', true);

      if (filters?.area) {
        query = query.contains('areas', [filters.area]);
      }
      if (filters?.species) {
        query = query.contains('accepted_species', [filters.species]);
      }
      if (filters?.service_type) {
        query = query.contains('service_types', [filters.service_type]);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as SitterProfile[];
      }
    }
  } catch (err) {
    // Graceful fallback to mock sitters
  }

  // Filter in-memory fallback
  let result = [...MOCK_SITTERS];

  if (filters?.service_type) {
    result = result.filter((s) => s.service_types.includes(filters.service_type as SittingServiceType));
  }
  if (filters?.species) {
    result = result.filter((s) => s.accepted_species.includes(filters.species!));
  }
  if (filters?.area) {
    result = result.filter((s) => s.areas.some((a) => a.includes(filters.area!)));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.full_name_bn.toLowerCase().includes(q) ||
        s.full_name_en.toLowerCase().includes(q) ||
        s.bio_bn.toLowerCase().includes(q) ||
        s.bio_en.toLowerCase().includes(q) ||
        s.areas.some((a) => a.toLowerCase().includes(q))
    );
  }

  return result;
}

/**
 * Retrieve a single sitter profile by ID
 */
export async function getSitterById(
  client?: TypedSupabaseClient | null,
  sitterId?: string
): Promise<SitterProfile | null> {
  if (!sitterId) return null;

  try {
    if (client) {
      const { data, error } = await (client as any).from('sitters').select('*').eq('id', sitterId).single();
      if (!error && data) {
        return data as SitterProfile;
      }
    }
  } catch (err) {
    // fallback
  }

  return MOCK_SITTERS.find((s) => s.id === sitterId) ?? null;
}

/**
 * Create a new pet sitting / dog walking booking request
 */
export async function createSittingBooking(
  client: TypedSupabaseClient | null,
  input: CreateSittingBookingInput,
  userId: string = 'mock-user-1'
): Promise<{ data: SittingBooking | null; error?: string }> {
  const sitter = MOCK_SITTERS.find((s) => s.id === input.sitter_id);
  const hourlyRate = sitter?.hourly_rate ?? 300;
  const totalPrice = input.duration_hours * hourlyRate;

  try {
    if (client) {
      const { data, error } = await (client as any)
        .from('sitting_bookings')
        .insert({
          sitter_id: input.sitter_id,
          owner_id: userId,
          pet_id: input.pet_id ?? null,
          service_type: input.service_type,
          start_date: input.start_date,
          start_time: input.start_time,
          duration_hours: input.duration_hours,
          total_price: totalPrice,
          payment_method: input.payment_method,
          payment_status: 'pending',
          address: input.address,
          notes: input.notes ?? null,
          status: 'pending',
        })
        .select('*')
        .single();

      if (!error && data) {
        const booking: SittingBooking = {
          ...(data as any),
          sitter: sitter ?? undefined,
        };
        inMemoryBookings.unshift(booking);
        return { data: booking };
      }
    }
  } catch (err: any) {
    // fallback
  }

  // In-memory fallback
  const newBooking: SittingBooking = {
    id: `booking-sit-${Date.now()}`,
    sitter_id: input.sitter_id,
    owner_id: userId,
    pet_id: input.pet_id ?? null,
    service_type: input.service_type,
    start_date: input.start_date,
    start_time: input.start_time,
    duration_hours: input.duration_hours,
    total_price: totalPrice,
    payment_method: input.payment_method,
    payment_status: 'pending',
    address: input.address,
    notes: input.notes ?? null,
    status: 'pending',
    created_at: new Date().toISOString(),
    sitter: sitter ?? undefined,
  };

  inMemoryBookings.unshift(newBooking);
  return { data: newBooking };
}

/**
 * List all sitting bookings belonging to current owner
 */
export async function listMySittingBookings(
  client?: TypedSupabaseClient | null,
  userId: string = 'mock-user-1'
): Promise<SittingBooking[]> {
  try {
    if (client) {
      const { data, error } = await (client as any)
        .from('sitting_bookings')
        .select('*, sitter:sitters(*)')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as SittingBooking[];
      }
    }
  } catch (err) {
    // fallback
  }

  return inMemoryBookings.filter((b) => b.owner_id === userId);
}

/**
 * Cancel a sitting booking
 */
export async function cancelSittingBooking(
  client: TypedSupabaseClient | null,
  bookingId: string,
  userId: string = 'mock-user-1'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (client) {
      const { error } = await (client as any)
        .from('sitting_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('owner_id', userId);

      if (!error) {
        const idx = inMemoryBookings.findIndex((b) => b.id === bookingId);
        if (idx !== -1) {
          inMemoryBookings[idx]!.status = 'cancelled';
        }
        return { success: true };
      }
    }
  } catch (err: any) {
    // fallback
  }

  const booking = inMemoryBookings.find((b) => b.id === bookingId);
  if (booking) {
    booking.status = 'cancelled';
    return { success: true };
  }

  return { success: false, error: 'Booking not found' };
}
