'use client';

import React, { useEffect, useState } from 'react';
import { AIChat } from '../../../features/ai';
import { listMyPets, type BreedRow, type PetRow } from '@pranora/api';
import { useSession } from '../../../hooks/useSession';

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

export default function AssistantPage() {
  const { supabase, isConfigured, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [pets, setPets] = useState<PetRow[]>(INITIAL_MOCK_PETS);
  const [selectedPet, setSelectedPet] = useState<PetRow | null>(INITIAL_MOCK_PETS[0] ?? null);

  useEffect(() => {
    if (sessionLoading || !isConfigured || !isAuthenticated) return;
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
  }, [sessionLoading, isConfigured, isAuthenticated, supabase]);

  return (
    <div className="min-h-screen bg-app-bg text-content-primary">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AIChat
          pets={pets}
          selectedPet={selectedPet}
          onSelectPet={(pet) => setSelectedPet(pet)}
        />
      </main>
    </div>
  );
}
