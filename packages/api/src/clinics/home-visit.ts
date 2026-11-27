import type { TypedSupabaseClient } from '../client';
import { getAllMockClinics } from './mock.ts';

export type HomeVisitTimeSlot = 'morning' | 'afternoon' | 'evening';

export interface HomeVisitRequest {
  clinicId: string;
  locationId: string;
  petId?: string;
  petName: string;
  petSpecies: 'dog' | 'cat' | 'bird' | 'rabbit' | 'livestock' | 'other';
  visitDate: string; // YYYY-MM-DD
  timeSlot: HomeVisitTimeSlot;
  address: string;
  lat: number;
  lng: number;
  symptoms: string;
  phone: string;
  emergencyNotes?: string;
  paymentMethod: 'cash' | 'sslcommerz' | 'bkash';
}

export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateHomeVisitFee(baseFee: number, distanceKm: number, maxRadiusKm: number = 10) {
  const isWithinRadius = distanceKm <= maxRadiusKm;
  // Base consultation fee + travel allowance (50 BDT/km, minimum 150 BDT)
  const travelFee = Math.max(150, Math.round(distanceKm * 50));
  const totalFee = baseFee + travelFee;
  return {
    baseFee,
    travelFee,
    totalFee,
    isWithinRadius,
    distanceKm: Math.round(distanceKm * 10) / 10,
    maxRadiusKm,
  };
}

export function validateHomeVisitRequest(req: Partial<HomeVisitRequest>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!req.clinicId) errors.push('Clinic is required');
  if (!req.locationId) errors.push('Location is required');
  if (!req.petName || req.petName.trim().length === 0) errors.push('Pet name is required');
  if (!req.visitDate || !/^\d{4}-\d{2}-\d{2}$/.test(req.visitDate)) errors.push('Valid visit date (YYYY-MM-DD) is required');
  if (!req.timeSlot || !['morning', 'afternoon', 'evening'].includes(req.timeSlot)) errors.push('Valid time slot is required');
  if (!req.address || req.address.trim().length < 5) errors.push('Address must be at least 5 characters');
  if (!req.phone || req.phone.trim().length < 8) errors.push('Valid phone number is required');
  if (!req.symptoms || req.symptoms.trim().length < 3) errors.push('Symptoms description must be at least 3 characters');
  return { valid: errors.length === 0, errors };
}

export interface HomeVisitProviderOption {
  clinicId: string;
  locationId: string;
  nameBn: string;
  nameEn: string;
  phone: string;
  addressBn: string;
  addressEn: string;
  lat: number;
  lng: number;
  distanceKm: number;
  homeVisitRadiusKm: number;
  isWithinRadius: boolean;
  baseFee: number;
  travelFee: number;
  totalFee: number;
  ratingAvg: number;
  ratingCount: number;
  slots: Array<{ id: HomeVisitTimeSlot; labelBn: string; labelEn: string; time: string }>;
}

export interface HomeVisitBookingResult {
  bookingId: string;
  code: string;
  clinicId: string;
  petName: string;
  visitDate: string;
  timeSlot: string;
  address: string;
  totalFee: number;
  status: 'pending' | 'confirmed';
  paymentMethod: string;
  createdAt: string;
}

export const MOCK_HOME_VISIT_BOOKINGS: HomeVisitBookingResult[] = [];

/**
 * Retrieves clinics that offer home vet visits within or around the user location
 */
export async function getHomeVisitClinics(
  userLat: number,
  userLng: number,
  client?: TypedSupabaseClient | null
): Promise<HomeVisitProviderOption[]> {
  const allClinics = getAllMockClinics();
  const homeVisitClinics = allClinics.filter((c) => c.location.offersHomeVisit);

  const results: HomeVisitProviderOption[] = homeVisitClinics.map((c) => {
    const distM = calculateDistanceMeters(userLat, userLng, c.location.lat, c.location.lng);
    const distKm = Math.round((distM / 1000) * 10) / 10;
    const maxRadius = c.location.homeVisitRadiusKm ?? 10.0;
    const baseFee = c.services.find((s) => s.serviceSlug === 'home_vet_visit')?.price ?? 600;
    const feeCalculation = calculateHomeVisitFee(baseFee, distKm, maxRadius);

    return {
      clinicId: c.provider.id,
      locationId: c.location.id,
      nameBn: c.provider.nameBn ?? c.provider.nameEn ?? '',
      nameEn: c.provider.nameEn ?? '',
      phone: c.location.phone ?? '+8801700000000',
      addressBn: c.location.addressBn ?? c.location.addressEn ?? '',
      addressEn: c.location.addressEn ?? '',
      lat: c.location.lat,
      lng: c.location.lng,
      distanceKm: distKm,
      homeVisitRadiusKm: maxRadius,
      isWithinRadius: feeCalculation.isWithinRadius,
      baseFee,
      travelFee: feeCalculation.travelFee,
      totalFee: feeCalculation.totalFee,
      ratingAvg: c.provider.ratingAvg,
      ratingCount: c.provider.ratingCount,
      slots: [
        { id: 'morning', labelBn: 'সকাল ১০টা – দুপুর ১টা', labelEn: 'Morning (10:00 AM – 1:00 PM)', time: '10:00' },
        { id: 'afternoon', labelBn: 'দুপুর ২টা – বিকাল ৫টা', labelEn: 'Afternoon (2:00 PM – 5:00 PM)', time: '14:00' },
        { id: 'evening', labelBn: 'সন্ধ্যা ৬টা – রাত ৯টা', labelEn: 'Evening (6:00 PM – 9:00 PM)', time: '18:00' },
      ],
    };
  });

  // Sort ascending: clinics within coverage radius first, then by distance
  return results.sort((a, b) => {
    if (a.isWithinRadius && !b.isWithinRadius) return -1;
    if (!a.isWithinRadius && b.isWithinRadius) return 1;
    return a.distanceKm - b.distanceKm;
  });
}

/**
 * Submits a home visit request
 */
export async function submitHomeVisitRequest(
  request: HomeVisitRequest,
  client?: TypedSupabaseClient | null
): Promise<HomeVisitBookingResult> {
  const validation = validateHomeVisitRequest(request);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const code = `PR-HV-${Date.now().toString().slice(-6)}`;
  const bookingId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `hv-${Date.now()}`;

  // Estimate fee
  const allClinics = getAllMockClinics();
  const clinic = allClinics.find((c) => c.location.id === request.locationId || c.provider.id === request.clinicId);
  const baseFee = clinic?.services.find((s) => s.serviceSlug === 'home_vet_visit')?.price ?? 600;
  const distM = clinic ? calculateDistanceMeters(request.lat, request.lng, clinic.location.lat, clinic.location.lng) : 3000;
  const distKm = distM / 1000;
  const feeInfo = calculateHomeVisitFee(baseFee, distKm, clinic?.location.homeVisitRadiusKm ?? 10);

  const result: HomeVisitBookingResult = {
    bookingId,
    code,
    clinicId: request.clinicId,
    petName: request.petName,
    visitDate: request.visitDate,
    timeSlot: request.timeSlot,
    address: request.address,
    totalFee: feeInfo.totalFee,
    status: 'pending',
    paymentMethod: request.paymentMethod,
    createdAt: new Date().toISOString(),
  };

  if (client) {
    try {
      const { data, error } = await (client as any).from('bookings').insert({
        id: bookingId,
        code,
        location_id: request.locationId,
        booking_type: 'home_visit',
        status: 'pending',
        problem_note: request.symptoms,
        payment_method: request.paymentMethod,
        starts_at: `${request.visitDate}T${request.timeSlot === 'morning' ? '10:00:00' : request.timeSlot === 'afternoon' ? '14:00:00' : '18:00:00'}Z`,
      }).select().single();

      if (!error && data) {
        result.bookingId = data.id;
        result.code = data.code || code;
      }
    } catch {
      // Fall through to in-memory result
    }
  }

  MOCK_HOME_VISIT_BOOKINGS.unshift(result);
  return result;
}
