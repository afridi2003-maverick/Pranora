import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  getCallHistory,
  createSupabaseClient,
  type CallHistoryItem,
  type CallType,
} from '@pranora/api';

function formatDuration(seconds?: number): string {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function CallHistoryScreen() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [filterType, setFilterType] = useState<'all' | CallType>('all');
  const [items, setItems] = useState<CallHistoryItem[]>([]);

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
    getCallHistory(supabase, {
      call_type: filterType === 'all' ? undefined : filterType,
      limit: 20,
      offset: 0,
    }).then((res) => {
      if (active) setItems(res);
    });
    return () => {
      active = false;
    };
  }, [filterType]);

  const statusText = (status: CallHistoryItem['status']) => {
    switch (status) {
      case 'ended':
        return isBangla ? 'সম্পন্ন' : 'Completed';
      case 'missed':
        return isBangla ? 'মিসড' : 'Missed';
      case 'declined':
        return isBangla ? 'প্রত্যাখ্যাত' : 'Declined';
      case 'active':
        return isBangla ? 'সক্রিয়' : 'Active';
      default:
        return isBangla ? 'অপেক্ষামান' : 'Pending';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isBangla ? 'কল ইতিহাস' : 'Call History'}</Text>
        <Text style={styles.subtitle}>
          {isBangla ? 'আপনার গত পরামর্শসমূহ' : 'Your past consultations'}
        </Text>
      </View>

      <View style={styles.filters}>
        {(['all', 'audio', 'video'] as const).map((type) => {
          const active = filterType === type;
          const label =
            type === 'all'
              ? isBangla
                ? 'সব'
                : 'All'
              : type === 'audio'
                ? isBangla
                  ? 'অডিও'
                  : 'Audio'
                : isBangla
                  ? 'ভিডিও'
                  : 'Video';

          return (
            <TouchableOpacity
              key={type}
              style={[styles.filterTab, active && styles.filterTabActive]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              {isBangla ? 'এখনো কোনো কল ইতিহাস নেই' : 'No call history yet'}
            </Text>
            <Text style={styles.emptyDesc}>
              {isBangla
                ? 'পশু চিকিৎসকদের সাথে আপনার অডিও ও ভিডিও পরামর্শ এখানে দেখাবে।'
                : 'Your audio and video consultations with vets will appear here.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>
                  {item.callType === 'video' ? '📹' : '📞'}
                </Text>
              </View>
              <View>
                <Text style={styles.name}>{item.otherParticipantName}</Text>
                <Text style={styles.meta}>
                  {item.callType === 'video'
                    ? isBangla
                      ? 'ভিডিও কল'
                      : 'Video'
                    : isBangla
                      ? 'অডিও কল'
                      : 'Audio'}{' '}
                  • {new Date(item.createdAt).toLocaleDateString()}
                  {item.durationSeconds
                    ? ` • ${formatDuration(item.durationSeconds)}`
                    : ''}
                </Text>
              </View>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{statusText(item.status)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    paddingTop: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#2F7B53',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  meta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
  },
});
