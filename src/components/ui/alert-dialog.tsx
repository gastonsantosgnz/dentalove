"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

// Interfaz simplificada para AlertDialogProps
interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

// AlertDialog container simplificado, similar al Dialog
const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
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
const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onOpenChange?: (open: boolean) => void }
>(({ onClick, onOpenChange, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    if (onOpenChange) onOpenChange(true);
  };
  
  return <button type="button" onClick={handleClick} ref={ref} {...props} />;
});
AlertDialogTrigger.displayName = "AlertDialogTrigger";

// Overlay simplificado
const AlertDialogOverlay = React.forwardRef<
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
AlertDialogOverlay.displayName = "AlertDialogOverlay";

// Contenido simplificado que se renderiza directamente
const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onOpenChange?: (open: boolean) => void }
>(({ className, children, onOpenChange, ...props }, ref) => {
  // No permitir cerrar al hacer clic fuera en AlertDialog
  
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
    <div className="fixed inset-0 z-[100] overflow-auto">
      <AlertDialogOverlay />
      <div
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-[101] max-h-[90vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md bg-white p-6 shadow-lg sm:w-full",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

// Componentes auxiliares simplificados
const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3", className)}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

// Botones de acción simplificados
const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onOpenChange?: (open: boolean) => void }
>(({ className, onClick, onOpenChange, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    if (onOpenChange) onOpenChange(false);
  };
  
  return (
    <Button 
      ref={ref}
      className={cn(className)}
      onClick={handleClick}
      {...props}
    />
  );
});
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onOpenChange?: (open: boolean) => void }
>(({ className, onClick, onOpenChange, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    if (onOpenChange) onOpenChange(false);
  };
  
  return (
    <Button
      ref={ref}
      className={cn("text-gray-500 bg-gray-100 hover:bg-gray-200", className)}
      onClick={handleClick}
      {...props}
    />
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
}; 