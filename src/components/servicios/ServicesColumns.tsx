"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Servicio } from "@/lib/database";
import { Checkbox } from "@/components/ui";
import { Clock } from "lucide-react";
import RowActions from "./RowActions";

// Custom filter function for multi-column searching
export const multiColumnFilterFn = (row: any, columnId: string, filterValue: string) => {
  const searchableRowContent = `${row.original.nombre_servicio} ${row.original.descripcion || ''}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

// Helper function to format price
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(price);
};

// Helper function to format duration
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return hours === 1 ? `${hours} hora` : `${hours} horas`;
  } else {
    return hours === 1 
      ? `${hours} hora ${remainingMinutes} min` 
      : `${hours} horas ${remainingMinutes} min`;
  }
};

interface GetColumnsProps {
  handleServiceUpdated: (servicio: Servicio) => Promise<boolean>;
  handleServiceDeleted: (id: string) => Promise<boolean>;
}

export const getColumns = ({ handleServiceUpdated, handleServiceDeleted }: GetColumnsProps): ColumnDef<Servicio>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Nombre",
    accessorKey: "nombre_servicio",
    cell: ({ row }) => <div className="font-medium">{row.getValue("nombre_servicio")}</div>,
    size: 200,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Especialidad",
    accessorKey: "especialidad",
    cell: ({ row }) => {
      const especialidad = row.getValue("especialidad") as string;
      // Definir colores para cada especialidad
      const colors: Record<string, { bg: string, text: string }> = {
        "General": { bg: "bg-blue-100", text: "text-blue-800" },
        "Periodoncia": { bg: "bg-green-100", text: "text-green-800" },
        "Endodoncia": { bg: "bg-purple-100", text: "text-purple-800" },
        "Ortodoncia": { bg: "bg-yellow-100", text: "text-yellow-800" },
        "Odontopediatría": { bg: "bg-pink-100", text: "text-pink-800" }
      };
      
      const color = colors[especialidad] || { bg: "bg-gray-100", text: "text-gray-800" };
      
      return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color.bg} ${color.text}`}>
          {especialidad}
        </div>
      );
    },
    size: 150,
    enableSorting: true,
  },
  {
    header: "Tipo de paciente",
    accessorKey: "tipo_paciente",
    cell: ({ row }) => {
      const tipoPaciente = row.getValue("tipo_paciente") as string || "General";
      
      // Definir colores para cada tipo de paciente
      const colors: Record<string, { bg: string, text: string }> = {
        "Adulto": { bg: "bg-amber-100", text: "text-amber-800" },
        "Pediátrico": { bg: "bg-indigo-100", text: "text-indigo-800" },
        "General": { bg: "bg-gray-100", text: "text-gray-800" }
      };
      
      const color = colors[tipoPaciente] || { bg: "bg-gray-100", text: "text-gray-800" };
      
      return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color.bg} ${color.text}`}>
          {tipoPaciente}
        </div>
      );
    },
    size: 130,
    enableSorting: true,
  },
  {
    header: "Costo",
    accessorKey: "costo",
    cell: ({ row }) => {
      const costo = parseFloat(row.getValue("costo"));
      return <div className="font-medium">{formatPrice(costo)}</div>;
    },
    size: 120,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = parseFloat(rowA.getValue(columnId));
      const valueB = parseFloat(rowB.getValue(columnId));
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    }
  },
  {
    header: "Duración",
    accessorKey: "duracion",
    cell: ({ row }) => {
      const duracion = parseInt(row.getValue("duracion"));
      return (
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-gray-500" />
          {formatDuration(duracion)}
        </div>
      );
    },
    size: 150,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = parseInt(rowA.getValue(columnId));
      const valueB = parseInt(rowB.getValue(columnId));
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    }
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <RowActions 
        row={row}
        onServicioUpdated={handleServiceUpdated}
        onServicioDeleted={handleServiceDeleted}
      />
    ),
    size: 60,
    enableHiding: false,
  },
]; 