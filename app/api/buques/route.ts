import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Buque } from '../../types/buque';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const buques = await prisma.buque.findMany();
    return NextResponse.json(buques);
  } catch (error: unknown) {
    console.error('Error al obtener los buques:', error);
    return NextResponse.json({ message: 'Error al obtener los buques' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body: Omit<Buque, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

    // Asegura que agenciaId es un número
    const agenciaId = Number(body.agenciaId);

    if (
      !body.nombre ||
      !body.tipo ||
      body.loa === null || body.loa === undefined ||
      !body.estado ||
      !agenciaId || isNaN(agenciaId) || agenciaId <= 0 // validamos que sea un número válido y positivo
    ) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    // Verifica que la agencia existe
    const agencia = await prisma.agencia.findUnique({ where: { id: agenciaId } });
    if (!agencia) {
      return NextResponse.json({ message: 'La agencia seleccionada no existe.' }, { status: 400 });
    }

    const loaNum = Number(body.loa);
    const nuevoBuque = await prisma.buque.create({
      data: {
        nombre: body.nombre,
        tipo: body.tipo,
        estado: body.estado,
        loa: loaNum,
        agencia: {
          connect: { id: agenciaId },
        },
      },
    });    return NextResponse.json(nuevoBuque, { status: 201 });
  } catch (error: unknown) {
    console.error('Error al crear el buque:', error);
    return NextResponse.json({ message: 'Error al crear el buque' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}