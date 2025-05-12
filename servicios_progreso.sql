-- Crear tabla para el seguimiento del progreso de servicios de tratamiento
CREATE TABLE IF NOT EXISTS servicios_progreso (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones con otras tablas
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES planes_tratamiento(id) ON DELETE CASCADE,
  version_id UUID REFERENCES plan_versiones(id) ON DELETE CASCADE,
  zona_tratamiento_id UUID NOT NULL REFERENCES zona_tratamientos(id) ON DELETE CASCADE,
  
  -- Datos del progreso
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'completado', 'cancelado')) DEFAULT 'pendiente',
  fecha_realizacion TIMESTAMPTZ,
  monto_pagado NUMERIC DEFAULT 0,
  fecha_pago TIMESTAMPTZ,
  notas TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agregar índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_servicios_progreso_paciente ON servicios_progreso(paciente_id);
CREATE INDEX IF NOT EXISTS idx_servicios_progreso_plan ON servicios_progreso(plan_id);
CREATE INDEX IF NOT EXISTS idx_servicios_progreso_estado ON servicios_progreso(estado);

-- Trigger para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_servicios_progreso
BEFORE UPDATE ON servicios_progreso
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Función para registrar automáticamente todos los servicios como pendientes al crear un plan
CREATE OR REPLACE FUNCTION registrar_servicios_pendientes()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se crea una versión de plan, registrar todos sus servicios como pendientes
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'plan_versiones' THEN
    INSERT INTO servicios_progreso (paciente_id, plan_id, version_id, zona_tratamiento_id, estado)
    SELECT 
      (SELECT paciente_id FROM planes_tratamiento WHERE id = NEW.plan_id),
      NEW.plan_id,
      NEW.id,
      zt.id,
      'pendiente'
    FROM zona_tratamientos zt
    JOIN plan_zonas pz ON zt.zona_id = pz.id
    WHERE pz.version_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar servicios pendientes al crear una versión de plan
CREATE TRIGGER trigger_registrar_servicios_pendientes
AFTER INSERT ON plan_versiones
FOR EACH ROW
EXECUTE FUNCTION registrar_servicios_pendientes();

-- Vistas para facilitar consultas comunes
CREATE OR REPLACE VIEW vw_servicios_pendientes AS
SELECT 
  sp.id,
  p.nombre_completo as paciente,
  pt.fecha as fecha_plan,
  pv.nombre as version_plan,
  zt.nombre_tratamiento,
  zt.color,
  sp.estado,
  sp.monto_pagado,
  zt.servicio_id
FROM servicios_progreso sp
JOIN pacientes p ON sp.paciente_id = p.id
JOIN planes_tratamiento pt ON sp.plan_id = pt.id
JOIN plan_versiones pv ON sp.version_id = pv.id
JOIN zona_tratamientos zt ON sp.zona_tratamiento_id = zt.id
WHERE sp.estado = 'pendiente'
ORDER BY pt.fecha DESC;

CREATE OR REPLACE VIEW vw_servicios_completados AS
SELECT 
  sp.id,
  p.nombre_completo as paciente,
  pt.fecha as fecha_plan,
  pv.nombre as version_plan,
  zt.nombre_tratamiento,
  zt.color,
  sp.fecha_realizacion,
  sp.monto_pagado,
  sp.fecha_pago
FROM servicios_progreso sp
JOIN pacientes p ON sp.paciente_id = p.id
JOIN planes_tratamiento pt ON sp.plan_id = pt.id
JOIN plan_versiones pv ON sp.version_id = pv.id
JOIN zona_tratamientos zt ON sp.zona_tratamiento_id = zt.id
WHERE sp.estado = 'completado'
ORDER BY sp.fecha_realizacion DESC; 