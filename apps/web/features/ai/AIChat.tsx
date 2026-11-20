'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import type { PetRow, AIMessageRow, AIConversationRow, EmergencyClinicPreview, ProposedBookingData } from '@pranora/api';
import { generateAssistantReply, buildPetContextInfo } from '@pranora/api';
import { PetPicker } from '../pets/PetPicker';

export interface AIChatProps {
  pets?: PetRow[];
  selectedPet?: PetRow | null;
  onSelectPet?: (pet: PetRow) => void;
  conversation?: AIConversationRow | null;
  initialMessages?: AIMessageRow[];
}

export function AIChat({
  pets = [],
  selectedPet: initialSelectedPet = null,
  onSelectPet: propOnSelectPet,
  initialMessages = [],
}: AIChatProps) {
  const { t, locale, isBangla } = useLocale();
  const params = useParams();
  const localeParam = (params?.locale as string) ?? 'bn';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

    // Generate AI response with guardrail checks, consent-based pet context & booking logic
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
    }, 600);
  };

  const quickPrompts = [
    { label: t('ai:bookingHelp'), query: isBangla ? 'একজন পশু চিকিৎসকের অ্যাপয়েন্টমেন্ট বুক করতে সাহায্য করুন' : 'Help me book an appointment with a vet' },
    { label: t('ai:promptFood'), query: isBangla ? 'আমার পোষা প্রাণীর জন্য কোন খাবার নিরাপদ ও পুষ্টিকর?' : 'What food is safe and healthy for my pet?' },
    { label: t('ai:promptVaccine'), query: isBangla ? 'পোষা প্রাণীর প্রাথমিক ভ্যাকসিন রুটিন কেমন হয়?' : 'What is the standard vaccination schedule for pets?' },
    { label: t('ai:promptGrooming'), query: isBangla ? 'কত দিন পর পর লোম ব্রাশ ও গোসল করানো উচিত?' : 'How often should I groom and bathe my pet?' },
    { label: t('ai:promptEmergencyTest'), query: isBangla ? 'আমার পোষা প্রাণীর রক্তপাত হচ্ছে ও বিষাক্ত কিছু খেয়েছে' : 'My pet is bleeding and ate something toxic' },
  ];

  const renderEmergencyClinicCards = (clinics: EmergencyClinicPreview[]) => (
    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800/60">
      <h4 className="text-red-800 dark:text-red-300 font-bold text-xs mb-2 flex items-center gap-1">
        <span>🏥</span> {t('ai:emergencyNearbyTitle')}
      </h4>
      <div className="space-y-2">
        {clinics.map((clinic) => (
          <div
            key={clinic.locationId}
            className="bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-800/50 rounded-xl p-3 shadow-sm"
          >
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
              {isBangla ? clinic.nameBn : clinic.nameEn}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
              {isBangla ? clinic.addressBn : clinic.addressEn}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">
              📍 {clinic.distanceKm} {clinic.is24h ? (isBangla ? '• ২৪/৭ খোলা' : '• Open 24/7') : ''}
            </p>

            <div className="flex gap-2 mt-2">
              {clinic.phone && (
                <a
                  href={`tel:${clinic.phone}`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
                >
                  📞 {t('ai:emergencyCallNow')}
                </a>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white dark:bg-zinc-700 border border-red-400 text-red-700 dark:text-red-300 text-xs font-bold rounded-lg hover:bg-red-50 dark:hover:bg-zinc-600 transition"
              >
                🗺️ {t('ai:emergencyDirections')}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProposedBookingCard = (booking: ProposedBookingData) => {
    if (booking.status === 'confirmed') {
      return (
        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800/60 bg-green-50 dark:bg-green-950/20 rounded-xl p-3 border border-green-300 dark:border-green-800 shadow-sm">
          <p className="text-green-800 dark:text-green-300 font-bold text-xs mb-1">
            ✅ {isBangla ? 'বুকিং নিশ্চিত হয়েছে' : 'Booking Confirmed'}
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {booking.clinic_name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {booking.service_name} • {booking.suggested_date} ({booking.suggested_time})
          </p>
          <div className="bg-white dark:bg-zinc-800 border border-green-300 dark:border-green-700/60 rounded-lg p-2.5 mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              {isBangla ? 'বুকিং কোড:' : 'Booking Code:'}
            </span>
            <span className="text-sm font-black text-green-700 dark:text-green-400">
              {booking.booking_code}
            </span>
          </div>
        </div>
      );
    }

    if (booking.status === 'declined') {
      return (
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-zinc-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            ❌ {t('ai:bookingDeclined')}
          </p>
        </div>
      );
    }

    return (
      <div className="mt-3 pt-3 border-t border-primary/30 bg-green-50/70 dark:bg-green-950/20 rounded-xl p-3.5 border border-green-200 dark:border-green-800/40">
        <p className="text-primary font-bold text-xs mb-2 flex items-center gap-1">
          <span>📅</span> {t('ai:bookingProposedTitle')}
        </p>

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-stroke-subtle mb-3 space-y-1 text-xs">
          <p className="text-content-secondary">
            <span className="font-semibold text-content-primary">{t('ai:bookingClinic')}: </span>
            {booking.clinic_name}
          </p>
          <p className="text-content-secondary">
            <span className="font-semibold text-content-primary">{t('ai:bookingService')}: </span>
            {booking.service_name}
          </p>
          <p className="text-content-secondary">
            <span className="font-semibold text-content-primary">{t('ai:bookingDate')}: </span>
            {booking.suggested_date} ({booking.suggested_time})
          </p>
          {booking.price != null && (
            <p className="text-content-secondary">
              <span className="font-semibold text-content-primary">{t('ai:bookingFee')}: </span>
              ৳ {booking.price}
            </p>
          )}
        </div>

        <p className="text-xs font-semibold text-content-primary mb-2.5">
          {t('ai:bookingConfirm')}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSendMessage(isBangla ? 'হ্যাঁ, বুক করুন' : 'Yes, Confirm')}
            className="flex-1 px-4 py-2 bg-primary hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            {t('ai:bookingConfirmBtn')}
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage(isBangla ? 'না, বাতিল' : 'No, Cancel')}
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-stroke-subtle text-content-secondary hover:text-content-primary font-semibold text-xs rounded-xl transition"
          >
            {t('ai:bookingDeclineBtn')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[82vh] bg-app-card border border-stroke-subtle rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-stroke-subtle px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary flex items-center gap-2">
            <span>🤖</span> {t('ai:pageTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
            {t('ai:disclaimer')}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
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
        >
          🔄 {isBangla ? 'নতুন চ্যাট' : 'New Chat'}
        </Button>
      </div>

      {/* AI-3: Pet Context Selector & Explicit Consent Toggle */}
      <div className="bg-green-50/70 dark:bg-green-950/20 border-b border-green-200 dark:border-green-800/40 px-6 py-3">
        {pets.length > 0 && (
          <PetPicker
            pets={pets}
            selectedPetId={selectedPet?.id ?? null}
            onSelectPet={handleSelectPet}
            label={isBangla ? 'যে পোষা প্রাণী সম্পর্কে পরামর্শ চান:' : 'Select pet context:'}
            className="mb-2"
          />
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-green-200/60 dark:border-green-800/40">
          <div>
            <div className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-1.5">
              <span>{sharePetContext ? '🔒' : '🛡️'}</span>
              <span>{sharePetContext ? t('ai:petContextActive') : t('ai:petContextDisabled')}</span>
            </div>
            <p className="text-xs text-content-secondary mt-0.5">
              {sharePetContext
                ? selectedPet
                  ? `${selectedPet.name} • ${selectedPet.species}${selectedPet.allergies ? ` (${isBangla ? 'অ্যালার্জি' : 'Allergies'}: ${selectedPet.allergies})` : ''}`
                  : t('ai:selectPetPrompt')
                : isBangla
                ? 'পোষা প্রাণীর কোনো ব্যক্তিগত তথ্য এআই এর সাথে শেয়ার করা হচ্ছে না।'
                : 'No personal pet profile data is shared with the AI.'}
            </p>
          </div>

          <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-content-primary cursor-pointer select-none self-start sm:self-center">
            <input
              type="checkbox"
              checked={sharePetContext}
              onChange={(e) => setSharePetContext(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
            />
            <span className="font-semibold text-xs text-primary">{t('ai:petContextConsent')}</span>
          </label>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-app-bg">
        {messages.map((item) => {
          const isUser = item.role === 'user';

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-sm">🤖</span>
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-primary text-white rounded-tr-none'
                    : item.emergency_flag
                    ? 'bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-tl-none text-red-900 dark:text-red-200'
                    : 'bg-white dark:bg-zinc-800 border border-stroke-subtle rounded-tl-none text-content-primary'
                }`}
              >
                {/* Emergency Header */}
                {item.emergency_flag && (
                  <div className="mb-2 pb-2 border-b border-red-200 dark:border-red-800/60 font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5 text-sm">
                    <span>🚨</span>
                    <span>{t('ai:emergencyBannerTitle')}</span>
                  </div>
                )}

                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </div>

                {/* AI-2: Emergency First-Aid Tips */}
                {item.emergency_flag && (
                  <div className="mt-3 pt-2 border-t border-red-200 dark:border-red-800/60 bg-red-100/60 dark:bg-red-950/20 rounded-lg p-3">
                    <p className="text-red-800 dark:text-red-300 font-bold text-xs mb-1 flex items-center gap-1">
                      <span>📋</span> {t('ai:emergencyFirstAidTitle')}
                    </p>
                    <p className="text-red-900 dark:text-red-200 text-xs leading-4 mb-1">
                      • {t('ai:emergencyFirstAid1')}
                    </p>
                    <p className="text-red-900 dark:text-red-200 text-xs leading-4">
                      • {t('ai:emergencyFirstAid2')}
                    </p>
                  </div>
                )}

                {/* AI-2: Nearby Emergency Clinic Cards */}
                {item.emergency_flag && item.emergency_clinics && item.emergency_clinics.length > 0 && (
                  renderEmergencyClinicCards(item.emergency_clinics)
                )}

                {/* AI-4: Proposed Booking Card */}
                {item.proposed_booking && renderProposedBookingCard(item.proposed_booking)}

                {/* Emergency Action Buttons */}
                {item.emergency_flag && (
                  <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800/60 flex flex-wrap gap-2">
                    <Link
                      href={`/${localeParam}/emergency`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-emergency hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition"
                    >
                      🚨 {t('ai:viewEmergencyMap')}
                    </Link>
                    <Link
                      href={`/${localeParam}/map?emergency=true`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-zinc-800 border border-red-400 text-red-700 dark:text-red-300 font-bold text-xs sm:text-sm rounded-xl hover:bg-red-50 transition"
                    >
                      🗺️ {isBangla ? 'জরুরি ক্লিনিক ম্যাপ' : 'Emergency Map'}
                    </Link>
                  </div>
                )}

                {/* Specialist Handoff */}
                {item.handoff_flag && !item.emergency_flag && (
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-700">
                    <Link
                      href={`/${localeParam}/clinics`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>🩺 {t('ai:handoff')}</span>
                    </Link>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-sm">👤</span>
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-content-secondary text-sm">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div className="bg-white dark:bg-zinc-800 border border-stroke-subtle rounded-2xl px-4 py-2.5 rounded-tl-none flex items-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-xs text-content-secondary">{t('ai:thinking')}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="bg-white dark:bg-zinc-900 border-t border-stroke-subtle px-4 sm:px-6 py-2.5">
        <div className="text-xs font-semibold text-content-secondary mb-2 flex items-center gap-1">
          <span>💡</span> {t('ai:quickPrompts')}:
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSendMessage(item.query)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-content-primary transition border border-stroke-subtle"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="bg-white dark:bg-zinc-900 border-t border-stroke-subtle p-4 sm:px-6 flex items-center gap-3">
        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={t('ai:placeholder')}
          className="flex-1 bg-app-bg border border-stroke-subtle rounded-2xl px-4 py-3 text-sm text-content-primary placeholder:text-content-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <Button
          onClick={() => handleSendMessage()}
          disabled={!inputContent.trim() || isTyping}
        >
          {t('ai:send')}
        </Button>
      </div>
    </div>
  );
}
