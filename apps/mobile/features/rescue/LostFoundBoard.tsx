import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { LostFoundBoardItem } from '@pranora/api';
import type { SpeciesType } from '@pranora/types';
import { LostFoundCard } from './LostFoundCard';
import { ReportSightingModal } from './ReportSightingModal';
import { MOCK_LOST_FOUND_ITEMS } from './lostFoundMockData';

interface LostFoundBoardProps {
  initialItems?: LostFoundBoardItem[];
  onSubmitSighting?: (params: {
    reportId: string;
    message: string;
    locationText?: string;
    contactPhone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function LostFoundBoard({
  initialItems = MOCK_LOST_FOUND_ITEMS,
  onSubmitSighting,
}: LostFoundBoardProps) {
  const { isBangla } = useLocale();

  const [items] = useState<LostFoundBoardItem[]>(initialItems);
  const [kindFilter, setKindFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<LostFoundBoardItem | null>(null);
  const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
      if (speciesFilter !== 'all' && item.species !== speciesFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesArea = item.area_text?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesArea && !matchesDesc) return false;
      }
      return true;
    });
  }, [items, kindFilter, speciesFilter, search]);

  const handleOpenSighting = (item: LostFoundBoardItem) => {
    setSelectedItem(item);
    setIsSightingModalOpen(true);
  };

  const handleSubmitSighting = async (params: {
    reportId: string;
    message: string;
    locationText?: string;
    contactPhone?: string;
  }) => {
    if (onSubmitSighting) {
      return onSubmitSighting(params);
    }
    await new Promise((r) => setTimeout(r, 400));
    return { success: true };
  };

  const SPECIES_OPTIONS: { id: SpeciesType | 'all'; bn: string; en: string; icon: string }[] = [
    { id: 'all', bn: 'সকল', en: 'All', icon: '🐾' },
    { id: 'dog', bn: 'কুকুর', en: 'Dogs', icon: '🐕' },
    { id: 'cat', bn: 'বিড়াল', en: 'Cats', icon: '🐈' },
    { id: 'rabbit', bn: 'খরগোশ', en: 'Rabbits', icon: '🐇' },
    { id: 'other', bn: 'অন্যান্য', en: 'Other', icon: '✨' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Filters Header */}
      <View className="p-4 bg-white border-b border-gray-200">
        {/* Kind Toggle Pills */}
        <View className="flex-row gap-2 mb-3">
          <TouchableOpacity
            onPress={() => setKindFilter('all')}
            className={`px-3 py-1.5 rounded-full ${
              kindFilter === 'all' ? 'bg-primary' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                kindFilter === 'all' ? 'text-white' : 'text-gray-700'
              }`}
            >
              {isBangla ? 'সকল' : 'All'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setKindFilter('lost')}
            className={`px-3 py-1.5 rounded-full ${
              kindFilter === 'lost' ? 'bg-rose-600' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                kindFilter === 'lost' ? 'text-white' : 'text-gray-700'
              }`}
            >
              ⚠️ {isBangla ? 'হারানো' : 'Lost'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setKindFilter('found')}
            className={`px-3 py-1.5 rounded-full ${
              kindFilter === 'found' ? 'bg-emerald-600' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                kindFilter === 'found' ? 'text-white' : 'text-gray-700'
              }`}
            >
              🐾 {isBangla ? 'প্রাপ্ত' : 'Found'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Species Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-2">
            {SPECIES_OPTIONS.map((sp) => (
              <TouchableOpacity
                key={sp.id}
                onPress={() => setSpeciesFilter(sp.id)}
                className={`px-3 py-1.5 rounded-lg border ${
                  speciesFilter === sp.id
                    ? 'bg-primary border-primary'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    speciesFilter === sp.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {sp.icon} {isBangla ? sp.bn : sp.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Search Input */}
        <TextInput
          placeholder={isBangla ? 'এলাকা বা বিবরণ দিয়ে খুঁজুন...' : 'Search area or description...'}
          value={search}
          onChangeText={setSearch}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 bg-gray-50"
        />
      </View>

      {/* List */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {filteredItems.map((item) => (
          <LostFoundCard
            key={item.id}
            item={item}
            onOpenSightingModal={handleOpenSighting}
          />
        ))}

        {filteredItems.length === 0 && (
          <View className="p-8 items-center justify-center">
            <Text className="text-3xl mb-2">🔍</Text>
            <Text className="text-sm font-bold text-gray-900 mb-1">
              {isBangla ? 'কোনো রিপোর্ট পাওয়া যায়নি' : 'No Reports Found'}
            </Text>
            <Text className="text-xs text-gray-500 text-center">
              {isBangla
                ? 'অন্য কোনো ফিল্টার বা অনুসন্ধান শব্দ ব্যবহার করুন।'
                : 'Try adjusting your search filters.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sighting Modal */}
      <ReportSightingModal
        item={selectedItem}
        visible={isSightingModalOpen}
        onClose={() => setIsSightingModalOpen(false)}
        onSubmitSighting={handleSubmitSighting}
      />
    </View>
  );
}
