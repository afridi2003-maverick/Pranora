'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card, CategoryTile, EmergencyButton, PromoBanner } from '@pranora/ui';
import { useSession } from '../hooks/useSession';

export function HomeDashboard() {
  const router = useRouter();
  const { locale, isBangla } = useLocale();
  const { isAuthenticated, profile, user } = useSession();

  const quickActions = [
    {
      href: `/${locale}/pets`,
      icon: '🐾',
      title: isBangla ? 'আমার পোষা প্রাণী' : 'My Pets',
      subtitle: isBangla ? 'প্রোফাইল, QR ও মালিকানা' : 'Profiles, QR & ownership',
    },
    {
      href: `/${locale}/clinics`,
      icon: '🏥',
      title: isBangla ? 'ভেট ক্লিনিক' : 'Vet Clinics',
      subtitle: isBangla ? 'কাছের হাসপাতাল ও অ্যাপয়েন্টমেন্ট' : 'Nearby hospitals & booking',
    },
    {
      href: `/${locale}/vaccination`,
      icon: '💉',
      title: isBangla ? 'টিকা ও চিকিৎসা' : 'Vaccines & Health',
      subtitle: isBangla ? 'টিকার সময়সূচি ও রেকর্ড' : 'Schedules & medical records',
    },
    {
      href: `/${locale}/reminders`,
      icon: '🔔',
      title: isBangla ? 'রিমাইন্ডার' : 'Reminders',
      subtitle: isBangla ? 'ওষুধ, খাবার ও টিকার অ্যালার্ট' : 'Meds, feeding & vaccine alerts',
    },
    {
      href: `/${locale}/adoption`,
      icon: '🏡',
      title: isBangla ? 'দত্তক পোর্টাল' : 'Adoption',
      subtitle: isBangla ? 'যাচাইকৃত প্রাণীদের দত্তক নিন' : 'Adopt verified rescued pets',
    },
    {
      href: `/${locale}/rescue/report`,
      icon: '🚑',
      title: isBangla ? 'উদ্ধার রিপোর্ট' : 'Rescue Report',
      subtitle: isBangla ? 'আহত প্রাণীর তথ্য জানান' : 'Report an injured stray animal',
    },
    {
      href: `/${locale}/assistant`,
      icon: '🤖',
      title: isBangla ? 'AI ভেট সহায়ক' : 'AI Pet Assistant',
      subtitle: isBangla ? 'তাৎক্ষণিক প্রাথমিক পরামর্শ' : 'Instant pet care guidance',
    },
    {
      href: `/${locale}/tips`,
      icon: '📚',
      title: isBangla ? 'যত্ন ও পরামর্শ' : 'Care Tips',
      subtitle: isBangla ? 'খাদ্য, আবহাওয়া ও স্বাস্থ্য গাইড' : 'Nutrition, weather & health guides',
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Hero Banner */}
      <section className="rounded-xl bg-gradient-to-br from-green-700 via-green-600 to-green-800 text-white p-6 sm:p-10 shadow-2 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/15 backdrop-blur-sm text-xs font-semibold">
            <span>🇧🇩</span>
            <span>
              {isAuthenticated
                ? isBangla
                  ? `স্বাগতম, ${profile?.full_name || user?.phone || 'অভিভাবক'}`
                  : `Welcome back, ${profile?.full_name || user?.phone || 'Pet Parent'}`
                : isBangla
                ? 'বাংলাদেশের সম্পূর্ণ পেট কেয়ার প্ল্যাটফর্ম'
                : "Bangladesh's Complete Pet Care Platform"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold leading-tight">
            {isBangla
              ? 'আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায়'
              : 'Complete care for your pet, all in one place'}
          </h1>

          <p className="text-sm sm:text-base text-green-50/90 leading-relaxed">
            {isBangla
              ? 'ভেট অ্যাপয়েন্টমেন্ট, ডিজিটাল টিকা কার্ড, জরুরি উদ্ধার, মানবিক যাচাইকৃত দত্তক এবং ২৪/৭ AI সহায়ক — সবকিছু এখন বাংলা ও ইংরেজিতে।'
              : 'Vet appointments, digital vaccine cards, emergency rescue, verified adoptions, and 24/7 AI care guidance — in Bangla and English.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              className="bg-white text-green-800 hover:bg-green-50 border-0"
              onClick={() => router.push(`/${locale}/clinics`)}
            >
              🏥 {isBangla ? 'ক্লিনিক খুঁজুন' : 'Find a Clinic'}
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="text-white border border-white/30 hover:bg-white/10"
              onClick={() => router.push(`/${locale}/pets`)}
            >
              🐾 {isBangla ? 'আমার পোষা প্রাণী' : 'My Pets'}
            </Button>
            <EmergencyButton
              variant="pill"
              label={isBangla ? 'জরুরি সেবা' : 'Emergency Help'}
              onClick={() => router.push(`/${locale}/emergency`)}
            />
          </div>
        </div>
      </section>

      {/* Quick Feature Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-content-primary">
              {isBangla ? 'সকল সেবা' : 'Explore Services'}
            </h2>
            <p className="text-sm text-content-secondary">
              {isBangla
                ? 'আপনার পোষা প্রাণীর প্রয়োজনে যেকোনো সেবা বেছে নিন'
                : 'Choose a service for your pet care needs'}
            </p>
          </div>
          <Link
            href={`/${locale}/services`}
            className="text-sm font-semibold text-green-600 dark:text-lime-400 hover:underline"
          >
            {isBangla ? 'সব দেখুন →' : 'View all →'}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActions.map((item) => (
            <Link key={item.href} href={item.href} className="block group">
              <CategoryTile
                icon={<span className="text-2xl">{item.icon}</span>}
                title={item.title}
                subtitle={item.subtitle}
                className="h-full w-full group-hover:border-green-500 transition-all"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Emergency & Adoption Promo */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PromoBanner
          tag={isBangla ? 'উদ্ধার ও সহায়তা' : 'Rescue & Help'}
          title={isBangla ? 'রাস্তায় আহত প্রাণী দেখেছেন?' : 'Spotted an injured stray animal?'}
          description={
            isBangla
              ? 'দ্রুত ছবি ও লোকেশনসহ উদ্ধার রিপোর্ট পাঠান, কাছের স্বেচ্ছাসেবক ও শেল্টার টিম সাড়া দেবে।'
              : 'Submit a quick rescue report with photo & location to alert nearby rescuers and shelters.'
          }
          ctaText={isBangla ? 'রিপোর্ট করুন' : 'Report Rescue'}
          onCtaClick={() => router.push(`/${locale}/rescue/report`)}
        />
        <Card className="p-5 flex flex-col justify-between gap-4 border border-stroke-subtle bg-app-card">
          <div className="space-y-1.5">
            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-pill bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-lime-400">
              {isBangla ? 'ম্যানেজমেন্ট ও বুকিং' : 'Bookings & Records'}
            </span>
            <h3 className="text-lg font-bold text-content-primary">
              {isBangla ? 'আমার বুকিং ও মেডিকেল রেকর্ড' : 'My Bookings & Medical History'}
            </h3>
            <p className="text-sm text-content-secondary">
              {isBangla
                ? 'আপনার আসন্ন ভেট অ্যাপয়েন্টমেন্ট, প্রেসক্রিপশন এবং পূর্ববর্তী ভিজিট নোট দেখুন।'
                : 'View your upcoming vet appointments, prescriptions, and past clinical visit notes.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push(`/${locale}/bookings`)}
            >
              {isBangla ? 'আমার বুকিং' : 'My Bookings'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/${locale}/medical`)}
            >
              {isBangla ? 'মেডিকেল রেকর্ড' : 'Medical History'}
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
