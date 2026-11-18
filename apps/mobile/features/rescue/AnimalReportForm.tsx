import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  CreateAnimalReportSchema,
  type CreateAnimalReportInput,
  type AnimalReportKind,
  type UrgencyLevel,
} from '@pranora/validation';
import type { PetRow, CreateReportPayload } from '@pranora/api';
import type { SpeciesType } from '@pranora/types';

interface AnimalReportFormProps {
  userPets?: PetRow[];
  onSubmit: (payload: CreateReportPayload) => Promise<{ error?: string; reportId?: string }>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const KINDS: { id: AnimalReportKind; bn: string; en: string; icon: string }[] = [
  { id: 'injured', bn: 'আহত প্রাণী', en: 'Injured Animal', icon: '🚑' },
  { id: 'lost', bn: 'হারিয়ে যাওয়া পোষ্য', en: 'Lost Pet', icon: '🔍' },
  { id: 'found', bn: 'খুঁজে পাওয়া প্রাণী', en: 'Found Animal', icon: '🐾' },
  { id: 'abandoned', bn: 'পরিত্যক্ত প্রাণী', en: 'Abandoned Animal', icon: '📦' },
];

const URGENCIES: { id: UrgencyLevel; bn: string; en: string; color: string }[] = [
  { id: 'critical', bn: 'জরুরি (মারাত্মক আহত)', en: 'Critical (Severe)', color: 'bg-red-600' },
  { id: 'high', bn: 'উচ্চ (অবিলম্বে প্রয়োজন)', en: 'High (Immediate)', color: 'bg-amber-600' },
  { id: 'medium', bn: 'মাঝারি', en: 'Medium', color: 'bg-green-700' },
  { id: 'low', bn: 'কম', en: 'Low', color: 'bg-green-200' },
];

const SPECIES_LIST: { id: SpeciesType; bn: string; en: string }[] = [
  { id: 'dog', bn: 'কুকুর', en: 'Dog' },
  { id: 'cat', bn: 'বিড়াল', en: 'Cat' },
  { id: 'bird', bn: 'পাখি', en: 'Bird' },
  { id: 'rabbit', bn: 'খরগোশ', en: 'Rabbit' },
  { id: 'cow', bn: 'গরু', en: 'Cow' },
  { id: 'goat', bn: 'ছাগল', en: 'ছাগল / Goat' },
  { id: 'poultry', bn: 'হাঁস-মুরগি', en: 'Poultry' },
  { id: 'other', bn: 'অন্যান্য', en: 'Other' },
];

const DISTRICTS: { id: number; bn: string; en: string }[] = [
  { id: 1, bn: 'ঢাকা', en: 'Dhaka' },
  { id: 2, bn: 'চট্টগ্রাম', en: 'Chattogram' },
  { id: 3, bn: 'রাজশাহী', en: 'Rajshahi' },
  { id: 4, bn: 'খুলনা', en: 'Khulna' },
  { id: 5, bn: 'বরিশাল', en: 'Barishal' },
  { id: 6, bn: 'সিলেট', en: 'Sylhet' },
  { id: 7, bn: 'রংপুর', en: 'Rangpur' },
  { id: 8, bn: 'ময়মনসিংহ', en: 'Mymensingh' },
];

// Sample placeholder photos for on-device simulation
const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
];

export function AnimalReportForm({
  userPets = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AnimalReportFormProps) {
  const { isBangla } = useLocale();

  const [kind, setKind] = useState<AnimalReportKind>('injured');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [species, setSpecies] = useState<SpeciesType>('dog');
  const [petId, setPetId] = useState<string>('');
  const [lastSeenAt, setLastSeenAt] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [areaText, setAreaText] = useState<string>('');
  const [districtId, setDistrictId] = useState<number>(1); // Default Dhaka (1)
  const [latitude, setLatitude] = useState<number>(23.8103);
  const [longitude, setLongitude] = useState<number>(90.4125);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isStrippingExif, setIsStrippingExif] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAnimalReportInput | 'root', string>>>({});

  // When user selects their own registered pet for lost animal report
  const handleSelectOwnPet = (selectedPetId: string) => {
    setPetId(selectedPetId);
    const chosenPet = userPets.find((p) => p.id === selectedPetId);
    if (chosenPet) {
      setSpecies(chosenPet.species);
      if (chosenPet.photo_url && !photos.includes(chosenPet.photo_url)) {
        setPhotos((prev) => [chosenPet.photo_url!, ...prev]);
      }
    }
  };

  // Add photo with EXIF / GPS stripping simulation
  const handleAddSamplePhoto = () => {
    if (photos.length >= 6) return;
    setIsStrippingExif(true);

    setTimeout(() => {
      const nextIndex = photos.length % SAMPLE_PHOTOS.length;
      const sample = SAMPLE_PHOTOS[nextIndex] ?? SAMPLE_PHOTOS[0]!;
      setPhotos((prev) => [...prev, sample]);
      setIsStrippingExif(false);
    }, 400);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUseCurrentGps = () => {
    // Current Dhaka coordinates or location sensor
    setLatitude(23.8103 + (Math.random() - 0.5) * 0.01);
    setLongitude(90.4125 + (Math.random() - 0.5) * 0.01);
  };

  const handleSubmit = async () => {
    setErrors({});

    const payloadToValidate: CreateAnimalReportInput = {
      kind,
      urgency,
      species,
      pet_id: kind === 'lost' && petId ? petId : null,
      last_seen_at: lastSeenAt ? new Date(lastSeenAt).toISOString() : null,
      contact_phone: contactPhone || null,
      description: description || null,
      photos,
      latitude,
      longitude,
      area_text: areaText || null,
      district_id: districtId,
      upazila_id: null,
    };

    const parseResult = CreateAnimalReportSchema.safeParse(payloadToValidate);
    if (!parseResult.success) {
      const fieldErrors: Partial<Record<keyof CreateAnimalReportInput | 'root', string>> = {};
      parseResult.error.errors.forEach((err) => {
        const fieldName = err.path[0] as keyof CreateAnimalReportInput;
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const res = await onSubmit({
      ...parseResult.data,
      photos: parseResult.data.photos ?? [],
    });

    if (res.error) {
      setErrors({ root: res.error });
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white" showsVerticalScrollIndicator={false}>
      {/* Root Error Message */}
      {errors.root && (
        <View className="p-3 bg-red-50 rounded-lg border border-red-200 mb-4">
          <Text className="text-red-700 text-sm">{errors.root}</Text>
        </View>
      )}

      {/* 1. Report Kind Selection */}
      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-800 mb-2">
          {isBangla ? 'কী ধরনের রিপোর্ট করতে চান?' : 'What kind of report is this?'} *
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {KINDS.map((k) => {
            const isSelected = kind === k.id;
            return (
              <TouchableOpacity
                key={k.id}
                onPress={() => setKind(k.id)}
                className={`flex-1 min-w-[45%] p-3 rounded-xl border items-center justify-center ${
                  isSelected
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                activeOpacity={0.7}
              >
                <Text className="text-2xl mb-1">{k.icon}</Text>
                <Text
                  className={`text-xs text-center font-medium ${
                    isSelected ? 'text-green-800 font-bold' : 'text-gray-700'
                  }`}
                >
                  {isBangla ? k.bn : k.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Urgency Selection */}
      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-800 mb-2">
          {isBangla ? 'জরুরিত্ব মাত্রা' : 'Urgency Level'} *
        </Text>
        <View className="flex-row gap-2">
          {URGENCIES.map((u) => {
            const isSelected = urgency === u.id;
            return (
              <TouchableOpacity
                key={u.id}
                onPress={() => setUrgency(u.id)}
                className={`flex-1 py-2 rounded-lg border items-center ${
                  isSelected
                    ? `${u.color} border-transparent`
                    : 'border-gray-200 bg-white'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected
                      ? u.id === 'low'
                        ? 'text-green-950'
                        : 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {isBangla ? u.bn.split(' ')[0] : u.en.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Link Own Pet (If Lost Kind) */}
      {kind === 'lost' && userPets.length > 0 && (
        <View className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200">
          <Text className="text-sm font-semibold text-green-900 mb-1">
            {isBangla ? 'আপনার পোষা প্রাণী নির্বাচন করুন (ঐচ্ছিক)' : 'Select Your Pet Profile (Optional)'}
          </Text>
          <Text className="text-xs text-green-800 mb-2">
            {isBangla
              ? 'এটি নির্বাচন করলে প্রজাতি ও ছবি সরাসরি যুক্ত হবে।'
              : 'Auto-fills species and medical/identification records.'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleSelectOwnPet('')}
              className={`px-3 py-1.5 rounded-lg border ${
                petId === '' ? 'bg-green-700 border-green-700' : 'bg-white border-green-300'
              }`}
            >
              <Text className={`text-xs ${petId === '' ? 'text-white font-bold' : 'text-green-900'}`}>
                {isBangla ? 'কোনোটি নয়' : 'None'}
              </Text>
            </TouchableOpacity>
            {userPets.map((p) => {
              const isSelected = petId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => handleSelectOwnPet(p.id)}
                  className={`px-3 py-1.5 rounded-lg border ${
                    isSelected ? 'bg-green-700 border-green-700' : 'bg-white border-green-300'
                  }`}
                >
                  <Text className={`text-xs ${isSelected ? 'text-white font-bold' : 'text-green-900'}`}>
                    🐾 {p.name} ({p.species})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 4. Species Selection */}
      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-800 mb-2">
          {isBangla ? 'প্রাণীর প্রজাতি' : 'Species'} *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 py-1">
          {SPECIES_LIST.map((s) => {
            const isSelected = species === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSpecies(s.id)}
                className={`px-3.5 py-1.5 rounded-full border ${
                  isSelected
                    ? 'bg-green-700 border-green-700'
                    : 'bg-gray-100 border-gray-200'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-medium ${
                    isSelected ? 'text-white font-bold' : 'text-gray-700'
                  }`}
                >
                  {isBangla ? s.bn : s.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. Last Seen (For Lost/Found) */}
      {(kind === 'lost' || kind === 'found') && (
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-800 mb-1">
            {isBangla ? 'সর্বশেষ কখন দেখা গেছে? (তারিখ ও সময়)' : 'Last Seen Time'}
          </Text>
          <TextInput
            value={lastSeenAt}
            onChangeText={setLastSeenAt}
            placeholder={isBangla ? 'যেমন: ২০২৪-১১-১৮ ১২:৩০' : 'e.g. 2024-11-18 12:30'}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50"
          />
        </View>
      )}

      {/* 6. Incident Location & Area */}
      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-800 mb-1">
          {isBangla ? 'জেলা' : 'District'} *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 py-1 mb-3">
          {DISTRICTS.map((d) => {
            const isSelected = districtId === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => setDistrictId(d.id)}
                className={`px-3 py-1.5 rounded-lg border ${
                  isSelected ? 'bg-green-700 border-green-700' : 'bg-gray-100 border-gray-200'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-medium ${
                    isSelected ? 'text-white font-bold' : 'text-gray-700'
                  }`}
                >
                  {isBangla ? d.bn : d.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text className="text-sm font-semibold text-gray-800 mb-1">
          {isBangla ? 'ঘটনার স্থান / এলাকা' : 'Incident Location'}
        </Text>
        <TextInput
          value={areaText}
          onChangeText={setAreaText}
          placeholder={isBangla ? 'যেমন: মিরপুর ১০, গোল চত্বরের কাছে' : 'e.g. Mirpur 10, near roundabout'}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 mb-2"
        />
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleUseCurrentGps}
            className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300"
            activeOpacity={0.7}
          >
            <Text className="text-xs text-gray-800 font-medium">
              📍 {isBangla ? 'বর্তমান জিপিএস লোকেশন নিন' : 'Use Current GPS'}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-gray-500">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </Text>
        </View>
      </View>

      {/* 7. Photos with EXIF / GPS stripped notice */}
      <View className="mb-5">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-sm font-semibold text-gray-800">
            {isBangla ? 'ছবি যুক্ত করুন (সর্বোচ্চ ৬টি)' : 'Photos (Max 6)'}
          </Text>
          <Text className="text-xs text-green-700 font-semibold">
            🔒 {isBangla ? 'EXIF/GPS মুছে ফেলা হয়' : 'EXIF Stripped'}
          </Text>
        </View>
        <Text className="text-xs text-gray-500 mb-2">
          {isBangla
            ? 'প্রাণীর নিরাপত্তা ও গোপনীয়তা রক্ষায় মেটাডেটা স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়।'
            : 'Image metadata and device GPS are stripped on-device before storage.'}
        </Text>

        <TouchableOpacity
          onPress={handleAddSamplePhoto}
          disabled={photos.length >= 6 || isStrippingExif}
          className="p-3 border border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50 mb-3"
          activeOpacity={0.7}
        >
          {isStrippingExif ? (
            <ActivityIndicator size="small" color="#2F7B53" />
          ) : (
            <Text className="text-sm text-green-700 font-semibold">
              📷 {isBangla ? '+ ছবি তুলুন বা যোগ করুন' : '+ Take or Add Photo'}
            </Text>
          )}
        </TouchableOpacity>

        {photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {photos.map((src, index) => (
              <View key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <Image source={{ uri: src }} className="w-full h-full" resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full w-5 h-5 items-center justify-center"
                >
                  <Text className="text-white text-xs font-bold">✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* 8. Emergency Contact Phone */}
      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-800 mb-1">
          {isBangla ? 'জরুরি যোগাযোগের ফোন নম্বর (গোপনীয়)' : 'Emergency Contact Phone (Confidential)'}
        </Text>
        <Text className="text-xs text-gray-500 mb-2">
          {isBangla
            ? 'এই নম্বরটি কেবল নিযুক্ত উদ্ধারকারী দেখতে পারবেন, পাবলিক প্ল্যাটফর্মে প্রকাশ করা হবে না।'
            : 'Shared only with verified rescuers, never public.'}
        </Text>
        <TextInput
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="+8801XXXXXXXXX"
          keyboardType="phone-pad"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50"
        />
        {errors.contact_phone && (
          <Text className="text-red-600 text-xs mt-1">{errors.contact_phone}</Text>
        )}
      </View>

      {/* 9. Description */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-gray-800 mb-1">
          {isBangla ? 'বিস্তারিত বিবরণ' : 'Detailed Description'}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder={
            isBangla
              ? 'প্রাণীর অবস্থা, আঘাতের ধরন বা শারীরিক কোনো চিহ্ন উল্লেখ করুন...'
              : 'Condition, injuries, color markings, or specific identifiers...'
          }
          className="border border-gray-300 rounded-lg p-3 text-sm text-gray-900 bg-gray-50 h-24"
        />
        {errors.description && (
          <Text className="text-red-600 text-xs mt-1">{errors.description}</Text>
        )}
      </View>

      {/* 10. Action Buttons */}
      <View className="flex-row gap-3 pb-8">
        {onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl border border-gray-300 bg-white items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-gray-700 font-semibold">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || isStrippingExif}
          className="flex-1 py-3 rounded-xl bg-primary items-center justify-center"
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text className="text-white font-bold text-base">
              {isBangla ? 'রিপোর্ট জমা দিন' : 'Submit Report'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
