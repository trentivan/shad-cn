// api/agencias/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { Agencia } from '../../../types/agencia';

const prisma = new PrismaClient();

type Props = {
  params: {
    id: string;
  };
};

export async function GET(
    request: NextRequest,
    { params }: Props
) {
    try {
        const id = parseInt(params.id, 10);

        if (isNaN(id)) {
            return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
        }

        const agencia = await prisma.agencia.findUnique({
            where: { id },
        });

        if (!agencia) {
            return NextResponse.json({ message: 'Agencia no encontrada' }, { status: 404 });
        }
        
        return NextResponse.json(agencia);
    } catch (error: unknown) {
        console.error('Error al obtener la agencia:', error);
        return NextResponse.json({ message: 'Error al obtener la agencia' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(
    request: NextRequest,
    { params }: Props
) {
    try {
        const id = parseInt(params.id, 10);

        if (isNaN(id)) {
            return NextResponse.json({ message: 'ID de agencia inválido' }, { status: 400 });
        }

        const data = await request.json();
        const updatedAgencia = await prisma.agencia.update({
            where: { id },
            data,
        });        return NextResponse.json(updatedAgencia);
    } catch (error: unknown) {
        console.error('Error al actualizar la agencia:', error);
        return NextResponse.json({ message: 'Error al actualizar la agencia' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: Props
) {
    try {
        const id = parseInt(params.id, 10);

        if (isNaN(id)) {
            return NextResponse.json({ message: 'ID de agencia inválido' }, { status: 400 });
        }

        await prisma.agencia.delete({
            where: { id },
        });        return NextResponse.json({ message: 'Agencia eliminada correctamente' }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error al eliminar la agencia:', error);
        return NextResponse.json({ message: 'Error al eliminar la agencia' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}