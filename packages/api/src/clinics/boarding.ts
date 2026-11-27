import type { TypedSupabaseClient } from '../client';
import { getAllMockClinics } from './mock.ts';

export type BoardingRoomType = 'standard_kennel' | 'deluxe_ac' | 'vip_suite';

export interface BoardingRoomOption {
  id: BoardingRoomType;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  nightlyRate: number;
  featuresBn: string[];
  featuresEn: string[];
}

export const BOARDING_ROOM_TYPES: BoardingRoomOption[] = [
  {
    id: 'standard_kennel',
    nameBn: 'স্ট্যান্ডার্ড কেবিন',
    nameEn: 'Standard Kennel',
    descriptionBn: 'পরিচ্ছন্ন ও আরামদায়ক ব্যক্তিগত খাঁচা, প্রতিদিন ২ বার হাঁটা ও খাবার।',
    descriptionEn: 'Clean, secure private kennel with twice-daily walking and feeding.',
    nightlyRate: 600,
    featuresBn: ['ব্যক্তিগত কেবিন', 'দৈনিক ২ বার পুষ্টিকর খাবার', 'মেডিকেল মনিটরিং', 'নিয়মিত খেলার সময়'],
    featuresEn: ['Private kennel box', '2x meals daily', 'Daily health monitoring', 'Exercise play time'],
  },
  {
    id: 'deluxe_ac',
    nameBn: 'ডিলাক্স এসি রুম',
    nameEn: 'Deluxe AC Room',
    descriptionBn: 'তাপমাত্রা নিয়ন্ত্রিত শীতাতপ নিয়ন্ত্রিত কক্ষ, নরম গদি ও খেলনা।',
    descriptionEn: 'Climate-controlled AC room with plush bedding and toys.',
    nightlyRate: 1000,
    featuresBn: ['সম্পূর্ণ এসি কেবিন', 'আরামদায়ক অর্থোপেডিক বিছানা', '৩ বার খাবার ও ট্রিটস', 'হোয়াটসঅ্যাপে দৈনিক ছবি/ভিডিও'],
    featuresEn: ['Full AC room', 'Plush orthopedic bed', '3x meals & treats', 'Daily photo/video WhatsApp update'],
  },
  {
    id: 'vip_suite',
    nameBn: 'ভিআইপি স্যুট (লাইভ সিসিটিভি)',
    nameEn: 'VIP Suite (Live Webcam)',
    descriptionBn: 'লাইভ সিসিটিভি ক্যামেরা এক্সেস, সার্বক্ষণিক তত্ত্বাবধায়ক ও ব্যক্তিগত খেলার মাঠ।',
    descriptionEn: '24/7 live web camera feed, dedicated caregiver, and private play lawn.',
    nightlyRate: 1500,
    featuresBn: ['লাইভ ওয়েবক্যাম এক্সেস', 'ব্যক্তিগত কেয়ারটেকার', 'কাস্টম ডায়েট মিলস', 'দৈনিক গ্রুমিং ও ম্যাসাজ'],
    featuresEn: ['24/7 live webcam access', 'Dedicated handler', 'Custom home-cooked diet', 'Complimentary daily brushing'],
  },
];

export function calculateBoardingCost(
  checkInDate: string,
  checkOutDate: string,
  roomTypeId: BoardingRoomType
) {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const room = BOARDING_ROOM_TYPES.find((r) => r.id === roomTypeId) || BOARDING_ROOM_TYPES[0];
  const nightlyRate = room.nightlyRate;
  const subtotal = nights * nightlyRate;
  const foodAndCareFee = nights * 150; // 150 BDT / night food & care
  const totalAmount = subtotal + foodAndCareFee;

  return {
    nights,
    nightlyRate,
    subtotal,
    foodAndCareFee,
    totalAmount,
  };
}

export interface BoardingBookingInput {
  clinicId: string;
  locationId: string;
  petName: string;
  petSpecies: 'dog' | 'cat' | 'rabbit' | 'other';
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  roomType: BoardingRoomType;
  vaccinationUpToDate: boolean;
  dietaryInstructions?: string;
  emergencyContact: string;
  phone: string;
  paymentMethod?: 'cash' | 'sslcommerz' | 'bkash';
}

export interface BoardingBookingResult {
  bookingId: string;
  code: string;
  petName: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalAmount: number;
  status: 'pending' | 'confirmed';
  paymentMethod: string;
  createdAt: string;
}

export const MOCK_BOARDING_BOOKINGS: BoardingBookingResult[] = [];

/**
 * Retrieves boarding facilities and hostels
 */
export async function getBoardingHostels(userLat: number, userLng: number) {
  const allClinics = getAllMockClinics();
  // Filter private clinics and specialized hospitals
  return allClinics
    .filter((c) => !c.provider.isGovernment)
    .map((c) => ({
      clinicId: c.provider.id,
      locationId: c.location.id,
      nameBn: c.provider.nameBn ?? c.provider.nameEn ?? '',
      nameEn: c.provider.nameEn ?? '',
      addressBn: c.location.addressBn ?? c.location.addressEn ?? '',
      addressEn: c.location.addressEn ?? '',
      phone: c.location.phone ?? '+8801700000000',
      ratingAvg: c.provider.ratingAvg,
      ratingCount: c.provider.ratingCount,
      roomTypes: BOARDING_ROOM_TYPES.map((r) => ({
        roomType: r.id,
        pricePerNight: r.nightlyRate,
      })),
    }));
}

/**
 * Submits pet boarding reservation
 */
export async function submitBoardingBooking(
  input: BoardingBookingInput,
  client?: TypedSupabaseClient | null
): Promise<BoardingBookingResult> {
  if (!input.petName || input.petName.trim().length === 0) {
    throw new Error('Pet name is required');
  }
  if (!input.checkInDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.checkInDate)) {
    throw new Error('Valid check-in date is required');
  }
  if (!input.checkOutDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.checkOutDate)) {
    throw new Error('Valid check-out date is required');
  }
  if (!input.vaccinationUpToDate) {
    throw new Error('Pets must be vaccinated to stay in the boarding facility');
  }
  if (!input.emergencyContact || input.emergencyContact.trim().length < 8) {
    throw new Error('Emergency contact phone is required');
  }

  const cost = calculateBoardingCost(input.checkInDate, input.checkOutDate, input.roomType);
  const room = BOARDING_ROOM_TYPES.find((r) => r.id === input.roomType) || BOARDING_ROOM_TYPES[0];
  const code = `PR-BRD-${Date.now().toString().slice(-6)}`;
  const bookingId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `brd-${Date.now()}`;

  const result: BoardingBookingResult = {
    bookingId,
    code,
    petName: input.petName,
    roomName: room.nameEn,
    checkInDate: input.checkInDate,
    checkOutDate: input.checkOutDate,
    nights: cost.nights,
    totalAmount: cost.totalAmount,
    status: 'pending',
    paymentMethod: input.paymentMethod || 'cash',
    createdAt: new Date().toISOString(),
  };

  if (client) {
    try {
      const { data, error } = await (client as any).from('bookings').insert({
        id: bookingId,
        code,
        location_id: input.locationId,
        booking_type: 'date_range',
        status: 'pending',
        problem_note: `Boarding: ${room.nameEn}. Nights: ${cost.nights}. Diet: ${input.dietaryInstructions ?? 'Standard'}`,
        payment_method: input.paymentMethod || 'cash',
        starts_at: `${input.checkInDate}T12:00:00Z`,
        ends_at: `${input.checkOutDate}T12:00:00Z`,
      }).select().single();

      if (!error && data) {
        result.bookingId = data.id;
        result.code = data.code || code;
      }
    } catch {
      // Fall through to in-memory record
    }
  }

  MOCK_BOARDING_BOOKINGS.unshift(result);
  return result;
}
