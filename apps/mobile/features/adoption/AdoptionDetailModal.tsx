import React from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AdoptionListingRow } from '@pranora/api';
import { DISTRICT_MAP } from './mockData';
import { formatAge } from './AdoptionCard';

interface AdoptionDetailModalProps {
  listing: AdoptionListingRow | null;
  visible: boolean;
  onClose: () => void;
  onApply?: (listing: AdoptionListingRow) => void;
}

export function AdoptionDetailModal({
  listing,
  visible,
  onClose,
  onApply,
}: AdoptionDetailModalProps) {
  const { isBangla } = useLocale();

  if (!listing) return null;

  const title = isBangla
    ? listing.title_bn || listing.title_en || 'প্রাণী'
    : listing.title_en || listing.title_bn || 'Animal';

  const description = isBangla
    ? listing.description_bn || listing.description_en
    : listing.description_en || listing.description_bn;

  const district = DISTRICT_MAP[listing.district_id]
    ? isBangla
      ? DISTRICT_MAP[listing.district_id]?.bn
      : DISTRICT_MAP[listing.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = listing.photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Header Bar */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <Text className="text-base font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
          >
            <Text className="text-gray-700 font-bold text-sm">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Photo */}
          <View className="relative w-full h-56 rounded-2xl overflow-hidden bg-gray-100 mb-4">
            <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute top-3 left-3 flex-row gap-2">
              {listing.status === 'available' ? (
                <View className="px-3 py-1 rounded-full bg-green-600">
                  <Text className="text-white text-xs font-bold">
                    {isBangla ? 'দত্তকের জন্য প্রস্তুত' : 'Available'}
                  </Text>
                </View>
              ) : (
                <View className="px-3 py-1 rounded-full bg-amber-500">
                  <Text className="text-white text-xs font-bold">
                    {isBangla ? 'সংরক্ষিত' : 'Reserved'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Info Grid */}
          <View className="flex-row flex-wrap p-3 rounded-xl bg-gray-50 border border-gray-200 mb-4">
            <View className="w-1/2 mb-2">
              <Text className="text-[11px] text-gray-500">{isBangla ? 'প্রজাতি' : 'Species'}</Text>
              <Text className="text-xs font-bold text-gray-900 capitalize">{listing.species}</Text>
            </View>
            <View className="w-1/2 mb-2">
              <Text className="text-[11px] text-gray-500">{isBangla ? 'বয়স' : 'Age'}</Text>
              <Text className="text-xs font-bold text-gray-900">{formatAge(listing.age_months, isBangla)}</Text>
            </View>
            <View className="w-1/2">
              <Text className="text-[11px] text-gray-500">{isBangla ? 'লিঙ্গ' : 'Gender'}</Text>
              <Text className="text-xs font-bold text-gray-900">
                {listing.gender === 'male'
                  ? isBangla ? 'পুরুষ ♂' : 'Male ♂'
                  : listing.gender === 'female'
                  ? isBangla ? 'স্ত্রী ♀' : 'Female ♀'
                  : isBangla ? 'অজানা' : 'Unknown'}
              </Text>
            </View>
            <View className="w-1/2">
              <Text className="text-[11px] text-gray-500">{isBangla ? 'এলাকা' : 'Area'}</Text>
              <Text className="text-xs font-bold text-gray-900">{district}</Text>
            </View>
          </View>

          {/* Health Badges */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="px-3 py-1 rounded-full bg-green-50 border border-green-200">
              <Text className="text-xs font-semibold text-green-800">
                💉 {isBangla ? 'টিকা' : 'Vaccine'}: {listing.is_vaccinated ? (isBangla ? 'হ্যাঁ' : 'Yes') : (isBangla ? 'প্রক্রিয়াধীন' : 'Pending')}
              </Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
              <Text className="text-xs font-semibold text-gray-700">
                ✂️ {isBangla ? 'নির্বীজিত' : 'Neutered'}: {listing.is_neutered ? (isBangla ? 'হ্যাঁ' : 'Yes') : (isBangla ? 'না' : 'No')}
              </Text>
            </View>
            {listing.shelter_id && (
              <View className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
                <Text className="text-xs font-semibold text-blue-800">
                  🏛️ {isBangla ? 'যাচাইকৃত শেল্টার' : 'Verified Shelter'}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {description && (
            <View className="mb-5">
              <Text className="text-sm font-bold text-gray-900 mb-1">
                {isBangla ? 'বিবরণ ও স্বভাব' : 'About this Animal'}
              </Text>
              <Text className="text-xs text-gray-700 leading-5">
                {description}
              </Text>
            </View>
          )}

          {/* Privacy Note */}
          <View className="p-3 rounded-xl bg-gray-50 border border-gray-200 mb-6">
            <Text className="text-[11px] text-gray-500 leading-4">
              🔒 {isBangla
                ? 'প্রাণী ও উদ্ধারকারীর সুরক্ষার্থে সুনির্দিষ্ট বাড়ির ঠিকানা দেখানো হয় না। এলাকা ও জেলা উল্লেখ করা হয়েছে।'
                : 'Exact address is withheld for privacy and animal welfare.'}
            </Text>
          </View>

          {/* Action Button */}
          {onApply && (
            <TouchableOpacity
              onPress={() => onApply(listing)}
              className="w-full py-3.5 rounded-xl bg-primary items-center mb-2"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">
                🐾 {isBangla ? 'দত্তকের আবেদন করুন' : 'Apply for Adoption'}
              </Text>
            </TouchableOpacity>
          )}
          <Text className="text-[11px] text-gray-400 text-center mb-6">
            {isBangla
              ? 'আবেদনের জন্য লগইন প্রয়োজন। সিদ্ধান্ত সর্বদা মানুষ দ্বারা যাচাই করা হয়।'
              : 'Requires login to apply. Review decisions are always made by humans.'}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
