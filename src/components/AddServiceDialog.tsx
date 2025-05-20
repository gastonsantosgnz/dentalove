"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Check, ChevronsUpDown, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ServicioCreate } from "@/lib/database";
import { getServicios } from "@/lib/serviciosService";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddServiceDialogProps {
  buttonVariant?: "default" | "outline" | "ghost";
  buttonText?: string;
  onSubmit?: (serviceData: ServicioCreate) => void;
  onOpenChange: (open: boolean) => void;
  open?: boolean;
}

export function AddServiceDialog({
  buttonVariant = "outline",
  buttonText = "Agregar servicio",
  onSubmit,
  onOpenChange,
  open: externalOpen,
}: AddServiceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use either external or internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    if (onOpenChange) {
      onOpenChange(value);
    }
  };
  
  const [especialidadPopoverOpen, setEspecialidadPopoverOpen] = useState(false);
  const [tipoPacientePopoverOpen, setTipoPacientePopoverOpen] = useState(false);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tipoPacienteRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<ServicioCreate>({
    nombre_servicio: "",
    costo: 0,
    duracion: 30,
    descripcion: "",
    especialidad: "",
    tipo_paciente: "General",
  });

  // Efecto para cerrar el menú de tipo de paciente al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tipoPacienteRef.current && !tipoPacienteRef.current.contains(event.target as Node)) {
        setTipoPacientePopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Efecto para cerrar el menú de especialidad al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setEspecialidadPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cargar especialidades existentes
  useEffect(() => {
    if (open) {
      const loadEspecialidades = async () => {
        try {
          const servicios = await getServicios();
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
    }
  }, [open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "costo" || name === "duracion") {
      // Ensure value is a positive number
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
  };

  const handleSelectEspecialidad = (especialidad: string) => {
    setFormData(prev => ({
      ...prev,
      especialidad
    }));
    setEspecialidadPopoverOpen(false);
  };

  // Optimizar el manejo del envío del formulario
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear una copia del formulario para evitar mutaciones y problemas de referencia
    const formDataCopy = JSON.parse(JSON.stringify(formData));
    
    // Cerrar el diálogo ANTES de enviar los datos para evitar congelamiento
    setOpen(false);
    
    // Esperar un momento antes de enviar para asegurar que el diálogo se cierre primero
    requestAnimationFrame(() => {
      if (onSubmit) {
        onSubmit(formDataCopy);
      }
      
      // Limpiar el formulario después de enviar
      setFormData({
        nombre_servicio: "",
        costo: 0,
        duracion: 30,
        descripcion: "",
        especialidad: "",
        tipo_paciente: "General",
      });
    });
  }, [formData, onSubmit, setOpen]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={setOpen}
    >
      {/* Only show button if we're using internal state */}
      {externalOpen === undefined && (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      )}
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="mb-2">
          <DialogTitle>Agregar nuevo servicio</DialogTitle>
          <DialogDescription>
            Complete el formulario para registrar un nuevo servicio dental.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Label htmlFor="nombre_servicio">Nombre del servicio *</Label>
                <Input
                  id="nombre_servicio"
                  name="nombre_servicio"
                  placeholder="Limpieza dental"
                  value={formData.nombre_servicio}
                  onChange={handleInputChange}
                  required
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                <motion.div className="space-y-2">
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
                      value={formData.costo}
                      onChange={handleInputChange}
                      className="pl-7"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div className="space-y-2">
                  <Label htmlFor="duracion">Duración (minutos) *</Label>
                  <div className="relative">
                    <Input
                      id="duracion"
                      name="duracion"
                      type="number"
                      min="5"
                      step="5"
                      placeholder="30"
                      value={formData.duracion}
                      onChange={handleInputChange}
                      required
                      className="pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                      min
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                <Label htmlFor="especialidad">Especialidad *</Label>
                <div className="relative">
                  <div className="relative w-full" ref={dropdownRef}>
                    <Input
                      id="especialidad"
                      name="especialidad"
                      placeholder="Selecciona o escribe una especialidad"
                      value={formData.especialidad || ""}
                      onChange={handleInputChange}
                      className="pr-10"
                      required
                      onClick={() => setEspecialidadPopoverOpen(!especialidadPopoverOpen)}
                    />
                    <div 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      onClick={() => setEspecialidadPopoverOpen(!especialidadPopoverOpen)}
                    >
                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {especialidadPopoverOpen && especialidades.length > 0 && (
                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {/* Opciones existentes */}
                        {especialidades.map((esp) => (
                          <div
                            key={esp}
                            className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-100 ${
                              formData.especialidad === esp ? 'bg-gray-100' : ''
                            }`}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                especialidad: esp
                              }));
                              setEspecialidadPopoverOpen(false);
                            }}
                          >
                            <span className="block truncate">{esp}</span>
                            {formData.especialidad === esp && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <Check className="h-4 w-4 text-emerald-600" />
                              </span>
                            )}
                          </div>
                        ))}

                        {/* Separador */}
                        <div className="border-t border-gray-200 my-1"></div>

                        {/* Agregar nueva */}
                        <div
                          className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-blue-600 hover:bg-blue-50 flex items-center"
                          onClick={() => {
                            // Si ya hay texto escrito que no coincide con ninguna especialidad existente, usarlo como nueva especialidad
                            if (formData.especialidad && typeof formData.especialidad === 'string' && !especialidades.includes(formData.especialidad)) {
                              const newEspecialidad = formData.especialidad;
                              setEspecialidades(prev => 
                                [...prev, newEspecialidad].sort((a, b) => a.localeCompare(b))
                              );
                              setEspecialidadPopoverOpen(false);
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          <span className="block truncate">
                            {formData.especialidad && !especialidades.includes(formData.especialidad)
                              ? `Agregar "${formData.especialidad}"`
                              : "Escribe una nueva especialidad"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28, duration: 0.3 }}
              >
                <Label htmlFor="tipo_paciente">Tipo de paciente *</Label>
                <div className="relative" ref={tipoPacienteRef}>
                  <button
                    type="button"
                    id="tipo_paciente"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => setTipoPacientePopoverOpen(prev => !prev)}
                  >
                    {formData.tipo_paciente || "General"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  
                  {tipoPacientePopoverOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
                      <div 
                        className="py-1.5 px-2 hover:bg-slate-100 cursor-pointer"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, tipo_paciente: "Adulto" }));
                          setTipoPacientePopoverOpen(false);
                        }}
                      >
                        Adulto
                      </div>
                      <div 
                        className="py-1.5 px-2 hover:bg-slate-100 cursor-pointer"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, tipo_paciente: "Pediátrico" }));
                          setTipoPacientePopoverOpen(false);
                        }}
                      >
                        Pediátrico
                      </div>
                      <div 
                        className="py-1.5 px-2 hover:bg-slate-100 cursor-pointer"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, tipo_paciente: "General" }));
                          setTipoPacientePopoverOpen(false);
                        }}
                      >
                        General
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Breve descripción del servicio dental..."
                  value={formData.descripcion || ""}
                  onChange={handleInputChange}
                  rows={3}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white">Guardar servicio</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 