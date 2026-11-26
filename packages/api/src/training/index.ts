import type { TypedSupabaseClient } from '../client';
import type {
  TrainerProfile,
  TrainingPackage,
  TrainingBooking,
  CreateTrainingBookingInput,
  TrainingFilter,
  TrainingPackageType,
  TrainingBookingMode,
  TrainingFormat,
  TrainingPaymentMethod,
  TrainingBookingStatus,
} from '@pranora/validation';

export type {
  TrainerProfile,
  TrainingPackage,
  TrainingBooking,
  CreateTrainingBookingInput,
  TrainingFilter,
  TrainingPackageType,
  TrainingBookingMode,
  TrainingFormat,
  TrainingPaymentMethod,
  TrainingBookingStatus,
};

export const TRAINING_PACKAGES: TrainingPackage[] = [
  {
    id: 'pkg-obedience-001',
    slug: 'obedience',
    title_bn: 'বেসিক ওবিডিয়েন্স ট্রেনিং',
    title_en: 'Basic Obedience Training',
    description_bn:
      'বসা (Sit), থাকা (Stay), আসা (Come) এবং লিশ ট্রেনিংসহ দৈনন্দিন শৃঙ্খলাবোধ তৈরি।',
    description_en:
      'Core commands (Sit, Stay, Come, Heel) and leash manners using gentle positive reinforcement.',
    sessions_count: 6,
    duration_minutes: 60,
    base_price: 4500,
    target_species: ['dog'],
  },
  {
    id: 'pkg-puppy-002',
    slug: 'puppy_socialization',
    title_bn: 'পাপি ও কিটেন সোশ্যালাইজেশন',
    title_en: 'Puppy & Kitten Socialization',
    description_bn:
      'পটি ট্রেনিং, কামড়ানো কমানো এবং নতুন পরিবেশ ও মানুষের সাথে অভ্যস্ত করা।',
    description_en:
      'Potty training, bite inhibition, crate comfort, and safe socialization for young pets.',
    sessions_count: 5,
    duration_minutes: 45,
    base_price: 3800,
    target_species: ['dog', 'cat'],
  },
  {
    id: 'pkg-behavior-003',
    slug: 'behavior_correction',
    title_bn: 'বিহেভিয়ার কারেকশন',
    title_en: 'Behavior Modification',
    description_bn:
      'অতিরিক্ত ঘেউ ঘেউ, অ্যাংজাইটি এবং আক্রমণাত্মক আচরণ সংশোধনের বিশেষ সেশন।',
    description_en:
      'Targeted behavior work for separation anxiety, excessive barking, leash reactivity, and fear.',
    sessions_count: 8,
    duration_minutes: 60,
    base_price: 6200,
    target_species: ['dog', 'cat'],
  },
  {
    id: 'pkg-agility-004',
    slug: 'agility',
    title_bn: 'অ্যাজিলিটি ও অ্যাডভান্সড ট্রেনিং',
    title_en: 'Agility & Advanced Skills',
    description_bn:
      'অফ-লিশ কমান্ড, অবস্ট্যাকল কোর্স এবং মানসিক ও শারীরিক সক্ষমতা বৃদ্ধি।',
    description_en:
      'Off-leash reliability, obstacle courses, scent games, and advanced mental stimulation.',
    sessions_count: 8,
    duration_minutes: 60,
    base_price: 6800,
    target_species: ['dog'],
  },
];

export const MOCK_TRAINERS: TrainerProfile[] = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    user_id: 'mock-trainer-user-1',
    full_name_bn: 'ক্যাপ্টেন আরিফুর রহমান',
    full_name_en: 'Arifur Rahman',
    bio_bn:
      '৬ বছরের অভিজ্ঞতাসম্পন্ন সার্টিফায়েড কে-৯ ট্রেইনার। পজিটিভ রিইনফোর্সমেন্ট পদ্ধতিতে কুকুরের ওবিডিয়েন্স ও বিহেভিয়ার কারেকশনে বিশেষ দক্ষ।',
    bio_en:
      'Certified K9 trainer with 6 years of experience specializing in positive-reinforcement obedience and leash reactivity.',
    certifications: ['K9 Certified Trainer', 'Fear-Free Pets'],
    specialties: ['obedience', 'behavior_correction', 'agility'],
    session_rate: 900,
    package_rate: 4800,
    experience_years: 6,
    accepted_species: ['dog'],
    areas: ['ধানমন্ডি (Dhanmondi)', 'মোহাম্মদপুর (Mohammadpur)', 'লালমাটিয়া (Lalmatia)'],
    district: 'Dhaka',
    rating: 4.96,
    review_count: 42,
    phone: '+880 1711-556677',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    user_id: 'mock-trainer-user-2',
    full_name_bn: 'ফারহানা তাসনিম',
    full_name_en: 'Farhana Tasnim',
    bio_bn:
      'বিড়াল ও ছোট জাতের কুকুরের পটি ট্রেনিং এবং সোশ্যালাইজেশন বিশেষজ্ঞ। বাসায় গিয়ে অত্যন্ত ধৈর্য ও যত্নের সাথে প্রশিক্ষণ দেন।',
    bio_en:
      'Feline & small-breed specialist focused on litter habits, puppy socialization, and stress-free home adaptation.',
    certifications: ['CCPDT-KA', 'Cat Behavior Specialist'],
    specialties: ['puppy_socialization', 'behavior_correction'],
    session_rate: 800,
    package_rate: 4200,
    experience_years: 4,
    accepted_species: ['cat', 'dog'],
    areas: ['গুলশান (Gulshan)', 'বনানী (Banani)', 'বারিধারা (Baridhara)'],
    district: 'Dhaka',
    rating: 4.92,
    review_count: 31,
    phone: '+880 1819-334455',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    user_id: 'mock-trainer-user-3',
    full_name_bn: 'মেহেদী হাসান সজীব',
    full_name_en: 'Mehedi Hasan Sojib',
    bio_bn:
      'বড় জাতের কুকুরের অ্যাজিলিটি, গার্ড ট্রেনিং এবং অফ-লিশ কমান্ডে ৫ বছরের বাস্তব অভিজ্ঞতা।',
    bio_en:
      '5+ years training working breeds in agility, recall reliability, and structured outdoor obedience.',
    certifications: ['BD Kennel Club Mentor', 'Agility Coach'],
    specialties: ['obedience', 'agility'],
    session_rate: 850,
    package_rate: 4600,
    experience_years: 5,
    accepted_species: ['dog'],
    areas: ['উত্তরা (Uttara)', 'মিরপুর (Mirpur)', 'বসুন্ধরা (Bashundhara)'],
    district: 'Dhaka',
    rating: 4.89,
    review_count: 27,
    phone: '+880 1912-778899',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'f4444444-4444-4444-4444-444444444444',
    user_id: 'mock-trainer-user-4',
    full_name_bn: 'সাব্বির চৌধুরী',
    full_name_en: 'Sabbir Chowdhury',
    bio_bn:
      'চট্টগ্রামে পজিটিভ রিইনফোর্সমেন্ট ও পাপি ট্রেনিংয়ে পরিচিত মুখ। মালিকদেরও সঠিক হ্যান্ডলিং শিখিয়ে থাকেন।',
    bio_en:
      'Chattogram-based positive trainer helping first-time pet parents build confident, well-mannered companions.',
    certifications: ['Positive Reinforcement Coach'],
    specialties: ['obedience', 'puppy_socialization'],
    session_rate: 750,
    package_rate: 4000,
    experience_years: 3,
    accepted_species: ['dog', 'cat'],
    areas: ['নাসিরাবাদ (Nasirabad)', 'জিইসি (GEC)', 'খুলশী (Khulshi)'],
    district: 'Chattogram',
    rating: 4.9,
    review_count: 19,
    phone: '+880 1678-112233',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

let inMemoryTrainingBookings: TrainingBooking[] = [
  {
    id: 'booking-trn-1',
    trainer_id: 'f1111111-1111-1111-1111-111111111111',
    owner_id: 'mock-user-1',
    pet_id: 'mock-pet-dog-1',
    package_type: 'obedience',
    booking_mode: 'package',
    training_format: 'home_visit',
    start_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]!,
    preferred_time: '04:00 PM',
    sessions_total: 6,
    sessions_completed: 1,
    total_price: 4800,
    payment_method: 'bkash',
    payment_status: 'paid',
    address: 'House 12, Road 4, Dhanmondi, Dhaka',
    pet_behavior_notes: 'Pulls on leash during evening walks',
    status: 'confirmed',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    trainer: MOCK_TRAINERS[0],
  },
];

export async function listTrainingPackages(
  client: TypedSupabaseClient | null
): Promise<TrainingPackage[]> {
  if (client) {
    try {
      const { data, error } = await (client as any)
        .from('training_packages')
        .select('*')
        .order('base_price', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as TrainingPackage[];
      }
    } catch {
      // Fallback to static packages
    }
  }
  return TRAINING_PACKAGES;
}

export async function listTrainers(
  client: TypedSupabaseClient | null,
  filters?: TrainingFilter
): Promise<TrainerProfile[]> {
  let results: TrainerProfile[] = [...MOCK_TRAINERS];

  if (client) {
    try {
      const { data, error } = await (client as any)
        .from('trainers')
        .select('*')
        .eq('is_verified', true)
        .order('rating', { ascending: false });

      if (!error && data && data.length > 0) {
        results = data as TrainerProfile[];
      }
    } catch {
      // Fallback to mock trainers
    }
  }

  if (filters?.specialty) {
    results = results.filter((t) => t.specialties.includes(filters.specialty!));
  }
  if (filters?.species) {
    results = results.filter((t) => t.accepted_species.includes(filters.species!));
  }
  if (filters?.area && filters.area !== 'all') {
    const q = filters.area.toLowerCase();
    results = results.filter(
      (t) =>
        t.areas.some((a) => a.toLowerCase().includes(q)) ||
        t.district.toLowerCase().includes(q)
    );
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (t) =>
        t.full_name_en.toLowerCase().includes(q) ||
        t.full_name_bn.toLowerCase().includes(q) ||
        t.bio_en.toLowerCase().includes(q) ||
        t.areas.some((a) => a.toLowerCase().includes(q))
    );
  }

  return results;
}

export async function listMyTrainingBookings(
  client: TypedSupabaseClient | null
): Promise<TrainingBooking[]> {
  if (client) {
    try {
      const { data, error } = await (client as any)
        .from('training_bookings')
        .select('*, trainer:trainers(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as TrainingBooking[];
      }
    } catch {
      // Fallback
    }
  }
  return [...inMemoryTrainingBookings];
}

export async function createTrainingBooking(
  client: TypedSupabaseClient | null,
  input: CreateTrainingBookingInput
): Promise<{ booking: TrainingBooking | null; error: string | null }> {
  const trainer = MOCK_TRAINERS.find((t) => t.id === input.trainer_id) ?? MOCK_TRAINERS[0]!;
  const pkg = TRAINING_PACKAGES.find((p) => p.slug === input.package_type);

  const sessionsTotal = input.booking_mode === 'single_session' ? 1 : (pkg?.sessions_count ?? 6);
  const totalPrice =
    input.booking_mode === 'single_session'
      ? trainer.session_rate
      : trainer.package_rate;

  const isOnlinePayment = input.payment_method !== 'cash';

  if (client) {
    try {
      const { data: userData } = await (client as any).auth.getUser();
      const userId = userData?.user?.id;
      if (userId) {
        const { data, error } = await (client as any)
          .from('training_bookings')
          .insert({
            trainer_id: input.trainer_id,
            owner_id: userId,
            pet_id: input.pet_id ?? null,
            package_type: input.package_type,
            booking_mode: input.booking_mode,
            training_format: input.training_format,
            start_date: input.start_date,
            preferred_time: input.preferred_time,
            sessions_total: sessionsTotal,
            sessions_completed: 0,
            total_price: totalPrice,
            payment_method: input.payment_method,
            payment_status: isOnlinePayment ? 'paid' : 'pending',
            address: input.address,
            pet_behavior_notes: input.pet_behavior_notes ?? null,
            status: 'pending',
          })
          .select('*, trainer:trainers(*)')
          .single();

        if (!error && data) {
          return { booking: data as TrainingBooking, error: null };
        }
      }
    } catch {
      // Fallback to in-memory
    }
  }

  const newBooking: TrainingBooking = {
    id: `booking-trn-${Date.now()}`,
    trainer_id: trainer.id,
    owner_id: 'mock-user-1',
    pet_id: input.pet_id ?? null,
    package_type: input.package_type,
    booking_mode: input.booking_mode,
    training_format: input.training_format,
    start_date: input.start_date,
    preferred_time: input.preferred_time,
    sessions_total: sessionsTotal,
    sessions_completed: 0,
    total_price: totalPrice,
    payment_method: input.payment_method,
    payment_status: isOnlinePayment ? 'paid' : 'pending',
    address: input.address,
    pet_behavior_notes: input.pet_behavior_notes ?? null,
    status: 'pending',
    created_at: new Date().toISOString(),
    trainer,
  };

  inMemoryTrainingBookings = [newBooking, ...inMemoryTrainingBookings];
  return { booking: newBooking, error: null };
}

export async function cancelTrainingBooking(
  client: TypedSupabaseClient | null,
  bookingId: string
): Promise<{ success: boolean; error: string | null }> {
  if (client) {
    try {
      const { error } = await (client as any)
        .from('training_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      if (!error) {
        return { success: true, error: null };
      }
    } catch {
      // Fallback
    }
  }

  inMemoryTrainingBookings = inMemoryTrainingBookings.map((b) =>
    b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
  );
  return { success: true, error: null };
}
