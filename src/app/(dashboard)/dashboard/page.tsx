"use client";

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Type definitions
interface Paciente {
  id: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  celular?: string;
  created_at: string;
}

// Definir una interfaz para los planes de tratamiento
interface PlanTratamiento {
  id: string;
  costo_total: string | number;
  fecha: string;
}

// Interface for appointments
interface Appointment {
  id: string;
  date: string;
  time: string;
  patient_id: string;
  doctor_id: string;
  plan_tratamiento_id?: string | null;
  notes?: string;
  is_first_visit?: boolean;
  patient_nombre?: string;
  doctor_nombre?: string;
  plan_nombre?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [totalPatients, setTotalPatients] = useState(0);
  const [weeklyGrowthRate, setWeeklyGrowthRate] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [recentPatients, setRecentPatients] = useState<Paciente[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        const thisWeekCount = thisWeekData?.length || 0;
        const lastWeekCount = lastWeekData?.length || 0;
        
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
        const totalIncome = treatmentPlans.reduce((sum: number, plan: { costo_total: unknown }) => sum + parseFloat(String(plan.costo_total || '0')), 0);
        
        // Get recent patients (reduced to 3)
        const { data: patients, error: patientsError } = await supabase
          .from('pacientes')
          .select('id, nombre_completo, fecha_nacimiento, celular, created_at')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (patientsError) throw patientsError;

        // Get today's appointments
        const todayStr = format(today, 'yyyy-MM-dd');
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            date,
            time,
            patient_id,
            doctor_id,
            plan_tratamiento_id,
            notes,
            is_first_visit
          `)
          .eq('date', todayStr)
          .order('time', { ascending: true });

        if (appointmentsError) throw appointmentsError;

        // Get additional data for appointments if they exist
        let transformedAppointments: Appointment[] = [];
        
        if (appointments && appointments.length > 0) {
          // Get patient names
          const patientIds = Array.from(new Set(appointments.map(apt => apt.patient_id)));
          const { data: patientsData } = await supabase
            .from('pacientes')
            .select('id, nombre_completo')
            .in('id', patientIds);

          // Get doctor names
          const doctorIds = Array.from(new Set(appointments.map(apt => apt.doctor_id)));
          const { data: doctorsData } = await supabase
            .from('doctores')
            .select('id, nombre_completo')
            .in('id', doctorIds);

          // Get plan names for appointments that have plans
          const planIds = Array.from(new Set(appointments.filter(apt => apt.plan_tratamiento_id).map(apt => apt.plan_tratamiento_id)));
          let plansData: any[] = [];
          if (planIds.length > 0) {
            const { data } = await supabase
              .from('planes_tratamiento')
              .select('id, fecha')
              .in('id', planIds);
            plansData = data || [];
          }

          // Transform appointments data with joined information
          transformedAppointments = appointments.map(apt => {
            const patient = patientsData?.find(p => p.id === apt.patient_id);
            const doctor = doctorsData?.find(d => d.id === apt.doctor_id);
            const plan = plansData?.find(p => p.id === apt.plan_tratamiento_id);

            return {
              id: String(apt.id || ''),
              date: String(apt.date || ''),
              time: String(apt.time || ''),
              patient_id: String(apt.patient_id || ''),
              doctor_id: String(apt.doctor_id || ''),
              plan_tratamiento_id: apt.plan_tratamiento_id ? String(apt.plan_tratamiento_id) : null,
              notes: String(apt.notes || ''),
              is_first_visit: Boolean(apt.is_first_visit),
              patient_nombre: String(patient?.nombre_completo || ''),
              doctor_nombre: String(doctor?.nombre_completo || ''),
              plan_nombre: plan ? `Plan ${new Date(plan.fecha).toLocaleDateString()}` : undefined
            };
          });
        }
        
        // Update state
        setTotalPatients(patientCount || 0);
        setWeeklyGrowthRate(parseFloat(growthRate.toFixed(1)));
        setMonthlyIncome(totalIncome);
        setRecentPatients((patients || []).map(p => ({
          id: String(p.id || ''),
          nombre_completo: String(p.nombre_completo || ''),
          fecha_nacimiento: String(p.fecha_nacimiento || ''),
          celular: String(p.celular || ''),
          created_at: String(p.created_at || '')
        })));
        setTodayAppointments(transformedAppointments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
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

          {/* Recent patients and Today's appointments */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Recent patients */}
            <Card className="h-fit">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Pacientes Recientes</CardTitle>
                <Link href="/pacientes" className="text-sm text-primary hover:underline">
                  Ver Todos
                </Link>
              </CardHeader>
              <CardContent>
                {recentPatients.length > 0 ? (
                  <div className="space-y-3">
                    {recentPatients.map(patient => (
                      <div key={patient.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {getInitials(patient.nombre_completo)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{patient.nombre_completo}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(patient.created_at), 'dd MMM', { locale: es })}
                            </p>
                          </div>
                        </div>
                        <Link 
                          href={`/pacientes/${patient.id}/planes`} 
                          className="text-xs text-primary hover:underline"
                        >
                          Ver
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay pacientes recientes</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's appointments */}
            <Card className="h-fit">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Citas de Hoy</CardTitle>
                <Link href="/calendario" className="text-sm text-primary hover:underline">
                  Ver Calendario
                </Link>
              </CardHeader>
              <CardContent>
                {todayAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {todayAppointments.slice(0, 4).map(appointment => (
                      <div key={appointment.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{appointment.patient_nombre || 'Paciente'}</p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.time} • {appointment.is_first_visit ? 'Primera visita' : (appointment.plan_nombre || 'Plan de tratamiento')}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Dr. {appointment.doctor_nombre?.split(' ')[0] || 'N/A'}
                        </div>
                      </div>
                    ))}
                    {todayAppointments.length > 4 && (
                      <div className="text-xs text-center text-muted-foreground pt-2 border-t">
                        +{todayAppointments.length - 4} citas más
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay citas programadas</p>
                    <p className="text-xs mt-1">para el día de hoy</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 