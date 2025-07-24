-- TABLA DE EMPLEADOS PARA SISTEMA DE GASTOS (VERSIÓN CORREGIDA)
-- Integración con gastos para subcategoría "Sueldos"

-- 1. CREAR TABLA DE EMPLEADOS
CREATE TABLE IF NOT EXISTS empleados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultorio_id UUID NOT NULL REFERENCES consultorios(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(200) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    departamento VARCHAR(100), -- 'Recepción', 'Asistencia', 'Administración', 'Limpieza', etc.
    salario_base DECIMAL(10, 2), -- Salario base mensual
    tipo_contrato VARCHAR(50) DEFAULT 'Indefinido', -- 'Indefinido', 'Temporal', 'Por Horas', etc.
    fecha_ingreso DATE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(consultorio_id, nombre_completo)
);

-- 2. AGREGAR CAMPO DE RELACIÓN A GASTOS
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS empleado_id UUID REFERENCES empleados(id);

-- 3. CREAR ÍNDICE PARA RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_gastos_empleado_id ON gastos(empleado_id);

-- 4. COMENTARIO PARA DOCUMENTACIÓN
COMMENT ON COLUMN gastos.empleado_id IS 'ID del empleado si el gasto es un sueldo o pago a empleado específico';

-- 5. ACTUALIZAR TRIGGER DE CONSISTENCIA PARA INCLUIR EMPLEADOS
CREATE OR REPLACE FUNCTION actualizar_tipo_beneficiario()
RETURNS TRIGGER AS $$
BEGIN
    -- Lógica para mantener consistencia entre los campos de relación
    -- Solo uno de doctor_id, proveedor_id, laboratorio_id, empleado_id debería estar lleno
    
    DECLARE
        campos_llenos INTEGER := 0;
    BEGIN
        IF NEW.doctor_id IS NOT NULL THEN campos_llenos := campos_llenos + 1; END IF;
        IF NEW.proveedor_id IS NOT NULL THEN campos_llenos := campos_llenos + 1; END IF;
        IF NEW.laboratorio_id IS NOT NULL THEN campos_llenos := campos_llenos + 1; END IF;
        IF NEW.empleado_id IS NOT NULL THEN campos_llenos := campos_llenos + 1; END IF;
        
        IF campos_llenos > 1 THEN
            RAISE EXCEPTION 'Un gasto no puede tener múltiples tipos de beneficiarios específicos';
        END IF;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. ELIMINAR VISTA EXISTENTE Y RECREARLA CON EMPLEADOS
DROP VIEW IF EXISTS vista_gastos_detalle_mejorada;

CREATE VIEW vista_gastos_detalle_mejorada AS
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
    -- INFORMACIÓN DEL EMPLEADO (si aplica)
    e.id as empleado_relacion_id,
    e.nombre_completo as empleado_nombre,
    e.puesto as empleado_puesto,
    e.departamento as empleado_departamento,
    e.salario_base as empleado_salario_base,
    -- CAMPOS CALCULADOS
    CASE 
        WHEN g.doctor_id IS NOT NULL THEN 'Doctor Específico'
        WHEN g.empleado_id IS NOT NULL THEN 'Empleado Específico'
        WHEN g.proveedor_id IS NOT NULL THEN 'Proveedor Específico'
        WHEN g.laboratorio_id IS NOT NULL THEN 'Laboratorio Específico'
        ELSE 'Beneficiario General'
    END as tipo_beneficiario
FROM gastos g
INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
INNER JOIN categorias_gastos c ON sc.categoria_id = c.id
LEFT JOIN auth.users u ON g.usuario_id = u.id
LEFT JOIN perfiles_usuario p ON u.id = p.id
LEFT JOIN doctores d ON g.doctor_id = d.id
LEFT JOIN empleados e ON g.empleado_id = e.id;

-- 7. FUNCIÓN PARA REPORTES DE SUELDOS POR EMPLEADO
CREATE OR REPLACE FUNCTION reporte_sueldos_empleado(
    p_consultorio_id UUID,
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    empleado_id UUID,
    empleado_nombre TEXT,
    puesto TEXT,
    departamento TEXT,
    salario_base DECIMAL,
    total_pagado DECIMAL,
    cantidad_pagos INTEGER,
    promedio_pago DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id as empleado_id,
        e.nombre_completo as empleado_nombre,
        e.puesto,
        e.departamento,
        e.salario_base,
        COALESCE(SUM(g.monto), 0) as total_pagado,
        COUNT(g.id)::INTEGER as cantidad_pagos,
        COALESCE(AVG(g.monto), 0) as promedio_pago
    FROM empleados e
    LEFT JOIN gastos g ON e.id = g.empleado_id
    LEFT JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
    WHERE e.consultorio_id = p_consultorio_id
      AND e.activo = true
      AND (g.fecha IS NULL OR (g.fecha >= p_fecha_inicio AND g.fecha <= p_fecha_fin))
      AND (g.estado IS NULL OR g.estado != 'cancelado')
      AND (sc.nombre IS NULL OR (LOWER(sc.nombre) LIKE '%sueldo%' OR LOWER(sc.nombre) LIKE '%salario%'))
    GROUP BY e.id, e.nombre_completo, e.puesto, e.departamento, e.salario_base
    ORDER BY total_pagado DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. FUNCIÓN PARA ACTUALIZAR GASTOS EXISTENTES CON EMPLEADO_ID
CREATE OR REPLACE FUNCTION actualizar_empleado_ids_existentes()
RETURNS void AS $$
DECLARE
    gasto_record RECORD;
    empleado_record RECORD;
BEGIN
    -- Buscar gastos de sueldos que no tengan empleado_id
    FOR gasto_record IN 
        SELECT g.id, g.proveedor_beneficiario
        FROM gastos g
        INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
        WHERE (LOWER(sc.nombre) LIKE '%sueldo%' OR LOWER(sc.nombre) LIKE '%salario%')
          AND g.empleado_id IS NULL
          AND g.proveedor_beneficiario IS NOT NULL
    LOOP
        -- Buscar empleado que coincida con el nombre
        SELECT id INTO empleado_record
        FROM empleados 
        WHERE nombre_completo = gasto_record.proveedor_beneficiario
        LIMIT 1;
        
        -- Actualizar el gasto con el empleado_id si se encontró coincidencia
        IF empleado_record.id IS NOT NULL THEN
            UPDATE gastos 
            SET empleado_id = empleado_record.id
            WHERE id = gasto_record.id;
            
            RAISE NOTICE 'Actualizado gasto % con empleado_id %', gasto_record.id, empleado_record.id;
        ELSE
            RAISE NOTICE 'No se encontró empleado para: %', gasto_record.proveedor_beneficiario;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. COMENTARIOS EN TABLAS PARA DOCUMENTACIÓN
COMMENT ON TABLE empleados IS 'Tabla de empleados del consultorio para gestión de sueldos y gastos de personal';
COMMENT ON COLUMN empleados.puesto IS 'Cargo o posición del empleado (Recepcionista, Asistente Dental, etc.)';
COMMENT ON COLUMN empleados.departamento IS 'Área de trabajo (Recepción, Asistencia, Administración, etc.)';
COMMENT ON COLUMN empleados.salario_base IS 'Salario base mensual del empleado';
COMMENT ON COLUMN empleados.tipo_contrato IS 'Tipo de contrato laboral (Indefinido, Temporal, Por Horas, etc.)';
COMMENT ON COLUMN empleados.activo IS 'Indica si el empleado está actualmente laborando';

-- 10. VERIFICAR INSTALACIÓN
SELECT 'Tabla empleados creada correctamente' as status;
SELECT 'Campo empleado_id agregado a gastos' as status;
SELECT 'Vista vista_gastos_detalle_mejorada actualizada' as status;
SELECT 'Funciones de empleados creadas' as status; 