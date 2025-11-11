"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  UserCheck,
  UserX,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchGrupos,
  fetchInstructores,
  fetchMatriculasVigentes,
  fetchSesiones,
  fetchSesion,
  createSesion,
  updateSesion,
  deleteSesion,
  fetchAsistencias,
  fetchAsistenciasPorSesion,
  createAsistenciaBatch,
  type GrupoDTO,
  type InstructorDTO,
  type MatriculaDTO,
  type SesionDTO,
  type CreateSesionDTO,
  type AsistenciaDTO,
  type CreateAsistenciaDTO,
} from "@/lib/api";

export default function AsistenciaPage() {
  const { toast } = useToast();
  const [sesiones, setSesiones] = useState<SesionDTO[]>([]);
  const [grupos, setGrupos] = useState<GrupoDTO[]>([]);
  const [instructores, setInstructores] = useState<InstructorDTO[]>([]);
  const [matriculas, setMatriculas] = useState<MatriculaDTO[]>([]);
  const [todasAsistencias, setTodasAsistencias] = useState<AsistenciaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para diálogo de sesión
  const [sesionDialogOpen, setSesionDialogOpen] = useState(false);
  const [editingSesion, setEditingSesion] = useState<SesionDTO | null>(null);
  const [sesionForm, setSesionForm] = useState<CreateSesionDTO>({
    grupo: "",
    fecha: new Date().toISOString().split("T")[0],
    hora_inicio: "19:00",
    hora_fin: "21:00",
    instructor: "",
    estado: "programada",
  });

  // Estados para tomar asistencia
  const [asistenciaDialogOpen, setAsistenciaDialogOpen] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionDTO | null>(null);
  const [alumnosSesion, setAlumnosSesion] = useState<MatriculaDTO[]>([]);
  const [asistenciasActuales, setAsistenciasActuales] = useState<AsistenciaDTO[]>([]);
  const [presentes, setPresentes] = useState<Set<string>>(new Set());
  const [loadingAsistencia, setLoadingAsistencia] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [sesionesData, gruposData, instructoresData, matriculasData, asistenciasData] =
        await Promise.all([
          fetchSesiones(),
          fetchGrupos(),
          fetchInstructores(),
          fetchMatriculasVigentes(),
          fetchAsistencias(),
        ]);
      setSesiones(sesionesData);
      setGrupos(gruposData);
      setInstructores(instructoresData);
      setMatriculas(matriculasData);
      setTodasAsistencias(asistenciasData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========= FUNCIONES PARA SESIONES =========
  const handleCrearSesion = () => {
    setEditingSesion(null);
    setSesionForm({
      grupo: "",
      fecha: new Date().toISOString().split("T")[0],
      hora_inicio: "19:00",
      hora_fin: "21:00",
      instructor: "",
      estado: "programada",
    });
    setSesionDialogOpen(true);
  };

  const handleEditarSesion = (sesion: SesionDTO) => {
    setEditingSesion(sesion);
    setSesionForm({
      grupo: sesion.grupo,
      fecha: sesion.fecha,
      hora_inicio: sesion.hora_inicio,
      hora_fin: sesion.hora_fin,
      instructor: sesion.instructor,
      estado: sesion.estado,
    });
    setSesionDialogOpen(true);
  };

  const handleGuardarSesion = async () => {
    try {
      if (editingSesion) {
        await updateSesion(editingSesion.id, sesionForm);
        toast({
          title: "Sesión actualizada",
          description: "La sesión se actualizó correctamente",
        });
      } else {
        await createSesion(sesionForm);
        toast({
          title: "Sesión creada",
          description: "La sesión se creó correctamente",
        });
      }
      setSesionDialogOpen(false);
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la sesión",
        variant: "destructive",
      });
    }
  };

  const handleEliminarSesion = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta sesión?")) return;

    try {
      await deleteSesion(id);
      toast({
        title: "Sesión eliminada",
        description: "La sesión se eliminó correctamente",
      });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la sesión",
        variant: "destructive",
      });
    }
  };

  // ========= FUNCIONES PARA ASISTENCIA =========
  const handleTomarAsistencia = async (sesion: SesionDTO) => {
    setLoadingAsistencia(true);
    setSesionSeleccionada(sesion);
    setAsistenciaDialogOpen(true);

    try {
      // Cargar detalles de la sesión
      const sesionCompleta = await fetchSesion(sesion.id);
      
      // Filtrar alumnos del grupo
      const alumnosDelGrupo = matriculas.filter((m) => m.grupo === sesion.grupo);
      setAlumnosSesion(alumnosDelGrupo);

      // Cargar asistencias ya registradas
      const asistenciasRegistradas = await fetchAsistenciasPorSesion(sesion.id);
      setAsistenciasActuales(asistenciasRegistradas);

      // Marcar como presentes los que ya están registrados
      const presentesSet = new Set<string>(
        asistenciasRegistradas.filter((a) => a.presente).map((a) => a.alumno)
      );
      setPresentes(presentesSet);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de asistencia",
        variant: "destructive",
      });
      setAsistenciaDialogOpen(false);
    } finally {
      setLoadingAsistencia(false);
    }
  };

  const togglePresente = (alumnoId: string) => {
    const newPresentes = new Set(presentes);
    if (newPresentes.has(alumnoId)) {
      newPresentes.delete(alumnoId);
    } else {
      newPresentes.add(alumnoId);
    }
    setPresentes(newPresentes);
  };

  const handleGuardarAsistencia = async () => {
    if (!sesionSeleccionada) return;

    setLoadingAsistencia(true);
    try {
      // Crear array de asistencias para todos los alumnos del grupo
      const asistencias: CreateAsistenciaDTO[] = alumnosSesion.map((matricula) => ({
        sesion: sesionSeleccionada.id,
        alumno: matricula.alumno,
        presente: presentes.has(matricula.alumno),
        registrado_por: "sistema", // Aquí podrías poner el usuario actual
      }));

      await createAsistenciaBatch(asistencias);

      // Marcar la sesión como impartida
      await updateSesion(sesionSeleccionada.id, { estado: "impartida" });

      toast({
        title: "Asistencia guardada",
        description: `Se registró la asistencia de ${presentes.size} alumnos`,
      });

      setAsistenciaDialogOpen(false);
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la asistencia",
        variant: "destructive",
      });
    } finally {
      setLoadingAsistencia(false);
    }
  };

  // ========= ESTADÍSTICAS =========
  const calcularEstadisticas = () => {
    const totalSesiones = sesiones.length;
    const programadas = sesiones.filter((s) => s.estado === "programada").length;
    const impartidas = sesiones.filter((s) => s.estado === "impartida").length;
    const totalAsistencias = todasAsistencias.filter((a) => a.presente).length;

    return { totalSesiones, programadas, impartidas, totalAsistencias };
  };

  const calcularReporteAsistencia = () => {
    const reportePorAlumno: {
      [key: string]: {
        nombre: string;
        total: number;
        presentes: number;
        porcentaje: number;
      };
    } = {};

    todasAsistencias.forEach((asistencia) => {
      if (!reportePorAlumno[asistencia.alumno]) {
        reportePorAlumno[asistencia.alumno] = {
          nombre: asistencia.alumno_nombre || "Alumno",
          total: 0,
          presentes: 0,
          porcentaje: 0,
        };
      }
      reportePorAlumno[asistencia.alumno].total++;
      if (asistencia.presente) {
        reportePorAlumno[asistencia.alumno].presentes++;
      }
    });

    // Calcular porcentajes
    Object.keys(reportePorAlumno).forEach((alumnoId) => {
      const reporte = reportePorAlumno[alumnoId];
      reporte.porcentaje = reporte.total > 0 ? (reporte.presentes / reporte.total) * 100 : 0;
    });

    return Object.values(reportePorAlumno).sort((a, b) => b.porcentaje - a.porcentaje);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "programada":
        return <Badge className="bg-blue-100 text-blue-800">Programada</Badge>;
      case "impartida":
        return <Badge className="bg-green-100 text-green-800">Impartida</Badge>;
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const stats = calcularEstadisticas();
  const reporteAsistencia = calcularReporteAsistencia();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ClipboardList className="h-16 w-16 mx-auto mb-4 animate-pulse opacity-50" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Control de Asistencia</h2>
        <p className="text-muted-foreground">
          Gestión de sesiones y registro de asistencias
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSesiones}</div>
            <p className="text-xs text-muted-foreground">Todas las clases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programadas</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.programadas}</div>
            <p className="text-xs text-muted-foreground">Por impartir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impartidas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.impartidas}</div>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencias</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalAsistencias}
            </div>
            <p className="text-xs text-muted-foreground">Total registradas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sesiones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sesiones">
            <Calendar className="h-4 w-4 mr-2" />
            Sesiones
          </TabsTrigger>
          <TabsTrigger value="reporte">
            <TrendingUp className="h-4 w-4 mr-2" />
            Reporte de Asistencia
          </TabsTrigger>
        </TabsList>

        {/* ========= TAB DE SESIONES ========= */}
        <TabsContent value="sesiones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sesiones de Clase</CardTitle>
                  <CardDescription>
                    Gestiona las sesiones programadas e impartidas
                  </CardDescription>
                </div>
                <Button onClick={handleCrearSesion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Sesión
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sesiones.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No hay sesiones registradas</p>
                  <Button variant="link" onClick={handleCrearSesion}>
                    Crear primera sesión
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sesiones.map((sesion) => {
                      const grupo = grupos.find((g) => g.id === sesion.grupo);
                      const instructor = instructores.find(
                        (i) => i.id === sesion.instructor
                      );
                      return (
                        <TableRow key={sesion.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {new Date(sesion.fecha).toLocaleDateString("es-HN")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {grupo?.nombre_grupo || "Grupo"}
                              </div>
                              {grupo?.curso_detalle && (
                                <div className="text-sm text-muted-foreground">
                                  {grupo.curso_detalle.nombre}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              {sesion.hora_inicio} - {sesion.hora_fin}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {instructor
                                ? `${instructor.nombres} ${instructor.apellidos}`
                                : "Instructor"}
                            </div>
                          </TableCell>
                          <TableCell>{getEstadoBadge(sesion.estado)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {sesion.estado === "programada" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleTomarAsistencia(sesion)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Tomar Asistencia
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditarSesion(sesion)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarSesion(sesion.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========= TAB DE REPORTE ========= */}
        <TabsContent value="reporte" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Asistencia por Alumno</CardTitle>
              <CardDescription>
                Porcentaje de asistencia de cada alumno
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reporteAsistencia.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">
                    No hay datos de asistencia aún
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reporteAsistencia.slice(0, 20).map((reporte, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{reporte.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {reporte.presentes} de {reporte.total} clases
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-48 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              reporte.porcentaje >= 80
                                ? "bg-green-500"
                                : reporte.porcentaje >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${reporte.porcentaje}%` }}
                          />
                        </div>
                        <div className="text-right min-w-[60px]">
                          <div className="font-bold text-lg">
                            {reporte.porcentaje.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========= DIÁLOGO PARA CREAR/EDITAR SESIÓN ========= */}
      <Dialog open={sesionDialogOpen} onOpenChange={setSesionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingSesion ? "Editar Sesión" : "Nueva Sesión"}
            </DialogTitle>
            <DialogDescription>
              {editingSesion
                ? "Modifica la información de la sesión"
                : "Programa una nueva sesión de clase"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="grupo">Grupo *</Label>
              <Select
                value={sesionForm.grupo}
                onValueChange={(value) => setSesionForm({ ...sesionForm, grupo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {grupos
                    .filter((g) => g.estado === "activo")
                    .map((grupo) => (
                      <SelectItem key={grupo.id} value={grupo.id}>
                        {grupo.nombre_grupo}
                        {grupo.curso_detalle && ` - ${grupo.curso_detalle.nombre}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor *</Label>
              <Select
                value={sesionForm.instructor}
                onValueChange={(value) =>
                  setSesionForm({ ...sesionForm, instructor: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructores
                    .filter((i) => i.activo)
                    .map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.nombres} {instructor.apellidos}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={sesionForm.fecha}
                  onChange={(e) =>
                    setSesionForm({ ...sesionForm, fecha: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora inicio *</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={sesionForm.hora_inicio}
                  onChange={(e) =>
                    setSesionForm({ ...sesionForm, hora_inicio: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_fin">Hora fin *</Label>
                <Input
                  id="hora_fin"
                  type="time"
                  value={sesionForm.hora_fin}
                  onChange={(e) =>
                    setSesionForm({ ...sesionForm, hora_fin: e.target.value })
                  }
                />
              </div>
            </div>

            {editingSesion && (
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={sesionForm.estado}
                  onValueChange={(value: any) =>
                    setSesionForm({ ...sesionForm, estado: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="impartida">Impartida</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSesionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarSesion}>
              {editingSesion ? "Actualizar" : "Crear Sesión"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========= DIÁLOGO PARA TOMAR ASISTENCIA ========= */}
      <Dialog open={asistenciaDialogOpen} onOpenChange={setAsistenciaDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tomar Asistencia</DialogTitle>
            <DialogDescription>
              Marca los alumnos que asistieron a la clase
            </DialogDescription>
          </DialogHeader>

          {loadingAsistencia ? (
            <div className="flex items-center justify-center py-12">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sesionSeleccionada ? (
            <div className="space-y-6 py-4">
              {/* Info de la sesión */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Grupo:</span>
                      <div className="font-medium">
                        {grupos.find((g) => g.id === sesionSeleccionada.grupo)
                          ?.nombre_grupo || "Grupo"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha:</span>
                      <div className="font-medium">
                        {new Date(sesionSeleccionada.fecha).toLocaleDateString("es-HN")}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Horario:</span>
                      <div className="font-medium">
                        {sesionSeleccionada.hora_inicio} - {sesionSeleccionada.hora_fin}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Alumnos:</span>
                      <div className="font-medium">{alumnosSesion.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de alumnos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">
                    Lista de Alumnos ({presentes.size}/{alumnosSesion.length} presentes)
                  </Label>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPresentes(new Set(alumnosSesion.map((m) => m.alumno)))
                      }
                    >
                      Marcar Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPresentes(new Set())}
                    >
                      Desmarcar Todos
                    </Button>
                  </div>
                </div>

                {alumnosSesion.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No hay alumnos inscritos en este grupo</p>
                  </div>
                ) : (
                  <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                    {alumnosSesion.map((matricula) => (
                      <div
                        key={matricula.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`alumno-${matricula.alumno}`}
                            checked={presentes.has(matricula.alumno)}
                            onCheckedChange={() => togglePresente(matricula.alumno)}
                          />
                          <label
                            htmlFor={`alumno-${matricula.alumno}`}
                            className="cursor-pointer"
                          >
                            <div className="font-medium">
                              {matricula.alumno_detalle
                                ? `${matricula.alumno_detalle.nombres} ${matricula.alumno_detalle.apellidos}`
                                : "Alumno"}
                            </div>
                            {matricula.alumno_detalle?.email && (
                              <div className="text-sm text-muted-foreground">
                                {matricula.alumno_detalle.email}
                              </div>
                            )}
                          </label>
                        </div>
                        {presentes.has(matricula.alumno) ? (
                          <UserCheck className="h-5 w-5 text-green-600" />
                        ) : (
                          <UserX className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAsistenciaDialogOpen(false)}
              disabled={loadingAsistencia}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarAsistencia}
              disabled={loadingAsistencia || alumnosSesion.length === 0}
            >
              {loadingAsistencia ? "Guardando..." : "Guardar Asistencia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}