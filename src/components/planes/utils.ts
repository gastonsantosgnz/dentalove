import { format } from "date-fns";
import { es } from "date-fns/locale";

// Helper function to format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
};

// Helper function to check if key represents a general area
export const isGeneralAreaKey = (key: string): boolean => {
  return ["boca-completa", "arco-superior", "arco-inferior", "supernumerario"].includes(key);
}

// Helper function to get descriptive name for area keys
export const getAreaName = (key: string): string => {
  return {
    "boca-completa": "Boca Completa",
    "arco-superior": "Arco Superior",
    "arco-inferior": "Arco Inferior",
    "supernumerario": "Diente Supernumerario"
  }[key] || key; // Return key itself if not a special area
} 