"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Ellipsis, Trash } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { Proveedor } from "@/lib/proveedoresService";
import AddProveedorDialog from "./AddProveedorDialog";
import { useState } from "react";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface ProveedorRowActionsProps {
  row: Row<Proveedor>;
  onProveedorUpdated: (proveedor: Proveedor) => Promise<void>;
  onProveedorDeleted: (id: string) => Promise<void>;
}

export function ProveedorRowActions({
  row,
  onProveedorUpdated,
  onProveedorDeleted,
}: ProveedorRowActionsProps) {
  const proveedor = row.original;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
      await onProveedorDeleted(proveedor.id);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting proveedor:", error);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="relative">
      <AddProveedorDialog
        initialData={proveedor}
        isEditing={true}
        onSubmit={async (updatedData) => {
          await onProveedorUpdated({
            ...proveedor,
            ...updatedData,
          });
        }}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <Ellipsis className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de eliminar al proveedor <span className="font-semibold">{proveedor.nombre_comercial}</span>?
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 