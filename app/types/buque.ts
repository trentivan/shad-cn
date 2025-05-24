export interface Buque {
    id: number;
    nombre: string;
    agenciaId: number;
    tipo: 'materia prima' | 'producto terminado' | 'servicio';
    loa: number; // Length Overall
    estado: 'Activo' | 'Inactivo';
    createdAt: Date;
    updatedAt: Date;
}