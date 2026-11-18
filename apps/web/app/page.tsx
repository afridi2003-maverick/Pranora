'use client';

import React from 'react';
import { LocaleProvider, useLocale } from '@pranora/i18n';
import { EmergencyButton } from '@pranora/ui';
import { LanguageHeader } from '../components/LanguageHeader';

function HomeContent() {
  const { isBangla } = useLocale();

  return (
    <div className="min-h-screen flex flex-col bg-green-50/40 text-content-primary">
      <LanguageHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4 font-bangla">
          🐾 {isBangla ? 'প্রাণোরা · আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন' : 'Pranora · Complete Pet Care'}
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl font-bangla">
          {isBangla
            ? 'আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায় — দত্তক, উদ্ধার এবং পশুচিকিৎসা সেবা।'
            : 'Complete care for your pet, all in one place — adoption, rescue, and veterinary care.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/pets"
            className="px-6 py-3 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition shadow-1 min-h-[44px] flex items-center"
          >
            🐾 {isBangla ? 'আমার পোষা প্রাণী' : 'My Pets'}
          </a>
          <a
            href="/services"
            className="px-6 py-3 rounded-full bg-white border border-green-600 text-green-700 font-medium hover:bg-green-50 transition shadow-1 min-h-[44px] flex items-center"
          >
            {isBangla ? 'সেবাসমূহ দেখুন' : 'Explore Services'}
          </a>
          <EmergencyButton
            variant="pill"
            label={isBangla ? 'জরুরি সেবা' : 'Emergency Help'}
          />
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <LocaleProvider>
      <HomeContent />
    </LocaleProvider>
  );
}
