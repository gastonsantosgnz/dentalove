import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Permitir siempre acceso a estas rutas sin verificar autenticación
  if (request.nextUrl.pathname === '/login' || 
      request.nextUrl.pathname === '/auth/callback' || 
      request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  try {
    // Actualizamos la sesión usando el helper de Supabase
    const response = await updateSession(request);
    
    // Si llegamos aquí, la sesión es válida
    console.log(`[Middleware] Path: ${request.nextUrl.pathname}, Auth status: authenticated`);
    
    return response;
  } catch (error) {
    // Si hay error en la sesión, redirigir a login solo para rutas protegidas
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/mi-cuenta')) {
      
      console.log(`[Middleware] Path: ${request.nextUrl.pathname}, Auth status: unauthenticated - redirecting to login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Para otras rutas, permitir acceso
    return NextResponse.next();
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