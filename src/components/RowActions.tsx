'use client';

import { useState, useEffect } from "react";
import { Row } from "@tanstack/react-table";
import { Paciente } from "@/lib/database";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Ellipsis, Loader2, Edit, MoreHorizontal, Trash, FileText } from "lucide-react";
import { getPlanesTratamientoPaciente } from "@/lib/planesTratamientoService";
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
  const [hasPlanes, setHasPlanes] = useState(false);
  const [isCheckingPlanes, setIsCheckingPlanes] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: row.original.nombre_completo,
    fecha_nacimiento: row.original.fecha_nacimiento,
    celular: row.original.celular || '',
    notas: row.original.notas || '',
  });

  useEffect(() => {
    // Verificar si el paciente tiene planes en Supabase
    const checkPlanesInSupabase = async () => {
      const pacienteId = row.original.id;
      setIsCheckingPlanes(true);
      
      try {
        const planes = await getPlanesTratamientoPaciente(pacienteId);
        setHasPlanes(planes.length > 0);
      } catch (error) {
        console.error("Error verificando planes del paciente:", error);
        setHasPlanes(false);
      } finally {
        setIsCheckingPlanes(false);
      }
    };
    
    checkPlanesInSupabase();
  }, [row.original.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedPaciente = {
        id: row.original.id,
        ...formData
      };
      
        onPacienteUpdated(updatedPaciente);
        setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error al actualizar paciente:", error);
    }
  };

  const handleDelete = () => {
    try {
        onPacienteDeleted(row.original.id);
        setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
    }
  };

  // Calcular el tipo de paciente basado en la fecha de nacimiento
  const pacienteType = getPatientType(row.original.fecha_nacimiento);

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
            <DropdownMenuItem
              asChild={hasPlanes}
              disabled={!hasPlanes || isCheckingPlanes}
              className={!hasPlanes ? "text-muted-foreground cursor-not-allowed" : ""}
            >
              {isCheckingPlanes ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Verificando planes...</span>
                </div>
              ) : hasPlanes ? (
                <Link href={`/pacientes/${row.original.id}/planes`} className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Ver planes</span>
                </Link>
              ) : (
                <Link href={`/pacientes/${row.original.id}/planes`} className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Ver planes</span>
                </Link>
              )}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Más</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Ver historial</DropdownMenuItem>
                  <DropdownMenuItem>Ver notas</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span>Archivar</span>
                    <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para editar paciente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar paciente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            <div className="grid gap-4 py-4">
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

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará permanentemente al paciente {row.original.nombre_completo}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 