import { supabase } from '@/lib/supabase';
import { Paciente, PacienteCreate, PacienteUpdate } from '@/lib/database';

// Table name constant
const PACIENTES_TABLE = 'pacientes';

/**
 * Get all patients from Supabase
 */
export async function getPacientes(): Promise<Paciente[]> {
  const { data, error } = await supabase
    .from(PACIENTES_TABLE)
    .select('*')
    .order('nombre_completo', { ascending: true });
  
  if (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Get a patient by ID
 */
export async function getPacienteById(id: string): Promise<Paciente | null> {
  const { data, error } = await supabase
    .from(PACIENTES_TABLE)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // Record not found error code
      return null;
    }
    console.error('Error fetching patient:', error);
    throw error;
  }
  
  return data;
}

/**
 * Create a new patient
 */
export async function createPaciente(paciente: PacienteCreate): Promise<Paciente> {
  const { data, error } = await supabase
    .from(PACIENTES_TABLE)
    .insert(paciente)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
  
  return data;
}

/**
 * Update a patient
 */
export async function updatePaciente(id: string, paciente: PacienteUpdate): Promise<Paciente> {
  const { data, error } = await supabase
    .from(PACIENTES_TABLE)
    .update(paciente)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
  
  return data;
}

/**
 * Delete a patient
 */
export async function deletePaciente(id: string): Promise<void> {
  const { error } = await supabase
    .from(PACIENTES_TABLE)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
} 