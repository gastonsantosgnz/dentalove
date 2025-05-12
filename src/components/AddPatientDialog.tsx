"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Paciente, PacienteCreate } from "@/lib/database";

// Función para calcular el tipo de paciente según la edad
export function getPatientType(birthDate: string): "Adulto" | "Pediátrico" | "Adolescente" {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age <= 12) return "Pediátrico";
  if (age <= 17) return "Adolescente";
  return "Adulto";
}

interface AddPatientDialogProps {
  onSubmit: ((data: PacienteCreate) => void) | (() => void);
}

export function AddPatientDialog({ onSubmit }: AddPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    nombre_completo: "",
    celular: "",
    notas: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_completo || !date) {
      // Aquí podrías manejar errores o validación
      return;
    }
    
    const birthDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    const patientData: PacienteCreate = {
      ...formData,
      fecha_nacimiento: birthDate
    };
    
    // Llamar al callback proporcionado para guardar en Supabase
    // Check if the callback expects a parameter
    if (onSubmit.length > 0) {
      (onSubmit as (data: PacienteCreate) => void)(patientData);
    } else {
      (onSubmit as () => void)();
    }
    
    // Cerrar el diálogo y reiniciar el formulario
    setOpen(false);
    setFormData({
      nombre_completo: "",
      celular: "",
      notas: ""
    });
    setDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto bg-slate-900 text-white hover:bg-slate-800 hover:text-white">
          <Plus
            className="-ms-1 me-2 opacity-60"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          Nuevo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar nuevo paciente</DialogTitle>
            <DialogDescription>
              Ingresa los datos del paciente para registrarlo en el sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre_completo" className="text-right">
                Nombre
              </Label>
              <Input
                id="nombre_completo"
                name="nombre_completo"
                placeholder="Nombre completo del paciente"
                className="col-span-3"
                value={formData.nombre_completo}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha_nacimiento" className="text-right">
                Fecha de Nacimiento
              </Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                className="col-span-3"
                value={date ? date.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setDate(new Date(e.target.value));
                  } else {
                    setDate(undefined);
                  }
                }}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="celular" className="text-right">
                Celular
              </Label>
              <Input
                id="celular"
                name="celular"
                placeholder="Número de contacto"
                className="col-span-3"
                value={formData.celular}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notas" className="text-right">
                Notas
              </Label>
              <Textarea
                id="notas"
                name="notas"
                placeholder="Información adicional, alergias, etc."
                className="col-span-3"
                rows={3}
                value={formData.notas}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white">Guardar Paciente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 