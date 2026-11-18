import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { PetRow } from '@pranora/api';

export interface PetPickerProps {
  pets: PetRow[];
  selectedPetId: string | null;
  onSelectPet: (pet: PetRow) => void;
  label?: string;
  placeholder?: string;
  allowAdd?: boolean;
  onAddPet?: () => void;
}

export function PetPicker({
  pets,
  selectedPetId,
  onSelectPet,
  label,
  placeholder,
  allowAdd = false,
  onAddPet,
}: PetPickerProps) {
  const { t, locale } = useLocale();

  const getSpeciesEmoji = (species: string) => {
    switch (species) {
      case 'dog': return '🐕';
      case 'cat': return '🐈';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      case 'fish': return '🐟';
      case 'cow': return '🐄';
      case 'goat': return '🐐';
      default: return '🐾';
    }
  };

  return (
    <View className="w-full my-2">
      {label && (
        <Text className="text-sm font-semibold text-gray-700 mb-2">{label}</Text>
      )}

      {pets.length === 0 ? (
        <View className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl items-center">
          <Text className="text-sm text-gray-500 mb-2">
            {placeholder || t('pets:noPets')}
          </Text>
          {allowAdd && onAddPet && (
            <TouchableOpacity
              onPress={onAddPet}
              className="bg-primary px-4 py-2 rounded-lg"
              activeOpacity={0.8}
            >
              <Text className="text-white text-xs font-bold">+ {t('pets:add')}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-3 py-1"
        >
          {pets.map((pet) => {
            const isSelected = pet.id === selectedPetId;
            const breedName = pet.breed
              ? (locale === 'bn' && pet.breed.name_bn ? pet.breed.name_bn : pet.breed.name_en)
              : pet.breed_other ?? '';

            return (
              <TouchableOpacity
                key={pet.id}
                onPress={() => onSelectPet(pet)}
                className={`flex-row items-center px-3 py-2 rounded-xl border mr-2.5 ${
                  isSelected
                    ? 'bg-green-50 border-primary ring-2 ring-primary'
                    : 'bg-white border-gray-200'
                }`}
                activeOpacity={0.8}
              >
                <Text className="text-2xl mr-2">{getSpeciesEmoji(pet.species)}</Text>
                <View>
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? 'text-primary' : 'text-gray-900'
                    }`}
                  >
                    {pet.name}
                  </Text>
                  {breedName ? (
                    <Text className="text-xs text-gray-500">{breedName}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}

          {allowAdd && onAddPet && (
            <TouchableOpacity
              onPress={onAddPet}
              className="flex-row items-center px-4 py-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 mr-2.5"
              activeOpacity={0.8}
            >
              <Text className="text-primary text-base font-bold mr-1">+</Text>
              <Text className="text-xs font-semibold text-primary">{t('pets:add')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}
