import type {
  RescueCaseRow,
  AnimalReportRow,
  RescueCaseUpdateRow,
} from '@pranora/api';

export interface RescueCaseFullDetails {
  rescueCase: RescueCaseRow;
  report: AnimalReportRow;
  updates: (RescueCaseUpdateRow & { author_name?: string; author_role?: string })[];
}

export const MOCK_CASE_DETAILS: Record<string, RescueCaseFullDetails> = {
  'case-201': {
    rescueCase: {
      id: 'case-201',
      report_id: 'rep-301',
      status: 'rescue_in_progress',
      shelter_id: null,
      assigned_rescuer_id: 'rescuer-current',
      pet_id: null,
      outcome: null,
      outcome_note: null,
      closed_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    report: {
      id: 'rep-301',
      reporter_id: 'user-reporter-1',
      kind: 'injured',
      species: 'dog',
      urgency: 'critical',
      pet_id: null,
      last_seen_at: null,
      contact_phone: '+8801711223344',
      description: 'গাড়ির ধাক্কায় পেছনের পায়ে মারাত্মক আঘাত পেয়েছে। রক্তক্ষরণ হচ্ছে, দ্রুত প্রাথমিক চিকিৎসা ও পরিবহন প্রয়োজন।',
      photos: [
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
      ],
      location: 'POINT(90.3667 23.8067)',
      area_text: 'মিরপুর ১০ গোল চত্বর, ফায়ার সার্ভিসের বিপরীত পাশে, ঢাকা',
      upazila_id: null,
      district_id: 1,
      status: 'rescue_in_progress',
      duplicate_of: null,
      reviewed_by: 'user-admin-1',
      reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    updates: [
      {
        id: 'upd-001',
        case_id: 'case-201',
        author_id: 'user-admin-1',
        author_name: 'অ্যাডমিন ডেস্ক',
        author_role: 'admin',
        status: 'assigned',
        note: 'কেসটি মূল্যায়ন করে জরুরি রেসকিউ টিম তানভীর আহমেদকে দায়িত্ব প্রদান করা হয়েছে।',
        photos: [],
        created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      },
      {
        id: 'upd-002',
        case_id: 'case-201',
        author_id: 'rescuer-current',
        author_name: 'তানভীর আহমেদ',
        author_role: 'rescuer',
        status: 'rescue_in_progress',
        note: 'দায়িত্ব গ্রহণ করেছি। আমি প্রাথমিক চিকিৎসার কিট ও ক্যারিয়ার নিয়ে রওনা হয়েছি।',
        photos: [],
        created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        id: 'upd-003',
        case_id: 'case-201',
        author_id: 'rescuer-current',
        author_name: 'তানভীর আহমেদ',
        author_role: 'rescuer',
        status: null,
        note: 'ঘটনাস্থলে পৌঁছে প্রাণীটির ব্যান্ডেজ ও রক্তক্ষরণ বন্ধ করা হয়েছে। হাসপাতালে নিয়ে যাচ্ছি।',
        photos: [
          'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600',
        ],
        created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    ],
  },
};
