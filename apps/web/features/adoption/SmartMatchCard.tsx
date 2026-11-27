'use client';

import React from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { AdoptionMatch } from '@pranora/validation';
import { DISTRICT_MAP } from './mockData';
import { formatAge } from './AdoptionCard';

interface SmartMatchCardProps {
  match: AdoptionMatch;
  onSelect: (match: AdoptionMatch) => void;
}

export function SmartMatchCard({ match, onSelect }: SmartMatchCardProps) {
  const { isBangla } = useLocale();

  const title = isBangla
    ? match.title_bn || match.title_en || 'প্রাণী'
    : match.title_en || match.title_bn || 'Animal';

  const district = DISTRICT_MAP[match.district_id]
    ? isBangla
      ? DISTRICT_MAP[match.district_id]?.bn
      : DISTRICT_MAP[match.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = match.photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600';

  const scoreColor =
    match.score >= 85
      ? 'bg-emerald-600 text-white'
      : match.score >= 70
      ? 'bg-amber-600 text-white'
      : 'bg-blue-600 text-white';

  return (
    <Card className="overflow-hidden flex flex-col h-full bg-white dark:bg-neutral-900 border-stroke-subtle hover:shadow-md transition-shadow group">
      {/* Photo Container */}
      <div className="relative aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <img
          src={photo}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Match Score Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-md ${scoreColor}`}>
            🎯 {isBangla ? `${match.score}% মিল` : `${match.score}% Match`}
          </span>
        </div>

        {/* Species & Gender Badge */}
        <div className="absolute bottom-3 left-3 flex gap-1">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
            {match.species === 'dog' ? (isBangla ? '🐶 কুকুর' : '🐶 Dog') : (isBangla ? '🐱 বিড়াল' : '🐱 Cat')}
          </span>
          <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
            {match.gender === 'male' ? (isBangla ? 'পুরুষ' : 'Male') : (isBangla ? 'স্ত্রী' : 'Female')}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-foreground line-clamp-1 mb-1" title={title}>
            {title}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span>📍 {district}</span>
            <span>•</span>
            <span>🎂 {formatAge(match.age_months, isBangla)}</span>
          </p>

          {/* Health tags */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {match.is_vaccinated && (
              <span className="text-[11px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded font-medium">
                💉 {isBangla ? 'ভ্যাকসিনেটেড' : 'Vaccinated'}
              </span>
            )}
            {match.is_neutered && (
              <span className="text-[11px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded font-medium">
                ✂️ {isBangla ? 'নিউটার্ড' : 'Neutered'}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2 border-t border-border/40">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => onSelect(match)}
          >
            {isBangla ? 'বিস্তারিত ও দত্তক আবেদন' : 'View & Adopt'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
