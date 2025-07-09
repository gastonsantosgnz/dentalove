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
  console.log('Creating servicio with data:', servicio);
  
  // Test connection first
  const connectionTest = await testSupabaseConnection();
  if (!connectionTest) {
    throw new Error('Cannot connect to Supabase database');
  }
  
  // Prepare data with only required fields
  const servicioData = {
    nombre_servicio: servicio.nombre_servicio,
    costo: servicio.costo,
    duracion: servicio.duracion,
    descripcion: servicio.descripcion || null,
    especialidad: servicio.especialidad || null,
    tipo_paciente: servicio.tipo_paciente || 'General',
    consultorio_id: servicio.consultorio_id
  };
  
  console.log('Inserting data:', servicioData);
  
  const { data, error } = await supabase
    .from(SERVICIOS_TABLE)
    .insert(servicioData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating service:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw new Error(`Error creating service: ${error.message}`);
  }
  
  console.log('Service created successfully:', data);
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

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from(SERVICIOS_TABLE)
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
} 