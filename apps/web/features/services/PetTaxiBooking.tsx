'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, Input } from '@pranora/ui';
import {
  estimatePetTaxiFare,
  requestPetTaxi,
  getMyPetTaxiRides,
  createSupabaseClient,
  type PetTaxiRide,
  type PetTaxiVehicle,
} from '@pranora/api';

export function PetTaxiBooking() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [pickupAddress, setPickupAddress] = useState('Road 7, Dhanmondi, Dhaka');
  const [dropoffAddress, setDropoffAddress] = useState('PranoraCare Veterinary Clinic, Gulshan 2');
  const [vehicleType, setVehicleType] = useState<PetTaxiVehicle>('ac_car');
  const [needsCrate, setNeedsCrate] = useState(true);
  const [roundTrip, setRoundTrip] = useState(false);
  const [distanceKm, setDistanceKm] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState<'sslcommerz' | 'cash'>('sslcommerz');
  const [rides, setRides] = useState<PetTaxiRide[]>([]);
  const [lastRide, setLastRide] = useState<PetTaxiRide | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estimatedFare = estimatePetTaxiFare(vehicleType, distanceKm, roundTrip, needsCrate);

  useEffect(() => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
    );
    getMyPetTaxiRides(supabase).then(setRides);
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupAddress.trim().length < 4 || dropoffAddress.trim().length < 4) return;
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
      );
      const created = await requestPetTaxi(
        supabase,
        {
          petId: '550e8400-e29b-41d4-a716-446655440201',
          pickupAddress: pickupAddress.trim(),
          dropoffAddress: dropoffAddress.trim(),
          vehicleType,
          needsCrate,
          roundTrip,
          scheduledAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          estimatedFareBdt: estimatedFare,
          paymentMethod,
        },
        {
          originUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
        }
      );
      setLastRide(created);
      setRides((prev) => [created, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isBangla ? 'পেট ট্যাক্সি' : 'Pet Taxi'}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {isBangla
            ? 'ক্লিনিক, গ্রুমিং বা বাসায় নিরাপদ পোষ্য পরিবহন'
            : 'Safe, pet-friendly transport to clinics, groomers, or home'}
        </p>
      </div>

      {lastRide && (
        <Card className="p-4 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 space-y-2">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            {isBangla
              ? `পেট ট্যাক্সি অনুরোধ পাঠানো হয়েছে — আনুমানিক ভাড়া ৳${lastRide.estimatedFareBdt}`
              : `Pet Taxi requested — Estimated fare ৳${lastRide.estimatedFareBdt}`}
          </p>
          {lastRide.checkoutUrl && (
            <a
              href={lastRide.checkoutUrl}
              className="inline-block text-xs font-semibold text-emerald-700 underline"
            >
              {isBangla
                ? 'SSLCommerz দিয়ে পেমেন্ট সম্পন্ন করুন →'
                : 'Complete Payment via SSLCommerz →'}
            </a>
          )}
        </Card>
      )}

      <form onSubmit={handleBook}>
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {isBangla ? 'পিকআপ ঠিকানা' : 'Pickup Address'}
              </label>
              <Input
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {isBangla ? 'গন্তব্যের ঠিকানা / ক্লিনিক' : 'Dropoff Address / Clinic'}
              </label>
              <Input
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {isBangla ? 'গাড়ির ধরন' : 'Vehicle Type'}
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'bike_carrier', en: 'Bike + Carrier', bn: 'বাইক + ক্যারিয়ার' },
                  { id: 'ac_car', en: 'AC Car', bn: 'এসি কার' },
                  { id: 'van', en: 'Pet Van (Multi-pet)', bn: 'পেট ভ্যান' },
                ] as const
              ).map((v) => (
                <Button
                  key={v.id}
                  type="button"
                  variant={vehicleType === v.id ? 'primary' : 'ghost'}
                  onClick={() => setVehicleType(v.id)}
                >
                  {isBangla ? v.bn : v.en}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                {isBangla ? 'আনুমানিক দূরত্ব (কি.মি.)' : 'Approx. Distance (km)'}
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={String(distanceKm)}
                onChange={(e) => setDistanceKm(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={needsCrate}
                onChange={(e) => setNeedsCrate(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              <span>
                {isBangla ? 'পেট ক্যারিয়ার (+৳৮০)' : 'Sanitized Crate (+৳80)'}
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={roundTrip}
                onChange={(e) => setRoundTrip(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              <span>{isBangla ? 'রাউন্ড ট্রিপ' : 'Round Trip'}</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={paymentMethod === 'sslcommerz' ? 'secondary' : 'ghost'}
                onClick={() => setPaymentMethod('sslcommerz')}
              >
                {isBangla ? 'অনলাইন পেমেন্ট' : 'Online Payment'}
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'cash' ? 'secondary' : 'ghost'}
                onClick={() => setPaymentMethod('cash')}
              >
                {isBangla ? 'ক্যাশ' : 'Cash'}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-neutral-500">
                  {isBangla ? 'আনুমানিক ভাড়া' : 'Estimated Fare'}
                </p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  ৳{estimatedFare}
                </p>
              </div>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? isBangla
                    ? 'বুক হচ্ছে...'
                    : 'Booking...'
                  : isBangla
                    ? 'পেট ট্যাক্সি বুক করুন'
                    : 'Book Pet Taxi'}
              </Button>
            </div>
          </div>
        </Card>
      </form>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          {isBangla ? 'আমার পেট ট্যাক্সি রাইডসমূহ' : 'My Pet Taxi Rides'}
        </h2>
        {rides.map((ride) => (
          <Card
            key={ride.id}
            className="p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <p className="font-semibold text-sm text-foreground">
                {ride.pickupAddress} → {ride.dropoffAddress}
              </p>
              <p className="text-xs text-neutral-500">
                {ride.vehicleType.replace('_', ' ')} • ৳{ride.estimatedFareBdt}
                {ride.driverName ? ` • ${ride.driverName}` : ''}
              </p>
            </div>
            <Chip
              variant="status"
              statusType={
                ride.status === 'driver_assigned' || ride.status === 'completed'
                  ? 'confirmed'
                  : 'pending'
              }
              label={ride.status}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
