"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, User } from "lucide-react"
import { getAppointments } from "@/lib/appointmentsService"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Appointment {
  title: string
  date: Date
  time: string
  patient_id: string
  doctor_id: string
  service_id: string
  consultorio_id: string
  notes?: string
  is_first_visit?: boolean
}

interface PatientHistory {
  id: string
  title: string
  date: string
  time: string
  doctor_nombre: string
  service_nombre: string
  notes?: string
  is_first_visit?: boolean
}

interface AddAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (appointment: Appointment) => Promise<void>
  patients: Array<{ id: string, nombre_completo: string }>
  doctors: Array<{ id: string, nombre_completo: string }>
  services: Array<{ id: string, nombre_servicio: string, duracion: number }>
  consultorioId: string
  initialDate?: Date | null
}

export function AddAppointmentDialog({
  open,
  onOpenChange,
  onSubmit,
  patients,
  doctors,
  services,
  consultorioId,
  initialDate
}: AddAppointmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date())
  const [time, setTime] = useState("09:00")
  const [patientId, setPatientId] = useState("")
  const [doctorId, setDoctorId] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [notes, setNotes] = useState("")
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [patientHistory, setPatientHistory] = useState<PatientHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Load patient history when a patient is selected
  const loadPatientHistory = async (selectedPatientId: string) => {
    if (!selectedPatientId) {
      setPatientHistory([])
      return
    }

    setLoadingHistory(true)
    try {
      const allAppointments = await getAppointments()
      const patientAppointments = allAppointments
        .filter(apt => apt.patient_id === selectedPatientId)
        .map(apt => ({
          id: apt.id,
          title: apt.title,
          date: apt.date,
          time: apt.time,
          doctor_nombre: apt.doctor_nombre || 'Doctor no especificado',
          service_nombre: apt.service_nombre || 'Servicio no especificado',
          notes: apt.notes,
          is_first_visit: apt.is_first_visit
        }))
        .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()) // Most recent first

      setPatientHistory(patientAppointments)
    } catch (error) {
      console.error("Error loading patient history:", error)
      setPatientHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // Effect to load history when patient changes
  useEffect(() => {
    if (patientId && open) {
      loadPatientHistory(patientId)
    } else {
      setPatientHistory([])
    }
  }, [patientId, open])

  // Effect to uncheck first visit when patient has history
  useEffect(() => {
    if (patientHistory.length > 0 && isFirstVisit) {
      setIsFirstVisit(false)
    }
  }, [patientHistory.length, isFirstVisit])

  // Effect to update selected date when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate)
    }
  }, [initialDate])

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
        notes,
        is_first_visit: isFirstVisit
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
      setIsFirstVisit(false)
      setPatientHistory([])
      
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => date && setSelectedDate(date)}
                  placeholder="Selecciona fecha"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="time">Hora *</Label>
                <TimePicker
                  value={time}
                  onChange={(time) => setTime(time)}
                  required
                />
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

            {/* Patient History */}
            {patientId && (
              <div className="border border-blue-200 rounded-lg p-2 bg-blue-50/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    <Calendar className="h-4 w-4" />
                    Historial ({patientHistory.length} citas)
                  </div>
                  {loadingHistory && (
                    <div className="text-xs text-muted-foreground">Cargando...</div>
                  )}
                </div>
                
                {!loadingHistory && (
                  <div className="space-y-1.5">
                    {patientHistory.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic">
                        Sin citas anteriores
                      </div>
                    ) : (
                      <>
                        {patientHistory.slice(0, 3).map((appointment) => (
                          <div key={appointment.id} className="text-xs">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium">{appointment.title}</span>
                              {appointment.is_first_visit && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">1ra</Badge>
                              )}
                            </div>
                            <div className="text-muted-foreground pl-0">
                              {format(new Date(appointment.date), "dd/MM", { locale: es })} • Dr. {appointment.doctor_nombre}
                            </div>
                          </div>
                        ))}
                        {patientHistory.length > 3 && (
                          <div className="text-xs text-center text-muted-foreground pt-1 border-t border-blue-200">
                            +{patientHistory.length - 3} más
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* First visit checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="first-visit"
                checked={isFirstVisit}
                onCheckedChange={(checked) => setIsFirstVisit(checked === true)}
                disabled={patientHistory.length > 0}
              />
              <Label
                htmlFor="first-visit"
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  patientHistory.length > 0 && "text-muted-foreground"
                )}
              >
                Es la primera visita del paciente
                {patientHistory.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (El paciente ya tiene {patientHistory.length} cita{patientHistory.length > 1 ? 's' : ''} anterior{patientHistory.length > 1 ? 'es' : ''})
                  </span>
                )}
              </Label>
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