'use client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { BarChart, Calendar, PieChart as PieChartIcon, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { format, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Type definitions
interface Paciente {
  id: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  celular?: string;
  created_at: string;
}

interface ServicioData {
  name: string;
  percentage: number;
  value: number;
}

interface MonthlyIncome {
  month: string;
  name: string;
  ingresoConfirmado: number;
  ingresoPendiente: number;
}

// Sample data for popular services
const monthlyPopularServices: ServicioData[] = [
  { name: "Alineadores transparentes", percentage: 25, value: 25 },
  { name: "Ortodoncia lingual", percentage: 20, value: 20 },
  { name: "Brackets estéticos/cerámicos", percentage: 15, value: 15 },
  { name: "Brackets metálicos completos", percentage: 30, value: 30 },
  { name: "Retratamiento endodóntico", percentage: 10, value: 10 }
];

const annualPopularServices: ServicioData[] = [
  { name: "Alineadores transparentes", percentage: 20, value: 20 },
  { name: "Ortodoncia lingual", percentage: 15, value: 15 },
  { name: "Brackets estéticos/cerámicos", percentage: 25, value: 25 },
  { name: "Brackets metálicos completos", percentage: 30, value: 30 },
  { name: "Retratamiento endodóntico", percentage: 10, value: 10 }
];

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [totalPatients, setTotalPatients] = useState(0);
  const [weeklyGrowthRate, setWeeklyGrowthRate] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [recentPatients, setRecentPatients] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Income data for charts
  const [monthlyIncomeData, setMonthlyIncomeData] = useState<MonthlyIncome[]>([]);
  const [annualIncomeData, setAnnualIncomeData] = useState<MonthlyIncome[]>([]);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get total patients count
        const { count: patientCount, error: countError } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        
        // Get patient growth data
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        
        const twoWeeksAgo = new Date(oneWeekAgo);
        twoWeeksAgo.setDate(oneWeekAgo.getDate() - 7);
        
        // Format dates for Supabase query
        const oneWeekAgoStr = oneWeekAgo.toISOString();
        const twoWeeksAgoStr = twoWeeksAgo.toISOString();
        
        // Get patients added in the last week
        const { data: thisWeekData, error: thisWeekError } = await supabase
          .from('pacientes')
          .select('id')
          .gte('created_at', oneWeekAgoStr);
          
        if (thisWeekError) throw thisWeekError;
        
        // Get patients added in the previous week
        const { data: lastWeekData, error: lastWeekError } = await supabase
          .from('pacientes')
          .select('id')
          .gte('created_at', twoWeeksAgoStr)
          .lt('created_at', oneWeekAgoStr);
          
        if (lastWeekError) throw lastWeekError;
        
        // Calculate growth rate
        const thisWeekCount = thisWeekData.length;
        const lastWeekCount = lastWeekData.length;
        
        let growthRate = 0;
        if (lastWeekCount > 0) {
          growthRate = ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;
        } else if (thisWeekCount > 0) {
          growthRate = 100; // If no patients last week but we have this week, 100% growth
        }
        
        // Get monthly income from treatment plans
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
        
        const { data: treatmentPlans, error: plansError } = await supabase
          .from('planes_tratamiento')
          .select('costo_total')
          .gte('fecha', firstDayOfMonth)
          .lte('fecha', lastDayOfMonth);
          
        if (plansError) throw plansError;
        
        // Sum up all treatment plan costs
        const totalIncome = treatmentPlans.reduce((sum, plan) => sum + parseFloat(plan.costo_total || 0), 0);
        
        // Get monthly income data for the chart (last 6 months)
        await fetchMonthlyIncomeData();
        
        // Get annual income data
        await fetchAnnualIncomeData();
        
        // Get recent patients
        const { data: patients, error: patientsError } = await supabase
          .from('pacientes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (patientsError) throw patientsError;
        
        // Update state
        setTotalPatients(patientCount || 0);
        setWeeklyGrowthRate(parseFloat(growthRate.toFixed(1)));
        setMonthlyIncome(totalIncome);
        setRecentPatients(patients || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Fetch monthly income data for the last 6 months
  const fetchMonthlyIncomeData = async () => {
    try {
      const today = new Date();
      const monthlyData: MonthlyIncome[] = [];
      
      // Get data for the last 6 months
      for (let i = 0; i < 6; i++) {
        const targetMonth = subMonths(today, i);
        const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
        
        // Obtener planes de tratamiento para el mes
        const { data: plans } = await supabase
          .from('planes_tratamiento')
          .select('id, costo_total, fecha')
          .gte('fecha', monthStart.toISOString())
          .lte('fecha', monthEnd.toISOString());
        
        // Valores predeterminados
        let confirmedIncome = 0;
        let pendingIncome = 0;
        
        // Para cada plan, obtener su progreso para calcular ingresos confirmados vs pendientes
        if (plans && plans.length > 0) {
          for (const plan of plans) {
            try {
              // Obtener servicios_progreso para este plan
              const { data: progreso } = await supabase
                .from('servicios_progreso')
                .select('estado, monto_pagado')
                .eq('plan_id', plan.id);
              
              if (progreso && progreso.length > 0) {
                // Sumar los montos pagados (completados)
                const confirmed = progreso
                  .filter(p => p.estado === 'completado')
                  .reduce((sum, p) => sum + (parseFloat(p.monto_pagado?.toString() || '0')), 0);
                
                confirmedIncome += confirmed;
                
                // El resto del costo total del plan se considera pendiente
                const planTotal = parseFloat(plan.costo_total || '0');
                pendingIncome += (planTotal - confirmed > 0) ? (planTotal - confirmed) : 0;
              } else {
                // Si no hay progreso, todo el costo del plan se considera pendiente
                pendingIncome += parseFloat(plan.costo_total || '0');
              }
            } catch (error) {
              console.error(`Error obteniendo progreso del plan ${plan.id}:`, error);
              pendingIncome += parseFloat(plan.costo_total || '0');
            }
          }
        }
        
        monthlyData.unshift({
          month: format(targetMonth, 'MMM', { locale: es }),
          name: format(targetMonth, 'MMM', { locale: es }),
          ingresoConfirmado: confirmedIncome,
          ingresoPendiente: pendingIncome
        });
      }
      
      setMonthlyIncomeData(monthlyData);
    } catch (error) {
      console.error('Error fetching monthly income data:', error);
    }
  };
  
  // Fetch annual income data
  const fetchAnnualIncomeData = async () => {
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const annualData: MonthlyIncome[] = [];
      
      // Get data for current year by month
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(currentYear, month, 1);
        const monthEnd = new Date(currentYear, month + 1, 0);
        
        // Obtener planes de tratamiento para el mes
        const { data: plans } = await supabase
          .from('planes_tratamiento')
          .select('id, costo_total, fecha')
          .gte('fecha', monthStart.toISOString())
          .lte('fecha', monthEnd.toISOString());
        
        // Valores predeterminados
        let confirmedIncome = 0;
        let pendingIncome = 0;
        
        // Para cada plan, obtener su progreso para calcular ingresos confirmados vs pendientes
        if (plans && plans.length > 0) {
          for (const plan of plans) {
            try {
              // Obtener servicios_progreso para este plan
              const { data: progreso } = await supabase
                .from('servicios_progreso')
                .select('estado, monto_pagado')
                .eq('plan_id', plan.id);
              
              if (progreso && progreso.length > 0) {
                // Sumar los montos pagados (completados)
                const confirmed = progreso
                  .filter(p => p.estado === 'completado')
                  .reduce((sum, p) => sum + (parseFloat(p.monto_pagado?.toString() || '0')), 0);
                
                confirmedIncome += confirmed;
                
                // El resto del costo total del plan se considera pendiente
                const planTotal = parseFloat(plan.costo_total || '0');
                pendingIncome += (planTotal - confirmed > 0) ? (planTotal - confirmed) : 0;
              } else {
                // Si no hay progreso, todo el costo del plan se considera pendiente
                pendingIncome += parseFloat(plan.costo_total || '0');
              }
            } catch (error) {
              console.error(`Error obteniendo progreso del plan ${plan.id}:`, error);
              pendingIncome += parseFloat(plan.costo_total || '0');
            }
          }
        }
        
        annualData.push({
          month: format(monthStart, 'MMM', { locale: es }),
          name: format(monthStart, 'MMM', { locale: es }),
          ingresoConfirmado: confirmedIncome,
          ingresoPendiente: pendingIncome
        });
      }
      
      setAnnualIncomeData(annualData);
    } catch (error) {
      console.error('Error fetching annual income data:', error);
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{`${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for bar chart
  const BarChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm flex items-center">
              <span 
                className="inline-block w-3 h-3 mr-2 rounded-full" 
                style={{ backgroundColor: entry.fill }}
              />
              <span className="font-medium">{entry.name}: </span>
              <span className="ml-1">${entry.value.toLocaleString('es-MX')}</span>
            </p>
          ))}
          <p className="text-sm font-medium mt-1 pt-1 border-t">
            Total: ${payload.reduce((sum: number, entry: any) => sum + entry.value, 0).toLocaleString('es-MX')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ProtectedRoute>
      <div className="container px-4 py-8 md:py-12">
        <div className="w-full max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold"
            >
              Dashboard
            </motion.h1>
          </div>
          
          {/* Stats cards */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8"
          >
            <motion.div variants={item}>
              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Pacientes</p>
                    <div className="text-3xl font-bold">{totalPatients}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {weeklyGrowthRate > 0 ? `+${weeklyGrowthRate}%` : weeklyGrowthRate < 0 ? `${weeklyGrowthRate}%` : '0%'} 
                      {' '}comparado con la semana anterior
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Ingresos Est. Mensuales</p>
                    <div className="text-3xl font-bold">${Math.round(monthlyIncome).toLocaleString('es-MX')}</div>
                    <p className="text-xs text-muted-foreground mt-1">Basado en planes de tratamiento</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Rendimiento</p>
                    <div className="text-3xl font-bold">0%</div>
                    <p className="text-xs text-muted-foreground mt-1">Tasa de finalización de tratamientos</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Middle section */}
          <div className="grid gap-8 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="mensual">
                  <TabsList className="mb-4">
                    <TabsTrigger value="mensual">Mensual</TabsTrigger>
                    <TabsTrigger value="anual">Anual</TabsTrigger>
                  </TabsList>
                  <TabsContent value="mensual" className="space-y-4">
                    <div className="h-[240px]">
                      {monthlyIncomeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart
                            data={monthlyIncomeData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: 10,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis 
                              tickFormatter={(value) => `$${value.toLocaleString()}`}
                              width={70}
                            />
                            <Tooltip content={<BarChartTooltip />} />
                            <Legend />
                            <Bar dataKey="ingresoConfirmado" name="Confirmado" fill="#4ADE80" stackId="a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ingresoPendiente" name="Pendiente" fill="#94A3B8" stackId="a" radius={[4, 4, 0, 0]} />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center flex-col text-center text-muted-foreground">
                          <BarChart className="h-10 w-10 mb-2 opacity-50" />
                          <p>Cargando datos de ingresos...</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Ingresos de los últimos 6 meses basados en planes de tratamiento
                    </p>
                  </TabsContent>
                  <TabsContent value="anual" className="space-y-4">
                    <div className="h-[240px]">
                      {annualIncomeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart
                            data={annualIncomeData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: 10,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis 
                              tickFormatter={(value) => `$${value.toLocaleString()}`}
                              width={70}
                            />
                            <Tooltip content={<BarChartTooltip />} />
                            <Legend />
                            <Bar dataKey="ingresoConfirmado" name="Confirmado" fill="#4ADE80" stackId="a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ingresoPendiente" name="Pendiente" fill="#94A3B8" stackId="a" radius={[4, 4, 0, 0]} />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center flex-col text-center text-muted-foreground">
                          <BarChart className="h-10 w-10 mb-2 opacity-50" />
                          <p>Cargando datos de ingresos anuales...</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Distribución de ingresos por mes para el año actual
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios Populares</CardTitle>
                <p className="text-sm text-muted-foreground">Servicios registrados por porcentaje de uso</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="mensual">
                  <TabsList className="mb-4">
                    <TabsTrigger value="mensual">Mensual</TabsTrigger>
                    <TabsTrigger value="anual">Anual</TabsTrigger>
                  </TabsList>
                  <TabsContent value="mensual" className="space-y-4">
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={monthlyPopularServices}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {monthlyPopularServices.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  <TabsContent value="anual" className="space-y-4">
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={annualPopularServices}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {annualPopularServices.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Recent patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pacientes Recientes</CardTitle>
              <Link href="/pacientes" className="text-sm text-primary hover:underline">
                Ver Todos
              </Link>
            </CardHeader>
            <CardContent>
              {recentPatients.length > 0 ? (
                <div className="space-y-4">
                  {recentPatients.map(patient => (
                    <div key={patient.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {getInitials(patient.nombre_completo)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{patient.nombre_completo}</p>
                          <p className="text-xs text-muted-foreground">
                            Registrado el {format(new Date(patient.created_at), 'dd MMM yyyy', { locale: es })}
                          </p>
                        </div>
                      </div>
                      <Link 
                        href={`/pacientes/${patient.id}`} 
                        className="text-xs text-primary hover:underline"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay pacientes recientes para mostrar</p>
                  <p className="text-sm mt-1">Los pacientes registrados aparecerán aquí</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 