import { supabase } from '@/lib/supabase';
import { 
  PlanTratamiento, 
  PlanTratamientoCreate,
  PlanTratamientoUpdate,
  PlanZona,
  PlanZonaCreate,
  ZonaCondicion,
  ZonaCondicionCreate,
  ZonaTratamiento,
  ZonaTratamientoCreate
} from '@/lib/database';
import { ToothStatus } from '@/components/DentalChart';
import { v4 as uuidv4 } from 'uuid';

// Table name constants
const PLANES_TRATAMIENTO_TABLE = 'planes_tratamiento';
const PLAN_ZONAS_TABLE = 'plan_zonas';
const ZONA_CONDICIONES_TABLE = 'zona_condiciones';
const ZONA_TRATAMIENTOS_TABLE = 'zona_tratamientos';
const PLAN_VERSIONES_TABLE = 'plan_versiones';

// ----- Planes de Tratamiento -----

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
  
  return data || [];
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
  
  return data || [];
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
  
  return data;
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
  
  return data;
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
  
  return data;
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

// ----- Plan Versiones -----

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
  
  return data || [];
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
  
  return data;
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
  
  return data || [];
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
  
  return data;
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
  
  return data || [];
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
  
  return data;
}

// ----- Utilities for Converting Between Formats -----

/**
 * Get a complete treatment plan with all its zones, conditions, and treatments
 */
export async function getCompletePlanTratamiento(planId: string, versionId?: string): Promise<{
  plan: PlanTratamiento | null;
  version?: any;
  toothStatus: Record<string, ToothStatus[]>;
}> {
  // Get the treatment plan
  const plan = await getPlanTratamientoById(planId);
  if (!plan) {
    return { plan: null, toothStatus: {} };
  }
  
  // Get the version if specified, otherwise get the active version
  let version;
  if (versionId) {
    const { data, error } = await supabase
      .from(PLAN_VERSIONES_TABLE)
      .select('*')
      .eq('id', versionId)
      .single();
    
    if (error) {
      console.error('Error fetching version:', error);
    } else {
      version = data;
    }
  } else {
    version = await getActivePlanVersion(planId);
  }
  
  // Get zones for this plan and version
  let zonas;
  if (version) {
    zonas = await getPlanZonas(planId, version.id);
  } else {
    zonas = await getPlanZonas(planId);
  }
  
  // Initialize toothStatus
  const toothStatus: Record<string, ToothStatus[]> = {};
  
  // Process each zone
  for (const zona of zonas) {
    // Get conditions for this zone
    const condiciones = await getZonaCondiciones(zona.id);
    
    // Get treatments for this zone
    const tratamientos = await getZonaTratamientos(zona.id);
    
    // Initialize the array for this zone/tooth if needed
    if (!toothStatus[zona.zona]) {
      toothStatus[zona.zona] = [];
    }
    
    // Add conditions
    condiciones.forEach(condicion => {
      toothStatus[zona.zona].push({
        id: condicion.id,
        status: condicion.nombre_condicion,
        color: condicion.color,
        type: 'condition'
      });
    });
    
    // Add treatments
    tratamientos.forEach(tratamiento => {
      toothStatus[zona.zona].push({
        id: tratamiento.id,
        status: tratamiento.nombre_tratamiento,
        color: tratamiento.color,
        type: 'treatment',
        servicio_id: tratamiento.servicio_id
      });
    });
  }
  
  return { plan, version, toothStatus };
}

/**
 * Save a complete treatment plan with all its zones, conditions, and treatments
 */
export async function saveCompletePlanTratamiento(
  planData: {
    paciente_id: string;
    fecha: string;
    observaciones: string;
    costo_total: number;
  },
  toothStatus: Record<string, ToothStatus[]>,
  versiones?: Array<{
    id: string;
    nombre: string;
    toothStatus: Record<string, ToothStatus[]>;
    totalCost: number;
    isActive: boolean;
  }>
) {
  // 1. Insertar el plan de tratamiento principal
  const { data: plan, error } = await supabase
    .from('planes_tratamiento')
    .insert({
      paciente_id: planData.paciente_id,
      fecha: planData.fecha,
      observaciones: planData.observaciones,
      costo_total: planData.costo_total,
    })
    .select('id')
    .single();

  if (error) throw error;

  const planId = plan.id;

  // 2. Si hay versiones, guardarlas
  if (versiones && versiones.length > 0) {
    // Encontrar la versión activa
    const activeVersion = versiones.find(v => v.isActive);
    
    // Primero guardar cada versión
    for (const version of versiones) {
      // Crear la versión
      const { data: versionData, error: versionError } = await supabase
        .from('plan_versiones')
        .insert({
          plan_id: planId,
          nombre: version.nombre,
          activa: version.isActive,
          costo_total: version.totalCost
        })
        .select('id')
        .single();

      if (versionError) throw versionError;
      
      const versionId = versionData.id;
      
      // Guardar zonas, condiciones y tratamientos para esta versión
      for (const [zonaKey, statuses] of Object.entries(version.toothStatus)) {
        if (statuses.length === 0) continue;

        // Insertar la zona con referencia a la versión
        const { data: zona, error: zonaError } = await supabase
          .from('plan_zonas')
          .insert({
            plan_id: planId,
            version_id: versionId,
            zona: zonaKey,
          })
          .select('id')
          .single();

        if (zonaError) throw zonaError;

        const zonaId = zona.id;

        // Insertar tratamientos y condiciones de esta zona
        for (const status of statuses) {
          if (status.type === 'treatment') {
            // Insertar tratamiento
            await supabase.from('zona_tratamientos').insert({
              zona_id: zonaId,
              servicio_id: status.servicio_id,
              nombre_tratamiento: status.status,
              color: status.color,
            });
          } else if (status.type === 'condition') {
            // Insertar condición
            await supabase.from('zona_condiciones').insert({
              zona_id: zonaId,
              nombre_condicion: status.status,
              color: status.color,
            });
          }
        }
      }
    }
  } else {
    // Si no hay versiones, crear una versión predeterminada
    const { data: version, error: versionError } = await supabase
      .from('plan_versiones')
      .insert({
        plan_id: planId,
        nombre: 'Versión 1',
        activa: true,
        costo_total: planData.costo_total
      })
      .select('id')
      .single();

    if (versionError) throw versionError;

    const versionId = version.id;

    // 3. Para cada diente/zona, crear un registro en plan_zonas
    for (const [zonaKey, statuses] of Object.entries(toothStatus)) {
      if (statuses.length === 0) continue;

      // Insertar la zona con referencia a la versión
      const { data: zona, error: zonaError } = await supabase
        .from('plan_zonas')
        .insert({
          plan_id: planId,
          version_id: versionId,
          zona: zonaKey,
        })
        .select('id')
        .single();

      if (zonaError) throw zonaError;

      const zonaId = zona.id;

      // Insertar tratamientos y condiciones de esta zona
      for (const status of statuses) {
        if (status.type === 'treatment') {
          // Insertar tratamiento
          await supabase.from('zona_tratamientos').insert({
            zona_id: zonaId,
            servicio_id: status.servicio_id,
            nombre_tratamiento: status.status,
            color: status.color,
          });
        } else if (status.type === 'condition') {
          // Insertar condición
          await supabase.from('zona_condiciones').insert({
            zona_id: zonaId,
            nombre_condicion: status.status,
            color: status.color,
          });
        }
      }
    }
  }

  return { plan, planId };
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
    .from('plan_versiones')
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
      .from('plan_zonas')
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
        await supabase.from('zona_tratamientos').insert({
          zona_id: zonaId,
          servicio_id: status.servicio_id,
          nombre_tratamiento: status.status,
          color: status.color,
        });
      } else if (status.type === 'condition') {
        await supabase.from('zona_condiciones').insert({
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
    .from('plan_versiones')
    .select('*')
    .eq('id', versionId)
    .single();

  if (versionError) throw versionError;

  // Obtener todas las zonas para esta versión
  const { data: zonas, error: zonasError } = await supabase
    .from('plan_zonas')
    .select(`
      id,
      zona,
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

  zonas?.forEach(zona => {
    const zonaTratamientos = zona.zona_tratamientos.map((t: any) => ({
      id: t.id,
      status: t.nombre_tratamiento,
      color: t.color,
      type: 'treatment' as const,
      servicio_id: t.servicio_id
    }));

    const zonaCondiciones = zona.zona_condiciones.map((c: any) => ({
      id: c.id,
      status: c.nombre_condicion,
      color: c.color,
      type: 'condition' as const
    }));

    toothStatus[zona.zona] = [...zonaTratamientos, ...zonaCondiciones];
  });

  return {
    version,
    toothStatus
  };
}

// Obtener todos los planes de tratamiento de un paciente
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

// Obtener un plan de tratamiento específico con todos sus detalles
export async function getPlanDetail(planId: string) {
  // 1. Obtener el plan principal
  const { data: plan, error: planError } = await supabase
    .from('planes_tratamiento')
    .select('*')
    .eq('id', planId)
    .single();

  if (planError) throw planError;

  // 2. Obtener la versión activa
  const activeVersion = await getActivePlanVersion(planId);
  
  let zonas;
  
  // 3. Si hay una versión activa, obtener zonas de esa versión
  if (activeVersion) {
    const { data, error: zonasError } = await supabase
      .from('plan_zonas')
      .select(`
        id,
        zona,
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
      .eq('plan_id', planId)
      .eq('version_id', activeVersion.id);
    
    if (zonasError) throw zonasError;
    zonas = data;
  } else {
    // Obtener todas las zonas si no hay versión activa (compatibilidad con planes antiguos)
    const { data, error: zonasError } = await supabase
      .from('plan_zonas')
      .select(`
        id,
        zona,
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
      .eq('plan_id', planId);
    
    if (zonasError) throw zonasError;
    zonas = data;
  }

  // 4. Reestructurar los datos para que coincidan con el formato toothStatus
  const toothStatus: Record<string, ToothStatus[]> = {};

  zonas?.forEach(zona => {
    const zonaTratamientos = zona.zona_tratamientos.map((t: any) => ({
      id: t.id,
      status: t.nombre_tratamiento,
      color: t.color,
      type: 'treatment' as const,
      servicio_id: t.servicio_id
    }));

    const zonaCondiciones = zona.zona_condiciones.map((c: any) => ({
      id: c.id,
      status: c.nombre_condicion,
      color: c.color,
      type: 'condition' as const
    }));

    toothStatus[zona.zona] = [...zonaTratamientos, ...zonaCondiciones];
  });

  return {
    plan,
    version: activeVersion,
    toothStatus
  };
}

// Calcular estadísticas del plan de tratamiento
export function calculatePlanStatistics(toothStatus: Record<string, ToothStatus[]>) {
  let totalTreatments = 0;
  let totalTeeth = 0;
  const generalAreas = ['boca-completa', 'arco-superior', 'arco-inferior'];
  
  // Contar tratamientos y dientes tratados
  Object.entries(toothStatus).forEach(([zone, statuses]) => {
    // Si es un tratamiento para un área general no lo contamos como diente individual
    if (!generalAreas.includes(zone)) {
      const hasTreatments = statuses.some(s => s.type === 'treatment');
      if (hasTreatments) {
        totalTeeth++;
      }
    }
    
    // Contar todos los tratamientos independientemente de dónde se apliquen
    const treatments = statuses.filter(s => s.type === 'treatment');
    totalTreatments += treatments.length;
  });
  
  return {
    totalTreatments,
    totalTeeth
  };
} 