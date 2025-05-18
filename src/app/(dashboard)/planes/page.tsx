"use client";

import { useState, useEffect } from "react";
import PatientSelector from "@/components/PatientSelector";
import PatientPlansList from "@/components/PatientPlansList";
import { Paciente } from "@/lib/database";
import { getPacientes } from "@/lib/pacientesService";

export default function PlanesPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);

  // Cargar datos del paciente cuando cambie el ID
  useEffect(() => {
    const loadPatientData = async () => {
      if (selectedPatientId) {
        try {
          const patients = await getPacientes();
          const patient = patients.find(p => p.id === selectedPatientId);
          setSelectedPatient(patient || null);
        } catch (error) {
          console.error("Error fetching patient data:", error);
          setSelectedPatient(null);
        }
      } else {
        setSelectedPatient(null);
      }
    };

    loadPatientData();
  }, [selectedPatientId]);

  // Manejar la selección de paciente
  const handlePatientSelected = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Planes Dentales</h1>
          <p className="text-slate-600">Gestiona los planes de tratamiento de tus pacientes</p>
        </div>
      </div>

      <PatientSelector 
        selectedPatientId={selectedPatientId} 
        onPatientSelected={handlePatientSelected} 
      />

      <PatientPlansList 
        patientId={selectedPatientId} 
        patientName={selectedPatient?.nombre_completo} 
      />
    </div>
  );
} 