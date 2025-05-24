import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Importa cookies de next/headers
import { findUserByCorreoYContrasena } from '@/app/data/login';


export async function POST(request: Request) {
  const { correo, contrasena } = await request.json();
  const user = await findUserByCorreoYContrasena(correo, contrasena);

  if (!user) {
    return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 });
  }

  if (user.estado === "Inactivo") {
    return NextResponse.json({ message: 'Usuario inactivo. Contacta al administrador.' }, { status: 403 });
  }

  // Establece la cookie de sesión
  const response = NextResponse.json({
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
  });
  response.cookies.set('session_user', JSON.stringify({
    id: user.id,
    nombre: user.nombre,
    rol: user.rol,
  }), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
  });

  return response;
}