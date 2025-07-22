import { supabase } from '@/lib/supabase';

// Interfaces
export interface CategoriaIngreso {
  id: string;
  nombre: string;
  descripcion?: string;
  consultorio_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Ingreso {
  id: string;
  consultorio_id: string;
  paciente_id?: string;
  doctor_id?: string;
  categoria_id?: string;
  plan_tratamiento_id?: string;
  servicio_progreso_id?: string;
  appointment_id?: string;
  concepto: string;
  descripcion?: string;
  monto_total: number;
  porcentaje_comision: number;
  monto_comision?: number;
  fecha_servicio: string;
  estado: 'pendiente' | 'pagado_parcial' | 'pagado_total' | 'cancelado';
  notas?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface IngresoDetalle extends Ingreso {
  paciente_nombre?: string;
  doctor_nombre?: string;
  categoria?: string;
  total_pagado: number;
  saldo_pendiente: number;
}

export interface Pago {
  id: string;
  ingreso_id: string;
  monto: number;
  metodo_pago: 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'cheque' | 'otro';
  referencia?: string;
  fecha_pago: string;
  estado: 'pendiente' | 'completado' | 'rechazado' | 'cancelado';
  notas?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface IngresoCreate {
  consultorio_id: string;
  paciente_id?: string;
  doctor_id?: string;
  categoria_id?: string;
  plan_tratamiento_id?: string;
  servicio_progreso_id?: string;
  appointment_id?: string;
  concepto: string;
  descripcion?: string;
  monto_total: number;
  porcentaje_comision?: number;
  fecha_servicio: string;
  notas?: string;
}

export interface PagoCreate {
  ingreso_id: string;
  monto: number;
  metodo_pago: 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'cheque' | 'otro';
  referencia?: string;
  fecha_pago: string;
  notas?: string;
}

// Categorías de Ingreso
export async function getCategorias(consultorioId?: string): Promise<CategoriaIngreso[]> {
  let query = supabase
    .from('categorias_ingreso')
    .select('*')
    .order('nombre');

  if (consultorioId) {
    query = query.or(`consultorio_id.eq.${consultorioId},consultorio_id.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching categorías:', error);
    throw error;
  }

  return data || [];
}

export async function createCategoria(categoria: Omit<CategoriaIngreso, 'id' | 'created_at' | 'updated_at'>): Promise<CategoriaIngreso> {
  const { data, error } = await supabase
    .from('categorias_ingreso')
    .insert(categoria)
    .select()
    .single();

  if (error) {
    console.error('Error creating categoría:', error);
    throw error;
  }

  return data;
}

// Ingresos
export async function getIngresos(consultorioId: string, filters?: {
  pacienteId?: string;
  doctorId?: string;
  categoriaId?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<IngresoDetalle[]> {
  let query = supabase
    .from('vw_ingresos_detalle')
    .select('*')
    .eq('consultorio_id', consultorioId)
    .order('fecha_servicio', { ascending: false });

  if (filters) {
    if (filters.pacienteId) query = query.eq('paciente_id', filters.pacienteId);
    if (filters.doctorId) query = query.eq('doctor_id', filters.doctorId);
    if (filters.categoriaId) query = query.eq('categoria_id', filters.categoriaId);
    if (filters.estado) query = query.eq('estado', filters.estado);
    if (filters.fechaDesde) query = query.gte('fecha_servicio', filters.fechaDesde);
    if (filters.fechaHasta) query = query.lte('fecha_servicio', filters.fechaHasta);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching ingresos:', error);
    throw error;
  }

  return data || [];
}

export async function getIngresoById(id: string): Promise<IngresoDetalle | null> {
  const { data, error } = await supabase
    .from('vw_ingresos_detalle')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching ingreso:', error);
    throw error;
  }

  return data;
}

export async function createIngreso(ingreso: IngresoCreate): Promise<Ingreso> {
  const { data, error } = await supabase
    .from('ingresos')
    .insert(ingreso)
    .select()
    .single();

  if (error) {
    console.error('Error creating ingreso:', error);
    throw error;
  }

  return data;
}

export async function updateIngreso(id: string, updates: Partial<IngresoCreate>): Promise<Ingreso> {
  const { data, error } = await supabase
    .from('ingresos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating ingreso:', error);
    throw error;
  }

  return data;
}

export async function deleteIngreso(id: string): Promise<void> {
  const { error } = await supabase
    .from('ingresos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting ingreso:', error);
    throw error;
  }
}

// Pagos
export async function getPagosByIngreso(ingresoId: string): Promise<Pago[]> {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('ingreso_id', ingresoId)
    .order('fecha_pago', { ascending: false });

  if (error) {
    console.error('Error fetching pagos:', error);
    throw error;
  }

  return data || [];
}

export async function createPago(pago: PagoCreate): Promise<Pago> {
  const { data, error } = await supabase
    .from('pagos')
    .insert(pago)
    .select()
    .single();

  if (error) {
    console.error('Error creating pago:', error);
    throw error;
  }

  return data;
}

export async function updatePago(id: string, updates: Partial<PagoCreate>): Promise<Pago> {
  const { data, error } = await supabase
    .from('pagos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pago:', error);
    throw error;
  }

  return data;
}

export async function deletePago(id: string): Promise<void> {
  const { error } = await supabase
    .from('pagos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting pago:', error);
    throw error;
  }
}

// Funciones de utilidad
export async function createIngresoDesdeServicio(
  servicioProgresoId: string,
  monto: number,
  doctorId: string,
  porcentajeComision?: number
): Promise<string> {
  const { data, error } = await supabase
    .rpc('crear_ingreso_desde_servicio', {
      p_servicio_progreso_id: servicioProgresoId,
      p_monto: monto,
      p_doctor_id: doctorId,
      p_porcentaje_comision: porcentajeComision
    });

  if (error) {
    console.error('Error creating ingreso from servicio:', error);
    throw error;
  }

  return data;
}

// Reportes y estadísticas
export async function getIngresosMensuales(consultorioId: string, year?: number): Promise<any[]> {
  let query = supabase
    .from('vw_ingresos_mensuales')
    .select('*')
    .eq('consultorio_id', consultorioId)
    .order('mes', { ascending: false });

  if (year) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    query = query.gte('mes', startDate).lte('mes', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching ingresos mensuales:', error);
    throw error;
  }

  return data || [];
}

export async function getComisionesDoctores(consultorioId: string, mes?: string): Promise<any[]> {
  let query = supabase
    .from('vw_comisiones_doctores')
    .select('*')
    .eq('consultorio_id', consultorioId)
    .order('mes', { ascending: false });

  if (mes) {
    query = query.eq('mes', mes);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching comisiones doctores:', error);
    throw error;
  }

  return data || [];
}

// Estadísticas rápidas
export async function getEstadisticasIngresos(consultorioId: string, periodo: 'hoy' | 'semana' | 'mes' | 'año' = 'mes'): Promise<{
  totalIngresos: number;
  totalPagado: number;
  totalPendiente: number;
  cantidadTransacciones: number;
}> {
  const now = new Date();
  let fechaDesde: string;

  switch (periodo) {
    case 'hoy':
      fechaDesde = now.toISOString().split('T')[0];
      break;
    case 'semana':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      fechaDesde = weekAgo.toISOString().split('T')[0];
      break;
    case 'mes':
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      fechaDesde = monthAgo.toISOString().split('T')[0];
      break;
    case 'año':
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      fechaDesde = yearAgo.toISOString().split('T')[0];
      break;
  }

  const { data, error } = await supabase
    .from('vw_ingresos_detalle')
    .select('monto_total, total_pagado, saldo_pendiente')
    .eq('consultorio_id', consultorioId)
    .gte('fecha_servicio', fechaDesde)
    .neq('estado', 'cancelado');

  if (error) {
    console.error('Error fetching estadísticas:', error);
    throw error;
  }

  const stats = (data || []).reduce((acc, ingreso) => ({
    totalIngresos: acc.totalIngresos + Number(ingreso.monto_total),
    totalPagado: acc.totalPagado + Number(ingreso.total_pagado),
    totalPendiente: acc.totalPendiente + Number(ingreso.saldo_pendiente),
    cantidadTransacciones: acc.cantidadTransacciones + 1
  }), {
    totalIngresos: 0,
    totalPagado: 0,
    totalPendiente: 0,
    cantidadTransacciones: 0
  });

  return stats;
} 