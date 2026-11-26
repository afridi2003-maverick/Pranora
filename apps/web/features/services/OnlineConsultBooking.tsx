'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
import {
  listOnlineConsultVets,
  createOnlineConsultation,
  getMyOnlineConsultations,
  createSupabaseClient,
  type OnlineVetOption,
  type OnlineConsultation,
  type OnlineConsultMode,
} from '@pranora/api';

export function OnlineConsultBooking() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [vets, setVets] = useState<OnlineVetOption[]>([]);
  const [selectedVetId, setSelectedVetId] = useState<string>('');
  const [callMode, setCallMode] = useState<OnlineConsultMode>('video');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [consultations, setConsultations] = useState<OnlineConsultation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreated, setLastCreated] = useState<OnlineConsultation | null>(null);

  useEffect(() => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
    );
    listOnlineConsultVets(supabase).then((list) => {
      setVets(list);
      if (list[0]) setSelectedVetId(list[0].vetId);
    });
    getMyOnlineConsultations(supabase).then(setConsultations);
  }, []);

  const selectedVet = vets.find((v) => v.vetId === selectedVetId) ?? vets[0];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVet || chiefComplaint.trim().length < 5) return;
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
      );
      const created = await createOnlineConsultation(
        supabase,
        {
          vetId: selectedVet.vetId,
          petId: '550e8400-e29b-41d4-a716-446655440201',
          callMode,
          chiefComplaint: chiefComplaint.trim(),
          scheduledAt: new Date(Date.now() + 1800 * 1000).toISOString(),
          feeBdt: selectedVet.feeBdt,
        },
        {
          vetName: isBangla ? selectedVet.nameBn : selectedVet.nameEn,
          originUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
        }
      );
      setLastCreated(created);
      setConsultations((prev) => [created, ...prev]);
      setChiefComplaint('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isBangla ? 'অনলাইন ভেট পরামর্শ' : 'Online Vet Consultation'}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {isBangla
            ? 'যাচাইকৃত পশু চিকিৎসকের সাথে অডিও বা ভিডিও পরামর্শ বুক করুন'
            : 'Book a paid audio or video consultation with a verified vet'}
        </p>
      </div>

      {lastCreated && (
        <Card className="p-4 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 space-y-2">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            {isBangla
              ? `পরামর্শ নিশ্চিত হয়েছে (${lastCreated.transactionId}) — ৳${lastCreated.feeBdt}`
              : `Consultation booked (${lastCreated.transactionId}) — ৳${lastCreated.feeBdt}`}
          </p>
          <div className="flex flex-wrap gap-3">
            {lastCreated.checkoutUrl && (
              <a
                href={lastCreated.checkoutUrl}
                className="text-xs font-semibold text-emerald-700 underline"
              >
                {isBangla ? 'SSLCommerz দিয়ে পেমেন্ট সম্পন্ন করুন' : 'Complete Payment via SSLCommerz'}
              </a>
            )}
            <Link
              href={`/${locale}/calls/${lastCreated.callMode}`}
              className="text-xs font-semibold text-emerald-700 underline"
            >
              {isBangla ? 'কল রুমে যোগ দিন →' : 'Join Call Room →'}
            </Link>
          </div>
        </Card>
      )}

      <form onSubmit={handleBook} className="space-y-5">
        <Card className="p-5 space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            {isBangla ? 'অনলাইন পশু চিকিৎসক বেছে নিন' : 'Choose an Online Vet'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {vets.map((vet) => {
              const selected = vet.vetId === selectedVetId;
              return (
                <button
                  type="button"
                  key={vet.vetId}
                  onClick={() => setSelectedVetId(vet.vetId)}
                  className={`text-left p-4 rounded-xl border transition ${
                    selected
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-foreground">
                      {isBangla ? vet.nameBn : vet.nameEn}
                    </p>
                    <Chip
                      variant="status"
                      statusType={vet.availableNow ? 'confirmed' : 'neutral'}
                      label={
                        vet.availableNow
                          ? isBangla
                            ? 'অনলাইন'
                            : 'Online'
                          : isBangla
                            ? 'শিডিউল'
                            : 'Scheduled'
                      }
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {isBangla ? vet.specialtyBn : vet.specialtyEn}
                  </p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-2">
                    ৳{vet.feeBdt}
                  </p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {isBangla ? 'পরামর্শের মাধ্যম' : 'Consultation Mode'}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={callMode === 'video' ? 'primary' : 'ghost'}
                onClick={() => setCallMode('video')}
              >
                {isBangla ? 'ভিডিও কল' : 'Video Call'}
              </Button>
              <Button
                type="button"
                variant={callMode === 'audio' ? 'primary' : 'ghost'}
                onClick={() => setCallMode('audio')}
              >
                {isBangla ? 'অডিও কল' : 'Audio Call'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              {isBangla ? 'পোষ্যের লক্ষণ / মূল সমস্যা' : 'Pet Symptoms / Chief Complaint'}
            </label>
            <textarea
              rows={3}
              required
              minLength={5}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder={
                isBangla
                  ? 'লক্ষণ, কতদিন ধরে হচ্ছে এবং সাম্প্রতিক পরিবর্তন লিখুন...'
                  : 'Describe symptoms, duration, and any recent changes...'
              }
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm font-semibold text-foreground">
              {isBangla ? 'পরামর্শ ফি:' : 'Consultation Fee:'}{' '}
              <span className="text-emerald-700 dark:text-emerald-400">
                ৳{selectedVet?.feeBdt ?? 500}
              </span>
            </p>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || chiefComplaint.trim().length < 5}
            >
              {isSubmitting
                ? isBangla
                  ? 'প্রক্রিয়াকরণ...'
                  : 'Processing...'
                : isBangla
                  ? 'পেমেন্ট করে কনফার্ম করুন'
                  : 'Pay & Confirm Consultation'}
            </Button>
          </div>
        </Card>
      </form>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          {isBangla ? 'আমার অনলাইন পরামর্শসমূহ' : 'My Online Consultations'}
        </h2>
        {consultations.map((c) => (
          <Card
            key={c.id}
            className="p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <p className="font-semibold text-sm text-foreground">{c.vetName}</p>
              <p className="text-xs text-neutral-500">
                {c.callMode === 'video'
                  ? isBangla
                    ? 'ভিডিও কল'
                    : 'Video Call'
                  : isBangla
                    ? 'অডিও কল'
                    : 'Audio Call'}{' '}
                • ৳{c.feeBdt} • {c.chiefComplaint}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Chip
                variant="status"
                statusType={c.paymentStatus === 'paid' ? 'confirmed' : 'pending'}
                label={c.paymentStatus}
              />
              <Link href={`/${locale}/calls/${c.callMode}`}>
                <Button variant="secondary">
                  {isBangla ? 'কল রুমে যোগ দিন' : 'Join Call'}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
