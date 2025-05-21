import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToothStatus } from "@/components/DentalChart";

interface ConditionsTabProps {
  toothStatus: Record<string, ToothStatus[]>;
  toothComments?: Record<string, string>;
}

// Helper to determine if key is a general area
const isGeneralAreaKey = (key: string): boolean => {
  return ["boca-completa", "arco-superior", "arco-inferior", "supernumerario"].includes(key);
};

export function ConditionsTab({ toothStatus, toothComments = {} }: ConditionsTabProps) {
  // Process conditions (only for specific teeth)
  const conditionsByTooth: Record<string, ToothStatus[]> = {};
  
  Object.entries(toothStatus).forEach(([zone, statuses]) => {
    if (!isGeneralAreaKey(zone)) {
      const conditions = statuses.filter(s => s.type === 'condition');
      if (conditions.length > 0) {
        conditionsByTooth[zone] = conditions;
      }
    }
  });
  
  const hasConditions = Object.keys(conditionsByTooth).length > 0;

  if (!hasConditions) {
    return (
      <div className="text-center py-8 border rounded-md">
        <AlertTriangle className="mx-auto h-8 w-8 text-slate-600 mb-2" />
        <p>No se registraron condiciones dentales para este plan.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Condiciones Registradas</CardTitle>
        <CardDescription>Estado dental registrado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(conditionsByTooth).map(([tooth, conditions]) => (
            <div key={tooth} className="p-3 border rounded-md">
              <p className="font-medium">Diente {tooth}</p>
              <ul className="mt-2 space-y-1">
                {conditions.map(condition => (
                  <li key={condition.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: condition.color }}></div>
                    <span className="text-sm">{condition.status}</span>
                  </li>
                ))}
              </ul>
              {toothComments[tooth] && (
                <div className="mt-3 border-t pt-2">
                  <p className="text-xs font-medium text-slate-600">Comentario:</p>
                  <p className="text-sm mt-1">{toothComments[tooth]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 