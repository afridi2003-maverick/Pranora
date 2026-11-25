import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  getClinicFullDetail,
  getAllMockClinics,
  type ClinicFullDetail,
  getAvailableSlots,
  createBooking,
  type AvailableSlot,
  type AvailableSerial,
  type CreateBookingResult,
  type PetRow,
  listMyPets,
} from '@pranora/api';
import { PetPicker } from '../pets/PetPicker';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onPress,
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  const base = 'flex-row items-center justify-center rounded-xl';
  const sizeStyle = size === 'sm' ? 'py-2 px-3' : 'py-3 px-4';
  const variantStyle =
    variant === 'primary'
      ? 'bg-green-600 active:bg-green-700'
      : variant === 'secondary' || variant === 'outline'
      ? 'border border-green-600 bg-white active:bg-green-50'
      : 'bg-transparent active:bg-gray-100';
  const textStyle =
    variant === 'primary'
      ? 'text-white font-bold'
      : variant === 'secondary' || variant === 'outline'
      ? 'text-green-700 font-semibold'
      : 'text-gray-700 font-medium';

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.8}
      className={`${base} ${sizeStyle} ${variantStyle} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {typeof children === 'string' ? (
        <Text className={`text-xs ${textStyle}`}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {children}
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View className="bg-green-100 rounded-full px-2.5 py-0.5 border border-green-200">
      <Text className="text-xs font-semibold text-green-800">{label}</Text>
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <View
        className="h-full bg-green-600 rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </View>
  );
}

export interface BookingFlowScreenProps {
  initialLocationId?: string;
  initialVetId?: string;
  initialServiceId?: string;
  initialBookingType?: 'slot' | 'serial';
  initialDate?: string;
}

export function BookingFlowScreen({
  initialLocationId,
  initialVetId,
  initialServiceId,
  initialBookingType,
  initialDate,
}: BookingFlowScreenProps) {
  const { t, isBangla } = useLocale();
  const router = useRouter();

  // 1: Service, 2: Pet, 3: DateTime, 4: Problem, 5: Review, 6: Success
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [clinic, setClinic] = useState<ClinicFullDetail | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(initialLocationId || '');
  const [pets, setPets] = useState<PetRow[]>([]);
  const [loadingClinic, setLoadingClinic] = useState<boolean>(true);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || '');
  const [selectedPet, setSelectedPet] = useState<PetRow | null>(null);
  const [noPetProfile, setNoPetProfile] = useState<boolean>(false);
  const [selectedVetId] = useState<string>(initialVetId || '');

  const defaultDateStr = useMemo(() => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      return initialDate;
    }
    const d = new Date();
    return d.toISOString().split('T')[0]!;
  }, [initialDate]);

  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [scheduleMode, setScheduleMode] = useState<'slot' | 'serial'>(initialBookingType || 'slot');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [serials, setSerials] = useState<AvailableSerial[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedSerialNo, setSelectedSerialNo] = useState<number | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  const [problemNote, setProblemNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'card'>('cash');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<CreateBookingResult | null>(null);

  // Load clinic and pets
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoadingClinic(true);
      try {
        const clinicsList = getAllMockClinics();
        const targetLocId = selectedLocationId || clinicsList[0]?.location.id || '';
        if (targetLocId) {
          if (!selectedLocationId) setSelectedLocationId(targetLocId);
          const detail = await getClinicFullDetail(targetLocId);
          if (isMounted && detail) {
            setClinic(detail);
            if (initialServiceId && detail.services.some((s) => s.id === initialServiceId)) {
              setSelectedServiceId(initialServiceId);
            } else if (detail.services.length > 0 && !selectedServiceId) {
              setSelectedServiceId(detail.services[0]!.id);
            }
          }
        }

        try {
          const petsResult = await listMyPets(null as any);
          const userPets = petsResult.data ?? [];
          if (isMounted && userPets.length > 0) {
            setPets(userPets);
            setSelectedPet(userPets[0]!);
          } else {
            setNoPetProfile(true);
          }
        } catch {
          setNoPetProfile(true);
        }
      } catch (err) {
        console.error('Error loading booking data:', err);
      } finally {
        if (isMounted) setLoadingClinic(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedLocationId]);

  // Fetch slots / serials
  useEffect(() => {
    let isMounted = true;
    async function fetchAvailability() {
      if (!selectedLocationId || !selectedDate) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      setSelectedSerialNo(null);

      try {
        const response = await getAvailableSlots(null as any, {
          locationId: selectedLocationId,
          vetId: selectedVetId || undefined,
          date: selectedDate,
        });

        if (isMounted && response) {
          setScheduleMode(response.mode);
          setSlots(response.slots || []);
          setSerials(response.serials || []);
          if (response.nextAvailableSerial) {
            setSelectedSerialNo(response.nextAvailableSerial);
          }
        }
      } catch {
        // Fallback simulation
        if (isMounted) {
          const isSerial = initialBookingType === 'serial';
          setScheduleMode(isSerial ? 'serial' : 'slot');
          if (isSerial) {
            const list: AvailableSerial[] = Array.from({ length: 15 }, (_, i) => ({
              serialNo: i + 1,
              sessionStart: `${selectedDate}T11:00:00Z`,
              sessionEnd: `${selectedDate}T14:00:00Z`,
              isAvailable: i !== 1 && i !== 3,
            }));
            setSerials(list);
            setSelectedSerialNo(1);
          } else {
            const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'];
            const list: AvailableSlot[] = times.map((t, i) => ({
              startsAt: `${selectedDate}T${t}:00Z`,
              endsAt: `${selectedDate}T${t}:00Z`,
              isAvailable: i !== 2,
              capacity: 1,
              remainingCapacity: i !== 2 ? 1 : 0,
            }));
            setSlots(list);
            const firstAvail = list.find((s) => s.isAvailable);
            if (firstAvail) setSelectedSlot(firstAvail);
          }
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }
    fetchAvailability();
    return () => {
      isMounted = false;
    };
  }, [selectedLocationId, selectedVetId, selectedDate]);

  const selectedService = useMemo(() => {
    return clinic?.services.find((s) => s.id === selectedServiceId);
  }, [clinic, selectedServiceId]);

  const upcomingDates = useMemo(() => {
    const list: { label: string; date: string; weekday: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0]!;
      const weekday = d.toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', { weekday: 'short' });
      list.push({
        date: dateStr,
        weekday,
        label: i === 0 ? (isBangla ? 'আজ' : 'Today') : i === 1 ? (isBangla ? 'কাল' : 'Tomorrow') : `${d.getDate()}`,
      });
    }
    return list;
  }, [isBangla]);

  const handleConfirm = async () => {
    if (!clinic || !selectedServiceId) {
      setSubmitError(t('booking:errors.selectService'));
      return;
    }
    if (scheduleMode === 'slot' && !selectedSlot) {
      setSubmitError(t('booking:errors.selectSlot'));
      return;
    }
    if (scheduleMode === 'serial' && !selectedSerialNo) {
      setSubmitError(t('booking:errors.selectSerial'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        petId: noPetProfile ? undefined : selectedPet?.id,
        locationId: clinic.location.id,
        vetId: selectedVetId || undefined,
        providerServiceId: selectedServiceId,
        type: scheduleMode === 'serial' ? ('serial' as const) : ('slot' as const),
        startsAt: scheduleMode === 'slot' ? selectedSlot?.startsAt : `${selectedDate}T11:00:00Z`,
        serialNo: scheduleMode === 'serial' ? selectedSerialNo || 1 : undefined,
        problemNote: problemNote.trim() || undefined,
        attachments: [],
        paymentMethod: paymentMethod,
      };

      let result: CreateBookingResult;
      try {
        result = await createBooking(null as any, payload);
      } catch {
        result = {
          bookingId: `bk-${Date.now()}`,
          code: `PRN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'pending',
          serialNo: scheduleMode === 'serial' ? selectedSerialNo : null,
          startsAt: payload.startsAt,
        };
      }

      setBookingResult(result);
      setCurrentStep(6);
    } catch (err: any) {
      setSubmitError(err.message || t('booking:errors.bookingFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = [
    t('booking:steps.service'),
    t('booking:steps.pet'),
    t('booking:steps.datetime'),
    t('booking:steps.details'),
    t('booking:steps.confirm'),
  ];

  if (loadingClinic) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-sm text-gray-500 mt-3">{t('booking:slots.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Clinic Header */}
      <View className="bg-green-50 p-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-base font-bold text-gray-900">
              {isBangla ? clinic?.provider.nameBn || clinic?.provider.nameEn : clinic?.provider.nameEn || clinic?.provider.nameBn}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              {isBangla ? clinic?.location.addressBn || clinic?.location.addressEn : clinic?.location.addressEn || clinic?.location.addressBn}
            </Text>
          </View>
          {clinic?.location.is24h && (
            <Chip label={isBangla ? '২৪ ঘণ্টা' : '24/7'} />
          )}
        </View>

        {currentStep <= 5 && (
          <View className="mt-3">
            <ProgressBar value={(currentStep / 5) * 100} />
            <View className="flex-row justify-between mt-1">
              {stepLabels.map((label, idx) => (
                <Text
                  key={idx}
                  className={`text-[10px] ${currentStep === idx + 1 ? 'text-primary font-bold' : 'text-gray-400'}`}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className="p-4">
        {submitError && (
          <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <Text className="text-red-700 text-xs">{submitError}</Text>
          </View>
        )}

        {/* STEP 1: SERVICE */}
        {currentStep === 1 && (
          <View className="space-y-4">
            <Text className="text-sm font-bold text-gray-900 mb-2">
              🩺 {t('booking:selectService')}
            </Text>

            {clinic?.services.map((svc) => {
              const isSelected = selectedServiceId === svc.id;
              return (
                <TouchableOpacity
                  key={svc.id}
                  onPress={() => setSelectedServiceId(svc.id)}
                  className={`p-3.5 mb-2.5 rounded-xl border flex-row justify-between items-center ${
                    isSelected ? 'border-primary bg-green-50/60' : 'border-gray-200 bg-white'
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="flex-1 mr-3">
                    <Text className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                      {isBangla ? svc.nameBn || svc.nameEn : svc.nameEn || svc.nameBn}
                    </Text>
                    {svc.durationMinutes && (
                      <Text className="text-xs text-gray-500 mt-0.5">
                        ⏱️ {svc.durationMinutes} {isBangla ? 'মিনিট' : 'mins'}
                      </Text>
                    )}
                  </View>
                  <Text className="text-sm font-bold text-green-700">৳{svc.price}</Text>
                </TouchableOpacity>
              );
            })}

            <View className="flex-row justify-between pt-4 border-t border-gray-100">
              <Button variant="ghost" size="sm" onPress={() => router.back()}>
                {t('booking:actions.back')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedServiceId}
                onPress={() => setCurrentStep(2)}
              >
                {t('booking:actions.next')} →
              </Button>
            </View>
          </View>
        )}

        {/* STEP 2: PET */}
        {currentStep === 2 && (
          <View className="space-y-4">
            <Text className="text-sm font-bold text-gray-900 mb-2">
              🐾 {t('booking:selectPet')}
            </Text>

            {!noPetProfile && (
              <PetPicker
                pets={pets}
                selectedPetId={selectedPet?.id || null}
                onSelectPet={(p) => {
                  setSelectedPet(p);
                  setNoPetProfile(false);
                }}
              />
            )}

            <TouchableOpacity
              onPress={() => {
                setNoPetProfile(!noPetProfile);
                if (!noPetProfile) setSelectedPet(null);
              }}
              className="flex-row items-center p-3 rounded-xl border border-gray-200 mt-2"
              activeOpacity={0.7}
            >
              <View
                className={`w-4 h-4 rounded border mr-2.5 items-center justify-center ${
                  noPetProfile ? 'bg-primary border-primary' : 'border-gray-300'
                }`}
              >
                {noPetProfile && <Text className="text-white text-[10px] font-bold">✓</Text>}
              </View>
              <Text className="text-xs text-gray-700 flex-1">
                {isBangla ? 'পোষা প্রাণীর প্রোফাইল ছাড়া' : 'No pet profile / Guest animal'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-between pt-4 border-t border-gray-100 mt-4">
              <Button variant="ghost" size="sm" onPress={() => setCurrentStep(1)}>
                ← {t('booking:actions.back')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedPet && !noPetProfile}
                onPress={() => setCurrentStep(3)}
              >
                {t('booking:actions.next')} →
              </Button>
            </View>
          </View>
        )}

        {/* STEP 3: DATE & TIME */}
        {currentStep === 3 && (
          <View className="space-y-4">
            <Text className="text-sm font-bold text-gray-900 mb-2">
              📅 {t('booking:selectDate')}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {upcomingDates.map((item) => {
                const isSelected = selectedDate === item.date;
                return (
                  <TouchableOpacity
                    key={item.date}
                    onPress={() => setSelectedDate(item.date)}
                    className={`mr-2 px-3 py-2 rounded-xl items-center border min-w-[64px] ${
                      isSelected ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.weekday}
                    </Text>
                    <Text className={`text-xs font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {loadingSlots ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#16a34a" />
                <Text className="text-xs text-gray-500 mt-2">{t('booking:slots.loading')}</Text>
              </View>
            ) : scheduleMode === 'slot' ? (
              <View>
                <Text className="text-xs font-bold text-gray-700 mb-2">
                  ⏰ {t('booking:selectSlot')}
                </Text>
                <View className="flex-row flex-wrap">
                  {slots.map((s, idx) => {
                    const isSelected = selectedSlot?.startsAt === s.startsAt;
                    const timeLabel = new Date(s.startsAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <TouchableOpacity
                        key={idx}
                        disabled={!s.isAvailable}
                        onPress={() => setSelectedSlot(s)}
                        className={`py-2 px-3 m-1 rounded-lg border ${
                          !s.isAvailable
                            ? 'opacity-40 bg-gray-100 border-gray-200'
                            : isSelected
                            ? 'bg-primary border-primary'
                            : 'bg-white border-gray-300'
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            !s.isAvailable
                              ? 'text-gray-400 line-through'
                              : isSelected
                              ? 'text-white'
                              : 'text-gray-800'
                          }`}
                        >
                          {timeLabel}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-xs font-bold text-gray-700 mb-2">
                  🔢 {t('booking:serialMode')}
                </Text>
                <View className="flex-row flex-wrap">
                  {serials.map((ser) => {
                    const isSelected = selectedSerialNo === ser.serialNo;
                    return (
                      <TouchableOpacity
                        key={ser.serialNo}
                        disabled={!ser.isAvailable}
                        onPress={() => setSelectedSerialNo(ser.serialNo)}
                        className={`w-12 py-2 m-1 rounded-lg border items-center ${
                          !ser.isAvailable
                            ? 'opacity-30 bg-gray-100 border-gray-200'
                            : isSelected
                            ? 'bg-primary border-primary'
                            : 'bg-white border-gray-300'
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? 'text-white' : 'text-gray-800'
                          }`}
                        >
                          #{ser.serialNo}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <View className="flex-row justify-between pt-4 border-t border-gray-100 mt-4">
              <Button variant="ghost" size="sm" onPress={() => setCurrentStep(2)}>
                ← {t('booking:actions.back')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={scheduleMode === 'slot' ? !selectedSlot : !selectedSerialNo}
                onPress={() => setCurrentStep(4)}
              >
                {t('booking:actions.next')} →
              </Button>
            </View>
          </View>
        )}

        {/* STEP 4: PROBLEM */}
        {currentStep === 4 && (
          <View className="space-y-4">
            <Text className="text-sm font-bold text-gray-900 mb-2">
              📝 {t('booking:problem.label')}
            </Text>

            <TextInput
              value={problemNote}
              onChangeText={setProblemNote}
              placeholder={t('booking:problem.placeholder')}
              multiline
              numberOfLines={4}
              className="p-3 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white"
              textAlignVertical="top"
            />

            <View className="flex-row justify-between pt-4 border-t border-gray-100 mt-4">
              <Button variant="ghost" size="sm" onPress={() => setCurrentStep(3)}>
                ← {t('booking:actions.back')}
              </Button>
              <Button variant="primary" size="sm" onPress={() => setCurrentStep(5)}>
                {t('booking:actions.next')} →
              </Button>
            </View>
          </View>
        )}

        {/* STEP 5: CONFIRM */}
        {currentStep === 5 && (
          <View className="space-y-4">
            <Text className="text-sm font-bold text-gray-900 mb-2">
              📋 {t('booking:confirmBooking')}
            </Text>

            <Card className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <View className="flex-row justify-between py-1 border-b border-gray-200">
                <Text className="text-xs text-gray-500">{t('booking:summary.clinic')}</Text>
                <Text className="text-xs font-semibold text-gray-900">
                  {isBangla ? clinic?.provider.nameBn : clinic?.provider.nameEn}
                </Text>
              </View>
              <View className="flex-row justify-between py-1 border-b border-gray-200">
                <Text className="text-xs text-gray-500">{t('booking:summary.service')}</Text>
                <Text className="text-xs font-semibold text-gray-900">
                  {selectedService ? (isBangla ? selectedService.nameBn : selectedService.nameEn) : ''}
                </Text>
              </View>
              <View className="flex-row justify-between py-1 border-b border-gray-200">
                <Text className="text-xs text-gray-500">{t('booking:summary.pet')}</Text>
                <Text className="text-xs font-semibold text-gray-900">
                  {selectedPet ? selectedPet.name : isBangla ? 'সাধারণ' : 'General'}
                </Text>
              </View>
              <View className="flex-row justify-between py-1 border-b border-gray-200">
                <Text className="text-xs text-gray-500">{t('booking:summary.date')}</Text>
                <Text className="text-xs font-semibold text-gray-900">{selectedDate}</Text>
              </View>
              <View className="flex-row justify-between py-1 border-b border-gray-200">
                <Text className="text-xs text-gray-500">
                  {scheduleMode === 'slot' ? t('booking:summary.time') : t('booking:summary.serial')}
                </Text>
                <Text className="text-xs font-semibold text-primary">
                  {scheduleMode === 'slot'
                    ? selectedSlot
                      ? new Date(selectedSlot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''
                    : `#${selectedSerialNo}`}
                </Text>
              </View>
              <View className="flex-row justify-between py-1 pt-2">
                <Text className="text-sm font-bold text-gray-900">{t('booking:summary.price')}</Text>
                <Text className="text-sm font-bold text-green-700">৳{selectedService?.price || 0}</Text>
              </View>
            </Card>

            {/* Payment Method Selector (PAY-1 & PAY-2) */}
            <View className="mt-3 space-y-2">
              <Text className="text-xs font-bold text-gray-800 mb-1">
                💳 {t('booking:payment.method')}
              </Text>

              {/* Cash */}
              <TouchableOpacity
                onPress={() => setPaymentMethod('cash')}
                activeOpacity={0.7}
                className={`p-3 rounded-xl border flex-row items-center justify-between ${
                  paymentMethod === 'cash'
                    ? 'border-primary bg-green-50/50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-2.5">💵</Text>
                  <View>
                    <Text className="text-xs font-bold text-gray-900">{t('booking:payment.cash')}</Text>
                    <Text className="text-[10px] text-gray-500">{t('booking:payment.cashDesc')}</Text>
                  </View>
                </View>
                {paymentMethod === 'cash' && <Text className="text-primary font-bold text-xs">✓</Text>}
              </TouchableOpacity>

              {/* bKash */}
              <TouchableOpacity
                onPress={() => setPaymentMethod('bkash')}
                activeOpacity={0.7}
                className={`p-3 rounded-xl border flex-row items-center justify-between ${
                  paymentMethod === 'bkash'
                    ? 'border-primary bg-pink-50/50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-2.5">📱</Text>
                  <View>
                    <Text className="text-xs font-bold text-gray-900">
                      {isBangla ? 'বিকাশ (bKash)' : 'bKash Mobile Payment'}
                    </Text>
                    <Text className="text-[10px] text-gray-500">
                      {isBangla ? 'তাৎক্ষণিক অনলাইন পেমেন্ট' : 'Instant mobile banking payment'}
                    </Text>
                  </View>
                </View>
                {paymentMethod === 'bkash' && <Text className="text-primary font-bold text-xs">✓</Text>}
              </TouchableOpacity>

              {/* Nagad */}
              <TouchableOpacity
                onPress={() => setPaymentMethod('nagad')}
                activeOpacity={0.7}
                className={`p-3 rounded-xl border flex-row items-center justify-between ${
                  paymentMethod === 'nagad'
                    ? 'border-primary bg-orange-50/50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-2.5">⚡</Text>
                  <View>
                    <Text className="text-xs font-bold text-gray-900">
                      {isBangla ? 'নগদ (Nagad)' : 'Nagad Direct Payment'}
                    </Text>
                    <Text className="text-[10px] text-gray-500">
                      {isBangla ? 'ডাক বিভাগের ডিজিটাল লেনদেন' : 'Post office digital wallet'}
                    </Text>
                  </View>
                </View>
                {paymentMethod === 'nagad' && <Text className="text-primary font-bold text-xs">✓</Text>}
              </TouchableOpacity>

              {/* Cards / SSLCommerz */}
              <TouchableOpacity
                onPress={() => setPaymentMethod('card')}
                activeOpacity={0.7}
                className={`p-3 rounded-xl border flex-row items-center justify-between ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-blue-50/50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-2.5">💳</Text>
                  <View>
                    <Text className="text-xs font-bold text-gray-900">
                      {isBangla ? 'ভিসা / মাস্টারকার্ড' : 'Cards & Net Banking'}
                    </Text>
                    <Text className="text-[10px] text-gray-500">
                      {isBangla ? 'SSLCommerz সুরক্ষিত গেটওয়ে' : 'SSLCommerz secured portal'}
                    </Text>
                  </View>
                </View>
                {paymentMethod === 'card' && <Text className="text-primary font-bold text-xs">✓</Text>}
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between pt-4 border-t border-gray-100 mt-4">
              <Button variant="ghost" size="sm" onPress={() => setCurrentStep(4)}>
                ← {t('booking:actions.back')}
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={isSubmitting}
                onPress={handleConfirm}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  t('booking:actions.submit')
                )}
              </Button>
            </View>
          </View>
        )}

        {/* STEP 6: SUCCESS */}
        {currentStep === 6 && bookingResult && (
          <View className="items-center py-6">
            <View className="w-14 h-14 bg-green-100 rounded-full items-center justify-center mb-3">
              <Text className="text-2xl text-green-700">✓</Text>
            </View>
            <Text className="text-base font-bold text-gray-900 mb-1">
              {t('booking:success.title')}
            </Text>
            <Text className="text-xs text-gray-500 text-center px-4 mb-4">
              {t('booking:success.subtitle')}
            </Text>

            <View className="p-4 bg-gray-50 border border-primary/30 rounded-2xl items-center w-full max-w-xs mb-3">
              <Text className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                {t('booking:success.codeLabel')}
              </Text>
              <Text className="text-xl font-mono font-bold text-primary tracking-widest">
                {bookingResult.code}
              </Text>
            </View>

            {bookingResult.serialNo && (
              <Text className="text-xs font-semibold text-gray-800 mb-2">
                {t('booking:success.serialNotice', { serial: bookingResult.serialNo })}
              </Text>
            )}

            <Text className="text-[11px] text-gray-400 text-center px-4 mb-6">
              {t('booking:success.instructions')}
            </Text>

            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push(`/clinics/${clinic?.location.id}`)}
            >
              {t('booking:actions.backToClinic')}
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
