"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
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
import { Checkbox } from "@/components/ui/checkbox"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Appointment {
  id: string
  title: string
  date: string
  time: string
  patient_id: string
  doctor_id: string
  service_id: string
  consultorio_id: string
  notes?: string
  is_first_visit?: boolean
}

interface EditAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment | null
  onUpdate: (id: string, appointment: Partial<Appointment>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  patients: Array<{ id: string, nombre_completo: string }>
  doctors: Array<{ id: string, nombre_completo: string }>
  services: Array<{ id: string, nombre_servicio: string, duracion: number }>
}

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onUpdate,
  onDelete,
  patients,
  doctors,
  services
}: EditAppointmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [title, setTitle] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [time, setTime] = useState("09:00")
  const [patientId, setPatientId] = useState("")
  const [doctorId, setDoctorId] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [notes, setNotes] = useState("")
  const [isFirstVisit, setIsFirstVisit] = useState(false)

  // Cargar los datos de la cita cuando se abre el modal
  useEffect(() => {
    if (appointment && open && patients.length > 0 && doctors.length > 0 && services.length > 0) {
      // Use setTimeout to ensure the Select components are ready
      setTimeout(() => {
        setTitle(appointment.title)
        setSelectedDate(parseISO(appointment.date))
        setTime(appointment.time)
        setPatientId(appointment.patient_id)
        setDoctorId(appointment.doctor_id)
        setServiceId(appointment.service_id)
        setNotes(appointment.notes || "")
        setIsFirstVisit(appointment.is_first_visit || false)
      }, 100)
    }
  }, [appointment, open, patients, doctors, services])

  // Resetear el formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setTitle("")
      setSelectedDate(new Date())
      setTime("09:00")
      setPatientId("")
      setDoctorId("")
      setServiceId("")
      setNotes("")
      setIsFirstVisit(false)
    }
  }, [open])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!appointment || !title || !selectedDate || !time || !patientId || !doctorId || !serviceId) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const updatedAppointment: Partial<Appointment> = {
        title,
        date: format(selectedDate, "yyyy-MM-dd"),
        time,
        patient_id: patientId,
        doctor_id: doctorId,
        service_id: serviceId,
        notes,
        is_first_visit: isFirstVisit
      }
      
      await onUpdate(appointment.id, updatedAppointment)
      
      // Close the dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating appointment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!appointment) return
    
    setIsDeleting(true)
    
    try {
      await onDelete(appointment.id)
      
      // Close the dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting appointment:", error)
    } finally {
      setIsDeleting(false)
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

  if (!appointment) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleUpdate}>
          <DialogHeader>
            <DialogTitle>Editar Cita</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la cita. Todos los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title field */}
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
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
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => date && setSelectedDate(date)}
                  placeholder="Selecciona fecha"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-time">Hora *</Label>
                <TimePicker
                  value={time}
                  onChange={(time) => setTime(time)}
                  required
                />
              </div>
            </div>
            
            {/* Patient selection */}
            <div className="grid gap-2">
              <Label htmlFor="edit-patient">Paciente *</Label>
              <Select key={`patient-${patientId}`} value={patientId} onValueChange={setPatientId} required>
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

            {/* First visit checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-first-visit"
                checked={isFirstVisit}
                onCheckedChange={(checked) => setIsFirstVisit(checked === true)}
              />
              <Label
                htmlFor="edit-first-visit"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Es la primera visita del paciente
              </Label>
            </div>
            
            {/* Doctor selection */}
            <div className="grid gap-2">
              <Label htmlFor="edit-doctor">Doctor *</Label>
              <Select key={`doctor-${doctorId}`} value={doctorId} onValueChange={setDoctorId} required>
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
              <Label htmlFor="edit-service">Servicio *</Label>
              <Select key={`service-${serviceId}`} value={serviceId} onValueChange={setServiceId} required>
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
              <Label htmlFor="edit-notes">Notas (opcional)</Label>
              <Input
                id="edit-notes"
                placeholder="Notas adicionales sobre la cita"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90 h-8 rounded-lg px-3 text-xs"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. La cita será eliminada permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 