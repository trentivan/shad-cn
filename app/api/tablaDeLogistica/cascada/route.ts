import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
    try {
        const { registros } = await request.json();

        if (!Array.isArray(registros) || registros.length === 0) {
            return NextResponse.json({ error: 'No hay registros para actualizar' }, { status: 400 });
        }

        const actualizados = [];
        for (const reg of registros) {
            // Convierte fechas a Date
            const data = {
                vessel: reg.vessel,
                loa: Number(reg.loa),
                operationTime: reg.operationTime,
                eta: new Date(reg.eta),
                pob: new Date(reg.pob),
                etb: new Date(reg.etb),
                etc: new Date(reg.etc),
                etd: new Date(reg.etd),
                cargo: reg.cargo,
            };
            const actualizado = await prisma.logisticTable.update({
                where: { id: reg.id },
                data,
            });
            actualizados.push(actualizado);
        }

        return NextResponse.json({ actualizados });
    } catch (error) {
        console.error('Error en update en cascada:', error);
        return NextResponse.json({ error: 'Error al actualizar en cascada' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}