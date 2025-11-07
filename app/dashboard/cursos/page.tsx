"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function CursosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h2>
        <p className="text-muted-foreground">
          Administración de cursos y horarios
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cursos y Grupos</CardTitle>
          <CardDescription>
            Gestión de programas de enseñanza
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <GraduationCap className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Funcionalidad de gestión de cursos</p>
            <p className="text-sm">Próximamente...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
