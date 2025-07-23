 import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha string (YYYY-MM-DD) sin aplicar conversiones de zona horaria
 * Esto evita que las fechas se muestren un día antes debido a la conversión UTC/local
 */
export function formatDateLocal(dateString: string, formatPattern: string = "dd MMM"): string {
  // Validaciones más robustas
  if (!dateString || dateString === null || dateString === undefined) {
    return "-";
  }
  
  // Convertir a string si no lo es
  const dateStr = String(dateString).trim();
  
  // Verificar que no esté vacío después del trim
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined') {
    return "-";
  }
  
  try {
    // Separar la fecha en componentes para evitar conversiones de zona horaria
    const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const dateParts = datePart.split('-');
    
    // Verificar que tengamos 3 partes (año, mes, día)
    if (dateParts.length !== 3) {
      console.warn(`Formato de fecha inválido: ${dateString}`);
      return "-";
    }
    
    const [year, month, day] = dateParts.map(Number);
    
    // Validar que los números sean válidos
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      console.warn(`Fecha con valores inválidos: ${dateString}`);
      return "-";
    }
    
    // Validar rangos básicos
    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      console.warn(`Fecha fuera de rango válido: ${dateString}`);
      return "-";
    }
    
    // Crear la fecha con los componentes locales
    const localDate = new Date(year, month - 1, day); // month - 1 porque los meses en JS son 0-indexados
    
    // Verificar que la fecha creada sea válida
    if (isNaN(localDate.getTime())) {
      console.warn(`No se pudo crear fecha válida de: ${dateString}`);
      return "-";
    }
    
    return format(localDate, formatPattern, { locale: es });
  } catch (error) {
    console.error(`Error formateando fecha: ${dateString}`, error);
    return "-";
  }
}

/**
 * Formatea una fecha completa (incluyendo hora) con formato largo
 */
export function formatDateTimeLong(dateString: string): string {
  if (!dateString || dateString === null || dateString === undefined) {
    return "-";
  }
  
  try {
    const [datePart] = String(dateString).split('T');
    return formatDateLocal(datePart, "dd 'de' MMMM 'de' yyyy");
  } catch (error) {
    console.error(`Error formateando fecha larga: ${dateString}`, error);
    return "-";
  }
}

/**
 * Formatea solo la fecha (sin hora) con formato corto
 */
export function formatDateShort(dateString: string): string {
  if (!dateString || dateString === null || dateString === undefined) {
    return "-";
  }
  
  try {
    const [datePart] = String(dateString).split('T');
    return formatDateLocal(datePart, "dd/MM/yyyy");
  } catch (error) {
    console.error(`Error formateando fecha corta: ${dateString}`, error);
    return "-";
  }
}

/**
 * Formatea la fecha con formato medio
 */
export function formatDateMedium(dateString: string): string {
  if (!dateString || dateString === null || dateString === undefined) {
    return "-";
  }
  
  try {
    const [datePart] = String(dateString).split('T');
    return formatDateLocal(datePart, "dd MMM yyyy");
  } catch (error) {
    console.error(`Error formateando fecha media: ${dateString}`, error);
    return "-";
  }
} 