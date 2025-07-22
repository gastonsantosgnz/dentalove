import { supabase } from '@/lib/supabase';
import { ToothStatus } from '@/components/DentalChart';
import { PLAN_VERSIONES_TABLE, PLAN_ZONAS_TABLE, ZONA_TRATAMIENTOS_TABLE, ZONA_CONDICIONES_TABLE } from './planTypes';

/**
 * Get all versions for a treatment plan
 */
export async function getPlanVersiones(planId: string) {
  const { data, error } = await supabase
    .from(PLAN_VERSIONES_TABLE)
    .select('*')
    .eq('plan_id', planId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching plan versions:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Get active version for a treatment plan
 */
export async function getActivePlanVersion(planId: string) {
  const { data, error } = await supabase
    .from(PLAN_VERSIONES_TABLE)
    .select('*')
    .eq('plan_id', planId)
    .eq('activa', true)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // Record not found error code
      return null;
    }
    console.error('Error fetching active plan version:', error);
    throw error;
  }
  
  return data;
}

/**
 * Set a version as active
 */
export async function setActiveVersion(planId: string, versionId: string) {
  // Desactivar todas las versiones del plan
  await supabase
    .from(PLAN_VERSIONES_TABLE)
    .update({ activa: false })
    .eq('plan_id', planId);
  
  // Activar la versión especificada
  const { data, error } = await supabase
    .from(PLAN_VERSIONES_TABLE)
    .update({ activa: true })
    .eq('id', versionId)
    .eq('plan_id', planId)
    .select()
    .single();
  
  if (error) {
    console.error('Error setting active version:', error);
    throw error;
  }
  
  return data;
}

/**
 * Create a new version for an existing plan
 */
export async function createPlanVersion(
  planId: string,
  versionData: {
    nombre: string,
    toothStatus: Record<string, ToothStatus[]>,
    costo_total: number,
    activa?: boolean
  }
) {
  // Crear nueva versión
  const { data: version, error } = await supabase
    .from(PLAN_VERSIONES_TABLE)
    .insert({
      plan_id: planId,
      nombre: versionData.nombre,
      activa: versionData.activa || false,
      costo_total: versionData.costo_total
    })
    .select('id')
    .single();

  if (error) throw error;
  const versionId = version.id;

  // Crear zonas para esta versión
  for (const [zonaKey, statuses] of Object.entries(versionData.toothStatus)) {
    if (statuses.length === 0) continue;

    const { data: zona, error: zonaError } = await supabase
      .from(PLAN_ZONAS_TABLE)
      .insert({
        plan_id: planId,
        version_id: versionId,
        zona: zonaKey,
      })
      .select('id')
      .single();

    if (zonaError) throw zonaError;
    const zonaId = zona.id;

    // Insertar tratamientos y condiciones
    for (const status of statuses) {
      if (status.type === 'treatment') {
        await supabase.from(ZONA_TRATAMIENTOS_TABLE).insert({
          zona_id: zonaId,
          servicio_id: status.servicio_id,
          nombre_tratamiento: status.status,
          color: status.color,
        });
      } else if (status.type === 'condition') {
        await supabase.from(ZONA_CONDICIONES_TABLE).insert({
          zona_id: zonaId,
          nombre_condicion: status.status,
          color: status.color,
        });
      }
    }
  }

  return { version, versionId };
}

/**
 * Get details for a specific version of a plan
 */
export async function getPlanVersionDetail(versionId: string) {
  // Obtener la versión
  const { data: version, error: versionError } = await supabase
    .from(PLAN_VERSIONES_TABLE)
    .select('*')
    .eq('id', versionId)
    .single();

  if (versionError) throw versionError;

  // Obtener todas las zonas para esta versión
  const { data: zonas, error: zonasError } = await supabase
    .from(PLAN_ZONAS_TABLE)
    .select(`
      id,
      zona,
      comentario,
      zona_tratamientos (
        id,
        servicio_id,
        nombre_tratamiento,
        color
      ),
      zona_condiciones (
        id,
        nombre_condicion,
        color
      )
    `)
    .eq('version_id', versionId);

  if (zonasError) throw zonasError;

  // Convertir al formato toothStatus
  const toothStatus: Record<string, ToothStatus[]> = {};
  const toothComments: Record<string, string> = {};

  zonas?.forEach(zona => {
    // Guardar comentario si existe
    if (zona.comentario) {
      toothComments[String(zona.zona || '')] = String(zona.comentario);
    }
    
    // Verificar que zona_tratamientos existe y es un array
    const tratamientos = Array.isArray(zona.zona_tratamientos) ? zona.zona_tratamientos : [];
    const zonaTratamientos = tratamientos.map((t: any) => ({
      id: String(t.id || ''),
      status: String(t.nombre_tratamiento || ''),
      color: String(t.color || ''),
      type: 'treatment' as const,
      servicio_id: String(t.servicio_id || '')
    }));

    // Verificar que zona_condiciones existe y es un array
    const condiciones = Array.isArray(zona.zona_condiciones) ? zona.zona_condiciones : [];
    const zonaCondiciones = condiciones.map((c: any) => ({
      id: String(c.id || ''),
      status: String(c.nombre_condicion || ''),
      color: String(c.color || ''),
      type: 'condition' as const
    }));

    toothStatus[String(zona.zona || '')] = [...zonaTratamientos, ...zonaCondiciones];
  });

  return {
    version,
    toothStatus,
    toothComments
  };
} 