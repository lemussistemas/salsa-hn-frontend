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
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Receipt,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAlumnos,
  fetchGrupos,
  fetchMatriculas,
  fetchMatriculasVigentes,
  fetchMatriculasConDeuda,
  createMatricula,
  updateMatricula,
  deleteMatricula,
  fetchEstadoCuenta,
  type AlumnoDTO,
  type GrupoDTO,
  type MatriculaDTO,
  type CreateMatriculaDTO,
} from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type FiltroEstado = "todas" | "vigentes" | "con_deuda" | "vencidas" | "pausadas";

export default function MatriculasPage() {
  const { toast } = useToast();
  const [matriculas, setMatriculas] = useState<MatriculaDTO[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoDTO[]>([]);
  const [grupos, setGrupos] = useState<GrupoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroEstado>("todas");

  // Estados para diálogo de matrícula
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMatricula, setEditingMatricula] = useState<MatriculaDTO | null>(null);
  const [form, setForm] = useState<CreateMatriculaDTO>({
    alumno: "",
    grupo: "",
    ciclo: "mensual",
    fecha_inicio: new Date().toISOString().split("T")[0],
    estado: "vigente",
  });

  // Estados para estado de cuenta
  const [estadoCuentaOpen, setEstadoCuentaOpen] = useState(false);
  const [estadoCuenta, setEstadoCuenta] = useState<any>(null);
  const [loadingEstadoCuenta, setLoadingEstadoCuenta] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [matriculasData, alumnosData, gruposData] = await Promise.all([
        fetchMatriculas(),
        fetchAlumnos(),
        fetchGrupos(),
      ]);
      setMatriculas(matriculasData);
      setAlumnos(alumnosData);
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

  const cargarPorFiltro = async (filtroSeleccionado: FiltroEstado) => {
    setLoading(true);
    try {
      let data: MatriculaDTO[] = [];
      switch (filtroSeleccionado) {
        case "vigentes":
          data = await fetchMatriculasVigentes();
          break;
        case "con_deuda":
          data = await fetchMatriculasConDeuda();
          break;
        case "vencidas":
          const todas = await fetchMatriculas();
          data = todas.filter((m) => m.estado === "vencida");
          break;
        case "pausadas":
          const todasPausadas = await fetchMatriculas();
          data = todasPausadas.filter((m) => m.estado === "pausada");
          break;
        default:
          data = await fetchMatriculas();
      }
      setMatriculas(data);
      setFiltro(filtroSeleccionado);
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

  const handleCrear = () => {
    setEditingMatricula(null);
    setForm({
      alumno: "",
      grupo: "",
      ciclo: "mensual",
      fecha_inicio: new Date().toISOString().split("T")[0],
      estado: "vigente",
    });
    setDialogOpen(true);
  };

  const handleEditar = (matricula: MatriculaDTO) => {
    setEditingMatricula(matricula);
    setForm({
      alumno: matricula.alumno,
      grupo: matricula.grupo,
      ciclo: matricula.ciclo,
      fecha_inicio: matricula.fecha_inicio,
      fecha_fin: matricula.fecha_fin,
      estado: matricula.estado,
    });
    setDialogOpen(true);
  };

  const handleGuardar = async () => {
    try {
      if (editingMatricula) {
        await updateMatricula(editingMatricula.id, form);
        toast({
          title: "Matrícula actualizada",
          description: "La matrícula se actualizó correctamente",
        });
      } else {
        await createMatricula(form);
        toast({
          title: "Matrícula creada",
          description: "La matrícula se creó correctamente",
        });
      }
      setDialogOpen(false);
      cargarDatos();
    } catch (error: any) {
      const errorMsg = error.message || "No se pudo guardar la matrícula";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta matrícula?")) return;

    try {
      await deleteMatricula(id);
      toast({
        title: "Matrícula eliminada",
        description: "La matrícula se eliminó correctamente",
      });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la matrícula",
        variant: "destructive",
      });
    }
  };

  const handleVerEstadoCuenta = async (matricula: MatriculaDTO) => {
    setLoadingEstadoCuenta(true);
    setEstadoCuentaOpen(true);
    try {
      const data = await fetchEstadoCuenta(matricula.id);
      setEstadoCuenta(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el estado de cuenta",
        variant: "destructive",
      });
      setEstadoCuentaOpen(false);
    } finally {
      setLoadingEstadoCuenta(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "vigente":
        return <Badge className="bg-green-100 text-green-800">Vigente</Badge>;
      case "vencida":
        return <Badge className="bg-red-100 text-red-800">Vencida</Badge>;
      case "pausada":
        return <Badge className="bg-yellow-100 text-yellow-800">Pausada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getCicloBadge = (ciclo: string) => {
    return ciclo === "trimestral" ? (
      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
        Trimestral (10% desc)
      </Badge>
    ) : (
      <Badge variant="outline">Mensual</Badge>
    );
  };

  const calcularEstadisticas = () => {
    const total = matriculas.length;
    const vigentes = matriculas.filter((m) => m.estado === "vigente").length;
    const conDeuda = matriculas.filter(
      (m) => m.estado === "vigente" && parseFloat(m.saldo_actual) > 0
    ).length;
    const totalDeuda = matriculas
      .filter((m) => m.estado === "vigente")
      .reduce((sum, m) => sum + parseFloat(m.saldo_actual), 0);

    return { total, vigentes, conDeuda, totalDeuda };
  };

  const stats = calcularEstadisticas();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 animate-pulse opacity-50" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Matrículas</h2>
        <p className="text-muted-foreground">
          Administración de inscripciones y registros de alumnos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matrículas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Todas las inscripciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vigentes</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.vigentes}</div>
            <p className="text-xs text-muted-foreground">Matrículas activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Deuda</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.conDeuda}</div>
            <p className="text-xs text-muted-foreground">Requieren pago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              L {stats.totalDeuda.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Saldo pendiente total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Matrículas Registradas</CardTitle>
              <CardDescription>
                Gestiona las inscripciones de los alumnos a los grupos
              </CardDescription>
            </div>
            <Button onClick={handleCrear}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Matrícula
            </Button>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filtro === "todas" ? "default" : "outline"}
                size="sm"
                onClick={() => cargarPorFiltro("todas")}
              >
                Todas
              </Button>
              <Button
                variant={filtro === "vigentes" ? "default" : "outline"}
                size="sm"
                onClick={() => cargarPorFiltro("vigentes")}
              >
                Vigentes
              </Button>
              <Button
                variant={filtro === "con_deuda" ? "default" : "outline"}
                size="sm"
                onClick={() => cargarPorFiltro("con_deuda")}
              >
                Con Deuda
              </Button>
              <Button
                variant={filtro === "vencidas" ? "default" : "outline"}
                size="sm"
                onClick={() => cargarPorFiltro("vencidas")}
              >
                Vencidas
              </Button>
              <Button
                variant={filtro === "pausadas" ? "default" : "outline"}
                size="sm"
                onClick={() => cargarPorFiltro("pausadas")}
              >
                Pausadas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {matriculas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground mb-2">
                {filtro === "todas"
                  ? "No hay matrículas registradas"
                  : `No hay matrículas ${filtro}`}
              </p>
              {filtro === "todas" && (
                <Button variant="link" onClick={handleCrear}>
                  Crear primera matrícula
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Grupo/Curso</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matriculas.map((matricula) => (
                    <TableRow key={matricula.id}>
                      <TableCell>
                        <div className="space-y-1">
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
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {matricula.grupo_detalle?.nombre_grupo || "Grupo"}
                          </div>
                          {matricula.grupo_detalle?.curso_detalle && (
                            <div className="text-sm text-muted-foreground">
                              {matricula.grupo_detalle.curso_detalle.nombre} (
                              {matricula.grupo_detalle.curso_detalle.nivel})
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getCicloBadge(matricula.ciclo)}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          {new Date(matricula.fecha_inicio).toLocaleDateString("es-HN")}
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(matricula.estado)}</TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div
                            className={`font-bold ${
                              parseFloat(matricula.saldo_actual) > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            L {parseFloat(matricula.saldo_actual).toFixed(2)}
                          </div>
                          {parseFloat(matricula.saldo_actual) > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pendiente
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerEstadoCuenta(matricula)}
                            title="Ver estado de cuenta"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditar(matricula)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminar(matricula.id)}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de crear/editar matrícula */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingMatricula ? "Editar Matrícula" : "Nueva Matrícula"}
            </DialogTitle>
            <DialogDescription>
              {editingMatricula
                ? "Modifica la información de la matrícula"
                : "Inscribe un alumno a un grupo"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alumno">Alumno *</Label>
              <Select
                value={form.alumno}
                onValueChange={(value) => setForm({ ...form, alumno: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un alumno" />
                </SelectTrigger>
                <SelectContent>
                  {alumnos
                    .filter((a) => a.estado === "activo")
                    .map((alumno) => (
                      <SelectItem key={alumno.id} value={alumno.id}>
                        {alumno.nombres} {alumno.apellidos}
                        {alumno.email && ` (${alumno.email})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grupo">Grupo *</Label>
              <Select
                value={form.grupo}
                onValueChange={(value) => setForm({ ...form, grupo: value })}
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
                        {grupo.curso_detalle &&
                          ` - ${grupo.curso_detalle.nombre} (${grupo.curso_detalle.nivel})`}
                        {grupo.disponibles !== undefined &&
                          ` - ${grupo.disponibles} cupos disponibles`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciclo">Ciclo de pago *</Label>
                <Select
                  value={form.ciclo}
                  onValueChange={(value: any) => setForm({ ...form, ciclo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el ciclo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="trimestral">
                      Trimestral (10% descuento)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {form.ciclo === "trimestral"
                    ? "Se aplicará 10% de descuento"
                    : "Pago mensual sin descuento"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha de inicio *</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={form.fecha_inicio}
                  onChange={(e) =>
                    setForm({ ...form, fecha_inicio: e.target.value })
                  }
                />
              </div>
            </div>

            {editingMatricula && (
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={form.estado}
                  onValueChange={(value: any) => setForm({ ...form, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vigente">Vigente</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Nota importante:</p>
              <p>
                La deuda inicial se calculará automáticamente según el precio del curso
                y el ciclo seleccionado.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar}>
              {editingMatricula ? "Actualizar" : "Crear Matrícula"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet de estado de cuenta */}
      <Sheet open={estadoCuentaOpen} onOpenChange={setEstadoCuentaOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Estado de Cuenta</SheetTitle>
            <SheetDescription>
              Detalle de pagos y saldo de la matrícula
            </SheetDescription>
          </SheetHeader>
          {loadingEstadoCuenta ? (
            <div className="flex items-center justify-center py-12">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : estadoCuenta ? (
            <div className="space-y-6 py-6">
              {/* Información del alumno y grupo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Alumno:</span>
                    <span className="font-medium">
                      {estadoCuenta.matricula?.alumno_detalle
                        ? `${estadoCuenta.matricula.alumno_detalle.nombres} ${estadoCuenta.matricula.alumno_detalle.apellidos}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Grupo:</span>
                    <span className="font-medium">
                      {estadoCuenta.matricula?.grupo_detalle?.nombre_grupo || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ciclo:</span>
                    {getCicloBadge(estadoCuenta.matricula?.ciclo)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    {getEstadoBadge(estadoCuenta.matricula?.estado)}
                  </div>
                </CardContent>
              </Card>

              {/* Resumen financiero */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-900">Total Pagado:</span>
                    <span className="text-xl font-bold text-green-600">
                      L {parseFloat(estadoCuenta.total_pagado || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-red-900">Saldo Pendiente:</span>
                    <span className="text-xl font-bold text-red-600">
                      L {parseFloat(estadoCuenta.saldo_pendiente || 0).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Historial de pagos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historial de Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                  {estadoCuenta.pagos && estadoCuenta.pagos.length > 0 ? (
                    <div className="space-y-3">
                      {estadoCuenta.pagos.map((pago: any) => (
                        <div
                          key={pago.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                L {parseFloat(pago.monto).toFixed(2)}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(pago.fecha).toLocaleDateString("es-HN")}
                            </div>
                          </div>
                          <Badge variant="outline">{pago.metodo}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No hay pagos registrados
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No se pudo cargar el estado de cuenta
            </p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}