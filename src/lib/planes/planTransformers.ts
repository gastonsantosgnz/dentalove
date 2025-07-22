import { 
  PlanTratamiento, 
  PlanZona,
  ZonaCondicion,
  ZonaTratamiento
} from '@/lib/database';

// Helper functions to transform raw data
export function transformPlanTratamiento(data: any): PlanTratamiento {
  return {
    id: String(data.id || ''),
    paciente_id: String(data.paciente_id || ''),
    fecha: String(data.fecha || ''),
    observaciones: data.observaciones ? String(data.observaciones) : null,
    costo_total: Number(data.costo_total || 0),
    created_at: data.created_at ? String(data.created_at) : undefined,
    updated_at: data.updated_at ? String(data.updated_at) : undefined
  };
}

export function transformPlanZona(data: any): PlanZona {
  return {
    id: String(data.id || ''),
    plan_id: String(data.plan_id || ''),
    version_id: data.version_id ? String(data.version_id) : undefined,
    zona: String(data.zona || ''),
    comentario: data.comentario ? String(data.comentario) : undefined,
    created_at: data.created_at ? String(data.created_at) : undefined
  };
}

export function transformZonaCondicion(data: any): ZonaCondicion {
  return {
    id: String(data.id || ''),
    zona_id: String(data.zona_id || ''),
    nombre_condicion: String(data.nombre_condicion || ''),
    color: String(data.color || ''),
    created_at: data.created_at ? String(data.created_at) : undefined
  };
}

export function transformZonaTratamiento(data: any): ZonaTratamiento {
  return {
    id: String(data.id || ''),
    zona_id: String(data.zona_id || ''),
    servicio_id: data.servicio_id ? String(data.servicio_id) : null,
    nombre_tratamiento: String(data.nombre_tratamiento || ''),
    color: String(data.color || ''),
    created_at: data.created_at ? String(data.created_at) : undefined
  };
} 