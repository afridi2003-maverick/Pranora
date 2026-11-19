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
import type { PetRow, AIMessageRow, AIConversationRow, EmergencyClinicPreview, ProposedBookingData } from '@pranora/api';
import { generateAssistantReply, buildPetContextInfo } from '@pranora/api';
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
        created_at: new Date().toISOString(),
      },
    ];
  });

  const [inputContent, setInputContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSelectPet = (pet: PetRow) => {
    setSelectedPet(pet);
    if (propOnSelectPet) propOnSelectPet(pet);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputContent).trim();
    if (!text || isTyping) return;

    const userMessage: AIMessageRow = {
      id: `user-${Date.now()}`,
      conversation_id: 'conv-active',
      role: 'user',
      content: text,
      is_voice: false,
      emergency_flag: false,
      handoff_flag: false,
      emergency_clinics: null,
      proposed_booking: null,
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
        is_voice: false,
        emergency_flag: reply.emergency_flag,
        handoff_flag: reply.handoff_flag,
        emergency_clinics: reply.emergency_clinics ?? null,
        proposed_booking: reply.proposed_booking ?? null,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }, 600);
  };

  const quickPrompts = [
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
                  created_at: new Date().toISOString(),
                },
              ]);
            }}
            className="px-3 py-1.5 bg-gray-100 rounded-lg"
          >
            <Text className="text-xs font-semibold text-gray-600">
              🔄 {isBangla ? 'নতুন চ্যাট' : 'New Chat'}
            </Text>
          </TouchableOpacity>
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

                  {/* Specialist Handoff Chip */}
                  {item.handoff_flag && !item.emergency_flag && (
                    <View className="mt-2 pt-2 border-t border-gray-100">
                      <TouchableOpacity
                        onPress={() => router.push('/clinics' as never)}
                        className="bg-green-100 px-3 py-1.5 rounded-lg flex-row items-center justify-center"
                      >
                        <Text className="text-green-800 text-xs font-semibold">
                          🩺 {t('ai:handoff')}
                        </Text>
                      </TouchableOpacity>
                    </View>
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

        {/* Bottom Input Area */}
        <View className="bg-white border-t border-gray-200 px-3 py-2 flex-row items-center">
          <TextInput
            value={inputContent}
            onChangeText={setInputContent}
            placeholder={t('ai:placeholder')}
            placeholderTextColor="#9ca3af"
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 mr-2 max-h-24"
            multiline
            onSubmitEditing={() => handleSendMessage()}
          />
          <TouchableOpacity
            onPress={() => handleSendMessage()}
            disabled={!inputContent.trim() || isTyping}
            className={`px-4 py-2.5 rounded-xl items-center justify-center ${
              !inputContent.trim() || isTyping ? 'bg-gray-300' : 'bg-primary'
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-bold">
              {t('ai:send')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
