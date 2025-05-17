import { useState, useEffect, useCallback } from 'react';

interface ListenerInfo {
  type: string;
  target: string;
  stack: string;
}

/**
 * Componente para depurar problemas de memoria
 * Muestra métricas de memoria y listeners activos
 */
export function DebugMemory() {
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  const [listeners, setListeners] = useState<number>(0);
  const [eventTypes, setEventTypes] = useState<{[key: string]: number}>({});
  const [orphanedListeners, setOrphanedListeners] = useState<ListenerInfo[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // Función para encontrar listeners huérfanos
  const findOrphanedListeners = useCallback(() => {
    // Esta es una función simplificada que podría detectar algunos huérfanos
    // pero la implementación real requeriría un enfoque más sofisticado
    const orphaned: ListenerInfo[] = [];
    
    // Intentamos detectar listeners en elementos que ya no están en el DOM
    document.querySelectorAll('[data-dialog-portal]').forEach(portal => {
      if (!portal.parentElement || !document.body.contains(portal)) {
        orphaned.push({
          type: 'dialog-portal',
          target: 'removed element',
          stack: 'unknown'
        });
      }
    });
    
    setOrphanedListeners(orphaned);
  }, []);

  // Forzar refresco de estadísticas
  const updateStats = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Obtener conteo de event listeners desde el método global
      // @ts-ignore
      const count = window.__eventListenerCount || 0;
      setListeners(count);
      
      // Intentar obtener estadísticas de memoria si están disponibles
      if (performance && 'memory' in performance) {
        // @ts-ignore
        setMemoryUsage(performance.memory);
      }
      
      // Buscar listeners huérfanos
      findOrphanedListeners();
    }
  }, [findOrphanedListeners]);

  // Función para forzar la recolección de basura
  const forceGarbageCollection = useCallback(() => {
    if (typeof window !== 'undefined') {
      for (let i = 0; i < 20; i++) {
        // Forzar GC indirectamente creando y eliminando objetos grandes
        const arr = new Array(1000000).fill(Math.random());
        arr.length = 0;
      }
      setTimeout(() => updateStats(), 500);
    }
  }, [updateStats]);

  // Configurar el mecanismo de detección de memory leaks
  useEffect(() => {
    // Inicializar rastreo
    updateStats();
    
    // Configurar intervalo para actualizar estadísticas
    const interval = setInterval(updateStats, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, [updateStats]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-slate-800 text-white p-4 rounded-lg shadow-lg text-sm w-64 max-h-[300px] overflow-y-auto">
      <h3 className="font-bold border-b pb-1 mb-2 flex justify-between">
        Debug Info
        <button 
          onClick={() => setShowDetails(!showDetails)} 
          className="text-xs bg-slate-700 px-2 rounded hover:bg-slate-600"
        >
          {showDetails ? 'Simple' : 'Detalles'}
        </button>
      </h3>
      
      <div className="space-y-1">
        <p>Event Listeners: {listeners}</p>
        {Object.keys(eventTypes).length > 0 && (
          <div className="ml-2 text-xs">
            {Object.entries(eventTypes).map(([type, count]) => (
              <div key={type}>{type}: {count}</div>
            ))}
          </div>
        )}
        
        {memoryUsage && showDetails && (
          <div>
            <p>Memory: {Math.round(memoryUsage.usedJSHeapSize / 1048576)} MB</p>
            <p>Heap Limit: {Math.round(memoryUsage.jsHeapSizeLimit / 1048576)} MB</p>
          </div>
        )}
        
        {orphanedListeners.length > 0 && showDetails && (
          <div>
            <p className="font-semibold text-red-400">Huérfanos: {orphanedListeners.length}</p>
            <div className="ml-2 text-xs max-h-[100px] overflow-y-auto">
              {orphanedListeners.slice(0, 5).map((info, i) => (
                <div key={i} className="mb-1 pb-1 border-b border-slate-700">
                  {info.type} en {info.target}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-slate-700 flex gap-2">
        <button 
          onClick={forceGarbageCollection} 
          className="text-xs bg-slate-700 px-2 py-1 rounded hover:bg-slate-600"
        >
          Forzar GC
        </button>
        <button 
          onClick={updateStats} 
          className="text-xs bg-slate-700 px-2 py-1 rounded hover:bg-slate-600"
        >
          Refrescar
        </button>
      </div>
    </div>
  );
} 