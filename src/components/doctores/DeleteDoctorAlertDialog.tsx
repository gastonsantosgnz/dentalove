"use client";

import { useCallback, useState, useRef, useEffect } from "react";
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

interface DeleteDoctorAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  doctorName: string;
  onDelete: () => Promise<void>;
  trigger: React.ReactNode;
}

export function DeleteDoctorAlertDialog({
  isOpen,
  onOpenChange,
  doctorName,
  onDelete,
  trigger,
}: DeleteDoctorAlertDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  
  // Asegurar que al abrir el diálogo, el botón de cancelar reciba el foco
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      // Un pequeño retraso para asegurar que el diálogo ya está visible
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);
  
  // Función segura para manejar cambios de estado
  const handleOpenChange = useCallback((newState: boolean) => {
    if (!isDeleting && onOpenChange) {
      // Si se está cerrando, usar un timeout para evitar conflictos de foco
      if (isOpen && !newState) {
        setTimeout(() => {
          onOpenChange(newState);
        }, 0);
      } else {
        onOpenChange(newState);
      }
    }
  }, [onOpenChange, isDeleting, isOpen]);

  // Función para manejar la eliminación
  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await onDelete();
      setIsDeleting(false);
      // Cerrar el diálogo después de completar la operación
      handleOpenChange(false);
    } catch (error) {
      console.error("Error deleting doctor:", error);
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* Render the trigger directly with onClick to open dialog */}
      {trigger}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Eliminará permanentemente a{" "}
            <strong>{doctorName}</strong> del sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelButtonRef} disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 