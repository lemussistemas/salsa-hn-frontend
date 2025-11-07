"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function PagosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h2>
        <p className="text-muted-foreground">
          Registro y control de pagos y facturas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagos</CardTitle>
          <CardDescription>
            Control financiero y facturación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <DollarSign className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Funcionalidad de gestión de pagos</p>
            <p className="text-sm">Próximamente...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
