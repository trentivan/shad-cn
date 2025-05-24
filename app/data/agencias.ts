// data/agencias.ts
import { Agencia } from '../types/agencia';

// obtener todas las agencias
export const getAgencias = async (): Promise<Agencia[]> => {
  const res = await fetch('/api/agencias');
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener las agencias');
  }
  return res.json();
};

// obtener una agencia por ID
export const getAgencia = async (id: number): Promise<Agencia> => {
  const res = await fetch(`/api/agencias/${id}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Error al obtener la agencia con ID ${id}`);
  }
  return res.json();
};

// crear una nueva agencia
export const createAgencia = async (agenciaData: Omit<Agencia, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agencia> => {
  const res = await fetch('/api/agencias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agenciaData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear la agencia');
  }
  return res.json();
};

// actualizar una agencia existente por ID
export const updateAgencia = async (id: number, agenciaData: Partial<Agencia>): Promise<Agencia> => {
  const res = await fetch(`/api/agencias/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agenciaData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Error al actualizar la agencia con ID ${id}`);
  }
  return res.json();
};

// eliminar una agencia por ID
export const deleteAgencia = async (id: number): Promise<void> => {
  const res = await fetch(`/api/agencias/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Error al eliminar la agencia con ID ${id}`);
  }
};