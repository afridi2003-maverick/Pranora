'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from '@pranora/i18n';

export default function EmergencyPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'bn';
  const { isBangla } = useLocale();

  return (
    <div className="min-h-screen bg-red-50 dark:bg-zinc-950 text-content-primary">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Hero Banner */}
        <div className="bg-red-600 dark:bg-red-700 rounded-3xl p-6 sm:p-8 shadow-lg text-white">
          <h1 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2">
            <span>🚨</span>
            {isBangla ? 'জরুরি ভেটেরিনারি সেবা' : 'Emergency Veterinary Help'}
          </h1>
          <p className="text-red-100 text-sm sm:text-base">
            {isBangla
              ? 'প্রাণোরা জরুরি নেটওয়ার্ক: নিকটস্থ ২৪/৭ ক্লিনিক ও ট্রায়াজ সাপোর্ট'
              : 'Pranora Emergency Network: Nearest 24/7 clinics and emergency triage support'}
          </p>
        </div>

        {/* First-Aid Guidelines */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-red-200 dark:border-red-800/40 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span>📋</span>
            {isBangla ? 'জরুরি প্রাথমিক সতর্কতা' : 'Urgent First-Aid Precautions'}
          </h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              {isBangla
                ? 'পোষা প্রাণীকে শান্ত রাখুন এবং শ্বাস চলাচলের পথ খোলা রাখুন।'
                : 'Keep your pet calm and ensure airways are unobstructed.'}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              {isBangla
                ? 'রক্তপাত হলে পরিষ্কার কাপড় দিয়ে মৃদু চাপ দিয়ে রাখুন।'
                : 'For bleeding, apply gentle direct pressure with a clean cloth.'}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              {isBangla
                ? 'চিকিৎসকের নির্দেশনা ছাড়া কোনো ওষুধ বা বমি করানোর চেষ্টা করবেন না।'
                : 'Do not administer medications or induce vomiting without vet instruction.'}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              {isBangla
                ? 'পোষা প্রাণী খিঁচুনিতে থাকলে ধারালো বা কঠিন বস্তু সরিয়ে জোর করে ধরবেন না।'
                : 'During seizures, clear away sharp or hard objects and do not restrain your pet.'}
            </li>
          </ul>
        </div>

        {/* Hotline Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-red-200 dark:border-red-800/40 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
            <span>📞</span>
            {isBangla ? 'কেন্দ্রীয় জরুরি হটলাইন' : 'Central Emergency Hotline'}
          </h2>
          <p className="text-red-600 dark:text-red-400 font-black text-2xl mb-4">
            +880 1711-223344
          </p>
          <a
            href="tel:+8801711223344"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow transition"
          >
            📞 {isBangla ? 'এখনই কল করুন' : 'Call Emergency Hotline'}
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/${locale}/map?emergency=true`}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-emergency hover:bg-red-700 text-white font-black text-base rounded-xl shadow transition text-center"
          >
            🗺️ {isBangla ? 'জরুরি ক্লিনিক ম্যাপ দেখুন' : 'View Emergency Clinic Map'}
          </Link>

          <Link
            href={`/${locale}/assistant`}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-gray-200 font-semibold text-sm rounded-xl transition text-center"
          >
            🤖 {isBangla ? 'এআই সহকারীর সাথে কথা বলুন' : 'Talk to AI Assistant'}
          </Link>
        </div>
      </main>
    </div>
  );
}
