import { NextResponse} from 'next/server';
// import prisma from '../../../lib/prisma';
import { PrismaClient } from '@prisma/client';
import { User } from '@/app/types/usuarios';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const users = await prisma.user.findMany();
        return NextResponse.json(users);
    } catch {
        return NextResponse.json(
            { error: 'Error al obtener usuarios' },
            { status: 500 }
        );
    }
    finally {
        await prisma.$disconnect();
    }
}

export async function POST(request: Request) {
    try {
      const body: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
  
      // Aquí podrías agregar validaciones para los datos del nuevo usuario
      if (!body.nombre || !body.correo || !body.contrasena || !body.rol || !body.estado) {
        return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
      }
  
      const newUser = await prisma.user.create({
        data: body,
      });      return NextResponse.json(newUser, { status: 201 }); // 201 Created
    } catch (error: unknown) {
      console.error('Error al crear el usuario:', error);
      return NextResponse.json({ message: 'Error al crear el usuario en la base de datos' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }


