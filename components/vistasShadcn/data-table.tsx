'use client';

import { useEffect, useRef, useState } from 'react';
import { getRegisters } from '../../app/data/tablaDeLogistica';
import { tablaDeLogistica } from '@/app/types/tablaDeLogistica';
import { Buque } from '@/app/types/buque'; // Ajusta la ruta si es necesario
import { getBuques } from '@/app/data/buque'; // Ajusta la ruta si es necesario

function convertirFechaHora(fechaHoraString: string): Date {
    if (!fechaHoraString || typeof fechaHoraString !== 'string') {
        throw new Error('Fecha/hora inválida');
    }
    // Si es formato ISO, retorna el Date directamente
    if (fechaHoraString.includes('T')) {
        return new Date(fechaHoraString);
    }
    // Si es formato dd/MM hh:mm
    if (fechaHoraString.includes(' ')) {
        const [fechaParte, horaParte] = fechaHoraString.split(' ');
        if (!fechaParte || !horaParte || !fechaParte.includes('/') || !horaParte.includes(':')) {
            throw new Error('Fecha/hora inválida');
        }
        const [diaStr, mesStr] = fechaParte.split('/');
        const [horaStr, minutoStr] = horaParte.split(':');
        const dia = parseInt(diaStr, 10);
        const mes = parseInt(mesStr, 10) - 1;
        const hora = parseInt(horaStr, 10);
        const minuto = parseInt(minutoStr, 10);
        const anio = new Date().getFullYear();
        return new Date(anio, mes, dia, hora, minuto);
    }
    throw new Error('Formato de fecha/hora no soportado');
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

    // 1. Estado para el modal de edición y el registro a editar
    const [isEditing, setIsEditing] = useState(false);
    const [registroEdit, setRegistroEdit] = useState<Omit<tablaDeLogistica, 'createdAt' | 'updatedAt'>>({
        id: 0,
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

    const [actualizando, setActualizando] = useState(false);

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
            let registroParaCrear = { ...newRegistro };

            // Si ya hay registros, calcula automáticamente los campos
            if (registros.length > 0) {
                // Busca el registro anterior cuyo ETA sea menor al ETA del nuevo registro
                const etaNueva = convertirFechaHora(registroParaCrear.eta);
                const registrosOrdenados = [...registros].sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());
                const registroAnterior = [...registrosOrdenados]
                    .reverse()
                    .find(r => convertirFechaHora(r.eta) < etaNueva);

                if (registroAnterior && registroAnterior.etd && registroParaCrear.eta) {
                    const etaActualDate = convertirFechaHora(registroParaCrear.eta);
                    const etdAnteriorDate = convertirFechaHora(registroAnterior.etd);
                    const formatDate = (d: Date) =>
                        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

                    if (etaActualDate < etdAnteriorDate) {
                        // Caso 1: ETA < ETD anterior → POB = ETD anterior + 1h
                        const pobDate = sumarHoras(etdAnteriorDate, 1);
                        registroParaCrear.pob = formatDate(pobDate);
                    } else {
                        // Caso 2: ETA >= ETD anterior → POB = ETA + 1h
                        const pobDate = sumarHoras(etaActualDate, 1);
                        registroParaCrear.pob = formatDate(pobDate);
                    }
                } else if (registroParaCrear.eta) {
                    // Si no hay registro anterior, POB = ETA + 1h
                    const etaActualDate = convertirFechaHora(registroParaCrear.eta);
                    const pobDate = sumarHoras(etaActualDate, 1);
                    const formatDate = (d: Date) =>
                        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    registroParaCrear.pob = formatDate(pobDate);
                }

                // Calcula el resto de campos automáticamente
                if (registroParaCrear.eta && registroParaCrear.operationTime) {
                    const recalculado = recalcularCampos({ id: 0, ...registroParaCrear });
                    registroParaCrear = {
                        ...registroParaCrear,
                        ...recalculado,
                        eta: registroParaCrear.eta || '',
                        pob: recalculado.pob || registroParaCrear.pob,
                        etb: recalculado.etb || '',
                        etc: recalculado.etc || '',
                        etd: recalculado.etd || '',
                    };
                }
            }

            const dataToSend = {
                ...registroParaCrear,
                loa: Number(registroParaCrear.loa),
                eta: registroParaCrear.eta ? toISOIfNeeded(registroParaCrear.eta) : null,
                pob: registroParaCrear.pob ? toISOIfNeeded(registroParaCrear.pob) : null,
                etb: registroParaCrear.etb ? toISOIfNeeded(registroParaCrear.etb) : null,
                etc: registroParaCrear.etc ? toISOIfNeeded(registroParaCrear.etc) : null,
                etd: registroParaCrear.etd ? toISOIfNeeded(registroParaCrear.etd) : null,
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

            // 1. Actualiza el estado local
            const nuevosRegistros = [...registros, newRegistroData].sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());
            setRegistros(nuevosRegistros);

            // 2. Recalcula todos los registros (pasa -1 como idEditado)
            await actualizarTodosLosRegistros(-1, nuevosRegistros);

            // 3. Vuelve a cargar los registros para reflejar todos los cambios
            const datosActualizados = await getRegisters();
            datosActualizados.sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());
            setRegistros(datosActualizados);
            setUltimaModificacion(new Date());
        } catch (error: unknown) {
            console.error('Error al crear registro:', error);
            setCreationError('Error al crear registro');
        }
    };

    const handleCloseNewUserModal = () => {
        setIsCreatingNewRegister(false);
    }; const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

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

    // Ejemplo de handlers (debes implementar la lógica real)
    const handleEdit = (registro: tablaDeLogistica) => {
        setRegistroEdit({
            ...registro,
            eta: registro.eta ? formatearFechaParaUsuario(new Date(registro.eta)) : '',
            pob: registro.pob ? formatearFechaParaUsuario(new Date(registro.pob)) : '',
            etb: registro.etb ? formatearFechaParaUsuario(new Date(registro.etb)) : '',
            etc: registro.etc ? formatearFechaParaUsuario(new Date(registro.etc)) : '',
            etd: registro.etd ? formatearFechaParaUsuario(new Date(registro.etd)) : '',
        });
        setIsEditing(true);
        setMenuOpenId(null);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRegistroEdit(prev => {
            const actualizado = { ...prev, [name]: value };
            // Recalcula todos los campos dependientes al cambiar cualquier campo
            return recalcularCampos(actualizado);
        });
    };

    // Función para actualizar todos los registros (excepto el editado)
    const actualizarTodosLosRegistros = async (idEditado: number, registrosActualizados?: tablaDeLogistica[]) => {
        setActualizando(true);
        // Ordena los registros por ETA antes de recalcular
        let registrosParaUsar = (registrosActualizados || registros).slice().sort(
            (a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime()
        );

        // 1. Recalcula todos los registros en memoria
        let recalculados: tablaDeLogistica[] = [];
        for (let i = 0; i < registrosParaUsar.length; i++) {
            const registro = registrosParaUsar[i];
            let registroActualizado = { ...registro };
            const formatDate = (d: Date) =>
                `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

            if (i === 0) {
                // Primer registro: POB = ETA + 1h
                if (registroActualizado.eta) {
                    const etaDate = convertirFechaHora(registroActualizado.eta);
                    const pobDate = sumarHoras(etaDate, 1);
                    registroActualizado.pob = formatDate(pobDate);
                }
            } else {
                // Del segundo en adelante
                const registroAnterior = recalculados[i - 1]; // Usa el ya recalculado
                if (registroAnterior && registroAnterior.etd && registroActualizado.eta) {
                    const etaActualDate = convertirFechaHora(registroActualizado.eta);
                    const etdAnteriorDate = convertirFechaHora(registroAnterior.etd);

                    if (etaActualDate < etdAnteriorDate) {
                        // ETA < ETD anterior → POB = ETD anterior + 1h
                        const pobDate = sumarHoras(etdAnteriorDate, 1);
                        registroActualizado.pob = formatDate(pobDate);
                    } else {
                        // ETA >= ETD anterior → POB = ETA + 1h
                        const pobDate = sumarHoras(etaActualDate, 1);
                        registroActualizado.pob = formatDate(pobDate);
                    }
                }
            }

            // Recalcula el resto de campos si hay datos suficientes
            if (registroActualizado.eta && registroActualizado.operationTime) {
                const recalculado = recalcularCampos(registroActualizado);
                registroActualizado = {
                    ...registro,
                    ...recalculado,
                    eta: registro.eta || '',
                    pob: registroActualizado.pob,
                    etb: recalculado.etb || '',
                    etc: recalculado.etc || '',
                    etd: recalculado.etd || '',
                };
            }
            recalculados.push(registroActualizado);
        }

        // 2. Ahora sí, actualiza todos en la base de datos
        for (const registroActualizado of recalculados) {
            try {
                const registroParaEnviar = {
                    ...registroActualizado,
                    eta: toISOIfNeeded(registroActualizado.eta),
                    pob: toISOIfNeeded(registroActualizado.pob),
                    etb: toISOIfNeeded(registroActualizado.etb),
                    etc: toISOIfNeeded(registroActualizado.etc),
                    etd: toISOIfNeeded(registroActualizado.etd),
                };
                await fetch(`/api/tablaDeLogistica/${registroActualizado.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registroParaEnviar),
                });
            } catch (err) {
                console.error(`Error actualizando registro ${registroActualizado.id}:`, err);
            }
        }
        setActualizando(false);
    };

    const handleUpdateRegistro = async () => {
        try {
            const dataToSend = {
                ...registroEdit,
                loa: Number(registroEdit.loa),
                eta: toISOIfNeeded(registroEdit.eta),
                pob: toISOIfNeeded(registroEdit.pob),
                etb: toISOIfNeeded(registroEdit.etb),
                etc: toISOIfNeeded(registroEdit.etc),
                etd: toISOIfNeeded(registroEdit.etd),
            };

            const response = await fetch(`/api/tablaDeLogistica/${registroEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                alert('Error al actualizar el registro');
                return;
            }

            setIsEditing(false);
            setUltimaModificacion(new Date());

            // 1. Vuelve a cargar los registros desde el backend para tener los datos actualizados
            let nuevosDatos = await getRegisters();
            nuevosDatos.sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());
            setRegistros(nuevosDatos);

            // 2. Espera a que el estado se actualice antes de recalcular el resto
            //    (usamos una función auxiliar para asegurar que usamos los datos más recientes)
            await actualizarTodosLosRegistros(registroEdit.id, nuevosDatos);

            // 3. Vuelve a cargar los registros para reflejar todos los cambios
            nuevosDatos = await getRegisters();
            nuevosDatos.sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());
            setRegistros(nuevosDatos);

        } catch (err: unknown) {
            alert('Error al actualizar el registro');
            console.error('Error al actualizar el registro:', err);
        }
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
                // 1. Actualiza el estado local
                const nuevosRegistros = registros.filter(registro => registro.id !== id);
                setRegistros(nuevosRegistros);

                // 2. Recalcula todos los registros restantes
                await actualizarTodosLosRegistros(-1, nuevosRegistros);

                // 3. Vuelve a cargar los registros para reflejar todos los cambios
                const datosActualizados = await getRegisters();
                datosActualizados.sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());
                setRegistros(datosActualizados);

            } catch (err: unknown) {
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
            } catch {
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

    // Encuentra el id del primer registro (menor ETA)
    const primerRegistroId = registros.length > 0
        ? [...registros].sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime())[0].id
        : null;

    const esPrimerRegistro = isEditing && registroEdit.id === primerRegistroId;

    const hayRegistros = registros.length > 0;

    // Nuevo estado para el rol de usuario
    const [userRole, setUserRole] = useState<string>('externo');

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setUserRole(user.rol || "externo");
                } catch {
                    setUserRole("externo");
                }
            } else {
                setUserRole("externo");
            }
        }
    }, []);

    const [ultimaModificacion, setUltimaModificacion] = useState<Date | null>(null);

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

    if (actualizando) {
        return (
            <div className="fixed inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded shadow text-lg font-semibold flex items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Actualizando registros...
                </div>
            </div>
        );
    }

    return (
        <div className='bg-gray-200 min-h-screen flex justify-center'>
            <div className="container mx-auto p-6">
                {/* Formulario para crear nuevo usuario */}
                {isCreatingNewRegister && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Registro</h2>
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
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hayRegistros ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                    value={newRegistro.pob}
                                    onChange={handleNewRegistroInputChange}
                                    disabled={hayRegistros}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">ETB</label>
                                <input
                                    type="text"
                                    name="etb"
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hayRegistros ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                    value={newRegistro.etb}
                                    onChange={handleNewRegistroInputChange}
                                    disabled={hayRegistros}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">ETC</label>
                                <input
                                    type="text"
                                    name="etc"
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hayRegistros ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                    value={newRegistro.etc}
                                    onChange={handleNewRegistroInputChange}
                                    disabled={hayRegistros}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">ETD</label>
                                <input
                                    type="text"
                                    name="etd"
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hayRegistros ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                    value={newRegistro.etd}
                                    onChange={handleNewRegistroInputChange}
                                    disabled={hayRegistros}
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

                {/* Modal de edición */}
                {isEditing && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Modificar registro</h2>
                        <form onSubmit={e => { e.preventDefault(); handleUpdateRegistro(); }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Vessel</label>
                                <input
                                    type="text"
                                    name="vessel"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                    value={registroEdit.vessel}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">LOA</label>
                                <input
                                    type="number"
                                    name="loa"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                    value={registroEdit.loa}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Operation time</label>
                                <input
                                    type="text"
                                    name="operationTime"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                    value={registroEdit.operationTime}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">ETA</label>
                                <input
                                    type="text"
                                    name="eta"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                    value={registroEdit.eta}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">POB</label>
                                <input
                                    type="text"
                                    name="pob"
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${!esPrimerRegistro ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                    value={registroEdit.pob}
                                    onChange={handleEditInputChange}
                                    disabled={!esPrimerRegistro}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">ETB</label>
                                <input
                                    type="text"
                                    name="etb"
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${!esPrimerRegistro ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                    value={registroEdit.etb}
                                    onChange={handleEditInputChange}
                                    disabled={!esPrimerRegistro}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">ETC</label>
                                <input
                                    type="text"
                                    name="etc"
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${!esPrimerRegistro ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                    value={registroEdit.etc}
                                    onChange={handleEditInputChange}
                                    disabled={!esPrimerRegistro}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">ETD</label>
                                <input
                                    type="text"
                                    name="etd"
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${!esPrimerRegistro ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                    value={registroEdit.etd}
                                    onChange={handleEditInputChange}
                                    disabled={!esPrimerRegistro}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Cargo</label>
                                <input
                                    type="text"
                                    name="cargo"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                    value={registroEdit.cargo}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Guardar Cambios
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabla de logistica */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Logística</h1>
                        {userRole === "admin" && (
                            <button onClick={handleOpenNewRegistroModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                + Nuevo Registro
                            </button>
                        )}
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
                                    {userRole === "admin" && (
                                        <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">ACCIONES</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {registros.map((registro) => (
                                    <tr className='text-center' key={registro.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{registro.vessel}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.loa}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.operationTime}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.eta ? formatearFechaParaUsuario(new Date(registro.eta)) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.pob ? formatearFechaParaUsuario(new Date(registro.pob)) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.etb ? formatearFechaParaUsuario(new Date(registro.etb)) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.etc ? formatearFechaParaUsuario(new Date(registro.etc)) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.etd ? formatearFechaParaUsuario(new Date(registro.etd)) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.cargo}</td>
                                        {userRole === "admin" && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                                                <button
                                                    className="p-2 rounded-full hover:bg-gray-200"
                                                    onClick={() => setMenuOpenId(menuOpenId === registro.id ? null : registro.id)}
                                                >
                                                    <span className="text-xl">⋮</span>
                                                </button>
                                                {menuOpenId === registro.id && (
                                                    <div
                                                        ref={menuRef}
                                                        className="absolute top-0 right-18 w-32 bg-white border rounded shadow-lg z-10"
                                                    >
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
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {ultimaModificacion && (
                    <div className="mb-4 text-sm text-gray-600">
                        Última modificación:{" "}
                        {ultimaModificacion.toLocaleString("es-MX", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })}
                      </div>
                )}
            </div>
        </div>
    );
}

function sumarHoras(fecha: Date, horas: number, minutos: number = 0): Date {
    const nueva = new Date(fecha);
    nueva.setHours(nueva.getHours() + horas);
    nueva.setMinutes(nueva.getMinutes() + minutos);
    return nueva;
}

function sumarOperationTime(fecha: Date, operationTime: string): Date {
    const [horas, minutos] = operationTime.split(':').map(Number);
    return sumarHoras(fecha, horas, minutos);
}

function recalcularCampos(registro: Omit<tablaDeLogistica, 'createdAt' | 'updatedAt'>): Omit<tablaDeLogistica, 'createdAt' | 'updatedAt'> {
    const { eta, operationTime } = registro;

    // Log para depuración
    console.log('recalcularCampos:', { eta, operationTime, registro });

    // Si no hay ETA o operationTime, no se puede calcular el resto
    if (!eta || !operationTime) return registro;

    try {
        const etaDate = convertirFechaHora(eta);
        // const pobDate = sumarHoras(etaDate, 1);
        const pobDate = registro.pob ? convertirFechaHora(registro.pob) : etaDate; // Si pob existe, úsalo; si no, usa etaDate
        const etbDate = sumarHoras(pobDate, 1);
        const etcDate = sumarOperationTime(etbDate, operationTime);
        const etdDate = sumarHoras(etcDate, 1);

        const formatDate = (d: Date) =>
            `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

        return {
            ...registro,
            pob: formatDate(pobDate),
            etb: formatDate(etbDate),
            etc: formatDate(etcDate),
            etd: formatDate(etdDate),
        };
    } catch {
        // Si hay error en el formato, regresa el registro sin cambios
        return registro;
    }
}

function toISOIfNeeded(fecha: string) {
    if (!fecha) return '';
    // Si ya es ISO, regresa igual
    if (fecha.includes('T')) return fecha;
    // Si es dd/MM hh:mm, conviértelo a ISO
    try {
        return convertirFechaHora(fecha).toISOString();
    } catch {
        return fecha; // Si falla, regresa el original
    }
}