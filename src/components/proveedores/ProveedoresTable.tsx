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
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Proveedor, createProveedor, deleteProveedor, getProveedores, updateProveedor } from "@/lib/proveedoresService";
import { ProveedorRowActions } from "./ProveedorRowActions";
import { DeleteProveedorAlertDialog } from "./DeleteProveedorAlertDialog";
import dynamic from "next/dynamic";

// Dynamically import the AddProveedorDialog component
const AddProveedorDialog = dynamic(() => import("./AddProveedorDialog"));

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Proveedor> = (row, columnId, filterValue) => {
  const searchableRowContent = `${row.original.nombre_comercial} ${row.original.categoria_proveedor || ''} ${row.original.contacto_principal || ''}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

// Custom filter function for categories
const categoriaFilterFn: FilterFn<Proveedor> = (row, columnId, filterValue: string[]) => {
  return filterValue.includes(row.original.categoria_proveedor || '');
};

export default function ProveedoresTable() {
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
  const [isAddProveedorOpen, setIsAddProveedorOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "nombre_comercial",
      desc: false,
    },
  ]);

  // Al iniciar, cargar los proveedores de Supabase
  const [data, setData] = useState<Proveedor[]>([]);
  
  // Cargar proveedores desde Supabase
  const loadProveedores = useCallback(async () => {
    try {
      setIsLoading(true);
      const proveedores = await getProveedores();
      setData(proveedores);
    } catch (error) {
      console.error("Error loading proveedores:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Mantener un estado local para los filtros de categoría
  const [categoriaFilters, setCategoriaFilters] = useState<string[]>([]);

  // Definir columnas básicas
  const columns: ColumnDef<Proveedor>[] = [
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
    header: "Nombre Comercial",
      accessorKey: "nombre_comercial",
      cell: ({ row }) => <div className="font-medium">{row.getValue("nombre_comercial")}</div>,
    size: 200,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
      header: "Categoría",
      accessorKey: "categoria_proveedor",
    cell: ({ row }) => {
        const categoria = row.original.categoria_proveedor;
        
        if (!categoria) return <div className="text-muted-foreground">-</div>;
      
      return (
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 border-orange-300">
            {categoria}
        </div>
      );
    },
      size: 150,
      filterFn: categoriaFilterFn,
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
    header: "Teléfono",
    accessorKey: "telefono",
      cell: ({ row }) => {
        const telefono = row.original.telefono;
        if (!telefono) return <div className="text-muted-foreground">-</div>;
        return <div>{telefono}</div>;
      },
    size: 120,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <ProveedorRowActions 
          row={row} 
          onProveedorUpdated={async (proveedor) => {
            try {
              await updateProveedor(proveedor.id, proveedor);
              // Refresh data after update
              await loadProveedores();
            } catch (error) {
              console.error('Error updating proveedor:', error);
            }
          }} 
          onProveedorDeleted={async (id) => {
            try {
              await deleteProveedor(id);
              // Refresh data after deletion
              await loadProveedores();
            } catch (error) {
              console.error('Error deleting proveedor:', error);
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
      // Eliminar cada proveedor seleccionado de Supabase
      for (const row of selectedRows) {
        await deleteProveedor(row.original.id);
      }
      
      // Actualizar datos después de eliminar
      await loadProveedores();
      table.resetRowSelection();
    } catch (error) {
      console.error("Error deleting proveedores:", error);
      throw error; // Propagar el error
    }
  }, [table, loadProveedores]);
  
  // Función para manejar la creación de proveedores - Esta no usa 'table', así que está bien aquí
  const handleCreateProveedor = useCallback(async (proveedorData: Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      // Guardar en Supabase
      await createProveedor(proveedorData);
      
      // Actualizar datos
      await loadProveedores();
    } catch (error) {
      console.error("Error creating proveedor:", error);
      throw error; // Propagar el error para que el diálogo lo maneje
    }
  }, [loadProveedores]);

  // Cargar datos al inicio
  useEffect(() => {
    loadProveedores();
    // Función de limpieza
    return () => {
      // Cancelar cualquier solicitud pendiente si es necesario
    };
  }, [loadProveedores]);

  // Sincronizar los filtros de categoría con la tabla
  useEffect(() => {
    if (categoriaFilters.length > 0) {
      table.getColumn("categoria_proveedor")?.setFilterValue(categoriaFilters);
    } else {
      table.getColumn("categoria_proveedor")?.setFilterValue(undefined);
    }
  }, [categoriaFilters, table]);

  // Get unique categories from data for filtering
  const { uniqueCategoriaValues, categoriaCounts } = useMemo(() => {
    const categoriaSet = new Set<string>();
    const counts = new Map<string, number>();
    
    data.forEach(proveedor => {
      if (proveedor.categoria_proveedor) {
        categoriaSet.add(proveedor.categoria_proveedor);
        counts.set(proveedor.categoria_proveedor, (counts.get(proveedor.categoria_proveedor) || 0) + 1);
      }
    });
    
    return {
      uniqueCategoriaValues: Array.from(categoriaSet),
      categoriaCounts: counts
    };
  }, [data]);

  const selectedCategorias = useMemo(() => {
    const filterValue = table.getColumn("categoria_proveedor")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table]);

  // Manejador para los checkboxes de categoría
  const handleCategoriaChange = (checked: boolean | "indeterminate", value: string) => {
    // Convertir cualquier valor "indeterminate" a false
    const isChecked = checked === true;
    
    setCategoriaFilters(prev => {
      if (isChecked) {
        // Añadir el valor si no existe
        if (!prev.includes(value)) {
          return [...prev, value];
        }
    } else {
        // Eliminar el valor si existe
        return prev.filter(v => v !== value);
      }
      return prev;
    });
  };

  // Crear una referencia para el botón de añadir proveedor
  const addButtonRef = useRef<HTMLButtonElement>(null);
  
  // Función segura para abrir/cerrar el diálogo que maneja correctamente el foco
  const handleAddProveedorOpenChange = useCallback((open: boolean) => {
    setIsAddProveedorOpen(open);
    
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
            {/* Filter by name, category, or contact */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 ps-9",
                Boolean(table.getColumn("nombre_comercial")?.getFilterValue()) && "pe-9",
              )}
              value={(table.getColumn("nombre_comercial")?.getFilterValue() ?? "") as string}
              onChange={(e) => table.getColumn("nombre_comercial")?.setFilterValue(e.target.value)}
                placeholder="Buscar por nombre, categoría o contacto..."
              type="text"
                aria-label="Buscar por nombre, categoría o contacto"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("nombre_comercial")?.getFilterValue()) && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn("nombre_comercial")?.setFilterValue("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <CircleX size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </div>
            {/* Filter by categoria */}
            {uniqueCategoriaValues.length > 0 && (
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                      Categoría
                      {categoriaFilters.length > 0 && (
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                          {categoriaFilters.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-36 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">Filtros</div>
                  <div className="space-y-3">
                        {uniqueCategoriaValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-${i}`}
                              checked={categoriaFilters.includes(value)}
                              onCheckedChange={(checked) => handleCategoriaChange(checked, value)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label
                          htmlFor={`${id}-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {value}{" "}
                          <span className="ms-2 text-xs text-muted-foreground">
                                {categoriaCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
            )}
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
                        {column.id === "nombre_comercial" ? "Nombre Comercial" : 
                           column.id === "categoria_proveedor" ? "Categoría" : 
                           column.id === "contacto_principal" ? "Contacto" : 
                         column.id === "telefono" ? "Teléfono" : 
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
              <DeleteProveedorAlertDialog
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                proveedorName={`${table.getSelectedRowModel().rows.length} ${
                  table.getSelectedRowModel().rows.length === 1 ? "proveedor" : "proveedores"
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
            {/* Add proveedor button */}
            <Button 
              ref={addButtonRef}
              onClick={() => setIsAddProveedorOpen(true)}
            >
              <Plus className="-ms-1 me-2 h-4 w-4" />
              Nuevo Proveedor
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
                          cell.column.id === "categoria_proveedor" && "hover:bg-transparent"
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

      {/* Modal para añadir proveedores - ubicado fuera del contenedor principal para evitar conflictos ARIA */}
      <AddProveedorDialog
        onSubmit={handleCreateProveedor}
        isOpen={isAddProveedorOpen}
        onOpenChange={handleAddProveedorOpenChange}
      />
    </>
  );
} 