'use client';

import React, { useState } from 'react';
import { useLocale, formatDate } from '@pranora/i18n';
import { Card, Button, Chip } from '@pranora/ui';
import type { PetRow, VaccinationRow } from '@pranora/api';
import { PetPicker } from '../pets';
import { RecordVaccineModal } from './RecordVaccineModal';

export interface VaccineListProps {
  pets: PetRow[];
  selectedPet: PetRow | null;
  onSelectPet: (pet: PetRow) => void;
  vaccinations: VaccinationRow[];
  onAutoGenerate: (petId: string, species: string) => Promise<{ count: number; error?: string }>;
  onRecordDose: (payload: { id: string; given_date: string; batch_no?: string }) => Promise<{ error?: string }>;
  loading?: boolean;
}

export function VaccineList({
  pets,
  selectedPet,
  onSelectPet,
  vaccinations,
  onAutoGenerate,
  onRecordDose,
  loading = false,
}: VaccineListProps) {
  const { t, locale } = useLocale();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [recordingVaccine, setRecordingVaccine] = useState<VaccinationRow | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0] ?? '';

  const filteredVaccines = vaccinations.filter((v) => {
    if (filter === 'upcoming') return !v.given_date;
    if (filter === 'completed') return !!v.given_date;
    return true;
  });

  const nextDue = vaccinations
    .filter((v) => !v.given_date && v.due_date)
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))[0];

  const handleTriggerAutoGenerate = async () => {
    if (!selectedPet) return;
    setIsGenerating(true);
    await onAutoGenerate(selectedPet.id, selectedPet.species);
    setIsGenerating(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header & Pet Selection */}
      <div className="bg-app-card border border-stroke-subtle rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-content-primary mb-3">
          💉 {t('health:vaccines.schedule')}
        </h2>
        <PetPicker
          pets={pets}
          selectedPetId={selectedPet?.id ?? null}
          onSelectPet={onSelectPet}
          placeholder={t('health:vaccines.selectPet')}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-surface-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : !selectedPet ? (
        <Card className="p-12 text-center border-dashed">
          <span className="text-4xl mb-3 block">🐾</span>
          <p className="text-content-secondary text-sm">
            {t('health:vaccines.selectPet')}
          </p>
        </Card>
      ) : (
        <>
          {/* Overview Banner */}
          <Card className="p-6 bg-gradient-to-r from-green-50/70 to-emerald-50/40 border border-green-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-green-800">
                  {t('health:vaccines.nextDue')}
                </span>
                {nextDue ? (
                  <div className="mt-1">
                    <h3 className="text-xl font-bold text-content-primary">
                      {nextDue.name}
                    </h3>
                    <p className="text-sm text-content-secondary mt-0.5">
                      📅 {t('health:vaccines.dueOn', { date: formatDate(nextDue.due_date!) })}
                    </p>
                  </div>
                ) : (
                  <div className="mt-1">
                    <h3 className="text-lg font-bold text-green-900">
                      🎉 {t('health:vaccines.upToDate')}
                    </h3>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleTriggerAutoGenerate}
                isLoading={isGenerating}
              >
                ⚡ {t('health:vaccines.autoGenerate')}
              </Button>
            </div>
          </Card>

          {/* Filters */}
          <div className="flex items-center gap-2 border-b border-stroke-subtle pb-3">
            {(['all', 'upcoming', 'completed'] as const).map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === mode
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-secondary/50 text-content-secondary hover:text-content-primary'
                }`}
              >
                {mode === 'all'
                  ? t('health:vaccines.filterAll')
                  : mode === 'upcoming'
                  ? t('health:vaccines.filterUpcoming')
                  : t('health:vaccines.filterCompleted')}
              </button>
            ))}
          </div>

          {/* Vaccine Grid / List */}
          {filteredVaccines.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <span className="text-3xl block mb-2">📋</span>
              <h4 className="font-bold text-content-primary mb-1">
                {t('health:vaccines.empty')}
              </h4>
              <p className="text-content-secondary text-xs max-w-sm mx-auto mb-4">
                {t('health:vaccines.emptyDesc')}
              </p>
              <Button variant="secondary" size="sm" onClick={handleTriggerAutoGenerate}>
                ⚡ {t('health:vaccines.autoGenerate')}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVaccines.map((item) => {
                const isCompleted = !!item.given_date;
                const isOverdue = !isCompleted && item.due_date && item.due_date < todayStr;

                return (
                  <Card
                    key={item.id}
                    className="p-5 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-base text-content-primary">
                            {item.name}
                          </h4>
                          {item.template && (
                            <span className="text-xs text-content-secondary">
                              {locale === 'bn' ? item.template.name_bn : item.template.name_en}
                            </span>
                          )}
                        </div>

                        {isCompleted ? (
                          <Chip
                            variant="status"
                            statusType="completed"
                            label={`✓ ${t('health:vaccines.status.completed')}`}
                          />
                        ) : isOverdue ? (
                          <Chip
                            variant="status"
                            statusType="emergency"
                            label={`! ${t('health:vaccines.status.overdue')}`}
                          />
                        ) : (
                          <Chip
                            variant="status"
                            statusType="pending"
                            label={`⏳ ${t('health:vaccines.status.pending')}`}
                          />
                        )}
                      </div>

                      <div className="space-y-1 text-xs text-content-secondary border-t border-stroke-subtle pt-2.5 my-2">
                        {item.due_date && (
                          <div className="flex justify-between">
                            <span>{t('health:vaccines.dueDate')}:</span>
                            <span className="font-medium text-content-primary">
                              {formatDate(item.due_date)}
                            </span>
                          </div>
                        )}
                        {item.given_date && (
                          <div className="flex justify-between text-green-700 dark:text-green-400 font-medium">
                            <span>{t('health:vaccines.givenDate')}:</span>
                            <span>{formatDate(item.given_date)}</span>
                          </div>
                        )}
                        {item.batch_no && (
                          <div className="flex justify-between text-content-secondary">
                            <span>{t('health:vaccines.batchNo')}:</span>
                            <span>{item.batch_no}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isCompleted && (
                      <div className="pt-3 border-t border-stroke-subtle flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setRecordingVaccine(item)}
                        >
                          + {t('health:vaccines.markGiven')}
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <RecordVaccineModal
        isOpen={!!recordingVaccine}
        vaccine={recordingVaccine}
        onClose={() => setRecordingVaccine(null)}
        onRecord={onRecordDose}
      />
    </div>
  );
}
