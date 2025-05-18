"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { deletePlanTratamiento } from "@/lib/planesTratamientoService";
import TreatmentReport from "@/components/TreatmentReport";
import { ToothStatus } from "@/components/DentalChart";
import { Servicio } from "@/components/ToothStatus";

interface PlanActionsProps {
  planId: string;
  pacienteId: string;
  toothStatus: Record<string, ToothStatus[]>;
  patientName: string;
  servicios: Servicio[];
  planVersions: {
    id: string;
    nombre: string;
    toothStatus: Record<string, ToothStatus[]>;
    totalCost: number;
    isActive: boolean;
  }[];
  activeVersionId: string;
  versionsToothStatus: Record<string, Record<string, ToothStatus[]>>;
  onVersionChange: (versionId: string) => void;
  onPlanDeleted: () => void;
}

export function PlanActions({
  planId,
  pacienteId,
  toothStatus,
  patientName,
  servicios,
  planVersions,
  activeVersionId,
  versionsToothStatus,
  onVersionChange,
  onPlanDeleted
}: PlanActionsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDeletePlan = () => {
    if (confirm("¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer.")) {
      deletePlanTratamiento(planId)
        .then(() => {
          toast({
            title: "Plan eliminado",
            description: "El plan de tratamiento ha sido eliminado correctamente."
          });
          onPlanDeleted();
        })
        .catch((error) => {
          console.error("Error deleting plan:", error);
          toast({
            title: "Error al eliminar",
            description: "Ha ocurrido un error al eliminar el plan.",
            variant: "destructive"
          });
        });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline"
          className="gap-2"
          onClick={() => router.push(`/pacientes/${pacienteId}/planes/${planId}/editar`)}
        >
          <Edit className="h-4 w-4" />
          Editar Plan
        </Button>
        <TreatmentReport
          toothStatus={toothStatus}
          patientName={patientName}
          servicios={servicios}
          planVersions={planVersions}
          activeVersionId={activeVersionId}
          onVersionChange={onVersionChange}
          customCosts={{}}
          isPlanSaved={true}
        />
      </div>
      
      <Button 
        variant="destructive" 
        className="w-full flex items-center justify-center gap-2"
        onClick={handleDeletePlan}
      >
        <Trash2 className="h-4 w-4" />
        Eliminar Plan
      </Button>
    </div>
  );
} 