import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanTratamiento } from "@/lib/database";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PlanSummaryCardProps {
  plan: PlanTratamiento;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
};

export function PlanSummaryCard({ plan }: PlanSummaryCardProps) {
  return (
    <Card className="w-full md:w-auto">
      <CardHeader className="pb-2">
        <CardTitle>Resumen</CardTitle>
        <CardDescription>Detalles generales del plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Fecha:</span>
            <span>{formatDate(plan.fecha)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Costo total:</span>
            <span className="font-bold">${plan.costo_total.toLocaleString()}</span>
          </div>
          {plan.observaciones && (
            <div className="mt-4">
              <h4 className="font-medium mb-1">Observaciones:</h4>
              <p className="text-sm">{plan.observaciones}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 