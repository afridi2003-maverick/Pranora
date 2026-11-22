/**
 * apps/mobile/app/clinics/report.tsx
 * Task: REV-2 — Shared report flow (reviews, wrong clinic info) — Mobile
 * Owner: Afridi | Sprint: S6
 *
 * Expo Router screen for reporting a review or clinic info on mobile.
 * Receives { targetType, targetId, title } via expo-router local search params.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import type { ReportTarget } from '@pranora/types';

type ReviewReportReason =
  | 'fake'
  | 'spam'
  | 'abusive'
  | 'scam'
  | 'inaccurate_info'
  | 'animal_cruelty'
  | 'duplicate'
  | 'other';

const CLINIC_REASONS: ReviewReportReason[] = ['inaccurate_info', 'fake', 'duplicate', 'other'];
const REVIEW_REASONS: ReviewReportReason[] = ['fake', 'spam', 'abusive', 'other'];
const ALL_REASONS: ReviewReportReason[] = [
  'fake', 'spam', 'abusive', 'scam', 'inaccurate_info', 'animal_cruelty', 'duplicate', 'other',
];

function reasonsFor(tt: ReportTarget): ReviewReportReason[] {
  if (tt === 'provider') return CLINIC_REASONS;
  if (tt === 'review') return REVIEW_REASONS;
  return ALL_REASONS;
}

const REASON_EN: Record<ReviewReportReason, string> = {
  fake: 'Fake or misleading content',
  spam: 'Spam or promotional content',
  abusive: 'Abusive or offensive behavior',
  scam: 'Fraud or payment scam',
  inaccurate_info: 'Wrong info (address, phone, hours)',
  animal_cruelty: 'Animal cruelty or abuse',
  duplicate: 'Duplicate listing',
  other: 'Other reason',
};

const REASON_BN: Record<ReviewReportReason, string> = {
  fake: 'ভুয়া বা বিভ্রান্তিকর কন্টেন্ট',
  spam: 'স্প্যাম বা প্রচারমূলক কন্টেন্ট',
  abusive: 'আপত্তিজনক বা অশালীন আচরণ',
  scam: 'প্রতারণা বা আর্থিক জালিয়াতি',
  inaccurate_info: 'ভুল তথ্য (ঠিকানা, ফোন, সময়)',
  animal_cruelty: 'প্রাণী নির্যাতন বা অপব্যবহার',
  duplicate: 'একই তথ্যের পুনরাবৃত্তি',
  other: 'অন্যান্য কারণ',
};

export default function MobileReportScreen() {
  const { isBangla } = useLocale();
  const router = useRouter();
  const { targetType, targetId, title } = useLocalSearchParams<{
    targetType: string;
    targetId: string;
    title?: string;
  }>();

  const resolvedTargetType = (targetType ?? 'provider') as ReportTarget;
  const reasons = reasonsFor(resolvedTargetType);
  const reasonLabels = isBangla ? REASON_BN : REASON_EN;

  const [selectedReason, setSelectedReason] = useState<ReviewReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const screenTitle =
    resolvedTargetType === 'review'
      ? isBangla ? 'রিভিউ রিপোর্ট করুন' : 'Report Review'
      : resolvedTargetType === 'provider'
        ? isBangla ? 'ভুল তথ্য রিপোর্ট করুন' : 'Report Inaccurate Info'
        : isBangla ? 'কন্টেন্ট রিপোর্ট করুন' : 'Report Content';

  const handleSubmit = async () => {
    if (!selectedReason || !targetId) return;

    setSubmitting(true);
    try {
      // Production: await submitReport(supabaseClient, { targetType: resolvedTargetType, targetId, reason: selectedReason, details });
      await new Promise<void>((r) => setTimeout(r, 900));
      setSubmitted(true);
    } catch {
      Alert.alert(
        isBangla ? 'ভুল' : 'Error',
        isBangla
          ? 'রিপোর্ট জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
          : 'Failed to submit report. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>
          {isBangla ? 'রিপোর্ট জমা হয়েছে!' : 'Report Submitted!'}
        </Text>
        <Text style={styles.successMsg}>
          {resolvedTargetType === 'provider'
            ? isBangla
              ? 'আমাদের দল ক্লিনিকের তথ্য যাচাই করে আপডেট করবে।'
              : 'Our team will verify and update the clinic information.'
            : isBangla
              ? 'আমাদের মডারেশন দল ২৪ ঘণ্টার মধ্যে পর্যালোচনা করবে।'
              : 'Our moderation team will review this within 24 hours.'}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{isBangla ? 'ফিরে যান' : 'Go Back'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{screenTitle}</Text>
          {title ? (
            <Text style={styles.subtitle} numberOfLines={1}>{title}</Text>
          ) : null}
        </View>
      </View>

      {/* Reason list */}
      <Text style={styles.sectionLabel}>
        {isBangla ? 'রিপোর্টের কারণ বেছে নিন *' : 'Select a reason *'}
      </Text>
      <View style={styles.reasonsList}>
        {reasons.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setSelectedReason(r)}
            style={[
              styles.reasonItem,
              selectedReason === r && styles.reasonItemSelected,
            ]}
            activeOpacity={0.7}
          >
            <View style={[styles.radio, selectedReason === r && styles.radioSelected]}>
              {selectedReason === r && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.reasonText, selectedReason === r && styles.reasonTextSelected]}>
              {reasonLabels[r]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Details */}
      <Text style={styles.sectionLabel}>
        {isBangla ? 'অতিরিক্ত বিবরণ (ঐচ্ছিক)' : 'Additional details (optional)'}
      </Text>
      <TextInput
        value={details}
        onChangeText={setDetails}
        maxLength={1000}
        multiline
        numberOfLines={4}
        placeholder={
          isBangla
            ? 'সমস্যাটি আরও বিস্তারিত বর্ণনা করুন...'
            : 'Describe the issue in more detail...'
        }
        placeholderTextColor="#9ca3af"
        style={styles.textArea}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{details.length}/1000</Text>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          {isBangla
            ? '📋 মিথ্যা রিপোর্ট প্রণোরার নীতি লঙ্ঘন এবং অ্যাকাউন্ট স্থগিত হতে পারে।'
            : '📋 False reports violate Pranora\'s guidelines and may result in account suspension.'}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          disabled={submitting}
        >
          <Text style={styles.cancelBtnText}>{isBangla ? 'বাতিল' : 'Cancel'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, (!selectedReason || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!selectedReason || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isBangla ? 'রিপোর্ট জমা দিন' : 'Submit Report'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 24 },
  warningIcon: { fontSize: 32, lineHeight: 40 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  reasonsList: { gap: 8, marginBottom: 20 },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  reasonItemSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#3b82f6' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6' },
  reasonText: { flex: 1, fontSize: 14, color: '#374151' },
  reasonTextSelected: { color: '#1d4ed8', fontWeight: '500' },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    minHeight: 100,
    marginBottom: 4,
  },
  charCount: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginBottom: 16 },
  disclaimer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  disclaimerText: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
  submitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#93c5fd' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  successIcon: { fontSize: 56, marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#065f46', marginBottom: 10, textAlign: 'center' },
  successMsg: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  backBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
