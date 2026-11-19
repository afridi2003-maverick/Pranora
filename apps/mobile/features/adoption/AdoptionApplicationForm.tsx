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
import type { AdoptionListingRow, CreateApplicationPayload } from '@pranora/api';
import type { HomeType } from '@pranora/types';
import { DISTRICT_MAP } from './mockData';
import { formatAge } from './AdoptionCard';

interface AdoptionApplicationFormProps {
  listing: AdoptionListingRow;
  applicantId?: string;
  onSubmitApplication?: (payload: CreateApplicationPayload) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const HOME_TYPES: { id: HomeType; bn: string; en: string }[] = [
  { id: 'own_flat', bn: 'নিজের ফ্ল্যাট', en: 'Own Flat' },
  { id: 'rented_flat', bn: 'ভাড়া ফ্ল্যাট', en: 'Rented Flat' },
  { id: 'own_house', bn: 'নিজের বাড়ি', en: 'Own House' },
  { id: 'rented_house', bn: 'ভাড়া বাড়ি', en: 'Rented House' },
  { id: 'other', bn: 'অন্যান্য', en: 'Other' },
];

export function AdoptionApplicationForm({
  listing,
  applicantId: _applicantId = 'current-user-id',
  onSubmitApplication,
  onCancel,
  onSuccess,
}: AdoptionApplicationFormProps) {
  const { isBangla } = useLocale();

  const [homeType, setHomeType] = useState<HomeType>('own_flat');
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [experience, setExperience] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const title = isBangla
    ? listing.title_bn || listing.title_en || 'প্রাণী'
    : listing.title_en || listing.title_bn || 'Pet';

  const district = DISTRICT_MAP[listing.district_id]
    ? isBangla
      ? DISTRICT_MAP[listing.district_id]?.bn
      : DISTRICT_MAP[listing.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = listing.photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (reason.trim().length < 10) {
      setErrorMessage(
        isBangla
          ? 'দত্তক নেওয়ার কারণ কমপক্ষে ১০ অক্ষরে বিস্তারিত লিখুন।'
          : 'Please enter at least 10 characters for your reason.'
      );
      return;
    }

    const payload: CreateApplicationPayload = {
      listing_id: listing.id,
      home_type: homeType,
      has_other_pets: hasOtherPets,
      experience: experience.trim() || null,
      reason: reason.trim(),
    };

    setIsSubmitting(true);
    try {
      if (onSubmitApplication) {
        const res = await onSubmitApplication(payload);
        if (!res.success) {
          setErrorMessage(res.error || (isBangla ? 'আবেদন জমা ব্যর্থ হয়েছে।' : 'Failed to submit application.'));
          return;
        }
      }

      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch {
      setErrorMessage(isBangla ? 'সার্ভার সমস্যা হয়েছে।' : 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={{ fontSize: 28, color: '#059669' }}>✓</Text>
        </View>
        <Text style={styles.successTitle}>
          {isBangla ? 'আবেদন সফলভাবে জমা হয়েছে!' : 'Application Submitted!'}
        </Text>
        <Text style={styles.successSubtext}>
          {isBangla
            ? `"${title}" এর জন্য আপনার আবেদন লিস্টার বা আশ্রয়কেন্দ্রে পাঠানো হয়েছে। মানুষ দ্বারা পর্যালোচনার পর আপনি ফলাফল জানতে পারবেন।`
            : `Your application for "${title}" has been sent. The caretaker will personally review it.`}
        </Text>
        <View style={styles.humanReviewBadge}>
          <Text style={styles.humanReviewBadgeText}>
            🤝 {isBangla ? '১০০% মানবিক যাচাই — কোনো এআই সিদ্ধান্ত নয়।' : '100% Human decision — never automated by AI.'}
          </Text>
        </View>
        {onCancel && (
          <TouchableOpacity style={styles.primaryButton} onPress={onCancel}>
            <Text style={styles.primaryButtonText}>
              {isBangla ? 'তালিকায় ফিরুন' : 'Back to Listings'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Pet Preview Card */}
      <View style={styles.petCard}>
        <Image source={{ uri: photo }} style={styles.petThumb} />
        <View style={styles.petInfo}>
          <View style={styles.petBadgeRow}>
            <View style={styles.speciesBadge}>
              <Text style={styles.speciesBadgeText}>{listing.species}</Text>
            </View>
            <Text style={styles.petDistrictText}>📍 {district}</Text>
          </View>
          <Text style={styles.petTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.petDetails}>
            {formatAge(listing.age_months, isBangla)} · {listing.gender}
            {listing.is_vaccinated && ' · 💉 ' + (isBangla ? 'ভ্যাকসিনেটেড' : 'Vaccinated')}
          </Text>
        </View>
      </View>

      {/* 2. Application Form (ADP-3) */}
      <View style={styles.formCard}>
        <Text style={styles.sectionHeader}>
          {isBangla ? 'দত্তক আবেদন ফরম (ADP-3)' : 'Adoption Application Form (ADP-3)'}
        </Text>
        <Text style={styles.sectionSub}>
          {isBangla
            ? 'পারিবারিক পরিবেশ ও প্রস্তুতি সম্পর্কে তথ্য দিন।'
            : 'Please share your home setting and pet preparation.'}
        </Text>

        {/* Home Type */}
        <Text style={styles.fieldLabel}>
          {isBangla ? '১. আপনার বাসার ধরন *' : '1. Your Home Environment *'}
        </Text>
        <View style={styles.homeTypeGrid}>
          {HOME_TYPES.map((type) => {
            const isSelected = homeType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                onPress={() => setHomeType(type.id)}
                style={[styles.homeTypeOption, isSelected && styles.homeTypeOptionSelected]}
              >
                <Text style={[styles.homeTypeText, isSelected && styles.homeTypeTextSelected]}>
                  {isBangla ? type.bn : type.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Other Pets */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            🐾 {isBangla ? 'বাসায় বর্তমানে অন্য কোনো পোষা প্রাণী আছে' : 'Currently have other pets at home'}
          </Text>
          <Switch value={hasOtherPets} onValueChange={setHasOtherPets} />
        </View>

        {/* Experience */}
        <Text style={styles.fieldLabel}>
          {isBangla
            ? '২. আগের পোষা প্রাণী পালনের অভিজ্ঞতা (ঐচ্ছিক)'
            : '2. Previous Pet Care Experience (Optional)'}
        </Text>
        <TextInput
          style={[styles.input, styles.textAreaSmall]}
          value={experience}
          onChangeText={setExperience}
          placeholder={
            isBangla
              ? 'যেমন: ছোটবেলা থেকেই বিড়াল লালন-পালনের অভিজ্ঞতা আছে...'
              : 'e.g. Raised rescued pets, familiar with diet and care...'
          }
          placeholderTextColor="#9ca3af"
          multiline
        />

        {/* Reason */}
        <Text style={styles.fieldLabel}>
          {isBangla
            ? '৩. কেন আপনি এই প্রাণীটিকে দত্তক নিতে চান? *'
            : '3. Why do you want to adopt this pet? *'}
        </Text>
        <TextInput
          style={[styles.input, styles.textAreaLarge]}
          value={reason}
          onChangeText={setReason}
          placeholder={
            isBangla
              ? 'পরিবারের প্রস্তুতি ও ভালোবাসার পরিকল্পনা লিখুন (কমপক্ষে ১০ অক্ষর)...'
              : 'Describe your routine, care plan, and readiness (minimum 10 chars)...'
          }
          placeholderTextColor="#9ca3af"
          multiline
        />

        {/* Human review note */}
        <View style={styles.guaranteeBox}>
          <Text style={styles.guaranteeTitle}>
            🛡️ {isBangla ? '১০০% মানবিক পর্যালোচনা নিশ্চিতকরণ' : '100% Human Review Guarantee'}
          </Text>
          <Text style={styles.guaranteeText}>
            {isBangla
              ? 'আপনার আবেদনটি সরাসরি উদ্ধারকারী বা আশ্রয়কেন্দ্র পরিচালক নিজে বিবেচনা করবেন। কোনো এআই সিদ্ধান্তের সাথে জড়িত নয়।'
              : 'Decided personally by real human caregivers. AI is never used to decide.'}
          </Text>
        </View>

        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          {onCancel && (
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>{isBangla ? 'বাতিল' : 'Cancel'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isBangla ? 'আবেদন জমা দিন' : 'Submit Application'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  petCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  petThumb: {
    width: 65,
    height: 65,
    borderRadius: 10,
  },
  petInfo: {
    flex: 1,
  },
  petBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speciesBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  speciesBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065f46',
    textTransform: 'uppercase',
  },
  petDistrictText: {
    fontSize: 11,
    color: '#6b7280',
  },
  petTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  petDetails: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 10,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSub: {
    fontSize: 12,
    color: '#6b7280',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 6,
  },
  homeTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  homeTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  homeTypeOptionSelected: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  homeTypeText: {
    fontSize: 12,
    color: '#374151',
  },
  homeTypeTextSelected: {
    color: '#065f46',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
    paddingRight: 8,
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
  textAreaSmall: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  guaranteeBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 10,
    marginTop: 4,
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  guaranteeText: {
    fontSize: 11,
    color: '#78350f',
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: '#ffe4e6',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  errorText: {
    fontSize: 11,
    color: '#9f1239',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  successSubtext: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  humanReviewBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 6,
  },
  humanReviewBadgeText: {
    fontSize: 11,
    color: '#4b5563',
  },
});
