import type {
  AdoptionListingRow,
  AdoptionApplicationWithListing,
  AdoptionHandoverRow,
  AdoptionFollowupRow,
} from '@pranora/api';

export const MOCK_ADOPTION_LISTINGS: AdoptionListingRow[] = [
  {
    id: 'adp-001',
    pet_id: 'pet-adp-1',
    posted_by: 'user-shelter-1',
    shelter_id: 'shelter-01',
    species: 'dog',
    age_months: 5,
    gender: 'female',
    title_bn: 'টফি - মিশুক ও চঞ্চল দেশি ছানা',
    title_en: 'Toffee - Playful & Gentle Deshi Pup',
    description_bn:
      'টফিকে ধানমন্ডি লেক এলাকা থেকে উদ্ধার করা হয়েছিল। সে সম্পূর্ণ সুস্থ, চঞ্চল ও শিশুদের সাথে খুব ভালো মেশে। তার প্রথম ডোজ টিকা ও কৃমিনাশক দেওয়া হয়েছে। ভালো ও দায়িত্বশীল পরিবারের খোঁজে আছি।',
    description_en:
      'Toffee was rescued near Dhanmondi lake. She is fully recovered, loving, and loves playing with kids. First dose vaccinated and dewormed. Looking for a loving indoor home.',
    photos: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
    ],
    is_vaccinated: true,
    is_neutered: false,
    district_id: 1, // Dhaka
    upazila_id: 101, // Dhanmondi
    status: 'available',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'adp-002',
    pet_id: 'pet-adp-2',
    posted_by: 'user-shelter-2',
    shelter_id: 'shelter-02',
    species: 'cat',
    age_months: 14,
    gender: 'male',
    title_bn: 'সিম্বা - শান্ত ও আদুরে সোনালি বিড়াল',
    title_en: 'Simba - Affectionate Orange Tabby',
    description_bn:
      'সিম্বা একটি খুবই শান্ত প্রকৃতির বিড়াল। সে লিটার বক্স ব্যবহারে অভ্যস্ত এবং ড্রাই ফুড পছন্দ করে। সম্পূর্ণ ভ্যাকসিন ও নিউটারিং সম্পন্ন করা আছে।',
    description_en:
      'Simba is a calm, indoor-friendly companion. Fully litter trained and eats dry kibble. Fully vaccinated and neutered.',
    photos: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800',
    ],
    is_vaccinated: true,
    is_neutered: true,
    district_id: 1, // Dhaka
    upazila_id: 102, // Uttara
    status: 'available',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'adp-003',
    pet_id: 'pet-adp-3',
    posted_by: 'user-rescuer-3',
    shelter_id: null,
    species: 'dog',
    age_months: 28,
    gender: 'male',
    title_bn: 'রকি - বিশ্বস্ত ও বুদ্ধিমান প্রহরী',
    title_en: 'Rocky - Loyal & Alert Companion',
    description_bn:
      'চট্টগ্রাম জিইসি মোড় থেকে পায়ে আঘাত পাওয়া অবস্থায় উদ্ধার হয়েছিল রকি। এখন সম্পূর্ণ সুস্থ ও শক্তিশালী। বাড়ি পাহারা দেওয়া ও মানুষের অনুগত থাকা তার সহজাত গুণ।',
    description_en:
      'Rescued from Chattogram GEC area with a leg injury. Now 100% healed and active. Very protective and affectionate companion.',
    photos: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    ],
    is_vaccinated: true,
    is_neutered: true,
    district_id: 2, // Chattogram
    upazila_id: null,
    status: 'available',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'adp-004',
    pet_id: 'pet-adp-4',
    posted_by: 'user-shelter-1',
    shelter_id: 'shelter-01',
    species: 'cat',
    age_months: 3,
    gender: 'female',
    title_bn: 'লিলি - কিউট সাদা ছানা',
    title_en: 'Lily - Sweet White Kitten',
    description_bn:
      'লিলি ৩ মাস বয়সী মিষ্টি একটি বিড়ালছানা। সে কোলে বসতে খুব পছন্দ করে। প্রথম ডোজ ভ্যাকসিন সম্পন্ন। কেবল সুরক্ষিত বাসার জন্য বিবেচনা করা হবে।',
    description_en:
      'Lily is a 3-month-old precious kitten. Loves cuddles. First vaccination completed. Indoor homes with balcony netting only.',
    photos: [
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800',
    ],
    is_vaccinated: true,
    is_neutered: false,
    district_id: 1, // Dhaka
    upazila_id: 103, // Mirpur
    status: 'reserved',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'adp-005',
    pet_id: 'pet-adp-5',
    posted_by: 'user-rescuer-4',
    shelter_id: null,
    species: 'rabbit',
    age_months: 8,
    gender: 'male',
    title_bn: 'বান্টি - সাদা খরগোশ',
    title_en: 'Bunty - Domestic White Bunny',
    description_bn:
      'বান্টি সুস্থ ও পরিষ্কার খরগোশ। তাজা ঘাস ও শাকসবজি খায়। যত্নশীল কোনো পরিবারের কাছে দত্তক দেওয়া হবে।',
    description_en:
      'Healthy domestic white bunny. Eats fresh greens and hay. Looking for an experienced, patient rabbit adopter.',
    photos: [
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800',
    ],
    is_vaccinated: false,
    is_neutered: false,
    district_id: 6, // Sylhet
    upazila_id: null,
    status: 'available',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'adp-006',
    pet_id: 'pet-adp-6',
    posted_by: 'user-shelter-3',
    shelter_id: 'shelter-03',
    species: 'dog',
    age_months: 36,
    gender: 'female',
    title_bn: 'মায়া - শান্ত দেশি মা কুকুর',
    title_en: 'Maya - Gentle Deshi Dog',
    description_bn:
      'মায়া খুব বিশ্বস্ত ও স্নেহপরায়ণ। তার সবগুলো বাচ্চাকে আগেই দত্তক দেওয়া হয়েছে, এখন মায়ার একটি স্থায়ী আশ্রয় প্রয়োজন। সম্পূর্ণ ভ্যাকসিন ও নিউটারিং সম্পন্ন।',
    description_en:
      'Maya is extremely calm and sweet. All her puppies were adopted earlier, and now she deserves her own forever home. Fully vaccinated and spayed.',
    photos: [
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800',
    ],
    is_vaccinated: true,
    is_neutered: true,
    district_id: 3, // Rajshahi
    upazila_id: null,
    status: 'available',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
  },
];

export const DISTRICT_MAP: Record<number, { bn: string; en: string }> = {
  1: { bn: 'ঢাকা', en: 'Dhaka' },
  2: { bn: 'চট্টগ্রাম', en: 'Chattogram' },
  3: { bn: 'রাজশাহী', en: 'Rajshahi' },
  4: { bn: 'খুলনা', en: 'Khulna' },
  5: { bn: 'বরিশাল', en: 'Barishal' },
  6: { bn: 'সিলেট', en: 'Sylhet' },
  7: { bn: 'রংপুর', en: 'Rangpur' },
  8: { bn: 'ময়মনসিংহ', en: 'Mymensingh' },
};

export interface EligiblePetForAdoption {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  gender: 'male' | 'female' | 'unknown';
  date_of_birth: string | null;
  age_months: number;
  breed_name?: string | null;
  photo_url: string | null;
  is_vaccinated: boolean;
  is_neutered: boolean;
  shelter_id?: string | null;
  has_active_listing: boolean;
}

export const MOCK_ELIGIBLE_PETS: EligiblePetForAdoption[] = [
  {
    id: 'pet-user-101',
    name: 'লাকি (Lucky)',
    species: 'dog',
    gender: 'male',
    date_of_birth: '2024-03-15',
    age_months: 8,
    breed_name: 'দেশি কুকুর / Deshi',
    photo_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800',
    is_vaccinated: true,
    is_neutered: false,
    has_active_listing: false,
  },
  {
    id: 'pet-user-102',
    name: 'মিনি (Mini)',
    species: 'cat',
    gender: 'female',
    date_of_birth: '2023-11-01',
    age_months: 12,
    breed_name: 'দেশি বিড়াল / Domestic Short Hair',
    photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
    is_vaccinated: true,
    is_neutered: true,
    has_active_listing: false,
  },
  {
    id: 'pet-user-103',
    name: 'ব্রাউনি (Brownie)',
    species: 'rabbit',
    gender: 'male',
    date_of_birth: '2024-06-10',
    age_months: 5,
    breed_name: 'ডাচ র্যাবিট / Dutch Rabbit',
    photo_url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800',
    is_vaccinated: false,
    is_neutered: false,
    has_active_listing: false,
  },
];

export const MOCK_MY_APPLICATIONS: AdoptionApplicationWithListing[] = [
  {
    application: {
      id: 'app-001',
      listing_id: 'adp-001',
      applicant_id: 'user-current',
      home_type: 'own_flat',
      has_other_pets: true,
      experience: 'আগে দেশি বিড়াল ও কুকুর পোষার ৪ বছরের অভিজ্ঞতা আছে।',
      reason: 'টফির মতো মিষ্টি ও চঞ্চল ছানাকে আমাদের পরিবারের অংশ করতে চাই। বাসায় পর্যাপ্ত খোলামেলা জায়গা আছে।',
      status: 'under_review',
      reviewed_by: 'user-shelter-1',
      reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      decision_note: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    listing: MOCK_ADOPTION_LISTINGS[0]!,
  },
  {
    application: {
      id: 'app-002',
      listing_id: 'adp-002',
      applicant_id: 'user-current',
      home_type: 'rented_flat',
      has_other_pets: false,
      experience: null,
      reason: 'সিম্বাকে আমাদের বাসায় ভালো রাখতে পারব। বাড়িওয়ালার পোষা প্রাণী রাখার লিখিত অনুমতি আছে।',
      status: 'approved',
      reviewed_by: 'user-shelter-2',
      reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      decision_note: 'আবেদনকারীর তথ্য ও প্রস্তুতি সন্তোষজনক। দুই-পক্ষীয় হস্তান্তরের তারিখ নির্ধারণ করা যেতে পারে।',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
    listing: MOCK_ADOPTION_LISTINGS[1]!,
  },
  {
    application: {
      id: 'app-003',
      listing_id: 'adp-003',
      applicant_id: 'user-current',
      home_type: 'own_flat',
      has_other_pets: true,
      experience: 'পূর্বে বিড়াল ছিল।',
      reason: 'বাসার পরিবেশ সুন্দর।',
      status: 'rejected',
      reviewed_by: 'user-rescuer-3',
      reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      decision_note: 'অন্য একজন অভিজ্ঞ অভিভাবকের আবেদন গৃহীত হওয়ায় এই আবেদনটি বাতিল করা হয়েছে। অন্য প্রাণীর জন্য আবেদন করার অনুরোধ রইল।',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    listing: MOCK_ADOPTION_LISTINGS[2]!,
  },
];

export interface HandoverFullDetails {
  handover: AdoptionHandoverRow;
  listing: AdoptionListingRow;
  petName: string;
  giverName: string;
  adopterName: string;
}

export const MOCK_HANDOVERS: Record<string, HandoverFullDetails> = {
  'hnd-001': {
    handover: {
      id: 'hnd-001',
      listing_id: 'adp-002',
      application_id: 'app-002',
      pet_id: 'pet-adp-2',
      from_user_id: 'user-shelter-2',
      to_user_id: 'user-current',
      giver_confirmed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      adopter_confirmed_at: null,
      completed_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
    listing: MOCK_ADOPTION_LISTINGS[1]!,
    petName: 'সিম্বা (Simba)',
    giverName: 'উত্তরার আশ্রয়কেন্দ্র (Uttara Shelter)',
    adopterName: 'জিহাদ রহমান (Zihad Rahman)',
  },
  'hnd-002': {
    handover: {
      id: 'hnd-002',
      listing_id: 'adp-006',
      application_id: 'app-006',
      pet_id: 'pet-adp-6',
      from_user_id: 'user-shelter-3',
      to_user_id: 'user-current',
      giver_confirmed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      adopter_confirmed_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
    listing: MOCK_ADOPTION_LISTINGS[3] || MOCK_ADOPTION_LISTINGS[0]!,
    petName: 'মায়া (Maya)',
    giverName: 'রাজশাহী প্রাণিসেবক ফাউন্ডেশন',
    adopterName: 'জিহাদ রহমান (Zihad Rahman)',
  },
};

export function findHandoverByIdOrListing(idOrListingId: string): HandoverFullDetails | undefined {
  if (MOCK_HANDOVERS[idOrListingId]) {
    return MOCK_HANDOVERS[idOrListingId];
  }
  return Object.values(MOCK_HANDOVERS).find(
    (h) =>
      h.handover.id === idOrListingId ||
      h.handover.listing_id === idOrListingId ||
      h.handover.application_id === idOrListingId
  );
}

export interface FollowupWithHandover {
  followup: AdoptionFollowupRow;
  handover: AdoptionHandoverRow;
  listing: AdoptionListingRow;
  petName: string;
}

export const MOCK_ADOPTION_FOLLOWUPS: Record<string, FollowupWithHandover> = {
  'flw-001': {
    followup: {
      id: 'flw-001',
      handover_id: 'hnd-002',
      due_on: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0]!,
      sent_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      answered_at: null,
      wellbeing: null,
      note: null,
      photos: [],
    },
    handover: MOCK_HANDOVERS['hnd-002']!.handover,
    listing: MOCK_HANDOVERS['hnd-002']!.listing,
    petName: 'মায়া (Maya)',
  },
  'flw-002': {
    followup: {
      id: 'flw-002',
      handover_id: 'hnd-002',
      due_on: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString().split('T')[0]!,
      sent_at: null,
      answered_at: null,
      wellbeing: null,
      note: null,
      photos: [],
    },
    handover: MOCK_HANDOVERS['hnd-002']!.handover,
    listing: MOCK_HANDOVERS['hnd-002']!.listing,
    petName: 'মায়া (Maya)',
  },
  'flw-003': {
    followup: {
      id: 'flw-003',
      handover_id: 'hnd-002',
      due_on: new Date(Date.now() + 1000 * 60 * 60 * 24 * 150).toISOString().split('T')[0]!,
      sent_at: null,
      answered_at: null,
      wellbeing: null,
      note: null,
      photos: [],
    },
    handover: MOCK_HANDOVERS['hnd-002']!.handover,
    listing: MOCK_HANDOVERS['hnd-002']!.listing,
    petName: 'মায়া (Maya)',
  },
};

export function findFollowupById(followupId: string): FollowupWithHandover | undefined {
  return MOCK_ADOPTION_FOLLOWUPS[followupId];
}

export function getFollowupsForHandover(handoverId: string): FollowupWithHandover[] {
  return Object.values(MOCK_ADOPTION_FOLLOWUPS).filter(
    (f) => f.followup.handover_id === handoverId
  );
}



