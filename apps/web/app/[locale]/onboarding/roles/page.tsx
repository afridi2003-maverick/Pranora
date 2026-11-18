'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, Input } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';
import type { UserRole, VerificationStatus } from '@pranora/types';

interface RoleOption {
  role: UserRole;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  icon: string;
  requiresVerification: boolean;
}

const AVAILABLE_ROLES: RoleOption[] = [
  {
    role: 'owner',
    titleBn: 'পোষা প্রাণীর মালিক',
    titleEn: 'Pet Owner',
    descBn: 'নিজের পোষা প্রাণীর প্রোফাইল, টিকার রেকর্ড ও ডাক্তারের সিরিয়াল নিন',
    descEn: 'Manage pet health, vaccines, and book vet appointments',
    icon: '🐾',
    requiresVerification: false,
  },
  {
    role: 'rescuer',
    titleBn: 'উদ্ধারকারী',
    titleEn: 'Animal Rescuer',
    descBn: 'আহত বা বিপন্ন প্রাণীর উদ্ধারের ডাক গ্রহণ ও পরিচালনা করুন',
    descEn: 'Receive urgent rescue calls and handle animal rescue cases',
    icon: '🚑',
    requiresVerification: true,
  },
  {
    role: 'shelter',
    titleBn: 'আশ্রয়স্থল / শেল্টার',
    titleEn: 'Animal Shelter',
    descBn: 'উদ্ধারকৃত প্রাণীদের আশ্রয়, দত্তকের তালিকা ও আবেদন পরিচালনা করুন',
    descEn: 'List rescued animals for adoption and manage applications',
    icon: '🏡',
    requiresVerification: true,
  },
  {
    role: 'vet',
    titleBn: 'পশু চিকিৎসক',
    titleEn: 'Veterinarian (DVM)',
    descBn: 'ক্লিনিকের সময়সূচি, প্রেসক্রিপশন ও অনলাইন পরামর্শ সেবা দিন',
    descEn: 'Manage clinical schedule, prescriptions, and consultations',
    icon: '🩺',
    requiresVerification: true,
  },
  {
    role: 'provider',
    titleBn: 'সেবা প্রদানকারী',
    titleEn: 'Service Provider',
    descBn: 'গ্রুমিং, প্রশিক্ষণ, হোস্টেল ও পোষা প্রাণীর পণ্য সামগ্রী সেবা',
    descEn: 'Pet grooming, training, boarding, or pet supply services',
    icon: '✂️',
    requiresVerification: true,
  },
];

interface UserRoleState {
  role: UserRole;
  status: VerificationStatus;
}

export default function RolesOnboardingPage() {
  const router = useRouter();
  const { isBangla, locale } = useLocale();

  // Active user roles (Owner is auto-granted)
  const [userRoles, setUserRoles] = useState<UserRoleState[]>([
    { role: 'owner', status: 'verified' },
  ]);

  const [activeRole, setActiveRole] = useState<UserRole>('owner');
  const [requestingRole, setRequestingRole] = useState<UserRole | null>(null);
  const [docNote, setDocNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isRoleOwned = (role: UserRole) => userRoles.some((r) => r.role === role);
  const getRoleStatus = (role: UserRole): VerificationStatus | null => {
    const found = userRoles.find((r) => r.role === role);
    return found ? found.status : null;
  };

  const handleRoleClick = (option: RoleOption) => {
    setFeedbackMsg(null);
    if (isRoleOwned(option.role)) {
      // If already verified, switch active role
      if (getRoleStatus(option.role) === 'verified') {
        setActiveRole(option.role);
        setFeedbackMsg({
          type: 'success',
          text: isBangla
            ? `সক্রিয় ভূমিকা পরিবর্তন হয়েছে: ${option.titleBn}`
            : `Active role switched to: ${option.titleEn}`,
        });
      }
      return;
    }

    if (option.requiresVerification) {
      setRequestingRole(option.role);
    } else {
      // Auto verify owner role
      setUserRoles((prev) => [...prev, { role: option.role, status: 'verified' }]);
      setActiveRole(option.role);
    }
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingRole) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setUserRoles((prev) => [
        ...prev.filter((r) => r.role !== requestingRole),
        { role: requestingRole, status: 'pending' },
      ]);
      setFeedbackMsg({
        type: 'success',
        text: isBangla
          ? 'যাচাইকরণ অনুরোধ জমা হয়েছে! অ্যাডমিন দল এটি পর্যালোচনা করবে।'
          : 'Verification request submitted! Admin will review your credentials.',
      });
      setRequestingRole(null);
      setDocNote('');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-green-50/40 dark:bg-gray-900 text-content-primary flex flex-col">
      <LanguageHeader />

      <main className="max-w-3xl mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl mb-2 inline-block">👥</span>
          <h1 className="text-2xl sm:text-3xl font-bold font-bangla text-green-900 dark:text-green-300">
            {isBangla ? 'আপনার ভূমিকা ও পরিচয়' : 'Your Roles & Identity'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-bangla max-w-lg mx-auto">
            {isBangla
              ? 'প্রাণোরায় আপনি একই সাথে পোষা প্রাণীর মালিক, উদ্ধারকারী বা ডাক্তার হতে পারবেন। একাধিক ভূমিকা বেছে নিয়ে সহজেই সুইচ করুন।'
              : 'You can hold multiple roles on Pranora. Choose the roles that fit your activities and switch between them anytime.'}
          </p>
        </div>

        {/* Active Role Switcher Card */}
        <Card className="p-5 mb-6 bg-white dark:bg-gray-800 shadow-sm border border-green-200 dark:border-green-800 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold font-bangla">
                {isBangla ? 'বর্তমান সক্রিয় ভূমিকা' : 'Current Active Role'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">
                  {AVAILABLE_ROLES.find((r) => r.role === activeRole)?.icon}
                </span>
                <span className="text-lg font-bold text-green-900 dark:text-green-300 font-bangla">
                  {isBangla
                    ? AVAILABLE_ROLES.find((r) => r.role === activeRole)?.titleBn
                    : AVAILABLE_ROLES.find((r) => r.role === activeRole)?.titleEn}
                </span>
                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bangla">
                  {isBangla ? 'সক্রিয়' : 'Active'}
                </span>
              </div>
            </div>

            {/* Quick switcher buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {userRoles
                .filter((r) => r.status === 'verified')
                .map((r) => {
                  const opt = AVAILABLE_ROLES.find((o) => o.role === r.role);
                  if (!opt) return null;
                  const isCurrent = activeRole === r.role;
                  return (
                    <Chip
                      key={r.role}
                      label={`${opt.icon} ${isBangla ? opt.titleBn : opt.titleEn}`}
                      isSelected={isCurrent}
                      onSelect={() => setActiveRole(r.role)}
                    />
                  );
                })}
            </div>
          </div>
        </Card>

        {feedbackMsg && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-bangla ${
              feedbackMsg.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/40 dark:text-green-200'
                : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-200'
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Roles List */}
        <div className="space-y-3.5 mb-8">
          {AVAILABLE_ROLES.map((opt) => {
            const owned = isRoleOwned(opt.role);
            const status = getRoleStatus(opt.role);
            const isCurrentActive = activeRole === opt.role;

            return (
              <div
                key={opt.role}
                onClick={() => handleRoleClick(opt)}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCurrentActive
                    ? 'border-green-600 bg-green-50/70 dark:bg-green-900/30 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-2xl shrink-0">
                    {opt.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 font-bangla">
                        {isBangla ? opt.titleBn : opt.titleEn}
                      </h3>

                      {status === 'verified' && (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded-full font-bangla font-semibold">
                          ✓ {isBangla ? 'যাচাইকৃত' : 'Verified'}
                        </span>
                      )}

                      {status === 'pending' && (
                        <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-0.5 rounded-full font-bangla font-semibold">
                          ⏳ {isBangla ? 'যাচাইকরণ অপেক্ষামান' : 'Pending Review'}
                        </span>
                      )}

                      {!owned && opt.requiresVerification && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-bangla">
                          ({isBangla ? 'যাচাইকরণ প্রয়োজন' : 'Verification Required'})
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 font-bangla leading-relaxed">
                      {isBangla ? opt.descBn : opt.descEn}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  {owned && status === 'verified' && (
                    <Button
                      variant={isCurrentActive ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRole(opt.role);
                      }}
                      className="font-bangla text-xs"
                    >
                      {isCurrentActive
                        ? isBangla ? 'সক্রিয়' : 'Active'
                        : isBangla ? 'সুইচ করুন' : 'Switch'}
                    </Button>
                  )}

                  {!owned && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleClick(opt);
                      }}
                      className="font-bangla text-xs"
                    >
                      {opt.requiresVerification
                        ? isBangla ? 'আবেদন করুন' : 'Apply'
                        : isBangla ? 'যুক্ত করুন' : 'Add'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Verification Modal / Form */}
        {requestingRole && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold font-bangla text-gray-900 dark:text-gray-100 mb-2">
                {isBangla ? 'ভূমিকা যাচাইকরণের আবেদন' : 'Role Verification Request'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bangla mb-4">
                {isBangla
                  ? `${AVAILABLE_ROLES.find((r) => r.role === requestingRole)?.titleBn} হিসেবে কাজ করতে আপনার লাইসেন্স, রেজিষ্ট্রেশন বা পরিচয়পত্র নম্বর দিন।`
                  : `Please provide your registration or license details for ${AVAILABLE_ROLES.find((r) => r.role === requestingRole)?.titleEn}.`}
              </p>

              <form onSubmit={handleSubmitVerification} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 font-bangla">
                    {requestingRole === 'vet'
                      ? isBangla ? 'BVC রেজিস্ট্রেশন নম্বর' : 'BVC Reg Number'
                      : requestingRole === 'provider'
                      ? isBangla ? 'ট্রেড লাইসেন্স নম্বর' : 'Trade License No'
                      : isBangla ? 'সংস্থা বা জাতীয় পরিচয়পত্র নম্বর' : 'NID or Org Registration'}
                  </label>
                  <Input
                    type="text"
                    required
                    value={docNote}
                    onChange={(e) => setDocNote(e.target.value)}
                    placeholder={
                      requestingRole === 'vet'
                        ? 'e.g. BVC-12345'
                        : requestingRole === 'provider'
                        ? 'e.g. TRAD-DHK-9876'
                        : 'e.g. NID / Org Ref No'
                    }
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRequestingRole(null)}
                    disabled={isSubmitting}
                    className="font-bangla"
                  >
                    {isBangla ? 'বাতিল' : 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                    className="font-bangla"
                  >
                    {isSubmitting
                      ? isBangla ? 'জমা হচ্ছে...' : 'Submitting...'
                      : isBangla ? 'অনুরোধ জমা দিন' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(`/${locale}`)}
            className="w-full sm:w-auto px-8 font-bangla"
          >
            {isBangla ? 'সম্পন্ন করুন →' : 'Done & Proceed →'}
          </Button>
        </div>
      </main>
    </div>
  );
}
