import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { SpeciesType } from '@pranora/types';

interface RescuerProfileCardProps {
  initialAvailable?: boolean;
  initialRadiusKm?: number;
  initialSpecies?: SpeciesType[];
  districtName?: string;
  onSave?: (profile: {
    isAvailable: boolean;
    radiusKm: number;
    species: SpeciesType[];
  }) => Promise<void>;
}

export function RescuerProfileCard({
  initialAvailable = true,
  initialRadiusKm = 5,
  initialSpecies = ['dog', 'cat'],
  districtName,
  onSave,
}: RescuerProfileCardProps) {
  const { isBangla } = useLocale();

  const [isAvailable, setIsAvailable] = useState(initialAvailable);
  const [radiusKm, setRadiusKm] = useState(initialRadiusKm);
  const [species, setSpecies] = useState<SpeciesType[]>(initialSpecies);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const RADIUS_OPTIONS = [3, 5, 10, 15, 25];

  const SPECIES_LIST: { id: SpeciesType; bn: string; en: string; icon: string }[] = [
    { id: 'dog', bn: 'কুকুর', en: 'Dog', icon: '🐕' },
    { id: 'cat', bn: 'বিড়াল', en: 'Cat', icon: '🐈' },
    { id: 'rabbit', bn: 'খরগোশ', en: 'Rabbit', icon: '🐇' },
    { id: 'other', bn: 'অন্যান্য', en: 'Other', icon: '✨' },
  ];

  const toggleSpecies = (sp: SpeciesType) => {
    setSpecies((prev) => {
      if (prev.includes(sp)) {
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s !== sp);
      }
      return [...prev, sp];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      if (onSave) {
        await onSave({ isAvailable, radiusKm, species });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            🚑 {isBangla ? 'উদ্ধারকারী প্রাপ্যতা ও কভারেজ' : 'Rescuer Availability'}
          </Text>
          <Text style={styles.subtitle}>
            {districtName ? `📍 ${districtName} • ` : ''}
            {isBangla ? 'কভারেজ এলাকা ও রেডি স্ট্যাটাস' : 'Coverage area and active readiness'}
          </Text>
        </View>

        {/* Toggle Button */}
        <TouchableOpacity
          onPress={() => setIsAvailable(!isAvailable)}
          style={[styles.toggleBtn, isAvailable ? styles.toggleBtnActive : styles.toggleBtnInactive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleBtnText, isAvailable ? { color: '#ffffff' } : { color: '#374151' }]}>
            {isAvailable
              ? isBangla ? '🟢 প্রস্তুত' : '🟢 Ready'
              : isBangla ? '⚪ বিরতি' : '⚪ Away'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Coverage Radius */}
      <View style={styles.section}>
        <Text style={styles.label}>
          🎯 {isBangla ? 'কভারেজ ব্যাসার্ধ (RSC-9): ' : 'Coverage Radius: '}
          <Text style={{ fontWeight: 'bold', color: '#16a34a' }}>{radiusKm} {isBangla ? 'কিমি' : 'km'}</Text>
        </Text>
        <View style={styles.optionsRow}>
          {RADIUS_OPTIONS.map((km) => (
            <TouchableOpacity
              key={km}
              onPress={() => setRadiusKm(km)}
              style={[styles.chip, radiusKm === km ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={[styles.chipText, radiusKm === km ? styles.chipTextActive : styles.chipTextInactive]}>
                {km} {isBangla ? 'কিমি' : 'km'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Species */}
      <View style={styles.section}>
        <Text style={styles.label}>
          🐾 {isBangla ? 'সমর্থিত প্রাণী প্রজাতি' : 'Supported Animals'}
        </Text>
        <View style={styles.optionsRow}>
          {SPECIES_LIST.map((sp) => {
            const active = species.includes(sp.id);
            return (
              <TouchableOpacity
                key={sp.id}
                onPress={() => toggleSpecies(sp.id)}
                style={[styles.chip, active ? styles.chipActiveGreen : styles.chipInactive]}
              >
                <Text style={[styles.chipText, active ? styles.chipTextGreen : styles.chipTextInactive]}>
                  {sp.icon} {isBangla ? sp.bn : sp.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Footer / Save */}
      <View style={styles.footerRow}>
        {saveSuccess ? (
          <Text style={styles.successText}>
            ✓ {isBangla ? 'সংরক্ষিত হয়েছে' : 'Saved successfully'}
          </Text>
        ) : (
          <Text style={styles.hintText}>
            {isBangla ? 'জরুরি কেস অ্যালার্ট পান' : 'Receive nearby dispatch alerts'}
          </Text>
        )}

        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveBtn}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isBangla ? 'সেভ করুন' : 'Save'}
            </Text>
          )}
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
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#16a34a',
  },
  toggleBtnInactive: {
    backgroundColor: '#f3f4f6',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  chipActiveGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  chipInactive: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextGreen: {
    color: '#166534',
  },
  chipTextInactive: {
    color: '#4b5563',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  hintText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  successText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
  saveBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
