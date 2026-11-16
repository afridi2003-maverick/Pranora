'use client';

import React from 'react';
import { useLocale } from '@pranora/i18n';
import { LanguageToggle } from '@pranora/ui';

export function LanguageHeader() {
  const { locale, setLocale } = useLocale();

  return (
    <header className="w-full border-b border-stroke-subtle bg-white/90 dark:bg-green-950/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-green-700 dark:text-lime-400">
          🐾 {locale === 'bn' ? 'প্রাণোরা' : 'Pranora'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle currentLocale={locale} onToggle={setLocale} />
      </div>
    </header>
  );
}
