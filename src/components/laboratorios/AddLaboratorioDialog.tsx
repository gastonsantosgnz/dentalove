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
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { Laboratorio } from "@/lib/laboratoriosService";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface AddLaboratorioDialogProps {
  onSubmit: (laboratorio: Omit<Laboratorio, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Laboratorio;
  trigger?: React.ReactNode;
  isEditing?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AddLaboratorioDialog({
  onSubmit,
  initialData,
  trigger,
  isEditing = false,
  isOpen: externalOpen,
  onOpenChange: externalOnOpenChange,
}: AddLaboratorioDialogProps) {
  // Get user from AuthContext
  const { user } = useAuth();
  
  // Referencias para el enfoque
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const especialidadInputRef = useRef<HTMLInputElement>(null);
  
  // Estados del formulario - usar valores iniciales por defecto
  const [nombreLaboratorio, setNombreLaboratorio] = useState("");
  const [nombreFiscal, setNombreFiscal] = useState("");
  const [rfc, setRfc] = useState("");
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  const [tiempoEntrega, setTiempoEntrega] = useState("");
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
    setNombreLaboratorio("");
    setNombreFiscal("");
    setRfc("");
    setEspecialidades([]);
    setNuevaEspecialidad("");
    setTiempoEntrega("");
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
      setNombreLaboratorio(initialData.nombre_laboratorio || "");
      setNombreFiscal(initialData.nombre_fiscal || "");
      setRfc(initialData.rfc || "");
      setEspecialidades(initialData.especialidades || []);
      setTiempoEntrega(initialData.tiempo_entrega_promedio ? initialData.tiempo_entrega_promedio.toString() : "");
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

  // Función para agregar especialidad
  const handleAddEspecialidad = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (nuevaEspecialidad.trim() && !especialidades.includes(nuevaEspecialidad.trim())) {
      setEspecialidades([...especialidades, nuevaEspecialidad.trim()]);
      setNuevaEspecialidad("");
    }
  };

  // Función para eliminar especialidad
  const handleRemoveEspecialidad = (especialidadToRemove: string) => {
    setEspecialidades(especialidades.filter(esp => esp !== especialidadToRemove));
  };

  // Manejar Enter en el input de especialidad
  const handleEspecialidadKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEspecialidad();
    }
  };

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
        nombre_laboratorio: nombreLaboratorio,
        nombre_fiscal: nombreFiscal || undefined,
        rfc: rfc || undefined,
        especialidades: especialidades.length > 0 ? especialidades : undefined,
        tiempo_entrega_promedio: tiempoEntrega ? parseInt(tiempoEntrega) : undefined,
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
      console.error("Error submitting laboratorio:", error);
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
          <DialogTitle>{isEditing ? "Editar Laboratorio" : "Agregar Laboratorio"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edita la información del laboratorio."
              : "Completa el formulario para agregar un nuevo laboratorio."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nombreLaboratorio">Nombre del laboratorio *</Label>
                <Input
                  id="nombreLaboratorio"
                  ref={nombreInputRef}
                  value={nombreLaboratorio}
                  onChange={(e) => setNombreLaboratorio(e.target.value)}
                  placeholder="Ingresa el nombre del laboratorio"
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
                <Label htmlFor="tiempoEntrega">Tiempo de entrega (días)</Label>
                <Input
                  id="tiempoEntrega"
                  type="number"
                  min="1"
                  value={tiempoEntrega}
                  onChange={(e) => setTiempoEntrega(e.target.value)}
                  placeholder="7"
                  disabled={isLoading}
                  tabIndex={0}
                />
              </div>
            </div>

            {/* Especialidades */}
            <div className="grid gap-2">
              <Label htmlFor="especialidades">Especialidades</Label>
              <div className="flex gap-2">
                <Input
                  ref={especialidadInputRef}
                  value={nuevaEspecialidad}
                  onChange={(e) => setNuevaEspecialidad(e.target.value)}
                  onKeyDown={handleEspecialidadKeyDown}
                  placeholder="Ej: Prótesis, Ortodoncia, Implantes..."
                  disabled={isLoading}
                  tabIndex={0}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEspecialidad}
                  disabled={isLoading || !nuevaEspecialidad.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {especialidades.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {especialidades.map((esp, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {esp}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => handleRemoveEspecialidad(esp)}
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
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
                placeholder="laboratorio@ejemplo.com"
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
              {isLoading ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar laboratorio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 