"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ToothStatus } from "./DentalChart"
import { Servicio } from "./ToothStatus"
import { v4 as uuidv4 } from 'uuid'
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { saveCompletePlanTratamiento } from "@/lib/planesTratamientoService"
import { Check, X, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useConsultorio } from "@/contexts/ConsultorioContext"

// Import the refactored components
import {
  DentalChartSection,
  ToothStatusPanel,
  TreatmentSummary,
  isGeneralAreaKey,
  PlanVersion,
  ToothAreaData
} from "./odontograma"

interface OdontogramAreaProps {
  chartType?: "adult" | "child"
  patientName: string
  patientType: "Adulto" | "Pediátrico" | "Adolescente"
  servicios: Servicio[]
  pacienteId: string  // Nuevo prop para identificar al paciente
  onPlanSaved?: () => void  // Callback para notificar cuando se guarda un plan
  existingPlan?: {  // Nuevo prop para edición de planes existentes
    planId: string
    planData: any
    toothStatus: Record<string, ToothStatus[]>
    toothComments?: Record<string, string>
    versions: any[]
  }
  isEditing?: boolean  // Flag to indicate if we're editing an existing plan
}

// Componente principal OdontogramArea
export default function OdontogramArea({ 
  chartType = "adult", 
  patientName, 
  patientType,
  servicios = [],
  pacienteId,
  onPlanSaved,
  existingPlan,
  isEditing = false
}: OdontogramAreaProps) {
  // Añadimos toast para notificaciones
  const { toast } = useToast();
  
  // Obtener el consultorio actual del usuario
  const { consultorio } = useConsultorio();
  
  // Estados para el feedback del guardado
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  
  // Estado para guardar el ID del plan una vez guardado
  const [savedPlanId, setSavedPlanId] = useState<string | undefined>(existingPlan?.planId);
  
  // Estado para seguir si el plan ha sido modificado desde la última vez que se guardó
  const [isPlanModified, setIsPlanModified] = useState(false);
  
  // Estado para controlar manualmente el tipo de odontograma
  const [manualChartType, setManualChartType] = useState<"adult" | "child" | null>(null);
  
  // Determine chart type based on patient type or manual selection
  const effectiveChartType = useMemo(() => {
    // Si hay una selección manual, usar esa
    if (manualChartType !== null) {
      return manualChartType;
    }
    // Si no, usar el tipo basado en la edad del paciente
    return patientType === "Pediátrico" ? "child" : "adult";
  }, [patientType, manualChartType]);
  
  // Estado para el diente seleccionado, puede ser un número o un área general
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  
  // Estados iniciales basados en si estamos editando o creando un nuevo plan
  const [toothStatus, setToothStatus] = useState<Record<string, ToothStatus[]>>(
    existingPlan ? existingPlan.toothStatus : {}
  );
  
  // Estado para comentarios de dientes
  const [toothComments, setToothComments] = useState<Record<string, string>>(() => {
    if (existingPlan && existingPlan.toothComments) {
      return existingPlan.toothComments;
    }
    return {};
  });

  // Log para depuración
  useEffect(() => {
    console.log("OdontogramArea - existingPlan:", existingPlan);
    console.log("OdontogramArea - toothComments inicializados:", toothComments);
  }, [existingPlan, toothComments]);

  // Estado para la especialidad seleccionada
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Todas");

  // Add state for editable costs
  const [customCosts, setCustomCosts] = useState<Record<string, number>>({});

  // Initialize versions with existing versions if provided
  const initialVersions = useMemo(() => {
    if (existingPlan && existingPlan.versions && existingPlan.versions.length > 0) {
      return existingPlan.versions.map((version: any) => ({
        id: version.id,
        nombre: version.nombre,
        toothStatus: version.toothStatus || {},
        totalCost: version.costo_total || 0,
        isActive: version.activa || false,
        editableCosts: version.editableCosts || {}
      }));
    }
    
    return [{
      id: uuidv4(),
      nombre: "Versión 1",
      toothStatus: existingPlan ? existingPlan.toothStatus : {},
      totalCost: existingPlan ? existingPlan.planData.costo_total : 0,
      isActive: true
    }];
  }, [existingPlan]);
  
  // Estado para manejar versiones de planes
  const [planVersions, setPlanVersions] = useState<PlanVersion[]>(initialVersions);
  
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

  // Manejar la selección de un diente
  const handleSelectTooth = useCallback((tooth: string) => {
    setSelectedTooth(tooth);
  }, []);

  // Get service cost considering editable costs
  const getServiceCost = useCallback((servicioId: string | null | undefined, treatmentName: string, tooth?: string | null) => {
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
  }, [servicios, customCosts]);

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
  }, [getServiceCost]);

  // Simple function to handle cost edits
  const handleEditCost = useCallback((treatment: string, servicioId: string | undefined) => {
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
    
    // Marcar el plan como modificado
    setIsPlanModified(true);
    
    // Directly update active version
    const newVersions = planVersions.map(version => {
      if (version.isActive) {
        return {
          ...version,
          editableCosts: updatedCosts,
          totalCost: calculateTotalCost(toothStatus)
        };
      }
      return version;
    });
    
    setPlanVersions(newVersions);
  }, [selectedTooth, customCosts, servicios, planVersions, calculateTotalCost, toothStatus]);

  // Servicios filtrados según la especialidad seleccionada
  const filteredServicios = useMemo(() => {
    if (selectedSpecialty === "Todas") {
      return servicios;
    }
    
    // Filtrar servicios que coincidan con la especialidad seleccionada
    return servicios.filter(servicio => servicio.especialidad === selectedSpecialty);
  }, [servicios, selectedSpecialty]);

  // Función para eliminar un tratamiento específico
  const handleRemoveTreatment = useCallback((tooth: string, treatmentId: string) => {
    // Crear copia del estado actual
    const newToothStatus = { ...toothStatus };
    
    // Si existe el diente
    if (newToothStatus[tooth]) {
      // Filtrar para eliminar solo el tratamiento específico
      newToothStatus[tooth] = newToothStatus[tooth].filter(
        status => status.id !== treatmentId
      );
      
      // Si no quedan estatuses, eliminar el diente completamente
      if (newToothStatus[tooth].length === 0) {
        delete newToothStatus[tooth];
      }
      
      // Actualizar el estado
      setToothStatus(newToothStatus);
      
      // Marcar el plan como modificado
      setIsPlanModified(true);
      
      // Actualizar la versión activa
      const newVersions = planVersions.map(version => {
        if (version.isActive) {
          return {
            ...version,
            toothStatus: newToothStatus,
            totalCost: calculateTotalCost(newToothStatus)
          };
        }
        return version;
      });
      
      setPlanVersions(newVersions);
      
      toast({
        title: "Tratamiento eliminado",
        description: "El tratamiento se ha eliminado correctamente"
      });
    }
  }, [toothStatus, planVersions, calculateTotalCost, toast]);

  // Manejar la actualización del estado de un diente
  const handleUpdateStatus = useCallback((
    tooth: string, 
    status: string, 
    color: string, 
    type: "condition" | "treatment",
    serviceId?: string
  ) => {
    // Primero actualizamos el estado local de los dientes
    const newToothStatus = { ...toothStatus };
    
    // Obtener el estado actual del diente
    const currentToothStatus = newToothStatus[tooth] || [];
    
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
    
    // Actualizar el estado local
    newToothStatus[tooth] = updatedToothStatus;
    setToothStatus(newToothStatus);
    
    // Marcar el plan como modificado
    setIsPlanModified(true);
    
    // Directamente actualizar la versión activa
    const newVersions = planVersions.map(version => {
      if (version.isActive) {
        return {
          ...version,
          toothStatus: newToothStatus,
          totalCost: calculateTotalCost(newToothStatus)
        };
      }
      return version;
    });
    
    setPlanVersions(newVersions);
  }, [toothStatus, planVersions, calculateTotalCost]);

  // Sincronizar estados cuando cambia la versión activa
  useEffect(() => {
    setToothStatus(activeVersion.toothStatus);
    if (activeVersion.editableCosts) {
      setCustomCosts(activeVersion.editableCosts);
    }
  }, [activeVersion.id, activeVersion.toothStatus, activeVersion.editableCosts]);

  // Agrupar tratamientos por diente
  const treatmentsByTooth = useMemo(() => {
    const result: Record<string, ToothAreaData> = {};
    
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
  
  // Calcular el costo total de la versión activa
  const totalCost = useMemo(() => {
    return Object.entries(treatmentsByTooth).reduce((total, [toothId, data]) => {
      return total + data.treatments.reduce((subTotal, treatment) => {
        const cost = getServiceCost(treatment.servicio_id, treatment.status, toothId);
        return subTotal + cost;
      }, 0);
    }, 0);
  }, [treatmentsByTooth, getServiceCost]);

  // Función para crear una nueva versión
  const handleCreateVersion = useCallback(() => {
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
    
    // Marcar el plan como modificado al crear una nueva versión
    setIsPlanModified(true);

    toast({
      title: "Versión creada",
      description: `Se ha creado la ${versionName}`
    });
  }, [planVersions, toothStatus, calculateTotalCost, customCosts, toast]);

  // Load editable costs when changing versions
  const handleChangeVersion = useCallback((versionId: string) => {
    setPlanVersions(prev => {
      return prev.map(version => ({
        ...version,
        isActive: version.id === versionId
      }));
    });
    // Marcar el plan como modificado al cambiar de versión
    setIsPlanModified(true);
  }, []);

  // Función para eliminar una versión
  const handleDeleteVersion = useCallback((versionId: string) => {
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

    // Marcar el plan como modificado al eliminar una versión
    setIsPlanModified(true);

    toast({
      title: "Versión eliminada",
      description: `Se ha eliminado la ${versionToDelete.nombre}`
    });
  }, [planVersions, toast]);

  // Manejar la actualización del comentario de un diente
  const handleUpdateComment = useCallback((tooth: string, comment: string) => {
    setToothComments(prev => ({
      ...prev,
      [tooth]: comment
    }));
    // Marcar el plan como modificado
    setIsPlanModified(true);
  }, []);

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
        fecha: existingPlan ? existingPlan.planData.fecha : new Date().toISOString(),
        observaciones: existingPlan ? existingPlan.planData.observaciones : "",
        costo_total: totalCost,
        toothComments: toothComments, // Incluir los comentarios de dientes
        consultorio_id: consultorio?.id // Incluir el ID del consultorio
      };
      
      // Si no hay consultorio asignado, mostrar un error
      if (!planData.consultorio_id) {
        console.warn("No hay consultorio_id disponible para guardar el plan");
      }
      
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
        })),
        savedPlanId || (isEditing ? existingPlan?.planId : undefined) // Use savedPlanId if available
      );
      
      setSaveStatus("success");
      
      toast({
        title: isEditing ? "Plan actualizado" : "Plan guardado",
        description: isEditing 
          ? "El plan de tratamiento se ha actualizado correctamente" 
          : "El plan de tratamiento se ha guardado correctamente con todas sus versiones"
      });
      
      // Call onPlanSaved regardless of whether we're editing or creating a new plan
      if (onPlanSaved) {
        onPlanSaved();
      }
      
      // Actualizar el estado del plan guardado
      setSavedPlanId(planId);
      setIsPlanModified(false);
    } catch (error) {
      console.error(isEditing ? "Error al actualizar el plan:" : "Error al guardar el plan:", error);
      setSaveStatus("error");
      
      // Mostrar mensaje de error más específico
      let errorMessage = "Ocurrió un error. Intente nuevamente.";
      
      // Verificar diferentes tipos de errores
      if (error && typeof error === 'object') {
        const errorObj = error as any;
        if (errorObj?.message?.includes('consultorio_id')) {
          errorMessage = "Error: No se pudo asignar el consultorio al plan. Verifique que esté asignado a un consultorio.";
        } else if (errorObj?.message) {
          errorMessage = `Error: ${errorObj.message}`;
        } else if (errorObj?.details) {
          errorMessage = `Error: ${errorObj.details}`;
        }
      } else if (typeof error === 'string') {
        errorMessage = `Error: ${error}`;
      }
      
      toast({
        title: isEditing ? "Error al actualizar" : "Error al guardar",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [pacienteId, toothStatus, treatmentsByTooth, totalCost, toast, onPlanSaved, planVersions, activeVersion, customCosts, isEditing, existingPlan, toothComments, savedPlanId, consultorio]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Editar Plan Dental" : "Nuevo Plan Dental"}</h1>
          <p className="text-slate-600">
            Paciente: {patientName} ({patientType})
          </p>
        </div>
        
        {/* Botón para guardar el plan */}
        {pacienteId.trim() !== "" && Object.keys(treatmentsByTooth).length > 0 && (
          <Button 
            onClick={savePlan} 
            className={cn(
              "min-w-[130px]",
              saveStatus === "success" ? "bg-green-600 hover:bg-green-700 text-white" : 
              saveStatus === "error" ? "bg-red-600 hover:bg-red-700 text-white" : 
              "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
            )}
            disabled={isSaving || (savedPlanId !== undefined && !isPlanModified)}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? "Actualizando..." : "Guardando..."}
              </>
            ) : saveStatus === "success" ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                {isEditing ? "Actualizado" : "Guardado"}
              </>
            ) : saveStatus === "error" ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Error
              </>
            ) : (
              isEditing ? "Actualizar Plan" : "Guardar Plan"
            )}
          </Button>
        )}
      </div>
      
      {/* Selector de tipo de odontograma */}
      <div className="flex justify-start items-center space-x-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs">P</span>
          <Switch 
            id="chart-type"
            checked={effectiveChartType === "adult"}
            onCheckedChange={(checked) => setManualChartType(checked ? "adult" : "child")}
          />
          <span className="text-xs">A</span>
        </div>
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
          <DentalChartSection
            effectiveChartType={effectiveChartType}
            selectedTooth={selectedTooth}
            handleSelectTooth={handleSelectTooth}
            toothStatus={toothStatus}
          />
        </div>

        {/* Columna lateral con Estado/Tratamiento */}
        <div>
          <ToothStatusPanel
            activeVersion={activeVersion}
            selectedTooth={selectedTooth}
            handleUpdateStatus={handleUpdateStatus}
            toothStatus={toothStatus}
            patientType={patientType}
            filteredServicios={filteredServicios}
            customCosts={customCosts}
            setCustomCosts={setCustomCosts}
            planVersions={planVersions}
            handleCreateVersion={handleCreateVersion}
            handleDeleteVersion={handleDeleteVersion}
            handleChangeVersion={handleChangeVersion}
            toothComments={toothComments}
            onUpdateComment={handleUpdateComment}
          />
        </div>
      </div>

      {/* Resumen del plan */}
      <TreatmentSummary
        treatmentsByTooth={treatmentsByTooth}
        servicios={servicios}
        getServiceCost={getServiceCost}
        handleEditCost={handleEditCost}
        totalCost={totalCost}
        activeVersion={activeVersion}
        planVersions={planVersions}
        toothStatus={toothStatus}
        patientName={patientName}
        customCosts={customCosts}
        handleChangeVersion={handleChangeVersion}
        handleUpdateStatus={handleUpdateStatus}
        handleRemoveTreatment={handleRemoveTreatment}
        isPlanSaved={savedPlanId !== undefined || isEditing}
        toothComments={toothComments}
      />
    </motion.div>
  );
} 