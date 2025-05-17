import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { twMerge } from "tailwind-merge";
import ClientLayout from "@/components/ClientLayout";

// Import cleanup registry for initialization
import "@/lib/cleanupRegistry";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Dentalove - Planes Dentales",
  description:
    "Dentalove ofrece planes dentales personalizados para el cuidado de tu salud bucal. Consulta y administra a tus pacientes de manera eficiente.",
};

// Establecer un mecanismo básico para detectar memory leaks
if (typeof window !== 'undefined') {
  // Contador de event listeners para detectar memory leaks
  window.__eventListenerCount = window.__eventListenerCount || 0;
  
  // Interceptar creación y eliminación de event listeners
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
  
  EventTarget.prototype.addEventListener = function(...args: any[]) {
    window.__eventListenerCount++;
    return originalAddEventListener.apply(this, args);
  };
  
  EventTarget.prototype.removeEventListener = function(...args: any[]) {
    window.__eventListenerCount--;
    return originalRemoveEventListener.apply(this, args);
  };
  
  // Código de limpieza básico que se ejecuta al cerrar/recargar la página
  window.addEventListener('beforeunload', () => {
    // Limpiar cualquier elemento que pueda causar memory leaks
    if (typeof document !== 'undefined') {
      document.querySelectorAll('[role="dialog"], [data-portal], [data-radix-portal]')
        .forEach(el => {
          try {
            el.remove();
          } catch (e) {
            // Ignorar errores
          }
        });
    }
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={twMerge(inter.className, "flex antialiased h-screen overflow-hidden bg-gray-100")}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

// Tipo global para TypeScript
declare global {
  interface Window {
    __eventListenerCount: number;
  }
}
