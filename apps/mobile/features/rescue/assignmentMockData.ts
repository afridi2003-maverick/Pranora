import type {
  RescueAssignmentRow,
  AnimalReportRow,
  RescueCaseRow,
} from '@pranora/api';

export interface RescuerProfileBrief {
  id: string;
  name: string;
  name_bn: string;
  phone: string;
  district_name_bn: string;
  district_name_en: string;
  active_cases_count: number;
  is_available: boolean;
}

export interface AssignmentWithReport {
  assignment: RescueAssignmentRow;
  rescueCase: RescueCaseRow;
  report: AnimalReportRow;
}

export const MOCK_VERIFIED_RESCUERS: RescuerProfileBrief[] = [
  {
    id: 'rescuer-001',
    name: 'Tanvir Ahmed',
    name_bn: 'তানভীর আহমেদ',
    phone: '+8801712345678',
    district_name_bn: 'ঢাকা (মিরপুর, উত্তরা)',
    district_name_en: 'Dhaka (Mirpur, Uttara)',
    active_cases_count: 1,
    is_available: true,
  },
  {
    id: 'rescuer-002',
    name: 'Sultana Razia',
    name_bn: 'সুলতানা রাজিয়া',
    phone: '+8801819876543',
    district_name_bn: 'ঢাকা (ধানমন্ডি, মোহাম্মদপুর)',
    district_name_en: 'Dhaka (Dhanmondi, Mohammadpur)',
    active_cases_count: 0,
    is_available: true,
  },
  {
    id: 'rescuer-003',
    name: 'Rashedul Karim',
    name_bn: 'রাশেদুল করিম',
    phone: '+8801911223344',
    district_name_bn: 'চট্টগ্রাম (জিইসি, আগ্রাবাদ)',
    district_name_en: 'Chattogram (GEC, Agrabad)',
    active_cases_count: 2,
    is_available: false,
  },
];

export const MOCK_ASSIGNMENTS: AssignmentWithReport[] = [
  {
    assignment: {
      id: 'asg-101',
      case_id: 'case-201',
      rescuer_id: 'rescuer-current',
      assigned_by: 'user-admin-1',
      status: 'offered',
      decline_reason: null,
      responded_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    rescueCase: {
      id: 'case-201',
      report_id: 'rep-301',
      status: 'assigned',
      shelter_id: null,
      assigned_rescuer_id: 'rescuer-current',
      pet_id: null,
      outcome: null,
      outcome_note: null,
      closed_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
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
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
      ],
      location: null,
      area_text: 'মিরপুর ১০ গোল চত্বর, ফায়ার সার্ভিসের বিপরীত পাশে, ঢাকা',
      upazila_id: null,
      district_id: 1,
      status: 'assigned',
      duplicate_of: null,
      reviewed_by: 'user-admin-1',
      reviewed_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
  },
  {
    assignment: {
      id: 'asg-102',
      case_id: 'case-202',
      rescuer_id: 'rescuer-current',
      assigned_by: 'user-shelter-1',
      status: 'accepted',
      decline_reason: null,
      responded_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    rescueCase: {
      id: 'case-202',
      report_id: 'rep-302',
      status: 'rescue_in_progress',
      shelter_id: 'shelter-01',
      assigned_rescuer_id: 'rescuer-current',
      pet_id: null,
      outcome: null,
      outcome_note: null,
      closed_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    report: {
      id: 'rep-302',
      reporter_id: 'user-reporter-2',
      kind: 'abandoned',
      species: 'cat',
      urgency: 'high',
      pet_id: null,
      last_seen_at: null,
      contact_phone: '+8801822334455',
      description: 'একটি কার্টন বাক্সে ৩টি বিড়ালছানা রেখে গেছে। এখনো চোখ খোলেনি, কৃত্রিম দুধ ও উষ্ণ আশ্রয় প্রয়োজন।',
      photos: [
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
      ],
      location: null,
      area_text: 'ধানমন্ডি লেক পার্ক, রবীন্দ্র সরোবরের নিকট, ঢাকা',
      upazila_id: null,
      district_id: 1,
      status: 'rescue_in_progress',
      duplicate_of: null,
      reviewed_by: 'user-shelter-1',
      reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  },
];
