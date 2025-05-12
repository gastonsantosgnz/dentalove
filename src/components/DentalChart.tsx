"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import Image from "next/image"

// Definición de tipos
export interface ToothStatus {
  id: string
  status: string
  color: string
  type: "condition" | "treatment"
  servicio_id?: string
}

interface DentalChartProps {
  selectedTooth: string | null
  onSelectTooth: (tooth: string) => void
  chartType: "adult" | "child"
  toothStatus?: Record<string, ToothStatus[]>
}

export default function DentalChart({ 
  selectedTooth, 
  onSelectTooth, 
  chartType = "adult", 
  toothStatus = {} 
}: DentalChartProps) {
  // Definir los dientes para adultos (32 dientes) en el orden correcto FDI
  const adultTeeth = [
    // Maxilar superior derecho (cuadrante 1)
    "18", "17", "16", "15", "14", "13", "12", "11",
    // Maxilar superior izquierdo (cuadrante 2)
    "21", "22", "23", "24", "25", "26", "27", "28",
    // Maxilar inferior izquierdo (cuadrante 3)
    "31", "32", "33", "34", "35", "36", "37", "38",
    // Maxilar inferior derecho (cuadrante 4)
    "48", "47", "46", "45", "44", "43", "42", "41"
  ]

  // Definir los dientes para niños (20 dientes) en el orden correcto FDI
  const childTeeth = [
    // Maxilar superior derecho (cuadrante 5)
    "55", "54", "53", "52", "51",
    // Maxilar superior izquierdo (cuadrante 6)
    "61", "62", "63", "64", "65",
    // Maxilar inferior izquierdo (cuadrante 7)
    "71", "72", "73", "74", "75",
    // Maxilar inferior derecho (cuadrante 8)
    "85", "84", "83", "82", "81"
  ]

  const teeth = chartType === "adult" ? adultTeeth : childTeeth
  
  // Dividir los dientes en filas (maxilar superior e inferior)
  const upperTeethCount = chartType === "adult" ? 16 : 10;
  const upperRow = teeth.slice(0, upperTeethCount);  // Maxilar superior completo (dos cuadrantes)
  const lowerRow = teeth.slice(upperTeethCount);     // Maxilar inferior completo (dos cuadrantes)
  
  // Función para obtener la URL de la imagen del diente
  const getToothImageUrl = (toothNumber: string) => {
    // Para los dientes adultos (numerados del 11 al 48), usaremos las imágenes numeradas del 1 al 32
    if (chartType === "adult") {
      // Mapeo de números FDI a índices de imagen (1-32)
      const toothIndex = adultTeeth.indexOf(toothNumber) + 1;
      if (toothIndex > 0) {
        return `https://jzlagehrckqnxufcmbjg.supabase.co/storage/v1/object/public/dental-app/${toothIndex}.png`;
      }
    } 
    // Para los dientes infantiles, usaremos directamente la numeración FDI
    else if (chartType === "child") {
      // Para dientes infantiles, usamos directamente el número FDI
      if (childTeeth.includes(toothNumber)) {
        return `https://jzlagehrckqnxufcmbjg.supabase.co/storage/v1/object/public/dental-app/${toothNumber}.png`;
      }
    }
    
    // En caso de no encontrar una imagen, retornar null
    return null;
  }
  
  // Renderizar un diente
  const renderTooth = (tooth: string) => {
    const statuses = toothStatus[tooth] || [];
    const conditions = statuses.filter((status) => status.type === "condition");
    const treatments = statuses.filter((status) => status.type === "treatment");
    
    const toothImageUrl = getToothImageUrl(tooth);
    
    // Cada diente se representa con una forma simple para el MVP
    return (
      <div
        key={tooth}
        className={cn(
          "aspect-square border rounded-md flex flex-col cursor-pointer hover:bg-blue-50 transition-colors p-2",
          selectedTooth === tooth ? "bg-blue-100 border-blue-500 border-2" : "border-gray-300",
        )}
        onClick={() => onSelectTooth(tooth)}
      >
        <div className="w-full flex justify-between items-center mb-1 h-5 px-1">
          {conditions.length > 0 ? (
            <div className="flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full border border-gray-300">
              <span className="text-xs font-bold text-gray-700">{conditions.length}</span>
            </div>
          ) : <div />}
          
          {treatments.length > 0 && (
            <div className="relative">
              <div className="flex -space-x-2">
                {treatments.map((treatment) => (
                  <div 
                    key={treatment.id} 
                    className="w-3 h-3 rounded-full border border-white" 
                    style={{ backgroundColor: treatment.color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full h-full text-gray-600 flex items-center justify-center">
          <div className="relative w-11/12 h-11/12 flex items-center justify-center">
            {toothImageUrl ? (
              <Image 
                src={toothImageUrl} 
                alt={`Diente ${tooth}`} 
                className="w-full h-full object-contain"
                width={100}
                height={100}
                priority={true}
              />
            ) : (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                  d="M50,10 C70,10 80,30 80,50 C80,70 70,90 50,90 C30,90 20,70 20,50 C20,30 30,10 50,10 Z"
                  fill="#FFFFFF"
                  stroke="#000000"
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs font-medium mt-1 text-center bg-slate-50 rounded-sm px-1">{tooth}</span>
      </div>
    );
  };

  return (
    <div className="max-w-full">
      {/* Maxilar superior */}
      <div className="mb-8">
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Maxilar Superior</span>
        </div>
        <div className={cn(
          "grid gap-1",
          chartType === "adult" ? "grid-cols-8" : "grid-cols-5"
        )}>
          {upperRow.map(renderTooth)}
        </div>
      </div>

      {/* Maxilar inferior */}
      <div>
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Maxilar Inferior</span>
        </div>
        <div className={cn(
          "grid gap-1",
          chartType === "adult" ? "grid-cols-8" : "grid-cols-5"
        )}>
          {lowerRow.map(renderTooth)}
        </div>
      </div>
    </div>
  )
} 