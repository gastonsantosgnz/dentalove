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
import { Empleado } from "@/lib/empleadosService";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface AddEmpleadoDialogProps {
  onSubmit: (empleado: Omit<Empleado, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Empleado;
  trigger?: React.ReactNode;
  isEditing?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AddEmpleadoDialog({
  onSubmit,
  initialData,
  trigger,
  isEditing = false,
  isOpen: externalOpen,
  onOpenChange: externalOnOpenChange,
}: AddEmpleadoDialogProps) {
  // Get user from AuthContext
  const { user } = useAuth();
  
  // Referencias para el enfoque
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  
  // Estados del formulario - usar valores iniciales por defecto
  const [nombre, setNombre] = useState("");
  const [puesto, setPuesto] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [salarioBase, setSalarioBase] = useState("");
  const [tipoContrato, setTipoContrato] = useState("Indefinido");
  const [fechaIngreso, setFechaIngreso] = useState("");
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
    setNombre("");
    setPuesto("");
    setDepartamento("");
    setSalarioBase("");
    setTipoContrato("Indefinido");
    setFechaIngreso("");
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
      setNombre(initialData.nombre_completo || "");
      setPuesto(initialData.puesto || "");
      setDepartamento(initialData.departamento || "");
      setSalarioBase(initialData.salario_base ? initialData.salario_base.toString() : "");
      setTipoContrato(initialData.tipo_contrato || "Indefinido");
      setFechaIngreso(initialData.fecha_ingreso || "");
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
        nombre_completo: nombre,
        puesto,
        departamento: departamento || undefined,
        salario_base: salarioBase ? parseFloat(salarioBase) : undefined,
        tipo_contrato: tipoContrato || undefined,
        fecha_ingreso: fechaIngreso || undefined,
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
      console.error("Error submitting empleado:", error);
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
          <DialogTitle>{isEditing ? "Editar Empleado" : "Agregar Empleado"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edita la información del empleado."
              : "Completa el formulario para agregar un nuevo empleado."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  ref={nombreInputRef}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ingresa el nombre del empleado"
                  required
                  disabled={isLoading}
                  tabIndex={0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="puesto">Puesto *</Label>
                <Select value={puesto} onValueChange={setPuesto} disabled={isLoading} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el puesto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                    <SelectItem value="Asistente Dental">Asistente Dental</SelectItem>
                    <SelectItem value="Higienista Dental">Higienista Dental</SelectItem>
                    <SelectItem value="Auxiliar de Consultorio">Auxiliar de Consultorio</SelectItem>
                    <SelectItem value="Personal de Limpieza">Personal de Limpieza</SelectItem>
                    <SelectItem value="Auxiliar Administrativo">Auxiliar Administrativo</SelectItem>
                    <SelectItem value="Coordinador de Citas">Coordinador de Citas</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select value={departamento} onValueChange={setDepartamento} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recepción">Recepción</SelectItem>
                    <SelectItem value="Asistencia">Asistencia</SelectItem>
                    <SelectItem value="Administración">Administración</SelectItem>
                    <SelectItem value="Limpieza">Limpieza</SelectItem>
                    <SelectItem value="Coordinación">Coordinación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salario">Salario base (semanal)</Label>
                <Input
                  id="salario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={salarioBase}
                  onChange={(e) => setSalarioBase(e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                  tabIndex={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tipoContrato">Tipo de contrato</Label>
                <Select value={tipoContrato} onValueChange={setTipoContrato} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indefinido">Indefinido</SelectItem>
                    <SelectItem value="Temporal">Temporal</SelectItem>
                    <SelectItem value="Por Horas">Por Horas</SelectItem>
                    <SelectItem value="Medio Tiempo">Medio Tiempo</SelectItem>
                    <SelectItem value="Tiempo Completo">Tiempo Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
                <Input
                  id="fechaIngreso"
                  type="date"
                  value={fechaIngreso}
                  onChange={(e) => setFechaIngreso(e.target.value)}
                  disabled={isLoading}
                  tabIndex={0}
                />
              </div>
            </div>

            {/* Información de contacto */}
            <div className="grid grid-cols-2 gap-4">
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
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="empleado@ejemplo.com"
                  disabled={isLoading}
                  tabIndex={0}
                />
              </div>
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
              {isLoading ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar empleado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 