import { User } from "../types/usuarios";

// Función para obtener usuarios (simula una API)
export const getUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch('/api/users'); // Para la 'pages' router
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener usuarios');
        }        const data: User[] = await response.json();
        return data.map((user: User) => ({
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            rol: user.rol,
            contrasena: user.contrasena,
            estado: user.estado,
            agenciaId: user.agenciaId, 
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),        }));
    } catch (error: unknown) {
        console.error('Error fetching users:', error instanceof Error ? error.message : 'Unknown error');
        throw new Error('Error al obtener usuarios');
    }
};

export const updateUser = async (userId: number, userData: Partial<User>) => {
    const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    if(!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el usuario');
    }
    const data = await response.json();
    return data;
};

export const deleteUser = async (userId: number) => {
    const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
    });
    if(!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar el usuario');
    }
    return response.json();
};

export const findUserByCorreoYContrasena = async (correo: string, contrasena: string) => {
    const users = await getUsers();
    return users.find(u => u.correo === correo && u.contrasena === contrasena);
};