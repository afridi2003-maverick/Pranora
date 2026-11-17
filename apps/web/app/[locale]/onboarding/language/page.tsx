'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';
import type { Locale } from '@pranora/types';

export default function LanguageOnboardingPage() {
  const router = useRouter();
  const { locale, setLocale, isBangla } = useLocale();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);

  const handleSelect = async (loc: Locale) => {
    setSelectedLocale(loc);
    await setLocale(loc);
  };

  const handleContinue = () => {
    router.push(`/${selectedLocale}/login`);
  };

  return (
    <div className="min-h-screen bg-green-50/40 dark:bg-gray-900 text-content-primary flex flex-col">
      <LanguageHeader />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-4xl mb-3 inline-block">🌐</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-bangla text-green-900 dark:text-green-300">
              {isBangla ? 'ভাষা বেছে নিন' : 'Choose Your Language'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-bangla max-w-md mx-auto">
              {isBangla
                ? 'প্রাণোরা বাংলায় সম্পূর্ণ সেবা প্রদান করে। আপনি যেকোনো সময় সেটিংসে ভাষা পরিবর্তন করতে পারবেন।'
                : 'Pranora is bilingual. You can switch your preferred language anytime in settings.'}
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-md rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="space-y-4 mb-8">
              {/* Option 1: Bangla (Default) */}
              <div
                onClick={() => handleSelect('bn')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  selectedLocale === 'bn'
                    ? 'border-green-600 bg-green-50/60 dark:bg-green-900/30 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800/40 flex items-center justify-center text-xl font-bold text-green-800 dark:text-green-300">
                    বাং
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 font-bangla">
                        বাংলা
                      </h3>
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bangla">
                        ডিফল্ট
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-bangla">
                      আপনার পোষা প্রাণীর সম্পূর্ণ সেবা বাংলায়
                    </p>
                  </div>
                </div>

                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors border-green-600">
                  {selectedLocale === 'bn' && (
                    <div className="w-3.5 h-3.5 rounded-full bg-green-600" />
                  )}
                </div>
              </div>

              {/* Option 2: English */}
              <div
                onClick={() => handleSelect('en')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  selectedLocale === 'en'
                    ? 'border-green-600 bg-green-50/60 dark:bg-green-900/30 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center text-xl font-bold text-blue-800 dark:text-blue-300">
                    EN
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      English
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Complete pet care services in English
                    </p>
                  </div>
                </div>

                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors border-green-600">
                  {selectedLocale === 'en' && (
                    <div className="w-3.5 h-3.5 rounded-full bg-green-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              className="w-full font-bangla"
            >
              {selectedLocale === 'bn' ? 'চালিয়ে যান →' : 'Continue →'}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
