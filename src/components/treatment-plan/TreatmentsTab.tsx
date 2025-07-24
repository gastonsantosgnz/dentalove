import { useState, useEffect } from "react";
import { AlertTriangle, Check, CalendarIcon, DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToothStatus } from "@/components/DentalChart";
import { Servicio } from "@/components/ToothStatus";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ServicioProgreso,
  getServiciosProgresoPlan,
  marcarServicioCompletado,
  marcarServicioCancelado,
  registrarPagoServicio,
  createServicioProgreso
} from "@/lib/serviciosProgresoService";
import { createIngresoDesdeServicio } from "@/lib/ingresosService";
import { getDoctoresByConsultorio } from "@/lib/doctoresService";
import { getPlanTratamientoById } from "@/lib/planesTratamientoService";
import { useConsultorio } from "@/contexts/ConsultorioContext";
import { useToast } from "@/components/ui/use-toast";
import { isGeneralAreaKey } from "./utils";
import { GeneralTreatmentsTable } from "./GeneralTreatmentsTable";
import { SpecificToothTreatmentsTable } from "./SpecificToothTreatmentsTable";
import { FinancialSummaryCard } from "./FinancialSummaryCard";
import { 
  CompletarServicioDialog, 
  CancelarServicioDialog, 
  PagoServicioDialog 
} from "./dialogs";

interface TreatmentsTabProps {
  toothStatus: Record<string, ToothStatus[]>;
  servicios: Servicio[];
  totalCost: number;
  pacienteId: string;
  planId: string;
  versionId: string;
}

// Helper to get descriptive name for area keys
const getAreaName = (key: string): string => {
  return {
    "boca-completa": "Boca Completa",
    "arco-superior": "Arco Superior",
    "arco-inferior": "Arco Inferior",
    "supernumerario": "Diente Supernumerario"
  }[key] || `Diente ${key}`;
};

// Helper function to calculate service cost
const getServiceCost = (servicioId: string | undefined | null, servicios: Servicio[]): number => {
  if (!servicioId) return 0;
  const servicio = servicios.find(s => s.id === servicioId);
  return servicio ? servicio.costo : 0;
};

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Helper to format date
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

export function TreatmentsTab({ toothStatus, servicios, totalCost, pacienteId, planId, versionId }: TreatmentsTabProps) {
  const [loading, setLoading] = useState(false);
  const [serviciosProgreso, setServiciosProgreso] = useState<ServicioProgreso[]>([]);
  const [doctores, setDoctores] = useState<any[]>([]);
  const [planFecha, setPlanFecha] = useState<string>('');
  const { consultorio } = useConsultorio();
  const { toast } = useToast();
  
  // Estado para diálogos
  const [servicioActual, setServicioActual] = useState<{
    zona: string;
    nombreServicio: string;
    zonaId: string;
    servicioId: string | null | undefined;
    esGeneral: boolean;
    costo: number;
  } | null>(null);
  const [fecha, setFecha] = useState<Date>(new Date());
  const [monto, setMonto] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [openDialogType, setOpenDialogType] = useState<'completar' | 'cancelar' | 'pago' | null>(null);
  
  useEffect(() => {
    async function cargarProgreso() {
      if (!planId) return;
      
      setLoading(true);
      try {
        // Cargar progreso de servicios
        const progreso = await getServiciosProgresoPlan(planId);
        setServiciosProgreso(progreso);
        
        // Cargar información del plan para obtener la fecha
        const plan = await getPlanTratamientoById(planId);
        if (plan) {
          setPlanFecha(plan.fecha);
        }
        
        // Cargar doctores del consultorio
        if (consultorio?.id) {
          const doctoresData = await getDoctoresByConsultorio(consultorio.id);
          setDoctores(doctoresData);
        }
      } catch (error) {
        console.error("Error al cargar el progreso de servicios:", error);
      } finally {
        setLoading(false);
      }
    }
    
    cargarProgreso();
  }, [planId, consultorio?.id]);
  
  // Process treatments and group them
  const specificToothTreatments: Record<string, { teeth: string[]; color: string; servicio_id?: string | null }> = {};
  const generalAreaTreatments: Record<string, { areas: string[]; color: string; servicio_id?: string | null }> = {};
  
  // Process each tooth/zone
  Object.entries(toothStatus).forEach(([zone, statuses]) => {
    // Process treatments
    statuses.filter(s => s.type === 'treatment').forEach(treatment => {
      const treatmentName = treatment.status;
      const color = treatment.color;
      const servicioId = treatment.servicio_id;
      
      if (isGeneralAreaKey(zone)) {
        // Add to general treatments
        if (!generalAreaTreatments[treatmentName]) {
          generalAreaTreatments[treatmentName] = { areas: [], color, servicio_id: servicioId };
        }
        if (!generalAreaTreatments[treatmentName].areas.includes(zone)) {
          generalAreaTreatments[treatmentName].areas.push(zone);
        }
      } else {
        // Add to specific tooth treatments
        if (!specificToothTreatments[treatmentName]) {
          specificToothTreatments[treatmentName] = { teeth: [], color, servicio_id: servicioId };
        }
        if (!specificToothTreatments[treatmentName].teeth.includes(zone)) {
          specificToothTreatments[treatmentName].teeth.push(zone);
        }
      }
    });
  });
  
  const hasSpecificTreatments = Object.keys(specificToothTreatments).length > 0;
  const hasGeneralTreatments = Object.keys(generalAreaTreatments).length > 0;
  const hasAnyTreatments = hasSpecificTreatments || hasGeneralTreatments;

  // Calcular el número total de tratamientos y recalcular el costo total
  const totalTreatments = Object.entries(specificToothTreatments).reduce((count, [_, data]) => 
    count + data.teeth.length, 0) + Object.keys(generalAreaTreatments).length;
  
  // Recalcular el costo total sumando los costos de todos los servicios
  const calculatedTotalCost = 
    // Suma de servicios específicos por diente
    Object.entries(specificToothTreatments).reduce((total, [_, data]) => {
      const serviceCost = getServiceCost(data.servicio_id, servicios);
      return total + (serviceCost * data.teeth.length);
    }, 0) +
    // Suma de servicios generales
    Object.entries(generalAreaTreatments).reduce((total, [_, data]) => {
      const serviceCost = getServiceCost(data.servicio_id, servicios);
      return total + serviceCost;
    }, 0);

  // Buscar un servicio de progreso por zona y nombre
  const findServicioProgreso = (zonaId: string, servicioId: string | null | undefined): ServicioProgreso | undefined => {
    if (!servicioId) return undefined;
    
    // Buscar el ID real del tratamiento
    let tratamientoId: string | null = null;
        
    // Buscar en toothStatus el treatment.id correspondiente para este zonaId y servicioId
    // zonaId puede ser un ID generado como "14-Barniz de Flúor", necesitamos extraer la zona real
    let zona = zonaId;
    if (zonaId.includes('-')) {
      zona = zonaId.split('-')[0]; // Extraer la primera parte (número de diente o área general)
    }
    
    Object.entries(toothStatus).forEach(([zone, statuses]) => {
      if (zone === zona) { // Si es la zona que buscamos
        statuses.filter(s => s.type === 'treatment' && s.servicio_id === servicioId).forEach(treatment => {
          tratamientoId = treatment.id;
        });
      }
    });
    
    if (!tratamientoId) return undefined;
    
    // Buscar con el ID real del tratamiento
    return serviciosProgreso.find(p => 
      p.zona_tratamiento_id === tratamientoId && 
      p.version_id === versionId
    );
  };
  
  // Manejar marcar servicio como completado
  const handleCompletarServicio = async () => {
    if (!servicioActual) return;
    
    try {
      setLoading(true);
      
      // Buscar si ya existe un registro de progreso
      const existingProgreso = findServicioProgreso(
        servicioActual.zonaId, 
        servicioActual.servicioId
      );
      
      if (existingProgreso) {
        // Actualizar el registro existente
        await marcarServicioCompletado(
          existingProgreso.id,
          fecha.toISOString(),
          parseFloat(monto) || servicioActual.costo,
          notas
        );
      } else {
        // Buscar el ID real del zona_tratamiento
        let tratamientoId: string | null = null;
        
        // Buscar en toothStatus el treatment.id correspondiente
        Object.entries(toothStatus).forEach(([zone, statuses]) => {
          statuses.filter(s => s.type === 'treatment').forEach(treatment => {
            if (treatment.status === servicioActual.nombreServicio && 
                treatment.servicio_id === servicioActual.servicioId) {
              tratamientoId = treatment.id;
            }
          });
        });
        
        if (!tratamientoId) {
          console.error("No se encontró el ID del tratamiento");
          throw new Error("No se encontró el ID del tratamiento");
        }
        
        // Crear un nuevo registro con el ID del tratamiento correcto
        await createServicioProgreso({
          paciente_id: pacienteId,
          plan_id: planId,
          version_id: versionId,
          zona_tratamiento_id: tratamientoId, // Usar el ID real del tratamiento
          estado: 'completado',
          fecha_realizacion: fecha.toISOString(),
          monto_pagado: parseFloat(monto) || servicioActual.costo,
          fecha_pago: fecha.toISOString(),
          notas
        });
      }
      
      // Recargar datos
      const progreso = await getServiciosProgresoPlan(planId);
      setServiciosProgreso(progreso);
      
      // Limpiar estado
      setOpenDialogType(null);
      setServicioActual(null);
      setFecha(new Date());
      setMonto('');
      setNotas('');
    } catch (error) {
      console.error("Error al completar el servicio:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar marcar servicio como cancelado
  const handleCancelarServicio = async () => {
    if (!servicioActual) return;
    
    try {
      setLoading(true);
      
      // Buscar si ya existe un registro de progreso
      const existingProgreso = findServicioProgreso(
        servicioActual.zonaId, 
        servicioActual.servicioId
      );
      
      if (existingProgreso) {
        // Actualizar el registro existente
        await marcarServicioCancelado(existingProgreso.id, notas);
      } else {
        // Buscar el ID real del zona_tratamiento
        let tratamientoId: string | null = null;
        
        // Buscar en toothStatus el treatment.id correspondiente
        Object.entries(toothStatus).forEach(([zone, statuses]) => {
          statuses.filter(s => s.type === 'treatment').forEach(treatment => {
            if (treatment.status === servicioActual.nombreServicio && 
                treatment.servicio_id === servicioActual.servicioId) {
              tratamientoId = treatment.id;
            }
          });
        });
        
        if (!tratamientoId) {
          console.error("No se encontró el ID del tratamiento");
          throw new Error("No se encontró el ID del tratamiento");
        }
        
        // Crear un nuevo registro con el ID del tratamiento correcto
        await createServicioProgreso({
          paciente_id: pacienteId,
          plan_id: planId,
          version_id: versionId,
          zona_tratamiento_id: tratamientoId, // Usar el ID real del tratamiento
          estado: 'cancelado',
          notas
        });
      }
      
      // Recargar datos
      const progreso = await getServiciosProgresoPlan(planId);
      setServiciosProgreso(progreso);
      
      // Limpiar estado
      setOpenDialogType(null);
      setServicioActual(null);
      setNotas('');
    } catch (error) {
      console.error("Error al cancelar el servicio:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar registrar pago
  const handleRegistrarPago = async () => {
    if (!servicioActual) return;
    
    try {
      setLoading(true);
      
      // Buscar si ya existe un registro de progreso
      const existingProgreso = findServicioProgreso(
        servicioActual.zonaId, 
        servicioActual.servicioId
      );
      
      if (existingProgreso) {
        // Actualizar el pago
        await registrarPagoServicio(
          existingProgreso.id,
          parseFloat(monto) || servicioActual.costo,
          fecha.toISOString()
        );
      } else {
        // Buscar el ID real del zona_tratamiento
        let tratamientoId: string | null = null;
        
        // Buscar en toothStatus el treatment.id correspondiente
        Object.entries(toothStatus).forEach(([zone, statuses]) => {
          statuses.filter(s => s.type === 'treatment').forEach(treatment => {
            if (treatment.status === servicioActual.nombreServicio && 
                treatment.servicio_id === servicioActual.servicioId) {
              tratamientoId = treatment.id;
            }
          });
        });
        
        if (!tratamientoId) {
          console.error("No se encontró el ID del tratamiento");
          throw new Error("No se encontró el ID del tratamiento");
        }
        
        // Crear un nuevo registro con el ID del tratamiento correcto
        await createServicioProgreso({
          paciente_id: pacienteId,
          plan_id: planId,
          version_id: versionId,
          zona_tratamiento_id: tratamientoId, // Usar el ID real del tratamiento
          estado: 'pendiente',
          monto_pagado: parseFloat(monto) || servicioActual.costo,
          fecha_pago: fecha.toISOString()
        });
      }
      
      // Recargar datos
      const progreso = await getServiciosProgresoPlan(planId);
      setServiciosProgreso(progreso);
      
      // Limpiar estado
      setOpenDialogType(null);
      setServicioActual(null);
      setFecha(new Date());
      setMonto('');
    } catch (error) {
      console.error("Error al registrar el pago:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletarClick = (servicioParams: {
    zona: string;
    nombreServicio: string;
    zonaId: string;
    servicioId: string | null | undefined;
    esGeneral: boolean;
    costo: number;
  }) => {
    setServicioActual(servicioParams);
    setMonto(servicioParams.costo.toString());
              setFecha(new Date());
              setNotas('');
              setOpenDialogType('completar');
  };

  const handleCancelarClick = (servicioParams: {
    zona: string;
    nombreServicio: string;
    zonaId: string;
    servicioId: string | null | undefined;
    esGeneral: boolean;
    costo: number;
  }) => {
    setServicioActual(servicioParams);
              setNotas('');
              setOpenDialogType('cancelar');
  };

  const handlePagoClick = (servicioParams: {
    zona: string;
    nombreServicio: string;
    zonaId: string;
    servicioId: string | null | undefined;
    esGeneral: boolean;
    costo: number;
  }) => {
    const progreso = findServicioProgreso(servicioParams.zonaId, servicioParams.servicioId);
    
    setServicioActual(servicioParams);
    if (progreso) {
              setMonto(progreso.monto_pagado.toString());
              setFecha(new Date(progreso.fecha_pago || Date.now()));
    } else {
      setMonto(servicioParams.costo.toString());
      setFecha(new Date());
    }
    setOpenDialogType('pago');
  };

  if (!hasAnyTreatments) {
      return (
      <div className="text-center py-8 border rounded-md">
        <AlertTriangle className="mx-auto h-8 w-8 text-slate-600 mb-2" />
        <p>No se encontraron tratamientos en este plan.</p>
        </div>
      );
    }

  return (
    <div className="space-y-4">
      {/* General Area Treatments */}
      {hasGeneralTreatments && (
        <GeneralTreatmentsTable 
          generalAreaTreatments={generalAreaTreatments}
          servicios={servicios}
          toothStatus={toothStatus}
          findServicioProgreso={findServicioProgreso}
          onCompletarClick={handleCompletarClick}
          onCancelarClick={handleCancelarClick}
          onPagoClick={handlePagoClick}
          planFecha={planFecha}
        />
      )}
      
      {/* Specific Tooth Treatments */}
      {hasSpecificTreatments && (
        <SpecificToothTreatmentsTable 
          specificToothTreatments={specificToothTreatments}
          servicios={servicios}
          toothStatus={toothStatus}
          findServicioProgreso={findServicioProgreso}
          onCompletarClick={handleCompletarClick}
          onCancelarClick={handleCancelarClick}
          onPagoClick={handlePagoClick}
          planFecha={planFecha}
        />
      )}
      
      {/* Total Cost */}
      <div className="mt-6">
        <FinancialSummaryCard 
          totalCost={calculatedTotalCost}
          serviciosProgreso={serviciosProgreso}
          totalTreatments={totalTreatments}
        />
                  </div>
                  
      {/* Diálogos */}
      <CompletarServicioDialog
        open={openDialogType === 'completar'}
        onOpenChange={(open) => !open && setOpenDialogType(null)}
        servicioActual={servicioActual}
        fecha={fecha}
        setFecha={setFecha}
        monto={monto}
        setMonto={setMonto}
        notas={notas}
        setNotas={setNotas}
        onConfirm={handleCompletarServicio}
        loading={loading}
      />
      
      <CancelarServicioDialog
        open={openDialogType === 'cancelar'}
        onOpenChange={(open) => !open && setOpenDialogType(null)}
        servicioActual={servicioActual}
        notas={notas}
        setNotas={setNotas}
        onConfirm={handleCancelarServicio}
        loading={loading}
      />
      
      <PagoServicioDialog
        open={openDialogType === 'pago'}
        onOpenChange={(open) => !open && setOpenDialogType(null)}
        servicioActual={servicioActual}
        fecha={fecha}
        setFecha={setFecha}
        monto={monto}
        setMonto={setMonto}
        onConfirm={handleRegistrarPago}
        loading={loading}
      />
    </div>
  );
} 