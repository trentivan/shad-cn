// api/agencias/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Agencia } from '../../../types/agencia'; // Adjust the import path as needed

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = parseInt(await Promise.resolve(params.id), 10);

    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de agencia inválido' }, { status: 400 });
    }

    try {
        const agencia = await prisma.agencia.findUnique({
            where: { id },
        });

        if (!agencia) {
            return NextResponse.json({ message: 'Agencia no encontrada' }, { status: 404 });
        }        return NextResponse.json(agencia);
    } catch (error: unknown) {
        console.error('Error al obtener la agencia:', error);
        return NextResponse.json({ message: 'Error al obtener la agencia' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = parseInt(await Promise.resolve(params.id), 10);

    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de agencia inválido' }, { status: 400 });
    }

    try {
        const body: Partial<Agencia> = await request.json();
        const updatedAgencia = await prisma.agencia.update({
            where: { id },
            data: body,
        });        return NextResponse.json(updatedAgencia);
    } catch (error: unknown) {
        console.error('Error al actualizar la agencia:', error);
        return NextResponse.json({ message: 'Error al actualizar la agencia' }, { status: 500 });
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
        return NextResponse.json({ message: 'ID de agencia inválido' }, { status: 400 });
    }

    try {
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