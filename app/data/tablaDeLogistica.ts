import { tablaDeLogistica } from "../types/tablaDeLogistica";



// Función para obtener usuarios (simula una API)
export const getRegisters = async (): Promise<tablaDeLogistica[]> => {
    try {
        const response = await fetch('/api/tablaDeLogistica'); // Para la 'pages' router
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener datos');
        }        const data: tablaDeLogistica[] = await response.json();
        return data.map((register: tablaDeLogistica) => ({
            id: register.id,
            vessel: register.vessel,
            loa: register.loa,
            operationTime: register.operationTime,
            eta: register.eta,
            pob: register.pob,
            etb: register.etb,
            etc: register.etc,
            etd: register.etd,
            cargo: register.cargo,
            createdAt: register.createdAt,
            updatedAt: register.updatedAt,        }));
    } catch (error: unknown) {
        console.error('Error fetching users:', error instanceof Error ? error.message : 'Unknown error');
        throw new Error('Error al obtener usuarios');
    }
};

