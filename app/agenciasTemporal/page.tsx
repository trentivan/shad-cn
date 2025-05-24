'use client';

import { useEffect, useRef, useState } from 'react';
import { Agencia } from '../../app/types/agencia';
import { getAgencias, createAgencia, updateAgencia, deleteAgencia } from '../../app/data/agencias';
import { ListFilter } from "lucide-react";

export default function AgenciasPage() {
    const [agencias, setAgencias] = useState<Agencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreatingNewAgencia, setIsCreatingNewAgencia] = useState(false);
    const [newAgenciaData, setNewAgenciaData] = useState<Omit<Agencia, 'id' | 'createdAt' | 'updatedAt'>>({
        nombre: '',
        tipo: 'materia prima',
        telefono: '',
        correo: '',
        estado: 'Activo',
    });
    const [creationError, setCreationError] = useState<string | null>(null);

    const [isEditingAgencia, setIsEditingAgencia] = useState(false);
    const [editingAgencia, setEditingAgencia] = useState<Agencia | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [visibleColumns, setVisibleColumns] = useState({
        nombre: true,
        tipo: true,
        correo: true,
        telefono: true,
        estado: true,
    });
    const [showColumnsMenu, setShowColumnsMenu] = useState(false);
    const columnsMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {        const fetchAgencias = async () => {
            try {
                const data = await getAgencias();
                setAgencias(data);
            } catch (err: unknown) {
                setError('Error al cargar las agencias');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAgencias();
    }, []);

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

    const handleOpenNewAgenciaModal = () => {
        setIsCreatingNewAgencia(true);
        setNewAgenciaData({
            nombre: '',
            tipo: 'materia prima',
            telefono: '',
            correo: '',
            estado: 'Activo',
        });
        setCreationError(null);
    };

    const handleCloseNewAgenciaModal = () => {
        setIsCreatingNewAgencia(false);
    };

    const handleNewAgenciaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAgenciaData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCreateNewAgencia = async () => {
        setCreationError(null);        try {
            const newAgencia = await createAgencia(newAgenciaData);
            setAgencias([...agencias, newAgencia]);
            setIsCreatingNewAgencia(false);
        } catch (error: unknown) {
            console.error('Error al crear la agencia:', error);
            setCreationError('Error al crear la agencia');
        }
    };

    const handleEdit = async (agencia: Agencia) => {
        setIsEditingAgencia(true);
        setEditingAgencia(agencia);
        setUpdateError(null);
    };

    const handleCancelEditAgencia = () => {
        setIsEditingAgencia(false);
        setEditingAgencia(null);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (editingAgencia) {
            setEditingAgencia(prevAgencia => prevAgencia ? {
                ...prevAgencia,
                [name]: value,
            } : null);
        }
    };

    const handleUpdateAgencia = async () => {
        if (!editingAgencia) return;
        try {
            const updatedAgencia = await updateAgencia(editingAgencia.id, {
                nombre: editingAgencia.nombre,
                tipo: editingAgencia.tipo as 'materia prima' | 'producto terminado' | 'servicio',
                telefono: editingAgencia.telefono,
                correo: editingAgencia.correo,
                estado: editingAgencia.estado as 'Activo' | 'Inactivo',
            });            setAgencias(agencias.map(ag => ag.id === updatedAgencia.id ? updatedAgencia : ag));
            setIsEditingAgencia(false);
            setEditingAgencia(null);
        } catch (error: unknown) {
            console.error('Error al actualizar la agencia:', error);
            setUpdateError('Error al actualizar la agencia');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta agencia?')) {
            setDeleteError(null);
            try {                await deleteAgencia(id);
                setAgencias(agencias.filter(agencia => agencia.id !== id));
            } catch (error: unknown) {
                console.error('Error al eliminar la agencia:', error);
                setDeleteError('Error al eliminar la agencia');
            }
        }
    };

    const filteredAgencias = agencias.filter(agencia => {
        const search = searchTerm.toLowerCase().trim();
        return (
            agencia.nombre.toLowerCase().includes(search) ||
            agencia.tipo.toLowerCase().includes(search) ||
            agencia.correo.toLowerCase().includes(search) ||
            agencia.telefono.toLowerCase().includes(search) ||
            agencia.estado.toLowerCase().includes(search)
        );
    });

    if (loading) return (
        <div className="bg-gray-50 text-gray-600 min-h-screen flex items-center justify-center">
            <div className="text-lg font-medium">Cargando agencias...</div>
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
                {/* Modal para crear nueva agencia */}
                {isCreatingNewAgencia && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nueva Agencia</h2>
                        {creationError && <div className="text-red-500 mb-4">{creationError}</div>}
                        <form onSubmit={e => { e.preventDefault(); handleCreateNewAgencia(); }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={newAgenciaData.nombre}
                                    onChange={handleNewAgenciaInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Tipo</label>
                                <select
                                    name="tipo"
                                    value={newAgenciaData.tipo}
                                    onChange={handleNewAgenciaInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    <option value="materia prima">Materia Prima</option>
                                    <option value="producto terminado">Producto Terminado</option>
                                    <option value="servicio">Servicio</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Correo</label>
                                <input
                                    type="email"
                                    name="correo"
                                    value={newAgenciaData.correo}
                                    onChange={handleNewAgenciaInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={newAgenciaData.telefono}
                                    onChange={handleNewAgenciaInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Estado</label>
                                <select
                                    name="estado"
                                    value={newAgenciaData.estado}
                                    onChange={handleNewAgenciaInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Crear Agencia
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseNewAgenciaModal}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Modal para editar agencia */}
                {isEditingAgencia && editingAgencia && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Modificar Agencia</h2>
                        {updateError && <div className="text-red-500 mb-4">{updateError}</div>}
                        <form onSubmit={e => { e.preventDefault(); handleUpdateAgencia(); }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={editingAgencia.nombre}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Tipo</label>
                                <select
                                    name="tipo"
                                    value={editingAgencia.tipo}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    <option value="materia prima">Materia Prima</option>
                                    <option value="producto terminado">Producto Terminado</option>
                                    <option value="servicio">Servicio</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Correo</label>
                                <input
                                    type="email"
                                    name="correo"
                                    value={editingAgencia.correo}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={editingAgencia.telefono}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Estado</label>
                                <select
                                    name="estado"
                                    value={editingAgencia.estado}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Guardar Agencia
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEditAgencia}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabla de agencias */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Agencias</h1>
                        <div className="flex gap-2 items-center relative">
                            <button
                                onClick={handleOpenNewAgenciaModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                + Nueva Agencia
                            </button>
                            <input
                                type="text"
                                placeholder="Buscar agencia..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                            <div className="relative">
                                <button
                                    type="button"
                                    className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-sm flex items-center"
                                    onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                                    aria-label="Mostrar/Ocultar columnas"
                                >
                                    <ListFilter className="w-5 h-5" />
                                </button>
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
                                    {visibleColumns.tipo && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipo</th>
                                    )}
                                    {visibleColumns.correo && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Correo</th>
                                    )}
                                    {visibleColumns.telefono && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teléfono</th>
                                    )}
                                    {visibleColumns.estado && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                                    )}
                                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAgencias.map((agencia) => (
                                    <tr key={agencia.id} className={agencia.estado === 'Inactivo' ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                                        {visibleColumns.nombre && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agencia.nombre}</td>
                                        )}
                                        {visibleColumns.tipo && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{agencia.tipo}</td>
                                        )}
                                        {visibleColumns.correo && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agencia.correo}</td>
                                        )}
                                        {visibleColumns.telefono && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agencia.telefono}</td>
                                        )}
                                        {visibleColumns.estado && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    ${agencia.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {agencia.estado}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center relative">
                                            <button
                                                className="p-2 rounded-full hover:bg-gray-200"
                                                onClick={() => setMenuOpenId(menuOpenId === agencia.id ? null : agencia.id)}
                                            >
                                                <span className="text-xl">⋮</span>
                                            </button>
                                            {menuOpenId === agencia.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute top-0 right-18 mr-2 w-32 bg-white border rounded shadow-lg z-10"
                                                >
                                                    <button
                                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                        onClick={() => {
                                                            handleEdit(agencia);
                                                            setMenuOpenId(null);
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                                                        onClick={() => {
                                                            handleDelete(agencia.id);
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
        </div >
    );
}