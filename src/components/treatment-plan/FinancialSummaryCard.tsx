import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "./utils";
import { ServicioProgreso } from "@/lib/serviciosProgresoService";

interface FinancialSummaryCardProps {
  totalCost: number;
  serviciosProgreso: ServicioProgreso[];
  totalTreatments: number;
}

export function FinancialSummaryCard({ totalCost, serviciosProgreso, totalTreatments }: FinancialSummaryCardProps) {
  const totalPagado = serviciosProgreso
    .filter(p => p.estado === 'completado')
    .reduce((sum, p) => sum + (parseFloat(p.monto_pagado.toString()) || 0), 0);
  
  const pendiente = totalCost - totalPagado;
  const serviciosCompletados = serviciosProgreso.filter(p => p.estado === 'completado').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Resumen Financiero</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-md bg-slate-50">
            <div className="text-sm text-slate-600 mb-1">Costo Total</div>
            <div className="text-2xl font-bold">${formatCurrency(totalCost)}</div>
          </div>
          
          <div className="p-4 border rounded-md bg-green-50">
            <div className="text-sm text-slate-600 mb-1">Cobrado</div>
            <div className="text-2xl font-bold text-green-700">
              ${formatCurrency(totalPagado)}
            </div>
          </div>
          
          <div className="p-4 border rounded-md bg-blue-50">
            <div className="text-sm text-slate-600 mb-1">Pendiente</div>
            <div className="text-2xl font-bold text-blue-700">
              ${formatCurrency(pendiente)}
            </div>
          </div>
          
          <div className="col-span-3 mt-2 text-sm text-slate-500">
            <div className="flex items-center gap-1 text-xs">
              <Check className="h-3 w-3 text-green-600" />
              <span>
                Servicios completados: {serviciosCompletados} de {totalTreatments}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 