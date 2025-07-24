"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { GastoDetalle } from "@/lib/gastosService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FileText,
  Eye,
  Download,
  Receipt,
  User,
  CheckCircle,
  XCircle,
  UserCheck,
  Users,
  Building,
  Factory
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteGasto } from "@/lib/gastosService";

interface GastosTableProps {
  gastos: GastoDetalle[];
  isLoading: boolean;
  onRefresh: () => void;
  onEdit?: (gasto: GastoDetalle) => void;
}

export default function GastosTable({ gastos, isLoading, onRefresh, onEdit }: GastosTableProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState<GastoDetalle | null>(null);

  const handleDelete = async () => {
    if (!gastoToDelete) return;

    try {
      await deleteGasto(gastoToDelete.id);
      toast({
        title: "Éxito",
        description: "Gasto eliminado correctamente"
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting gasto:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el gasto",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setGastoToDelete(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return <Badge variant="default" className="bg-green-500">Pagado</Badge>;
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-500">Pendiente</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const getMetodoPagoBadge = (metodo: string) => {
    const metodosDisplay: Record<string, string> = {
      efectivo: 'Efect',
      transferencia: 'Trans',
      tarjeta_debito: 'TDD',
      tarjeta_credito: 'TDC',
      cheque: 'Cheque',
      otro: 'Otro'
    };
    
    return <Badge variant="outline">{metodosDisplay[metodo] || metodo}</Badge>;
  };

  // NUEVAS FUNCIONES PARA LOS BADGES
  const getFacturaBadge = (generaFactura?: boolean) => {
    if (generaFactura) {
      return (
        <Badge variant="default" className="bg-blue-500 text-white">
          <Receipt className="h-3 w-3 mr-1" />
          Con Factura
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-gray-500">
        Sin Factura
      </Badge>
    );
  };

  const getDeducibleBadge = (esDeducible?: boolean) => {
    if (esDeducible) {
      return (
        <Badge variant="default" className="bg-green-600 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Deducible
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-orange-600">
        <XCircle className="h-3 w-3 mr-1" />
        No Deducible
      </Badge>
    );
  };

  // NUEVA FUNCIÓN PARA IDENTIFICAR SUELDOS DE EMPLEADOS
  const getSueldoBadge = (subcategoriaNombre: string) => {
    const esSueldo = subcategoriaNombre?.toLowerCase().includes('sueldo') || 
                    subcategoriaNombre?.toLowerCase().includes('salario');
    
    if (esSueldo) {
      return (
        <Badge variant="default" className="bg-indigo-500 text-white">
          <Users className="h-3 w-3 mr-1" />
          Sueldo Empleado
        </Badge>
      );
    }
    return null;
  };

  // NUEVA FUNCIÓN PARA IDENTIFICAR COMISIONES DE DOCTORES
  const getComisionBadge = (subcategoriaNombre: string) => {
    const esComision = subcategoriaNombre?.toLowerCase().includes('comision') && 
                     subcategoriaNombre?.toLowerCase().includes('doctor');
    
    if (esComision) {
      return (
        <Badge variant="default" className="bg-purple-500 text-white">
          <UserCheck className="h-3 w-3 mr-1" />
          Comisión Doctor
        </Badge>
      );
    }
    return null;
  };

  // NUEVO: Badge para gastos con proveedor específico
  const getProveedorBadge = (gasto: any) => {
    if (gasto.proveedor_relacion_id || gasto.proveedor_id) {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Building className="h-3 w-3 mr-1" />
          Proveedor Registrado
        </Badge>
      );
    }
    return null;
  };

  // NUEVO: Badge para gastos con laboratorio específico
  const getLaboratorioBadge = (gasto: any) => {
    if (gasto.laboratorio_relacion_id || gasto.laboratorio_id) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Factory className="h-3 w-3 mr-1" />
          Laboratorio Registrado
        </Badge>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Pagado a</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Subcategoría</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (gastos.length === 0) {
    return (
      <div className="rounded-md border p-8">
        <div className="text-center">
          <p className="text-muted-foreground">No se encontraron gastos</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Pagado a</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Subcategoría</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gastos.map((gasto) => (
              <TableRow key={gasto.id}>
                <TableCell>
                  {format(new Date(gasto.fecha), 'dd MMM yyyy', { locale: es })}
                </TableCell>
                <TableCell>
                  {gasto.proveedor_beneficiario ? (
                    <div className="text-sm">
                      <span>{gasto.proveedor_beneficiario}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {getProveedorBadge(gasto)}
                    {getLaboratorioBadge(gasto)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: gasto.categoria_color || '#6B7280' }}
                    />
                    <span className="text-sm">{gasto.categoria_nombre}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <span>{gasto.subcategoria_nombre}</span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${gasto.monto.toLocaleString('es-MX')}
                </TableCell>
                <TableCell>
                  {getMetodoPagoBadge(gasto.metodo_pago)}
                </TableCell>
                <TableCell>
                  {getEstadoBadge(gasto.estado)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {gasto.comprobante_url && (
                        <DropdownMenuItem
                          onClick={() => window.open(gasto.comprobante_url, '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver comprobante
                        </DropdownMenuItem>
                      )}
                      
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(gasto)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem
                        onClick={() => {
                          setGastoToDelete(gasto);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el gasto
              {gastoToDelete && (
                <span className="font-medium"> &quot;{gastoToDelete.descripcion}&quot;</span>
              )}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 