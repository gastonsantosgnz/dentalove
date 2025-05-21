"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ToothStatusComponent, { Servicio } from "../ToothStatus";
import { ToothStatus } from "../DentalChart";
import { PlanVersionManager } from "./PlanVersionManager";
import { PlanVersion } from "./types";

interface ToothStatusPanelProps {
  activeVersion: PlanVersion;
  selectedTooth: string | null;
  handleUpdateStatus: (tooth: string, status: string, color: string, type: "condition" | "treatment", serviceId?: string) => void;
  toothStatus: Record<string, ToothStatus[]>;
  patientType: "Adulto" | "Pediátrico" | "Adolescente";
  filteredServicios: Servicio[];
  customCosts: Record<string, number>;
  setCustomCosts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  planVersions: PlanVersion[];
  handleCreateVersion: () => void;
  handleDeleteVersion: (versionId: string) => void;
  handleChangeVersion: (versionId: string) => void;
  toothComments?: Record<string, string>;
  onUpdateComment?: (tooth: string, comment: string) => void;
}

export function ToothStatusPanel({
  activeVersion,
  selectedTooth,
  handleUpdateStatus,
  toothStatus,
  patientType,
  filteredServicios,
  customCosts,
  setCustomCosts,
  planVersions,
  handleCreateVersion,
  handleDeleteVersion,
  handleChangeVersion,
  toothComments = {},
  onUpdateComment
}: ToothStatusPanelProps) {
  return (
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
      
      {/* Controles de versión */}
      <PlanVersionManager
        planVersions={planVersions}
        activeVersion={activeVersion}
        toothStatus={toothStatus}
        customCosts={customCosts}
        setCustomCosts={setCustomCosts}
        handleCreateVersion={handleCreateVersion}
        handleDeleteVersion={handleDeleteVersion}
        handleChangeVersion={handleChangeVersion}
      />
      
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
            toothComments={toothComments}
            onUpdateComment={onUpdateComment}
          />
        </div>
      </CardContent>
    </Card>
  );
} 