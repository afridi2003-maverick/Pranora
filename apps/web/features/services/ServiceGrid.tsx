'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Card, Chip } from '@pranora/ui';

export interface CategoryItem {
  slug: string;
  icon: string;
  isMvp: boolean;
  navigateTo: string | null;
}

export const CATEGORIES: CategoryItem[] = [
  { slug: 'vet',            icon: '🩺', isMvp: true,  navigateTo: '/map' },
  { slug: 'vaccination',    icon: '💉', isMvp: true,  navigateTo: '/vaccination' },
  { slug: 'emergency',      icon: '🚨', isMvp: true,  navigateTo: '/emergency' },
  { slug: 'rescue',         icon: '🛟', isMvp: true,  navigateTo: '/rescue/report' },
  { slug: 'adoption',       icon: '🏠', isMvp: true,  navigateTo: '/adoption' },
  { slug: 'tips',           icon: '📚', isMvp: true,  navigateTo: '/tips' },
  { slug: 'grooming',       icon: '✂️', isMvp: true,  navigateTo: '/services/grooming' },
  { slug: 'boarding',       icon: '🏨', isMvp: false, navigateTo: null },
  { slug: 'home_visit',     icon: '🏡', isMvp: true,  navigateTo: '/services/home-visit' },
  { slug: 'online_consult', icon: '💻', isMvp: false, navigateTo: null },
  { slug: 'pet_shop',       icon: '🛒', isMvp: false, navigateTo: null },
  { slug: 'training',       icon: '🎓', isMvp: true,  navigateTo: '/training' },
  { slug: 'sitting',        icon: '🐾', isMvp: true,  navigateTo: '/sitting' },
  { slug: 'taxi',           icon: '🚗', isMvp: false, navigateTo: null },
];

export function ServiceGrid() {
  const { t, locale } = useLocale();
  const router = useRouter();

  const handleNavigate = (path: string | null) => {
    if (!path) return;
    router.push(`/${locale}${path}`);
  };

  const getCategoryName = (slug: string): string => {
    if (slug === 'tips') {
      return t('services:tips.title') || 'পরামর্শ ও নিবন্ধ';
    }
    const key = `services:categories.${slug}`;
    const name = t(key as Parameters<typeof t>[0]);
    return name || slug;
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary mb-2">
          {t('services:catalog.title')}
        </h2>
        <p className="text-content-secondary text-sm sm:text-base max-w-xl mx-auto">
          {t('services:catalog.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {CATEGORIES.map((cat) => {
          const name = getCategoryName(cat.slug);

          if (cat.isMvp) {
            return (
              <Card
                key={cat.slug}
                isInteractive
                onClick={() => handleNavigate(cat.navigateTo)}
                className="flex flex-col items-center justify-center p-5 text-center bg-white border border-green-200 hover:border-green-500 hover:shadow-md transition-all group"
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform select-none">
                  {cat.icon}
                </span>
                <span className="font-semibold text-content-primary text-sm sm:text-base mb-2">
                  {name}
                </span>
                <Chip
                  variant="status"
                  statusType="completed"
                  label={t('services:phase.mvp')}
                  className="text-xs"
                />
              </Card>
            );
          }

          return (
            <Card
              key={cat.slug}
              className="flex flex-col items-center justify-center p-5 text-center bg-gray-50/70 border border-dashed border-gray-200 opacity-60 cursor-not-allowed select-none"
            >
              <span className="text-4xl mb-3 grayscale opacity-70">
                {cat.icon}
              </span>
              <span className="font-medium text-content-secondary text-sm sm:text-base mb-2">
                {name}
              </span>
              <Chip
                variant="status"
                statusType="neutral"
                label={t('services:comingSoon')}
                className="text-xs"
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
