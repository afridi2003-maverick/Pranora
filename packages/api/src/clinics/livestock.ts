import type { TypedSupabaseClient } from '../client';
import { getAllMockClinics } from './mock.ts';

export type LivestockSpecies = 'cow' | 'goat' | 'sheep' | 'buffalo' | 'poultry';

export interface LivestockVaccineInfo {
  id: string;
  nameBn: string;
  nameEn: string;
  targetSpeciesBn: string;
  targetSpeciesEn: string;
  subsidizedPrice: number; // Subsidized rate in BDT
  seasonBn: string;
  seasonEn: string;
  scheduleBn: string;
  scheduleEn: string;
}

export const DLS_LIVESTOCK_VACCINES: LivestockVaccineInfo[] = [
  {
    id: 'anthrax',
    nameBn: 'তড়কা টিকা (Anthrax)',
    nameEn: 'Anthrax Vaccine',
    targetSpeciesBn: 'গরু, মহিষ, ছাগল, ভেড়া',
    targetSpeciesEn: 'Cattle, Buffalo, Goat, Sheep',
    subsidizedPrice: 15,
    seasonBn: 'মার্চ–এপ্রিল (বর্ষার পূর্বে)',
    seasonEn: 'March–April (Pre-monsoon)',
    scheduleBn: 'বছরে একবার চামড়ার নিচে ইনজেকশন',
    scheduleEn: 'Annually, subcutaneous',
  },
  {
    id: 'fmd',
    nameBn: 'ক্ষুরারোগ টিকা (FMD)',
    nameEn: 'Foot-and-Mouth Disease (FMD)',
    targetSpeciesBn: 'গরু, মহিষ, ছাগল',
    targetSpeciesEn: 'Cattle, Buffalo, Goat',
    subsidizedPrice: 30,
    seasonBn: 'অক্টোবর–নভেম্বর এবং এপ্রিল–মে',
    seasonEn: 'October–November & April–May',
    scheduleBn: 'বছরে দুইবার (৬ মাস অন্তর)',
    scheduleEn: 'Bi-annually (every 6 months)',
  },
  {
    id: 'ppr',
    nameBn: 'পিপিআর টিকা (PPR)',
    nameEn: 'Peste des Petits Ruminants (PPR)',
    targetSpeciesBn: 'ছাগল ও ভেড়া',
    targetSpeciesEn: 'Goat & Sheep',
    subsidizedPrice: 15,
    seasonBn: 'বছরের যেকোনো সময় (৪ মাস বয়স থেকে)',
    seasonEn: 'Anytime from 4 months of age',
    scheduleBn: 'একবার দিলে ৩ বছর সুরক্ষিত থাকে',
    scheduleEn: 'Single dose protects for 3 years',
  },
  {
    id: 'black_quarter',
    nameBn: 'বাদলা টিকা (Black Quarter - BQ)',
    nameEn: 'Black Quarter (BQ) Vaccine',
    targetSpeciesBn: 'গরু ও মহিষ (৬ মাস থেকে ২ বছর)',
    targetSpeciesEn: 'Cattle & Buffalo (6m–2y)',
    subsidizedPrice: 20,
    seasonBn: 'বর্ষা শুরুর আগে (মে–জুন)',
    seasonEn: 'Pre-monsoon (May–June)',
    scheduleBn: 'বছরে একবার মাংসে ইনজেকশন',
    scheduleEn: 'Annually, intramuscular',
  },
  {
    id: 'ranikhet',
    nameBn: 'রাণীক্ষেত টিকা (Ranikhet / Newcastle)',
    nameEn: 'Ranikhet Disease Vaccine (RDV)',
    targetSpeciesBn: 'মুরগি ও হাঁস',
    targetSpeciesEn: 'Poultry & Ducks',
    subsidizedPrice: 10,
    seasonBn: 'নিয়মিত সূচি অনুযায়ী',
    seasonEn: 'Routine schedule',
    scheduleBn: 'চোখের ড্রপ (BCRDV) ও মাংসে ইনজেকশন (RDV)',
    scheduleEn: 'Eye drops (BCRDV) & IM booster (RDV)',
  },
];

export interface LivestockHospitalResult {
  clinicId: string;
  locationId: string;
  nameBn: string;
  nameEn: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  isGovernment: boolean;
  is24h: boolean;
  hasEmergency: boolean;
  offersArtificialInsemination: boolean;
  offersMobileClinic: boolean;
  ratingAvg: number;
  ratingCount: number;
  distanceKm: number;
  servicesBn: string[];
  servicesEn: string[];
}

export interface LivestockCallInput {
  clinicId: string;
  locationId: string;
  farmerName: string;
  species: LivestockSpecies;
  animalCount: number;
  serviceType: 'emergency_calving' | 'disease_treatment' | 'vaccination_campaign' | 'artificial_insemination';
  problemDescription: string;
  address: string;
  phone: string;
}

export interface LivestockCallResult {
  callId: string;
  code: string;
  farmerName: string;
  serviceType: string;
  status: 'dispatched' | 'pending';
  assignedHospital: string;
  createdAt: string;
}

export const MOCK_LIVESTOCK_CALLS: LivestockCallResult[] = [];

/**
 * Retrieves DLS Upazila Veterinary Hospitals and livestock clinics near coordinates (LIV-1)
 */
export async function getLivestockHospitals(
  userLat: number,
  userLng: number,
  species?: LivestockSpecies
): Promise<LivestockHospitalResult[]> {
  const allClinics = getAllMockClinics();

  // Government veterinary hospitals and rural upazila centers treat livestock
  const livestockClinics = allClinics.filter((c) => {
    if (c.provider.isGovernment) return true;
    const name = (c.provider.nameEn + ' ' + (c.provider.nameBn ?? '')).toLowerCase();
    return name.includes('animal') || name.includes('veterinary') || name.includes('hospital');
  });

  return livestockClinics.map((c) => {
    // Distance approx
    const dLat = (userLat - c.location.lat) * 111;
    const dLng = (userLng - c.location.lng) * 111 * Math.cos((userLat * Math.PI) / 180);
    const distKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;

    return {
      clinicId: c.provider.id,
      locationId: c.location.id,
      nameBn: c.provider.nameBn ?? c.provider.nameEn ?? '',
      nameEn: c.provider.nameEn ?? '',
      addressBn: c.location.addressBn ?? c.location.addressEn ?? '',
      addressEn: c.location.addressEn ?? '',
      phone: c.location.phone ?? '+8802223382103',
      isGovernment: c.provider.isGovernment,
      is24h: c.location.is24h,
      hasEmergency: c.location.hasEmergency,
      offersArtificialInsemination: c.provider.isGovernment, // DLS centers offer AI
      offersMobileClinic: true, // Mobile vet ambulance
      ratingAvg: c.provider.ratingAvg,
      ratingCount: c.provider.ratingCount,
      distanceKm: distKm,
      servicesBn: [
        'গবাদি পশুর জরুরি চিকিৎসা ও অস্ত্রোপচার',
        'সরকারি ভর্তুকিতে নিয়মিত টিকাদান কর্মসূচি',
        'উন্নত জাতের সিমেন দিয়ে কৃত্রিম প্রজনন',
        'খামারি পরামর্শ ও চারণভূমি ব্যবস্থাপনা',
      ],
      servicesEn: [
        'Livestock emergency surgery & calving assistance',
        'Subsidized routine vaccination campaigns',
        'Artificial insemination (AI) breeding services',
        'Farmer livestock advisory & biosecurity training',
      ],
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Validates safe BVC compliant medication rules for livestock
 * Strictly ensures banned NSAIDs (Diclofenac, Ketoprofen) are flagged
 */
export function validateLivestockMedication(drugName: string): { isSafe: boolean; warning?: string } {
  const normalized = drugName.toLowerCase().trim();
  if (normalized.includes('diclofenac')) {
    return {
      isSafe: false,
      warning: 'ডাইক্লোফেনাক (Diclofenac) গবাদি পশুর ক্ষেত্রে সম্পূর্ণ নিষিদ্ধ। নিরাপদ বিকল্প: মেলোক্সিক্যাম (Meloxicam)।',
    };
  }
  if (normalized.includes('ketoprofen')) {
    return {
      isSafe: false,
      warning: 'কিটোপ্রোফেন (Ketoprofen) পরিবেশ ও শকুনের সুরক্ষায় নিষিদ্ধ। নিরাপদ বিকল্প: টলফেনামিক এসিড (Tolfenamic acid)।',
    };
  }
  return { isSafe: true };
}

/**
 * Submits a livestock veterinary emergency or farm visit request
 */
export async function submitLivestockCall(
  input: LivestockCallInput,
  client?: TypedSupabaseClient | null
): Promise<LivestockCallResult> {
  if (!input.farmerName || input.farmerName.trim().length === 0) {
    throw new Error('Farmer name is required');
  }
  if (!input.phone || input.phone.trim().length < 8) {
    throw new Error('Valid contact phone is required');
  }
  if (!input.address || input.address.trim().length < 5) {
    throw new Error('Farm location address is required');
  }

  const code = `PR-LIV-${Date.now().toString().slice(-6)}`;
  const callId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `liv-${Date.now()}`;

  const allClinics = getAllMockClinics();
  const clinic = allClinics.find((c) => c.provider.id === input.clinicId || c.location.id === input.locationId);
  const hospitalName = clinic?.provider.nameEn || 'Upazila Livestock Veterinary Hospital';

  const result: LivestockCallResult = {
    callId,
    code,
    farmerName: input.farmerName,
    serviceType: input.serviceType,
    status: 'dispatched',
    assignedHospital: hospitalName,
    createdAt: new Date().toISOString(),
  };

  if (client) {
    try {
      const { data, error } = await (client as any).from('bookings').insert({
        id: callId,
        code,
        location_id: input.locationId,
        booking_type: 'instant',
        status: 'in_progress',
        problem_note: `Livestock Emergency: ${input.species} (Count: ${input.animalCount}). Problem: ${input.problemDescription}. Farm: ${input.address}`,
        payment_method: 'cash',
        starts_at: new Date().toISOString(),
      }).select().single();

      if (!error && data) {
        result.callId = data.id;
        result.code = data.code || code;
      }
    } catch {
      // Fall through to in-memory store
    }
  }

  MOCK_LIVESTOCK_CALLS.unshift(result);
  return result;
}
