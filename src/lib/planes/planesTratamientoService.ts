import { supabase } from '@/lib/supabase';
import { 
  PlanTratamiento, 
  PlanTratamientoCreate,
  PlanTratamientoUpdate
} from '@/lib/database';
import { transformPlanTratamiento } from './planTransformers';
import { PLANES_TRATAMIENTO_TABLE } from './planTypes';

/**
 * Get all treatment plans from Supabase
 */
export async function getPlanesTratamiento(): Promise<PlanTratamiento[]> {
  const { data, error } = await supabase
    .from(PLANES_TRATAMIENTO_TABLE)
    .select('*')
    .order('fecha', { ascending: false });
  
  if (error) {
    console.error('Error fetching treatment plans:', error);
    throw error;
  }
  
  return (data || []).map(transformPlanTratamiento);
}

/**
 * Get all treatment plans for a specific patient
 */
export async function getPlanesTratamientoPaciente(pacienteId: string): Promise<PlanTratamiento[]> {
  const { data, error } = await supabase
    .from(PLANES_TRATAMIENTO_TABLE)
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('fecha', { ascending: false });
  
  if (error) {
    console.error('Error fetching patient treatment plans:', error);
    throw error;
  }
  
  return (data || []).map(transformPlanTratamiento);
}

/**
 * Get a treatment plan by ID
 */
export async function getPlanTratamientoById(id: string): Promise<PlanTratamiento | null> {
  const { data, error } = await supabase
    .from(PLANES_TRATAMIENTO_TABLE)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // Record not found error code
      return null;
    }
    console.error('Error fetching treatment plan:', error);
    throw error;
  }
  
  return data ? transformPlanTratamiento(data) : null;
}

/**
 * Create a new treatment plan
 */
export async function createPlanTratamiento(plan: PlanTratamientoCreate): Promise<PlanTratamiento> {
  const { data, error } = await supabase
    .from(PLANES_TRATAMIENTO_TABLE)
    .insert(plan)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating treatment plan:', error);
    throw error;
  }
  
  return transformPlanTratamiento(data);
}

/**
 * Update a treatment plan
 */
export async function updatePlanTratamiento(id: string, plan: PlanTratamientoUpdate): Promise<PlanTratamiento> {
  const { data, error } = await supabase
    .from(PLANES_TRATAMIENTO_TABLE)
    .update(plan)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating treatment plan:', error);
    throw error;
  }
  
  return transformPlanTratamiento(data);
}

/**
 * Delete a treatment plan and all its related records
 */
export async function deletePlanTratamiento(id: string): Promise<void> {
  // Due to cascade delete in the database, this will delete all related records
  const { error } = await supabase
    .from(PLANES_TRATAMIENTO_TABLE)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting treatment plan:', error);
    throw error;
  }
}

/**
 * Get all treatment plans for a specific patient - alias for compatibility
 */
export async function getPatientTreatmentPlans(patientId: string) {
  const { data: planes, error } = await supabase
    .from('planes_tratamiento')
    .select('*')
    .eq('paciente_id', patientId)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching treatment plans:', error);
    return [];
  }

  return planes || [];
} 