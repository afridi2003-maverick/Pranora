import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { FollowupWithHandover } from './mockData';
import { DISTRICT_MAP } from './mockData';

interface AdoptionFollowupCardProps {
  followups: FollowupWithHandover[];
  initialSelectedId?: string;
  onSubmitFollowup?: (
    followupId: string,
    payload: {
      wellbeing: 'good' | 'okay' | 'needs_help';
      note?: string | null;
      photos: string[];
    }
  ) => Promise<{ success: boolean; error?: string }>;
  onBack?: () => void;
}

export function AdoptionFollowupCard({
  followups: initialFollowups,
  initialSelectedId,
  onSubmitFollowup,
  onBack,
}: AdoptionFollowupCardProps) {
  const { isBangla } = useLocale();
  const [followups, setFollowups] = useState<FollowupWithHandover[]>(initialFollowups);
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || followups[0]?.followup.id || ''
  );

  const [wellbeing, setWellbeing] = useState<'good' | 'okay' | 'needs_help'>('good');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedItem = followups.find((f) => f.followup.id === selectedId) || followups[0];
  if (!selectedItem) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {isBangla ? 'কোনো ফলো-আপ তথ্য পাওয়া যায়নি।' : 'No follow-up records found.'}
        </Text>
      </View>
    );
  }

  const { followup, listing, petName } = selectedItem;
  const isAnswered = Boolean(followup.answered_at);
  const isDue = new Date(followup.due_on).getTime() <= Date.now();

  const district = DISTRICT_MAP[listing.district_id]
    ? isBangla
      ? DISTRICT_MAP[listing.district_id]?.bn
      : DISTRICT_MAP[listing.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = listing.photos?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';

  const handleAddSamplePhoto = () => {
    if (photos.length >= 6) return;
    const sample = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';
    setPhotos((prev) => [...prev, sample]);
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (onSubmitFollowup) {
        const res = await onSubmitFollowup(followup.id, {
          wellbeing,
          note: note.trim() || null,
          photos,
        });

        if (!res.success) {
          setErrorMessage(res.error || (isBangla ? 'জমা দেওয়া সম্ভব হয়নি।' : 'Failed to submit check-in.'));
          setIsSubmitting(false);
          return;
        }
      }

      const answeredIso = new Date().toISOString();
      setFollowups((prev) =>
        prev.map((item) =>
          item.followup.id === followup.id
            ? {
                ...item,
                followup: {
                  ...item.followup,
                  answered_at: answeredIso,
                  wellbeing,
                  note: note.trim() || null,
                  photos,
                },
              }
            : item
        )
      );

      setSuccessMessage(
        isBangla
          ? 'ধন্যবাদ! আপনার চেক-ইন সফলভাবে সংরক্ষিত হয়েছে।'
          : 'Thank you! Your check-in report has been recorded.'
      );
    } catch {
      setErrorMessage(isBangla ? 'সার্ভারে সমস্যা হয়েছে।' : 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Pet Header Card */}
      <View style={styles.headerCard}>
        <Image source={{ uri: photo }} style={styles.petImage} />
        <View style={styles.headerInfo}>
          <View style={styles.badgeRow}>
            <View style={styles.speciesBadge}>
              <Text style={styles.speciesText}>{listing.species}</Text>
            </View>
            <Text style={styles.districtText}>📍 {district}</Text>
          </View>
          <Text style={styles.petNameText} numberOfLines={1}>
            {petName}
          </Text>
          <Text style={styles.subtext}>
            {isBangla ? 'দত্তক পরবর্তী কল্যাণ যাচাই সূচি (ADP-9)' : 'Welfare Milestones (ADP-9)'}
          </Text>
        </View>
      </View>

      {/* 2. Milestone Stepper */}
      <View style={styles.milestoneCard}>
        <Text style={styles.sectionTitle}>
          {isBangla ? 'ফলো-আপ সময়সীমা' : 'Check-in Milestones'}
        </Text>

        <View style={styles.milestoneRow}>
          {followups.map((item, idx) => {
            const f = item.followup;
            const isSelected = f.id === selectedId;
            const itemAnswered = Boolean(f.answered_at);
            const itemDue = new Date(f.due_on).getTime() <= Date.now();
            const milestoneLabel = idx === 0 ? '৩০ দিন' : idx === 1 ? '৯০ দিন' : '১৮০ দিন';
            const milestoneLabelEn = idx === 0 ? '30 Days' : idx === 1 ? '90 Days' : '180 Days';

            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => {
                  setSelectedId(f.id);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                style={[
                  styles.milestoneBtn,
                  isSelected && styles.milestoneBtnSelected,
                ]}
              >
                <View style={styles.milestoneTop}>
                  <Text style={styles.milestoneLabel}>
                    {isBangla ? milestoneLabel : milestoneLabelEn}
                  </Text>
                  <Text style={styles.milestoneIcon}>
                    {itemAnswered ? '✅' : itemDue ? '🔔' : '⏳'}
                  </Text>
                </View>

                <Text style={styles.milestoneDate}>
                  {new Date(f.due_on).toLocaleDateString()}
                </Text>

                <View
                  style={[
                    styles.statusPill,
                    itemAnswered
                      ? styles.statusPillSuccess
                      : itemDue
                      ? styles.statusPillDue
                      : styles.statusPillWait,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      itemAnswered
                        ? styles.statusPillTextSuccess
                        : itemDue
                        ? styles.statusPillTextDue
                        : styles.statusPillTextWait,
                    ]}
                  >
                    {itemAnswered
                      ? isBangla ? 'সম্পন্ন' : 'Done'
                      : itemDue
                      ? isBangla ? 'এখনই' : 'Due'
                      : isBangla ? 'আসন্ন' : 'Wait'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Action or Completed Card */}
      <View style={styles.actionCard}>
        {isAnswered ? (
          /* Answered view */
          <View style={styles.answeredView}>
            <View style={styles.answeredHeader}>
              <View>
                <Text style={styles.cardTitle}>
                  {isBangla ? 'চেক-ইন বিবরণী' : 'Check-in Report'}
                </Text>
                <Text style={styles.answeredDate}>
                  {isBangla ? 'তারিখ: ' : 'Date: '}
                  {new Date(followup.answered_at!).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>
                  ✅ {isBangla ? 'যাচাই সম্পন্ন' : 'Verified'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.fieldLabel}>
                {isBangla ? 'সার্বিক অবস্থা:' : 'Overall Wellbeing:'}
              </Text>
              <Text style={styles.fieldValue}>
                {followup.wellbeing === 'good'
                  ? '😺 ' + (isBangla ? 'খুব ভালো আছে' : 'Doing Great')
                  : followup.wellbeing === 'okay'
                  ? '😐 ' + (isBangla ? 'মোটামুটি চলছে' : 'Doing Okay')
                  : '🚨 ' + (isBangla ? 'সহায়তা প্রয়োজন' : 'Needs Help')}
              </Text>
            </View>

            {followup.note && (
              <View style={styles.noteBox}>
                <Text style={styles.fieldLabel}>
                  {isBangla ? 'অভিভাবকের মন্তব্য:' : 'Guardian Note:'}
                </Text>
                <Text style={styles.noteBody}>{followup.note}</Text>
              </View>
            )}

            {followup.photos && followup.photos.length > 0 && (
              <View style={styles.photosSection}>
                <Text style={styles.fieldLabel}>
                  {isBangla ? 'ছবিসমূহ:' : 'Attached Photos:'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
                  {followup.photos.map((url: string, i: number) => (
                    <Image key={i} source={{ uri: url }} style={styles.thumbImage} />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        ) : isDue ? (
          /* Form for due milestone */
          <View style={styles.formContainer}>
            <Text style={styles.cardTitle}>
              {isBangla ? 'পোষা প্রাণীর কল্যাণ চেক-ইন' : 'Pet Welfare Check-In'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isBangla
                ? 'প্রাণীর বর্তমান সার্বিক অবস্থা নির্বাচন করুন:*'
                : 'Select the pet current condition:*'}
            </Text>

            {/* Wellbeing Radio Options */}
            <View style={styles.optionsCol}>
              {[
                {
                  value: 'good' as const,
                  icon: '😺',
                  titleBn: 'খুব ভালো আছে (সুস্থ ও চঞ্চল)',
                  titleEn: 'Doing Great (Healthy & Playful)',
                },
                {
                  value: 'okay' as const,
                  icon: '😐',
                  titleBn: 'মোটামুটি চলছে (ধীরে ধীরে মানিয়ে নিচ্ছে)',
                  titleEn: 'Doing Okay (Adjusting gradually)',
                },
                {
                  value: 'needs_help' as const,
                  icon: '🚨',
                  titleBn: 'সহায়তা প্রয়োজন (স্বাস্থ্য বা খাবার নিয়ে চিন্তা)',
                  titleEn: 'Needs Help (Health or feeding concerns)',
                },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setWellbeing(opt.value)}
                  style={[
                    styles.optionBtn,
                    wellbeing === opt.value && styles.optionBtnSelected,
                  ]}
                >
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
                  <Text style={styles.optionText}>
                    {isBangla ? opt.titleBn : opt.titleEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Help Alert */}
            {wellbeing === 'needs_help' && (
              <View style={styles.alertBox}>
                <Text style={styles.alertTitle}>
                  ⚠️ {isBangla ? 'পরামর্শ ও সেবা নির্দেশিকা:' : 'Care Notice:'}
                </Text>
                <Text style={styles.alertText}>
                  {isBangla
                    ? 'জরুরি চিকিৎসায় প্রাণোরা নিকটস্থ ভেট ম্যাপ (/map) দেখুন।'
                    : 'Check the nearest vet on the Pranora map (/map) for medical care.'}
                </Text>
              </View>
            )}

            {/* Note Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {isBangla ? 'মন্তব্য ও আপডেট (ঐচ্ছিক):' : 'Notes & Updates (Optional):'}
              </Text>
              <TextInput
                style={styles.textArea}
                value={note}
                onChangeText={setNote}
                placeholder={
                  isBangla
                    ? 'প্রাণীর খাদ্যাভ্যাস, খেলাধুলা বা আচরণ লিখুন...'
                    : 'Describe diet, habits, or how they are bonding...'
                }
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Photos */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {isBangla ? 'সাম্প্রতিক ছবি (EXIF অপসারিত):' : 'Recent Photos (EXIF Stripped):'}
              </Text>
              <View style={styles.photoUploadRow}>
                {photos.map((uri, idx) => (
                  <View key={idx} style={styles.photoThumbWrapper}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <TouchableOpacity
                      onPress={() => handleRemovePhoto(idx)}
                      style={styles.removePhotoBtn}
                    >
                      <Text style={styles.removePhotoText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {photos.length < 6 && (
                  <TouchableOpacity
                    onPress={handleAddSamplePhoto}
                    style={styles.addPhotoBtn}
                  >
                    <Text style={styles.addPhotoIcon}>+</Text>
                    <Text style={styles.addPhotoLabel}>
                      {isBangla ? 'ছবি যোগ' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {successMessage && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitButton, isSubmitting && styles.btnDisabled]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isBangla ? 'চেক-ইন জমা দিন' : 'Submit Check-in'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* Milestone Not Yet Due */
          <View style={styles.waitView}>
            <Text style={styles.waitIcon}>⏳</Text>
            <Text style={styles.waitTitle}>
              {isBangla ? 'এই চেক-ইনের সময় এখনো হয়নি' : 'Milestone Not Yet Due'}
            </Text>
            <Text style={styles.waitSub}>
              {isBangla
                ? `নির্ধারিত তারিখ: ${new Date(followup.due_on).toLocaleDateString()}`
                : `Scheduled for: ${new Date(followup.due_on).toLocaleDateString()}`}
            </Text>
          </View>
        )}

        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>
              ← {isBangla ? 'ফিরে যান' : 'Back'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  petImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  speciesBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  speciesText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  districtText: {
    fontSize: 11,
    color: '#6b7280',
  },
  petNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subtext: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  milestoneCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  milestoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  milestoneBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 4,
  },
  milestoneBtnSelected: {
    borderColor: '#059669',
    borderWidth: 2,
    backgroundColor: '#ecfdf5',
  },
  milestoneTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  milestoneIcon: {
    fontSize: 12,
  },
  milestoneDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusPillSuccess: {
    backgroundColor: '#d1fae5',
  },
  statusPillDue: {
    backgroundColor: '#fef3c7',
  },
  statusPillWait: {
    backgroundColor: '#f3f4f6',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  statusPillTextSuccess: {
    color: '#065f46',
  },
  statusPillTextDue: {
    color: '#92400e',
  },
  statusPillTextWait: {
    color: '#6b7280',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  answeredView: {
    gap: 12,
  },
  answeredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  answeredDate: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
  },
  infoRow: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  noteBox: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    gap: 4,
  },
  noteBody: {
    fontSize: 12,
    color: '#1f2937',
    lineHeight: 18,
  },
  photosSection: {
    gap: 6,
  },
  photoList: {
    flexDirection: 'row',
  },
  thumbImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formContainer: {
    gap: 12,
  },
  optionsCol: {
    gap: 8,
    marginTop: 6,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  optionBtnSelected: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  optionIcon: {
    fontSize: 18,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  alertBox: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 2,
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  alertText: {
    fontSize: 11,
    color: '#b45309',
    lineHeight: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: '#111827',
    backgroundColor: '#ffffff',
    minHeight: 70,
  },
  photoUploadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumbWrapper: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  photoThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#e11d48',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addPhotoBtn: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
  addPhotoLabel: {
    fontSize: 9,
    color: '#6b7280',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 6,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 11,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: '#d1fae5',
    padding: 8,
    borderRadius: 6,
  },
  successText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  waitView: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  waitIcon: {
    fontSize: 32,
  },
  waitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  waitSub: {
    fontSize: 11,
    color: '#6b7280',
  },
  backButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
});
