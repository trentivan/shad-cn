export interface User {
    id: number;
    nombre: string;
    correo: string;
    rol: 'admin' | 'colaborador' | 'externo';
    agenciaId?: number;
    contrasena: string;
    estado: 'Activo' | 'Inactivo';
    createdAt: Date;
    updatedAt: Date;
}