export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | 'owner'
  | 'rescuer'
  | 'shelter'
  | 'adoption_lister'
  | 'vet'
  | 'provider'
  | 'admin';

export type AppLocale = 'bn' | 'en';

export type VerificationStatus =
  | 'draft'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'suspended';

// Alias for backwards compatibility
export type RoleStatus = VerificationStatus;

export type SpeciesType =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'rabbit'
  | 'fish'
  | 'cow'
  | 'goat'
  | 'poultry'
  | 'other';

export type PetGender = 'male' | 'female' | 'unknown';

export type ProviderType =
  | 'vet_clinic'
  | 'pet_hospital'
  | 'govt_vet_hospital'
  | 'freelance_vet'
  | 'groomer'
  | 'pet_shop'
  | 'boarding'
  | 'trainer'
  | 'sitter'
  | 'pet_taxi'
  | 'shelter';

export type ScheduleMode = 'slot' | 'serial';

export type BookingType =
  | 'slot'
  | 'serial'
  | 'home_visit'
  | 'online'
  | 'date_range'
  | 'order'
  | 'instant'
  | 'listing';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_owner'
  | 'cancelled_by_provider'
  | 'no_show'
  | 'expired';

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'card';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type ReminderType =
  | 'vaccine'
  | 'deworming'
  | 'flea_tick'
  | 'medicine'
  | 'grooming'
  | 'checkup'
  | 'custom';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type AdoptionListingStatus =
  | 'draft'
  | 'available'
  | 'reserved'
  | 'adopted'
  | 'withdrawn'
  | 'removed';

export type AdoptionApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export type HomeType =
  | 'own_house'
  | 'rented_house'
  | 'own_flat'
  | 'rented_flat'
  | 'other';

export type AnimalReportKind = 'injured' | 'lost' | 'found' | 'abandoned';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type RescueStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'rescue_in_progress'
  | 'closed'
  | 'rejected'
  | 'duplicate';

export type AssignmentStatus =
  | 'offered'
  | 'accepted'
  | 'declined'
  | 'withdrawn';

export type RescueOutcome =
  | 'treated'
  | 'sent_to_shelter'
  | 'adopted'
  | 'returned_to_owner'
  | 'released'
  | 'died'
  | 'not_found'
  | 'other';

export type ReportTarget =
  | 'adoption_listing'
  | 'animal_report'
  | 'review'
  | 'provider'
  | 'user';

export type ModerationStatus = 'open' | 'actioned' | 'dismissed';

export type CallKind = 'audio' | 'video';

export type CallStatus =
  | 'ringing'
  | 'ongoing'
  | 'ended'
  | 'missed'
  | 'declined'
  | 'failed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          locale: AppLocale;
          district_id: number | null;
          push_token: string | null;
          sms_opt_in: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          locale?: AppLocale;
          district_id?: number | null;
          push_token?: string | null;
          sms_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          locale?: AppLocale;
          district_id?: number | null;
          push_token?: string | null;
          sms_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: UserRole;
          status: VerificationStatus;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: UserRole;
          status?: VerificationStatus;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: UserRole;
          status?: VerificationStatus;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_id?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          actor_id?: string | null;
          action?: string;
          table_name?: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      divisions: {
        Row: {
          id: number;
          name_bn: string;
          name_en: string;
        };
        Insert: {
          id: number;
          name_bn: string;
          name_en: string;
        };
        Update: {
          id?: number;
          name_bn?: string;
          name_en?: string;
        };
        Relationships: [];
      };
      districts: {
        Row: {
          id: number;
          division_id: number;
          name_bn: string;
          name_en: string;
        };
        Insert: {
          id: number;
          division_id: number;
          name_bn: string;
          name_en: string;
        };
        Update: {
          id?: number;
          division_id?: number;
          name_bn?: string;
          name_en?: string;
        };
        Relationships: [];
      };
      upazilas: {
        Row: {
          id: number;
          district_id: number;
          name_bn: string;
          name_en: string;
          center: unknown | null;
        };
        Insert: {
          id: number;
          district_id: number;
          name_bn: string;
          name_en: string;
          center?: unknown | null;
        };
        Update: {
          id?: number;
          district_id?: number;
          name_bn?: string;
          name_en?: string;
          center?: unknown | null;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          address_line: string;
          upazila_id: number | null;
          location: unknown | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          address_line: string;
          upazila_id?: number | null;
          location?: unknown | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          address_line?: string;
          upazila_id?: number | null;
          location?: unknown | null;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      rescuer_profiles: {
        Row: {
          user_id: string;
          base_location: unknown | null;
          district_id: number | null;
          radius_km: number;
          species: SpeciesType[];
          is_available: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          base_location?: unknown | null;
          district_id?: number | null;
          radius_km?: number;
          species?: SpeciesType[];
          is_available?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          base_location?: unknown | null;
          district_id?: number | null;
          radius_km?: number;
          species?: SpeciesType[];
          is_available?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      lost_found_sightings: {
        Row: {
          id: string;
          report_id: string;
          reporter_user_id: string | null;
          message: string;
          location_text: string | null;
          photos: string[];
          contact_phone: string | null;
          contact_shared: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          reporter_user_id?: string | null;
          message: string;
          location_text?: string | null;
          photos?: string[];
          contact_phone?: string | null;
          contact_shared?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          reporter_user_id?: string | null;
          message?: string;
          location_text?: string | null;
          photos?: string[];
          contact_phone?: string | null;
          contact_shared?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      app_config: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title_bn: string | null;
          title_en: string | null;
          body_bn: string | null;
          body_en: string | null;
          data: Json;
          channel: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title_bn?: string | null;
          title_en?: string | null;
          body_bn?: string | null;
          body_en?: string | null;
          data?: Json;
          channel?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title_bn?: string | null;
          title_en?: string | null;
          body_bn?: string | null;
          body_en?: string | null;
          data?: Json;
          channel?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          pet_id: string;
          owner_id: string;
          type: ReminderType;
          title: string;
          remind_at: string;
          repeat_days: number | null;
          vaccination_id: string | null;
          is_done: boolean;
          last_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          owner_id?: string;
          type: ReminderType;
          title: string;
          remind_at: string;
          repeat_days?: number | null;
          vaccination_id?: string | null;
          is_done?: boolean;
          last_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          owner_id?: string;
          type?: ReminderType;
          title?: string;
          remind_at?: string;
          repeat_days?: number | null;
          vaccination_id?: string | null;
          is_done?: boolean;
          last_sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      providers: {
        Row: {
          id: string;
          owner_user_id: string;
          type: ProviderType;
          name_bn: string | null;
          name_en: string | null;
          description_bn: string | null;
          description_en: string | null;
          logo_url: string | null;
          phone: string;
          whatsapp: string | null;
          email: string | null;
          website: string | null;
          trade_license_no: string | null;
          is_government: boolean;
          verification: VerificationStatus;
          verified_at: string | null;
          rating_avg: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          type: ProviderType;
          name_bn?: string | null;
          name_en?: string | null;
          description_bn?: string | null;
          description_en?: string | null;
          logo_url?: string | null;
          phone: string;
          whatsapp?: string | null;
          email?: string | null;
          website?: string | null;
          trade_license_no?: string | null;
          is_government?: boolean;
          verification?: VerificationStatus;
          verified_at?: string | null;
          rating_avg?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_user_id?: string;
          type?: ProviderType;
          name_bn?: string | null;
          name_en?: string | null;
          description_bn?: string | null;
          description_en?: string | null;
          logo_url?: string | null;
          phone?: string;
          whatsapp?: string | null;
          email?: string | null;
          website?: string | null;
          trade_license_no?: string | null;
          is_government?: boolean;
          verification?: VerificationStatus;
          verified_at?: string | null;
          rating_avg?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      provider_locations: {
        Row: {
          id: string;
          provider_id: string;
          name_bn: string | null;
          name_en: string | null;
          address_bn: string | null;
          address_en: string | null;
          upazila_id: number | null;
          location: unknown;
          phone: string | null;
          is_24h: boolean;
          has_emergency: boolean;
          offers_home_visit: boolean;
          home_visit_radius_km: number | null;
          species_treated: SpeciesType[];
          photos: string[];
          cancel_cutoff_hours: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          name_bn?: string | null;
          name_en?: string | null;
          address_bn?: string | null;
          address_en?: string | null;
          upazila_id?: number | null;
          location: unknown;
          phone?: string | null;
          is_24h?: boolean;
          has_emergency?: boolean;
          offers_home_visit?: boolean;
          home_visit_radius_km?: number | null;
          species_treated?: SpeciesType[];
          photos?: string[];
          cancel_cutoff_hours?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          name_bn?: string | null;
          name_en?: string | null;
          address_bn?: string | null;
          address_en?: string | null;
          upazila_id?: number | null;
          location?: unknown;
          phone?: string | null;
          is_24h?: boolean;
          has_emergency?: boolean;
          offers_home_visit?: boolean;
          home_visit_radius_km?: number | null;
          species_treated?: SpeciesType[];
          photos?: string[];
          cancel_cutoff_hours?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      location_hours: {
        Row: {
          id: string;
          location_id: string;
          weekday: number;
          open_time: string;
          close_time: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          weekday: number;
          open_time: string;
          close_time: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          weekday?: number;
          open_time?: string;
          close_time?: string;
        };
        Relationships: [];
      };
      location_vets: {
        Row: {
          location_id: string;
          vet_id: string;
        };
        Insert: {
          location_id: string;
          vet_id: string;
        };
        Update: {
          location_id?: string;
          vet_id?: string;
        };
        Relationships: [];
      };
      provider_services: {
        Row: {
          id: string;
          location_id: string;
          service_id: number;
          price: number | null;
          price_max: number | null;
          duration_min: number | null;
          species: SpeciesType[] | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          location_id: string;
          service_id: number;
          price?: number | null;
          price_max?: number | null;
          duration_min?: number | null;
          species?: SpeciesType[] | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          location_id?: string;
          service_id?: number;
          price?: number | null;
          price_max?: number | null;
          duration_min?: number | null;
          species?: SpeciesType[] | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      provider_documents: {
        Row: {
          id: string;
          provider_id: string | null;
          vet_id: string | null;
          doc_type: string;
          file_path: string;
          status: VerificationStatus;
          reviewed_by: string | null;
          review_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id?: string | null;
          vet_id?: string | null;
          doc_type: string;
          file_path: string;
          status?: VerificationStatus;
          reviewed_by?: string | null;
          review_note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string | null;
          vet_id?: string | null;
          doc_type?: string;
          file_path?: string;
          status?: VerificationStatus;
          reviewed_by?: string | null;
          review_note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      clinic_suggestions: {
        Row: {
          id: string;
          suggested_by: string | null;
          name: string;
          phone: string | null;
          address: string | null;
          location: unknown;
          status: VerificationStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          suggested_by?: string | null;
          name: string;
          phone?: string | null;
          address?: string | null;
          location?: unknown;
          status?: VerificationStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          suggested_by?: string | null;
          name?: string;
          phone?: string | null;
          address?: string | null;
          location?: unknown;
          status?: VerificationStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      animal_reports: {
        Row: {
          id: string;
          reporter_id: string;
          kind: AnimalReportKind;
          pet_id: string | null;
          species: SpeciesType;
          urgency: UrgencyLevel;
          last_seen_at: string | null;
          contact_phone: string | null;
          description: string | null;
          photos: string[];
          location: unknown;
          area_text: string | null;
          upazila_id: number | null;
          district_id: number | null;
          status: RescueStatus;
          duplicate_of: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          escalated_at?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          kind: AnimalReportKind;
          pet_id?: string | null;
          species?: SpeciesType;
          urgency?: UrgencyLevel;
          last_seen_at?: string | null;
          contact_phone?: string | null;
          description?: string | null;
          photos?: string[];
          location: unknown;
          area_text?: string | null;
          upazila_id?: number | null;
          district_id?: number | null;
          status?: RescueStatus;
          duplicate_of?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          escalated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          kind?: AnimalReportKind;
          pet_id?: string | null;
          species?: SpeciesType;
          urgency?: UrgencyLevel;
          last_seen_at?: string | null;
          contact_phone?: string | null;
          description?: string | null;
          photos?: string[];
          location?: unknown;
          area_text?: string | null;
          upazila_id?: number | null;
          district_id?: number | null;
          status?: RescueStatus;
          duplicate_of?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          escalated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rescue_cases: {
        Row: {
          id: string;
          report_id: string;
          status: RescueStatus;
          shelter_id: string | null;
          assigned_rescuer_id: string | null;
          pet_id: string | null;
          outcome: RescueOutcome | null;
          outcome_note: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          status?: RescueStatus;
          shelter_id?: string | null;
          assigned_rescuer_id?: string | null;
          pet_id?: string | null;
          outcome?: RescueOutcome | null;
          outcome_note?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          status?: RescueStatus;
          shelter_id?: string | null;
          assigned_rescuer_id?: string | null;
          pet_id?: string | null;
          outcome?: RescueOutcome | null;
          outcome_note?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rescue_assignments: {
        Row: {
          id: string;
          case_id: string;
          rescuer_id: string;
          assigned_by: string;
          status: AssignmentStatus;
          decline_reason: string | null;
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          rescuer_id: string;
          assigned_by: string;
          status?: AssignmentStatus;
          decline_reason?: string | null;
          responded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          rescuer_id?: string;
          assigned_by?: string;
          status?: AssignmentStatus;
          decline_reason?: string | null;
          responded_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      rescue_case_updates: {
        Row: {
          id: string;
          case_id: string;
          author_id: string;
          status: RescueStatus | null;
          note: string | null;
          photos: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          author_id: string;
          status?: RescueStatus | null;
          note?: string | null;
          photos?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          author_id?: string;
          status?: RescueStatus | null;
          note?: string | null;
          photos?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      adoption_listings: {
        Row: {
          id: string;
          pet_id: string;
          posted_by: string;
          shelter_id: string | null;
          species: SpeciesType;
          age_months: number | null;
          gender: PetGender;
          title_bn: string | null;
          title_en: string | null;
          description_bn: string | null;
          description_en: string | null;
          photos: string[];
          is_vaccinated: boolean;
          is_neutered: boolean;
          district_id: number;
          upazila_id: number | null;
          status: AdoptionListingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          posted_by: string;
          shelter_id?: string | null;
          species: SpeciesType;
          age_months?: number | null;
          gender?: PetGender;
          title_bn?: string | null;
          title_en?: string | null;
          description_bn?: string | null;
          description_en?: string | null;
          photos?: string[];
          is_vaccinated?: boolean;
          is_neutered?: boolean;
          district_id: number;
          upazila_id?: number | null;
          status?: AdoptionListingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          posted_by?: string;
          shelter_id?: string | null;
          species?: SpeciesType;
          age_months?: number | null;
          gender?: PetGender;
          title_bn?: string | null;
          title_en?: string | null;
          description_bn?: string | null;
          description_en?: string | null;
          photos?: string[];
          is_vaccinated?: boolean;
          is_neutered?: boolean;
          district_id?: number;
          upazila_id?: number | null;
          status?: AdoptionListingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      adoption_applications: {
        Row: {
          id: string;
          listing_id: string;
          applicant_id: string;
          home_type: HomeType;
          has_other_pets: boolean;
          experience: string | null;
          reason: string;
          status: AdoptionApplicationStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          decision_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          applicant_id: string;
          home_type?: HomeType;
          has_other_pets?: boolean;
          experience?: string | null;
          reason: string;
          status?: AdoptionApplicationStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          decision_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          applicant_id?: string;
          home_type?: HomeType;
          has_other_pets?: boolean;
          experience?: string | null;
          reason?: string;
          status?: AdoptionApplicationStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          decision_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      adoption_handovers: {
        Row: {
          id: string;
          listing_id: string;
          application_id: string;
          pet_id: string;
          from_user_id: string;
          to_user_id: string;
          giver_confirmed_at: string | null;
          adopter_confirmed_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          application_id: string;
          pet_id: string;
          from_user_id: string;
          to_user_id: string;
          giver_confirmed_at?: string | null;
          adopter_confirmed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          application_id?: string;
          pet_id?: string;
          from_user_id?: string;
          to_user_id?: string;
          giver_confirmed_at?: string | null;
          adopter_confirmed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      adoption_favorites: {
        Row: {
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      adoption_followups: {
        Row: {
          id: string;
          handover_id: string;
          due_on: string;
          sent_at: string | null;
          answered_at: string | null;
          wellbeing: string | null;
          note: string | null;
          photos: string[];
        };
        Insert: {
          id?: string;
          handover_id: string;
          due_on: string;
          sent_at?: string | null;
          answered_at?: string | null;
          wellbeing?: string | null;
          note?: string | null;
          photos?: string[];
        };
        Update: {
          id?: string;
          handover_id?: string;
          due_on?: string;
          sent_at?: string | null;
          answered_at?: string | null;
          wellbeing?: string | null;
          note?: string | null;
          photos?: string[];
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      decide_adoption_application: {
        Args: {
          p_application_id: string;
          p_approve: boolean;
          p_note?: string | null;
        };
        Returns: boolean;
      };
      confirm_handover: {
        Args: {
          p_handover_id: string;
        };
        Returns: boolean;
      };
      submit_adoption_followup: {
        Args: {
          p_followup_id: string;
          p_wellbeing: 'good' | 'okay' | 'needs_help';
          p_note?: string | null;
          p_photos?: string[];
        };
        Returns: boolean;
      };
      process_due_adoption_followups: {
        Args: Record<string, never>;
        Returns: number;
      };
      toggle_adoption_favorite: {
        Args: {
          p_listing_id: string;
        };
        Returns: boolean;
      };
      review_animal_report: {
        Args: {
          p_report_id: string;
          p_accept: boolean;
          p_shelter_id?: string | null;
        };
        Returns: string | null;
      };
      assign_rescuer: {
        Args: {
          p_case_id: string;
          p_rescuer_id: string;
        };
        Returns: string;
      };
      respond_to_assignment: {
        Args: {
          p_assignment_id: string;
          p_accept: boolean;
          p_decline_reason?: string | null;
        };
        Returns: boolean;
      };
      close_rescue_case: {
        Args: {
          p_case_id: string;
          p_outcome: RescueOutcome;
          p_note?: string | null;
          p_pet_id?: string | null;
        };
        Returns: boolean;
      };
      find_potential_duplicate_reports: {
        Args: {
          p_report_id: string;
          p_radius_meters?: number;
        };
        Returns: {
          id: string;
          reporter_id: string;
          kind: AnimalReportKind;
          species: SpeciesType;
          urgency: UrgencyLevel;
          description: string | null;
          photos: string[];
          area_text: string | null;
          status: RescueStatus;
          distance_meters: number;
          created_at: string;
        }[];
      };
      merge_animal_reports: {
        Args: {
          p_duplicate_id: string;
          p_target_id: string;
        };
        Returns: boolean;
      };
      nearby_rescuers: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_radius_m?: number | null;
          p_species?: SpeciesType | null;
        };
        Returns: {
          rescuer_id: string;
          distance_meters: number;
          radius_km: number;
          is_available: boolean;
          species: SpeciesType[];
          display_name: string | null;
          avatar_url: string | null;
          active_cases_count: number;
        }[];
      };
      upsert_rescuer_profile: {
        Args: {
          p_user_id: string;
          p_lat?: number | null;
          p_lng?: number | null;
          p_district_id?: number | null;
          p_radius_km?: number | null;
          p_species?: SpeciesType[] | null;
          p_is_available?: boolean | null;
        };
        Returns: Database['public']['Tables']['rescuer_profiles']['Row'];
      };
      submit_lost_found_sighting: {
        Args: {
          p_report_id: string;
          p_message: string;
          p_location_text?: string | null;
          p_photos?: string[] | null;
          p_contact_phone?: string | null;
        };
        Returns: string;
      };
      share_sighting_contact: {
        Args: {
          p_sighting_id: string;
        };
        Returns: boolean;
      };
      alert_nearby_users_for_lost_found: {
        Args: {
          p_report_id: string;
          p_radius_km?: number | null;
        };
        Returns: number;
      };
      my_report_status: {
        Args: {
          p_report_id: string;
        };
        Returns: Json;
      };
      has_role: {
        Args: {
          target_user_id: string;
          check_role: UserRole;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: {
          target_user_id: string;
        };
        Returns: boolean;
      };
      notify: {
        Args: {
          p_user_id: string;
          p_template_key: string;
          p_data?: Json;
          p_channels?: string[];
        };
        Returns: Json;
      };
      create_notification: {
        Args: {
          p_user_id: string;
          p_title_bn: string;
          p_title_en: string;
          p_body_bn: string;
          p_body_en: string;
          p_data?: Json;
          p_channel?: string;
        };
        Returns: string;
      };
      notify_urgent_rescue_report: {
        Args: {
          p_report_id: string;
        };
        Returns: Json;
      };
      escalate_unreviewed_rescue_reports: {
        Args: Record<string, never>;
        Returns: Json;
      };
      is_location_open: {
        Args: {
          p_location_id: string;
          p_at?: string;
        };
        Returns: boolean;
      };
      nearby_clinics: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_radius_m?: number;
          p_open_now?: boolean;
          p_emergency?: boolean;
          p_home_visit?: boolean;
          p_species?: SpeciesType;
          p_service?: string;
          p_max_fee?: number;
          p_types?: ProviderType[];
          p_limit?: number;
        };
        Returns: {
          location_id: string;
          provider_id: string;
          name_bn: string | null;
          name_en: string | null;
          address_bn: string | null;
          address_en: string | null;
          phone: string | null;
          type: ProviderType;
          is_government: boolean;
          is_24h: boolean;
          has_emergency: boolean;
          offers_home_visit: boolean;
          is_open_now: boolean;
          rating_avg: number;
          rating_count: number;
          fee_from: number | null;
          lat: number;
          lng: number;
          distance_m: number;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      app_locale: AppLocale;
      verification_status: VerificationStatus;
      role_status: VerificationStatus;
      species_type: SpeciesType;
      pet_gender: PetGender;
      provider_type: ProviderType;
      schedule_mode: ScheduleMode;
      booking_type: BookingType;
      booking_status: BookingStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      reminder_type: ReminderType;
      order_status: OrderStatus;
      adoption_listing_status: AdoptionListingStatus;
      adoption_application_status: AdoptionApplicationStatus;
      home_type: HomeType;
      animal_report_kind: AnimalReportKind;
      urgency_level: UrgencyLevel;
      rescue_status: RescueStatus;
      assignment_status: AssignmentStatus;
      rescue_outcome: RescueOutcome;
      report_target: ReportTarget;
      moderation_status: ModerationStatus;
      call_kind: CallKind;
      call_status: CallStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
