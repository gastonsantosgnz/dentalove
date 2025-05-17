"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// Interfaz simplificada para DialogProps
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

// Dialog container simplificado
const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  // Controlar visibilidad directamente
  React.useEffect(() => {
    if (open) {
      // Evitar scroll del body cuando el dialog está abierto
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // No renderizar nada si no está abierto
  if (!open) return null;
  
  return <>{children}</>;
};

// Trigger simplificado
const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onOpenChange?: (open: boolean) => void }
>(({ onClick, onOpenChange, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    if (onOpenChange) onOpenChange(true);
  };
  
  return <button type="button" onClick={handleClick} ref={ref} {...props} />;
});
DialogTrigger.displayName = "DialogTrigger";

// No usamos overlays ni portales - todo se renderiza directamente en el lugar
const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-[101] bg-black/50",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

// Contenido simplificado que se renderiza directamente
const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onOpenChange?: (open: boolean) => void }
>(({ className, children, onOpenChange, ...props }, ref) => {
  // Manejar clic fuera para cerrar
  const handleBackdropClick = React.useCallback((e: React.MouseEvent) => {
    // Solo cerrar si se hace clic directamente en el backdrop
    if (e.target === e.currentTarget && onOpenChange) {
      onOpenChange(false);
    }
  }, [onOpenChange]);
  
  // Manejar tecla Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onOpenChange) {
        onOpenChange(false);
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onOpenChange]);
  
  return (
    <div className="fixed inset-0 z-[100] overflow-auto" onClick={handleBackdropClick}>
      <DialogOverlay />
      <div
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-[101] max-h-[90vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md bg-white p-6 shadow-lg sm:w-full",
          className,
        )}
        {...props}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        {onOpenChange && (
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </div>
  );
});
DialogContent.displayName = "DialogContent";

// Componentes auxiliares simplificados
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}; 