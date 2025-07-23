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
      console.log(`[Middleware] Redirecting unauthenticated user from ${request.nextUrl.pathname} to /login`);
      
      // Incrementar contador de redirecciones
      const newRedirectCount = redirectCount + 1;
      const loginUrl = new URL('/login', request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.set('redirect_count', newRedirectCount.toString(), { 
        path: '/',
        maxAge: 60 // Expira en 1 minuto
      });
      return redirectResponse;
    }

    // Limpiar contador de redirecciones en caso de éxito
    if (redirectCount > 0) {
      response.cookies.set('redirect_count', '0', { 
        path: '/',
        maxAge: 0 
      });
    }

    return response;
  } catch (error) {
    console.error('[Middleware] Error in middleware:', error);
    
    // Redirigir a login en caso de error
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 