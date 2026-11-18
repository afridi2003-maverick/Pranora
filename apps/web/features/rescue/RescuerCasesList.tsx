'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import {
  MOCK_ASSIGNMENTS,
  type AssignmentWithReport,
} from './assignmentMockData';
import { RescuerAssignmentCard } from './RescuerAssignmentCard';

interface RescuerCasesListProps {
  initialAssignments?: AssignmentWithReport[];
  onRespond?: (assignmentId: string, accept: boolean, declineReason?: string) => Promise<void>;
  onViewCase?: (caseId: string) => void;
}

export function RescuerCasesList({
  initialAssignments = MOCK_ASSIGNMENTS,
  onRespond,
  onViewCase,
}: RescuerCasesListProps) {
  const { isBangla } = useLocale();
  const [items, setItems] = useState<AssignmentWithReport[]>(initialAssignments);
  const [activeTab, setActiveTab] = useState<'offered' | 'accepted' | 'all'>('offered');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const offeredCount = items.filter((i) => i.assignment.status === 'offered').length;
  const acceptedCount = items.filter((i) => i.assignment.status === 'accepted').length;

  const handleRespond = async (assignmentId: string, accept: boolean, declineReason?: string) => {
    setIsSubmitting(true);
    try {
      if (onRespond) {
        await onRespond(assignmentId, accept, declineReason);
      }

      // Optimistic local state update
      setItems((prev) =>
        prev.map((i) => {
          if (i.assignment.id === assignmentId) {
            return {
              ...i,
              assignment: {
                ...i.assignment,
                status: accept ? 'accepted' : 'declined',
                decline_reason: declineReason || null,
                responded_at: new Date().toISOString(),
              },
              rescueCase: {
                ...i.rescueCase,
                status: accept ? 'rescue_in_progress' : 'under_review',
              },
            };
          }
          return i;
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((i) => {
    if (activeTab === 'offered') return i.assignment.status === 'offered';
    if (activeTab === 'accepted') return i.assignment.status === 'accepted';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-stroke-subtle gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('offered')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'offered'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-neutral-500 hover:text-foreground'
          }`}
        >
          <span>🔔 {isBangla ? 'নতুন প্রস্তাবনা' : 'Offered Cases'}</span>
          {offeredCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white font-bold">
              {offeredCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('accepted')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'accepted'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-neutral-500 hover:text-foreground'
          }`}
        >
          <span>🏃 {isBangla ? 'চলমান কেসসমূহ' : 'In Progress'}</span>
          {acceptedCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-green-600 text-white font-bold">
              {acceptedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-neutral-500 hover:text-foreground'
          }`}
        >
          📋 {isBangla ? 'সকল রেকর্ড' : 'All History'}
        </button>
      </div>

      {/* List of Case Cards */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <RescuerAssignmentCard
              key={item.assignment.id}
              item={item}
              onRespond={handleRespond}
              onViewCase={onViewCase}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-stroke-subtle bg-white/40 dark:bg-neutral-900/40">
          <span className="text-4xl block mb-2">🐾</span>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {activeTab === 'offered'
              ? isBangla
                ? 'এই মুহূর্তে কোনো নতুন কেসের প্রস্তাব নেই'
                : 'No pending case offers right now'
              : isBangla
              ? 'কোনো কেস পাওয়া যায়নি'
              : 'No rescue cases in this category'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {isBangla
              ? 'নতুন কেস এলে নোটিফিকেশনের মাধ্যমে আপনাকে জানানো হবে।'
              : 'You will receive immediate notifications when new emergency cases are dispatched in your area.'}
          </p>
        </div>
      )}
    </div>
  );
}
