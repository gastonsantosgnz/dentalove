"use client";

import { cn } from "@/lib/utils";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleX,
  Columns3,
  Filter,
  ListFilter,
  Plus,
  Trash,
  Clock,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Laboratorio, createLaboratorio, deleteLaboratorio, getLaboratorios, updateLaboratorio } from "@/lib/laboratoriosService";
import { LaboratorioRowActions } from "./LaboratorioRowActions";
import { DeleteLaboratorioAlertDialog } from "./DeleteLaboratorioAlertDialog";
import dynamic from "next/dynamic";

// Dynamically import the AddLaboratorioDialog component
const AddLaboratorioDialog = dynamic(() => import("./AddLaboratorioDialog"));

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Laboratorio> = (row, columnId, filterValue) => {
  const especialidadesText = (row.original.especialidades || []).join(' ');
  const searchableRowContent = `${row.original.nombre_laboratorio} ${especialidadesText} ${row.original.contacto_principal || ''}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

export default function LaboratoriosTable() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAddLaboratorioOpen, setIsAddLaboratorioOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "nombre_laboratorio",
      desc: false,
    },
  ]);

  // Al iniciar, cargar los laboratorios de Supabase
  const [data, setData] = useState<Laboratorio[]>([]);
  
  // Cargar laboratorios desde Supabase
  const loadLaboratorios = useCallback(async () => {
    try {
      setIsLoading(true);
      const laboratorios = await getLaboratorios();
      setData(laboratorios);
    } catch (error) {
      console.error("Error loading laboratorios:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Definir columnas básicas
  const columns: ColumnDef<Laboratorio>[] = [
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
    header: "Nombre Laboratorio",
      accessorKey: "nombre_laboratorio",
      cell: ({ row }) => <div className="font-medium">{row.getValue("nombre_laboratorio")}</div>,
    size: 200,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
      header: "Especialidades",
      accessorKey: "especialidades",
    cell: ({ row }) => {
        const especialidades = row.original.especialidades || [];
        
        if (especialidades.length === 0) return <div className="text-muted-foreground">-</div>;
      
        return (
          <div className="flex flex-wrap gap-1">
            {especialidades.slice(0, 2).map((esp, index) => (
              <div key={index} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 border-purple-300">
                {esp}
              </div>
            ))}
            {especialidades.length > 2 && (
              <span className="text-xs text-muted-foreground">+{especialidades.length - 2}</span>
            )}
          </div>
        );
    },
      size: 200,
  },
  {
      header: "Contacto",
      accessorKey: "contacto_principal",
    cell: ({ row }) => {
        const contacto = row.original.contacto_principal;
        if (!contacto) return <div className="text-muted-foreground">-</div>;
        return <div>{contacto}</div>;
      },
      size: 150,
  },
  {
    header: "Entrega",
    accessorKey: "tiempo_entrega_promedio",
      cell: ({ row }) => {
        const tiempo = row.original.tiempo_entrega_promedio;
        if (!tiempo) return <div className="text-muted-foreground">-</div>;
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{tiempo}d</span>
          </div>
        );
      },
    size: 100,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <LaboratorioRowActions 
          row={row} 
          onLaboratorioUpdated={async (laboratorio) => {
            try {
              await updateLaboratorio(laboratorio.id, laboratorio);
              // Refresh data after update
              await loadLaboratorios();
            } catch (error) {
              console.error('Error updating laboratorio:', error);
            }
          }} 
          onLaboratorioDeleted={async (id) => {
            try {
              await deleteLaboratorio(id);
              // Refresh data after deletion
              await loadLaboratorios();
            } catch (error) {
              console.error('Error deleting laboratorio:', error);
            }
          }} 
        />
      ),
      size: 60,
      enableHiding: false,
    },
  ];

  // Configuración de la tabla - debe estar ANTES de cualquier función que use 'table'
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  // Función para manejar la eliminación múltiple - DEBE estar DESPUÉS de la definición de 'table'
  const handleDeleteRows = useCallback(async (): Promise<void> => {
    const selectedRows = table.getSelectedRowModel().rows;
    
    try {
      // Eliminar cada laboratorio seleccionado de Supabase
      for (const row of selectedRows) {
        await deleteLaboratorio(row.original.id);
      }
      
      // Actualizar datos después de eliminar
      await loadLaboratorios();
      table.resetRowSelection();
    } catch (error) {
      console.error("Error deleting laboratorios:", error);
      throw error; // Propagar el error
    }
  }, [table, loadLaboratorios]);
  
  // Función para manejar la creación de laboratorios - Esta no usa 'table', así que está bien aquí
  const handleCreateLaboratorio = useCallback(async (laboratorioData: Omit<Laboratorio, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      // Guardar en Supabase
      await createLaboratorio(laboratorioData);
      
      // Actualizar datos
      await loadLaboratorios();
    } catch (error) {
      console.error("Error creating laboratorio:", error);
      throw error; // Propagar el error para que el diálogo lo maneje
    }
  }, [loadLaboratorios]);

  // Cargar datos al inicio
  useEffect(() => {
    loadLaboratorios();
    // Función de limpieza
    return () => {
      // Cancelar cualquier solicitud pendiente si es necesario
    };
  }, [loadLaboratorios]);

  // Crear una referencia para el botón de añadir laboratorio
  const addButtonRef = useRef<HTMLButtonElement>(null);
  
  // Función segura para abrir/cerrar el diálogo que maneja correctamente el foco
  const handleAddLaboratorioOpenChange = useCallback((open: boolean) => {
    setIsAddLaboratorioOpen(open);
    
    // Si el diálogo se está cerrando, restaurar el foco a un elemento seguro
    if (!open && addButtonRef.current) {
      // Usar setTimeout para asegurar que el foco se restaura DESPUÉS de que el diálogo se cierra
      setTimeout(() => {
        // Enfocar un elemento fuera del contenedor de la tabla
        document.body.focus();
        // Luego enfocar el botón de añadir
        addButtonRef.current?.focus();
      }, 0);
    }
  }, []);

  return (
    <>
      

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 max-w-[1000px]"
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            {/* Filter by name, especialidades, or contact */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 ps-9",
                Boolean(table.getColumn("nombre_laboratorio")?.getFilterValue()) && "pe-9",
              )}
              value={(table.getColumn("nombre_laboratorio")?.getFilterValue() ?? "") as string}
              onChange={(e) => table.getColumn("nombre_laboratorio")?.setFilterValue(e.target.value)}
                placeholder="Buscar por nombre, especialidades o contacto..."
              type="text"
                aria-label="Buscar por nombre, especialidades o contacto"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("nombre_laboratorio")?.getFilterValue()) && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn("nombre_laboratorio")?.setFilterValue("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <CircleX size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Toggle columns visibility */}
          <div>
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
                        {column.id === "nombre_laboratorio" ? "Nombre Laboratorio" : 
                           column.id === "especialidades" ? "Especialidades" : 
                           column.id === "contacto_principal" ? "Contacto" : 
                         column.id === "tiempo_entrega_promedio" ? "Entrega" : 
                         column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Delete button */}
          {table.getSelectedRowModel().rows.length > 0 && (
              <DeleteLaboratorioAlertDialog
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                laboratorioName={`${table.getSelectedRowModel().rows.length} ${
                  table.getSelectedRowModel().rows.length === 1 ? "laboratorio" : "laboratorios"
                } seleccionados`}
                onDelete={handleDeleteRows}
                trigger={
                <Button className="ml-auto" variant="outline">
                  <Trash
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Eliminar
                  <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
                }
              />
            )}
            {/* Add laboratorio button */}
            <Button 
              ref={addButtonRef}
              onClick={() => setIsAddLaboratorioOpen(true)}
            >
              <Plus className="-ms-1 me-2 h-4 w-4" />
              Nuevo Laboratorio
            </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-11"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer select-none items-center justify-between gap-2",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            // Enhanced keyboard handling for sorting
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: (
                              <ChevronUp
                                className="shrink-0 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDown
                                className="shrink-0 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                      row.getIsSelected() && "bg-muted"
                    )}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className={cn(
                          "last:py-0",
                          cell.column.id === "especialidades" && "hover:bg-transparent"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No hay resultados.
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        {/* Results per page */}
        <div className="flex items-center gap-3">
          <Label htmlFor={id} className="max-sm:sr-only">
            Filas por página
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger id={id} className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Page number information */}
        <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
          <p className="whitespace-nowrap text-sm text-muted-foreground" aria-live="polite">
            <span className="text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0,
                ),
                table.getRowCount(),
              )}
            </span>{" "}
            de <span className="text-foreground">{table.getRowCount().toString()}</span>
          </p>
        </div>

        {/* Pagination buttons */}
        <div>
          <Pagination>
            <PaginationContent>
              {/* First page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirst size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Previous page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Next page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Last page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLast size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </motion.div>

      {/* Modal para añadir laboratorios - ubicado fuera del contenedor principal para evitar conflictos ARIA */}
      <AddLaboratorioDialog
        onSubmit={handleCreateLaboratorio}
        isOpen={isAddLaboratorioOpen}
        onOpenChange={handleAddLaboratorioOpenChange}
      />
    </>
  );
} 