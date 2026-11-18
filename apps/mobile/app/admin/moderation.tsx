/**
 * apps/mobile/app/admin/moderation.tsx
 * Task: ADM-2 — Admin Content Moderation & Abuse Prevention
 * Owner: Afridi | Sprint: S5
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  Switch,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { ContentReportItem, ModerationAction } from '@pranora/api';
import type { ModerationStatus, ReportTarget } from '@pranora/types';

const MOCK_REPORTS: ContentReportItem[] = [
  {
    id: 'rep-001',
    reporter_id: 'usr-201',
    target_type: 'adoption_listing',
    target_id: 'adp-771',
    reason: 'fake',
    details: 'বিদেশী সাইট থেকে পার্সিয়ান বিড়ালের ছবি চুরি করে দেওয়া হয়েছে। যোগাযোগের পর অগ্রিম ৩০০০ টাকা বিকাশ করতে বলা হচ্ছে।',
    evidence_urls: [],
    status: 'open',
    moderator_id: null,
    moderator_notes: null,
    action_taken: 'none',
    resolved_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    reporter_name: 'তানভীর হাসান',
    reporter_phone: '+8801712345678',
    target_title: 'Pure Persian Kitten for Free Adoption (Dhaka)',
  },
  {
    id: 'rep-002',
    reporter_id: 'usr-202',
    target_type: 'provider',
    target_id: 'prv-330',
    reason: 'inaccurate_info',
    details: 'উক্ত ভেট ক্লিনিকটি স্থানান্তরিত হয়েছে। প্রোফাইলে এখনো পুরনো ঠিকানা ও বন্ধ ফোন নম্বর দেওয়া আছে।',
    evidence_urls: [],
    status: 'open',
    moderator_id: null,
    moderator_notes: null,
    action_taken: 'none',
    resolved_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    reporter_name: 'ডাঃ ফারহানা কবির',
    reporter_phone: '+8801819283746',
    target_title: 'Central Pet Care & Vet Hospital',
  },
  {
    id: 'rep-003',
    reporter_id: 'usr-203',
    target_type: 'animal_report',
    target_id: 'rsc-882',
    reason: 'spam',
    details: 'উদ্ধার রিপোর্ট নয়, বরং এটি একটি পেট ফুড বিক্রির বিজ্ঞাপনী পোস্ট।',
    evidence_urls: [],
    status: 'open',
    moderator_id: null,
    moderator_notes: null,
    action_taken: 'none',
    resolved_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    reporter_name: 'মাহমুদুল হক',
    reporter_phone: '+8801911223344',
    target_title: 'Imported Royal Canin Cat Food 10kg Discount',
  },
];

const TARGET_ICONS: Record<ReportTarget, string> = {
  adoption_listing: '🐾',
  animal_report: '🚑',
  provider: '🏥',
  user: '👤',
  review: '⭐',
};

const TARGET_NAMES: Record<ReportTarget, { bn: string; en: string }> = {
  adoption_listing: { bn: 'অ্যাডপশন', en: 'Adoption' },
  animal_report: { bn: 'উদ্ধার', en: 'Rescue' },
  provider: { bn: 'ক্লিনিক', en: 'Clinic' },
  user: { bn: 'প্রোফাইল', en: 'User' },
  review: { bn: 'রিভিউ', en: 'Review' },
};

export default function AdminModerationScreen() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [reports, setReports] = useState<ContentReportItem[]>(MOCK_REPORTS);
  const [statusTab, setStatusTab] = useState<ModerationStatus | 'all'>('open');
  const [targetFilter, setTargetFilter] = useState<ReportTarget | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<ContentReportItem | null>(null);
  const [actionType, setActionType] = useState<ModerationAction>('removed');
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [blockUserChecked, setBlockUserChecked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const openCount = reports.filter((r) => r.status === 'open').length;

  const filteredReports = reports.filter((r) => {
    if (statusTab !== 'all' && r.status !== statusTab) return false;
    if (targetFilter !== 'all' && r.target_type !== targetFilter) return false;
    return true;
  });

  function openModal(report: ContentReportItem, action: ModerationAction) {
    setSelectedReport(report);
    setActionType(action);
    setModeratorNotes('');
    setBlockUserChecked(action === 'user_blocked');
  }

  function handleConfirmAction() {
    if (!selectedReport) return;
    setActionLoading(true);

    setTimeout(() => {
      const newStatus: ModerationStatus = actionType === 'dismissed' ? 'dismissed' : 'actioned';
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id
            ? {
                ...r,
                status: newStatus,
                action_taken: actionType,
                moderator_notes: moderatorNotes || null,
                resolved_at: new Date().toISOString(),
              }
            : r
        )
      );
      setActionLoading(false);
      setSelectedReport(null);
    }, 400);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isBn ? '🛡️ মডারেশন ও নিরাপত্তা' : '🛡️ Content Moderation'}
          </Text>
          <Text style={styles.subtitle}>
            {isBn
              ? 'ভুয়া লিস্টিং ও অপব্যবহার নিয়ন্ত্রণ'
              : 'Review fake listings, spam & abuse'}
          </Text>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.tabBar}>
          {(['open', 'actioned', 'dismissed', 'all'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, statusTab === tab && styles.tabButtonActive]}
              onPress={() => setStatusTab(tab)}
            >
              <Text style={[styles.tabText, statusTab === tab && styles.tabTextActive]}>
                {tab === 'open'
                  ? `${isBn ? 'অপেক্ষামান' : 'Pending'} (${openCount})`
                  : tab === 'actioned'
                  ? isBn
                    ? 'পদক্ষেপ সম্পন্ন'
                    : 'Actioned'
                  : tab === 'dismissed'
                  ? isBn
                    ? 'বাতিল'
                    : 'Dismissed'
                  : isBn
                  ? 'সকল'
                  : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Target Filter Scroll */}
        <View style={styles.filterScrollWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['all', 'adoption_listing', 'animal_report', 'provider', 'user'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, targetFilter === t && styles.chipActive]}
                onPress={() => setTargetFilter(t)}
              >
                <Text style={[styles.chipText, targetFilter === t && styles.chipTextActive]}>
                  {t === 'all'
                    ? isBn
                      ? 'সকল'
                      : 'All'
                    : `${TARGET_ICONS[t]} ${isBn ? TARGET_NAMES[t].bn : TARGET_NAMES[t].en}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Report Cards */}
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.badgeRow}>
                <View style={styles.targetBadge}>
                  <Text style={styles.targetBadgeText}>
                    {TARGET_ICONS[item.target_type]}{' '}
                    {isBn ? TARGET_NAMES[item.target_type].bn : TARGET_NAMES[item.target_type].en}
                  </Text>
                </View>
                <View style={styles.reasonBadge}>
                  <Text style={styles.reasonBadgeText}>
                    {item.reason.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.targetTitle}>{item.target_title || item.target_id}</Text>
              <Text style={styles.detailsText}>{item.details}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.reporterText}>
                  👤 {item.reporter_name} ({item.reporter_phone})
                </Text>
              </View>

              {item.status === 'open' ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnDanger]}
                    onPress={() => openModal(item, 'removed')}
                  >
                    <Text style={styles.btnDangerText}>{isBn ? '🚫 সরান' : '🚫 Remove'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnOutline]}
                    onPress={() => openModal(item, 'user_blocked')}
                  >
                    <Text style={styles.btnOutlineText}>{isBn ? '⛔ ব্লক' : '⛔ Block'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnGhost]}
                    onPress={() => openModal(item, 'dismissed')}
                  >
                    <Text style={styles.btnGhostText}>{isBn ? 'বাতিল' : 'Dismiss'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.resolvedBadge}>
                  <Text style={styles.resolvedText}>
                    ✓ {item.status === 'actioned' ? (isBn ? 'পদক্ষেপ গৃহীত' : 'Resolved') : (isBn ? 'বাতিলকৃত' : 'Dismissed')}
                  </Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isBn ? 'কোনো রিপোর্ট পাওয়া যায়নি' : 'No reports found'}
              </Text>
            </View>
          }
        />

        {/* Moderation Confirmation Modal */}
        <Modal
          visible={Boolean(selectedReport)}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedReport(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {actionType === 'dismissed'
                  ? isBn
                    ? 'রিপোর্ট বাতিল'
                    : 'Dismiss Report'
                  : actionType === 'user_blocked'
                  ? isBn
                    ? 'ইউজার ব্লক'
                    : 'Block Abusive User'
                  : isBn
                  ? 'কন্টেন্ট অপসারণ'
                  : 'Remove Fake/Spam Content'}
              </Text>

              <Text style={styles.modalPrompt}>
                {isBn
                  ? 'প্রশাসক নোট / সিদ্ধান্তের কারণ:'
                  : 'Moderator Notes (Audit Log):'}
              </Text>

              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={3}
                placeholder={isBn ? 'সিদ্ধান্তের কারণ লিখুন...' : 'Reason for this decision...'}
                value={moderatorNotes}
                onChangeText={setModeratorNotes}
              />

              {actionType !== 'dismissed' && (
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>
                    {isBn ? 'সংশ্লিষ্ট অ্যাকাউন্ট ব্লক করুন' : 'Block user account'}
                  </Text>
                  <Switch
                    value={blockUserChecked}
                    onValueChange={setBlockUserChecked}
                    trackColor={{ true: '#16a34a', false: '#cbd5e1' }}
                  />
                </View>
              )}

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost, { flex: 1 }]}
                  onPress={() => setSelectedReport(null)}
                >
                  <Text style={styles.btnGhostText}>{isBn ? 'বাতিল' : 'Cancel'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    actionType === 'dismissed' ? styles.btnOutline : styles.btnDanger,
                    { flex: 1 },
                  ]}
                  onPress={handleConfirmAction}
                  disabled={actionLoading}
                >
                  <Text
                    style={
                      actionType === 'dismissed' ? styles.btnOutlineText : styles.btnDangerText
                    }
                  >
                    {actionLoading
                      ? '...'
                      : isBn
                      ? 'নিশ্চিত করুন'
                      : 'Confirm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingVertical: 14 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  tabBar: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 8, padding: 3, marginBottom: 10 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  tabButtonActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2 },
  tabText: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  tabTextActive: { color: '#0f172a', fontWeight: '700' },
  filterScrollWrapper: { marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#15803d', borderColor: '#15803d' },
  chipText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  chipTextActive: { color: '#ffffff', fontWeight: '600' },
  listContent: { paddingBottom: 24 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  targetBadge: { backgroundColor: '#f1f5f9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  targetBadgeText: { fontSize: 11, color: '#334155', fontWeight: '600' },
  reasonBadge: { backgroundColor: '#fee2e2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  reasonBadgeText: { fontSize: 10, color: '#dc2626', fontWeight: '700' },
  targetTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  detailsText: { fontSize: 13, color: '#334155', lineHeight: 18, backgroundColor: '#f8fafc', padding: 8, borderRadius: 6, marginBottom: 8 },
  metaRow: { marginBottom: 10 },
  reporterText: { fontSize: 11, color: '#64748b' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnDanger: { backgroundColor: '#dc2626' },
  btnDangerText: { color: '#ffffff', fontWeight: '600', fontSize: 12 },
  btnOutline: { borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#ffffff' },
  btnOutlineText: { color: '#334155', fontWeight: '600', fontSize: 12 },
  btnGhost: { backgroundColor: 'transparent' },
  btnGhostText: { color: '#64748b', fontWeight: '500', fontSize: 12 },
  resolvedBadge: { backgroundColor: '#dcfce7', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, alignSelf: 'flex-start' },
  resolvedText: { color: '#16a34a', fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 18, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  modalPrompt: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  textInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 13, textAlignVertical: 'top', height: 80, marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  switchLabel: { fontSize: 12, color: '#334155' },
  modalBtnRow: { flexDirection: 'row', gap: 10 },
});
