'use client';

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function CuentaPage() {
  const [user, setUser] = useState({ nombre: "", correo: "", contrasena: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUser({
          nombre: userObj.nombre || "",
          correo: userObj.correo || "",
          contrasena: "",
        });
      } catch {}
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("No se encontró información del usuario.");
        return;
      }
      const userObj = JSON.parse(userStr);
      const id = userObj.id;

      // prepara los datos a enviar
      const datosActualizados: any = {
        nombre: user.nombre,
        correo: user.correo,
      };
      if (user.contrasena && user.contrasena.trim() !== "") {
        datosActualizados.contrasena = user.contrasena;
      }

      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosActualizados),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.message || "Error al actualizar el usuario.");
        return;
      }

      // actualiza localStorage con los nuevos datos
      const actualizado = { ...userObj, ...datosActualizados };
      delete actualizado.contrasena;
      localStorage.setItem("user", JSON.stringify(actualizado));

      alert("Cambios guardados correctamente.");
      setUser({ ...user, contrasena: "" }); // limpia el campo de contraseña
    } catch (err) {
      alert("Ocurrió un error al actualizar la cuenta.");
      console.error(err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 overflow-hidden">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-6">Editar cuenta</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={user.nombre}
            disabled
            className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Correo</label>
          <input
            type="email"
            name="correo"
            value={user.correo}
            disabled
            className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="contrasena"
              value={user.contrasena}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full pr-10"
              placeholder="Nueva contraseña"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}