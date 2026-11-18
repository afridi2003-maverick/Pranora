import type { AdoptionListingRow } from '@pranora/api';

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
