-- =========================================
-- MIGRATION: Sistema de Ingresos para Consultorio Dental
-- Date: Current
-- Description: Crear estructura completa para registro de ingresos
-- =========================================

BEGIN;

-- 1. Actualizar tabla doctores para incluir porcentaje de comisión
ALTER TABLE doctores 
ADD COLUMN IF NOT EXISTS porcentaje_comision NUMERIC(5,2) DEFAULT 0 CHECK (porcentaje_comision >= 0 AND porcentaje_comision <= 100);

COMMENT ON COLUMN doctores.porcentaje_comision IS 'Porcentaje de comisión por defecto del doctor (0-100)';

-- 2. Crear tabla de categorías de ingresos
CREATE TABLE IF NOT EXISTS categorias_ingreso (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    consultorio_id UUID REFERENCES consultorios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(nombre, consultorio_id)
);

-- Insertar categorías por defecto
INSERT INTO categorias_ingreso (nombre, descripcion) VALUES
    ('Tratamiento', 'Ingresos por servicios de tratamiento dental'),
    ('Consulta', 'Ingresos por consultas y evaluaciones'),
    ('Producto', 'Venta de productos dentales'),
    ('Otro', 'Otros tipos de ingresos')
ON CONFLICT DO NOTHING;

-- 3. Crear tabla principal de ingresos
CREATE TABLE IF NOT EXISTS ingresos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Referencias principales
    consultorio_id UUID REFERENCES consultorios(id) ON DELETE CASCADE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctores(id) ON DELETE SET NULL,
    categoria_id UUID REFERENCES categorias_ingreso(id) ON DELETE SET NULL,
    
    -- Referencias opcionales para trazabilidad
    plan_tratamiento_id UUID REFERENCES planes_tratamiento(id) ON DELETE SET NULL,
    servicio_progreso_id UUID REFERENCES servicios_progreso(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Detalles del ingreso
    concepto TEXT NOT NULL,
    descripcion TEXT,
    monto_total NUMERIC(10,2) NOT NULL CHECK (monto_total > 0),
    
    -- Información del doctor/comisión
    porcentaje_comision NUMERIC(5,2) DEFAULT 0 CHECK (porcentaje_comision >= 0 AND porcentaje_comision <= 100),
    monto_comision NUMERIC(10,2) GENERATED ALWAYS AS (monto_total * porcentaje_comision / 100) STORED,
    
    -- Fechas
    fecha_servicio DATE NOT NULL,
    
    -- Estado
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado_parcial', 'pagado_total', 'cancelado')),
    
    -- Metadata
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    -- Índices para búsquedas rápidas
    INDEX idx_ingresos_consultorio (consultorio_id),
    INDEX idx_ingresos_paciente (paciente_id),
    INDEX idx_ingresos_doctor (doctor_id),
    INDEX idx_ingresos_fecha (fecha_servicio),
    INDEX idx_ingresos_estado (estado)
);

-- 4. Crear tabla de pagos (permite múltiples pagos por ingreso)
CREATE TABLE IF NOT EXISTS pagos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Referencia al ingreso
    ingreso_id UUID REFERENCES ingresos(id) ON DELETE CASCADE NOT NULL,
    
    -- Detalles del pago
    monto NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'cheque', 'otro')),
    referencia TEXT, -- Número de transacción, cheque, etc.
    
    -- Fechas
    fecha_pago DATE NOT NULL,
    
    -- Estado
    estado TEXT DEFAULT 'completado' CHECK (estado IN ('pendiente', 'completado', 'rechazado', 'cancelado')),
    
    -- Metadata
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    -- Índices
    INDEX idx_pagos_ingreso (ingreso_id),
    INDEX idx_pagos_fecha (fecha_pago),
    INDEX idx_pagos_metodo (metodo_pago)
);

-- 5. Crear vista para obtener resumen de ingresos con pagos
CREATE OR REPLACE VIEW vw_ingresos_detalle AS
SELECT 
    i.id,
    i.consultorio_id,
    i.concepto,
    i.descripcion,
    i.monto_total,
    i.porcentaje_comision,
    i.monto_comision,
    i.fecha_servicio,
    i.estado,
    i.notas,
    -- Información del paciente
    p.nombre_completo as paciente_nombre,
    p.id as paciente_id,
    -- Información del doctor
    d.nombre_completo as doctor_nombre,
    d.id as doctor_id,
    -- Categoría
    ci.nombre as categoria,
    -- Cálculo de pagos
    COALESCE(SUM(pg.monto) FILTER (WHERE pg.estado = 'completado'), 0) as total_pagado,
    i.monto_total - COALESCE(SUM(pg.monto) FILTER (WHERE pg.estado = 'completado'), 0) as saldo_pendiente,
    -- Información adicional
    i.plan_tratamiento_id,
    i.servicio_progreso_id,
    i.appointment_id,
    i.created_at,
    i.updated_at
FROM ingresos i
LEFT JOIN pacientes p ON i.paciente_id = p.id
LEFT JOIN doctores d ON i.doctor_id = d.id
LEFT JOIN categorias_ingreso ci ON i.categoria_id = ci.id
LEFT JOIN pagos pg ON i.id = pg.ingreso_id
GROUP BY 
    i.id, i.consultorio_id, i.concepto, i.descripcion, i.monto_total,
    i.porcentaje_comision, i.monto_comision, i.fecha_servicio, i.estado,
    i.notas, p.nombre_completo, p.id, d.nombre_completo, d.id, ci.nombre,
    i.plan_tratamiento_id, i.servicio_progreso_id, i.appointment_id,
    i.created_at, i.updated_at;

-- 6. Crear vista para resumen mensual de ingresos
CREATE OR REPLACE VIEW vw_ingresos_mensuales AS
SELECT 
    DATE_TRUNC('month', i.fecha_servicio) as mes,
    i.consultorio_id,
    ci.nombre as categoria,
    COUNT(DISTINCT i.id) as total_transacciones,
    SUM(i.monto_total) as monto_total,
    SUM(COALESCE(pg.monto, 0)) as total_pagado,
    SUM(i.monto_total - COALESCE(pg.monto, 0)) as total_pendiente,
    SUM(i.monto_comision) as total_comisiones
FROM ingresos i
LEFT JOIN categorias_ingreso ci ON i.categoria_id = ci.id
LEFT JOIN (
    SELECT ingreso_id, SUM(monto) as monto 
    FROM pagos 
    WHERE estado = 'completado' 
    GROUP BY ingreso_id
) pg ON i.id = pg.ingreso_id
WHERE i.estado != 'cancelado'
GROUP BY DATE_TRUNC('month', i.fecha_servicio), i.consultorio_id, ci.nombre;

-- 7. Crear vista para comisiones por doctor
CREATE OR REPLACE VIEW vw_comisiones_doctores AS
SELECT 
    d.id as doctor_id,
    d.nombre_completo as doctor_nombre,
    d.consultorio_id,
    DATE_TRUNC('month', i.fecha_servicio) as mes,
    COUNT(DISTINCT i.id) as total_servicios,
    SUM(i.monto_total) as monto_total_servicios,
    SUM(i.monto_comision) as total_comisiones,
    AVG(i.porcentaje_comision) as porcentaje_promedio
FROM ingresos i
INNER JOIN doctores d ON i.doctor_id = d.id
WHERE i.estado IN ('pagado_parcial', 'pagado_total')
GROUP BY d.id, d.nombre_completo, d.consultorio_id, DATE_TRUNC('month', i.fecha_servicio);

-- 8. Triggers para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ingresos_updated_at BEFORE UPDATE ON ingresos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_ingreso_updated_at BEFORE UPDATE ON categorias_ingreso
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Trigger para actualizar estado del ingreso basado en pagos
CREATE OR REPLACE FUNCTION update_ingreso_estado()
RETURNS TRIGGER AS $$
DECLARE
    v_total_pagado NUMERIC;
    v_monto_total NUMERIC;
BEGIN
    -- Calcular total pagado
    SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
    FROM pagos
    WHERE ingreso_id = NEW.ingreso_id AND estado = 'completado';
    
    -- Obtener monto total del ingreso
    SELECT monto_total INTO v_monto_total
    FROM ingresos
    WHERE id = NEW.ingreso_id;
    
    -- Actualizar estado del ingreso
    UPDATE ingresos
    SET estado = CASE
        WHEN v_total_pagado = 0 THEN 'pendiente'
        WHEN v_total_pagado < v_monto_total THEN 'pagado_parcial'
        WHEN v_total_pagado >= v_monto_total THEN 'pagado_total'
    END
    WHERE id = NEW.ingreso_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ingreso_estado_after_pago
    AFTER INSERT OR UPDATE OR DELETE ON pagos
    FOR EACH ROW EXECUTE FUNCTION update_ingreso_estado();

-- 10. Función para crear ingreso desde servicio completado
CREATE OR REPLACE FUNCTION crear_ingreso_desde_servicio(
    p_servicio_progreso_id UUID,
    p_monto NUMERIC,
    p_doctor_id UUID,
    p_porcentaje_comision NUMERIC DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_ingreso_id UUID;
    v_servicio RECORD;
    v_plan RECORD;
    v_tratamiento RECORD;
    v_doctor RECORD;
BEGIN
    -- Obtener información del servicio
    SELECT sp.*, pt.paciente_id, pt.consultorio_id
    INTO v_servicio
    FROM servicios_progreso sp
    JOIN planes_tratamiento pt ON sp.plan_id = pt.id
    WHERE sp.id = p_servicio_progreso_id;
    
    -- Obtener información del tratamiento
    SELECT zt.nombre_tratamiento, s.nombre_servicio
    INTO v_tratamiento
    FROM zona_tratamientos zt
    LEFT JOIN servicios s ON zt.servicio_id = s.id
    WHERE zt.id = v_servicio.zona_tratamiento_id;
    
    -- Obtener porcentaje de comisión del doctor si no se especifica
    IF p_porcentaje_comision IS NULL THEN
        SELECT porcentaje_comision INTO p_porcentaje_comision
        FROM doctores
        WHERE id = p_doctor_id;
    END IF;
    
    -- Crear el ingreso
    INSERT INTO ingresos (
        consultorio_id,
        paciente_id,
        doctor_id,
        categoria_id,
        plan_tratamiento_id,
        servicio_progreso_id,
        concepto,
        monto_total,
        porcentaje_comision,
        fecha_servicio,
        estado
    ) VALUES (
        v_servicio.consultorio_id,
        v_servicio.paciente_id,
        p_doctor_id,
        (SELECT id FROM categorias_ingreso WHERE nombre = 'Tratamiento' AND consultorio_id = v_servicio.consultorio_id LIMIT 1),
        v_servicio.plan_id,
        p_servicio_progreso_id,
        COALESCE(v_tratamiento.nombre_servicio, v_tratamiento.nombre_tratamiento),
        p_monto,
        COALESCE(p_porcentaje_comision, 0),
        CURRENT_DATE,
        'pendiente'
    ) RETURNING id INTO v_ingreso_id;
    
    RETURN v_ingreso_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Índices adicionales para optimización
CREATE INDEX idx_ingresos_fecha_consultorio ON ingresos(fecha_servicio, consultorio_id);
CREATE INDEX idx_pagos_fecha_estado ON pagos(fecha_pago, estado);

-- 12. Comentarios en las tablas
COMMENT ON TABLE ingresos IS 'Registro de todos los ingresos del consultorio';
COMMENT ON TABLE pagos IS 'Registro de pagos asociados a cada ingreso';
COMMENT ON TABLE categorias_ingreso IS 'Categorías para clasificar los tipos de ingresos';

COMMIT;

-- =========================================
-- ROLLBACK SCRIPT (en caso de necesitar revertir)
-- =========================================
-- DROP VIEW IF EXISTS vw_comisiones_doctores;
-- DROP VIEW IF EXISTS vw_ingresos_mensuales;
-- DROP VIEW IF EXISTS vw_ingresos_detalle;
-- DROP FUNCTION IF EXISTS crear_ingreso_desde_servicio;
-- DROP FUNCTION IF EXISTS update_ingreso_estado;
-- DROP TRIGGER IF EXISTS update_ingreso_estado_after_pago ON pagos;
-- DROP TABLE IF EXISTS pagos;
-- DROP TABLE IF EXISTS ingresos;
-- DROP TABLE IF EXISTS categorias_ingreso;
-- ALTER TABLE doctores DROP COLUMN IF EXISTS porcentaje_comision; 