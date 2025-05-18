"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { formatDate } from "./utils";

interface PlanHeaderProps {
  patientName: string;
  planDate: string;
  onBack: () => void;
}

export function PlanHeader({ patientName, planDate, onBack }: PlanHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onBack}
        aria-label="Volver"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-2xl font-bold">Plan de Tratamiento</h1>
        <p className="text-slate-600">
          Paciente: {patientName} • Fecha: {formatDate(planDate)}
        </p>
      </div>
    </div>
  );
} 