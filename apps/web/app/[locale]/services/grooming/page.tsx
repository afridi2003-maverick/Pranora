'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Card, Button, Chip } from '@pranora/ui';
import {
  GROOMING_PACKAGES,
  GROOMING_ADDONS,
  calculateGroomingPrice,
  getGroomingSalons,
  submitGroomingBooking,
  type GroomingPackageType,
  type PetSize,
  type GroomingBookingResult,
} from '@pranora/api';

export default function GroomingPage() {
  const router = useRouter();
  const { isBangla, locale } = useLocale();

  // State
  const [salons, setSalons] = useState<any[]>([]);
  const [loadingSalons, setLoadingSalons] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');

  // Form Fields
  const [packageType, setPackageType] = useState<GroomingPackageType>('bath_brush');
  const [petSize, setPetSize] = useState<PetSize>('small');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [petName, setPetName] = useState<string>('');
  const [petSpecies, setPetSpecies] = useState<'dog' | 'cat' | 'rabbit'>('dog');
  const [appointmentDate, setAppointmentDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState<string>('11:30');
  const [phone, setPhone] = useState<string>('+880 17');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'sslcommerz' | 'bkash'>('cash');

  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<GroomingBookingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadingSalons(true);
        const data = await getGroomingSalons(23.7465, 90.3752);
        setSalons(data);
        if (data.length > 0) {
          setSelectedClinicId(data[0].clinicId);
        }
      } catch (err) {
        console.error('Failed to load salons:', err);
      } finally {
        setLoadingSalons(false);
      }
    }
    load();
  }, []);

  const selectedSalon = salons.find((s) => s.clinicId === selectedClinicId) || salons[0];
  const priceInfo = calculateGroomingPrice(packageType, petSize, selectedAddons);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedSalon) {
      setErrorMsg(isBangla ? 'একটি সেলুন বা ক্লিনিক নির্বাচন করুন' : 'Please select a salon');
      return;
    }
    if (!petName.trim()) {
      setErrorMsg(isBangla ? 'পোষা প্রাণীর নাম লিখুন' : 'Please enter pet name');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setErrorMsg(isBangla ? 'সঠিক ফোন নম্বর লিখুন' : 'Please enter valid phone number');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitGroomingBooking({
        clinicId: selectedSalon.clinicId,
        locationId: selectedSalon.locationId,
        petName,
        petSpecies,
        petSize,
        packageType,
        appointmentDate,
        appointmentTime,
        phone,
        specialInstructions,
        addons: selectedAddons,
        paymentMethod,
      });
      setSubmittedBooking(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit grooming booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8 text-center bg-white border border-emerald-200 shadow-md">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✂️
          </div>
          <h2 className="text-2xl font-bold text-content-primary mb-2">
            {isBangla ? 'গ্রুমিং বুকিং নিশ্চিত হয়েছে!' : 'Grooming Appointment Confirmed!'}
          </h2>
          <p className="text-content-secondary mb-6">
            {isBangla
              ? 'সেলুনে আপনার পোষা প্রাণীর জন্য স্লট সংরক্ষিত রাখা হয়েছে।'
              : 'Your grooming slot has been successfully reserved.'}
          </p>

          <div className="bg-surface-secondary rounded-xl p-5 mb-6 text-left space-y-2 border border-border-light text-sm">
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'বুকিং কোড:' : 'Booking Code:'}</span>
              <span className="font-mono font-bold text-emerald-700">{submittedBooking.code}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'প্যাকেজ:' : 'Package:'}</span>
              <span className="font-semibold text-content-primary">{submittedBooking.packageName}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'তারিখ ও সময়:' : 'Date & Time:'}</span>
              <span className="font-semibold text-content-primary">
                {submittedBooking.appointmentDate} at {submittedBooking.appointmentTime}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'পোষা প্রাণী:' : 'Pet:'}</span>
              <span className="font-semibold text-content-primary">{submittedBooking.petName}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold">
              <span className="text-content-primary">{isBangla ? 'মোট প্রদেয়:' : 'Total Amount:'}</span>
              <span className="text-emerald-700">৳ {submittedBooking.totalAmount}</span>
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
              {isBangla ? 'নতুন বুকিং করুন' : 'Book Another Session'}
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
          <span className="text-3xl">✂️</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
            {isBangla ? 'পোষা প্রাণীর গ্রুমিং ও স্পা' : 'Pet Grooming & Spa Booking'}
          </h1>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            SVC-GRM
          </span>
        </div>
        <p className="text-content-secondary">
          {isBangla
            ? 'পেশাদার গ্রুমারদের দিয়ে গোসল, স্টাইলিশ হেয়ারকাট, নখ কাটা ও স্বাস্থ্যকর পরিচর্যা বুক করুন।'
            : 'Book professional grooming, coat styling, medicated baths and nail trimming for your furry friends.'}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Package Selection */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>🧴</span> {isBangla ? '১. গ্রুমিং প্যাকেজ নির্বাচন' : '1. Choose Grooming Package'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GROOMING_PACKAGES.map((pkg) => {
              const isSelected = packageType === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setPackageType(pkg.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-border-light hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-content-primary text-base">
                      {isBangla ? pkg.nameBn : pkg.nameEn}
                    </h3>
                    <span className="font-bold text-emerald-800 text-base">৳ {pkg.basePrice}</span>
                  </div>
                  <p className="text-xs text-content-secondary mb-3">
                    {isBangla ? pkg.descriptionBn : pkg.descriptionEn} (⏱️ {pkg.durationMinutes} min)
                  </p>

                  <div className="space-y-1 pt-2 border-t border-border-light text-xs text-content-secondary">
                    {(isBangla ? pkg.featuresBn : pkg.featuresEn).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Step 2: Pet Size & Addons */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>📏</span> {isBangla ? '২. প্রাণীর আকার ও অতিরিক্ত সেবা (Addons)' : '2. Pet Size & Add-ons'}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-content-secondary mb-2">
              {isBangla ? 'প্রাণীর ওজন / আকার *' : 'Pet Weight / Size Category *'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'small', labelBn: 'ছোট (Small < 5kg)', labelEn: 'Small (<5kg)', surcharge: '+৳0' },
                { id: 'medium', labelBn: 'মাঝারি (5-15kg)', labelEn: 'Medium (5-15kg)', surcharge: '+৳200' },
                { id: 'large', labelBn: 'বড় (Large > 15kg)', labelEn: 'Large (>15kg)', surcharge: '+৳400' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setPetSize(s.id as any)}
                  className={`py-2.5 px-3 rounded-xl border text-center transition ${
                    petSize === s.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-border-light text-content-secondary hover:bg-surface-secondary'
                  }`}
                >
                  <div className="text-xs font-semibold">{isBangla ? s.labelBn : s.labelEn}</div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">{s.surcharge}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-content-secondary mb-2">
              {isBangla ? 'অতিরিক্ত সেবা (Add-ons)' : 'Optional Add-ons'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {GROOMING_ADDONS.map((addon) => {
                const checked = selectedAddons.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      checked ? 'border-emerald-600 bg-emerald-50/60 font-semibold' : 'border-border-light'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAddon(addon.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <div>{isBangla ? addon.nameBn : addon.nameEn}</div>
                      <div className="text-emerald-700 font-bold">+৳ {addon.price}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Step 3: Salon & Pet Info */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>🐾</span> {isBangla ? '৩. সেলুন ও প্রাণীর তথ্য' : '3. Salon & Pet Information'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'গ্রুমিং সেলুন / ক্লিনিক *' : 'Grooming Salon / Clinic *'}
              </label>
              <select
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
              >
                {salons.map((s) => (
                  <option key={s.clinicId} value={s.clinicId}>
                    {isBangla ? s.nameBn : s.nameEn} (★ {s.ratingAvg})
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
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g. Tommy / টমি"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'তারিখ *' : 'Appointment Date *'}
              </label>
              <input
                type="date"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'সময় স্লট *' : 'Time Slot *'}
              </label>
              <select
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              >
                {['10:00', '11:30', '14:00', '16:00', '18:00'].map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} ({Number(slot.split(':')[0]) < 12 ? 'AM' : 'PM'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Step 4: Contact & Price Summary */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>💳</span> {isBangla ? '৪. যোগাযোগ ও মূল্য বিবরণী' : '4. Contact & Pricing Summary'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'মোবাইল নম্বর *' : 'Phone Number *'}
              </label>
              <input
                type="tel"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1712-345678"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'পেমেন্ট মাধ্যম *' : 'Payment Method *'}
              </label>
              <select
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              >
                <option value="cash">{isBangla ? 'ক্যাশ অন সার্ভিস (সেলুনে সরাসরি)' : 'Cash at Salon'}</option>
                <option value="sslcommerz">{isBangla ? 'অনলাইন পেমেন্ট (SSLCommerz)' : 'Online Payment'}</option>
                <option value="bkash">{isBangla ? 'বিকাশ / নগদ' : 'bKash / Nagad'}</option>
              </select>
            </div>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-content-secondary">{isBangla ? 'প্যাকেজের মূল মূল্য:' : 'Package Base Price:'}</span>
              <span className="font-semibold text-content-primary">৳ {priceInfo.basePrice}</span>
            </div>
            {priceInfo.sizeSurcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-content-secondary">{isBangla ? 'আকার অতিরিক্ত চার্জ:' : 'Size Surcharge:'}</span>
                <span className="font-semibold text-content-primary">৳ {priceInfo.sizeSurcharge}</span>
              </div>
            )}
            {priceInfo.addonsTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-content-secondary">{isBangla ? 'অতিরিক্ত সেবা (Addons):' : 'Addons Total:'}</span>
                <span className="font-semibold text-content-primary">৳ {priceInfo.addonsTotal}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-emerald-200 font-bold text-base">
              <span className="text-emerald-950">{isBangla ? 'সর্বমোট ফি:' : 'Total Payable:'}</span>
              <span className="text-emerald-800">৳ {priceInfo.totalAmount}</span>
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
              ? (isBangla ? 'বুকিং হচ্ছে...' : 'Booking...')
              : (isBangla ? 'গ্রুমিং অ্যাপয়েন্টমেন্ট বুক করুন' : 'Confirm Grooming Appointment')}
          </Button>
        </div>
      </form>
    </div>
  );
}
