import { supabase } from './supabase';

export interface Doctor {
  id: string;
  nombre_completo: string;
  especialidad: string;
  celular?: string;
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
  
  return data || [];
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
  
  return data;
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
  
  return data;
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
  
  return data;
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