'use client';

import { useEffect, useRef, useState } from 'react';
import { User } from '../../app/types/usuarios';
import { Agencia } from '@/app/types/agencia';
import { getUsers, updateUser as apiUpdateUser, deleteUser as apiDeleteUser } from '../../app/data/usuarios';
import { getAgencias } from '@/app/data/agencias';
import { ListFilter } from "lucide-react"; // Asegúrate de tener este import

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [agencias, setAgencias] = useState<Agencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Estado para el usuario que se está editando
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [isEditingUser, setIsEditingUser] = useState(false);

    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Estados para el formulario de nuevo usuario
    const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);
    const [newUserData, setNewUserData] = useState<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>({
        nombre: '',
        correo: '',
        rol: 'colaborador', // Valor por defecto
        agenciaId: undefined,
        contrasena: '',
        estado: 'Activo', // Valor por defecto
    });
    const [creationError, setCreationError] = useState<string | null>(null);

    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    const [visibleColumns, setVisibleColumns] = useState({
        nombre: true,
        correo: true,
        rol: true,
        agencia: true,
        estado: true,
    });
    const [showColumnsMenu, setShowColumnsMenu] = useState(false);
    const columnsMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                // Normaliza agenciaId a número
                setUsers(data.map(user => ({
                    ...user,
                    agenciaId: user.agenciaId ? Number(user.agenciaId) : undefined,
                })));
            } catch (err) {
                setError('Error al cargar los usuarios');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
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

    // Maneja la edición de un usuario
    // Verifica si el usuario está editando y actualiza el estado
    const handleEdit = async (user: User) => {
        try {
            const response = await fetch(`/api/users/${user.id}`);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al cargar datos del usuario para editar:', errorData);
                return;
            }
            const userData = await response.json();
            setEditingUser(userData);
            setIsEditing(true);
        } catch (error) {
            console.error('Error al cargar datos del usuario para editar:', error);
        }
    };

    // Maneja la actualización de un usuario
    // Verifica si el usuario está editando y actualiza el estado
    const handleUpdateUser = async (updatedUserData: Partial<User>) => {
        if (!editingUser) return;
        setUpdateError(null);
        try {
            const updatedUser = await apiUpdateUser(editingUser.id, updatedUserData);
            setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
            setIsEditing(false);
            setEditingUser(null);
        } catch (err: any) {
            setUpdateError('Error al actualizar el usuario');
            console.error(err);
        }
    };

    // Maneja la eliminación de un usuario
    // Confirma la eliminación y actualiza el estado
    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            setDeleteError(null);
            try {
                await apiDeleteUser(id);
                setUsers(users.filter(user => user.id !== id));
            } catch (err: any) {
                setDeleteError('Error al eliminar el usuario');
                console.error(err);
            }
        }
    };

    // Abre el modal para crear un nuevo usuario
    // y limpia los datos del nuevo usuario
    const handleOpenNewUserModal = () => {
        setIsCreatingNewUser(true);
        setNewUserData({
            nombre: '',
            correo: '',
            rol: 'colaborador',
            agenciaId: undefined,
            contrasena: '',
            estado: 'Activo',
        });
        setCreationError(null);
    };

    // Cierra los modales 
    // cierra el modal de crear nuevo usuario
    // y limpia los datos del nuevo usuario
    const handleCloseNewUserModal = () => {
        setIsCreatingNewUser(false);
    };

    // Cierra el modal de editar usuario
    // y limpia los datos del usuario que se está editando
    const handleCloseEditUserModal = () => {
        setIsEditing(false);
    };

    // Maneja el cambio de datos en campos de entrada
    // para el nuevo usuario
    const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: any = value;
        if (name === 'agenciaId') {
            processedValue = value === '' ? undefined : Number(value);
        }
        setNewUserData(prevData => ({
            ...prevData,
            [name]: processedValue,
        }));
    };

    // Maneja el cambio de datos en campos de entrada
    // para el usuario que se está editando
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: any = value;
        if (name === 'agenciaId') {
            processedValue = value === '' ? undefined : Number(value);
        }
        if (editingUser) {
            setEditingUser(prevUser => prevUser ? {
                ...prevUser,
                [name]: processedValue,
            } : null);
        }
    };

    // Maneja la creación de un nuevo usuario
    const handleCreateNewUser = async () => {
        setCreationError(null);
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setCreationError(errorData.message || 'Error al crear el usuario');
                return;
            }

            const newUser = await response.json();
            setUsers([...users, newUser]);
            setIsCreatingNewUser(false);
        } catch (error: any) {
            console.error('Error al crear el usuario:', error);
            setCreationError('Error al crear el usuario');
        }
    };

    const getAgenciaNombre = (agenciaId: number | undefined) => {
        if (!agenciaId) return '-';
        const agencia = agencias.find(a => a.id === agenciaId);
        return agencia ? agencia.nombre : '-';
    };

    const filteredUsers = users.filter(user => {
        const search = searchTerm.toLowerCase();
        return (
            user.nombre.toLowerCase().includes(search) ||
            user.correo.toLowerCase().includes(search) ||
            user.rol.toLowerCase().includes(search) ||
            (user.agenciaId && getAgenciaNombre(user.agenciaId).toLowerCase().includes(search)) ||
            user.estado.toLowerCase().includes(search)
        );
    });

    if (loading) return (
        <div className="bg-gray-50 text-gray-600 min-h-screen flex items-center justify-center">
            <div className="text-lg font-medium">Cargando usuarios...</div>
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
                {/* Formulario para crear nuevo usuario */}
                {isCreatingNewUser && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Usuario</h2>
                        {creationError && <div className="text-red-500 mb-4">{creationError}</div>}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateNewUser();
                        }}>
                            <div className="mb-4">
                                <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
                                <input type="text" id="nombre" name="nombre" value={newUserData.nombre} onChange={handleNewUserInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="correo" className="block text-gray-700 text-sm font-bold mb-2">Correo:</label>
                                <input type="email" id="correo" name="correo" value={newUserData.correo} onChange={handleNewUserInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="contrasena" className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
                                <input type="password" id="contrasena" name="contrasena" value={newUserData.contrasena} onChange={handleNewUserInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="rol" className="block text-gray-700 text-sm font-bold mb-2">Rol:</label>
                                <select id="rol" name="rol" value={newUserData.rol} onChange={handleNewUserInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="colaborador">Colaborador</option>
                                    <option value="admin">Admin</option>
                                    <option value="externo">Externo</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="agenciaId" className="block text-gray-700 text-sm font-bold mb-2">Agencia:</label>
                                <select
                                    id="agenciaId"
                                    name="agenciaId"
                                    value={newUserData.agenciaId ?? ''}
                                    onChange={handleNewUserInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                                <label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">Estado:</label>
                                <select id="estado" name="estado" value={newUserData.estado} onChange={handleNewUserInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Crear Usuario
                                </button>
                                <button type="button" onClick={handleCloseNewUserModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Formulario para editar usuario */}
                {isEditing && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Modificar Usuario</h2>
                        {creationError && <div className="text-red-500 mb-4">{creationError}</div>}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (editingUser) handleUpdateUser(editingUser);
                        }}>
                            <div className="mb-4">
                                <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
                                <input 
                                    type="text" 
                                    id="nombre" 
                                    name="nombre" 
                                    value={editingUser?.nombre} 
                                    onChange={handleEditInputChange} 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="correo" className="block text-gray-700 text-sm font-bold mb-2">Correo:</label>
                                <input 
                                    type="email" 
                                    id="correo" 
                                    name="correo" 
                                    value={editingUser?.correo} 
                                    onChange={handleEditInputChange} 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="contrasena" className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
                                <input 
                                    type="password" 
                                    id="contrasena" 
                                    name="contrasena" 
                                    value={editingUser?.contrasena} 
                                    onChange={handleEditInputChange} 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="rol" className="block text-gray-700 text-sm font-bold mb-2">Rol:</label>
                                <select 
                                    id="rol" 
                                    name="rol" 
                                    value={editingUser?.rol} 
                                    onChange={handleEditInputChange} 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    
                                    <option value="colaborador">Colaborador</option>
                                    <option value="admin">Admin</option>
                                    <option value="externo">Externo</option>
                                
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="agenciaId" className="block text-gray-700 text-sm font-bold mb-2">Agencia:</label>
                                <select
                                    id="agenciaId"
                                    name="agenciaId"
                                    value={editingUser?.agenciaId ?? ''}
                                    onChange={handleEditInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                                <label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">Estado:</label>
                                <select 
                                    id="estado" 
                                    name="estado" 
                                    value={editingUser?.estado} 
                                    onChange={handleEditInputChange} 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    
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
                                    onClick={handleCloseEditUserModal} 
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}                
                
                {/* Tabla de usuarios */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
                        <div className="flex gap-2 items-center relative">
                            <button onClick={handleOpenNewUserModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                + Nuevo Usuario
                            </button>
                            <input
                                type="text"
                                placeholder="Buscar usuario..."
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
                                    {visibleColumns.correo && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Correo</th>
                                    )}
                                    {visibleColumns.rol && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rol</th>
                                    )}
                                    {visibleColumns.agencia && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Agencia ID</th>
                                    )}
                                    {visibleColumns.estado && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                                    )}
                                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className={user.estado === 'Inactivo' ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                                        {visibleColumns.nombre && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nombre}</td>
                                        )}
                                        {visibleColumns.correo && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.correo}</td>
                                        )}
                                        {visibleColumns.rol && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.rol}</td>
                                        )}
                                        {visibleColumns.agencia && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getAgenciaNombre(user.agenciaId)}
                                            </td>
                                        )}
                                        {visibleColumns.estado && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    ${user.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.estado}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center relative">
                                            <button
                                                className="p-2 rounded-full hover:bg-gray-200"
                                                onClick={() => setMenuOpenId(menuOpenId === user.id ? null : user.id)}
                                            >
                                                <span className="text-xl">⋮</span>
                                            </button>
                                            {menuOpenId === user.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute top-0 right-18 mr-2 w-32 bg-white border rounded shadow-lg z-10"
                                                >
                                                    <button
                                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                        onClick={() => {
                                                            handleEdit(user);
                                                            setMenuOpenId(null);
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                                                        onClick={() => {
                                                            handleDelete(user.id);
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