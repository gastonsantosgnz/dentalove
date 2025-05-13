"use client";

import { useRef } from "react";
import { Table } from "@tanstack/react-table";
import { Input, Button } from "@/components/ui";
import { CircleX, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Servicio } from "@/lib/database";

interface TableFiltersProps {
  table: Table<Servicio>;
  id: string;
}

export default function TableFilters({ table, id }: TableFiltersProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Input
        id={`${id}-input`}
        ref={inputRef}
        className={cn(
          "peer min-w-60 ps-9",
          Boolean(table.getColumn("nombre_servicio")?.getFilterValue()) && "pe-9",
        )}
        value={(table.getColumn("nombre_servicio")?.getFilterValue() ?? "") as string}
        onChange={(e) => table.getColumn("nombre_servicio")?.setFilterValue(e.target.value)}
        placeholder="Buscar servicio..."
        type="text"
        aria-label="Buscar servicio"
      />
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
        <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
      </div>
      {Boolean(table.getColumn("nombre_servicio")?.getFilterValue()) && (
        <button
          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Clear filter"
          onClick={() => {
            table.getColumn("nombre_servicio")?.setFilterValue("");
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
        >
          <CircleX size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
} 