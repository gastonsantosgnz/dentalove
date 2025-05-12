import { ToothStatus } from "@/components/DentalChart";
import { Servicio } from "@/components/ToothStatus";

export interface TreatmentPlan {
  id: string;
  pacienteId: string;
  nombre: string;
  fecha: string;
  toothStatus: Record<string, ToothStatus[]>;
  observaciones: string;
  costoTotal: number;
}

// This module is deprecated - use planesTratamientoService.ts instead
// All localStorage operations have been removed to ensure we only use Supabase

// Obtener todos los planes de tratamiento
export const getAllTreatmentPlans = (): TreatmentPlan[] => {
  console.warn('getAllTreatmentPlans is deprecated - use planesTratamientoService.ts instead');
  return [];
};

// Obtener planes de tratamiento de un paciente específico
export const getPatientTreatmentPlans = (pacienteId: string): TreatmentPlan[] => {
  console.warn('getPatientTreatmentPlans is deprecated - use planesTratamientoService.ts instead');
  return [];
};

// Obtener un plan de tratamiento específico
export const getTreatmentPlan = (planId: string): TreatmentPlan | null => {
  console.warn('getTreatmentPlan is deprecated - use planesTratamientoService.ts instead');
  return null;
};

// Guardar un nuevo plan de tratamiento
export const saveTreatmentPlan = (plan: TreatmentPlan): void => {
  console.warn('saveTreatmentPlan is deprecated - use planesTratamientoService.ts instead');
  throw new Error('This function is deprecated - use planesTratamientoService.ts instead');
};

// Eliminar un plan de tratamiento
export const deleteTreatmentPlan = (planId: string): void => {
  console.warn('deleteTreatmentPlan is deprecated - use planesTratamientoService.ts instead');
  throw new Error('This function is deprecated - use planesTratamientoService.ts instead');
};

// Función auxiliar para generar resumen de un plan (para mostrar en la lista)
export const generatePlanSummary = (plan: TreatmentPlan): {
  totalTreatments: number;
  totalTeeth: number;
  costoTotal: number;
} => {
  console.warn('generatePlanSummary is deprecated - use planesTratamientoService.ts instead');
  return {
    totalTreatments: 0,
    totalTeeth: 0,
    costoTotal: 0
  };
}; 