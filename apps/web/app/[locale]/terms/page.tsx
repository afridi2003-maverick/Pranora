'use client';

import React from 'react';
import { useLocale } from '@pranora/i18n';
import { Card } from '@pranora/ui';
import { LanguageHeader } from '../../../components/LanguageHeader';

export default function TermsPage() {
  const { t } = useLocale();

  const sections = [
    'platform',
    'disclaimer',
    'rescue',
    'prohibited',
    'liability',
    'governing',
  ] as const;

  return (
    <div className="min-h-screen bg-app-bg">
      <LanguageHeader />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Card className="p-6 sm:p-10 bg-white shadow-sm">
          <div className="border-b border-stroke-subtle pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary mb-2">
              📄 {t('legal:terms.title')}
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary">
              {t('legal:terms.lastUpdated')}
            </p>
          </div>

          <p className="text-content-secondary text-sm sm:text-base leading-relaxed mb-8">
            {t('legal:terms.intro')}
          </p>

          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section} className="bg-surface-secondary/20 p-5 rounded-xl border border-stroke-subtle">
                <h2 className="text-base sm:text-lg font-bold text-content-primary mb-2">
                  {t(`legal:terms.sections.${section}.title` as never)}
                </h2>
                <p className="text-content-secondary text-sm leading-relaxed">
                  {t(`legal:terms.sections.${section}.content` as never)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
