'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena }),
            });
            // Después de un login exitoso:
            if (!res.ok) {
                setError('Credenciales incorrectas');
                return;
            }
            const user = await res.json();
            localStorage.setItem('user', JSON.stringify(user)); // <--- Guarda el usuario con rol
            router.push('/'); // Redirige a la página principal
        } catch {
            setError('Error al iniciar sesión');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
                {error && <div className="mb-4 text-red-600">{error}</div>}
                <div className="mb-4">
                    <label className="block mb-1 text-gray-700">Correo</label>
                    <input
                        type="email"
                        value={correo}
                        onChange={e => setCorreo(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block mb-1 text-gray-700">Contraseña</label>
                    <div className="relative">
                        <input
                            type={mostrarContrasena ? "text" : "password"}
                            value={contrasena}
                            onChange={e => setContrasena(e.target.value)}
                            className="w-full border rounded px-3 py-2 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarContrasena(!mostrarContrasena)}
                            className="absolute inset-y-0 right-0 flex items-center px-3"
                        >
                            {mostrarContrasena ? (
                                <EyeOff className="h-5 w-5 text-gray-500" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-500" />
                            )}
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Ingresar
                </button>
            </form>
        </div>
    );
}