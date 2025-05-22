"use client"

import { useState, useEffect, useCallback } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "framer-motion"

import { FullScreenCalendar } from "@/components/ui/fullscreen-calendar"
import { AddAppointmentDialog } from "@/components/calendario/AddAppointmentDialog"
import { Appointment, getAppointments, createAppointment } from "@/lib/appointmentsService"
import { getPacientes } from "@/lib/pacientesService"
import { getDoctores } from "@/lib/doctoresService"
import { getServicios } from "@/lib/serviciosService"
import { useToast } from "@/components/ui/use-toast"
import { Paciente, Servicio } from "@/lib/database"
import { Doctor } from "@/lib/doctoresService"

// Define the event interface for our calendar
interface CalendarEvent {
  id: number | string
  name: string
  time: string
  datetime: string
  patient?: string
  doctor?: string
  service?: string
}

// Define calendar data structure for our component
interface CalendarDay {
  day: Date
  events: CalendarEvent[]
}

// Fetch server data
export default function CalendarioPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState<CalendarDay[]>([])
  const [patients, setPatients] = useState<Paciente[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [services, setServices] = useState<Servicio[]>([])
  const { toast } = useToast()

  // Load all data we need for the calendar
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch all appointments
      const appointmentsData = await getAppointments()
      
      // Fetch patients, doctors, and services for the dialog
      const patientsData = await getPacientes()
      const doctorsData = await getDoctores()
      const servicesData = await getServicios()
      
      // Transform appointment data for the calendar
      const calendarData = transformAppointmentsToCalendarData(appointmentsData)
      
      setAppointments(calendarData)
      setPatients(patientsData)
      setDoctors(doctorsData)
      setServices(servicesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del calendario",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])
  
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
        service: appointment.service_nombre
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
  async function handleCreateAppointment(appointmentData: any) {
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
  }
  
  // Load initial data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-screen w-full"
    >
      <div className="flex flex-col h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <FullScreenCalendar 
            data={appointments as any}
            onAddEvent={() => setIsAddDialogOpen(true)}
          />
        )}
      </div>
      
      {/* Add appointment dialog */}
      <AddAppointmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleCreateAppointment}
        patients={patients}
        doctors={doctors}
        services={services}
      />
    </motion.div>
  )
}
