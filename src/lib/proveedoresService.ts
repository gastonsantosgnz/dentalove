import { supabase } from './supabase';

export interface Proveedor {
  id: string;
  consultorio_id: string;
  nombre_comercial: string;
  nombre_fiscal?: string;
  rfc?: string;
  contacto_principal?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  categoria_proveedor?: string;
  notas?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getProveedores = async (): Promise<Proveedor[]> => {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .order('nombre_comercial');
  
  if (error) {
    console.error('Error fetching proveedores:', error);
    throw error;
  }
  
  return (data || []).map((proveedor: any) => ({
    id: String(proveedor.id || ''),
    consultorio_id: String(proveedor.consultorio_id || ''),
    nombre_comercial: String(proveedor.nombre_comercial || ''),
    nombre_fiscal: proveedor.nombre_fiscal ? String(proveedor.nombre_fiscal) : undefined,
    rfc: proveedor.rfc ? String(proveedor.rfc) : undefined,
    contacto_principal: proveedor.contacto_principal ? String(proveedor.contacto_principal) : undefined,
    telefono: proveedor.telefono ? String(proveedor.telefono) : undefined,
    email: proveedor.email ? String(proveedor.email) : undefined,
    direccion: proveedor.direccion ? String(proveedor.direccion) : undefined,
    categoria_proveedor: proveedor.categoria_proveedor ? String(proveedor.categoria_proveedor) : undefined,
    notas: proveedor.notas ? String(proveedor.notas) : undefined,
    activo: Boolean(proveedor.activo),
    created_at: String(proveedor.created_at || ''),
    updated_at: String(proveedor.updated_at || '')
  }));
};

export const getProveedoresByConsultorio = async (consultorioId: string, categoria?: string): Promise<Proveedor[]> => {
  let query = supabase
    .from('proveedores')
    .select('*')
    .eq('consultorio_id', consultorioId)
    .eq('activo', true);
  
  if (categoria) {
    query = query.eq('categoria_proveedor', categoria);
  }
  
  const { data, error } = await query.order('nombre_comercial');
  
  if (error) {
    console.error('Error fetching proveedores by consultorio:', error);
    throw error;
  }
  
  return (data || []).map((proveedor: any) => ({
    id: String(proveedor.id || ''),
    consultorio_id: String(proveedor.consultorio_id || ''),
    nombre_comercial: String(proveedor.nombre_comercial || ''),
    nombre_fiscal: proveedor.nombre_fiscal ? String(proveedor.nombre_fiscal) : undefined,
    rfc: proveedor.rfc ? String(proveedor.rfc) : undefined,
    contacto_principal: proveedor.contacto_principal ? String(proveedor.contacto_principal) : undefined,
    telefono: proveedor.telefono ? String(proveedor.telefono) : undefined,
    email: proveedor.email ? String(proveedor.email) : undefined,
    direccion: proveedor.direccion ? String(proveedor.direccion) : undefined,
    categoria_proveedor: proveedor.categoria_proveedor ? String(proveedor.categoria_proveedor) : undefined,
    notas: proveedor.notas ? String(proveedor.notas) : undefined,
    activo: Boolean(proveedor.activo),
    created_at: String(proveedor.created_at || ''),
    updated_at: String(proveedor.updated_at || '')
  }));
};

export const createProveedor = async (proveedor: Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>): Promise<Proveedor> => {
  const { data, error } = await supabase
    .from('proveedores')
    .insert(proveedor)
    .select()
    .single();

  if (error) {
    console.error('Error creating proveedor:', error);
    throw error;
  }

  return {
    id: String(data.id || ''),
    consultorio_id: String(data.consultorio_id || ''),
    nombre_comercial: String(data.nombre_comercial || ''),
    nombre_fiscal: data.nombre_fiscal ? String(data.nombre_fiscal) : undefined,
    rfc: data.rfc ? String(data.rfc) : undefined,
    contacto_principal: data.contacto_principal ? String(data.contacto_principal) : undefined,
    telefono: data.telefono ? String(data.telefono) : undefined,
    email: data.email ? String(data.email) : undefined,
    direccion: data.direccion ? String(data.direccion) : undefined,
    categoria_proveedor: data.categoria_proveedor ? String(data.categoria_proveedor) : undefined,
    notas: data.notas ? String(data.notas) : undefined,
    activo: Boolean(data.activo),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || '')
  };
};

export const updateProveedor = async (id: string, proveedor: Partial<Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>>): Promise<Proveedor> => {
  const { data, error } = await supabase
    .from('proveedores')
    .update(proveedor)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating proveedor:', error);
    throw error;
  }

  return {
    id: String(data.id || ''),
    consultorio_id: String(data.consultorio_id || ''),
    nombre_comercial: String(data.nombre_comercial || ''),
    nombre_fiscal: data.nombre_fiscal ? String(data.nombre_fiscal) : undefined,
    rfc: data.rfc ? String(data.rfc) : undefined,
    contacto_principal: data.contacto_principal ? String(data.contacto_principal) : undefined,
    telefono: data.telefono ? String(data.telefono) : undefined,
    email: data.email ? String(data.email) : undefined,
    direccion: data.direccion ? String(data.direccion) : undefined,
    categoria_proveedor: data.categoria_proveedor ? String(data.categoria_proveedor) : undefined,
    notas: data.notas ? String(data.notas) : undefined,
    activo: Boolean(data.activo),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || '')
  };
};

export const deleteProveedor = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('proveedores')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting proveedor:', error);
    throw error;
  }
}; 