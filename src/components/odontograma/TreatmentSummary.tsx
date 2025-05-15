"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToothStatus } from "../DentalChart";
import { Servicio } from "../ToothStatus";
import { Button } from "@/components/ui/button";
import { Trash2, XCircle } from "lucide-react";
import TreatmentReport from "../TreatmentReport";
import { PlanVersion, ToothAreaData, isGeneralAreaKey } from "./types";

interface TreatmentSummaryProps {
  treatmentsByTooth: Record<string, ToothAreaData>;
  servicios: Servicio[];
  getServiceCost: (servicioId: string | null | undefined, treatmentName: string, tooth?: string | null) => number;
  handleEditCost: (treatment: string, servicioId: string | undefined) => void;
  totalCost: number;
  activeVersion: PlanVersion;
  planVersions: PlanVersion[];
  toothStatus: Record<string, ToothStatus[]>;
  patientName: string;
  customCosts: Record<string, number>;
  handleChangeVersion: (versionId: string) => void;
  handleUpdateStatus: (tooth: string, status: string, color: string, type: "condition" | "treatment", serviceId?: string) => void;
  setToothStatus?: React.Dispatch<React.SetStateAction<Record<string, ToothStatus[]>>>;
  setPlanVersions?: React.Dispatch<React.SetStateAction<PlanVersion[]>>;
  toast?: any;
  isPlanSaved?: boolean;
}

export function TreatmentSummary({
  treatmentsByTooth,
  servicios,
  getServiceCost,
  handleEditCost,
  totalCost,
  activeVersion,
  planVersions,
  toothStatus,
  patientName,
  customCosts,
  handleChangeVersion,
  handleUpdateStatus,
  setToothStatus,
  setPlanVersions,
  toast,
  isPlanSaved = false
}: TreatmentSummaryProps) {
  
  // Función para eliminar completamente un diente y sus tratamientos/condiciones
  const clearToothCompletely = (tooth: string) => {
    if (window.confirm(`¿Está seguro de eliminar todos los tratamientos y condiciones del ${isGeneralAreaKey(tooth) ? 
      {
        "boca-completa": "área Boca Completa",
        "arco-superior": "área Arco Superior",
        "arco-inferior": "área Arco Inferior",
        "supernumerario": "área Diente Supernumerario"
      }[tooth] : `diente ${tooth}`}?`)) {
      
      // Actualizar el estado mediante el handleUpdateStatus
      handleUpdateStatus(tooth, '', '', 'treatment');
    }
  };
  
  // Función para eliminar un tratamiento específico
  const removeTreatment = (tooth: string, treatmentId: string) => {
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
      
      // Actualizar el estado mediante el handleUpdateStatus
      handleUpdateStatus(tooth, '', '', 'treatment');
    }
  };
  
  return (
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
            isPlanSaved={isPlanSaved}
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
                      "arco-inferior": "Arco Inferior",
                      "supernumerario": "Diente Supernumerario"
                    }[tooth]
                  : `Diente ${tooth}`;
                
                return (
                  <div key={tooth} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{toothLabel}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-500 hover:bg-transparent"
                        aria-label="Eliminar tratamientos"
                        onClick={() => clearToothCompletely(tooth)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
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
                            <div key={treatment.id} className="flex items-center group">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: treatment.color }}></div>
                              <span className="flex-1 text-slate-900 text-sm">{treatment.status}</span>
                              <span className="text-right font-medium px-2 py-1 text-sm">
                                ${Math.round(cost).toLocaleString('en-US')}
                              </span>
                              <XCircle 
                                className="h-4 w-4 text-slate-300 hover:text-red-500 cursor-pointer ml-1"
                                onClick={() => removeTreatment(tooth, treatment.id)}
                                aria-label="Eliminar tratamiento"
                              />
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
  );
} 