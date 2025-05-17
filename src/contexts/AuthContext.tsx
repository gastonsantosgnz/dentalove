'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();
  const authSubscriptionRef = useRef<{ subscription: { unsubscribe: () => void } } | null>(null);
  const unmountedRef = useRef(false);

  // Función para refrescar la sesión manualmente
  const refreshSession = async () => {
    if (unmountedRef.current) return;
    
    setIsLoading(true);
    const { data } = await supabase.auth.getSession();
    
    if (unmountedRef.current) return;
    
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    setIsLoading(false);
  };

  // Función mejorada para manejar redirecciones
  const redirectToDashboard = useCallback(() => {
    if (unmountedRef.current) return;
    
    // Establecer cookie para evitar problemas con el middleware
    document.cookie = "skip_auth=true; path=/; max-age=60";
    
    try {
      // Usar router.push para navegación SPA cuando sea posible
      router.push('/dashboard');
    } catch (e) {
      // Fallback en caso de error
      window.location.href = '/dashboard';
    }
  }, [router]);

  // Improved redirect function to use Next.js router when possible
  const redirectIfNeeded = useCallback((newSession: Session | null) => {
    if (unmountedRef.current) return;
    
    // Solo redirigir si no lo hemos hecho ya y hay una sesión
    if (!hasRedirected && newSession) {
      const currentPath = window.location.pathname;
      
      // Solo redirigir desde login o página raíz
      if (currentPath === '/login' || currentPath === '/') {
        setHasRedirected(true);
        
        // Usar función dedicada para redirección
        redirectToDashboard();
      }
    }
  }, [hasRedirected, redirectToDashboard]);

  useEffect(() => {
    // Marcar como montado
    unmountedRef.current = false;
    
    // Obtener la sesión actual al cargar
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        
        if (unmountedRef.current) return;
        
        setSession(data.session);
        setUser(data.session?.user ?? null);

        // Solo redirigir si tenemos una sesión
        if (data.session) {
          redirectIfNeeded(data.session);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        if (!unmountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Auth state change listener - mejorado para evitar memory leaks
    const setupAuthSubscription = () => {
      // Limpiar cualquier subscripción previa para evitar memory leaks
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.subscription.unsubscribe();
        authSubscriptionRef.current = null;
      }

      // Crear una nueva subscripción
      const { data } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          if (unmountedRef.current) return;
          
          // Actualizar estado solo si el componente está montado
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setIsLoading(false);
          
          // Solo manejar evento SIGNED_IN para redirecciones
          if (event === 'SIGNED_IN') {
            redirectIfNeeded(newSession);
          }
        }
      );

      // Guardar referencia para poder limpiarla después
      authSubscriptionRef.current = data;
    };

    setupAuthSubscription();

    // Limpiar subscripción al desmontar
    return () => {
      unmountedRef.current = true;
      
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.subscription.unsubscribe();
        authSubscriptionRef.current = null;
      }
    };
  }, [router, redirectIfNeeded]);

  // Función para iniciar sesión con OTP (código por email)
  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Función para verificar el código OTP recibido por email
  const verifyOtp = async (email: string, token: string) => {
    try {
      if (unmountedRef.current) return { error: new Error('Component unmounted') };
      
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      
      if (unmountedRef.current) return { error: new Error('Component unmounted') };
      
      // Si la verificación es exitosa, actualizar el estado de la sesión
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        
        // Establecer una cookie para evitar problemas con el middleware
        document.cookie = "skip_auth=true; path=/; max-age=60";
        
        // Redirigir inmediatamente
        redirectToDashboard();
      }
      
      return { error };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    
    if (unmountedRef.current) return;
    
    setUser(null);
    setSession(null);
    setHasRedirected(false);
    
    try {
      window.location.href = '/login';
    } catch (e) {
      console.error('Redirect error after signout:', e);
    }
  };

  const contextValue = {
    user, 
    session, 
    isLoading, 
    signOut, 
    signInWithOtp, 
    verifyOtp,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 