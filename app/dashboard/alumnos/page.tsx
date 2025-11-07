"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function AlumnosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Alumnos</h2>
        <p className="text-muted-foreground">
          Lista de estudiantes registrados en el sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alumnos</CardTitle>
          <CardDescription>
            Administración de estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserPlus className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Funcionalidad de gestión de alumnos</p>
            <p className="text-sm">Próximamente...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
