import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import type { PetRow, AIMessageRow, AIConversationRow, EmergencyClinicPreview, ProposedBookingData, HandoffData } from '@pranora/api';
import { generateAssistantReply, buildPetContextInfo, generateVoiceWaveform, formatVoiceDuration, getRandomVoiceSample } from '@pranora/api';
import { PetPicker } from '../pets/PetPicker';

export interface AIChatScreenProps {
  pets?: PetRow[];
  selectedPet?: PetRow | null;
  onSelectPet?: (pet: PetRow) => void;
  conversation?: AIConversationRow | null;
  initialMessages?: AIMessageRow[];
}

export function AIChatScreen({
  pets = [],
  selectedPet: initialSelectedPet = null,
  onSelectPet: propOnSelectPet,
  initialMessages = [],
}: AIChatScreenProps) {
  const router = useRouter();
  const { t, locale, isBangla } = useLocale();

  const [selectedPet, setSelectedPet] = useState<PetRow | null>(initialSelectedPet ?? pets[0] ?? null);
  const [sharePetContext, setSharePetContext] = useState<boolean>(true);
  const [messages, setMessages] = useState<AIMessageRow[]>(() => {
    if (initialMessages.length > 0) return initialMessages;
    return [
      {
        id: 'msg-welcome',
        conversation_id: 'default-conv',
        role: 'assistant',
        content: t('ai:greeting'),
        is_voice: false,
        emergency_flag: false,
        handoff_flag: false,
        emergency_clinics: null,
        proposed_booking: null,
        handoff_data: null,
        created_at: new Date().toISOString(),
      },
    ];
  });

  const [inputContent, setInputContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const handleSelectPet = (pet: PetRow) => {
    setSelectedPet(pet);
    if (propOnSelectPet) propOnSelectPet(pet);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);

    // AI-6: Transcribe simulated voice query or random prompt
    const sampleVoicePrompt = getRandomVoiceSample(locale === 'en' ? 'en' : 'bn');
    handleSendMessage(sampleVoicePrompt, true);
  };

  const handleSendMessage = (textToSend?: string, isVoice: boolean = false) => {
    const text = (textToSend ?? inputContent).trim();
    if (!text || isTyping) return;

    const userMessage: AIMessageRow = {
      id: `user-${Date.now()}`,
      conversation_id: 'conv-active',
      role: 'user',
      content: text,
      is_voice: isVoice,
      emergency_flag: false,
      handoff_flag: false,
      emergency_clinics: null,
      proposed_booking: null,
      handoff_data: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputContent('');
    setIsTyping(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI response with guardrail evaluation, consent-based pet context & booking logic
    setTimeout(() => {
      const petContext =
        sharePetContext && selectedPet ? buildPetContextInfo(selectedPet) : null;

      const lastPendingBooking =
        messages
          .slice()
          .reverse()
          .find(
            (m) =>
              m.proposed_booking &&
              m.proposed_booking.status === 'pending_confirmation'
          )?.proposed_booking ?? null;

      const reply = generateAssistantReply(
        text,
        locale === 'en' ? 'en' : 'bn',
        petContext,
        lastPendingBooking
      );

      const assistantMessage: AIMessageRow = {
        id: `ai-${Date.now()}`,
        conversation_id: 'conv-active',
        role: 'assistant',
        content: reply.content,
        is_voice: isVoice,
        emergency_flag: reply.emergency_flag,
        handoff_flag: reply.handoff_flag,
        emergency_clinics: reply.emergency_clinics ?? null,
        proposed_booking: reply.proposed_booking ?? null,
        handoff_data: reply.handoff_data ?? null,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);

      if (isVoice) {
        setPlayingMessageId(assistantMessage.id);
        setTimeout(() => setPlayingMessageId(null), 4000);
      }

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }, 600);
  };

  const quickPrompts = [
    { label: t('ai:quickHandoffBtn'), query: isBangla ? 'আমি একজন বিশেষজ্ঞ পশু চিকিৎসক বা সাপোর্টের সাথে সরাসরি কথা বলতে চাই' : 'I want to speak with a veterinary specialist or support agent directly' },
    { label: t('ai:bookingHelp'), query: isBangla ? 'একজন পশু চিকিৎসকের অ্যাপয়েন্টমেন্ট বুক করতে সাহায্য করুন' : 'Help me book an appointment with a vet' },
    { label: t('ai:promptFood'), query: isBangla ? 'আমার পোষা প্রাণীর জন্য কোন খাবার নিরাপদ ও পুষ্টিকর?' : 'What food is safe and healthy for my pet?' },
    { label: t('ai:promptVaccine'), query: isBangla ? 'পোষা প্রাণীর প্রাথমিক ভ্যাকসিন রুটিন কেমন হয়?' : 'What is the standard vaccination schedule for pets?' },
    { label: t('ai:promptGrooming'), query: isBangla ? 'কত দিন পর পর লোম ব্রাশ ও গোসল করানো উচিত?' : 'How often should I groom and bathe my pet?' },
    { label: t('ai:promptEmergencyTest'), query: isBangla ? 'আমার বিড়ালের শ্বাসকষ্ট হচ্ছে ও বিষাক্ত কিছু খেয়েছে' : 'My cat has breathing difficulty and ate something toxic' },
  ];

  const renderEmergencyClinicCards = (clinics: EmergencyClinicPreview[]) => (
    <View className="mt-3 pt-2 border-t border-red-200">
      <Text className="text-red-800 font-bold text-xs mb-2">
        🏥 {t('ai:emergencyNearbyTitle')}
      </Text>
      {clinics.map((clinic) => (
        <View
          key={clinic.locationId}
          className="bg-white border border-red-200 rounded-xl p-3 mb-2"
        >
          <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
            {isBangla ? clinic.nameBn : clinic.nameEn}
          </Text>
          <Text className="text-xs text-gray-600 mt-0.5" numberOfLines={1}>
            {isBangla ? clinic.addressBn : clinic.addressEn}
          </Text>
          <Text className="text-xs text-red-600 font-semibold mt-0.5">
            📍 {clinic.distanceKm} {clinic.is24h ? (isBangla ? '• ২৪/৭ খোলা' : '• Open 24/7') : ''}
          </Text>

          <View className="flex-row gap-2 mt-2">
            {clinic.phone && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${clinic.phone}`)}
                className="flex-1 bg-red-600 py-2 rounded-lg items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white text-xs font-bold">
                  📞 {t('ai:emergencyCallNow')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`)}
              className="flex-1 bg-white border border-red-400 py-2 rounded-lg items-center"
              activeOpacity={0.8}
            >
              <Text className="text-red-700 text-xs font-bold">
                🗺️ {t('ai:emergencyDirections')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderHandoffCard = (handoff: HandoffData) => (
    <View className="mt-3 pt-3 border-t border-blue-200 bg-blue-50/70 rounded-xl p-3 border border-blue-200">
      <View className="flex-row items-center gap-1.5 mb-1.5">
        <Text className="text-base">🩺</Text>
        <Text className="text-blue-900 font-bold text-xs flex-1">
          {t('ai:handoffCardTitle')}
        </Text>
      </View>
      <Text className="text-xs text-blue-800 leading-relaxed mb-3">
        {t('ai:handoffCardDesc')}
      </Text>

      {/* Suggested Nearby Clinics */}
      {handoff.clinics && handoff.clinics.length > 0 && (
        <View className="mb-2">
          <Text className="text-xs font-bold text-gray-800 mb-2">
            🏥 {t('ai:handoffClinicsHeader')}
          </Text>
          {handoff.clinics.map((clinic) => (
            <View
              key={clinic.locationId}
              className="bg-white border border-gray-200 rounded-lg p-2.5 mb-2"
            >
              <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                {isBangla ? clinic.nameBn : clinic.nameEn}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                {isBangla ? clinic.addressBn : clinic.addressEn}
              </Text>
              <Text className="text-xs text-gray-600 font-medium mt-0.5">
                📍 {clinic.distanceKm}
              </Text>

              <View className="flex-row gap-2 mt-2">
                {clinic.phone && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${clinic.phone}`)}
                    className="flex-1 bg-green-700 py-1.5 rounded-md items-center justify-center flex-row gap-1"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-xs font-bold">
                      📞 {t('ai:handoffCallVetBtn')}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/map' })}
                  className="flex-1 bg-gray-100 border border-gray-300 py-1.5 rounded-md items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-700 text-xs font-semibold">
                    🗺️ {t('ai:goToMap')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Central Support Helpline */}
      <View className="bg-white border border-blue-200 rounded-lg p-2.5 mt-1">
        <Text className="text-xs font-bold text-blue-900 mb-0.5">
          📞 {t('ai:handoffSupportHeader')}
        </Text>
        <Text className="text-xs text-gray-500 mb-2">
          {handoff.support_phone ?? '+880 9612-772667'} ({t('ai:handoffSupportHours')})
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${handoff.support_phone ?? '+8809612772667'}`)}
          className="bg-blue-600 py-2 rounded-lg items-center justify-center flex-row gap-1"
          activeOpacity={0.8}
        >
          <Text className="text-white text-xs font-bold">
            📞 {t('ai:handoffCallSupportBtn')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Button to explore all clinics */}
      <TouchableOpacity
        onPress={() => router.push('/clinics' as never)}
        className="mt-2.5 py-1.5 items-center justify-center"
      >
        <Text className="text-blue-700 text-xs font-semibold underline">
          🔍 {t('ai:handoffViewClinics')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProposedBookingCard = (booking: ProposedBookingData) => {
    if (booking.status === 'confirmed') {
      return (
        <View className="mt-3 pt-3 border-t border-green-200 bg-green-50 rounded-xl p-3 border border-green-300">
          <Text className="text-green-800 font-bold text-xs mb-1">
            ✅ {isBangla ? 'বুকিং নিশ্চিত হয়েছে' : 'Booking Confirmed'}
          </Text>
          <Text className="text-gray-900 font-bold text-sm">
            {booking.clinic_name}
          </Text>
          <Text className="text-xs text-gray-600 mt-0.5">
            {booking.service_name} • {booking.suggested_date} ({booking.suggested_time})
          </Text>
          <View className="bg-white border border-green-300 rounded-lg p-2.5 mt-2 flex-row justify-between items-center">
            <Text className="text-xs text-gray-700 font-medium">{isBangla ? 'বুকিং কোড:' : 'Booking Code:'}</Text>
            <Text className="text-sm font-black text-green-700">{booking.booking_code}</Text>
          </View>
        </View>
      );
    }

    if (booking.status === 'declined') {
      return (
        <View className="mt-3 pt-2 border-t border-gray-200">
          <Text className="text-xs text-gray-500 italic">
            ❌ {t('ai:bookingDeclined')}
          </Text>
        </View>
      );
    }

    return (
      <View className="mt-3 pt-3 border-t border-primary/30 bg-green-50/70 rounded-xl p-3 border border-green-200">
        <Text className="text-primary font-bold text-xs mb-2">
          📅 {t('ai:bookingProposedTitle')}
        </Text>
        <View className="bg-white rounded-lg p-2.5 border border-gray-200 mb-3">
          <Text className="text-xs text-gray-600 mb-1">
            <Text className="font-semibold text-gray-800">{t('ai:bookingClinic')}: </Text>
            {booking.clinic_name}
          </Text>
          <Text className="text-xs text-gray-600 mb-1">
            <Text className="font-semibold text-gray-800">{t('ai:bookingService')}: </Text>
            {booking.service_name}
          </Text>
          <Text className="text-xs text-gray-600 mb-1">
            <Text className="font-semibold text-gray-800">{t('ai:bookingDate')}: </Text>
            {booking.suggested_date} ({booking.suggested_time})
          </Text>
          {booking.price != null && (
            <Text className="text-xs text-gray-600">
              <Text className="font-semibold text-gray-800">{t('ai:bookingFee')}: </Text>
              ৳ {booking.price}
            </Text>
          )}
        </View>

        <Text className="text-xs font-semibold text-gray-700 mb-2">
          {t('ai:bookingConfirm')}
        </Text>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleSendMessage(isBangla ? 'হ্যাঁ, বুক করুন' : 'Yes, Confirm')}
            className="flex-1 bg-primary py-2.5 rounded-lg items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white text-xs font-bold">
              {t('ai:bookingConfirmBtn')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSendMessage(isBangla ? 'না, বাতিল' : 'No, Cancel')}
            className="bg-white border border-gray-300 py-2.5 px-3 rounded-lg items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 text-xs font-semibold">
              {t('ai:bookingDeclineBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-gray-900">
              🤖 {t('ai:pageTitle')}
            </Text>
            <Text className="text-xs text-gray-500">
              {t('ai:disclaimer')}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => {
                handleSendMessage(
                  isBangla
                    ? 'আমি একজন বিশেষজ্ঞ পশু চিকিৎসক বা সাপোর্টের সাথে সরাসরি কথা বলতে চাই'
                    : 'I want to speak with a veterinary specialist or support agent directly'
                );
              }}
              className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg flex-row items-center gap-1"
            >
              <Text className="text-xs font-bold text-blue-700">
                🩺 {t('ai:quickHandoffBtn')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMessages([
                  {
                    id: `welcome-${Date.now()}`,
                    conversation_id: 'conv-active',
                    role: 'assistant',
                    content: t('ai:greeting'),
                    is_voice: false,
                    emergency_flag: false,
                    handoff_flag: false,
                    emergency_clinics: null,
                    proposed_booking: null,
                    handoff_data: null,
                    created_at: new Date().toISOString(),
                  },
                ]);
              }}
              className="px-2.5 py-1.5 bg-gray-100 rounded-lg"
            >
              <Text className="text-xs font-semibold text-gray-600">
                🔄 {isBangla ? 'নতুন' : 'New'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI-3: Pet Context Selector & Explicit Consent Toggle */}
        <View className="bg-green-50/80 border-b border-green-200 px-4 py-2.5">
          {pets.length > 0 && (
            <PetPicker
              pets={pets}
              selectedPetId={selectedPet?.id ?? null}
              onSelectPet={handleSelectPet}
              label={isBangla ? 'যে পোষা প্রাণী সম্পর্কে জানতে চান:' : 'Select pet context:'}
            />
          )}

          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-green-200/60">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-xs font-bold text-gray-800">
                  {sharePetContext ? '🔒 ' + t('ai:petContextActive') : '🛡️ ' + t('ai:petContextDisabled')}
                </Text>
              </View>
              <Text className="text-[11px] text-gray-600 mt-0.5">
                {sharePetContext
                  ? selectedPet
                    ? `${selectedPet.name} • ${selectedPet.species}${selectedPet.allergies ? ` (${isBangla ? 'অ্যালার্জি' : 'Allergies'}: ${selectedPet.allergies})` : ''}`
                    : t('ai:selectPetPrompt')
                  : isBangla
                  ? 'পোষা প্রাণীর কোনো ব্যক্তিগত তথ্য এআই এর সাথে শেয়ার করা হচ্ছে না।'
                  : 'No personal pet profile data is shared with the AI.'}
              </Text>
            </View>

            <Switch
              value={sharePetContext}
              onValueChange={setSharePetContext}
              trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Message Feed */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const isUser = item.role === 'user';

            return (
              <View
                className={`mb-3 flex-row ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-2 self-start mt-1">
                    <Text className="text-sm">🤖</Text>
                  </View>
                )}

                <View
                  className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'bg-primary text-white rounded-tr-none'
                      : item.emergency_flag
                      ? 'bg-red-50 border-2 border-red-500 rounded-tl-none'
                      : 'bg-white border border-gray-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Emergency Warning Banner */}
                  {item.emergency_flag && (
                    <View className="mb-2 pb-2 border-b border-red-200">
                      <Text className="text-red-700 font-bold text-sm flex-row items-center">
                        🚨 {t('ai:emergencyBannerTitle')}
                      </Text>
                    </View>
                  )}

                  {/* AI-6: Voice Message Waveform & Audio Player */}
                  {item.is_voice && (
                    <View className={`mb-2 rounded-xl p-2.5 ${isUser ? 'bg-white/20' : 'bg-gray-100'}`}>
                      <View className="flex-row items-center justify-between mb-1.5">
                        <View className="flex-row items-center gap-1">
                          <Text className="text-xs">🎙️</Text>
                          <Text className={`text-[11px] font-bold ${isUser ? 'text-white' : 'text-gray-700'}`}>
                            {t('ai:voiceBadge')}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            if (playingMessageId === item.id) {
                              setPlayingMessageId(null);
                            } else {
                              setPlayingMessageId(item.id);
                              setTimeout(() => setPlayingMessageId(null), 3500);
                            }
                          }}
                          className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full border ${
                            isUser ? 'bg-white/30 border-white/40' : 'bg-white border-gray-200'
                          }`}
                        >
                          <Text className={`text-[10px] font-semibold ${isUser ? 'text-white' : 'text-gray-700'}`}>
                            {playingMessageId === item.id
                              ? '⏹️ ' + t('ai:voiceStopAudio')
                              : '🔊 ' + t('ai:voicePlayAudio')}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Waveform Visualization */}
                      <View className="flex-row items-center gap-1 h-5 px-1">
                        {generateVoiceWaveform(14, item.id.length * 11).map((bar, i) => (
                          <View
                            key={`bar-${i}`}
                            style={{ height: Math.max(4, bar * (playingMessageId === item.id ? 20 : 12)) }}
                            className={`w-1 rounded-full ${
                              isUser
                                ? 'bg-white'
                                : playingMessageId === item.id
                                ? 'bg-primary'
                                : 'bg-gray-400'
                            }`}
                          />
                        ))}
                        <Text className={`text-[10px] ml-auto font-mono ${isUser ? 'text-white/80' : 'text-gray-500'}`}>
                          {formatVoiceDuration(playingMessageId === item.id ? 2 : 4)}
                        </Text>
                      </View>
                    </View>
                  )}

                  <Text
                    className={`text-sm leading-5 ${
                      isUser
                        ? 'text-white'
                        : item.emergency_flag
                        ? 'text-red-900 font-medium'
                        : 'text-gray-800'
                    }`}
                  >
                    {item.content}
                  </Text>

                  {/* AI-2: Emergency First-Aid Tips */}
                  {item.emergency_flag && (
                    <View className="mt-3 pt-2 border-t border-red-200 bg-red-100/60 rounded-lg p-2.5">
                      <Text className="text-red-800 font-bold text-xs mb-1">
                        📋 {t('ai:emergencyFirstAidTitle')}
                      </Text>
                      <Text className="text-red-900 text-xs leading-4 mb-0.5">
                        • {t('ai:emergencyFirstAid1')}
                      </Text>
                      <Text className="text-red-900 text-xs leading-4">
                        • {t('ai:emergencyFirstAid2')}
                      </Text>
                    </View>
                  )}

                  {/* AI-2: Nearby Emergency Clinic Cards */}
                  {item.emergency_flag && item.emergency_clinics && item.emergency_clinics.length > 0 && (
                    renderEmergencyClinicCards(item.emergency_clinics)
                  )}

                  {/* AI-4: Proposed Booking Card */}
                  {item.proposed_booking && renderProposedBookingCard(item.proposed_booking)}

                  {/* Emergency Action Buttons */}
                  {item.emergency_flag && (
                    <View className="mt-3 pt-2 border-t border-red-200 gap-2">
                      <TouchableOpacity
                        onPress={() => router.push('/emergency' as never)}
                        className="w-full bg-emergency py-2.5 px-3 rounded-lg flex-row items-center justify-center"
                        activeOpacity={0.8}
                      >
                        <Text className="text-white text-xs font-bold">
                          🚨 {t('ai:viewEmergencyMap')}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '/map', params: { emergency: 'true' } })}
                        className="w-full bg-white border border-red-400 py-2 px-3 rounded-lg flex-row items-center justify-center"
                        activeOpacity={0.8}
                      >
                        <Text className="text-red-700 text-xs font-bold">
                          🗺️ {isBangla ? 'জরুরি ক্লিনিক ম্যাপ' : 'Emergency Map'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* AI-5: Specialist & Clinic Handoff Card */}
                  {item.handoff_flag && !item.emergency_flag && (
                    item.handoff_data ? (
                      renderHandoffCard(item.handoff_data)
                    ) : (
                      renderHandoffCard({
                        reason: 'user_requested',
                        clinics: [
                          {
                            locationId: 'loc-dhanmondi-pet-clinic',
                            nameBn: 'ধানমন্ডি পেট কেয়ার অ্যান্ড ক্লিনিক',
                            nameEn: 'Dhanmondi Pet Care & Clinic',
                            addressBn: 'সাত মসজিদ রোড, ধানমন্ডি, ঢাকা',
                            addressEn: 'Sat Masjid Road, Dhanmondi, Dhaka',
                            phone: '+8801799887766',
                            distanceKm: '1.1 km',
                            isOpen: true,
                          },
                          {
                            locationId: 'loc-gulshan-vet',
                            nameBn: 'গুলশান অ্যানিমেল হেলথ কেয়ার',
                            nameEn: 'Gulshan Animal Health Care',
                            addressBn: 'রোড ১১, বনানী/গুলশান, ঢাকা',
                            addressEn: 'Road 11, Banani/Gulshan, Dhaka',
                            phone: '+8801733445566',
                            distanceKm: '3.8 km',
                            isOpen: true,
                          },
                        ],
                        support_phone: '+880 9612-772667',
                        support_label_bn: 'প্রাণোরা ভেটেরিনারি হেল্পলাইন',
                        support_label_en: 'Pranora Veterinary Helpline',
                      })
                    )
                  )}
                </View>

                {isUser && (
                  <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center ml-2 self-start mt-1">
                    <Text className="text-sm">👤</Text>
                  </View>
                )}
              </View>
            );
          }}
          ListFooterComponent={
            isTyping ? (
              <View className="flex-row items-center ml-2 mb-2">
                <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-2">
                  <Text className="text-sm">🤖</Text>
                </View>
                <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 rounded-tl-none flex-row items-center">
                  <ActivityIndicator size="small" color="#16a34a" />
                  <Text className="text-xs text-gray-500 ml-2">
                    {t('ai:thinking')}
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick Question Chips */}
        <View className="bg-white border-t border-gray-200 px-3 pt-2 pb-1">
          <Text className="text-xs font-semibold text-gray-500 mb-1">
            💡 {t('ai:quickPrompts')}:
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={quickPrompts}
            keyExtractor={(_, index) => `prompt-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSendMessage(item.query)}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded-full mr-2 mb-1"
                activeOpacity={0.7}
              >
                <Text className="text-xs text-gray-700 font-medium">
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Bottom Input Area with Push-to-Talk Mic (≥ 56px) (§8.11, AI-6) */}
        <View className="bg-white border-t border-gray-200 px-3 py-2">
          {isRecording ? (
            <View className="flex-row items-center justify-between bg-red-50 border border-red-300 rounded-2xl px-4 py-2">
              <View className="flex-row items-center gap-2 flex-1">
                <View className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                <View className="flex-1">
                  <Text className="text-xs font-bold text-red-800">
                    {t('ai:voiceRecording')}
                  </Text>
                  <Text className="text-[11px] text-red-600 font-mono">
                    00:0{recordingSeconds} • {t('ai:voiceReleaseToSend')}
                  </Text>
                </View>
              </View>

              {/* Hold-to-Talk Mic Button ≥ 56 px */}
              <TouchableOpacity
                onPressIn={handleStartRecording}
                onPressOut={handleStopRecording}
                className="w-14 h-14 rounded-full bg-red-600 items-center justify-center shadow-lg border-2 border-red-400"
                activeOpacity={0.9}
              >
                <Text className="text-2xl">🎙️</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <TextInput
                value={inputContent}
                onChangeText={setInputContent}
                placeholder={t('ai:placeholder')}
                placeholderTextColor="#9ca3af"
                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 max-h-24"
                multiline
                onSubmitEditing={() => handleSendMessage()}
              />

              {inputContent.trim().length > 0 ? (
                <TouchableOpacity
                  onPress={() => handleSendMessage()}
                  disabled={isTyping}
                  className="w-12 h-12 rounded-xl bg-primary items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-base font-bold">➤</Text>
                </TouchableOpacity>
              ) : null}

              {/* Hold-to-Talk Push-to-Speak Mic Button (≥ 56px) */}
              <TouchableOpacity
                onPressIn={handleStartRecording}
                onPressOut={handleStopRecording}
                onPress={() => {
                  // Fallback for short tap
                  const voiceSample = getRandomVoiceSample(locale === 'en' ? 'en' : 'bn');
                  handleSendMessage(voiceSample, true);
                }}
                className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary items-center justify-center"
                activeOpacity={0.8}
                accessibilityLabel={t('ai:voiceHoldToSpeak')}
              >
                <Text className="text-2xl">🎙️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
