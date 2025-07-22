import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Esta ruta se encarga de procesar el callback después de que un usuario hace clic en el enlace de Magic Link
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    try {
      const cookieStore = await cookies();
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            async get(name) {
              return cookieStore.get(name)?.value;
            },
            async set(name, value, options) {
              cookieStore.set({ name, value, ...options });
            },
            async remove(name, options) {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            },
          },
        }
      );
      
      // Intercambiar el código por una sesión
      const { error, data } = await supabase.auth.exchangeCodeForSession(code);
      
      console.log('Auth callback processing. Session created:', !!data?.session);
      
      if (error) {
        console.error('Error exchanging code for session:', error.message);
        // Establecer cookie de error
        cookieStore.set('auth_error', 'auth_error', { maxAge: 60, path: '/' });
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Establecer cookie para omitir verificación de autenticación
      cookieStore.set('skip_auth', 'true', { 
        maxAge: 60, // 1 minuto
        path: '/', 
        httpOnly: false 
      });
      
      // Establecer cookie para indicar autenticación exitosa
      cookieStore.set('auth_success', 'true', { 
        maxAge: 60, 
        path: '/', 
        httpOnly: false 
      });
      
      // Redirigir al usuario a la página de dashboard después de la autenticación exitosa
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      // Establecer cookie de error
      const cookieStore = await cookies();
      cookieStore.set('auth_error', 'unexpected', { maxAge: 60, path: '/' });
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Si no hay código, redirigir al login
  console.log('No code found in auth callback URL');
  const cookieStore = await cookies();
  cookieStore.set('auth_error', 'no_code', { maxAge: 60, path: '/' });
  return NextResponse.redirect(new URL('/login', request.url));
} 