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
import type { HandoverFullDetails } from './mockData';
import { DISTRICT_MAP } from './mockData';

interface AdoptionHandoverCardProps {
  initialDetails: HandoverFullDetails;
  currentUserId?: string;
  onConfirmHandover?: (handoverId: string) => Promise<{ success: boolean; bothConfirmed?: boolean; error?: string }>;
  onBack?: () => void;
}

export function AdoptionHandoverCard({
  initialDetails,
  currentUserId = 'user-current',
  onConfirmHandover,
  onBack,
}: AdoptionHandoverCardProps) {
  const { isBangla } = useLocale();
  const [details, setDetails] = useState<HandoverFullDetails>(initialDetails);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { handover, listing, petName, giverName, adopterName } = details;

  const isGiver = handover.from_user_id === currentUserId;
  const isAdopter = handover.to_user_id === currentUserId;
  const isGiverConfirmed = Boolean(handover.giver_confirmed_at);
  const isAdopterConfirmed = Boolean(handover.adopter_confirmed_at);
  const isCompleted = Boolean(handover.completed_at) || (isGiverConfirmed && isAdopterConfirmed);

  const canConfirm =
    !isCompleted &&
    ((isGiver && !isGiverConfirmed) || (isAdopter && !isAdopterConfirmed));

  const district = DISTRICT_MAP[listing.district_id]
    ? isBangla
      ? DISTRICT_MAP[listing.district_id]?.bn
      : DISTRICT_MAP[listing.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = listing.photos?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';

  const handleConfirm = async () => {
    setIsConfirming(true);
    setErrorMessage(null);

    try {
      if (onConfirmHandover) {
        const res = await onConfirmHandover(handover.id);
        if (!res.success) {
          setErrorMessage(res.error || (isBangla ? 'হস্তান্তর নিশ্চিত করা সম্ভব হয়নি।' : 'Failed to confirm handover.'));
          return;
        }
      }

      const nowIso = new Date().toISOString();
      setDetails((prev) => {
        const nextGiver = isGiver ? nowIso : prev.handover.giver_confirmed_at;
        const nextAdopter = isAdopter ? nowIso : prev.handover.adopter_confirmed_at;
        const bothDone = Boolean(nextGiver && nextAdopter);

        return {
          ...prev,
          handover: {
            ...prev.handover,
            giver_confirmed_at: nextGiver,
            adopter_confirmed_at: nextAdopter,
            completed_at: bothDone ? nowIso : null,
          },
        };
      });
    } catch {
      setErrorMessage(isBangla ? 'সার্ভারে সমস্যা হয়েছে।' : 'Server error occurred.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Header Pet Card */}
      <View style={styles.petCard}>
        <Image source={{ uri: photo }} style={styles.petThumb} />
        <View style={styles.petInfo}>
          <View style={styles.tagRow}>
            <View style={styles.speciesTag}>
              <Text style={styles.speciesTagText}>{listing.species}</Text>
            </View>
            <Text style={styles.districtText}>📍 {district}</Text>
          </View>
          <Text style={styles.petTitle} numberOfLines={1}>
            {petName}
          </Text>
          <Text style={styles.subText}>
            {isBangla ? 'দুই-পক্ষীয় নিশ্চিতকরণ (ADP-6)' : 'Two-Sided Handover (ADP-6)'}
          </Text>
        </View>
      </View>

      {/* 2. Completed State */}
      {isCompleted && (
        <View style={styles.completedCard}>
          <View style={styles.completedHeader}>
            <Text style={{ fontSize: 24 }}>🎉</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.completedTitle}>
                {isBangla ? 'হস্তান্তর সম্পন্ন হয়েছে!' : 'Handover Complete!'}
              </Text>
              <Text style={styles.completedSub}>
                {isBangla
                  ? 'উভয় পক্ষ নিশ্চিত করায় প্রাণীর মালিকানা ও মেডিকেল রেকর্ড সফলভাবে স্থানান্তরিত হয়েছে।'
                  : 'Both sides confirmed. Ownership and veterinary records transferred to adopter.'}
              </Text>
            </View>
          </View>
          <View style={styles.followupRow}>
            <Text style={styles.followupText}>
              📅 {isBangla ? 'খোঁজখবর (Follow-ups): ৩০, ৯০ ও ১৮০ দিন' : 'Follow-up checks: 30, 90 & 180 days'}
            </Text>
          </View>
        </View>
      )}

      {/* 3. Two Parties Status */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>
          {isBangla ? 'উভয় পক্ষের নিশ্চিতকরণ স্থিতি' : 'Two-Sided Confirmation Status'}
        </Text>

        {/* Giver */}
        <View
          style={[
            styles.partyBox,
            isGiverConfirmed ? styles.partyConfirmed : styles.partyPending,
          ]}
        >
          <View style={styles.partyHeader}>
            <Text style={styles.partyRole}>
              {isBangla ? '১. দাতা (আশ্রয়কেন্দ্র / অভিভাবক)' : '1. Giver (Current Caretaker)'}
            </Text>
            <Text style={{ fontSize: 16 }}>{isGiverConfirmed ? '✅' : '⏳'}</Text>
          </View>
          <Text style={styles.partyName}>{giverName}</Text>
          <Text style={styles.partyTimestamp}>
            {isGiverConfirmed
              ? isBangla
                ? `নিশ্চিত: ${new Date(handover.giver_confirmed_at!).toLocaleDateString()}`
                : `Confirmed: ${new Date(handover.giver_confirmed_at!).toLocaleDateString()}`
              : isBangla
              ? 'দাতার নিশ্চিতকরণের অপেক্ষায়'
              : 'Awaiting giver confirmation'}
          </Text>
        </View>

        {/* Adopter */}
        <View
          style={[
            styles.partyBox,
            isAdopterConfirmed ? styles.partyConfirmed : styles.partyPending,
          ]}
        >
          <View style={styles.partyHeader}>
            <Text style={styles.partyRole}>
              {isBangla ? '২. গ্রহীতা (নতুন দত্তককারী)' : '2. Adopter (New Adopter)'}
            </Text>
            <Text style={{ fontSize: 16 }}>{isAdopterConfirmed ? '✅' : '⏳'}</Text>
          </View>
          <Text style={styles.partyName}>{adopterName}</Text>
          <Text style={styles.partyTimestamp}>
            {isAdopterConfirmed
              ? isBangla
                ? `নিশ্চিত: ${new Date(handover.adopter_confirmed_at!).toLocaleDateString()}`
                : `Confirmed: ${new Date(handover.adopter_confirmed_at!).toLocaleDateString()}`
              : isBangla
              ? 'গ্রহীতার নিশ্চিতকরণের অপেক্ষায়'
              : 'Awaiting adopter confirmation'}
          </Text>
        </View>

        {/* Confirmation Action */}
        {canConfirm && (
          <View style={styles.actionPromptBox}>
            <Text style={styles.promptText}>
              {isGiver
                ? isBangla
                  ? 'আপনি কি প্রাণীটিকে নতুন দত্তককারীর কাছে হস্তান্তর করেছেন?'
                  : 'Have you handed over the pet to the approved adopter?'
                : isBangla
                ? 'আপনি কি প্রাণীটিকে সুস্থ অবস্থায় বুঝে পেয়েছেন?'
                : 'Have you safely received the pet in good health?'}
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {isBangla ? 'হস্তান্তর নিশ্চিত করুন' : 'Confirm Handover'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>{isBangla ? 'পেছনে' : 'Back'}</Text>
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
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speciesTag: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  speciesTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065f46',
    textTransform: 'uppercase',
  },
  districtText: {
    fontSize: 11,
    color: '#6b7280',
  },
  petTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  subText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  completedCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    padding: 14,
    gap: 8,
  },
  completedHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065f46',
  },
  completedSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  followupRow: {
    borderTopWidth: 1,
    borderTopColor: '#a7f3d0',
    paddingTop: 6,
  },
  followupText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  partyBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  partyConfirmed: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  partyPending: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partyRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  partyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  partyTimestamp: {
    fontSize: 11,
    color: '#6b7280',
  },
  actionPromptBox: {
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 8,
  },
  promptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  confirmButton: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#ffe4e6',
    padding: 8,
    borderRadius: 6,
  },
  errorText: {
    color: '#9f1239',
    fontSize: 11,
  },
  backButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
});
