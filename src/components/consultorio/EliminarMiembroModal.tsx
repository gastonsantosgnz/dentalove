'use client';

import React from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
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
} from "@/components/ui/alert-dialog";

interface Miembro {
  id: string;
  usuario_id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

interface EliminarMiembroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  miembro: Miembro | null;
  esAdmin: boolean;
  usuarioActualId: string;
  onMiembroEliminado: (miembroId: string) => void;
}

export function EliminarMiembroModal({
  open,
  onOpenChange,
  miembro,
  esAdmin,
  usuarioActualId,
  onMiembroEliminado
}: EliminarMiembroModalProps) {
  const { toast } = useToast();

  const handleEliminar = async () => {
    if (!miembro) return;
    
    // Verificar si el usuario actual es admin
    if (!esAdmin) {
      toast({
        title: "Acceso denegado",
        description: "Solo administradores pueden eliminar miembros",
        variant: "destructive"
      });
      onOpenChange(false);
      return;
    }
    
    // No permitir eliminar al propio usuario
    if (miembro.usuario_id === usuarioActualId) {
      toast({
        title: "Acción no permitida",
        description: "No puedes eliminarte a ti mismo del consultorio",
        variant: "destructive"
      });
      onOpenChange(false);
      return;
    }
    
    const { error } = await supabase
      .from('usuarios_consultorios')
      .delete()
      .eq('id', miembro.id);
    
    if (error) {
      console.error('Error al eliminar miembro:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar al miembro del consultorio",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Miembro eliminado",
        description: "Se ha eliminado al miembro del consultorio exitosamente"
      });
      
      // Notificar al componente padre
      onMiembroEliminado(miembro.id);
    }
    
    onOpenChange(false);
  };

  if (!miembro) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción removerá a {miembro.nombre} ({miembro.email}) del consultorio.
            No podrá acceder más a la información de este consultorio.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleEliminar}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 