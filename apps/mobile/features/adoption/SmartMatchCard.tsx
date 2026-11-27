import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AdoptionMatch } from '@pranora/validation';
import { DISTRICT_MAP } from './mockData';
import { formatAge } from './AdoptionCard';

interface SmartMatchCardProps {
  match: AdoptionMatch;
  onPress: (match: AdoptionMatch) => void;
}

export function SmartMatchCard({ match, onPress }: SmartMatchCardProps) {
  const { isBangla } = useLocale();

  const title = isBangla
    ? match.title_bn || match.title_en || 'প্রাণী'
    : match.title_en || match.title_bn || 'Animal';

  const district = DISTRICT_MAP[match.district_id]
    ? isBangla
      ? DISTRICT_MAP[match.district_id]?.bn
      : DISTRICT_MAP[match.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = match.photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600';

  const scoreBadgeBg =
    match.score >= 85 ? 'bg-emerald-600' : match.score >= 70 ? 'bg-amber-600' : 'bg-blue-600';

  return (
    <TouchableOpacity
      onPress={() => onPress(match)}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4 shadow-sm"
      activeOpacity={0.85}
    >
      {/* Photo */}
      <View className="relative h-48 w-full bg-gray-100">
        <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />

        {/* Score Badge */}
        <View className="absolute top-3 left-3">
          <View className={`px-2.5 py-1 rounded-full ${scoreBadgeBg}`}>
            <Text className="text-white text-xs font-bold">
              🎯 {isBangla ? `${match.score}% মিল` : `${match.score}% Match`}
            </Text>
          </View>
        </View>

        {/* Species & Gender */}
        <View className="absolute bottom-3 left-3 flex-row gap-1">
          <View className="bg-black/60 px-2 py-0.5 rounded-md">
            <Text className="text-white text-[11px] font-medium">
              {match.species === 'dog' ? (isBangla ? '🐶 কুকুর' : '🐶 Dog') : (isBangla ? '🐱 বিড়াল' : '🐱 Cat')}
            </Text>
          </View>
          <View className="bg-black/60 px-2 py-0.5 rounded-md">
            <Text className="text-white text-[11px] font-medium">
              {match.gender === 'male' ? (isBangla ? 'পুরুষ' : 'Male') : (isBangla ? 'স্ত্রী' : 'Female')}
            </Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <View className="p-3.5">
        <Text className="font-bold text-base text-gray-900 mb-1" numberOfLines={1}>
          {title}
        </Text>

        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-xs text-gray-500">📍 {district}</Text>
          <Text className="text-xs text-gray-300">•</Text>
          <Text className="text-xs text-gray-500">🎂 {formatAge(match.age_months, isBangla)}</Text>
        </View>

        {/* Health tags */}
        <View className="flex-row flex-wrap gap-1 mt-1">
          {match.is_vaccinated && (
            <View className="bg-emerald-50 px-2 py-0.5 rounded">
              <Text className="text-emerald-700 text-[11px] font-medium">
                💉 {isBangla ? 'ভ্যাকসিনেটেড' : 'Vaccinated'}
              </Text>
            </View>
          )}
          {match.is_neutered && (
            <View className="bg-blue-50 px-2 py-0.5 rounded">
              <Text className="text-blue-700 text-[11px] font-medium">
                ✂️ {isBangla ? 'নিউটার্ড' : 'Neutered'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
