"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

export default function AsistenciaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Control de Asistencia</h2>
        <p className="text-muted-foreground">
          Registro y seguimiento de asistencia a clases
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asistencia</CardTitle>
          <CardDescription>
            Control de presencia en sesiones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <CheckSquare className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Funcionalidad de control de asistencia</p>
            <p className="text-sm">Próximamente...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
