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
} from "@/components/ui";
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
  Clock,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AddServiceDialog } from "@/components/AddServiceDialog";
import { EditServiceDialog } from "@/components/EditServiceDialog";
import { Servicio } from "@/lib/database";
import { 
  getServicios, 
  createServicio, 
  updateServicio, 
  deleteServicio as deleteSupabaseServicio 
} from "@/lib/serviciosService";

// Import the new components
import { getColumns } from "@/components/servicios/ServicesColumns";
import TableFilters from "@/components/servicios/TableFilters";
import ColumnVisibility from "@/components/servicios/ColumnVisibility";
import DeleteSelectedDialog from "@/components/servicios/DeleteSelectedDialog";
import TablePagination from "@/components/servicios/TablePagination";

type Item = Servicio;

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Item> = (row, columnId, filterValue) => {
  const searchableRowContent = `${row.original.nombre_servicio} ${row.original.descripcion || ''}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

// Helper function to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(price);
};

// Helper function to format duration
const formatDuration = (minutes: number): string => {
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

export default function ServicesTable() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "nombre_servicio",
      desc: false,
    },
  ]);

  const [data, setData] = useState<Item[]>([]);
  
  // Load services from Supabase - memoize this function to prevent recreating it on every render
  const loadServicios = useCallback(async () => {
    try {
      setIsLoading(true);
      const servicios = await getServicios();
      setData(servicios);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Pre-declare these functions so they can be referenced in the columns definition
  const handleServiceUpdated = useCallback(async (servicio: Servicio) => {
    try {
      await updateServicio(servicio.id, servicio);
      // Refresh data after update in a controlled way
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 100);
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      return false;
    }
  }, []);

  const handleServiceDeleted = useCallback(async (id: string) => {
    try {
      await deleteSupabaseServicio(id);
      // Refresh data after deletion in a controlled way
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 100);
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      return false;
    }
  }, []);
  
  // Memoize columns to prevent unnecessary re-creation
  const columns = useMemo(
    () => getColumns({
      handleServiceUpdated,
      handleServiceDeleted
    }), 
    [handleServiceUpdated, handleServiceDeleted]
  );
  
  // Use useEffect to load data when needed, with proper cleanup
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (isMounted) {
        await loadServicios();
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent memory leaks and updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [refreshKey, loadServicios]);

  // Memoize the table instance to prevent recreation on each render
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
    // Optimize row selection
    enableRowSelection: true,
    autoResetPageIndex: false,
  });

  // Handle deleting multiple selected rows
  const handleDeleteRows = useCallback(async () => {
    // Capture the current selected rows
    const selectedRowIds = table.getSelectedRowModel().rows.map(row => row.original.id);
    
    try {
      // Delete each selected service from Supabase
      for (const id of selectedRowIds) {
        await deleteSupabaseServicio(id);
      }
      
      // Refresh data after deletions in a controlled way
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 100);
      
      // Reset selection only if we have a table instance
      table.resetRowSelection();
    } catch (error) {
      console.error("Error deleting services:", error);
    }
  }, [table]);

  return (
    <div className="space-y-4 max-w-[1000px]">
      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Search filter */}
          <TableFilters table={table} id={id} />
          
          {/* Column visibility dropdown */}
          <ColumnVisibility table={table} />
        </div>
        <div className="flex items-center gap-3">
          {/* Delete button for selected rows */}
          <DeleteSelectedDialog table={table} onDelete={handleDeleteRows} />
          
          {/* Add service button */}
          <AddServiceDialog
            onSubmit={async (serviceData) => {
              try {
                // Save to Supabase
                await createServicio(serviceData);
                
                // Refresh data in a controlled way
                setTimeout(() => {
                  setRefreshKey(prev => prev + 1);
                }, 100);
              } catch (error) {
                console.error("Error creating service:", error);
              }
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
          </div>
        ) : (
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
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              header.column.getCanSort() &&
                                "flex h-full cursor-pointer select-none items-center justify-between gap-2",
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={(e) => {
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
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow 
                    key={row.id}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                      row.getIsSelected() && "bg-muted"
                    )}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="last:py-0">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No hay resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <TablePagination table={table} id={id} />
    </div>
  );
}

 