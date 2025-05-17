/**
 * Sistema de registro de funciones de limpieza para manejar memory leaks
 * Este módulo permite registrar y ejecutar funciones de limpieza globales
 */

// Inicializar el registro global de funciones de limpieza
if (typeof window !== 'undefined') {
  if (!window.__CLEANUP_HANDLERS) {
    window.__CLEANUP_HANDLERS = [];
  }
}

/**
 * Registra una función de limpieza para ser ejecutada en caso de emergencia
 * @param cleanupFn Función que limpia recursos (event listeners, timers, etc.)
 * @returns Una función para desregistrar el handler
 */
export function registerCleanupHandler(cleanupFn: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // No op en el servidor
  }
  
  // Asegurar que el array existe
  if (!window.__CLEANUP_HANDLERS) {
    window.__CLEANUP_HANDLERS = [];
  }
  
  // Registrar la función
  window.__CLEANUP_HANDLERS.push(cleanupFn);
  
  // Limitar el tamaño del array para evitar memory leaks
  if (window.__CLEANUP_HANDLERS.length > 20) {
    window.__CLEANUP_HANDLERS = window.__CLEANUP_HANDLERS.slice(-20);
  }
  
  // Devolver función para desregistrar
  return () => {
    if (window.__CLEANUP_HANDLERS) {
      const index = window.__CLEANUP_HANDLERS.indexOf(cleanupFn);
      if (index >= 0) {
        window.__CLEANUP_HANDLERS.splice(index, 1);
      }
    }
  };
}

/**
 * Ejecuta todas las funciones de limpieza registradas
 * @returns Número de funciones ejecutadas
 */
export function runAllCleanupHandlers(): number {
  if (typeof window === 'undefined' || !window.__CLEANUP_HANDLERS) {
    return 0;
  }
  
  let executed = 0;
  
  // Ejecutar cada handler
  window.__CLEANUP_HANDLERS.forEach(handler => {
    try {
      if (typeof handler === 'function') {
        handler();
        executed++;
      }
    } catch (error) {
      console.error('[Cleanup] Error ejecutando handler:', error);
    }
  });
  
  return executed;
}

/**
 * Limpia elementos del DOM que podrían estar causando bloqueos
 * @returns Número de elementos eliminados
 */
export function cleanupBlockingElements(): number {
  if (typeof document === 'undefined') {
    return 0;
  }
  
  // Selectores para elementos problemáticos
  const selectors = [
    '[role="dialog"]',
    '[data-portal]',
    '[data-radix-portal]',
    '.fixed:not(#emergency-reset)',
    '.absolute[style*="z-index: 999"]',
  ];
  
  let removed = 0;
  
  // Eliminar cada elemento
  selectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => {
        if (el.id !== 'emergency-reset' && 
            !el.classList.contains('toaster') && 
            !el.id.includes('toast')) {
          el.remove();
          removed++;
        }
      });
    } catch (error) {
      console.error(`[Cleanup] Error eliminando ${selector}:`, error);
    }
  });
  
  return removed;
}

// Exponer interfaz para TypeScript
declare global {
  interface Window {
    __CLEANUP_HANDLERS?: (() => void)[];
  }
}

// Registrar evento de cierre de ventana para limpieza
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    runAllCleanupHandlers();
    cleanupBlockingElements();
  });
} 