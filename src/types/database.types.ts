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
          plan_tratamiento_id: string | null
          notes: string | null
          is_first_visit: boolean
          consultorio_id: string
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
          plan_tratamiento_id?: string | null
          notes?: string | null
          is_first_visit?: boolean
          consultorio_id: string
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
          plan_tratamiento_id?: string | null
          notes?: string | null
          is_first_visit?: boolean
          consultorio_id?: string
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
            foreignKeyName: "appointments_plan_tratamiento_id_fkey"
            columns: ["plan_tratamiento_id"]
            referencedRelation: "planes_tratamiento"
            referencedColumns: ["id"]
          }
        ]
      }
      pacientes: {
        Row: {
          id: string
          nombre_completo: string
          fecha_nacimiento: string
          celular: string | null
          notas: string | null
          consultorio_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_completo: string
          fecha_nacimiento: string
          celular?: string | null
          notas?: string | null
          consultorio_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_completo?: string
          fecha_nacimiento?: string
          celular?: string | null
          notas?: string | null
          consultorio_id?: string
          created_at?: string
          updated_at?: string
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
          consultorio_id: string
          porcentaje_comision: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_completo: string
          especialidad: string
          celular?: string | null
          email?: string | null
          consultorio_id: string
          porcentaje_comision?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_completo?: string
          especialidad?: string
          celular?: string | null
          email?: string | null
          consultorio_id?: string
          porcentaje_comision?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      servicios: {
        Row: {
          id: string
          nombre_servicio: string
          costo: number
          duracion: number
          descripcion: string | null
          especialidad: string | null
          tipo_paciente: string
          consultorio_id: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          nombre_servicio: string
          costo: number
          duracion: number
          descripcion?: string | null
          especialidad?: string | null
          tipo_paciente: string
          consultorio_id: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          nombre_servicio?: string
          costo?: number
          duracion?: number
          descripcion?: string | null
          especialidad?: string | null
          tipo_paciente?: string
          consultorio_id?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      consultorios: {
        Row: {
          id: string
          nombre: string
          direccion: string | null
          telefono: string | null
          email: string | null
          logo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          logo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          logo?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      planes_tratamiento: {
        Row: {
          id: string
          paciente_id: string
          fecha: string
          observaciones: string | null
          costo_total: number
          consultorio_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          fecha: string
          observaciones?: string | null
          costo_total: number
          consultorio_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          fecha?: string
          observaciones?: string | null
          costo_total?: number
          consultorio_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_zonas: {
        Row: {
          id: string
          plan_id: string
          version_id: string | null
          zona: string
          comentario: string | null
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          version_id?: string | null
          zona: string
          comentario?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          version_id?: string | null
          zona?: string
          comentario?: string | null
          created_at?: string
        }
        Relationships: []
      }
      zona_condiciones: {
        Row: {
          id: string
          zona_id: string
          nombre_condicion: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          zona_id: string
          nombre_condicion: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          zona_id?: string
          nombre_condicion?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      zona_tratamientos: {
        Row: {
          id: string
          zona_id: string
          servicio_id: string | null
          nombre_tratamiento: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          zona_id: string
          servicio_id?: string | null
          nombre_tratamiento: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          zona_id?: string
          servicio_id?: string | null
          nombre_tratamiento?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      plan_versiones: {
        Row: {
          id: string
          plan_id: string
          nombre: string
          activa: boolean
          costo_total: number
          consultorio_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          plan_id: string
          nombre: string
          activa?: boolean
          costo_total: number
          consultorio_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          plan_id?: string
          nombre?: string
          activa?: boolean
          costo_total?: number
          consultorio_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      servicios_progreso: {
        Row: {
          id: string
          paciente_id: string
          plan_id: string
          version_id: string
          zona_tratamiento_id: string
          estado: string
          fecha_realizacion: string | null
          monto_pagado: number
          fecha_pago: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          plan_id: string
          version_id: string
          zona_tratamiento_id: string
          estado?: string
          fecha_realizacion?: string | null
          monto_pagado?: number
          fecha_pago?: string | null
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          plan_id?: string
          version_id?: string
          zona_tratamiento_id?: string
          estado?: string
          fecha_realizacion?: string | null
          monto_pagado?: number
          fecha_pago?: string | null
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categorias_ingreso: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          consultorio_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          consultorio_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          consultorio_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ingresos: {
        Row: {
          id: string
          consultorio_id: string
          paciente_id: string | null
          doctor_id: string | null
          categoria_id: string | null
          plan_tratamiento_id: string | null
          servicio_progreso_id: string | null
          appointment_id: string | null
          concepto: string
          descripcion: string | null
          monto_total: number
          porcentaje_comision: number
          monto_comision: number
          fecha_servicio: string
          estado: string
          notas: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          consultorio_id: string
          paciente_id?: string | null
          doctor_id?: string | null
          categoria_id?: string | null
          plan_tratamiento_id?: string | null
          servicio_progreso_id?: string | null
          appointment_id?: string | null
          concepto: string
          descripcion?: string | null
          monto_total: number
          porcentaje_comision?: number
          fecha_servicio: string
          estado?: string
          notas?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          consultorio_id?: string
          paciente_id?: string | null
          doctor_id?: string | null
          categoria_id?: string | null
          plan_tratamiento_id?: string | null
          servicio_progreso_id?: string | null
          appointment_id?: string | null
          concepto?: string
          descripcion?: string | null
          monto_total?: number
          porcentaje_comision?: number
          fecha_servicio?: string
          estado?: string
          notas?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      pagos: {
        Row: {
          id: string
          ingreso_id: string
          monto: number
          metodo_pago: string
          referencia: string | null
          fecha_pago: string
          estado: string
          notas: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          ingreso_id: string
          monto: number
          metodo_pago: string
          referencia?: string | null
          fecha_pago: string
          estado?: string
          notas?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          ingreso_id?: string
          monto?: number
          metodo_pago?: string
          referencia?: string | null
          fecha_pago?: string
          estado?: string
          notas?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      vw_servicios_pendientes: {
        Row: {
          id: string
          paciente: string
          paciente_id: string
          fecha_plan: string
          version_plan: string
          nombre_tratamiento: string
          color: string
          estado: string
          monto_pagado: number
          costo_total: number
        }
      }
      vw_servicios_completados: {
        Row: {
          id: string
          paciente: string
          paciente_id: string
          fecha_plan: string
          version_plan: string
          nombre_tratamiento: string
          color: string
          estado: string
          fecha_realizacion: string
          monto_pagado: number
          fecha_pago: string | null
          notas: string | null
          costo_total: number
        }
      }
      vw_ingresos_detalle: {
        Row: {
          id: string
          consultorio_id: string
          concepto: string
          descripcion: string | null
          monto_total: number
          porcentaje_comision: number
          monto_comision: number
          fecha_servicio: string
          estado: string
          notas: string | null
          paciente_nombre: string | null
          paciente_id: string | null
          doctor_nombre: string | null
          doctor_id: string | null
          categoria: string | null
          total_pagado: number
          saldo_pendiente: number
          plan_tratamiento_id: string | null
          servicio_progreso_id: string | null
          appointment_id: string | null
          created_at: string
          updated_at: string
        }
      }
      vw_ingresos_mensuales: {
        Row: {
          mes: string
          consultorio_id: string
          categoria: string | null
          total_transacciones: number
          monto_total: number
          total_pagado: number
          total_pendiente: number
          total_comisiones: number
        }
      }
      vw_comisiones_doctores: {
        Row: {
          doctor_id: string
          doctor_nombre: string
          consultorio_id: string
          mes: string
          total_servicios: number
          monto_total_servicios: number
          total_comisiones: number
          porcentaje_promedio: number
        }
      }
    }
    Functions: {
      crear_ingreso_desde_servicio: {
        Args: {
          p_servicio_progreso_id: string
          p_monto: number
          p_doctor_id: string
          p_porcentaje_comision?: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 