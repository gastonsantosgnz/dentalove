import { Servicio } from "@/components/ToothStatus";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Helper to determine if key is a general area
export const isGeneralAreaKey = (key: string): boolean => {
  return ["boca-completa", "arco-superior", "arco-inferior", "supernumerario"].includes(key);
};

// Helper to get descriptive name for area keys
export const getAreaName = (key: string): string => {
  return {
    "boca-completa": "Boca Completa",
    "arco-superior": "Arco Superior",
    "arco-inferior": "Arco Inferior",
    "supernumerario": "Diente Supernumerario"
  }[key] || `Diente ${key}`;
};

// Helper function to calculate service cost
export const getServiceCost = (servicioId: string | undefined | null, servicios: Servicio[]): number => {
  if (!servicioId) return 0;
  const servicio = servicios.find(s => s.id === servicioId);
  return servicio ? servicio.costo : 0;
};

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// Helper to format date
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
}; 