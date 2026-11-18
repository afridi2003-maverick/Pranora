import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AdoptionListingRow } from '@pranora/api';
import { DISTRICT_MAP } from './mockData';

interface AdoptionCardProps {
  listing: AdoptionListingRow;
  onPress: (listing: AdoptionListingRow) => void;
}

export function formatAge(months: number | null, isBangla: boolean): string {
  if (months === null || months === undefined) return isBangla ? 'বয়স অজানা' : 'Age unknown';
  if (months < 12) {
    return isBangla ? `${months} মাস` : `${months} mo`;
  }
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) {
    return isBangla ? `${years} বছর` : `${years} yr`;
  }
  return isBangla ? `${years} বছর ${rem} মাস` : `${years}y ${rem}m`;
}

export function AdoptionCard({ listing, onPress }: AdoptionCardProps) {
  const { isBangla } = useLocale();

  const title = isBangla
    ? listing.title_bn || listing.title_en || 'প্রাণী'
    : listing.title_en || listing.title_bn || 'Animal';

  const district = DISTRICT_MAP[listing.district_id]
    ? isBangla
      ? DISTRICT_MAP[listing.district_id]?.bn
      : DISTRICT_MAP[listing.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = listing.photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600';

  return (
    <TouchableOpacity
      onPress={() => onPress(listing)}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4 shadow-sm"
      activeOpacity={0.85}
    >
      {/* Photo */}
      <View className="relative w-full h-44 bg-gray-100">
        <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />

        <View className="absolute top-2.5 left-2.5 flex-row gap-1.5">
          {listing.status === 'available' ? (
            <View className="px-2.5 py-1 rounded-full bg-green-600">
              <Text className="text-white text-[11px] font-bold">
                {isBangla ? 'দত্তক নিন' : 'Available'}
              </Text>
            </View>
          ) : (
            <View className="px-2.5 py-1 rounded-full bg-amber-500">
              <Text className="text-white text-[11px] font-bold">
                {isBangla ? 'সংরক্ষিত' : 'Reserved'}
              </Text>
            </View>
          )}

          {listing.shelter_id && (
            <View className="px-2 py-1 rounded-full bg-black/60">
              <Text className="text-white text-[10px] font-medium">
                🏛️ {isBangla ? 'শেল্টার' : 'Shelter'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Details */}
      <View className="p-3.5">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xs font-semibold text-primary capitalize">
            {listing.species === 'dog' ? '🐕 ' : listing.species === 'cat' ? '🐈 ' : '🐾 '}
            {listing.species}
          </Text>
          <Text className="text-xs text-gray-500">
            {listing.gender === 'male' ? '♂ ' : listing.gender === 'female' ? '♀ ' : ''}
            {formatAge(listing.age_months, isBangla)}
          </Text>
        </View>

        <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
          {title}
        </Text>

        <Text className="text-xs text-gray-500 mb-2.5">
          📍 {district}
        </Text>

        {/* Badges */}
        <View className="flex-row flex-wrap gap-1.5">
          {listing.is_vaccinated && (
            <View className="px-2 py-0.5 rounded-md bg-green-50 border border-green-200">
              <Text className="text-[10px] font-semibold text-green-800">
                💉 {isBangla ? 'টিকা দেওয়া' : 'Vaccinated'}
              </Text>
            </View>
          )}
          {listing.is_neutered && (
            <View className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200">
              <Text className="text-[10px] font-semibold text-gray-700">
                ✂️ {isBangla ? 'নির্বীজিত' : 'Neutered'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
