"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui";
import { Columns3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Servicio } from "@/lib/database";

interface ColumnVisibilityProps {
  table: Table<Servicio>;
}

export default function ColumnVisibility({ table }: ColumnVisibilityProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Columns3
            className="-ms-1 me-2 opacity-60"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          Columnas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                onSelect={(event) => event.preventDefault()}
              >
                {column.id === "nombre_servicio" ? "Nombre" : 
                 column.id === "costo" ? "Costo" : 
                 column.id === "duracion" ? "Duración" : 
                 column.id === "especialidad" ? "Especialidad" : 
                 column.id === "tipo_paciente" ? "Tipo de paciente" : 
                 column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 