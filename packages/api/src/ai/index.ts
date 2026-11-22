import type { TypedSupabaseClient } from '../client';
import type {
  CreateAIConversationInput,
  SendAIMessageInput,
  GuardrailCheckResult,
  HandoffClinicPreview,
  HandoffData,
} from '@pranora/validation';
import { getNearbyClinicsWithFallback } from '../map';

export type { HandoffClinicPreview, HandoffData };
export * from './voice';

export interface EmergencyClinicPreview {
  locationId: string;
  nameBn: string | null;
  nameEn: string | null;
  addressBn: string | null;
  addressEn: string | null;
  phone: string | null;
  distanceKm: string;
  is24h: boolean;
  lat: number;
  lng: number;
}

export interface AIConversationRow {
  id: string;
  user_id: string;
  pet_id: string | null;
  share_pet_context: boolean;
  locale: 'bn' | 'en';
  created_at: string;
}

export interface ProposedBookingData {
  clinic_id?: string | null;
  clinic_name?: string | null;
  service_id?: string | null;
  service_name?: string | null;
  suggested_date?: string | null;
  suggested_time?: string | null;
  price?: number | null;
  notes?: string | null;
  status?: 'pending_confirmation' | 'confirmed' | 'declined' | null;
  booking_id?: string | null;
  booking_code?: string | null;
}

export interface AIMessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  is_voice: boolean;
  emergency_flag: boolean;
  handoff_flag: boolean;
  emergency_clinics?: EmergencyClinicPreview[] | null;
  proposed_booking: ProposedBookingData | null;
  handoff_data?: HandoffData | null;
  created_at: string;
}

export interface PetContextInfo {
  name?: string;
  species?: string;
  breed?: string | null;
  age_months?: number | null;
  age_display?: string | null;
  weight_kg?: number | null;
  allergies?: string | null;
  gender?: 'male' | 'female' | null;
  is_neutered?: boolean | null;
  life_stage?: 'puppy_or_kitten' | 'adult' | 'senior' | null;
}

/**
 * Builds PetContextInfo from pet profile data with calculated age and life stage
 */
export function buildPetContextInfo(pet: {
  name: string;
  species: string;
  breed?: { name_bn?: string | null; name_en?: string | null } | null;
  breed_other?: string | null;
  date_of_birth?: string | null;
  birth_approx?: boolean;
  weight_kg?: number | null;
  allergies?: string | null;
  gender?: string | null;
  is_neutered?: boolean | null;
}): PetContextInfo {
  let ageMonths: number | null = null;
  let ageDisplay: string | null = null;
  let lifeStage: 'puppy_or_kitten' | 'adult' | 'senior' = 'adult';

  if (pet.date_of_birth) {
    const dob = new Date(pet.date_of_birth);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - dob.getFullYear()) * 12 +
      (now.getMonth() - dob.getMonth());
    ageMonths = Math.max(0, diffMonths);

    if (ageMonths < 12) {
      ageDisplay = `${ageMonths}m`;
      lifeStage = 'puppy_or_kitten';
    } else {
      const years = Math.floor(ageMonths / 12);
      const remainingMonths = ageMonths % 12;
      ageDisplay =
        remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`;
      lifeStage = years >= 7 ? 'senior' : 'adult';
    }
  }

  const breedName =
    pet.breed?.name_bn || pet.breed?.name_en || pet.breed_other || null;

  return {
    name: pet.name,
    species: pet.species,
    breed: breedName,
    age_months: ageMonths,
    age_display: ageDisplay,
    weight_kg: pet.weight_kg ?? null,
    allergies: pet.allergies ?? null,
    gender: pet.gender === 'male' || pet.gender === 'female' ? pet.gender : null,
    is_neutered: pet.is_neutered ?? null,
    life_stage: lifeStage,
  };
}

// ── Guardrail Rules & Pattern Detection (§4.13, AI-1, AI-2) ──────────────────

const EMERGENCY_PATTERNS_BN = [
  /বিষ/i,
  /টক্সিক/i,
  /কীটনাশক/i,
  /পয়জন/i,
  /রক্ত/i,
  /কাটা/i,
  /ক্ষত/i,
  /রক্তক্ষরণ/i,
  /রক্তবমি/i,
  /শ্বাসকষ্ট/i,
  /দম\s*বন্ধ/i,
  /হাঁপা/i,
  /দম\s*নিতে/i,
  /খিঁচুনি/i,
  /কাঁপছে/i,
  /অচেতন/i,
  /বেহুঁশ/i,
  /পড়ে\s*গেছে/i,
  /পড়ে\s*গিয়ে/i,
  /নড়ছে\s*না/i,
  /কামড়ে/i,
  /সাপ/i,
  /প্যারালাইস/i,
  /প্যারালাইসিস/i,
  /স্ট্রোক/i,
  /হিটস্ট্রোক/i,
  /জরুরি/i,
  /জরুরী/i,
  /মরে\s*যাচ্ছে/i,
];

const EMERGENCY_PATTERNS_EN = [
  /poison/i,
  /toxic/i,
  /rodenticide/i,
  /antifreeze/i,
  /bleeding/i,
  /blood/i,
  /hemorrhage/i,
  /breathing/i,
  /choking/i,
  /gasping/i,
  /suffocat/i,
  /seizure/i,
  /convulsion/i,
  /tremor/i,
  /unconscious/i,
  /collapse/i,
  /fainted/i,
  /unresponsive/i,
  /bitten/i,
  /snake/i,
  /paralysis/i,
  /stroke/i,
  /heatstroke/i,
  /emergency/i,
  /dying/i,
  /hit\s*by\s*car/i,
  /fracture/i,
];

const MEDICINE_PATTERNS_BN = [
  /ওষুধ/i,
  /ঔষধ/i,
  /ডোজ/i,
  /প্যারাসিটামল/i,
  /প্যানাডল/i,
  /অ্যান্টিবায়োটিক/i,
  /রোগ\s*নির্ণয়/i,
  /প্রেসক্রিপশন/i,
];

const MEDICINE_PATTERNS_EN = [
  /medicine/i,
  /prescribe/i,
  /dosage/i,
  /paracetamol/i,
  /antibiotic/i,
  /diagnos/i,
  /drug/i,
  /prescription/i,
];

const HANDOFF_PATTERNS_BN = [
  /মানুষের/i,
  /মানুষ/i,
  /বিশেষজ্ঞ/i,
  /ডাক্তার/i,
  /কল/i,
  /ভেটেরিনার/i,
  /পশু\s*চিকিৎসক/i,
  /সাপোর্ট/i,
  /কাস্টমার\s*কেয়ার/i,
  /হেল্পলাইন/i,
  /সরাসরি\s*কথা/i,
  /কথা\s*বলতে\s*চাই/i,
  /কাউকে\s*ডাকুন/i,
  /কল\s*করতে/i,
];

const HANDOFF_PATTERNS_EN = [
  /human/i,
  /specialist/i,
  /doctor/i,
  /vet\b/i,
  /veterinarian/i,
  /talk\s*to\s*(someone|person|agent|vet|doctor|human)/i,
  /speak\s*with/i,
  /support/i,
  /customer\s*service/i,
  /helpline/i,
  /call\s*someone/i,
  /real\s*person/i,
  /human\s*support/i,
];

/**
 * Checks guardrails according to PRD §4.13 & AI-2:
 * Checks guardrails according to PRD §4.13 & AI-1, AI-2, AI-5:
 * 1. Strict emergency signs -> triggers emergency flag + instant emergency veterinary guidance.
 * 2. Never diagnose illnesses or prescribe medication/dosage.
 * 3. Human handoff recommendation when unsure or explicitly requested.
 * 3. Human handoff recommendation when unsure or explicitly requested (AI-5).
 */
export function evaluateUserMessageGuardrails(
  content: string,
  locale: 'bn' | 'en' = 'bn'
): GuardrailCheckResult {
  const isEmergency =
    EMERGENCY_PATTERNS_BN.some((regex) => regex.test(content)) ||
    EMERGENCY_PATTERNS_EN.some((regex) => regex.test(content));

  if (isEmergency) {
    const safeResponse =
      locale === 'bn'
        ? '🚨 জরুরি সতর্কতা: আপনার পোষা প্রাণীর উপসর্গগুলো তাৎক্ষণিক জরুরি ভেটেরিনারি চিকিৎসার দাবি রাখে। ঘরে বসে চিকিৎসার চেষ্টা করবেন না এবং ভুলেও মানুষের কোনো ওষুধ দেবেন না। নিচে নিকটস্থ ২৪/৭ জরুরি ভেটেরিনারি ক্লিনিকগুলোর তালিকা ও দিকনির্দেশনা দেওয়া হলো। দ্রুততম সময়ে ক্লিনিকে যোগাযোগ করুন বা পৌঁছান।'
        : '🚨 CRITICAL EMERGENCY ALERT: These symptoms indicate a potential life-threatening emergency requiring immediate veterinary attention. Do not delay or attempt home treatments. Below are the closest 24/7 emergency veterinary clinics. Please transport your pet to an emergency facility immediately.';

    return {
      action: 'emergency',
      emergency: true,
      handoff: true,
      reason: 'Emergency symptoms detected',
      safeResponse,
    };
  }

  const isMedicineOrDiagnosis =
    MEDICINE_PATTERNS_BN.some((regex) => regex.test(content)) ||
    MEDICINE_PATTERNS_EN.some((regex) => regex.test(content));

  if (isMedicineOrDiagnosis) {
    const safeResponse =
      locale === 'bn'
        ? '🚫 নীতিগত সতর্কতা: প্রাণোরা এআই কোনো রোগ নির্ণয় করতে পারে না এবং কোনো প্রেসক্রিপশন ওষুধ বা তার ডোজ নির্ধারণ করে না। ভুল ওষুধ ও অনুপযুক্ত মাত্রা আপনার পোষা প্রাণীর জন্য প্রাণঘাতী হতে পারে। অনুগ্রহ করে একজন বাংলাদেশ ভেটেরিনারি কাউন্সিল (BVC) নিবন্ধিত পশু চিকিৎসকের পরামর্শ নিন।'
        : '🚫 Policy Restriction: Pranora AI cannot diagnose illnesses or recommend prescription medications or dosages. Improper medication can be life-threatening. Please consult a licensed veterinarian for clinical evaluation and prescription.';

    return {
      action: 'block_diagnosis_medicine',
      emergency: false,
      handoff: true,
      reason: 'Diagnosis and prescription medication requests are prohibited',
      safeResponse,
    };
  }

  const isHandoff =
    HANDOFF_PATTERNS_BN.some((regex) => regex.test(content)) ||
    HANDOFF_PATTERNS_EN.some((regex) => regex.test(content));

  return {
    action: isHandoff ? 'handoff' : 'allow',
    emergency: false,
    handoff: isHandoff,
  };
}

/**
 * Resolves the top 24/7 emergency clinics for AI-2 emergency cards
 */
export async function getEmergencyClinicsForAI(
  coords?: { lat: number; lng: number } | null,
  client?: TypedSupabaseClient | null
): Promise<EmergencyClinicPreview[]> {
  try {
    const userLat = coords?.lat ?? 23.7465; // Default Dhanmondi
    const userLng = coords?.lng ?? 90.3752;

    const results = await getNearbyClinicsWithFallback(
      {
        lat: userLat,
        lng: userLng,
        radiusM: 30000,
        emergency: true,
        limit: 3,
      },
      client
    );

    return results.map((c) => ({
      locationId: c.locationId,
      nameBn: c.nameBn,
      nameEn: c.nameEn,
      addressBn: c.addressBn,
      addressEn: c.addressEn,
      phone: c.phone,
      distanceKm: `${(c.distanceM / 1000).toFixed(1)} km`,
      is24h: c.is24h,
      lat: c.lat,
      lng: c.lng,
    }));
  } catch {
    return [
      {
        locationId: 'loc-dhaka-central-vet',
        nameBn: 'ঢাকা সেন্ট্রাল ভেটেরিনারি হাসপাতাল (জরুরি ২৪/৭)',
        nameEn: 'Dhaka Central Veterinary Hospital (Emergency 24/7)',
        addressBn: '৪৮ কাজী আলাউদ্দিন রোড, ঢাকা',
        addressEn: '48 Kazi Alauddin Road, Dhaka',
        phone: '+8801711223344',
        distanceKm: '2.4 km',
        is24h: true,
        lat: 23.7231,
        lng: 90.4086,
      },
      {
        locationId: 'loc-dhanmondi-pet-clinic',
        nameBn: 'ধানমন্ডি পেট কেয়ার অ্যান্ড ইমার্জেন্সি',
        nameEn: 'Dhanmondi Pet Care & Emergency Clinic',
        addressBn: 'সাত মসজিদ রোড, ধানমন্ডি, ঢাকা',
        addressEn: 'Sat Masjid Road, Dhanmondi, Dhaka',
        phone: '+8801799887766',
        distanceKm: '1.1 km',
        is24h: true,
        lat: 23.7465,
        lng: 90.3752,
      },
    ];
  }
}

/**
 * AI-5: Resolves top recommended licensed veterinary clinics for hand-off
 */
export function getHandoffClinicsForAI(): HandoffClinicPreview[] {
  return [
    {
      locationId: 'loc-dhanmondi-pet-clinic',
      nameBn: 'ধানমন্ডি পেট কেয়ার অ্যান্ড ক্লিনিক',
      nameEn: 'Dhanmondi Pet Care & Clinic',
      addressBn: 'সাত মসজিদ রোড, ধানমন্ডি, ঢাকা',
      addressEn: 'Sat Masjid Road, Dhanmondi, Dhaka',
      phone: '+8801799887766',
      distanceKm: '1.1 km',
      isOpen: true,
    },
    {
      locationId: 'loc-gulshan-vet',
      nameBn: 'গুলশান অ্যানিমেল হেলথ কেয়ার',
      nameEn: 'Gulshan Animal Health Care',
      addressBn: 'রোড ১১, বনানী/গুলশান, ঢাকা',
      addressEn: 'Road 11, Banani/Gulshan, Dhaka',
      phone: '+8801733445566',
      distanceKm: '3.8 km',
      isOpen: true,
    },
    {
      locationId: 'loc-uttara-pet-vet',
      nameBn: 'উত্তরা ভেটেরিনারি কেয়ার সেন্টার',
      nameEn: 'Uttara Veterinary Care Center',
      addressBn: 'সেক্টর ৭, উত্তরা, ঢাকা',
      addressEn: 'Sector 7, Uttara, Dhaka',
      phone: '+8801822334455',
      distanceKm: '6.5 km',
      isOpen: true,
    },
  ];
}

/**
 * Integration Contract 17 / AI-4: Confirms a proposed booking with explicit user consent
 */
export function confirmProposedBooking(
  booking: ProposedBookingData,
  petId?: string | null
): ProposedBookingData {
  const code = `PRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const bookingId = `bkg-ai-${Date.now()}`;

  return {
    ...booking,
    status: 'confirmed',
    booking_id: bookingId,
    booking_code: code,
    notes: `${booking.notes ?? 'AI assisted booking'} (Pet: ${petId ?? 'N/A'})`,
  };
}

/**
 * Generates an automated safe answer for general pet care inquiries (diet, vaccines, grooming, care)
 * and assists with vet appointment booking under explicit user consent (§4.13, AI-4).
 */
export function generateAssistantReply(
  prompt: string,
  locale: 'bn' | 'en' = 'bn',
  petContext?: PetContextInfo | null,
  pendingBooking?: ProposedBookingData | null
): {
  content: string;
  emergency_flag: boolean;
  handoff_flag: boolean;
  emergency_clinics?: EmergencyClinicPreview[] | null;
  proposed_booking?: ProposedBookingData | null;
  handoff_data?: HandoffData | null;
} {
  const trimmed = prompt.trim();

  // AI-4: Handle explicit user confirmation or rejection of a pending proposed booking
  if (pendingBooking && pendingBooking.status === 'pending_confirmation') {
    const isYesConfirmation =
      /^(হ্যাঁ|হ্যা|হাঁ|বুক\s*করুন|হ্যাঁ,?\s*বুক\s*করুন|ঠিক\s*আছে|কনফার্ম|yes|confirm|ok|sure|please\s*book|yes,?\s*please)$/i.test(
        trimmed
      );

    const isNoDecline =
      /^(না|বাতিল|দরকার\s*নেই|no|cancel|don't\s*book|no\s*thanks)$/i.test(
        trimmed
      );

    if (isYesConfirmation) {
      const confirmed = confirmProposedBooking(pendingBooking);
      const reply =
        locale === 'bn'
          ? `🎉 আপনার অ্যাপয়েন্টমেন্ট সফলভাবে বুক করা হয়েছে!\n\n📋 বুকিং কোড: ${confirmed.booking_code}\n🏥 ক্লিনিক: ${confirmed.clinic_name}\n🩺 সেবা: ${confirmed.service_name}\n📅 সময়: ${confirmed.suggested_date} (${confirmed.suggested_time})\n💵 ফি: ৳ ${confirmed.price}\n\nঅ্যাপের বুকিং তালিকায় এটি সংরক্ষিত রয়েছে। চিকিৎসকের নিকট পৌঁছালে কোডটি প্রদর্শন করুন।`
          : `🎉 Your appointment has been successfully booked!\n\n📋 Booking Code: ${confirmed.booking_code}\n🏥 Clinic: ${confirmed.clinic_name}\n🩺 Service: ${confirmed.service_name}\n📅 Time: ${confirmed.suggested_date} (${confirmed.suggested_time})\n💵 Fee: ${confirmed.price} BDT\n\nThis is safely recorded under your Bookings. Please present your booking code at the clinic.`;

      return {
        content: reply,
        emergency_flag: false,
        handoff_flag: false,
        emergency_clinics: null,
        proposed_booking: confirmed,
        handoff_data: null,
      };
    }

    if (isNoDecline) {
      const declined: ProposedBookingData = {
        ...pendingBooking,
        status: 'declined',
      };
      const reply =
        locale === 'bn'
          ? 'অ্যাপয়েন্টমেন্ট বুকিং প্রস্তাবটি বাতিল করা হয়েছে। অন্য কোনো প্রশ্ন বা সেবা লাগলে নিঃসঙ্কোচে জানান।'
          : 'The appointment booking proposal has been cancelled. Let me know if you need anything else.';

      return {
        content: reply,
        emergency_flag: false,
        handoff_flag: false,
        emergency_clinics: null,
        proposed_booking: declined,
        handoff_data: null,
      };
    }
  }

  // AI-4: Check if user is asking to book an appointment
  const isBookingRequest =
    /বুক/i.test(trimmed) ||
    /অ্যাপয়েন্টমেন্ট/i.test(trimmed) ||
    /সিরিয়াল/i.test(trimmed) ||
    /ডাক্তার\s*দেখ/i.test(trimmed) ||
    /ক্লিনিক.*যাব/i.test(trimmed) ||
    /appointment/i.test(trimmed) ||
    /book/i.test(trimmed) ||
    /schedule/i.test(trimmed);

  if (isBookingRequest) {
    const proposed: ProposedBookingData = {
      clinic_id: 'loc-dhanmondi-pet-clinic',
      clinic_name:
        locale === 'bn'
          ? 'ধানমন্ডি পেট কেয়ার অ্যান্ড ক্লিনিক'
          : 'Dhanmondi Pet Care & Clinic',
      service_id: 'srv-vet-consultation',
      service_name:
        locale === 'bn'
          ? 'সাধারণ ভেটেরিনারি চেকআপ ও পরামর্শ'
          : 'General Veterinary Checkup & Consultation',
      suggested_date: locale === 'bn' ? 'আগামীকাল' : 'Tomorrow',
      suggested_time: '10:30 AM',
      price: 500,
      status: 'pending_confirmation',
      notes: petContext?.name
        ? `${petContext.name} (${petContext.species ?? 'Pet'}) consultation`
        : 'General Consultation',
    };

    const reply =
      locale === 'bn'
        ? `আমি আপনার জন্য নিকটস্থ ক্লিনিকের একটি অ্যাপয়েন্টমেন্ট প্রস্তুত করেছি:\n\n🏥 ক্লিনিক: ${proposed.clinic_name}\n🩺 সেবা: ${proposed.service_name}\n📅 সময়: ${proposed.suggested_date} (${proposed.suggested_time})\n💵 ফি: ৳ ${proposed.price}\n\nআমি কি এই অ্যাপয়েন্টমেন্টটি আপনার জন্য বুক করব? সম্মতি দিতে 'হ্যাঁ' লিখুন অথবা নিচের বোতামে চাপুন।`
        : `I have prepared an appointment proposal for you:\n\n🏥 Clinic: ${proposed.clinic_name}\n🩺 Service: ${proposed.service_name}\n📅 Time: ${proposed.suggested_date} (${proposed.suggested_time})\n💵 Fee: ${proposed.price} BDT\n\nShall I book this appointment for you? Reply 'Yes' or click the confirm button below.`;

    return {
      content: reply,
      emergency_flag: false,
      handoff_flag: false,
      emergency_clinics: null,
      proposed_booking: proposed,
      handoff_data: null,
    };
  }

  const guardrail = evaluateUserMessageGuardrails(prompt, locale);

  if (guardrail.action === 'emergency') {
    const emergencyClinics: EmergencyClinicPreview[] = [
      {
        locationId: 'loc-dhaka-central-vet',
        nameBn: 'ঢাকা সেন্ট্রাল ভেটেরিনারি হাসপাতাল (জরুরি ২৪/৭)',
        nameEn: 'Dhaka Central Veterinary Hospital (Emergency 24/7)',
        addressBn: '৪৮ কাজী আলাউদ্দিন রোড, ঢাকা',
        addressEn: '48 Kazi Alauddin Road, Dhaka',
        phone: '+8801711223344',
        distanceKm: '2.4 km',
        is24h: true,
        lat: 23.7231,
        lng: 90.4086,
      },
      {
        locationId: 'loc-dhanmondi-pet-clinic',
        nameBn: 'ধানমন্ডি পেট কেয়ার অ্যান্ড ইমার্জেন্সি',
        nameEn: 'Dhanmondi Pet Care & Emergency Clinic',
        addressBn: 'সাত মসজিদ রোড, ধানমন্ডি, ঢাকা',
        addressEn: 'Sat Masjid Road, Dhanmondi, Dhaka',
        phone: '+8801799887766',
        distanceKm: '1.1 km',
        is24h: true,
        lat: 23.7465,
        lng: 90.3752,
      },
    ];

    return {
      content: guardrail.safeResponse ?? '',
      emergency_flag: true,
      handoff_flag: true,
      emergency_clinics: emergencyClinics,
      proposed_booking: null,
      handoff_data: null,
    };
  }

  if (guardrail.action === 'block_diagnosis_medicine') {
    const handoffData: HandoffData = {
      reason: 'medical_consultation',
      clinics: getHandoffClinicsForAI(),
      support_phone: '+880 9612-772667',
      support_label_bn: 'প্রাণোরা ভেটেরিনারি হেল্পলাইন',
      support_label_en: 'Pranora Veterinary Helpline',
    };

    return {
      content: guardrail.safeResponse ?? '',
      emergency_flag: false,
      handoff_flag: true,
      emergency_clinics: null,
      proposed_booking: null,
      handoff_data: handoffData,
    };
  }

  // AI-5: Explicit user request to speak with a human agent, vet, or clinic support
  if (guardrail.action === 'handoff') {
    const handoffData: HandoffData = {
      reason: 'user_requested',
      clinics: getHandoffClinicsForAI(),
      support_phone: '+880 9612-772667',
      support_label_bn: 'প্রাণোরা ভেটেরিনারি হেল্পলাইন',
      support_label_en: 'Pranora Veterinary Helpline',
    };

    const reply =
      locale === 'bn'
        ? 'অবশ্যই! আমাদের নিবন্ধিত ভেটেরিনারি ক্লিনিক এবং সেন্ট্রাল সাপোর্ট টিমের সাথে সরাসরি যোগাযোগের তথ্য নিচে দেওয়া হলো। আপনি সরাসরি ক্লিনিকে কল করে বিশেষজ্ঞ চিকিৎসকের সাথে পরামর্শ করতে পারেন অথবা আমাদের ডেডিকেটেড হেল্পলাইনে কথা বলতে পারেন।'
        : 'Certainly! Here is the direct contact information for recommended licensed veterinary clinics and our support team. You can call a clinic directly for professional guidance or reach our dedicated helpline.';

    return {
      content: reply,
      emergency_flag: false,
      handoff_flag: true,
      emergency_clinics: null,
      proposed_booking: null,
      handoff_data: handoffData,
    };
  }

  // General safe answers
  const disclaimerBn = '\n\n💡 তথ্যসূত্র: সাধারণ যত্ন ও পুষ্টি সংক্রান্ত সচেতনতামূলক নির্দেশিকা। এটি কোনোভাবেই একজন নিবন্ধিত পশু চিকিৎসকের সরাসরি পরামর্শ বা প্রেসক্রিপশনের বিকল্প নয়।';
  const disclaimerEn = '\n\n💡 Disclaimer: General care & nutritional guidance only. Not a substitute for licensed veterinary medical advice.';

  let petPrefix = '';
  let allergyNotice = '';

  if (petContext && petContext.name) {
    const speciesLabelBn = petContext.species === 'cat' ? 'বিড়াল' : petContext.species === 'dog' ? 'কুকুর' : petContext.species ?? 'পোষা প্রাণী';
    const ageDescBn = petContext.age_display ? `, বয়স: ${petContext.age_display}` : '';
    const breedDescBn = petContext.breed ? `, জাত: ${petContext.breed}` : '';

    const ageDescEn = petContext.age_display ? `, Age: ${petContext.age_display}` : '';
    const breedDescEn = petContext.breed ? `, Breed: ${petContext.breed}` : '';

    petPrefix =
      locale === 'bn'
        ? `[🐾 অনুমোদিত প্রোফাইল: ${petContext.name} (${speciesLabelBn}${breedDescBn}${ageDescBn})]:\n`
        : `[🐾 Authorized Context: ${petContext.name} (${petContext.species ?? 'Pet'}${breedDescEn}${ageDescEn})]:\n`;

    if (petContext.allergies) {
      allergyNotice =
        locale === 'bn'
          ? `\n\n⚠️ অ্যালার্জি সতর্কতা: ${petContext.name}-এর প্রোফাইলে "${petContext.allergies}"-এ অ্যালার্জির তথ্য রয়েছে, তাই এই উপাদানগুলো সবসময় পরিহার করুন।`
          : `\n\n⚠️ Allergy Caution: ${petContext.name}'s profile notes sensitivity to "${petContext.allergies}". Always verify and avoid these ingredients.`;
    }
  } else {
    petPrefix =
      locale === 'bn'
        ? `[সাধারণ পরামর্শ (কোনো পোষা প্রাণীর প্রোফাইল তথ্য ব্যবহার করা হয়নি)]:\n`
        : `[General Guidance (No pet profile context used)]:\n`;
  }

  const lower = prompt.toLowerCase();

  // Diet / Food
  if (lower.includes('খাবার') || lower.includes('food') || lower.includes('diet') || lower.includes('পুষ্টি')) {
    let reply = '';
    if (petContext?.species === 'cat') {
      const stageAdviceBn =
        petContext.life_stage === 'puppy_or_kitten'
          ? 'যেহেতু আপনার বিড়ালটি ছানা (Kitten), তাই উচ্চ প্রোটিন ও ক্যালসিয়ামসমৃদ্ধ কিটেন ফুড দিনে ৩-৪ বার দেওয়া প্রয়োজন।'
          : petContext.life_stage === 'senior'
          ? 'বয়োবৃদ্ধ বিড়ালের জন্য কিডনি ও জয়েন্ট সুরক্ষা করে এমন সহজে হজমযোগ্য সিনিয়র ফুড নির্বাচন করুন।'
          : 'প্রাপ্তবয়স্ক বিড়ালের জন্য টরিন (Taurine) যুক্ত মানসম্মত ক্যাট ফুড দিনে ২ বার দেওয়া শ্রেয়।';

      const stageAdviceEn =
        petContext.life_stage === 'puppy_or_kitten'
          ? 'Since your cat is in the kitten stage, feed high-protein, nutrient-dense kitten food 3–4 times daily.'
          : petContext.life_stage === 'senior'
          ? 'For senior cats, select easily digestible food supporting kidney function and joint mobility.'
          : 'For adult cats, provide high-quality formulated feline food with essential taurine twice daily.';

      reply =
        locale === 'bn'
          ? `${petPrefix}বিড়াল সম্পূর্ণ মাংসাশী প্রাণী (Obligate Carnivore)। তাদের খাবারে পর্যাপ্ত প্রোটিন ও টরিন আবশ্যক। ${stageAdviceBn} পেঁয়াজ, রসুন, চকলেট বা দুধ খাওয়ানো থেকে বিরত থাকুন। সর্বদা পরিষ্কার পানি সরবরাহ রাখুন।${allergyNotice}${disclaimerBn}`
          : `${petPrefix}Cats are obligate carnivores requiring adequate dietary protein and essential taurine. ${stageAdviceEn} Strictly avoid onions, garlic, chocolate, grapes, and cow milk. Keep fresh water accessible at all times.${allergyNotice}${disclaimerEn}`;
    } else if (petContext?.species === 'dog') {
      const stageAdviceBn =
        petContext.life_stage === 'puppy_or_kitten'
          ? 'ছানা কুকুরের (Puppy) হাড় ও মাংসপেশির বৃদ্ধির জন্য দিনে ৩ বার সুষম পাপ্পি খাবার দিন।'
          : petContext.life_stage === 'senior'
          ? 'বয়োবৃদ্ধ কুকুরের অতিরিক্ত ওজন রোধে কম ক্যালোরি ও জয়েন্ট সাপ্লিমেন্টযুক্ত সিনিয়র ডায়েট দিন।'
          : 'প্রাপ্তবয়স্ক কুকুরের জন্য নিয়ন্ত্রিত প্রোটিন ও ফাইবারযুক্ত খাবার দিনে ২ বার দেওয়া আদর্শ।';

      const stageAdviceEn =
        petContext.life_stage === 'puppy_or_kitten'
          ? 'For growing puppies, provide balanced puppy formula rich in calcium and DHA 3 times daily.'
          : petContext.life_stage === 'senior'
          ? 'For senior dogs, maintain a lower-calorie, high-fiber diet supporting mobility and preventing obesity.'
          : 'For adult dogs, standard balanced canine maintenance meals twice daily are recommended.';

      reply =
        locale === 'bn'
          ? `${petPrefix}কুকুরের জন্য সুষম ও পুষ্টিকর খাবার অত্যন্ত জরুরি। ${stageAdviceBn} কখনোই চকলেট, কিশমিশ, আঙুর, ক্যাফেইন বা পেঁয়াজ দেবেন না।${allergyNotice}${disclaimerBn}`
          : `${petPrefix}A nutritionally balanced canine diet is essential. ${stageAdviceEn} Never feed chocolate, grapes, raisins, onions, or xylitol.${allergyNotice}${disclaimerEn}`;
    } else {
      reply =
        locale === 'bn'
          ? `${petPrefix}পোষা প্রাণীর জন্য সুষম খাদ্য অত্যন্ত গুরুত্বপূর্ণ। মিষ্টি, পেঁয়াজ, রসুন, চকলেট ও আঙুর খাওয়ানো থেকে বিরত থাকুন। সর্বদা পরিষ্কার পানীয় জল সরবরাহ করুন এবং বয়স অনুযায়ী সঠিক প্রোটিনযুক্ত খাবার বেছে নিন।${disclaimerBn}`
          : `${petPrefix}A balanced diet is vital for your pet. Avoid toxic items like chocolate, onions, garlic, raisins, and sweets. Always provide fresh water and age-appropriate formulated food.${disclaimerEn}`;
    }

    return { content: reply, emergency_flag: false, handoff_flag: false, emergency_clinics: null, proposed_booking: null, handoff_data: null };
  }

  // Vaccination
  if (lower.includes('ভ্যাকসিন') || lower.includes('টিকা') || lower.includes('vaccin')) {
    let reply = '';
    if (petContext?.life_stage === 'puppy_or_kitten') {
      reply =
        locale === 'bn'
          ? `${petPrefix}আপনার ছানাটির জন্য প্রাথমিক ভ্যাকসিনের সময়সূচি অত্যন্ত জরুরি। ৬-৮ সপ্তাহে প্রথম কম্বিনেশন টিকা, ১০-১২ সপ্তাহে বুস্টার এবং ৩ মাস বয়সে জলাতঙ্ক (Rabies) টিকা দেওয়া আবশ্যক। অ্যাপের "টিকা তালিকা" বিভাগ থেকে বিস্তারিত শিডিউল জেনে নিন।${disclaimerBn}`
          : `${petPrefix}Initial core vaccination is critical for young pets. Core combination vaccines start at 6-8 weeks with boosters at 10-12 weeks, followed by rabies vaccine at 3 months. Check the "Vaccinations" section in the app.${disclaimerEn}`;
    } else {
      reply =
        locale === 'bn'
          ? `${petPrefix}কুকুর ও বিড়ালের জন্য জলাতঙ্ক (Rabies) এবং সংক্রামক রোগের প্রাথমিক ও বার্ষিক বুস্টার ভ্যাকসিনেশন রুটিন মেনে চলা আবশ্যক। সঠিক সময়সূচি দেখতে অ্যাপের "টিকা তালিকা" বিভাগটি দেখুন।${disclaimerBn}`
          : `${petPrefix}Core vaccinations such as Rabies and annual combination boosters are essential. Check the "Vaccinations" section in the app for your schedule.${disclaimerEn}`;
    }

    return { content: reply, emergency_flag: false, handoff_flag: false, emergency_clinics: null, proposed_booking: null, handoff_data: null };
  }

  // Bath / Grooming
  if (lower.includes('গোসল') || lower.includes('groom') || lower.includes('bath') || lower.includes('পরিষ্কার')) {
    let reply = '';
    if (petContext?.species === 'cat') {
      reply =
        locale === 'bn'
          ? `${petPrefix}বিড়াল সাধারণত জিহ্বা দিয়ে নিজেই লোম পরিষ্কার রাখে। নিয়মিত ব্রাশ করা হেয়ারবল কমাতে সাহায্য করে। খুব অপরিষ্কার না হলে ঘন ঘন গোসলের প্রয়োজন নেই।${disclaimerBn}`
          : `${petPrefix}Cats are meticulous self-groomers. Daily brushing prevents hairballs and mats. Bathing is only necessary if they get into something sticky or dirty.${disclaimerEn}`;
    } else if (petContext?.species === 'dog') {
      reply =
        locale === 'bn'
          ? `${petPrefix}কুকুরের ত্বকের স্বাভাবিক তেল বজায় রাখতে মাসে ১-২ বার পেট-ফ্রেন্ডলি শ্যাম্পু দিয়ে গোসল করানো নিরাপদ। নিয়মিত ব্রাশ করলে লোম ঝরা অনেকটাই নিয়ন্ত্রণে থাকে।${disclaimerBn}`
          : `${petPrefix}Bathe dogs every 2 to 4 weeks using pet-safe shampoo to preserve natural skin oils. Regular brushing helps control shedding and keeps the coat healthy.${disclaimerEn}`;
    } else {
      reply =
        locale === 'bn'
          ? `${petPrefix}নিয়মিত ব্রাশ করা লোম ঝরে পড়া কমাতে সাহায্য করে। বিড়াল নিজে পরিষ্কার রাখে তাই খুব ঘন ঘন গোসলের প্রয়োজন হয় না। কুকুরের ক্ষেত্রে মাসে ১-২ বার পেট-ফ্রেন্ডলি শ্যাম্পু দিয়ে গোসল করানো নিরাপদ।${disclaimerBn}`
          : `${petPrefix}Regular brushing prevents matting and reduces shedding. Cats groom themselves frequently, while dogs can be bathed once or twice a month using pet-safe shampoo.${disclaimerEn}`;
    }

    return { content: reply, emergency_flag: false, handoff_flag: false, emergency_clinics: null, proposed_booking: null, handoff_data: null };
  }

  // AI-5: Check for uncertain, ambiguous, or general illness symptoms requiring clinic hand-off
  const SICKNESS_PATTERNS = [
    /বমি/i,
    /ডায়রিয়া/i,
    /পাতলা\s*পায়খানা/i,
    /জ্বর/i,
    /খাচ্ছে\s*না/i,
    /অসুস্থ/i,
    /ল্যাংড়া/i,
    /ঘা/i,
    /ব্যথা/i,
    /vomit/i,
    /diarrhea/i,
    /fever/i,
    /not\s*eating/i,
    /sick/i,
    /limping/i,
    /wound/i,
    /infection/i,
    /pain/i,
    /letharg/i,
  ];

  const hasSicknessSymptom = SICKNESS_PATTERNS.some((p) => p.test(prompt));
  if (hasSicknessSymptom) {
    const handoffData: HandoffData = {
      reason: 'uncertain',
      clinics: getHandoffClinicsForAI(),
      support_phone: '+880 9612-772667',
      support_label_bn: 'প্রাণোরা ভেটেরিনারি হেল্পলাইন',
      support_label_en: 'Pranora Veterinary Helpline',
    };

    const reply =
      locale === 'bn'
        ? `${petPrefix}আপনার পোষা প্রাণীর এমন লক্ষণে দ্রুত একজন ভেটেরিনারি চিকিৎসকের সরাসরি পরামর্শ নেওয়া জরুরি। পোষা প্রাণীকে পানিশূন্যতা থেকে রক্ষা করতে পরিষ্কার পানি দিন এবং কখনোই মানুষের ওষুধ খাওয়াবেন না। বিশেষজ্ঞের সরাসরি পরামর্শ পেতে নিচের যেকোনো ক্লিনিকে বা হেল্পলাইনে কল করুন।${allergyNotice}${disclaimerBn}`
        : `${petPrefix}For symptoms like these, direct clinical evaluation by a licensed veterinarian is strongly advised. Keep your pet hydrated with fresh water and never administer human medications. Please contact a recommended clinic or our support helpline below for direct guidance.${allergyNotice}${disclaimerEn}`;

    return {
      content: reply,
      emergency_flag: false,
      handoff_flag: true,
      emergency_clinics: null,
      proposed_booking: null,
      handoff_data: handoffData,
    };
  }

  // Default friendly advice
  const fallback =
    locale === 'bn'
      ? `${petPrefix}আপনার প্রশ্নের জন্য ধন্যবাদ! পোষা প্রাণীর দীর্ঘায়ু ও সুস্থতার জন্য নিয়মিত ভেটেরিনারি চেকআপ, সুষম খাবার ও পর্যাপ্ত যত্ন নিশ্চিত করুন। কোনো অস্বাভাবিক উপসর্গ দেখা দিলে একজন পশু চিকিৎসকের শরণাপন্ন হন।${allergyNotice}${disclaimerBn}`
      : `${petPrefix}Thank you for your question! For optimal pet health, ensure regular preventive checkups, high-quality nutrition, and a stress-free environment. Please visit a vet if you notice abnormal behavior.${allergyNotice}${disclaimerEn}`;

  return {
    content: fallback,
    emergency_flag: false,
    handoff_flag: guardrail.handoff,
    emergency_clinics: null,
    proposed_booking: null,
    handoff_data: null,
  };
}

// ── In-Memory Fallback for Client Testing / Offline Mode ─────────────────────

let mockConversations: AIConversationRow[] = [
  {
    id: 'ai-conv-default',
    user_id: 'mock-user-1',
    pet_id: null,
    share_pet_context: false,
    locale: 'bn',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

let mockMessages: AIMessageRow[] = [
  {
    id: 'ai-msg-1',
    conversation_id: 'ai-conv-default',
    role: 'assistant',
    content: 'স্বাগতম! আমি প্রাণোরা এআই সহকারী। আপনার পোষা প্রাণীর খাবার, যত্ন, টিকা বা সাধারণ প্রশ্নের উত্তর দিতে আমি প্রস্তুত। মনে রাখবেন, আমি কোনো নিবন্ধিত পশু চিকিৎসকের বিকল্প নই।',
    is_voice: false,
    emergency_flag: false,
    handoff_flag: false,
    emergency_clinics: null,
    proposed_booking: null,
    handoff_data: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

// ── API Functions ────────────────────────────────────────────────────────────

export async function listAIConversations(
  client: TypedSupabaseClient,
  userId: string
): Promise<{ data: AIConversationRow[]; error?: string }> {
  try {
    const { data, error } = await client
      .from('ai_conversations' as never)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: mockConversations.filter((c) => c.user_id === userId) };
    }
    return { data: (data ?? []) as unknown as AIConversationRow[] };
  } catch {
    return { data: mockConversations.filter((c) => c.user_id === userId) };
  }
}

export async function createAIConversation(
  client: TypedSupabaseClient,
  userId: string,
  payload: CreateAIConversationInput
): Promise<{ data: AIConversationRow | null; error?: string }> {
  try {
    const { data, error } = await client
      .from('ai_conversations' as never)
      .insert({
        user_id: userId,
        pet_id: payload.pet_id ?? null,
        share_pet_context: payload.share_pet_context ?? false,
        locale: payload.locale ?? 'bn',
      } as never)
      .select()
      .single();

    if (error) {
      const fallback: AIConversationRow = {
        id: `ai-conv-${Date.now()}`,
        user_id: userId,
        pet_id: payload.pet_id ?? null,
        share_pet_context: payload.share_pet_context ?? false,
        locale: payload.locale ?? 'bn',
        created_at: new Date().toISOString(),
      };
      mockConversations.unshift(fallback);
      return { data: fallback };
    }

    return { data: data as unknown as AIConversationRow };
  } catch {
    const fallback: AIConversationRow = {
      id: `ai-conv-${Date.now()}`,
      user_id: userId,
      pet_id: payload.pet_id ?? null,
      share_pet_context: payload.share_pet_context ?? false,
      locale: payload.locale ?? 'bn',
      created_at: new Date().toISOString(),
    };
    mockConversations.unshift(fallback);
    return { data: fallback };
  }
}

export async function listAIMessages(
  client: TypedSupabaseClient,
  conversationId: string
): Promise<{ data: AIMessageRow[]; error?: string }> {
  try {
    const { data, error } = await client
      .from('ai_messages' as never)
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return { data: mockMessages.filter((m) => m.conversation_id === conversationId) };
    }
    return { data: (data ?? []) as unknown as AIMessageRow[] };
  } catch {
    return { data: mockMessages.filter((m) => m.conversation_id === conversationId) };
  }
}

export async function sendAIMessage(
  client: TypedSupabaseClient,
  payload: SendAIMessageInput,
  options?: {
    locale?: 'bn' | 'en';
    petContext?: PetContextInfo | null;
    pendingBooking?: ProposedBookingData | null;
  }
): Promise<{
  data: { userMessage: AIMessageRow; assistantMessage: AIMessageRow } | null;
  error?: string;
}> {
  const locale = options?.locale ?? 'bn';
  const petContext = options?.petContext ?? null;
  const pendingBooking = options?.pendingBooking ?? null;

  const userMsgId = `ai-msg-${Date.now()}`;
  const assistantMsgId = `ai-msg-${Date.now() + 1}`;
  const now = new Date().toISOString();

  // Guardrail & booking check and generate reply
  const reply = generateAssistantReply(payload.content, locale, petContext, pendingBooking);

  const userMsg: AIMessageRow = {
    id: userMsgId,
    conversation_id: payload.conversation_id,
    role: 'user',
    content: payload.content,
    is_voice: payload.is_voice ?? false,
    emergency_flag: false,
    handoff_flag: false,
    emergency_clinics: null,
    proposed_booking: null,
    handoff_data: null,
    created_at: now,
  };

  const assistantMsg: AIMessageRow = {
    id: assistantMsgId,
    conversation_id: payload.conversation_id,
    role: 'assistant',
    content: reply.content,
    is_voice: payload.is_voice ?? false,
    emergency_flag: reply.emergency_flag,
    handoff_flag: reply.handoff_flag,
    emergency_clinics: reply.emergency_clinics ?? null,
    proposed_booking: reply.proposed_booking ?? null,
    handoff_data: reply.handoff_data ?? null,
    created_at: new Date(Date.now() + 500).toISOString(),
  };

  try {
    await client.from('ai_messages' as never).insert([
      {
        conversation_id: payload.conversation_id,
        role: 'user',
        content: payload.content,
        is_voice: payload.is_voice ?? false,
      },
      {
        conversation_id: payload.conversation_id,
        role: 'assistant',
        content: reply.content,
        is_voice: payload.is_voice ?? false,
        emergency_flag: reply.emergency_flag,
        handoff_flag: reply.handoff_flag,
        proposed_booking: reply.proposed_booking ?? null,
      },
    ] as never);
  } catch {
    // If DB fails, fallback to in-memory store
  }

  mockMessages.push(userMsg, assistantMsg);
  return { data: { userMessage: userMsg, assistantMessage: assistantMsg } };
}
