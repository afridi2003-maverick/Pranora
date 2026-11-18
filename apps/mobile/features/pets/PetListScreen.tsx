import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocale, formatPetAge } from '@pranora/i18n';
import type { PetRow, BreedRow, AddPetPayload } from '@pranora/api';
import { PetForm } from './PetForm';

interface PetListScreenProps {
  pets: PetRow[];
  breeds: BreedRow[];
  onAddPet: (payload: AddPetPayload) => Promise<{ error?: string }>;
  onEditPet: (id: string, payload: AddPetPayload) => Promise<{ error?: string }>;
  onDeletePet: (id: string) => Promise<{ error?: string }>;
  loading?: boolean;
}

export function PetListScreen({
  pets,
  breeds,
  onAddPet,
  onEditPet,
  onDeletePet,
  loading = false,
}: PetListScreenProps) {
  const { t, locale } = useLocale();
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedPet, setSelectedPet] = useState<PetRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartAdd = () => {
    setSelectedPet(null);
    setView('add');
  };

  const handleStartEdit = (pet: PetRow) => {
    setSelectedPet(pet);
    setView('edit');
  };

  const handleConfirmDelete = (pet: PetRow) => {
    Alert.alert(
      t('pets:delete'),
      t('pets:deleteConfirm'),
      [
        { text: t('pets:actions.cancel'), style: 'cancel' },
        {
          text: t('pets:actions.delete'),
          style: 'destructive',
          onPress: async () => {
            const res = await onDeletePet(pet.id);
            if (res.error) {
              Alert.alert('Error', res.error);
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async (payload: AddPetPayload) => {
    setIsSubmitting(true);
    let res: { error?: string };
    if (view === 'edit' && selectedPet) {
      res = await onEditPet(selectedPet.id, payload);
    } else {
      res = await onAddPet(payload);
    }
    setIsSubmitting(false);

    if (!res.error) {
      setView('list');
      setSelectedPet(null);
    }
    return res;
  };

  if (view === 'add' || view === 'edit') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <PetForm
          breeds={breeds}
          initialValues={selectedPet ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setView('list');
            setSelectedPet(null);
          }}
          isSubmitting={isSubmitting}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">
          🐾 {t('pets:myPets')}
        </Text>
        <TouchableOpacity
          onPress={handleStartAdd}
          className="bg-primary px-4 py-2 rounded-lg"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-sm">+ {t('pets:add')}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2F7B53" />
        </View>
      ) : pets.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-5xl mb-4">🐕</Text>
          <Text className="text-lg font-bold text-gray-900 text-center mb-1">
            {t('pets:noPets')}
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-6">
            {t('pets:noPetsDesc')}
          </Text>
          <TouchableOpacity
            onPress={handleStartAdd}
            className="bg-primary px-6 py-3 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">{t('pets:add')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const breedName = item.breed
              ? (locale === 'bn' && item.breed.name_bn ? item.breed.name_bn : item.breed.name_en)
              : item.breed_other ?? t('pets:fields.breedUnknown');

            const ageStr = item.date_of_birth
              ? `${item.birth_approx ? (locale === 'bn' ? 'প্রায় ' : 'approx. ') : ''}${formatPetAge(item.date_of_birth, locale)}`
              : null;

            return (
              <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center">
                    <Text className="text-2xl">
                      {item.species === 'dog' ? '🐕' :
                       item.species === 'cat' ? '🐈' :
                       item.species === 'bird' ? '🐦' :
                       item.species === 'rabbit' ? '🐰' :
                       item.species === 'fish' ? '🐟' : '🐾'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
                    <Text className="text-xs text-gray-500">
                      {t(`pets:species.${item.species}`)} • {breedName}
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-y-1 gap-x-4 border-t border-gray-100 pt-2 mb-3">
                  {ageStr && (
                    <Text className="text-xs text-gray-600">
                      🎂 {ageStr}
                    </Text>
                  )}
                  <Text className="text-xs text-gray-600">
                    ⚤ {t(`pets:gender.${item.gender}`)}
                  </Text>
                  {item.weight_kg != null && (
                    <Text className="text-xs text-gray-600">
                      ⚖️ {item.weight_kg} kg
                    </Text>
                  )}
                </View>

                <View className="flex-row gap-2 border-t border-gray-100 pt-2">
                  <TouchableOpacity
                    onPress={() => handleStartEdit(item)}
                    className="flex-1 py-2 rounded-lg bg-gray-100 items-center"
                  >
                    <Text className="text-xs font-semibold text-gray-800">{t('pets:edit')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleConfirmDelete(item)}
                    className="px-4 py-2 rounded-lg bg-red-50 items-center"
                  >
                    <Text className="text-xs font-semibold text-red-600">{t('pets:delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
