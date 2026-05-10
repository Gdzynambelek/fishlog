/**
 * Database types — handcrafted to match `supabase/migrations/0001_init.sql`.
 *
 * Once Supabase local stack is running, regenerate this file with:
 *   supabase gen types typescript --local > src/types/database.types.ts
 *
 * Keep this file in sync with migrations until that command is run.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          location_name: string | null;
          latitude: number | null;
          longitude: number | null;
          started_at: string;
          ended_at: string | null;
          notes: string | null;
          weather: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          location_name?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          started_at?: string;
          ended_at?: string | null;
          notes?: string | null;
          weather?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trips"]["Insert"]>;
        Relationships: [];
      };
      catches: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          species: string;
          weight_kg: number | null;
          length_cm: number | null;
          caught_at: string;
          latitude: number | null;
          longitude: number | null;
          photo_url: string | null;
          notes: string | null;
          released: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          species: string;
          weight_kg?: number | null;
          length_cm?: number | null;
          caught_at?: string;
          latitude?: number | null;
          longitude?: number | null;
          photo_url?: string | null;
          notes?: string | null;
          released?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["catches"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "catches_trip_id_fkey";
            columns: ["trip_id"];
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience aliases for app code.
export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type TripInsert = Database["public"]["Tables"]["trips"]["Insert"];
export type TripUpdate = Database["public"]["Tables"]["trips"]["Update"];

export type Catch = Database["public"]["Tables"]["catches"]["Row"];
export type CatchInsert = Database["public"]["Tables"]["catches"]["Insert"];
export type CatchUpdate = Database["public"]["Tables"]["catches"]["Update"];
