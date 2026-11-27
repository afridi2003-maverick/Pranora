'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import {
  LostFoundBoard,
  MOCK_LOST_FOUND_ITEMS,
} from '../../../../features/rescue';
import {
  getLostFoundBoard,
  submitLostFoundSighting,
  type LostFoundBoardItem,
} from '@pranora/api';
import { useSession } from '../../../../hooks/useSession';
import { useToast } from '../../../../components/ToastProvider';

export default function LostFoundBoardPage() {
  const { isBangla, locale } = useLocale();
  const { supabase, isConfigured, isAuthenticated } = useSession();
  const { showToast } = useToast();

  const [items, setItems] = useState<LostFoundBoardItem[]>(MOCK_LOST_FOUND_ITEMS);

  useEffect(() => {
    if (!isConfigured) return;
    let active = true;

    getLostFoundBoard(supabase)
      .then((data) => {
        if (active && data && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [supabase, isConfigured]);

  const handleSubmitSighting = async (params: {
    reportId: string;
    message: string;
    locationText?: string;
    contactPhone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (isConfigured && isAuthenticated) {
      try {
        await submitLostFoundSighting(supabase, params);
        showToast({
          type: 'success',
          message: isBangla
            ? 'সন্ধান বার্তা সফলভাবে পাঠানো হয়েছে'
            : 'Sighting reported to pet owner',
        });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to submit sighting',
        };
      }
    }
    await new Promise((r) => setTimeout(r, 400));
    showToast({
      type: 'success',
      message: isBangla ? 'সন্ধান বার্তা জমা হয়েছে' : 'Sighting sent',
    });
    return { success: true };
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-semibold mb-2">
              📢 {isBangla ? 'পাবলিক হারানো ও প্রাপ্ত বোর্ড (RSC-10)' : 'Public Lost & Found Board (RSC-10)'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {isBangla ? 'হারানো ও উদ্ধারকৃত প্রাণীর তালিকা' : 'Lost & Found Pet Board'}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              {isBangla
                ? 'নাগরিকদের সুরক্ষার স্বার্থে সঠিক অবস্থান ১ কিমি গ্রিডে এবং ফোন নম্বর সম্পূর্ণ গোপন রাখা হয়েছে। প্রাণীটিকে দেখলে "আমি দেখেছি" বাটনে চাপুন।'
                : 'For safety, exact GPS coordinates are rounded to a ~1 km grid and phone numbers are hidden. Seen an animal? Tap "I\'ve Seen It" to contact the reporter.'}
            </p>
          </div>

          <Link href={`/${locale}/rescue/report`}>
            <Button variant="primary" className="font-bold flex items-center gap-1.5 shadow-sm">
              <span>➕</span>
              <span>{isBangla ? 'রিপোর্ট জমা দিন' : 'Report Lost/Found'}</span>
            </Button>
          </Link>
        </div>

        {/* Board Component */}
        <LostFoundBoard
          initialItems={items}
          onSubmitSighting={handleSubmitSighting}
        />
      </main>
    </div>
  );
}
