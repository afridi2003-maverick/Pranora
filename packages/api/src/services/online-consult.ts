export type {
  CreateOnlineConsultInput,
  OnlineConsultMode,
  OnlineConsultStatus,
} from '@pranora/validation';
import type {
  CreateOnlineConsultInput,
  OnlineConsultMode,
  OnlineConsultStatus,
} from '@pranora/validation';
import type { TypedSupabaseClient } from '../client';
import { buildGatewayUrl } from '../payments/sslcommerz';

export interface OnlineVetOption {
  vetId: string;
  nameEn: string;
  nameBn: string;
  specialtyEn: string;
  specialtyBn: string;
  clinicName: string;
  feeBdt: number;
  rating: number;
  availableNow: boolean;
}

export interface OnlineConsultation {
  id: string;
  vetId: string;
  vetName: string;
  petId: string;
  petName: string;
  callMode: OnlineConsultMode;
  chiefComplaint: string;
  feeBdt: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  transactionId: string;
  checkoutUrl?: string;
  scheduledAt: string;
  status: OnlineConsultStatus;
  createdAt: string;
}

export async function listOnlineConsultVets(
  _client: TypedSupabaseClient
): Promise<OnlineVetOption[]> {
  return [
    {
      vetId: '550e8400-e29b-41d4-a716-446655440101',
      nameEn: 'Dr. Sumaiya Akter',
      nameBn: 'ডাঃ সুমাইয়া আক্তার',
      specialtyEn: 'Small Animal Medicine',
      specialtyBn: 'ছোট প্রাণী চিকিৎসা',
      clinicName: 'PranoraCare Veterinary Clinic, Dhanmondi',
      feeBdt: 500,
      rating: 4.9,
      availableNow: true,
    },
    {
      vetId: '550e8400-e29b-41d4-a716-446655440102',
      nameEn: 'Dr. Mahbub Rahman',
      nameBn: 'ডাঃ মাহবুব রহমান',
      specialtyEn: 'Feline & Canine Dermatology',
      specialtyBn: 'বিড়াল ও কুকুরের চর্মরোগ',
      clinicName: 'Gulshan Pet Wellness Center',
      feeBdt: 700,
      rating: 4.8,
      availableNow: true,
    },
    {
      vetId: '550e8400-e29b-41d4-a716-446655440103',
      nameEn: 'Dr. Nasrin Sultana',
      nameBn: 'ডাঃ নাসরিন সুলতানা',
      specialtyEn: 'Nutrition & Preventive Care',
      specialtyBn: 'পুষ্টি ও প্রতিরোধমূলক যত্ন',
      clinicName: 'Uttara Vet Care',
      feeBdt: 450,
      rating: 4.7,
      availableNow: false,
    },
  ];
}

export async function createOnlineConsultation(
  _client: TypedSupabaseClient,
  input: CreateOnlineConsultInput,
  options?: {
    vetName?: string;
    petName?: string;
    customerName?: string;
    customerPhone?: string;
    originUrl?: string;
  }
): Promise<OnlineConsultation> {
  const tranId = `ONL-${Date.now()}`;
  const origin = options?.originUrl ?? 'https://pranora.com.bd';
  const gateway = buildGatewayUrl({
    transactionId: tranId,
    amount: input.feeBdt,
    customerName: options?.customerName ?? 'Pet Owner',
    customerPhone: options?.customerPhone ?? '+8801700000000',
    productName: `Online Vet Consultation (${input.callMode})`,
    successUrl: `${origin}/en/checkout/callback`,
    failUrl: `${origin}/en/checkout/callback?status=FAILED`,
    cancelUrl: `${origin}/en/checkout/callback?status=CANCELLED`,
    ipnUrl: `${origin}/api/payments/ipn`,
  });

  return {
    id: `onl-${Date.now()}`,
    vetId: input.vetId,
    vetName: options?.vetName ?? 'Dr. Sumaiya Akter',
    petId: input.petId,
    petName: options?.petName ?? 'মতি (Moti)',
    callMode: input.callMode,
    chiefComplaint: input.chiefComplaint,
    feeBdt: input.feeBdt,
    paymentStatus: 'pending',
    transactionId: tranId,
    checkoutUrl: gateway.GatewayPageURL,
    scheduledAt: input.scheduledAt,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
}

export async function getMyOnlineConsultations(
  _client: TypedSupabaseClient
): Promise<OnlineConsultation[]> {
  return [
    {
      id: 'onl-001',
      vetId: '550e8400-e29b-41d4-a716-446655440101',
      vetName: 'Dr. Sumaiya Akter',
      petId: '550e8400-e29b-41d4-a716-446655440201',
      petName: 'মতি (Moti)',
      callMode: 'video',
      chiefComplaint: 'Loss of appetite and mild lethargy since yesterday.',
      feeBdt: 500,
      paymentStatus: 'paid',
      transactionId: 'ONL-20261125-001',
      scheduledAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      status: 'confirmed',
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
  ];
}
