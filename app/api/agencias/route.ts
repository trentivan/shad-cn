// api/agencias/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Agencia } from '../../types/agencia';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const agencias = await prisma.agencia.findMany();
    return NextResponse.json(agencias);
  } catch (error: unknown) {
    console.error('Error al obtener las agencias:', error);
    return NextResponse.json({ message: 'Error al obtener las agencias' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body: Omit<Agencia, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

    if (!body.nombre || !body.tipo || !body.telefono || !body.correo || !body.estado) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const nuevaAgencia = await prisma.agencia.create({
      data: body,
    });    return NextResponse.json(nuevaAgencia, { status: 201 });
  } catch (error: unknown) {
    console.error('Error al crear la agencia:', error);
    return NextResponse.json({ message: 'Error al crear la agencia' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}