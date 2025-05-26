'use client';
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface Consultorio {
  id: string;
  nombre: string;
  logo: string;
}

type ConsultorioContextType = {
  consultorio: Consultorio | null;
  isLoading: boolean;
  fetchConsultorio: () => Promise<void>;
};

const ConsultorioContext = createContext<ConsultorioContextType | undefined>(undefined);

// Duración del cache en milisegundos (1 hora)
const CACHE_DURATION = 3600000;
const CACHE_KEY = 'userConsultorio';

export function ConsultorioProvider({ children }: { children: React.ReactNode }) {
  const [consultorio, setConsultorio] = useState<Consultorio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Función para cargar los datos del consultorio
  const fetchConsultorio = useCallback(async () => {
    if (!user) {
      setConsultorio(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Intentar obtener del localStorage primero (solo en cliente)
      if (typeof window !== 'undefined') {
        try {
          const cachedData = localStorage.getItem(CACHE_KEY);
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            const cacheTime = parsedData.timestamp;
            
            // Si el cache es válido y pertenece al usuario actual, usarlo
            if (cacheTime && 
                Date.now() - cacheTime < CACHE_DURATION && 
                parsedData.userId === user.id) {
              setConsultorio(parsedData.consultorio);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error('Error parsing cached consultorio data:', e);
          // Si hay error al parsear, continuar con la consulta a Supabase
        }
      }
      
      // Si no hay cache válido, consultar a Supabase
      const { data, error } = await supabase
        .from('usuarios_consultorios')
        .select(`
          consultorio_id,
          consultorios:consultorio_id(
            id, 
            nombre, 
            logo
          )
        `)
        .eq('usuario_id', user.id)
        .eq('activo', true)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró consultorio
          setConsultorio(null);
          // Guardar en localStorage que no tiene consultorio (solo en cliente)
          if (typeof window !== 'undefined') {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              consultorio: null,
              userId: user.id,
              timestamp: Date.now()
            }));
          }
        } else {
          console.error('Error al cargar consultorio:', error);
        }
        setIsLoading(false);
        return;
      }
      
      if (data && data.consultorios) {
        const consultorioData = {
          id: data.consultorio_id,
          nombre: data.consultorios.nombre || '',
          logo: data.consultorios.logo || '',
        };
        
        setConsultorio(consultorioData);
        
        // Guardar en localStorage (solo en cliente)
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            consultorio: consultorioData,
            userId: user.id,
            timestamp: Date.now()
          }));
        }
      } else {
        setConsultorio(null);
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            consultorio: null,
            userId: user.id,
            timestamp: Date.now()
          }));
        }
      }
    } catch (error) {
      console.error('Error inesperado al cargar consultorio:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar consultorio cuando cambie el usuario
  useEffect(() => {
    if (user) {
      fetchConsultorio();
    } else {
      setConsultorio(null);
      setIsLoading(false);
    }
  }, [user, fetchConsultorio]);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    consultorio,
    isLoading,
    fetchConsultorio
  }), [consultorio, isLoading, fetchConsultorio]);

  return (
    <ConsultorioContext.Provider value={contextValue}>
      {children}
    </ConsultorioContext.Provider>
  );
}

export function useConsultorio() {
  const context = useContext(ConsultorioContext);
  if (context === undefined) {
    throw new Error('useConsultorio must be used within a ConsultorioProvider');
  }
  return context;
} 