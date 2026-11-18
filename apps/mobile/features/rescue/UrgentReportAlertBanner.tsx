import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
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
            ? '✅ পুশ ও এসএমএস অ্যালার্ট পাঠানো হয়েছে!'
            : '✅ Push & SMS alert sent!'
        );
      } else {
        setFeedbackMsg(res.error || (isBangla ? 'ব্যর্থ হয়েছে' : 'Failed to alert'));
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
            ? '🚨 সকল অ্যাডমিনদের সতর্ক করা হয়েছে!'
            : '🚨 Admins alerted!'
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
    <View
      style={[
        styles.container,
        isCritical ? styles.criticalBg : styles.highBg,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{isCritical ? '🚨' : '⚠️'}</Text>
        <View style={styles.headerTexts}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                isCritical ? styles.criticalBadge : styles.highBadge,
              ]}
            >
              <Text style={styles.badgeText}>
                {isCritical
                  ? isBangla ? 'অতি জরুরি উদ্ধার' : 'Critical Urgency'
                  : isBangla ? 'জরুরি উদ্ধার' : 'High Urgency'}
              </Text>
            </View>

            {report.status === 'submitted' && (
              <View
                style={[
                  styles.countdownBadge,
                  countdown.isOverdue ? styles.overdueBadge : styles.pendingBadge,
                ]}
              >
                <Text style={styles.countdownText}>
                  {countdown.isOverdue
                    ? isBangla ? '🚨 অ্যাডমিন এস্কেলেশন' : '🚨 Escalated'
                    : isBangla
                    ? `⏱️ ${countdown.minutesRemaining} মি. বাকি`
                    : `⏱️ ${countdown.minutesRemaining}m left`}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.subtitle}>
            {report.area_text
              ? isBangla
                ? `এলাকা: ${report.area_text} — অনতিবিলম্বে রেসকিউয়ার বরাদ্দ প্রয়োজন।`
                : `Area: ${report.area_text} — Immediate rescuer dispatch needed.`
              : isBangla
              ? 'অনতিবিলম্বে অন-ডিউটি আশ্রয়কেন্দ্র/অ্যাডমিন পর্যালোচনা প্রয়োজন।'
              : 'Immediate shelter or admin review required.'}
          </Text>
          <Text style={styles.microText}>
            {isBangla
              ? 'অন-ডিউটি পুশ ও এসএমএস পাঠানো হয়েছে (১৫ মি. এস্কেলেশন)।'
              : 'Push & SMS dispatched (15-min admin escalation).'}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {onReviewClick && report.status === 'submitted' && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => onReviewClick(report.id)}
          >
            <Text style={styles.reviewButtonText}>
              {isBangla ? 'রিভিউ করুন' : 'Review'}
            </Text>
          </TouchableOpacity>
        )}

        {onTriggerAlert && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleResendAlert}
            disabled={isAlerting}
          >
            {isAlerting ? (
              <ActivityIndicator size="small" color="#374151" />
            ) : (
              <Text style={styles.secondaryButtonText}>
                {isBangla ? 'অ্যালার্ট পুনঃপ্রেরণ' : 'Resend Alert'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {onEscalateNow && !countdown.isOverdue && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleEscalateNow}
            disabled={isEscalating}
          >
            {isEscalating ? (
              <ActivityIndicator size="small" color="#991b1b" />
            ) : (
              <Text style={[styles.secondaryButtonText, { color: '#991b1b' }]}>
                {isBangla ? 'এস্কেলেট' : 'Escalate'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {feedbackMsg && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedbackMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  criticalBg: {
    backgroundColor: '#fff1f2',
    borderColor: '#fda4af',
  },
  highBg: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 22,
    marginRight: 8,
  },
  headerTexts: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  criticalBadge: {
    backgroundColor: '#ffe4e6',
    borderColor: '#f43f5e',
  },
  highBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1f2937',
  },
  countdownBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  overdueBadge: {
    backgroundColor: '#e11d48',
  },
  pendingBadge: {
    backgroundColor: '#fde68a',
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },
  microText: {
    fontSize: 11,
    color: '#4b5563',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  reviewButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reviewButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackContainer: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  feedbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2937',
  },
});
