"use client";

import { useEffect, useState } from "react";
import { fetchAlumnos, createAlumno } from "@/lib/api";
import { Plus, X } from "lucide-react";

type Alumno = {
  id: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  estado?: string;
};

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAlumnos()
      .then((data) => setAlumnos(data))
      .catch((err) => console.error("Error cargando alumnos:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Enviando formulario…", form);

    if (!form.nombres.trim() || !form.apellidos.trim()) {
      alert("Nombres y apellidos son obligatorios.");
      return;
    }

    setSubmitting(true);
    try {
      const nuevo = await createAlumno({
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email || undefined,
        telefono: form.telefono || undefined,
        estado: "activo",
      });

      console.log("Alumno creado:", nuevo);
      setAlumnos((prev) => [...prev, nuevo]);
      setForm({ nombres: "", apellidos: "", email: "", telefono: "" });
      setShowForm(false); // Ocultar formulario después de agregar
    } catch (err) {
      console.error("Error creando alumno:", err);
      alert("Error al crear el alumno. Revisa la consola / Network.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Gestión de Alumnos</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Lista de estudiantes registrados en el sistema
        </p>
        <p className="text-sm text-muted-foreground">Cargando alumnos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Alumnos</h1>
          <p className="text-sm text-muted-foreground">
            Lista de estudiantes registrados en el sistema
          </p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Agregar Alumno
          </button>
        )}
      </div>

      {/* FORMULARIO COLAPSABLE */}
      {showForm && (
        <div className="border rounded-lg bg-card p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Nuevo Alumno</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setForm({ nombres: "", apellidos: "", email: "", telefono: "" });
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nombres *"
                className="border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.nombres}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
              />
              <input
                type="text"
                placeholder="Apellidos *"
                className="border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                className="border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Teléfono"
                className="border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ nombres: "", apellidos: "", email: "", telefono: "" });
                }}
                className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Guardando..." : "Guardar Alumno"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold">Correo</th>
              <th className="text-left px-4 py-3 font-semibold">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno) => (
              <tr key={alumno.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  {alumno.nombres} {alumno.apellidos}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{alumno.email || "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{alumno.telefono || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}