export interface Agencia {
    id: number;
    nombre: string;
    tipo: 'materia prima' | 'producto terminado' | 'servicio';
    telefono: string;
    correo: string;
    estado: 'Activo' | 'Inactivo';
    createdAt: Date;
    updatedAt: Date;
}