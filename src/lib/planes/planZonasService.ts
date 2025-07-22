import { supabase } from '@/lib/supabase';
import { 
  PlanZona,
  PlanZonaCreate,
  ZonaCondicion,
  ZonaCondicionCreate,
  ZonaTratamiento,
  ZonaTratamientoCreate
} from '@/lib/database';
import { 
  transformPlanZona, 
  transformZonaCondicion, 
  transformZonaTratamiento 
} from './planTransformers';
import { 
  PLAN_ZONAS_TABLE, 
  ZONA_CONDICIONES_TABLE, 
  ZONA_TRATAMIENTOS_TABLE 
} from './planTypes';

// ----- Plan Zonas -----

/**
 * Get all zones for a treatment plan
 */
export async function getPlanZonas(planId: string, versionId?: string): Promise<PlanZona[]> {
  let query = supabase
    .from(PLAN_ZONAS_TABLE)
    .select('*')
    .eq('plan_id', planId);
  
  if (versionId) {
    query = query.eq('version_id', versionId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching plan zones:', error);
    throw error;
  }
  
  return (data || []).map(transformPlanZona);
}

/**
 * Create a new zone for a treatment plan
 */
export async function createPlanZona(zona: PlanZonaCreate): Promise<PlanZona> {
  const { data, error } = await supabase
    .from(PLAN_ZONAS_TABLE)
    .insert(zona)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating plan zone:', error);
    throw error;
  }
  
  return transformPlanZona(data);
}

// ----- Zona Condiciones -----

/**
 * Get all conditions for a zone
 */
export async function getZonaCondiciones(zonaId: string): Promise<ZonaCondicion[]> {
  const { data, error } = await supabase
    .from(ZONA_CONDICIONES_TABLE)
    .select('*')
    .eq('zona_id', zonaId);
  
  if (error) {
    console.error('Error fetching zone conditions:', error);
    throw error;
  }
  
  return (data || []).map(transformZonaCondicion);
}

/**
 * Create a new condition for a zone
 */
export async function createZonaCondicion(condicion: ZonaCondicionCreate): Promise<ZonaCondicion> {
  const { data, error } = await supabase
    .from(ZONA_CONDICIONES_TABLE)
    .insert(condicion)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating zone condition:', error);
    throw error;
  }
  
  return transformZonaCondicion(data);
}

// ----- Zona Tratamientos -----

/**
 * Get all treatments for a zone
 */
export async function getZonaTratamientos(zonaId: string): Promise<ZonaTratamiento[]> {
  const { data, error } = await supabase
    .from(ZONA_TRATAMIENTOS_TABLE)
    .select('*')
    .eq('zona_id', zonaId);
  
  if (error) {
    console.error('Error fetching zone treatments:', error);
    throw error;
  }
  
  return (data || []).map(transformZonaTratamiento);
}

/**
 * Create a new treatment for a zone
 */
export async function createZonaTratamiento(tratamiento: ZonaTratamientoCreate): Promise<ZonaTratamiento> {
  const { data, error } = await supabase
    .from(ZONA_TRATAMIENTOS_TABLE)
    .insert(tratamiento)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating zone treatment:', error);
    throw error;
  }
  
  return transformZonaTratamiento(data);
} 