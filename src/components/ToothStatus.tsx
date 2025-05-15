"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eraser, Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import React from "react"
import { ToothStatus } from "./DentalChart"

// Tipos
export interface Servicio {
  id: string
  nombre_servicio: string
  costo: number
  duracion: number
  descripcion?: string | null
  especialidad?: string | null
}

// Propiedades para el componente ToothStatus
interface ToothStatusProps {
  selectedTooth: string | null
  onUpdateStatus?: (tooth: string, status: string, color: string, type: "condition" | "treatment", serviceId?: string) => void
  toothStatus?: Record<string, ToothStatus[]>
  patientType?: "Adulto" | "Pediátrico" | "Adolescente"
  className?: string
  servicios: Servicio[]
  customCosts?: Record<string, number>
  setCustomCosts?: React.Dispatch<React.SetStateAction<Record<string, number>>>
}

// Lista de condiciones (diagnósticos)
const conditions = [
  { name: "Ausente", value: "ausente", color: "#6B7280" },
  { name: "Caries activa", value: "caries-activa", color: "#DC2626" },
  { name: "Caries Fase I", value: "caries-fase-i", color: "#FDE68A" },
  { name: "Caries Fase II", value: "caries-fase-ii", color: "#FBBF24" },
  { name: "Caries Fase III", value: "caries-fase-iii", color: "#F59E42" },
  { name: "Caries Fase IV", value: "caries-fase-iv", color: "#EA580C" },
  { name: "Caries Fase V", value: "caries-fase-v", color: "#B91C1C" },
  { name: "Caries incipiente", value: "caries-incipiente", color: "#F59E0B" },
  { name: "Fractura", value: "fractura", color: "#EF4444" },
  { name: "Lesión periapical", value: "lesion-periapical", color: "#8B5CF6" },
  { name: "Pieza Ausente", value: "pieza-ausente", color: "#64748B" },
  { name: "Pulpitis", value: "#7C3AED", color: "#7C3AED" },
  { name: "Resto radicular", value: "resto-radicular", color: "#A16207" },
]

// Función para formatear costos con separadores de miles
const formatCurrency = (amount: number): string => {
  return "$" + Math.round(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

export default function ToothStatusComponent({ 
  selectedTooth, 
  onUpdateStatus, 
  toothStatus = {}, 
  patientType = "Adulto", 
  className,
  servicios = [],
  customCosts = {},
  setCustomCosts
}: ToothStatusProps) {
  const [activeTab, setActiveTab] = useState("condition")
  const [busqueda, setBusqueda] = useState<string>("")
  const [filteredServicios, setFilteredServicios] = useState<Servicio[]>(servicios)
  
  // Calcular información del diente seleccionado
  const { isGeneralArea, areaName, selectedArea } = useMemo(() => {
    const isGeneral = selectedTooth !== null && ["boca-completa", "arco-superior", "arco-inferior", "supernumerario"].includes(selectedTooth || "");
    
    const tooth = selectedTooth ? {
      "boca-completa": "Boca Completa",
      "arco-superior": "Arco Superior",
      "arco-inferior": "Arco Inferior",
      "supernumerario": "Diente Supernumerario"
    }[selectedTooth] || `Diente ${selectedTooth}` : "";
    
    const area = selectedTooth ? 
      selectedTooth === "boca-completa" ? "Boca Completa" :
      selectedTooth === "arco-superior" ? "Maxilar Superior" :
      selectedTooth === "arco-inferior" ? "Maxilar Inferior" :
      selectedTooth === "supernumerario" ? "Diente Supernumerario" :
      "Diente" : null;
      
    return { 
      isGeneralArea: isGeneral, 
      areaName: tooth, 
      selectedArea: area 
    };
  }, [selectedTooth]);

  // Calcular estados actuales
  const { currentConditions, currentTreatments } = useMemo(() => {
    if (!selectedTooth) {
      return { currentConditions: [], currentTreatments: [] };
    }
    
    const currentStatuses = toothStatus[selectedTooth] || [];
    return {
      currentConditions: currentStatuses.filter((status) => status.type === "condition"),
      currentTreatments: currentStatuses.filter((status) => status.type === "treatment")
    };
  }, [selectedTooth, toothStatus]);

  // Función para verificar si un tratamiento está aplicado
  const isTreatmentApplied = useCallback((serviceId: string) => {
    return currentTreatments.some((t) => t.servicio_id === serviceId);
  }, [currentTreatments]);

  // Función para verificar si una condición está seleccionada
  const isConditionSelected = useCallback((conditionName: string) => {
    return currentConditions.some((c) => c.status === conditionName);
  }, [currentConditions]);

  // Filtrar servicios según búsqueda y área aplicable
  useEffect(() => {
    if (!servicios.length) {
      setFilteredServicios([]);
      return;
    }

    let filtered = [...servicios];

    // Filtrar por término de búsqueda
    if (busqueda) {
      const termLower = busqueda.toLowerCase();
      filtered = filtered.filter(servicio => 
        servicio.nombre_servicio.toLowerCase().includes(termLower)
      );
    }

    setFilteredServicios(filtered);
  }, [servicios, busqueda, selectedArea]);

  // Manejar actualización del campo de búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  }, []);

  // Manejar selección de condición
  const handleConditionSelect = useCallback((condition: typeof conditions[0]) => {
    if (onUpdateStatus && selectedTooth && !isGeneralArea) {
      const isAlreadySelected = isConditionSelected(condition.name);
      if (isAlreadySelected) {
        onUpdateStatus(selectedTooth, condition.name, "transparent", "condition");
      } else {
        onUpdateStatus(selectedTooth, condition.name, condition.color, "condition");
      }
    }
  }, [onUpdateStatus, selectedTooth, isGeneralArea, isConditionSelected]);

  // Función para asignar colores según la especialidad
  const getServiceColor = (servicio: Servicio): string => {
    const especialidadColors: Record<string, string> = {
      "General": "#3B82F6", // Azul
      "Periodoncia": "#10B981", // Verde
      "Endodoncia": "#8B5CF6", // Púrpura
      "Ortodoncia": "#F59E0B", // Amarillo/Naranja
      "Odontopediatría": "#EC4899", // Rosa
      "Prostodoncia": "#6366F1", // Indigo
      "Cirugía Oral": "#EF4444", // Rojo
      "Estética Dental": "#14B8A6" // Turquesa
    };

    return especialidadColors[servicio.especialidad || ""] || "#6B7280"; // Gris como color por defecto
  };

  // Manejar selección de tratamiento
  const handleTreatmentClick = useCallback((servicio: Servicio) => {
    if (onUpdateStatus && selectedTooth) {
      // Usar un color basado en la especialidad del servicio
      const color = getServiceColor(servicio);
      
      // Comprobar si el servicio ya está aplicado
      const isAlreadyApplied = isTreatmentApplied(servicio.id);

      if (isAlreadyApplied) {
        // Si ya está aplicado, lo eliminamos (toggle)
        onUpdateStatus(selectedTooth, servicio.nombre_servicio, "transparent", "treatment", servicio.id);
      } else {
        // Si no está aplicado, lo añadimos
        onUpdateStatus(selectedTooth, servicio.nombre_servicio, color, "treatment", servicio.id);
      }
    }
  }, [onUpdateStatus, selectedTooth, isTreatmentApplied]);

  // Limpiar todos los tratamientos
  const clearAllTreatments = useCallback(() => {
    if (onUpdateStatus && selectedTooth) {
      currentTreatments.forEach((treatment) => {
        if (treatment.servicio_id) {
            onUpdateStatus(selectedTooth, treatment.status, "transparent", "treatment", treatment.servicio_id);
        }
      });
    }
  }, [onUpdateStatus, selectedTooth, currentTreatments]);

  // Limpiar todas las condiciones
  const clearAllConditions = useCallback(() => {
    if (onUpdateStatus && selectedTooth && !isGeneralArea) {
      currentConditions.forEach((condition) => {
        onUpdateStatus(selectedTooth, condition.status, "transparent", "condition");
      });
    }
  }, [onUpdateStatus, selectedTooth, isGeneralArea, currentConditions]);

  // Estado para edición de costos por tratamiento y diente
  const [editingCost, setEditingCost] = useState<{ tooth: string; servicioId: string } | null>(null);
  const [costInputValue, setCostInputValue] = useState<string>("");

  // Función para obtener el costo (custom o default)
  const getTreatmentCost = (servicio: Servicio, tooth: string) => {
    const key = `${tooth}_${servicio.id}`;
    if (customCosts[key] !== undefined) return customCosts[key];
    return servicio.costo;
  };

  // Función para guardar el costo editado
  const saveCost = (tooth: string, servicioId: string) => {
    const key = `${tooth}_${servicioId}`;
    const value = parseFloat(costInputValue);
    if (!isNaN(value) && value >= 0 && setCustomCosts) {
      setCustomCosts((prev) => ({ ...prev, [key]: value }));
    }
    setEditingCost(null);
  };

  if (!selectedTooth) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Seleccione un diente o área general para registrar tratamientos
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="flex-none w-full">
        <Tabs defaultValue="condition" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="condition" disabled={isGeneralArea} className="w-full">
              Estado
            </TabsTrigger>
            <TabsTrigger value="treatment" className="w-full">
              Tratamiento
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Contenido de Estado */}
      <div className={cn("flex-grow overflow-auto mt-3", activeTab !== "condition" && "hidden")}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Estado {areaName}</h3>
          {currentConditions.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllConditions} className="h-7">
              <Eraser className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Limpiar</span>
            </Button>
          )}
        </div>

        {isGeneralArea ? (
          <p className="text-sm text-muted-foreground">
            No se pueden registrar condiciones en áreas generales, solo dientes específicos.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {conditions.map((condition) => (
              <Button
                key={condition.value}
                onClick={() => handleConditionSelect(condition)}
                variant={isConditionSelected(condition.name) ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-auto py-2 justify-start text-xs",
                  isConditionSelected(condition.name) && "bg-slate-800 text-white hover:bg-slate-700"
                )}
              >
                {isConditionSelected(condition.name) && (
                  <Check className="w-3 h-3 mr-1 flex-shrink-0" />
                )}
                {condition.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Contenido de Tratamiento */}
      <div className={cn("flex-grow flex flex-col mt-3", activeTab !== "treatment" && "hidden")}>
        <div className="flex-none">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Tratamientos {areaName}</h3>
            {currentTreatments.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllTreatments} className="h-7">
                <Eraser className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Limpiar</span>
              </Button>
            )}
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar tratamiento..." 
              className="pl-8"
              value={busqueda}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100%-80px)] pr-1">
          {filteredServicios.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No se encontraron servicios o no hay servicios disponibles.
            </p>
          ) : (
            <div className="space-y-1.5">
              {filteredServicios.map((servicio) => {
                const isApplied = isTreatmentApplied(servicio.id);
                const serviceColor = getServiceColor(servicio);
                const isEditing = editingCost && editingCost.tooth === selectedTooth && editingCost.servicioId === servicio.id;
                return (
                  <Button
                    key={servicio.id}
                    onClick={() => handleTreatmentClick(servicio)}
                    variant={isApplied ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "w-full justify-between text-start h-auto py-2 pl-2 pr-3",
                      isApplied && "bg-slate-800 text-white hover:bg-slate-700"
                    )}
                    type="button"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                        style={{ backgroundColor: serviceColor }}
                      />
                      <span className="text-xs truncate">{servicio.nombre_servicio}</span>
                    </div>
                    {isApplied ? (
                      isEditing ? (
                        <input
                          type="number"
                          className="text-xs font-medium ml-2 w-16 px-1 rounded border border-slate-300 text-slate-900"
                          value={costInputValue}
                          autoFocus
                          min={0}
                          onChange={e => setCostInputValue(e.target.value)}
                          onBlur={() => saveCost(selectedTooth!, servicio.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              saveCost(selectedTooth!, servicio.id);
                            } else if (e.key === 'Escape') {
                              setEditingCost(null);
                            }
                          }}
                        />
                      ) : (
                        <span
                          className="text-xs font-medium ml-2 whitespace-nowrap flex-shrink-0 cursor-pointer hover:underline"
                          title="Editar costo"
                          onClick={e => {
                            e.stopPropagation();
                            setEditingCost({ tooth: selectedTooth!, servicioId: servicio.id });
                            setCostInputValue(getTreatmentCost(servicio, selectedTooth!).toString());
                          }}
                        >
                          {formatCurrency(getTreatmentCost(servicio, selectedTooth!))}
                        </span>
                      )
                    ) : (
                      <span className="text-xs font-medium ml-2 whitespace-nowrap flex-shrink-0">
                        {formatCurrency(servicio.costo)}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
} 