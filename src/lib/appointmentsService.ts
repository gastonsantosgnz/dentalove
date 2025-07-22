import { supabase } from "@/lib/supabase"

// Define the appointment interface
export interface Appointment {
  id: string
  title: string
  date: string
  time: string
  patient_id: string
  doctor_id: string
  plan_tratamiento_id?: string | null
  consultorio_id: string
  notes?: string
  is_first_visit?: boolean
  created_at: string
  updated_at: string
  
  // Relations (optional for joined queries)
  patient_nombre?: string
  doctor_nombre?: string
  plan_nombre?: string
}

// Create a new appointment
export async function createAppointment(appointment: Omit<Appointment, "id" | "created_at" | "updated_at">): Promise<Appointment> {
  const insertData = {
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      plan_tratamiento_id: appointment.plan_tratamiento_id || null,
      consultorio_id: appointment.consultorio_id,
      notes: appointment.notes || null,
      is_first_visit: appointment.is_first_visit || false
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert(insertData)
    .select()
    .single()
  
  if (error) {
    console.error("Error creating appointment:", error)
    throw new Error(`Error creating appointment: ${error.message}`)
  }
  
  return data as unknown as Appointment
}

// Get all appointments 
export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      patient:patient_id(nombre_completo),
      doctor:doctor_id(nombre_completo),
      plan:plan_tratamiento_id(fecha)
    `)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
  
  if (error) {
    console.error("Error fetching appointments:", error)
    throw new Error(`Error fetching appointments: ${error.message}`)
  }
  
  // Transform the data to match our Appointment interface
  return (data || []).map(item => ({
    id: String(item.id || ''),
    title: String(item.title || ''),
    date: String(item.date || ''),
    time: String(item.time || ''),
    patient_id: String(item.patient_id || ''),
    doctor_id: String(item.doctor_id || ''),
    plan_tratamiento_id: item.plan_tratamiento_id ? String(item.plan_tratamiento_id) : null,
    consultorio_id: String(item.consultorio_id || ''),
    notes: String(item.notes || ''),
    is_first_visit: Boolean(item.is_first_visit),
    created_at: String(item.created_at || ''),
    updated_at: String(item.updated_at || ''),
    patient_nombre: String((item.patient as any)?.nombre_completo || ''),
    doctor_nombre: String((item.doctor as any)?.nombre_completo || ''),
    plan_nombre: (item.plan as any)?.fecha ? `Plan ${new Date((item.plan as any).fecha).toLocaleDateString()}` : undefined
  }))
}

// Update an appointment
export async function updateAppointment(id: string, appointment: Partial<Appointment>): Promise<void> {
  const updateData = {
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      plan_tratamiento_id: appointment.plan_tratamiento_id,
      consultorio_id: appointment.consultorio_id,
      notes: appointment.notes,
      is_first_visit: appointment.is_first_visit
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