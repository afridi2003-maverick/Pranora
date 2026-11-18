'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import type { RescueCaseUpdateRow } from '@pranora/api';

interface CaseUpdateTimelineProps {
  updates: (RescueCaseUpdateRow & { author_name?: string; author_role?: string })[];
}

export function CaseUpdateTimeline({ updates }: CaseUpdateTimelineProps) {
  const { isBangla } = useLocale();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (updates.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-stroke-subtle text-xs text-neutral-500 bg-white dark:bg-neutral-900">
        {isBangla
          ? 'এই কেসে এখনো কোনো আপডেট যুক্ত করা হয়নি।'
          : 'No case updates posted yet.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
        <span>⏱️</span> {isBangla ? 'কেস আপডেট টাইমলাইন' : 'Case Updates Timeline'}
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stroke-subtle">
        {updates.map((upd) => (
          <div key={upd.id} className="relative flex items-start gap-3">
            {/* Dot */}
            <div className="absolute -left-6 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-primary/20">
              ✓
            </div>

            {/* Content Card */}
            <div className="flex-1 p-4 rounded-xl border border-stroke-subtle bg-white dark:bg-neutral-900 shadow-sm space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-stroke-subtle">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">
                    {upd.author_name || (isBangla ? 'উদ্ধারকারী দল' : 'Rescue Team')}
                  </span>
                  {upd.author_role && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize">
                      {upd.author_role}
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-neutral-400">
                  {new Date(upd.created_at).toLocaleString(isBangla ? 'bn-BD' : 'en-US')}
                </span>
              </div>

              {upd.status && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-500">
                    {isBangla ? 'অবস্থা পরিবর্তিত হয়েছে: ' : 'Status updated to: '}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800">
                    {upd.status}
                  </span>
                </div>
              )}

              {upd.note && (
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {upd.note}
                </p>
              )}

              {upd.photos && upd.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-1">
                  {upd.photos.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhoto(src)}
                      className="w-16 h-16 rounded-lg overflow-hidden border border-stroke-subtle flex-shrink-0 hover:opacity-90"
                    >
                      <img src={src} alt="Update Photo" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Full Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden bg-black">
            <img src={selectedPhoto} alt="Zoomed view" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
