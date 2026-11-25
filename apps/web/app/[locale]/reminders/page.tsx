'use client';

/**
 * HLT-2: Reminders Management Screen (Web)
 * Owner: afridi | apps/web/app/[locale]/reminders/page.tsx
 *
 * Shows upcoming pet reminders grouped by pet.
 * Supports: add reminder modal, mark-done, delete, repeat toggle.
 */

import React, { useEffect, useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, EmptyState, Skeleton } from '@pranora/ui';
import {
  createReminder,
  deleteReminder,
  listMyPets,
  listReminders,
  markReminderDone,
  type CreateReminderParams,
  type ReminderItem,
  type ReminderType,
} from '@pranora/api';
import { useSession } from '../../../hooks/useSession';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_PETS = [
  { id: 'pet-1', name: 'Milo', species: 'dog' },
  { id: 'pet-2', name: 'Luna', species: 'cat' },
];

const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    petId: 'pet-1',
    ownerId: 'user-1',
    type: 'vaccine',
    title: 'Rabies booster due',
    remindAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    repeatDays: 365,
    vaccinationId: null,
    isDone: false,
    lastSentAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    petId: 'pet-2',
    ownerId: 'user-1',
    type: 'deworming',
    title: 'Monthly deworming',
    remindAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    repeatDays: 30,
    vaccinationId: null,
    isDone: false,
    lastSentAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    petId: 'pet-1',
    ownerId: 'user-1',
    type: 'checkup',
    title: 'Annual wellness check',
    remindAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    repeatDays: null,
    vaccinationId: null,
    isDone: false,
    lastSentAt: null,
    createdAt: new Date().toISOString(),
  },
];

const REMINDER_TYPES: ReminderType[] = [
  'vaccine', 'deworming', 'flea_tick', 'medicine', 'grooming', 'checkup', 'custom',
];

type ReminderTypeIconMap = Record<ReminderType, string>;
const TYPE_ICONS: ReminderTypeIconMap = {
  vaccine:   '💉',
  deworming: '🐛',
  flea_tick: '🦟',
  medicine:  '💊',
  grooming:  '✂️',
  checkup:   '🩺',
  custom:    '🔔',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRemindAt(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ── Add Reminder Modal ────────────────────────────────────────────────────────

interface AddReminderModalProps {
  pets: Array<{ id: string; name: string; species: string }>;
  onClose: () => void;
  onAdd: (params: CreateReminderParams) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: string;
}

function AddReminderModal({ pets, onClose, onAdd, t }: AddReminderModalProps) {
  const [petId,       setPetId]       = useState(pets[0]?.id ?? 'pet-1');
  const [type,        setType]        = useState<ReminderType>('vaccine');
  const [title,       setTitle]       = useState('');
  const [remindAt,    setRemindAt]    = useState('');
  const [repeat,      setRepeat]      = useState(false);
  const [repeatDays,  setRepeatDays]  = useState('');
  const [error,       setError]       = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError(t('health:reminders.form.title')); return; }
    if (!remindAt)     { setError(t('health:reminders.form.remind_at')); return; }
    onAdd({
      petId,
      type,
      title: title.trim(),
      remindAt: new Date(remindAt).toISOString(),
      repeatDays: repeat && repeatDays ? parseInt(repeatDays, 10) : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-md bg-white p-6 shadow-xl rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-content-primary">
            {t('health:reminders.add_reminder')}
          </h2>
          <button onClick={onClose} className="text-content-secondary hover:text-content-primary text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet selector */}
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              Pet
            </label>
            <select
              value={petId}
              onChange={e => setPetId(e.target.value)}
              className="w-full border border-stroke-subtle rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              {pets.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              {t('health:reminders.form.type')}
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as ReminderType)}
              className="w-full border border-stroke-subtle rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              {REMINDER_TYPES.map(rt => (
                <option key={rt} value={rt}>
                  {TYPE_ICONS[rt]} {t(`health:reminders.types.${rt}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              {t('health:reminders.form.title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('health:reminders.form.title_placeholder')}
              className="w-full border border-stroke-subtle rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              {t('health:reminders.form.remind_at')}
            </label>
            <input
              type="datetime-local"
              value={remindAt}
              onChange={e => setRemindAt(e.target.value)}
              className="w-full border border-stroke-subtle rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {/* Repeat toggle */}
          <div className="flex items-center gap-3">
            <input
              id="repeat-toggle"
              type="checkbox"
              checked={repeat}
              onChange={e => setRepeat(e.target.checked)}
              className="w-4 h-4 accent-primary-600"
            />
            <label htmlFor="repeat-toggle" className="text-sm text-content-primary">
              {t('health:reminders.form.repeat_toggle')}
            </label>
          </div>

          {repeat && (
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {t('health:reminders.form.repeat_days')}
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={repeatDays}
                onChange={e => setRepeatDays(e.target.value)}
                placeholder={t('health:reminders.form.repeat_placeholder')}
                className="w-full border border-stroke-subtle rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {t('health:reminders.add_reminder')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ── Reminder Card ─────────────────────────────────────────────────────────────

interface ReminderCardProps {
  reminder: ReminderItem;
  petName: string;
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  onDone: (id: string) => void;
  onDelete: (id: string) => void;
}

function ReminderCard({ reminder, petName, locale, t, onDone, onDelete }: ReminderCardProps) {
  const days = daysUntil(reminder.remindAt);
  const urgent = days <= 1;

  return (
    <Card className={`p-4 flex items-start gap-4 border ${urgent ? 'border-red-300 bg-red-50' : 'border-stroke-subtle bg-white'} rounded-xl`}>
      <div className="text-2xl mt-0.5">{TYPE_ICONS[reminder.type]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
            {t(`health:reminders.types.${reminder.type}`)}
          </span>
          <span className="text-xs text-content-secondary">{petName}</span>
          {(reminder.type === 'vaccine' || reminder.type === 'checkup') && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>📱</span> {t('health:reminders.sms_badge')}
            </span>
          )}
          {reminder.repeatDays && (
            <span className="text-xs text-content-secondary italic">
              {t('health:reminders.repeat', { days: reminder.repeatDays })}
            </span>
          )}
        </div>
        <p className="mt-1 font-semibold text-content-primary truncate">{reminder.title}</p>
        <p className={`text-xs mt-0.5 ${urgent ? 'text-red-600 font-semibold' : 'text-content-secondary'}`}>
          {formatRemindAt(reminder.remindAt, locale)}
          {days === 0 && ' — Today!'}
          {days === 1 && ' — Tomorrow'}
          {days > 1 && ` — ${days} days`}
        </p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={() => onDone(reminder.id)}
          className="text-xs text-primary-600 hover:text-primary-800 font-medium"
        >
          ✓ {t('health:reminders.mark_done')}
        </button>
        <button
          onClick={() => onDelete(reminder.id)}
          className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          🗑 {t('health:reminders.delete')}
        </button>
      </div>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RemindersPage({
  initialPets,
}: {
  initialPets?: Array<{ id: string; name: string; species: string }>;
} = {}) {
  const { t, locale } = useLocale();
  const { supabase, isAuthenticated, isConfigured, isLoading: sessionLoading } = useSession();
  const useLiveApi = isConfigured && isAuthenticated;

  const [pets, setPets] = useState(initialPets && initialPets.length > 0 ? initialPets : MOCK_PETS);
  const [reminders, setReminders] = useState<ReminderItem[]>(INITIAL_REMINDERS);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  useEffect(() => {
    if (sessionLoading) return;
    let active = true;

    async function loadData() {
      if (!useLiveApi) {
        setPets(initialPets && initialPets.length > 0 ? initialPets : MOCK_PETS);
        setReminders(INITIAL_REMINDERS);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [petsRes, remindersList] = await Promise.all([
          listMyPets(supabase),
          listReminders(supabase),
        ]);
        if (!active) return;

        if (!petsRes.error && petsRes.data.length > 0) {
          setPets(petsRes.data.map((p) => ({ id: p.id, name: p.name, species: p.species })));
        }
        setReminders(remindersList);
      } catch (err) {
        if (active) {
          showToast(err instanceof Error ? err.message : 'Failed to load reminders');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [sessionLoading, useLiveApi, supabase, initialPets]);

  async function handleAdd(params: CreateReminderParams) {
    if (useLiveApi) {
      try {
        const created = await createReminder(supabase, params);
        setReminders((prev) =>
          [...prev, created].sort(
            (a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime()
          )
        );
        setShowModal(false);
        showToast(t('health:reminders.success.created'));
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to create reminder');
      }
      return;
    }

    const newReminder: ReminderItem = {
      id:            `rem-${Date.now()}`,
      petId:         params.petId,
      ownerId:       'user-1',
      type:          params.type,
      title:         params.title,
      remindAt:      params.remindAt,
      repeatDays:    params.repeatDays ?? null,
      vaccinationId: params.vaccinationId ?? null,
      isDone:        false,
      lastSentAt:    null,
      createdAt:     new Date().toISOString(),
    };
    setReminders(prev => [...prev, newReminder].sort(
      (a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime()
    ));
    setShowModal(false);
    showToast(t('health:reminders.success.created'));
  }

  async function handleDone(id: string) {
    if (useLiveApi) {
      try {
        await markReminderDone(supabase, id);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to mark done');
        return;
      }
    }
    setReminders(prev => prev.filter(r => r.id !== id));
    showToast(t('health:reminders.success.done'));
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('health:reminders.delete_confirm'))) return;
    if (useLiveApi) {
      try {
        await deleteReminder(supabase, id);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to delete reminder');
        return;
      }
    }
    setReminders(prev => prev.filter(r => r.id !== id));
    showToast(t('health:reminders.success.deleted'));
  }

  // Group by pet
  const byPet = pets.map(pet => ({
    pet,
    items: reminders.filter(r => r.petId === pet.id),
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-primary-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {showModal && (
        <AddReminderModal
          pets={pets}
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          t={t}
          locale={locale}
        />
      )}

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-content-primary">
              🔔 {t('health:reminders.title')}
            </h1>
            <p className="text-sm text-content-secondary mt-1">
              {t('health:reminders.subtitle')}
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + {t('health:reminders.add_reminder')}
          </Button>
        </div>

        {/* SMS Reminder Active Notice Banner (HLT-6) */}
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📱</span>
            <span className="text-sm font-medium text-emerald-900">
              {t('health:reminders.sms_opt_in_notice')}
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            Active
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <EmptyState
            icon={<span className="text-2xl">🔔</span>}
            title={t('health:reminders.empty')}
            description={t('health:reminders.empty_desc')}
            actionText={t('health:reminders.add_reminder')}
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="space-y-8">
            {byPet.map(({ pet, items }) => (
              <section key={pet.id}>
                <h2 className="text-base font-semibold text-content-primary mb-3 flex items-center gap-2">
                  <span>{pet.species === 'dog' ? '🐕' : '🐈'}</span>
                  <span>{pet.name}</span>
                  <span className="text-xs text-content-secondary font-normal">
                    ({items.length} {items.length === 1 ? 'reminder' : 'reminders'})
                  </span>
                </h2>
                <div className="space-y-3">
                  {items.map(reminder => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      petName={pet.name}
                      locale={locale}
                      t={t}
                      onDone={handleDone}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
