import { ToothStatus } from "../DentalChart";
import { Servicio } from "../ToothStatus";

// Tipo para versiones de plan
export interface PlanVersion {
  id: string;
  nombre: string;
  toothStatus: Record<string, ToothStatus[]>;
  totalCost: number;
  isActive: boolean;
  editableCosts?: Record<string, number>;
}

// Función auxiliar para verificar si una clave representa un área general
export const isGeneralAreaKey = (key: string): boolean => {
  return ["boca-completa", "arco-superior", "arco-inferior", "supernumerario"].includes(key);
}

// Interfaz para el área general y de diente
export interface ToothAreaData {
  conditions: ToothStatus[];
  treatments: ToothStatus[];
  isGeneral: boolean;
} 