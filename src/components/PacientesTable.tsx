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
  Row,
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
  Ellipsis,
  Filter,
  ListFilter,
  Plus,
  Trash,
  Activity
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AddPatientDialog } from "@/components/AddPatientDialog";
import { getPatientTreatmentPlans } from "@/lib/treatmentPlansStorage";
import { getPatientType } from "@/components/AddPatientDialog";
import { RowActions } from "@/components/RowActions";
import { Paciente } from "@/lib/database";
import { 
  getPacientes, 
  createPaciente, 
  updatePaciente, 
  deletePaciente as deleteSupabasePaciente 
} from "@/lib/pacientesService";
import Link from "next/link";

type Item = Paciente & {
  tipoPaciente?: string;
};

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Item> = (row, columnId, filterValue) => {
  const searchableRowContent = `${row.original.nombre_completo} ${row.original.celular || ''}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

// The filter function for patient type that works with the more detailed types
const tipoPacienteFilterFn: FilterFn<Item> = (row, columnId, filterValue: string[]) => {
  const tipo = getPatientType(row.original.fecha_nacimiento);
  return filterValue.includes(tipo);
};

// Helper function to calculate age from birthdate
const calculateAge = (birthdate: string): number => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Helper function to determine patient type based on age (simplified version)
// This is kept for compatibility with existing code but we'll use the imported one
const getLocalPatientType = (birthdate: string): "Adulto" | "Pediátrico" => {
  const age = calculateAge(birthdate);
  return age >= 16 ? "Adulto" : "Pediátrico";
};

export default function PacientesTable() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para controlar el diálogo de añadir paciente
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "nombre_completo",
      desc: false,
    },
  ]);

  // Al iniciar, cargar los pacientes de Supabase
  const [data, setData] = useState<Item[]>([]);
  
  // Load patients from Supabase
  const loadPacientes = async () => {
    try {
      setIsLoading(true);
      const pacientes = await getPacientes();
      setData(pacientes);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadPacientes();
  }, []);

  // Definir columnas básicas
  const columns: ColumnDef<Item>[] = [
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
      accessorKey: "nombre_completo",
      cell: ({ row }) => <div className="font-medium">{row.getValue("nombre_completo")}</div>,
    size: 180,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Tipo",
    id: "tipoPaciente",
      accessorFn: (row: Item) => getPatientType(row.fecha_nacimiento),
    cell: ({ row }) => {
        const pacienteType = getPatientType(row.original.fecha_nacimiento);
      
      const getBadgeColor = (type: string) => {
        switch (type) {
          case "Pediátrico":
            return "bg-blue-100 text-blue-800 border-blue-300";
          case "Adolescente":
            return "bg-purple-100 text-purple-800 border-purple-300";
          case "Adulto":
            return "bg-emerald-100 text-emerald-800 border-emerald-300";
          default:
            return "bg-gray-100 text-gray-800 border-gray-300";
        }
      };
      
      return (
        <div className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          getBadgeColor(pacienteType)
        )}>
          {pacienteType}
        </div>
      );
    },
    size: 100,
    filterFn: tipoPacienteFilterFn,
  },
  {
    header: "Edad",
    id: "edad",
      accessorFn: (row: Item) => calculateAge(row.fecha_nacimiento),
    cell: ({ row }) => {
        const edad = calculateAge(row.original.fecha_nacimiento);
      return <div>{edad} años</div>;
    },
    size: 80,
  },
  {
    header: "Celular",
    accessorKey: "celular",
      cell: ({ row }) => <div>{row.original.celular || '-'}</div>,
    size: 120,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions 
          row={row as any} 
          onPacienteUpdated={async (paciente) => {
            try {
              await updatePaciente(paciente.id, paciente);
              // Refresh data after update
              await loadPacientes();
            } catch (error) {
              console.error('Error updating patient:', error);
            }
          }} 
          onPacienteDeleted={async (id) => {
            try {
              await deleteSupabasePaciente(id);
              // Refresh data after deletion
              await loadPacientes();
            } catch (error) {
              console.error('Error deleting patient:', error);
            }
          }} 
        />
      ),
      size: 60,
      enableHiding: false,
    },
  ];

  const handleDeleteRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    
    try {
      // Delete each selected patient from Supabase
      for (const row of selectedRows) {
        await deleteSupabasePaciente(row.original.id);
      }
      
      // Refresh data after deletions
      await loadPacientes();
    table.resetRowSelection();
    } catch (error) {
      console.error("Error deleting patients:", error);
    }
  };

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

  // Get unique patient types from data for filtering
  const { uniqueTipoValues, tipoCounts } = useMemo(() => {
    // Define all possible patient types
    const allTypes = ["Infantil", "Adolescente", "Adulto", "Adulto mayor"];
    
    // Count patients by type
    const counts = new Map<string, number>();
    allTypes.forEach(type => counts.set(type, 0));
    
    data.forEach(patient => {
      const type = getPatientType(patient.fecha_nacimiento);
      counts.set(type, (counts.get(type) || 0) + 1);
    });
    
    // Filter out types with no patients
    const uniqueTypes = allTypes.filter(type => counts.get(type)! > 0);
    
    // If no patients, show all possible types
    return {
      uniqueTipoValues: uniqueTypes.length > 0 ? uniqueTypes : allTypes,
      tipoCounts: counts
    };
  }, [data]);

  const selectedTipos = useMemo(() => {
    const filterValue = table.getColumn("tipoPaciente")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table]);

  const handleTipoChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("tipoPaciente")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table.getColumn("tipoPaciente")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 max-w-[1000px]"
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Filter by name or phone */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 ps-9",
                Boolean(table.getColumn("nombre_completo")?.getFilterValue()) && "pe-9",
              )}
              value={(table.getColumn("nombre_completo")?.getFilterValue() ?? "") as string}
              onChange={(e) => table.getColumn("nombre_completo")?.setFilterValue(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              type="text"
              aria-label="Buscar por nombre o teléfono"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("nombre_completo")?.getFilterValue()) && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn("nombre_completo")?.setFilterValue("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <CircleX size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </div>
          {/* Filter by tipo */}
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
                  Tipo
                  {selectedTipos.length > 0 && (
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                      {selectedTipos.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-36 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">Filtros</div>
                  <div className="space-y-3">
                    {uniqueTipoValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-${i}`}
                          checked={selectedTipos.includes(value)}
                          onCheckedChange={(checked: boolean) => handleTipoChange(checked, value)}
                        />
                        <Label
                          htmlFor={`${id}-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {value}{" "}
                          <span className="ms-2 text-xs text-muted-foreground">
                            {tipoCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
                        {column.id === "nombre_completo" ? "Nombre" : 
                         column.id === "tipoPaciente" ? "Tipo" : 
                         column.id === "edad" ? "Edad" : 
                         column.id === "celular" ? "Celular" : 
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
            <AlertDialog>
              <Button 
                className="ml-auto" 
                variant="outline" 
                onClick={() => {}}
              >
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
                      Esta acción no se puede deshacer. Eliminará permanentemente{" "}
                      {table.getSelectedRowModel().rows.length} {table.getSelectedRowModel().rows.length === 1 ? "paciente" : "pacientes"} seleccionados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRows}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {/* Add paciente button */}
          <Button 
            className="ml-auto bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
            onClick={() => setIsAddPatientOpen(true)}
          >
            <Plus
              className="-ms-1 me-2"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            Nuevo Paciente
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
                          cell.column.id === "tipoPaciente" && "hover:bg-transparent"
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

      {/* Add Patient Dialog */}
      <AddPatientDialog
        open={isAddPatientOpen}
        onOpenChange={setIsAddPatientOpen}
        onSubmit={async (patientData) => {
          try {
            // patientData ya tiene la estructura correcta para Supabase
            // ya que viene del formulario actualizado
            
            // Save to Supabase
            await createPaciente(patientData);
            
            // Refresh data
            await loadPacientes();
          } catch (error) {
            console.error("Error creating patient:", error);
          }
        }}
      />
    </motion.div>
  );
} 