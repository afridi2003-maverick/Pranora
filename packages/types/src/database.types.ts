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
    };
    Views: Record<string, never>;
    Functions: {
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
