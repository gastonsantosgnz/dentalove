import { supabase } from './supabase';

export interface Doctor {
  id: string;
  nombre_completo: string;
  especialidad: string;
  celular?: string;
  consultorio_id: string;
  porcentaje_comision?: number;
  created_at?: string;
  updated_at?: string;
}

export const getDoctores = async (): Promise<Doctor[]> => {
  const { data, error } = await supabase
    .from('doctores')
    .select('*')
    .order('nombre_completo');
  
  if (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
  
  return (data || []).map((doctor: any) => ({
    id: String(doctor.id || ''),
    nombre_completo: String(doctor.nombre_completo || ''),
    especialidad: String(doctor.especialidad || ''),
    celular: doctor.celular ? String(doctor.celular) : undefined,
    consultorio_id: String(doctor.consultorio_id || ''),
    porcentaje_comision: Number(doctor.porcentaje_comision || 0),
    created_at: String(doctor.created_at || ''),
    updated_at: String(doctor.updated_at || '')
  }));
};

export const getDoctoresByConsultorio = async (consultorioId: string): Promise<Doctor[]> => {
  const { data, error } = await supabase
    .from('doctores')
    .select('*')
    .eq('consultorio_id', consultorioId)
    .order('nombre_completo');
  
  if (error) {
    console.error('Error fetching doctors by consultorio:', error);
    throw error;
  }
  
  return (data || []).map((doctor: any) => ({
    id: String(doctor.id || ''),
    nombre_completo: String(doctor.nombre_completo || ''),
    especialidad: String(doctor.especialidad || ''),
    celular: doctor.celular ? String(doctor.celular) : undefined,
    consultorio_id: String(doctor.consultorio_id || ''),
    porcentaje_comision: Number(doctor.porcentaje_comision || 0),
    created_at: String(doctor.created_at || ''),
    updated_at: String(doctor.updated_at || '')
  }));
};

export const getDoctor = async (id: string): Promise<Doctor | null> => {
  const { data, error } = await supabase
    .from('doctores')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching doctor:', error);
    throw error;
  }
  
  return data ? {
    id: String(data.id || ''),
    nombre_completo: String(data.nombre_completo || ''),
    especialidad: String(data.especialidad || ''),
    celular: data.celular ? String(data.celular) : undefined,
    consultorio_id: String(data.consultorio_id || ''),
    porcentaje_comision: Number(data.porcentaje_comision || 0),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || '')
  } : null;
};

export const createDoctor = async (doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> => {
  const { data, error } = await supabase
    .from('doctores')
    .insert(doctor)
    .select()
    .single();

  if (error) {
    console.error('Error creating doctor:', error);
    throw error;
  }

  return {
    id: String(data.id || ''),
    nombre_completo: String(data.nombre_completo || ''),
    especialidad: String(data.especialidad || ''),
    celular: data.celular ? String(data.celular) : undefined,
    consultorio_id: String(data.consultorio_id || ''),
    porcentaje_comision: Number(data.porcentaje_comision || 0),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || '')
  };
};

export const updateDoctor = async (id: string, doctor: Partial<Omit<Doctor, 'id' | 'created_at' | 'updated_at'>>): Promise<Doctor> => {
  const { data, error } = await supabase
    .from('doctores')
    .update(doctor)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating doctor:', error);
    throw error;
  }

  return {
    id: String(data.id || ''),
    nombre_completo: String(data.nombre_completo || ''),
    especialidad: String(data.especialidad || ''),
    celular: data.celular ? String(data.celular) : undefined,
    consultorio_id: String(data.consultorio_id || ''),
    porcentaje_comision: Number(data.porcentaje_comision || 0),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || '')
  };
};

export const deleteDoctor = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('doctores')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting doctor:', error);
    throw error;
  }
}; 