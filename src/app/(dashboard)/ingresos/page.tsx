"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  ChevronRight,
  CreditCard,
  Banknote,
  Building2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useConsultorio } from "@/contexts/ConsultorioContext";
import { 
  getIngresos, 
  getEstadisticasIngresos,
  IngresoDetalle 
} from "@/lib/ingresosService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import AddIngresoDialog from "@/components/ingresos/AddIngresoDialog";
import IngresosTable from "@/components/ingresos/IngresosTable";

interface Estadistica {
  label: string;
  value: string;
  change?: string;
  icon: React.ElementType;
  color: string;
}

export default function IngresosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { consultorio } = useConsultorio();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [ingresos, setIngresos] = useState<IngresoDetalle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterPeriodo, setFilterPeriodo] = useState<string>("mes");
  const [estadisticas, setEstadisticas] = useState({
    totalIngresos: 0,
    totalPagado: 0,
    totalPendiente: 0,
    cantidadTransacciones: 0
  });

  // Cargar datos
  const loadData = useCallback(async () => {
    if (!consultorio) return;

    try {
      setIsLoading(true);
      
      // Cargar ingresos
      const ingresosData = await getIngresos(consultorio.id);
      setIngresos(ingresosData);
      
      // Cargar estadísticas
      const stats = await getEstadisticasIngresos(
        consultorio.id, 
        filterPeriodo as 'hoy' | 'semana' | 'mes' | 'año'
      );
      setEstadisticas(stats);
      
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [consultorio, filterPeriodo, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar ingresos
  const filteredIngresos = ingresos.filter(ingreso => {
    const matchesSearch = 
      ingreso.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingreso.paciente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingreso.doctor_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === "todos" || ingreso.estado === filterEstado;
    
    return matchesSearch && matchesEstado;
  });

  // Estadísticas para mostrar
  const stats: Estadistica[] = [
    {
      label: "Ingresos Totales",
      value: `$${estadisticas.totalIngresos.toLocaleString('es-MX')}`,
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      label: "Total Cobrado",
      value: `$${estadisticas.totalPagado.toLocaleString('es-MX')}`,
      icon: Banknote,
      color: "text-green-600"
    },
    {
      label: "Por Cobrar",
      value: `$${estadisticas.totalPendiente.toLocaleString('es-MX')}`,
      icon: AlertCircle,
      color: "text-amber-600"
    },
    {
      label: "Transacciones",
      value: estadisticas.cantidadTransacciones.toString(),
      icon: FileText,
      color: "text-purple-600"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ingresos</h1>
          <p className="text-muted-foreground">
            Gestiona los ingresos de tu consultorio
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Ingreso
        </Button>
      </div>

      {/* Filtros de periodo */}
      <div className="flex gap-2">
        <Button
          variant={filterPeriodo === "hoy" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterPeriodo("hoy")}
        >
          Hoy
        </Button>
        <Button
          variant={filterPeriodo === "semana" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterPeriodo("semana")}
        >
          Semana
        </Button>
        <Button
          variant={filterPeriodo === "mes" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterPeriodo("mes")}
        >
          Mes
        </Button>
        <Button
          variant={filterPeriodo === "año" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterPeriodo("año")}
        >
          Año
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.change && (
                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista de Ingresos</TabsTrigger>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por concepto, paciente o doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado_parcial">Pago Parcial</SelectItem>
                  <SelectItem value="pagado_total">Pagado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>

          {/* Tabla de ingresos */}
          <IngresosTable 
            ingresos={filteredIngresos}
            isLoading={isLoading}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Categoría</CardTitle>
                <CardDescription>
                  Distribución de ingresos del {filterPeriodo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Aquí irá un gráfico de distribución */}
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Gráfico de distribución próximamente
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Doctores</CardTitle>
                <CardDescription>
                  Doctores con más ingresos generados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Aquí irá la lista de top doctores */}
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ranking de doctores próximamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para agregar ingreso */}
      <AddIngresoDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          loadData();
          setIsAddDialogOpen(false);
        }}
      />
    </motion.div>
  );
} 