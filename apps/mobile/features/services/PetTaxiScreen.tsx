import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  estimatePetTaxiFare,
  requestPetTaxi,
  getMyPetTaxiRides,
  createSupabaseClient,
  type PetTaxiRide,
  type PetTaxiVehicle,
} from '@pranora/api';

export function PetTaxiScreen() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [pickupAddress, setPickupAddress] = useState('Road 7, Dhanmondi, Dhaka');
  const [dropoffAddress, setDropoffAddress] = useState('PranoraCare Veterinary Clinic, Gulshan 2');
  const [vehicleType, setVehicleType] = useState<PetTaxiVehicle>('ac_car');
  const [needsCrate, setNeedsCrate] = useState(true);
  const [roundTrip, setRoundTrip] = useState(false);
  const [rides, setRides] = useState<PetTaxiRide[]>([]);
  const [lastRide, setLastRide] = useState<PetTaxiRide | null>(null);

  const estimatedFare = estimatePetTaxiFare(vehicleType, 7, roundTrip, needsCrate);

  useEffect(() => {
    const supabase = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
    getMyPetTaxiRides(supabase).then(setRides);
  }, []);

  const handleBook = async () => {
    if (pickupAddress.trim().length < 4 || dropoffAddress.trim().length < 4) return;
    const supabase = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
    const created = await requestPetTaxi(supabase, {
      petId: '550e8400-e29b-41d4-a716-446655440201',
      pickupAddress: pickupAddress.trim(),
      dropoffAddress: dropoffAddress.trim(),
      vehicleType,
      needsCrate,
      roundTrip,
      scheduledAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      estimatedFareBdt: estimatedFare,
      paymentMethod: 'sslcommerz',
    });
    setLastRide(created);
    setRides((prev) => [created, ...prev]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isBangla ? 'পেট ট্যাক্সি' : 'Pet Taxi'}</Text>
      <Text style={styles.subtitle}>
        {isBangla
          ? 'ক্লিনিক, গ্রুমিং বা বাসায় নিরাপদ পোষ্য পরিবহন'
          : 'Safe, pet-friendly transport to clinics, groomers, or home'}
      </Text>

      {lastRide && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {isBangla
              ? `পেট ট্যাক্সি বুক হয়েছে — আনুমানিক ভাড়া ৳${lastRide.estimatedFareBdt}`
              : `Pet Taxi requested — Estimated fare ৳${lastRide.estimatedFareBdt}`}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>{isBangla ? 'পিকআপ ঠিকানা' : 'Pickup Address'}</Text>
        <TextInput
          style={styles.input}
          value={pickupAddress}
          onChangeText={setPickupAddress}
        />

        <Text style={styles.label}>{isBangla ? 'গন্তব্যের ঠিকানা' : 'Dropoff Address'}</Text>
        <TextInput
          style={styles.input}
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
        />

        <Text style={styles.label}>{isBangla ? 'গাড়ির ধরন' : 'Vehicle Type'}</Text>
        <View style={styles.vehicleRow}>
          {(['bike_carrier', 'ac_car', 'van'] as const).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.vehicleBtn, vehicleType === v && styles.vehicleBtnActive]}
              onPress={() => setVehicleType(v)}
            >
              <Text
                style={[
                  styles.vehicleText,
                  vehicleType === v && styles.vehicleTextActive,
                ]}
              >
                {v === 'bike_carrier'
                  ? isBangla
                    ? 'বাইক'
                    : 'Bike'
                  : v === 'ac_car'
                    ? isBangla
                      ? 'এসি কার'
                      : 'AC Car'
                    : isBangla
                      ? 'ভ্যান'
                      : 'Van'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {isBangla ? 'পেট ক্যারিয়ার (+৳৮০)' : 'Sanitized Crate (+৳80)'}
          </Text>
          <Switch value={needsCrate} onValueChange={setNeedsCrate} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {isBangla ? 'রাউন্ড ট্রিপ' : 'Round Trip'}
          </Text>
          <Switch value={roundTrip} onValueChange={setRoundTrip} />
        </View>

        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>
            {isBangla ? 'আনুমানিক ভাড়া' : 'Estimated Fare'}
          </Text>
          <Text style={styles.fareValue}>৳{estimatedFare}</Text>
        </View>

        <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
          <Text style={styles.bookBtnText}>
            {isBangla ? 'পেট ট্যাক্সি বুক করুন' : 'Book Pet Taxi'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        {isBangla ? 'আমার পেট ট্যাক্সি রাইডসমূহ' : 'My Pet Taxi Rides'}
      </Text>
      {rides.map((r) => (
        <View key={r.id} style={styles.rideCard}>
          <Text style={styles.rideRoute}>
            {r.pickupAddress} → {r.dropoffAddress}
          </Text>
          <Text style={styles.rideMeta}>
            {r.vehicleType.replace('_', ' ')} • ৳{r.estimatedFareBdt} • {r.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b' },
  banner: { backgroundColor: '#d1fae5', padding: 12, borderRadius: 10 },
  bannerText: { color: '#065f46', fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  vehicleRow: { flexDirection: 'row', gap: 8 },
  vehicleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  vehicleBtnActive: { backgroundColor: '#2F7B53' },
  vehicleText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  vehicleTextActive: { color: '#ffffff' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: { fontSize: 14, color: '#0f172a' },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  fareLabel: { fontSize: 14, color: '#64748b' },
  fareValue: { fontSize: 20, fontWeight: '700', color: '#2F7B53' },
  bookBtn: {
    backgroundColor: '#2F7B53',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginTop: 4 },
  rideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rideRoute: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  rideMeta: { fontSize: 12, color: '#64748b', marginTop: 3 },
});
