import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Permitir siempre acceso a estas rutas sin verificar autenticación
  if (request.nextUrl.pathname === '/login' || 
      request.nextUrl.pathname === '/auth/callback' || 
      request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  // Para evitar ciclos infinitos, verificamos si hay un contador de redirecciones
  const redirectCount = Number(request.cookies.get('redirect_count')?.value || '0');
  if (redirectCount > 2) {
    console.log('[Middleware] Detected redirect loop! Stopping middleware.');
    // Limpiar la cookie de contador y continuar
    const response = NextResponse.next();
    response.cookies.set('redirect_count', '0', { 
      path: '/',
      maxAge: 0 
    });
    return response;
  }

  // Verificar si tenemos una cookie para omitir la verificación
  const skipAuth = request.cookies.get('skip_auth')?.value === 'true';
  if (skipAuth) {
    console.log('[Middleware] Skipping auth check due to cookie');
    // Limpiar la cookie después de usarla
    const response = NextResponse.next();
    response.cookies.set('skip_auth', '', { maxAge: 0, path: '/' });
    return response;
  }

  try {
    // Actualizamos la sesión usando el nuevo helper
    const response = await updateSession(request);

    // Verificamos si el usuario está autenticado después de actualizar la sesión
    // Obtenemos la cookie de sesión que se acaba de refrescar
    const sessionCookie = request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]}-auth-token`)?.value;
    const isAuthenticated = !!sessionCookie;
    
    console.log(`[Middleware] Path: ${request.nextUrl.pathname}, Auth status: ${isAuthenticated ? 'authenticated' : 'unauthenticated'}`);

    // Sólo proteger rutas específicas según el matcher
    if (!isAuthenticated && (
      request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/mi-cuenta')
    )) {
      console.log('[Middleware] Redirecting unauthenticated user to login');
      
      // Establecer una cookie para evitar redirecciones en la página de login
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
      redirectResponse.cookies.set('redirect_count', String(redirectCount + 1), { 
        path: '/',
        maxAge: 60 // 1 minuto
      });
      
      return redirectResponse;
    } 
    
    // Si pasa toda la verificación, continuamos normalmente
    return response;
  } catch (error) {
    console.error('[Middleware] Error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/mi-cuenta/:path*',
    '/login',
    '/auth/callback'
  ],
}; 