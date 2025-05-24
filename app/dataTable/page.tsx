'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getRegisters } from '../../app/data/tablaDeLogistica';
import { tablaDeLogistica } from '@/app/types/tablaDeLogistica';
import { Buque } from '@/app/types/buque'; // Ajusta la ruta si es necesario
import { getBuques } from '@/app/data/buque'; // Ajusta la ruta si es necesario

function convertirFechaHora(fechaHoraString: string): Date {
    const [fechaParte, horaParte] = fechaHoraString.split(' ');
    const [diaStr, mesStr] = fechaParte.split('/');
    const [horaStr, minutoStr] = horaParte.split(':');

    const dia = parseInt(diaStr, 10);
    const mes = parseInt(mesStr, 10) - 1; // Restar 1 porque los meses en JavaScript son 0-indexados
    const hora = parseInt(horaStr, 10);
    const minuto = parseInt(minutoStr, 10);
    const anio = new Date().getFullYear(); // Obtener el año actual

    return new Date(anio, mes, dia, hora, minuto);
}

function formatearFechaParaUsuario(date: Date): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // Sumamos 1 porque getMonth() es 0-indexado
    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');

    return `${dia}/${mes} ${hora}:${minuto}`;
}

export default function DataTable() {
    const [registros, setRegistros] = useState<tablaDeLogistica[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [buques, setBuques] = useState<Buque[]>([]);

    // Estados para el formulario de nuevo usuario
    const [isCreatingNewRegister, setIsCreatingNewRegister] = useState(false);
    const [newRegistro, setNewRegistro] = useState<Omit<tablaDeLogistica, 'id' | 'createdAt' | 'updatedAt'>>({
        vessel: '',
        loa: 0,
        operationTime: '',
        eta: '',
        pob: '',
        etb: '',
        etc: '',
        etd: '',
        cargo: ''
    });
    const [creationError, setCreationError] = useState<string | null>(null);

    const handleOpenNewRegistroModal = () => {
        setIsCreatingNewRegister(true);
        setNewRegistro({ // Resetea el formulario al abrirlo
            vessel: '',
            loa: 0,
            operationTime: '',
            eta: '',
            pob: '',
            etb: '',
            etc: '',
            etd: '',
            cargo: '',
        });
        setCreationError(null);
    };

    const handleNewRegistroInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewRegistro(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCreateNewRegister = async () => {
        setCreationError(null);
        try {
            // Convertir las strings de fecha/hora a objetos Date antes de enviar
            const dataToSend = {
                ...newRegistro,
                loa: Number(newRegistro.loa), // Asegura que sea un número
                eta: convertirFechaHora(newRegistro.eta),
                pob: convertirFechaHora(newRegistro.pob),
                etb: convertirFechaHora(newRegistro.etb),
                etc: convertirFechaHora(newRegistro.etc),
                etd: convertirFechaHora(newRegistro.etd),
            };

            
            if (registros.some(r => r.vessel === newRegistro.vessel)) {
                setCreationError('Este buque ya está registrado en la tabla.');
                return;
            }

            const response = await fetch('/api/tablaDeLogistica', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setCreationError(errorData.error || 'Error al crear registro');
                return;
            }

            const newRegistroData = await response.json();

            // Ordena los registros por ETA (de menor a mayor)
            setRegistros(prevRegistros => {
                const nuevosRegistros = [...prevRegistros, newRegistroData];
                return nuevosRegistros.sort((a, b) => {
                    const fechaA = new Date(a.eta).getTime();
                    const fechaB = new Date(b.eta).getTime();
                    return fechaA - fechaB;
                });
            });

            setIsCreatingNewRegister(false);
        } catch (error: any) {
            console.error('Error al crear registro:', error);
            setCreationError('Error al crear registro');
        }
    };

    const handleCloseNewUserModal = () => {
        setIsCreatingNewRegister(false);
    };

    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

    // Ejemplo de handlers (debes implementar la lógica real)
    const handleEdit = (registro: tablaDeLogistica) => {
        // Tu lógica para editar
        setMenuOpenId(null);
    };
    
    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
            setError(null);
            try {
                const response = await fetch(`/api/tablaDeLogistica/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Error al eliminar el registro');
                }
                setRegistros(registros.filter(registro => registro.id !== id));
            } catch (err: any) {
                setError('Error al eliminar el registro');
                console.error(err);
            } finally {
                setMenuOpenId(null);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getRegisters();
                // Ordenar por ETA de menor a mayor
                data.sort((a, b) => {
                    const fechaA = new Date(a.eta).getTime();
                    const fechaB = new Date(b.eta).getTime();
                    return fechaA - fechaB;
                });
                setRegistros(data);
            } catch (error) {
                setError('Error al cargar los registros');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchBuques = async () => {
            try {
                const data = await getBuques();
                setBuques(data);
            } catch (err) {
                console.error('Error al cargar buques', err);
            }
        };
        fetchBuques();
    }, []);

    const buquesRegistrados = registros.map(r => r.vessel);

    if (loading) {
        return (
            <div className="bg-gray-50 text-gray-600 min-h-screen flex items-center justify-center">
                <div className="text-lg font-medium">Cargando registros...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-red-500 text-lg font-medium">{error}</div>
            </div>
        );
    }

    return (
        <div className='bg-gray-200 min-h-screen flex justify-center'>
            <div className="container mx-auto p-6">
                {/* Formulario para crear nuevo usuario */}
                {isCreatingNewRegister && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Usuario</h2>
                        {creationError && <div className="text-red-500 mb-4">{creationError}</div>}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateNewRegister();
                        }}>
                            <div className="mb-4">
                                <label htmlFor="vessel" className="block text-gray-700 text-sm font-bold mb-2">Vessel</label>
                                <select
                                    name="vessel"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRegistro.vessel}
                                    onChange={handleNewRegistroInputChange}
                                    required
                                >
                                    <option value="" disabled>Selecciona un buque</option>
                                    {buques
                                        .filter(buque => !buquesRegistrados.includes(buque.nombre))
                                        .map((buque) => (
                                            <option key={buque.id} value={buque.nombre}>
                                                {buque.nombre}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="loa" className="block text-gray-700 text-sm font-bold mb-2">LOA</label>
                                <input
                                    type="number"
                                    name="loa"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRegistro.loa}
                                    onChange={handleNewRegistroInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="contrasena" className="block text-gray-700 text-sm font-bold mb-2">Operation time</label>
                                <input
                                    type="text"
                                    name="operationTime"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRegistro.operationTime}
                                    onChange={handleNewRegistroInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="rol" className="block text-gray-700 text-sm font-bold mb-2">ETA</label>
                                <input
                                    type="text"
                                    name="eta"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRegistro.eta}
                                    onChange={handleNewRegistroInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="agenciaId" className="block text-gray-700 text-sm font-bold mb-2">POB</label>
                                <input
                                    type="text"
                                    name="pob"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRegistro.pob}
                                    onChange={handleNewRegistroInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">ETB</label>
                                <input
                                    type="text"
                                    name="etb"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRegistro.etb}
                                    onChange={handleNewRegistroInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">ETC</label>
                                <input
                                    type="text"
                                    name="etc"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRegistro.etc}
                                    onChange={handleNewRegistroInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">ETD</label>
                                <input
                                    type="text"
                                    name="etd"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRegistro.etd}
                                    onChange={handleNewRegistroInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">Cargo</label>
                                <input
                                    type="text"
                                    name="cargo"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRegistro.cargo}
                                    onChange={handleNewRegistroInputChange}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Crear Registro
                                </button>
                                <button type="button" onClick={handleCloseNewUserModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabla de logistica */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Logistica</h1>
                        <button onClick={handleOpenNewRegistroModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                            + Nuevo Registro
                        </button>
                    </div>



                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-200" style={{ width: '250px' }}>
                            <thead className="bg-gray-100 text-center">
                                <tr className="text-center">
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase  ">VESSEL</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">LOA</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">OPERATION TIME</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">ETA</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">POB</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">ETB</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">ETC</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">ETD</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">CARGO</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {registros.map((registro) => (
                                    <tr className='text-center' key={registro.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{registro.vessel}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.loa}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.operationTime}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.eta ? format(registro.eta, 'dd/MM HH:mm') : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.pob ? format(registro.pob, 'dd/MM HH:mm') : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.etb ? format(registro.etb, 'dd/MM HH:mm') : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.etc ? format(registro.etc, 'dd/MM HH:mm') : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.etd ? format(registro.etd, 'dd/MM HH:mm') : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.cargo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                                            <button
                                                className="p-2 rounded-full hover:bg-gray-200"
                                                onClick={() => setMenuOpenId(menuOpenId === registro.id ? null : registro.id)}
                                            >
                                                <span className="text-xl">⋮</span>
                                            </button>
                                            {menuOpenId === registro.id && (
                                                <div className="absolute top-0 right-18 w-32 bg-white border rounded shadow-lg z-10">
                                                    <button
                                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                        onClick={() => handleEdit(registro)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                                                        onClick={() => handleDelete(registro.id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}