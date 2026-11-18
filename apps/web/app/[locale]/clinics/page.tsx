'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, SearchBar } from '@pranora/ui';
import { getAllMockClinics, type ClinicFullDetail } from '@pranora/api';

export default function ClinicsDirectoryPage() {
  const router = useRouter();
  const { isBangla } = useLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'govt' | 'private' | '24h' | 'emergency'>('all');

  const allClinics = getAllMockClinics();

  const filteredClinics = allClinics.filter((item: ClinicFullDetail) => {
    const name = (isBangla ? item.provider.nameBn : item.provider.nameEn) || item.provider.nameEn || '';
    const address = (isBangla ? item.location.addressBn : item.location.addressEn) || item.location.addressEn || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'govt') return item.provider.isGovernment;
    if (filterType === 'private') return !item.provider.isGovernment;
    if (filterType === '24h') return item.location.is24h;
    if (filterType === 'emergency') return item.location.hasEmergency;
    return true;
  });

  return (
    <div className="min-h-screen bg-green-50/20 dark:bg-gray-900 py-8 px-4 text-content-primary">
      <main className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-bangla text-green-900 dark:text-green-300 flex items-center gap-2">
            <span>🏥</span>
            <span>{isBangla ? 'পশু চিকিৎসা কেন্দ্র ও হাসপাতালসমূহ' : 'Veterinary Clinics & Hospitals'}</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-bangla">
            {isBangla
              ? 'ঢাকার শীর্ষস্থানীয় রেজিস্টার্ড পেট ক্লিনিক ও সরকারি পশু হাসপাতালসমূহ'
              : 'Verified pet clinics and government veterinary hospitals across Dhaka'}
          </p>
        </div>

        {/* Search & Filter Chips */}
        <div className="space-y-3 mb-6">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isBangla ? 'ক্লিনিকের নাম বা এলাকা লিখে খুঁজুন (উদা: ধানমন্ডি, গুলশান)...' : 'Search by clinic name or area (e.g. Dhanmondi, Gulshan)...'}
            onClear={() => setSearchTerm('')}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Chip
              label={isBangla ? 'সকল ক্লিনিক' : 'All'}
              isSelected={filterType === 'all'}
              onSelect={() => setFilterType('all')}
            />
            <Chip
              label={isBangla ? '🏛️ সরকারি হাসপাতাল' : '🏛️ Government'}
              isSelected={filterType === 'govt'}
              onSelect={() => setFilterType('govt')}
            />
            <Chip
              label={isBangla ? '🏥 বেসরকারি ক্লিনিক' : '🏥 Private'}
              isSelected={filterType === 'private'}
              onSelect={() => setFilterType('private')}
            />
            <Chip
              label={isBangla ? '🕒 ২৪/৭ খোলা' : '🕒 24/7 Open'}
              isSelected={filterType === '24h'}
              onSelect={() => setFilterType('24h')}
            />
            <Chip
              label={isBangla ? '🚨 জরুরি সেবা' : '🚨 Emergency'}
              isSelected={filterType === 'emergency'}
              onSelect={() => setFilterType('emergency')}
            />
          </div>
        </div>

        {/* Clinic Cards List */}
        <div className="space-y-4">
          {filteredClinics.map((clinic) => {
            const name = (isBangla ? clinic.provider.nameBn : clinic.provider.nameEn) || clinic.provider.nameEn;
            const address = (isBangla ? clinic.location.addressBn : clinic.location.addressEn) || clinic.location.addressEn;
            const photo = clinic.location.photos[0] || 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800';

            return (
              <Card
                key={clinic.location.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:shadow-md transition cursor-pointer border border-gray-100 dark:border-gray-800"
                onClick={() => router.push(`/clinics/${clinic.location.id}`)}
              >
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={name ?? ''}
                  className="w-full sm:w-36 h-28 rounded-xl object-cover shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold font-bangla text-gray-900 dark:text-gray-100 truncate">
                      {name}
                    </h2>
                    {clinic.provider.isGovernment ? (
                      <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                        {isBangla ? 'সরকারি' : 'Govt'}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-full">
                        {isBangla ? 'বেসরকারি' : 'Private'}
                      </span>
                    )}
                    {clinic.location.is24h && (
                      <span className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 font-semibold px-2 py-0.5 rounded-full">
                        ২৪/৭
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bangla mb-2 flex items-center gap-1 truncate">
                    <span>📍</span>
                    <span>{address}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-bangla text-gray-600 dark:text-gray-400">
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      ★ {clinic.provider.ratingAvg.toFixed(1)} ({clinic.provider.ratingCount})
                    </span>
                    <span>•</span>
                    <span>
                      {clinic.vets.length} {isBangla ? 'জন রেজিস্টার্ড ভেট' : 'registered vets'}
                    </span>
                    <span>•</span>
                    <span className="text-green-700 dark:text-green-400 font-semibold">
                      {isBangla ? 'ফি: ৳' : 'Fee: ৳'}
                      {clinic.vets[0]?.consultationFee ?? clinic.services[0]?.price ?? 500}
                    </span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="sm:self-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto font-bangla"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/clinics/${clinic.location.id}`);
                    }}
                  >
                    {isBangla ? 'বিস্তারিত দেখুন →' : 'View Detail →'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
