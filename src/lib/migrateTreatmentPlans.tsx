import { getAllTreatmentPlans } from './treatmentPlansStorage';
import { saveCompletePlanTratamiento } from './planesTratamientoService';
import { toast } from '@/components/ui/use-toast';
import React from 'react';

/**
 * Migrates all treatment plans from localStorage to Supabase
 * This is a utility function to help transition from localStorage to Supabase
 */
export async function migrateLocalStoragePlansToSupabase(): Promise<{
  success: boolean;
  migrated: number;
  failed: number;
  errors: string[];
}> {
  // Get all plans from localStorage
  const localPlans = getAllTreatmentPlans();
  
  let migrated = 0;
  let failed = 0;
  const errors: string[] = [];
  
  // Migrate each plan
  for (const plan of localPlans) {
    try {
      // Convert the plan to the Supabase format
      const supabasePlanData = {
        paciente_id: plan.pacienteId,
        fecha: plan.fecha,
        observaciones: plan.observaciones,
        costo_total: plan.costoTotal
      };
      
      // Save the plan to Supabase
      await saveCompletePlanTratamiento(supabasePlanData, plan.toothStatus);
      
      migrated++;
    } catch (error) {
      console.error(`Error migrating plan ${plan.id}:`, error);
      failed++;
      errors.push(`Plan ID ${plan.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return {
    success: failed === 0,
    migrated,
    failed,
    errors
  };
}

/**
 * Migrate button component that can be used in the UI
 */
export function MigrateTreatmentPlansButton() {
  const handleMigration = async () => {
    try {
      const result = await migrateLocalStoragePlansToSupabase();
      
      if (result.migrated > 0) {
        toast({
          title: "Migración exitosa",
          description: `Se migraron ${result.migrated} planes de tratamiento a Supabase.${
            result.failed > 0 ? ` ${result.failed} planes fallaron.` : ''
          }`,
          variant: result.success ? "default" : "destructive"
        });
      } else if (result.failed === 0) {
        toast({
          title: "No hay planes para migrar",
          description: "No se encontraron planes de tratamiento en localStorage.",
        });
      } else {
        toast({
          title: "Error en la migración",
          description: `Fallaron ${result.failed} planes. Revise la consola para más detalles.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast({
        title: "Error en la migración",
        description: "Ocurrió un error durante la migración. Revise la consola para más detalles.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <button 
      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      onClick={handleMigration}
    >
      Migrar planes de tratamiento a Supabase
    </button>
  );
} 