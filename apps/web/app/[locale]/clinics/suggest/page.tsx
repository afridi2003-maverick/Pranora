'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import {
  submitClinicSuggestion,
  type ClinicSuggestionResult,
} from '@pranora/api';

export default function SuggestClinicPage() {
  const router = useRouter();
  const { isBangla, locale } = useLocale();

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+880 17');
  const [is24h, setIs24h] = useState(false);
  const [hasEmergency, setHasEmergency] = useState(false);
  const [offersHomeVisit, setOffersHomeVisit] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'general_checkup',
    'vaccination',
  ]);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<ClinicSuggestionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || name.length < 2) {
      setErrorMsg(isBangla ? 'ক্লিনিকের সঠিক নাম লিখুন' : 'Enter valid clinic name');
      return;
    }
    if (!address.trim() || address.length < 5) {
      setErrorMsg(isBangla ? 'পূর্ণাঙ্গ ঠিকানা লিখুন' : 'Enter detailed address');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setErrorMsg(isBangla ? 'সঠিক ফোন নম্বর লিখুন' : 'Enter valid phone number');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitClinicSuggestion({
        name,
        nameEn: nameEn.trim() || undefined,
        address,
        phone,
        is24h,
        hasEmergency,
        offersHomeVisit,
        services: selectedServices,
        notes: notes.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
      });
      setSubmitted(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <Card className="p-8 text-center bg-white border border-emerald-200 shadow-md">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-content-primary mb-2">
            {isBangla ? 'আপনার অবদানের জন্য ধন্যবাদ!' : 'Thank You for Your Suggestion!'}
          </h2>
          <p className="text-content-secondary mb-6 text-sm">
            {isBangla
              ? 'ক্লিনিকের তথ্যটি আমাদের মডারেশন কিউতে জমা হয়েছে। অ্যাডমিন টিম যাচাই করে দ্রুত এটি ম্যাপে যুক্ত করবে।'
              : 'Your suggested clinic has been queued for verification. Our admin team will review and publish it soon.'}
          </p>

          <div className="bg-surface-secondary rounded-xl p-4 mb-6 text-left space-y-1.5 border border-border-light text-xs">
            <div className="flex justify-between">
              <span className="text-content-secondary">{isBangla ? 'ক্লিনিকের নাম:' : 'Clinic:'}</span>
              <span className="font-semibold text-content-primary">{submitted.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-secondary">{isBangla ? 'ঠিকানা:' : 'Address:'}</span>
              <span className="font-semibold text-content-primary">{submitted.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-secondary">{isBangla ? 'স্ট্যাটাস:' : 'Status:'}</span>
              <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                {isBangla ? 'যাচাই প্রক্রিয়াধীন (Under Review)' : 'Under Review'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => router.push(`/${locale}/map`)}>
              {isBangla ? 'ম্যাপে ফিরে যান' : 'Back to Map'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(null);
                setName('');
                setAddress('');
              }}
            >
              {isBangla ? 'আরেকটি ক্লিনিক যোগ করুন' : 'Suggest Another'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">➕</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
            {isBangla ? 'ক্লিনিক যোগ করার অনুরোধ' : 'Suggest a Missing Clinic'}
          </h1>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            MAP-11
          </span>
        </div>
        <p className="text-content-secondary text-sm">
          {isBangla
            ? 'আপনার এলাকার কোনো পশু হাসপাতাল বা ডাক্তার ম্যাপে না থাকলে তার বিবরণ আমাদের জানান।'
            : 'Help pet parents find care by submitting details of unlisted veterinary clinics or animal hospitals.'}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="p-5 border border-border-light shadow-sm space-y-4">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <span>🏥</span> {isBangla ? '১. ক্লিনিকের প্রাথমিক তথ্য' : '1. Clinic Information'}
          </h2>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              {isBangla ? 'ক্লিনিকের নাম (বাংলায়) *' : 'Clinic Name (Bangla) *'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. মিরপুর পেট কেয়ার"
              className="w-full border border-border-input rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              {isBangla ? 'ক্লিনিকের নাম (ইংরেজিতে)' : 'Clinic Name (English)'}
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Mirpur Pet Care"
              className="w-full border border-border-input rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              {isBangla ? 'পূর্ণাঙ্গ ঠিকানা ও ল্যান্ডমার্ক *' : 'Detailed Address & Landmark *'}
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. House 12, Road 4, Sector 6, Mirpur 10, Dhaka (Opposite to Stadium)"
              className="w-full border border-border-input rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              {isBangla ? 'মোবাইল / হটলাইন নম্বর *' : 'Contact Phone Number *'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1712-345678"
              className="w-full border border-border-input rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </Card>

        {/* Features & Services */}
        <Card className="p-5 border border-border-light shadow-sm space-y-4">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <span>⚙️</span> {isBangla ? '২. সুবিধা ও সেবাসমূহ' : '2. Features & Services'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border-light cursor-pointer hover:bg-surface-secondary text-xs">
              <input
                type="checkbox"
                checked={is24h}
                onChange={(e) => setIs24h(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-content-primary">
                🌙 {isBangla ? '২৪/৭ খোলা' : 'Open 24/7'}
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border-light cursor-pointer hover:bg-surface-secondary text-xs">
              <input
                type="checkbox"
                checked={hasEmergency}
                onChange={(e) => setHasEmergency(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-content-primary">
                🚨 {isBangla ? 'জরুরি সেবা' : 'Emergency Help'}
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border-light cursor-pointer hover:bg-surface-secondary text-xs">
              <input
                type="checkbox"
                checked={offersHomeVisit}
                onChange={(e) => setOffersHomeVisit(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-content-primary">
                🏡 {isBangla ? 'হোম ভিজিট' : 'Home Visit'}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-2">
              {isBangla ? 'প্রদত্ত সেবাসমূহ নির্বাচন করুন:' : 'Services Available:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'general_checkup', labelBn: '🩺 সাধারণ চিকিৎসা', labelEn: 'General Checkup' },
                { id: 'surgery', labelBn: '🔬 সার্জারি ও অপারেশন', labelEn: 'Surgery & Operation' },
                { id: 'vaccination', labelBn: '💉 টিকা ও ভ্যাক্সিন', labelEn: 'Vaccination' },
                { id: 'grooming', labelBn: '✂️ গ্রুমিং ও বাথ', labelEn: 'Grooming & Bath' },
                { id: 'boarding', labelBn: '🏨 বোর্ডিং ও হোস্টেল', labelEn: 'Boarding' },
                { id: 'pathology', labelBn: '🧪 ল্যাব টেস্ট ও এক্স-রে', labelEn: 'Lab Diagnostic' },
              ].map((srv) => {
                const checked = selectedServices.includes(srv.id);
                return (
                  <label
                    key={srv.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition ${
                      checked ? 'border-emerald-600 bg-emerald-50/70 font-semibold text-emerald-900' : 'border-border-light text-content-secondary'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(srv.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{isBangla ? srv.labelBn : srv.labelEn}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              {isBangla ? 'অতিরিক্ত মন্তব্য বা রেফারেন্স (ঐচ্ছিক)' : 'Additional Notes (Optional)'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isBangla ? 'যেমন: শুক্রবার দুপুর ২টা থেকে বন্ধ থাকে...' : 'e.g. Closed on Friday afternoons...'}
              className="w-full border border-border-input rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting
              ? (isBangla ? 'জমা হচ্ছে...' : 'Submitting...')
              : (isBangla ? 'অনুরোধ জমা দিন' : 'Submit Suggestion')}
          </Button>
        </div>
      </form>
    </div>
  );
}
