import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  AdoptionCard,
  AdoptionDetailModal,
  MOCK_ADOPTION_LISTINGS,
  MOCK_SAVED_LISTING_IDS,
} from '../../features/adoption';
import type { AdoptionListingRow } from '@pranora/api';

export default function SavedAdoptionListingsScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(MOCK_SAVED_LISTING_IDS));
  const [selectedListing, setSelectedListing] = useState<AdoptionListingRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const savedListings = MOCK_ADOPTION_LISTINGS.filter((item) => savedIds.has(item.id));

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenDetail = (listing: AdoptionListingRow) => {
    setSelectedListing(listing);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleApply = (listing: AdoptionListingRow) => {
    setIsDetailOpen(false);
    router.push({
      pathname: '/adoption/apply/[id]',
      params: { id: listing.id },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 14, color: '#059669', fontWeight: '600' }}>
            ← {isBangla ? 'পেছনে' : 'Back'}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
          ♥ {isBangla ? 'সংরক্ষিত তালিকা' : 'Saved Listings'}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {savedListings.length > 0 ? (
          <View>
            <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
              {isBangla
                ? `সংরক্ষিত প্রাণী: ${savedListings.length} টি`
                : `${savedListings.length} saved pets`}
            </Text>

            {savedListings.map((listing) => (
              <AdoptionCard
                key={listing.id}
                listing={listing}
                onPress={handleOpenDetail}
                onSave={handleToggleSave}
                isSaved={true}
              />
            ))}
          </View>
        ) : (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 64,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderStyle: 'dashed',
              borderRadius: 16,
              backgroundColor: '#f9fafb',
              marginTop: 20,
            }}
          >
            <Text style={{ fontSize: 40, marginBottom: 8 }}>♥</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
              {isBangla ? 'কোনো প্রাণী সংরক্ষিত নেই' : 'No saved pets'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
              {isBangla
                ? 'পাবলিক তালিকায় প্রাণীর কার্ডে হার্ট (♥) চেপে সংরক্ষণ করুন।'
                : 'Tap the heart icon on any pet card to save it.'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/adoption')}
              style={{
                backgroundColor: '#059669',
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>
                🐾 {isBangla ? 'দত্তক তালিকা দেখুন' : 'Browse Listings'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <AdoptionDetailModal
        listing={selectedListing}
        visible={isDetailOpen}
        onClose={handleCloseDetail}
        onApply={handleApply}
        onSave={handleToggleSave}
        isSaved={selectedListing ? savedIds.has(selectedListing.id) : false}
      />
    </View>
  );
}
