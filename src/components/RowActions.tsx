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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, MoreHorizontal, Trash, FileText, PlusCircle } from "lucide-react";
import { getPatientType } from "@/components/AddPatientDialog";
import Link from 'next/link';

interface RowActionsProps {
  row: Row<Paciente>;
  onPacienteUpdated: (paciente: Paciente) => void;
  onPacienteDeleted: (id: string) => void;
}

export function RowActions({ row, onPacienteUpdated, onPacienteDeleted }: RowActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isMounted = useRef(true);
  
  // Inicializar form data solo una vez para evitar renders
  const [formData, setFormData] = useState({
    nombre_completo: row.original.nombre_completo,
    fecha_nacimiento: row.original.fecha_nacimiento,
    celular: row.original.celular || '',
    notas: row.original.notas || '',
  });

  // Desmontaje seguro
  const safeSetState = (callback: Function) => {
    if (isMounted.current) {
      callback();
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedPaciente = {
        id: row.original.id,
        ...formData
      };
      
      // Primero cerrar el diálogo sin animaciones
      safeSetState(() => setIsEditDialogOpen(false));
      
      // Después de cerrar, actualizar datos
      setTimeout(() => {
        if (isMounted.current) {
          onPacienteUpdated(updatedPaciente);
        }
      }, 10);
    } catch (error) {
      console.error("Error al actualizar paciente:", error);
      safeSetState(() => setIsEditDialogOpen(false));
    }
  }, [formData, row.original.id, onPacienteUpdated]);

  const handleDelete = useCallback(async () => {
    try {
      // Primero cerrar el diálogo
      safeSetState(() => setIsDeleteDialogOpen(false));
      
      // Luego eliminar 
      setTimeout(() => {
        if (isMounted.current) {
          onPacienteDeleted(row.original.id);
        }
      }, 10);
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      safeSetState(() => setIsDeleteDialogOpen(false));
    }
  }, [row.original.id, onPacienteDeleted]);

  // Calcular el tipo de paciente basado en la fecha de nacimiento
  const pacienteType = getPatientType(row.original.fecha_nacimiento);
  
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

      {/* Dialog para editar paciente - solo renderizar cuando está abierto */}
      {isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar paciente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre_completo" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="nombre_completo"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipoPaciente" className="text-right">
                    Tipo de paciente
                  </Label>
                  <Input
                    id="tipoPaciente"
                    name="tipoPaciente"
                    value={pacienteType}
                    className="col-span-3"
                    disabled
                    readOnly
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fecha_nacimiento" className="text-right">
                    Fecha de nacimiento
                  </Label>
                  <Input
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="celular" className="text-right">
                    Celular
                  </Label>
                  <Input
                    id="celular"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="notas" className="text-right">
                    Notas médicas
                  </Label>
                  <Textarea
                    id="notas"
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar cambios</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

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