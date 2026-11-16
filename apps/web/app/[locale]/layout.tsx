import React from 'react';
import { LocaleProvider, isValidLocale, DEFAULT_LOCALE } from '@pranora/i18n';
import { LanguageHeader } from '../../components/LanguageHeader';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const activeLocale = isValidLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  return (
    <LocaleProvider initialLocale={activeLocale}>
      <div lang={activeLocale} className="min-h-screen flex flex-col bg-app-bg text-content-primary">
        <LanguageHeader />
        <div className="flex-1">{children}</div>
      </div>
    </LocaleProvider>
  );
}
