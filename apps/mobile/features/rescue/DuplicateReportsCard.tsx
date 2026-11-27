import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AnimalReportRow, PotentialDuplicateReport } from '@pranora/api';

interface DuplicateReportsCardProps {
  currentReport: AnimalReportRow;
  duplicates?: PotentialDuplicateReport[];
  onMergeDuplicate?: (duplicateId: string, targetId: string) => Promise<{ success: boolean; error?: string }>;
}

export function DuplicateReportsCard({
  currentReport,
  duplicates = [],
  onMergeDuplicate,
}: DuplicateReportsCardProps) {
  const { isBangla } = useLocale();

  const [candidates, setCandidates] = useState<PotentialDuplicateReport[]>(duplicates);
  const [selectedCandidate, setSelectedCandidate] = useState<PotentialDuplicateReport | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccessMsg, setMergeSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (candidates.length === 0 && !mergeSuccessMsg) {
    return null;
  }

  const handleOpenCompare = (candidate: PotentialDuplicateReport) => {
    setSelectedCandidate(candidate);
    setIsComparing(true);
    setErrorMessage(null);
  };

  const handleExecuteMerge = async () => {
    if (!selectedCandidate) return;

    setIsMerging(true);
    setErrorMessage(null);

    try {
      if (onMergeDuplicate) {
        const res = await onMergeDuplicate(selectedCandidate.id, currentReport.id);
        if (!res.success) {
          setErrorMessage(res.error || (isBangla ? 'রিপোর্ট একীভূত করা সম্ভব হয়নি।' : 'Failed to merge report.'));
          setIsMerging(false);
          return;
        }
      }

      setCandidates((prev) => prev.filter((c) => c.id !== selectedCandidate.id));
      setIsComparing(false);
      setMergeSuccessMsg(
        isBangla
          ? `রিপোর্ট #${selectedCandidate.id.slice(0, 8)} সফলভাবে বর্তমান কেসে একীভূত হয়েছে।`
          : `Report #${selectedCandidate.id.slice(0, 8)} merged into this case.`
      );
      setSelectedCandidate(null);
    } catch {
      setErrorMessage(isBangla ? 'সার্ভারে ত্রুটি হয়েছে।' : 'Server error occurred.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Text style={{ fontSize: 18 }}>⚠️</Text>
          <Text style={styles.cardTitle}>
            {isBangla
              ? `সম্ভাব্য নকল রিপোর্ট শনাক্ত (${candidates.length})`
              : `Potential Duplicates (${candidates.length})`}
          </Text>
        </View>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>RSC-8</Text>
        </View>
      </View>

      <Text style={styles.subtext}>
        {isBangla
          ? 'নিকটবর্তী এলাকায় একই প্রজাতির একাধিক রিপোর্ট শনাক্ত হয়েছে। একাধিক দলের দ্বৈত দৌড়াদৌড়ি এড়াতে মার্জ করুন।'
          : 'Multiple reports of the same species found nearby. Compare and merge to prevent duplicated rescue effort.'}
      </Text>

      {mergeSuccessMsg && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✅ {mergeSuccessMsg}</Text>
        </View>
      )}

      {/* Candidate List */}
      <View style={styles.candidateList}>
        {candidates.map((dup) => (
          <View key={dup.id} style={styles.candidateItem}>
            <Image
              source={{
                uri:
                  dup.photos[0] ||
                  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
              }}
              style={styles.candidateThumb}
            />

            <View style={styles.candidateInfo}>
              <View style={styles.infoMetaRow}>
                <Text style={styles.reportTag}>#{dup.id.slice(0, 8)}</Text>
                <View style={styles.speciesPill}>
                  <Text style={styles.speciesPillText}>{dup.species}</Text>
                </View>
                <View style={styles.distancePill}>
                  <Text style={styles.distancePillText}>
                    📍 ~{Math.round(dup.distance_meters)}m
                  </Text>
                </View>
              </View>

              <Text style={styles.candidateDesc} numberOfLines={2}>
                {dup.description || dup.area_text || (isBangla ? 'কোনো বিবরণ নেই' : 'No description')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleOpenCompare(dup)}
              style={styles.compareBtn}
            >
              <Text style={styles.compareBtnText}>
                {isBangla ? 'তুলনা' : 'Merge'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Comparison Modal */}
      {selectedCandidate && (
        <Modal
          visible={isComparing}
          transparent
          animationType="slide"
          onRequestClose={() => setIsComparing(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isBangla ? 'রিপোর্ট তুলনা ও একীভূতকরণ' : 'Compare & Merge Reports'}
                </Text>
                <TouchableOpacity onPress={() => setIsComparing(false)}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalExplainer}>
                  {isBangla
                    ? 'উভয় রিপোর্টের তথ্য মিলিয়ে নিন। একীভূত করলে নকল রিপোর্টটি বন্ধ হবে এবং ছবি ও তথ্য মূল কেসে স্থানান্তরিত হবে।'
                    : 'Review details side-by-side. Merging closes the duplicate and transfers evidence to the primary case.'}
                </Text>

                {/* Primary Card */}
                <View style={styles.primaryBox}>
                  <Text style={styles.boxTag}>
                    👑 {isBangla ? 'মূল রিপোর্ট (লক্ষ্য)' : 'Primary Target'} (#{currentReport.id.slice(0, 8)})
                  </Text>
                  <Image
                    source={{
                      uri:
                        currentReport.photos[0] ||
                        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
                    }}
                    style={styles.modalPhoto}
                  />
                  <Text style={styles.boxField}>
                    {isBangla ? 'প্রজাতি:' : 'Species:'} {currentReport.species} | {currentReport.urgency}
                  </Text>
                  <Text style={styles.boxField}>
                    {isBangla ? 'এলাকা:' : 'Area:'} {currentReport.area_text || '—'}
                  </Text>
                  <Text style={styles.boxDesc}>
                    {currentReport.description || '—'}
                  </Text>
                </View>

                {/* Candidate Card */}
                <View style={styles.candidateBox}>
                  <Text style={styles.boxTagCandidate}>
                    📑 {isBangla ? 'সম্ভাব্য নকল রিপোর্ট' : 'Candidate Duplicate'} (#{selectedCandidate.id.slice(0, 8)})
                  </Text>
                  <Image
                    source={{
                      uri:
                        selectedCandidate.photos[0] ||
                        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
                    }}
                    style={styles.modalPhoto}
                  />
                  <Text style={styles.boxField}>
                    {isBangla ? 'দূরত্ব:' : 'Distance:'} ~{Math.round(selectedCandidate.distance_meters)}m | {selectedCandidate.species}
                  </Text>
                  <Text style={styles.boxField}>
                    {isBangla ? 'এলাকা:' : 'Area:'} {selectedCandidate.area_text || '—'}
                  </Text>
                  <Text style={styles.boxDesc}>
                    {selectedCandidate.description || '—'}
                  </Text>
                </View>

                {errorMessage && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setIsComparing(false)}
                  style={styles.cancelBtn}
                  disabled={isMerging}
                >
                  <Text style={styles.cancelBtnText}>{isBangla ? 'বাতিল' : 'Cancel'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleExecuteMerge}
                  style={styles.mergeBtn}
                  disabled={isMerging}
                >
                  {isMerging ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.mergeBtnText}>
                      🔗 {isBangla ? 'একীভূত করুন' : 'Confirm Merge'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  badgePill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
  },
  subtext: {
    fontSize: 11,
    color: '#b45309',
    lineHeight: 16,
  },
  successBanner: {
    backgroundColor: '#ecfdf5',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  successText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
  },
  candidateList: {
    gap: 8,
    marginTop: 4,
  },
  candidateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 8,
  },
  candidateThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  candidateInfo: {
    flex: 1,
    gap: 2,
  },
  infoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  speciesPill: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  speciesPillText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
  },
  distancePill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  distancePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  candidateDesc: {
    fontSize: 11,
    color: '#4b5563',
  },
  compareBtn: {
    backgroundColor: '#fef3c7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  compareBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalHeader: {
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
  closeBtnText: {
    fontSize: 18,
    color: '#6b7280',
    padding: 4,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalExplainer: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 10,
  },
  primaryBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 10,
    gap: 4,
  },
  candidateBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 10,
    gap: 4,
  },
  boxTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 4,
  },
  boxTagCandidate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  modalPhoto: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 6,
  },
  boxField: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  boxDesc: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 16,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 11,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
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
  mergeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  mergeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
