export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          title: string
          date: string
          time: string
          patient_id: string
          doctor_id: string
          service_id: string
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          date: string
          time: string
          patient_id: string
          doctor_id: string
          service_id: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          date?: string
          time?: string
          patient_id?: string
          doctor_id?: string
          service_id?: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            referencedRelation: "doctores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          }
        ]
      }
      pacientes: {
        Row: {
          id: string
          nombre_completo: string
          fecha_nacimiento: string
          genero: string
          direccion: string | null
          celular: string | null
          email: string | null
          alergias: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          nombre_completo: string
          fecha_nacimiento: string
          genero: string
          direccion?: string | null
          celular?: string | null
          email?: string | null
          alergias?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          nombre_completo?: string
          fecha_nacimiento?: string
          genero?: string
          direccion?: string | null
          celular?: string | null
          email?: string | null
          alergias?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      doctores: {
        Row: {
          id: string
          nombre_completo: string
          especialidad: string
          celular: string | null
          email: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          nombre_completo: string
          especialidad: string
          celular?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          nombre_completo?: string
          especialidad?: string
          celular?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      servicios: {
        Row: {
          id: string
          nombre_servicio: string
          precio: number
          descripcion: string | null
          duracion: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          nombre_servicio: string
          precio: number
          descripcion?: string | null
          duracion: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          nombre_servicio?: string
          precio?: number
          descripcion?: string | null
          duracion?: number
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 