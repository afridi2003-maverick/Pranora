export * from './database.types';

export type Locale = 'bn' | 'en';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

