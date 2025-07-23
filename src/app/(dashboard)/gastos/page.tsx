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
  TrendingDown,
  Package,
  Wrench,
  Building2,
  AlertCircle,
  PieChart,
  Settings
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useConsultorio } from "@/contexts/ConsultorioContext";
import { 
  getGastos, 
  getEstadisticasGastos,
  getCategorias,
  getGastosPorCategoria,
  crearCategoriasPredefinidas,
  GastoDetalle,
  CategoriaGasto
} from "@/lib/gastosService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import AddGastoDialog from "@/components/gastos/AddGastoDialog";
import GastosTable from "@/components/gastos/GastosTable";

interface Estadistica {
  label: string;
  value: string;
  change?: string;
  icon: React.ElementType;
  color: string;
}

export default function GastosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { consultorio } = useConsultorio();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [gastos, setGastos] = useState<GastoDetalle[]>([]);
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("todas");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterPeriodo, setFilterPeriodo] = useState<string>("mes");
  const [estadisticas, setEstadisticas] = useState({
    totalGastos: 0,
    totalFijos: 0,
    totalVariables: 0,
    cantidadGastos: 0,
    promedioDiario: 0
  });
  const [gastosPorCategoria, setGastosPorCategoria] = useState<any[]>([]);

  // Cargar datos
  const loadData = useCallback(async () => {
    if (!consultorio) return;

    try {
      setIsLoading(true);
      
      // Cargar categorías
      const categoriasData = await getCategorias(consultorio.id);
      
      // Si no hay categorías, crear las predefinidas
      if (categoriasData.length === 0) {
        await crearCategoriasPredefinidas(consultorio.id);
        const nuevasCategorias = await getCategorias(consultorio.id);
        setCategorias(nuevasCategorias);
      } else {
        setCategorias(categoriasData);
      }
      
      // Cargar gastos
      const gastosData = await getGastos(consultorio.id);
      setGastos(gastosData);
      
      // Cargar estadísticas
      const stats = await getEstadisticasGastos(
        consultorio.id, 
        filterPeriodo as 'hoy' | 'semana' | 'mes' | 'año'
      );
      setEstadisticas(stats);
      
      // Cargar gastos por categoría para el gráfico
      const now = new Date();
      const fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1);
      const fechaFin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const gastosCat = await getGastosPorCategoria(consultorio.id, fechaInicio, fechaFin);
      setGastosPorCategoria(gastosCat);
      
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

  // Filtrar gastos
  const filteredGastos = gastos.filter(gasto => {
    const matchesSearch = 
      gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.categoria_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.subcategoria_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = filterCategoria === "todas" || gasto.categoria_id === filterCategoria;
    const matchesEstado = filterEstado === "todos" || gasto.estado === filterEstado;
    
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  // Estadísticas para mostrar
  const stats: Estadistica[] = [
    {
      label: "Total Gastos",
      value: `$${estadisticas.totalGastos.toLocaleString('es-MX')}`,
      icon: DollarSign,
      color: "text-red-600"
    },
    {
      label: "Gastos Fijos",
      value: `$${estadisticas.totalFijos.toLocaleString('es-MX')}`,
      icon: Building2,
      color: "text-blue-600"
    },
    {
      label: "Gastos Variables",
      value: `$${estadisticas.totalVariables.toLocaleString('es-MX')}`,
      icon: Package,
      color: "text-amber-600"
    },
    {
      label: "Promedio Diario",
      value: `$${estadisticas.promedioDiario.toLocaleString('es-MX')}`,
      icon: TrendingDown,
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
          <h1 className="text-3xl font-bold tracking-tight">Gastos</h1>
          <p className="text-muted-foreground">
            Gestiona los gastos de tu consultorio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/gastos/categorias')} className="gap-2">
            <Settings className="h-4 w-4" />
            Categorías
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar Gasto
          </Button>
        </div>
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
          <TabsTrigger value="lista">Lista de Gastos</TabsTrigger>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descripción, categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: cat.color || '#6B7280' }}
                        />
                        {cat.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>

          {/* Tabla de gastos */}
          <GastosTable 
            gastos={filteredGastos}
            isLoading={isLoading}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categoría</CardTitle>
                <CardDescription>
                  Gastos del {filterPeriodo} por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gastosPorCategoria.length > 0 ? (
                    gastosPorCategoria.map((cat) => (
                      <div key={cat.categoria_id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: cat.categoria_color }}
                            />
                            <span className="text-sm font-medium">{cat.categoria_nombre}</span>
                          </div>
                          <span className="text-sm font-bold">
                            ${cat.total.toLocaleString('es-MX')}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500"
                            style={{ 
                              width: `${cat.porcentaje}%`,
                              backgroundColor: cat.categoria_color
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {cat.porcentaje.toFixed(1)}% del total
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No hay gastos en este período
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gastos Recurrentes</CardTitle>
                <CardDescription>
                  Gastos fijos más comunes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Análisis de gastos recurrentes próximamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para agregar gasto */}
      <AddGastoDialog
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