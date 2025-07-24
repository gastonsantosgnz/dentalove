-- MEJORAS PARA RELACIONES ESPECÍFICAS EN GASTOS
-- Agregar campos de relación para doctores, proveedores y laboratorios

-- 1. AGREGAR CAMPOS DE RELACIÓN A LA TABLA GASTOS
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctores(id);
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS proveedor_id UUID; -- Para futura tabla de proveedores
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS laboratorio_id UUID; -- Para futura tabla de laboratorios

-- 2. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_gastos_doctor_id ON gastos(doctor_id);
CREATE INDEX IF NOT EXISTS idx_gastos_proveedor_id ON gastos(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_gastos_laboratorio_id ON gastos(laboratorio_id);

-- 3. COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON COLUMN gastos.doctor_id IS 'ID del doctor si el gasto es una comisión o pago a doctor específico';
COMMENT ON COLUMN gastos.proveedor_id IS 'ID del proveedor si el gasto es a un proveedor registrado (futura tabla proveedores)';
COMMENT ON COLUMN gastos.laboratorio_id IS 'ID del laboratorio si el gasto es a un laboratorio registrado (futura tabla laboratorios)';

-- 4. FUNCIÓN PARA ACTUALIZAR GASTOS EXISTENTES CON DOCTOR_ID
CREATE OR REPLACE FUNCTION actualizar_doctor_ids_existentes()
RETURNS void AS $$
DECLARE
    gasto_record RECORD;
    doctor_record RECORD;
BEGIN
    -- Buscar gastos de comisiones doctores que no tengan doctor_id
    FOR gasto_record IN 
        SELECT g.id, g.proveedor_beneficiario
        FROM gastos g
        INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
        WHERE LOWER(sc.nombre) LIKE '%comision%' 
          AND LOWER(sc.nombre) LIKE '%doctor%'
          AND g.doctor_id IS NULL
          AND g.proveedor_beneficiario IS NOT NULL
    LOOP
        -- Buscar doctor que coincida con el nombre
        SELECT id INTO doctor_record
        FROM doctores 
        WHERE nombre_completo = gasto_record.proveedor_beneficiario
        LIMIT 1;
        
        -- Actualizar el gasto con el doctor_id si se encontró coincidencia
        IF doctor_record.id IS NOT NULL THEN
            UPDATE gastos 
            SET doctor_id = doctor_record.id
            WHERE id = gasto_record.id;
            
            RAISE NOTICE 'Actualizado gasto % con doctor_id %', gasto_record.id, doctor_record.id;
        ELSE
            RAISE NOTICE 'No se encontró doctor para: %', gasto_record.proveedor_beneficiario;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. VISTA MEJORADA CON INFORMACIÓN DE DOCTORES
CREATE OR REPLACE VIEW vista_gastos_detalle_mejorada AS
SELECT 
    g.*,
    sc.nombre as subcategoria_nombre,
    c.nombre as categoria_nombre,
    c.tipo as categoria_tipo,
    c.icono as categoria_icono,
    c.color as categoria_color,
    u.email as usuario_email,
    COALESCE(p.nombre || ' ' || p.apellido, u.email) as usuario_nombre,
    -- INFORMACIÓN DEL DOCTOR (si aplica)
    d.id as doctor_relacion_id,
    d.nombre_completo as doctor_nombre,
    d.especialidad as doctor_especialidad,
    d.porcentaje_comision as doctor_porcentaje_comision,
    -- CAMPOS CALCULADOS
    CASE 
        WHEN g.doctor_id IS NOT NULL THEN 'Doctor Específico'
        WHEN g.proveedor_id IS NOT NULL THEN 'Proveedor Específico'
        WHEN g.laboratorio_id IS NOT NULL THEN 'Laboratorio Específico'
        ELSE 'Beneficiario General'
    END as tipo_beneficiario
FROM gastos g
INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
INNER JOIN categorias_gastos c ON sc.categoria_id = c.id
LEFT JOIN auth.users u ON g.usuario_id = u.id
LEFT JOIN perfiles_usuario p ON u.id = p.id
LEFT JOIN doctores d ON g.doctor_id = d.id;

-- 6. FUNCIÓN PARA REPORTES DE COMISIONES POR DOCTOR
CREATE OR REPLACE FUNCTION reporte_comisiones_doctor(
    p_consultorio_id UUID,
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    doctor_id UUID,
    doctor_nombre TEXT,
    especialidad TEXT,
    total_comisiones DECIMAL,
    cantidad_pagos INTEGER,
    promedio_comision DECIMAL,
    porcentaje_comision_doctor NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id as doctor_id,
        d.nombre_completo as doctor_nombre,
        d.especialidad,
        COALESCE(SUM(g.monto), 0) as total_comisiones,
        COUNT(g.id)::INTEGER as cantidad_pagos,
        COALESCE(AVG(g.monto), 0) as promedio_comision,
        d.porcentaje_comision as porcentaje_comision_doctor
    FROM doctores d
    LEFT JOIN gastos g ON d.id = g.doctor_id
    LEFT JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
    WHERE d.consultorio_id = p_consultorio_id
      AND (g.fecha IS NULL OR (g.fecha >= p_fecha_inicio AND g.fecha <= p_fecha_fin))
      AND (g.estado IS NULL OR g.estado != 'cancelado')
      AND (sc.nombre IS NULL OR (LOWER(sc.nombre) LIKE '%comision%' AND LOWER(sc.nombre) LIKE '%doctor%'))
    GROUP BY d.id, d.nombre_completo, d.especialidad, d.porcentaje_comision
    ORDER BY total_comisiones DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. PREPARACIÓN PARA FUTURAS TABLAS

-- Tabla de Proveedores (estructura propuesta)
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultorio_id UUID NOT NULL REFERENCES consultorios(id) ON DELETE CASCADE,
    nombre_comercial VARCHAR(200) NOT NULL,
    nombre_fiscal VARCHAR(200),
    rfc VARCHAR(13),
    contacto_principal VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    categoria_proveedor VARCHAR(50), -- 'Material Dental', 'Servicios', 'Equipamiento', etc.
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(consultorio_id, nombre_comercial)
);

-- Tabla de Laboratorios (estructura propuesta)  
CREATE TABLE IF NOT EXISTS laboratorios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultorio_id UUID NOT NULL REFERENCES consultorios(id) ON DELETE CASCADE,
    nombre_laboratorio VARCHAR(200) NOT NULL,
    nombre_fiscal VARCHAR(200),
    rfc VARCHAR(13),
    contacto_principal VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    especialidades TEXT[], -- ['Prótesis', 'Ortodoncia', 'Implantes']
    tiempo_entrega_promedio INTEGER, -- días
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(consultorio_id, nombre_laboratorio)
);

-- 8. AGREGAR FOREIGN KEYS PARA LAS FUTURAS TABLAS
-- (Se ejecutarán cuando se creen las tablas)
-- ALTER TABLE gastos ADD CONSTRAINT fk_gastos_proveedor 
--     FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
-- 
-- ALTER TABLE gastos ADD CONSTRAINT fk_gastos_laboratorio 
--     FOREIGN KEY (laboratorio_id) REFERENCES laboratorios(id);

-- 9. TRIGGER PARA MANTENER CONSISTENCIA EN TIPO_BENEFICIARIO
CREATE OR REPLACE FUNCTION actualizar_tipo_beneficiario()
RETURNS TRIGGER AS $$
BEGIN
    -- Lógica para mantener consistencia entre los campos de relación
    -- Solo uno de doctor_id, proveedor_id, laboratorio_id debería estar lleno
    
    IF NEW.doctor_id IS NOT NULL AND (NEW.proveedor_id IS NOT NULL OR NEW.laboratorio_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Un gasto no puede tener múltiples tipos de beneficiarios específicos';
    END IF;
    
    IF NEW.proveedor_id IS NOT NULL AND (NEW.doctor_id IS NOT NULL OR NEW.laboratorio_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Un gasto no puede tener múltiples tipos de beneficiarios específicos';
    END IF;
    
    IF NEW.laboratorio_id IS NOT NULL AND (NEW.doctor_id IS NOT NULL OR NEW.proveedor_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Un gasto no puede tener múltiples tipos de beneficiarios específicos';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_consistencia_beneficiario
    BEFORE INSERT OR UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION actualizar_tipo_beneficiario(); 