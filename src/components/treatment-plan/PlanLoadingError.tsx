import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PlanLoadingProps {
  isLoading: boolean;
}

interface PlanErrorProps {
  error: string | null;
  pacienteId: string;
  onBack: () => void;
}

export function PlanLoading({ isLoading }: PlanLoadingProps) {
  if (!isLoading) return null;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <p>Cargando datos del plan de tratamiento...</p>
    </div>
  );
}

export function PlanError({ error, pacienteId, onBack }: PlanErrorProps) {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="my-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error || "No se pudo cargar el plan de tratamiento. El plan puede no existir."}
      </AlertDescription>
      <div className="mt-4">
        <Button variant="outline" onClick={onBack}>
          Volver a la lista de planes
        </Button>
      </div>
    </Alert>
  );
} 