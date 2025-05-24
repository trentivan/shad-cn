'use client';

import { useState } from 'react';

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

export default function SumarFechasPage() {
    const [fechaBaseInput, setFechaBaseInput] = useState<string>('');
    const [horasASumar, setHorasASumar] = useState<string>(''); // Cambia a string
    const [fechaResultado, setFechaResultado] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleFechaBaseInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFechaBaseInput(event.target.value);
        setError('');
        setFechaResultado('');
    };

    // Cambia el handler para aceptar HH:mm
    const handleHorasASumarInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHorasASumar(event.target.value);
        setError('');
        setFechaResultado('');
    };

    const handleSumarClick = () => {
        setError('');
        setFechaResultado('');

        if (!fechaBaseInput) {
            setError("Por favor, ingrese la fecha base.");
            return;
        }

        if (!horasASumar) {
            setError("Por favor, ingrese las horas a sumar en formato HH:mm.");
            return;
        }

        try {
            const fechaBaseDate = convertirFechaHora(fechaBaseInput);

            if (isNaN(fechaBaseDate.getTime())) {
                setError("Formato de fecha base incorrecto (DD/MM HH:mm).");
                return;
            }

            // Procesar horasASumar en formato HH:mm
            const [horasStr, minutosStr] = horasASumar.split(':');
            const horas = parseInt(horasStr, 10) || 0;
            const minutos = minutosStr ? parseInt(minutosStr, 10) : 0;

            if (isNaN(horas) || isNaN(minutos)) {
                setError("Formato de horas a sumar incorrecto (usa HH:mm).");
                return;
            }

            const fechaResultadoDate = new Date(fechaBaseDate.getTime());
            fechaResultadoDate.setHours(fechaResultadoDate.getHours() + horas);
            fechaResultadoDate.setMinutes(fechaResultadoDate.getMinutes() + minutos);

            setFechaResultado(formatearFechaParaUsuario(fechaResultadoDate));

        } catch (e: unknown) {
            setError("Error al procesar la fecha: " + (e instanceof Error ? e.message : 'Error desconocido'));
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <h1>Sumar Horas a Fecha</h1>

            <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                <h2>Ingrese la Fecha Base y las Horas a Sumar</h2>
                <label htmlFor="fechaBaseInput" style={{ display: 'block', marginBottom: '5px' }}>
                    Fecha Base (DD/MM HH:mm):
                </label>
                <input
                    type="text"
                    id="fechaBaseInput"
                    value={fechaBaseInput}
                    onChange={handleFechaBaseInputChange}
                    placeholder="DD/MM HH:mm"
                    style={{ padding: '8px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', width: '300px', marginBottom: '10px' }}
                />

                <label htmlFor="horasASumar" style={{ display: 'block', marginBottom: '5px' }}>
                    Horas a Sumar (HH:mm):
                </label>
                <input
                    type="text"
                    id="horasASumar"
                    value={horasASumar}
                    onChange={handleHorasASumarInputChange}
                    placeholder="Ej: 24:30"
                    style={{ padding: '8px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', width: '150px', marginBottom: '10px' }}
                />

                <button
                    onClick={handleSumarClick}
                    style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
                >
                    Sumar
                </button>

                {error && (
                    <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
                )}

                {fechaResultado && (
                    <div style={{ marginTop: '10px', border: '1px solid #eee', padding: '10px', borderRadius: '5px', backgroundColor: '#e0ffe0' }}>
                        <h3 style={{ color: 'black' }}>Fecha Resultante:</h3>
                        <p style={{ color: 'black', fontSize: '18px' }}>{fechaResultado}</p>
                    </div>
                )}
            </div>
        </div>
    );
}