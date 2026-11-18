/**
 * apps/mobile/app/admin/verifications.tsx
 * Task: ADM-1 — Admin verification of vets, shelters, rescuers, adoption listers
 * Owner: Afridi | Sprint: S4
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { VerifiableRole, PendingRoleRequest, ProviderPendingDoc } from '@pranora/api';

// ─────────────────────────────────────────────
// Mock data (replace with real Supabase calls)
// ─────────────────────────────────────────────

const MOCK_ROLE_REQUESTS: PendingRoleRequest[] = [
  {
    user_id: 'u-001',
    role: 'rescuer',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    verified_at: null,
    verified_by: null,
    full_name: 'Kamal Hossain',
    full_name_bn: 'কামাল হোসেন',
    phone: '+8801711223344',
    avatar_url: null,
  },
  {
    user_id: 'u-002',
    role: 'vet',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    verified_at: null,
    verified_by: null,
    full_name: 'Dr. Nadia Akter',
    full_name_bn: 'ডা. নাদিয়া আক্তার',
    phone: '+8801855667788',
    avatar_url: null,
  },
  {
    user_id: 'u-003',
    role: 'shelter',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    verified_at: null,
    verified_by: null,
    full_name: 'Prani Shelter BD',
    full_name_bn: 'প্রাণী আশ্রয় BD',
    phone: '+8801933445566',
    avatar_url: null,
  },
];

const MOCK_PROVIDER_DOCS: ProviderPendingDoc[] = [
  {
    id: 'doc-001',
    provider_id: 'prov-001',
    vet_id: null,
    doc_type: 'bvc_certificate',
    file_path: 'provider_docs/prov-001/bvc.pdf',
    status: 'pending',
    reviewed_by: null,
    review_note: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    provider_name_en: 'Dhaka Pet Clinic',
    provider_name_bn: 'ঢাকা পেট ক্লিনিক',
    provider_verification: 'pending',
  },
  {
    id: 'doc-002',
    provider_id: 'prov-002',
    vet_id: null,
    doc_type: 'trade_license',
    file_path: 'provider_docs/prov-002/trade.pdf',
    status: 'draft',
    reviewed_by: null,
    review_note: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    provider_name_en: 'Animal Care Center Chittagong',
    provider_name_bn: 'অ্যানিমাল কেয়ার সেন্টার চট্টগ্রাম',
    provider_verification: 'draft',
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const ROLE_EMOJI: Record<VerifiableRole, string> = {
  rescuer: '🚑',
  shelter: '🏠',
  vet: '🩺',
  provider: '🏥',
  adoption_lister: '🐾',
};

const ROLE_LABEL_BN: Record<VerifiableRole, string> = {
  rescuer: 'উদ্ধারকারী',
  shelter: 'আশ্রয়কেন্দ্র পরিচালক',
  vet: 'পশু চিকিৎসক',
  provider: 'সেবাদাতা',
  adoption_lister: 'দত্তক তালিকাকারী',
};

const ROLE_LABEL_EN: Record<VerifiableRole, string> = {
  rescuer: 'Rescuer',
  shelter: 'Shelter Manager',
  vet: 'Veterinarian',
  provider: 'Service Provider',
  adoption_lister: 'Adoption Lister',
};

const DOC_TYPE_LABEL: Record<string, { bn: string; en: string }> = {
  bvc_certificate: { bn: 'BVC সনদপত্র', en: 'BVC Certificate' },
  trade_license: { bn: 'ট্রেড লাইসেন্স', en: 'Trade License' },
  nid: { bn: 'জাতীয় পরিচয়পত্র', en: 'National ID' },
};

function relativeTime(isoString: string, isBn: boolean): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (isBn) {
    if (days > 0) return `${days} দিন আগে`;
    if (hours > 0) return `${hours} ঘণ্টা আগে`;
    return `${mins} মিনিট আগে`;
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

// ─────────────────────────────────────────────
// Confirm Bottom Sheet Modal
// ─────────────────────────────────────────────

interface ConfirmModalProps {
  visible: boolean;
  action: 'approve' | 'reject' | null;
  targetName: string;
  isBn: boolean;
  onConfirm: (note: string) => void;
  onClose: () => void;
  loading: boolean;
}

function ConfirmBottomSheet({ visible, action, targetName, isBn, onConfirm, onClose, loading }: ConfirmModalProps) {
  const [note, setNote] = useState('');
  const isApprove = action === 'approve';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {isApprove
              ? (isBn ? '✅ যাচাই অনুমোদন করবেন?' : '✅ Approve Verification?')
              : (isBn ? '❌ যাচাই প্রত্যাখ্যান করবেন?' : '❌ Reject Verification?')}
          </Text>
          <Text style={styles.sheetDesc}>
            {isApprove
              ? (isBn
                  ? `"${targetName}" এর আবেদন অনুমোদন করলে তারা সংশ্লিষ্ট সকল সুবিধা পাবেন।`
                  : `Approving will grant "${targetName}" full privileges on Pranora.`)
              : (isBn
                  ? 'প্রত্যাখ্যানের কারণ (ঐচ্ছিক):'
                  : 'Reason for rejection (optional):')}
          </Text>
          {!isApprove && (
            <TextInput
              style={styles.noteInput}
              placeholder={isBn ? 'প্রত্যাখ্যানের কারণ লিখুন...' : 'Enter rejection reason...'}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          )}
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>{isBn ? 'বাতিল' : 'Cancel'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, isApprove ? styles.approveBtn : styles.rejectBtn]}
              onPress={() => { onConfirm(note); setNote(''); }}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.confirmBtnText}>{isBn ? 'নিশ্চিত করুন' : 'Confirm'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────

const ROLE_FILTER_TABS: Array<{ key: VerifiableRole | 'all'; bn: string; en: string }> = [
  { key: 'all', bn: 'সব', en: 'All' },
  { key: 'rescuer', bn: 'উদ্ধারকারী', en: 'Rescuer' },
  { key: 'shelter', bn: 'আশ্রয়', en: 'Shelter' },
  { key: 'vet', bn: 'পশু চিকিৎসক', en: 'Vet' },
  { key: 'provider', bn: 'সেবাদাতা', en: 'Provider' },
  { key: 'adoption_lister', bn: 'দত্তক', en: 'Adoption' },
];

export default function AdminVerificationsScreen() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [activeTab, setActiveTab] = useState<'roles' | 'providers'>('roles');
  const [roleFilter, setRoleFilter] = useState<VerifiableRole | 'all'>('all');
  const [roleRequests, setRoleRequests] = useState<PendingRoleRequest[]>(MOCK_ROLE_REQUESTS);
  const [providerDocs, setProviderDocs] = useState<ProviderPendingDoc[]>(MOCK_PROVIDER_DOCS);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'role' | 'provider';
    action: 'approve' | 'reject';
    target: PendingRoleRequest | ProviderPendingDoc;
  } | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const filteredRoles = roleFilter === 'all'
    ? roleRequests
    : roleRequests.filter((r) => r.role === roleFilter);

  function handleRoleAction(req: PendingRoleRequest, action: 'approve' | 'reject') {
    setPendingAction({ type: 'role', action, target: req });
    setModalVisible(true);
  }

  function handleProviderAction(doc: ProviderPendingDoc, action: 'approve' | 'reject') {
    setPendingAction({ type: 'provider', action, target: doc });
    setModalVisible(true);
  }

  async function handleConfirm(_note: string) {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600)); // simulate network
      if (pendingAction.type === 'role') {
        const req = pendingAction.target as PendingRoleRequest;
        setRoleRequests((prev) =>
          prev.filter((r) => !(r.user_id === req.user_id && r.role === req.role))
        );
      } else {
        const doc = pendingAction.target as ProviderPendingDoc;
        setProviderDocs((prev) => prev.filter((d) => d.id !== doc.id));
      }
      showToast(
        pendingAction.action === 'approve'
          ? (isBn ? 'সফলভাবে অনুমোদিত হয়েছে ✅' : 'Successfully approved ✅')
          : (isBn ? 'প্রত্যাখ্যাত হয়েছে ❌' : 'Request rejected ❌')
      );
      setModalVisible(false);
      setPendingAction(null);
    } catch {
      showToast(isBn ? 'কার্যক্রম সম্পন্ন হয়নি' : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }

  function getTargetName(): string {
    if (!pendingAction) return '';
    if (pendingAction.type === 'role') {
      const req = pendingAction.target as PendingRoleRequest;
      return isBn
        ? (req.full_name_bn ?? req.full_name ?? '—')
        : (req.full_name ?? req.full_name_bn ?? '—');
    }
    const doc = pendingAction.target as ProviderPendingDoc;
    return isBn
      ? (doc.provider_name_bn ?? doc.provider_name_en ?? '—')
      : (doc.provider_name_en ?? doc.provider_name_bn ?? '—');
  }

  // ── Render Role Card ──
  function renderRoleCard({ item }: { item: PendingRoleRequest }) {
    const name = isBn ? (item.full_name_bn ?? item.full_name) : (item.full_name ?? item.full_name_bn);
    const roleLabel = isBn ? ROLE_LABEL_BN[item.role] : ROLE_LABEL_EN[item.role];
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{ROLE_EMOJI[item.role]}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{name ?? '—'}</Text>
            <View style={styles.chipRow}>
              <View style={styles.chipWarning}>
                <Text style={styles.chipText}>{roleLabel}</Text>
              </View>
            </View>
            {item.phone && (
              <Text style={styles.cardSub}>📞 {item.phone}</Text>
            )}
            <Text style={styles.cardTime}>
              {isBn ? 'আবেদন:' : 'Requested:'} {relativeTime(item.created_at, isBn)}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveActionBtn]}
            onPress={() => handleRoleAction(item, 'approve')}
          >
            <Text style={styles.actionBtnText}>{isBn ? '✅ অনুমোদন' : '✅ Approve'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectActionBtn]}
            onPress={() => handleRoleAction(item, 'reject')}
          >
            <Text style={styles.actionBtnText}>{isBn ? '❌ প্রত্যাখ্যান' : '❌ Reject'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Render Provider Doc Card ──
  function renderDocCard({ item }: { item: ProviderPendingDoc }) {
    const provName = isBn
      ? (item.provider_name_bn ?? item.provider_name_en)
      : (item.provider_name_en ?? item.provider_name_bn);
    const docLabel = DOC_TYPE_LABEL[item.doc_type] ?? { bn: item.doc_type, en: item.doc_type };
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.avatarEmoji}>🏥</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{provName ?? '—'}</Text>
            <View style={styles.chipRow}>
              <View style={styles.chipInfo}>
                <Text style={styles.chipText}>{isBn ? docLabel.bn : docLabel.en}</Text>
              </View>
              <View style={item.status === 'pending' ? styles.chipWarning : styles.chipSecondary}>
                <Text style={styles.chipText}>
                  {isBn
                    ? (item.status === 'pending' ? 'অপেক্ষামান' : 'খসড়া')
                    : (item.status === 'pending' ? 'Pending' : 'Draft')}
                </Text>
              </View>
            </View>
            <Text style={styles.cardTime}>
              {isBn ? 'জমা দেওয়া হয়েছে:' : 'Submitted:'} {relativeTime(item.created_at, isBn)}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveActionBtn]}
            onPress={() => handleProviderAction(item, 'approve')}
          >
            <Text style={styles.actionBtnText}>{isBn ? '✅ অনুমোদন' : '✅ Approve'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectActionBtn]}
            onPress={() => handleProviderAction(item, 'reject')}
          >
            <Text style={styles.actionBtnText}>{isBn ? '❌ প্রত্যাখ্যান' : '❌ Reject'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalPending = roleRequests.length + providerDocs.length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            🛡️ {isBn ? 'যাচাই ব্যবস্থাপনা' : 'Verification Management'}
          </Text>
          {totalPending > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalPending}</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSub}>
          {isBn ? 'অপেক্ষামান আবেদনসমূহ পর্যালোচনা করুন' : 'Review pending verification requests'}
        </Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'roles' && styles.tabActive]}
          onPress={() => setActiveTab('roles')}
        >
          <Text style={[styles.tabText, activeTab === 'roles' && styles.tabTextActive]}>
            {isBn ? 'ভূমিকা অনুরোধ' : 'Role Requests'}
            {roleRequests.length > 0 ? ` (${roleRequests.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'providers' && styles.tabActive]}
          onPress={() => setActiveTab('providers')}
        >
          <Text style={[styles.tabText, activeTab === 'providers' && styles.tabTextActive]}>
            {isBn ? 'ডকুমেন্ট' : 'Documents'}
            {providerDocs.length > 0 ? ` (${providerDocs.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Role filter chips (only on roles tab) */}
      {activeTab === 'roles' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {ROLE_FILTER_TABS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, roleFilter === f.key && styles.filterChipActive]}
              onPress={() => setRoleFilter(f.key as VerifiableRole | 'all')}
            >
              <Text style={[styles.filterChipText, roleFilter === f.key && styles.filterChipTextActive]}>
                {isBn ? f.bn : f.en}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* List */}
      {activeTab === 'roles' ? (
        <FlatList
          data={filteredRoles}
          keyExtractor={(r) => `${r.user_id}-${r.role}`}
          renderItem={renderRoleCard}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>
                {isBn ? 'কোনো অপেক্ষামান আবেদন নেই' : 'No pending verifications'}
              </Text>
              <Text style={styles.emptyDesc}>
                {isBn
                  ? 'সব যাচাই আবেদন পর্যালোচনা করা হয়েছে।'
                  : 'All verification requests have been reviewed.'}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={providerDocs}
          keyExtractor={(d) => d.id}
          renderItem={renderDocCard}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>
                {isBn ? 'কোনো অপেক্ষামান ডকুমেন্ট নেই' : 'No pending documents'}
              </Text>
              <Text style={styles.emptyDesc}>
                {isBn
                  ? 'সব প্রদানকারীর ডকুমেন্ট পর্যালোচনা করা হয়েছে।'
                  : 'All provider documents have been reviewed.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Confirm Modal */}
      <ConfirmBottomSheet
        visible={modalVisible}
        action={pendingAction?.action ?? null}
        targetName={getTargetName()}
        isBn={isBn}
        onConfirm={handleConfirm}
        onClose={() => { setModalVisible(false); setPendingAction(null); }}
        loading={actionLoading}
      />

      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 },
  headerSub: { fontSize: 13, color: '#6B7280' },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#16A34A' },
  tabText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#16A34A', fontWeight: '700' },

  filterScroll: { backgroundColor: '#fff', maxHeight: 50 },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  filterChipText: { fontSize: 12, color: '#6B7280' },
  filterChipTextActive: { color: '#16A34A', fontWeight: '600' },

  list: { padding: 12, gap: 12, paddingBottom: 100 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  chipWarning: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipInfo: {
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipSecondary: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipText: { fontSize: 11, color: '#374151', fontWeight: '500' },
  cardSub: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  cardTime: { fontSize: 11, color: '#9CA3AF' },
  cardActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveActionBtn: { backgroundColor: '#16A34A' },
  rejectActionBtn: { backgroundColor: '#DC2626' },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },

  // Modal / bottom sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 10 },
  sheetDesc: { fontSize: 14, color: '#6B7280', marginBottom: 14 },
  noteInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    minHeight: 80,
    marginBottom: 16,
  },
  sheetActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, color: '#374151', fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  approveBtn: { backgroundColor: '#16A34A' },
  rejectBtn: { backgroundColor: '#DC2626' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  toast: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#1F2937',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
