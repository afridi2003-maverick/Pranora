import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AdoptionListingRow } from '@pranora/api';
import type { ListingReportReason } from '@pranora/validation';

interface ReportListingModalProps {
  listing: AdoptionListingRow | null;
  visible: boolean;
  onClose: () => void;
  onReport?: (payload: {
    listingId: string;
    reason: ListingReportReason;
    details?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const REPORT_REASONS: {
  id: ListingReportReason;
  bn: string;
  en: string;
  descBn: string;
  descEn: string;
}[] = [
  {
    id: 'fake',
    bn: 'ভুয়া বিজ্ঞাপন / অসত্য ছবি',
    en: 'Fake Listing / Stolen Photos',
    descBn: 'প্রাণীর অস্তিত্ব নেই বা ছবি ভুয়া।',
    descEn: 'Pet does not exist or stolen photos.',
  },
  {
    id: 'scam',
    bn: 'প্রতারণা বা অর্থ দাবি',
    en: 'Financial Scam / Asking for Money',
    descBn: 'দত্তকের নামে টাকা বা ডেলিভারি ফি দাবি।',
    descEn: 'Demanding money or advance fees.',
  },
  {
    id: 'commercial_sale',
    bn: 'বাণিজ্যিক পোষা প্রাণী বিক্রয়',
    en: 'Commercial Pet Sale',
    descBn: 'দত্তকের নামে বাণিজ্যিক বিক্রয়।',
    descEn: 'Breeder or commercial selling.',
  },
  {
    id: 'animal_cruelty',
    bn: 'প্রাণী নির্যাতন বা অবহেলা',
    en: 'Animal Cruelty / Neglect',
    descBn: 'শারীরিক ক্ষতি বা অনিরাপদ আশ্রয়।',
    descEn: 'Signs of neglect or danger.',
  },
  {
    id: 'inaccurate_info',
    bn: 'ভুল জেলা বা অসত্য তথ্য',
    en: 'Inaccurate Information',
    descBn: 'বয়স বা স্বাস্থ্য বিষয়ে অসত্য তথ্য।',
    descEn: 'Misleading info.',
  },
  {
    id: 'other',
    bn: 'অন্যান্য কারণ',
    en: 'Other Reason',
    descBn: 'অন্যান্য নীতিমালা লঙ্ঘন।',
    descEn: 'Other violation.',
  },
];

export function ReportListingModal({
  listing,
  visible,
  onClose,
  onReport,
}: ReportListingModalProps) {
  const { isBangla } = useLocale();

  const [reason, setReason] = useState<ListingReportReason>('fake');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!listing) return null;

  const title = isBangla
    ? listing.title_bn || listing.title_en || 'প্রাণী'
    : listing.title_en || listing.title_bn || 'Animal';

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setDetails('');
    setReason('fake');
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (onReport) {
        const res = await onReport({
          listingId: listing.id,
          reason,
          details: details.trim() || undefined,
        });

        if (!res.success) {
          setErrorMessage(
            res.error || (isBangla ? 'রিপোর্ট জমা দেওয়া সম্ভব হয়নি।' : 'Failed to submit report.')
          );
          setIsSubmitting(false);
          return;
        }
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage(isBangla ? 'সার্ভারে ত্রুটি হয়েছে।' : 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleResetAndClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>
              {isBangla ? 'বিজ্ঞাপনটি রিপোর্ট করুন' : 'Report Adoption Listing'}
            </Text>
            <TouchableOpacity onPress={handleResetAndClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {isSuccess ? (
            <View style={styles.successContainer}>
              <Text style={{ fontSize: 36 }}>🛡️</Text>
              <Text style={styles.successTitle}>
                {isBangla ? 'রিপোর্ট জমা হয়েছে' : 'Report Submitted'}
              </Text>
              <Text style={styles.successSub}>
                {isBangla
                  ? 'আমাদের মডারেশন টিম দ্রুত অভিযোগটি যাচাই করে ভুয়া বিজ্ঞাপনের বিরুদ্ধে যথাযথ ব্যবস্থা গ্রহণ করবে।'
                  : 'Our moderation team will review the issue and take action if guidelines were violated.'}
              </Text>
              <TouchableOpacity
                onPress={handleResetAndClose}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>{isBangla ? 'ঠিক আছে' : 'Done'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              <View style={styles.targetInfo}>
                <Text style={styles.targetTitle}>
                  {isBangla ? 'বিজ্ঞাপন: ' : 'Listing: '}
                  <Text style={{ fontWeight: '700', color: '#111827' }}>{title}</Text>
                </Text>
                <Text style={styles.guidelineNotice}>
                  🔒 {isBangla
                    ? 'প্রাণোরায় পোষা প্রাণী দত্তক সম্পূর্ণ বিনামূল্যে। অর্থ দাবি সম্পূর্ণ নিষিদ্ধ।'
                    : 'Adoption on Pranora must be 100% free. Selling is forbidden.'}
                </Text>
              </View>

              <Text style={styles.fieldLabel}>
                {isBangla ? 'রিপোর্টের কারণ নির্বাচন করুন:*' : 'Select Reason:*'}
              </Text>

              {/* Reasons */}
              <View style={styles.reasonList}>
                {REPORT_REASONS.map((r) => {
                  const isSelected = reason === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() => setReason(r.id)}
                      style={[
                        styles.reasonItem,
                        isSelected && styles.reasonItemSelected,
                      ]}
                    >
                      <View style={styles.reasonTop}>
                        <Text style={[styles.reasonTitle, isSelected && styles.reasonTitleSelected]}>
                          {isBangla ? r.bn : r.en}
                        </Text>
                        <Text style={styles.radioIndicator}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </View>
                      <Text style={styles.reasonDesc}>
                        {isBangla ? r.descBn : r.descEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Details Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>
                  {isBangla ? 'অতিরিক্ত তথ্য (ঐচ্ছিক):' : 'Additional Details (Optional):'}
                </Text>
                <TextInput
                  value={details}
                  onChangeText={setDetails}
                  placeholder={
                    isBangla
                      ? 'সুনির্দিষ্ট বিবরণ বা প্রমাণ থাকলে উল্লেখ করুন...'
                      : 'Provide any details or evidence...'
                  }
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                  textAlignVertical="top"
                />
              </View>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={handleResetAndClose}
                  style={styles.cancelBtn}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelBtnText}>{isBangla ? 'বাতিল' : 'Cancel'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      🚨 {isBangla ? 'রিপোর্ট জমা দিন' : 'Submit Report'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxHeight: '85%',
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    fontSize: 18,
    color: '#6b7280',
    padding: 4,
  },
  scrollBody: {
    maxHeight: 460,
  },
  targetInfo: {
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginBottom: 12,
    gap: 2,
  },
  targetTitle: {
    fontSize: 12,
    color: '#4b5563',
  },
  guidelineNotice: {
    fontSize: 10,
    color: '#991b1b',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  reasonList: {
    gap: 6,
    marginBottom: 12,
  },
  reasonItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 2,
  },
  reasonItemSelected: {
    borderColor: '#f43f5e',
    backgroundColor: '#fff1f2',
  },
  reasonTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasonTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  reasonTitleSelected: {
    color: '#e11d48',
    fontWeight: '700',
  },
  radioIndicator: {
    fontSize: 12,
    color: '#e11d48',
  },
  reasonDesc: {
    fontSize: 10,
    color: '#6b7280',
  },
  inputGroup: {
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: '#111827',
    backgroundColor: '#ffffff',
    minHeight: 65,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  submitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#e11d48',
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  successContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  successSub: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 16,
  },
  doneBtn: {
    marginTop: 12,
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
