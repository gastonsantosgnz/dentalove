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
      
      // Solo redirigir desde la página de login
      if (currentPath === '/login') {
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
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        // Si hay un usuario autenticado, asegurarse de que tiene perfil
        if (data.session?.user) {
          try {
            await createUserProfileIfNew(data.session.user.id);
            // Actualizar email en el perfil de usuario existente
            await updateUserEmailIfNeeded(data.session.user);
          } catch (err) {
            console.error('Error initializing user profile:', err);
          }
        }
        
        setIsLoading(false);
      } catch (e) {
        console.error('Unexpected error in getInitialSession:', e);
        setIsLoading(false);
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
          
          console.log('[AuthContext] Auth state change event:', event);
          
          // Actualizar estado solo si el componente está montado
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setIsLoading(false);
          
          // Solo manejar evento SIGNED_IN para redirecciones y creación de perfil
          if (event === 'SIGNED_IN' && newSession?.user) {
            // Crear perfil de usuario si es necesario
            createUserProfileIfNew(newSession.user.id)
              .then(() => {
                // Luego manejar redirección
                redirectIfNeeded(newSession);
              })
              .catch(err => {
                console.error('[AuthContext] Error in profile creation during auth state change:', err);
                // Continuar con la redirección incluso si hay error en la creación del perfil
                redirectIfNeeded(newSession);
              });
          } else if (event === 'SIGNED_IN') {
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
        
        // Verificar si es un nuevo usuario y crear perfil si es necesario
        await createUserProfileIfNew(data.session.user.id);
        // Actualizar email en el perfil si es necesario
        await updateUserEmailIfNeeded(data.session.user);
        
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

  // Crear un perfil de usuario vacío si es un usuario nuevo
  const createUserProfileIfNew = async (userId: string) => {
    console.log('[AuthContext] Checking if profile exists for user:', userId);
    
    try {
      // Primero verificamos que el usuario exista en auth.users
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('[AuthContext] Error getting current user:', userError);
        return;
      }
      
      if (!userData?.user || userData.user.id !== userId) {
        console.error('[AuthContext] User ID mismatch or user not found:', {
          requestedId: userId,
          currentUser: userData?.user?.id
        });
        return;
      }
      
      // Verificar si ya existe un perfil para este usuario
      const { data: existingProfile, error: queryError } = await supabase
        .from('perfiles_usuario')
        .select('id')
        .eq('id', userId)
        .single();
      
      // Si hay un error que no sea "no se encontraron registros", salir
      if (queryError && queryError.code !== 'PGRST116') {
        console.error('[AuthContext] Error checking profile:', queryError);
        return;
      }
      
      // Si ya existe un perfil, no hacer nada
      if (existingProfile) {
        console.log('[AuthContext] User profile already exists, skipping creation');
        return;
      }
      
      // Obtener información del usuario para el nombre por defecto
      const userEmail = userData.user.email || '';
      const defaultName = userEmail.split('@')[0] || 'Usuario';
      
      console.log('[AuthContext] Creating new user profile for:', userId);
      
      // Crear el perfil con ID, nombre y email
      const { data, error } = await supabase
        .from('perfiles_usuario')
        .insert({
          id: userId,
          nombre: defaultName,
          email: userEmail // Guardar el email en el perfil
        })
        .select();
      
      if (error) {
        console.error('[AuthContext] Error creating user profile:', error);
        console.log('[AuthContext] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('[AuthContext] Successfully created profile:', data);
      }
    } catch (error) {
      console.error('[AuthContext] Unexpected error in createUserProfileIfNew:', error);
    }
  };

  // Actualizar el email en el perfil de usuario si es necesario
  const updateUserEmailIfNeeded = async (user: User) => {
    if (!user || !user.email) return;
    
    try {
      console.log('[AuthContext] Checking if user profile needs email update:', user.id);
      
      // Verificar si el perfil existe y si tiene email
      const { data: profileData, error: profileError } = await supabase
        .from('perfiles_usuario')
        .select('id, email')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('[AuthContext] Error checking user profile for email update:', profileError);
        return;
      }
      
      // Si el perfil existe pero no tiene email o es diferente al actual, actualizarlo
      if (profileData && (!profileData.email || profileData.email !== user.email)) {
        console.log('[AuthContext] Updating email in user profile:', user.id);
        
        const { error: updateError } = await supabase
          .from('perfiles_usuario')
          .update({ email: user.email })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('[AuthContext] Error updating email in user profile:', updateError);
        } else {
          console.log('[AuthContext] Successfully updated email in user profile');
        }
      }
    } catch (error) {
      console.error('[AuthContext] Unexpected error in updateUserEmailIfNeeded:', error);
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