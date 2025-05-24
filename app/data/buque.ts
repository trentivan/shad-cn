
import { Buque } from "../types/buque";

// obtener todos los buques
export const getBuques = async (): Promise<Buque[]> => {
  const res = await fetch("/api/buques");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al obtener los buques");
  }
  return res.json();
};

// obtener un buque por ID
export const getBuque = async (id: number): Promise<Buque> => {
  const res = await fetch(`/api/buques/${id}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Error al obtener el buque con ID ${id}`);
  }
  return res.json();
};

// crear un nuevo buque
export const createBuque = async (
  buqueData: Omit<Buque, "id" | "createdAt" | "updatedAt">
): Promise<Buque> => {
  const res = await fetch("/api/buques", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buqueData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al crear el buque");
  }
  return res.json();
};

// actualizar un buque existente por ID
export const updateBuque = async (
  id: number,
  buqueData: Partial<Buque>
): Promise<Buque> => {
  const res = await fetch(`/api/buques/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buqueData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Error al actualizar el buque con ID ${id}`);
  }
  return res.json();
};

// eliminar un buque por ID
export const deleteBuque = async (id: number): Promise<void> => {
  const res = await fetch(`/api/buques/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Error al eliminar el buque con ID ${id}`);
  }
};