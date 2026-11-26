import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  listOnlineConsultVets,
  createOnlineConsultation,
  getMyOnlineConsultations,
  createSupabaseClient,
  type OnlineVetOption,
  type OnlineConsultation,
  type OnlineConsultMode,
} from '@pranora/api';

export function OnlineConsultScreen() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [vets, setVets] = useState<OnlineVetOption[]>([]);
  const [selectedVetId, setSelectedVetId] = useState('');
  const [callMode, setCallMode] = useState<OnlineConsultMode>('video');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [consultations, setConsultations] = useState<OnlineConsultation[]>([]);
  const [lastBooked, setLastBooked] = useState<OnlineConsultation | null>(null);

  useEffect(() => {
    const supabase = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
    listOnlineConsultVets(supabase).then((list) => {
      setVets(list);
      if (list[0]) setSelectedVetId(list[0].vetId);
    });
    getMyOnlineConsultations(supabase).then(setConsultations);
  }, []);

  const selectedVet = vets.find((v) => v.vetId === selectedVetId) ?? vets[0];

  const handleBook = async () => {
    if (!selectedVet || chiefComplaint.trim().length < 5) return;
    const supabase = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
    const created = await createOnlineConsultation(
      supabase,
      {
        vetId: selectedVet.vetId,
        petId: '550e8400-e29b-41d4-a716-446655440201',
        callMode,
        chiefComplaint: chiefComplaint.trim(),
        scheduledAt: new Date(Date.now() + 1800 * 1000).toISOString(),
        feeBdt: selectedVet.feeBdt,
      },
      {
        vetName: isBangla ? selectedVet.nameBn : selectedVet.nameEn,
      }
    );
    setLastBooked(created);
    setConsultations((prev) => [created, ...prev]);
    setChiefComplaint('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isBangla ? 'অনলাইন ভেট পরামর্শ' : 'Online Vet Consultation'}
      </Text>
      <Text style={styles.subtitle}>
        {isBangla
          ? 'যাচাইকৃত পশু চিকিৎসকের সাথে অডিও বা ভিডিও পরামর্শ বুক করুন'
          : 'Book a paid audio or video consultation with a verified vet'}
      </Text>

      {lastBooked && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {isBangla
              ? `পরামর্শ নিশ্চিত হয়েছে (${lastBooked.transactionId}) — ৳${lastBooked.feeBdt}`
              : `Consultation booked (${lastBooked.transactionId}) — ৳${lastBooked.feeBdt}`}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {isBangla ? 'পশু চিকিৎসক বেছে নিন' : 'Choose an Online Vet'}
      </Text>

      {vets.map((vet) => {
        const selected = vet.vetId === selectedVetId;
        return (
          <TouchableOpacity
            key={vet.vetId}
            style={[styles.vetCard, selected && styles.vetCardSelected]}
            onPress={() => setSelectedVetId(vet.vetId)}
          >
            <View style={styles.vetRow}>
              <Text style={styles.vetName}>
                {isBangla ? vet.nameBn : vet.nameEn}
              </Text>
              <Text style={styles.vetFee}>৳{vet.feeBdt}</Text>
            </View>
            <Text style={styles.vetSpec}>
              {isBangla ? vet.specialtyBn : vet.specialtyEn}
            </Text>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.sectionTitle}>
        {isBangla ? 'পরামর্শের মাধ্যম' : 'Consultation Mode'}
      </Text>
      <View style={styles.modeRow}>
        {(['video', 'audio'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.modeBtn, callMode === mode && styles.modeBtnActive]}
            onPress={() => setCallMode(mode)}
          >
            <Text
              style={[
                styles.modeText,
                callMode === mode && styles.modeTextActive,
              ]}
            >
              {mode === 'video'
                ? isBangla
                  ? 'ভিডিও কল'
                  : 'Video Call'
                : isBangla
                  ? 'অডিও কল'
                  : 'Audio Call'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        {isBangla ? 'পোষ্যের লক্ষণ' : 'Pet Symptoms'}
      </Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={3}
        value={chiefComplaint}
        onChangeText={setChiefComplaint}
        placeholder={
          isBangla
            ? 'লক্ষণ ও সাম্প্রতিক পরিবর্তন লিখুন...'
            : 'Describe symptoms and recent changes...'
        }
      />

      <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
        <Text style={styles.bookBtnText}>
          {isBangla
            ? `পেমেন্ট করে কনফার্ম করুন (৳${selectedVet?.feeBdt ?? 500})`
            : `Pay & Confirm (৳${selectedVet?.feeBdt ?? 500})`}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        {isBangla ? 'আমার অনলাইন পরামর্শসমূহ' : 'My Online Consultations'}
      </Text>
      {consultations.map((c) => (
        <View key={c.id} style={styles.consultCard}>
          <Text style={styles.vetName}>{c.vetName}</Text>
          <Text style={styles.vetSpec}>
            {c.callMode.toUpperCase()} • ৳{c.feeBdt} • {c.chiefComplaint}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 10 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  banner: { backgroundColor: '#d1fae5', padding: 12, borderRadius: 10 },
  bannerText: { color: '#065f46', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginTop: 6 },
  vetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vetCardSelected: { borderColor: '#2F7B53', backgroundColor: '#ecfdf5' },
  vetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  vetName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  vetFee: { fontSize: 15, fontWeight: '700', color: '#2F7B53' },
  vetSpec: { fontSize: 12, color: '#64748b', marginTop: 3 },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: '#2F7B53' },
  modeText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  modeTextActive: { color: '#ffffff' },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  bookBtn: {
    backgroundColor: '#2F7B53',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  bookBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  consultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
