import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import type { Article } from '@pranora/api';

export interface ArticleDetailScreenProps {
  article: Article;
  relatedArticles?: Article[];
}

export function ArticleDetailScreen({
  article,
  relatedArticles = [],
}: ArticleDetailScreenProps) {
  const router = useRouter();
  const { t, isBangla } = useLocale();

  const title = isBangla ? article.title_bn : article.title_en;
  const body = isBangla ? article.body_bn : article.body_en;
  const author = isBangla ? article.author_name_bn : article.author_name_en;

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'diet':
        return t('tips:categoryDiet');
      case 'vaccine':
        return t('tips:categoryVaccine');
      case 'health':
        return t('tips:categoryHealth');
      case 'grooming':
        return t('tips:categoryGrooming');
      case 'first_aid':
        return t('tips:categoryFirstAid');
      default:
        return t('tips:categoryAll');
    }
  };

  const getSpeciesBadge = (sp: string[]) => {
    if (sp.includes('all')) return isBangla ? '🐾 সকল প্রাণী' : '🐾 All Pets';
    if (sp.includes('cat') && sp.includes('dog'))
      return isBangla ? '🐱 বিড়াল ও 🐶 কুকুর' : '🐱 Cats & 🐶 Dogs';
    if (sp.includes('cat')) return isBangla ? '🐱 বিড়াল' : '🐱 Cats';
    if (sp.includes('dog')) return isBangla ? '🐶 কুকুর' : '🐶 Dogs';
    return isBangla ? '🐾 পোষা প্রাণী' : '🐾 Pets';
  };

  const renderBodyParagraphs = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('## ')) {
        return (
          <Text
            key={idx}
            className="text-base font-bold text-gray-900 mt-4 mb-2"
          >
            {trimmed.replace('## ', '')}
          </Text>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const items = trimmed.split('\n');
        return (
          <View key={idx} className="my-2 pl-2">
            {items.map((it, i) => (
              <Text key={i} className="text-xs text-gray-700 leading-relaxed mb-1">
                • {it.replace(/^[-•]\s*/, '')}
              </Text>
            ))}
          </View>
        );
      }

      return (
        <Text
          key={idx}
          className="text-xs text-gray-700 leading-relaxed my-1.5"
        >
          {trimmed}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-1"
        >
          <Text className="text-primary font-bold text-base">←</Text>
          <Text className="text-primary font-semibold text-xs">
            {t('tips:backToTips')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/emergency')}
          className="bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg"
        >
          <Text className="text-red-700 text-xs font-bold">🚨 24/7</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Article Meta */}
        <View className="flex-row items-center gap-2 mb-3">
          <Text className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
            {getCategoryLabel(article.category)}
          </Text>
          <Text className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">
            {getSpeciesBadge(article.species)}
          </Text>
          <Text className="text-gray-400 text-xs ml-auto">
            ⏱️ {article.read_time_minutes} {t('tips:readTimeMinutes')}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-xl font-extrabold text-gray-900 leading-tight mb-3">
          {title}
        </Text>

        {/* Author info */}
        <View className="flex-row items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
            <Text className="text-sm">👨‍⚕️</Text>
          </View>
          <View>
            <Text className="text-xs font-bold text-gray-900">{author}</Text>
            <Text className="text-[10px] text-gray-500">
              {t('tips:publishedOn')}: 2026
            </Text>
          </View>
        </View>

        {/* Formatted Content */}
        <View className="mb-6">{renderBodyParagraphs(body)}</View>

        {/* Disclaimer Card */}
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6">
          <Text className="text-xs font-bold text-amber-900 mb-1">
            🛡️ {t('tips:disclaimerTitle')}
          </Text>
          <Text className="text-[11px] text-amber-800 leading-relaxed mb-3">
            {t('tips:disclaimerText')}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/map')}
            className="bg-amber-600 py-2 rounded-lg items-center"
          >
            <Text className="text-white text-xs font-bold">
              🏥 {t('tips:consultVetBtn')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <View className="mt-4 pt-4 border-t border-gray-200">
            <Text className="text-sm font-bold text-gray-900 mb-3">
              📚 {t('tips:relatedArticles')}
            </Text>
            {relatedArticles.map((rel) => (
              <TouchableOpacity
                key={rel.id}
                onPress={() =>
                  router.push({
                    pathname: '/tips/[slug]',
                    params: { slug: rel.slug },
                  })
                }
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-2.5"
              >
                <Text className="text-xs font-bold text-gray-900 mb-1">
                  {isBangla ? rel.title_bn : rel.title_en}
                </Text>
                <Text className="text-[11px] text-gray-500">
                  ⏱️ {rel.read_time_minutes} min • {getCategoryLabel(rel.category)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
