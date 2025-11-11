"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  Users,
  CheckSquare,
  Plus,
  Search,
  UserCheck,
  AlertCircle,
  Download,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Importar funciones de API
import {
  fetchSesiones,
  fetchGrupos,
  fetchInstructores,
  fetchMatriculas,
  fetchAsistencias,
} from "@/lib/api";

// Tipos
interface Sesion {
  id: string;
  grupo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  instructor: string;
  estado: "programada" | "impartida" | "cancelada";
}

interface Grupo {
  id: string;
  nombre_grupo: string;
  curso_detalle?: {
    nombre: string;
  };
}

interface Instructor {
  id: string;
  nombres: string;
  apellidos: string;
}

interface Matricula {
  id: string;
  alumno: string;
  grupo: string;
  alumno_detalle: {
    nombres: string;
    apellidos: string;
    email: string;
  };
}

interface Asistencia {
  id: string;
  sesion: string;
  alumno: string;
  presente: boolean;
  timestamp: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function AsistenciaPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sesiones");
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  // Estados para crear sesión
  const [openNuevaSesion, setOpenNuevaSesion] = useState(false);
  const [nuevaSesion, setNuevaSesion] = useState({
    grupo: "",
    instructor: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
  });

  // Estados para tomar asistencia
  const [sesionSeleccionada, setSesionSeleccionada] = useState<string>("");
  const [alumnosParaAsistencia, setAlumnosParaAsistencia] = useState<Matricula[]>([]);
  const [presentesSeleccionados, setPresentesSeleccionados] = useState<Set<string>>(new Set());
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);

  // Estados para reportes
  const [reporteData, setReporteData] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [sesionesData, gruposData, instructoresData] = await Promise.all([
        fetchSesiones(),
        fetchGrupos(),
        fetchInstructores(),
      ]);

      setSesiones(sesionesData);
      setGrupos(gruposData);
      setInstructores(instructoresData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const crearSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_BASE}/api/sesiones/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...nuevaSesion,
          estado: "programada",
        }),
      });

      if (response.ok) {
        await cargarDatos();
        setOpenNuevaSesion(false);
        setNuevaSesion({
          grupo: "",
          instructor: "",
          fecha: "",
          hora_inicio: "",
          hora_fin: "",
        });
        toast({
          title: "Éxito",
          description: "Sesión creada exitosamente",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la sesión",
        variant: "destructive",
      });
    }
  };

  const cargarAlumnosParaAsistencia = async (sesionId: string) => {
    if (!sesionId) {
      setAlumnosParaAsistencia([]);
      setPresentesSeleccionados(new Set());
      return;
    }

    setCargandoAlumnos(true);
    try {
      const sesion = sesiones.find((s) => s.id === sesionId);
      if (!sesion) return;

      const [matriculas, asistencias] = await Promise.all([
        fetchMatriculas(),
        fetchAsistencias(),
      ]);

      const alumnosDelGrupo = matriculas.filter(
        (m: any) => m.grupo === sesion.grupo && m.estado === "vigente"
      );

      const asistenciasSesion = asistencias.filter((a: any) => a.sesion === sesionId);
      const presentes = new Set(
        asistenciasSesion.filter((a: any) => a.presente).map((a: any) => a.alumno)
      );

      setAlumnosParaAsistencia(alumnosDelGrupo);
      setPresentesSeleccionados(presentes);
      setSesionSeleccionada(sesionId);
    } catch (error) {
      console.error("Error cargando alumnos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los alumnos",
        variant: "destructive",
      });
    } finally {
      setCargandoAlumnos(false);
    }
  };

  const guardarAsistencia = async () => {
    if (!sesionSeleccionada) return;

    try {
      const token = getAccessToken();
      const asistencias = alumnosParaAsistencia.map((m) => ({
        sesion: sesionSeleccionada,
        alumno: m.alumno,
        presente: presentesSeleccionados.has(m.alumno),
        registrado_por: "sistema",
      }));

      const response = await fetch(`${API_BASE}/api/asistencias/batch/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(asistencias),
      });

      if (response.ok) {
        // Marcar sesión como impartida
        await fetch(`${API_BASE}/api/sesiones/${sesionSeleccionada}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ estado: "impartida" }),
        });

        toast({
          title: "Éxito",
          description: "Asistencia guardada exitosamente",
        });

        await cargarDatos();
        setSesionSeleccionada("");
        setAlumnosParaAsistencia([]);
        setPresentesSeleccionados(new Set());
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la asistencia",
        variant: "destructive",
      });
    }
  };

  const togglePresente = (alumnoId: string) => {
    const newSet = new Set(presentesSeleccionados);
    if (newSet.has(alumnoId)) {
      newSet.delete(alumnoId);
    } else {
      newSet.add(alumnoId);
    }
    setPresentesSeleccionados(newSet);
  };

  const cargarReporte = async () => {
    try {
      const [matriculas, asistencias] = await Promise.all([
        fetchMatriculas(),
        fetchAsistencias(),
      ]);

      const reporteMap = new Map();

      matriculas
        .filter((m: any) => m.estado === "vigente")
        .forEach((m: any) => {
          const alumnoAsistencias = asistencias.filter((a: any) => a.alumno === m.alumno);
          const presentes = alumnoAsistencias.filter((a: any) => a.presente).length;
          const total = alumnoAsistencias.length;
          const porcentaje = total > 0 ? (presentes / total) * 100 : 0;

          reporteMap.set(m.alumno, {
            alumno_id: m.alumno,
            alumno_nombre: `${m.alumno_detalle.nombres} ${m.alumno_detalle.apellidos}`,
            grupo: m.grupo_detalle?.nombre_grupo || "N/A",
            total_sesiones: total,
            presentes,
            ausentes: total - presentes,
            porcentaje,
          });
        });

      setReporteData(Array.from(reporteMap.values()));
    } catch (error) {
      console.error("Error cargando reporte:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "reporte") {
      cargarReporte();
    }
  }, [activeTab]);

  const sesionesFiltradas = sesiones.filter((s) => {
    const matchSearch =
      searchTerm === "" ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grupo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === "todos" || s.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const getEstadoBadge = (estado: string) => {
    const variants: any = {
      programada: "default",
      impartida: "secondary",
      cancelada: "destructive",
    };
    return variants[estado] || "default";
  };

  const getPorcentajeColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "text-green-600";
    if (porcentaje >= 75) return "text-blue-600";
    if (porcentaje >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const calcularEstadisticas = () => {
    if (reporteData.length === 0) {
      return {
        promedioAsistencia: 0,
        mejorAsistencia: 0,
        totalAlumnos: 0,
        totalSesiones: 0,
      };
    }

    const promedioAsistencia =
      reporteData.reduce((sum, r) => sum + r.porcentaje, 0) / reporteData.length;
    const mejorAsistencia = Math.max(...reporteData.map((r) => r.porcentaje));
    const totalSesiones = reporteData.reduce((sum, r) => sum + r.total_sesiones, 0);

    return {
      promedioAsistencia: Math.round(promedioAsistencia),
      mejorAsistencia: Math.round(mejorAsistencia),
      totalAlumnos: reporteData.length,
      totalSesiones,
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Control de Asistencia</h2>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Control de Asistencia</h2>
          <p className="text-muted-foreground">
            Registro y seguimiento de asistencia a clases
          </p>
        </div>

        <Dialog open={openNuevaSesion} onOpenChange={setOpenNuevaSesion}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Sesión
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Sesión</DialogTitle>
              <DialogDescription>
                Registra una nueva sesión de clase
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={crearSesion} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="grupo">Grupo *</Label>
                <Select
                  value={nuevaSesion.grupo}
                  onValueChange={(value) =>
                    setNuevaSesion({ ...nuevaSesion, grupo: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grupo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.nombre_grupo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor *</Label>
                <Select
                  value={nuevaSesion.instructor}
                  onValueChange={(value) =>
                    setNuevaSesion({ ...nuevaSesion, instructor: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar instructor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {instructores.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.nombres} {i.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={nuevaSesion.fecha}
                  onChange={(e) =>
                    setNuevaSesion({ ...nuevaSesion, fecha: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio">Hora Inicio *</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={nuevaSesion.hora_inicio}
                    onChange={(e) =>
                      setNuevaSesion({ ...nuevaSesion, hora_inicio: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_fin">Hora Fin *</Label>
                  <Input
                    id="hora_fin"
                    type="time"
                    value={nuevaSesion.hora_fin}
                    onChange={(e) =>
                      setNuevaSesion({ ...nuevaSesion, hora_fin: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenNuevaSesion(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Sesión</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sesiones">
            <Calendar className="mr-2 h-4 w-4" />
            Sesiones
          </TabsTrigger>
          <TabsTrigger value="tomar">
            <CheckSquare className="mr-2 h-4 w-4" />
            Tomar Asistencia
          </TabsTrigger>
          <TabsTrigger value="reporte">
            <Users className="mr-2 h-4 w-4" />
            Reporte
          </TabsTrigger>
        </TabsList>

        {/* TAB: SESIONES */}
        <TabsContent value="sesiones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sesiones Registradas</CardTitle>
              <CardDescription>
                Listado de todas las sesiones de clase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar sesiones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="impartida">Impartida</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {sesionesFiltradas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <AlertCircle className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay sesiones registradas</p>
                  </div>
                ) : (
                  sesionesFiltradas.map((sesion) => (
                    <Card key={sesion.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Grupo {sesion.grupo}</h3>
                              <Badge variant={getEstadoBadge(sesion.estado)}>
                                {sesion.estado}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(sesion.fecha).toLocaleDateString("es-HN")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {sesion.hora_inicio} - {sesion.hora_fin}
                                </span>
                              </div>
                            </div>
                          </div>
                          {sesion.estado === "programada" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveTab("tomar");
                                cargarAlumnosParaAsistencia(sesion.id);
                              }}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Tomar Asistencia
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: TOMAR ASISTENCIA */}
        <TabsContent value="tomar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tomar Asistencia</CardTitle>
              <CardDescription>
                Marca los alumnos presentes en la sesión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!sesionSeleccionada ? (
                <div className="space-y-4">
                  <Label>Selecciona una sesión</Label>
                  <Select
                    value={sesionSeleccionada}
                    onValueChange={cargarAlumnosParaAsistencia}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sesión..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sesiones
                        .filter((s) => s.estado === "programada")
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {new Date(s.fecha).toLocaleDateString("es-HN")} -{" "}
                            {s.hora_inicio} - Grupo {s.grupo}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                      <CardTitle>
                        Sesión del{" "}
                        {new Date(
                          sesiones.find((s) => s.id === sesionSeleccionada)?.fecha || ""
                        ).toLocaleDateString("es-HN")}
                      </CardTitle>
                      <CardDescription className="text-primary-foreground/80">
                        {presentesSeleccionados.size} / {alumnosParaAsistencia.length}{" "}
                        presentes
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {cargandoAlumnos ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alumnosParaAsistencia.map((matricula) => (
                        <Card
                          key={matricula.id}
                          className={`cursor-pointer transition-colors ${
                            presentesSeleccionados.has(matricula.alumno)
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => togglePresente(matricula.alumno)}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={presentesSeleccionados.has(matricula.alumno)}
                                onCheckedChange={() =>
                                  togglePresente(matricula.alumno)
                                }
                              />
                              <div>
                                <p className="font-medium">
                                  {matricula.alumno_detalle.nombres}{" "}
                                  {matricula.alumno_detalle.apellidos}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {matricula.alumno_detalle.email}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button onClick={guardarAsistencia} className="flex-1">
                      Guardar Asistencia
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSesionSeleccionada("");
                        setAlumnosParaAsistencia([]);
                        setPresentesSeleccionados(new Set());
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: REPORTE */}
        <TabsContent value="reporte" className="space-y-4">
          {(() => {
            const stats = calcularEstadisticas();
            return (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Promedio General
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.promedioAsistencia}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Mejor Asistencia
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.mejorAsistencia}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Alumnos
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalAlumnos}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Sesiones
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalSesiones}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Detalle por Alumno</CardTitle>
                        <CardDescription>
                          Porcentajes de asistencia individuales
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {reporteData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <AlertCircle className="h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">
                          No hay datos de asistencia
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reporteData.map((reporte) => (
                          <div
                            key={reporte.alumno_id}
                            className="flex items-center justify-between py-3 border-b last:border-0"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{reporte.alumno_nombre}</p>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>{reporte.grupo}</span>
                                <span>
                                  {reporte.presentes}/{reporte.total_sesiones} clases
                                </span>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p
                                className={`text-2xl font-bold ${getPorcentajeColor(
                                  reporte.porcentaje
                                )}`}
                              >
                                {reporte.porcentaje.toFixed(1)}%
                              </p>
                              <div className="w-32 bg-secondary rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${reporte.porcentaje}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}