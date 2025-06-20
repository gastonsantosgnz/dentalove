import { supabase } from "@/lib/supabase"

// Define the appointment interface
export interface Appointment {
  id: string
  title: string
  date: string
  time: string
  patient_id: string
  doctor_id: string
  service_id: string
  consultorio_id: string
  notes?: string
  created_at: string
  updated_at: string
  
  // Relations (optional for joined queries)
  patient_nombre?: string
  doctor_nombre?: string
  service_nombre?: string
  service_duracion?: number
}

// Create a new appointment
export async function createAppointment(appointment: Omit<Appointment, "id" | "created_at" | "updated_at">): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      service_id: appointment.service_id,
      consultorio_id: appointment.consultorio_id,
      notes: appointment.notes || null
    })
    .select()
    .single()
  
  if (error) {
    console.error("Error creating appointment:", error)
    throw new Error(`Error creating appointment: ${error.message}`)
  }
  
  return data as Appointment
}

// Get all appointments 
export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      patient:patient_id(nombre_completo),
      doctor:doctor_id(nombre_completo),
      service:service_id(nombre_servicio, duracion)
    `)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
  
  if (error) {
    console.error("Error fetching appointments:", error)
    throw new Error(`Error fetching appointments: ${error.message}`)
  }
  
  // Transform the data to match our Appointment interface
  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    date: item.date,
    time: item.time,
    patient_id: item.patient_id,
    doctor_id: item.doctor_id,
    service_id: item.service_id,
    consultorio_id: item.consultorio_id,
    notes: item.notes,
    created_at: item.created_at,
    updated_at: item.updated_at,
    patient_nombre: item.patient?.nombre_completo,
    doctor_nombre: item.doctor?.nombre_completo,
    service_nombre: item.service?.nombre_servicio,
    service_duracion: item.service?.duracion
  }))
}

// Update an appointment
export async function updateAppointment(id: string, appointment: Partial<Appointment>): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update({
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      service_id: appointment.service_id,
      consultorio_id: appointment.consultorio_id,
      notes: appointment.notes
    })
    .eq("id", id)
  
  if (error) {
    console.error("Error updating appointment:", error)
    throw new Error(`Error updating appointment: ${error.message}`)
  }
}

// Delete an appointment
export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
  
  if (error) {
    console.error("Error deleting appointment:", error)
    throw new Error(`Error deleting appointment: ${error.message}`)
  }
} 