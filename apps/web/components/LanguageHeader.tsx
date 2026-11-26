'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { LanguageToggle, ThemeToggle } from '@pranora/ui';
import { useSession } from '../hooks/useSession';

export function LanguageHeader() {
  const { locale, setLocale, isBangla } = useLocale();
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { isAuthenticated, user, profile, signOut } = useSession();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved =
      typeof window !== 'undefined' ? window.localStorage.getItem('pranora-theme') : null;
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
  }, []);

  const handleThemeToggle = (next: 'light' | 'dark') => {
    setTheme(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pranora-theme', next);
    }
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const navLinks = [
    { href: `/${locale}/pets`, label: isBangla ? 'পোষা প্রাণী' : 'My Pets' },
    { href: `/${locale}/clinics`, label: isBangla ? 'ক্লিনিক' : 'Clinics' },
    { href: `/${locale}/services`, label: isBangla ? 'সেবাসমূহ' : 'Services' },
    { href: `/${locale}/adoption`, label: isBangla ? 'দত্তক' : 'Adoption' },
    { href: `/${locale}/rescue/report`, label: isBangla ? 'উদ্ধার' : 'Rescue' },
    { href: `/${locale}/assistant`, label: isBangla ? 'AI সহায়ক' : 'AI Vet' },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}/login`);
  };

  return (
    <header className="w-full border-b border-stroke-subtle bg-app-glass backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 shrink-0 group"
        >
          <span className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center text-lg shadow-1 group-hover:scale-105 transition-transform">
            🐾
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base sm:text-lg font-bold text-green-700 dark:text-lime-400">
              {isBangla ? 'প্রাণোরা' : 'Pranora'}
            </span>
            <span className="hidden sm:block text-[10px] text-content-secondary">
              {isBangla ? 'পেট কেয়ার বাংলাদেশ' : 'Pet Care Bangladesh'}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-pill text-sm font-medium transition-colors ${
                  active
                    ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-lime-400 font-semibold'
                    : 'text-content-secondary hover:text-content-primary hover:bg-green-50/60 dark:hover:bg-green-900/20'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/${locale}/emergency`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-emergency-600 hover:bg-emergency-700 text-white text-xs font-semibold shadow-1 transition-colors"
          >
            <span>🚨</span>
            <span>{isBangla ? 'জরুরি' : 'SOS'}</span>
          </Link>

          <LanguageToggle currentLocale={locale} onToggle={setLocale} />

          <div className="hidden sm:block">
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-xs font-medium text-content-secondary max-w-[110px] truncate">
                {profile?.full_name || user?.phone || user?.email || (isBangla ? 'অ্যাকাউন্ট' : 'Account')}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-pill border border-stroke-subtle bg-app-card hover:border-stroke-medium text-xs font-semibold text-content-primary transition-colors cursor-pointer"
              >
                {isBangla ? 'লগআউট' : 'Sign Out'}
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="px-3.5 py-1.5 rounded-pill bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-1 transition-colors"
            >
              {isBangla ? 'লগইন' : 'Sign In'}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
