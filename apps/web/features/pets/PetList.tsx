'use client';

import React from 'react';
import { useLocale, formatPetAge } from '@pranora/i18n';
import { Button, Card, EmptyState, Avatar } from '@pranora/ui';
import type { PetRow } from '@pranora/api';

interface PetListProps {
  pets: PetRow[];
  onAddPet: () => void;
  onEditPet: (pet: PetRow) => void;
  onDeletePet: (pet: PetRow) => void;
  loading?: boolean;
}

export function PetList({
  pets,
  onAddPet,
  onEditPet,
  onDeletePet,
  loading = false,
}: PetListProps) {
  const { t, locale } = useLocale();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-surface-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <EmptyState
        icon={<span className="text-2xl">🐾</span>}
        title={t('pets:noPets')}
        description={t('pets:noPetsDesc')}
        actionText={t('pets:add')}
        onAction={onAddPet}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-content-primary">
          {t('pets:myPets')} ({pets.length})
        </h2>
        <Button variant="primary" onClick={onAddPet}>
          + {t('pets:add')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => {
          const breedName = pet.breed
            ? (locale === 'bn' && pet.breed.name_bn ? pet.breed.name_bn : pet.breed.name_en)
            : pet.breed_other ?? t('pets:fields.breedUnknown');

          const ageStr = pet.date_of_birth
            ? `${pet.birth_approx ? (locale === 'bn' ? 'প্রায় ' : 'approx. ') : ''}${formatPetAge(pet.date_of_birth, locale)}`
            : null;

          return (
            <Card key={pet.id} className="p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar
                    src={pet.photo_url || undefined}
                    name={pet.name}
                    size="lg"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-content-primary leading-tight">
                      {pet.name}
                    </h3>
                    <p className="text-sm text-content-secondary">
                      {t(`pets:species.${pet.species}`)}
                      {breedName ? ` • ${breedName}` : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-content-secondary border-t border-border pt-3">
                  {ageStr && (
                    <div className="flex justify-between">
                      <span>{t('pets:age.label')}:</span>
                      <span className="font-medium text-content-primary">{ageStr}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t('pets:fields.gender')}:</span>
                    <span className="font-medium text-content-primary">
                      {t(`pets:gender.${pet.gender}`)}
                    </span>
                  </div>
                  {pet.weight_kg != null && (
                    <div className="flex justify-between">
                      <span>{t('pets:fields.weight')}:</span>
                      <span className="font-medium text-content-primary">{pet.weight_kg} kg</span>
                    </div>
                  )}
                  {pet.color && (
                    <div className="flex justify-between">
                      <span>{t('pets:fields.color')}:</span>
                      <span className="font-medium text-content-primary">{pet.color}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEditPet(pet)}
                >
                  {t('pets:edit')}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDeletePet(pet)}
                >
                  {t('pets:delete')}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
