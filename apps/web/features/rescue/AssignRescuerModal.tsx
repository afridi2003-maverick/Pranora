'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button, Input } from '@pranora/ui';
import {
  MOCK_VERIFIED_RESCUERS,
  type RescuerProfileBrief,
} from './assignmentMockData';

interface AssignRescuerModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  reportSpecies?: string;
  reportArea?: string;
  lat?: number;
  lng?: number;
  onAssign: (caseId: string, rescuerId: string) => Promise<{ success: boolean; error?: string }>;
  onFindNearby?: (params: { lat: number; lng: number; radius_m?: number }) => Promise<RescuerProfileBrief[]>;
  rescuers?: RescuerProfileBrief[];
}

export function AssignRescuerModal({
  isOpen,
  onClose,
  caseId,
  reportSpecies,
  reportArea,
  lat,
  lng,
  onAssign,
  onFindNearby,
  rescuers = MOCK_VERIFIED_RESCUERS,
}: AssignRescuerModalProps) {
  const { isBangla } = useLocale();
  const [search, setSearch] = useState('');
  const [radiusFilterKm, setRadiusFilterKm] = useState<number | 'all'>('all');
  const [activeList, setActiveList] = useState<RescuerProfileBrief[]>(rescuers);
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (lat != null && lng != null && onFindNearby) {
      const radiusM = radiusFilterKm === 'all' ? undefined : radiusFilterKm * 1000;
      onFindNearby({ lat, lng, radius_m: radiusM })
        .then((items) => {
          if (active && items.length > 0) setActiveList(items);
        })
        .catch(() => {});
    } else {
      setActiveList(rescuers);
    }
    return () => {
      active = false;
    };
  }, [lat, lng, onFindNearby, radiusFilterKm, rescuers]);

  const filteredRescuers = activeList
    .filter((r) => {
      if (radiusFilterKm !== 'all' && r.distance_meters != null) {
        if (r.distance_meters > radiusFilterKm * 1000) return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.name_bn.includes(q) ||
        r.district_name_en.toLowerCase().includes(q) ||
        r.district_name_bn.includes(q)
      );
    })
    .sort((a, b) => {
      if (a.distance_meters != null && b.distance_meters != null) {
        return a.distance_meters - b.distance_meters;
      }
      return 0;
    });

  const handleAssignClick = async (rescuerId: string) => {
    setIsSubmittingId(rescuerId);
    setError(null);
    try {
      const res = await onAssign(caseId, rescuerId);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign rescuer';
      setError(msg);
    } finally {
      setIsSubmittingId(null);
    }
  };

  const RADIUS_PILLS: (number | 'all')[] = ['all', 5, 10, 25];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBangla ? 'নিকটস্থ উদ্ধারকারী নিয়োগ করুন (RSC-9)' : 'Assign Nearby Rescuer (RSC-9)'}
    >
      <div className="space-y-4 max-w-lg">
        {/* Case Context Header */}
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-stroke-subtle text-xs space-y-1">
          <p className="font-semibold text-foreground">
            {isBangla ? 'কেস আইডি: ' : 'Case ID: '}
            <span className="font-mono">{caseId}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {reportSpecies && (
              <p className="text-neutral-600 dark:text-neutral-400">
                {isBangla ? 'প্রাণী: ' : 'Animal: '}
                <span className="font-semibold capitalize text-foreground">{reportSpecies}</span>
              </p>
            )}
            {reportArea && (
              <p className="text-neutral-600 dark:text-neutral-400">
                📍 {reportArea}
              </p>
            )}
            {lat != null && lng != null && (
              <span className="text-[11px] text-green-700 dark:text-green-400 font-medium">
                🎯 {isBangla ? 'জিপিএস সক্রিয়' : 'GPS Active'}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Spatial Distance Filter Bar */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">
            {isBangla ? 'দূরত্ব ফিল্টার:' : 'Radius filter:'}
          </span>
          <div className="flex gap-1">
            {RADIUS_PILLS.map((p) => (
              <button
                key={String(p)}
                type="button"
                onClick={() => setRadiusFilterKm(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  radiusFilterKm === p
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                }`}
              >
                {p === 'all'
                  ? isBangla ? 'সকল' : 'All'
                  : `${p} ${isBangla ? 'কিমি' : 'km'}`}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder={
            isBangla
              ? 'উদ্ধারকারীর নাম বা এলাকা দিয়ে খুঁজুন...'
              : 'Search rescuer by name or coverage district...'
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Rescuers List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredRescuers.map((rescuer) => {
            const isBusy = rescuer.active_cases_count >= 2 || !rescuer.is_available;
            const isThisSubmitting = isSubmittingId === rescuer.id;
            const coversSpecies =
              reportSpecies &&
              rescuer.species?.some((s) => reportSpecies.toLowerCase().includes(s.toLowerCase()));

            return (
              <div
                key={rescuer.id}
                className="p-3 rounded-xl border border-stroke-subtle bg-white dark:bg-neutral-900 flex items-center justify-between gap-3 hover:border-primary transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-foreground">
                      {isBangla ? rescuer.name_bn : rescuer.name}
                    </span>
                    <span className="text-primary text-xs" title="Verified Rescuer">
                      ☑️
                    </span>

                    {rescuer.distance_meters != null && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        🚗 {(rescuer.distance_meters / 1000).toFixed(1)} {isBangla ? 'কিমি দূরে' : 'km away'}
                      </span>
                    )}

                    {rescuer.radius_km != null && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        🎯 {rescuer.radius_km} {isBangla ? 'কিমি কভারেজ' : 'km range'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500">
                    📍 {isBangla ? rescuer.district_name_bn : rescuer.district_name_en}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        rescuer.active_cases_count === 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {isBangla
                        ? `${rescuer.active_cases_count}টি সক্রিয় কেস`
                        : `${rescuer.active_cases_count} active cases`}
                    </span>

                    {!rescuer.is_available && (
                      <span className="text-[11px] text-neutral-400 italic">
                        {isBangla ? '(অনুপলব্ধ)' : '(Unavailable)'}
                      </span>
                    )}

                    {coversSpecies && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 font-medium">
                        ⭐ {isBangla ? 'উপযুক্ত প্রজাতি' : 'Species match'}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={isThisSubmitting || Boolean(isSubmittingId)}
                  onClick={() => handleAssignClick(rescuer.id)}
                >
                  {isThisSubmitting
                    ? isBangla ? 'নিয়োগ হচ্ছে...' : 'Assigning...'
                    : isBusy
                    ? isBangla ? 'তবুও নিয়োগ' : 'Assign Anyway'
                    : isBangla ? 'নিয়োগ দিন' : 'Assign'}
                </Button>
              </div>
            );
          })}

          {filteredRescuers.length === 0 && (
            <p className="text-xs text-neutral-500 text-center py-4">
              {isBangla
                ? 'কোনো উদ্ধারকারী খুঁজে পাওয়া যায়নি।'
                : 'No verified rescuers found matching query or distance.'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stroke-subtle flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

