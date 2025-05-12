import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { deletePlanTratamiento } from "@/lib/planesTratamientoService";
import { useState } from "react";

interface DeletePlanButtonProps {
  planId: string;
  onDeleted: () => void;
}

export function DeletePlanButton({ planId, onDeleted }: DeletePlanButtonProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePlan = async () => {
    try {
      setIsDeleting(true);
      await deletePlanTratamiento(planId);
      
      toast({
        title: "Plan eliminado",
        description: "El plan de tratamiento ha sido eliminado correctamente."
      });
      
      // Call the onDeleted callback (typically for navigation)
      onDeleted();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error al eliminar",
        description: "Ha ocurrido un error al eliminar el plan.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isDeleting}>
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? "Eliminando..." : "Eliminar plan"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El plan de tratamiento será eliminado permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeletePlan}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 