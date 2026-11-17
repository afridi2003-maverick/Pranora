import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { NotificationItem } from '@pranora/api';

const MOCK_MOBILE_NOTIFICATIONS: NotificationItem[] = [
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

export default function NotificationsScreen() {
  const { isBangla } = useLocale();
  const [items, setItems] = useState<NotificationItem[]>(MOCK_MOBILE_NOTIFICATIONS);

  const unreadCount = items.filter((i) => !i.isRead).length;

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

  return (
    <SafeAreaView className="flex-1 bg-green-50/40">
      <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold text-gray-900">
            🔔 {isBangla ? 'বিজ্ঞপ্তি' : 'Notifications'}
          </Text>
          {unreadCount > 0 && (
            <View className="bg-green-600 px-2 py-0.5 rounded-full">
              <Text className="text-white text-xs font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text className="text-xs text-green-700 font-bold">
              {isBangla ? 'সব পড়ুন' : 'Read All'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="py-20 items-center justify-center">
            <Text className="text-4xl mb-3">📭</Text>
            <Text className="text-base font-bold text-gray-700">
              {isBangla ? 'কোনো বিজ্ঞপ্তি নেই' : 'No notifications'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const title = isBangla ? item.titleBn : item.titleEn;
          const body = isBangla ? item.bodyBn : item.bodyEn;

          return (
            <TouchableOpacity
              onPress={() => !item.isRead && handleMarkAsRead(item.id)}
              className={`p-4 rounded-2xl mb-3 border ${
                item.isRead
                  ? 'bg-white border-gray-100 opacity-80'
                  : 'bg-white border-green-300 shadow-sm'
              }`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-start justify-between mb-1">
                <Text className="text-base font-bold text-gray-900 flex-1 mr-2">
                  {title}
                </Text>
                {!item.isRead && (
                  <View className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1" />
                )}
              </View>

              <Text className="text-sm text-gray-600 mb-2 leading-relaxed">
                {body}
              </Text>

              <Text className="text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
