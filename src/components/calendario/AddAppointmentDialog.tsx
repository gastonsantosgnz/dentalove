"use client"

import * as React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Appointment {
  title: string
  date: Date
  time: string
  patient_id: string
  doctor_id: string
  service_id: string
  consultorio_id: string
  notes?: string
}

interface AddAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (appointment: Appointment) => Promise<void>
  patients: Array<{ id: string, nombre_completo: string }>
  doctors: Array<{ id: string, nombre_completo: string }>
  services: Array<{ id: string, nombre_servicio: string, duracion: number }>
  consultorioId: string
}

export function AddAppointmentDialog({
  open,
  onOpenChange,
  onSubmit,
  patients,
  doctors,
  services,
  consultorioId
}: AddAppointmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [time, setTime] = useState("09:00")
  const [patientId, setPatientId] = useState("")
  const [doctorId, setDoctorId] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !selectedDate || !time || !patientId || !doctorId || !serviceId || !consultorioId) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const appointment: Appointment = {
        title,
        date: selectedDate,
        time,
        patient_id: patientId,
        doctor_id: doctorId,
        service_id: serviceId,
        consultorio_id: consultorioId,
        notes
      }
      
      await onSubmit(appointment)
      
      // Reset form after successful submission
      setTitle("")
      setSelectedDate(new Date())
      setTime("09:00")
      setPatientId("")
      setDoctorId("")
      setServiceId("")
      setNotes("")
      
      // Close the dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating appointment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to safely format dates
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Selecciona fecha"
    try {
      return format(date, "PPP", { locale: es })
    } catch (error) {
      console.error("Error formatting date:", error)
      return format(date, "dd/MM/yyyy") // Fallback format
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva Cita</DialogTitle>
            <DialogDescription>
              Añade una nueva cita al calendario. Todos los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title field */}
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Consulta general"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            {/* Date and time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fecha *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(selectedDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="time">Hora *</Label>
                <div className="relative">
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                  <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Patient selection */}
            <div className="grid gap-2">
              <Label htmlFor="patient">Paciente *</Label>
              <Select value={patientId} onValueChange={setPatientId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un paciente" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[9999]" side="bottom" sideOffset={5}>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Doctor selection */}
            <div className="grid gap-2">
              <Label htmlFor="doctor">Doctor *</Label>
              <Select value={doctorId} onValueChange={setDoctorId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un doctor" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[9999]" side="bottom" sideOffset={5}>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Service selection */}
            <div className="grid gap-2">
              <Label htmlFor="service">Servicio *</Label>
              <Select value={serviceId} onValueChange={setServiceId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[9999]" side="bottom" sideOffset={5}>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.nombre_servicio} ({service.duracion} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Notes textarea */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                placeholder="Notas adicionales sobre la cita"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 