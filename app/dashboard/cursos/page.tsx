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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchCursos,
  createCurso,
  updateCurso,
  deleteCurso,
  fetchGrupos,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  type CursoDTO,
  type CreateCursoDTO,
  type GrupoDTO,
  type CreateGrupoDTO,
} from "@/lib/api";

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const NIVELES = ["básico", "intermedio", "avanzado"] as const;

export default function CursosPage() {
  const { toast } = useToast();
  const [cursos, setCursos] = useState<CursoDTO[]>([]);
  const [grupos, setGrupos] = useState<GrupoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para diálogos de cursos
  const [cursoDialogOpen, setCursoDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<CursoDTO | null>(null);
  const [cursoForm, setCursoForm] = useState<CreateCursoDTO>({
    nombre: "",
    nivel: "básico",
    precio_base: 0,
    estado: "activo",
  });

  // Estados para diálogos de grupos
  const [grupoDialogOpen, setGrupoDialogOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoDTO | null>(null);
  const [grupoForm, setGrupoForm] = useState<CreateGrupoDTO>({
    curso: "",
    nombre_grupo: "",
    cupo: 20,
    dia_semana: "",
    hora_inicio: "",
    hora_fin: "",
    sede: "",
    estado: "activo",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [cursosData, gruposData] = await Promise.all([
        fetchCursos(),
        fetchGrupos(),
      ]);
      setCursos(cursosData);
      setGrupos(gruposData);
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

  // ========= FUNCIONES PARA CURSOS =========
  const handleCrearCurso = () => {
    setEditingCurso(null);
    setCursoForm({
      nombre: "",
      nivel: "básico",
      precio_base: 0,
      estado: "activo",
    });
    setCursoDialogOpen(true);
  };

  const handleEditarCurso = (curso: CursoDTO) => {
    setEditingCurso(curso);
    setCursoForm({
      nombre: curso.nombre,
      nivel: curso.nivel,
      precio_base: parseFloat(curso.precio_base),
      estado: curso.estado,
    });
    setCursoDialogOpen(true);
  };

  const handleGuardarCurso = async () => {
    try {
      if (editingCurso) {
        await updateCurso(editingCurso.id, cursoForm);
        toast({
          title: "Curso actualizado",
          description: "El curso se actualizó correctamente",
        });
      } else {
        await createCurso(cursoForm);
        toast({
          title: "Curso creado",
          description: "El curso se creó correctamente",
        });
      }
      setCursoDialogOpen(false);
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el curso",
        variant: "destructive",
      });
    }
  };

  const handleEliminarCurso = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este curso?")) return;

    try {
      await deleteCurso(id);
      toast({
        title: "Curso eliminado",
        description: "El curso se eliminó correctamente",
      });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el curso",
        variant: "destructive",
      });
    }
  };

  // ========= FUNCIONES PARA GRUPOS =========
  const handleCrearGrupo = () => {
    setEditingGrupo(null);
    setGrupoForm({
      curso: "",
      nombre_grupo: "",
      cupo: 20,
      dia_semana: "",
      hora_inicio: "",
      hora_fin: "",
      sede: "",
      estado: "activo",
    });
    setGrupoDialogOpen(true);
  };

  const handleEditarGrupo = (grupo: GrupoDTO) => {
    setEditingGrupo(grupo);
    setGrupoForm({
      curso: grupo.curso,
      nombre_grupo: grupo.nombre_grupo,
      cupo: grupo.cupo,
      dia_semana: grupo.dia_semana,
      hora_inicio: grupo.hora_inicio,
      hora_fin: grupo.hora_fin,
      sede: grupo.sede,
      estado: grupo.estado,
    });
    setGrupoDialogOpen(true);
  };

  const handleGuardarGrupo = async () => {
    try {
      if (editingGrupo) {
        await updateGrupo(editingGrupo.id, grupoForm);
        toast({
          title: "Grupo actualizado",
          description: "El grupo se actualizó correctamente",
        });
      } else {
        await createGrupo(grupoForm);
        toast({
          title: "Grupo creado",
          description: "El grupo se creó correctamente",
        });
      }
      setGrupoDialogOpen(false);
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el grupo",
        variant: "destructive",
      });
    }
  };

  const handleEliminarGrupo = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este grupo?")) return;

    try {
      await deleteGrupo(id);
      toast({
        title: "Grupo eliminado",
        description: "El grupo se eliminó correctamente",
      });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el grupo",
        variant: "destructive",
      });
    }
  };

  const getNivelBadgeColor = (nivel: string) => {
    switch (nivel) {
      case "básico":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "intermedio":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "avanzado":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 animate-pulse opacity-50" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h2>
        <p className="text-muted-foreground">
          Administración de cursos y grupos de salsa
        </p>
      </div>

      <Tabs defaultValue="cursos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cursos">
            <GraduationCap className="h-4 w-4 mr-2" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="grupos">
            <Users className="h-4 w-4 mr-2" />
            Grupos
          </TabsTrigger>
        </TabsList>

        {/* ========= TAB DE CURSOS ========= */}
        <TabsContent value="cursos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cursos de Salsa</CardTitle>
                  <CardDescription>
                    Gestiona los diferentes niveles y tipos de cursos
                  </CardDescription>
                </div>
                <Button onClick={handleCrearCurso}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Curso
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cursos.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No hay cursos registrados</p>
                  <Button variant="link" onClick={handleCrearCurso}>
                    Crear primer curso
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cursos.map((curso) => (
                    <Card key={curso.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-xl">
                              {curso.nombre}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={getNivelBadgeColor(curso.nivel)}>
                                {curso.nivel}
                              </Badge>
                              <Badge
                                variant={
                                  curso.estado === "activo" ? "default" : "secondary"
                                }
                              >
                                {curso.estado}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-semibold text-lg">
                              L {parseFloat(curso.precio_base).toFixed(2)}
                            </span>
                            <span className="text-muted-foreground ml-1">/mes</span>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarCurso(curso)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEliminarCurso(curso.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========= TAB DE GRUPOS ========= */}
        <TabsContent value="grupos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Grupos y Horarios</CardTitle>
                  <CardDescription>
                    Gestiona los horarios y grupos de clases
                  </CardDescription>
                </div>
                <Button onClick={handleCrearGrupo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Grupo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {grupos.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No hay grupos registrados</p>
                  <Button variant="link" onClick={handleCrearGrupo}>
                    Crear primer grupo
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Sede</TableHead>
                      <TableHead>Cupo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grupos.map((grupo) => (
                      <TableRow key={grupo.id}>
                        <TableCell className="font-medium">
                          {grupo.nombre_grupo}
                        </TableCell>
                        <TableCell>
                          {grupo.curso_detalle ? (
                            <div className="space-y-1">
                              <div className="font-medium">
                                {grupo.curso_detalle.nombre}
                              </div>
                              <Badge
                                className={getNivelBadgeColor(
                                  grupo.curso_detalle.nivel
                                )}
                                variant="outline"
                              >
                                {grupo.curso_detalle.nivel}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              {grupo.dia_semana}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {grupo.hora_inicio} - {grupo.hora_fin}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            {grupo.sede || "Sin especificar"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {grupo.inscritos || 0} / {grupo.cupo}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  (grupo.inscritos || 0) >= grupo.cupo
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                                style={{
                                  width: `${
                                    ((grupo.inscritos || 0) / grupo.cupo) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              grupo.estado === "activo" ? "default" : "secondary"
                            }
                          >
                            {grupo.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarGrupo(grupo)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarGrupo(grupo.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========= DIÁLOGO PARA CREAR/EDITAR CURSO ========= */}
      <Dialog open={cursoDialogOpen} onOpenChange={setCursoDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCurso ? "Editar Curso" : "Nuevo Curso"}
            </DialogTitle>
            <DialogDescription>
              {editingCurso
                ? "Modifica la información del curso"
                : "Crea un nuevo curso de salsa"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del curso *</Label>
              <Input
                id="nombre"
                placeholder="ej: Salsa On1, Bachata Sensual"
                value={cursoForm.nombre}
                onChange={(e) =>
                  setCursoForm({ ...cursoForm, nombre: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel *</Label>
              <Select
                value={cursoForm.nivel}
                onValueChange={(value: any) =>
                  setCursoForm({ ...cursoForm, nivel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el nivel" />
                </SelectTrigger>
                <SelectContent>
                  {NIVELES.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio mensual (L) *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                placeholder="800.00"
                value={cursoForm.precio_base}
                onChange={(e) =>
                  setCursoForm({
                    ...cursoForm,
                    precio_base: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={cursoForm.estado}
                onValueChange={(value: any) =>
                  setCursoForm({ ...cursoForm, estado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCursoDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleGuardarCurso}>
              {editingCurso ? "Actualizar" : "Crear Curso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========= DIÁLOGO PARA CREAR/EDITAR GRUPO ========= */}
      <Dialog open={grupoDialogOpen} onOpenChange={setGrupoDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingGrupo ? "Editar Grupo" : "Nuevo Grupo"}
            </DialogTitle>
            <DialogDescription>
              {editingGrupo
                ? "Modifica la información del grupo"
                : "Crea un nuevo grupo de clases"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="curso">Curso *</Label>
              <Select
                value={grupoForm.curso}
                onValueChange={(value) =>
                  setGrupoForm({ ...grupoForm, curso: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos
                    .filter((c) => c.estado === "activo")
                    .map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.nombre} ({curso.nivel})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre_grupo">Nombre del grupo *</Label>
              <Input
                id="nombre_grupo"
                placeholder="ej: Salsa Básico Lunes 7 PM"
                value={grupoForm.nombre_grupo}
                onChange={(e) =>
                  setGrupoForm({ ...grupoForm, nombre_grupo: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dia">Día de la semana *</Label>
                <Select
                  value={grupoForm.dia_semana}
                  onValueChange={(value) =>
                    setGrupoForm({ ...grupoForm, dia_semana: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAS_SEMANA.map((dia) => (
                      <SelectItem key={dia} value={dia}>
                        {dia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cupo">Cupo máximo *</Label>
                <Input
                  id="cupo"
                  type="number"
                  placeholder="20"
                  value={grupoForm.cupo}
                  onChange={(e) =>
                    setGrupoForm({
                      ...grupoForm,
                      cupo: parseInt(e.target.value) || 20,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora inicio *</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={grupoForm.hora_inicio}
                  onChange={(e) =>
                    setGrupoForm({ ...grupoForm, hora_inicio: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_fin">Hora fin *</Label>
                <Input
                  id="hora_fin"
                  type="time"
                  value={grupoForm.hora_fin}
                  onChange={(e) =>
                    setGrupoForm({ ...grupoForm, hora_fin: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sede">Sede</Label>
              <Input
                id="sede"
                placeholder="ej: Academia Centro, Colonia Palmira"
                value={grupoForm.sede}
                onChange={(e) =>
                  setGrupoForm({ ...grupoForm, sede: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_grupo">Estado</Label>
              <Select
                value={grupoForm.estado}
                onValueChange={(value: any) =>
                  setGrupoForm({ ...grupoForm, estado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGrupoDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleGuardarGrupo}>
              {editingGrupo ? "Actualizar" : "Crear Grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}