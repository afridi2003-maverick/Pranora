'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import type { PetRow, AIMessageRow, AIConversationRow } from '@pranora/api';
import { generateAssistantReply } from '@pranora/api';
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
      proposed_booking: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputContent('');
    setIsTyping(true);

    // Generate AI response with guardrail checks
    setTimeout(() => {
      const petContext =
        sharePetContext && selectedPet
          ? {
              name: selectedPet.name,
              species: selectedPet.species,
              breed: selectedPet.breed?.name_bn || selectedPet.breed?.name_en || null,
            }
          : null;

      const reply = generateAssistantReply(
        text,
        locale === 'en' ? 'en' : 'bn',
        petContext
      );

      const assistantMessage: AIMessageRow = {
        id: `ai-${Date.now()}`,
        conversation_id: 'conv-active',
        role: 'assistant',
        content: reply.content,
        is_voice: false,
        emergency_flag: reply.emergency_flag,
        handoff_flag: reply.handoff_flag,
        proposed_booking: null,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 600);
  };

  const quickPrompts = [
    { label: t('ai:promptFood'), query: isBangla ? 'আমার পোষা প্রাণীর জন্য কোন খাবার নিরাপদ ও পুষ্টিকর?' : 'What food is safe and healthy for my pet?' },
    { label: t('ai:promptVaccine'), query: isBangla ? 'পোষা প্রাণীর প্রাথমিক ভ্যাকসিন রুটিন কেমন হয়?' : 'What is the standard vaccination schedule for pets?' },
    { label: t('ai:promptGrooming'), query: isBangla ? 'কত দিন পর পর লোম ব্রাশ ও গোসল করানো উচিত?' : 'How often should I groom and bathe my pet?' },
    { label: t('ai:promptEmergencyTest'), query: isBangla ? 'আমার পোষা প্রাণীর রক্তপাত হচ্ছে ও বিষাক্ত কিছু খেয়েছে' : 'My pet is bleeding and ate something toxic' },
  ];

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
                proposed_booking: null,
                created_at: new Date().toISOString(),
              },
            ]);
          }}
        >
          🔄 {isBangla ? 'নতুন চ্যাট' : 'New Chat'}
        </Button>
      </div>

      {/* Pet Context Selector & Consent */}
      <div className="bg-green-50/60 dark:bg-green-950/20 border-b border-green-200 dark:border-green-800/40 px-6 py-3">
        {pets.length > 0 && (
          <PetPicker
            pets={pets}
            selectedPetId={selectedPet?.id ?? null}
            onSelectPet={handleSelectPet}
            label={isBangla ? 'যে পোষা প্রাণী সম্পর্কে পরামর্শ চান:' : 'Select pet context:'}
            className="mb-2"
          />
        )}
        <label className="flex items-center gap-2 text-xs sm:text-sm text-content-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sharePetContext}
            onChange={(e) => setSharePetContext(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
          />
          <span>🔒 {t('ai:petContextBanner')}</span>
        </label>
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

                {/* Emergency Action Buttons */}
                {item.emergency_flag && (
                  <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800/60 flex flex-wrap gap-2">
                    <Link
                      href={`/${locale}/emergency`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-emergency hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition"
                    >
                      🚨 {t('ai:viewEmergencyMap')}
                    </Link>
                    <Link
                      href={`/${locale}/clinics`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-zinc-800 border border-red-400 text-red-700 dark:text-red-300 font-bold text-xs sm:text-sm rounded-xl hover:bg-red-50 transition"
                    >
                      📞 {t('ai:callVet')}
                    </Link>
                  </div>
                )}

                {/* Specialist Handoff */}
                {item.handoff_flag && !item.emergency_flag && (
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-700">
                    <Link
                      href={`/${locale}/clinics`}
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
