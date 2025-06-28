'use client';

import React, { useState, useRef, useCallback } from "react";
import { Row } from "@tanstack/react-table";
import { Paciente } from "@/lib/database";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, MoreHorizontal, Trash, FileText, PlusCircle, Calendar } from "lucide-react";
import { getPatientType } from "@/components/AddPatientDialog";
import Link from 'next/link';
import { EditPatientDialog } from "@/components/EditPatientDialog";

interface RowActionsProps {
  row: Row<Paciente>;
  onPacienteUpdated: (paciente: Paciente) => void;
  onPacienteDeleted: (id: string) => void;
  onAgendarCita?: (paciente: Paciente) => void;
}

export function RowActions({ row, onPacienteUpdated, onPacienteDeleted, onAgendarCita }: RowActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isMounted = useRef(true);
  
  const handleDelete = useCallback(async () => {
    try {
      // Primero cerrar el diálogo
      setIsDeleteDialogOpen(false);
      
      // Luego eliminar 
      setTimeout(() => {
        if (isMounted.current) {
          onPacienteDeleted(row.original.id);
        }
      }, 10);
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      setIsDeleteDialogOpen(false);
    }
  }, [row.original.id, onPacienteDeleted]);

  const handleAgendarCita = useCallback(() => {
    if (onAgendarCita) {
      onAgendarCita(row.original);
    }
  }, [onAgendarCita, row.original]);

  // Cleanup en desmontaje
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button size="icon" variant="ghost" className="shadow-none" aria-label="Edit item">
              <MoreHorizontal size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            {onAgendarCita && (
              <DropdownMenuItem onClick={handleAgendarCita}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Agendar Cita</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/pacientes/${row.original.id}/planes`} className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span>Ver planes</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/pacientes/${row.original.id}/nuevo-plan`} className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Crear plan</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Usar el componente EditPatientDialog */}
      <EditPatientDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        patient={row.original}
        onPatientUpdated={onPacienteUpdated}
      />

      {/* Dialog de confirmación para eliminar - solo cuando está abierto */}
      {isDeleteDialogOpen && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Eliminará permanentemente al paciente {row.original.nombre_completo}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onOpenChange={setIsDeleteDialogOpen}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onOpenChange={setIsDeleteDialogOpen} onClick={handleDelete}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
} 