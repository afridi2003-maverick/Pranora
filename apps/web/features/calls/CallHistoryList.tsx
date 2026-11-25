'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
import {
  getCallHistory,
  createSupabaseClient,
  type CallHistoryItem,
  type CallType,
} from '@pranora/api';

function formatDuration(seconds?: number): string {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function CallHistoryList() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [filterType, setFilterType] = useState<'all' | CallType>('all');
  const [items, setItems] = useState<CallHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
    );
    getCallHistory(supabase, {
      call_type: filterType === 'all' ? undefined : filterType,
      limit: 20,
      offset: 0,
    })
      .then((res) => {
        if (active) setItems(res);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filterType]);

  const statusChipType = (status: CallHistoryItem['status']) => {
    if (status === 'ended') return 'completed';
    if (status === 'missed' || status === 'declined') return 'emergency';
    if (status === 'active') return 'confirmed';
    return 'pending';
  };

  const statusText = (status: CallHistoryItem['status']) => {
    switch (status) {
      case 'ended':
        return isBangla ? 'সম্পন্ন' : 'Completed';
      case 'missed':
        return isBangla ? 'মিসড' : 'Missed';
      case 'declined':
        return isBangla ? 'প্রত্যাখ্যাত' : 'Declined';
      case 'active':
        return isBangla ? 'সক্রিয়' : 'Active';
      default:
        return isBangla ? 'অপেক্ষামান' : 'Pending';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isBangla ? 'কল ইতিহাস' : 'Call History'}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {isBangla ? 'আপনার গত পরামর্শসমূহ' : 'Your past consultations'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filterType === 'all' ? 'primary' : 'ghost'}
            onClick={() => setFilterType('all')}
          >
            {isBangla ? 'সব' : 'All'}
          </Button>
          <Button
            variant={filterType === 'audio' ? 'primary' : 'ghost'}
            onClick={() => setFilterType('audio')}
          >
            {isBangla ? 'অডিও' : 'Audio'}
          </Button>
          <Button
            variant={filterType === 'video' ? 'primary' : 'ghost'}
            onClick={() => setFilterType('video')}
          >
            {isBangla ? 'ভিডিও' : 'Video'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-6 text-center text-sm text-neutral-500">
          {isBangla ? 'লোড হচ্ছে...' : 'Loading call history...'}
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center space-y-2">
          <p className="text-base font-medium text-foreground">
            {isBangla ? 'এখনো কোনো কল ইতিহাস নেই' : 'No call history yet'}
          </p>
          <p className="text-sm text-neutral-500">
            {isBangla
              ? 'পশু চিকিৎসকদের সাথে আপনার অডিও ও ভিডিও পরামর্শ এখানে দেখাবে।'
              : 'Your audio and video consultations with vets will appear here.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const targetHref =
              item.callType === 'video'
                ? `/${locale}/calls/video`
                : `/${locale}/calls/audio`;

            return (
              <Card
                key={item.id}
                className="p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xl">
                    {item.callType === 'video' ? '📹' : '📞'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {item.otherParticipantName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.callType === 'video'
                        ? isBangla
                          ? 'ভিডিও কল'
                          : 'Video Call'
                        : isBangla
                          ? 'অডিও কল'
                          : 'Audio Call'}{' '}
                      • {new Date(item.createdAt).toLocaleDateString()}
                      {item.durationSeconds
                        ? ` • ${formatDuration(item.durationSeconds)}`
                        : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Chip
                    variant="status"
                    statusType={statusChipType(item.status)}
                    label={statusText(item.status)}
                  />
                  <Link href={targetHref}>
                    <Button variant="secondary">
                      {isBangla ? 'আবার কল করুন' : 'Call Again'}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
