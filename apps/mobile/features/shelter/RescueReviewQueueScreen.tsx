import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  getRescueReviewQueue,
  reviewAnimalReport,
  getMyShelterProfile,
  type AnimalReportRow,
  type ShelterProviderRow,
} from '@pranora/api';

const MOCK_REVIEW_REPORTS: AnimalReportRow[] = [
  {
    id: 'rep-m-urg-1',
    reporter_id: 'usr-rep-101',
    kind: 'injured',
    pet_id: null,
    species: 'dog',
    urgency: 'critical',
    last_seen_at: new Date(Date.now() - 15 * 60000).toISOString(),
    contact_phone: '+8801712345678',
    description: 'Hit by speeding vehicle near Farmgate footbridge, severe bleeding from hind leg.',
    photos: [],
    location: null,
    area_text: 'Farmgate Bus Stand, Tejgaon, Dhaka',
    upazila_id: 1,
    district_id: 1,
    status: 'submitted',
    duplicate_of: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rep-m-urg-2',
    reporter_id: 'usr-rep-102',
    kind: 'abandoned',
    pet_id: null,
    species: 'cat',
    urgency: 'high',
    last_seen_at: new Date(Date.now() - 45 * 60000).toISOString(),
    contact_phone: '+8801812345678',
    description: 'Three young kittens dumped in heavy rain inside an open cardboard box near Gulshan 2.',
    photos: [],
    location: null,
    area_text: 'Road 62, Gulshan 2, Dhaka',
    upazila_id: 1,
    district_id: 1,
    status: 'submitted',
    duplicate_of: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rep-m-urg-3',
    reporter_id: 'usr-rep-103',
    kind: 'injured',
    pet_id: null,
    species: 'bird',
    urgency: 'medium',
    last_seen_at: new Date(Date.now() - 120 * 60000).toISOString(),
    contact_phone: '+8801912345678',
    description: 'Pigeon with tangled kite string on wing, unable to fly.',
    photos: [],
    location: null,
    area_text: 'Sector 3, Uttara, Dhaka',
    upazila_id: 1,
    district_id: 1,
    status: 'submitted',
    duplicate_of: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function RescueReviewQueueScreen() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [reports, setReports] = useState<AnimalReportRow[]>(MOCK_REVIEW_REPORTS);
  const [shelter, setShelter] = useState<ShelterProviderRow | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  useEffect(() => {
    async function loadQueue() {
      try {
        const profile = await getMyShelterProfile(null as any);
        if (profile) setShelter(profile);

        const data = await getRescueReviewQueue(null as any);
        if (data && data.length > 0) {
          setReports(data);
        }
      } catch (err) {
        console.warn('Mobile rescue review queue warning:', err);
      }
    }
    loadQueue();
  }, []);

  const filteredReports = useMemo(() => {
    if (urgencyFilter === 'all') return reports;
    return reports.filter((r) => r.urgency === urgencyFilter);
  }, [reports, urgencyFilter]);

  const criticalCount = useMemo(
    () => reports.filter((r) => r.urgency === 'critical').length,
    [reports]
  );

  const handleAccept = async (reportId: string) => {
    try {
      await reviewAnimalReport(null as any, reportId, true, shelter?.id);
    } catch {
      // optimistic
    }
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleDecline = async (reportId: string) => {
    try {
      await reviewAnimalReport(null as any, reportId, false);
    } catch {
      // optimistic
    }
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleCall = (phone: string | null) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827' }}>
          {isBn ? 'প্রাণী উদ্ধার রিভিউ কিউ' : 'Rescue Review Queue'}
        </Text>
        <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          {isBn ? 'জরুরি রিপোর্টগুলো অগ্রাধিকার ভিত্তিতে প্রথমে দেখানো হচ্ছে' : 'Urgent reports prioritized at the top of the queue'}
        </Text>
      </View>

      {/* Critical Alert Banner */}
      {criticalCount > 0 && (
        <View style={{ backgroundColor: '#fef2f2', borderLeftWidth: 4, borderLeftColor: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#dc2626' }}>
            {isBn ? `⚠️ ${criticalCount}টি সঙ্কটপূর্ণ রিপোর্ট অপেক্ষমাণ` : `⚠️ ${criticalCount} Critical Report(s) Awaiting Review`}
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            {isBn ? 'দ্রুত ব্যবস্থা গ্রহণ করুন।' : 'Immediate shelter intake or dispatch recommended.'}
          </Text>
        </View>
      )}

      {/* Urgency Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((lvl) => {
            const active = urgencyFilter === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => setUrgencyFilter(lvl)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: active ? '#10b981' : '#ffffff',
                  borderWidth: 1,
                  borderColor: active ? '#10b981' : '#d1d5db',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: active ? 'bold' : '500', color: active ? '#ffffff' : '#374151' }}>
                  {lvl === 'all' ? (isBn ? 'সকল' : 'All') :
                   lvl === 'critical' ? (isBn ? 'সঙ্কট' : 'Critical') :
                   lvl === 'high' ? (isBn ? 'উচ্চ' : 'High') :
                   lvl === 'medium' ? (isBn ? 'মাঝারি' : 'Medium') :
                   (isBn ? 'সাধারণ' : 'Low')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Report Cards */}
      <View style={{ gap: 12 }}>
        {filteredReports.length === 0 ? (
          <View style={{ backgroundColor: '#ffffff', padding: 24, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>
              {isBn ? 'কোনো অপেক্ষমাণ রিপোর্ট নেই।' : 'No reports matching criteria.'}
            </Text>
          </View>
        ) : (
          filteredReports.map((item) => {
            const isCrit = item.urgency === 'critical';
            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isCrit ? '#fecaca' : '#e5e7eb',
                  borderLeftWidth: 4,
                  borderLeftColor: isCrit ? '#ef4444' : item.urgency === 'high' ? '#f59e0b' : '#9ca3af',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#111827', textTransform: 'capitalize' }}>
                    {item.species} • {item.kind}
                  </Text>
                  <View style={{ backgroundColor: isCrit ? '#fee2e2' : '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: isCrit ? '#dc2626' : '#4b5563' }}>
                      {item.urgency.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 13, color: '#374151', lineHeight: 18, marginBottom: 8 }}>
                  {item.description}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>
                    📍 {item.area_text}
                  </Text>
                  {item.contact_phone && (
                    <TouchableOpacity onPress={() => handleCall(item.contact_phone)}>
                      <Text style={{ fontSize: 12, color: '#10b981', fontWeight: 'bold' }}>
                        📞 {item.contact_phone}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
                  <TouchableOpacity
                    onPress={() => handleDecline(item.id)}
                    style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }}
                  >
                    <Text style={{ fontSize: 12, color: '#374151' }}>{isBn ? 'বাতিল' : 'Decline'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleAccept(item.id)}
                    style={{ backgroundColor: isCrit ? '#ef4444' : '#10b981', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 }}
                  >
                    <Text style={{ fontSize: 12, color: '#ffffff', fontWeight: 'bold' }}>
                      {isBn ? 'শেল্টারে গ্রহণ' : 'Admit & Dispatch'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
