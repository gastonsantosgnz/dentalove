"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, User } from "lucide-react"
import { getAppointments } from "@/lib/appointmentsService"
import { getPatientTreatmentPlans } from "@/lib/planes/planesTratamientoService"

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
  date: Date
  time: string
  patient_id: string
  doctor_id: string
  plan_tratamiento_id?: string
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
  plan_nombre?: string
  notes?: string
  is_first_visit?: boolean
}

interface AddAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (appointment: Appointment) => Promise<void>
  patients: Array<{ id: string, nombre_completo: string }>
  doctors: Array<{ id: string, nombre_completo: string }>
  consultorioId: string
  initialDate?: Date | null
  initialTime?: string | null
}

export function AddAppointmentDialog({
  open,
  onOpenChange,
  onSubmit,
  patients,
  doctors,
  consultorioId,
  initialDate,
  initialTime
}: AddAppointmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date())
  const [time, setTime] = useState("09:00")
  const [patientId, setPatientId] = useState("")
  const [doctorId, setDoctorId] = useState("")
  const [planTratamientoId, setPlanTratamientoId] = useState("")
  const [notes, setNotes] = useState("")
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [patientHistory, setPatientHistory] = useState<PatientHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [patientPlans, setPatientPlans] = useState<Array<{ id: string, nombre: string, fecha: string }>>([])
  const [loadingPlans, setLoadingPlans] = useState(false)

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
          plan_nombre: apt.plan_nombre || 'Plan no especificado',
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

  // Load patient treatment plans when a patient is selected
  const loadPatientPlans = async (selectedPatientId: string) => {
    if (!selectedPatientId) {
      setPatientPlans([])
      setPlanTratamientoId("")
      return
    }

    setLoadingPlans(true)
    try {
      const plans = await getPatientTreatmentPlans(selectedPatientId)
      const formattedPlans = plans.map(plan => ({
        id: String(plan.id || ''),
        nombre: `Plan ${new Date(String(plan.fecha || '')).toLocaleDateString()}`,
        fecha: String(plan.fecha || '')
      }))
      
      setPatientPlans(formattedPlans)
      
      // Si no hay planes, marcar como primera visita automáticamente
      if (formattedPlans.length === 0) {
        setIsFirstVisit(true)
        setPlanTratamientoId("")
      } else {
        setIsFirstVisit(false)
        // Auto-seleccionar el plan más reciente si solo hay uno
        if (formattedPlans.length === 1) {
          setPlanTratamientoId(formattedPlans[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading patient plans:", error)
      setPatientPlans([])
      setPlanTratamientoId("")
      setIsFirstVisit(true)
    } finally {
      setLoadingPlans(false)
    }
  }

  // Effect to load history and plans when patient changes
  useEffect(() => {
    if (patientId && open) {
      loadPatientHistory(patientId)
      loadPatientPlans(patientId)
    } else {
      setPatientHistory([])
      setPatientPlans([])
      setPlanTratamientoId("")
    }
  }, [patientId, open])

  // Effect to manage first visit logic based on plans
  useEffect(() => {
    if (patientPlans.length > 0) {
      setIsFirstVisit(false)
    } else if (patientId && patientPlans.length === 0 && !loadingPlans) {
      setIsFirstVisit(true)
    }
  }, [patientPlans.length, patientId, loadingPlans])

  // Effect to update selected date when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate)
    }
  }, [initialDate])

  // Effect to update selected time when initialTime changes
  useEffect(() => {
    if (initialTime) {
      setTime(initialTime)
    }
  }, [initialTime])

  // Effect to preselect patient when only one is provided
  useEffect(() => {
    if (patients.length === 1 && !patientId) {
      setPatientId(patients[0].id)
    }
  }, [patients, patientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Para primera visita no se requiere plan de tratamiento
    // Para citas de seguimiento sí se requiere
    if (!selectedDate || !time || !patientId || !doctorId || !consultorioId) {
      return
    }
    
    // Si no es primera visita, debe tener un plan de tratamiento seleccionado
    if (!isFirstVisit && !planTratamientoId) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const appointment: Appointment = {
        date: selectedDate,
        time,
        patient_id: patientId,
        doctor_id: doctorId,
        plan_tratamiento_id: isFirstVisit ? undefined : planTratamientoId,
        consultorio_id: consultorioId,
        notes,
        is_first_visit: isFirstVisit
      }
      
      await onSubmit(appointment)
      
      // Reset form after successful submission
      setSelectedDate(new Date())
      setTime("09:00")
      setPatientId("")
      setDoctorId("")
      setPlanTratamientoId("")
      setNotes("")
      setIsFirstVisit(false)
      setPatientHistory([])
      setPatientPlans([])
      
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
                disabled={patientPlans.length > 0}
              />
              <Label
                htmlFor="first-visit"
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  patientPlans.length > 0 && "text-muted-foreground"
                )}
              >
                Es la primera visita del paciente
                {patientPlans.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (El paciente ya tiene {patientPlans.length} plan{patientPlans.length > 1 ? 'es' : ''} de tratamiento)
                  </span>
                )}
              </Label>
            </div>

            {/* Treatment Plan selection - only show if not first visit */}
            {!isFirstVisit && (
              <div className="grid gap-2">
                <Label htmlFor="plan">Plan de Tratamiento *</Label>
                {loadingPlans ? (
                  <div className="h-10 bg-slate-200 rounded-md animate-pulse"></div>
                ) : (
                  <Select value={planTratamientoId} onValueChange={setPlanTratamientoId} required={!isFirstVisit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un plan de tratamiento" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[9999]" side="bottom" sideOffset={5}>
                      {patientPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {patientPlans.length === 0 && !loadingPlans && (
                  <p className="text-xs text-muted-foreground">
                    Este paciente no tiene planes de tratamiento. Marca como primera visita para continuar.
                  </p>
                )}
              </div>
            )}
            
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