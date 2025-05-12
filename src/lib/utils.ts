import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una fecha ISO a un formato más legible
 * @param isoDate Fecha en formato ISO string
 * @param options Opciones de formato
 * @returns Fecha formateada
 */
export function formatDate(isoDate: string, options: {
  includeTime?: boolean;
  locale?: string;
} = {}) {
  const { includeTime = false, locale = 'es-ES' } = options;
  
  try {
    const date = new Date(isoDate);
    
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    return date.toLocaleDateString(locale, dateOptions);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error en formato';
  }
}

/**
 * Calcula la antigüedad a partir de una fecha ISO
 * @param isoDate Fecha en formato ISO string
 * @returns String con la antigüedad en formato relativo
 */
export function timeAgo(isoDate: string, locale: string = 'es-ES') {
  try {
    const date = new Date(isoDate);
    
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSecs < 60) {
      return 'hace unos segundos';
    } else if (diffMins < 60) {
      return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else if (diffMonths < 12) {
      return `hace ${diffMonths} mes${diffMonths !== 1 ? 'es' : ''}`;
    } else {
      return `hace ${diffYears} año${diffYears !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.error('Error al calcular antigüedad:', error);
    return 'Error en formato';
  }
}

export const isMobile = () => {
  if (typeof window === "undefined") return false;
  const width = window.innerWidth;
  return width <= 1024;
};
