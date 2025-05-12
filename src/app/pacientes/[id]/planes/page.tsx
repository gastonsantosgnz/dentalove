"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CalendarIcon, ChevronRight, FilePlus, FileCheck, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { getPlanesTratamientoPaciente, getCompletePlanTratamiento, calculatePlanStatistics, getPlanVersiones } from "@/lib/planesTratamientoService";
import { getPacienteById } from "@/lib/pacientesService";
import { PlanTratamiento } from "@/lib/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
};

// Tipo para estadísticas del plan
interface PlanStatistics {
  id: string; 
  totalTreatments: number;
  totalTeeth: number;
  costoTotal: number;
  versionCount?: number;
  activeVersionName?: string;
}

export default function PatientTreatmentPlansPage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = params.id as string;
  
  const [plans, setPlans] = useState<PlanTratamiento[]>([]);
  const [planStats, setPlanStats] = useState<Record<string, PlanStatistics>>({});
  const [patientName, setPatientName] = useState<string>("Paciente");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load plans from Supabase
        const patientPlans = await getPlanesTratamientoPaciente(pacienteId);
        setPlans(patientPlans);
        
        // Load patient data from Supabase
        const patient = await getPacienteById(pacienteId);
        if (patient) {
          setPatientName(patient.nombre_completo);
        }
        
        // Get statistics for each plan
        const statsObject: Record<string, PlanStatistics> = {};
        
        for (const plan of patientPlans) {
          try {
            // Get complete plan data with tooth status
            const { toothStatus, version } = await getCompletePlanTratamiento(plan.id);
            
            // Get versions count for this plan
            const versions = await getPlanVersiones(plan.id);
            
            // Calculate statistics
            const stats = calculatePlanStatistics(toothStatus);
            
            // Store stats with plan id
            statsObject[plan.id] = {
              id: plan.id,
              totalTreatments: stats.totalTreatments,
              totalTeeth: stats.totalTeeth,
              costoTotal: plan.costo_total,
              versionCount: versions.length,
              activeVersionName: version?.nombre || "Versión 1"
            };
          } catch (err) {
            console.error(`Error getting stats for plan ${plan.id}:`, err);
            // Use default values if we can't get stats
            statsObject[plan.id] = {
              id: plan.id,
              totalTreatments: 0,
              totalTeeth: 0,
              costoTotal: plan.costo_total,
              versionCount: 1,
              activeVersionName: "Versión 1"
            };
          }
        }
        
        setPlanStats(statsObject);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos. Intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [pacienteId]);

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{patientName}</h1>
          <p className="text-slate-600">Planes de tratamiento dental</p>
        </div>
        <Button onClick={() => router.push(`/pacientes/${pacienteId}/nuevo-plan`)}>
          <FilePlus className="mr-2 h-4 w-4" />
          Nuevo Plan
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Cargando planes de tratamiento...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/30">
          <div className="space-y-3">
            <div className="relative mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-medium">No hay planes de tratamiento</h3>
            <p className="text-slate-600 max-w-sm mx-auto">
              Este paciente no tiene planes de tratamiento. Cree un nuevo plan para comenzar.
            </p>
            <Button onClick={() => router.push(`/pacientes/${pacienteId}/nuevo-plan`)}>
              <FilePlus className="mr-2 h-4 w-4" />
              Crear Plan
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {plans.map((plan) => {
            const stats = planStats[plan.id] || {
              totalTreatments: 0,
              totalTeeth: 0,
              costoTotal: plan.costo_total,
              versionCount: 1,
              activeVersionName: "Versión 1"
            };
            
            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between">
                    <span>Plan Dental</span>
                    <span className="text-sm font-normal text-slate-600">
                      {formatDate(plan.fecha)}
                    </span>
                  </CardTitle>
                  {stats.versionCount && stats.versionCount > 1 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Layers className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-xs text-slate-500">
                        {stats.versionCount} versiones • Activa: {stats.activeVersionName}
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    {plan.observaciones && (
                      <p className="text-sm text-slate-600 mb-3">
                        {plan.observaciones.length > 100 
                          ? `${plan.observaciones.substring(0, 100)}...` 
                          : plan.observaciones}
                      </p>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tratamientos:</span>
                      <span>{stats.totalTreatments}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Dientes tratados:</span>
                      <span>{stats.totalTeeth}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${stats.costoTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-3 border-t">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between"
                    onClick={() => router.push(`/pacientes/${pacienteId}/planes/${plan.id}`)}
                  >
                    <span className="flex items-center">
                      <FileCheck className="mr-2 h-4 w-4" />
                      Ver detalles
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 