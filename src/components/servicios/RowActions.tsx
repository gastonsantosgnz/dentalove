"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { Servicio } from "@/lib/database";
import { createServicio } from "@/lib/serviciosService";
import { EditServiceDialog } from "@/components/EditServiceDialog";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { CircleAlert, Ellipsis } from "lucide-react";

interface RowActionsProps {
  row: Row<Servicio>;
  onServicioUpdated: (servicio: Servicio) => Promise<boolean>;
  onServicioDeleted: (id: string) => Promise<boolean>;
}

export default function RowActions({ row, onServicioUpdated, onServicioDeleted }: RowActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleDuplicate = async () => {
    const originalService = row.original;
    
    // Create a new service based on the original, with a modified name
    const duplicatedService = {
      ...originalService,
      id: undefined, // Remove ID so a new one is generated
      nombre_servicio: `${originalService.nombre_servicio} (copia)`,
    };
    
    try {
      await createServicio(duplicatedService);
      // Trigger refresh through the update callback
      onServicioUpdated(row.original);
    } catch (error) {
      console.error("Error duplicating service:", error);
    }
  };
  
  const handleDelete = async () => {
    try {
      await onServicioDeleted(row.original.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting service:", error);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button size="icon" variant="ghost" className="shadow-none" aria-label="Edit item">
              <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <span>Editar</span>
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <span>Duplicar</span>
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => {
              // Ver detalles
              console.log("Ver detalles", row.original);
            }}>
              <span>Ver detalles</span>
              <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <span>Eliminar</span>
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Edit Service Dialog */}
      <EditServiceDialog
        service={row.original}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={onServicioUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
              aria-hidden="true"
            >
              <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
            </div>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Eliminará permanentemente el servicio &quot;{row.original.nombre_servicio}&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 