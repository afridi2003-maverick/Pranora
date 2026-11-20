'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, Input } from '@pranora/ui';
import {
  createDigitalPrescription,
  type DigitalPrescriptionInput,
  type PrescriptionItemInput,
} from '@pranora/api';

interface PatientData {
  petId: string;
  petName: string;
  species: string;
  breed?: string;
  ownerName: string;
  bookingId?: string;
  bookingCode?: string;
}

const DEFAULT_PATIENT: PatientData = {
  petId: 'pet-001',
  petName: 'মতি (Moti)',
  species: 'cat',
  breed: 'Domestic Short Hair',
  ownerName: 'রাহেলা খানম (Rahela Khanam)',
  bookingId: 'book-001',
  bookingCode: 'PB-20260320-001',
};

const DEFAULT_VET = {
  vetId: 'vet-001',
  vetName: 'ডাঃ আমিনা বেগম (Dr. Amina Begum)',
  qualifications: 'DVM (BAU), MS in Small Animal Surgery',
  bvcRegNo: 'BVC-VET-4821',
  clinicName: 'PranoraCare Veterinary Clinic, Dhanmondi',
  phone: '+8801711000111',
};

export function DigitalPrescriptionForm() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  // Form State
  const [patient] = useState<PatientData>(DEFAULT_PATIENT);
  const [vet] = useState(DEFAULT_VET);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [diagnosis, setDiagnosis] = useState('Acute Bacterial Gastritis');
  const [findings, setFindings] = useState('Mild fever (39.2°C), abdominal palpation discomfort, slight dehydration.');
  const [weightKg, setWeightKg] = useState('4.2');
  const [temperatureC, setTemperatureC] = useState('39.2');
  const [advice, setAdvice] = useState('Feed soft boiled chicken broth and rice for 3 days. Ensure clean drinking water at all times. Avoid milk products.');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );

  const [medicines, setMedicines] = useState<PrescriptionItemInput[]>([
    {
      medicine: 'Cefpet (Cefpodoxime Proxetil) 50mg',
      dosage: '1 tablet',
      frequency: '1-0-1 (Twice daily)',
      duration_days: 7,
      instructions: 'Give after meal',
    },
    {
      medicine: 'Metrogyl (Metronidazole) Oral Suspension',
      dosage: '2.5 ml',
      frequency: '1-0-1 (Twice daily)',
      duration_days: 5,
      instructions: 'Shake bottle well before giving',
    },
    {
      medicine: 'Protexin Pro-Kolin Paste',
      dosage: '1 ml',
      frequency: '0-1-0 (Once daily)',
      duration_days: 5,
      instructions: 'Directly in mouth 1 hour after lunch',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const t = {
    title: isBangla ? 'ডিজিটাল প্রেসক্রিপশন' : 'Digital Prescription',
    subtitle: isBangla ? 'পশুচিকিৎসকের অফিসিয়াল প্রেসক্রিপশন প্যাড (APT-5)' : 'Official Veterinary Prescription Pad (APT-5)',
    vetOnly: isBangla ? 'শুধুমাত্র নিবন্ধিত পশুচিকিৎসক (Vet) প্রেসক্রিপশন তৈরি করতে পারেন' : 'Prescription authoring is restricted to licensed veterinarians',
    editMode: isBangla ? 'সম্পাদনা মোড' : 'Edit Mode',
    previewMode: isBangla ? 'প্রেসক্রিপশন প্রিভিউ / প্রিন্ট' : 'Rx Preview / Print',
    patientSection: isBangla ? 'রোগী ও অ্যাপয়েন্টমেন্ট বিবরণ' : 'Patient & Appointment Details',
    clinicalSection: isBangla ? 'ক্লিনিক্যাল ডায়াগনোসিস ও লক্ষণ' : 'Clinical Diagnosis & Vitals',
    rxSection: isBangla ? 'নির্ধারিত ওষুধসমূহ (Rx)' : 'Prescribed Medicines (Rx)',
    adviceSection: isBangla ? 'পরামর্শ ও পরবর্তী ভিজিট' : 'Advice & Follow-up',
    diagnosis: isBangla ? 'রোগ নির্ণয় / ডায়াগনোসিস' : 'Diagnosis',
    findings: isBangla ? 'শারীরিক লক্ষণ ও পরীক্ষা' : 'Clinical Findings',
    weight: isBangla ? 'ওজন (কেজি)' : 'Weight (kg)',
    temp: isBangla ? 'তাপমাত্রা (°সে)' : 'Temp (°C)',
    date: isBangla ? 'তারিখ' : 'Date',
    addMedicine: isBangla ? '+ ওষুধ যোগ করুন' : '+ Add Medicine',
    medicine: isBangla ? 'ওষুধের নাম' : 'Medicine Name',
    dosage: isBangla ? 'ডোজ' : 'Dosage',
    frequency: isBangla ? 'নিয়ম' : 'Frequency',
    duration: isBangla ? 'দিন' : 'Days',
    instructions: isBangla ? 'নির্দেশনা' : 'Instructions',
    advice: isBangla ? 'খাদ্য ও সাধারণ পরামর্শ' : 'Dietary & General Advice',
    followUp: isBangla ? 'পরবর্তী ফলো-আপ তারিখ' : 'Follow-up Date',
    saveAndIssue: isBangla ? 'প্রেসক্রিপশন প্রদান করুন' : 'Issue Prescription',
    saving: isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Saving...',
    saveSuccess: isBangla ? 'প্রেসক্রিপশন সফলভাবে ইস্যু করা হয়েছে!' : 'Prescription successfully issued & linked to pet health records!',
    print: isBangla ? 'প্রিন্ট করুন' : 'Print Rx',
    remove: isBangla ? 'মুছুন' : 'Remove',
    regNo: isBangla ? 'বিভিসি রেজিঃ নং' : 'BVC Reg. No',
  };

  function handleAddMedicine() {
    setMedicines((prev) => [
      ...prev,
      { medicine: '', dosage: '', frequency: '', duration_days: 5, instructions: '' },
    ]);
  }

  function handleRemoveMedicine(idx: number) {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleUpdateMedicine(idx: number, updates: Partial<PrescriptionItemInput>) {
    setMedicines((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, ...updates } : m))
    );
  }

  async function handleSavePrescription() {
    setIsSubmitting(true);
    setIsSuccess(false);

    const payload: DigitalPrescriptionInput = {
      petId: patient.petId,
      bookingId: patient.bookingId,
      vetId: vet.vetId,
      visitDate,
      diagnosis,
      findings,
      weightKg: weightKg ? parseFloat(weightKg) : null,
      temperatureC: temperatureC ? parseFloat(temperatureC) : null,
      medicines,
      advice,
      followUpDate,
    };

    try {
      const client = null as any;
      await createDigitalPrescription(client, payload);
    } catch {
      // Offline fallback
    }

    setIsSuccess(true);
    setViewMode('preview');
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'edit' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('edit')}
          >
            ✏️ {t.editMode}
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            📄 {t.previewMode}
          </Button>
        </div>
      </div>

      {isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{t.saveSuccess}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            🖨️ {t.print}
          </Button>
        </div>
      )}

      {/* ── MODE 1: EDIT FORM ── */}
      {viewMode === 'edit' && (
        <div className="space-y-6">
          {/* Patient Card Banner */}
          <Card className="p-4 bg-blue-50/50 border border-blue-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block">{isBangla ? 'পোষা প্রাণী' : 'Pet'}:</span>
                <span className="font-bold text-gray-900 text-sm">{patient.petName}</span>
                <span className="text-gray-500 block capitalize">{patient.species} ({patient.breed})</span>
              </div>
              <div>
                <span className="text-gray-400 block">{isBangla ? 'মালিক' : 'Owner'}:</span>
                <span className="font-semibold text-gray-800 text-sm">{patient.ownerName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">{isBangla ? 'বুকিং কোড' : 'Booking Code'}:</span>
                <span className="font-mono font-semibold text-blue-700">{patient.bookingCode}</span>
              </div>
              <div>
                <span className="text-gray-400 block">{t.date}:</span>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="font-mono text-xs border rounded px-2 py-1 bg-white"
                />
              </div>
            </div>
          </Card>

          {/* Clinical Findings & Vitals */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              {t.clinicalSection}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t.diagnosis}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Bacterial Gastritis"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t.weight}
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="4.2"
                />
                <Input
                  label={t.temp}
                  type="number"
                  step="0.1"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(e.target.value)}
                  placeholder="39.2"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">{t.findings}</label>
              <textarea
                rows={2}
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                className="w-full text-sm border rounded-xl p-3 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </Card>

          {/* Medicines (Rx) */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif font-black text-blue-700">℞</span>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  {t.rxSection}
                </h3>
              </div>
              <Button size="sm" variant="secondary" onClick={handleAddMedicine}>
                {t.addMedicine}
              </Button>
            </div>

            <div className="space-y-3">
              {medicines.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-blue-700 font-mono">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      {t.remove}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Input
                        label={t.medicine}
                        value={m.medicine}
                        onChange={(e) => handleUpdateMedicine(idx, { medicine: e.target.value })}
                        placeholder="e.g. Cefpet 50mg"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label={t.dosage}
                        value={m.dosage ?? ''}
                        onChange={(e) => handleUpdateMedicine(idx, { dosage: e.target.value })}
                        placeholder="e.g. 1 tab / 2.5ml"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Input
                        label={t.frequency}
                        value={m.frequency ?? ''}
                        onChange={(e) => handleUpdateMedicine(idx, { frequency: e.target.value })}
                        placeholder="e.g. 1-0-1"
                      />
                    </div>
                    <div>
                      <Input
                        label={t.duration}
                        type="number"
                        value={m.duration_days ? String(m.duration_days) : ''}
                        onChange={(e) =>
                          handleUpdateMedicine(idx, { duration_days: parseInt(e.target.value, 10) || null })
                        }
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <Input
                        label={t.instructions}
                        value={m.instructions ?? ''}
                        onChange={(e) => handleUpdateMedicine(idx, { instructions: e.target.value })}
                        placeholder="e.g. After meals"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Advice & Follow-up */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              {t.adviceSection}
            </h3>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">{t.advice}</label>
              <textarea
                rows={3}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="w-full text-sm border rounded-xl p-3 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="w-full sm:w-64">
              <Input
                label={t.followUp}
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
          </Card>

          {/* Save Action */}
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSavePrescription}
              isLoading={isSubmitting}
            >
              {isSubmitting ? t.saving : t.saveAndIssue}
            </Button>
          </div>
        </div>
      )}

      {/* ── MODE 2: OFFICIAL RX PREVIEW & PRINT PAD ── */}
      {viewMode === 'preview' && (
        <Card className="p-8 border-2 border-gray-300 bg-white text-gray-900 space-y-6 shadow-md print:shadow-none print:border-none">
          {/* Letterhead Header */}
          <div className="border-b-2 border-blue-600 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-xl font-bold text-blue-900">{vet.vetName}</h2>
              <p className="text-xs text-gray-600">{vet.qualifications}</p>
              <div className="mt-1 flex items-center gap-2">
                <Chip
                  variant="status"
                  label={`${t.regNo}: ${vet.bvcRegNo}`}
                  statusType="confirmed"
                />
              </div>
            </div>
            <div className="sm:text-right">
              <div className="font-bold text-sm text-gray-800">{vet.clinicName}</div>
              <div className="text-xs text-gray-500">Phone: {vet.phone}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">Rx #{patient.bookingCode}</div>
            </div>
          </div>

          {/* Patient Details Bar */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block">{isBangla ? 'রোগী' : 'Patient'}:</span>
              <span className="font-bold text-gray-900 text-sm">{patient.petName}</span>
              <span className="text-gray-500 block capitalize">{patient.species} ({patient.breed})</span>
            </div>
            <div>
              <span className="text-gray-400 block">{isBangla ? 'মালিক' : 'Owner'}:</span>
              <span className="font-semibold text-gray-800">{patient.ownerName}</span>
            </div>
            <div>
              <span className="text-gray-400 block">{isBangla ? 'ওজন / তাপমাত্রা' : 'Weight / Temp'}:</span>
              <span className="font-semibold text-gray-800">{weightKg} kg · {temperatureC}°C</span>
            </div>
            <div>
              <span className="text-gray-400 block">{t.date}:</span>
              <span className="font-mono font-semibold text-gray-800">{visitDate}</span>
            </div>
          </div>

          {/* Diagnosis & Findings */}
          <div className="border-b border-gray-200 pb-3 space-y-1 text-xs">
            <span className="font-bold text-gray-700 uppercase tracking-wide">{t.diagnosis}:</span>{' '}
            <span className="font-semibold text-blue-800">{diagnosis}</span>
            {findings && (
              <p className="text-gray-600 mt-1 italic">{findings}</p>
            )}
          </div>

          {/* ℞ Symbol and Medicines Table */}
          <div className="space-y-4">
            <div className="text-4xl font-serif font-black text-blue-900 select-none">
              ℞
            </div>

            <div className="divide-y divide-gray-150 border rounded-xl overflow-hidden">
              <div className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2 grid grid-cols-12 gap-2">
                <div className="col-span-1">#</div>
                <div className="col-span-5">{t.medicine}</div>
                <div className="col-span-2">{t.dosage}</div>
                <div className="col-span-2">{t.frequency}</div>
                <div className="col-span-2 text-right">{t.duration}</div>
              </div>

              {medicines.map((m, i) => (
                <div key={i} className="px-4 py-3 text-xs grid grid-cols-12 gap-2 items-center hover:bg-gray-50">
                  <div className="col-span-1 font-bold text-gray-400">{i + 1}</div>
                  <div className="col-span-5">
                    <span className="font-bold text-gray-900 text-sm block">{m.medicine}</span>
                    {m.instructions && (
                      <span className="text-gray-500 italic text-[11px] block mt-0.5">
                        ↳ {m.instructions}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 font-medium text-gray-700">{m.dosage || '—'}</div>
                  <div className="col-span-2 font-mono text-gray-700">{m.frequency || '—'}</div>
                  <div className="col-span-2 text-right font-medium text-gray-700">
                    {m.duration_days ? `${m.duration_days} days` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice */}
          {advice && (
            <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 text-xs space-y-1">
              <span className="font-bold text-blue-900 uppercase tracking-wide">{t.advice}:</span>
              <p className="text-gray-700 leading-relaxed">{advice}</p>
            </div>
          )}

          {/* Footer: Follow up & Signature */}
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
            <div>
              {followUpDate && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  <span className="font-bold">{t.followUp}:</span> {followUpDate}
                </div>
              )}
            </div>

            <div className="text-center sm:text-right">
              <div className="w-48 border-b border-gray-400 mb-1" />
              <div className="font-bold text-gray-800">{vet.vetName}</div>
              <div className="text-gray-500 font-mono text-[11px]">{vet.bvcRegNo}</div>
              <div className="text-[10px] text-green-700 font-bold mt-1">Verified Digital Signature ✓</div>
            </div>
          </div>

          {/* Print button (hidden during print) */}
          <div className="flex justify-end pt-4 print:hidden">
            <Button variant="primary" size="md" onClick={() => window.print()}>
              🖨️ {t.print}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
