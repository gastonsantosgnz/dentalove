"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Layers, Edit, Printer, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ToothStatus } from "@/components/DentalChart";
import { Servicio } from "@/components/ToothStatus";
import { PlanTratamiento } from "@/lib/database";
import { getCompletePlanTratamiento, getPlanVersiones, setActiveVersion, getPlanVersionDetail, deletePlanTratamiento } from "@/lib/planesTratamientoService";
import { getPacienteById } from "@/lib/pacientesService";
import { getServicios } from "@/lib/serviciosService";
import {
  PlanSummaryCard,
  TreatmentsTab,
  ConditionsTab,
  DeletePlanButton,
  PlanLoading,
  PlanError
} from "@/components/treatment-plan";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import TreatmentReport from "@/components/TreatmentReport";

// Importamos los nuevos componentes
import { PlanHeader, PlanActions, VersionSelector } from "@/components/planes";

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
};

// Interfaz para las versiones del plan
interface PlanVersion {
  id: string;
  nombre: string;
  activa: boolean;
  costo_total: number;
  plan_id: string;
  created_at: string;
}

export default function TreatmentPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const pacienteId = params.id as string;
  const planId = params.planId as string;
  
  const [plan, setPlan] = useState<PlanTratamiento | null>(null);
  const [toothStatus, setToothStatus] = useState<Record<string, ToothStatus[]>>({});
  const [patientName, setPatientName] = useState<string>("Paciente");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [activeVersion, setActiveVersionState] = useState<PlanVersion | null>(null);
  const [versionsToothStatus, setVersionsToothStatus] = useState<Record<string, Record<string, ToothStatus[]>>>({});
  const [toothComments, setToothComments] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load the complete plan from Supabase
        const { plan: loadedPlan, toothStatus: loadedStatus, version, toothComments: loadedComments } = await getCompletePlanTratamiento(planId);
        setPlan(loadedPlan);
        setToothStatus(loadedStatus);
        if (loadedComments) {
          setToothComments(loadedComments);
        }
        
        // Load versions
        const planVersions = await getPlanVersiones(planId);
        const transformedVersions = planVersions.map((v: any) => ({
          id: String(v.id || ''),
          nombre: String(v.nombre || ''),
          activa: Boolean(v.activa),
          costo_total: Number(v.costo_total || 0),
          plan_id: String(v.plan_id || ''),
          created_at: String(v.created_at || '')
        }));
        setVersions(transformedVersions);
        
        // Set active version
        const activeVer = transformedVersions.find((v: PlanVersion) => v.activa) || transformedVersions[0];
        setActiveVersionState(activeVer);
        
        // Load patient data from Supabase
        const patient = await getPacienteById(pacienteId);
        if (patient) {
          setPatientName(patient.nombre_completo);
        }
        
        // Load services for reference
        const services = await getServicios();
        setServicios(services);
        
        // Load toothStatus for all versions
        const versionsData: Record<string, Record<string, ToothStatus[]>> = {};
        
        for (const ver of transformedVersions) {
          try {
            const { toothStatus: versionToothStatus } = await getPlanVersionDetail(ver.id);
            versionsData[ver.id] = versionToothStatus;
          } catch (err) {
            console.error(`Error loading version ${ver.id} data:`, err);
          }
        }
        
        setVersionsToothStatus(versionsData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos. Intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [pacienteId, planId]);

  // Handler for when plan is deleted
  const handlePlanDeleted = () => {
    router.push(`/pacientes/${pacienteId}/planes`);
  };

  // Handler for back button
  const handleBack = () => {
    router.back();
  };
  
  // Handler for version change
  const handleVersionChange = async (versionId: string) => {
    try {
      // Make the selected version active
      await setActiveVersion(planId, versionId);
      
      // Get the version details
      const { version, toothStatus: versionToothStatus, toothComments: versionToothComments } = await getPlanVersionDetail(versionId);
      
      // Transform version data
      const transformedVersion = {
        id: String((version as any)?.id || ''),
        nombre: String((version as any)?.nombre || ''),
        activa: Boolean((version as any)?.activa),
        costo_total: Number((version as any)?.costo_total || 0),
        plan_id: String((version as any)?.plan_id || ''),
        created_at: String((version as any)?.created_at || '')
      };
      
      // Update the UI
      setActiveVersionState(transformedVersion);
      setToothStatus(versionToothStatus);
      if (versionToothComments) {
        setToothComments(versionToothComments);
      }
      
      // Update versions tooth status
      setVersionsToothStatus(prev => ({
        ...prev,
        [versionId]: versionToothStatus
      }));
      
      // Update total cost in plan
      if (plan) {
        setPlan({
          ...plan,
          costo_total: transformedVersion.costo_total
        });
      }
      
      toast({
        title: "Versión activada",
        description: `Se ha cambiado a la ${transformedVersion.nombre}`
      });
    } catch (error) {
      console.error("Error changing version:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar de versión",
        variant: "destructive"
      });
    }
  };

  // Loading state
  if (isLoading) {
    return <PlanLoading isLoading={isLoading} />;
  }

  // Error state
  if (error || !plan) {
    return <PlanError error={error} pacienteId={pacienteId} onBack={handleBack} />;
  }

  return (
    <div className="container max-w-6xl mx-auto py-6">
      {/* Header */}
      <PlanHeader 
        patientName={patientName} 
        planDate={plan.fecha} 
        onBack={handleBack} 
      />

      {/* Version Selector */}
      <VersionSelector 
        versions={versions} 
        activeVersionId={activeVersion?.id || ''} 
        onVersionChange={handleVersionChange} 
      />

      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mt-6">
        <PlanSummaryCard plan={plan} />

        {/* Action Buttons */}
        <PlanActions 
          planId={planId}
          pacienteId={pacienteId}
          toothStatus={toothStatus}
          patientName={patientName}
          servicios={servicios}
          planVersions={versions.map(v => ({
            id: v.id,
            nombre: v.nombre,
            toothStatus: versionsToothStatus[v.id] || {},
            totalCost: v.costo_total,
            isActive: v.activa
          }))}
          activeVersionId={activeVersion?.id || ''}
          versionsToothStatus={versionsToothStatus}
          onVersionChange={handleVersionChange}
          onPlanDeleted={handlePlanDeleted}
        />
      </div>

      <Tabs defaultValue="tratamientos" className="w-full mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
          <TabsTrigger value="condiciones">Condiciones</TabsTrigger>
          {versions.length > 1 && (
            <TabsTrigger value="versiones">Comparar Versiones</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="tratamientos">
          <TreatmentsTab 
            toothStatus={toothStatus} 
            servicios={servicios} 
            totalCost={plan.costo_total} 
            pacienteId={pacienteId}
            planId={planId}
            versionId={activeVersion?.id || ''}
          />
        </TabsContent>
        
        <TabsContent value="condiciones">
          <ConditionsTab toothStatus={toothStatus} toothComments={toothComments} />
        </TabsContent>
        
        {versions.length > 1 && (
          <TabsContent value="versiones">
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Comparación de Versiones</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left p-2">Versión</th>
                      <th className="text-left p-2">Costo Total</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-center p-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map(version => (
                      <tr key={version.id} className="border-b">
                        <td className="p-2 font-medium">{version.nombre}</td>
                        <td className="p-2">${version.costo_total.toLocaleString()}</td>
                        <td className="p-2">
                          {version.activa ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                              Activa
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                              Inactiva
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {version.activa ? (
                            <span className="text-xs text-slate-500">Versión actual</span>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVersionChange(version.id)}
                            >
                              Activar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="mt-4 text-sm text-slate-500">
                  <p>
                    Al activar una versión, se mostrarán los tratamientos y condiciones de esa versión
                    en la ficha del paciente y será la utilizada para cálculos de costos.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 