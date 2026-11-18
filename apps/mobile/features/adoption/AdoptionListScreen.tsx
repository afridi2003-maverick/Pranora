import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AdoptionListingRow } from '@pranora/api';
import type { SpeciesType } from '@pranora/types';
import { AdoptionCard } from './AdoptionCard';
import { AdoptionDetailModal } from './AdoptionDetailModal';
import { MOCK_ADOPTION_LISTINGS, DISTRICT_MAP } from './mockData';

interface AdoptionListScreenProps {
  initialListings?: AdoptionListingRow[];
  onApply?: (listing: AdoptionListingRow) => void;
}

const SPECIES_OPTIONS: { id: SpeciesType | 'all'; bn: string; en: string; icon: string }[] = [
  { id: 'all', bn: 'সকল প্রাণী', en: 'All', icon: '🐾' },
  { id: 'dog', bn: 'কুকুর', en: 'Dogs', icon: '🐕' },
  { id: 'cat', bn: 'বিড়াল', en: 'Cats', icon: '🐈' },
  { id: 'rabbit', bn: 'খরগোশ', en: 'Rabbits', icon: '🐇' },
  { id: 'other', bn: 'অন্যান্য', en: 'Other', icon: '✨' },
];

const AGE_OPTIONS = [
  { id: 'all', bn: 'সকল বয়স', en: 'All Ages' },
  { id: 'baby', bn: 'ছানা (<৬ মাস)', en: 'Baby (<6 mo)' },
  { id: 'young', bn: 'তরুণ (৬-২৪ মাস)', en: 'Young (6-24 mo)' },
  { id: 'adult', bn: 'প্রাপ্তবয়স্ক (২+ বছর)', en: 'Adult (2+ yr)' },
];

export function AdoptionListScreen({
  initialListings = MOCK_ADOPTION_LISTINGS,
  onApply,
}: AdoptionListScreenProps) {
  const { isBangla } = useLocale();

  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesType | 'all'>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<AdoptionListingRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = (listing: AdoptionListingRow) => {
    setSelectedListing(listing);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const filteredListings = useMemo(() => {
    return initialListings.filter((item) => {
      if (selectedSpecies !== 'all' && item.species !== selectedSpecies) {
        return false;
      }
      if (selectedDistrictId !== null && item.district_id !== selectedDistrictId) {
        return false;
      }
      if (selectedAge !== 'all') {
        const months = item.age_months ?? 0;
        if (selectedAge === 'baby' && months >= 6) return false;
        if (selectedAge === 'young' && (months < 6 || months >= 24)) return false;
        if (selectedAge === 'adult' && months < 24) return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const tBn = (item.title_bn || '').toLowerCase();
        const tEn = (item.title_en || '').toLowerCase();
        if (!tBn.includes(query) && !tEn.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [initialListings, selectedSpecies, selectedDistrictId, selectedAge, search]);

  const resetFilters = () => {
    setSelectedSpecies('all');
    setSelectedDistrictId(null);
    setSelectedAge('all');
    setSearch('');
  };

  return (
    <ScrollView className="flex-1 bg-white p-4" showsVerticalScrollIndicator={false}>
      {/* Search Input */}
      <View className="mb-3">
        <TextInput
          placeholder={isBangla ? '🔍 নাম বা প্রজাতি দিয়ে খুঁজুন...' : '🔍 Search by name or trait...'}
          value={search}
          onChangeText={setSearch}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 bg-gray-50"
        />
      </View>

      {/* Species Filter Scroll */}
      <View className="mb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 py-1">
          {SPECIES_OPTIONS.map((s) => {
            const isSelected = selectedSpecies === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedSpecies(s.id)}
                className={`px-3 py-1.5 rounded-full border ${
                  isSelected ? 'bg-primary border-primary' : 'bg-gray-100 border-gray-200'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {s.icon} {isBangla ? s.bn : s.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* District & Age Filter Scroll */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 py-1">
          {/* District Pill: All */}
          <TouchableOpacity
            onPress={() => setSelectedDistrictId(null)}
            className={`px-3 py-1 rounded-lg border ${
              selectedDistrictId === null ? 'bg-green-700 border-green-700' : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text className={`text-[11px] font-medium ${selectedDistrictId === null ? 'text-white font-bold' : 'text-gray-700'}`}>
              📍 {isBangla ? 'সকল জেলা' : 'All Districts'}
            </Text>
          </TouchableOpacity>

          {/* District Options */}
          {Object.entries(DISTRICT_MAP).map(([id, d]) => {
            const numId = Number(id);
            const isSelected = selectedDistrictId === numId;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setSelectedDistrictId(numId)}
                className={`px-3 py-1 rounded-lg border ${
                  isSelected ? 'bg-green-700 border-green-700' : 'bg-gray-100 border-gray-200'
                }`}
              >
                <Text className={`text-[11px] font-medium ${isSelected ? 'text-white font-bold' : 'text-gray-700'}`}>
                  {isBangla ? d.bn : d.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Age Group Filter Scroll */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 py-1">
          {AGE_OPTIONS.map((a) => {
            const isSelected = selectedAge === a.id;
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => setSelectedAge(a.id)}
                className={`px-2.5 py-1 rounded-lg border ${
                  isSelected ? 'bg-amber-600 border-amber-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text className={`text-[11px] font-medium ${isSelected ? 'text-white font-bold' : 'text-gray-700'}`}>
                  {isBangla ? a.bn : a.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Listings Count & Reset */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <Text className="text-xs text-gray-500 font-medium">
          {isBangla
            ? `উপলব্ধ প্রাণী: ${filteredListings.length} টি`
            : `${filteredListings.length} pets available`}
        </Text>
        {(selectedSpecies !== 'all' || selectedDistrictId !== null || selectedAge !== 'all' || search) && (
          <TouchableOpacity onPress={resetFilters}>
            <Text className="text-xs text-primary font-bold">
              ✕ {isBangla ? 'রিসেট' : 'Reset'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Listing Cards */}
      {filteredListings.length > 0 ? (
        <View className="pb-8">
          {filteredListings.map((listing) => (
            <AdoptionCard
              key={listing.id}
              listing={listing}
              onPress={handleOpenDetail}
            />
          ))}
        </View>
      ) : (
        <View className="items-center justify-center p-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50 my-6">
          <Text className="text-4xl mb-2">🐾</Text>
          <Text className="text-sm font-semibold text-gray-800 mb-1 text-center">
            {isBangla ? 'কোনো প্রাণী পাওয়া যায়নি' : 'No pets match your criteria'}
          </Text>
          <Text className="text-xs text-gray-500 text-center mb-3">
            {isBangla ? 'অন্য জেলা বা ফিল্টার নির্বাচন করুন।' : 'Try clearing your filters.'}
          </Text>
          <TouchableOpacity onPress={resetFilters} className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-300">
            <Text className="text-xs text-green-800 font-bold">
              {isBangla ? 'সকল ফিল্টার মুছুন' : 'Clear filters'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Detail Modal */}
      <AdoptionDetailModal
        listing={selectedListing}
        visible={isDetailOpen}
        onClose={handleCloseDetail}
        onApply={onApply}
      />
    </ScrollView>
  );
}
