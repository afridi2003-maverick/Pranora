export type {
  PetTaxiVehicle,
  PetTaxiStatus,
  RequestPetTaxiInput,
} from '@pranora/validation';
import type {
  PetTaxiVehicle,
  PetTaxiStatus,
  RequestPetTaxiInput,
} from '@pranora/validation';
import type { TypedSupabaseClient } from '../client';
import { buildGatewayUrl } from '../payments/sslcommerz';

export interface PetTaxiRide {
  id: string;
  petId: string;
  petName: string;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleType: PetTaxiVehicle;
  needsCrate: boolean;
  roundTrip: boolean;
  scheduledAt: string;
  estimatedFareBdt: number;
  paymentMethod: 'cash' | 'sslcommerz';
  paymentStatus: 'pending' | 'paid';
  status: PetTaxiStatus;
  driverName?: string;
  driverPhone?: string;
  checkoutUrl?: string;
  createdAt: string;
}

export function estimatePetTaxiFare(
  vehicleType: PetTaxiVehicle,
  distanceKm: number,
  roundTrip: boolean,
  needsCrate: boolean
): number {
  const base =
    vehicleType === 'bike_carrier' ? 150 : vehicleType === 'ac_car' ? 350 : 600;
  const perKm =
    vehicleType === 'bike_carrier' ? 25 : vehicleType === 'ac_car' ? 45 : 70;
  const oneWay = Math.round(base + Math.max(1, distanceKm) * perKm);
  const tripFare = roundTrip ? Math.round(oneWay * 1.8) : oneWay;
  return tripFare + (needsCrate ? 80 : 0);
}

export async function requestPetTaxi(
  _client: TypedSupabaseClient,
  input: RequestPetTaxiInput,
  options?: {
    petName?: string;
    customerName?: string;
    customerPhone?: string;
    originUrl?: string;
  }
): Promise<PetTaxiRide> {
  let checkoutUrl: string | undefined;
  if (input.paymentMethod === 'sslcommerz') {
    const origin = options?.originUrl ?? 'https://pranora.com.bd';
    const gateway = buildGatewayUrl({
      transactionId: `TAXI-${Date.now()}`,
      amount: input.estimatedFareBdt,
      customerName: options?.customerName ?? 'Pet Owner',
      customerPhone: options?.customerPhone ?? '+8801700000000',
      productName: `Pranora Pet Taxi (${input.vehicleType})`,
      successUrl: `${origin}/en/checkout/callback`,
      failUrl: `${origin}/en/checkout/callback?status=FAILED`,
      cancelUrl: `${origin}/en/checkout/callback?status=CANCELLED`,
      ipnUrl: `${origin}/api/payments/ipn`,
    });
    checkoutUrl = gateway.GatewayPageURL;
  }

  return {
    id: `taxi-${Date.now()}`,
    petId: input.petId,
    petName: options?.petName ?? 'মতি (Moti)',
    pickupAddress: input.pickupAddress,
    dropoffAddress: input.dropoffAddress,
    vehicleType: input.vehicleType,
    needsCrate: input.needsCrate,
    roundTrip: input.roundTrip,
    scheduledAt: input.scheduledAt,
    estimatedFareBdt: input.estimatedFareBdt,
    paymentMethod: input.paymentMethod,
    paymentStatus: 'pending',
    status: 'requested',
    checkoutUrl,
    createdAt: new Date().toISOString(),
  };
}

export async function getMyPetTaxiRides(
  _client: TypedSupabaseClient
): Promise<PetTaxiRide[]> {
  return [
    {
      id: 'taxi-001',
      petId: '550e8400-e29b-41d4-a716-446655440201',
      petName: 'মতি (Moti)',
      pickupAddress: 'Road 7, Dhanmondi, Dhaka',
      dropoffAddress: 'PranoraCare Veterinary Clinic, Gulshan 2',
      vehicleType: 'ac_car',
      needsCrate: true,
      roundTrip: false,
      scheduledAt: new Date(Date.now() + 7200 * 1000).toISOString(),
      estimatedFareBdt: 750,
      paymentMethod: 'sslcommerz',
      paymentStatus: 'paid',
      status: 'driver_assigned',
      driverName: 'রফিকুল ইসলাম (Rafiqul Islam)',
      driverPhone: '+8801711223344',
      createdAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    },
  ];
}
