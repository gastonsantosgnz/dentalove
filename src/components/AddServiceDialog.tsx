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
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
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

interface AddServiceDialogProps {
  buttonVariant?: "default" | "outline" | "ghost";
  buttonText?: string;
  onSubmit?: (serviceData: ServicioCreate) => void;
}

export function AddServiceDialog({
  buttonVariant = "outline",
  buttonText = "Agregar servicio",
  onSubmit,
}: AddServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [formData, setFormData] = useState<ServicioCreate>({
    nombre_servicio: "",
    costo: 0,
    duracion: 30,
    descripcion: "",
    especialidad: "",
  });

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
    setPopoverOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    // Reset form and close dialog
    setFormData({
      nombre_servicio: "",
      costo: 0,
      duracion: 30,
      descripcion: "",
      especialidad: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white">
          <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
          {buttonText}
        </Button>
      </DialogTrigger>
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
                      step="50"
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
                  <div className="relative w-full">
                    <Input
                      id="especialidad"
                      name="especialidad"
                      placeholder="Selecciona o escribe una especialidad"
                      value={formData.especialidad || ""}
                      onChange={handleInputChange}
                      className="pr-10"
                      required
                      onClick={() => setPopoverOpen(!popoverOpen)}
                    />
                    <div 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      onClick={() => setPopoverOpen(!popoverOpen)}
                    >
                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {popoverOpen && especialidades.length > 0 && (
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
                              setPopoverOpen(false);
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
                              setPopoverOpen(false);
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