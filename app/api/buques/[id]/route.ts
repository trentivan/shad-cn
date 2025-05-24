// api/buque/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Buque } from '../../../types/buque';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(await Promise.resolve(params.id), 10);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'ID de buque inválido' }, { status: 400 });
  }

  try {
    const buque = await prisma.buque.findUnique({
      where: { id },
    });

    if (!buque) {
      return NextResponse.json({ message: 'Buque no encontrado' }, { status: 404 });
    }    return NextResponse.json(buque);
  } catch (error: unknown) {
    console.error('Error al obtener el buque:', error);
    return NextResponse.json({ message: 'Error al obtener el buque' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de buque inválido' }, { status: 400 });
    }    try {        const body: Partial<Buque> = await request.json();

        // Remover id del body para que no se incluya en data
        const { id, agenciaId, ...updateData } = body;

        // Convertir loa a número si está presente
        if (updateData.loa !== undefined) {
            updateData.loa = Number(updateData.loa);
            if (isNaN(updateData.loa)) {
                return NextResponse.json({ message: 'LOA debe ser un número válido' }, { status: 400 });
            }
        }

        const updatedBuque = await prisma.buque.update({
            where: { id },
            data: {
                ...updateData,
                agencia: agenciaId
                    ? {
                          connect: { id: agenciaId },
                      }
                    : undefined, // Handle cases where agenciaId might be undefined
            },
        });        return NextResponse.json(updatedBuque, { status: 200 });
    } catch (error: unknown) {
        console.error('Error al actualizar el buque:', error);
        return NextResponse.json({ message: 'Error al actualizar el buque: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}


export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(await Promise.resolve(params.id), 10);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'ID de buque inválido' }, { status: 400 });
  }

  try {
    await prisma.buque.delete({
      where: { id },
    });    return NextResponse.json({ message: 'Buque eliminado correctamente' });
  } catch (error: unknown) {
    console.error('Error al eliminar el buque:', error);
    return NextResponse.json({ message: 'Error al eliminar el buque' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}