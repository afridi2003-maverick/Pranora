'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import type { AnimalReportRow } from '@pranora/api';
import { calculateEscalationCountdown } from '@pranora/api';

interface UrgentReportAlertBannerProps {
  report: AnimalReportRow;
  thresholdMinutes?: number;
  onTriggerAlert?: (reportId: string) => Promise<{ success: boolean; error?: string }>;
  onEscalateNow?: () => Promise<{ success: boolean; error?: string }>;
  onReviewClick?: (reportId: string) => void;
}

export function UrgentReportAlertBanner({
  report,
  thresholdMinutes = 15,
  onTriggerAlert,
  onEscalateNow,
  onReviewClick,
}: UrgentReportAlertBannerProps) {
  const { isBangla } = useLocale();
  const [countdown, setCountdown] = useState(() =>
    calculateEscalationCountdown(report.created_at, thresholdMinutes, report.escalated_at)
  );
  const [isAlerting, setIsAlerting] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const isUrgent = report.urgency === 'critical' || report.urgency === 'high';
  const isCritical = report.urgency === 'critical';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateEscalationCountdown(report.created_at, thresholdMinutes, report.escalated_at));
    }, 15000);

    return () => clearInterval(timer);
  }, [report.created_at, report.escalated_at, thresholdMinutes]);

  if (!isUrgent) {
    return null;
  }

  const handleResendAlert = async () => {
    if (!onTriggerAlert) return;
    setIsAlerting(true);
    setFeedbackMsg(null);
    try {
      const res = await onTriggerAlert(report.id);
      if (res.success) {
        setFeedbackMsg(
          isBangla
            ? '✅ পুশ ও এসএমএস অ্যালার্ট সফলভাবে পুনরায় পাঠানো হয়েছে!'
            : '✅ Push & SMS alert resent successfully!'
        );
      } else {
        setFeedbackMsg(res.error || (isBangla ? 'ব্যর্থ হয়েছে' : 'Failed to send alert'));
      }
    } catch {
      setFeedbackMsg(isBangla ? 'ত্রুটি ঘটেছে' : 'Error dispatching alert');
    } finally {
      setIsAlerting(false);
    }
  };

  const handleEscalateNow = async () => {
    if (!onEscalateNow) return;
    setIsEscalating(true);
    setFeedbackMsg(null);
    try {
      const res = await onEscalateNow();
      if (res.success) {
        setFeedbackMsg(
          isBangla
            ? '🚨 সকল অ্যাডমিনদের কাছে জরুরি এস্কেলেশন নোটিফিকেশন পাঠানো হয়েছে!'
            : '🚨 Urgent escalation sent to all administrators!'
        );
      } else {
        setFeedbackMsg(res.error || (isBangla ? 'ব্যর্থ হয়েছে' : 'Failed to escalate'));
      }
    } catch {
      setFeedbackMsg(isBangla ? 'ত্রুটি ঘটেছে' : 'Error escalating report');
    } finally {
      setIsEscalating(false);
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 mb-4 transition-all shadow-sm ${
        isCritical
          ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
          : 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl animate-pulse">
            {isCritical ? '🚨' : '⚠️'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm tracking-wide uppercase px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 border border-current/20">
                {isCritical
                  ? isBangla ? 'অতি জরুরি উদ্ধার' : 'Critical Urgency'
                  : isBangla ? 'জরুরি উদ্ধার' : 'High Urgency'}
              </span>

              {report.status === 'submitted' && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    countdown.isOverdue
                      ? 'bg-rose-600 text-white animate-bounce'
                      : 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
                  }`}
                >
                  {countdown.isOverdue
                    ? isBangla ? '🚨 অ্যাডমিন এস্কেলেশন সক্রিয়' : '🚨 Escalated to Admins'
                    : isBangla
                    ? `⏱️ ১৫ মিনিট এস্কেলেশন সময়সীমা: ${countdown.minutesRemaining} মিনিট বাকি`
                    : `⏱️ 15m Escalation Window: ${countdown.minutesRemaining}m remaining`}
                </span>
              )}
            </div>

            <p className="text-sm mt-1 font-medium">
              {report.area_text
                ? isBangla
                  ? `এলাকা: ${report.area_text} — অবিলম্বে মানব পর্যালোচনা ও রেসকিউয়ার বরাদ্দ প্রয়োজন।`
                  : `Area: ${report.area_text} — Requires immediate human review & rescuer dispatch.`
                : isBangla
                ? 'অনতিবিলম্বে অন-ডিউটি আশ্রয়কেন্দ্র অথবা অ্যাডমিন পর্যালোচনা প্রয়োজন।'
                : 'Immediate on-duty shelter or admin review required.'}
            </p>

            <p className="text-xs opacity-75 mt-0.5">
              {isBangla
                ? 'অন-ডিউটি কর্মকর্তাদের পুশ ও এসএমএস নোটিফিকেশন পাঠানো হয়েছে। ১৫ মিনিটে পর্যালোচনা না হলে প্রশাসকদের সতর্ক করা হবে।'
                : 'Push and SMS dispatched to on-duty reviewers. Automatically escalates to system admins if unreviewed after 15 minutes.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
          {onReviewClick && report.status === 'submitted' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onReviewClick(report.id)}
            >
              {isBangla ? 'রিভিউ করুন' : 'Review Report'}
            </Button>
          )}

          {onTriggerAlert && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleResendAlert}
              disabled={isAlerting}
            >
              {isAlerting
                ? isBangla ? 'পাঠানো হচ্ছে...' : 'Alerting...'
                : isBangla ? 'অ্যালার্ট পুনঃপ্রেরণ' : 'Resend Alert'}
            </Button>
          )}

          {onEscalateNow && !countdown.isOverdue && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleEscalateNow}
              disabled={isEscalating}
            >
              {isEscalating
                ? isBangla ? 'এস্কেলেট হচ্ছে...' : 'Escalating...'
                : isBangla ? 'এখনই এস্কেলেট করুন' : 'Escalate Now'}
            </Button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className="mt-2 text-xs font-semibold px-2 py-1 bg-white/60 dark:bg-black/40 rounded border border-current/10">
          {feedbackMsg}
        </div>
      )}
    </div>
  );
}
