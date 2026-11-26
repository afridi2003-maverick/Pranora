'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Skeleton } from '@pranora/ui';
import { PetList, PetForm } from '../../../features/pets';
import {
  addPet,
  deletePet,
  editPet,
  getPetOwnershipHistory,
  listBreeds,
  listMyPets,
  transferPetOwnership,
  type AddPetPayload,
  type BreedRow,
  type OwnershipReason,
  type PetOwnershipHistoryRow,
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
    notes: 'Indoor cat, rescued in Dhanmondi',
    public_qr_slug: 'luna-qr-456',
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    breed: MOCK_BREEDS[3],
  },
];

const INITIAL_HISTORY: Record<string, PetOwnershipHistoryRow[]> = {
  'pet-2': [
    {
      id: 'hist-1',
      pet_id: 'pet-2',
      from_user_id: 'user-rescuer-1',
      to_user_id: 'user-1',
      reason: 'adoption',
      note: 'Adopted through Dhanmondi Shelter handover',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'hist-0',
      pet_id: 'pet-2',
      from_user_id: null,
      to_user_id: 'user-rescuer-1',
      reason: 'rescue_intake',
      note: 'Rescued from street injury, treated and registered',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
  ],
};

export default function PetsPage() {
  const { t, isBangla } = useLocale();
  const { supabase, isAuthenticated, isConfigured, isLoading: sessionLoading } = useSession();
  const { showToast } = useToast();

  const useLiveApi = isConfigured && isAuthenticated;

  const [pets, setPets] = useState<PetRow[]>(INITIAL_MOCK_PETS);
  const [breeds, setBreeds] = useState<BreedRow[]>(MOCK_BREEDS);
  const [historyStore, setHistoryStore] =
    useState<Record<string, PetOwnershipHistoryRow[]>>(INITIAL_HISTORY);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedPet, setSelectedPet] = useState<PetRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    let active = true;

    async function loadData() {
      setErrorMsg(null);
      if (!useLiveApi) {
        setPets(INITIAL_MOCK_PETS);
        setBreeds(MOCK_BREEDS);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [petsRes, breedsRes] = await Promise.all([
          listMyPets(supabase),
          listBreeds(supabase),
        ]);
        if (!active) return;

        if (petsRes.error) {
          setErrorMsg(petsRes.error);
        } else {
          setPets(petsRes.data);
        }

        if (!breedsRes.error && breedsRes.data.length > 0) {
          setBreeds(breedsRes.data);
        }
      } catch (err) {
        if (!active) return;
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load pets');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [sessionLoading, useLiveApi, supabase]);

  const handleAddSubmit = async (payload: AddPetPayload) => {
    setIsSubmitting(true);
    try {
      if (useLiveApi) {
        const res = await addPet(supabase, payload);
        if (res.error || !res.data) {
          showToast({
            type: 'emergency',
            message: res.error || (isBangla ? 'যোগ করা যায়নি' : 'Failed to add pet'),
          });
          return { error: res.error || 'Failed to add pet' };
        }
        setPets((prev) => [res.data!, ...prev]);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 250));
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
          breed: payload.breed_id ? breeds.find((b) => b.id === payload.breed_id) : null,
        };
        setPets((prev) => [newPet, ...prev]);
      }

      showToast({
        type: 'success',
        message: isBangla ? 'পোষা প্রাণী যোগ হয়েছে!' : 'Pet added successfully!',
      });
      setView('list');
      return {};
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (payload: AddPetPayload) => {
    if (!selectedPet) return { error: 'No pet selected' };
    setIsSubmitting(true);
    try {
      if (useLiveApi) {
        const res = await editPet(supabase, { id: selectedPet.id, ...payload });
        if (res.error || !res.data) {
          showToast({
            type: 'emergency',
            message: res.error || (isBangla ? 'আপডেট ব্যর্থ হয়েছে' : 'Failed to update pet'),
          });
          return { error: res.error || 'Failed to update pet' };
        }
        setPets((prev) => prev.map((p) => (p.id === selectedPet.id ? res.data! : p)));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 250));
        setPets((prev) =>
          prev.map((p) =>
            p.id === selectedPet.id
              ? {
                  ...p,
                  ...payload,
                  breed: payload.breed_id ? breeds.find((b) => b.id === payload.breed_id) : null,
                  updated_at: new Date().toISOString(),
                }
              : p
          )
        );
      }

      showToast({
        type: 'success',
        message: isBangla ? 'তথ্য আপডেট হয়েছে!' : 'Pet updated!',
      });
      setView('list');
      setSelectedPet(null);
      return {};
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePet = async (pet: PetRow) => {
    if (!confirm(t('pets:deleteConfirm'))) return;

    if (useLiveApi) {
      const res = await deletePet(supabase, pet.id);
      if (!res.success) {
        showToast({
          type: 'emergency',
          message: res.error || (isBangla ? 'মুছে ফেলা যায়নি' : 'Failed to delete pet'),
        });
        return;
      }
    }

    setPets((prev) => prev.filter((p) => p.id !== pet.id));
    showToast({
      type: 'info',
      message: isBangla ? 'পোষা প্রাণী মুছে ফেলা হয়েছে' : 'Pet removed',
    });
  };

  const handleTransferPet = async ({
    pet_id,
    to_user_id,
    reason,
    note,
  }: {
    pet_id: string;
    to_user_id: string;
    reason: OwnershipReason;
    note?: string;
  }) => {
    if (useLiveApi) {
      const res = await transferPetOwnership(supabase, {
        pet_id,
        to_user_id,
        reason,
        note: note ?? null,
      });
      if (!res.success) {
        return { error: res.error || 'Transfer failed' };
      }
    } else {
      const newRecord: PetOwnershipHistoryRow = {
        id: `hist-${Date.now()}`,
        pet_id,
        from_user_id: 'user-1',
        to_user_id,
        reason,
        note: note ?? null,
        created_at: new Date().toISOString(),
      };

      setHistoryStore((prev) => ({
        ...prev,
        [pet_id]: [newRecord, ...(prev[pet_id] || [])],
      }));
    }

    setPets((prev) => prev.filter((p) => p.id !== pet_id));
    showToast({
      type: 'success',
      message: isBangla ? 'মালিকানা হস্তান্তর সম্পন্ন' : 'Ownership transferred',
    });
    return {};
  };

  const handleFetchHistory = async (petId: string) => {
    if (useLiveApi) {
      const res = await getPetOwnershipHistory(supabase, petId);
      return res.data;
    }
    return historyStore[petId] || [];
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        {!useLiveApi && !sessionLoading && (
          <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 text-xs">
            {isBangla
              ? 'ডেমো মোড: আপনার নিজস্ব পোষা প্রাণী সংরক্ষণ করতে লগইন করুন।'
              : 'Demo mode: Sign in with a connected Supabase project to persist your real pets.'}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : view === 'list' ? (
          <PetList
            pets={pets}
            onAddPet={() => {
              setSelectedPet(null);
              setView('add');
            }}
            onEditPet={(pet) => {
              setSelectedPet(pet);
              setView('edit');
            }}
            onDeletePet={handleDeletePet}
            onTransferPet={handleTransferPet}
            onFetchHistory={handleFetchHistory}
          />
        ) : (
          <PetForm
            breeds={breeds}
            initialValues={selectedPet ?? undefined}
            onSubmit={view === 'edit' ? handleEditSubmit : handleAddSubmit}
            onCancel={() => {
              setView('list');
              setSelectedPet(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </main>
    </div>
  );
}
