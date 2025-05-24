import { User } from "../types/usuarios";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtiene todos los usuarios desde la base de datos
export const getUsers = async (): Promise<User[]> => {
    const users = await prisma.user.findMany();
    return users.map(u => ({
        ...u,
        rol: u.rol as "admin" | "colaborador" | "externo",
        agenciaId: u.agenciaId === null ? undefined : u.agenciaId,
        estado: u.estado as "Activo" | "Inactivo",
    }));
};

// Busca usuario por correo y contraseña en la base de datos
export const findUserByCorreoYContrasena = async (correo: string, contrasena: string) => {
    return await prisma.user.findFirst({
        where: {
            correo,
            contrasena,
        },
    });
};