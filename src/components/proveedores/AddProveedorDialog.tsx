"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Proveedor } from "@/lib/proveedoresService";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface AddProveedorDialogProps {
  onSubmit: (proveedor: Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Proveedor;
  trigger?: React.ReactNode;
  isEditing?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AddProveedorDialog({
  onSubmit,
  initialData,
  trigger,
  isEditing = false,
  isOpen: externalOpen,
  onOpenChange: externalOnOpenChange,
}: AddProveedorDialogProps) {
  // Get user from AuthContext
  const { user } = useAuth();
  
  // Referencias para el enfoque
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  
  // Estados del formulario - usar valores iniciales por defecto
  const [nombreComercial, setNombreComercial] = useState("");
  const [nombreFiscal, setNombreFiscal] = useState("");
  const [rfc, setRfc] = useState("");
  const [categoriaProveedor, setCategoriaProveedor] = useState("");
  const [contactoPrincipal, setContactoPrincipal] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [consultorioId, setConsultorioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Determinar si el control de apertura es interno o externo
  const isControlledExternally = externalOpen !== undefined && externalOnOpenChange !== undefined;
  const open = isControlledExternally ? externalOpen : internalOpen;
  
  // Fetch the user's consultorio_id when dialog opens
  const fetchConsultorioId = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('usuarios_consultorios')
        .select(`
          consultorio_id
        `)
        .eq('usuario_id', user.id)
        .eq('activo', true)
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching consultorio_id:', error);
        return;
      }
      
      if (data) {
        setConsultorioId(String(data.consultorio_id || ''));
      }
    } catch (error) {
      console.error('Error fetching consultorio_id:', error);
    }
  }, [user]);
  
  // Call fetchConsultorioId when dialog opens
  useEffect(() => {
    if (open) {
      fetchConsultorioId();
    }
  }, [open, fetchConsultorioId]);
  
  // Función segura para actualizar el estado open
  const handleOpenChange = useCallback((newOpen: boolean) => {
    // Si está cerrando y está cargando, prevenir el cierre
    if (!newOpen && isLoading) return;

    // Si está cerrando, esperar un breve momento para evitar problemas de focus
    if (!newOpen) {
      setTimeout(() => {
        if (isControlledExternally && externalOnOpenChange) {
          externalOnOpenChange(newOpen);
        } else {
          setInternalOpen(newOpen);
        }
      }, 0);
    } else {
      // Si está abriendo, actualizar inmediatamente
      if (isControlledExternally && externalOnOpenChange) {
        externalOnOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    }
  }, [isControlledExternally, externalOnOpenChange, isLoading]);

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    setNombreComercial("");
    setNombreFiscal("");
    setRfc("");
    setCategoriaProveedor("");
    setContactoPrincipal("");
    setTelefono("");
    setEmail("");
    setDireccion("");
    setNotas("");
    setIsLoading(false);
  }, []);

  // Inicializar los datos del formulario cuando se abre
  useEffect(() => {
    if (open && initialData) {
      // Solo establecer valores si el diálogo está abierto y tenemos datos iniciales
      setNombreComercial(initialData.nombre_comercial || "");
      setNombreFiscal(initialData.nombre_fiscal || "");
      setRfc(initialData.rfc || "");
      setCategoriaProveedor(initialData.categoria_proveedor || "");
      setContactoPrincipal(initialData.contacto_principal || "");
      setTelefono(initialData.telefono || "");
      setEmail(initialData.email || "");
      setDireccion(initialData.direccion || "");
      setNotas(initialData.notas || "");
    } else if (!open && !isEditing) {
      // Limpiar el formulario al cerrarse si no estamos en modo edición
      resetForm();
    }
  }, [open, initialData, isEditing, resetForm]);
  
  // Auto-enfocar el primer campo cuando se abre el diálogo
  useEffect(() => {
    if (open && nombreInputRef.current) {
      // Usar un corto retraso para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        nombreInputRef.current?.focus();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Manejar la presentación del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Verificar que tengamos consultorio_id
    if (!consultorioId) {
      console.error("Missing consultorio_id");
      return;
    }
    
    setIsLoading(true);

    try {
      // Convertir a una promesa y esperar a que se complete
      await onSubmit({
        nombre_comercial: nombreComercial,
        nombre_fiscal: nombreFiscal || undefined,
        rfc: rfc || undefined,
        categoria_proveedor: categoriaProveedor || undefined,
        contacto_principal: contactoPrincipal || undefined,
        telefono: telefono || undefined,
        email: email || undefined,
        direccion: direccion || undefined,
        notas: notas || undefined,
        consultorio_id: consultorioId,
        activo: true,
      });
      
      // Limpiar y cerrar solo después de que la operación se complete
      resetForm();
      
      // Cerrar el diálogo con un retraso para evitar problemas de foco
      setTimeout(() => {
        handleOpenChange(false);
      }, 0);
    } catch (error) {
      console.error("Error submitting proveedor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar cancelar
  const handleCancel = () => {
    if (!isEditing) {
      resetForm();
    }
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Proveedor" : "Agregar Proveedor"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edita la información del proveedor."
              : "Completa el formulario para agregar un nuevo proveedor."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nombreComercial">Nombre comercial *</Label>
                <Input
                  id="nombreComercial"
                  ref={nombreInputRef}
                  value={nombreComercial}
                  onChange={(e) => setNombreComercial(e.target.value)}
                  placeholder="Ingresa el nombre comercial"
                  required
                  disabled={isLoading}
                  tabIndex={0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nombreFiscal">Nombre fiscal</Label>
                <Input
                  id="nombreFiscal"
                  value={nombreFiscal}
                  onChange={(e) => setNombreFiscal(e.target.value)}
                  placeholder="Ingresa el nombre fiscal"
                  disabled={isLoading}
                  tabIndex={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value.toUpperCase())}
                  placeholder="XAXX010101000"
                  maxLength={13}
                  disabled={isLoading}
                  tabIndex={0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoría de proveedor</Label>
                <Select value={categoriaProveedor} onValueChange={setCategoriaProveedor} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Material Dental">Material Dental</SelectItem>
                    <SelectItem value="Equipamiento">Equipamiento</SelectItem>
                    <SelectItem value="Servicios">Servicios</SelectItem>
                    <SelectItem value="Farmacéutico">Farmacéutico</SelectItem>
                    <SelectItem value="Oficina">Oficina</SelectItem>
                    <SelectItem value="Limpieza">Limpieza</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contacto">Contacto principal</Label>
                <Input
                  id="contacto"
                  value={contactoPrincipal}
                  onChange={(e) => setContactoPrincipal(e.target.value)}
                  placeholder="Nombre del contacto"
                  disabled={isLoading}
                  tabIndex={0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ingresa el teléfono"
                  disabled={isLoading}
                  tabIndex={0}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="proveedor@ejemplo.com"
                disabled={isLoading}
                tabIndex={0}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ingresa la dirección"
                disabled={isLoading}
                tabIndex={0}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Observaciones adicionales..."
                disabled={isLoading}
                tabIndex={0}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !consultorioId}
              ref={submitButtonRef}
              tabIndex={0}
            >
              {isLoading ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar proveedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 