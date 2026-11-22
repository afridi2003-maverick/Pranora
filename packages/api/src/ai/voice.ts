/**
 * AI Voice Assistant Utilities (§8.11, AI-6, PRD §4.13)
 * Provides Bangla & English STT (Speech-to-Text), TTS (Text-to-Speech) coordination,
 * waveform generation, duration formatting, and audio transcription helpers.
 */

export interface VoiceTranscriptResult {
  transcript: string;
  isBangla: boolean;
  confidence: number;
  durationMs?: number;
}

export interface VoicePlaybackState {
  isPlaying: boolean;
  messageId: string | null;
  progress: number;
}

/**
 * Formats a duration in seconds to standard MM:SS display
 */
export function formatVoiceDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Generates an array of normalized bar heights (0.2 to 1.0) for rendering
 * audio waveforms on voice message bubbles.
 */
export function generateVoiceWaveform(seedLength: number = 18, seed: number = 42): number[] {
  const bars: number[] = [];
  let current = (seed % 100) / 100;

  for (let i = 0; i < seedLength; i++) {
    current = Math.sin(i * 0.8 + current * 2) * 0.4 + 0.6;
    bars.push(Math.max(0.2, Math.min(1.0, parseFloat(current.toFixed(2)))));
  }

  return bars;
}

/**
 * Common sample Bangla & English voice queries for quick push-to-speak testing
 */
export const SAMPLE_VOICE_QUERIES_BN = [
  'আমার বিড়ালের বয়স চার মাস, তাকে কী খাবার দেব?',
  'কুকুরকে কত দিন পর পর গোসল করানো উচিত?',
  'আমার পোষা প্রাণীর প্রাথমিক টিকার সময়সূচি কী?',
  'আমার বিড়াল কিছু খাচ্ছে না, একজন পশু চিকিৎসকের সাথে কথা বলতে চাই',
  'জরুরি ক্লিনিকে অ্যাপয়েন্টমেন্ট বুক করতে সাহায্য করুন',
];

export const SAMPLE_VOICE_QUERIES_EN = [
  'What diet is recommended for a 4-month kitten?',
  'How often should I bathe and groom my dog?',
  'What is the essential vaccination schedule?',
  'My pet is not eating, I want to consult a veterinarian',
  'Help me book an appointment at a nearby clinic',
];

/**
 * Retrieves a random sample voice prompt according to current locale
 */
export function getRandomVoiceSample(locale: 'bn' | 'en' = 'bn'): string {
  const list = locale === 'bn' ? SAMPLE_VOICE_QUERIES_BN : SAMPLE_VOICE_QUERIES_EN;
  const index = Math.floor(Math.random() * list.length);
  return list[index] ?? list[0]!;
}

/**
 * Cleans raw speech recognition transcript
 */
export function cleanVoiceTranscript(rawText: string): string {
  return rawText.trim().replace(/\s+/g, ' ');
}
