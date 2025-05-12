"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import OdontogramArea from "@/components/OdontogramArea";
import { getPatientType } from "@/components/AddPatientDialog";
import { getPacienteById } from "@/lib/pacientesService";
import { getServicios } from "@/lib/serviciosService";
import { Servicio } from "@/lib/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function NewTreatmentPlanPage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = params.id as string;
  
  const [patientName, setPatientName] = useState<string>("Paciente");
  const [patientType, setPatientType] = useState<"Adulto" | "Pediátrico" | "Adolescente">("Adulto");
  const [servicios, setServicios] = useState<Servicio[]>([]);
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
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos. Intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [pacienteId]);

  const handlePlanSaved = () => {
    // Redirect to the list of plans after saving
    router.push(`/pacientes/${pacienteId}/planes`);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p>Cargando datos del paciente...</p>
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
          onClick={() => router.back()}
          aria-label="Volver"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Plan Dental</h1>
      </div>
      
      <OdontogramArea
        patientName={patientName}
        patientType={patientType}
        servicios={servicios}
        pacienteId={pacienteId}
        onPlanSaved={handlePlanSaved}
      />
    </div>
  );
} 