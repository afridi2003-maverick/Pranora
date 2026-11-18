import React, { useState } from 'react';
import { View } from 'react-native';
import { PetListScreen } from '../features/pets';
import type { PetRow, BreedRow, AddPetPayload } from '@pranora/api';

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
    shelter_id: null,
    rescue_case_id: null,
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

export default function PetsScreen() {
  const [pets, setPets] = useState<PetRow[]>(INITIAL_MOCK_PETS);

  const handleAddPet = async (payload: AddPetPayload) => {
    const newPet: PetRow = {
      id: `pet-${Date.now()}`,
      owner_id: 'user-1',
      shelter_id: null,
      rescue_case_id: null,
      name: payload.name,
      species: payload.species,
      breed_id: payload.breed_id ?? null,
      breed_other: payload.breed_other ?? null,
      gender: payload.gender ?? 'unknown',
      date_of_birth: payload.date_of_birth ?? null,
      birth_approx: payload.birth_approx ?? false,
      weight_kg: payload.weight_kg ?? null,
      color: payload.color ?? null,
      photo_url: payload.photo_url ?? null,
      microchip_no: payload.microchip_no ?? null,
      is_neutered: payload.is_neutered ?? null,
      allergies: payload.allergies ?? null,
      notes: payload.notes ?? null,
      public_qr_slug: null,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      breed: payload.breed_id ? MOCK_BREEDS.find((b) => b.id === payload.breed_id) : null,
    };
    setPets([newPet, ...pets]);
    return {};
  };

  const handleEditPet = async (id: string, payload: AddPetPayload) => {
    setPets(
      pets.map((p) =>
        p.id === id
          ? {
              ...p,
              ...payload,
              breed: payload.breed_id ? MOCK_BREEDS.find((b) => b.id === payload.breed_id) : null,
              updated_at: new Date().toISOString(),
            }
          : p
      )
    );
    return {};
  };

  const handleDeletePet = async (id: string) => {
    setPets(pets.filter((p) => p.id !== id));
    return {};
  };

  return (
    <View className="flex-1 bg-white">
      <PetListScreen
        pets={pets}
        breeds={MOCK_BREEDS}
        onAddPet={handleAddPet}
        onEditPet={handleEditPet}
        onDeletePet={handleDeletePet}
      />
    </View>
  );
}
