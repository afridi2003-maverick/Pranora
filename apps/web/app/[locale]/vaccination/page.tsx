'use client';

import React, { useState } from 'react';
import { LanguageHeader } from '../../../components/LanguageHeader';
import { VaccineList } from '../../../features/health';
import type { PetRow, VaccinationRow, BreedRow } from '@pranora/api';

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

const INITIAL_MOCK_VACCINES: Record<string, VaccinationRow[]> = {
  'pet-1': [
    {
      id: 'vac-1',
      pet_id: 'pet-1',
      template_id: 1,
      name: 'Rabies (জলাতঙ্ক)',
      due_date: '2024-05-10',
      given_date: '2024-05-08',
      given_by_vet_id: null,
      batch_no: 'RAB-2024-BD01',
      booking_id: null,
      certificate_path: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'vac-2',
      pet_id: 'pet-1',
      template_id: 2,
      name: 'DHPP / Core 7-in-1',
      due_date: '2026-12-01',
      given_date: null,
      given_by_vet_id: null,
      batch_no: null,
      booking_id: null,
      certificate_path: null,
      created_at: new Date().toISOString(),
    },
  ],
  'pet-2': [
    {
      id: 'vac-3',
      pet_id: 'pet-2',
      template_id: 5,
      name: 'FVRCP (Cat Core)',
      due_date: '2024-03-15',
      given_date: '2024-03-14',
      given_by_vet_id: null,
      batch_no: 'CAT-2024-DH9',
      booking_id: null,
      certificate_path: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'vac-4',
      pet_id: 'pet-2',
      template_id: 1,
      name: 'Rabies (জলাতঙ্ক)',
      due_date: '2026-11-25',
      given_date: null,
      given_by_vet_id: null,
      batch_no: null,
      booking_id: null,
      certificate_path: null,
      created_at: new Date().toISOString(),
    },
  ],
};

export default function VaccinationPage() {
  const [pets] = useState<PetRow[]>(INITIAL_MOCK_PETS);
  const [selectedPet, setSelectedPet] = useState<PetRow | null>(INITIAL_MOCK_PETS[0] ?? null);
  const [vaccinesStore, setVaccinesStore] = useState<Record<string, VaccinationRow[]>>(INITIAL_MOCK_VACCINES);

  const currentVaccines = selectedPet ? vaccinesStore[selectedPet.id] || [] : [];

  const handleAutoGenerate = async (petId: string, species: string) => {
    const isDog = species === 'dog';
    const newItems: VaccinationRow[] = isDog
      ? [
          {
            id: `vac-gen-${Date.now()}-1`,
            pet_id: petId,
            template_id: 1,
            name: 'Rabies Booster',
            due_date: '2027-05-10',
            given_date: null,
            given_by_vet_id: null,
            batch_no: null,
            booking_id: null,
            certificate_path: null,
            created_at: new Date().toISOString(),
          },
          {
            id: `vac-gen-${Date.now()}-2`,
            pet_id: petId,
            template_id: 3,
            name: 'Bordetella (Kennel Cough)',
            due_date: '2027-01-15',
            given_date: null,
            given_by_vet_id: null,
            batch_no: null,
            booking_id: null,
            certificate_path: null,
            created_at: new Date().toISOString(),
          },
        ]
      : [
          {
            id: `vac-gen-${Date.now()}-1`,
            pet_id: petId,
            template_id: 5,
            name: 'FVRCP Annual Booster',
            due_date: '2027-03-15',
            given_date: null,
            given_by_vet_id: null,
            batch_no: null,
            booking_id: null,
            certificate_path: null,
            created_at: new Date().toISOString(),
          },
        ];

    setVaccinesStore((prev) => ({
      ...prev,
      [petId]: [...(prev[petId] || []), ...newItems],
    }));

    return { count: newItems.length };
  };

  const handleRecordDose = async ({
    id,
    given_date,
    batch_no,
  }: {
    id: string;
    given_date: string;
    batch_no?: string;
  }) => {
    if (!selectedPet) return { error: 'No pet selected' };

    setVaccinesStore((prev) => ({
      ...prev,
      [selectedPet.id]: (prev[selectedPet.id] || []).map((v) =>
        v.id === id ? { ...v, given_date, batch_no: batch_no ?? null } : v
      ),
    }));

    return {};
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <LanguageHeader />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <VaccineList
          pets={pets}
          selectedPet={selectedPet}
          onSelectPet={setSelectedPet}
          vaccinations={currentVaccines}
          onAutoGenerate={handleAutoGenerate}
          onRecordDose={handleRecordDose}
        />
      </main>
    </div>
  );
}
