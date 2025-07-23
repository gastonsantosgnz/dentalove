import { supabase } from './supabase';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// Tipos
export interface CategoriaGasto {
  id: string;
  consultorio_id: string;
  nombre: string;
  tipo: 'fijo' | 'variable';
  es_predefinida: boolean;
  icono?: string;
  color?: string;
  orden: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubcategoriaGasto {
  id: string;
  categoria_id: string;
  consultorio_id: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
  categoria?: CategoriaGasto;
}

export interface Gasto {
  id: string;
  consultorio_id: string;
  subcategoria_id: string;
  monto: number;
  fecha: string;
  descripcion: string;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta_debito' | 'tarjeta_credito' | 'otro';
  estado: 'pagado' | 'pendiente';
  comprobante_url?: string;
  notas?: string;
  usuario_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GastoDetalle extends Gasto {
  subcategoria_nombre: string;
  categoria_id: string;
  categoria_nombre: string;
  categoria_tipo: 'fijo' | 'variable';
  categoria_icono?: string;
  categoria_color?: string;
  usuario_email?: string;
  usuario_nombre?: string;
}

export interface EstadisticasGastos {
  totalGastos: number;
  totalFijos: number;
  totalVariables: number;
  cantidadGastos: number;
  promedioDiario: number;
}

// Funciones para Categorías
export async function getCategorias(consultorioId: string): Promise<CategoriaGasto[]> {
  console.log("[gastosService] getCategorias - consultorioId:", consultorioId);
  
  const { data, error } = await supabase
    .from('categorias_gastos')
    .select('*')
    .eq('consultorio_id', consultorioId)
    .eq('activa', true)
    .order('orden', { ascending: true });

  console.log("[gastosService] getCategorias - data:", data);
  console.log("[gastosService] getCategorias - error:", error);

  if (error) throw error;
  return data || [];
}

export async function createCategoria(categoria: Omit<CategoriaGasto, 'id' | 'created_at' | 'updated_at'>): Promise<CategoriaGasto> {
  const { data, error } = await supabase
    .from('categorias_gastos')
    .insert(categoria)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategoria(id: string, updates: Partial<CategoriaGasto>): Promise<CategoriaGasto> {
  const { data, error } = await supabase
    .from('categorias_gastos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategoria(id: string): Promise<void> {
  const { error } = await supabase
    .from('categorias_gastos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Funciones para Subcategorías
export async function getSubcategorias(consultorioId: string, categoriaId?: string): Promise<SubcategoriaGasto[]> {
  let query = supabase
    .from('subcategorias_gastos')
    .select(`
      *,
      categoria:categorias_gastos(*)
    `)
    .eq('consultorio_id', consultorioId)
    .eq('activa', true);

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const { data, error } = await query.order('nombre', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSubcategoria(subcategoria: Omit<SubcategoriaGasto, 'id' | 'created_at' | 'updated_at'>): Promise<SubcategoriaGasto> {
  const { data, error } = await supabase
    .from('subcategorias_gastos')
    .insert(subcategoria)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubcategoria(id: string, updates: Partial<SubcategoriaGasto>): Promise<SubcategoriaGasto> {
  const { data, error } = await supabase
    .from('subcategorias_gastos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubcategoria(id: string): Promise<void> {
  const { error } = await supabase
    .from('subcategorias_gastos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Funciones para Gastos
export async function getGastos(consultorioId: string, filtros?: {
  fechaInicio?: Date;
  fechaFin?: Date;
  categoriaId?: string;
  subcategoriaId?: string;
  estado?: string;
}): Promise<GastoDetalle[]> {
  let query = supabase
    .from('vista_gastos_detalle')
    .select('*')
    .eq('consultorio_id', consultorioId);

  if (filtros?.fechaInicio) {
    query = query.gte('fecha', filtros.fechaInicio.toISOString().split('T')[0]);
  }
  if (filtros?.fechaFin) {
    query = query.lte('fecha', filtros.fechaFin.toISOString().split('T')[0]);
  }
  if (filtros?.categoriaId) {
    query = query.eq('categoria_id', filtros.categoriaId);
  }
  if (filtros?.subcategoriaId) {
    query = query.eq('subcategoria_id', filtros.subcategoriaId);
  }
  if (filtros?.estado) {
    query = query.eq('estado', filtros.estado);
  }

  const { data, error } = await query.order('fecha', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createGasto(gasto: Omit<Gasto, 'id' | 'created_at' | 'updated_at'>): Promise<Gasto> {
  const { data: userData } = await supabase.auth.getUser();
  
  const gastoConUsuario = {
    ...gasto,
    usuario_id: userData?.user?.id
  };

  const { data, error } = await supabase
    .from('gastos')
    .insert(gastoConUsuario)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGasto(id: string, updates: Partial<Gasto>): Promise<Gasto> {
  const { data, error } = await supabase
    .from('gastos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGasto(id: string): Promise<void> {
  const { error } = await supabase
    .from('gastos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Función para obtener estadísticas
export async function getEstadisticasGastos(
  consultorioId: string, 
  periodo: 'hoy' | 'semana' | 'mes' | 'año' = 'mes'
): Promise<EstadisticasGastos> {
  const now = new Date();
  let fechaInicio: Date;
  let fechaFin: Date;

  switch (periodo) {
    case 'hoy':
      fechaInicio = startOfDay(now);
      fechaFin = endOfDay(now);
      break;
    case 'semana':
      fechaInicio = startOfWeek(now, { weekStartsOn: 1 });
      fechaFin = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'mes':
      fechaInicio = startOfMonth(now);
      fechaFin = endOfMonth(now);
      break;
    case 'año':
      fechaInicio = startOfYear(now);
      fechaFin = endOfYear(now);
      break;
  }

  const { data, error } = await supabase
    .rpc('obtener_estadisticas_gastos', {
      p_consultorio_id: consultorioId,
      p_fecha_inicio: fechaInicio.toISOString().split('T')[0],
      p_fecha_fin: fechaFin.toISOString().split('T')[0]
    });

  if (error) throw error;

  const stats = data?.[0] || {};
  
  return {
    totalGastos: parseFloat(stats.total_gastos || 0),
    totalFijos: parseFloat(stats.total_fijos || 0),
    totalVariables: parseFloat(stats.total_variables || 0),
    cantidadGastos: parseInt(stats.cantidad_gastos || 0),
    promedioDiario: parseFloat(stats.promedio_diario || 0)
  };
}

// Función para crear categorías predefinidas
export async function crearCategoriasPredefinidas(consultorioId: string): Promise<void> {
  const { error } = await supabase
    .rpc('crear_categorias_predefinidas', {
      p_consultorio_id: consultorioId
    });

  if (error) throw error;
}

// Función para obtener gastos por categoría
export async function getGastosPorCategoria(
  consultorioId: string,
  fechaInicio: Date,
  fechaFin: Date
): Promise<Array<{
  categoria_id: string;
  categoria_nombre: string;
  categoria_tipo: string;
  categoria_color: string;
  total: number;
  porcentaje: number;
}>> {
  const { data, error } = await supabase
    .from('vista_gastos_detalle')
    .select('categoria_id, categoria_nombre, categoria_tipo, categoria_color, monto')
    .eq('consultorio_id', consultorioId)
    .gte('fecha', fechaInicio.toISOString().split('T')[0])
    .lte('fecha', fechaFin.toISOString().split('T')[0])
    .neq('estado', 'cancelado');

  if (error) throw error;

  // Agrupar por categoría
  const gastosPorCategoria = (data || []).reduce((acc, gasto) => {
    const key = gasto.categoria_id;
    if (!acc[key]) {
      acc[key] = {
        categoria_id: gasto.categoria_id,
        categoria_nombre: gasto.categoria_nombre,
        categoria_tipo: gasto.categoria_tipo,
        categoria_color: gasto.categoria_color,
        total: 0
      };
    }
    acc[key].total += parseFloat(gasto.monto);
    return acc;
  }, {} as Record<string, any>);

  const resultado = Object.values(gastosPorCategoria);
  const totalGeneral = resultado.reduce((sum, cat) => sum + cat.total, 0);

  // Calcular porcentajes
  return resultado.map(cat => ({
    ...cat,
    porcentaje: totalGeneral > 0 ? (cat.total / totalGeneral) * 100 : 0
  })).sort((a, b) => b.total - a.total);
}

// Función para subir comprobante
export async function uploadComprobante(file: File, gastoId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${gastoId}-${Date.now()}.${fileExt}`;
  const filePath = `comprobantes/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('gastos')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('gastos')
    .getPublicUrl(filePath);

  return data.publicUrl;
} 