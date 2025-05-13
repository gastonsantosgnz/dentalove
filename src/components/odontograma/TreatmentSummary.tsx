"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToothStatus } from "../DentalChart";
import { Servicio } from "../ToothStatus";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
  setToothStatus: React.Dispatch<React.SetStateAction<Record<string, ToothStatus[]>>>;
  setPlanVersions: React.Dispatch<React.SetStateAction<PlanVersion[]>>;
  toast: any;
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
  toast
}: TreatmentSummaryProps) {
  
  // Función para eliminar completamente un diente y sus tratamientos/condiciones
  const clearToothCompletely = (tooth: string) => {
    if (window.confirm(`¿Está seguro de eliminar todos los tratamientos y condiciones del ${isGeneralAreaKey(tooth) ? 
      {
        "boca-completa": "área Boca Completa",
        "arco-superior": "área Arco Superior",
        "arco-inferior": "área Arco Inferior"
      }[tooth] : `diente ${tooth}`}?`)) {
      
      // Eliminar completamente la entrada del diente
      const newToothStatus = { ...toothStatus };
      delete newToothStatus[tooth];
      setToothStatus(newToothStatus);
      
      // Actualizar todas las versiones del plan
      setPlanVersions(currentVersions => 
        currentVersions.map(version => {
          if (version.isActive) {
            const versionToothStatus = { ...version.toothStatus };
            delete versionToothStatus[tooth];
            
            // Calcular nuevo costo total para la versión activa
            const newTotal = Object.entries(versionToothStatus).reduce((total, [toothId, statuses]) => {
              const treatments = statuses.filter(s => s.type === "treatment");
              return total + treatments.reduce((subTotal, treatment) => {
                const cost = getServiceCost(treatment.servicio_id, treatment.status, toothId);
                return subTotal + cost;
              }, 0);
            }, 0);
            
            return {
              ...version,
              toothStatus: versionToothStatus,
              totalCost: newTotal
            };
          }
          return version;
        })
      );
      
      toast({
        title: "Diente eliminado",
        description: `Se han eliminado todos los tratamientos y condiciones asignados.`
      });
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
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{toothLabel}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-500 hover:bg-transparent"
                        title="Eliminar tratamientos"
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
  );
} 