'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Select } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';

// 8 Divisions of Bangladesh
const BANGLADESH_DIVISIONS = [
  { id: 3, nameBn: 'ঢাকা', nameEn: 'Dhaka' },
  { id: 2, nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram' },
  { id: 6, nameBn: 'রাজশাহী', nameEn: 'Rajshahi' },
  { id: 4, nameBn: 'খুলনা', nameEn: 'Khulna' },
  { id: 1, nameBn: 'বরিশাল', nameEn: 'Barishal' },
  { id: 8, nameBn: 'সিলেট', nameEn: 'Sylhet' },
  { id: 7, nameBn: 'রংপুর', nameEn: 'Rangpur' },
  { id: 5, nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh' },
];

export default function LocationPermissionPage() {
  const router = useRouter();
  const { isBangla, locale } = useLocale();

  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<string>('3');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAllowLocation = () => {
    setIsDetecting(true);
    setFeedback(null);

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetecting(false);
          const { latitude, longitude } = position.coords;
          // Successfully obtained coordinates
          setFeedback(
            isBangla
              ? `অবস্থান শনাক্ত হয়েছে! (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`
              : `Location detected! (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`
          );
          setTimeout(() => {
            router.push(`/${locale}`);
          }, 800);
        },
        (error) => {
          setIsDetecting(false);
          setPermissionDenied(true);
          console.warn('Geolocation denied or unavailable:', error.message);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setIsDetecting(false);
      setPermissionDenied(true);
    }
  };

  const handleManualConfirm = () => {
    const div = BANGLADESH_DIVISIONS.find((d) => d.id.toString() === selectedDivision);
    setFeedback(
      isBangla
        ? `নির্বাচিত এলাকা: ${div?.nameBn}`
        : `Selected region: ${div?.nameEn}`
    );
    setTimeout(() => {
      router.push(`/${locale}`);
    }, 600);
  };

  const handleSkip = () => {
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen bg-green-50/40 dark:bg-gray-900 text-content-primary flex flex-col">
      <LanguageHeader />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex items-center justify-center text-3xl mx-auto mb-3 shadow-xs">
              📍
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-bangla text-green-900 dark:text-green-300">
              {isBangla ? 'আপনার অবস্থান' : 'Your Location'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-bangla max-w-sm mx-auto">
              {isBangla
                ? 'কাছের পশু চিকিৎসক, জরুরি ক্লিনিক ও উদ্ধারকারী সহজে খুঁজে পেতে আপনার অবস্থানের অনুমতি দিন।'
                : 'Allow location access to discover nearby veterinarians, 24/7 clinics, and emergency rescuers.'}
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-md rounded-2xl border border-gray-100 dark:border-gray-700">
            {feedback && (
              <div className="p-3 mb-5 text-sm font-bangla rounded-xl bg-green-50 text-green-800 border border-green-200">
                {feedback}
              </div>
            )}

            {!permissionDenied ? (
              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAllowLocation}
                  disabled={isDetecting}
                  className="w-full font-bangla flex items-center justify-center gap-2"
                >
                  {isDetecting ? (
                    <span>{isBangla ? 'শনাক্ত হচ্ছে...' : 'Detecting GPS...'}</span>
                  ) : (
                    <>
                      <span>🎯</span>
                      <span>{isBangla ? 'অবস্থানের অনুমতি দিন' : 'Allow Location'}</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setPermissionDenied(true)}
                  className="w-full font-bangla text-gray-600 hover:text-gray-900"
                >
                  {isBangla ? 'ম্যানুয়ালি এলাকা বেছে নিন' : 'Choose region manually'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 font-bangla">
                  <strong>{isBangla ? 'অনুমতি দেওয়া হয়নি:' : 'GPS unavailable:'}</strong>{' '}
                  {isBangla
                    ? 'আপনি নিচে বিভাগ নির্বাচন করে ক্লিনিক ও উদ্ধার সেবা খুঁজতে পারেন।'
                    : 'Select your administrative division to search for nearby clinics.'}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 font-bangla">
                    {isBangla ? 'বিভাগ নির্বাচন করুন' : 'Select Division'}
                  </label>
                  <Select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    options={BANGLADESH_DIVISIONS.map((d) => ({
                      value: d.id.toString(),
                      label: isBangla ? d.nameBn : d.nameEn,
                    }))}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleManualConfirm}
                  className="w-full font-bangla"
                >
                  {isBangla ? 'নিশ্চিত করুন' : 'Confirm Region'}
                </Button>
              </div>
            )}

            {/* Skip Option */}
            <div className="mt-5 text-center pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bangla hover:underline"
              >
                {isBangla ? 'পরে করুন (এড়িয়ে যান)' : 'Skip for now'}
              </button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
