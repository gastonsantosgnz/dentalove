"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import OdontogramArea from "@/components/OdontogramArea";
import { getPatientType } from "@/components/AddPatientDialog";
import { getPacienteById } from "@/lib/pacientesService";
import { getServicios } from "@/lib/serviciosService";
import { getCompletePlanTratamiento } from "@/lib/planesTratamientoService";
import { Servicio } from "@/lib/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function EditTreatmentPlanPage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = params.id as string;
  const planId = params.planId as string;
  
  const [patientName, setPatientName] = useState<string>("Paciente");
  const [patientType, setPatientType] = useState<"Adulto" | "Pediátrico" | "Adolescente">("Adulto");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [existingPlanData, setExistingPlanData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load patient data from Supabase
        const patient = await getPacienteById(pacienteId);
        if (patient) {
          setPatientName(patient.nombre_completo);
          
          // Determine patient type based on birth date
          if (patient.fecha_nacimiento) {
            setPatientType(getPatientType(patient.fecha_nacimiento));
          } else {
            setPatientType("Adulto"); // Default fallback
          }
        } else {
          setError("No se encontró información del paciente");
        }
        
        // Load services for the odontogram
        const services = await getServicios();
        setServicios(services);
        
        // Load existing plan data
        const planData = await getCompletePlanTratamiento(planId);
        if (planData) {
          setExistingPlanData(planData);
        } else {
          setError("No se pudo cargar la información del plan");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos. Intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [pacienteId, planId]);

  const handlePlanUpdated = () => {
    // We no longer want to redirect automatically after updating
    // This allows users to see the success state and generate a report
    // router.push(`/pacientes/${pacienteId}/planes/${planId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-slate-400 animate-spin mb-4" />
        <p>Cargando datos del plan...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.push(`/pacientes/${pacienteId}/planes/${planId}`)}
          aria-label="Volver"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Plan Dental</h1>
      </div>
      
      {existingPlanData && (
        <OdontogramArea
          patientName={patientName}
          patientType={patientType}
          servicios={servicios}
          pacienteId={pacienteId}
          onPlanSaved={handlePlanUpdated}
          existingPlan={{
            planId: planId,
            planData: existingPlanData.plan,
            toothStatus: existingPlanData.toothStatus,
            toothComments: existingPlanData.toothComments || {},
            versions: existingPlanData.versions || []
          }}
          isEditing={true}
        />
      )}
    </div>
  );
} 