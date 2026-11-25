'use client';

import React, { useEffect, useState } from 'react';
import { MedicalHistory } from '../../../features/health';
import {
  addMedicalRecord,
  addPetDocument,
  deletePetDocument,
  listMedicalRecords,
  listMyPets,
  listPetDocuments,
  type AddMedicalRecordPayload,
  type BreedRow,
  type MedicalRecordRow,
  type PetDocumentRow,
  type PetRow,
} from '@pranora/api';
import { useSession } from '../../../hooks/useSession';
import { useToast } from '../../../components/ToastProvider';

const MOCK_BREEDS: BreedRow[] = [
  { id: 1, species: 'dog', name_en: 'Mixed/Deshi', name_bn: 'মিশ্র/দেশি' },
  { id: 2, species: 'dog', name_en: 'German Shepherd', name_bn: 'জার্মান শেফার্ড' },
  { id: 3, species: 'cat', name_en: 'Mixed/Deshi', name_bn: 'মিশ্র/দেশি' },
  { id: 4, species: 'cat', name_en: 'Persian', name_bn: 'পার্সিয়ান' },
];

const INITIAL_MOCK_PETS: PetRow[] = [
  {
    id: 'pet-1',
    owner_id: 'user-1',
    shelter_id: null,
    rescue_case_id: null,
    name: 'Milo',
    species: 'dog',
    breed_id: 1,
    breed_other: null,
    gender: 'male',
    date_of_birth: '2023-05-10',
    birth_approx: false,
    weight_kg: 12.5,
    color: 'Golden Brown',
    photo_url: null,
    microchip_no: '985141002345678',
    is_neutered: true,
    allergies: null,
    notes: 'Friendly, fully vaccinated',
    public_qr_slug: 'milo-qr-123',
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    breed: MOCK_BREEDS[0],
  },
  {
    id: 'pet-2',
    owner_id: 'user-1',
    shelter_id: 'shelter-dhaka-1',
    rescue_case_id: 'rescue-case-8821',
    name: 'Luna',
    species: 'cat',
    breed_id: 4,
    breed_other: null,
    gender: 'female',
    date_of_birth: '2024-01-15',
    birth_approx: true,
    weight_kg: 3.8,
    color: 'White',
    photo_url: null,
    microchip_no: null,
    is_neutered: false,
    allergies: 'Chicken sensitivity',
    notes: 'Indoor cat',
    public_qr_slug: 'luna-qr-456',
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    breed: MOCK_BREEDS[3],
  },
];

const INITIAL_MOCK_RECORDS: Record<string, MedicalRecordRow[]> = {
  'pet-1': [
    {
      id: 'med-1',
      pet_id: 'pet-1',
      booking_id: null,
      rescue_case_id: null,
      vet_id: 'vet-101',
      visit_date: '2024-08-20',
      diagnosis: 'Canine Dermatitis (ত্বকের এলার্জি)',
      findings: 'Mild erythema and itching on paws and abdomen.',
      treatment: 'Antihistamine injection and topical soothing shampoo.',
      notes: 'Advised owner to avoid chicken protein for 2 weeks.',
      attachments: [],
      created_by: 'user-vet-1',
      created_at: new Date().toISOString(),
      prescriptions: [
        {
          id: 'pres-1',
          medical_record_id: 'med-1',
          medicine: 'Cetirizine Syrup',
          dosage: '5ml once daily at night',
          frequency: 'Once daily',
          duration_days: 7,
          instructions: 'After meal',
        },
      ],
    },
  ],
  'pet-2': [
    {
      id: 'med-2',
      pet_id: 'pet-2',
      booking_id: null,
      rescue_case_id: 'rescue-case-8821',
      vet_id: 'vet-102',
      visit_date: '2024-02-05',
      diagnosis: 'Street Trauma Recovery & Malnutrition',
      findings: 'Dehydrated, minor abrasions on left flank, mild flea infestation.',
      treatment: 'Wound dressing, subcutaneous fluid therapy, deworming and flea treatment.',
      notes: 'Initial rescue medical clearance granted.',
      attachments: [],
      created_by: 'user-vet-2',
      created_at: new Date().toISOString(),
      prescriptions: [],
    },
  ],
};

const INITIAL_MOCK_DOCS: Record<string, PetDocumentRow[]> = {
  'pet-1': [
    {
      id: 'doc-1',
      pet_id: 'pet-1',
      uploaded_by: 'user-1',
      title: 'Complete Blood Count (CBC) Report',
      file_path: 'medical/pet-1/cbc_august_2024.pdf',
      document_date: '2024-08-22',
      created_at: new Date().toISOString(),
    },
  ],
  'pet-2': [
    {
      id: 'doc-2',
      pet_id: 'pet-2',
      uploaded_by: 'user-1',
      title: 'Shelter Intake Certificate',
      file_path: 'medical/pet-2/intake_cert.pdf',
      document_date: '2024-02-01',
      created_at: new Date().toISOString(),
    },
  ],
};

export default function MedicalPage() {
  const { supabase, isConfigured, isAuthenticated, isLoading: sessionLoading } = useSession();
  const { showToast } = useToast();
  const useLiveApi = isConfigured && isAuthenticated;

  const [pets, setPets] = useState<PetRow[]>(INITIAL_MOCK_PETS);
  const [selectedPet, setSelectedPet] = useState<PetRow | null>(INITIAL_MOCK_PETS[0] ?? null);
  const [recordsStore, setRecordsStore] = useState<Record<string, MedicalRecordRow[]>>(INITIAL_MOCK_RECORDS);
  const [docsStore, setDocsStore] = useState<Record<string, PetDocumentRow[]>>(INITIAL_MOCK_DOCS);

  useEffect(() => {
    if (sessionLoading || !useLiveApi) return;
    let active = true;
    async function loadPets() {
      const res = await listMyPets(supabase);
      if (!active || res.error || res.data.length === 0) return;
      setPets(res.data);
      setSelectedPet(res.data[0] ?? null);
    }
    void loadPets();
    return () => {
      active = false;
    };
  }, [sessionLoading, useLiveApi, supabase]);

  useEffect(() => {
    if (!useLiveApi || !selectedPet) return;
    let active = true;
    async function loadPetHealth(petId: string) {
      const [recRes, docRes] = await Promise.all([
        listMedicalRecords(supabase, petId),
        listPetDocuments(supabase, petId),
      ]);
      if (!active) return;
      if (!recRes.error) {
        setRecordsStore((prev) => ({ ...prev, [petId]: recRes.data }));
      }
      if (!docRes.error) {
        setDocsStore((prev) => ({ ...prev, [petId]: docRes.data }));
      }
    }
    void loadPetHealth(selectedPet.id);
    return () => {
      active = false;
    };
  }, [useLiveApi, selectedPet, supabase]);

  const currentRecords = selectedPet ? recordsStore[selectedPet.id] || [] : [];
  const currentDocs = selectedPet ? docsStore[selectedPet.id] || [] : [];

  const handleUploadDocument = async ({
    pet_id,
    title,
    file_path,
    document_date,
  }: {
    pet_id: string;
    title: string;
    file_path: string;
    document_date?: string;
  }) => {
    if (useLiveApi) {
      const res = await addPetDocument(supabase, { pet_id, title, file_path, document_date });
      if (res.error || !res.data) {
        showToast({ type: 'emergency', message: res.error || 'Failed to upload document' });
        return { error: res.error || 'Failed to upload document' };
      }
      setDocsStore((prev) => ({ ...prev, [pet_id]: [res.data!, ...(prev[pet_id] || [])] }));
      showToast({ type: 'success', message: 'Document saved' });
      return {};
    }

    const newDoc: PetDocumentRow = {
      id: `doc-${Date.now()}`,
      pet_id,
      uploaded_by: 'user-1',
      title,
      file_path,
      document_date: document_date ?? null,
      created_at: new Date().toISOString(),
    };

    setDocsStore((prev) => ({
      ...prev,
      [pet_id]: [newDoc, ...(prev[pet_id] || [])],
    }));

    return {};
  };

  const handleDeleteDocument = async (id: string) => {
    if (!selectedPet) return {};
    if (useLiveApi) {
      const res = await deletePetDocument(supabase, id);
      if (!res.success) {
        showToast({ type: 'emergency', message: res.error || 'Failed to delete document' });
        return { error: res.error };
      }
    }
    setDocsStore((prev) => ({
      ...prev,
      [selectedPet.id]: (prev[selectedPet.id] || []).filter((d) => d.id !== id),
    }));
    return {};
  };

  const handleAddMedicalRecord = async (payload: AddMedicalRecordPayload) => {
    if (useLiveApi) {
      const res = await addMedicalRecord(supabase, payload);
      if (res.error || !res.data) {
        showToast({ type: 'emergency', message: res.error || 'Failed to save medical record' });
        return { error: res.error || 'Failed to save medical record' };
      }
      setRecordsStore((prev) => ({
        ...prev,
        [payload.pet_id]: [res.data!, ...(prev[payload.pet_id] || [])],
      }));
      showToast({ type: 'success', message: 'Medical record saved' });
      return {};
    }

    const newRecord: MedicalRecordRow = {
      id: `med-${Date.now()}`,
      pet_id: payload.pet_id,
      booking_id: payload.booking_id ?? null,
      rescue_case_id: payload.rescue_case_id ?? null,
      vet_id: payload.vet_id,
      visit_date: payload.visit_date,
      findings: payload.findings ?? null,
      diagnosis: payload.diagnosis ?? null,
      treatment: payload.treatment ?? null,
      notes: payload.notes ?? null,
      attachments: payload.attachments || [],
      created_by: 'user-vet-current',
      created_at: new Date().toISOString(),
      prescriptions: (payload.prescriptions || []).map((p, idx) => ({
        ...p,
        id: `pres-${Date.now()}-${idx}`,
        medical_record_id: `med-${Date.now()}`,
      })),
    };

    setRecordsStore((prev) => ({
      ...prev,
      [payload.pet_id]: [newRecord, ...(prev[payload.pet_id] || [])],
    }));

    return {};
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <MedicalHistory
          pets={pets}
          selectedPet={selectedPet}
          onSelectPet={setSelectedPet}
          medicalRecords={currentRecords}
          documents={currentDocs}
          onUploadDocument={handleUploadDocument}
          onDeleteDocument={handleDeleteDocument}
          onAddMedicalRecord={handleAddMedicalRecord}
          isVet={true}
        />
      </main>
    </div>
  );
}
