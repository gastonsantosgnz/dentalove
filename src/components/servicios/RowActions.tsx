"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Ellipsis, Copy, Trash } from "lucide-react";
import { Servicio } from "@/lib/database";
import { EditServiceDialog } from "@/components/EditServiceDialog";
import { useServicios } from "@/contexts/ServiciosContext";

interface RowActionsProps {
  row: Row<Servicio>;
  onServicioUpdated: (servicio: Servicio) => Promise<boolean>;
  onServicioDeleted: (id: string) => Promise<boolean>;
}

export default function RowActions({ row, onServicioUpdated, onServicioDeleted }: RowActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { createService } = useServicios();
  
  const handleDuplicate = async () => {
    const originalService = row.original;
    
    // Create a new service based on the original, with a modified name
    const duplicatedService = {
      ...originalService,
      id: undefined, // Remove ID so a new one is generated
      nombre_servicio: `${originalService.nombre_servicio} (copia)`,
    };
    
    try {
      await createService(duplicatedService);
      
      // Actualizar la vista después de duplicar
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
    <div className="relative">
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
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Edit Dialog */}
      <EditServiceDialog
        service={row.original}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={async (updatedService) => {
          await onServicioUpdated(updatedService);
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de eliminar el servicio <span className="font-semibold">{row.original.nombre_servicio}</span>?
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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