'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Miembro {
  id: string;
  usuario_id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

interface EditarRolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  miembro: Miembro | null;
  esAdmin: boolean;
  onRolActualizado: (miembroId: string, nuevoRol: string) => void;
}

export function EditarRolModal({
  open,
  onOpenChange,
  miembro,
  esAdmin,
  onRolActualizado
}: EditarRolModalProps) {
  const { toast } = useToast();
  const [nuevoRol, setNuevoRol] = useState('');
  
  // Actualizar el rol seleccionado cuando cambia el miembro
  useEffect(() => {
    if (miembro) {
      setNuevoRol(miembro.rol);
    }
  }, [miembro]);

  const handleSubmit = async () => {
    if (!miembro || !nuevoRol) return;
    
    if (!esAdmin) {
      toast({
        title: "Acceso denegado",
        description: "Solo administradores pueden cambiar roles",
        variant: "destructive"
      });
      onOpenChange(false);
      return;
    }
    
    const { error } = await supabase
      .from('usuarios_consultorios')
      .update({ rol: nuevoRol })
      .eq('id', miembro.id);
    
    if (error) {
      console.error('Error al actualizar rol:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del miembro",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Rol actualizado",
        description: "Se ha actualizado el rol del miembro exitosamente"
      });
      
      // Notificar al componente padre
      onRolActualizado(miembro.id, nuevoRol);
    }
    
    onOpenChange(false);
  };

  if (!miembro) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>Cambiar rol de miembro</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium">
              Miembro: <span className="font-bold">{miembro.nombre}</span>
            </p>
            <p className="text-sm text-muted-foreground">{miembro.email}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rol">Nuevo rol</Label>
            <Select 
              value={nuevoRol} 
              onValueChange={setNuevoRol}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[200]">
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="asistente">Asistente</SelectItem>
                <SelectItem value="recepcionista">Recepcionista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Guardar cambios</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 