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

export type MatriculaDTO = {
  id: string;
  alumno: string;
  grupo: string;
  ciclo: "mensual" | "trimestral";
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: "vigente" | "vencida" | "pausada";
  saldo_actual: string;
  alumno_detalle?: AlumnoDTO;
  grupo_detalle?: GrupoDTO;
};

export type CreateMatriculaDTO = {
  alumno: string;
  grupo: string;
  ciclo: "mensual" | "trimestral";
  fecha_inicio: string;
  fecha_fin?: string | null;
  estado?: "vigente" | "vencida" | "pausada";
};

export async function fetchMatriculas(): Promise<MatriculaDTO[]> {
  return apiGet("/api/matriculas/");
}

export async function fetchMatriculasVigentes(): Promise<MatriculaDTO[]> {
  return apiGet("/api/matriculas/vigentes/");
}

export async function fetchMatriculasConDeuda(): Promise<MatriculaDTO[]> {
  return apiGet("/api/matriculas/con_deuda/");
}

export async function createMatricula(data: CreateMatriculaDTO): Promise<MatriculaDTO> {
  return apiPost("/api/matriculas/", data);
}

export async function updateMatricula(id: string, data: Partial<CreateMatriculaDTO>): Promise<MatriculaDTO> {
  return apiPatch(`/api/matriculas/${id}/`, data);
}

export async function deleteMatricula(id: string): Promise<boolean> {
  return apiDelete(`/api/matriculas/${id}/`);
}

export async function fetchEstadoCuenta(id: string) {
  return apiGet(`/api/matriculas/${id}/estado_cuenta/`);
}

/* ========= PAGOS / FACTURAS ========= */

export async function fetchPagos() {
  return apiGet("/api/pagos/");
}

export async function fetchFacturas() {
  return apiGet("/api/facturas/");
}

/* ========= ASISTENCIA ========= */

export type SesionDTO = {
  id: string;
  grupo: string;
  grupo_id?: string;
  grupo_nombre?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  instructor: string;
  instructor_id?: string;
  instructor_nombre?: string;
  estado: "programada" | "impartida" | "cancelada";
  titulo?: string;
};

export type CreateSesionDTO = {
  grupo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  instructor: string;
  estado?: "programada" | "impartida" | "cancelada";
};

export type AsistenciaDTO = {
  id: string;
  sesion: string;
  sesion_id?: string;
  sesion_titulo?: string;
  alumno: string;
  alumno_id?: string;
  alumno_nombre?: string;
  presente: boolean;
  registrado_por: string;
  timestamp: string;
};

export type CreateAsistenciaDTO = {
  sesion: string;
  alumno: string;
  presente: boolean;
  registrado_por: string;
};

export async function fetchSesiones(): Promise<SesionDTO[]> {
  return apiGet("/api/sesiones/");
}

export async function fetchSesion(id: string): Promise<SesionDTO> {
  return apiGet(`/api/sesiones/${id}/`);
}

export async function createSesion(data: CreateSesionDTO): Promise<SesionDTO> {
  return apiPost("/api/sesiones/", data);
}

export async function updateSesion(id: string, data: Partial<CreateSesionDTO>): Promise<SesionDTO> {
  return apiPatch(`/api/sesiones/${id}/`, data);
}

export async function deleteSesion(id: string): Promise<boolean> {
  return apiDelete(`/api/sesiones/${id}/`);
}

export async function fetchAsistencias(): Promise<AsistenciaDTO[]> {
  return apiGet("/api/asistencias/");
}

export async function fetchAsistenciasPorSesion(sesionId: string): Promise<AsistenciaDTO[]> {
  return apiGet(`/api/asistencias/?sesion=${sesionId}`);
}

export async function createAsistenciaBatch(data: CreateAsistenciaDTO[]): Promise<AsistenciaDTO[]> {
  return apiPost("/api/asistencias/batch/", data);
}

export async function deleteAsistencia(id: string): Promise<boolean> {
  return apiDelete(`/api/asistencias/${id}/`);
}

/* ========= EVENTOS / TICKETS ========= */

export async function fetchEventos() {
  return apiGet("/api/eventos/");
}

export async function fetchTickets() {
  return apiGet("/api/tickets/");
}