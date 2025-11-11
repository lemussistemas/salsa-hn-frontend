// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Lee el token del login guardado en localStorage
function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

// Helper genérico para GET con auth
async function apiGet(path: string) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error en GET ${path}: ${res.status}`);
  }

  return res.json();
}

// Helper genérico para POST con auth
async function apiPost(path: string, body: any) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Error en POST", path, res.status, text);
    throw new Error(`Error en POST ${path}: ${res.status}`);
  }

  return res.json();
}

// Helper genérico para PATCH con auth
async function apiPatch(path: string, body: any) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Error en PATCH", path, res.status, text);
    throw new Error(`Error en PATCH ${path}: ${res.status}`);
  }

  return res.json();
}

// Helper genérico para DELETE con auth
async function apiDelete(path: string) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Error en DELETE ${path}: ${res.status}`);
  }

  return res.ok;
}

/* ========= MENÚS ========= */

export type MenuDTO = {
  id: number;
  nombre: string;
  ruta: string;
};

export async function fetchMenus(): Promise<MenuDTO[]> {
  // Llama al endpoint de Django: /api/auth/menus/
  return apiGet("/api/auth/menus/");
}

/* ========= ALUMNOS ========= */

// Debe coincidir con lo que devuelve tu AlumnoSerializer
export type AlumnoDTO = {
  id: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  estado?: string;
  fecha_nacimiento?: string | null;
  // si en el serializer agregaste nombre/correo derivados:
  nombre?: string;
  correo?: string;
};

export type CreateAlumnoDTO = {
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  estado?: string;
  fecha_nacimiento?: string | null; // "2000-01-01"
};

export async function fetchAlumnos(): Promise<AlumnoDTO[]> {
  return apiGet("/api/alumnos/");
}

export async function createAlumno(data: CreateAlumnoDTO): Promise<AlumnoDTO> {
  // OJO: aquí se mandan los nombres EXACTOS del modelo:
  // nombres, apellidos, email, telefono, estado, fecha_nacimiento
  return apiPost("/api/alumnos/", data);
}

/* ========= INSTRUCTORES ========= */

export type InstructorDTO = {
  id: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  tipo_pago: "por_clase" | "fijo";
  tarifa_clase: string;
  salario_base: string;
  activo: boolean;
  nombre?: string;
  correo?: string;
};

export type CreateInstructorDTO = {
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  tipo_pago?: "por_clase" | "fijo";
  tarifa_clase?: number;
  salario_base?: number;
  activo?: boolean;
};

// Obtener lista de instructores
export async function fetchInstructores(): Promise<InstructorDTO[]> {
  return apiGet("/api/instructores/");
}

// Crear nuevo instructor
export async function createInstructor(data: CreateInstructorDTO): Promise<InstructorDTO> {
  return apiPost("/api/instructores/", data);
}

/* ========= CURSOS / GRUPOS ========= */

export type CursoDTO = {
  id: string;
  nombre: string;
  nivel: "básico" | "intermedio" | "avanzado";
  precio_base: string;
  estado: "activo" | "inactivo";
};

export type CreateCursoDTO = {
  nombre: string;
  nivel: "básico" | "intermedio" | "avanzado";
  precio_base: number;
  estado?: "activo" | "inactivo";
};

export type GrupoDTO = {
  id: string;
  curso: string;
  nombre_grupo: string;
  cupo: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  sede: string;
  estado: "activo" | "inactivo";
  curso_detalle?: CursoDTO;
  inscritos?: number;
  disponibles?: number;
};

export type CreateGrupoDTO = {
  curso: string;
  nombre_grupo: string;
  cupo: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  sede?: string;
  estado?: "activo" | "inactivo";
};

export async function fetchCursos(): Promise<CursoDTO[]> {
  return apiGet("/api/cursos/");
}

export async function createCurso(data: CreateCursoDTO): Promise<CursoDTO> {
  return apiPost("/api/cursos/", data);
}

export async function updateCurso(id: string, data: Partial<CreateCursoDTO>): Promise<CursoDTO> {
  return apiPatch(`/api/cursos/${id}/`, data);
}

export async function deleteCurso(id: string): Promise<boolean> {
  return apiDelete(`/api/cursos/${id}/`);
}

export async function fetchGrupos(): Promise<GrupoDTO[]> {
  return apiGet("/api/grupos/");
}

export async function createGrupo(data: CreateGrupoDTO): Promise<GrupoDTO> {
  return apiPost("/api/grupos/", data);
}

export async function updateGrupo(id: string, data: Partial<CreateGrupoDTO>): Promise<GrupoDTO> {
  return apiPatch(`/api/grupos/${id}/`, data);
}

export async function deleteGrupo(id: string): Promise<boolean> {
  return apiDelete(`/api/grupos/${id}/`);
}

/* ========= MATRÍCULAS ========= */

export async function fetchMatriculas() {
  return apiGet("/api/matriculas/");
}

/* ========= PAGOS / FACTURAS ========= */

export async function fetchPagos() {
  return apiGet("/api/pagos/");
}

export async function fetchFacturas() {
  return apiGet("/api/facturas/");
}

/* ========= ASISTENCIA ========= */

export async function fetchSesiones() {
  return apiGet("/api/sesiones/");
}

export async function fetchAsistencias() {
  return apiGet("/api/asistencias/");
}

/* ========= EVENTOS / TICKETS ========= */

export async function fetchEventos() {
  return apiGet("/api/eventos/");
}

export async function fetchTickets() {
  return apiGet("/api/tickets/");
}