import { supabase } from '@/lib/supabase';
import { PlanTratamiento } from '@/lib/database';
import { ToothStatus } from '@/components/DentalChart';
import { getPlanTratamientoById } from './planesTratamientoService';
import { getActivePlanVersion } from './planVersionesService';
import { getPlanZonas, getZonaCondiciones, getZonaTratamientos } from './planZonasService';
import { PLAN_VERSIONES_TABLE, PLAN_ZONAS_TABLE } from './planTypes';

/**
 * Get a complete treatment plan with all its zones, conditions, and treatments
 */
export async function getCompletePlanTratamiento(planId: string, versionId?: string): Promise<{
  plan: PlanTratamiento | null;
  version?: any;
  toothStatus: Record<string, ToothStatus[]>;
  toothComments?: Record<string, string>;
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
  
  // Initialize toothStatus and toothComments
  const toothStatus: Record<string, ToothStatus[]> = {};
  const toothComments: Record<string, string> = {};
  
  // Process each zone
  for (const zona of zonas) {
    // Guardar comentario si existe
    if (zona.comentario) {
      toothComments[zona.zona] = zona.comentario;
    }
    
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
        servicio_id: tratamiento.servicio_id || undefined
      });
    });
  }
  
  return { plan, version, toothStatus, toothComments };
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
    toothComments?: Record<string, string>;
    consultorio_id?: string;
  },
  toothStatus: Record<string, ToothStatus[]>,
  versiones?: Array<{
    id: string;
    nombre: string;
    toothStatus: Record<string, ToothStatus[]>;
    totalCost: number;
    isActive: boolean;
    editableCosts?: Record<string, number>;
  }>,
  existingPlanId?: string // ID del plan existente para actualizarlo
) {
  try {
    let planId: string;
    let plan: any;

    // Objeto para almacenar los estados de progreso de servicios existentes
    let serviciosProgresoExistentes: Record<string, any> = {};

    // Get consultorio_id from the context if not provided
    if (!planData.consultorio_id) {
      try {
        // Intentar obtener del localStorage
        if (typeof window !== 'undefined') {
          const cachedData = localStorage.getItem('userConsultorio');
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            if (parsedData.consultorio && parsedData.consultorio.id) {
              planData.consultorio_id = parsedData.consultorio.id;
            }
          }
        }
      } catch (error) {
        console.error('Error getting consultorio_id from cache:', error);
      }
    }

    // Determinar si estamos creando un nuevo plan o actualizando uno existente
    if (existingPlanId) {
      // Actualizar plan existente
      const { data: updatedPlan, error } = await supabase
        .from('planes_tratamiento')
        .update({
          paciente_id: planData.paciente_id,
          fecha: planData.fecha,
          observaciones: planData.observaciones,
          costo_total: planData.costo_total,
          consultorio_id: planData.consultorio_id,
        })
        .eq('id', existingPlanId)
        .select('id')
        .single();

      if (error) throw error;
      
      plan = updatedPlan;
      planId = existingPlanId;
      
      // Antes de eliminar las zonas, obtenemos los servicios_progreso existentes
      // para preservar su estado después de actualizar el plan
      try {
        // 1. Obtener todas las zonas del plan
        const { data: zonas, error: zonasError } = await supabase
          .from('plan_zonas')
          .select('id')
          .eq('plan_id', planId);
        
        if (zonasError) throw zonasError;
        
        // 2. Para cada zona, obtener sus tratamientos
        if (zonas && zonas.length > 0) {
          for (const zona of zonas) {
            const { data: tratamientos, error: tratamientosError } = await supabase
              .from('zona_tratamientos')
              .select('id, nombre_tratamiento, servicio_id')
              .eq('zona_id', String(zona.id || ''));
          
            if (tratamientosError) throw tratamientosError;
          
            // 3. Para cada tratamiento, buscar si tiene servicios_progreso
            if (tratamientos && tratamientos.length > 0) {
              for (const tratamiento of tratamientos) {
                const { data: progreso, error: progresoError } = await supabase
                  .from('servicios_progreso')
                  .select('*')
                  .eq('zona_tratamiento_id', String(tratamiento.id || ''));
            
                if (progresoError) throw progresoError;
            
                // 4. Guardar el servicio_progreso si existe y no está pendiente
                if (progreso && progreso.length > 0) {
                  // Solo guardamos los que no están en estado pendiente
                  const servicioNoDefault = progreso.find(p => p.estado !== 'pendiente');
                  if (servicioNoDefault) {
                    // Creamos una clave compuesta por tratamiento_nombre + servicio_id
                    // para poder identificar el mismo tratamiento después
                    const clave = `${String(tratamiento.nombre_tratamiento || '')}_${String(tratamiento.servicio_id || 'null')}`;
                    serviciosProgresoExistentes[clave] = servicioNoDefault;
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener servicios de progreso existentes:", error);
        // Continuamos con la operación aunque haya fallado esta parte
      }
      
      // Eliminar zonas existentes para este plan
      // Debido a las restricciones de CASCADE, esto eliminará también los tratamientos y condiciones
      await supabase
        .from('plan_zonas')
        .delete()
        .eq('plan_id', planId);
        
      // Eliminar versiones existentes
      await supabase
        .from('plan_versiones')
        .delete()
        .eq('plan_id', planId);
    } else {
      // Crear nuevo plan
      const { data: newPlan, error } = await supabase
        .from('planes_tratamiento')
        .insert({
          paciente_id: planData.paciente_id,
          fecha: planData.fecha,
          observaciones: planData.observaciones,
          costo_total: planData.costo_total,
          consultorio_id: planData.consultorio_id,
        })
        .select('id')
        .single();

      if (error) throw error;
      
      plan = newPlan;
      planId = String(newPlan.id || '');
    }

    // Mapa para almacenar los tratamientos nuevos por nombre y servicio_id
    const mapaTratamientosNuevos: Record<string, string> = {};

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
            costo_total: version.totalCost,
            consultorio_id: planData.consultorio_id,
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
              comentario: planData.toothComments?.[zonaKey] || null,
            })
            .select('id')
            .single();

          if (zonaError) throw zonaError;

          const zonaId = zona.id;

          // Insertar tratamientos y condiciones de esta zona
          for (const status of statuses) {
            if (status.type === 'treatment') {
              // Insertar tratamiento
              const { data: tratamiento, error: tratamientoError } = await supabase
                .from('zona_tratamientos')
                .insert({
                  zona_id: zonaId,
                  servicio_id: status.servicio_id,
                  nombre_tratamiento: status.status,
                  color: status.color,
                })
                .select('id')
                .single();

              if (tratamientoError) throw tratamientoError;
              
              // Si es la versión activa y estamos editando un plan existente,
              // creamos un mapa para relacionar los tratamientos antiguos con los nuevos
              if (version.isActive && existingPlanId) {
                const clave = `${status.status}_${status.servicio_id || 'null'}`;
                mapaTratamientosNuevos[clave] = String(tratamiento.id || '');
              }
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
      
      // Restaurar los estados de servicios progreso para los tratamientos de la versión activa
      if (existingPlanId && Object.keys(serviciosProgresoExistentes).length > 0) {
        try {
          // Buscar la versión activa recién creada
          const { data: activeVersion, error: versionError } = await supabase
            .from('plan_versiones')
            .select('id')
            .eq('plan_id', planId)
            .eq('activa', true)
            .single();
            
          if (versionError) throw versionError;
          
          // Para cada servicio progreso existente, crear uno nuevo asociado al nuevo tratamiento
          for (const [clave, servicio] of Object.entries(serviciosProgresoExistentes)) {
            // Si encontramos el nuevo tratamiento correspondiente
            if (mapaTratamientosNuevos[clave]) {
              // Crear nuevo servicio progreso con el mismo estado, fecha, monto, etc.
              await supabase
                .from('servicios_progreso')
                .insert({
                  paciente_id: planData.paciente_id,
                  plan_id: planId,
                  version_id: activeVersion.id,
                  zona_tratamiento_id: mapaTratamientosNuevos[clave],
                  estado: servicio.estado,
                  fecha_realizacion: servicio.fecha_realizacion,
                  monto_pagado: servicio.monto_pagado,
                  fecha_pago: servicio.fecha_pago,
                  notas: servicio.notas
                });
            }
          }
        } catch (error) {
          console.error("Error al restaurar estados de servicios:", error);
          // Continuamos con la operación aunque falle esta parte
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
          costo_total: planData.costo_total,
          consultorio_id: planData.consultorio_id,
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
            comentario: planData.toothComments?.[zonaKey] || null,
          })
          .select('id')
          .single();

        if (zonaError) throw zonaError;

        const zonaId = zona.id;

        // Insertar tratamientos y condiciones de esta zona
        for (const status of statuses) {
          if (status.type === 'treatment') {
            // Insertar tratamiento
            const { data: tratamiento, error: tratamientoError } = await supabase
              .from('zona_tratamientos')
              .insert({
                zona_id: zonaId,
                servicio_id: status.servicio_id,
                nombre_tratamiento: status.status,
                color: status.color,
              })
              .select('id')
              .single();

            if (tratamientoError) throw tratamientoError;
            
            // Si estamos editando un plan existente, registramos el nuevo tratamiento
            if (existingPlanId) {
              const clave = `${status.status}_${status.servicio_id || 'null'}`;
              mapaTratamientosNuevos[clave] = String(tratamiento.id || '');
            }
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
      
      // Restaurar los estados de servicios progreso si es que existen
      if (existingPlanId && Object.keys(serviciosProgresoExistentes).length > 0) {
        try {
          // Para cada servicio progreso existente, crear uno nuevo asociado al nuevo tratamiento
          for (const [clave, servicio] of Object.entries(serviciosProgresoExistentes)) {
            // Si encontramos el nuevo tratamiento correspondiente
            if (mapaTratamientosNuevos[clave]) {
              // Crear nuevo servicio progreso con el mismo estado, fecha, monto, etc.
              await supabase
                .from('servicios_progreso')
                .insert({
                  paciente_id: planData.paciente_id,
                  plan_id: planId,
                  version_id: versionId,
                  zona_tratamiento_id: mapaTratamientosNuevos[clave],
                  estado: servicio.estado,
                  fecha_realizacion: servicio.fecha_realizacion,
                  monto_pagado: servicio.monto_pagado,
                  fecha_pago: servicio.fecha_pago,
                  notas: servicio.notas
                });
            }
          }
        } catch (error) {
          console.error("Error al restaurar estados de servicios:", error);
          // Continuamos con la operación aunque falle esta parte
        }
      }
    }

    return { plan, planId };
  } catch (error) {
    console.error('Error in saveCompletePlanTratamiento:', error);
    throw error;
  }
}

/**
 * Get details for a treatment plan
 */
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
      .eq('plan_id', planId)
      .eq('version_id', String(activeVersion.id || ''));
    
    if (zonasError) throw zonasError;
    zonas = data;
  } else {
    // Obtener todas las zonas si no hay versión activa (compatibilidad con planes antiguos)
    const { data, error: zonasError } = await supabase
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
      .eq('plan_id', planId);
    
    if (zonasError) throw zonasError;
    zonas = data;
  }

  // 4. Reestructurar los datos para que coincidan con el formato toothStatus
  const toothStatus: Record<string, ToothStatus[]> = {};
  const toothComments: Record<string, string> = {};

  zonas?.forEach(zona => {
    // Almacenar comentarios si existen
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
    plan,
    version: activeVersion,
    toothStatus,
    toothComments
  };
}

/**
 * Calculate treatment plan statistics
 */
export function calculatePlanStatistics(toothStatus: Record<string, ToothStatus[]>) {
  let totalTreatments = 0;
  let totalTeeth = 0;
  const generalAreas = ['boca-completa', 'arco-superior', 'arco-inferior', 'supernumerario'];
  
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