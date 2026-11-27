'use client';

import React from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { LostFoundBoardItem } from '@pranora/api';

interface LostFoundCardProps {
  item: LostFoundBoardItem;
  onOpenSightingModal: (item: LostFoundBoardItem) => void;
}

export function LostFoundCard({ item, onOpenSightingModal }: LostFoundCardProps) {
  const { isBangla } = useLocale();

  const isLost = item.kind === 'lost';
  const photo = item.photos && item.photos.length > 0
    ? item.photos[0]
    : isLost
    ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600'
    : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600';

  const timeString = new Date(item.created_at).toLocaleDateString(
    isBangla ? 'bn-BD' : 'en-US',
    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <Card className="overflow-hidden border border-stroke-subtle hover:border-primary transition-all duration-200 flex flex-col justify-between rounded-2xl bg-white dark:bg-neutral-900 shadow-sm">
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={photo}
            alt={item.description || 'Lost/Found Animal'}
            className="w-full h-full object-cover"
          />

          {/* Badges on top of photo */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${
                isLost
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isLost
                ? isBangla ? '⚠️ হারানো প্রাণী' : '⚠️ Lost Pet'
                : isBangla ? '🐾 পাওয়া গেছে' : '🐾 Found Pet'}
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-black/60 backdrop-blur-sm text-white capitalize">
              {item.species}
            </span>
          </div>

          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono">
            {timeString}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              <span>📍</span>
              <span className="font-semibold text-foreground">
                {item.area_text || (isBangla ? 'নিকটবর্তী এলাকা' : 'Nearby Area')}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500" title="Snapped to ~1 km grid for privacy">
              ~১ কিমি গ্রিড
            </span>
          </div>

          {item.description && (
            <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Privacy Note */}
          <p className="text-[10px] text-neutral-400 italic">
            🔒 {isBangla
              ? 'নিরাপত্তার জন্য ফোন নম্বর ও সঠিক অবস্থান গোপন রাখা হয়েছে।'
              : 'Exact GPS location and phone numbers are hidden for safety.'}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <Button
          variant="secondary"
          size="sm"
          className="w-full flex items-center justify-center gap-1.5 font-bold"
          onClick={() => onOpenSightingModal(item)}
        >
          <span>👁️</span>
          <span>{isBangla ? 'আমি দেখেছি / সন্ধান দিন' : "I've Seen It / Report Sighting"}</span>
        </Button>
      </div>
    </Card>
  );
}
