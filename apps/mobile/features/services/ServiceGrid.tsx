import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocale } from '@pranora/i18n';

// ── MVP category config ──────────────────────────────────────────────────────

interface CategoryConfig {
  slug: string;
  icon: string;
  isMvp: boolean;
  navigateTo: string | null;
}

const CATEGORY_CONFIG: CategoryConfig[] = [
  { slug: 'vet',          icon: '🩺', isMvp: true,  navigateTo: '/map' },
  { slug: 'vaccination',  icon: '💉', isMvp: true,  navigateTo: '/vaccination' },
  { slug: 'emergency',    icon: '🚨', isMvp: true,  navigateTo: '/emergency' },
  { slug: 'rescue',       icon: '🛟', isMvp: true,  navigateTo: '/rescue/report' },
  { slug: 'adoption',     icon: '🏠', isMvp: true,  navigateTo: '/adoption' },
  { slug: 'tips',         icon: '📚', isMvp: true,  navigateTo: '/tips' },
  { slug: 'grooming',     icon: '✂️', isMvp: false, navigateTo: null },
  { slug: 'boarding',     icon: '🏨', isMvp: false, navigateTo: null },
  { slug: 'home_visit',   icon: '🏡', isMvp: false, navigateTo: null },
  { slug: 'online_consult', icon: '💻', isMvp: false, navigateTo: null },
  { slug: 'pet_shop',     icon: '🛒', isMvp: false, navigateTo: null },
  { slug: 'training',     icon: '🎓', isMvp: true,  navigateTo: '/training' },
  { slug: 'sitting',      icon: '🐾', isMvp: true,  navigateTo: '/sitting' },
  { slug: 'taxi',         icon: '🚗', isMvp: false, navigateTo: null },
];

// ── Props ────────────────────────────────────────────────────────────────────

interface ServiceGridProps {
  onSelectCategory: (slug: string, navigateTo: string) => void;
  loading?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ServiceGrid({ onSelectCategory, loading = false }: ServiceGridProps) {
  const { t, isBangla } = useLocale();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2F7B53" />
      </View>
    );
  }

  const getCategoryName = (slug: string): string => {
    if (slug === 'tips') {
      return isBangla ? 'পরামর্শ ও টিপস' : 'Care Tips';
    }
    // Safe key lookup with fallback
    const key = `services:categories.${slug}`;
    const name = t(key as Parameters<typeof t>[0]);
    return name || slug;
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Page subtitle */}
      <Text className="text-sm text-gray-500 mb-5 text-center">
        {t('services:catalog.subtitle')}
      </Text>

      {/* Grid — 2 columns */}
      <View className="flex-row flex-wrap gap-3">
        {CATEGORY_CONFIG.map((cat) => {
          const name = getCategoryName(cat.slug);

          if (cat.isMvp) {
            return (
              <TouchableOpacity
                key={cat.slug}
                onPress={() => cat.navigateTo && onSelectCategory(cat.slug, cat.navigateTo)}
                className="bg-white rounded-2xl border border-green-200 p-4 items-center shadow-sm"
                style={{ width: '47%' }}
                activeOpacity={0.8}
              >
                <Text className="text-4xl mb-2">{cat.icon}</Text>
                <Text className="text-sm font-bold text-gray-900 text-center">{name}</Text>
                <View className="mt-2 bg-green-50 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-green-700 font-medium">
                    {t('services:phase.mvp')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }

          // Non-MVP: greyed out, no tap
          return (
            <View
              key={cat.slug}
              className="bg-gray-50 rounded-2xl border border-gray-200 p-4 items-center opacity-50"
              style={{ width: '47%' }}
            >
              <Text className="text-4xl mb-2 grayscale">{cat.icon}</Text>
              <Text className="text-sm font-medium text-gray-500 text-center">{name}</Text>
              <View className="mt-2 bg-gray-100 rounded-full px-2 py-0.5">
                <Text className="text-xs text-gray-400">
                  {isBangla ? t('services:comingSoon') : t('services:comingSoon')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
