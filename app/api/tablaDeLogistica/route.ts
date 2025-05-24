import { NextResponse } from 'next/server';
// import prisma from '../../../lib/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



export async function GET() {
    try {
        const datosLogistica = await prisma.logisticTable.findMany();
        return NextResponse.json(datosLogistica);
    } catch {
        return NextResponse.json(
            { error: 'Error al obtener datos de logistica' },
            { status: 500 }
        );
    }
    finally {
        await prisma.$disconnect();
    }
}

// para crear un nuevo registro de logistica
export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validar que los campos de fecha no sean 'Invalid Date'
        // Esto es una capa extra de seguridad si el frontend envía una fecha no parseable
        const etaDate = new Date(data.eta);
        const pobDate = new Date(data.pob);
        const etbDate = new Date(data.etb);
        const etcDate = new Date(data.etc);
        const etdDate = new Date(data.etd);

        if (isNaN(etaDate.getTime()) || isNaN(pobDate.getTime()) || isNaN(etbDate.getTime()) || isNaN(etcDate.getTime()) || isNaN(etdDate.getTime())) {
            return NextResponse.json(
                { error: 'Una o más fechas proporcionadas no son válidas.' },
                { status: 400 } // Bad Request
            );
        }

        const nuevoRegistroLogistica = await prisma.logisticTable.create({
            data: {
                vessel: data.vessel,
                loa: Number(data.loa), // <-- conversión a número
                operationTime: data.operationTime,
                eta: etaDate,
                pob: pobDate,
                etb: etbDate,
                etc: etcDate,
                etd: etdDate,
                cargo: data.cargo,
            }
        });
        return NextResponse.json(nuevoRegistroLogistica);
    } catch (error) {
        console.error('Error al crear el registro de logistica:', error); 
        return NextResponse.json(
            { error: 'Error al crear el registro' },
            { status: 500 }
        );
    }
    finally {
        await prisma.$disconnect();
    }
}