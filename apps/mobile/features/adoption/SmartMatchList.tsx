import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AdoptionMatch } from '@pranora/validation';
import { SmartMatchCard } from './SmartMatchCard';

interface SmartMatchListProps {
  matches: AdoptionMatch[];
  onSelectMatch: (match: AdoptionMatch) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function SmartMatchList({
  matches,
  onSelectMatch,
  onRefresh,
  isRefreshing = false,
}: SmartMatchListProps) {
  const { isBangla } = useLocale();

  return (
    <View className="flex-1">
      {/* Banner */}
      <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
        <Text className="text-sm font-bold text-emerald-900 mb-1">
          🎯 {isBangla ? 'স্মার্ট দত্তক ম্যাচিং' : 'Smart Adoption Matches'}
        </Text>
        <Text className="text-xs text-emerald-700 leading-relaxed">
          {isBangla
            ? 'আপনার বাসস্থান ও জীবনধারার সাথে সঙ্গতিপূর্ণ সেরা মিলযুক্ত প্রাণীগুলো তালিকাভুক্ত করা হয়েছে।'
            : 'AI-computed compatibility score matching pets with your home environment.'}
        </Text>
      </View>

      {matches.length === 0 ? (
        <View className="py-16 items-center justify-center">
          <Text className="text-4xl mb-2">🐾</Text>
          <Text className="font-bold text-gray-800 text-sm">
            {isBangla ? 'কোনো ম্যাচ পাওয়া যায়নি' : 'No compatible matches found'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.listing_id}
          renderItem={({ item }) => (
            <SmartMatchCard match={item} onPress={onSelectMatch} />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
}
