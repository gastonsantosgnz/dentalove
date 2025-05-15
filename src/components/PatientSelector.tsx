import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPacientes, createPaciente } from "@/lib/pacientesService";
import { Paciente, PacienteCreate } from "@/lib/database";
import { PlusCircle } from "lucide-react";
import { AddPatientDialog } from "@/components/AddPatientDialog";

interface PatientSelectorProps {
  selectedPatientId: string;
  onPatientSelected: (patientId: string) => void;
}

export default function PatientSelector({ selectedPatientId, onPatientSelected }: PatientSelectorProps) {
  const router = useRouter();
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar pacientes de Supabase
  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const supabasePacientes = await getPacientes();
      setPatients(supabasePacientes);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Manejar cuando se agrega un nuevo paciente
  const handlePatientAdded = async (patientData: PacienteCreate) => {
    try {
      // Guardar el nuevo paciente en Supabase
      await createPaciente(patientData);
      // Recargar la lista de pacientes
      await loadPatients();
    } catch (error) {
      console.error("Error creating patient:", error);
    }
  };

  // Función para manejar la opción "Todos los pacientes"
  const handleSelectionChange = (value: string) => {
    // Si seleccionamos "all", pasamos string vacía para mostrar todos los planes
    if (value === "all") {
      onPatientSelected("");
    } else {
      onPatientSelected(value);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle></CardTitle>
        <CardDescription>Elija un paciente para filtrar los planes dentales</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="patient-select">Paciente</Label>
            <Select 
              value={selectedPatientId || "all"} 
              onValueChange={handleSelectionChange}
            >
              <SelectTrigger id="patient-select" className="w-full">
                <SelectValue placeholder="Selecciona un paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pacientes</SelectItem>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Cargando pacientes...
                  </SelectItem>
                ) : patients.length > 0 ? (
                  patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.nombre_completo}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-patients" disabled>
                    No hay pacientes disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <AddPatientDialog onSubmit={handlePatientAdded} />
          
          {selectedPatientId && (
            <Button 
              onClick={() => router.push(`/pacientes/${selectedPatientId}/nuevo-plan`)}
              variant="outline"
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Crear Nuevo Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 