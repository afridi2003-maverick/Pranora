'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Card, Button, Chip } from '@pranora/ui';
import {
  DLS_LIVESTOCK_VACCINES,
  getLivestockHospitals,
  submitLivestockCall,
  validateLivestockMedication,
  type LivestockHospitalResult,
  type LivestockCallResult,
  type LivestockSpecies,
} from '@pranora/api';

export default function LivestockServicesPage() {
  const router = useRouter();
  const { isBangla, locale } = useLocale();

  const [hospitals, setHospitals] = useState<LivestockHospitalResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');

  // Form Fields
  const [farmerName, setFarmerName] = useState('');
  const [species, setSpecies] = useState<LivestockSpecies>('cow');
  const [animalCount, setAnimalCount] = useState<number>(1);
  const [serviceType, setServiceType] = useState<
    'emergency_calving' | 'disease_treatment' | 'vaccination_campaign' | 'artificial_insemination'
  >('disease_treatment');
  const [problemDescription, setProblemDescription] = useState('');
  const [address, setAddress] = useState('গ্রাম: হেমায়েতপুর, সাভার, ঢাকা');
  const [phone, setPhone] = useState('+880 17');

  // Drug Safety Checker (BVC Compliance)
  const [drugCheckInput, setDrugCheckInput] = useState('');
  const [drugWarning, setDrugWarning] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedCall, setSubmittedCall] = useState<LivestockCallResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getLivestockHospitals(23.7465, 90.3752);
        setHospitals(data);
        if (data.length > 0) setSelectedHospitalId(data[0].clinicId);
      } catch (err) {
        console.error('Failed to load livestock hospitals:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedHospital = hospitals.find((h) => h.clinicId === selectedHospitalId) || hospitals[0];

  const handleCheckDrug = (val: string) => {
    setDrugCheckInput(val);
    if (!val.trim()) {
      setDrugWarning(null);
      return;
    }
    const check = validateLivestockMedication(val);
    if (!check.isSafe) {
      setDrugWarning(check.warning || null);
    } else {
      setDrugWarning(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!farmerName.trim()) {
      setErrorMsg(isBangla ? 'খামারির নাম লিখুন' : 'Enter farmer name');
      return;
    }
    if (!address.trim() || address.length < 5) {
      setErrorMsg(isBangla ? 'খামার বা বাড়ির পূর্ণাঙ্গ ঠিকানা লিখুন' : 'Enter farm address');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setErrorMsg(isBangla ? 'যোগাযোগের মোবাইল নম্বর লিখুন' : 'Enter valid phone');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitLivestockCall({
        clinicId: selectedHospital.clinicId,
        locationId: selectedHospital.locationId,
        farmerName,
        species,
        animalCount,
        serviceType,
        problemDescription,
        address,
        phone,
      });
      setSubmittedCall(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedCall) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="p-8 text-center bg-white border border-emerald-200 shadow-md">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            🐄
          </div>
          <h2 className="text-2xl font-bold text-content-primary mb-2">
            {isBangla ? 'জরুরি কল গ্রহণ করা হয়েছে!' : 'Livestock Call Dispatched!'}
          </h2>
          <p className="text-content-secondary mb-6 text-sm">
            {isBangla
              ? 'নিকটস্থ উপজেলা প্রাণিসম্পদ দপ্তর ও ভ্রাম্যমাণ ভেটেরিনারি দল দ্রুত যোগাযোগ করবে।'
              : 'The Upazila Livestock Office mobile veterinary team has been alerted.'}
          </p>

          <div className="bg-surface-secondary rounded-xl p-4 mb-6 text-left space-y-2 border border-border-light text-xs">
            <div className="flex justify-between">
              <span className="text-content-secondary">{isBangla ? 'কল কোড:' : 'Call Code:'}</span>
              <span className="font-mono font-bold text-emerald-700">{submittedCall.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-secondary">{isBangla ? 'খামারি:' : 'Farmer:'}</span>
              <span className="font-semibold text-content-primary">{submittedCall.farmerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-secondary">{isBangla ? 'দায়িত্বপ্রাপ্ত হাসপাতাল:' : 'Assigned Center:'}</span>
              <span className="font-semibold text-content-primary">{submittedCall.assignedHospital}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border-light">
              <span className="text-content-secondary">{isBangla ? 'স্ট্যাটাস:' : 'Status:'}</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {isBangla ? 'টিম প্রেরিত (Dispatched)' : 'Dispatched'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => router.push(`/${locale}/services`)}>
              {isBangla ? 'অন্যান্য সেবা' : 'Browse Services'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmittedCall(null);
                setProblemDescription('');
              }}
            >
              {isBangla ? 'নতুন কল করুন' : 'Submit Another'}
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
          <span className="text-3xl">🐄</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
            {isBangla ? 'গবাদি পশুর চিকিৎসা ও খামারি সেবা' : 'Livestock & Farm Veterinary Services'}
          </h1>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            LIV-1
          </span>
        </div>
        <p className="text-content-secondary text-sm">
          {isBangla
            ? 'সরকারি উপজেলা প্রাণিসম্পদ হাসপাতাল (DLS), কৃত্রিম প্রজনন, নিয়মিত টিকা এবং ভ্রাম্যমাণ ভেট সহায়তা।'
            : 'Government Upazila Livestock Hospitals (DLS), subsidized vaccination, artificial insemination, and farm emergency care.'}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {/* DLS Subsidized Vaccine Schedule Reference */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <span>💉</span> {isBangla ? 'সরকারি ভর্তুকির টিকা সূচি (DLS প্রাণিসম্পদ অধিদপ্তর)' : 'Subsidized Livestock Vaccines (DLS)'}
          </h2>
          <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {isBangla ? 'সরকারি মূল্য ৳১০–৳৩০' : 'Govt Rate ৳10–৳30'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {DLS_LIVESTOCK_VACCINES.map((v) => (
            <div key={v.id} className="p-3 bg-white rounded-xl border border-border-light shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-xs text-content-primary">
                  {isBangla ? v.nameBn : v.nameEn}
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  ৳{v.subsidizedPrice}
                </span>
              </div>
              <p className="text-[11px] text-content-secondary mb-1">
                🐾 {isBangla ? v.targetSpeciesBn : v.targetSpeciesEn}
              </p>
              <p className="text-[10px] text-gray-500">
                🗓️ {isBangla ? v.seasonBn : v.seasonEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BVC Legal Compliance Safety Checker */}
      <div className="mb-8 p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <span>⚠️</span>
          <h3 className="text-xs font-bold text-amber-900">
            {isBangla
              ? 'ঔষধ নিরাপত্তা সতর্কতা (BVC ও পরিবেশ মন্ত্রণালয় প্রজ্ঞাপন)'
              : 'Livestock Drug Safety Checker (BVC & Environmental Regulations)'}
          </h3>
        </div>
        <p className="text-[11px] text-amber-800 mb-3">
          {isBangla
            ? 'গবাদি পশু ও শকুনের সুরক্ষায় ডাইক্লোফেনাক ও কিটোপ্রোফেন ব্যবহার নিষিদ্ধ। নিরাপদ বিকল্প মেলোক্সিক্যাম বা টলফেনামিক এসিড যাচাই করুন:'
            : 'Diclofenac and Ketoprofen are strictly prohibited for livestock in Bangladesh. Check safe alternatives (Meloxicam, Tolfenamic acid):'}
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={drugCheckInput}
            onChange={(e) => handleCheckDrug(e.target.value)}
            placeholder={isBangla ? 'ঔষধের নাম লিখুন (যেমন: Diclofenac, Meloxicam...)' : 'Type drug name to check...'}
            className="flex-1 border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none"
          />
        </div>

        {drugWarning && (
          <div className="mt-2 text-xs font-bold text-red-700 bg-red-100 p-2 rounded border border-red-200">
            ⛔ {drugWarning}
          </div>
        )}
      </div>

      {/* Emergency Request Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-5 border border-border-light shadow-sm space-y-4">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <span>🚨</span> {isBangla ? 'উপজেলা ভেট বা ভ্রাম্যমাণ টিম ডাকুন' : 'Call Upazila Vet / Mobile Clinic'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                {isBangla ? 'খামারির নাম *' : 'Farmer Name *'}
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="e.g. মোঃ রহিম মিয়া"
                className="w-full border border-border-input rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                {isBangla ? 'প্রাণীর প্রজাতি *' : 'Livestock Species *'}
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as any)}
                className="w-full border border-border-input rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="cow">{isBangla ? 'গরু (Cattle / Cow)' : 'Cattle / Cow'}</option>
                <option value="goat">{isBangla ? 'ছাগল (Goat)' : 'Goat'}</option>
                <option value="sheep">{isBangla ? 'ভেড়া (Sheep)' : 'Sheep'}</option>
                <option value="buffalo">{isBangla ? 'মহিষ (Buffalo)' : 'Buffalo'}</option>
                <option value="poultry">{isBangla ? 'হাঁস-মুরগি (Poultry / Duck)' : 'Poultry / Duck'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                {isBangla ? 'সেবার ধরন *' : 'Service Type *'}
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full border border-border-input rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="disease_treatment">{isBangla ? 'রোগের জরুরি চিকিৎসা' : 'Disease Treatment'}</option>
                <option value="emergency_calving">{isBangla ? 'প্রসবকালীন জটিলতা (Calving Emergency)' : 'Calving Emergency'}</option>
                <option value="artificial_insemination">{isBangla ? 'কৃত্রিম প্রজনন (AI Breeding)' : 'Artificial Insemination'}</option>
                <option value="vaccination_campaign">{isBangla ? 'খামারে গণ-টিকাদান' : 'Vaccination Campaign'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                {isBangla ? 'প্রাণীর সংখ্যা *' : 'Number of Animals *'}
              </label>
              <input
                type="number"
                min={1}
                value={animalCount}
                onChange={(e) => setAnimalCount(Number(e.target.value))}
                className="w-full border border-border-input rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              {isBangla ? 'খামার / বাড়ির পূর্ণাঙ্গ ঠিকানা ও ল্যান্ডমার্ক *' : 'Farm Address & Landmark *'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. গ্রাম: হেমায়েতপুর, সাভার, ঢাকা"
              className="w-full border border-border-input rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              {isBangla ? 'যোগাযোগের মোবাইল নম্বর *' : 'Contact Phone *'}
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting
              ? (isBangla ? 'অনুরোধ পাঠানো হচ্ছে...' : 'Submitting...')
              : (isBangla ? 'জরুরি সহায়তা কল নিশ্চিত করুন' : 'Confirm Livestock Call')}
          </Button>
        </div>
      </form>
    </div>
  );
}
