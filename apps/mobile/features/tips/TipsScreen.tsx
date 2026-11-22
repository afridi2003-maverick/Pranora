import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import type { Article, ArticleCategory } from '@pranora/api';
import { MOCK_ARTICLES } from '@pranora/api';

export interface TipsScreenProps {
  initialArticles?: Article[];
}

export function TipsScreen({ initialArticles }: TipsScreenProps) {
  const router = useRouter();
  const { t, isBangla } = useLocale();

  const [articles] = useState<Article[]>(() => initialArticles ?? MOCK_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'cat' | 'dog'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { key: ArticleCategory; label: string; icon: string }[] = [
    { key: 'all', label: t('tips:categoryAll'), icon: '📚' },
    { key: 'diet', label: t('tips:categoryDiet'), icon: '🥩' },
    { key: 'vaccine', label: t('tips:categoryVaccine'), icon: '💉' },
    { key: 'health', label: t('tips:categoryHealth'), icon: '🩺' },
    { key: 'grooming', label: t('tips:categoryGrooming'), icon: '✂️' },
    { key: 'first_aid', label: t('tips:categoryFirstAid'), icon: '🩹' },
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (selectedCategory !== 'all' && a.category !== selectedCategory) {
        return false;
      }
      if (
        selectedSpecies !== 'all' &&
        !a.species.includes(selectedSpecies) &&
        !a.species.includes('all')
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (isBangla ? a.title_bn : a.title_en).toLowerCase();
        const excerpt = (
          isBangla ? a.excerpt_bn ?? '' : a.excerpt_en ?? ''
        ).toLowerCase();
        return title.includes(query) || excerpt.includes(query);
      }
      return true;
    });
  }, [articles, selectedCategory, selectedSpecies, searchQuery, isBangla]);

  const featuredArticle = useMemo(() => {
    return articles.find((a) => a.is_featured) ?? articles[0];
  }, [articles]);

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">
            📚 {t('tips:pageTitle')}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
            {t('tips:pageSubtitle')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/assistant')}
          className="bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg flex-row items-center gap-1"
        >
          <Text className="text-xs font-bold text-green-700">🤖 AI</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="bg-white px-4 pt-2 pb-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <Text className="text-base mr-2">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('tips:searchPlaceholder')}
            placeholderTextColor="#9ca3af"
            className="flex-1 text-sm text-gray-900 py-0"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-gray-400 text-xs px-1">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories & Species Filter */}
      <View className="bg-white border-b border-gray-200 py-2.5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border ${
                selectedCategory === cat.key
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.8}
            >
              <Text className="text-xs">{cat.icon}</Text>
              <Text
                className={`text-xs font-semibold ${
                  selectedCategory === cat.key ? 'text-white' : 'text-gray-700'
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row items-center px-4 mt-2.5 gap-2">
          {(['all', 'cat', 'dog'] as const).map((sp) => (
            <TouchableOpacity
              key={sp}
              onPress={() => setSelectedSpecies(sp)}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                selectedSpecies === sp ? 'bg-gray-200' : 'bg-transparent'
              }`}
            >
              <Text className="text-xs text-gray-700 font-medium">
                {sp === 'all'
                  ? isBangla
                    ? 'সকল'
                    : 'All'
                  : sp === 'cat'
                  ? '🐱 ' + (isBangla ? 'বিড়াল' : 'Cat')
                  : '🐶 ' + (isBangla ? 'কুকুর' : 'Dog')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main List */}
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          !searchQuery && selectedCategory === 'all' && featuredArticle ? (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/tips/[slug]',
                  params: { slug: featuredArticle.slug },
                })
              }
              className="bg-emerald-800 rounded-2xl p-5 mb-4 shadow-sm"
              activeOpacity={0.9}
            >
              <View className="flex-row items-center gap-1.5 mb-2">
                <Text className="bg-amber-400 text-zinc-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  ⭐ {t('tips:featuredTitle')}
                </Text>
                <Text className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {getCategoryLabel(featuredArticle.category)}
                </Text>
              </View>

              <Text className="text-white font-bold text-base leading-snug mb-1.5">
                {isBangla ? featuredArticle.title_bn : featuredArticle.title_en}
              </Text>

              <Text
                className="text-white/80 text-xs leading-relaxed mb-3"
                numberOfLines={2}
              >
                {isBangla ? featuredArticle.excerpt_bn : featuredArticle.excerpt_en}
              </Text>

              <View className="flex-row items-center justify-between pt-2 border-t border-white/20">
                <Text className="text-white/70 text-[11px]">
                  ⏱️ {featuredArticle.read_time_minutes} {t('tips:readTimeMinutes')}
                </Text>
                <Text className="text-white font-bold text-xs">
                  {isBangla ? 'পড়ুন →' : 'Read →'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item }) => {
          const title = isBangla ? item.title_bn : item.title_en;
          const excerpt = isBangla ? item.excerpt_bn : item.excerpt_en;
          const author = isBangla ? item.author_name_bn : item.author_name_en;

          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/tips/[slug]',
                  params: { slug: item.slug },
                })
              }
              className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-xs"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-primary font-semibold text-xs">
                  {getCategoryLabel(item.category)}
                </Text>
                <Text className="text-gray-400 text-[11px]">
                  ⏱️ {item.read_time_minutes} {t('tips:readTimeMinutes')}
                </Text>
              </View>

              <Text className="text-sm font-bold text-gray-900 leading-snug mb-1">
                {title}
              </Text>

              {excerpt ? (
                <Text
                  className="text-xs text-gray-600 leading-relaxed mb-3"
                  numberOfLines={2}
                >
                  {excerpt}
                </Text>
              ) : null}

              <View className="flex-row items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                <Text className="text-gray-500 text-[11px]">
                  {getSpeciesBadge(item.species)}
                </Text>
                <Text className="text-gray-500 text-[11px] font-medium" numberOfLines={1}>
                  {author}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-3xl mb-2">🔍</Text>
            <Text className="text-sm font-bold text-gray-700">
              {t('tips:emptySearch')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
