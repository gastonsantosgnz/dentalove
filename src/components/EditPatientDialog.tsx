'use client';

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Paciente } from "@/lib/database";
import { getPatientType } from "@/components/AddPatientDialog";

interface EditPatientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Paciente;
  onPatientUpdated: (patient: Paciente) => void;
}

export function EditPatientDialog({ 
  isOpen, 
  onOpenChange, 
  patient, 
  onPatientUpdated 
}: EditPatientDialogProps) {
  // Initialize form data
  const [formData, setFormData] = useState({
    nombre_completo: patient.nombre_completo,
    fecha_nacimiento: patient.fecha_nacimiento,
    celular: patient.celular || '',
    notas: patient.notas || '',
  });

  // Calculate patient type based on birth date
  const pacienteType = getPatientType(patient.fecha_nacimiento);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedPaciente: Paciente = {
        id: patient.id,
        consultorio_id: patient.consultorio_id,
        nombre_completo: formData.nombre_completo,
        fecha_nacimiento: formData.fecha_nacimiento,
        celular: formData.celular || null,
        notas: formData.notas || null
      };
      
      // Close dialog and update data
      onOpenChange(false);
      setTimeout(() => {
        onPatientUpdated(updatedPaciente);
      }, 10);
    } catch (error) {
      console.error("Error al actualizar paciente:", error);
      onOpenChange(false);
    }
  }, [formData, patient.id, patient.consultorio_id, onOpenChange, onPatientUpdated]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
    >
      <DialogContent onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre_completo" className="text-right">
                Nombre
              </Label>
              <Input
                id="nombre_completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipoPaciente" className="text-right">
                Tipo de paciente
              </Label>
              <Input
                id="tipoPaciente"
                name="tipoPaciente"
                value={pacienteType}
                className="col-span-3"
                disabled
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha_nacimiento" className="text-right">
                Fecha de nacimiento
              </Label>
              <Input
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
                className="col-span-3"
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
                value={formData.celular}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notas" className="text-right">
                Notas médicas
              </Label>
              <Textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 