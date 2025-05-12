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

interface TreatmentsTabProps {
  toothStatus: Record<string, ToothStatus[]>;
  servicios: Servicio[];
  totalCost: number;
  pacienteId: string;
  planId: string;
  versionId: string;
}

// Helper to determine if key is a general area
const isGeneralAreaKey = (key: string): boolean => {
  return ["boca-completa", "arco-superior", "arco-inferior"].includes(key);
};

// Helper to get descriptive name for area keys
const getAreaName = (key: string): string => {
  return {
    "boca-completa": "Boca Completa",
    "arco-superior": "Arco Superior",
    "arco-inferior": "Arco Inferior",
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
        const progreso = await getServiciosProgresoPlan(planId);
        setServiciosProgreso(progreso);
      } catch (error) {
        console.error("Error al cargar el progreso de servicios:", error);
      } finally {
        setLoading(false);
      }
    }
    
    cargarProgreso();
  }, [planId]);
  
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

  if (!hasAnyTreatments) {
    return (
      <div className="text-center py-8 border rounded-md">
        <AlertTriangle className="mx-auto h-8 w-8 text-slate-600 mb-2" />
        <p>No se encontraron tratamientos en este plan.</p>
      </div>
    );
  }

  // Renderizar botones de acción para un servicio
  const renderActionButtons = (
    zonaId: string, 
    nombreServicio: string,
    servicioId: string | null | undefined,
    esGeneral: boolean,
    costo: number
  ) => {
    // Buscar progreso de este servicio
    const progreso = findServicioProgreso(zonaId, servicioId);
    
    if (!progreso || progreso.estado === 'pendiente') {
      return (
        <div className="flex space-x-2 mt-2">
          <Button 
            size="sm" 
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={() => {
              setServicioActual({
                zona: zonaId,
                nombreServicio,
                zonaId,
                servicioId,
                esGeneral,
                costo
              });
              setMonto(costo.toString());
              setFecha(new Date());
              setNotas('');
              setOpenDialogType('completar');
            }}
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            <span>Completar</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              setServicioActual({
                zona: zonaId,
                nombreServicio,
                zonaId,
                servicioId,
                esGeneral,
                costo
              });
              setNotas('');
              setOpenDialogType('cancelar');
            }}
          >
            <XCircle className="mr-1 h-3 w-3" />
            <span>Cancelar</span>
          </Button>
        </div>
      );
    }
    
    // Si está completado, mostrar los detalles y botón de pago
    if (progreso.estado === 'completado') {
      return (
        <div className="mt-2">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <div className="flex items-center">
              <Check className="mr-1 h-3 w-3 text-green-600" />
              <span>Realizado: {formatDate(progreso.fecha_realizacion)}</span>
            </div>
            <span>Pagado: ${formatCurrency(parseFloat(progreso.monto_pagado.toString()))}</span>
          </div>
          
          <Button 
            size="sm" 
            variant="outline"
            className="mt-2 w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => {
              setServicioActual({
                zona: zonaId,
                nombreServicio,
                zonaId,
                servicioId,
                esGeneral,
                costo
              });
              setMonto(progreso.monto_pagado.toString());
              setFecha(new Date(progreso.fecha_pago || Date.now()));
              setOpenDialogType('pago');
            }}
          >
            <DollarSign className="mr-1 h-3 w-3" />
            <span>Actualizar Pago</span>
          </Button>
        </div>
      );
    }
    
    // Si está cancelado
    if (progreso.estado === 'cancelado') {
      return (
        <div className="mt-2">
          <div className="flex items-center text-xs text-red-600">
            <XCircle className="mr-1 h-3 w-3" />
            <span>Cancelado</span>
          </div>
          {progreso.notas && (
            <div className="text-xs text-slate-600 mt-1">
              Motivo: {progreso.notas}
            </div>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            className="mt-2 w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={() => {
              setServicioActual({
                zona: zonaId,
                nombreServicio,
                zonaId,
                servicioId,
                esGeneral,
                costo
              });
              setMonto(costo.toString());
              setFecha(new Date());
              setNotas('');
              setOpenDialogType('completar');
            }}
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            <span>Marcar como Completado</span>
          </Button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      {/* General Area Treatments */}
      {hasGeneralTreatments && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tratamientos Generales</CardTitle>
            <CardDescription>Tratamientos aplicados a áreas completas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Área</th>
                    <th className="text-left py-2 px-3 font-medium">Tratamiento</th>
                    <th className="text-right py-2 px-3 font-medium">Costo</th>
                    <th className="text-center py-2 px-3 font-medium">Estado</th>
                    <th className="text-center py-2 px-3 font-medium">Fecha</th>
                    <th className="text-right py-2 px-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(generalAreaTreatments).map(([treatment, data]) => {
                    const serviceCost = getServiceCost(data.servicio_id, servicios);
                    const serviceId = data.servicio_id || '';
                    
                    // Crear un ID único para esta zona de tratamiento
                    const zonaId = `general-${treatment}-${data.areas.join('-')}`;
                    
                    // Buscar el ID real del tratamiento para esta área
                    let realTreatmentId: string | null = null;
                    data.areas.forEach(area => {
                      Object.entries(toothStatus).forEach(([zone, statuses]) => {
                        if (zone === area) { // Si es el área que buscamos
                          statuses.filter(s => s.type === 'treatment' && s.status === treatment).forEach(t => {
                            realTreatmentId = t.id;
                          });
                        }
                      });
                    });
                    
                    // Buscar progreso para este tratamiento
                    const progreso = findServicioProgreso(zonaId, data.servicio_id);
                    
                    return (
                      <tr key={zonaId} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-medium">{data.areas.map(getAreaName).join(", ")}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></div>
                            <span>{treatment}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          ${serviceCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {!progreso || progreso.estado === 'pendiente' ? (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>Pendiente</span>
                            </Badge>
                          ) : progreso.estado === 'completado' ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                              <Check className="mr-1 h-3 w-3" />
                              <span>Completado</span>
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                              <XCircle className="mr-1 h-3 w-3" />
                              <span>Cancelado</span>
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-xs text-slate-600">
                          {progreso?.fecha_realizacion ? formatDate(progreso.fecha_realizacion) : '-'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex justify-end gap-1">
                            {!progreso || progreso.estado === 'pendiente' ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-green-600"
                                  onClick={() => {
                                    setServicioActual({
                                      zona: zonaId,
                                      nombreServicio: treatment,
                                      zonaId: realTreatmentId || zonaId, // Usar el ID real si existe
                                      servicioId: data.servicio_id,
                                      esGeneral: true,
                                      costo: serviceCost
                                    });
                                    setMonto(serviceCost.toString());
                                    setFecha(new Date());
                                    setNotas('');
                                    setOpenDialogType('completar');
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-red-600"
                                  onClick={() => {
                                    setServicioActual({
                                      zona: zonaId,
                                      nombreServicio: treatment,
                                      zonaId: realTreatmentId || zonaId, // Usar el ID real si existe
                                      servicioId: data.servicio_id,
                                      esGeneral: true,
                                      costo: serviceCost
                                    });
                                    setNotas('');
                                    setOpenDialogType('cancelar');
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            ) : progreso.estado === 'completado' ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 w-8 p-0 text-blue-600"
                                onClick={() => {
                                  setServicioActual({
                                    zona: zonaId,
                                    nombreServicio: treatment,
                                    zonaId: realTreatmentId || zonaId, // Usar el ID real si existe
                                    servicioId: data.servicio_id,
                                    esGeneral: true,
                                    costo: serviceCost
                                  });
                                  setMonto(progreso.monto_pagado.toString());
                                  setFecha(new Date(progreso.fecha_pago || Date.now()));
                                  setOpenDialogType('pago');
                                }}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 w-8 p-0 text-green-600"
                                onClick={() => {
                                  setServicioActual({
                                    zona: zonaId,
                                    nombreServicio: treatment,
                                    zonaId: realTreatmentId || zonaId, // Usar el ID real si existe
                                    servicioId: data.servicio_id,
                                    esGeneral: true,
                                    costo: serviceCost
                                  });
                                  setMonto(serviceCost.toString());
                                  setFecha(new Date());
                                  setNotas('');
                                  setOpenDialogType('completar');
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Specific Tooth Treatments */}
      {hasSpecificTreatments && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tratamientos por Diente</CardTitle>
            <CardDescription>Tratamientos aplicados a dientes específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Diente</th>
                    <th className="text-left py-2 px-3 font-medium">Tratamiento</th>
                    <th className="text-right py-2 px-3 font-medium">Costo</th>
                    <th className="text-center py-2 px-3 font-medium">Estado</th>
                    <th className="text-center py-2 px-3 font-medium">Fecha</th>
                    <th className="text-right py-2 px-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(specificToothTreatments).flatMap(([treatment, data]) => {
                    const serviceCost = getServiceCost(data.servicio_id, servicios);
                    const serviceId = data.servicio_id || '';
                    
                    // Devolver una fila para cada diente con este tratamiento
                    return data.teeth.map(tooth => {
                      // Create a unique ID for this treatment
                      const zonaId = `${tooth}-${treatment}`;
                      
                      // Find real treatment ID for this tooth
                      let realTreatmentId: string | null = null;
                      Object.entries(toothStatus).forEach(([zone, statuses]) => {
                        if (zone === tooth) { // Si es el diente que buscamos
                          statuses.filter(s => s.type === 'treatment' && s.status === treatment).forEach(t => {
                            realTreatmentId = t.id;
                          });
                        }
                      });
                      
                      const progreso = findServicioProgreso(zonaId, data.servicio_id);
                      
                      return (
                        <tr key={zonaId} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <div className="font-medium">{tooth}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></div>
                              <span>{treatment}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            ${serviceCost.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {!progreso || progreso.estado === 'pendiente' ? (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                <Clock className="mr-1 h-3 w-3" />
                                <span>Pendiente</span>
                              </Badge>
                            ) : progreso.estado === 'completado' ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                <Check className="mr-1 h-3 w-3" />
                                <span>Completado</span>
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                                <XCircle className="mr-1 h-3 w-3" />
                                <span>Cancelado</span>
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center text-xs text-slate-600">
                            {progreso?.fecha_realizacion ? formatDate(progreso.fecha_realizacion) : '-'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex justify-end gap-1">
                              {!progreso || progreso.estado === 'pendiente' ? (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-green-600"
                                    onClick={() => {
                                      setServicioActual({
                                        zona: zonaId,
                                        nombreServicio: treatment,
                                        zonaId: realTreatmentId || zonaId, // Usar el ID real si lo tenemos
                                        servicioId: data.servicio_id,
                                        esGeneral: false,
                                        costo: serviceCost
                                      });
                                      setMonto(serviceCost.toString());
                                      setFecha(new Date());
                                      setNotas('');
                                      setOpenDialogType('completar');
                                    }}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-red-600"
                                    onClick={() => {
                                      setServicioActual({
                                        zona: zonaId,
                                        nombreServicio: treatment,
                                        zonaId: realTreatmentId || zonaId, // Usar el ID real si lo tenemos
                                        servicioId: data.servicio_id,
                                        esGeneral: false,
                                        costo: serviceCost
                                      });
                                      setNotas('');
                                      setOpenDialogType('cancelar');
                                    }}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : progreso.estado === 'completado' ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-blue-600"
                                  onClick={() => {
                                    setServicioActual({
                                      zona: zonaId,
                                      nombreServicio: treatment,
                                      zonaId: realTreatmentId || zonaId, // Usar el ID real si lo tenemos
                                      servicioId: data.servicio_id,
                                      esGeneral: false,
                                      costo: serviceCost
                                    });
                                    setMonto(progreso.monto_pagado.toString());
                                    setFecha(new Date(progreso.fecha_pago || Date.now()));
                                    setOpenDialogType('pago');
                                  }}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-green-600"
                                  onClick={() => {
                                    setServicioActual({
                                      zona: zonaId,
                                      nombreServicio: treatment,
                                      zonaId: realTreatmentId || zonaId, // Usar el ID real si lo tenemos
                                      servicioId: data.servicio_id,
                                      esGeneral: false,
                                      costo: serviceCost
                                    });
                                    setMonto(serviceCost.toString());
                                    setFecha(new Date());
                                    setNotas('');
                                    setOpenDialogType('completar');
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Total Cost */}
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-md bg-slate-50">
                <div className="text-sm text-slate-600 mb-1">Costo Total</div>
                <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
              </div>
              
              <div className="p-4 border rounded-md bg-green-50">
                <div className="text-sm text-slate-600 mb-1">Cobrado</div>
                <div className="text-2xl font-bold text-green-700">
                  ${serviciosProgreso
                    .filter(p => p.estado === 'completado')
                    .reduce((sum, p) => sum + (parseFloat(p.monto_pagado.toString()) || 0), 0)
                    .toLocaleString()}
                </div>
              </div>
              
              <div className="p-4 border rounded-md bg-blue-50">
                <div className="text-sm text-slate-600 mb-1">Pendiente</div>
                <div className="text-2xl font-bold text-blue-700">
                  ${(totalCost - 
                    serviciosProgreso
                      .filter(p => p.estado === 'completado')
                      .reduce((sum, p) => sum + (parseFloat(p.monto_pagado.toString()) || 0), 0))
                    .toLocaleString()}
                </div>
              </div>
              
              <div className="col-span-3 mt-2 text-sm text-slate-500">
                <div className="flex items-center gap-1 text-xs">
                  <Check className="h-3 w-3 text-green-600" />
                  <span>
                    Servicios completados: {serviciosProgreso.filter(p => p.estado === 'completado').length} de {
                      Object.entries(specificToothTreatments).reduce((count, [_, data]) => count + data.teeth.length, 0) +
                      Object.keys(generalAreaTreatments).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialogo para completar servicio */}
      <Dialog open={openDialogType === 'completar'} onOpenChange={(open) => !open && setOpenDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar Servicio</DialogTitle>
            <DialogDescription>
              Registre los detalles del servicio completado.
            </DialogDescription>
          </DialogHeader>
          
          {servicioActual && (
            <div>
              <div className="py-4">
                <div className="font-medium mb-1">{servicioActual.nombreServicio}</div>
                <div className="text-sm text-slate-600 mb-4">
                  Costo: ${formatCurrency(servicioActual.costo)}
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fecha">Fecha de realización</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fecha && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={fecha}
                          onSelect={(date) => date && setFecha(date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="monto">Monto pagado</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="monto"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        className="pl-7"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="notas">Notas adicionales</Label>
                    <Textarea
                      id="notas"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Detalles o comentarios sobre el servicio"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialogType(null)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCompletarServicio}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Guardando...' : 'Confirmar'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialogo para cancelar servicio */}
      <Dialog open={openDialogType === 'cancelar'} onOpenChange={(open) => !open && setOpenDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Servicio</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea cancelar este servicio?
            </DialogDescription>
          </DialogHeader>
          
          {servicioActual && (
            <div>
              <div className="py-4">
                <div className="font-medium mb-1">{servicioActual.nombreServicio}</div>
                <div className="text-sm text-slate-600 mb-4">
                  Esta acción puede ser revertida después.
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notasCancelacion">Motivo de cancelación</Label>
                  <Textarea
                    id="notasCancelacion"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Indique el motivo de la cancelación"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialogType(null)}>
                  Volver atrás
                </Button>
                <Button 
                  onClick={handleCancelarServicio}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Procesando...' : 'Sí, cancelar servicio'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialogo para registrar/actualizar pago */}
      <Dialog open={openDialogType === 'pago'} onOpenChange={(open) => !open && setOpenDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Actualice el monto y la fecha del pago.
            </DialogDescription>
          </DialogHeader>
          
          {servicioActual && (
            <div>
              <div className="py-4">
                <div className="font-medium mb-1">{servicioActual.nombreServicio}</div>
                <div className="text-sm text-slate-600 mb-4">
                  Costo del servicio: ${formatCurrency(servicioActual.costo)}
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fechaPago">Fecha de pago</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fecha && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={fecha}
                          onSelect={(date) => date && setFecha(date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="montoPago">Monto pagado</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="montoPago"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        className="pl-7"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialogType(null)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleRegistrarPago}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Pago'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 