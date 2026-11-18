'use client';

import React, { useState } from 'react';
import { useLocale, formatPetAge } from '@pranora/i18n';
import { Button, Card, EmptyState, Avatar, Chip } from '@pranora/ui';
import type { PetRow, PetOwnershipHistoryRow, OwnershipReason } from '@pranora/api';
import { OwnershipTransferModal } from './OwnershipTransferModal';

interface PetListProps {
  pets: PetRow[];
  onAddPet: () => void;
  onEditPet: (pet: PetRow) => void;
  onDeletePet: (pet: PetRow) => void;
  onTransferPet?: (payload: {
    pet_id: string;
    to_user_id: string;
    reason: OwnershipReason;
    note?: string;
  }) => Promise<{ error?: string }>;
  onFetchHistory?: (petId: string) => Promise<PetOwnershipHistoryRow[]>;
  loading?: boolean;
}

export function PetList({
  pets,
  onAddPet,
  onEditPet,
  onDeletePet,
  onTransferPet,
  onFetchHistory,
  loading = false,
}: PetListProps) {
  const { t, locale } = useLocale();
  const [transferringPet, setTransferringPet] = useState<PetRow | null>(null);
  const [history, setHistory] = useState<PetOwnershipHistoryRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleOpenTransfer = async (pet: PetRow) => {
    setTransferringPet(pet);
    if (onFetchHistory) {
      setLoadingHistory(true);
      const res = await onFetchHistory(pet.id);
      setHistory(res);
      setLoadingHistory(false);
    }
  };

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
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-content-primary leading-tight">
                        {pet.name}
                      </h3>
                      {pet.rescue_case_id ? (
                        <Chip
                          variant="status"
                          statusType="completed"
                          label={`🛟 ${t('pets:ownership.rescuedBadge')}`}
                          className="text-[11px]"
                        />
                      ) : null}
                    </div>
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
                {onTransferPet && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-primary hover:bg-green-50"
                    onClick={() => handleOpenTransfer(pet)}
                  >
                    🔄 {t('pets:ownership.transferButton')}
                  </Button>
                )}
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

      {onTransferPet && (
        <OwnershipTransferModal
          isOpen={!!transferringPet}
          pet={transferringPet}
          history={history}
          onClose={() => {
            setTransferringPet(null);
            setHistory([]);
          }}
          onTransfer={onTransferPet}
          loadingHistory={loadingHistory}
        />
      )}
    </div>
  );
}
