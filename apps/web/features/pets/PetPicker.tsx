'use client';

import React from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { PetRow } from '@pranora/api';

export interface PetPickerProps {
  pets: PetRow[];
  selectedPetId: string | null;
  onSelectPet: (pet: PetRow) => void;
  label?: string;
  placeholder?: string;
  allowAdd?: boolean;
  onAddPet?: () => void;
  className?: string;
}

export function PetPicker({
  pets,
  selectedPetId,
  onSelectPet,
  label,
  placeholder,
  allowAdd = false,
  onAddPet,
  className = '',
}: PetPickerProps) {
  const { t, locale } = useLocale();

  const getSpeciesEmoji = (species: string) => {
    switch (species) {
      case 'dog': return '🐕';
      case 'cat': return '🐈';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      case 'fish': return '🐟';
      case 'cow': return '🐄';
      case 'goat': return '🐐';
      default: return '🐾';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-content-primary mb-2">
          {label}
        </label>
      )}

      {pets.length === 0 ? (
        <Card className="p-6 border-dashed border-stroke-medium text-center bg-surface-secondary/40">
          <p className="text-content-secondary text-sm mb-3">
            {placeholder || t('pets:noPets')}
          </p>
          {allowAdd && onAddPet && (
            <Button variant="primary" size="sm" onClick={onAddPet}>
              + {t('pets:add')}
            </Button>
          )}
        </Card>
      ) : (
        <div className="flex flex-wrap gap-3">
          {pets.map((pet) => {
            const isSelected = pet.id === selectedPetId;
            const breedName = pet.breed
              ? (locale === 'bn' && pet.breed.name_bn ? pet.breed.name_bn : pet.breed.name_en)
              : pet.breed_other ?? '';

            return (
              <button
                type="button"
                key={pet.id}
                onClick={() => onSelectPet(pet)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-green-50 dark:bg-green-950/40 border-primary ring-2 ring-primary shadow-sm'
                    : 'bg-app-card border-stroke-subtle hover:border-stroke-medium'
                }`}
              >
                <span className="text-2xl select-none">{getSpeciesEmoji(pet.species)}</span>
                <div>
                  <div className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-content-primary'}`}>
                    {pet.name}
                  </div>
                  {breedName ? (
                    <div className="text-xs text-content-secondary">{breedName}</div>
                  ) : null}
                </div>
              </button>
            );
          })}

          {allowAdd && onAddPet && (
            <button
              type="button"
              onClick={onAddPet}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-stroke-medium hover:border-primary text-primary text-sm font-semibold transition-all cursor-pointer bg-surface-secondary/20"
            >
              <span>+</span>
              <span>{t('pets:add')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
