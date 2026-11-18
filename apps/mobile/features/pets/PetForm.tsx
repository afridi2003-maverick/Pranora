import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import { AddPetSchema, EditPetSchema, type AddPetInput } from '@pranora/validation';
import type { PetRow, BreedRow, AddPetPayload } from '@pranora/api';
import type { SpeciesType, PetGender } from '@pranora/types';

interface PetFormProps {
  breeds: BreedRow[];
  initialValues?: Partial<PetRow>;
  onSubmit: (payload: AddPetPayload) => Promise<{ error?: string }>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SPECIES_LIST: SpeciesType[] = [
  'dog', 'cat', 'bird', 'rabbit', 'fish', 'cow', 'goat', 'poultry', 'other',
];

export function PetForm({
  breeds,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PetFormProps) {
  const { t, locale, isBangla } = useLocale();
  const isEdit = Boolean(initialValues?.id);

  const [name, setName] = useState(initialValues?.name ?? '');
  const [species, setSpecies] = useState<SpeciesType>(initialValues?.species ?? 'dog');
  const [breedId, setBreedId] = useState<number | null>(initialValues?.breed_id ?? null);
  const [breedOther, setBreedOther] = useState(initialValues?.breed_other ?? '');
  const [gender, setGender] = useState<PetGender>(initialValues?.gender ?? 'unknown');
  const [dob, setDob] = useState(initialValues?.date_of_birth ?? '');
  const [weightKg, setWeightKg] = useState(initialValues?.weight_kg?.toString() ?? '');
  const [color, setColor] = useState(initialValues?.color ?? '');
  const [microchip, setMicrochip] = useState(initialValues?.microchip_no ?? '');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  const [errors, setErrors] = useState<Partial<Record<keyof AddPetInput | 'root', string>>>({});

  const filteredBreeds = breeds.filter((b) => b.species === species);

  const handleSave = async () => {
    const payloadToValidate = {
      ...(isEdit && { id: initialValues!.id }),
      name,
      species,
      breed_id: breedId,
      breed_other: breedOther || null,
      gender,
      date_of_birth: dob || null,
      birth_approx: false,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      color: color || null,
      microchip_no: microchip || null,
      notes: notes || null,
    };

    const schema = isEdit ? EditPetSchema : AddPetSchema;
    const res = schema.safeParse(payloadToValidate);
    if (!res.success) {
      const fieldErrors: Partial<Record<keyof AddPetInput, string>> = {};
      for (const issue of res.error.issues) {
        const field = issue.path[0] as keyof AddPetInput;
        fieldErrors[field] = t(issue.message);
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const submitPayload: AddPetPayload = {
      name,
      species,
      breed_id: breedId,
      breed_other: breedOther || null,
      gender,
      date_of_birth: dob || null,
      birth_approx: false,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      color: color || null,
      microchip_no: microchip || null,
      notes: notes || null,
    };

    const submitRes = await onSubmit(submitPayload);
    if (submitRes.error) {
      setErrors({ root: submitRes.error });
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white" showsVerticalScrollIndicator={false}>
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {isEdit ? t('pets:edit') : t('pets:add')}
      </Text>

      {errors.root && (
        <View className="p-3 bg-red-50 rounded-lg border border-red-200 mb-4">
          <Text className="text-red-700 text-sm">{errors.root}</Text>
        </View>
      )}

      {/* Name */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-1">
          {t('pets:fields.name')} *
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('pets:fields.namePlaceholder')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 bg-gray-50"
          maxLength={60}
        />
        {errors.name && <Text className="text-red-600 text-xs mt-1">{errors.name}</Text>}
      </View>

      {/* Species Selector */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-1">
          {t('pets:fields.species')} *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 py-1">
          {SPECIES_LIST.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => {
                setSpecies(s);
                setBreedId(null);
                setBreedOther('');
              }}
              className={`px-4 py-2 rounded-full border ${
                species === s
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-300'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  species === s ? 'text-white font-bold' : 'text-gray-700'
                }`}
              >
                {t(`pets:species.${s}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Breed */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-1">
          {t('pets:fields.breed')}
        </Text>
        {filteredBreeds.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 py-1 mb-2">
            <TouchableOpacity
              onPress={() => setBreedId(null)}
              className={`px-3 py-1.5 rounded-lg border ${
                breedId === null ? 'bg-green-100 border-primary' : 'bg-white border-gray-200'
              }`}
            >
              <Text className="text-xs text-gray-800">{t('pets:fields.breedUnknown')}</Text>
            </TouchableOpacity>
            {filteredBreeds.map((b) => (
              <TouchableOpacity
                key={b.id}
                onPress={() => {
                  setBreedId(b.id);
                  setBreedOther('');
                }}
                className={`px-3 py-1.5 rounded-lg border ${
                  breedId === b.id ? 'bg-green-100 border-primary' : 'bg-white border-gray-200'
                }`}
              >
                <Text className="text-xs text-gray-800">
                  {locale === 'bn' && b.name_bn ? b.name_bn : b.name_en}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {!breedId && (
          <TextInput
            value={breedOther}
            onChangeText={setBreedOther}
            placeholder={isBangla ? 'জাত লিখুন (যদি জানা থাকে)' : 'Enter breed (if known)'}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 bg-gray-50"
            maxLength={80}
          />
        )}
        {errors.breed_other && <Text className="text-red-600 text-xs mt-1">{errors.breed_other}</Text>}
      </View>

      {/* Gender */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-1">
          {t('pets:fields.gender')}
        </Text>
        <View className="flex-row gap-3">
          {(['male', 'female', 'unknown'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGender(g)}
              className={`flex-1 py-2 rounded-lg border items-center ${
                gender === g ? 'bg-primary/10 border-primary' : 'bg-white border-gray-300'
              }`}
            >
              <Text className={`text-sm ${gender === g ? 'text-primary font-bold' : 'text-gray-700'}`}>
                {t(`pets:gender.${g}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Weight & DOB */}
      <View className="flex-row gap-4 mb-4">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            {t('pets:fields.weight')}
          </Text>
          <TextInput
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
            placeholder="0.0"
            className="border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 bg-gray-50"
          />
          {errors.weight_kg && <Text className="text-red-600 text-xs mt-1">{errors.weight_kg}</Text>}
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            {t('pets:fields.birthDate')}
          </Text>
          <TextInput
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
            className="border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 bg-gray-50"
          />
          {errors.date_of_birth && <Text className="text-red-600 text-xs mt-1">{errors.date_of_birth}</Text>}
        </View>
      </View>

      {/* Color & Microchip */}
      <View className="flex-row gap-4 mb-4">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            {t('pets:fields.color')}
          </Text>
          <TextInput
            value={color}
            onChangeText={setColor}
            placeholder={isBangla ? 'রং' : 'Color'}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 bg-gray-50"
          />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            {t('pets:fields.microchipId')}
          </Text>
          <TextInput
            value={microchip}
            onChangeText={setMicrochip}
            placeholder="ID #"
            className="border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 bg-gray-50"
          />
        </View>
      </View>

      {/* Notes */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-gray-700 mb-1">
          {t('pets:fields.notes')}
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder={isBangla ? 'বিশেষ নোট বা যত্নের তথ্য' : 'Care instructions or notes'}
          multiline
          numberOfLines={3}
          className="border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 bg-gray-50"
        />
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-8">
        <TouchableOpacity
          onPress={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl border border-gray-300 items-center bg-gray-100"
        >
          <Text className="text-gray-700 font-bold">{t('pets:actions.cancel')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl bg-primary items-center"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="text-white font-bold">{t('pets:actions.save')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
