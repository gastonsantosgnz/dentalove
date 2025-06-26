-- =========================================
-- MIGRATION: Add is_first_visit to appointments table
-- =========================================
-- 
-- INSTRUCTIONS:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. After running successfully, follow the code changes below
-- 3. Test the functionality
--
-- =========================================

-- Add is_first_visit column to appointments table
ALTER TABLE appointments 
ADD COLUMN is_first_visit BOOLEAN DEFAULT false;

-- Add comment to document the column
COMMENT ON COLUMN appointments.is_first_visit IS 'Indicates if this is the patient''s first visit';

-- Create index for performance (optional, if we need to query by this field frequently)
CREATE INDEX idx_appointments_first_visit ON appointments(is_first_visit) WHERE is_first_visit = true;

-- =========================================
-- POST-MIGRATION CODE CHANGES NEEDED:
-- =========================================
--
-- After running this migration, uncomment the following lines in appointmentsService.ts:
--
-- In createAppointment function:
-- insertData.is_first_visit = appointment.is_first_visit || false
--
-- In updateAppointment function:  
-- updateData.is_first_visit = appointment.is_first_visit
--
-- In getAppointments function:
-- is_first_visit: item.is_first_visit,
-- (and remove the line: is_first_visit: false)
--
-- ========================================= 