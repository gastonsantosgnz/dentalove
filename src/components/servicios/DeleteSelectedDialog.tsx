"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui";
import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui";
import { Servicio } from "@/lib/database";
import { useState } from "react";

interface DeleteSelectedDialogProps {
  table: Table<Servicio>;
  onDelete: () => Promise<void>;
}

export default function DeleteSelectedDialog({ table, onDelete }: DeleteSelectedDialogProps) {
  const selectedCount = table.getSelectedRowModel().rows.length;
  const [open, setOpen] = useState(false);
  
  if (selectedCount === 0) {
    return null;
  }
  
  const handleDelete = async () => {
    await onDelete();
    setOpen(false);
  };
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="ml-auto" variant="outline">
          <Trash
            className="-ms-1 me-2 opacity-60"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          Eliminar
          <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
            {selectedCount}
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Eliminará permanentemente{" "}
            {selectedCount} {selectedCount === 1 ? "servicio" : "servicios"} seleccionados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 