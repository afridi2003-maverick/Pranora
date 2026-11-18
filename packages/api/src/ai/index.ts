import type { TypedSupabaseClient } from '../client';
import type {
  CreateAIConversationInput,
  SendAIMessageInput,
  GuardrailCheckResult,
} from '@pranora/validation';

export interface AIConversationRow {
  id: string;
  user_id: string;
  pet_id: string | null;
  share_pet_context: boolean;
  locale: 'bn' | 'en';
  created_at: string;
}

export interface AIMessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  is_voice: boolean;
  emergency_flag: boolean;
  handoff_flag: boolean;
  proposed_booking: {
    clinic_id?: string | null;
    clinic_name?: string | null;
    service_id?: string | null;
    service_name?: string | null;
    suggested_date?: string | null;
    notes?: string | null;
  } | null;
  created_at: string;
}

export interface PetContextInfo {
  name?: string;
  species?: string;
  breed?: string | null;
  age_months?: number | null;
  weight_kg?: number | null;
}

// ── Guardrail Rules & Pattern Detection ──────────────────────────────────────

const EMERGENCY_PATTERNS_BN = [
  /বিষ/i,
  /রক্ত/i,
  /শ্বাসকষ্ট/i,
  /দম\s*বন্ধ/i,
  /খিঁচুনি/i,
  /অচেতন/i,
  /বেহুঁশ/i,
  /কামড়ে/i,
  /সাপ/i,
  /পড়ে\s*গিয়ে/i,
  /প্যারালাইস/i,
  /স্ট্রোক/i,
  /জরুরি/i,
];

const EMERGENCY_PATTERNS_EN = [
  /poison/i,
  /toxic/i,
  /bleeding/i,
  /blood/i,
  /breathing/i,
  /choking/i,
  /seizure/i,
  /convulsion/i,
  /unconscious/i,
  /collapse/i,
  /bitten/i,
  /snake/i,
  /paralysis/i,
  /stroke/i,
  /emergency/i,
];

const MEDICINE_PATTERNS_BN = [
  /ওষুধ/i,
  /ঔষধ/i,
  /ডোজ/i,
  /প্যারাসিটামল/i,
  /প্যানাডল/i,
  /অ্যান্টিবায়োটিক/i,
  /রোগ\s*নির্ণয়/i,
  /প্রেসক্রিপশন/i,
];

const MEDICINE_PATTERNS_EN = [
  /medicine/i,
  /prescribe/i,
  /dosage/i,
  /paracetamol/i,
  /antibiotic/i,
  /diagnos/i,
  /drug/i,
  /prescription/i,
];

const HANDOFF_PATTERNS = [
  /human/i,
  /specialist/i,
  /doctor/i,
  /vet/i,
  /মানুষ/i,
  /বিশেষজ্ঞ/i,
  /ডাক্তার/i,
  /কল/i,
];

/**
 * Checks guardrails according to PRD §4.13:
 * 1. Strict emergency signs -> triggers emergency flag + instant vet emergency guidance.
 * 2. Never diagnose illnesses or prescribe medication/dosage.
 * 3. Human handoff recommendation when unsure or explicitly requested.
 */
export function evaluateUserMessageGuardrails(
  content: string,
  locale: 'bn' | 'en' = 'bn'
): GuardrailCheckResult {
  const isEmergency =
    EMERGENCY_PATTERNS_BN.some((regex) => regex.test(content)) ||
    EMERGENCY_PATTERNS_EN.some((regex) => regex.test(content));

  if (isEmergency) {
    const safeResponse =
      locale === 'bn'
        ? '⚠️ জরুরি সতর্কতা: আপনার পোষা প্রাণীটির লক্ষণগুলো গুরুতর হতে পারে। ঘরে চিকিৎসা না দিয়ে অবিলম্বে নিকটস্থ পশু চিকিৎসালয়ে বা ভেটেরিনারি জরুরি বিভাগে নিয়ে যান। প্রাণোরা এআই চিকিৎসকের বিকল্প নয়।'
        : '⚠️ EMERGENCY ALERT: These symptoms indicate a potential veterinary emergency. Do not attempt home remedies. Please proceed immediately to an emergency veterinary clinic. Pranora AI is not a substitute for a veterinarian.';

    return {
      action: 'emergency',
      emergency: true,
      handoff: true,
      reason: 'Emergency symptoms detected',
      safeResponse,
    };
  }

  const isMedicineOrDiagnosis =
    MEDICINE_PATTERNS_BN.some((regex) => regex.test(content)) ||
    MEDICINE_PATTERNS_EN.some((regex) => regex.test(content));

  if (isMedicineOrDiagnosis) {
    const safeResponse =
      locale === 'bn'
        ? '🚫 নীতিগত সতর্কতা: প্রাণোরা এআই কোনো রোগ নির্ণয় করতে পারে না এবং প্রেসক্রিপশন ওষুধ বা তার ডোজ নির্ধারণ করে না। ভুল ডোজ আপনার পোষা প্রাণীর জন্য মারাত্মক হতে পারে। দয়া করে একজন নিবন্ধিত পশু চিকিৎসকের পরামর্শ নিন।'
        : '🚫 Policy Restriction: Pranora AI cannot diagnose illnesses or recommend prescription medications or dosages. Improper medication can be life-threatening. Please consult a licensed veterinarian for clinical evaluation and prescription.';

    return {
      action: 'block_diagnosis_medicine',
      emergency: false,
      handoff: true,
      reason: 'Diagnosis and prescription medication requests are prohibited',
      safeResponse,
    };
  }

  const isHandoff = HANDOFF_PATTERNS.some((regex) => regex.test(content));

  return {
    action: isHandoff ? 'handoff' : 'allow',
    emergency: false,
    handoff: isHandoff,
  };
}

/**
 * Generates an automated safe answer for general pet care inquiries (diet, vaccines, grooming, care)
 */
export function generateAssistantReply(
  prompt: string,
  locale: 'bn' | 'en' = 'bn',
  petContext?: PetContextInfo | null
): { content: string; emergency_flag: boolean; handoff_flag: boolean } {
  const guardrail = evaluateUserMessageGuardrails(prompt, locale);

  if (guardrail.action === 'emergency') {
    return {
      content: guardrail.safeResponse ?? '',
      emergency_flag: true,
      handoff_flag: true,
    };
  }

  if (guardrail.action === 'block_diagnosis_medicine') {
    return {
      content: guardrail.safeResponse ?? '',
      emergency_flag: false,
      handoff_flag: true,
    };
  }

  // General safe answers
  const disclaimerBn = '\n\n💡 তথ্যসূত্র: সাধারণ যত্ন ও পুষ্টি নির্দেশিকা। এটি কোনো ভেটেরিনারি চিকিৎসা পরামর্শ নয়।';
  const disclaimerEn = '\n\n💡 Disclaimer: General care & nutritional guidance only. Not veterinary medical advice.';

  let petPrefix = '';
  if (petContext && petContext.name) {
    petPrefix =
      locale === 'bn'
        ? `[${petContext.name} (${petContext.species ?? 'পোষা প্রাণী'}) এর তথ্যের ভিত্তিতে]: `
        : `[Based on ${petContext.name}'s info (${petContext.species ?? 'Pet'})]: `;
  }

  const lower = prompt.toLowerCase();

  // Diet / Food
  if (lower.includes('খাবার') || lower.includes('food') || lower.includes('diet') || lower.includes('পুষ্টি')) {
    const reply =
      locale === 'bn'
        ? `${petPrefix}পোষা প্রাণীর জন্য সুষম খাদ্য অত্যন্ত গুরুত্বপূর্ণ। মিষ্টি, পেঁয়াজ, রসুন, চকলেট ও আঙুর খাওয়ানো থেকে বিরত থাকুন। সর্বদা পরিষ্কার পানীয় জল সরবরাহ করুন এবং বয়স অনুযায়ী সঠিক প্রোটিনযুক্ত খাবার বেছে নিন।${disclaimerBn}`
        : `${petPrefix}A balanced diet is vital for your pet. Avoid toxic items like chocolate, onions, garlic, raisins, and sweets. Always provide fresh water and age-appropriate formulated food.${disclaimerEn}`;

    return { content: reply, emergency_flag: false, handoff_flag: false };
  }

  // Vaccination
  if (lower.includes('ভ্যাকসিন') || lower.includes('টিকা') || lower.includes('vaccin')) {
    const reply =
      locale === 'bn'
        ? `${petPrefix}কুকুর ও বিড়ালের জন্য জলাতঙ্ক (Rabies) এবং সংক্রামক রোগের প্রাথমিক ভ্যাকসিনেশন রুটিন মেনে চলা আবশ্যক। সাধারণত ৬-৮ সপ্তাহ বয়স থেকে ভ্যাকসিন শুরু হয়। সঠিক সময়সূচি দেখতে অ্যাপের "টিকা তালিকা" বিভাগটি দেখুন।${disclaimerBn}`
        : `${petPrefix}Core vaccinations such as Rabies and combination vaccines are essential. Vaccination schedules generally begin around 6-8 weeks of age. Check the "Vaccinations" section in the app for your schedule.${disclaimerEn}`;

    return { content: reply, emergency_flag: false, handoff_flag: false };
  }

  // Bath / Grooming
  if (lower.includes('গোসল') || lower.includes('groom') || lower.includes('bath') || lower.includes('পরিষ্কার')) {
    const reply =
      locale === 'bn'
        ? `${petPrefix}নিয়মিত ব্রাশ করা লোম ঝরে পড়া কমাতে সাহায্য করে। বিড়াল নিজে পরিষ্কার রাখে তাই খুব ঘন ঘন গোসলের প্রয়োজন হয় না। কুকুরের ক্ষেত্রে মাসে ১-২ বার পেট-ফ্রেন্ডলি শ্যাম্পু দিয়ে গোসল করানো নিরাপদ।${disclaimerBn}`
        : `${petPrefix}Regular brushing prevents matting and reduces shedding. Cats groom themselves frequently, while dogs can be bathed once or twice a month using pet-safe shampoo.${disclaimerEn}`;

    return { content: reply, emergency_flag: false, handoff_flag: false };
  }

  // Default friendly advice
  const fallback =
    locale === 'bn'
      ? `${petPrefix}আপনার প্রশ্নের জন্য ধন্যবাদ! আপনার পোষা প্রাণীর সুস্থতার জন্য নিয়মিত স্বাস্থ্য পরীক্ষা, সুষম খাবার ও পর্যাপ্ত যত্ন নিশ্চিত করুন। কোনো অস্বাভাবিক উপসর্গ দেখা দিলে একজন পশু চিকিৎসকের শরণাপন্ন হন।${disclaimerBn}`
      : `${petPrefix}Thank you for your question! For optimal pet health, ensure regular preventive checkups, high-quality nutrition, and a stress-free environment. Please visit a vet if you notice abnormal behavior.${disclaimerEn}`;

  return {
    content: fallback,
    emergency_flag: false,
    handoff_flag: guardrail.handoff,
  };
}

// ── In-Memory Fallback for Client Testing / Offline Mode ─────────────────────

let mockConversations: AIConversationRow[] = [
  {
    id: 'ai-conv-default',
    user_id: 'mock-user-1',
    pet_id: null,
    share_pet_context: false,
    locale: 'bn',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

let mockMessages: AIMessageRow[] = [
  {
    id: 'ai-msg-1',
    conversation_id: 'ai-conv-default',
    role: 'assistant',
    content: 'স্বাগতম! আমি প্রাণোরা এআই সহকারী। আপনার পোষা প্রাণীর যত্ন, খাবার বা সাধারণ প্রশ্নের উত্তর দিতে আমি প্রস্তুত। মনে রাখবেন, আমি কোনো চিকিৎসকের বিকল্প নই।',
    is_voice: false,
    emergency_flag: false,
    handoff_flag: false,
    proposed_booking: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

// ── API Functions ────────────────────────────────────────────────────────────

export async function listAIConversations(
  client: TypedSupabaseClient,
  userId: string
): Promise<{ data: AIConversationRow[]; error?: string }> {
  try {
    const { data, error } = await client
      .from('ai_conversations' as never)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: mockConversations.filter((c) => c.user_id === userId) };
    }
    return { data: (data ?? []) as unknown as AIConversationRow[] };
  } catch {
    return { data: mockConversations.filter((c) => c.user_id === userId) };
  }
}

export async function createAIConversation(
  client: TypedSupabaseClient,
  userId: string,
  payload: CreateAIConversationInput
): Promise<{ data: AIConversationRow | null; error?: string }> {
  try {
    const { data, error } = await client
      .from('ai_conversations' as never)
      .insert({
        user_id: userId,
        pet_id: payload.pet_id ?? null,
        share_pet_context: payload.share_pet_context ?? false,
        locale: payload.locale ?? 'bn',
      } as never)
      .select()
      .single();

    if (error) {
      const fallback: AIConversationRow = {
        id: `ai-conv-${Date.now()}`,
        user_id: userId,
        pet_id: payload.pet_id ?? null,
        share_pet_context: payload.share_pet_context ?? false,
        locale: payload.locale ?? 'bn',
        created_at: new Date().toISOString(),
      };
      mockConversations.unshift(fallback);
      return { data: fallback };
    }

    return { data: data as unknown as AIConversationRow };
  } catch {
    const fallback: AIConversationRow = {
      id: `ai-conv-${Date.now()}`,
      user_id: userId,
      pet_id: payload.pet_id ?? null,
      share_pet_context: payload.share_pet_context ?? false,
      locale: payload.locale ?? 'bn',
      created_at: new Date().toISOString(),
    };
    mockConversations.unshift(fallback);
    return { data: fallback };
  }
}

export async function listAIMessages(
  client: TypedSupabaseClient,
  conversationId: string
): Promise<{ data: AIMessageRow[]; error?: string }> {
  try {
    const { data, error } = await client
      .from('ai_messages' as never)
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return { data: mockMessages.filter((m) => m.conversation_id === conversationId) };
    }
    return { data: (data ?? []) as unknown as AIMessageRow[] };
  } catch {
    return { data: mockMessages.filter((m) => m.conversation_id === conversationId) };
  }
}

export async function sendAIMessage(
  client: TypedSupabaseClient,
  payload: SendAIMessageInput,
  options?: {
    locale?: 'bn' | 'en';
    petContext?: PetContextInfo | null;
  }
): Promise<{
  data: { userMessage: AIMessageRow; assistantMessage: AIMessageRow } | null;
  error?: string;
}> {
  const locale = options?.locale ?? 'bn';
  const petContext = options?.petContext ?? null;

  const userMsgId = `ai-msg-${Date.now()}`;
  const assistantMsgId = `ai-msg-${Date.now() + 1}`;
  const now = new Date().toISOString();

  // Guardrail check and generate reply
  const reply = generateAssistantReply(payload.content, locale, petContext);

  const userMsg: AIMessageRow = {
    id: userMsgId,
    conversation_id: payload.conversation_id,
    role: 'user',
    content: payload.content,
    is_voice: payload.is_voice ?? false,
    emergency_flag: false,
    handoff_flag: false,
    proposed_booking: null,
    created_at: now,
  };

  const assistantMsg: AIMessageRow = {
    id: assistantMsgId,
    conversation_id: payload.conversation_id,
    role: 'assistant',
    content: reply.content,
    is_voice: false,
    emergency_flag: reply.emergency_flag,
    handoff_flag: reply.handoff_flag,
    proposed_booking: null,
    created_at: new Date(Date.now() + 500).toISOString(),
  };

  try {
    // Attempt inserting both into database
    await client.from('ai_messages' as never).insert([
      {
        conversation_id: payload.conversation_id,
        role: 'user',
        content: payload.content,
        is_voice: payload.is_voice ?? false,
      },
      {
        conversation_id: payload.conversation_id,
        role: 'assistant',
        content: reply.content,
        emergency_flag: reply.emergency_flag,
        handoff_flag: reply.handoff_flag,
      },
    ] as never);
  } catch {
    // If DB fails, fallback to in-memory store
  }

  mockMessages.push(userMsg, assistantMsg);
  return { data: { userMessage: userMsg, assistantMessage: assistantMsg } };
}
