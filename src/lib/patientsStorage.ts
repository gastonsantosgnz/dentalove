// Definición de la interfaz para el tipo Paciente
export interface Patient {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  celular: string;
  notas: string;
  tipoPaciente?: string;
}

// This module is deprecated - use pacientesService.ts instead, which uses Supabase
// All localStorage operations have been removed to ensure we only use Supabase

// Obtener todos los pacientes
export const getAllPatients = (): Patient[] => {
  console.warn('getAllPatients is deprecated - use getPacientes from pacientesService.ts instead');
  return [];
};

// Obtener un paciente específico por ID
export const getPatientById = (patientId: string): Patient | null => {
  console.warn('getPatientById is deprecated - use getPacienteById from pacientesService.ts instead');
  return null;
};

// Guardar un nuevo paciente o actualizar uno existente
export const savePatient = (patient: Patient): void => {
  console.warn('savePatient is deprecated - use createPaciente or updatePaciente from pacientesService.ts instead');
  throw new Error('This function is deprecated - use pacientesService.ts instead');
};

// Eliminar un paciente
export const deletePatient = (patientId: string): void => {
  console.warn('deletePatient is deprecated - use deletePaciente from pacientesService.ts instead');
  throw new Error('This function is deprecated - use pacientesService.ts instead');
}; 