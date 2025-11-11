"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, DollarSign, AlertCircle, GraduationCap, TrendingUp, Calendar, Clock, Award } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DashboardPage() {
  // Mock data - replace with real API calls
  const stats = {
    totalAlumnos: 45,
    matriculasActivas: 38,
    ingresosMes: 12500.00,
    cuentasPorCobrar: 3200.00,
  };

  const matriculasConDeuda = [
    { alumno: "María García", grupo: "Salsa Básico Lunes 7 PM", deuda: 800.00 },
    { alumno: "Carlos Rodríguez", grupo: "Bachata Intermedio", deuda: 1200.00 },
    { alumno: "Ana López", grupo: "Salsa Avanzado", deuda: 1200.00 },
  ];

  // Datos para gráfico de ingresos mensuales
  const ingresosData = [
    { mes: 'Jun', ingresos: 8500, gastos: 3200 },
    { mes: 'Jul', ingresos: 9200, gastos: 3500 },
    { mes: 'Ago', ingresos: 11000, gastos: 3800 },
    { mes: 'Sep', ingresos: 10500, gastos: 3600 },
    { mes: 'Oct', ingresos: 12500, gastos: 4000 },
    { mes: 'Nov', ingresos: 13200, gastos: 4200 },
  ];

  // Datos para distribución de cursos
  const cursosData = [
    { name: 'Salsa Básico', value: 15, color: '#3b82f6' },
    { name: 'Bachata', value: 12, color: '#8b5cf6' },
    { name: 'Salsa Intermedio', value: 8, color: '#ec4899' },
    { name: 'Salsa Avanzado', value: 10, color: '#f59e0b' },
  ];

  // Datos de asistencia semanal
  const asistenciaData = [
    { dia: 'Lun', asistencia: 32 },
    { dia: 'Mar', asistencia: 28 },
    { dia: 'Mié', asistencia: 35 },
    { dia: 'Jue', asistencia: 30 },
    { dia: 'Vie', asistencia: 38 },
    { dia: 'Sáb', asistencia: 25 },
  ];

  // Próximas clases
  const proximasClases = [
    { curso: "Salsa Básico", horario: "Hoy, 7:00 PM", instructor: "Carlos Méndez", alumnos: 15 },
    { curso: "Bachata Intermedio", horario: "Hoy, 8:30 PM", instructor: "María Flores", alumnos: 12 },
    { curso: "Salsa Avanzado", horario: "Mañana, 7:00 PM", instructor: "Luis García", alumnos: 10 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Panel de Control
          </h2>
          <p className="text-muted-foreground mt-1">
            Bienvenido al sistema de gestión - Salsa Honduras
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Noviembre 2025</span>
        </div>
      </div>

      {/* Stats Cards con animación */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAlumnos}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600 font-medium">
                +8% vs mes anterior
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matrículas Activas</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.matriculasActivas}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600 font-medium">
                +5% esta semana
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">L {stats.ingresosMes.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600 font-medium">
                +12% vs mes anterior
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas por Cobrar</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">L {stats.cuentasPorCobrar.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 matrículas pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Gráfico de ingresos */}
        <Card className="lg:col-span-4 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Ingresos y Gastos Mensuales</CardTitle>
            <CardDescription>
              Comparativa de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ingresosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="mes" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Ingresos"
                />
                <Line 
                  type="monotone" 
                  dataKey="gastos" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 4 }}
                  name="Gastos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de distribución de cursos */}
        <Card className="lg:col-span-3 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Distribución de Alumnos</CardTitle>
            <CardDescription>
              Por tipo de curso
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cursosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cursosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Asistencia semanal */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Asistencia Semanal</CardTitle>
            <CardDescription>
              Promedio de alumnos por día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={asistenciaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="dia" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="asistencia" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Próximas clases */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Próximas Clases
            </CardTitle>
            <CardDescription>
              Agenda de hoy y mañana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximasClases.map((clase, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{clase.curso}</p>
                      <p className="text-xs text-muted-foreground">{clase.instructor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-blue-600">{clase.horario}</p>
                    <p className="text-xs text-muted-foreground">{clase.alumnos} alumnos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matrículas con Deuda */}
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Matrículas con Deuda
          </CardTitle>
          <CardDescription>
            Alumnos con saldos pendientes de pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matriculasConDeuda.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-green-500/5 rounded-lg border-2 border-dashed border-green-500/20">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <p className="font-medium">✅ ¡Excelente!</p>
                <p className="text-sm">No hay deudas pendientes</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Alumno</TableHead>
                    <TableHead className="font-semibold">Grupo</TableHead>
                    <TableHead className="text-right font-semibold">Deuda</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matriculasConDeuda.map((m, i) => (
                    <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{m.alumno}</TableCell>
                      <TableCell className="text-muted-foreground">{m.grupo}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-1 rounded-full">
                          L {m.deuda.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}