'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Card, Button, Chip } from '@pranora/ui';
import {
  BOARDING_ROOM_TYPES,
  calculateBoardingCost,
  getBoardingHostels,
  submitBoardingBooking,
  type BoardingRoomType,
  type BoardingBookingResult,
} from '@pranora/api';

export default function BoardingPage() {
  const router = useRouter();
  const { isBangla, locale } = useLocale();

  // State
  const [hostels, setHostels] = useState<any[]>([]);
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');

  // Form Fields
  const [roomType, setRoomType] = useState<BoardingRoomType>('deluxe_ac');
  const [petName, setPetName] = useState<string>('');
  const [petSpecies, setPetSpecies] = useState<'dog' | 'cat' | 'rabbit' | 'other'>('dog');

  const [checkInDate, setCheckInDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4); // 3 nights
    return d.toISOString().split('T')[0];
  });

  const [vaccinationUpToDate, setVaccinationUpToDate] = useState<boolean>(true);
  const [dietaryInstructions, setDietaryInstructions] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('+880 17');
  const [phone, setPhone] = useState<string>('+880 17');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'sslcommerz' | 'bkash'>('cash');

  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<BoardingBookingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadingHostels(true);
        const data = await getBoardingHostels(23.7465, 90.3752);
        setHostels(data);
        if (data.length > 0) {
          setSelectedClinicId(data[0].clinicId);
        }
      } catch (err) {
        console.error('Failed to load boarding hostels:', err);
      } finally {
        setLoadingHostels(false);
      }
    }
    load();
  }, []);

  const selectedHostel = hostels.find((h) => h.clinicId === selectedClinicId) || hostels[0];
  const cost = calculateBoardingCost(checkInDate, checkOutDate, roomType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedHostel) {
      setErrorMsg(isBangla ? 'একটি বোর্ডিং হোস্টেল নির্বাচন করুন' : 'Select a boarding hostel');
      return;
    }
    if (!petName.trim()) {
      setErrorMsg(isBangla ? 'পোষা প্রাণীর নাম লিখুন' : 'Enter pet name');
      return;
    }
    if (!vaccinationUpToDate) {
      setErrorMsg(
        isBangla
          ? 'হোস্টেলে থাকার জন্য ভ্যাকসিন দেওয়া থাকা বাধ্যতামূলক।'
          : 'Vaccination is strictly mandatory for pet boarding safety.'
      );
      return;
    }
    if (!emergencyContact.trim() || emergencyContact.length < 8) {
      setErrorMsg(isBangla ? 'জরুরি যোগাযোগের ফোন নম্বর লিখুন' : 'Enter emergency contact phone');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitBoardingBooking({
        clinicId: selectedHostel.clinicId,
        locationId: selectedHostel.locationId,
        petName,
        petSpecies,
        checkInDate,
        checkOutDate,
        roomType,
        vaccinationUpToDate,
        dietaryInstructions,
        emergencyContact,
        phone,
        paymentMethod,
      });
      setSubmittedBooking(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit boarding reservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8 text-center bg-white border border-amber-200 shadow-md">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            🏨
          </div>
          <h2 className="text-2xl font-bold text-content-primary mb-2">
            {isBangla ? 'বোর্ডিং বুকিং সংরক্ষিত হয়েছে!' : 'Boarding Reservation Confirmed!'}
          </h2>
          <p className="text-content-secondary mb-6">
            {isBangla
              ? 'হোস্টেল কতৃপক্ষ শীঘ্রই যোগাযোগ করে ড্রপ-অফ সময় নিশ্চিত করবে।'
              : 'Hostel team will contact you shortly to coordinate drop-off.'}
          </p>

          <div className="bg-surface-secondary rounded-xl p-5 mb-6 text-left space-y-2 border border-border-light text-sm">
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'বুকিং কোড:' : 'Booking Code:'}</span>
              <span className="font-mono font-bold text-amber-800">{submittedBooking.code}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'কক্ষ / রুম:' : 'Room Tier:'}</span>
              <span className="font-semibold text-content-primary">{submittedBooking.roomName}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'তারিখ পরিসীমা:' : 'Date Range:'}</span>
              <span className="font-semibold text-content-primary">
                {submittedBooking.checkInDate} → {submittedBooking.checkOutDate} ({submittedBooking.nights} {isBangla ? 'রাত' : 'nights'})
              </span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'পোষা প্রাণী:' : 'Pet:'}</span>
              <span className="font-semibold text-content-primary">{submittedBooking.petName}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold">
              <span className="text-content-primary">{isBangla ? 'মোট প্রদেয় বিল:' : 'Total Bill:'}</span>
              <span className="text-amber-800">৳ {submittedBooking.totalAmount}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => router.push(`/${locale}/services`)}>
              {isBangla ? 'অন্যান্য সেবা দেখুন' : 'Browse Services'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmittedBooking(null);
                setPetName('');
              }}
            >
              {isBangla ? 'নতুন বুকিং করুন' : 'Make Another Reservation'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🏨</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
            {isBangla ? 'পোষা প্রাণীর বোর্ডিং ও ডে-কেয়ার' : 'Pet Boarding & Hostel Reservation'}
          </h1>
          <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            SVC-BRD
          </span>
        </div>
        <p className="text-content-secondary">
          {isBangla
            ? 'ভ্রমণে যাওয়ার সময় আপনার প্রিয় পোষা প্রাণীর নিরাপদ আবাসন, সার্বক্ষণিক পরিচর্যা ও পুষ্টিকর খাবার।'
            : 'Safe, hygienic pet boarding with 24/7 care, nutritious diet, playtime and video updates while you travel.'}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Room Selection */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>🛏️</span> {isBangla ? '১. রুমের ধরন নির্বাচন' : '1. Select Room Tier'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BOARDING_ROOM_TYPES.map((room) => {
              const isSelected = roomType === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setRoomType(room.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                      : 'border-border-light hover:border-amber-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-content-primary text-base">
                      {isBangla ? room.nameBn : room.nameEn}
                    </h3>
                  </div>
                  <div className="font-bold text-amber-800 text-sm mb-2">
                    ৳ {room.nightlyRate} <span className="text-xs text-content-secondary font-normal">{isBangla ? '/ প্রতি রাত' : '/ night'}</span>
                  </div>
                  <p className="text-xs text-content-secondary mb-3">
                    {isBangla ? room.descriptionBn : room.descriptionEn}
                  </p>

                  <div className="space-y-1 pt-2 border-t border-border-light text-xs text-content-secondary">
                    {(isBangla ? room.featuresBn : room.featuresEn).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-amber-600 font-bold">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Step 2: Date Range */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>📅</span> {isBangla ? '২. থাকার সময়সীমা (তারিখ পরিসীমা)' : '2. Boarding Date Range'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'চেক-ইন তারিখ (শুরু) *' : 'Check-in Date *'}
              </label>
              <input
                type="date"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'চেক-আউট তারিখ (শেষ) *' : 'Check-out Date *'}
              </label>
              <input
                type="date"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bg-surface-secondary p-3 rounded-lg text-xs font-semibold text-content-primary flex items-center justify-between">
            <span>{isBangla ? 'মোট অবস্থানের মেয়াদ:' : 'Total Duration:'}</span>
            <span className="text-amber-800 text-sm font-bold">
              {cost.nights} {isBangla ? 'রাত' : 'Nights'}
            </span>
          </div>
        </Card>

        {/* Step 3: Pet Info & Vaccination Guarantee */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>🐾</span> {isBangla ? '৩. প্রাণীর তথ্য ও স্বাস্থ্য সুরক্ষা' : '3. Pet Info & Health Security'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'বোর্ডিং হোস্টেল *' : 'Boarding Facility *'}
              </label>
              <select
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
              >
                {hostels.map((h) => (
                  <option key={h.clinicId} value={h.clinicId}>
                    {isBangla ? h.nameBn : h.nameEn} (★ {h.ratingAvg})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'প্রাণীর নাম *' : 'Pet Name *'}
              </label>
              <input
                type="text"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g. Rocky / রকি"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-content-secondary mb-1">
              {isBangla ? 'খাবার ও বিশেষ নির্দেশনা (ঐচ্ছিক)' : 'Dietary & Care Instructions (Optional)'}
            </label>
            <textarea
              rows={2}
              className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={dietaryInstructions}
              onChange={(e) => setDietaryInstructions(e.target.value)}
              placeholder={isBangla ? 'যেমন: দিনে ২ বার সেদ্ধ মুরগি ও ভাত, অন্যান্য প্রাণীর সাথে একা থাকতে পছন্দ করে...' : 'e.g. Boiled chicken twice daily, friendly with other pets...'}
            />
          </div>

          {/* Mandatory Vaccine Checkbox */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={vaccinationUpToDate}
                onChange={(e) => setVaccinationUpToDate(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-emerald-950 font-medium">
                {isBangla
                  ? 'আমি নিশ্চিত করছি যে আমার পোষা প্রাণীর রেবিস ও প্রয়োজনীয় সকল নিয়মিত টিকা দেওয়া আছে। (বোর্ডিং হোস্টেলের নিরাপত্তার জন্য বাধ্যতামূলক)'
                  : 'I verify that my pet has received all mandatory core vaccines including Rabies. (Mandatory for boarding admission)'}
              </span>
            </label>
          </div>
        </Card>

        {/* Step 4: Emergency Contact & Payment */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>💳</span> {isBangla ? '৪. জরুরি যোগাযোগ ও বিল' : '4. Emergency Contact & Bill'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'আপনার ফোন নম্বর *' : 'Your Phone Number *'}
              </label>
              <input
                type="tel"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1712-345678"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'জরুরি বিকল্প যোগাযোগ নম্বর *' : 'Emergency Alternative Contact *'}
              </label>
              <input
                type="tel"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+880 1812-345678"
                required
              />
            </div>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-content-secondary">
                {isBangla ? `রুম ভাড়া (${cost.nights} রাত × ৳${cost.nightlyRate}):` : `Room (${cost.nights} nights × ৳${cost.nightlyRate}):`}
              </span>
              <span className="font-semibold text-content-primary">৳ {cost.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-secondary">
                {isBangla ? `খাবার ও যত্ন ভাতা (${cost.nights} রাত × ৳১৫০):` : `Food & Care (${cost.nights} nights × ৳150):`}
              </span>
              <span className="font-semibold text-content-primary">৳ {cost.foodAndCareFee}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-amber-200 font-bold text-base">
              <span className="text-amber-950">{isBangla ? 'সর্বমোট প্রদেয়:' : 'Total Payable:'}</span>
              <span className="text-amber-800">৳ {cost.totalAmount}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting
              ? (isBangla ? 'সংরক্ষণ করা হচ্ছে...' : 'Reserving...')
              : (isBangla ? 'বোর্ডিং বুকিং নিশ্চিত করুন' : 'Confirm Boarding Reservation')}
          </Button>
        </div>
      </form>
    </div>
  );
}
