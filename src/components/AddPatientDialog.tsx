"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

// Función para formatear fecha de YYYY-MM-DD a DD/MM/YYYY
function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// Función para convertir fecha de DD/MM/YYYY a YYYY-MM-DD
function parseDisplayDate(displayDate: string): string {
  if (!displayDate) return '';
  const [day, month, year] = displayDate.split('/');
  return `${year}-${month}-${day}`;
}

interface AddPatientDialogProps {
  onSubmit: ((data: PacienteCreate) => void) | (() => void);
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddPatientDialog({ onSubmit, open: externalOpen, onOpenChange }: AddPatientDialogProps) {
  const { user } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [consultorioId, setConsultorioId] = useState<string | null>(null);
  
  // Use either external or internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    if (onOpenChange) {
      onOpenChange(value);
    }
  };
  
  // Date state
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  
  // Create arrays for days, months, and years
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());
  
  // Function to check if the date is valid
  const isValidDate = () => {
    if (!selectedDay || !selectedMonth || !selectedYear) return false;
    
    const date = new Date(`${selectedYear}-${selectedMonth}-${selectedDay}`);
    return !isNaN(date.getTime()) && 
      date.getDate() === parseInt(selectedDay, 10) && 
      date.getMonth() === parseInt(selectedMonth, 10) - 1;
  };
  
  // Get date object from selections
  const getDateFromSelections = (): Date | null => {
    if (!selectedDay || !selectedMonth || !selectedYear) return null;
    
    const dateStr = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) return null;
    return date;
  };
  
  const [formData, setFormData] = useState({
    nombre_completo: "",
    celular: "",
    notas: ""
  });

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
  }, [open, user, fetchConsultorioId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        nombre_completo: "",
        celular: "",
        notas: ""
      });
      setSelectedDay("");
      setSelectedMonth("");
      setSelectedYear("");
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dateObj = getDateFromSelections();
    
    if (!formData.nombre_completo || !dateObj || !consultorioId) {
      // Show error or validation message
      console.error("Missing required fields or consultorio_id");
      return;
    }
    
    const birthDate = dateObj.toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    const patientData: PacienteCreate = {
      ...formData,
      fecha_nacimiento: birthDate,
      consultorio_id: consultorioId
    };
    
    // Call the callback provided to save to Supabase
    // Check if the callback expects a parameter
    if (onSubmit.length > 0) {
      (onSubmit as (data: PacienteCreate) => void)(patientData);
    } else {
      (onSubmit as () => void)();
    }
    
    // Close the dialog and reset the form
    setOpen(false);
    setFormData({
      nombre_completo: "",
      celular: "",
      notas: ""
    });
    setSelectedDay("");
    setSelectedMonth("");
    setSelectedYear("");
  };

  // Manejador para abrir el diálogo
  const handleOpenDialog = () => {
    setOpen(true);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={setOpen}
    >
      {/* Only show button if we're using internal state */}
      {externalOpen === undefined && (
        <Button 
          className="ml-auto bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
          onClick={handleOpenDialog}
        >
          <Plus
            className="-ms-1 me-2 opacity-60"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          Nuevo Paciente
        </Button>
      )}
      
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
              <Label className="text-right">
                Fecha de Nacimiento
              </Label>
              <div className="col-span-3 grid grid-cols-3 gap-2">
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {days.map(day => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {years.map(year => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <Button 
              type="submit" 
              className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
              disabled={!formData.nombre_completo || !selectedDay || !selectedMonth || !selectedYear}
            >
              Guardar Paciente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 