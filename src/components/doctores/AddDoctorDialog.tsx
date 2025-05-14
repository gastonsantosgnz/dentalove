"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Doctor } from "@/lib/doctoresService";

interface AddDoctorDialogProps {
  onSubmit: (doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Doctor;
  trigger?: React.ReactNode;
  isEditing?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddDoctorDialog({
  onSubmit,
  initialData,
  trigger,
  isEditing = false,
  isOpen: externalOpen,
  onOpenChange: externalOnOpenChange,
}: AddDoctorDialogProps) {
  // Referencias para el enfoque
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Estados del formulario - usar valores iniciales por defecto
  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [celular, setCelular] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Determinar si el control de apertura es interno o externo
  const isControlledExternally = externalOpen !== undefined && externalOnOpenChange !== undefined;
  const open = isControlledExternally ? externalOpen : internalOpen;
  
  // Función segura para actualizar el estado open
  const handleOpenChange = useCallback((newOpen: boolean) => {
    // Si está cerrando y está cargando, prevenir el cierre
    if (!newOpen && isLoading) return;

    // Si está cerrando, esperar un breve momento para evitar problemas de focus
    if (!newOpen) {
      setTimeout(() => {
        if (isControlledExternally && externalOnOpenChange) {
          externalOnOpenChange(newOpen);
        } else {
          setInternalOpen(newOpen);
        }
      }, 0);
    } else {
      // Si está abriendo, actualizar inmediatamente
      if (isControlledExternally && externalOnOpenChange) {
        externalOnOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    }
  }, [isControlledExternally, externalOnOpenChange, isLoading]);

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    setNombre("");
    setEspecialidad("");
    setCelular("");
    setIsLoading(false);
  }, []);

  // Inicializar los datos del formulario cuando se abre
  useEffect(() => {
    if (open && initialData) {
      // Solo establecer valores si el diálogo está abierto y tenemos datos iniciales
      setNombre(initialData.nombre_completo || "");
      setEspecialidad(initialData.especialidad || "");
      setCelular(initialData.celular || "");
    } else if (!open && !isEditing) {
      // Limpiar el formulario al cerrarse si no estamos en modo edición
      resetForm();
    }
  }, [open, initialData, isEditing, resetForm]);
  
  // Auto-enfocar el primer campo cuando se abre el diálogo
  useEffect(() => {
    if (open && nombreInputRef.current) {
      // Usar un corto retraso para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        nombreInputRef.current?.focus();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Manejar la presentación del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      // Convertir a una promesa y esperar a que se complete
      await onSubmit({
        nombre_completo: nombre,
        especialidad,
        celular,
      });
      
      // Limpiar y cerrar solo después de que la operación se complete
      resetForm();
      
      // Cerrar el diálogo con un retraso para evitar problemas de foco
      setTimeout(() => {
        handleOpenChange(false);
      }, 0);
    } catch (error) {
      console.error("Error submitting doctor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar el trigger solo si es necesario
  const shouldRenderTrigger = !isControlledExternally || trigger;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {shouldRenderTrigger && (
        <DialogTrigger asChild>
          {trigger || (
            <Button ref={triggerRef}>
              <Plus className="-ms-1 me-2 h-4 w-4" />
              Nuevo Doctor
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent
        onPointerDownOutside={(e) => {
          // Prevenir cierre accidental solo durante la carga
          if (isLoading) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          // Prevenir interacciones externas solo durante la carga
          if (isLoading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Solo permitir escape si no estamos en carga
          if (isLoading) {
            e.preventDefault();
          }
        }}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Doctor" : "Agregar Doctor"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edita la información del doctor."
              : "Completa el formulario para agregar un nuevo doctor."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                ref={nombreInputRef}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingresa el nombre del doctor"
                required
                disabled={isLoading}
                tabIndex={0}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input
                id="especialidad"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Ingresa la especialidad"
                required
                disabled={isLoading}
                tabIndex={0}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="celular">Número de celular</Label>
              <Input
                id="celular"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="Ingresa el número de celular"
                disabled={isLoading}
                tabIndex={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading}
              ref={submitButtonRef}
              tabIndex={0}
            >
              {isLoading ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
