import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session_user');
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // Si no hay sesión y no está en /auth, redirige a login
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Si hay sesión o está en /auth, permite el acceso
  return NextResponse.next();
}

// Define las rutas protegidas (ajusta según tus necesidades)
export const config = {
  matcher: [
    // Protege todas las rutas excepto /auth, /api y archivos estáticos
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};