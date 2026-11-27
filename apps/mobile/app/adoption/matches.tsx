import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { SmartMatchList } from '../../features/adoption';
import { getAdoptionMatches, MOCK_ADOPTION_MATCHES } from '@pranora/api';
import type { AdoptionMatch } from '@pranora/validation';

export default function SmartAdoptionMatchesScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const [matches, setMatches] = useState<AdoptionMatch[]>(MOCK_ADOPTION_MATCHES);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mockUserId = 'u0000000-0000-0000-0000-000000000001';

  const loadMatches = async () => {
    try {
      const data = await getAdoptionMatches(null, mockUserId, 15).catch(
        () => MOCK_ADOPTION_MATCHES
      );
      if (data && data.length > 0) {
        setMatches(data);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMatches();
  };

  const handleSelectMatch = (match: AdoptionMatch) => {
    router.push(`/adoption/apply/${match.listing_id}`);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Header */}
      <View className="p-3.5 bg-emerald-50 border-b border-emerald-200 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="mr-2">
          <Text className="text-emerald-900 text-sm font-bold">← {isBangla ? 'পেছনে' : 'Back'}</Text>
        </TouchableOpacity>

        <Text className="text-sm font-bold text-emerald-900 flex-1 text-center">
          🎯 {isBangla ? 'স্মার্ট দত্তক ম্যাচ' : 'Smart Adoption Matches'}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View className="flex-1 p-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-xs text-gray-500 mt-2">
              {isBangla ? 'সেরা ম্যাচ লোড হচ্ছে...' : 'Finding best matches...'}
            </Text>
          </View>
        ) : (
          <SmartMatchList
            matches={matches}
            onSelectMatch={handleSelectMatch}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}
      </View>
    </View>
  );
}
