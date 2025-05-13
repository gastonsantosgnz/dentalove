import { createClient } from '@supabase/supabase-js';

// Extender la interfaz Window para incluir ENV
declare global {
  interface Window {
    ENV?: {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
  }
}

// Tipos que coincidirán con la estructura de Supabase
export interface Paciente {
  id: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  celular?: string | null;
  notas?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type PacienteCreate = Omit<Paciente, 'id' | 'created_at' | 'updated_at'>;
export type PacienteUpdate = Partial<PacienteCreate>;

// Definición de Servicio para Supabase
export interface Servicio {
  id: string;
  nombre_servicio: string;
  costo: number;
  duracion: number; // en minutos
  descripcion?: string | null;
  especialidad?: string | null;
  tipo_paciente: string; // 'Adulto' | 'Pediátrico' | 'General'
  created_at?: string;
  updated_at?: string;
}

export type ServicioCreate = Omit<Servicio, 'id' | 'created_at' | 'updated_at'>;
export type ServicioUpdate = Partial<ServicioCreate>;

// Definición de Plan de Tratamiento para Supabase
export interface PlanTratamiento {
  id: string;
  paciente_id: string;
  fecha: string;
  observaciones?: string | null;
  costo_total: number;
  created_at?: string;
  updated_at?: string;
}

export type PlanTratamientoCreate = Omit<PlanTratamiento, 'id' | 'created_at' | 'updated_at'>;
export type PlanTratamientoUpdate = Partial<PlanTratamientoCreate>;

// Definición de Zona de Tratamiento para Supabase
export interface PlanZona {
  id: string;
  plan_id: string;
  zona: string; // Puede ser un número de diente o "boca-completa", "arco-superior", "arco-inferior"
  created_at?: string;
}

export type PlanZonaCreate = Omit<PlanZona, 'id' | 'created_at'>;

// Definición de Condición dental para Supabase
export interface ZonaCondicion {
  id: string;
  zona_id: string;
  nombre_condicion: string;
  color: string;
  created_at?: string;
}

export type ZonaCondicionCreate = Omit<ZonaCondicion, 'id' | 'created_at'>;

// Definición de Tratamiento dental para Supabase
export interface ZonaTratamiento {
  id: string;
  zona_id: string;
  servicio_id: string;
  nombre_tratamiento: string;
  color: string;
  created_at?: string;
}

export type ZonaTratamientoCreate = Omit<ZonaTratamiento, 'id' | 'created_at'>;

// Interfaz para nuestro repositorio (usado tanto por LocalStorage como por Supabase)
export interface DataRepository {
  // Pacientes
  getPacientes(): Promise<Paciente[]>;
  getPacienteById(id: string): Promise<Paciente | null>;
  createPaciente(paciente: Omit<Paciente, "id" | "createdAt">): Promise<Paciente>;
  updatePaciente(id: string, paciente: Partial<Paciente>): Promise<Paciente | null>;
  deletePaciente(id: string): Promise<boolean>;
  deletePacientes(ids: string[]): Promise<boolean>;
  
  // Servicios
  getServicios(): Promise<Servicio[]>;
  getServicioById(id: string): Promise<Servicio | null>;
  createServicio(servicio: Omit<Servicio, "id" | "createdAt">): Promise<Servicio>;
  updateServicio(id: string, servicio: Partial<Servicio>): Promise<Servicio | null>;
  deleteServicio(id: string): Promise<boolean>;
  deleteServicios(ids: string[]): Promise<boolean>;
}

// Implementación con LocalStorage
export class LocalStorageRepository implements DataRepository {
  async getPacientes(): Promise<Paciente[]> {
    return [];
  }
  
  async getPacienteById(id: string): Promise<Paciente | null> {
    return null;
  }
  
  async createPaciente(paciente: Omit<Paciente, "id" | "created_at">): Promise<Paciente> {
    throw new Error("Local storage repository is deprecated, use Supabase instead");
  }
  
  async updatePaciente(id: string, paciente: Partial<Paciente>): Promise<Paciente | null> {
    return null;
  }
  
  async deletePaciente(id: string): Promise<boolean> {
    return false;
  }
  
  async deletePacientes(ids: string[]): Promise<boolean> {
    return false;
  }
  
  async getServicios(): Promise<Servicio[]> {
    return [];
  }
  
  async getServicioById(id: string): Promise<Servicio | null> {
    return null;
  }
  
  async createServicio(servicio: Omit<Servicio, "id" | "created_at">): Promise<Servicio> {
    throw new Error("Local storage repository is deprecated, use Supabase instead");
  }
  
  async updateServicio(id: string, servicio: Partial<Servicio>): Promise<Servicio | null> {
    return null;
  }
  
  async deleteServicio(id: string): Promise<boolean> {
    return false;
  }
  
  async deleteServicios(ids: string[]): Promise<boolean> {
    return false;
  }
}

// Implementación futura con Supabase (preparada para cuando se conecte)
export class SupabaseRepository implements DataRepository {
  private client;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }
  
  // Implementación para pacientes
  async getPacientes(): Promise<Paciente[]> {
    const { data, error } = await this.client
      .from('pacientes')
      .select('*');
      
    if (error) throw error;
    return data || [];
  }
  
  async getPacienteById(id: string): Promise<Paciente | null> {
    const { data, error } = await this.client
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) return null;
    return data;
  }
  
  async createPaciente(paciente: Omit<Paciente, "id" | "created_at">): Promise<Paciente> {
    const newPaciente = {
      ...paciente,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await this.client
      .from('pacientes')
      .insert(newPaciente)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async updatePaciente(id: string, paciente: Partial<Paciente>): Promise<Paciente | null> {
    const { data, error } = await this.client
      .from('pacientes')
      .update(paciente)
      .eq('id', id)
      .select()
      .single();
      
    if (error) return null;
    return data;
  }
  
  async deletePaciente(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('pacientes')
      .delete()
      .eq('id', id);
      
    return !error;
  }
  
  async deletePacientes(ids: string[]): Promise<boolean> {
    const { error } = await this.client
      .from('pacientes')
      .delete()
      .in('id', ids);
      
    return !error;
  }
  
  // Implementación para servicios
  async getServicios(): Promise<Servicio[]> {
    const { data, error } = await this.client
      .from('servicios')
      .select('*');
      
    if (error) throw error;
    return data || [];
  }
  
  async getServicioById(id: string): Promise<Servicio | null> {
    const { data, error } = await this.client
      .from('servicios')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) return null;
    return data;
  }
  
  async createServicio(servicio: Omit<Servicio, "id" | "created_at">): Promise<Servicio> {
    const newServicio = {
      ...servicio,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await this.client
      .from('servicios')
      .insert(newServicio)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async updateServicio(id: string, servicio: Partial<Servicio>): Promise<Servicio | null> {
    const { data, error } = await this.client
      .from('servicios')
      .update(servicio)
      .eq('id', id)
      .select()
      .single();
      
    if (error) return null;
    return data;
  }
  
  async deleteServicio(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('servicios')
      .delete()
      .eq('id', id);
      
    return !error;
  }
  
  async deleteServicios(ids: string[]): Promise<boolean> {
    const { error } = await this.client
      .from('servicios')
      .delete()
      .in('id', ids);
      
    return !error;
  }
}

// Factory para obtener la implementación correcta según el entorno
export function getRepository(): DataRepository {
  // Always use Supabase repository if available
  if (typeof window !== 'undefined' && 
      window.ENV && 
      window.ENV.SUPABASE_URL && 
      window.ENV.SUPABASE_ANON_KEY) {
    return new SupabaseRepository(
      window.ENV.SUPABASE_URL,
      window.ENV.SUPABASE_ANON_KEY
    );
  }
  
  // Return an empty repository for SSR or if Supabase is not configured
  return new LocalStorageRepository();
}

// Exportar una instancia por defecto para usar en la app
export const dataRepository = getRepository(); 