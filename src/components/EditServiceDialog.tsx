"use client";

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
import { Check, ChevronsUpDown, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Servicio } from "@/lib/database";
import { getServicios } from "@/lib/serviciosService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditServiceDialogProps {
  service: Servicio;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (serviceData: Servicio) => void;
}

export function EditServiceDialog({
  service,
  open,
  onOpenChange,
  onSubmit,
}: EditServiceDialogProps) {
  // Estado local
  const [formData, setFormData] = useState<Servicio>(service);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  
  // Manejo simplificado del popup de especialidad usando Radix UI Select
  const handleEspecialidadChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      especialidad: value
    }));
  }, []);
  
  // Manejo simplificado del tipo de paciente usando Radix UI Select
  const handleTipoChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      tipo_paciente: value
    }));
  }, []);

  // Cargar especialidades una sola vez al abrir
  useEffect(() => {
    if (!open) return;
    
    let isMounted = true;
    
    // Función para cargar especialidades
    const loadEspecialidades = async () => {
      try {
        const servicios = await getServicios();
        if (!isMounted) return;
        
        // Extraer especialidades únicas
        const uniqueEspecialidades = Array.from(
          new Set(servicios.map(servicio => servicio.especialidad).filter(Boolean) as string[])
        ).sort((a, b) => a.localeCompare(b));
        
        setEspecialidades(uniqueEspecialidades);
      } catch (error) {
        console.error("Error loading specialties:", error);
      }
    };
    
    loadEspecialidades();
    
    // Limpiar efecto
    return () => { isMounted = false; };
  }, [open]);

  // Actualizar estado cuando cambia el servicio
  useEffect(() => {
    if (open) {
      setFormData(service);
    }
  }, [service, open]);

  // Manejar cambios en los inputs
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "costo" || name === "duracion") {
      // Asegurar que el valor sea un número positivo
      const numericValue = Math.max(0, Number(value));
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  // Optimizar el manejo del envío del formulario
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear una copia del formulario para evitar mutaciones y problemas de referencia
    const formDataCopy = JSON.parse(JSON.stringify(formData));
    
    // Cerrar el diálogo ANTES de enviar los datos para evitar congelamiento
    onOpenChange(false);
    
    // Esperar un momento antes de enviar para asegurar que el diálogo se cierre primero
    requestAnimationFrame(() => {
      if (onSubmit) {
        onSubmit(formDataCopy);
      }
    });
  }, [formData, onSubmit, onOpenChange]);

  // Crear opciones para el Select de especialidad
  const especialidadOptions = [
    ...especialidades.map(esp => ({
      value: esp,
      label: esp
    })),
    ...(
      formData.especialidad && 
      !especialidades.includes(formData.especialidad) && 
      formData.especialidad.trim() !== '' ? 
      [{ value: formData.especialidad, label: `${formData.especialidad} (nuevo)` }] : 
      []
    )
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="mb-2">
          <DialogTitle>Editar servicio</DialogTitle>
          <DialogDescription>
            Modifique la información del servicio dental.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_servicio">Nombre del servicio *</Label>
              <Input
                id="nombre_servicio"
                name="nombre_servicio"
                placeholder="Limpieza dental"
                value={formData.nombre_servicio || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="costo">Costo (MXN) *</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="costo"
                    name="costo"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="800"
                    value={formData.costo || 0}
                    onChange={handleInputChange}
                    className="pl-7"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duracion">Duración (minutos) *</Label>
                <div className="relative">
                  <Input
                    id="duracion"
                    name="duracion"
                    type="number"
                    min="5"
                    step="5"
                    placeholder="30"
                    value={formData.duracion || 30}
                    onChange={handleInputChange}
                    required
                    className="pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                    min
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_paciente">Tipo de paciente *</Label>
              <Select 
                value={formData.tipo_paciente || "General"} 
                onValueChange={handleTipoChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo de paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adulto">Adulto</SelectItem>
                  <SelectItem value="Pediátrico">Pediátrico</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad *</Label>
              <div className="relative">
                <Input
                  id="especialidad"
                  name="especialidad"
                  placeholder="Escribe una especialidad"
                  value={formData.especialidad || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {especialidades.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Especialidades disponibles:
                  <div className="flex flex-wrap gap-1 mt-1">
                    {especialidades.map(esp => (
                      <span 
                        key={esp} 
                        className="px-2 py-1 rounded-md bg-slate-100 text-slate-800 cursor-pointer hover:bg-slate-200"
                        onClick={() => handleEspecialidadChange(esp)}
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                placeholder="Breve descripción del servicio dental..."
                value={formData.descripcion || ""}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 