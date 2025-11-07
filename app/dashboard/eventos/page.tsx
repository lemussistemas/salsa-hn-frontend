"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function EventosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Eventos</h2>
        <p className="text-muted-foreground">
          Administración de eventos y venta de tickets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos</CardTitle>
          <CardDescription>
            Gestión de eventos y sociales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Calendar className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Funcionalidad de gestión de eventos</p>
            <p className="text-sm">Próximamente...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
