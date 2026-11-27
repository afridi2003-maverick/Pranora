'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Card, Button, Chip } from '@pranora/ui';
import {
  getHomeVisitClinics,
  submitHomeVisitRequest,
  type HomeVisitProviderOption,
  type HomeVisitBookingResult,
  calculateHomeVisitFee,
} from '@pranora/api';

export default function HomeVisitPage() {
  const router = useRouter();
  const { isBangla, locale } = useLocale();

  // State
  const [clinics, setClinics] = useState<HomeVisitProviderOption[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [address, setAddress] = useState<string>('House 14, Road 7, Dhanmondi, Dhaka');
  const [lat] = useState<number>(23.7465);
  const [lng] = useState<number>(90.3752);

  // Form Fields
  const [petName, setPetName] = useState<string>('');
  const [petSpecies, setPetSpecies] = useState<'dog' | 'cat' | 'bird' | 'rabbit' | 'livestock'>('dog');
  const [visitDate, setVisitDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [symptoms, setSymptoms] = useState<string>('');
  const [phone, setPhone] = useState<string>('+880 17');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'sslcommerz' | 'bkash'>('cash');

  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<HomeVisitBookingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadingClinics(true);
        const data = await getHomeVisitClinics(lat, lng);
        setClinics(data);
        if (data.length > 0) {
          setSelectedClinicId(data[0].clinicId);
        }
      } catch (err) {
        console.error('Failed to load home visit clinics:', err);
      } finally {
        setLoadingClinics(false);
      }
    }
    load();
  }, [lat, lng]);

  const selectedClinic = clinics.find((c) => c.clinicId === selectedClinicId) || clinics[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedClinic) {
      setErrorMsg(isBangla ? 'অনুগ্রহ করে একটি ক্লিনিক নির্বাচন করুন' : 'Please select a clinic');
      return;
    }
    if (!petName.trim()) {
      setErrorMsg(isBangla ? 'পোষা প্রাণীর নাম লিখুন' : 'Please enter pet name');
      return;
    }
    if (!address.trim() || address.length < 5) {
      setErrorMsg(isBangla ? 'সঠিক ও বিস্তারিত ঠিকানা লিখুন' : 'Please enter a valid detailed address');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setErrorMsg(isBangla ? 'যোগাযোগের মোবাইল নম্বর লিখুন' : 'Please enter a valid phone number');
      return;
    }
    if (!symptoms.trim() || symptoms.length < 3) {
      setErrorMsg(isBangla ? 'সমস্যা বা লক্ষণ উল্লেখ করুন' : 'Please describe symptoms or reason for visit');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitHomeVisitRequest({
        clinicId: selectedClinic.clinicId,
        locationId: selectedClinic.locationId,
        petName,
        petSpecies,
        visitDate,
        timeSlot,
        address,
        lat,
        lng,
        symptoms,
        phone,
        paymentMethod,
      });
      setSubmittedBooking(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit home visit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="p-8 text-center bg-white border border-primary-200 shadow-md">
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-content-primary mb-2">
            {isBangla ? 'হোম ভিজিট অনুরোধ সফল হয়েছে!' : 'Home Visit Request Submitted!'}
          </h2>
          <p className="text-content-secondary mb-6">
            {isBangla
              ? 'ক্লিনিক শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করে সময় নিশ্চিত করবে।'
              : 'The clinic will contact you shortly via phone to confirm doctor dispatch.'}
          </p>

          <div className="bg-surface-secondary rounded-lg p-5 mb-6 text-left space-y-2 border border-border-light">
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'ট্র্যাকিং কোড:' : 'Tracking Code:'}</span>
              <span className="font-mono font-bold text-primary-700">{submittedBooking.code}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'প্রাণীর নাম:' : 'Pet Name:'}</span>
              <span className="font-semibold text-content-primary">{submittedBooking.petName}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'ভিজিটের তারিখ:' : 'Visit Date:'}</span>
              <span className="font-semibold text-content-primary">{submittedBooking.visitDate}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'সময়:' : 'Time Slot:'}</span>
              <span className="font-semibold text-content-primary">
                {submittedBooking.timeSlot === 'morning'
                  ? (isBangla ? 'সকাল ১০টা – দুপুর ১টা' : 'Morning (10am–1pm)')
                  : submittedBooking.timeSlot === 'afternoon'
                  ? (isBangla ? 'দুপুর ২টা – বিকাল ৫টা' : 'Afternoon (2pm–5pm)')
                  : (isBangla ? 'সন্ধ্যা ৬টা – রাত ৯টা' : 'Evening (6pm–9pm)')}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border-light">
              <span className="text-content-secondary">{isBangla ? 'ঠিকানা:' : 'Address:'}</span>
              <span className="font-semibold text-content-primary">{submittedBooking.address}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-content-secondary font-bold">{isBangla ? 'মোট আনুমানিক ফি:' : 'Total Estimated Fee:'}</span>
              <span className="font-bold text-primary-800 text-lg">৳ {submittedBooking.totalFee}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => router.push(`/${locale}/services`)}
            >
              {isBangla ? 'অন্যান্য সেবা দেখুন' : 'Browse Services'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmittedBooking(null);
                setPetName('');
                setSymptoms('');
              }}
            >
              {isBangla ? 'নতুন অনুরোধ করুন' : 'Submit Another Request'}
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
          <span className="text-3xl">🏡</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
            {isBangla ? 'বাসায় ডাক্তার (হোম ভিজিট)' : 'Home Vet Visit Request'}
          </h1>
          <span className="bg-primary-100 text-primary-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            SVC-HOME
          </span>
        </div>
        <p className="text-content-secondary">
          {isBangla
            ? 'ক্লিনিকে না গিয়ে অভিজ্ঞ ভেটেরিনারি ডাক্তারকে আপনার বাসায় ডাকুন। বিশ্বস্ত চিকিৎসা সেবা।'
            : 'Request a licensed veterinary doctor to visit your home. Professional healthcare at your doorstep.'}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Address & Location Check */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>📍</span> {isBangla ? '১. আপনার ঠিকানা ও কভারেজ এলাকা' : '1. Your Address & Coverage'}
          </h2>
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              {isBangla ? 'বিস্তারিত ঠিকানা (বাড়ি, রোড, এলাকা)' : 'Detailed Address (House, Road, Area)'}
            </label>
            <input
              type="text"
              className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. House 14, Road 7, Dhanmondi, Dhaka"
              required
            />
          </div>
        </Card>

        {/* Step 2: Clinic Selection */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>🩺</span> {isBangla ? '২. হোম ভিজিট প্রদানকারী ক্লিনিক নির্বাচন' : '2. Select Home Visit Clinic'}
          </h2>

          {loadingClinics ? (
            <p className="text-sm text-content-secondary">{isBangla ? 'ক্লিনিক খোঁজা হচ্ছে...' : 'Finding clinics...'}</p>
          ) : clinics.length === 0 ? (
            <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded">
              {isBangla ? 'আপনার এলাকায় কোনো হোম ভিজিট ক্লিনিক পাওয়া যায়নি।' : 'No home visit clinics found in your area.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clinics.map((c) => {
                const isSelected = selectedClinicId === c.clinicId;
                return (
                  <div
                    key={c.clinicId}
                    onClick={() => setSelectedClinicId(c.clinicId)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                        : 'border-border-light hover:border-primary-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-content-primary text-base">
                        {isBangla ? c.nameBn : c.nameEn}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        ★ {c.ratingAvg} ({c.ratingCount})
                      </span>
                    </div>

                    <p className="text-xs text-content-secondary mb-3">
                      📍 {isBangla ? c.addressBn : c.addressEn} ({c.distanceKm} km {isBangla ? 'দূরে' : 'away'})
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-border-light text-xs">
                      <div>
                        <span className="text-content-secondary">{isBangla ? 'কভারেজ রেঞ্জ:' : 'Coverage:'} </span>
                        <span className="font-semibold text-content-primary">{c.homeVisitRadiusKm} km</span>
                      </div>
                      <div className="text-right">
                        <span className="text-content-secondary">{isBangla ? 'আনুমানিক ফি:' : 'Est. Fee:'} </span>
                        <span className="font-bold text-primary-700 text-sm">৳ {c.totalFee}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Step 3: Pet Info */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>🐾</span> {isBangla ? '৩. পোষা প্রাণীর তথ্য' : '3. Pet Details'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'প্রাণীর নাম *' : 'Pet Name *'}
              </label>
              <input
                type="text"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g. Milo / বাঘা"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'প্রাণীর প্রজাতি *' : 'Pet Species *'}
              </label>
              <select
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={petSpecies}
                onChange={(e) => setPetSpecies(e.target.value as any)}
              >
                <option value="dog">{isBangla ? 'কুকুর (Dog)' : 'Dog'}</option>
                <option value="cat">{isBangla ? 'বিড়াল (Cat)' : 'Cat'}</option>
                <option value="bird">{isBangla ? 'পাখি (Bird)' : 'Bird'}</option>
                <option value="rabbit">{isBangla ? 'খরগোশ (Rabbit)' : 'Rabbit'}</option>
                <option value="livestock">{isBangla ? 'গবাদি পশু (Livestock)' : 'Livestock'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              {isBangla ? 'সমস্যা / লক্ষণ বিস্তারিত লিখুন *' : 'Describe Symptoms / Reason *'}
            </label>
            <textarea
              rows={3}
              className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={
                isBangla
                  ? 'যেমন: গত দুই দিন ধরে বমি করছে, খাবার খাচ্ছে না, অলস হয়ে শুয়ে থাকে...'
                  : 'e.g. Vomiting since yesterday, lethargic, loss of appetite...'
              }
              required
            />
          </div>
        </Card>

        {/* Step 4: Date & Slot */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>📅</span> {isBangla ? '৪. ভিজিটের তারিখ ও সময়' : '4. Date & Time Slot'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'তারিখ *' : 'Visit Date *'}
              </label>
              <input
                type="date"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'সময় নির্ধারণ করুন *' : 'Pick Time Window *'}
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'morning', labelBn: 'সকাল ১০টা – দুপুর ১টা', labelEn: 'Morning (10:00 AM – 1:00 PM)' },
                  { id: 'afternoon', labelBn: 'দুপুর ২টা – বিকাল ৫টা', labelEn: 'Afternoon (2:00 PM – 5:00 PM)' },
                  { id: 'evening', labelBn: 'সন্ধ্যা ৬টা – রাত ৯টা', labelEn: 'Evening (6:00 PM – 9:00 PM)' },
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      timeSlot === s.id ? 'bg-primary-50 border-primary-500 font-semibold' : 'border-border-light'
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      checked={timeSlot === s.id}
                      onChange={() => setTimeSlot(s.id as any)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-content-primary">
                      {isBangla ? s.labelBn : s.labelEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Step 5: Contact & Payment */}
        <Card className="p-5 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-content-primary mb-3 flex items-center gap-2">
            <span>💳</span> {isBangla ? '৫. যোগাযোগ ও পেমেন্ট' : '5. Contact & Payment'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {isBangla ? 'মোবাইল নম্বর *' : 'Phone Number *'}
              </label>
              <input
                type="tel"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="w-full border border-border-input rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              >
                <option value="cash">{isBangla ? 'ক্যাশ অন ভিজিট (ডাক্তারকে সরাসরি)' : 'Cash on Visit'}</option>
                <option value="sslcommerz">{isBangla ? 'অনলাইন পেমেন্ট (SSLCommerz)' : 'Online Payment (SSLCommerz)'}</option>
                <option value="bkash">{isBangla ? 'বিকাশ / নগদ' : 'bKash / Nagad'}</option>
              </select>
            </div>
          </div>

          {selectedClinic && (
            <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-200 mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-content-secondary">{isBangla ? 'ডাক্তার কনসালটেশন ফি:' : 'Vet Consultation Fee:'}</span>
                <span className="font-semibold text-content-primary">৳ {selectedClinic.baseFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">
                  {isBangla ? `যাতায়াত ভাতা (${selectedClinic.distanceKm} কিমি):` : `Travel Allowance (${selectedClinic.distanceKm} km):`}
                </span>
                <span className="font-semibold text-content-primary">৳ {selectedClinic.travelFee}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-primary-200 font-bold text-base">
                <span className="text-primary-900">{isBangla ? 'সর্বমোট প্রদেয়:' : 'Total Payable:'}</span>
                <span className="text-primary-800">৳ {selectedClinic.totalFee}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || clinics.length === 0}
          >
            {submitting
              ? (isBangla ? 'অনুরোধ পাঠানো হচ্ছে...' : 'Submitting Request...')
              : (isBangla ? 'হোম ভিজিট নিশ্চিত করুন' : 'Confirm Home Visit Request')}
          </Button>
        </div>
      </form>
    </div>
  );
}
