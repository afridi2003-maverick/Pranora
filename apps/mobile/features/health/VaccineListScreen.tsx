import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocale, formatDate } from '@pranora/i18n';
import type { PetRow, VaccinationRow } from '@pranora/api';
import { PetPicker } from '../pets';
import { RecordVaccineModal } from './RecordVaccineModal';

export interface VaccineListScreenProps {
  pets: PetRow[];
  selectedPet: PetRow | null;
  onSelectPet: (pet: PetRow) => void;
  vaccinations: VaccinationRow[];
  onAutoGenerate: (petId: string, species: string) => Promise<{ count: number; error?: string }>;
  onRecordDose: (payload: { id: string; given_date: string; batch_no?: string }) => Promise<{ error?: string }>;
  loading?: boolean;
}

export function VaccineListScreen({
  pets,
  selectedPet,
  onSelectPet,
  vaccinations,
  onAutoGenerate,
  onRecordDose,
  loading = false,
}: VaccineListScreenProps) {
  const { t, locale } = useLocale();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [recordingVaccine, setRecordingVaccine] = useState<VaccinationRow | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0] ?? '';

  const filteredVaccines = vaccinations.filter((v) => {
    if (filter === 'upcoming') return !v.given_date;
    if (filter === 'completed') return !!v.given_date;
    return true;
  });

  const nextDue = vaccinations
    .filter((v) => !v.given_date && v.due_date)
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))[0];

  const handleTriggerAutoGenerate = async () => {
    if (!selectedPet) return;
    setIsGenerating(true);
    const res = await onAutoGenerate(selectedPet.id, selectedPet.species);
    setIsGenerating(false);

    if (res.error) {
      Alert.alert('Error', res.error);
    } else {
      Alert.alert('Success', t('health:vaccines.generateSuccess'));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-1">
          💉 {t('health:vaccines.schedule')}
        </Text>
        <PetPicker
          pets={pets}
          selectedPetId={selectedPet?.id ?? null}
          onSelectPet={onSelectPet}
          placeholder={t('health:vaccines.selectPet')}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2F7B53" />
        </View>
      ) : !selectedPet ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-4xl mb-3">🐾</Text>
          <Text className="text-sm text-gray-500 text-center">
            {t('health:vaccines.selectPet')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredVaccines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <View className="mb-4">
              {/* Overview Status Banner */}
              <View className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t('health:vaccines.nextDue')}
                  </Text>
                  {nextDue ? (
                    nextDue.due_date! < todayStr ? (
                      <View className="bg-red-50 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-bold text-red-700">
                          {t('health:vaccines.status.overdue')}
                        </Text>
                      </View>
                    ) : (
                      <View className="bg-amber-50 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-bold text-amber-700">
                          {t('health:vaccines.status.pending')}
                        </Text>
                      </View>
                    )
                  ) : (
                    <View className="bg-green-50 px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] font-bold text-green-700">
                        {t('health:vaccines.upToDate')}
                      </Text>
                    </View>
                  )}
                </View>

                {nextDue ? (
                  <View>
                    <Text className="text-base font-bold text-gray-900">
                      {nextDue.name}
                    </Text>
                    <Text className="text-xs text-gray-600 mt-0.5">
                      📅 {t('health:vaccines.dueOn', { date: formatDate(nextDue.due_date!) })}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-xs text-gray-600">
                    🎉 {t('health:vaccines.upToDate')}
                  </Text>
                )}
              </View>

              {/* Action Buttons & Filters */}
              <View className="flex-row items-center justify-between gap-2 mb-3">
                <View className="flex-row bg-gray-200/80 p-0.5 rounded-xl">
                  {(['all', 'upcoming', 'completed'] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setFilter(mode)}
                      className={`px-3 py-1.5 rounded-lg ${
                        filter === mode ? 'bg-white shadow-sm' : ''
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          filter === mode ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {mode === 'all'
                          ? t('health:vaccines.filterAll')
                          : mode === 'upcoming'
                          ? t('health:vaccines.filterUpcoming')
                          : t('health:vaccines.filterCompleted')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleTriggerAutoGenerate}
                  disabled={isGenerating}
                  className="bg-green-50 border border-green-200 px-3 py-2 rounded-xl flex-row items-center"
                  activeOpacity={0.8}
                >
                  {isGenerating ? (
                    <ActivityIndicator size="small" color="#2F7B53" />
                  ) : (
                    <Text className="text-xs font-bold text-green-800">
                      ⚡ {t('health:vaccines.autoGenerate')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 items-center">
              <Text className="text-3xl mb-2">📋</Text>
              <Text className="text-sm font-bold text-gray-800 mb-1">
                {t('health:vaccines.empty')}
              </Text>
              <Text className="text-xs text-gray-500 text-center mb-4 max-w-xs">
                {t('health:vaccines.emptyDesc')}
              </Text>
              <TouchableOpacity
                onPress={handleTriggerAutoGenerate}
                className="bg-primary px-4 py-2.5 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-xs">
                  ⚡ {t('health:vaccines.autoGenerate')}
                </Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const isCompleted = !!item.given_date;
            const isOverdue = !isCompleted && item.due_date && item.due_date < todayStr;

            return (
              <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-base font-bold text-gray-900">
                      {item.name}
                    </Text>
                    {item.template && (
                      <Text className="text-[11px] text-gray-400">
                        {locale === 'bn' ? item.template.name_bn : item.template.name_en}
                      </Text>
                    )}
                  </View>

                  {isCompleted ? (
                    <View className="bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] font-bold text-green-800">
                        ✓ {t('health:vaccines.status.completed')}
                      </Text>
                    </View>
                  ) : isOverdue ? (
                    <View className="bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] font-bold text-red-800">
                        ! {t('health:vaccines.status.overdue')}
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] font-bold text-amber-800">
                        ⏳ {t('health:vaccines.status.pending')}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row flex-wrap gap-x-4 gap-y-1 py-2 border-t border-gray-100 text-xs">
                  {item.due_date && (
                    <Text className="text-xs text-gray-600">
                      📅 {t('health:vaccines.dueDate')}: {formatDate(item.due_date)}
                    </Text>
                  )}
                  {item.given_date && (
                    <Text className="text-xs text-green-700 font-medium">
                      ✓ {t('health:vaccines.givenOn', { date: formatDate(item.given_date) })}
                    </Text>
                  )}
                  {item.batch_no && (
                    <Text className="text-xs text-gray-500">
                      🏷️ {item.batch_no}
                    </Text>
                  )}
                </View>

                {!isCompleted && (
                  <View className="pt-2 border-t border-gray-100 flex-row justify-end">
                    <TouchableOpacity
                      onPress={() => setRecordingVaccine(item)}
                      className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg"
                      activeOpacity={0.8}
                    >
                      <Text className="text-xs font-bold text-primary">
                        + {t('health:vaccines.markGiven')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      <RecordVaccineModal
        visible={!!recordingVaccine}
        vaccine={recordingVaccine}
        onClose={() => setRecordingVaccine(null)}
        onRecord={onRecordDose}
      />
    </SafeAreaView>
  );
}
