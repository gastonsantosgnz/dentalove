"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DentalChart from "./DentalChart"
import ToothStatusComponent, { Servicio } from "./ToothStatus"
import { Button } from "@/components/ui/button"
import { ToothStatus } from "./DentalChart"
import { v4 as uuidv4 } from 'uuid'
import { motion } from "framer-motion"
import TreatmentReport from "./TreatmentReport"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { saveCompletePlanTratamiento } from "@/lib/planesTratamientoService"
import { PlusCircle, Copy, Trash2, Check, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

// Tipo para versiones de plan
interface PlanVersion {
  id: string;
  nombre: string;
  toothStatus: Record<string, ToothStatus[]>;
  totalCost: number;
  isActive: boolean;
  editableCosts?: Record<string, number>;
}

interface OdontogramAreaProps {
  chartType?: "adult" | "child"
  patientName: string
  patientType: "Adulto" | "Pediátrico" | "Adolescente"
  servicios: Servicio[]
  pacienteId?: string  // Nuevo prop para identificar al paciente
  onPlanSaved?: () => void  // Callback para notificar cuando se guarda un plan
}

export default function OdontogramArea({ 
  chartType = "adult", 
  patientName, 
  patientType,
  servicios = [],
  pacienteId = "",
  onPlanSaved
}: OdontogramAreaProps) {
  // Añadimos toast para notificaciones
  const { toast } = useToast();
  
  // Estados para el feedback del guardado
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  
  // Determine chart type based on patient type
  const effectiveChartType = useMemo(() => {
    return patientType === "Pediátrico" ? "child" : "adult";
  }, [patientType]);
  
  // Estado para el diente seleccionado, puede ser un número o un área general
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  
  // Estado para almacenar los estados de los dientes
  const [toothStatus, setToothStatus] = useState<Record<string, ToothStatus[]>>({});
  
  // Estado para la especialidad seleccionada
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Todas");

  // Nuevo estado para manejar versiones de planes
  const [planVersions, setPlanVersions] = useState<PlanVersion[]>([
    {
      id: uuidv4(),
      nombre: "Versión 1",
      toothStatus: {},
      totalCost: 0,
      isActive: true
    }
  ]);
  
  // Generar lista dinámica de especialidades desde los servicios disponibles
  const specialties = useMemo(() => {
    // Primero extraemos todas las especialidades disponibles en los servicios
    const uniqueSpecialties = Array.from(
      new Set(servicios.map(servicio => servicio.especialidad))
    ).sort();
    
    // Siempre añadimos "Todas" al principio
    return ["Todas", ...uniqueSpecialties];
  }, [servicios]);
  
  // Versión activa actual
  const activeVersion = useMemo(() => {
    return planVersions.find(version => version.isActive) || planVersions[0];
  }, [planVersions]);

  // Sincronizar el toothStatus con la versión activa
  useEffect(() => {
    if (activeVersion) {
      setToothStatus(activeVersion.toothStatus);
    }
  }, [activeVersion]);

  // Actualizar la versión activa cuando cambia toothStatus
  useEffect(() => {
    setPlanVersions(prevVersions => {
      return prevVersions.map(version => {
        if (version.isActive) {
          // Actualizar costo total para la versión activa
          const newTotalCost = calculateTotalCost(toothStatus);
          return { ...version, toothStatus: { ...toothStatus }, totalCost: newTotalCost };
        }
        return version;
      });
    });
  }, [toothStatus]);
  
  // Servicios filtrados según la especialidad seleccionada
  const filteredServicios = useMemo(() => {
    if (selectedSpecialty === "Todas") {
      return servicios;
    }
    
    // Filtrar servicios que coincidan con la especialidad seleccionada
    return servicios.filter(servicio => servicio.especialidad === selectedSpecialty);
  }, [servicios, selectedSpecialty]);

  // Manejar la selección de un diente
  const handleSelectTooth = useCallback((tooth: string) => {
    setSelectedTooth(tooth);
  }, []);

  // Manejar la actualización del estado de un diente
  const handleUpdateStatus = useCallback((
    tooth: string, 
    status: string, 
    color: string, 
    type: "condition" | "treatment",
    serviceId?: string
  ) => {
    setToothStatus(prevStatus => {
      // Obtener el estado actual del diente
      const currentToothStatus = prevStatus[tooth] || [];
      
      // Buscar si ya existe el estado que queremos actualizar
      const statusIndex = currentToothStatus.findIndex(
        s => s.status === status && s.type === type && 
        // Para tratamientos, también comparar el ID del servicio
        (type === "condition" || s.servicio_id === serviceId)
      );
      
      let updatedToothStatus;
      
      if (statusIndex >= 0) {
        // Si el estado ya existe, lo eliminamos (toggle)
        updatedToothStatus = [
          ...currentToothStatus.slice(0, statusIndex),
          ...currentToothStatus.slice(statusIndex + 1)
        ];
      } else {
        // Si el estado no existe, lo añadimos
        updatedToothStatus = [
          ...currentToothStatus,
          {
            id: uuidv4(), // Generar un ID único
            status,
            color,
            type,
            servicio_id: type === "treatment" ? serviceId : undefined
          }
        ];
      }
      
      // Devolver el nuevo estado
      return {
        ...prevStatus,
        [tooth]: updatedToothStatus
      };
    });
  }, []);

  // Handlers para los botones de áreas generales
  const selectBocaCompleta = useCallback(() => handleSelectTooth("boca-completa"), [handleSelectTooth]);
  const selectArcoSuperior = useCallback(() => handleSelectTooth("arco-superior"), [handleSelectTooth]);
  const selectArcoInferior = useCallback(() => handleSelectTooth("arco-inferior"), [handleSelectTooth]);
  
  // Función auxiliar para verificar si una clave representa un área general
  const isGeneralAreaKey = (key: string): boolean => {
    return ["boca-completa", "arco-superior", "arco-inferior"].includes(key);
  }
  
  // Agrupar tratamientos por diente
  const treatmentsByTooth = useMemo(() => {
    const result: Record<string, { 
      conditions: ToothStatus[], 
      treatments: ToothStatus[],
      isGeneral: boolean
    }> = {};
    
    // Procesar cada diente o área
    Object.entries(toothStatus).forEach(([tooth, statuses]) => {
      if (statuses && statuses.length > 0) {
        const isGeneral = isGeneralAreaKey(tooth);
        result[tooth] = {
          conditions: statuses.filter(s => s.type === "condition"),
          treatments: statuses.filter(s => s.type === "treatment"),
          isGeneral
        };
      }
    });
    
    return result;
  }, [toothStatus]);
  
  // Add state for editable costs
  const [customCosts, setCustomCosts] = useState<Record<string, number>>({});

  // Simple function to handle cost edits
  const handleEditCost = (treatment: string, servicioId: string | undefined) => {
    if (!selectedTooth || !servicioId) return;
    
    // Get current cost
    const key = `${selectedTooth}_${servicioId}`;
    let currentCost = 0;
    
    if (customCosts[key] !== undefined) {
      currentCost = customCosts[key];
    } else {
      const servicio = servicios.find(s => s.id === servicioId);
      if (servicio) {
        currentCost = servicio.costo;
      }
    }
    
    // Prompt for new cost
    const newCostStr = window.prompt(`Editar costo para "${treatment}":`, currentCost.toString());
    if (newCostStr === null || newCostStr.trim() === '') {
      return;
    }
    
    // Parse new cost
    const newCost = parseFloat(newCostStr);
    if (isNaN(newCost)) {
      window.alert('Por favor ingrese un valor numérico válido');
      return;
    }
    
    // Update costs
    const updatedCosts = { ...customCosts, [key]: newCost };
    setCustomCosts(updatedCosts);
    
    // Update active version
    setPlanVersions(prev => prev.map(version => {
      if (version.isActive) {
        return {
          ...version,
          editableCosts: updatedCosts,
          // Recalculate total cost
          totalCost: calculateTotalCost(toothStatus)
        };
      }
      return version;
    }));
  };

  // Get service cost considering editable costs
  const getServiceCost = (servicioId: string | null | undefined, treatmentName: string, tooth?: string | null) => {
    if (tooth) {
      const key = `${tooth}_${servicioId}`;
      if (customCosts[key] !== undefined) {
        return customCosts[key];
      }
    }
    if (servicioId && servicios.length > 0) {
      const servicio = servicios.find(s => s.id === servicioId);
      if (servicio) {
        return servicio.costo;
      }
    }
    return 0;
  };

  // Modify calculateTotalCost to use editable costs
  const calculateTotalCost = useCallback((status: Record<string, ToothStatus[]>) => {
    const treatmentsByToothLocal: Record<string, { 
      conditions: ToothStatus[], 
      treatments: ToothStatus[],
      isGeneral: boolean
    }> = {};
    
    Object.entries(status).forEach(([tooth, statuses]) => {
      if (statuses && statuses.length > 0) {
        const isGeneral = isGeneralAreaKey(tooth);
        treatmentsByToothLocal[tooth] = {
          conditions: statuses.filter(s => s.type === "condition"),
          treatments: statuses.filter(s => s.type === "treatment"),
          isGeneral
        };
      }
    });

    return Object.entries(treatmentsByToothLocal).reduce((total, [toothId, data]) => {
      return total + data.treatments.reduce((subTotal, treatment) => {
        const cost = getServiceCost(treatment.servicio_id, treatment.status, toothId);
        return subTotal + cost;
      }, 0);
    }, 0);
  }, [servicios, customCosts]);

  // Calcular el costo total de la versión activa
  const totalCost = useMemo(() => {
    return Object.entries(treatmentsByTooth).reduce((total, [toothId, data]) => {
      return total + data.treatments.reduce((subTotal, treatment) => {
        const cost = getServiceCost(treatment.servicio_id, treatment.status, toothId);
        return subTotal + cost;
      }, 0);
    }, 0);
  }, [treatmentsByTooth, customCosts, getServiceCost]);

  // Función para crear una nueva versión
  const handleCreateVersion = () => {
    const versionNumber = planVersions.length + 1;
    const versionName = `Versión ${versionNumber}`;
    
    const newVersion: PlanVersion = {
      id: uuidv4(),
      nombre: versionName,
      toothStatus: { ...toothStatus },
      totalCost: calculateTotalCost(toothStatus),
      isActive: false,
      editableCosts: { ...customCosts }
    };

    setPlanVersions(prev => [...prev, newVersion]);

    toast({
      title: "Versión creada",
      description: `Se ha creado la ${versionName}`
    });
  };

  // Función para crear copia de la versión actual
  const handleDuplicateVersion = () => {
    const versionNumber = planVersions.length + 1;
    const versionName = `Versión ${versionNumber}`;

    const newVersion: PlanVersion = {
      id: uuidv4(),
      nombre: versionName,
      toothStatus: { ...toothStatus },
      totalCost: calculateTotalCost(toothStatus),
      isActive: false,
      editableCosts: { ...customCosts }
    };

    setPlanVersions(prev => [...prev, newVersion]);

    toast({
      title: "Versión duplicada",
      description: `Se ha creado una copia como "${versionName}"`
    });
  };

  // Load editable costs when changing versions
  const handleChangeVersion = (versionId: string) => {
    setPlanVersions(prev => {
      const newVersions = prev.map(version => ({
        ...version,
        isActive: version.id === versionId
      }));
      
      // Load editable costs from the selected version
      const selectedVersion = newVersions.find(v => v.id === versionId);
      if (selectedVersion?.editableCosts) {
        setCustomCosts(selectedVersion.editableCosts);
      } else {
        setCustomCosts({});
      }
      
      return newVersions;
    });
  };

  // Función para eliminar una versión
  const handleDeleteVersion = (versionId: string) => {
    // No permitir eliminar si es la única versión
    if (planVersions.length <= 1) {
      toast({
        title: "No se puede eliminar",
        description: "Debe existir al menos una versión del plan",
        variant: "destructive"
      });
      return;
    }

    const versionToDelete = planVersions.find(v => v.id === versionId);
    if (!versionToDelete) return;

    setPlanVersions(prev => {
      const filtered = prev.filter(v => v.id !== versionId);
      
      // Si eliminamos la versión activa, activar la primera disponible
      if (versionToDelete.isActive && filtered.length > 0) {
        filtered[0].isActive = true;
      }
      
      return filtered;
    });

    toast({
      title: "Versión eliminada",
      description: `Se ha eliminado la ${versionToDelete.nombre}`
    });
  };

  // Función para guardar el plan actual en Supabase
  const savePlan = useCallback(async () => {
    if (!pacienteId) {
      toast({
        title: "Error al guardar",
        description: "No se pudo identificar al paciente",
        variant: "destructive"
      });
      return;
    }
    
    if (Object.keys(treatmentsByTooth).length === 0) {
      toast({
        title: "Plan vacío",
        description: "No hay tratamientos para guardar",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveStatus("idle");
      
      const planData = {
        paciente_id: pacienteId,
        fecha: new Date().toISOString(),
        observaciones: "",
        costo_total: totalCost,
      };
      
      const { plan, planId } = await saveCompletePlanTratamiento(
        planData, 
        toothStatus,
        planVersions.map(version => ({
          id: version.id,
          nombre: version.nombre,
          toothStatus: version.toothStatus,
          totalCost: version.totalCost,
          isActive: version.isActive,
          editableCosts: version.id === activeVersion.id ? customCosts : version.editableCosts
        }))
      );
      
      setSaveStatus("success");
      
      toast({
        title: "Plan guardado",
        description: "El plan de tratamiento se ha guardado correctamente con todas sus versiones"
      });
      
      if (onPlanSaved) {
        onPlanSaved();
      }
      
      // Resetear el estado después de 3 segundos
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Error al guardar el plan:", error);
      setSaveStatus("error");
      
      toast({
        title: "Error al guardar",
        description: "Ocurrió un error al guardar el plan. Intente nuevamente.",
        variant: "destructive"
      });
      
      // Resetear el estado después de 3 segundos
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  }, [pacienteId, toothStatus, treatmentsByTooth, totalCost, toast, onPlanSaved, planVersions, activeVersion, customCosts]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Plan Dental</h1>
          <p className="text-slate-600">
            Paciente: {patientName} ({patientType})
          </p>
        </div>
        
        {/* Botón para guardar el plan */}
        {pacienteId && Object.keys(treatmentsByTooth).length > 0 && (
          <Button 
            onClick={savePlan} 
            className={cn(
              "min-w-[130px]",
              saveStatus === "success" ? "bg-green-600 hover:bg-green-700 text-white" : 
              saveStatus === "error" ? "bg-red-600 hover:bg-red-700 text-white" : 
              "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
            )}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : saveStatus === "success" ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Guardado
              </>
            ) : saveStatus === "error" ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Error
              </>
            ) : (
              "Guardar Plan"
            )}
          </Button>
        )}
      </div>
      
      {/* Especialidades dentales */}
      <div className="flex flex-wrap gap-2 mb-2">
        {specialties.map(specialty => (
          <Button 
            key={specialty}
            variant={selectedSpecialty === specialty ? "default" : "outline"}
            onClick={() => setSelectedSpecialty(specialty || "")}
            size="sm"
            className={cn(
              selectedSpecialty === specialty && "bg-slate-800 text-white hover:bg-slate-700"
            )}
          >
            {specialty || "Sin especialidad"}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Columna del odontograma */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 pb-0 sm:pb-0">
              <div>
                <CardTitle>Odontograma - {effectiveChartType === 'adult' ? 'Adulto' : 'Infantil'}</CardTitle>
              </div>
              
              {/* Área general */}
              <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                <Button 
                  variant={selectedTooth === "boca-completa" ? "default" : "outline"}
                  size="sm"
                  onClick={selectBocaCompleta}
                  className={cn(
                    selectedTooth === "boca-completa" && "bg-slate-800 text-white hover:bg-slate-700"
                  )}
                >
                  Boca
                </Button>
                <Button 
                  variant={selectedTooth === "arco-superior" ? "default" : "outline"}
                  size="sm"
                  onClick={selectArcoSuperior}
                  className={cn(
                    selectedTooth === "arco-superior" && "bg-slate-800 text-white hover:bg-slate-700"
                  )}
                >
                  Superior
                </Button>
                <Button 
                  variant={selectedTooth === "arco-inferior" ? "default" : "outline"}
                  size="sm"
                  onClick={selectArcoInferior}
                  className={cn(
                    selectedTooth === "arco-inferior" && "bg-slate-800 text-white hover:bg-slate-700"
                  )}
                >
                  Inferior
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <DentalChart
                selectedTooth={selectedTooth}
                onSelectTooth={handleSelectTooth}
                chartType={effectiveChartType}
                toothStatus={toothStatus}
              />
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral con Estado/Tratamiento */}
        <div>
          <Card className="flex flex-col h-full">
            <CardHeader className="p-4 pb-2 flex-none">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Estado y Tratamiento</CardTitle>
                  <CardDescription className="text-slate-600">Registre el estado del diente</CardDescription>
                </div>
                
                {/* Mostrar versión actual */}
                <div className="text-sm font-medium text-slate-800">
                  {activeVersion.nombre}
                </div>
              </div>
            </CardHeader>
            
            {/* Añadir controles de versión dentro del panel de Estado y Tratamiento */}
            <div className="px-4 py-2 border-b flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="h-7"
                onClick={handleCreateVersion}
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Nueva versión</span>
              </Button>
              
              {planVersions.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteVersion(activeVersion.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Eliminar</span>
                </Button>
              )}
            </div>
            
            {/* Selector de versiones si hay más de una */}
            {planVersions.length > 1 && (
              <div className="px-4 py-2 border-b flex flex-wrap gap-2">
                <div className="flex w-full flex-wrap gap-1">
                  {planVersions.map((version) => (
                    <Button 
                      key={version.id}
                      variant={version.isActive ? "default" : "outline"}
                      size="sm"
                      className={cn("h-7 flex-1 min-w-0",
                        version.isActive && "bg-slate-800 text-white hover:bg-slate-700"
                      )}
                      onClick={() => handleChangeVersion(version.id)}
                    >
                      <span className="text-xs truncate">{version.nombre}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <CardContent className="flex-grow p-4 pt-3 overflow-hidden max-h-[590px]"> 
              <div className="h-full overflow-y-auto pr-1">
                <ToothStatusComponent
                  selectedTooth={selectedTooth}
                  onUpdateStatus={handleUpdateStatus}
                  toothStatus={toothStatus}
                  patientType={patientType}
                  servicios={filteredServicios}
                  className="h-full"
                  customCosts={customCosts}
                  setCustomCosts={setCustomCosts}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumen del plan */}
      <Card className="mt-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resumen del Tratamiento</CardTitle>
            <CardDescription className="text-slate-600">
              Servicios incluidos en esta versión ({activeVersion.nombre})
            </CardDescription>
          </div>
          <div>
            <TreatmentReport 
              toothStatus={toothStatus}
              patientName={patientName}
              servicios={servicios}
              planVersions={planVersions}
              activeVersionId={activeVersion.id}
              onVersionChange={handleChangeVersion}
              customCosts={customCosts}
            />
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(treatmentsByTooth).length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(treatmentsByTooth).map(([tooth, data]) => {
                  if (data.treatments.length === 0) return null;
                  
                  const toothLabel = isGeneralAreaKey(tooth) 
                    ? {
                        "boca-completa": "Boca Completa",
                        "arco-superior": "Arco Superior",
                        "arco-inferior": "Arco Inferior"
                      }[tooth]
                    : `Diente ${tooth}`;
                  
                  return (
                    <div key={tooth} className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">{toothLabel}</h3>
                      
                      {!data.isGeneral && data.conditions.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-slate-600 mb-1">Condiciones:</h4>
                          <ul className="list-disc pl-5 text-sm">
                            {data.conditions.map(condition => (
                              <li key={condition.id}>{condition.status}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-1">Tratamientos:</h4>
                        <div className="space-y-2">
                          {data.treatments.map(treatment => {
                            const servicio = servicios.find(s => s.id === treatment.servicio_id);
                            if (!servicio) return null;
                            const cost = getServiceCost(treatment.servicio_id, treatment.status, tooth);
                            return (
                              <div key={treatment.id} className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: treatment.color }}></div>
                                <span className="flex-1 text-slate-900">{treatment.status}</span>
                                <span 
                                  className="text-right font-medium cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCost(treatment.status, treatment.servicio_id);
                                  }}
                                >
                                  ${Math.round(cost).toLocaleString('en-US')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <p className="text-lg font-bold">Costo Total:</p>
                  <p className="text-2xl font-bold">${Math.round(totalCost).toLocaleString('en-US')}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-600 py-6">
              No se han registrado tratamientos. Seleccione dientes y asigne tratamientos para crear un plan.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
} 