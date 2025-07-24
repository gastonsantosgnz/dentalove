import { supabase } from './supabase';

export interface Laboratorio {
  id: string;
  consultorio_id: string;
  nombre_laboratorio: string;
  nombre_fiscal?: string;
  rfc?: string;
  contacto_principal?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  especialidades?: string[];
  tiempo_entrega_promedio?: number;
  notas?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getLaboratorios = async (): Promise<Laboratorio[]> => {
  const { data, error } = await supabase
    .from('laboratorios')
    .select('*')
    .order('nombre_laboratorio');
  
  if (error) {
    console.error('Error fetching laboratorios:', error);
    throw error;
  }
  
  return (data || []).map((lab: any) => ({
    id: String(lab.id || ''),
    consultorio_id: String(lab.consultorio_id || ''),
    nombre_laboratorio: String(lab.nombre_laboratorio || ''),
    nombre_fiscal: lab.nombre_fiscal ? String(lab.nombre_fiscal) : undefined,
    rfc: lab.rfc ? String(lab.rfc) : undefined,
    contacto_principal: lab.contacto_principal ? String(lab.contacto_principal) : undefined,
    telefono: lab.telefono ? String(lab.telefono) : undefined,
    email: lab.email ? String(lab.email) : undefined,
    direccion: lab.direccion ? String(lab.direccion) : undefined,
    especialidades: lab.especialidades || [],
    tiempo_entrega_promedio: lab.tiempo_entrega_promedio ? Number(lab.tiempo_entrega_promedio) : undefined,
    notas: lab.notas ? String(lab.notas) : undefined,
    activo: Boolean(lab.activo),
    created_at: String(lab.created_at || ''),
    updated_at: String(lab.updated_at || '')
  }));
};

export const getLaboratoriosByConsultorio = async (consultorioId: string): Promise<Laboratorio[]> => {
  const { data, error } = await supabase
    .from('laboratorios')
    .select('*')
    .eq('consultorio_id', consultorioId)
    .eq('activo', true)
    .order('nombre_laboratorio');
  
  if (error) {
    console.error('Error fetching laboratorios by consultorio:', error);
    throw error;
  }
  
  return (data || []).map((lab: any) => ({
    id: String(lab.id || ''),
    consultorio_id: String(lab.consultorio_id || ''),
    nombre_laboratorio: String(lab.nombre_laboratorio || ''),
    nombre_fiscal: lab.nombre_fiscal ? String(lab.nombre_fiscal) : undefined,
    rfc: lab.rfc ? String(lab.rfc) : undefined,
    contacto_principal: lab.contacto_principal ? String(lab.contacto_principal) : undefined,
    telefono: lab.telefono ? String(lab.telefono) : undefined,
    email: lab.email ? String(lab.email) : undefined,
    direccion: lab.direccion ? String(lab.direccion) : undefined,
    especialidades: lab.especialidades || [],
    tiempo_entrega_promedio: lab.tiempo_entrega_promedio ? Number(lab.tiempo_entrega_promedio) : undefined,
    notas: lab.notas ? String(lab.notas) : undefined,
    activo: Boolean(lab.activo),
    created_at: String(lab.created_at || ''),
    updated_at: String(lab.updated_at || '')
  }));
};

export const createLaboratorio = async (laboratorio: Omit<Laboratorio, 'id' | 'created_at' | 'updated_at'>): Promise<Laboratorio> => {
  const { data, error } = await supabase
    .from('laboratorios')
    .insert(laboratorio)
    .select()
    .single();

  if (error) {
    console.error('Error creating laboratorio:', error);
    throw error;
  }

  return {
    id: String(data.id || ''),
    consultorio_id: String(data.consultorio_id || ''),
    nombre_laboratorio: String(data.nombre_laboratorio || ''),
    nombre_fiscal: data.nombre_fiscal ? String(data.nombre_fiscal) : undefined,
    rfc: data.rfc ? String(data.rfc) : undefined,
    contacto_principal: data.contacto_principal ? String(data.contacto_principal) : undefined,
    telefono: data.telefono ? String(data.telefono) : undefined,
    email: data.email ? String(data.email) : undefined,
    direccion: data.direccion ? String(data.direccion) : undefined,
    especialidades: data.especialidades || [],
    tiempo_entrega_promedio: data.tiempo_entrega_promedio ? Number(data.tiempo_entrega_promedio) : undefined,
    notas: data.notas ? String(data.notas) : undefined,
    activo: Boolean(data.activo),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || '')
  };
};

export const updateLaboratorio = async (id: string, laboratorio: Partial<Omit<Laboratorio, 'id' | 'created_at' | 'updated_at'>>): Promise<Laboratorio> => {
  const { data, error } = await supabase
    .from('laboratorios')
    .update(laboratorio)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating laboratorio:', error);
    throw error;
  }

  return {
    id: String(data.id || ''),
    consultorio_id: String(data.consultorio_id || ''),
    nombre_laboratorio: String(data.nombre_laboratorio || ''),
    nombre_fiscal: data.nombre_fiscal ? String(data.nombre_fiscal) : undefined,
    rfc: data.rfc ? String(data.rfc) : undefined,
    contacto_principal: data.contacto_principal ? String(data.contacto_principal) : undefined,
    telefono: data.telefono ? String(data.telefono) : undefined,
    email: data.email ? String(data.email) : undefined,
    direccion: data.direccion ? String(data.direccion) : undefined,
    especialidades: data.especialidades || [],
    tiempo_entrega_promedio: data.tiempo_entrega_promedio ? Number(data.tiempo_entrega_promedio) : undefined,
    notas: data.notas ? String(data.notas) : undefined,
    activo: Boolean(data.activo),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || '')
  };
};

export const deleteLaboratorio = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('laboratorios')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting laboratorio:', error);
    throw error;
  }
}; 