import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Buque } from '../../types/buque';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const buques = await prisma.buque.findMany();
    return NextResponse.json(buques);
  } catch (error: any) {
    console.error('Error al obtener los buques:', error);
    return NextResponse.json({ message: 'Error al obtener los buques' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body: Omit<Buque, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

    if (!body.nombre || !body.tipo || !body.loa || !body.estado) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const loaNum = Number(body.loa);
    const nuevoBuque = await prisma.buque.create({
      data: {
        nombre: body.nombre,
        tipo: body.tipo,
        estado: body.estado,
        loa: loaNum,
        agencia: {
          connect: { id: body.agenciaId },
        },
        // No agregues tipoBuque si no existe en el modelo
      },
    });

    return NextResponse.json(nuevoBuque, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear el buque:', error);
    return NextResponse.json({ message: 'Error al crear el buque' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}