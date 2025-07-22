-- =========================================
-- MIGRATION: Update appointments table structure
-- Date: Current
-- Description: Remove service_id, add plan_tratamiento_id and is_first_visit
-- =========================================

-- IMPORTANT: Execute this SQL in your Supabase SQL Editor

BEGIN;

-- 1. Add the new boolean field for first visit (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'is_first_visit') THEN
        ALTER TABLE appointments ADD COLUMN is_first_visit BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_first_visit column';
    ELSE
        RAISE NOTICE 'Column is_first_visit already exists';
    END IF;
END $$;

-- 2. Add consultorio_id field (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'consultorio_id') THEN
        ALTER TABLE appointments ADD COLUMN consultorio_id UUID REFERENCES consultorios(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added consultorio_id column';
    ELSE
        RAISE NOTICE 'Column consultorio_id already exists';
    END IF;
END $$;

-- 3. Add plan_tratamiento_id field (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'plan_tratamiento_id') THEN
        ALTER TABLE appointments ADD COLUMN plan_tratamiento_id UUID REFERENCES planes_tratamiento(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added plan_tratamiento_id column';
    ELSE
        RAISE NOTICE 'Column plan_tratamiento_id already exists';
    END IF;
END $$;

-- 4. Remove service_id column (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'appointments' AND column_name = 'service_id') THEN
        ALTER TABLE appointments DROP COLUMN service_id;
        RAISE NOTICE 'Removed service_id column';
    ELSE
        RAISE NOTICE 'Column service_id does not exist';
    END IF;
END $$;

-- 5. Update existing records to mark first visits
-- This marks the earliest appointment for each patient as first visit
UPDATE appointments 
SET is_first_visit = true 
WHERE id IN (
    SELECT DISTINCT ON (patient_id) id 
    FROM appointments 
    ORDER BY patient_id, date ASC, time ASC
);

-- 6. Add helpful comments
COMMENT ON COLUMN appointments.is_first_visit IS 'Indicates if this is the patient''s first visit';
COMMENT ON COLUMN appointments.plan_tratamiento_id IS 'Reference to treatment plan (NULL for first visits)';
COMMENT ON COLUMN appointments.consultorio_id IS 'Reference to the clinic where the appointment takes place';

-- 7. Create useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_first_visit ON appointments(is_first_visit) WHERE is_first_visit = true;
CREATE INDEX IF NOT EXISTS idx_appointments_plan_tratamiento ON appointments(plan_tratamiento_id) WHERE plan_tratamiento_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_consultorio ON appointments(consultorio_id) WHERE consultorio_id IS NOT NULL;

COMMIT;

-- =========================================
-- VERIFICATION QUERIES (run these after the migration)
-- =========================================

-- Check the new table structure
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'appointments' 
-- ORDER BY ordinal_position;

-- Check first visit appointments
-- SELECT COUNT(*) as first_visits FROM appointments WHERE is_first_visit = true;

-- Check appointments with treatment plans
-- SELECT COUNT(*) as with_plans FROM appointments WHERE plan_tratamiento_id IS NOT NULL; 