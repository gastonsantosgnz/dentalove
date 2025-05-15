"use client"

import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import DentalChart from "../DentalChart";
import { ToothStatus } from "../DentalChart";
import { isGeneralAreaKey } from "./types";
import { CirclePlus } from "lucide-react";

interface DentalChartSectionProps {
  effectiveChartType: "adult" | "child";
  selectedTooth: string | null;
  handleSelectTooth: (tooth: string) => void;
  toothStatus: Record<string, ToothStatus[]>;
}

export function DentalChartSection({
  effectiveChartType,
  selectedTooth,
  handleSelectTooth,
  toothStatus
}: DentalChartSectionProps) {
  // Estado para el input de número de diente
  const [toothInput, setToothInput] = useState("");
  const [supernumeraryInput, setSupernumeraryInput] = useState("");
  
  // Handlers para los botones de áreas generales
  const selectBocaCompleta = useCallback(() => handleSelectTooth("boca-completa"), [handleSelectTooth]);
  const selectArcoSuperior = useCallback(() => handleSelectTooth("arco-superior"), [handleSelectTooth]);
  const selectArcoInferior = useCallback(() => handleSelectTooth("arco-inferior"), [handleSelectTooth]);
  const selectSupernumerario = useCallback(() => handleSelectTooth("supernumerario"), [handleSelectTooth]);

  // Validar si el número de diente es válido para el tipo de odontograma
  const validateToothNumber = useCallback((toothNumber: number): boolean => {
    if (effectiveChartType === 'adult') {
      // Validar odontograma adulto (dientes 11-48)
      return (toothNumber >= 11 && toothNumber <= 48) && 
             (Math.floor(toothNumber / 10) >= 1 && Math.floor(toothNumber / 10) <= 4);
    } else {
      // Validar odontograma infantil (dientes 51-85)
      return (toothNumber >= 51 && toothNumber <= 85) && 
             (Math.floor(toothNumber / 10) >= 5 && Math.floor(toothNumber / 10) <= 8);
    }
  }, [effectiveChartType]);

  // Selector de diente por número
  const selectToothByNumber = useCallback(() => {
    if (toothInput) {
      const toothNumber = parseInt(toothInput);
      
      if (validateToothNumber(toothNumber)) {
        handleSelectTooth(toothInput);
        setToothInput(""); // Limpiar el input después de seleccionar
      } else {
        // Mostrar error o feedback
        alert(`Número de diente inválido para ${effectiveChartType === 'adult' ? 'odontograma adulto' : 'odontograma infantil'}`);
      }
    }
  }, [toothInput, validateToothNumber, handleSelectTooth, effectiveChartType]);
  
  // Manejar cambios en el input de número de diente
  const handleToothInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números
    const value = e.target.value.replace(/[^0-9]/g, '');
    setToothInput(value);
  };
  
  // Manejar selección de diente por input cuando presiona Enter
  const handleToothInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      selectToothByNumber();
    }
  };

  return (
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
          <Button 
            variant={selectedTooth === "supernumerario" ? "default" : "outline"}
            size="sm"
            onClick={selectSupernumerario}
            className={cn(
              selectedTooth === "supernumerario" && "bg-slate-800 text-white hover:bg-slate-700"
            )}
          >
            Supernumerario
          </Button>
          
          {/* Input para seleccionar diente por número */}
          <div className="flex items-center gap-1">
            <Input
              type="text"
              placeholder="# Diente"
              value={toothInput}
              onChange={handleToothInputChange}
              onKeyDown={handleToothInputSubmit}
              className="h-8 px-2 text-sm w-16"
              maxLength={2}
            />
          </div>
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
  );
} 