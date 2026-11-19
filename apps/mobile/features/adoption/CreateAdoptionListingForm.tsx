import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { CreateListingPayload } from '@pranora/api';
import type { SpeciesType, PetGender } from '@pranora/types';
import {
  DISTRICT_MAP,
  MOCK_ELIGIBLE_PETS,
  type EligiblePetForAdoption,
} from './mockData';

interface CreateAdoptionListingFormProps {
  isApprovedLister?: boolean;
  userRole?: 'shelter' | 'adoption_lister' | 'admin' | 'owner';
  shelterId?: string | null;
  pets?: EligiblePetForAdoption[];
  onSubmitListing?: (payload: CreateListingPayload) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
}

export function CreateAdoptionListingForm({
  isApprovedLister = true,
  userRole = 'shelter',
  shelterId = null,
  pets = MOCK_ELIGIBLE_PETS,
  onSubmitListing,
  onCancel,
}: CreateAdoptionListingFormProps) {
  const { isBangla } = useLocale();

  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [species, setSpecies] = useState<SpeciesType>('dog');
  const [gender, setGender] = useState<PetGender>('unknown');
  const [ageMonths, setAgeMonths] = useState<number | ''>('');
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [districtId, setDistrictId] = useState<number>(1);
  const [areaText, setAreaText] = useState('');
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [isNeutered, setIsNeutered] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSelectPet = (pet: EligiblePetForAdoption) => {
    if (pet.has_active_listing) return;

    setSelectedPetId(pet.id);
    setSpecies(pet.species);
    setGender(pet.gender);
    setAgeMonths(pet.age_months);
    setIsVaccinated(pet.is_vaccinated);
    setIsNeutered(pet.is_neutered);

    if (pet.photo_url) {
      setPhotos((prev) => (prev.includes(pet.photo_url!) ? prev : [pet.photo_url!, ...prev]));
    }

    const speciesBn = pet.species === 'dog' ? 'কুকুর' : pet.species === 'cat' ? 'বিড়াল' : 'প্রাণী';
    const speciesEn = pet.species.charAt(0).toUpperCase() + pet.species.slice(1);

    if (!titleBn) {
      setTitleBn(`${pet.name} - চমৎকার ${speciesBn} দত্তকের জন্য প্রস্তুত`);
    }
    if (!titleEn) {
      setTitleEn(`${pet.name} - Loving ${speciesEn} looking for a forever home`);
    }
  };

  const handleAddSamplePhoto = () => {
    // Mobile demo photo placeholder (EXIF-stripped web-safe asset)
    const sample = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';
    setPhotos((prev) => [...prev, sample]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (targetStatus: 'available' | 'draft') => {
    setStatusMessage(null);

    if (!selectedPetId) {
      setStatusMessage({
        type: 'error',
        text: isBangla ? 'একটি পোষা প্রাণীর প্রোফাইল বেছে নিন' : 'Please select a pet profile',
      });
      return;
    }

    const payload: CreateListingPayload = {
      pet_id: selectedPetId,
      shelter_id: shelterId,
      species,
      gender,
      age_months: ageMonths === '' ? null : Number(ageMonths),
      title_bn: titleBn.trim() || null,
      title_en: titleEn.trim() || null,
      description_bn: descriptionBn.trim() || null,
      description_en: descriptionEn.trim() || null,
      photos,
      is_vaccinated: isVaccinated,
      is_neutered: isNeutered,
      district_id: districtId,
      status: targetStatus,
    };

    setIsSubmitting(true);
    try {
      if (onSubmitListing) {
        const res = await onSubmitListing(payload);
        if (!res.success) {
          setStatusMessage({
            type: 'error',
            text: res.error || (isBangla ? 'তালিকা তৈরি ব্যর্থ হয়েছে' : 'Failed to create listing'),
          });
          return;
        }
      }

      setStatusMessage({
        type: 'success',
        text:
          targetStatus === 'available'
            ? isBangla
              ? '✅ দত্তক তালিকা সফলভাবে প্রকাশিত হয়েছে!'
              : '✅ Adoption listing published!'
            : isBangla
            ? '💾 খসড়া সংরক্ষিত হয়েছে!'
            : '💾 Saved as draft!',
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: isBangla ? 'সার্ভারে সমস্যা হয়েছে' : 'Server error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Verification status banner */}
      <View
        style={[
          styles.banner,
          isApprovedLister ? styles.verifiedBanner : styles.pendingBanner,
        ]}
      >
        <Text style={styles.bannerIcon}>{isApprovedLister ? '🛡️' : '⚠️'}</Text>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>
            {isApprovedLister
              ? isBangla
                ? `অনুমোদিত লিস্টার (${userRole === 'shelter' ? 'আশ্রয়কেন্দ্র' : 'অনুমোদিত ব্যক্তি'})`
                : `Approved Lister (${userRole === 'shelter' ? 'Shelter' : 'Approved Individual'})`
              : isBangla
              ? 'লিস্টার অনুমোদন প্রয়োজন'
              : 'Lister Approval Required'}
          </Text>
          <Text style={styles.bannerSubtext}>
            {isApprovedLister
              ? isBangla
                ? 'যাচাইকৃত প্রোফাইল হিসেবে আপনি দত্তক তালিকা প্রকাশ করতে পারেন।'
                : 'Verified profile permitted to publish adoption listings.'
              : isBangla
              ? 'দত্তক তালিকা পোস্ট করতে ভেরিফাইড শেল্টার অথবা লিস্টার অনুমোদন দরকার।'
              : 'Shelter verification or approved lister role needed to publish.'}
          </Text>
        </View>
      </View>

      {/* 2. Step 1: Pet Picker */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {isBangla ? '১. পোষা প্রাণীর প্রোফাইল নির্বাচন (ADP-2)' : '1. Select Pet Profile (ADP-2)'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {isBangla ? 'প্রোফাইল বেছে নিলে তথ্য স্বয়ংক্রিয়ভাবে যুক্ত হবে।' : 'Select a profile to auto-populate info.'}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll}>
          {pets.map((pet) => {
            const isSelected = selectedPetId === pet.id;
            return (
              <TouchableOpacity
                key={pet.id}
                onPress={() => handleSelectPet(pet)}
                disabled={pet.has_active_listing}
                style={[
                  styles.petCard,
                  isSelected && styles.petCardSelected,
                  pet.has_active_listing && styles.petCardDisabled,
                ]}
              >
                {pet.photo_url ? (
                  <Image source={{ uri: pet.photo_url }} style={styles.petImage} />
                ) : (
                  <View style={styles.petPlaceholder}>
                    <Text style={styles.petPlaceholderText}>🐾</Text>
                  </View>
                )}
                <Text style={styles.petName} numberOfLines={1}>
                  {pet.name}
                </Text>
                <Text style={styles.petSub}>
                  {pet.species} · {pet.age_months} {isBangla ? 'মাস' : 'm'}
                </Text>
                {pet.has_active_listing && (
                  <Text style={styles.alreadyListedText}>
                    {isBangla ? 'ইতিমধ্যে তালিকাভুক্ত' : 'Already listed'}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Step 2: Listing Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {isBangla ? '২. দ্বিভাষিক শিরোনাম ও বিবরণ' : '2. Bilingual Titles & Description'}
        </Text>

        <Text style={styles.fieldLabel}>{isBangla ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'}</Text>
        <TextInput
          style={styles.input}
          value={titleBn}
          onChangeText={setTitleBn}
          placeholder="যেমন: টফি - শান্ত ও চঞ্চল কুকুরছানা"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.fieldLabel}>{isBangla ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}</Text>
        <TextInput
          style={styles.input}
          value={titleEn}
          onChangeText={setTitleEn}
          placeholder="e.g. Toffee - Gentle & Playful Deshi Pup"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.fieldLabel}>{isBangla ? 'বিবরণ (বাংলা)' : 'Description (Bangla)'}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descriptionBn}
          onChangeText={setDescriptionBn}
          placeholder="প্রাণীটির আচরণ, স্বভাব ও পছন্দের তথ্য..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.fieldLabel}>{isBangla ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descriptionEn}
          onChangeText={setDescriptionEn}
          placeholder="Temperament, behavior, habits..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* 4. Step 3: Location & Health */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {isBangla ? '৩. এলাকা ও স্বাস্থ্য তথ্য' : '3. Area & Health Information'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {isBangla ? 'নিরাপত্তার স্বার্থে কেবল জেলা ও এলাকা উল্লেখ করুন।' : 'Area only. Never exact home address.'}
        </Text>

        <Text style={styles.fieldLabel}>{isBangla ? 'জেলা / District' : 'District'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.districtChips}>
          {Object.entries(DISTRICT_MAP).map(([id, names]) => {
            const numId = Number(id);
            const isSelected = districtId === numId;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setDistrictId(numId)}
                style={[styles.districtChip, isSelected && styles.districtChipSelected]}
              >
                <Text style={[styles.districtText, isSelected && styles.districtTextSelected]}>
                  {isBangla ? names.bn : names.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.fieldLabel}>{isBangla ? 'এলাকা / পাড়া (ঐচ্ছিক)' : 'Area / Neighborhood'}</Text>
        <TextInput
          style={styles.input}
          value={areaText}
          onChangeText={setAreaText}
          placeholder="যেমন: ধানমন্ডি, মিরপুর ১০"
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>💉 {isBangla ? 'ভ্যাকসিন দেওয়া আছে' : 'Vaccinated'}</Text>
          <Switch value={isVaccinated} onValueChange={setIsVaccinated} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>✂️ {isBangla ? 'নিউটার্ড / স্পেড' : 'Neutered / Spayed'}</Text>
          <Switch value={isNeutered} onValueChange={setIsNeutered} />
        </View>
      </View>

      {/* 5. Photos */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {isBangla ? '৪. ছবি (EXIF ডাটা অপসারিত)' : '4. Photos (EXIF Stripped)'}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
          {photos.map((uri, idx) => (
            <View key={idx} style={styles.photoContainer}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => handleRemovePhoto(idx)}
              >
                <Text style={styles.removePhotoText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddSamplePhoto}>
            <Text style={styles.addPhotoIcon}>📷 +</Text>
            <Text style={styles.addPhotoText}>
              {isBangla ? 'ছবি যোগ করুন' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Status Feedback */}
      {statusMessage && (
        <View
          style={[
            styles.feedback,
            statusMessage.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              statusMessage.type === 'success'
                ? styles.feedbackTextSuccess
                : styles.feedbackTextError,
            ]}
          >
            {statusMessage.text}
          </Text>
        </View>
      )}

      {/* 6. Actions */}
      <View style={styles.actionsRow}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isSubmitting}>
            <Text style={styles.cancelButtonText}>{isBangla ? 'বাতিল' : 'Cancel'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.draftButton}
          onPress={() => handleSubmit('draft')}
          disabled={isSubmitting || !isApprovedLister}
        >
          <Text style={styles.draftButtonText}>{isBangla ? 'খসড়া সংরক্ষণ' : 'Save Draft'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.publishButton, (!isApprovedLister || isSubmitting) && styles.disabledButton]}
          onPress={() => handleSubmit('available')}
          disabled={isSubmitting || !isApprovedLister}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.publishButtonText}>
              {isBangla ? 'তালিকা প্রকাশ করুন' : 'Publish Listing'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  banner: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  verifiedBanner: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  pendingBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  bannerIcon: {
    fontSize: 24,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065f46',
  },
  bannerSubtext: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  petScroll: {
    flexDirection: 'row',
    marginTop: 6,
  },
  petCard: {
    width: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
    backgroundColor: '#ffffff',
  },
  petCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  petCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#f3f4f6',
  },
  petImage: {
    width: '100%',
    height: 70,
    borderRadius: 6,
    marginBottom: 6,
  },
  petPlaceholder: {
    width: '100%',
    height: 70,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  petPlaceholderText: {
    fontSize: 24,
  },
  petName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  petSub: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  alreadyListedText: {
    fontSize: 9,
    color: '#b45309',
    fontWeight: '600',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  districtChips: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  districtChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  districtChipSelected: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  districtText: {
    fontSize: 12,
    color: '#374151',
  },
  districtTextSelected: {
    color: '#065f46',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
  },
  photosScroll: {
    flexDirection: 'row',
    marginTop: 6,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 10,
  },
  photoThumb: {
    width: 75,
    height: 75,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  addPhotoButton: {
    width: 75,
    height: 75,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  addPhotoIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
  addPhotoText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  feedback: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
  },
  feedbackError: {
    backgroundColor: '#ffe4e6',
    borderColor: '#fecdd3',
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackTextSuccess: {
    color: '#065f46',
  },
  feedbackTextError: {
    color: '#9f1239',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  draftButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  draftButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  publishButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  publishButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
});
