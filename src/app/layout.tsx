import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { twMerge } from "tailwind-merge";
import { AuthProvider } from "@/contexts/AuthContext";

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
  icons: {
    icon: [
      { url: '/dentalove-favicon.ico' },
      { url: '/dentalove-favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/dentalove-favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/dentalove-favicon.ico', sizes: '180x180', type: 'image/x-icon' },
    ],
  },
};

// Establecer un mecanismo básico para detectar memory leaks
if (typeof window !== 'undefined') {
  // Contador de event listeners para detectar memory leaks
  window.__eventListenerCount = window.__eventListenerCount || 0;
  
  // Interceptar creación y eliminación de event listeners
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
  
  // Usar tipado correcto para los argumentos
  EventTarget.prototype.addEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    window.__eventListenerCount++;
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  EventTarget.prototype.removeEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ) {
    window.__eventListenerCount--;
    return originalRemoveEventListener.call(this, type, listener, options);
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
      <body className={twMerge(inter.className, "antialiased")}>
        <AuthProvider>
          {children}
        </AuthProvider>
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
