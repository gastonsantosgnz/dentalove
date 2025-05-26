"use client";

import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";
import { useEffect, memo } from "react";
import { ServiciosProvider } from "@/contexts/ServiciosContext";
import { ConsultorioProvider } from "@/contexts/ConsultorioContext";
import dynamic from 'next/dynamic';

// Dynamic import for Sidebar to reduce initial load time
const Sidebar = dynamic(
  () => import('@/components/Sidebar').then(mod => ({ default: mod.Sidebar })),
  { ssr: false, loading: () => <SidebarSkeleton /> }
);

// Simple skeleton for Sidebar
const SidebarSkeleton = () => (
  <div className="w-14 lg:w-56 h-screen bg-neutral-100 animate-pulse"></div>
);

// Memoized dashboard layout component
const DashboardLayout = memo(({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  
  // Limpiar elementos residuales al cambiar de ruta
  useEffect(() => {
    // Al montar el componente
    console.log("[Dashboard] Cambio de ruta:", pathname);
    
    // Una función simple para limpiar el DOM
    const cleanup = () => {
      if (typeof document === 'undefined') return;
      
      // Limpiar diálogos y portales huérfanos
      const obsoleteElements = document.querySelectorAll(
        '[role="dialog"]:not([data-state="open"]), [data-portal]:empty, [data-radix-portal]:empty'
      );
      
      obsoleteElements.forEach(el => {
        try {
          el.remove();
        } catch (e) {
          // Ignorar errores
        }
      });
    };
    
    // Ejecutar limpieza inmediatamente
    cleanup();
    
    // Limpiar al desmontar
    return cleanup;
  }, [pathname]);
  
  return (
    <ServiciosProvider>
      <ConsultorioProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="lg:pt-2 bg-gray-100 flex-1 overflow-y-auto lg:pl-2">
            <div className="flex-1 bg-white rounded-tl-2xl min-h-full overflow-hidden flex flex-col lg:rounded-tl-2xl">
              <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                {children}
              </main>
              <Footer />
            </div>
          </div>
          <Toaster />
        </div>
      </ConsultorioProvider>
    </ServiciosProvider>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout; 