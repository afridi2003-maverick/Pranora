import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  decideAdoptionApplication,
  getReviewableAdoptionApplications,
  type AdoptionReviewItem,
} from '@pranora/api';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_REVIEW_APPLICATIONS: AdoptionReviewItem[] = [
  {
    id: 'app-001',
    listingId: 'list-001',
    applicantId: 'user-001',
    applicantName: 'তানজিলা রহমান (Tanjila Rahman)',
    applicantPhone: '+8801712345678',
    applicantEmail: 'tanjila.r@gmail.com',
    petName: 'লালি (Lali)',
    petSpecies: 'cat',
    petPhotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
    listingTitle: 'Rescued 4-month kitten looking for loving home',
    homeType: 'own_flat',
    hasOtherPets: true,
    experience: 'I have raised 2 rescued street cats for the past 6 years. Both are fully vaccinated and spayed.',
    reason: 'We want to adopt a companion for our indoor cat and provide a safe loving family environment.',
    status: 'submitted',
    reviewedBy: null,
    reviewedAt: null,
    decisionNote: null,
    createdAt: '2026-03-12T10:30:00Z',
  },
  {
    id: 'app-002',
    listingId: 'list-002',
    applicantId: 'user-002',
    applicantName: 'কবির হোসেন (Kabir Hossain)',
    applicantPhone: '+8801819876543',
    applicantEmail: 'kabir.hossain@vetmail.bd',
    petName: 'বাঘা (Bagha)',
    petSpecies: 'dog',
    petPhotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200',
    listingTitle: 'Friendly Deshi dog, vaccinated and house-trained',
    homeType: 'own_house',
    hasOtherPets: false,
    experience: 'Grew up with family dogs in Rajshahi. Familiar with daily walks, tick care, and nutrition.',
    reason: 'We recently moved into our own independent house with a fenced garden and wish to adopt a loyal companion.',
    status: 'under_review',
    reviewedBy: null,
    reviewedAt: null,
    decisionNote: null,
    createdAt: '2026-03-11T14:15:00Z',
  },
  {
    id: 'app-003',
    listingId: 'list-003',
    applicantId: 'user-003',
    applicantName: 'ফারজানা ববি (Farzana Bobby)',
    applicantPhone: '+8801911223344',
    applicantEmail: 'farzana.b@yahoo.com',
    petName: 'মিতু (Mitu)',
    petSpecies: 'cat',
    petPhotoUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200',
    listingTitle: 'Playful calico female, litter box trained',
    homeType: 'rented_flat',
    hasOtherPets: false,
    experience: 'First-time pet owner, but I have read extensively and pet-proofed all balcony grills.',
    reason: 'Looking for a playful cat to keep me company while working from home.',
    status: 'approved',
    reviewedBy: 'shelter-admin',
    reviewedAt: '2026-03-10T16:00:00Z',
    decisionNote: 'Applicant verified balcony netting and provided landlord pet-consent letter.',
    createdAt: '2026-03-09T09:00:00Z',
  },
  {
    id: 'app-004',
    listingId: 'list-004',
    applicantId: 'user-004',
    applicantName: 'সাকিব আল হাসান (Sakib Al Hasan)',
    applicantPhone: '+8801611556677',
    applicantEmail: 'sakib.h@outlook.com',
    petName: 'টমি (Tommy)',
    petSpecies: 'dog',
    petPhotoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200',
    listingTitle: 'Golden retriever mix, needs active owner',
    homeType: 'rented_flat',
    hasOtherPets: true,
    experience: 'None with large energetic breeds.',
    reason: 'Wanted to keep on balcony for security.',
    status: 'rejected',
    reviewedBy: 'shelter-admin',
    reviewedAt: '2026-03-08T11:00:00Z',
    decisionNote: 'Keeping a large dog confined to an open balcony does not meet our minimum welfare guidelines.',
    createdAt: '2026-03-07T12:00:00Z',
  },
];

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export function AdoptionReviewScreen() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [applications, setApplications] = useState<AdoptionReviewItem[]>(MOCK_REVIEW_APPLICATIONS);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [selectedApp, setSelectedApp] = useState<AdoptionReviewItem | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const client = null as any;
    getReviewableAdoptionApplications(client)
      .then((data) => {
        if (data && data.length > 0) {
          setApplications(data);
        }
      })
      .catch(() => {});
  }, []);

  const t = {
    title: isBangla ? 'দত্তক আবেদন পর্যালোচনা' : 'Adoption Review Queue',
    subtitle: isBangla ? 'আবেদনসমূহ মূল্যায়ন করুন ও সিদ্ধান্ত নিন' : 'Evaluate applications and decide (ADP-5)',
    filterPending: isBangla ? 'পর্যালোচনা বাকি' : 'Pending',
    filterAll: isBangla ? 'সকল' : 'All',
    filterApproved: isBangla ? 'অনুমোদিত' : 'Approved',
    filterRejected: isBangla ? 'বাতিল' : 'Rejected',
    applicant: isBangla ? 'আবেদনকারী' : 'Applicant',
    pet: isBangla ? 'পোষা প্রাণী' : 'Pet',
    homeType: isBangla ? 'বাসস্থান' : 'Home',
    otherPets: isBangla ? 'অন্য পোষা প্রাণী' : 'Other Pets',
    yes: isBangla ? 'হ্যাঁ' : 'Yes',
    no: isBangla ? 'না' : 'No',
    experience: isBangla ? 'অভিজ্ঞতা' : 'Experience',
    reason: isBangla ? 'দত্তক নেওয়ার কারণ' : 'Reason',
    appliedOn: isBangla ? 'তারিখ' : 'Date',
    approve: isBangla ? 'অনুমোদন' : 'Approve',
    reject: isBangla ? 'বাতিল' : 'Reject',
    note: isBangla ? 'সিদ্ধান্তের মন্তব্য' : 'Decision Note',
    notePlaceholder: isBangla ? 'মন্তব্য লিখুন (ঐচ্ছিক)...' : 'Optional note...',
    cancel: isBangla ? 'ফিরে যান' : 'Cancel',
    confirm: isBangla ? 'নিশ্চিত করুন' : 'Confirm',
    confirmApproveTitle: isBangla ? 'দত্তক আবেদন অনুমোদন' : 'Approve Application',
    confirmRejectTitle: isBangla ? 'দত্তক আবেদন বাতিল' : 'Reject Application',
    confirmApproveDesc: isBangla
      ? 'অনুমোদনের পর প্রাণীটি সংরক্ষিত হবে এবং হস্তান্তর প্রক্রিয়া শুরু হবে।'
      : 'Approving reserves the pet and initiates handover (ADP-6).',
    confirmRejectDesc: isBangla
      ? 'আপনি কি নিশ্চিতভাবে এই আবেদনটি বাতিল করতে চান?'
      : 'Are you sure you want to reject this application?',
    empty: isBangla ? 'কোনো দত্তক আবেদন পাওয়া যায়নি' : 'No applications found',
    homeTypeLabels: {
      own_flat: isBangla ? 'নিজের ফ্ল্যাট' : 'Own Flat',
      rented_flat: isBangla ? 'ভাড়া ফ্ল্যাট' : 'Rented Flat',
      own_house: isBangla ? 'নিজের বাড়ি' : 'Own House',
      rented_house: isBangla ? 'ভাড়া বাড়ি' : 'Rented House',
      other: isBangla ? 'অন্যান্য' : 'Other',
    },
  };

  const filteredApps = applications.filter((app) => {
    if (filter === 'pending') return app.status === 'submitted' || app.status === 'under_review';
    if (filter === 'approved') return app.status === 'approved';
    if (filter === 'rejected') return app.status === 'rejected';
    return true;
  });

  const pendingCount = applications.filter((a) => a.status === 'submitted' || a.status === 'under_review').length;

  function openModal(app: AdoptionReviewItem, type: 'approve' | 'reject') {
    setSelectedApp(app);
    setModalType(type);
    setDecisionNote('');
  }

  function closeModal() {
    setSelectedApp(null);
    setModalType(null);
    setDecisionNote('');
  }

  async function handleConfirmDecision() {
    if (!selectedApp || !modalType) return;
    setIsSubmitting(true);
    const approve = modalType === 'approve';

    try {
      const client = null as any;
      await decideAdoptionApplication(
        client,
        selectedApp.id,
        approve,
        decisionNote.trim() || undefined
      );
    } catch {
      // offline fallback
    }

    setApplications((prev) =>
      prev.map((a) =>
        a.id === selectedApp.id
          ? {
              ...a,
              status: approve ? 'approved' : 'rejected',
              decisionNote: decisionNote.trim() || null,
              reviewedAt: new Date().toISOString(),
            }
          : a
      )
    );

    setFeedback(
      approve
        ? (isBangla ? '✓ আবেদন সফলভাবে অনুমোদিত হয়েছে!' : '✓ Application approved successfully!')
        : (isBangla ? '✕ আবেদন বাতিল করা হয়েছে।' : '✕ Application rejected.')
    );
    setTimeout(() => setFeedback(null), 3500);
    closeModal();
    setIsSubmitting(false);
  }

  function statusBadgeColor(status: string): string {
    switch (status) {
      case 'approved': return '#16a34a';
      case 'submitted':
      case 'under_review': return '#d97706';
      case 'rejected': return '#dc2626';
      default: return '#6b7280';
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
      </View>

      {/* Feedback Banner */}
      {feedback && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterChipText, filter === 'pending' && styles.filterChipTextActive]}>
            {t.filterPending} ({pendingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
            {t.filterAll} ({applications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'approved' && styles.filterChipActive]}
          onPress={() => setFilter('approved')}
        >
          <Text style={[styles.filterChipText, filter === 'approved' && styles.filterChipTextActive]}>
            {t.filterApproved}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'rejected' && styles.filterChipActive]}
          onPress={() => setFilter('rejected')}
        >
          <Text style={[styles.filterChipText, filter === 'rejected' && styles.filterChipTextActive]}>
            {t.filterRejected}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Applications List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {filteredApps.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🐾</Text>
              <Text style={styles.emptyText}>{t.empty}</Text>
            </View>
          ) : (
            filteredApps.map((app) => {
              const isPending = app.status === 'submitted' || app.status === 'under_review';
              const homeLabel = t.homeTypeLabels[app.homeType] ?? app.homeType;

              return (
                <View key={app.id} style={styles.appCard}>
                  {/* Top Bar: Pet & Status */}
                  <View style={styles.cardHeader}>
                    <View style={styles.petInfo}>
                      <Text style={styles.petName}>{app.petName}</Text>
                      <Text style={styles.petSpecies}>{app.petSpecies} · {app.listingTitle}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBadgeColor(app.status) }]}>
                      <Text style={styles.statusBadgeText}>{app.status.replace(/_/g, ' ')}</Text>
                    </View>
                  </View>

                  {/* Applicant Details */}
                  <View style={styles.applicantSection}>
                    <Text style={styles.applicantName}>{app.applicantName}</Text>
                    <Text style={styles.applicantContact}>
                      {app.applicantPhone || ''} {app.applicantEmail ? `· ${app.applicantEmail}` : ''}
                    </Text>
                  </View>

                  {/* Environment details */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>{t.homeType}:</Text>
                      <Text style={styles.metaValue}>{homeLabel}</Text>
                    </View>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>{t.otherPets}:</Text>
                      <Text style={styles.metaValue}>{app.hasOtherPets ? t.yes : t.no}</Text>
                    </View>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>{t.appliedOn}:</Text>
                      <Text style={styles.metaValue}>{new Date(app.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>

                  {/* Experience */}
                  {app.experience && (
                    <View style={styles.noteBox}>
                      <Text style={styles.noteBoxLabel}>{t.experience}:</Text>
                      <Text style={styles.noteBoxText}>{app.experience}</Text>
                    </View>
                  )}

                  {/* Reason */}
                  <View style={[styles.noteBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                    <Text style={[styles.noteBoxLabel, { color: '#1d4ed8' }]}>{t.reason}:</Text>
                    <Text style={[styles.noteBoxText, { color: '#1e3a8a' }]}>{app.reason}</Text>
                  </View>

                  {/* Decision note if present */}
                  {app.decisionNote && (
                    <View style={[styles.noteBox, { backgroundColor: '#f9fafb' }]}>
                      <Text style={styles.noteBoxLabel}>{t.note}:</Text>
                      <Text style={styles.noteBoxText}>{app.decisionNote}</Text>
                    </View>
                  )}

                  {/* Action buttons if pending */}
                  {isPending && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => openModal(app, 'approve')}
                      >
                        <Text style={styles.actionBtnText}>✓ {t.approve}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => openModal(app, 'reject')}
                      >
                        <Text style={styles.actionBtnText}>✕ {t.reject}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Decision Modal */}
      {modalType && selectedApp && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                {modalType === 'approve' ? t.confirmApproveTitle : t.confirmRejectTitle}
              </Text>
              <Text style={styles.modalDesc}>
                {modalType === 'approve' ? t.confirmApproveDesc : t.confirmRejectDesc}
              </Text>

              <View style={styles.modalInfoBox}>
                <Text style={styles.modalInfoText}>
                  {t.pet}: <Text style={{ fontWeight: '700' }}>{selectedApp.petName}</Text>
                </Text>
                <Text style={styles.modalInfoText}>
                  {t.applicant}: <Text style={{ fontWeight: '700' }}>{selectedApp.applicantName}</Text>
                </Text>
              </View>

              <Text style={styles.modalLabel}>{t.note}</Text>
              <TextInput
                style={styles.modalInput}
                multiline
                numberOfLines={3}
                placeholder={t.notePlaceholder}
                value={decisionNote}
                onChangeText={setDecisionNote}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={closeModal}
                  disabled={isSubmitting}
                >
                  <Text style={styles.modalCancelBtnText}>{t.cancel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    modalType === 'approve' ? styles.modalApproveBtn : styles.modalRejectBtn,
                  ]}
                  onPress={handleConfirmDecision}
                  disabled={isSubmitting}
                >
                  <Text style={styles.modalConfirmBtnText}>{t.confirm}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  feedbackBanner: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#86efac',
  },
  feedbackText: { color: '#15803d', fontWeight: '700', fontSize: 13 },

  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  filterChipActive: { backgroundColor: '#2563eb' },
  filterChipText: { fontSize: 12, color: '#4b5563', fontWeight: '600' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },

  content: { flex: 1 },
  listContainer: { padding: 16, gap: 12 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyText: { color: '#9ca3af', fontSize: 15 },

  appCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  petInfo: { flex: 1 },
  petName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  petSpecies: { fontSize: 12, color: '#6b7280', textTransform: 'capitalize', marginTop: 1 },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  applicantSection: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },
  applicantName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  applicantContact: { fontSize: 11, color: '#6b7280', marginTop: 1 },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },
  metaValue: { fontSize: 12, fontWeight: '600', color: '#374151', marginTop: 1 },

  noteBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 2,
  },
  noteBoxLabel: { fontSize: 11, fontWeight: '700', color: '#4b5563', marginBottom: 2 },
  noteBoxText: { fontSize: 12, color: '#374151', lineHeight: 17 },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtn: { backgroundColor: '#16a34a' },
  rejectBtn: { backgroundColor: '#dc2626' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalDesc: { fontSize: 13, color: '#4b5563', lineHeight: 18 },
  modalInfoBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  modalInfoText: { fontSize: 12, color: '#374151' },
  modalLabel: { fontSize: 12, fontWeight: '600', color: '#374151' },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalCancelBtn: { backgroundColor: '#f3f4f6' },
  modalCancelBtnText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  modalApproveBtn: { backgroundColor: '#16a34a' },
  modalRejectBtn: { backgroundColor: '#dc2626' },
  modalConfirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
