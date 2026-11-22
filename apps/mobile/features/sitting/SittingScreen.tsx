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
  SitterProfile,
  SittingBooking,
  SittingServiceType,
  SittingPaymentMethod,
  listSitters,
  listMySittingBookings,
  createSittingBooking,
  cancelSittingBooking,
} from '@pranora/api';

export function SittingScreen() {
  const { t, isBangla } = useLocale();

  const [activeTab, setActiveTab] = useState<'sitters' | 'myBookings'>('sitters');
  const [sitters, setSitters] = useState<SitterProfile[]>([]);
  const [myBookings, setMyBookings] = useState<SittingBooking[]>([]);
  const [selectedService, setSelectedService] = useState<SittingServiceType | 'all'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Booking Modal
  const [bookingSitter, setBookingSitter] = useState<SitterProfile | null>(null);
  const [bookingServiceType, setBookingServiceType] = useState<SittingServiceType>('sitting_hourly');
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]!;
  const [bookingDate, setBookingDate] = useState<string>(tomorrow);
  const [bookingTime, setBookingTime] = useState<string>('10:00 AM');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [paymentMethod, setPaymentMethod] = useState<SittingPaymentMethod>('cash');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sittersList, bookingsList] = await Promise.all([
        listSitters(null, {
          service_type: selectedService === 'all' ? undefined : selectedService,
          area: selectedArea === 'all' ? undefined : selectedArea,
          search: searchQuery.trim() || undefined,
        }),
        listMySittingBookings(null),
      ]);
      setSitters(sittersList);
      setMyBookings(bookingsList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedService, selectedArea, searchQuery]);

  const handleOpenBooking = (sitter: SitterProfile) => {
    setBookingSitter(sitter);
    setBookingServiceType(sitter.service_types[0] ?? 'sitting_hourly');
    setDurationHours(2);
    setAddress('');
    setNotes('');
  };

  const handleSubmitBooking = async () => {
    if (!bookingSitter) return;
    if (!address.trim()) {
      Alert.alert(
        isBangla ? 'ঠিকানা প্রয়োজন' : 'Address Required',
        isBangla ? 'অনুগ্রহ করে আপনার সঠিক ঠিকানা প্রদান করুন।' : 'Please enter your complete address.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createSittingBooking(null, {
        sitter_id: bookingSitter.id,
        service_type: bookingServiceType,
        start_date: bookingDate,
        start_time: bookingTime,
        duration_hours: durationHours,
        payment_method: paymentMethod,
        address: address.trim(),
        notes: notes.trim() || undefined,
      });

      if (res.data) {
        setBookingSitter(null);
        Alert.alert(
          isBangla ? 'সফল!' : 'Success!',
          t('sitting:modal.successToast')
        );
        setActiveTab('myBookings');
        loadData();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Booking submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    Alert.alert(
      isBangla ? 'বুকিং বাতিল' : 'Cancel Booking',
      isBangla ? 'আপনি কি নিশ্চিত যে এই সিটিং বুকিংটি বাতিল করতে চান?' : 'Are you sure you want to cancel this booking?',
      [
        { text: isBangla ? 'না' : 'No', style: 'cancel' },
        {
          text: isBangla ? 'হ্যাঁ, বাতিল করুন' : 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const res = await cancelSittingBooking(null, id);
            if (res.success) {
              loadData();
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('sitting:pageTitle')}</Text>
        <Text style={styles.subtitle}>{t('sitting:pageSubtitle')}</Text>

        {/* Tab Switch */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'sitters' && styles.tabButtonActive]}
            onPress={() => setActiveTab('sitters')}
          >
            <Text style={[styles.tabText, activeTab === 'sitters' && styles.tabTextActive]}>
              🐾 {t('sitting:tabs.sitters')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'myBookings' && styles.tabButtonActive]}
            onPress={() => setActiveTab('myBookings')}
          >
            <Text style={[styles.tabText, activeTab === 'myBookings' && styles.tabTextActive]}>
              📋 {t('sitting:tabs.myBookings')} ({myBookings.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>লোড হচ্ছে...</Text>
        </View>
      ) : activeTab === 'myBookings' ? (
        /* My Bookings Tab */
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {myBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>{t('sitting:bookings.empty')}</Text>
            </View>
          ) : (
            myBookings.map((b) => (
              <View key={b.id} style={styles.bookingCard}>
                <View style={styles.bookingCardHeader}>
                  <Text style={styles.bookingServiceTitle}>
                    {t(`sitting:serviceTypes.${b.service_type}` as any)}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      b.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {t(`sitting:bookings.status.${b.status}` as any)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bookingSitterText}>
                  {t('sitting:bookings.sitter')}:{' '}
                  <Text style={styles.boldText}>
                    {b.sitter ? (isBangla ? b.sitter.full_name_bn : b.sitter.full_name_en) : 'Sitter'}
                  </Text>
                </Text>

                <View style={styles.bookingMetaRow}>
                  <Text style={styles.metaLabel}>
                    🗓 {b.start_date} | {b.start_time}
                  </Text>
                  <Text style={styles.metaLabel}>
                    ⏱ {isBangla ? `${b.duration_hours} ঘণ্টা` : `${b.duration_hours} hrs`}
                  </Text>
                  <Text style={styles.priceHighlight}>৳ {b.total_price}</Text>
                </View>

                <Text style={styles.addressText} numberOfLines={2}>
                  📍 {b.address}
                </Text>

                {b.notes ? <Text style={styles.notesText}>নোট: {b.notes}</Text> : null}

                {b.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.cancelBookingButton}
                    onPress={() => handleCancelBooking(b.id)}
                  >
                    <Text style={styles.cancelBookingText}>{t('sitting:bookings.cancelBtn')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        /* Sitters Browse Tab */
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Search bar */}
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('sitting:searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Area Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {[
              { id: 'all', label: t('sitting:areaFilter.all') },
              { id: 'ধানমন্ডি', label: 'ধানমন্ডি' },
              { id: 'গুলশান', label: 'গুলশান' },
              { id: 'উত্তরা', label: 'উত্তরা' },
              { id: 'মিরপুর', label: 'মিরপুর' },
            ].map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[styles.filterChip, selectedArea === area.id && styles.filterChipActive]}
                onPress={() => setSelectedArea(area.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedArea === area.id && styles.filterChipTextActive,
                  ]}
                >
                  📍 {area.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Service Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {(['all', 'sitting_hourly', 'dog_walking', 'day_sitting', 'overnight'] as const).map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterChip, selectedService === type && styles.filterChipActive]}
                  onPress={() => setSelectedService(type)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedService === type && styles.filterChipTextActive,
                    ]}
                  >
                    {t(`sitting:serviceTypes.${type}` as any)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          {/* Sitter Cards */}
          {sitters.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>{t('sitting:emptySitters')}</Text>
            </View>
          ) : (
            sitters.map((s) => (
              <View key={s.id} style={styles.sitterCard}>
                <View style={styles.sitterHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{s.full_name_en.charAt(0)}</Text>
                  </View>
                  <View style={styles.sitterDetails}>
                    <View style={styles.nameRow}>
                      <Text style={styles.sitterName}>
                        {isBangla ? s.full_name_bn : s.full_name_en}
                      </Text>
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓</Text>
                      </View>
                    </View>
                    <Text style={styles.ratingText}>
                      ★ {s.rating} ({s.review_count} রিভিউ) • {s.experience_years} বছর অভিজ্ঞতা
                    </Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.hourlyPrice}>৳{s.hourly_rate}</Text>
                    <Text style={styles.hourlyLabel}>{t('sitting:sitterCard.hourly')}</Text>
                  </View>
                </View>

                <Text style={styles.bioText} numberOfLines={3}>
                  {isBangla ? s.bio_bn : s.bio_en}
                </Text>

                <Text style={styles.areasLine} numberOfLines={1}>
                  📍 {s.areas.join(' • ')}
                </Text>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleOpenBooking(s)}
                  >
                    <Text style={styles.bookButtonText}>{t('sitting:sitterCard.bookBtn')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(s.phone)}
                  >
                    <Text style={styles.callButtonText}>📞 {t('sitting:sitterCard.callBtn')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Booking Modal */}
      {bookingSitter && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('sitting:modal.title')}</Text>
                <TouchableOpacity onPress={() => setBookingSitter(null)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalSitterInfo}>
                  {t('sitting:modal.sitterLabel')}{' '}
                  <Text style={styles.boldText}>
                    {isBangla ? bookingSitter.full_name_bn : bookingSitter.full_name_en}
                  </Text>
                </Text>

                {/* Service Types */}
                <Text style={styles.inputLabel}>{t('sitting:modal.serviceType')}</Text>
                <View style={styles.modalServiceTypes}>
                  {bookingSitter.service_types.map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.modalTypeButton,
                        bookingServiceType === st && styles.modalTypeButtonActive,
                      ]}
                      onPress={() => setBookingServiceType(st)}
                    >
                      <Text
                        style={[
                          styles.modalTypeText,
                          bookingServiceType === st && styles.modalTypeTextActive,
                        ]}
                      >
                        {t(`sitting:serviceTypes.${st}` as any)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Duration */}
                <Text style={styles.inputLabel}>{t('sitting:modal.duration')}</Text>
                <View style={styles.durationRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setDurationHours(Math.max(1, durationHours - 1))}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {isBangla ? `${durationHours} ঘণ্টা` : `${durationHours} hrs`}
                  </Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setDurationHours(Math.min(24, durationHours + 1))}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Date & Time */}
                <Text style={styles.inputLabel}>{t('sitting:modal.date')}</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={bookingDate}
                  onChangeText={setBookingDate}
                  placeholder="YYYY-MM-DD"
                />

                <Text style={styles.inputLabel}>{t('sitting:modal.time')}</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={bookingTime}
                  onChangeText={setBookingTime}
                  placeholder="10:00 AM"
                />

                {/* Payment Method */}
                <Text style={styles.inputLabel}>{t('sitting:modal.paymentMethod')}</Text>
                <View style={styles.modalServiceTypes}>
                  {(['cash', 'bkash', 'nagad'] as SittingPaymentMethod[]).map((pm) => (
                    <TouchableOpacity
                      key={pm}
                      style={[
                        styles.modalTypeButton,
                        paymentMethod === pm && styles.modalTypeButtonActive,
                      ]}
                      onPress={() => setPaymentMethod(pm)}
                    >
                      <Text
                        style={[
                          styles.modalTypeText,
                          paymentMethod === pm && styles.modalTypeTextActive,
                        ]}
                      >
                        {t(`sitting:modal.${pm}` as any)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Address */}
                <Text style={styles.inputLabel}>{t('sitting:modal.address')} *</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder={t('sitting:modal.addressPlaceholder')}
                  value={address}
                  onChangeText={setAddress}
                />

                {/* Notes */}
                <Text style={styles.inputLabel}>{t('sitting:modal.notes')}</Text>
                <TextInput
                  style={[styles.modalTextInput, { height: 60 }]}
                  placeholder={t('sitting:modal.notesPlaceholder')}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />

                {/* Total Price Banner */}
                <View style={styles.totalBanner}>
                  <Text style={styles.totalLabel}>{t('sitting:modal.estimatedPrice')}:</Text>
                  <Text style={styles.totalValue}>
                    ৳ {durationHours * bookingSitter.hourly_rate}
                  </Text>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitBooking}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? t('sitting:modal.submitting') : t('sitting:modal.submitBtn')}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  title: { fontSize: 22, fontWeight: '900', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 10, padding: 3, marginTop: 12 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabButtonActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#16a34a' },
  scrollContent: { padding: 16 },
  searchBox: { marginBottom: 12 },
  searchInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827' },
  chipsScroll: { marginBottom: 14 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 8 },
  filterChipActive: { backgroundColor: '#16a34a' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  filterChipTextActive: { color: '#ffffff' },
  sitterCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  sitterHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#16a34a' },
  sitterDetails: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  sitterName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  verifiedBadge: { backgroundColor: '#dcfce7', borderRadius: 10, paddingHorizontal: 5, marginLeft: 6 },
  verifiedText: { color: '#16a34a', fontSize: 10, fontWeight: 'bold' },
  ratingText: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  priceContainer: { alignItems: 'flex-end' },
  hourlyPrice: { fontSize: 18, fontWeight: '900', color: '#16a34a' },
  hourlyLabel: { fontSize: 10, color: '#6b7280' },
  bioText: { fontSize: 13, color: '#4b5563', marginTop: 10, lineHeight: 18 },
  areasLine: { fontSize: 11, color: '#6b7280', marginTop: 8 },
  cardActions: { flexDirection: 'row', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: '#f3f4f6' },
  bookButton: { flex: 1, backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginRight: 8 },
  bookButtonText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  callButton: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, alignItems: 'center' },
  callButtonText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  centered: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 13, color: '#6b7280' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: '#374151', textAlign: 'center' },
  bookingCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  bookingCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingServiceTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusConfirmed: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  bookingSitterText: { fontSize: 13, color: '#4b5563', marginTop: 6 },
  boldText: { fontWeight: 'bold', color: '#111827' },
  bookingMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  metaLabel: { fontSize: 12, color: '#6b7280' },
  priceHighlight: { fontSize: 14, fontWeight: 'bold', color: '#16a34a' },
  addressText: { fontSize: 12, color: '#4b5563', marginTop: 6 },
  notesText: { fontSize: 11, color: '#6b7280', marginTop: 4, backgroundColor: '#f9fafb', padding: 6, borderRadius: 6 },
  cancelBookingButton: { marginTop: 10, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 8 },
  cancelBookingText: { fontSize: 12, fontWeight: 'bold', color: '#dc2626' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  closeBtn: { fontSize: 18, color: '#9ca3af', padding: 4 },
  modalBody: { marginBottom: 20 },
  modalSitterInfo: { fontSize: 13, color: '#4b5563', marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginTop: 10, marginBottom: 4 },
  modalServiceTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  modalTypeButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginRight: 6, marginBottom: 6 },
  modalTypeButtonActive: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  modalTypeText: { fontSize: 12, color: '#4b5563' },
  modalTypeTextActive: { color: '#16a34a', fontWeight: 'bold' },
  durationRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  counterBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  counterValue: { marginHorizontal: 16, fontSize: 16, fontWeight: 'bold', color: '#111827' },
  modalTextInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10, fontSize: 13, color: '#111827', marginTop: 4 },
  totalBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 12, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: '#bbf7d0' },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#166534' },
  totalValue: { fontSize: 18, fontWeight: '900', color: '#16a34a' },
  submitButton: { backgroundColor: '#16a34a', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 16, marginBottom: 20 },
  submitButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
});
