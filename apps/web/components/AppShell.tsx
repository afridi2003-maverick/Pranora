'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { BottomNav } from '@pranora/ui';
import { LanguageHeader } from './LanguageHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { locale, isBangla } = useLocale();
  const pathname = usePathname() || '/';
  const router = useRouter();

  const getActiveId = () => {
    if (pathname.includes('/pets')) return 'pets';
    if (pathname.includes('/clinics') || pathname.includes('/map')) return 'clinics';
    if (pathname.includes('/services') || pathname.includes('/bookings')) return 'services';
    return 'home';
  };

  const navItems = [
    {
      id: 'home',
      label: isBangla ? 'হোম' : 'Home',
      icon: <span className="text-lg leading-none">🏠</span>,
    },
    {
      id: 'pets',
      label: isBangla ? 'প্রাণী' : 'Pets',
      icon: <span className="text-lg leading-none">🐾</span>,
    },
    {
      id: 'clinics',
      label: isBangla ? 'ক্লিনিক' : 'Clinics',
      icon: <span className="text-lg leading-none">🏥</span>,
    },
    {
      id: 'services',
      label: isBangla ? 'সেবা' : 'Services',
      icon: <span className="text-lg leading-none">✨</span>,
    },
  ];

  const handleNavChange = (id: string) => {
    if (id === 'home') router.push(`/${locale}`);
    else if (id === 'pets') router.push(`/${locale}/pets`);
    else if (id === 'clinics') router.push(`/${locale}/clinics`);
    else if (id === 'services') router.push(`/${locale}/services`);
  };

  return (
    <div lang={locale} className="min-h-screen flex flex-col bg-app-bg text-content-primary">
      <LanguageHeader />
      <div className="flex-1 pb-24 md:pb-8">{children}</div>
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden">
        <BottomNav
          items={navItems}
          activeId={getActiveId()}
          onChange={handleNavChange}
          onFabClick={() => router.push(`/${locale}/emergency`)}
          fabLabel={isBangla ? 'জরুরি সেবা' : 'Emergency Help'}
          fabIcon={<span className="text-xl leading-none">🚨</span>}
        />
      </div>
    </div>
  );
}
