import {
  evaluateUserMessageGuardrails,
  detectBookingIntent,
  SAMPLE_VOICE_QUERIES_BN,
  formatVoiceDuration,
} from '../index';

describe('AI Guardrails & Safety Policy (§4.13, AI-1, AI-2, AI-5)', () => {
  it('triggers emergency alert for critical life-threatening symptoms in Bangla', () => {
    const res = evaluateUserMessageGuardrails('আমার কুকুর বমি করছে আর কাঁপছে', 'bn');
    expect(res.emergency).toBe(true);
    expect(res.action).toBe('emergency');
    expect(res.safeResponse).toContain('জরুরি সতর্কতা');
  });

  it('triggers emergency alert for poison / chemical exposure', () => {
    const res = evaluateUserMessageGuardrails('বিড়াল বিষ খেয়েছে দ্রুত কি করব', 'bn');
    expect(res.emergency).toBe(true);
    expect(res.action).toBe('emergency');
  });

  it('blocks medicine and dosage recommendations', () => {
    const res = evaluateUserMessageGuardrails('কুকুরকে কী অ্যান্টিবায়োটিক বা নাপা সিরাপ কতটুকু দেব?', 'bn');
    expect(res.action).toBe('block_diagnosis_medicine');
    expect(res.safeResponse).toContain('নীতিগত সতর্কতা');
    expect(res.safeResponse).toContain('BVC');
  });

  it('detects explicit handoff requests to speak with human vet or helpline', () => {
    const res = evaluateUserMessageGuardrails('আমি একজন ডাক্তারের সাথে সরাসরি কথা বলতে চাই', 'bn');
    expect(res.action).toBe('handoff');
    expect(res.handoff).toBe(true);
  });

  it('detects appointment booking intent', () => {
    const booking = detectBookingIntent('আমি ধানমন্ডির ক্লিনিকে অ্যাপয়েন্টমেন্ট নিতে চাই');
    expect(booking).not.toBeNull();
    expect(booking?.clinic_name).toBe('ঢাকা সেন্ট্রাল ভেটেরিনারি ক্লিনিক (ধানমন্ডি)');
  });

  it('formats voice duration correctly', () => {
    expect(formatVoiceDuration(65)).toBe('1:05');
    expect(formatVoiceDuration(9)).toBe('0:09');
    expect(formatVoiceDuration(120)).toBe('2:00');
  });

  it('contains valid sample Bangla voice prompts', () => {
    expect(SAMPLE_VOICE_QUERIES_BN.length).toBeGreaterThan(0);
    expect(SAMPLE_VOICE_QUERIES_BN[0]).toContain('বিড়াল');
  });
});
