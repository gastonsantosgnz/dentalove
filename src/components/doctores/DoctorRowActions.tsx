"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { Doctor } from "@/lib/doctoresService";
import { AddDoctorDialog } from "./AddDoctorDialog";
import { useState, useRef, useEffect } from "react";
import { DeleteDoctorAlertDialog } from "./DeleteDoctorAlertDialog";

interface DoctorRowActionsProps {
  row: Row<Doctor>;
  onDoctorUpdated: (doctor: Doctor) => Promise<void>;
  onDoctorDeleted: (id: string) => Promise<void>;
}

export function DoctorRowActions({
  row,
  onDoctorUpdated,
  onDoctorDeleted,
}: DoctorRowActionsProps) {
  const doctor = row.original;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Referencia para el botón del menú para restaurar el foco
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Manejar el cambio de estado del diálogo de edición
  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    
    // Si el diálogo se está cerrando, restaurar el foco al botón del menú
    if (!open && menuButtonRef.current) {
      // Usar setTimeout para asegurar que el foco se restaura DESPUÉS de que el diálogo se cierra
      setTimeout(() => {
        // Enfocar un elemento fuera del contenedor de la tabla
        document.body.focus();
        // Luego enfocar el botón del menú
        menuButtonRef.current?.focus();
      }, 0);
    }
  };

  // Manejar el cambio de estado del diálogo de eliminación
  const handleConfirmOpenChange = (open: boolean) => {
    setIsConfirmOpen(open);
    
    // Si el diálogo se está cerrando, restaurar el foco al botón del menú
    if (!open && menuButtonRef.current) {
      // Usar setTimeout para asegurar que el foco se restaura DESPUÉS de que el diálogo se cierra
      setTimeout(() => {
        // Enfocar un elemento fuera del contenedor de la tabla
        document.body.focus();
        // Luego enfocar el botón del menú
        menuButtonRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="flex justify-end items-center">
      <AddDoctorDialog
        initialData={doctor}
        isEditing={true}
        onSubmit={async (updatedData) => {
          await onDoctorUpdated({
            ...doctor,
            ...updatedData,
          });
        }}
        isOpen={isEditOpen}
        onOpenChange={handleEditOpenChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            ref={menuButtonRef}
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
          >
            <Ellipsis className="h-4 w-4" />
            <span className="sr-only">Opciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          
          <DeleteDoctorAlertDialog
            isOpen={isConfirmOpen}
            onOpenChange={handleConfirmOpenChange}
            doctorName={doctor.nombre_completo}
            onDelete={() => onDoctorDeleted(doctor.id)}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash className="mr-2 h-4 w-4" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 