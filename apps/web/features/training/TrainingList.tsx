'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, formatCurrency } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import {
  TrainerProfile,
  TrainingPackage,
  TrainingBooking,
  TrainingPackageType,
  listTrainers,
  listTrainingPackages,
  listMyTrainingBookings,
  cancelTrainingBooking,
} from '@pranora/api';
import { BookTrainingModal } from './BookTrainingModal';

const SPECIALTY_FILTERS: Array<{ id: TrainingPackageType | 'all'; labelEn: string; labelBn: string }> = [
  { id: 'all', labelEn: 'All Programs', labelBn: 'সব প্রোগ্রাম' },
  { id: 'obedience', labelEn: 'Basic Obedience', labelBn: 'বেসিক ওবিডিয়েন্স' },
  { id: 'puppy_socialization', labelEn: 'Puppy Socialization', labelBn: 'পাপি সোশ্যালাইজেশন' },
  { id: 'behavior_correction', labelEn: 'Behavior Correction', labelBn: 'বিহেভিয়ার কারেকশন' },
  { id: 'agility', labelEn: 'Agility & Advanced', labelBn: 'অ্যাজিলিটি ও অ্যাডভান্সড' },
];

const AREA_FILTERS = [
  { id: 'all', labelEn: 'All Areas', labelBn: 'সব এলাকা' },
  { id: 'Dhanmondi', labelEn: 'Dhanmondi', labelBn: 'ধানমন্ডি' },
  { id: 'Gulshan', labelEn: 'Gulshan', labelBn: 'গুলশান' },
  { id: 'Uttara', labelEn: 'Uttara', labelBn: 'উত্তরা' },
  { id: 'Chattogram', labelEn: 'Chattogram', labelBn: 'চট্টগ্রাম' },
];

export function TrainingList() {
  const { isBangla } = useLocale();
  const locale = isBangla ? 'bn' : 'en';

  const [activeTab, setActiveTab] = useState<'trainers' | 'myBookings'>('trainers');
  const [packages, setPackages] = useState<TrainingPackage[]>([]);
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [bookings, setBookings] = useState<TrainingBooking[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<TrainingPackageType | 'all'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTrainerForBooking, setSelectedTrainerForBooking] = useState<TrainerProfile | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pkgList, trainerList, bookingList] = await Promise.all([
        listTrainingPackages(null),
        listTrainers(null, {
          specialty: selectedSpecialty === 'all' ? undefined : selectedSpecialty,
          area: selectedArea === 'all' ? undefined : selectedArea,
          search: searchQuery.trim() || undefined,
        }),
        listMyTrainingBookings(null),
      ]);
      setPackages(pkgList);
      setTrainers(trainerList);
      setBookings(bookingList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSpecialty, selectedArea, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBookingSuccess = () => {
    showToast(
      isBangla
        ? 'ট্রেনিং বুকিং সফলভাবে নিশ্চিত হয়েছে!'
        : 'Training booking confirmed successfully!'
    );
    loadData();
    setActiveTab('myBookings');
  };

  const handleCancelBooking = async (bookingId: string) => {
    await cancelTrainingBooking(null, bookingId);
    showToast(isBangla ? 'ট্রেনিং বুকিং বাতিল করা হয়েছে' : 'Training booking cancelled');
    loadData();
  };

  const getSpecialtyLabel = (slug: string) => {
    const match = SPECIALTY_FILTERS.find((s) => s.id === slug);
    return match ? (isBangla ? match.labelBn : match.labelEn) : slug;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-800 border-amber-200',
      confirmed: 'bg-green-50 text-green-800 border-green-200',
      in_progress: 'bg-blue-50 text-blue-800 border-blue-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    const labels: Record<string, { en: string; bn: string }> = {
      pending: { en: 'Pending', bn: 'অপেক্ষমাণ' },
      confirmed: { en: 'Confirmed', bn: 'নিশ্চিত' },
      in_progress: { en: 'In Progress', bn: 'চলমান' },
      completed: { en: 'Completed', bn: 'সম্পন্ন' },
      cancelled: { en: 'Cancelled', bn: 'বাতিল' },
    };
    const label = labels[status] ?? { en: status, bn: status };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
          colors[status] ?? 'bg-gray-100 text-gray-700'
        }`}
      >
        {isBangla ? label.bn : label.en}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <span>✓</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs font-semibold mb-3">
          <span>🎓</span>
          <span>{isBangla ? 'সার্টিফায়েড পেট ট্রেইনার' : 'Certified Pet Trainers'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-content-primary tracking-tight mb-2">
          {isBangla ? 'পেট ট্রেনিং ও আচরণ পরিচর্যা' : 'Pet Training & Behavior'}
        </h1>
        <p className="text-content-secondary text-sm sm:text-base">
          {isBangla
            ? 'ওবিডিয়েন্স, পাপি সোশ্যালাইজেশন ও বিহেভিয়ার কারেকশনের জন্য সার্টিফায়েড ট্রেইনার'
            : 'Certified positive-reinforcement trainers for obedience, puppy socialization & behavior care'}
        </p>

        {/* Tab switch */}
        <div className="flex justify-center mt-6">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('trainers')}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'trainers'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎓 {isBangla ? 'ট্রেইনার ও প্রোগ্রাম' : 'Trainers & Programs'}
            </button>
            <button
              onClick={() => setActiveTab('myBookings')}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'myBookings'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 {isBangla ? `আমার ট্রেনিং (${bookings.length})` : `My Training (${bookings.length})`}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'trainers' ? (
        <>
          {/* Training Packages Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {packages.map((pkg) => (
              <button
                key={pkg.slug}
                onClick={() =>
                  setSelectedSpecialty(selectedSpecialty === pkg.slug ? 'all' : pkg.slug)
                }
                className={`text-left p-4 rounded-2xl border transition-all ${
                  selectedSpecialty === pkg.slug
                    ? 'bg-green-50 border-green-600 shadow-md'
                    : 'bg-white border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    {pkg.sessions_count} {isBangla ? 'সেশন' : 'sessions'}
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {formatCurrency(pkg.base_price, locale)}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 mb-1">
                  {isBangla ? pkg.title_bn : pkg.title_en}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {isBangla ? pkg.description_bn : pkg.description_en}
                </p>
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <Card className="p-4 mb-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isBangla ? 'এলাকা বা ট্রেইনারের নাম দিয়ে খুঁজুন...' : 'Search trainers by area or name...'
                }
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value as TrainingPackageType | 'all')}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {SPECIALTY_FILTERS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isBangla ? s.labelBn : s.labelEn}
                  </option>
                ))}
              </select>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {AREA_FILTERS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {isBangla ? a.labelBn : a.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Trainer Cards */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              {isBangla ? 'লোড হচ্ছে...' : 'Loading trainers...'}
            </div>
          ) : trainers.length === 0 ? (
            <Card className="p-10 text-center text-gray-500 bg-white rounded-2xl">
              {isBangla
                ? 'আপনার ফিল্টার অনুযায়ী কোনো ট্রেইনার পাওয়া যায়নি।'
                : 'No trainers found matching your filters.'}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {trainers.map((trainer) => (
                <Card
                  key={trainer.id}
                  className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {isBangla ? trainer.full_name_bn : trainer.full_name_en}
                          </h3>
                          {trainer.is_verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                              ✓ {isBangla ? 'সার্টিফায়েড' : 'Certified'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center space-x-3">
                          <span>⭐ {trainer.rating.toFixed(1)} ({trainer.review_count})</span>
                          <span>•</span>
                          <span>
                            {trainer.experience_years} {isBangla ? 'বছরের অভিজ্ঞতা' : 'yrs exp'}
                          </span>
                          <span>•</span>
                          <span>{trainer.district}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-green-700">
                          {formatCurrency(trainer.package_rate, locale)}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {isBangla ? 'প্যাকেজ' : 'package'} · {formatCurrency(trainer.session_rate, locale)}/
                          {isBangla ? 'সেশন' : 'session'}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {isBangla ? trainer.bio_bn : trainer.bio_en}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {trainer.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold"
                        >
                          {getSpecialtyLabel(spec)}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      <span className="font-semibold text-gray-700">
                        {isBangla ? 'সেবার এলাকা: ' : 'Areas: '}
                      </span>
                      {trainer.areas.join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <a
                      href={`tel:${trainer.phone.replace(/\s+/g, '')}`}
                      className="text-xs font-bold text-green-700 hover:underline"
                    >
                      📞 {trainer.phone}
                    </a>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedTrainerForBooking(trainer)}
                    >
                      {isBangla ? 'ট্রেনিং বুক করুন' : 'Book Training'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <Card className="p-10 text-center text-gray-500 bg-white rounded-2xl">
              {isBangla ? 'আপনার এখনো কোনো ট্রেনিং বুকিং নেই' : 'You have no training bookings yet'}
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card
                key={booking.id}
                className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">
                      {getSpecialtyLabel(booking.package_type)}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {isBangla ? 'ট্রেইনার: ' : 'Trainer: '}
                    <span className="font-semibold">
                      {booking.trainer
                        ? isBangla
                          ? booking.trainer.full_name_bn
                          : booking.trainer.full_name_en
                        : booking.trainer_id}
                    </span>
                    {' · '}
                    {booking.start_date} ({booking.preferred_time})
                  </div>
                  <div className="text-xs text-gray-500">
                    {isBangla ? 'সেশন: ' : 'Sessions: '}
                    {booking.sessions_completed}/{booking.sessions_total} ·{' '}
                    {booking.training_format === 'home_visit'
                      ? isBangla
                        ? 'হোম ভিজিট'
                        : 'Home Visit'
                      : isBangla
                      ? 'ট্রেনিং সেন্টার'
                      : 'Training Center'}{' '}
                    · {booking.address}
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-black text-green-700">
                      {formatCurrency(booking.total_price, locale)}
                    </div>
                    <div className="text-[11px] uppercase font-bold text-gray-500">
                      {booking.payment_method} · {booking.payment_status}
                    </div>
                  </div>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      {isBangla ? 'বাতিল করুন' : 'Cancel'}
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {selectedTrainerForBooking && (
        <BookTrainingModal
          trainer={selectedTrainerForBooking}
          packages={packages}
          onClose={() => setSelectedTrainerForBooking(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
