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

export default function FechaConversionPage() {
    const [fechaInputDDMMHHmm, setFechaInputDDMMHHmm] = useState<string>('');
    const [fechaDate, setFechaDate] = useState<Date | null>(null);
    const [fechaInputDate, setFechaInputDate] = useState<string>('');
    const [fechaFormateadaDesdeDate, setFechaFormateadaDesdeDate] = useState<string>('');

    const handleInputChangeDDMMHHmm = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFechaInputDDMMHHmm(event.target.value);
    };

    const handleConvertirClick = () => {
        try {
            const dateObject = convertirFechaHora(fechaInputDDMMHHmm);
            setFechaDate(dateObject);
            setFechaFormateadaDesdeDate(''); // Limpiar la fecha formateada anterior
        } catch (error) {
            console.error("Error al convertir la fecha:", error);
            setFechaDate(null);
            setFechaFormateadaDesdeDate('');
            alert("Formato de fecha incorrecto. Por favor, use DD/MM HH:MM");
        }
    };

    const handleInputChangeDate = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFechaInputDate(event.target.value);
    };

    const handleFormatearDesdeDateClick = () => {
        try {
            const dateObject = new Date(fechaInputDate);
            if (!isNaN(dateObject.getTime())) {
                const formattedDate = formatearFechaParaUsuario(dateObject);
                setFechaFormateadaDesdeDate(formattedDate);
            } else {
                alert("Formato de Date incorrecto.");
                setFechaFormateadaDesdeDate('');
            }
        } catch (error) {
            console.error("Error al formatear desde Date:", error);
            alert("Formato de Date incorrecto.");
            setFechaFormateadaDesdeDate('');
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <h1>Conversor y Formateador de Fecha</h1>

            {/* Sección para convertir DD/MM HH:MM a Date */}
            <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                <h2>Convertir DD/MM HH:MM a Date</h2>
                <label htmlFor="fechaInputDDMMHHmm" style={{ display: 'block', marginBottom: '5px' }}>
                    Ingrese la fecha (DD/MM HH:MM):
                </label>
                <input
                    type="text"
                    id="fechaInputDDMMHHmm"
                    value={fechaInputDDMMHHmm}
                    onChange={handleInputChangeDDMMHHmm}
                    placeholder="DD/MM HH:MM"
                    style={{ padding: '8px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', width: '300px' }}
                />
                <button
                    onClick={handleConvertirClick}
                    style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
                >
                    Convertir a Date
                </button>
                {fechaDate && (
                    <div style={{ marginTop: '10px', border: '1px solid #eee', padding: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                        <h4 style={{ color: 'black' }}>Fecha Convertida (Objeto Date):</h4>
                        <pre style={{ color: 'black' }}>{fechaDate.toString()}</pre>
                    </div>
                )}
                {fechaInputDDMMHHmm.length > 11 && (
                    <p style={{ marginTop: '10px', color: 'red' }}>Formato de fecha incorrecto.</p>
                )}
            </div>

            {/* Sección para formatear Date a DD/MM HH:mm */}
            <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                <h2>Formatear Date a DD/MM HH:mm</h2>
                <label htmlFor="fechaInputDate" style={{ display: 'block', marginBottom: '5px' }}>
                    Ingrese la fecha (formato Date):
                </label>
                <input
                    type="text"
                    id="fechaInputDate"
                    value={fechaInputDate}
                    onChange={handleInputChangeDate}
                    placeholder="Ej: Sun May 15 2025 06:00:00 GMT-0700 (PDT)"
                    style={{ padding: '8px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', width: '400px' }}
                />
                <button
                    onClick={handleFormatearDesdeDateClick}
                    style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
                >
                    Formatear a DD/MM HH:mm
                </button>
                {fechaFormateadaDesdeDate && (
                    <div style={{ marginTop: '10px', border: '1px solid #eee', padding: '10px', borderRadius: '5px', backgroundColor: '#e9ecef' }}>
                        <h4 style={{ color: 'black' }}>Fecha Formateada (DD/MM HH:mm):</h4>
                        <p style={{ color: 'black', fontSize: '18px' }}>{fechaFormateadaDesdeDate}</p>
                    </div>
                )}
                
            </div>
        </div>
    );
}