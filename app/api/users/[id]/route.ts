// api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users/[id] - Obtener un usuario específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return NextResponse.json({ message: 'ID de usuario inválido' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('Error al obtener el usuario:', error);
    return NextResponse.json({ message: 'Error al obtener el usuario de la base de datos' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/users/[id] - Actualizar un usuario
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'ID de usuario inválido' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body,
    });    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error('Error al actualizar el usuario:', error);
    return NextResponse.json({ message: 'Error al actualizar el usuario en la base de datos' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/users/[id] - Eliminar un usuario
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'ID de usuario inválido' }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });    return NextResponse.json({ message: 'Usuario eliminado correctamente' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error al eliminar el usuario:', error);
    return NextResponse.json({ message: 'Error al eliminar el usuario de la base de datos' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}