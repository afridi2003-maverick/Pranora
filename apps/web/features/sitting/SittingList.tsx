'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import {
  SitterProfile,
  SittingServiceType,
  listSitters,
} from '@pranora/api';
import { BookSittingModal } from './BookSittingModal';
import { SittingBookings } from './SittingBookings';

export function SittingList() {
  const { t, isBangla } = useLocale();

  const [activeTab, setActiveTab] = useState<'sitters' | 'myBookings'>('sitters');
  const [sitters, setSitters] = useState<SitterProfile[]>([]);
  const [selectedService, setSelectedService] = useState<SittingServiceType | 'all'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Booking Modal
  const [selectedSitterForBooking, setSelectedSitterForBooking] = useState<SitterProfile | null>(null);
  const [refreshBookingsTrigger, setRefreshBookingsTrigger] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSitters = async () => {
    setIsLoading(true);
    try {
      const data = await listSitters(null, {
        service_type: selectedService === 'all' ? undefined : selectedService,
        area: selectedArea === 'all' ? undefined : selectedArea,
        search: searchQuery.trim() || undefined,
      });
      setSitters(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSitters();
  }, [selectedService, selectedArea, searchQuery]);

  const handleBookingSuccess = () => {
    setToastMessage(t('sitting:modal.successToast'));
    setRefreshBookingsTrigger((prev) => prev + 1);
    setActiveTab('myBookings');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-top-4">
          <span>✓</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs font-semibold mb-3">
          <span>🐾</span>
          <span>{isBangla ? 'ভেরিফায়েড পেট কেয়ারার্স' : 'Verified Pet Care'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-content-primary tracking-tight mb-2">
          {t('sitting:pageTitle')}
        </h1>
        <p className="text-content-secondary text-sm sm:text-base">
          {t('sitting:pageSubtitle')}
        </p>

        {/* Tab switch */}
        <div className="flex justify-center mt-6">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('sitters')}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'sitters'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🐾 {t('sitting:tabs.sitters')}
            </button>
            <button
              onClick={() => setActiveTab('myBookings')}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'myBookings'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 {t('sitting:tabs.myBookings')}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'myBookings' ? (
        <SittingBookings onRefreshTrigger={refreshBookingsTrigger} />
      ) : (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('sitting:searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>

              {/* Area select */}
              <div className="w-full sm:w-48">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none bg-white text-gray-700"
                >
                  <option value="all">{t('sitting:areaFilter.all')}</option>
                  <option value="ধানমন্ডি">ধানমন্ডি (Dhanmondi)</option>
                  <option value="গুলশান">গুলশান (Gulshan)</option>
                  <option value="উত্তরা">উত্তরা (Uttara)</option>
                  <option value="মিরপুর">মিরপুর (Mirpur)</option>
                </select>
              </div>
            </div>

            {/* Service Type Filter Chips */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
              {(
                [
                  'all',
                  'sitting_hourly',
                  'dog_walking',
                  'day_sitting',
                  'overnight',
                ] as const
              ).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedService(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedService === type
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(`sitting:serviceTypes.${type}` as any)}
                </button>
              ))}
            </div>
          </div>

          {/* Sitters Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-content-secondary">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3" />
              <p className="text-sm">সিটার তালিকা লোড হচ্ছে...</p>
            </div>
          ) : sitters.length === 0 ? (
            <div className="py-16 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
              <span className="text-5xl block mb-3">🔍</span>
              <h4 className="text-lg font-bold text-content-primary mb-1">
                {t('sitting:emptySitters')}
              </h4>
              <p className="text-sm text-content-secondary">
                {isBangla
                  ? 'অন্য এলাকা বা সেবা নির্বাচন করে পুনরায় চেষ্টা করুন।'
                  : 'Try selecting a different service type or neighborhood.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sitters.map((s) => (
                <Card
                  key={s.id}
                  className="p-6 border border-gray-200/90 hover:border-green-400 hover:shadow-lg transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center text-2xl font-black shadow-inner">
                          {s.full_name_en.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-lg text-content-primary">
                              {isBangla ? s.full_name_bn : s.full_name_en}
                            </h3>
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800"
                              title={t('sitting:sitterCard.verified')}
                            >
                              ✓ Verified
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-content-secondary mt-0.5">
                            <span className="text-amber-500 font-bold">★ {s.rating}</span>
                            <span>({s.review_count} রিভিউ)</span>
                            <span>•</span>
                            <span>{s.experience_years} বছরের অভিজ্ঞতা</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-green-700">
                          ৳{s.hourly_rate}
                        </span>
                        <span className="text-xs text-content-secondary block">
                          {t('sitting:sitterCard.hourly')}
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-content-secondary mt-4 leading-relaxed line-clamp-3">
                      {isBangla ? s.bio_bn : s.bio_en}
                    </p>

                    {/* Services Tags */}
                    <div className="mt-4">
                      <span className="text-xs font-semibold text-gray-500 block mb-1.5">
                        {t('sitting:sitterCard.servicesTitle')}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {s.service_types.map((st) => (
                          <span
                            key={st}
                            className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium"
                          >
                            {t(`sitting:serviceTypes.${st}` as any)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Areas Coverage */}
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-gray-500 block mb-1">
                        {t('sitting:sitterCard.areasTitle')}
                      </span>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        📍 {s.areas.join(' • ')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-5 mt-4 border-t border-gray-100">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => setSelectedSitterForBooking(s)}
                    >
                      {t('sitting:sitterCard.bookBtn')}
                    </Button>
                    <a
                      href={`tel:${s.phone}`}
                      className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-1"
                    >
                      <span>📞</span>
                      <span>{t('sitting:sitterCard.callBtn')}</span>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Book Sitter Modal */}
      {selectedSitterForBooking && (
        <BookSittingModal
          sitter={selectedSitterForBooking}
          isOpen={true}
          onClose={() => setSelectedSitterForBooking(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
