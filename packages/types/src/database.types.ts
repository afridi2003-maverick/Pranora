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

export type RoleStatus = 'pending' | 'verified' | 'rejected';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string | null;
          email: string | null;
          full_name_bn: string | null;
          full_name_en: string | null;
          avatar_url: string | null;
          preferred_locale: 'bn' | 'en';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone?: string | null;
          email?: string | null;
          full_name_bn?: string | null;
          full_name_en?: string | null;
          avatar_url?: string | null;
          preferred_locale?: 'bn' | 'en';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string | null;
          email?: string | null;
          full_name_bn?: string | null;
          full_name_en?: string | null;
          avatar_url?: string | null;
          preferred_locale?: 'bn' | 'en';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          status: RoleStatus;
          verified_at: string | null;
          verified_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRole;
          status?: RoleStatus;
          verified_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRole;
          status?: RoleStatus;
          verified_at?: string | null;
          verified_by?: string | null;
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
          id?: number;
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
          id?: number;
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
        };
        Insert: {
          id?: number;
          district_id: number;
          name_bn: string;
          name_en: string;
        };
        Update: {
          id?: number;
          district_id?: number;
          name_bn?: string;
          name_en?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          division_id: number;
          district_id: number;
          upazila_id: number;
          address_line: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          division_id: number;
          district_id: number;
          upazila_id: number;
          address_line: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          division_id?: number;
          district_id?: number;
          upazila_id?: number;
          address_line?: string;
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
    };
    Enums: {
      user_role: UserRole;
      role_status: RoleStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
