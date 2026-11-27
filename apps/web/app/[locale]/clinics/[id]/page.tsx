'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, EmptyState } from '@pranora/ui';
import {
  getClinicFullDetail,
  type ClinicFullDetail,
  buildBookingUrl,
  buildDirectionsUrl,
  buildTelUrl,
  getProviderReviews,
  calculateReviewSummary,
  submitProviderReview,
  type ReviewItem,
} from '@pranora/api';
import { ReportModal } from '../../components/ReportModal';
import { useSession } from '../../../../hooks/useSession';

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

export default function ClinicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isBangla, locale } = useLocale();
  const { supabase, isConfigured } = useSession();

  const clinicId = (Array.isArray(params?.id) ? params.id[0] : (params?.id as string)) || '';

  const [clinic, setClinic] = useState<ClinicFullDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);
  const [showAllHours, setShowAllHours] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Reviews state (REV-1)
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [writeReviewModalOpen, setWriteReviewModalOpen] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewVetId, setReviewVetId] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    if (clinic?.provider.id) {
      getProviderReviews(clinic.provider.id, isConfigured ? supabase : null).then(setReviews);
    }
  }, [clinic?.provider.id, isConfigured, supabase]);

  const reviewSummary = useMemo(() => calculateReviewSummary(reviews), [reviews]);

  const handleSubmitReview = async () => {
    if (!clinic?.provider.id) return;
    setSubmittingReview(true);
    try {
      const newRev = await submitProviderReview(
        {
          bookingId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `b-${Date.now()}`,
          providerId: clinic.provider.id,
          vetId: reviewVetId || undefined,
          rating: reviewRating,
          comment: reviewComment,
        },
        {
          id: 'current-user',
          name: isBangla ? 'পেট অভিভাবক' : 'Verified Pet Parent',
        },
        isConfigured ? supabase : null
      );
      setReviews((prev) => [newRev, ...prev]);
      setWriteReviewModalOpen(false);
      setReviewComment('');
      setToastMessage(isBangla ? 'রিভিউ সফলভাবে জমা হয়েছে!' : 'Review submitted successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!clinicId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getClinicFullDetail(clinicId, isConfigured ? supabase : null);
        if (isMounted) {
          setClinic(data);
        }
      } catch (err) {
        console.error('Failed to load clinic detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [clinicId, isConfigured, supabase]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (navigator.share) {
        try {
          await navigator.share({
            title: isBangla ? clinic?.provider.nameBn ?? '' : clinic?.provider.nameEn ?? '',
            url,
          });
          return;
        } catch {
          // fallback to clipboard
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        showToast(isBangla ? 'লিঙ্ক কপি করা হয়েছে!' : 'Link copied to clipboard!');
      } catch {
        showToast(url);
      }
    }
  };

  const handleCall = () => {
    const phone = clinic?.location.phone || clinic?.provider.phone;
    if (phone && typeof window !== 'undefined') {
      window.location.href = buildTelUrl(phone);
    }
  };

  const handleDirections = () => {
    if (!clinic) return;
    const { lat, lng } = clinic.location;
    const url = buildDirectionsUrl(lat, lng);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBook = (serviceId?: string, vetId?: string) => {
    if (!clinic) return;
    const bookingUrl = buildBookingUrl({
      locationId: clinic.location.id,
      serviceId,
      vetId,
    });
    router.push(`/${locale}${bookingUrl}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="w-full h-72 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Card className="p-8">
          <EmptyState
            icon={<span className="text-4xl">🏥</span>}
            title={isBangla ? 'ক্লিনিক পাওয়া যায়নি' : 'Clinic Not Found'}
            description={
              isBangla
                ? 'অনুরোধকৃত ক্লিনিকের তথ্য খুঁজে পাওয়া যায়নি অথবা এটি মুছে ফেলা হয়েছে।'
                : 'The requested clinic could not be found or has been removed.'
            }
          />
          <div className="mt-6 flex justify-center">
            <Button variant="primary" onClick={() => router.push(`/${locale}/clinics`)}>
              {isBangla ? 'ক্লিনিক তালিকায় ফিরুন' : 'Back to Clinics'}
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const { location, provider, hours, vets, services } = clinic;
  const clinicName = (isBangla ? provider.nameBn : provider.nameEn) || provider.nameEn || '';
  const clinicSubName = isBangla ? provider.nameEn : provider.nameBn;
  const address = (isBangla ? location.addressBn : location.addressEn) || location.addressEn || '';
  const description =
    (isBangla ? provider.descriptionBn : provider.descriptionEn) || provider.descriptionEn || '';

  const photos =
    location.photos && location.photos.length > 0
      ? location.photos
      : ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800'];

  const currentDayIndex = new Date().getDay(); // 0 = Sunday

  return (
    <div className="min-h-screen bg-green-50/20 dark:bg-gray-900 pb-28 text-content-primary">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-bangla animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 text-xs font-bangla text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <button onClick={() => router.push(`/${locale}`)} className="hover:text-green-700">
            {isBangla ? 'হোম' : 'Home'}
          </button>
          <span>/</span>
          <button onClick={() => router.push(`/${locale}/clinics`)} className="hover:text-green-700">
            {isBangla ? 'ক্লিনিকসমূহ' : 'Clinics'}
          </button>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium truncate">
            {clinicName}
          </span>
        </nav>

        {/* Hero Photo Carousel / Showcase */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[selectedPhotoIdx] || photos[0]}
              alt={clinicName}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Badges on Top of Photo */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {provider.verification === 'verified' && (
                <span className="bg-green-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                  ✓ {isBangla ? 'যাচাইকৃত ভেট ক্লিনিক' : 'Verified Clinic'}
                </span>
              )}
              {provider.isGovernment ? (
                <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                  🏛️ {isBangla ? 'সরকারি হাসপাতাল' : 'Government Hospital'}
                </span>
              ) : (
                <span className="bg-purple-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                  🏥 {isBangla ? 'বেসরকারি পেট ক্লিনিক' : 'Private Clinic'}
                </span>
              )}
              {location.is24h && (
                <span className="bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                  🕒 {isBangla ? '২৪/৭ খোলা' : '24/7 Open'}
                </span>
              )}
              {location.hasEmergency && (
                <span className="bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow animate-pulse">
                  🚨 {isBangla ? 'জরুরি সেবা' : 'Emergency Available'}
                </span>
              )}
            </div>

            {/* Photo Thumbnails Selector if Multiple Photos */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-2 bg-black/40 p-1.5 rounded-lg backdrop-blur-sm">
                {photos.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIdx(idx)}
                    className={`w-12 h-10 rounded overflow-hidden border-2 transition ${
                      selectedPhotoIdx === idx ? 'border-white scale-105' : 'border-transparent opacity-70'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Header & Clinic Title Card */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold font-bangla text-gray-900 dark:text-gray-100">
                {clinicName}
              </h1>
              {clinicSubName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {clinicSubName} {location.nameEn ? `· ${location.nameEn}` : ''}
                </p>
              )}

              {/* Rating & Distance */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm font-bangla">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  <span>★</span>
                  <span>{provider.ratingAvg.toFixed(1)}</span>
                  <span className="text-xs text-amber-700/80 dark:text-amber-400 font-normal">
                    ({provider.ratingCount} {isBangla ? 'রিভিউ' : 'reviews'})
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span>📍</span>
                  <span>{address}</span>
                </div>
              </div>
            </div>

            {/* Quick Status Badge */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-bangla ${
                  location.is24h
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}
              >
                ● {location.is24h ? (isBangla ? 'এখন খোলা (২৪ ঘণ্টা)' : 'Open (24/7)') : (isBangla ? 'খোলা' : 'Open')}
              </span>
              {location.offersHomeVisit && (
                <span className="text-xs text-green-700 dark:text-green-400 font-bangla font-medium">
                  🏠 {isBangla ? `${location.homeVisitRadiusKm ?? 8} কিমি হোম ভিজিট` : `Home visit within ${location.homeVisitRadiusKm ?? 8}km`}
                </span>
              )}
            </div>
          </div>

          {/* Action Row: Call, Directions, Share, Report (MAP-6 Integrated) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCall}
              className="flex items-center justify-center gap-1.5"
            >
              <span>📞</span>
              <span>{isBangla ? 'কল করুন' : 'Call'}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleDirections}
              className="flex items-center justify-center gap-1.5"
            >
              <span>🗺️</span>
              <span>{isBangla ? 'পথ দেখুন' : 'Directions'}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5"
            >
              <span>📤</span>
              <span>{isBangla ? 'শেয়ার' : 'Share'}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReportModalOpen(true)}
              className="flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600"
            >
              <span>⚠️</span>
              <span>{isBangla ? 'ভুল তথ্য' : 'Report'}</span>
            </Button>
          </div>
        </Card>

        {/* 2-Column Section: Overview & Operating Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* About / Facilities */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-lg font-bold font-bangla text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>ℹ️</span>
              <span>{isBangla ? 'ক্লিনিক পরিচিতি ও সুবিধাসমূহ' : 'About & Facilities'}</span>
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-bangla leading-relaxed mb-4">
              {description}
            </p>

            {/* Treated Species Chips */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-bangla">
                {isBangla ? 'যেসব প্রাণীর চিকিৎসা করা হয়' : 'Species Treated'}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {location.speciesTreated.map((sp) => {
                  const labelMap: Record<string, { bn: string; en: string; icon: string }> = {
                    dog: { bn: 'কুকুর', en: 'Dogs', icon: '🐕' },
                    cat: { bn: 'বিড়াল', en: 'Cats', icon: '🐈' },
                    bird: { bn: 'পাখি', en: 'Birds', icon: '🦜' },
                    rabbit: { bn: 'খরগোশ', en: 'Rabbits', icon: '🐇' },
                    other: { bn: 'অন্যান্য প্রাণী', en: 'Other animals', icon: '🐾' },
                  };
                  const item = labelMap[sp] || { bn: sp, en: sp, icon: '🐾' };
                  return (
                    <Chip
                      key={sp}
                      label={`${item.icon} ${isBangla ? item.bn : item.en}`}
                      isSelected={false}
                    />
                  );
                })}
              </div>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-bangla text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <span>🛡️</span>
                <span>{isBangla ? 'লাইসেন্সকৃত ভেট ডাক্তার' : 'Licensed Vets'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>⏱️</span>
                <span>{isBangla ? `${location.cancelCutoffHours} ঘণ্টা পূর্ব বাতিল সুবিধা` : `${location.cancelCutoffHours}h cancellation cutoff`}</span>
              </div>
              {location.offersHomeVisit && (
                <div className="flex items-center gap-1.5">
                  <span>🚗</span>
                  <span>{isBangla ? 'হোম সার্ভিস উপলব্ধ' : 'Home Service Available'}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Operating Hours Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold font-bangla text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>🕒</span>
                <span>{isBangla ? 'সময়সূচি' : 'Hours'}</span>
              </h2>
              {location.is24h && (
                <span className="text-xs bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">
                  ২৪/৭
                </span>
              )}
            </div>

            {location.is24h ? (
              <p className="text-sm text-green-700 dark:text-green-400 font-bangla leading-relaxed">
                {isBangla
                  ? 'এই ক্লিনিকটি সার্বক্ষণিক ২৪ ঘণ্টা এবং সপ্তাহের ৭ দিনই খোলা থাকে।'
                  : 'This clinic is open 24 hours a day, 7 days a week for all cases.'}
              </p>
            ) : (
              <div className="space-y-2 text-xs font-bangla">
                {(showAllHours ? [0, 1, 2, 3, 4, 5, 6] : [currentDayIndex]).map((dayIdx) => {
                  const dayHour = hours.find((h) => h.weekday === dayIdx);
                  const isToday = dayIdx === currentDayIndex;
                  const dayName = isBangla ? WEEKDAYS_BN[dayIdx] : WEEKDAYS_EN[dayIdx];

                  return (
                    <div
                      key={dayIdx}
                      className={`flex justify-between items-center py-1.5 px-2 rounded ${
                        isToday
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-200 font-semibold'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {isToday && <span>•</span>}
                        <span>{dayName}</span>
                        {isToday && (
                          <span className="text-[10px] text-green-600 dark:text-green-400">
                            ({isBangla ? 'আজ' : 'Today'})
                          </span>
                        )}
                      </span>
                      <span>
                        {dayHour
                          ? `${dayHour.openTime.slice(0, 5)} - ${dayHour.closeTime.slice(0, 5)}`
                          : isBangla
                            ? 'সাপ্তাহিক বন্ধ'
                            : 'Closed'}
                      </span>
                    </div>
                  );
                })}

                <button
                  onClick={() => setShowAllHours((prev) => !prev)}
                  className="w-full text-center text-xs text-green-700 dark:text-green-400 font-medium hover:underline mt-2 pt-1 border-t border-gray-100 dark:border-gray-800"
                >
                  {showAllHours
                    ? isBangla
                      ? 'সংক্ষিপ্ত দেখুন ▲'
                      : 'Show less ▲'
                    : isBangla
                      ? 'সপ্তাহের সম্পূর্ণ সময়সূচি ▼'
                      : 'View full week schedule ▼'}
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Attending Doctors / Licensed Vets (MAP-5 requirement) */}
        <div className="mb-6">
          <h2 className="text-xl font-bold font-bangla text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>🩺</span>
              <span>{isBangla ? 'কর্মরত রেজিস্টার্ড পশু চিকিৎসকগণ' : 'Attending Registered Veterinarians'}</span>
            </span>
            <span className="text-xs font-normal text-gray-500">
              {vets.length} {isBangla ? 'জন চিকিৎসক' : 'doctors'}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vets.map((vet) => {
              const vetName = (isBangla ? vet.fullNameBn : vet.fullNameEn) || vet.fullNameEn;
              const subName = isBangla ? vet.fullNameEn : vet.fullNameBn;
              return (
                <Card key={vet.id} className="p-4 flex gap-4 items-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vet.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200'}
                    alt={vetName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="text-base font-bold font-bangla text-gray-900 dark:text-gray-100 truncate">
                        {vetName}
                      </h3>
                      {vet.verification === 'verified' && (
                        <span className="text-[11px] bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 font-semibold px-2 py-0.5 rounded-full shrink-0">
                          ✓ BVC
                        </span>
                      )}
                    </div>
                    {subName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-sans truncate mb-1">
                        {subName}
                      </p>
                    )}
                    {vet.bvcRegNo && (
                      <p className="text-xs text-green-700 dark:text-green-400 font-mono font-medium">
                        {isBangla ? 'রেজি নং:' : 'Reg:'} {vet.bvcRegNo}
                      </p>
                    )}
                    {vet.degrees && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 font-bangla mt-1">
                        🎓 {vet.degrees}
                      </p>
                    )}
                    {vet.specialization && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-bangla mt-0.5">
                        🔬 {vet.specialization}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs font-bangla">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {isBangla ? 'পরামর্শ ফি:' : 'Fee:'}{' '}
                        <span className="text-green-700 dark:text-green-400 font-bold">
                          ৳{vet.consultationFee ?? 500}
                        </span>
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleBook(undefined, vet.id)}
                        className="text-xs py-1 px-3"
                      >
                        {isBangla ? 'ডাক্তার দেখান' : 'Consult Vet'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Services & Pricing Matrix */}
        <div className="mb-6">
          <h2 className="text-xl font-bold font-bangla text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>📋</span>
              <span>{isBangla ? 'সেবা ও মূল্য তালিকা' : 'Services & Pricing'}</span>
            </span>
            <span className="text-xs text-gray-500 font-bangla">
              {services.length} {isBangla ? 'টি সেবা উপলভ্য' : 'services offered'}
            </span>
          </h2>

          <Card className="divide-y divide-gray-100 dark:divide-gray-800">
            {services.map((svc) => {
              const svcName = (isBangla ? svc.nameBn : svc.nameEn) || svc.nameEn || '';
              return (
                <div
                  key={svc.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-green-50/20 dark:hover:bg-gray-800/40 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold font-bangla text-gray-900 dark:text-gray-100">
                        {svcName}
                      </h3>
                      {svc.serviceSlug === 'emergency_care' && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                          {isBangla ? 'জরুরি' : 'Emergency'}
                        </span>
                      )}
                    </div>
                    {svc.durationMinutes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bangla mt-0.5">
                        ⏱️ {svc.durationMinutes} {isBangla ? 'মিনিট সেশন' : 'mins session'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-base font-bold text-green-700 dark:text-green-400 font-bangla">
                      ৳{svc.price}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleBook(svc.serviceId)}
                      className="font-bangla shrink-0"
                    >
                      {isBangla ? 'বুক করুন' : 'Book'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* REV-1: Reviews & Ratings (Owner: Zimia) */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-xl font-bold font-bangla text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>⭐</span>
                <span>{isBangla ? 'গ্রাহকদের রেটিং ও অভিজ্ঞতা' : 'Reviews & Patient Experience'}</span>
              </h2>
              <p className="text-xs text-gray-500 font-bangla mt-0.5">
                {isBangla
                  ? `${reviewSummary.ratingCount} টি যাচাইকৃত অভিজ্ঞতার উপর ভিত্তি করে`
                  : `Based on ${reviewSummary.ratingCount} verified patient visits`}
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setWriteReviewModalOpen(true)}
              className="bg-green-700 hover:bg-green-800 text-white font-bangla font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>✍️</span>
              <span>{isBangla ? 'রিভিউ লিখুন' : 'Write a Review'}</span>
            </Button>
          </div>

          {/* Rating Summary Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col items-center justify-center sm:border-r border-gray-200 dark:border-gray-700 sm:pr-4">
              <span className="text-4xl font-black text-amber-500">{reviewSummary.ratingAvg.toFixed(1)}</span>
              <div className="flex text-amber-400 text-lg my-1">
                {'★'.repeat(Math.round(reviewSummary.ratingAvg))}
                {'☆'.repeat(5 - Math.round(reviewSummary.ratingAvg))}
              </div>
              <span className="text-xs text-gray-500 font-bangla">
                {reviewSummary.ratingCount} {isBangla ? 'টি মোট রিভিউ' : 'total reviews'}
              </span>
            </div>

            <div className="sm:col-span-2 space-y-1.5 justify-center flex flex-col">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = (reviewSummary.breakdown as any)[star] || 0;
                const pct = reviewSummary.ratingCount > 0 ? (count / reviewSummary.ratingCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs font-bangla">
                    <span className="w-6 text-gray-600 dark:text-gray-300 font-bold">{star} ★</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-gray-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-400 font-bangla text-center py-6">
                {isBangla ? 'এখনও কোনো রিভিউ জমা পড়েনি।' : 'No reviews submitted yet.'}
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-750 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 flex items-center justify-center font-bold text-xs">
                        {rev.authorName ? rev.authorName[0] : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 font-bangla">
                            {rev.authorName}
                          </span>
                          {rev.isVerifiedVisit && (
                            <span className="text-[10px] bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 px-1.5 py-0.2 rounded font-bangla font-semibold">
                              ✓ {isBangla ? 'যাচাইকৃত ভিজিট' : 'Verified Visit'}
                            </span>
                          )}
                        </div>
                        {rev.vetName && (
                          <p className="text-[11px] text-green-700 dark:text-green-400 font-bangla">
                            👨‍⚕️ {rev.vetName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-bangla leading-relaxed mt-1">
                      {rev.comment}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 dark:border-gray-800 text-[10px] text-gray-400 font-bangla">
                    <span>{new Date(rev.createdAt).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US')}</span>
                    <button
                      onClick={() => setReportModalOpen(true)}
                      className="text-gray-400 hover:text-red-500 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>🚩</span>
                      <span>{isBangla ? 'রিপোর্ট' : 'Report'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>

      {/* Write Review Modal (REV-1) */}
      {writeReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold font-bangla text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <span>✍️</span>
                <span>{isBangla ? 'ক্লিনিকের অভিজ্ঞতা জানান' : 'Write a Review'}</span>
              </h3>
              <button
                onClick={() => setWriteReviewModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Star Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 font-bangla mb-2">
                {isBangla ? 'আপনার রেটিং নির্ধারণ করুন' : 'Your Rating'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-3xl transition hover:scale-110 cursor-pointer focus:outline-none"
                  >
                    {star <= reviewRating ? '⭐' : '☆'}
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-600 ml-2 font-bangla">
                  {reviewRating} / 5
                </span>
              </div>
            </div>

            {/* Doctor Picker */}
            {vets.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 font-bangla mb-1">
                  {isBangla ? 'চিকিৎসক (ঐচ্ছিক)' : 'Doctor / Vet (Optional)'}
                </label>
                <select
                  value={reviewVetId}
                  onChange={(e) => setReviewVetId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bangla"
                >
                  <option value="">{isBangla ? 'সাধারণ পরিদর্শন / যেকোনো ডাক্তার' : 'General Visit'}</option>
                  {vets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {isBangla ? v.fullNameBn || v.fullNameEn : v.fullNameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 font-bangla mb-1">
                {isBangla ? 'আপনার মূল্যায়ন ও মন্তব্য' : 'Your Review & Feedback'}
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  isBangla
                    ? 'ক্লিনিকের সেবা, পরিষ্কার-পরিচ্ছন্নতা ও ডাক্তারের আচরণ কেমন ছিল?'
                    : 'How was the treatment, doctor care, and clinic hygiene?'
                }
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bangla focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setWriteReviewModalOpen(false)}>
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="bg-green-700 text-white font-bangla"
              >
                {submittingReview
                  ? (isBangla ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...')
                  : (isBangla ? 'রিভিউ জমা দিন' : 'Submit Review')}
              </Button>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* REV-2: Report Modal — reason selection + submitContentReport RPC */}
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="provider"
        targetId={clinicId}
        targetTitle={clinic ? (isBangla ? clinic.provider.nameBn ?? '' : clinic.provider.nameEn ?? '') : ''}
        onSuccess={() =>
          showToast(
            isBangla
              ? 'আপনার রিপোর্ট গ্রহণ করা হয়েছে। পর্যালোচনার জন্য ধন্যবাদ!'
              : 'Thank you! Your report has been submitted for moderation.'
          )
        }
      />

      {/* Sticky Bottom Action Bar (PRD & Design requirement) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <p className="text-xs text-gray-500 font-bangla truncate max-w-xs">{clinicName}</p>
            <p className="text-sm font-bold text-green-700 dark:text-green-400 font-bangla">
              {isBangla ? 'পরামর্শ ফি: ৳' : 'Fee: ৳'}
              {vets[0]?.consultationFee ?? services[0]?.price ?? 500}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={handleCall}
              className="flex-1 sm:flex-initial py-3 px-5 flex items-center justify-center gap-2 font-bangla shrink-0"
            >
              <span>📞</span>
              <span>{isBangla ? 'কল করুন' : 'Call'}</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => handleBook()}
              className="flex-1 sm:flex-initial py-3 px-8 flex items-center justify-center gap-2 font-bangla shadow-md bg-green-700 hover:bg-green-800 text-white font-bold"
            >
              <span>📅</span>
              <span>{isBangla ? 'অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book Appointment'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
