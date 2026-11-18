'use client';

import React, { useState } from 'react';
import { useLocale, formatDate } from '@pranora/i18n';
import { Card, Button, Chip } from '@pranora/ui';
import type { PetRow, MedicalRecordRow, PetDocumentRow, AddMedicalRecordPayload } from '@pranora/api';
import { PetPicker } from '../pets';
import { UploadDocumentModal } from './UploadDocumentModal';
import { AddMedicalRecordModal } from './AddMedicalRecordModal';

export interface MedicalHistoryProps {
  pets: PetRow[];
  selectedPet: PetRow | null;
  onSelectPet: (pet: PetRow) => void;
  medicalRecords: MedicalRecordRow[];
  documents: PetDocumentRow[];
  onUploadDocument: (payload: {
    pet_id: string;
    title: string;
    file_path: string;
    document_date?: string;
  }) => Promise<{ error?: string }>;
  onDeleteDocument: (id: string) => Promise<{ error?: string }>;
  onAddMedicalRecord?: (payload: AddMedicalRecordPayload) => Promise<{ error?: string }>;
  isVet?: boolean;
  loading?: boolean;
}

export function MedicalHistory({
  pets,
  selectedPet,
  onSelectPet,
  medicalRecords,
  documents,
  onUploadDocument,
  onDeleteDocument,
  onAddMedicalRecord,
  isVet = false,
  loading = false,
}: MedicalHistoryProps) {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<'clinical' | 'documents'>('clinical');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  const handleDeleteDoc = (docId: string) => {
    if (confirm(t('health:medicalHistory.deleteDocConfirm'))) {
      onDeleteDocument(docId);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header & Pet Selection */}
      <div className="bg-app-card border border-stroke-subtle rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-content-primary mb-3">
          📋 {t('health:medicalHistory.label')}
        </h2>
        <PetPicker
          pets={pets}
          selectedPetId={selectedPet?.id ?? null}
          onSelectPet={onSelectPet}
          placeholder={t('health:vaccines.selectPet')}
        />

        {/* Tab Toggle */}
        <div className="flex gap-2 border-b border-stroke-subtle pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'clinical'
                ? 'border-primary text-primary'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            🩺 {t('health:medicalHistory.label')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'border-primary text-primary'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            📁 {t('health:medicalHistory.ownerUploads')}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-surface-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : !selectedPet ? (
        <Card className="p-12 text-center border-dashed">
          <span className="text-4xl mb-3 block">🐾</span>
          <p className="text-content-secondary text-sm">
            {t('health:vaccines.selectPet')}
          </p>
        </Card>
      ) : activeTab === 'clinical' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                🛡️ {t('health:medicalHistory.vetWritten')}
              </span>
              <span className="text-[11px] text-amber-700">
                {t('health:medicalHistory.ownerReadOnly')}
              </span>
            </div>
            {isVet && onAddMedicalRecord && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddRecordModal(true)}
              >
                + {t('health:medicalHistory.addRecord')}
              </Button>
            )}
          </div>

          {medicalRecords.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <span className="text-3xl block mb-2">🩺</span>
              <h4 className="font-bold text-content-primary mb-1">
                {t('health:medicalHistory.noRecords')}
              </h4>
              <p className="text-content-secondary text-xs">
                {t('health:medicalHistory.ownerReadOnly')}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicalRecords.map((item) => (
                <Card key={item.id} className="p-5 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-base text-content-primary">
                          {item.diagnosis || 'Clinical Examination'}
                        </h4>
                        <span className="text-xs text-content-secondary">
                          📅 {formatDate(item.visit_date)}
                        </span>
                      </div>
                      <Chip
                        variant="status"
                        statusType="completed"
                        label={`✓ ${t('health:medicalHistory.vetBadge')}`}
                      />
                    </div>

                    {item.findings && (
                      <div className="text-xs my-2">
                        <span className="font-semibold text-content-primary">
                          {t('health:medicalHistory.findings')}:{' '}
                        </span>
                        <span className="text-content-secondary">{item.findings}</span>
                      </div>
                    )}

                    {item.treatment && (
                      <div className="text-xs mb-2">
                        <span className="font-semibold text-content-primary">
                          {t('health:medicalHistory.treatment')}:{' '}
                        </span>
                        <span className="text-content-secondary">{item.treatment}</span>
                      </div>
                    )}

                    {item.prescriptions && item.prescriptions.length > 0 && (
                      <div className="mt-3 bg-surface-secondary/40 p-3 rounded-xl border border-stroke-subtle">
                        <span className="text-xs font-bold text-content-primary block mb-1">
                          💊 {t('health:medicalHistory.prescription')}
                        </span>
                        {item.prescriptions.map((p) => (
                          <div key={p.id} className="text-xs text-content-secondary">
                            • <span className="font-semibold text-content-primary">{p.medicine}</span>
                            {p.dosage ? ` (${p.dosage})` : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-surface-secondary/40 border border-stroke-subtle rounded-xl p-3.5">
            <div>
              <span className="text-xs font-bold text-content-primary block">
                📁 {t('health:medicalHistory.ownerUploads')}
              </span>
              <span className="text-[11px] text-content-secondary">
                {t('health:medicalHistory.ownerUploadsDesc')}
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowUploadModal(true)}
            >
              + {t('health:medicalHistory.uploadDoc')}
            </Button>
          </div>

          {documents.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <span className="text-3xl block mb-2">📁</span>
              <h4 className="font-bold text-content-primary mb-1">
                {t('health:medicalHistory.noDocuments')}
              </h4>
              <p className="text-content-secondary text-xs mb-4">
                {t('health:medicalHistory.ownerUploadsDesc')}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowUploadModal(true)}
              >
                + {t('health:medicalHistory.uploadDoc')}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 flex justify-between items-center hover:shadow-sm transition"
                >
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-content-primary">
                        {item.title}
                      </h4>
                      <Chip
                        variant="status"
                        statusType="neutral"
                        label={t('health:medicalHistory.ownerBadge')}
                        className="text-[10px]"
                      />
                    </div>
                    {item.document_date && (
                      <span className="text-xs text-content-secondary block">
                        📅 {formatDate(item.document_date)}
                      </span>
                    )}
                    <span className="text-[11px] text-content-tertiary block truncate">
                      📎 {item.file_path}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteDoc(item.id)}
                  >
                    ✕
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedPet && (
        <>
          <UploadDocumentModal
            isOpen={showUploadModal}
            petId={selectedPet.id}
            onClose={() => setShowUploadModal(false)}
            onUpload={onUploadDocument}
          />
          {onAddMedicalRecord && (
            <AddMedicalRecordModal
              isOpen={showAddRecordModal}
              petId={selectedPet.id}
              onClose={() => setShowAddRecordModal(false)}
              onSubmit={onAddMedicalRecord}
            />
          )}
        </>
      )}
    </div>
  );
}
