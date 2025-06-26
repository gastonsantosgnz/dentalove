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
  is_first_visit?: boolean
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
  // Prepare the insert data - temporarily exclude is_first_visit until DB migration
  const insertData: any = {
    title: appointment.title,
    date: appointment.date,
    time: appointment.time,
    patient_id: appointment.patient_id,
    doctor_id: appointment.doctor_id,
    service_id: appointment.service_id,
    consultorio_id: appointment.consultorio_id,
    notes: appointment.notes || null
  }

  // Only include is_first_visit if the column exists (after migration)
  // TODO: Uncomment this line after running the migration in Supabase
  // insertData.is_first_visit = appointment.is_first_visit || false

  const { data, error } = await supabase
    .from("appointments")
    .insert(insertData)
    .select()
    .single()
  
  if (error) {
    console.error("Error creating appointment:", error)
    throw new Error(`Error creating appointment: ${error.message}`)
  }
  
  // Temporary solution: store is_first_visit in localStorage until DB migration
  if (typeof window !== 'undefined' && appointment.is_first_visit) {
    const firstVisitData = JSON.parse(localStorage.getItem('appointment_first_visits') || '{}')
    firstVisitData[data.id] = appointment.is_first_visit
    localStorage.setItem('appointment_first_visits', JSON.stringify(firstVisitData))
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
  
  // Get temporary first visit data from localStorage
  const firstVisitData = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('appointment_first_visits') || '{}') 
    : {}

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
    // TODO: Uncomment this line after running the migration in Supabase
    // is_first_visit: item.is_first_visit,
    is_first_visit: firstVisitData[item.id] || false, // Read from localStorage until migration is run
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
  // Prepare the update data - temporarily exclude is_first_visit until DB migration
  const updateData: any = {
    title: appointment.title,
    date: appointment.date,
    time: appointment.time,
    patient_id: appointment.patient_id,
    doctor_id: appointment.doctor_id,
    service_id: appointment.service_id,
    consultorio_id: appointment.consultorio_id,
    notes: appointment.notes
  }

  // Only include is_first_visit if the column exists (after migration)
  // TODO: Uncomment this line after running the migration in Supabase
  // updateData.is_first_visit = appointment.is_first_visit

  // Temporary solution: store is_first_visit in localStorage until DB migration
  if (typeof window !== 'undefined' && appointment.is_first_visit !== undefined) {
    const firstVisitData = JSON.parse(localStorage.getItem('appointment_first_visits') || '{}')
    firstVisitData[id] = appointment.is_first_visit
    localStorage.setItem('appointment_first_visits', JSON.stringify(firstVisitData))
  }

  const { error } = await supabase
    .from("appointments")
    .update(updateData)
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