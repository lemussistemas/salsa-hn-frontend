"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function MatriculasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Matrículas</h2>
        <p className="text-muted-foreground">
          Administración de inscripciones y registros
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matrículas</CardTitle>
          <CardDescription>
            Control de inscripciones de estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Funcionalidad de gestión de matrículas</p>
            <p className="text-sm">Próximamente...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
