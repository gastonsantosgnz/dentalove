-- Script SQL para implementar múltiples versiones de planes de tratamiento en Supabase

-- 1. Crear la tabla para almacenar las versiones del plan
CREATE TABLE IF NOT EXISTS plan_versiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES planes_tratamiento(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT false,
  costo_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Agregar índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_plan_versiones_plan_id ON plan_versiones(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_versiones_activa ON plan_versiones(activa);

-- 3. Modificar la tabla plan_zonas para referenciar a una versión específica
ALTER TABLE plan_zonas ADD COLUMN IF NOT EXISTS version_id UUID REFERENCES plan_versiones(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_plan_zonas_version_id ON plan_zonas(version_id);

-- 4. Crear trigger para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_plan_versiones
BEFORE UPDATE ON plan_versiones
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 5. Migración de datos existentes (si hay planes anteriores)
-- Primero, crear una versión "Versión 1" para cada plan existente
DO $$
DECLARE
  plan_record RECORD;
BEGIN
  FOR plan_record IN SELECT id, costo_total FROM planes_tratamiento WHERE id NOT IN (
    SELECT DISTINCT plan_id FROM plan_versiones
  ) LOOP
    -- Insertar versión para cada plan existente
    INSERT INTO plan_versiones (plan_id, nombre, activa, costo_total)
    VALUES (plan_record.id, 'Versión 1', TRUE, plan_record.costo_total);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. Actualizar las zonas existentes para referenciar a sus versiones
DO $$
DECLARE
  zona_record RECORD;
  version_id UUID;
BEGIN
  FOR zona_record IN SELECT pz.id AS zona_id, pz.plan_id 
    FROM plan_zonas pz 
    WHERE pz.version_id IS NULL LOOP
    
    -- Buscar la versión activa para este plan
    SELECT id INTO version_id 
    FROM plan_versiones 
    WHERE plan_id = zona_record.plan_id AND activa = TRUE
    LIMIT 1;
    
    -- Si existe una versión, asociarla con esta zona
    IF version_id IS NOT NULL THEN
      UPDATE plan_zonas 
      SET version_id = version_id 
      WHERE id = zona_record.zona_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Función para asegurar que solo haya una versión activa por plan
CREATE OR REPLACE FUNCTION ensure_single_active_version() 
RETURNS TRIGGER AS $$
BEGIN
  -- Si estamos activando una versión, desactivar todas las demás del mismo plan
  IF NEW.activa = TRUE THEN
    UPDATE plan_versiones 
    SET activa = FALSE 
    WHERE plan_id = NEW.plan_id 
      AND id != NEW.id 
      AND activa = TRUE;
  END IF;
  
  -- Asegurar que existe al menos una versión activa por plan
  IF NOT EXISTS (
    SELECT 1 FROM plan_versiones 
    WHERE plan_id = NEW.plan_id AND activa = TRUE
  ) THEN
    -- Si no hay versión activa, activar esta
    NEW.activa := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_active_version
BEFORE INSERT OR UPDATE ON plan_versiones
FOR EACH ROW
EXECUTE FUNCTION ensure_single_active_version();

-- 8. Crear una política RLS para que solo el propietario pueda acceder a sus versiones
ALTER TABLE plan_versiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver y editar sus propias versiones" ON plan_versiones
  USING (
    EXISTS (
      SELECT 1 FROM planes_tratamiento pt
      JOIN pacientes p ON pt.paciente_id = p.id
      WHERE pt.id = plan_versiones.plan_id
      AND p.user_id = auth.uid()
    )
  ); 