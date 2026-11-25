import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  TrainerProfile,
  TrainingPackage,
  TrainingBooking,
  TrainingPackageType,
  TrainingBookingMode,
  TrainingFormat,
  TrainingPaymentMethod,
  listTrainers,
  listTrainingPackages,
  listMyTrainingBookings,
  createTrainingBooking,
  cancelTrainingBooking,
  createPaymentSession,
} from '@pranora/api';

const SPECIALTIES: Array<{ id: TrainingPackageType | 'all'; en: string; bn: string }> = [
  { id: 'all', en: 'All', bn: 'সব' },
  { id: 'obedience', en: 'Obedience', bn: 'ওবিডিয়েন্স' },
  { id: 'puppy_socialization', en: 'Puppy', bn: 'পাপি' },
  { id: 'behavior_correction', en: 'Behavior', bn: 'বিহেভিয়ার' },
  { id: 'agility', en: 'Agility', bn: 'অ্যাজিলিটি' },
];

export function TrainingScreen() {
  const { isBangla } = useLocale();

  const [activeTab, setActiveTab] = useState<'trainers' | 'myBookings'>('trainers');
  const [packages, setPackages] = useState<TrainingPackage[]>([]);
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [bookings, setBookings] = useState<TrainingBooking[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<TrainingPackageType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal state
  const [bookingTrainer, setBookingTrainer] = useState<TrainerProfile | null>(null);
  const [packageType, setPackageType] = useState<TrainingPackageType>('obedience');
  const [bookingMode, setBookingMode] = useState<TrainingBookingMode>('package');
  const [trainingFormat, setTrainingFormat] = useState<TrainingFormat>('home_visit');
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]!;
  const [startDate] = useState<string>(tomorrow);
  const [preferredTime] = useState<string>('04:00 PM');
  const [paymentMethod, setPaymentMethod] = useState<TrainingPaymentMethod>('bkash');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pkgList, trainerList, bookingList] = await Promise.all([
        listTrainingPackages(null),
        listTrainers(null, {
          specialty: selectedSpecialty === 'all' ? undefined : selectedSpecialty,
          search: searchQuery.trim() || undefined,
        }),
        listMyTrainingBookings(null),
      ]);
      setPackages(pkgList);
      setTrainers(trainerList);
      setBookings(bookingList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSpecialty, searchQuery]);

  const handleOpenBooking = (trainer: TrainerProfile) => {
    setBookingTrainer(trainer);
    setPackageType(trainer.specialties[0] ?? 'obedience');
    setBookingMode('package');
    setTrainingFormat('home_visit');
    setAddress('');
    setNotes('');
  };

  const handleSubmitBooking = async () => {
    if (!bookingTrainer) return;
    if (address.trim().length < 5) {
      Alert.alert(
        isBangla ? 'ঠিকানা দিন' : 'Address Required',
        isBangla
          ? 'কমপক্ষে ৫ অক্ষরের বিস্তারিত ঠিকানা লিখুন।'
          : 'Please enter a detailed address (at least 5 characters).'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTrainingBooking(null, {
        trainer_id: bookingTrainer.id,
        package_type: packageType,
        booking_mode: bookingMode,
        training_format: trainingFormat,
        start_date: startDate,
        preferred_time: preferredTime,
        payment_method: paymentMethod,
        address: address.trim(),
        pet_behavior_notes: notes.trim() || undefined,
      });

      if (res.error || !res.booking) {
        Alert.alert('Error', res.error ?? 'Failed to create booking');
        return;
      }

      if (paymentMethod !== 'cash') {
        const fee =
          bookingMode === 'single_session'
            ? bookingTrainer.session_rate
            : bookingTrainer.package_rate;
        try {
          await createPaymentSession(null as any, {
            bookingId: res.booking.id,
            amount: fee,
            method: paymentMethod as any,
            customerName: 'Pet Owner',
            customerPhone: '+8801700000000',
          });
        } catch {
          // Offline / mock mode already records paid status on training booking
        }
      }

      setBookingTrainer(null);
      setActiveTab('myBookings');
      await loadData();
      Alert.alert(
        isBangla ? 'সফল!' : 'Confirmed!',
        isBangla ? 'ট্রেনিং বুকিং নিশ্চিত হয়েছে।' : 'Training booking confirmed!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    await cancelTrainingBooking(null, id);
    await loadData();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          🎓 {isBangla ? 'পেট ট্রেনিং ও আচরণ পরিচর্যা' : 'Pet Training & Behavior'}
        </Text>
        <Text style={styles.subtitle}>
          {isBangla
            ? 'সার্টিফায়েড পজিটিভ-রিইনফোর্সমেন্ট ট্রেইনার'
            : 'Certified positive-reinforcement trainers'}
        </Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('trainers')}
            style={[styles.tabBtn, activeTab === 'trainers' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'trainers' && styles.tabTextActive]}>
              {isBangla ? 'ট্রেইনার' : 'Trainers'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('myBookings')}
            style={[styles.tabBtn, activeTab === 'myBookings' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'myBookings' && styles.tabTextActive]}>
              {isBangla ? `আমার ট্রেনিং (${bookings.length})` : `My Training (${bookings.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'trainers' ? (
          <>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={isBangla ? 'এলাকা বা নাম খুঁজুন...' : 'Search by area or name...'}
              style={styles.searchInput}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {SPECIALTIES.map((spec) => (
                <TouchableOpacity
                  key={spec.id}
                  onPress={() => setSelectedSpecialty(spec.id)}
                  style={[
                    styles.filterChip,
                    selectedSpecialty === spec.id && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedSpecialty === spec.id && styles.filterChipTextActive,
                    ]}
                  >
                    {isBangla ? spec.bn : spec.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {isLoading ? (
              <ActivityIndicator size="large" color="#2F7B53" style={{ marginTop: 32 }} />
            ) : (
              trainers.map((trainer) => (
                <View key={trainer.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {isBangla ? trainer.full_name_bn : trainer.full_name_en}
                      </Text>
                      <Text style={styles.cardMeta}>
                        ⭐ {trainer.rating.toFixed(1)} ({trainer.review_count}) •{' '}
                        {trainer.experience_years} {isBangla ? 'বছর' : 'yrs'} • {trainer.district}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.priceText}>৳{trainer.package_rate}</Text>
                      <Text style={styles.priceSub}>
                        ৳{trainer.session_rate}/{isBangla ? 'সেশন' : 'session'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.bioText}>
                    {isBangla ? trainer.bio_bn : trainer.bio_en}
                  </Text>

                  <Text style={styles.areasText}>
                    📍 {trainer.areas.join(', ')}
                  </Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${trainer.phone.replace(/\s+/g, '')}`)}
                      style={styles.callBtn}
                    >
                      <Text style={styles.callBtnText}>📞 {isBangla ? 'কল' : 'Call'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleOpenBooking(trainer)}
                      style={styles.bookBtn}
                    >
                      <Text style={styles.bookBtnText}>
                        {isBangla ? 'ট্রেনিং বুক করুন' : 'Book Training'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {isBangla ? 'কোনো ট্রেনিং বুকিং নেই' : 'No training bookings yet'}
            </Text>
          </View>
        ) : (
          bookings.map((b) => (
            <View key={b.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{b.package_type}</Text>
                <Text style={styles.statusTag}>{b.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.cardMeta}>
                {b.start_date} · {b.preferred_time} · {b.sessions_completed}/{b.sessions_total}{' '}
                {isBangla ? 'সেশন' : 'sessions'}
              </Text>
              <Text style={styles.areasText}>📍 {b.address}</Text>
              <View style={styles.cardActions}>
                <Text style={styles.priceText}>
                  ৳{b.total_price} ({b.payment_method})
                </Text>
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <TouchableOpacity
                    onPress={() => handleCancelBooking(b.id)}
                    style={styles.callBtn}
                  >
                    <Text style={{ color: '#B91C1C', fontWeight: '700', fontSize: 12 }}>
                      {isBangla ? 'বাতিল করুন' : 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={Boolean(bookingTrainer)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              🎓 {isBangla ? 'পেট ট্রেনিং বুকিং' : 'Book Pet Training'}
            </Text>
            {bookingTrainer && (
              <Text style={styles.modalSub}>
                {isBangla ? bookingTrainer.full_name_bn : bookingTrainer.full_name_en}
              </Text>
            )}

            <Text style={styles.label}>{isBangla ? 'প্রোগ্রাম' : 'Program'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {packages.map((p) => (
                <TouchableOpacity
                  key={p.slug}
                  onPress={() => setPackageType(p.slug)}
                  style={[styles.filterChip, packageType === p.slug && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      packageType === p.slug && styles.filterChipTextActive,
                    ]}
                  >
                    {isBangla ? p.title_bn : p.title_en}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>{isBangla ? 'পেমেন্ট' : 'Payment'}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {(['bkash', 'nagad', 'rocket', 'card', 'cash'] as TrainingPaymentMethod[]).map(
                (pm) => (
                  <TouchableOpacity
                    key={pm}
                    onPress={() => setPaymentMethod(pm)}
                    style={[styles.filterChip, paymentMethod === pm && styles.filterChipActive]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        paymentMethod === pm && styles.filterChipTextActive,
                      ]}
                    >
                      {pm.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder={isBangla ? 'ঠিকানা লিখুন...' : 'Enter your address...'}
              style={styles.searchInput}
            />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder={isBangla ? 'আচরণ ও লক্ষ্য (ঐচ্ছিক)' : 'Behavior notes (optional)'}
              style={styles.searchInput}
            />

            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => setBookingTrainer(null)} style={styles.callBtn}>
                <Text style={styles.callBtnText}>{isBangla ? 'বাতিল' : 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitBooking}
                disabled={isSubmitting}
                style={styles.bookBtn}
              >
                <Text style={styles.bookBtnText}>
                  {isSubmitting
                    ? '...'
                    : isBangla
                    ? 'নিশ্চিত করুন'
                    : 'Confirm Booking'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  header: { backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  tabRow: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 4, marginTop: 12 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#2F7B53', fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  filterRow: { flexDirection: 'row', marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#2F7B53', borderColor: '#2F7B53' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  filterChipTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  priceText: { fontSize: 16, fontWeight: '800', color: '#2F7B53' },
  priceSub: { fontSize: 11, color: '#6B7280' },
  bioText: { fontSize: 13, color: '#4B5563', marginBottom: 8 },
  areasText: { fontSize: 12, color: '#6B7280', marginBottom: 10 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  callBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  callBtnText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  bookBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, backgroundColor: '#2F7B53' },
  bookBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  statusTag: { fontSize: 11, fontWeight: '700', color: '#2F7B53', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  emptyBox: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#6B7280' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalSub: { fontSize: 13, color: '#2F7B53', fontWeight: '600', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
});
