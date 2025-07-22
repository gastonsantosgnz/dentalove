-- SQL para modificar la tabla appointments
-- Remover service_id y agregar campo booleano para primera visita

BEGIN;

-- 1. Agregar el nuevo campo booleano para primera visita
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS is_first_visit BOOLEAN DEFAULT false;

-- 2. Agregar consultorio_id si no existe
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS consultorio_id UUID REFERENCES consultorios(id) ON DELETE SET NULL;

-- 3. Eliminar la columna service_id (esto también eliminará cualquier constraint relacionado)
ALTER TABLE appointments 
DROP COLUMN IF EXISTS service_id;

-- 4. Agregar un campo para el plan de tratamiento si queremos relacionarlo directamente
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS plan_tratamiento_id UUID REFERENCES planes_tratamiento(id) ON DELETE SET NULL;

-- 5. Actualizar registros existentes para marcar como primera visita si no tienen historial previo
-- (Esto es opcional, puedes ejecutarlo si quieres limpiar datos existentes)
UPDATE appointments 
SET is_first_visit = true 
WHERE id IN (
    SELECT DISTINCT ON (patient_id) id 
    FROM appointments 
    ORDER BY patient_id, date ASC, time ASC
);

-- 6. Agregar comentarios para documentar los campos
COMMENT ON COLUMN appointments.is_first_visit IS 'Indica si esta es la primera visita del paciente';
COMMENT ON COLUMN appointments.plan_tratamiento_id IS 'Referencia al plan de tratamiento asociado (NULL para primeras visitas)';
COMMENT ON COLUMN appointments.consultorio_id IS 'Referencia al consultorio donde se realiza la cita';

COMMIT; 