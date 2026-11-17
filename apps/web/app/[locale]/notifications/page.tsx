'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, EmptyState, Chip } from '@pranora/ui';
import { LanguageHeader } from '../../../components/LanguageHeader';
import type { NotificationItem } from '@pranora/api';

// Initial mock items for client view demonstration
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    userId: 'mock-user-1',
    titleBn: 'জরুরি উদ্ধার রিপোর্ট',
    titleEn: 'Urgent Rescue Report',
    bodyBn: 'ধানমন্ডি লেক এলাকায় আহত বিড়ালের রিপোর্ট পাওয়া গেছে — দ্রুত মনোযোগ দিন।',
    bodyEn: 'Injured cat reported near Dhanmondi Lake area — needs immediate attention.',
    data: { screen: 'rescue', id: 'rsc-001' },
    channel: 'in_app',
    readAt: null,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    userId: 'mock-user-1',
    titleBn: 'বুকিং নিশ্চিত হয়েছে',
    titleEn: 'Booking Confirmed',
    bodyBn: 'আপনার ভেট ক্লিনিক ভিজিট বুকিং (PRN-24K7Q9) সফলভাবে নিশ্চিত হয়েছে।',
    bodyEn: 'Your clinic visit booking (PRN-24K7Q9) has been confirmed.',
    data: { screen: 'booking', id: 'PRN-24K7Q9' },
    channel: 'in_app',
    readAt: null,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    userId: 'mock-user-1',
    titleBn: 'টিকার স্মরণিকা',
    titleEn: 'Vaccine Reminder',
    bodyBn: 'মাইলোর র্যাবিস টিকার নির্ধারিত তারিখ আগামী পরশু।',
    bodyEn: 'Milo\'s Rabies booster vaccine is due in 2 days.',
    data: { screen: 'health', petId: 'pet-001' },
    channel: 'in_app',
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export default function NotificationsPage() {
  const { isBangla } = useLocale();
  const [items, setItems] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredItems = items.filter((item) =>
    filter === 'unread' ? !item.isRead : true
  );

  const unreadCount = items.filter((item) => !item.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
      )
    );
  };

  const handleMarkAllRead = () => {
    setItems((prev) =>
      prev.map((item) => ({ ...item, isRead: true, readAt: new Date().toISOString() }))
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getEmojiIcon = (data: Record<string, unknown> | null) => {
    const screen = data?.screen;
    if (screen === 'rescue') {
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-lg">
          🚨
        </div>
      );
    }
    if (screen === 'booking') {
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 flex items-center justify-center text-lg">
          📅
        </div>
      );
    }
    if (screen === 'health') {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-lg">
          💉
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 flex items-center justify-center text-lg">
        🔔
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-green-50/30 dark:bg-gray-900 text-content-primary">
      <LanguageHeader />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-bangla text-green-900 dark:text-green-300 flex items-center gap-2">
              <span>🔔</span>
              <span>{isBangla ? 'বিজ্ঞপ্তি' : 'Notifications'}</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-green-600 text-white font-sans px-2.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-bangla">
              {isBangla
                ? 'আপনার বুকিং, উদ্ধার ও টিকার সকল হালনাগাদ এখানে পাবেন'
                : 'All updates about your bookings, rescues, and vaccine schedules'}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs shrink-0"
            >
              ✓ {isBangla ? 'সব পড়া হিসেবে চিহ্নিত করুন' : 'Mark all as read'}
            </Button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 mb-4">
          <Chip
            label={isBangla ? 'সব বিজ্ঞপ্তি' : 'All'}
            isSelected={filter === 'all'}
            onSelect={() => setFilter('all')}
          />
          <Chip
            label={isBangla ? `অপঠিত (${unreadCount})` : `Unread (${unreadCount})`}
            isSelected={filter === 'unread'}
            onSelect={() => setFilter('unread')}
          />
        </div>

        {/* Notification List */}
        {filteredItems.length === 0 ? (
          <Card className="py-12">
            <EmptyState
              icon={<span className="text-2xl">📭</span>}
              title={isBangla ? 'কোনো বিজ্ঞপ্তি নেই' : 'No notifications'}
              description={
                isBangla
                  ? 'আপনার কোনো নতুন বিজ্ঞপ্তি বা বার্তা এই মুহূর্তে নেই।'
                  : 'You do not have any new notifications or updates at the moment.'
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const title = isBangla ? item.titleBn : item.titleEn;
              const body = isBangla ? item.bodyBn : item.bodyEn;

              return (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                  className={`p-4 rounded-xl border transition-all ${
                    item.isRead
                      ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60 opacity-90'
                      : 'bg-white dark:bg-gray-800 border-green-300 dark:border-green-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {getEmojiIcon(item.data)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-base font-semibold font-bangla text-gray-900 dark:text-gray-100 truncate">
                          {title}
                        </h3>
                        {!item.isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-bangla leading-relaxed mb-2">
                        {body}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-3">
                          {!item.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(item.id);
                              }}
                              className="text-green-600 hover:underline flex items-center gap-1"
                            >
                              ✓ {isBangla ? 'পড়া হয়েছে' : 'Mark read'}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
