"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "framer-motion"

import { FullScreenCalendar } from "@/components/ui/fullscreen-calendar"
import { AddAppointmentDialog } from "@/components/calendario/AddAppointmentDialog"
import { EditAppointmentDialog } from "@/components/calendario/EditAppointmentDialog"
import { Appointment, getAppointments, createAppointment, updateAppointment, deleteAppointment } from "@/lib/appointmentsService"
import { getPacientes } from "@/lib/pacientesService"
import { getDoctores } from "@/lib/doctoresService"
import { getServicios } from "@/lib/serviciosService"
import { useToast } from "@/components/ui/use-toast"
import { Paciente, Servicio } from "@/lib/database"
import { Doctor } from "@/lib/doctoresService"
import { useConsultorio } from "@/contexts/ConsultorioContext"


// Define the event interface for our calendar
interface CalendarEvent {
  id: number | string
  name: string
  time: string
  datetime: string
  patient?: string
  doctor?: string
  service?: string
  is_first_visit?: boolean
}

// Define calendar data structure for our component
interface CalendarDay {
  day: Date
  events: CalendarEvent[]
}

// Loading component
function CalendarioLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="text-sm text-muted-foreground">Cargando calendario...</p>
      </div>
    </div>
  )
}

// Error component
function CalendarioError({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Error al cargar el calendario</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

// No consultorio component
function NoConsultorio() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">No hay consultorio configurado</h2>
        <p className="text-muted-foreground">Necesitas configurar un consultorio para gestionar citas.</p>
      </div>
    </div>
  )
}

// Fetch server data
export default function CalendarioPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<CalendarDay[]>([])
  const [appointmentsData, setAppointmentsData] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Paciente[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [services, setServices] = useState<Servicio[]>([])
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([])
  const { toast } = useToast()
  const { consultorio, isLoading: consultorioLoading } = useConsultorio()

  // Load all data we need for the calendar
  const loadData = useCallback(async () => {
    if (!consultorio) return

    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch all appointments
      const appointmentsData = await getAppointments()
      
      // Fetch patients, doctors, and services for the dialog
      const patientsData = await getPacientes()
      const doctorsData = await getDoctores()
      const servicesData = await getServicios()
      
      // Transform appointment data for the calendar (sin filtro)
      const calendarData = transformAppointmentsToCalendarData(appointmentsData)
      
      setAppointments(calendarData)
      setAppointmentsData(appointmentsData)
      setPatients(patientsData)
      setDoctors(doctorsData)
      setServices(servicesData)
    } catch (error) {
      console.error("Error loading data:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del calendario",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, consultorio])
  
  // Transform appointments to calendar data
  function transformAppointmentsToCalendarData(appointments: Appointment[]): CalendarDay[] {
    
    // Group appointments by date
    const eventsByDate = appointments.reduce((acc: Record<string, CalendarEvent[]>, appointment) => {
      const dateStr = appointment.date
      if (!acc[dateStr]) {
        acc[dateStr] = []
      }
      
      acc[dateStr].push({
        id: appointment.id,
        name: appointment.title,
        time: appointment.time,
        datetime: `${appointment.date}T${appointment.time}`,
        patient: appointment.patient_nombre,
        doctor: appointment.doctor_nombre,
        service: appointment.service_nombre,
        is_first_visit: appointment.is_first_visit
      })
      
      return acc
    }, {})
    
    // Convert to calendar data format
    return Object.keys(eventsByDate).map(dateStr => ({
      day: parseISO(dateStr),
      events: eventsByDate[dateStr]
    }))
  }
  
  // Handle creating a new appointment
  const handleCreateAppointment = useCallback(async (appointmentData: any) => {
    if (!consultorio) return

    try {
      // Format the date for Supabase
      const formattedDate = format(appointmentData.date, "yyyy-MM-dd")
      
      // Create the appointment
      await createAppointment({
        ...appointmentData,
        date: formattedDate
      })
      
      toast({
        title: "Cita agendada",
        description: "La cita se ha agendado correctamente",
      })
      
      // Reload the data to update the calendar
      await loadData()
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: "No se pudo agendar la cita",
        variant: "destructive"
      })
    }
  }, [consultorio, loadData, toast])

  // Handle clicking on an event
  const handleEventClick = useCallback((event: any) => {
    // Find the full appointment data
    const fullAppointment = appointmentsData.find(apt => apt.id === event.id.toString())
    if (fullAppointment) {
      setSelectedAppointment(fullAppointment)
      setIsEditDialogOpen(true)
    }
  }, [appointmentsData])

  // Handle double-clicking on a day
  const handleDayDoubleClick = useCallback((date: Date) => {
    setSelectedDate(date)
    setIsAddDialogOpen(true)
  }, [])

  // Handle updating an appointment
  const handleUpdateAppointment = useCallback(async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      await updateAppointment(id, appointmentData)
      
      toast({
        title: "Cita actualizada",
        description: "La cita se ha actualizado correctamente",
      })
      
      // Reload the data to update the calendar
      await loadData()
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la cita",
        variant: "destructive"
      })
    }
  }, [loadData, toast])

  // Handle deleting an appointment
  const handleDeleteAppointment = useCallback(async (id: string) => {
    try {
      await deleteAppointment(id)
      
      toast({
        title: "Cita eliminada",
        description: "La cita se ha eliminado correctamente",
      })
      
      // Reload the data to update the calendar
      await loadData()
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita",
        variant: "destructive"
      })
    }
  }, [loadData, toast])

  // Handle doctor filter change
  const handleDoctorFilterChange = useCallback((doctorIds: string[]) => {
    setSelectedDoctorIds(doctorIds)
  }, [])

  // Filter appointments data based on selected doctors
  const filteredAppointments = useMemo(() => {
    if (selectedDoctorIds.length === 0) {
      return appointments
    }
    
    return appointments.map(calendarDay => ({
      ...calendarDay,
      events: calendarDay.events.filter(event => 
        selectedDoctorIds.some(doctorId => 
          appointmentsData.find(apt => 
            apt.id === event.id.toString() && apt.doctor_id === doctorId
          )
        )
      )
    })).filter(calendarDay => calendarDay.events.length > 0)
  }, [appointments, selectedDoctorIds, appointmentsData])
  
  // Load initial data on component mount
  useEffect(() => {
    if (!consultorioLoading && consultorio) {
      loadData()
    }
  }, [loadData, consultorioLoading, consultorio])

  // Show loading if consultorio is still loading
  if (consultorioLoading) {
    return <CalendarioLoading />
  }

  // Show message if no consultorio
  if (!consultorio) {
    return <NoConsultorio />
  }

  // Show error if there was an error loading data
  if (error) {
    return <CalendarioError message={error} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-screen w-full"
    >
      <div className="flex flex-col h-full">
        {isLoading ? (
          <CalendarioLoading />
        ) : (
          <FullScreenCalendar 
            data={filteredAppointments as any}
            onAddEvent={() => setIsAddDialogOpen(true)}
            onEventClick={handleEventClick}
            onDayDoubleClick={handleDayDoubleClick}
            doctors={doctors}
            selectedDoctorIds={selectedDoctorIds}
            onDoctorFilterChange={handleDoctorFilterChange}
          />
        )}
      </div>
      
      {/* Add appointment dialog */}
      <AddAppointmentDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) {
            setSelectedDate(null) // Reset selected date when dialog closes
          }
        }}
        onSubmit={handleCreateAppointment}
        patients={patients}
        doctors={doctors}
        services={services}
        consultorioId={consultorio.id}
        initialDate={selectedDate}
      />

      {/* Edit appointment dialog */}
      <EditAppointmentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        appointment={selectedAppointment}
        onUpdate={handleUpdateAppointment}
        onDelete={handleDeleteAppointment}
        patients={patients}
        doctors={doctors}
        services={services}
      />
    </motion.div>
  )
}
