import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha string (YYYY-MM-DD) sin aplicar conversiones de zona horaria
 * Esto evita que las fechas se muestren un día antes debido a la conversión UTC/local
 */
export function formatDateLocal(dateString: string, formatPattern: string = "dd MMM"): string {
  if (!dateString) return "-";
  
  // Separar la fecha en componentes para evitar conversiones de zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Crear la fecha con los componentes locales
  const localDate = new Date(year, month - 1, day); // month - 1 porque los meses en JS son 0-indexados
  
  return format(localDate, formatPattern, { locale: es });
}

/**
 * Formatea una fecha completa (incluyendo hora) con formato largo
 */
export function formatDateTimeLong(dateString: string): string {
  if (!dateString) return "-";
  
  const [datePart] = dateString.split('T');
  return formatDateLocal(datePart, "dd 'de' MMMM 'de' yyyy");
}

/**
 * Formatea solo la fecha (sin hora) con formato corto
 */
export function formatDateShort(dateString: string): string {
  if (!dateString) return "-";
  
  const [datePart] = dateString.split('T');
  return formatDateLocal(datePart, "dd/MM/yyyy");
}

/**
 * Formatea la fecha con formato medio
 */
export function formatDateMedium(dateString: string): string {
  if (!dateString) return "-";
  
  const [datePart] = dateString.split('T');
  return formatDateLocal(datePart, "dd MMM yyyy");
} 