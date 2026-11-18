import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { RescueCaseUpdateRow } from '@pranora/api';

interface CaseUpdateTimelineProps {
  updates: (RescueCaseUpdateRow & { author_name?: string; author_role?: string })[];
}

export function CaseUpdateTimeline({ updates }: CaseUpdateTimelineProps) {
  const { isBangla } = useLocale();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (updates.length === 0) {
    return (
      <View className="p-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 items-center justify-center">
        <Text className="text-xs text-gray-500">
          {isBangla ? 'কোনো আপডেট এখনো পোস্ট করা হয়নি।' : 'No updates posted yet.'}
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-8">
      <Text className="text-sm font-bold text-gray-900 mb-3">
        ⏱️ {isBangla ? 'কেস আপডেট টাইমলাইন' : 'Case Updates Timeline'}
      </Text>

      <View className="space-y-4">
        {updates.map((upd) => (
          <View key={upd.id} className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-sm mb-3">
            <View className="flex-row items-center justify-between pb-2 border-b border-gray-100 mb-2">
              <View className="flex-row items-center gap-1.5">
                <Text className="font-bold text-xs text-gray-900">
                  {upd.author_name || (isBangla ? 'উদ্ধারকারী' : 'Rescuer')}
                </Text>
                {upd.author_role && (
                  <View className="px-2 py-0.5 rounded-full bg-gray-100">
                    <Text className="text-[10px] text-gray-600 capitalize">
                      {upd.author_role}
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-[10px] text-gray-400">
                {new Date(upd.created_at).toLocaleTimeString(isBangla ? 'bn-BD' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            {upd.status && (
              <View className="flex-row items-center gap-1 mb-1.5">
                <Text className="text-[11px] text-gray-500">
                  {isBangla ? 'অবস্থা:' : 'Status:'}
                </Text>
                <View className="px-2 py-0.5 rounded-full bg-green-50 border border-green-200">
                  <Text className="text-[10px] font-semibold text-green-800">
                    {upd.status}
                  </Text>
                </View>
              </View>
            )}

            {upd.note && (
              <Text className="text-xs text-gray-800 leading-4 mb-2">
                {upd.note}
              </Text>
            )}

            {upd.photos && upd.photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 pt-1">
                {upd.photos.map((src, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedPhoto(src)}
                    className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <Image source={{ uri: src }} className="w-full h-full" resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ))}
      </View>

      {/* Lightbox Modal */}
      <Modal visible={Boolean(selectedPhoto)} transparent onRequestClose={() => setSelectedPhoto(null)}>
        <View className="flex-1 bg-black/90 justify-center items-center p-4">
          <TouchableOpacity
            onPress={() => setSelectedPhoto(null)}
            className="absolute top-10 right-5 w-8 h-8 rounded-full bg-white items-center justify-center z-10"
          >
            <Text className="font-bold text-sm">✕</Text>
          </TouchableOpacity>
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto }}
              className="w-full h-80 rounded-xl"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
