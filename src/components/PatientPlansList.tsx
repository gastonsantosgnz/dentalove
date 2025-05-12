import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Paciente } from "@/lib/database";
import { FileCheck, PlusCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { getPatientTreatmentPlans, calculatePlanStatistics, getPlanDetail } from "@/lib/planesTratamientoService";
import { useToast } from "@/components/ui/use-toast";

interface PatientPlansListProps {
  patientId: string;
  patientName?: string;
}

interface TreatmentPlanSummary {
  id: string;
  nombre?: string;
  fecha: string;
  costo_total: number;
  totalTreatments: number;
  totalTeeth: number;
}

export default function PatientPlansList({ patientId, patientName = "Paciente" }: PatientPlansListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<TreatmentPlanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar planes cuando se monta el componente o cambia el patientId
  useEffect(() => {
    const loadPlans = async () => {
      if (!patientId) return;
      
      setIsLoading(true);
      try {
        // Obtener los planes básicos desde Supabase
        const rawPlans = await getPatientTreatmentPlans(patientId);
        
        // Crear un array para almacenar los planes con estadísticas
        const plansWithStats: TreatmentPlanSummary[] = [];
        
        // Para cada plan, cargar sus detalles y calcular estadísticas
        for (const plan of rawPlans) {
          try {
            // Cargar detalles del plan (incluyendo tooth status)
            const planDetails = await getPlanDetail(plan.id);
            
            // Calcular estadísticas
            const stats = calculatePlanStatistics(planDetails.toothStatus);
            
            // Añadir el plan con estadísticas al array
            plansWithStats.push({
              id: plan.id,
              nombre: plan.nombre || `Plan ${new Date(plan.fecha).toLocaleDateString()}`,
              fecha: plan.fecha,
              costo_total: plan.costo_total,
              totalTreatments: stats.totalTreatments,
              totalTeeth: stats.totalTeeth,
            });
          } catch (error) {
            console.error(`Error cargando detalles del plan ${plan.id}:`, error);
          }
        }
        
        setPlans(plansWithStats);
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
  }, [patientId, toast]);

  if (!patientId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4">
        Planes de {patientName}
      </h2>

      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <p className="text-slate-600">Cargando planes dentales...</p>
          </CardContent>
        </Card>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between">
                  <span>{plan.nombre}</span>
                  <span className="text-sm font-normal text-slate-600">
                    {new Date(plan.fecha).toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tratamientos:</span>
                    <span>{plan.totalTreatments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Dientes tratados:</span>
                    <span>{plan.totalTeeth}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${plan.costo_total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 py-3 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => router.push(`/pacientes/${patientId}/planes/${plan.id}`)}
                >
                  <span className="flex items-center">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Ver detalles
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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
              Este paciente aún no tiene planes de tratamiento dental registrados. Puedes crear uno nuevo para comenzar.
            </p>
            <Button 
              onClick={() => router.push(`/pacientes/${patientId}/nuevo-plan`)}
              variant="outline"
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Crear Nuevo Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
} 