-- MEJORAS PROPUESTAS PARA EL SISTEMA DE GASTOS
-- Análisis basado en datos reales del consultorio

-- 1. AGREGAR NUEVOS CAMPOS A LA TABLA GASTOS
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS genera_factura BOOLEAN DEFAULT false;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS numero_factura VARCHAR(50);
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS proveedor_beneficiario VARCHAR(200);
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS es_deducible BOOLEAN DEFAULT true;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS periodo_fiscal VARCHAR(7); -- 2025-01, 2025-02, etc.

-- 2. MEJORAR CATEGORÍAS EXISTENTES Y AGREGAR NUEVAS SUBCATEGORÍAS

-- Actualizar subcategorías de Personal para incluir Comisiones
INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre, descripcion) 
SELECT 
    c.id as categoria_id,
    c.consultorio_id,
    'Comisiones Doctores' as nombre,
    'Comisiones pagadas a doctores por tratamientos realizados' as descripcion
FROM categorias_gastos c 
WHERE c.nombre = 'Personal' AND c.tipo = 'fijo'
ON CONFLICT (categoria_id, nombre) DO NOTHING;

INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre, descripcion) 
SELECT 
    c.id as categoria_id,
    c.consultorio_id,
    'Honorarios Especialistas' as nombre,
    'Honorarios pagados a especialistas externos (ortodoncistas, etc.)' as descripcion
FROM categorias_gastos c 
WHERE c.nombre = 'Personal' AND c.tipo = 'fijo'
ON CONFLICT (categoria_id, nombre) DO NOTHING;

-- 3. CREAR NUEVA CATEGORÍA PARA OBLIGACIONES FISCALES
INSERT INTO categorias_gastos (consultorio_id, nombre, tipo, es_predefinida, icono, color, orden)
SELECT DISTINCT 
    consultorio_id,
    'Obligaciones Fiscales' as nombre,
    'fijo' as tipo,
    true as es_predefinida,
    'file-text' as icono,
    '#DC2626' as color,
    7 as orden
FROM categorias_gastos 
WHERE nombre = 'Personal' -- Para obtener consultorios existentes
ON CONFLICT (consultorio_id, nombre) DO NOTHING;

-- Subcategorías para Obligaciones Fiscales
INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre, descripcion)
SELECT 
    c.id as categoria_id,
    c.consultorio_id,
    subcategoria.nombre,
    subcategoria.descripcion
FROM categorias_gastos c
CROSS JOIN (VALUES 
    ('Impuestos Federales', 'ISR, IVA, etc.'),
    ('Impuestos Locales', 'Impuestos municipales, licencias'),
    ('Cuotas IMSS', 'Cuotas obrero-patronales'),
    ('Trámites Legales', 'Permisos, licencias sanitarias'),
    ('Servicios Contables', 'Honorarios contador, gestoría')
) AS subcategoria(nombre, descripcion)
WHERE c.nombre = 'Obligaciones Fiscales';

-- 4. CREAR NUEVA CATEGORÍA PARA SERVICIOS PROFESIONALES
INSERT INTO categorias_gastos (consultorio_id, nombre, tipo, es_predefinida, icono, color, orden)
SELECT DISTINCT 
    consultorio_id,
    'Servicios Profesionales' as nombre,
    'variable' as tipo,
    true as es_predefinida,
    'briefcase' as icono,
    '#059669' as color,
    8 as orden
FROM categorias_gastos 
WHERE nombre = 'Personal'
ON CONFLICT (consultorio_id, nombre) DO NOTHING;

-- Subcategorías para Servicios Profesionales
INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre, descripcion)
SELECT 
    c.id as categoria_id,
    c.consultorio_id,
    subcategoria.nombre,
    subcategoria.descripcion
FROM categorias_gastos c
CROSS JOIN (VALUES 
    ('Laboratorio Dental', 'Trabajos de laboratorio protésico'),
    ('Servicios Médicos', 'Estudios, análisis clínicos'),
    ('Pases Médicos', 'Certificados y constancias médicas'),
    ('Servicios Legales', 'Abogados, notarios'),
    ('Servicios de Limpieza', 'Empresa de limpieza profesional')
) AS subcategoria(nombre, descripcion)
WHERE c.nombre = 'Servicios Profesionales';

-- 5. MEJORAR SUBCATEGORÍAS DE INSTALACIONES
INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre, descripcion)
SELECT 
    c.id as categoria_id,
    c.consultorio_id,
    subcategoria.nombre,
    subcategoria.descripcion
FROM categorias_gastos c
CROSS JOIN (VALUES 
    ('Recolección de Basura', 'Servicio de recolección de residuos'),
    ('Seguridad', 'Sistemas de seguridad, alarmas'),
    ('Seguros', 'Seguro del inmueble, responsabilidad civil')
) AS subcategoria(nombre, descripcion)
WHERE c.nombre = 'Instalaciones'
ON CONFLICT (categoria_id, nombre) DO NOTHING;

-- 6. FUNCIÓN PARA MIGRAR GASTOS MAL CATEGORIZADOS
CREATE OR REPLACE FUNCTION migrar_gastos_mal_categorizados()
RETURNS void AS $$
DECLARE
    categoria_obligaciones_fiscales_id UUID;
    categoria_servicios_profesionales_id UUID;
    categoria_instalaciones_id UUID;
    categoria_personal_id UUID;
    subcategoria_id UUID;
BEGIN
    -- Ejemplos de migraciones basadas en los datos proporcionados:
    
    -- 1. Migrar gastos de "SAT" e "IMSS" a Obligaciones Fiscales
    SELECT id INTO categoria_obligaciones_fiscales_id 
    FROM categorias_gastos 
    WHERE nombre = 'Obligaciones Fiscales' LIMIT 1;
    
    SELECT id INTO subcategoria_id 
    FROM subcategorias_gastos 
    WHERE categoria_id = categoria_obligaciones_fiscales_id 
      AND nombre = 'Impuestos Federales' LIMIT 1;
    
    -- Actualizar gastos que mencionen "SAT", "IMSS", "impuesto"
    UPDATE gastos 
    SET subcategoria_id = subcategoria_id
    WHERE LOWER(descripcion) LIKE '%sat%' 
       OR LOWER(descripcion) LIKE '%imss%'
       OR LOWER(descripcion) LIKE '%impuesto%';
    
    -- 2. Migrar "Pases Médicos" a Servicios Profesionales
    SELECT id INTO categoria_servicios_profesionales_id 
    FROM categorias_gastos 
    WHERE nombre = 'Servicios Profesionales' LIMIT 1;
    
    SELECT id INTO subcategoria_id 
    FROM subcategorias_gastos 
    WHERE categoria_id = categoria_servicios_profesionales_id 
      AND nombre = 'Pases Médicos' LIMIT 1;
    
    UPDATE gastos 
    SET subcategoria_id = subcategoria_id
    WHERE LOWER(descripcion) LIKE '%pases medicos%' 
       OR LOWER(descripcion) LIKE '%pase medico%';
    
    -- 3. Migrar gastos de basura a Instalaciones
    SELECT id INTO categoria_instalaciones_id 
    FROM categorias_gastos 
    WHERE nombre = 'Instalaciones' LIMIT 1;
    
    SELECT id INTO subcategoria_id 
    FROM subcategorias_gastos 
    WHERE categoria_id = categoria_instalaciones_id 
      AND nombre = 'Recolección de Basura' LIMIT 1;
    
    UPDATE gastos 
    SET subcategoria_id = subcategoria_id
    WHERE LOWER(descripcion) LIKE '%basura%';
    
END;
$$ LANGUAGE plpgsql;

-- 7. VISTA MEJORADA PARA ANÁLISIS DE GASTOS
CREATE OR REPLACE VIEW vista_gastos_analisis AS
SELECT 
    g.*,
    sc.nombre as subcategoria_nombre,
    c.nombre as categoria_nombre,
    c.tipo as categoria_tipo,
    c.color as categoria_color,
    -- Agregar campos calculados para análisis
    EXTRACT(YEAR FROM g.fecha) as año,
    EXTRACT(MONTH FROM g.fecha) as mes,
    TO_CHAR(g.fecha, 'YYYY-MM') as periodo_fiscal_calculado,
    CASE 
        WHEN g.genera_factura THEN 'Con Factura'
        ELSE 'Sin Factura'
    END as tipo_comprobante,
    CASE 
        WHEN g.es_deducible THEN 'Deducible'
        ELSE 'No Deducible'
    END as tipo_fiscal,
    -- Clasificación por rango de monto
    CASE 
        WHEN g.monto < 1000 THEN 'Menor'
        WHEN g.monto BETWEEN 1000 AND 5000 THEN 'Medio'
        WHEN g.monto > 5000 THEN 'Mayor'
    END as rango_monto
FROM gastos g
INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
INNER JOIN categorias_gastos c ON sc.categoria_id = c.id;

-- 8. ÍNDICES ADICIONALES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_gastos_genera_factura ON gastos(genera_factura);
CREATE INDEX IF NOT EXISTS idx_gastos_proveedor ON gastos(proveedor_beneficiario);
CREATE INDEX IF NOT EXISTS idx_gastos_periodo_fiscal ON gastos(periodo_fiscal);
CREATE INDEX IF NOT EXISTS idx_gastos_deducible ON gastos(es_deducible);

-- 9. FUNCIÓN PARA GENERAR REPORTES FISCALES
CREATE OR REPLACE FUNCTION reporte_gastos_fiscales(
    p_consultorio_id UUID,
    p_año INTEGER,
    p_mes INTEGER DEFAULT NULL
)
RETURNS TABLE (
    categoria VARCHAR,
    subcategoria VARCHAR,
    total_con_factura DECIMAL,
    total_sin_factura DECIMAL,
    total_deducible DECIMAL,
    total_no_deducible DECIMAL,
    cantidad_gastos INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.nombre as categoria,
        sc.nombre as subcategoria,
        COALESCE(SUM(CASE WHEN g.genera_factura THEN g.monto ELSE 0 END), 0) as total_con_factura,
        COALESCE(SUM(CASE WHEN NOT g.genera_factura THEN g.monto ELSE 0 END), 0) as total_sin_factura,
        COALESCE(SUM(CASE WHEN g.es_deducible THEN g.monto ELSE 0 END), 0) as total_deducible,
        COALESCE(SUM(CASE WHEN NOT g.es_deducible THEN g.monto ELSE 0 END), 0) as total_no_deducible,
        COUNT(*)::INTEGER as cantidad_gastos
    FROM gastos g
    INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
    INNER JOIN categorias_gastos c ON sc.categoria_id = c.id
    WHERE g.consultorio_id = p_consultorio_id
      AND EXTRACT(YEAR FROM g.fecha) = p_año
      AND (p_mes IS NULL OR EXTRACT(MONTH FROM g.fecha) = p_mes)
      AND g.estado != 'cancelado'
    GROUP BY c.nombre, sc.nombre, c.orden, sc.nombre
    ORDER BY c.orden, sc.nombre;
END;
$$ LANGUAGE plpgsql;

-- 10. TRIGGERS PARA MANTENER CONSISTENCIA
CREATE OR REPLACE FUNCTION actualizar_periodo_fiscal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.periodo_fiscal = TO_CHAR(NEW.fecha, 'YYYY-MM');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_periodo_fiscal
    BEFORE INSERT OR UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION actualizar_periodo_fiscal();

-- 11. COMENTARIOS EN TABLAS PARA DOCUMENTACIÓN
COMMENT ON COLUMN gastos.genera_factura IS 'Indica si el gasto generó factura fiscal';
COMMENT ON COLUMN gastos.numero_factura IS 'Número de factura o comprobante fiscal';
COMMENT ON COLUMN gastos.proveedor_beneficiario IS 'Nombre del proveedor o beneficiario del pago';
COMMENT ON COLUMN gastos.es_deducible IS 'Indica si el gasto es deducible fiscalmente';
COMMENT ON COLUMN gastos.fecha_vencimiento IS 'Fecha límite de pago para gastos pendientes';
COMMENT ON COLUMN gastos.periodo_fiscal IS 'Período fiscal del gasto (YYYY-MM)'; 