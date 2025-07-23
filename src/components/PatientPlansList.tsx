import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Paciente } from "@/lib/database";
import { FileCheck, PlusCircle, ChevronRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { getPlanesTratamiento, getPatientTreatmentPlans, calculatePlanStatistics, getPlanDetail } from "@/lib/planesTratamientoService";
import { getPacienteById } from "@/lib/pacientesService";
import { useToast } from "@/components/ui/use-toast";
import { formatDateLocal } from "@/lib/formatDate";

interface PatientPlansListProps {
  patientId?: string;
  patientName?: string;
}

interface TreatmentPlanSummary {
  id: string;
  nombre?: string;
  fecha: string;
  costo_total: number;
  totalTreatments: number;
  totalTeeth: number;
  paciente_id: string;
  paciente_nombre: string;
}

export default function PatientPlansList({ patientId, patientName = "Paciente" }: PatientPlansListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<TreatmentPlanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Formatear fecha como "14 de mayo de 2025"
  const formatFecha = (fecha: string): string => {
    // Validación robusta para evitar errores
    if (!fecha || fecha === null || fecha === undefined || fecha === 'null' || fecha === 'undefined') {
      return 'Fecha no disponible';
    }
    
    try {
      return formatDateLocal(fecha, "dd 'de' MMMM 'de' yyyy");
    } catch (error) {
      console.error('Error formateando fecha:', fecha, error);
      return 'Fecha inválida';
    }
  };

  // Cargar planes cuando se monta el componente o cambia el patientId
  useEffect(() => {
    const loadPlans = async () => {
      setIsLoading(true);
      try {
        // Obtener los planes básicos desde Supabase (todos o filtrados por paciente)
        let rawPlans;
        if (patientId) {
          rawPlans = await getPatientTreatmentPlans(patientId);
        } else {
          // Para "Todos los planes", solo cargar los de los últimos 3 días
          rawPlans = await getPlanesTratamiento();
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          
          rawPlans = rawPlans.filter(plan => {
            const planDate = new Date(String(plan.fecha || ''));
            return planDate >= threeDaysAgo;
          });
        }
        
        // Crear un array para almacenar los planes con estadísticas
        const plansWithStats: TreatmentPlanSummary[] = [];
        
        // Para cada plan, cargar sus detalles y calcular estadísticas
        for (const plan of rawPlans) {
          try {
            // Cargar detalles del plan (incluyendo tooth status)
            const planDetails = await getPlanDetail(String(plan.id || ''));
            
            // Obtener información del paciente
            let nombrePaciente = "Paciente";
            if (patientId && patientName) {
              // Si ya tenemos el nombre del paciente filtrado, lo usamos
              nombrePaciente = patientName;
            } else {
              // Si no, lo buscamos por ID
              try {
                const paciente = await getPacienteById(String(plan.paciente_id || ''));
                if (paciente) {
                  nombrePaciente = paciente.nombre_completo;
                }
              } catch (error) {
                console.error(`Error obteniendo información del paciente ${String(plan.paciente_id || '')}:`, error);
              }
            }
            
            // Calcular estadísticas
            const stats = calculatePlanStatistics(planDetails.toothStatus);
            
            // Añadir el plan con estadísticas al array
            plansWithStats.push({
              id: String(plan.id || ''),
              nombre: `Plan ${new Date(String(plan.fecha || '')).toLocaleDateString()}`,
              fecha: String(plan.fecha || ''),
              costo_total: Number(plan.costo_total || 0),
              totalTreatments: stats.totalTreatments,
              totalTeeth: stats.totalTeeth,
              paciente_id: String(plan.paciente_id || ''),
              paciente_nombre: nombrePaciente
            });
          } catch (error) {
            console.error(`Error cargando detalles del plan ${String(plan.id || '')}:`, error);
          }
        }
        
        // Ordenar planes por fecha (más recientes primero)
        const sortedPlans = plansWithStats.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        
        setPlans(sortedPlans);
      } catch (error) {
        console.error("Error cargando planes:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes dentales",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [patientId, patientName, toast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4">
        {patientId ? `Planes de ${patientName}` : "Planes dentales recientes (últimos 3 días)"}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="overflow-hidden">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <div className="h-5 w-3/4 bg-slate-200 rounded-md animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded-md animate-pulse mt-2"></div>
                </div>
                <div className="h-8 w-24 bg-slate-200 rounded-md animate-pulse"></div>
              </CardHeader>
              <CardContent className="pb-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-1/3 bg-slate-200 rounded-md animate-pulse"></div>
                  <div className="h-4 w-6 bg-slate-200 rounded-md animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-2/5 bg-slate-200 rounded-md animate-pulse"></div>
                  <div className="h-4 w-6 bg-slate-200 rounded-md animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-1/4 bg-slate-200 rounded-md animate-pulse"></div>
                  <div className="h-4 w-16 bg-slate-200 rounded-md animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {plans.map(plan => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    <span>{plan.paciente_nombre}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    {plan?.fecha ? formatFecha(plan.fecha) : 'Fecha no disponible'}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-1 p-2 h-8"
                  onClick={() => router.push(`/pacientes/${plan.paciente_id}/planes/${plan.id}`)}
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Ver detalles</span>
                </Button>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="text-sm">
                    <span className="text-slate-600">Tratamientos: </span>
                    <span>{plan.totalTreatments}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">Dientes tratados: </span>
                    <span>{plan.totalTeeth}</span>
                  </div>
                  <div className="font-semibold">
                    <span>Total: </span>
                    <span>${plan.costo_total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-3">
              <FileCheck className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No hay planes disponibles</h3>
            <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
              {patientId 
                ? "Este paciente aún no tiene planes de tratamiento dental registrados. Puedes crear uno nuevo para comenzar."
                : "No hay planes de tratamiento dental de los últimos 3 días. Selecciona un paciente para crear un nuevo plan o revisa planes más antiguos."}
            </p>
            {patientId && (
              <Button 
                onClick={() => router.push(`/pacientes/${patientId}/nuevo-plan`)}
                variant="outline"
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Crear Nuevo Plan
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
} 