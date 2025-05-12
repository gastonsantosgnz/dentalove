'use client';
import { createContext, useContext, useEffect, useState } from 'react';
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

  // Función para refrescar la sesión manualmente
  const refreshSession = async () => {
    setIsLoading(true);
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    setIsLoading(false);
  };

  // Función mejorada para manejar redirecciones
  const redirectToDashboard = () => {
    console.log('[AuthContext] Attempting to redirect to dashboard...');
    
    // Establecer cookie para evitar problemas con el middleware
    document.cookie = "skip_auth=true; path=/; max-age=60";
    
    try {
      // Usar window.location.href directamente para forzar una recarga completa
      // Esto evita problemas con la caché del router de Next.js
      console.log('[AuthContext] Redirecting with window.location.href...');
      window.location.href = '/dashboard';
    } catch (e) {
      console.error('[AuthContext] Redirect error:', e);
    }
  };

  // Improved redirect function to use Next.js router when possible
  const redirectIfNeeded = (newSession: Session | null) => {
    // Solo redirigir si no lo hemos hecho ya y hay una sesión
    if (!hasRedirected && newSession) {
      const currentPath = window.location.pathname;
      
      // Solo redirigir desde login o página raíz
      if (currentPath === '/login' || currentPath === '/') {
        setHasRedirected(true);
        console.log('[AuthContext] User authenticated, current path:', currentPath);
        
        // Usar función dedicada para redirección
        redirectToDashboard();
      }
    }
  };

  useEffect(() => {
    // Obtener la sesión actual al cargar
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        // Solo redirigir si tenemos una sesión
        if (data.session) {
          console.log('[AuthContext] Initial session found, user:', data.session.user.email);
          redirectIfNeeded(data.session);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[AuthContext] Auth state change event:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
        
        // Solo manejar evento SIGNED_IN para redirecciones
        if (event === 'SIGNED_IN') {
          console.log('[AuthContext] User signed in, redirecting...');
          redirectIfNeeded(newSession);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

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
      console.log('[AuthContext] Verifying OTP for:', email);
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      
      // Si la verificación es exitosa, actualizar el estado de la sesión
      if (data?.session) {
        console.log('[AuthContext] OTP verification successful, session established');
        setSession(data.session);
        setUser(data.session.user);
        
        // Establecer una cookie para evitar problemas con el middleware
        document.cookie = "skip_auth=true; path=/; max-age=60";
        
        // Esperar un momento para asegurar que el estado se actualice
        setTimeout(() => {
          console.log('[AuthContext] Redirecting after successful verification...');
          redirectToDashboard();
        }, 500);
      }
      
      return { error };
    } catch (error) {
      console.error('[AuthContext] Error verifying OTP:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHasRedirected(false);
    
    try {
      router.push('/login');
    } catch (e) {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        isLoading, 
        signOut, 
        signInWithOtp, 
        verifyOtp,
        refreshSession
      }}
    >
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