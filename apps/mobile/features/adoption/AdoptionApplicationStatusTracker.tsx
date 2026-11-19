import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AdoptionApplicationWithListing } from '@pranora/api';
import type { AdoptionApplicationStatus } from '@pranora/types';
import {
  MOCK_MY_APPLICATIONS,
  DISTRICT_MAP,
} from './mockData';

interface AdoptionApplicationStatusTrackerProps {
  initialApplications?: AdoptionApplicationWithListing[];
  onWithdrawApplication?: (applicationId: string) => Promise<{ success: boolean; error?: string }>;
  onViewListing?: (listingId: string) => void;
  onGoToHandover?: (listingId: string) => void;
}

const STATUS_STEPS: {
  key: 'submitted' | 'under_review' | 'decision';
  bn: string;
  en: string;
}[] = [
  { key: 'submitted', bn: 'জমা হয়েছে', en: 'Submitted' },
  { key: 'under_review', bn: 'দেখা হচ্ছে', en: 'Under Review' },
  { key: 'decision', bn: 'সিদ্ধান্ত', en: 'Decision' },
];

export function AdoptionApplicationStatusTracker({
  initialApplications = MOCK_MY_APPLICATIONS,
  onWithdrawApplication,
  onViewListing,
  onGoToHandover,
}: AdoptionApplicationStatusTrackerProps) {
  const { isBangla } = useLocale();
  const [applications, setApplications] = useState<AdoptionApplicationWithListing[]>(initialApplications);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    try {
      if (onWithdrawApplication) {
        await onWithdrawApplication(applicationId);
      }
      setApplications((prev) =>
        prev.map((item) =>
          item.application.id === applicationId
            ? {
                ...item,
                application: {
                  ...item.application,
                  status: 'withdrawn' as AdoptionApplicationStatus,
                },
              }
            : item
        )
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStepState = (
    currentStatus: AdoptionApplicationStatus,
    stepKey: 'submitted' | 'under_review' | 'decision'
  ): 'completed' | 'current' | 'upcoming' | 'rejected' => {
    if (currentStatus === 'rejected') {
      if (stepKey === 'decision') return 'rejected';
      return 'completed';
    }

    if (currentStatus === 'withdrawn') {
      return 'upcoming';
    }

    if (stepKey === 'submitted') {
      return currentStatus === 'submitted' ? 'current' : 'completed';
    }

    if (stepKey === 'under_review') {
      if (currentStatus === 'submitted') return 'upcoming';
      if (currentStatus === 'under_review') return 'current';
      return 'completed';
    }

    if (stepKey === 'decision') {
      return currentStatus === 'approved' ? 'completed' : 'upcoming';
    }

    return 'upcoming';
  };

  if (applications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🐾</Text>
        <Text style={styles.emptyTitle}>
          {isBangla ? 'কোনো দত্তক আবেদন নেই' : 'No applications yet'}
        </Text>
        <Text style={styles.emptySubtext}>
          {isBangla
            ? 'পাবলিক তালিকা ব্রাউজ করে আপনার পছন্দের প্রাণীর জন্য আবেদন করতে পারেন।'
            : 'Browse listings to apply for a rescue pet.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {applications.map(({ application, listing }) => {
        const isApproved = application.status === 'approved';
        const isRejected = application.status === 'rejected';
        const isWithdrawn = application.status === 'withdrawn';
        const isUnderReview = application.status === 'under_review';
        const isPendingDecision = !isApproved && !isRejected && !isWithdrawn;
        const isExpanded = expandedAppId === application.id;

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

        const photo = listing.photos?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';

        return (
          <View key={application.id} style={styles.card}>
            {/* Header: Pet Summary & Status */}
            <View style={styles.headerRow}>
              <Image source={{ uri: photo }} style={styles.petThumb} />
              <View style={styles.headerInfo}>
                <View style={styles.tagsRow}>
                  <View style={styles.speciesTag}>
                    <Text style={styles.speciesTagText}>{listing.species}</Text>
                  </View>
                  <Text style={styles.districtText}>📍 {district}</Text>
                </View>
                <Text style={styles.petTitle} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.dateText}>
                  {isBangla ? 'আবেদন: ' : 'Applied: '}
                  {new Date(application.created_at).toLocaleDateString()}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isApproved && styles.approvedBadge,
                  isRejected && styles.rejectedBadge,
                  isUnderReview && styles.underReviewBadge,
                  isWithdrawn && styles.withdrawnBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isApproved && styles.approvedText,
                    isRejected && styles.rejectedText,
                    isUnderReview && styles.underReviewText,
                    isWithdrawn && styles.withdrawnText,
                  ]}
                >
                  {isApproved
                    ? isBangla ? 'অনুমোদিত' : 'Approved'
                    : isRejected
                    ? isBangla ? 'বাতিল' : 'Rejected'
                    : isWithdrawn
                    ? isBangla ? 'প্রত্যাহার' : 'Withdrawn'
                    : isUnderReview
                    ? isBangla ? 'দেখা হচ্ছে' : 'Reviewing'
                    : isBangla ? 'জমা হয়েছে' : 'Submitted'}
                </Text>
              </View>
            </View>

            {/* 3-Step Timeline */}
            <View style={styles.timelineRow}>
              {STATUS_STEPS.map((step, idx) => {
                const state = getStepState(application.status, step.key);
                const isLast = idx === STATUS_STEPS.length - 1;

                return (
                  <React.Fragment key={step.key}>
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepCircle,
                          state === 'completed' && styles.stepCompleted,
                          state === 'current' && styles.stepCurrent,
                          state === 'rejected' && styles.stepRejected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepNumber,
                            (state === 'completed' || state === 'rejected') && styles.stepNumberActive,
                          ]}
                        >
                          {state === 'completed' ? '✓' : state === 'rejected' ? '✕' : idx + 1}
                        </Text>
                      </View>
                      <Text style={styles.stepLabel}>
                        {isLast && isApproved
                          ? isBangla ? 'অনুমোদিত' : 'Approved'
                          : isLast && isRejected
                          ? isBangla ? 'বাতিল' : 'Rejected'
                          : isBangla ? step.bn : step.en}
                      </Text>
                    </View>

                    {!isLast && (
                      <View
                        style={[
                          styles.stepLine,
                          state === 'completed' && styles.stepLineCompleted,
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>

            {/* Approved Celebration */}
            {isApproved && (
              <View style={styles.approvedBox}>
                <Text style={styles.approvedBoxTitle}>
                  🎉 {isBangla ? 'আবেদন অনুমোদিত হয়েছে!' : 'Application Approved!'}
                </Text>
                <Text style={styles.approvedBoxSub}>
                  {isBangla
                    ? 'আশ্রয়কেন্দ্র আবেদন অনুমোদন করেছে। পরবর্তী ধাপে দুই-পক্ষীয় হস্তান্তরের মাধ্যমে মালিকানা নিশ্চিত করা হবে।'
                    : 'Your application has been approved. Proceed to two-sided handover.'}
                </Text>
                {application.decision_note && (
                  <Text style={styles.noteText}>
                    💬 {application.decision_note}
                  </Text>
                )}
                {onGoToHandover && (
                  <TouchableOpacity
                    style={styles.handoverButton}
                    onPress={() => onGoToHandover(application.listing_id)}
                  >
                    <Text style={styles.handoverButtonText}>
                      🤝 {isBangla ? 'হস্তান্তর প্রক্রিয়া দেখুন' : 'View Handover'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Rejection Note */}
            {isRejected && application.decision_note && (
              <View style={styles.rejectedBox}>
                <Text style={styles.rejectedBoxTitle}>
                  ❌ {isBangla ? 'পর্যালোচকের মন্তব্য:' : 'Reviewer Note:'}
                </Text>
                <Text style={styles.rejectedBoxText}>{application.decision_note}</Text>
              </View>
            )}

            {/* Collapsible Details */}
            <TouchableOpacity
              onPress={() => setExpandedAppId(isExpanded ? null : application.id)}
              style={styles.toggleDetailsButton}
            >
              <Text style={styles.toggleDetailsText}>
                {isExpanded
                  ? isBangla ? '▲ তথ্য সংক্ষেপ করুন' : '▲ Hide details'
                  : isBangla ? '▼ জমা দেওয়া তথ্য দেখুন' : '▼ View details'}
              </Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.detailsContent}>
                <Text style={styles.detailItem}>
                  🏠 {isBangla ? 'বাসার ধরন: ' : 'Home: '}
                  {application.home_type}
                </Text>
                <Text style={styles.detailItem}>
                  🐾 {isBangla ? 'অন্যান্য প্রাণী: ' : 'Other pets: '}
                  {application.has_other_pets ? (isBangla ? 'হ্যাঁ' : 'Yes') : (isBangla ? 'না' : 'No')}
                </Text>
                {application.experience && (
                  <Text style={styles.detailItem}>
                    📖 {isBangla ? 'অভিজ্ঞতা: ' : 'Experience: '}
                    {application.experience}
                  </Text>
                )}
                <Text style={styles.detailItem}>
                  ❤️ {isBangla ? 'কারণ: ' : 'Reason: '}
                  {application.reason}
                </Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerMicro}>
                🤝 {isBangla ? 'মানবিক সিদ্ধান্ত' : 'Human decision'}
              </Text>

              <View style={styles.footerActions}>
                {onViewListing && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => onViewListing(listing.id)}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {isBangla ? 'তালিকা' : 'Listing'}
                    </Text>
                  </TouchableOpacity>
                )}

                {isPendingDecision && onWithdrawApplication && (
                  <TouchableOpacity
                    style={styles.withdrawButton}
                    onPress={() => handleWithdraw(application.id)}
                    disabled={withdrawingId === application.id}
                  >
                    {withdrawingId === application.id ? (
                      <ActivityIndicator size="small" color="#9f1239" />
                    ) : (
                      <Text style={styles.withdrawButtonText}>
                        {isBangla ? 'প্রত্যাহার' : 'Withdraw'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        );
      })}
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 10,
    gap: 10,
  },
  petThumb: {
    width: 55,
    height: 55,
    borderRadius: 8,
  },
  headerInfo: {
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speciesTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  speciesTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
  },
  districtText: {
    fontSize: 11,
    color: '#6b7280',
  },
  petTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  dateText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 1,
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  approvedBadge: {
    backgroundColor: '#d1fae5',
  },
  approvedText: {
    color: '#065f46',
  },
  rejectedBadge: {
    backgroundColor: '#ffe4e6',
  },
  rejectedText: {
    color: '#9f1239',
  },
  underReviewBadge: {
    backgroundColor: '#e0f2fe',
  },
  underReviewText: {
    color: '#0369a1',
  },
  withdrawnBadge: {
    backgroundColor: '#e5e7eb',
  },
  withdrawnText: {
    color: '#4b5563',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: '#059669',
  },
  stepCurrent: {
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#059669',
  },
  stepRejected: {
    backgroundColor: '#e11d48',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },
  stepLine: {
    flex: 0.8,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  stepLineCompleted: {
    backgroundColor: '#059669',
  },
  approvedBox: {
    backgroundColor: '#ecfdf5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    gap: 4,
  },
  approvedBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
  },
  approvedBoxSub: {
    fontSize: 11,
    color: '#047857',
  },
  handoverButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  handoverButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 11,
    color: '#065f46',
    backgroundColor: '#ffffff',
    padding: 6,
    borderRadius: 4,
    marginTop: 2,
  },
  rejectedBox: {
    backgroundColor: '#fff1f2',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fda4af',
    gap: 2,
  },
  rejectedBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9f1239',
  },
  rejectedBoxText: {
    fontSize: 11,
    color: '#881337',
  },
  toggleDetailsButton: {
    paddingVertical: 4,
  },
  toggleDetailsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  detailsContent: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    gap: 4,
  },
  detailItem: {
    fontSize: 11,
    color: '#4b5563',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  footerMicro: {
    fontSize: 10,
    color: '#9ca3af',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  withdrawButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#ffe4e6',
  },
  withdrawButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9f1239',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
