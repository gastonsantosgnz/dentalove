import { supabase } from './supabase';

export interface Empleado {
  id: string;
  consultorio_id: string;
  nombre_completo: string;
  puesto: string;
  departamento?: string;
  salario_base?: number;
  tipo_contrato?: string;
  fecha_ingreso?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getEmpleados = async (): Promise<Empleado[]> => {
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .order('nombre_completo');
  
  if (error) {
    console.error('Error fetching empleados:', error);
    throw error;
  }
  
  return (data || []).map((empleado: any) => ({
    id: String(empleado.id || ''),
    consultorio_id: String(empleado.consultorio_id || ''),
    nombre_completo: String(empleado.nombre_completo || ''),
    puesto: String(empleado.puesto || ''),
    departamento: empleado.departamento ? String(empleado.departamento) : undefined,
    salario_base: empleado.salario_base ? Number(empleado.salario_base) : undefined,
    tipo_contrato: empleado.tipo_contrato ? String(empleado.tipo_contrato) : undefined,
    fecha_ingreso: empleado.fecha_ingreso ? String(empleado.fecha_ingreso) : undefined,
    telefono: empleado.telefono ? String(empleado.telefono) : undefined,
    email: empleado.email ? String(empleado.email) : undefined,
    direccion: empleado.direccion ? String(empleado.direccion) : undefined,
    notas: empleado.notas ? String(empleado.notas) : undefined,
    activo: Boolean(empleado.activo),
    created_at: String(empleado.created_at || ''),
    updated_at: String(empleado.updated_at || '')
  }));
};

export const getEmpleadosByConsultorio = async (consultorioId: string): Promise<Empleado[]> => {
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .eq('consultorio_id', consultorioId)
    .eq('activo', true)
    .order('nombre_completo');
  
  if (error) {
    console.error('Error fetching empleados by consultorio:', error);
    throw error;
  }
  
  return (data || []).map((empleado: any) => ({
    id: String(empleado.id || ''),
    consultorio_id: String(empleado.consultorio_id || ''),
    nombre_completo: String(empleado.nombre_completo || ''),
    puesto: String(empleado.puesto || ''),
    departamento: empleado.departamento ? String(empleado.departamento) : undefined,
    salario_base: empleado.salario_base ? Number(empleado.salario_base) : undefined,
    tipo_contrato: empleado.tipo_contrato ? String(empleado.tipo_contrato) : undefined,
    fecha_ingreso: empleado.fecha_ingreso ? String(empleado.fecha_ingreso) : undefined,
    telefono: empleado.telefono ? String(empleado.telefono) : undefined,
    email: empleado.email ? String(empleado.email) : undefined,
    direccion: empleado.direccion ? String(empleado.direccion) : undefined,
    notas: empleado.notas ? String(empleado.notas) : undefined,
    activo: Boolean(empleado.activo),
    created_at: String(empleado.created_at || ''),
    updated_at: String(empleado.updated_at || '')
  }));
};

export const getEmpleado = async (id: string): Promise<Empleado | null> => {
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching empleado:', error);
    throw error;
  }
  
  return data ? {
    id: String(data.id || ''),
    consultorio_id: String(data.consultorio_id || ''),
    nombre_completo: String(data.nombre_completo || ''),
    puesto: String(data.puesto || ''),
    departamento: data.departamento ? String(data.departamento) : undefined,
    salario_base: data.salario_base ? Number(data.salario_base) : undefined,
    tipo_contrato: data.tipo_contrato ? String(data.tipo_contrato) : undefined,
    fecha_ingreso: data.fecha_ingreso ? String(data.fecha_ingreso) : undefined,
    telefono: data.telefono ? String(data.telefono) : undefined,
    email: data.email ? String(data.email) : undefined,
    direccion: data.direccion ? String(data.direccion) : undefined,
    notas: data.notas ? String(data.notas) : undefined,
    activo: Boolean(data.activo),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || '')
  } : null;
};

export const createEmpleado = async (empleado: Omit<Empleado, 'id' | 'created_at' | 'updated_at'>): Promise<Empleado> => {
  const { data, error } = await supabase
    .from('empleados')
    .insert(empleado)
    .select()
    .single();

  if (error) {
    console.error('Error creating empleado:', error);
    throw error;
  }

  return {
    id: String(data.id || ''),
    consultorio_id: String(data.consultorio_id || ''),
    nombre_completo: String(data.nombre_completo || ''),
    puesto: String(data.puesto || ''),
    departamento: data.departamento ? String(data.departamento) : undefined,
    salario_base: data.salario_base ? Number(data.salario_base) : undefined,
    tipo_contrato: data.tipo_contrato ? String(data.tipo_contrato) : undefined,
    fecha_ingreso: data.fecha_ingreso ? String(data.fecha_ingreso) : undefined,
    telefono: data.telefono ? String(data.telefono) : undefined,
    email: data.email ? String(data.email) : undefined,
    direccion: data.direccion ? String(data.direccion) : undefined,
    notas: data.notas ? String(data.notas) : undefined,
    activo: Boolean(data.activo),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || '')
  };
};

export const updateEmpleado = async (id: string, empleado: Partial<Omit<Empleado, 'id' | 'created_at' | 'updated_at'>>): Promise<Empleado> => {
  const { data, error } = await supabase
    .from('empleados')
    .update(empleado)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating empleado:', error);
    throw error;
  }

  return {
    id: String(data.id || ''),
    consultorio_id: String(data.consultorio_id || ''),
    nombre_completo: String(data.nombre_completo || ''),
    puesto: String(data.puesto || ''),
    departamento: data.departamento ? String(data.departamento) : undefined,
    salario_base: data.salario_base ? Number(data.salario_base) : undefined,
    tipo_contrato: data.tipo_contrato ? String(data.tipo_contrato) : undefined,
    fecha_ingreso: data.fecha_ingreso ? String(data.fecha_ingreso) : undefined,
    telefono: data.telefono ? String(data.telefono) : undefined,
    email: data.email ? String(data.email) : undefined,
    direccion: data.direccion ? String(data.direccion) : undefined,
    notas: data.notas ? String(data.notas) : undefined,
    activo: Boolean(data.activo),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || '')
  };
};

export const deleteEmpleado = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('empleados')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting empleado:', error);
    throw error;
  }
}; 