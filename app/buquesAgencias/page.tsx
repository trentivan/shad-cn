'use client';

import { useEffect, useRef, useState } from 'react';
import { Buque } from '@/app/types/buque';
import { getBuques, updateBuque as apiUpdateBuque, deleteBuque as apiDeleteBuque } from '@/app/data/buque';
import { Agencia } from '@/app/types/agencia'; // Ajusta la ruta si es necesario
import { getAgencias } from '@/app/data/agencias'; // Ajusta la ruta si es necesario
import { ListFilter } from "lucide-react";

export default function BuquesPage() {
    const [buques, setBuques] = useState<Buque[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Estado para el buque que se está editando
    const [editingBuque, setEditingBuque] = useState<Buque | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const [deleteError, setDeleteError] = useState<string | null>(null);    // Estados para el formulario de nuevo buque
    const [isCreatingNewBuque, setIsCreatingNewBuque] = useState(false);
    const [newBuqueData, setNewBuqueData] = useState<{
        nombre: string;
        agenciaId: number | string; // Allow both types for form handling
        tipo: string;
        loa: number;
        estado: string;
    }>({
        nombre: '',
        agenciaId: '', // Initially empty string to force user selection
        tipo: 'materia prima', // Valor por defecto
        loa: 0,
        estado: 'Activo', // Valor por defecto
    });
    const [creationError, setCreationError] = useState<string | null>(null);

    const [agencias, setAgencias] = useState<Agencia[]>([]);

    const [searchTerm, setSearchTerm] = useState('');

    const [visibleColumns, setVisibleColumns] = useState({
        nombre: true,
        agencia: true,
        tipo: true,
        loa: true,
        estado: true,
    });
    const [showColumnsMenu, setShowColumnsMenu] = useState(false);

    useEffect(() => {
        const fetchBuques = async () => {
            try {
                const data = await getBuques();
                setBuques(data);
            } catch (err) {
                setError('Error al cargar los buques');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBuques();
    }, []);

    useEffect(() => {
        const fetchAgencias = async () => {
            try {
                const data = await getAgencias();
                setAgencias(data);
            } catch (err) {
                console.error('Error al cargar agencias', err);
            }
        };
        fetchAgencias();
    }, []);

    const handleEdit = async (buque: Buque) => {
        setEditingBuque(buque);
        setIsEditing(true);
    };

    // Maneja la actualización de un buque
    const handleUpdateBuque = async (updatedBuqueData: Partial<Buque>) => {
        if (!editingBuque) return;
        setUpdateError(null);
        try {
            const updatedBuque = await apiUpdateBuque(editingBuque.id, updatedBuqueData);
            setBuques(buques.map(buque => buque.id === updatedBuque.id ? updatedBuque : buque));
            setIsEditing(false);
            setEditingBuque(null);
        } catch (err: unknown) {
            setUpdateError('Error al actualizar el buque');
            console.error(err);
        }
    };

    // Maneja la eliminación de un buque
    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este buque?')) {
            setDeleteError(null);
            try {
                await apiDeleteBuque(id);
                setBuques(buques.filter(buque => buque.id !== id));
            } catch (err: unknown) {
                setDeleteError('Error al eliminar el buque');
                console.error(err);
            }
        }
    };    // Abre el modal para crear un nuevo buque
    const handleOpenNewBuqueModal = () => {
        setIsCreatingNewBuque(true);
        setNewBuqueData({
            nombre: '',
            agenciaId: '', // Start with empty string to force selection
            tipo: 'materia prima',
            loa: 0,
            estado: 'Activo',
        });
        setCreationError(null);
    };

    // Cierra los modales
    const handleCloseNewBuqueModal = () => {
        setIsCreatingNewBuque(false);
    };

    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const columnsMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpenId(null);
            }
        }
        if (menuOpenId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpenId]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (columnsMenuRef.current && !columnsMenuRef.current.contains(event.target as Node)) {
                setShowColumnsMenu(false);
            }
        }
        if (showColumnsMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showColumnsMenu]);

    // Cierra el modal de editar buque
    const handleCloseEditBuqueModal = () => {
        setIsEditing(false);
    };    // Maneja el cambio de datos en campos de entrada
    // para el nuevo buque
    const handleNewBuqueInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number = value;

        if (name === 'agenciaId') {
            processedValue = parseInt(value, 10); // Convierte a entero, base 10
            if (isNaN(processedValue) || value === '') {
                // If empty string or invalid number, keep it as empty string for form validation
                processedValue = '';
            }
        } else if (name === 'loa') {
            processedValue = parseFloat(value) || 0;
        }
        
        setNewBuqueData(prevData => ({
            ...prevData,
            [name]: processedValue,
        }));
    };    // Maneja el cambio de datos en campos de entrada
    // para el buque que se está editando
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number | undefined = value;

        if (name === 'agenciaId') {
            processedValue = parseInt(value, 10);
            if (isNaN(processedValue)) {
                processedValue = undefined;
            }
        }
        setEditingBuque(prevData => prevData ? {
            ...prevData,
            [name]: processedValue,
        } : prevData);
    };    // Maneja la creación de un nuevo buque
    const handleCreateNewBuque = async () => {
        setCreationError(null);
          // Client-side validation
        if (!newBuqueData.nombre.trim()) {
            setCreationError('El nombre del buque es obligatorio');
            return;
        }
        
        if (!newBuqueData.agenciaId || newBuqueData.agenciaId === '' || (typeof newBuqueData.agenciaId === 'number' && newBuqueData.agenciaId <= 0)) {
            setCreationError('Debe seleccionar una agencia');
            return;
        }
        
        if (!newBuqueData.loa || newBuqueData.loa <= 0) {
            setCreationError('La eslora (LOA) debe ser mayor a 0');
            return;
        }
        
        try {
            const response = await fetch('/api/buques', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBuqueData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al crear el buque');
            }
            
            // cierra el modal            setBuques([...buques, newBuque]);
            setIsCreatingNewBuque(false);
        } catch (error: unknown) {
            console.error('Error al crear el buque:', error);
            setCreationError(error instanceof Error ? error.message : 'Error al crear el buque');
        }
    };

    const getAgenciaNombre = (agenciaId: number) => {
        const agencia = agencias.find(a => a.id === agenciaId);
        return agencia ? agencia.nombre : 'Sin agencia';
    };

    const filteredBuques = buques.filter(buque => {
        const search = searchTerm.toLowerCase().trim();
        return (
            buque.nombre.toLowerCase().includes(search) ||
            getAgenciaNombre(buque.agenciaId).toLowerCase().includes(search) ||
            buque.tipo.toLowerCase().includes(search) ||
            String(buque.loa).toLowerCase().includes(search) ||
            (buque.estado.toLowerCase().trim().includes(search))
        );
    });

    if (loading) return (
        <div className="bg-gray-50 text-gray-600 min-h-screen flex items-center justify-center">
            <div className="text-lg font-medium">Cargando buques...</div>
        </div>
    );

    if (error) return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-red-500 text-lg font-medium">{error}</div>
        </div>
    );

    return (
        <div className='bg-gray-200 min-h-screen flex justify-center'>
            <div className="container mx-auto p-6">

                {/* Modal para crear nuevo buque */}
                {isCreatingNewBuque && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Buque</h2>
                        {creationError && <div className="text-red-500 mb-4">{creationError}</div>}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateNewBuque();
                        }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={newBuqueData.nombre}
                                    onChange={handleNewBuqueInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                            </div>                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Agencia</label>
                                <select
                                    name="agenciaId"
                                    value={newBuqueData.agenciaId}
                                    onChange={handleNewBuqueInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    <option value="" disabled>Selecciona una agencia</option>
                                    {agencias.map((agencia) => (
                                        <option key={agencia.id} value={agencia.id}>
                                            {agencia.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Tipo de Buque</label>
                                <select
                                    name="tipo"
                                    value={newBuqueData.tipo}
                                    onChange={handleNewBuqueInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="materia prima">Materia Prima</option>
                                    <option value="producto terminado">Producto Terminado</option>
                                    <option value="servicio">Servicio</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">LOA</label>
                                <input
                                    type="number"
                                    name="loa"
                                    value={newBuqueData.loa}
                                    onChange={handleNewBuqueInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Estado</label>
                                <select
                                    name="estado"
                                    value={newBuqueData.estado}
                                    onChange={handleNewBuqueInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Crear Buque
                                </button>
                                <button type="button" onClick={handleCloseNewBuqueModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Modal para editar buque */}
                {isEditing && editingBuque && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Modificar Usuario</h2>
                        {creationError && <div className="text-red-500 mb-4">{creationError}</div>}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (editingBuque) handleUpdateBuque(editingBuque);
                        }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={editingBuque.nombre}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Agencia</label>
                                <select
                                    name="agenciaId"
                                    value={editingBuque.agenciaId ?? ''}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    <option value="" disabled>Selecciona una agencia</option>
                                    {agencias.map((agencia) => (
                                        <option key={agencia.id} value={agencia.id}>
                                            {agencia.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Tipo de Buque</label>
                                <select
                                    name="tipo"
                                    value={editingBuque.tipo}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="materia prima">Materia Prima</option>
                                    <option value="producto terminado">Producto Terminado</option>
                                    <option value="servicio">Servicio</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">LOA</label>
                                <input
                                    type="number"
                                    name="loa"
                                    value={editingBuque.loa}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Estado</label>
                                <select
                                    name="estado"
                                    value={editingBuque.estado}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Modificar Usuario
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseEditBuqueModal}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabla de buques */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Buques</h1>
                        <div className="flex gap-2 items-center relative">
                            <button onClick={handleOpenNewBuqueModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                + Nuevo Buque
                            </button>
                            <input
                                type="text"
                                placeholder="Buscar buque..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                            <div className="relative">
                                {showColumnsMenu && (
                                    <div
                                        ref={columnsMenuRef}
                                        className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-20 p-4"
                                    >
                                        {(() => {
                                            const activeColumns = Object.values(visibleColumns).filter(Boolean).length;
                                            return Object.entries(visibleColumns).map(([key, value]) => (
                                                <label key={key} className="flex items-center space-x-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={value}
                                                        disabled={value && activeColumns === 1}
                                                        onChange={() =>
                                                            setVisibleColumns(cols => ({
                                                                ...cols,
                                                                [key]: !cols[key as keyof typeof cols],
                                                            }))
                                                        }
                                                    />
                                                    <span className="capitalize">{key}</span>
                                                </label>
                                            ));
                                        })()}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-sm flex items-center"
                                    onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                                    aria-label="Mostrar/Ocultar columnas"
                                >
                                    <ListFilter className="w-5 h-5" />
                                </button>
                                
                            </div>
                        </div>
                    </div>

                    {updateError && <div className="text-red-500 mb-4">{updateError}</div>}
                    {deleteError && <div className="text-red-500 mb-4">{deleteError}</div>}

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    {visibleColumns.nombre && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nombre</th>
                                    )}
                                    {visibleColumns.agencia && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Agencia ID</th>
                                    )}
                                    {visibleColumns.tipo && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipo</th>
                                    )}
                                    {visibleColumns.loa && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">LOA</th>
                                    )}
                                    {visibleColumns.estado && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                                    )}
                                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBuques.map((buque) => (
                                    <tr key={buque.id} className={buque.estado === 'Inactivo' ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                                        {visibleColumns.nombre && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{buque.nombre}</td>
                                        )}
                                        {visibleColumns.agencia && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getAgenciaNombre(buque.agenciaId)}
                                            </td>
                                        )}
                                        {visibleColumns.tipo && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{buque.tipo}</td>
                                        )}
                                        {visibleColumns.loa && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{buque.loa}</td>
                                        )}
                                        {visibleColumns.estado && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    ${buque.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {buque.estado}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center relative">
                                            <button
                                                className="p-2 rounded-full hover:bg-gray-200"
                                                onClick={() => setMenuOpenId(menuOpenId === buque.id ? null : buque.id)}
                                            >
                                                <span className="text-xl">⋮</span>
                                            </button>
                                            {menuOpenId === buque.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute top-0 right-18 mr-2 w-32 bg-white border rounded shadow-lg z-10"
                                                >
                                                    <button
                                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                        onClick={() => {
                                                            handleEdit(buque);
                                                            setMenuOpenId(null);
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                                                        onClick={() => {
                                                            handleDelete(buque.id);
                                                            setMenuOpenId(null);
                                                        }}
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