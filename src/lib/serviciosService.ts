import { supabase } from '@/lib/supabase';
import { Servicio, ServicioCreate, ServicioUpdate } from '@/lib/database';

// Table name constant
const SERVICIOS_TABLE = 'servicios';

/**
 * Get all services from Supabase
 */
export async function getServicios(): Promise<Servicio[]> {
  const { data, error } = await supabase
    .from(SERVICIOS_TABLE)
    .select('*')
    .order('nombre_servicio', { ascending: true });
  
  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Get a service by ID
 */
export async function getServicioById(id: string): Promise<Servicio | null> {
  const { data, error } = await supabase
    .from(SERVICIOS_TABLE)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // Record not found error code
      return null;
    }
    console.error('Error fetching service:', error);
    throw error;
  }
  
  return data;
}

/**
 * Create a new service
 */
export async function createServicio(servicio: ServicioCreate): Promise<Servicio> {
  const { data, error } = await supabase
    .from(SERVICIOS_TABLE)
    .insert(servicio)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }
  
  return data;
}

/**
 * Update a service
 */
export async function updateServicio(id: string, servicio: ServicioUpdate): Promise<Servicio> {
  const { data, error } = await supabase
    .from(SERVICIOS_TABLE)
    .update(servicio)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating service:', error);
    throw error;
  }
  
  return data;
}

/**
 * Delete a service
 */
export async function deleteServicio(id: string): Promise<void> {
  const { error } = await supabase
    .from(SERVICIOS_TABLE)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
} 