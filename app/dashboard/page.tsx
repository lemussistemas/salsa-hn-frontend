"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, DollarSign, AlertCircle, GraduationCap } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
        <p className="text-muted-foreground">
          Resumen general del sistema de gestión
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlumnos}</div>
            <p className="text-xs text-muted-foreground">
              Estudiantes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matrículas Activas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.matriculasActivas}</div>
            <p className="text-xs text-muted-foreground">
              Inscripciones vigentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">L {stats.ingresosMes.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Pagos recibidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas por Cobrar</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">L {stats.cuentasPorCobrar.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Saldos pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Matrículas con Deuda */}
      <Card>
        <CardHeader>
          <CardTitle>Matrículas con Deuda</CardTitle>
          <CardDescription>
            Alumnos con saldos pendientes de pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matriculasConDeuda.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ✅ Todo al día - No hay deudas pendientes
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead className="text-right">Deuda</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matriculasConDeuda.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{m.alumno}</TableCell>
                      <TableCell>{m.grupo}</TableCell>
                      <TableCell className="text-right font-bold text-destructive">
                        L {m.deuda.toFixed(2)}
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
