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
  // NUEVOS CAMPOS PROPUESTOS
  genera_factura?: boolean;
  numero_factura?: string;
  proveedor_beneficiario?: string;
  es_deducible?: boolean;
  fecha_vencimiento?: string;
  periodo_fiscal?: string;
  // NUEVOS CAMPOS DE RELACIÓN
  doctor_id?: string;
  empleado_id?: string;
  proveedor_id?: string;
  laboratorio_id?: string;
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
  // CAMPOS CALCULADOS PARA ANÁLISIS
  año?: number;
  mes?: number;
  tipo_comprobante?: string;
  tipo_fiscal?: string;
  rango_monto?: string;
  // INFORMACIÓN DEL DOCTOR (si aplica)
  doctor_relacion_id?: string;
  doctor_nombre?: string;
  doctor_especialidad?: string;
  doctor_porcentaje_comision?: number;
  // INFORMACIÓN DEL EMPLEADO (si aplica)
  empleado_relacion_id?: string;
  empleado_nombre?: string;
  empleado_puesto?: string;
  empleado_departamento?: string;
  empleado_salario_base?: number;
  // INFORMACIÓN DEL PROVEEDOR (si aplica)
  proveedor_relacion_id?: string;
  proveedor_nombre?: string;
  proveedor_categoria?: string;
  proveedor_contacto?: string;
  // INFORMACIÓN DEL LABORATORIO (si aplica)
  laboratorio_relacion_id?: string;
  laboratorio_nombre?: string;
  laboratorio_especialidades?: string[];
  laboratorio_tiempo_entrega?: number;
  tipo_beneficiario?: string;
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
    .from('vista_gastos_detalle_mejorada')
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
    usuario_id: userData?.user?.id,
    // Limpiar campos de relación nulos o vacíos
    doctor_id: gasto.doctor_id || null,
    empleado_id: gasto.empleado_id || null,
    proveedor_id: gasto.proveedor_id || null,
    laboratorio_id: gasto.laboratorio_id || null
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
    .from('vista_gastos_detalle_mejorada')
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

// NUEVAS FUNCIONES PARA ANÁLISIS FISCAL Y REPORTES MEJORADOS

// Función para obtener reporte fiscal detallado
export async function getReporteFiscal(
  consultorioId: string,
  año: number,
  mes?: number
): Promise<Array<{
  categoria: string;
  subcategoria: string;
  total_con_factura: number;
  total_sin_factura: number;
  total_deducible: number;
  total_no_deducible: number;
  cantidad_gastos: number;
}>> {
  const { data, error } = await supabase
    .rpc('reporte_gastos_fiscales', {
      p_consultorio_id: consultorioId,
      p_año: año,
      p_mes: mes
    });

  if (error) throw error;
  return data || [];
}

// Función para obtener gastos por proveedor
export async function getGastosPorProveedor(
  consultorioId: string,
  fechaInicio: Date,
  fechaFin: Date
): Promise<Array<{
  proveedor: string;
  total: number;
  cantidad: number;
  promedio: number;
  con_factura: number;
  sin_factura: number;
}>> {
  const { data, error } = await supabase
    .from('vista_gastos_detalle_mejorada')
    .select('proveedor_beneficiario, monto, genera_factura')
    .eq('consultorio_id', consultorioId)
    .gte('fecha', fechaInicio.toISOString().split('T')[0])
    .lte('fecha', fechaFin.toISOString().split('T')[0])
    .neq('estado', 'cancelado')
    .not('proveedor_beneficiario', 'is', null);

  if (error) throw error;

  // Agrupar por proveedor
  const gastosPorProveedor = (data || []).reduce((acc, gasto) => {
    const proveedor = gasto.proveedor_beneficiario || 'Sin especificar';
    if (!acc[proveedor]) {
      acc[proveedor] = {
        proveedor,
        total: 0,
        cantidad: 0,
        con_factura: 0,
        sin_factura: 0
      };
    }
    
    acc[proveedor].total += parseFloat(gasto.monto);
    acc[proveedor].cantidad += 1;
    
    if (gasto.genera_factura) {
      acc[proveedor].con_factura += parseFloat(gasto.monto);
    } else {
      acc[proveedor].sin_factura += parseFloat(gasto.monto);
    }
    
    return acc;
  }, {} as Record<string, any>);

  return Object.values(gastosPorProveedor).map(proveedor => ({
    ...proveedor,
    promedio: proveedor.total / proveedor.cantidad
  })).sort((a, b) => b.total - a.total);
}

// Función para análisis de gastos recurrentes
export async function getGastosRecurrentes(
  consultorioId: string,
  mesesAtras: number = 6
): Promise<Array<{
  descripcion: string;
  subcategoria_nombre: string;
  categoria_nombre: string;
  promedio_mensual: number;
  frecuencia: number;
  ultimo_mes: number;
  es_recurrente: boolean;
}>> {
  const fechaInicio = new Date();
  fechaInicio.setMonth(fechaInicio.getMonth() - mesesAtras);
  
  const { data, error } = await supabase
    .from('vista_gastos_detalle_mejorada')
    .select('descripcion, subcategoria_nombre, categoria_nombre, monto, fecha')
    .eq('consultorio_id', consultorioId)
    .gte('fecha', fechaInicio.toISOString().split('T')[0])
    .neq('estado', 'cancelado');

  if (error) throw error;

  // Agrupar por descripción similar
  const gastosAgrupados = (data || []).reduce((acc, gasto) => {
    // Normalizar descripción para detectar patrones
    const descripcionNorm = gasto.descripcion.toLowerCase()
      .replace(/\d+/g, '') // Remover números
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
    
    const key = `${descripcionNorm}-${gasto.subcategoria_nombre}`;
    
    if (!acc[key]) {
      acc[key] = {
        descripcion: gasto.descripcion,
        subcategoria_nombre: gasto.subcategoria_nombre,
        categoria_nombre: gasto.categoria_nombre,
        total: 0,
        ocurrencias: 0,
        meses_con_gasto: new Set()
      };
    }
    
    acc[key].total += parseFloat(gasto.monto);
    acc[key].ocurrencias += 1;
    acc[key].meses_con_gasto.add(new Date(gasto.fecha).getMonth());
    
    return acc;
  }, {} as Record<string, any>);

  return Object.values(gastosAgrupados)
    .map(grupo => ({
      descripcion: grupo.descripcion,
      subcategoria_nombre: grupo.subcategoria_nombre,
      categoria_nombre: grupo.categoria_nombre,
      promedio_mensual: grupo.total / mesesAtras,
      frecuencia: grupo.ocurrencias,
      ultimo_mes: grupo.total,
      es_recurrente: grupo.meses_con_gasto.size >= mesesAtras * 0.5 // 50% de los meses
    }))
    .filter(gasto => gasto.es_recurrente)
    .sort((a, b) => b.promedio_mensual - a.promedio_mensual);
}

// Función para obtener alertas de gastos
export async function getAlertasGastos(
  consultorioId: string
): Promise<Array<{
  tipo: 'sin_factura' | 'sin_proveedor' | 'monto_alto' | 'pendiente_vencido';
  mensaje: string;
  gasto_id: string;
  descripcion: string;
  monto: number;
  severidad: 'alta' | 'media' | 'baja';
}>> {
  const { data, error } = await supabase
    .from('vista_gastos_detalle_mejorada')
    .select('*')
    .eq('consultorio_id', consultorioId)
    .gte('fecha', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Últimos 30 días

  if (error) throw error;

  const alertas: Array<any> = [];

  (data || []).forEach(gasto => {
    // Alerta por gastos sin factura de monto alto
    if (!gasto.genera_factura && parseFloat(gasto.monto) > 5000) {
      alertas.push({
        tipo: 'sin_factura',
        mensaje: `Gasto de $${parseFloat(gasto.monto).toLocaleString('es-MX')} sin factura fiscal`,
        gasto_id: gasto.id,
        descripcion: gasto.descripcion,
        monto: parseFloat(gasto.monto),
        severidad: 'alta'
      });
    }

    // Alerta por gastos sin proveedor especificado
    if (!gasto.proveedor_beneficiario && parseFloat(gasto.monto) > 1000) {
      alertas.push({
        tipo: 'sin_proveedor',
        mensaje: `Gasto sin proveedor especificado`,
        gasto_id: gasto.id,
        descripcion: gasto.descripcion,
        monto: parseFloat(gasto.monto),
        severidad: 'media'
      });
    }

    // Alerta por gastos de monto muy alto
    if (parseFloat(gasto.monto) > 20000) {
      alertas.push({
        tipo: 'monto_alto',
        mensaje: `Gasto de monto muy elevado`,
        gasto_id: gasto.id,
        descripcion: gasto.descripcion,
        monto: parseFloat(gasto.monto),
        severidad: 'alta'
      });
    }

    // Alerta por gastos pendientes vencidos
    if (gasto.estado === 'pendiente' && gasto.fecha_vencimiento) {
      const fechaVencimiento = new Date(gasto.fecha_vencimiento);
      if (fechaVencimiento < new Date()) {
        alertas.push({
          tipo: 'pendiente_vencido',
          mensaje: `Gasto pendiente vencido desde ${fechaVencimiento.toLocaleDateString('es-MX')}`,
          gasto_id: gasto.id,
          descripcion: gasto.descripcion,
          monto: parseFloat(gasto.monto),
          severidad: 'alta'
        });
      }
    }
  });

  return alertas.sort((a, b) => {
    const severidadOrden = { alta: 3, media: 2, baja: 1 };
    return severidadOrden[b.severidad] - severidadOrden[a.severidad];
  });
}

// Función para validar y sugerir categorización
export async function sugerirCategorizacion(
  descripcion: string,
  monto: number,
  consultorioId: string
): Promise<{
  categoria_sugerida?: string;
  subcategoria_sugerida?: string;
  confianza: number;
  razon: string;
}> {
  // Patrones para auto-categorización basados en palabras clave
  const patrones = [
    {
      keywords: ['sat', 'impuesto', 'hacienda'],
      categoria: 'Obligaciones Fiscales',
      subcategoria: 'Impuestos Federales',
      confianza: 0.9
    },
    {
      keywords: ['imss', 'seguro social'],
      categoria: 'Obligaciones Fiscales', 
      subcategoria: 'Cuotas IMSS',
      confianza: 0.9
    },
    {
      keywords: ['renta', 'alquiler'],
      categoria: 'Instalaciones',
      subcategoria: 'Renta',
      confianza: 0.85
    },
    {
      keywords: ['material dental', 'dental'],
      categoria: 'Materiales',
      subcategoria: 'Material dental',
      confianza: 0.8
    },
    {
      keywords: ['basura', 'recolección'],
      categoria: 'Instalaciones',
      subcategoria: 'Recolección de Basura',
      confianza: 0.8
    },
    {
      keywords: ['pase medico', 'pases medicos'],
      categoria: 'Servicios Profesionales',
      subcategoria: 'Pases Médicos',
      confianza: 0.85
    }
  ];

  const descripcionLower = descripcion.toLowerCase();
  
  for (const patron of patrones) {
    for (const keyword of patron.keywords) {
      if (descripcionLower.includes(keyword)) {
        return {
          categoria_sugerida: patron.categoria,
          subcategoria_sugerida: patron.subcategoria,
          confianza: patron.confianza,
          razon: `Detectado patrón: "${keyword}" en la descripción`
        };
      }
    }
  }

  // Si es un monto alto, sugerir verificación adicional
  if (monto > 10000) {
    return {
      confianza: 0.3,
      razon: 'Monto elevado - requiere categorización manual cuidadosa'
    };
  }

  return {
    confianza: 0,
    razon: 'No se encontró patrón reconocible - categorización manual requerida'
  };
}

// NUEVA FUNCIÓN: Reporte de comisiones por doctor
export async function getReporteComisionesDoctores(
  consultorioId: string,
  fechaInicio: Date,
  fechaFin: Date
): Promise<Array<{
  doctor_id: string;
  doctor_nombre: string;
  especialidad: string;
  total_comisiones: number;
  cantidad_pagos: number;
  promedio_comision: number;
  porcentaje_comision_doctor: number;
}>> {
  const { data, error } = await supabase
    .rpc('reporte_comisiones_doctor', {
      p_consultorio_id: consultorioId,
      p_fecha_inicio: fechaInicio.toISOString().split('T')[0],
      p_fecha_fin: fechaFin.toISOString().split('T')[0]
    });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    doctor_id: row.doctor_id,
    doctor_nombre: row.doctor_nombre,
    especialidad: row.especialidad,
    total_comisiones: parseFloat(row.total_comisiones || 0),
    cantidad_pagos: parseInt(row.cantidad_pagos || 0),
    promedio_comision: parseFloat(row.promedio_comision || 0),
    porcentaje_comision_doctor: parseFloat(row.porcentaje_comision_doctor || 0)
  }));
}

// NUEVA FUNCIÓN: Reporte de sueldos por empleado
export async function getReporteSueldosEmpleados(
  consultorioId: string,
  fechaInicio: Date,
  fechaFin: Date
): Promise<Array<{
  empleado_id: string;
  empleado_nombre: string;
  puesto: string;
  departamento: string;
  salario_base: number;
  total_pagado: number;
  cantidad_pagos: number;
  promedio_pago: number;
}>> {
  const { data, error } = await supabase
    .rpc('reporte_sueldos_empleado', {
      p_consultorio_id: consultorioId,
      p_fecha_inicio: fechaInicio.toISOString().split('T')[0],
      p_fecha_fin: fechaFin.toISOString().split('T')[0]
    });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    empleado_id: row.empleado_id,
    empleado_nombre: row.empleado_nombre,
    puesto: row.puesto,
    departamento: row.departamento || '',
    salario_base: parseFloat(row.salario_base || 0),
    total_pagado: parseFloat(row.total_pagado || 0),
    cantidad_pagos: parseInt(row.cantidad_pagos || 0),
    promedio_pago: parseFloat(row.promedio_pago || 0)
  }));
}

// NUEVA FUNCIÓN: Actualizar gastos existentes con doctor_id
export async function actualizarDoctorIdsExistentes(consultorioId: string): Promise<void> {
  const { error } = await supabase
    .rpc('actualizar_doctor_ids_existentes');

  if (error) throw error;
} 

// NUEVA FUNCIÓN: Actualizar gastos existentes con empleado_id
export async function actualizarEmpleadoIdsExistentes(): Promise<void> {
  const { error } = await supabase
    .rpc('actualizar_empleado_ids_existentes');

  if (error) throw error;
} 

// NUEVA FUNCIÓN: Reporte de gastos por proveedor
export async function getReporteGastosProveedores(
  consultorioId: string,
  fechaInicio: Date,
  fechaFin: Date
): Promise<Array<{
  proveedor_id: string;
  proveedor_nombre: string;
  categoria_proveedor: string;
  total_gastado: number;
  cantidad_compras: number;
  promedio_compra: number;
}>> {
  const { data, error } = await supabase
    .rpc('reporte_gastos_proveedor', {
      p_consultorio_id: consultorioId,
      p_fecha_inicio: fechaInicio.toISOString().split('T')[0],
      p_fecha_fin: fechaFin.toISOString().split('T')[0]
    });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    proveedor_id: row.proveedor_id,
    proveedor_nombre: row.proveedor_nombre,
    categoria_proveedor: row.categoria_proveedor || '',
    total_gastado: parseFloat(row.total_gastado || 0),
    cantidad_compras: parseInt(row.cantidad_compras || 0),
    promedio_compra: parseFloat(row.promedio_compra || 0)
  }));
}

// NUEVA FUNCIÓN: Reporte de gastos por laboratorio
export async function getReporteGastosLaboratorios(
  consultorioId: string,
  fechaInicio: Date,
  fechaFin: Date
): Promise<Array<{
  laboratorio_id: string;
  laboratorio_nombre: string;
  especialidades: string[];
  total_gastado: number;
  cantidad_trabajos: number;
  promedio_trabajo: number;
  tiempo_entrega_promedio: number;
}>> {
  const { data, error } = await supabase
    .rpc('reporte_gastos_laboratorio', {
      p_consultorio_id: consultorioId,
      p_fecha_inicio: fechaInicio.toISOString().split('T')[0],
      p_fecha_fin: fechaFin.toISOString().split('T')[0]
    });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    laboratorio_id: row.laboratorio_id,
    laboratorio_nombre: row.laboratorio_nombre,
    especialidades: row.especialidades || [],
    total_gastado: parseFloat(row.total_gastado || 0),
    cantidad_trabajos: parseInt(row.cantidad_trabajos || 0),
    promedio_trabajo: parseFloat(row.promedio_trabajo || 0),
    tiempo_entrega_promedio: parseInt(row.tiempo_entrega_promedio || 0)
  }));
} 