-- CORREGIR RELACIONES FALTANTES PARA PROVEEDORES Y LABORATORIOS
-- Agregar foreign keys y habilitar funcionalidad completa

-- 1. AGREGAR FOREIGN KEYS FALTANTES (si las tablas ya existen)
-- Verificar si las tablas existen antes de crear las constraints
DO $$
BEGIN
    -- Solo agregar constraint de proveedores si la tabla existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'proveedores') THEN
        -- Agregar foreign key solo si no existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_gastos_proveedor' 
            AND table_name = 'gastos'
        ) THEN
            ALTER TABLE gastos ADD CONSTRAINT fk_gastos_proveedor 
                FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
        END IF;
    END IF;

    -- Solo agregar constraint de laboratorios si la tabla existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'laboratorios') THEN
        -- Agregar foreign key solo si no existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_gastos_laboratorio' 
            AND table_name = 'gastos'
        ) THEN
            ALTER TABLE gastos ADD CONSTRAINT fk_gastos_laboratorio 
                FOREIGN KEY (laboratorio_id) REFERENCES laboratorios(id);
        END IF;
    END IF;
END $$;

-- 2. CREAR TABLAS SI NO EXISTEN (de gastos_mejoras_relaciones.sql)
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
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(consultorio_id, nombre_comercial)
);

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
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(consultorio_id, nombre_laboratorio)
);

-- 3. AGREGAR FOREIGN KEYS AHORA QUE LAS TABLAS EXISTEN
DO $$
BEGIN
    -- Agregar foreign key de proveedores si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_gastos_proveedor' 
        AND table_name = 'gastos'
    ) THEN
        ALTER TABLE gastos ADD CONSTRAINT fk_gastos_proveedor 
            FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
    END IF;

    -- Agregar foreign key de laboratorios si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_gastos_laboratorio' 
        AND table_name = 'gastos'
    ) THEN
        ALTER TABLE gastos ADD CONSTRAINT fk_gastos_laboratorio 
            FOREIGN KEY (laboratorio_id) REFERENCES laboratorios(id);
    END IF;
END $$;

-- 4. CREAR ÍNDICES PARA RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_proveedores_consultorio ON proveedores(consultorio_id);
CREATE INDEX IF NOT EXISTS idx_laboratorios_consultorio ON laboratorios(consultorio_id);
CREATE INDEX IF NOT EXISTS idx_proveedores_categoria ON proveedores(categoria_proveedor);

-- 5. INSERTAR PROVEEDORES DE EJEMPLO PARA MATERIALES Y EQUIPAMIENTO
INSERT INTO proveedores (consultorio_id, nombre_comercial, categoria_proveedor, contacto_principal, telefono)
SELECT DISTINCT
    consultorio_id,
    'Dental Supply MX' as nombre_comercial,
    'Material Dental' as categoria_proveedor,
    'Juan Pérez' as contacto_principal,
    '555-0001' as telefono
FROM categorias_gastos 
WHERE nombre = 'Materiales'
ON CONFLICT (consultorio_id, nombre_comercial) DO NOTHING;

INSERT INTO proveedores (consultorio_id, nombre_comercial, categoria_proveedor, contacto_principal, telefono)
SELECT DISTINCT
    consultorio_id,
    'Home Depot' as nombre_comercial,
    'Equipamiento' as categoria_proveedor,
    'María González' as contacto_principal,
    '555-0002' as telefono
FROM categorias_gastos 
WHERE nombre = 'Equipamiento'
ON CONFLICT (consultorio_id, nombre_comercial) DO NOTHING;

INSERT INTO proveedores (consultorio_id, nombre_comercial, categoria_proveedor, contacto_principal, telefono)
SELECT DISTINCT
    consultorio_id,
    'Prime Dental' as nombre_comercial,
    'Material Dental' as categoria_proveedor,
    'Carlos Rodríguez' as contacto_principal,
    '555-0003' as telefono
FROM categorias_gastos 
WHERE nombre = 'Materiales'
ON CONFLICT (consultorio_id, nombre_comercial) DO NOTHING;

-- 6. INSERTAR LABORATORIOS DE EJEMPLO
INSERT INTO laboratorios (consultorio_id, nombre_laboratorio, especialidades, contacto_principal, telefono, tiempo_entrega_promedio)
SELECT DISTINCT
    consultorio_id,
    'Laboratorio Jalisco' as nombre_laboratorio,
    ARRAY['Prótesis', 'Coronas', 'Puentes'] as especialidades,
    'Dr. Arturo Mendoza' as contacto_principal,
    '555-0101' as telefono,
    7 as tiempo_entrega_promedio
FROM categorias_gastos 
WHERE nombre = 'Materiales'
ON CONFLICT (consultorio_id, nombre_laboratorio) DO NOTHING;

INSERT INTO laboratorios (consultorio_id, nombre_laboratorio, especialidades, contacto_principal, telefono, tiempo_entrega_promedio)
SELECT DISTINCT
    consultorio_id,
    'ProDent Lab' as nombre_laboratorio,
    ARRAY['Ortodoncia', 'Implantes', 'Prótesis'] as especialidades,
    'Dra. Ana López' as contacto_principal,
    '555-0102' as telefono,
    5 as tiempo_entrega_promedio
FROM categorias_gastos 
WHERE nombre = 'Materiales'
ON CONFLICT (consultorio_id, nombre_laboratorio) DO NOTHING;

-- 7. FUNCIÓN PARA REPORTES DE GASTOS POR PROVEEDOR
CREATE OR REPLACE FUNCTION reporte_gastos_proveedor(
    p_consultorio_id UUID,
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    proveedor_id UUID,
    proveedor_nombre TEXT,
    categoria_proveedor TEXT,
    total_gastado DECIMAL,
    cantidad_compras INTEGER,
    promedio_compra DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id as proveedor_id,
        pr.nombre_comercial as proveedor_nombre,
        pr.categoria_proveedor,
        COALESCE(SUM(g.monto), 0) as total_gastado,
        COUNT(g.id)::INTEGER as cantidad_compras,
        COALESCE(AVG(g.monto), 0) as promedio_compra
    FROM proveedores pr
    LEFT JOIN gastos g ON pr.id = g.proveedor_id
    WHERE pr.consultorio_id = p_consultorio_id
      AND pr.activo = true
      AND (g.fecha IS NULL OR (g.fecha >= p_fecha_inicio AND g.fecha <= p_fecha_fin))
      AND (g.estado IS NULL OR g.estado != 'cancelado')
    GROUP BY pr.id, pr.nombre_comercial, pr.categoria_proveedor
    ORDER BY total_gastado DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. FUNCIÓN PARA REPORTES DE GASTOS POR LABORATORIO
CREATE OR REPLACE FUNCTION reporte_gastos_laboratorio(
    p_consultorio_id UUID,
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    laboratorio_id UUID,
    laboratorio_nombre TEXT,
    especialidades TEXT[],
    total_gastado DECIMAL,
    cantidad_trabajos INTEGER,
    promedio_trabajo DECIMAL,
    tiempo_entrega_promedio INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lab.id as laboratorio_id,
        lab.nombre_laboratorio as laboratorio_nombre,
        lab.especialidades,
        COALESCE(SUM(g.monto), 0) as total_gastado,
        COUNT(g.id)::INTEGER as cantidad_trabajos,
        COALESCE(AVG(g.monto), 0) as promedio_trabajo,
        lab.tiempo_entrega_promedio
    FROM laboratorios lab
    LEFT JOIN gastos g ON lab.id = g.laboratorio_id
    WHERE lab.consultorio_id = p_consultorio_id
      AND lab.activo = true
      AND (g.fecha IS NULL OR (g.fecha >= p_fecha_inicio AND g.fecha <= p_fecha_fin))
      AND (g.estado IS NULL OR g.estado != 'cancelado')
    GROUP BY lab.id, lab.nombre_laboratorio, lab.especialidades, lab.tiempo_entrega_promedio
    ORDER BY total_gastado DESC;
END;
$$ LANGUAGE plpgsql;

-- 9. COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON TABLE proveedores IS 'Proveedores registrados del consultorio para materiales y equipamiento';
COMMENT ON TABLE laboratorios IS 'Laboratorios dentales registrados del consultorio';
COMMENT ON COLUMN proveedores.categoria_proveedor IS 'Tipo de proveedor: Material Dental, Equipamiento, Servicios, etc.';
COMMENT ON COLUMN laboratorios.especialidades IS 'Array de especialidades del laboratorio';
COMMENT ON COLUMN laboratorios.tiempo_entrega_promedio IS 'Días promedio de entrega de trabajos';

-- 10. VERIFICAR INSTALACIÓN
SELECT 'Tablas de proveedores y laboratorios creadas/verificadas' as status;
SELECT 'Foreign keys agregadas correctamente' as status;
SELECT 'Datos de ejemplo insertados' as status; 