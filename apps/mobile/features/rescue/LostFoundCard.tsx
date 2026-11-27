import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { LostFoundBoardItem } from '@pranora/api';

interface LostFoundCardProps {
  item: LostFoundBoardItem;
  onOpenSightingModal: (item: LostFoundBoardItem) => void;
}

export function LostFoundCard({ item, onOpenSightingModal }: LostFoundCardProps) {
  const { isBangla } = useLocale();

  const isLost = item.kind === 'lost';
  const photo = item.photos && item.photos.length > 0
    ? item.photos[0]
    : isLost
    ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600'
    : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600';

  return (
    <View style={styles.card}>
      {/* Photo */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.kindBadge, isLost ? styles.kindBadgeLost : styles.kindBadgeFound]}>
            <Text style={styles.kindBadgeText}>
              {isLost
                ? isBangla ? '⚠️ হারানো' : '⚠️ Lost'
                : isBangla ? '🐾 পাওয়া গেছে' : '🐾 Found'}
            </Text>
          </View>
          <View style={styles.speciesBadge}>
            <Text style={styles.speciesBadgeText}>{item.species}</Text>
          </View>
        </View>
      </View>

      {/* Info Body */}
      <View style={styles.body}>
        <View style={styles.areaRow}>
          <Text style={styles.areaText}>
            📍 {item.area_text || (isBangla ? 'নিকটবর্তী এলাকা' : 'Nearby Area')}
          </Text>
          <Text style={styles.gridTag}>~১ কিমি</Text>
        </View>

        {item.description && (
          <Text style={styles.descText} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <Text style={styles.privacyNote}>
          🔒 {isBangla ? 'নিরাপত্তার্থে ফোন নম্বর গোপন' : 'Privacy-safe; numbers withheld'}
        </Text>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => onOpenSightingModal(item)}
          style={styles.actionBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>
            👁️ {isBangla ? 'আমি দেখেছি / সন্ধান দিন' : "I've Seen It"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 14,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  kindBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kindBadgeLost: {
    backgroundColor: '#e11d48',
  },
  kindBadgeFound: {
    backgroundColor: '#059669',
  },
  kindBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  speciesBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speciesBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  body: {
    padding: 14,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  areaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  gridTag: {
    fontSize: 10,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  descText: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  privacyNote: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actionBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
});
