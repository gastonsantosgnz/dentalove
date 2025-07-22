import { supabase } from '@/lib/supabase';

export interface ServicioProgreso {
  id: string;
  paciente_id: string;
  plan_id: string;
  version_id: string;
  zona_tratamiento_id: string;
  estado: 'pendiente' | 'completado' | 'cancelado';
  fecha_realizacion?: string;
  monto_pagado: number;
  fecha_pago?: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServicioProgresoCreate {
  paciente_id: string;
  plan_id: string;
  version_id: string;
  zona_tratamiento_id: string;
  estado?: 'pendiente' | 'completado' | 'cancelado';
  fecha_realizacion?: string;
  monto_pagado?: number;
  fecha_pago?: string;
  notas?: string;
}

export interface ServicioProgresoUpdate {
  estado?: 'pendiente' | 'completado' | 'cancelado';
  fecha_realizacion?: string;
  monto_pagado?: number;
  fecha_pago?: string;
  notas?: string;
}

// Vista detallada del servicio con información relacionada
export interface ServicioProgresoDetalle {
  id: string;
  paciente: string;
  paciente_id: string;
  fecha_plan: string;
  version_plan: string;
  nombre_tratamiento: string;
  color: string;
  estado: 'pendiente' | 'completado' | 'cancelado';
  fecha_realizacion?: string;
  monto_pagado: number;
  fecha_pago?: string;
  costo_total: number;
  notas?: string;
}

// Constantes
const SERVICIOS_PROGRESO_TABLE = 'servicios_progreso';
const VW_SERVICIOS_PENDIENTES = 'vw_servicios_pendientes';
const VW_SERVICIOS_COMPLETADOS = 'vw_servicios_completados';

/**
 * Obtener todos los servicios en progreso para un paciente
 */
export async function getServiciosProgresoPaciente(pacienteId: string): Promise<ServicioProgreso[]> {
  const { data, error } = await supabase
    .from(SERVICIOS_PROGRESO_TABLE)
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching servicios progreso:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Obtener todos los servicios en progreso para un plan específico
 */
export async function getServiciosProgresoPlan(planId: string): Promise<ServicioProgreso[]> {
  const { data, error } = await supabase
    .from(SERVICIOS_PROGRESO_TABLE)
    .select('*')
    .eq('plan_id', planId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching servicios progreso del plan:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Obtener todos los servicios en progreso para una versión específica del plan
 */
export async function getServiciosProgresoVersion(versionId: string): Promise<ServicioProgreso[]> {
  const { data, error } = await supabase
    .from(SERVICIOS_PROGRESO_TABLE)
    .select('*')
    .eq('version_id', versionId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching servicios progreso de la versión:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Obtener detalles de servicios pendientes usando la vista
 */
export async function getServiciosPendientesPaciente(pacienteId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from(VW_SERVICIOS_PENDIENTES)
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('fecha_plan', { ascending: false });
  
  if (error) {
    console.error('Error fetching servicios pendientes:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Obtener detalles de servicios completados usando la vista
 */
export async function getServiciosCompletadosPaciente(pacienteId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from(VW_SERVICIOS_COMPLETADOS)
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('fecha_realizacion', { ascending: false });
  
  if (error) {
    console.error('Error fetching servicios completados:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Crear un nuevo registro de progreso de servicio
 */
export async function createServicioProgreso(servicio: ServicioProgresoCreate): Promise<ServicioProgreso> {
  const { data, error } = await supabase
    .from(SERVICIOS_PROGRESO_TABLE)
    .insert(servicio)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating servicio progreso:', error);
    throw error;
  }
  
  return data;
}

/**
 * Actualizar un registro de progreso de servicio existente
 */
export async function updateServicioProgreso(id: string, servicio: ServicioProgresoUpdate): Promise<ServicioProgreso> {
  const { data, error } = await supabase
    .from(SERVICIOS_PROGRESO_TABLE)
    .update(servicio)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating servicio progreso:', error);
    throw error;
  }
  
  return data;
}

/**
 * Marcar un servicio como completado
 */
export async function marcarServicioCompletado(id: string, fecha: string, monto: number, notas?: string): Promise<ServicioProgreso> {
  const { data, error } = await supabase
    .from(SERVICIOS_PROGRESO_TABLE)
    .update({
      estado: 'completado',
      fecha_realizacion: fecha,
      monto_pagado: monto,
      fecha_pago: fecha, // Por defecto, asumimos que se paga en la misma fecha
      notas
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error marking servicio as completed:', error);
    throw error;
  }
  
  return data;
}

/**
 * Marcar un servicio como cancelado
 */
export async function marcarServicioCancelado(id: string, notas?: string): Promise<ServicioProgreso> {
  const { data, error } = await supabase
    .from(SERVICIOS_PROGRESO_TABLE)
    .update({
      estado: 'cancelado',
      notas
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error marking servicio as canceled:', error);
    throw error;
  }
  
  return data;
}

/**
 * Registrar pago para un servicio
 */
export async function registrarPagoServicio(id: string, monto: number, fecha: string): Promise<ServicioProgreso> {
  const { data, error } = await supabase
    .from(SERVICIOS_PROGRESO_TABLE)
    .update({
      monto_pagado: monto,
      fecha_pago: fecha
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error registering payment:', error);
    throw error;
  }
  
  return data;
}

/**
 * Obtener resumen de progreso para un plan
 */
export async function getResumenProgresoPlan(planId: string): Promise<{ 
  total: number; 
  completados: number; 
  pendientes: number; 
  cancelados: number;
  totalMontoPagado: number;
}> {
  const { data, error } = await supabase
    .from(SERVICIOS_PROGRESO_TABLE)
    .select('estado, monto_pagado')
    .eq('plan_id', planId);
  
  if (error) {
    console.error('Error fetching plan progress summary:', error);
    throw error;
  }
  
  const servicios = data || [];
  const total = servicios.length;
  const completados = servicios.filter(s => s.estado === 'completado').length;
  const pendientes = servicios.filter(s => s.estado === 'pendiente').length;
  const cancelados = servicios.filter(s => s.estado === 'cancelado').length;
  const totalMontoPagado = servicios.reduce((sum, s) => sum + (parseFloat(String(s.monto_pagado || 0)) || 0), 0);
  
  return {
    total,
    completados,
    pendientes,
    cancelados,
    totalMontoPagado
  };
} 