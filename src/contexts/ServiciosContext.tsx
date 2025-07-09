'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Servicio, ServicioCreate, ServicioUpdate } from '@/lib/database';
import { getServicios, createServicio, updateServicio, deleteServicio as deleteSupabaseServicio } from '@/lib/serviciosService';
import { useConsultorio } from './ConsultorioContext';

type ServiciosContextType = {
  servicios: Servicio[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createService: (servicio: ServicioCreate) => Promise<Servicio>;
  updateService: (id: string, servicio: ServicioUpdate) => Promise<Servicio>;
  deleteService: (id: string) => Promise<void>;
};

const ServiciosContext = createContext<ServiciosContextType | undefined>(undefined);

export function ServiciosProvider({ children }: { children: React.ReactNode }) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const { consultorio } = useConsultorio();
  
  // Función para cargar los servicios
  const fetchServicios = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getServicios();
      
      if (isMountedRef.current) {
        setServicios(data);
      }
    } catch (err) {
      console.error('Error fetching servicios:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Error desconocido al cargar servicios'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);
  
  // Cargar servicios al montar el componente
  useEffect(() => {
    isMountedRef.current = true;
    fetchServicios();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchServicios]);
  
  // Función para crear un servicio
  const createService = useCallback(async (servicio: ServicioCreate): Promise<Servicio> => {
    if (!consultorio) {
      throw new Error('No hay consultorio seleccionado');
    }
    
    try {
      // Agregar consultorio_id al servicio
      const servicioWithConsultorio = {
        ...servicio,
        consultorio_id: consultorio.id
      };
      
      const newService = await createServicio(servicioWithConsultorio);
      
      if (isMountedRef.current) {
        // Actualizar el estado local inmediatamente en lugar de recargar todos los datos
        setServicios(prev => [...prev, newService]);
      }
      
      return newService;
    } catch (err) {
      console.error('Error creating servicio:', err);
      throw err instanceof Error ? err : new Error('Error al crear servicio');
    }
  }, [consultorio]);
  
  // Función para actualizar un servicio
  const updateService = useCallback(async (id: string, servicio: ServicioUpdate): Promise<Servicio> => {
    try {
      const updatedService = await updateServicio(id, servicio);
      
      if (isMountedRef.current) {
        // Actualizar el estado local inmediatamente en lugar de recargar todos los datos
        setServicios(prev => 
          prev.map(item => item.id === id ? updatedService : item)
        );
      }
      
      return updatedService;
    } catch (err) {
      console.error('Error updating servicio:', err);
      throw err instanceof Error ? err : new Error('Error al actualizar servicio');
    }
  }, []);
  
  // Función para eliminar un servicio
  const deleteService = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteSupabaseServicio(id);
      
      if (isMountedRef.current) {
        // Actualizar el estado local inmediatamente en lugar de recargar todos los datos
        setServicios(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Error deleting servicio:', err);
      throw err instanceof Error ? err : new Error('Error al eliminar servicio');
    }
  }, []);
  
  // Valores del contexto
  const contextValue: ServiciosContextType = {
    servicios,
    isLoading,
    error,
    refresh: fetchServicios,
    createService,
    updateService,
    deleteService
  };
  
  return (
    <ServiciosContext.Provider value={contextValue}>
      {children}
    </ServiciosContext.Provider>
  );
}

// Hook para usar el contexto
export function useServicios() {
  const context = useContext(ServiciosContext);
  
  if (context === undefined) {
    throw new Error('useServicios debe usarse dentro de un ServiciosProvider');
  }
  
  return context;
} 