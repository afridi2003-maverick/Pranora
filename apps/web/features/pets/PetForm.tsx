'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Input, Select, Textarea, Card } from '@pranora/ui';
import { AddPetSchema, EditPetSchema, type AddPetInput } from '@pranora/validation';
import type { PetRow, BreedRow, AddPetPayload } from '@pranora/api';
import type { SpeciesType, PetGender } from '@pranora/types';

interface WebPetFormProps {
  breeds: BreedRow[];
  initialValues?: Partial<PetRow>;
  onSubmit: (payload: AddPetPayload) => Promise<{ error?: string }>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SPECIES_LIST: SpeciesType[] = [
  'dog', 'cat', 'bird', 'rabbit', 'fish', 'cow', 'goat', 'poultry', 'other',
];

export function PetForm({
  breeds,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: WebPetFormProps) {
  const { t, locale } = useLocale();
  const isEdit = Boolean(initialValues?.id);

  const [name, setName] = useState(initialValues?.name ?? '');
  const [species, setSpecies] = useState<SpeciesType>(initialValues?.species ?? 'dog');
  const [breedId, setBreedId] = useState<number | null>(initialValues?.breed_id ?? null);
  const [breedOther, setBreedOther] = useState(initialValues?.breed_other ?? '');
  const [gender, setGender] = useState<PetGender>(initialValues?.gender ?? 'unknown');
  const [dob, setDob] = useState(initialValues?.date_of_birth ?? '');
  const [birthApprox, setBirthApprox] = useState(initialValues?.birth_approx ?? false);
  const [weightKg, setWeightKg] = useState(initialValues?.weight_kg?.toString() ?? '');
  const [color, setColor] = useState(initialValues?.color ?? '');
  const [photoUrl, setPhotoUrl] = useState(initialValues?.photo_url ?? '');
  const [microchip, setMicrochip] = useState(initialValues?.microchip_no ?? '');
  const [isNeutered, setIsNeutered] = useState<boolean | null>(initialValues?.is_neutered ?? null);
  const [allergies, setAllergies] = useState(initialValues?.allergies ?? '');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  const [errors, setErrors] = useState<Partial<Record<keyof AddPetInput | 'root', string>>>({});

  const filteredBreeds = breeds.filter((b) => b.species === species);

  const prevSpecies = useRef(species);
  useEffect(() => {
    if (prevSpecies.current !== species) {
      setBreedId(null);
      setBreedOther('');
      prevSpecies.current = species;
    }
  }, [species]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payloadToValidate = {
      ...(isEdit && { id: initialValues!.id }),
      name,
      species,
      breed_id: breedId,
      breed_other: breedOther || null,
      gender,
      date_of_birth: dob || null,
      birth_approx: birthApprox,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      color: color || null,
      photo_url: photoUrl || null,
      microchip_no: microchip || null,
      is_neutered: isNeutered,
      allergies: allergies || null,
      notes: notes || null,
    };

    const schema = isEdit ? EditPetSchema : AddPetSchema;
    const res = schema.safeParse(payloadToValidate);
    if (!res.success) {
      const fieldErrors: Partial<Record<keyof AddPetInput, string>> = {};
      for (const issue of res.error.issues) {
        const field = issue.path[0] as keyof AddPetInput;
        fieldErrors[field] = t(issue.message);
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const submitPayload: AddPetPayload = {
      name,
      species,
      breed_id: breedId,
      breed_other: breedOther || null,
      gender,
      date_of_birth: dob || null,
      birth_approx: birthApprox,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      color: color || null,
      photo_url: photoUrl || null,
      microchip_no: microchip || null,
      is_neutered: isNeutered,
      allergies: allergies || null,
      notes: notes || null,
    };

    const submitRes = await onSubmit(submitPayload);
    if (submitRes.error) {
      setErrors({ root: submitRes.error });
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto shadow-sm">
      <h2 className="text-xl font-bold text-content-primary mb-6">
        {isEdit ? t('pets:edit') : t('pets:add')}
      </h2>

      {errors.root && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          {errors.root}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-content-primary mb-1">
            {t('pets:fields.name')} *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('pets:fields.namePlaceholder')}
            error={errors.name}
            maxLength={60}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('pets:fields.species')} *
            </label>
            <Select
              value={species}
              onChange={(e) => setSpecies(e.target.value as SpeciesType)}
              options={SPECIES_LIST.map((s) => ({
                value: s,
                label: t(`pets:species.${s}`),
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('pets:fields.breed')}
            </label>
            <Select
              value={breedId?.toString() ?? ''}
              onChange={(e) => setBreedId(e.target.value ? parseInt(e.target.value, 10) : null)}
              options={[
                { value: '', label: t('pets:fields.breedUnknown') },
                ...filteredBreeds.map((b) => ({
                  value: b.id.toString(),
                  label: locale === 'bn' && b.name_bn ? b.name_bn : b.name_en,
                })),
              ]}
            />
          </div>
        </div>

        {!breedId && (
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              {locale === 'bn' ? 'জাতের নাম (যদি তালিকায় না থাকে)' : 'Custom Breed (if not in list)'}
            </label>
            <Input
              value={breedOther}
              onChange={(e) => setBreedOther(e.target.value)}
              placeholder={locale === 'bn' ? 'যেমন: দেশি মিক্স' : 'e.g. Deshi Mix'}
              error={errors.breed_other}
              maxLength={80}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('pets:fields.gender')}
            </label>
            <Select
              value={gender}
              onChange={(e) => setGender(e.target.value as PetGender)}
              options={[
                { value: 'male', label: t('pets:gender.male') },
                { value: 'female', label: t('pets:gender.female') },
                { value: 'unknown', label: t('pets:gender.unknown') },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('pets:fields.weight')}
            </label>
            <Input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 4.5"
              error={errors.weight_kg}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('pets:fields.birthDate')}
            </label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              error={errors.date_of_birth}
            />
            <label className="flex items-center gap-2 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={birthApprox}
                onChange={(e) => setBirthApprox(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-content-secondary">
                {t('pets:fields.birthDateApprox')}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('pets:fields.color')}
            </label>
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder={locale === 'bn' ? 'যেমন: সাদা-কালো' : 'e.g. White & Black'}
              maxLength={60}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('pets:fields.microchipId')}
            </label>
            <Input
              value={microchip}
              onChange={(e) => setMicrochip(e.target.value)}
              placeholder="ID #"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('pets:fields.photo')} (URL)
            </label>
            <Input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              error={errors.photo_url}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-content-primary mb-1">
            {t('pets:fields.isNeutered')}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                name="is_neutered_web"
                checked={isNeutered === true}
                onChange={() => setIsNeutered(true)}
              />
              <span>{locale === 'bn' ? 'হ্যাঁ' : 'Yes'}</span>
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                name="is_neutered_web"
                checked={isNeutered === false}
                onChange={() => setIsNeutered(false)}
              />
              <span>{locale === 'bn' ? 'না' : 'No'}</span>
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                name="is_neutered_web"
                checked={isNeutered === null}
                onChange={() => setIsNeutered(null)}
              />
              <span>{locale === 'bn' ? 'অজানা' : 'Unknown'}</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-content-primary mb-1">
            {locale === 'bn' ? 'অ্যালার্জি' : 'Allergies'}
          </label>
          <Textarea
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder={locale === 'bn' ? 'কোনো অ্যালার্জি বা ওষুধের সংবেদনশীলতা' : 'Known allergies or sensitivities'}
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-content-primary mb-1">
            {t('pets:fields.notes')}
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={locale === 'bn' ? 'বিশেষ যত্ন বা আচরণের নোট' : 'Care instructions or notes'}
            rows={3}
          />
        </div>

        <div className="flex gap-4 pt-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('pets:actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('pets:actions.saving') : t('pets:actions.save')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
