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
import {
  DollarSign,
  Plus,
  Trash2,
  CreditCard,
  Receipt,
  TrendingUp,
  Calendar,
  FileText,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchMatriculasVigentes,
  fetchMatriculasConDeuda,
  fetchPagos,
  createPago,
  deletePago,
  fetchFacturas,
  type MatriculaDTO,
  type PagoDTO,
  type CreatePagoDTO,
  type FacturaDTO,
} from "@/lib/api";

type FiltroMetodo = "todos" | "efectivo" | "transferencia" | "tarjeta";
type FiltroPeriodo = "todos" | "hoy" | "semana" | "mes" | "año";

export default function PagosPage() {
  const { toast } = useToast();
  const [pagos, setPagos] = useState<PagoDTO[]>([]);
  const [facturas, setFacturas] = useState<FacturaDTO[]>([]);
  const [matriculas, setMatriculas] = useState<MatriculaDTO[]>([]);
  const [matriculasConDeuda, setMatriculasConDeuda] = useState<MatriculaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroMetodo, setFiltroMetodo] = useState<FiltroMetodo>("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>("todos");

  // Estados para diálogo de pago
  const [pagoDialogOpen, setPagoDialogOpen] = useState(false);
  const [pagoForm, setPagoForm] = useState<CreatePagoDTO>({
    matricula: "",
    monto: 0,
    metodo: "efectivo",
    referencia: "",
    estado: "aplicado",
  });

  // Estado para quick pay
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState<MatriculaDTO | null>(
    null
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [pagosData, facturasData, matriculasData, conDeudaData] = await Promise.all([
        fetchPagos(),
        fetchFacturas(),
        fetchMatriculasVigentes(),
        fetchMatriculasConDeuda(),
      ]);
      setPagos(pagosData);
      setFacturas(facturasData);
      setMatriculas(matriculasData);
      setMatriculasConDeuda(conDeudaData);
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

  const handleCrearPago = (matricula?: MatriculaDTO) => {
    if (matricula) {
      setMatriculaSeleccionada(matricula);
      setPagoForm({
        matricula: matricula.id,
        monto: parseFloat(matricula.saldo_actual),
        metodo: "efectivo",
        referencia: "",
        estado: "aplicado",
      });
    } else {
      setMatriculaSeleccionada(null);
      setPagoForm({
        matricula: "",
        monto: 0,
        metodo: "efectivo",
        referencia: "",
        estado: "aplicado",
      });
    }
    setPagoDialogOpen(true);
  };

  const handleGuardarPago = async () => {
    try {
      await createPago(pagoForm);
      toast({
        title: "Pago registrado",
        description: "El pago se registró correctamente y se generó la factura",
      });
      setPagoDialogOpen(false);
      cargarDatos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el pago",
        variant: "destructive",
      });
    }
  };

  const handleEliminarPago = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este pago?")) return;

    try {
      await deletePago(id);
      toast({
        title: "Pago eliminado",
        description: "El pago se eliminó correctamente",
      });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el pago",
        variant: "destructive",
      });
    }
  };

  // Filtrado de pagos
  const pagosFiltrados = pagos.filter((pago) => {
    // Filtro por método
    if (filtroMetodo !== "todos" && pago.metodo !== filtroMetodo) {
      return false;
    }

    // Filtro por período
    if (filtroPeriodo !== "todos") {
      const fechaPago = new Date(pago.fecha);
      const hoy = new Date();

      switch (filtroPeriodo) {
        case "hoy":
          if (
            fechaPago.toDateString() !== hoy.toDateString()
          ) {
            return false;
          }
          break;
        case "semana":
          const haceSemana = new Date(hoy);
          haceSemana.setDate(hoy.getDate() - 7);
          if (fechaPago < haceSemana) {
            return false;
          }
          break;
        case "mes":
          if (
            fechaPago.getMonth() !== hoy.getMonth() ||
            fechaPago.getFullYear() !== hoy.getFullYear()
          ) {
            return false;
          }
          break;
        case "año":
          if (fechaPago.getFullYear() !== hoy.getFullYear()) {
            return false;
          }
          break;
      }
    }

    return true;
  });

  // Estadísticas
  const calcularEstadisticas = () => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const totalPagos = pagos.length;
    const pagosMes = pagos.filter(
      (p) => new Date(p.fecha) >= inicioMes && p.estado === "aplicado"
    );
    const ingresosMes = pagosMes.reduce((sum, p) => sum + parseFloat(p.monto), 0);

    const pagosHoy = pagos.filter(
      (p) =>
        new Date(p.fecha).toDateString() === hoy.toDateString() &&
        p.estado === "aplicado"
    );
    const ingresosHoy = pagosHoy.reduce((sum, p) => sum + parseFloat(p.monto), 0);

    const totalPorCobrar = matriculasConDeuda.reduce(
      (sum, m) => sum + parseFloat(m.saldo_actual),
      0
    );

    return { totalPagos, ingresosMes, ingresosHoy, totalPorCobrar };
  };

  // Estadísticas por método de pago
  const calcularPorMetodo = () => {
    const efectivo = pagos
      .filter((p) => p.metodo === "efectivo" && p.estado === "aplicado")
      .reduce((sum, p) => sum + parseFloat(p.monto), 0);
    const transferencia = pagos
      .filter((p) => p.metodo === "transferencia" && p.estado === "aplicado")
      .reduce((sum, p) => sum + parseFloat(p.monto), 0);
    const tarjeta = pagos
      .filter((p) => p.metodo === "tarjeta" && p.estado === "aplicado")
      .reduce((sum, p) => sum + parseFloat(p.monto), 0);

    return { efectivo, transferencia, tarjeta };
  };

  const getMetodoBadge = (metodo: string) => {
    switch (metodo) {
      case "efectivo":
        return (
          <Badge className="bg-green-100 text-green-800">
            <DollarSign className="h-3 w-3 mr-1" />
            Efectivo
          </Badge>
        );
      case "transferencia":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CreditCard className="h-3 w-3 mr-1" />
            Transferencia
          </Badge>
        );
      case "tarjeta":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <CreditCard className="h-3 w-3 mr-1" />
            Tarjeta
          </Badge>
        );
      default:
        return <Badge variant="outline">{metodo}</Badge>;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "aplicado":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aplicado
          </Badge>
        );
      case "pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "anulado":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Anulado
          </Badge>
        );
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const stats = calcularEstadisticas();
  const porMetodo = calcularPorMetodo();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <DollarSign className="h-16 w-16 mx-auto mb-4 animate-pulse opacity-50" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h2>
        <p className="text-muted-foreground">
          Registro de pagos, facturas y control de ingresos
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPagos}</div>
            <p className="text-xs text-muted-foreground">Pagos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              L {stats.ingresosHoy.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total del día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              L {stats.ingresosMes.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total mensual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              L {stats.totalPorCobrar.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Saldo pendiente</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pagos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pagos">
            <Receipt className="h-4 w-4 mr-2" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="pendientes">
            <Clock className="h-4 w-4 mr-2" />
            Pendientes de Pago
          </TabsTrigger>
          <TabsTrigger value="facturas">
            <FileText className="h-4 w-4 mr-2" />
            Facturas
          </TabsTrigger>
          <TabsTrigger value="estadisticas">
            <TrendingUp className="h-4 w-4 mr-2" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* ========= TAB DE PAGOS ========= */}
        <TabsContent value="pagos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registro de Pagos</CardTitle>
                  <CardDescription>Historial de pagos recibidos</CardDescription>
                </div>
                <Button onClick={() => handleCrearPago()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Pago
                </Button>
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filtros:</span>
                </div>

                <Select value={filtroMetodo} onValueChange={(v: any) => setFiltroMetodo(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los métodos</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filtroPeriodo}
                  onValueChange={(v: any) => setFiltroPeriodo(v)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="semana">Última semana</SelectItem>
                    <SelectItem value="mes">Este mes</SelectItem>
                    <SelectItem value="año">Este año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {pagosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">
                    No hay pagos que coincidan con los filtros
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Alumno</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagosFiltrados.map((pago) => {
                      const matricula = matriculas.find((m) => m.id === pago.matricula);
                      return (
                        <TableRow key={pago.id}>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              {new Date(pago.fecha).toLocaleDateString("es-HN")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(pago.fecha).toLocaleTimeString("es-HN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            {matricula?.alumno_detalle ? (
                              <div>
                                <div className="font-medium">
                                  {matricula.alumno_detalle.nombres}{" "}
                                  {matricula.alumno_detalle.apellidos}
                                </div>
                                {matricula.alumno_detalle.email && (
                                  <div className="text-xs text-muted-foreground">
                                    {matricula.alumno_detalle.email}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {matricula?.grupo_detalle ? (
                              <div className="text-sm">
                                {matricula.grupo_detalle.nombre_grupo}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-green-600">
                              L {parseFloat(pago.monto).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>{getMetodoBadge(pago.metodo)}</TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {pago.referencia || "-"}
                            </div>
                          </TableCell>
                          <TableCell>{getEstadoBadge(pago.estado)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {pago.factura && (
                                <Button variant="ghost" size="sm" title="Ver factura">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarPago(pago.id)}
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

        {/* ========= TAB DE PENDIENTES ========= */}
        <TabsContent value="pendientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matrículas con Saldo Pendiente</CardTitle>
              <CardDescription>
                Alumnos que tienen pagos pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matriculasConDeuda.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
                  <p className="text-lg font-medium text-green-600">
                    ¡Todo al día!
                  </p>
                  <p className="text-muted-foreground">
                    No hay pagos pendientes
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matriculasConDeuda.map((matricula) => (
                    <div
                      key={matricula.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {matricula.alumno_detalle
                            ? `${matricula.alumno_detalle.nombres} ${matricula.alumno_detalle.apellidos}`
                            : "Alumno"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {matricula.grupo_detalle?.nombre_grupo || "Grupo"}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            L {parseFloat(matricula.saldo_actual).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">Pendiente</div>
                        </div>
                        <Button
                          onClick={() => handleCrearPago(matricula)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Registrar Pago
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========= TAB DE FACTURAS ========= */}
        <TabsContent value="facturas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facturas Emitidas</CardTitle>
              <CardDescription>Historial de facturas generadas</CardDescription>
            </CardHeader>
            <CardContent>
              {facturas.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No hay facturas emitidas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Impuestos</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturas.map((factura) => (
                      <TableRow key={factura.id}>
                        <TableCell className="font-medium">{factura.numero}</TableCell>
                        <TableCell>
                          {new Date(factura.fecha).toLocaleDateString("es-HN")}
                        </TableCell>
                        <TableCell>L {parseFloat(factura.subtotal).toFixed(2)}</TableCell>
                        <TableCell>
                          L {parseFloat(factura.impuestos).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-bold">
                          L {parseFloat(factura.total).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              factura.estado === "emitida" ? "default" : "secondary"
                            }
                          >
                            {factura.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========= TAB DE ESTADÍSTICAS ========= */}
        <TabsContent value="estadisticas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Método de Pago</CardTitle>
              <CardDescription>Distribución de pagos recibidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-green-500" />
                      <span className="font-medium">Efectivo</span>
                    </div>
                    <span className="text-xl font-bold">
                      L {porMetodo.efectivo.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-green-500"
                      style={{
                        width: `${
                          (porMetodo.efectivo /
                            (porMetodo.efectivo +
                              porMetodo.transferencia +
                              porMetodo.tarjeta || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-blue-500" />
                      <span className="font-medium">Transferencia</span>
                    </div>
                    <span className="text-xl font-bold">
                      L {porMetodo.transferencia.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-500"
                      style={{
                        width: `${
                          (porMetodo.transferencia /
                            (porMetodo.efectivo +
                              porMetodo.transferencia +
                              porMetodo.tarjeta || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-purple-500" />
                      <span className="font-medium">Tarjeta</span>
                    </div>
                    <span className="text-xl font-bold">
                      L {porMetodo.tarjeta.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-purple-500"
                      style={{
                        width: `${
                          (porMetodo.tarjeta /
                            (porMetodo.efectivo +
                              porMetodo.transferencia +
                              porMetodo.tarjeta || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      L{" "}
                      {(
                        porMetodo.efectivo +
                        porMetodo.transferencia +
                        porMetodo.tarjeta
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========= DIÁLOGO PARA REGISTRAR PAGO ========= */}
      <Dialog open={pagoDialogOpen} onOpenChange={setPagoDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Registra un nuevo pago recibido de un alumno
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {matriculaSeleccionada ? (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="font-medium">
                      {matriculaSeleccionada.alumno_detalle
                        ? `${matriculaSeleccionada.alumno_detalle.nombres} ${matriculaSeleccionada.alumno_detalle.apellidos}`
                        : "Alumno"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {matriculaSeleccionada.grupo_detalle?.nombre_grupo || "Grupo"}
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Saldo: L {parseFloat(matriculaSeleccionada.saldo_actual).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula *</Label>
                <Select
                  value={pagoForm.matricula}
                  onValueChange={(value) => {
                    const mat = matriculas.find((m) => m.id === value);
                    setPagoForm({ 
                      ...pagoForm, 
                      matricula: value,
                      monto: mat ? parseFloat(mat.saldo_actual) : 0
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una matrícula" />
                  </SelectTrigger>
                  <SelectContent>
                    {matriculas.map((matricula) => (
                      <SelectItem key={matricula.id} value={matricula.id}>
                        {matricula.alumno_detalle
                          ? `${matricula.alumno_detalle.nombres} ${matricula.alumno_detalle.apellidos}`
                          : "Alumno"}{" "}
                        - L {parseFloat(matricula.saldo_actual).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="monto">Monto (L) *</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={pagoForm.monto}
                onChange={(e) =>
                  setPagoForm({ ...pagoForm, monto: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo">Método de pago *</Label>
              <Select
                value={pagoForm.metodo}
                onValueChange={(value: any) => setPagoForm({ ...pagoForm, metodo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pagoForm.metodo !== "efectivo" && (
              <div className="space-y-2">
                <Label htmlFor="referencia">
                  Referencia {pagoForm.metodo === "transferencia" ? "(No. de transacción)" : "(No. de autorización)"}
                </Label>
                <Input
                  id="referencia"
                  placeholder="Ej: 1234567890"
                  value={pagoForm.referencia}
                  onChange={(e) =>
                    setPagoForm({ ...pagoForm, referencia: e.target.value })
                  }
                />
              </div>
            )}

            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium mb-1">✅ Nota:</p>
              <p>
                Al registrar el pago, se actualizará el saldo de la matrícula y se
                generará automáticamente una factura.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPagoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarPago} disabled={!pagoForm.matricula || pagoForm.monto <= 0}>
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}