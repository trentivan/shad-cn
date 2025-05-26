import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { tablaDeLogistica } from '@/app/types/tablaDeLogistica';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = await context;
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'ID de tabla de logística inválido' }, { status: 400 });
  }

  try {
    const tablaDeLogistica = await prisma.logisticTable.findUnique({
      where: { id },
    });

    if (!tablaDeLogistica) {
      return NextResponse.json({ message: 'Tabla de logística no encontrada' }, { status: 404 });
    }    return NextResponse.json(tablaDeLogistica);
  } catch (error: unknown) {
    console.error('Error al obtener la tabla de logística:', error);
    return NextResponse.json({ message: 'Error al obtener la tabla de logística' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  const { params } = context;
  
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'ID de tabla de logística inválido' }, { status: 400 });
  }

  try {
    const body: Partial<tablaDeLogistica> = await request.json();
    const { id: _, ...updateData } = body;
    const fixedUpdateData = {
      ...updateData,
      loa: updateData.loa !== undefined ? Number(updateData.loa) : undefined,
    };

    const updatedTablaDeLogistica = await prisma.logisticTable.update({
      where: { id },
      data: fixedUpdateData,
    });
    return NextResponse.json(updatedTablaDeLogistica);
  } catch (error: unknown) {
    console.error('Error al actualizar la tabla de logística:', error);
    return NextResponse.json({ message: 'Error al actualizar la tabla de logística' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = await context;
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'ID de tabla de logística inválido' }, { status: 400 });
  }

  try {
    const deletedTablaDeLogistica = await prisma.logisticTable.delete({
      where: { id },
    });    return NextResponse.json(deletedTablaDeLogistica);
  } catch (error: unknown) {
    console.error('Error al eliminar la tabla de logística:', error);
    return NextResponse.json({ message: 'Error al eliminar la tabla de logística' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}