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
  Calendar,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Ticket as TicketIcon,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  TrendingUp,
  PartyPopper,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAlumnos,
  fetchEventos,
  fetchEvento,
  createEvento,
  updateEvento,
  deleteEvento,
  fetchTickets,
  fetchTicketsPorEvento,
  createTicket,
  deleteTicket,
  type AlumnoDTO,
  type EventoDTO,
  type CreateEventoDTO,
  type TicketDTO,
  type CreateTicketDTO,
} from "@/lib/api";

export default function EventosPage() {
  const { toast } = useToast();
  const [eventos, setEventos] = useState<EventoDTO[]>([]);
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para diálogo de evento
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoDTO | null>(null);
  const [eventoForm, setEventoForm] = useState<CreateEventoDTO>({
    nombre: "",
    fecha: new Date().toISOString().split("T")[0] + "T19:00",
    sede: "",
    aforo: 100,
    precio: 0,
    estado: "programado",
  });

  // Estados para venta de tickets
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoDTO | null>(null);
  const [ticketsEvento, setTicketsEvento] = useState<TicketDTO[]>([]);
  const [ticketForm, setTicketForm] = useState<CreateTicketDTO>({
    evento: "",
    alumno: null,
    comprador_nombre: "",
    comprador_email: "",
    precio: 0,
    estado: "vendido",
  });

  // Estados para ver tickets de un evento
  const [verTicketsDialogOpen, setVerTicketsDialogOpen] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [eventosData, ticketsData, alumnosData] = await Promise.all([
        fetchEventos(),
        fetchTickets(),
        fetchAlumnos(),
      ]);
      setEventos(eventosData);
      setTickets(ticketsData);
      setAlumnos(alumnosData);
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

  // ========= FUNCIONES PARA EVENTOS =========
  const handleCrearEvento = () => {
    setEditingEvento(null);
    setEventoForm({
      nombre: "",
      fecha: new Date().toISOString().split("T")[0] + "T19:00",
      sede: "",
      aforo: 100,
      precio: 0,
      estado: "programado",
    });
    setEventoDialogOpen(true);
  };

  const handleEditarEvento = (evento: EventoDTO) => {
    setEditingEvento(evento);
    setEventoForm({
      nombre: evento.nombre,
      fecha: evento.fecha,
      sede: evento.sede,
      aforo: evento.aforo,
      precio: parseFloat(evento.precio),
      estado: evento.estado,
    });
    setEventoDialogOpen(true);
  };

  const handleGuardarEvento = async () => {
    try {
      if (editingEvento) {
        await updateEvento(editingEvento.id, eventoForm);
        toast({
          title: "Evento actualizado",
          description: "El evento se actualizó correctamente",
        });
      } else {
        await createEvento(eventoForm);
        toast({
          title: "Evento creado",
          description: "El evento se creó correctamente",
        });
      }
      setEventoDialogOpen(false);
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el evento",
        variant: "destructive",
      });
    }
  };

  const handleEliminarEvento = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este evento?")) return;

    try {
      await deleteEvento(id);
      toast({
        title: "Evento eliminado",
        description: "El evento se eliminó correctamente",
      });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive",
      });
    }
  };

  // ========= FUNCIONES PARA TICKETS =========
  const handleVenderTicket = (evento: EventoDTO) => {
    setEventoSeleccionado(evento);
    setTicketForm({
      evento: evento.id,
      alumno: null,
      comprador_nombre: "",
      comprador_email: "",
      precio: parseFloat(evento.precio),
      estado: "vendido",
    });
    setTicketDialogOpen(true);
  };

  const handleGuardarTicket = async () => {
    try {
      await createTicket(ticketForm);
      toast({
        title: "Ticket vendido",
        description: "El ticket se registró correctamente",
      });
      setTicketDialogOpen(false);
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el ticket",
        variant: "destructive",
      });
    }
  };

  const handleVerTickets = async (evento: EventoDTO) => {
    setEventoSeleccionado(evento);
    setLoadingTickets(true);
    setVerTicketsDialogOpen(true);

    try {
      const ticketsData = await fetchTicketsPorEvento(evento.id);
      setTicketsEvento(ticketsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los tickets",
        variant: "destructive",
      });
      setVerTicketsDialogOpen(false);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleEliminarTicket = async (id: string) => {
    if (!confirm("¿Está seguro de anular este ticket?")) return;

    try {
      await deleteTicket(id);
      toast({
        title: "Ticket anulado",
        description: "El ticket se anuló correctamente",
      });
      if (eventoSeleccionado) {
        handleVerTickets(eventoSeleccionado);
      }
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo anular el ticket",
        variant: "destructive",
      });
    }
  };

  const handleSeleccionarAlumno = (alumnoId: string | null) => {
    if (alumnoId) {
      const alumno = alumnos.find((a) => a.id === alumnoId);
      if (alumno) {
        setTicketForm({
          ...ticketForm,
          alumno: alumnoId,
          comprador_nombre: `${alumno.nombres} ${alumno.apellidos}`,
          comprador_email: alumno.email || "",
        });
      }
    } else {
      setTicketForm({
        ...ticketForm,
        alumno: null,
        comprador_nombre: "",
        comprador_email: "",
      });
    }
  };

  // Estadísticas
  const calcularEstadisticas = () => {
    const totalEventos = eventos.length;
    const proximos = eventos.filter(
      (e) => e.estado === "programado" && new Date(e.fecha) > new Date()
    ).length;
    const realizados = eventos.filter((e) => e.estado === "realizado").length;
    const totalTickets = tickets.filter((t) => t.estado === "vendido").length;
    const ingresos = tickets
      .filter((t) => t.estado === "vendido")
      .reduce((sum, t) => sum + parseFloat(t.precio), 0);

    return { totalEventos, proximos, realizados, totalTickets, ingresos };
  };

  const calcularTicketsPorEvento = (eventoId: string) => {
    const evento = eventos.find((e) => e.id === eventoId);
    if (!evento) return { vendidos: 0, disponibles: 0, porcentaje: 0 };

    const vendidos = tickets.filter(
      (t) => t.evento === eventoId && t.estado === "vendido"
    ).length;
    const disponibles = evento.aforo - vendidos;
    const porcentaje = evento.aforo > 0 ? (vendidos / evento.aforo) * 100 : 0;

    return { vendidos, disponibles, porcentaje };
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "programado":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Programado
          </Badge>
        );
      case "realizado":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Realizado
          </Badge>
        );
      case "cancelado":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const stats = calcularEstadisticas();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <PartyPopper className="h-16 w-16 mx-auto mb-4 animate-pulse opacity-50" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Eventos</h2>
        <p className="text-muted-foreground">
          Administración de eventos especiales y venta de tickets
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <PartyPopper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEventos}</div>
            <p className="text-xs text-muted-foreground">Eventos creados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.proximos}</div>
            <p className="text-xs text-muted-foreground">Por realizarse</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realizados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.realizados}</div>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Vendidos</CardTitle>
            <TicketIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">Total vendidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              L {stats.ingresos.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Por eventos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="eventos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="eventos">
            <PartyPopper className="h-4 w-4 mr-2" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <TicketIcon className="h-4 w-4 mr-2" />
            Todos los Tickets
          </TabsTrigger>
        </TabsList>

        {/* ========= TAB DE EVENTOS ========= */}
        <TabsContent value="eventos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Eventos Especiales</CardTitle>
                  <CardDescription>
                    Gestiona conciertos, sociales y eventos especiales
                  </CardDescription>
                </div>
                <Button onClick={handleCrearEvento}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Evento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {eventos.length === 0 ? (
                <div className="text-center py-12">
                  <PartyPopper className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No hay eventos registrados</p>
                  <Button variant="link" onClick={handleCrearEvento}>
                    Crear primer evento
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {eventos.map((evento) => {
                    const statsEvento = calcularTicketsPorEvento(evento.id);
                    return (
                      <Card
                        key={evento.id}
                        className="hover:shadow-lg transition-shadow overflow-hidden"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <CardTitle className="text-lg">{evento.nombre}</CardTitle>
                              {getEstadoBadge(evento.estado)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(evento.fecha).toLocaleDateString("es-HN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="h-4 w-4 mr-2" />
                              {new Date(evento.fecha).toLocaleTimeString("es-HN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2" />
                              {evento.sede || "Sin sede especificada"}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span className="font-semibold text-foreground">
                                L {parseFloat(evento.precio).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Barra de progreso de tickets */}
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Tickets:</span>
                              <span className="font-medium">
                                {statsEvento.vendidos} / {evento.aforo}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  statsEvento.porcentaje >= 100
                                    ? "bg-red-500"
                                    : statsEvento.porcentaje >= 80
                                    ? "bg-orange-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(statsEvento.porcentaje, 100)}%` }}
                              />
                            </div>
                            {statsEvento.disponibles > 0 ? (
                              <p className="text-xs text-green-600">
                                {statsEvento.disponibles} tickets disponibles
                              </p>
                            ) : (
                              <p className="text-xs text-red-600 font-medium">
                                ¡Agotado!
                              </p>
                            )}
                          </div>

                          {/* Botones de acción */}
                          <div className="flex gap-2 pt-3">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleVenderTicket(evento)}
                              disabled={statsEvento.disponibles <= 0}
                              className="flex-1"
                            >
                              <TicketIcon className="h-4 w-4 mr-1" />
                              Vender
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerTickets(evento)}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarEvento(evento)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEliminarEvento(evento.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========= TAB DE TICKETS ========= */}
        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Tickets</CardTitle>
              <CardDescription>Todos los tickets vendidos</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <TicketIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No hay tickets vendidos</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evento</TableHead>
                      <TableHead>Comprador</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => {
                      const evento = eventos.find((e) => e.id === ticket.evento);
                      return (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {evento?.nombre || "Evento"}
                              </div>
                              {evento && (
                                <div className="text-xs text-muted-foreground">
                                  {new Date(evento.fecha).toLocaleDateString("es-HN")}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{ticket.comprador_nombre}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {ticket.comprador_email}
                          </TableCell>
                          <TableCell className="font-medium">
                            L {parseFloat(ticket.precio).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {ticket.estado === "vendido" ? (
                              <Badge className="bg-green-100 text-green-800">
                                Vendido
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Anulado</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" title="Ver QR">
                              <QrCode className="h-4 w-4" />
                            </Button>
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
      </Tabs>

      {/* ========= DIÁLOGO PARA CREAR/EDITAR EVENTO ========= */}
      <Dialog open={eventoDialogOpen} onOpenChange={setEventoDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingEvento ? "Editar Evento" : "Nuevo Evento"}
            </DialogTitle>
            <DialogDescription>
              {editingEvento
                ? "Modifica la información del evento"
                : "Crea un nuevo evento especial"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del evento *</Label>
              <Input
                id="nombre"
                placeholder="ej: Social de Salsa, Congreso Anual"
                value={eventoForm.nombre}
                onChange={(e) =>
                  setEventoForm({ ...eventoForm, nombre: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha y hora *</Label>
                <Input
                  id="fecha"
                  type="datetime-local"
                  value={eventoForm.fecha}
                  onChange={(e) =>
                    setEventoForm({ ...eventoForm, fecha: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aforo">Aforo (personas) *</Label>
                <Input
                  id="aforo"
                  type="number"
                  placeholder="100"
                  value={eventoForm.aforo}
                  onChange={(e) =>
                    setEventoForm({
                      ...eventoForm,
                      aforo: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sede">Sede / Lugar</Label>
              <Input
                id="sede"
                placeholder="ej: Centro de Convenciones, Salón Principal"
                value={eventoForm.sede}
                onChange={(e) =>
                  setEventoForm({ ...eventoForm, sede: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio del ticket (L) *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  placeholder="200.00"
                  value={eventoForm.precio}
                  onChange={(e) =>
                    setEventoForm({
                      ...eventoForm,
                      precio: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              {editingEvento && (
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={eventoForm.estado}
                    onValueChange={(value: any) =>
                      setEventoForm({ ...eventoForm, estado: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programado">Programado</SelectItem>
                      <SelectItem value="realizado">Realizado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarEvento}>
              {editingEvento ? "Actualizar" : "Crear Evento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========= DIÁLOGO PARA VENDER TICKET ========= */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Vender Ticket</DialogTitle>
            <DialogDescription>
              Registra la venta de un ticket para el evento
            </DialogDescription>
          </DialogHeader>

          {eventoSeleccionado && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="font-medium text-lg">{eventoSeleccionado.nombre}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(eventoSeleccionado.fecha).toLocaleDateString("es-HN")} -{" "}
                    {eventoSeleccionado.sede}
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    L {parseFloat(eventoSeleccionado.precio).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alumno">¿Es un alumno registrado?</Label>
              <Select
                value={ticketForm.alumno || "ninguno"}
                onValueChange={(value) =>
                  handleSeleccionarAlumno(value === "ninguno" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona si aplica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">No, es comprador externo</SelectItem>
                  {alumnos
                    .filter((a) => a.estado === "activo")
                    .map((alumno) => (
                      <SelectItem key={alumno.id} value={alumno.id}>
                        {alumno.nombres} {alumno.apellidos}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprador_nombre">Nombre del comprador *</Label>
              <Input
                id="comprador_nombre"
                placeholder="Nombre completo"
                value={ticketForm.comprador_nombre}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, comprador_nombre: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprador_email">Email del comprador *</Label>
              <Input
                id="comprador_email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={ticketForm.comprador_email}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, comprador_email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio_ticket">Precio del ticket (L) *</Label>
              <Input
                id="precio_ticket"
                type="number"
                step="0.01"
                value={ticketForm.precio}
                onChange={(e) =>
                  setTicketForm({
                    ...ticketForm,
                    precio: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium mb-1">✅ Nota:</p>
              <p>
                Al vender el ticket, se registrará automáticamente el ingreso en
                contabilidad y se generará un código QR único.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarTicket}
              disabled={
                !ticketForm.comprador_nombre ||
                !ticketForm.comprador_email ||
                ticketForm.precio <= 0
              }
            >
              Vender Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========= DIÁLOGO PARA VER TICKETS DE UN EVENTO ========= */}
      <Dialog open={verTicketsDialogOpen} onOpenChange={setVerTicketsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tickets del Evento</DialogTitle>
            <DialogDescription>
              Lista de tickets vendidos para este evento
            </DialogDescription>
          </DialogHeader>

          {loadingTickets ? (
            <div className="flex items-center justify-center py-12">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : eventoSeleccionado ? (
            <div className="space-y-6 py-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Evento:</span>
                      <div className="font-medium">{eventoSeleccionado.nombre}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tickets vendidos:</span>
                      <div className="font-medium">
                        {ticketsEvento.filter((t) => t.estado === "vendido").length} /{" "}
                        {eventoSeleccionado.aforo}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ingresos:</span>
                      <div className="font-medium text-green-600">
                        L{" "}
                        {ticketsEvento
                          .filter((t) => t.estado === "vendido")
                          .reduce((sum, t) => sum + parseFloat(t.precio), 0)
                          .toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Disponibles:</span>
                      <div className="font-medium">
                        {eventoSeleccionado.aforo -
                          ticketsEvento.filter((t) => t.estado === "vendido").length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {ticketsEvento.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TicketIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No se han vendido tickets para este evento</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Comprador</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketsEvento.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">
                          {ticket.comprador_nombre}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ticket.comprador_email}
                        </TableCell>
                        <TableCell className="font-medium">
                          L {parseFloat(ticket.precio).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {ticket.estado === "vendido" ? (
                            <Badge className="bg-green-100 text-green-800">
                              Vendido
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Anulado</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" title="Ver QR">
                              <QrCode className="h-4 w-4" />
                            </Button>
                            {ticket.estado === "vendido" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarTicket(ticket.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}