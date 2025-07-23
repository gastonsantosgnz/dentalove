-- Tabla de categorías de gastos
CREATE TABLE categorias_gastos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultorio_id UUID NOT NULL REFERENCES consultorios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('fijo', 'variable')),
    es_predefinida BOOLEAN DEFAULT false,
    icono VARCHAR(50), -- Para iconos de tabler-icons
    color VARCHAR(7), -- Color hexadecimal
    orden INTEGER DEFAULT 0,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(consultorio_id, nombre)
);

-- Tabla de subcategorías
CREATE TABLE subcategorias_gastos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    categoria_id UUID NOT NULL REFERENCES categorias_gastos(id) ON DELETE CASCADE,
    consultorio_id UUID NOT NULL REFERENCES consultorios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(categoria_id, nombre)
);

-- Tabla principal de gastos
CREATE TABLE gastos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultorio_id UUID NOT NULL REFERENCES consultorios(id) ON DELETE CASCADE,
    subcategoria_id UUID NOT NULL REFERENCES subcategorias_gastos(id),
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    fecha DATE NOT NULL,
    descripcion TEXT NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'cheque', 'otro')),
    estado VARCHAR(20) NOT NULL DEFAULT 'pagado' CHECK (estado IN ('pagado', 'pendiente', 'cancelado')),
    comprobante_url TEXT,
    notas TEXT,
    usuario_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_gastos_consultorio_fecha ON gastos(consultorio_id, fecha DESC);
CREATE INDEX idx_gastos_subcategoria ON gastos(subcategoria_id);
CREATE INDEX idx_gastos_estado ON gastos(estado);
CREATE INDEX idx_categorias_consultorio ON categorias_gastos(consultorio_id);
CREATE INDEX idx_subcategorias_consultorio ON subcategorias_gastos(consultorio_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_gastos_updated_at BEFORE UPDATE ON categorias_gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategorias_gastos_updated_at BEFORE UPDATE ON subcategorias_gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE categorias_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para categorías
CREATE POLICY "Usuarios pueden ver categorías de su consultorio" ON categorias_gastos
    FOR SELECT USING (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden crear categorías en su consultorio" ON categorias_gastos
    FOR INSERT WITH CHECK (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden actualizar categorías de su consultorio" ON categorias_gastos
    FOR UPDATE USING (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden eliminar categorías de su consultorio" ON categorias_gastos
    FOR DELETE USING (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        ) AND NOT es_predefinida
    );

-- Políticas similares para subcategorías
CREATE POLICY "Usuarios pueden ver subcategorías de su consultorio" ON subcategorias_gastos
    FOR SELECT USING (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden crear subcategorías en su consultorio" ON subcategorias_gastos
    FOR INSERT WITH CHECK (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden actualizar subcategorías de su consultorio" ON subcategorias_gastos
    FOR UPDATE USING (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden eliminar subcategorías de su consultorio" ON subcategorias_gastos
    FOR DELETE USING (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

-- Políticas para gastos
CREATE POLICY "Usuarios pueden ver gastos de su consultorio" ON gastos
    FOR SELECT USING (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden crear gastos en su consultorio" ON gastos
    FOR INSERT WITH CHECK (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden actualizar gastos de su consultorio" ON gastos
    FOR UPDATE USING (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden eliminar gastos de su consultorio" ON gastos
    FOR DELETE USING (
        consultorio_id IN (
            SELECT consultorio_id FROM usuarios_consultorios 
            WHERE usuario_id = auth.uid()
        )
    );

-- Función para crear categorías predefinidas para un nuevo consultorio
CREATE OR REPLACE FUNCTION crear_categorias_predefinidas(p_consultorio_id UUID)
RETURNS void AS $$
DECLARE
    v_categoria_id UUID;
BEGIN
    -- Gastos Fijos
    INSERT INTO categorias_gastos (consultorio_id, nombre, tipo, es_predefinida, icono, color, orden)
    VALUES (p_consultorio_id, 'Instalaciones', 'fijo', true, 'building', '#3B82F6', 1)
    RETURNING id INTO v_categoria_id;
    
    INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre)
    VALUES 
        (v_categoria_id, p_consultorio_id, 'Renta'),
        (v_categoria_id, p_consultorio_id, 'Servicios (Luz, Agua, Gas)'),
        (v_categoria_id, p_consultorio_id, 'Internet y Teléfono'),
        (v_categoria_id, p_consultorio_id, 'Mantenimiento');

    -- Personal
    INSERT INTO categorias_gastos (consultorio_id, nombre, tipo, es_predefinida, icono, color, orden)
    VALUES (p_consultorio_id, 'Personal', 'fijo', true, 'users', '#10B981', 2)
    RETURNING id INTO v_categoria_id;
    
    INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre)
    VALUES 
        (v_categoria_id, p_consultorio_id, 'Sueldos'),
        (v_categoria_id, p_consultorio_id, 'Prestaciones'),
        (v_categoria_id, p_consultorio_id, 'Seguros'),
        (v_categoria_id, p_consultorio_id, 'Capacitación');

    -- Gastos Variables
    INSERT INTO categorias_gastos (consultorio_id, nombre, tipo, es_predefinida, icono, color, orden)
    VALUES (p_consultorio_id, 'Materiales', 'variable', true, 'package', '#F59E0B', 3)
    RETURNING id INTO v_categoria_id;
    
    INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre)
    VALUES 
        (v_categoria_id, p_consultorio_id, 'Material dental'),
        (v_categoria_id, p_consultorio_id, 'Material de limpieza'),
        (v_categoria_id, p_consultorio_id, 'Material de oficina'),
        (v_categoria_id, p_consultorio_id, 'Medicamentos');

    -- Equipamiento
    INSERT INTO categorias_gastos (consultorio_id, nombre, tipo, es_predefinida, icono, color, orden)
    VALUES (p_consultorio_id, 'Equipamiento', 'variable', true, 'tool', '#8B5CF6', 4)
    RETURNING id INTO v_categoria_id;
    
    INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre)
    VALUES 
        (v_categoria_id, p_consultorio_id, 'Equipo dental'),
        (v_categoria_id, p_consultorio_id, 'Mobiliario'),
        (v_categoria_id, p_consultorio_id, 'Equipo de cómputo'),
        (v_categoria_id, p_consultorio_id, 'Reparaciones');

    -- Marketing y Publicidad
    INSERT INTO categorias_gastos (consultorio_id, nombre, tipo, es_predefinida, icono, color, orden)
    VALUES (p_consultorio_id, 'Marketing', 'variable', true, 'speakerphone', '#EC4899', 5)
    RETURNING id INTO v_categoria_id;
    
    INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre)
    VALUES 
        (v_categoria_id, p_consultorio_id, 'Publicidad digital'),
        (v_categoria_id, p_consultorio_id, 'Material promocional'),
        (v_categoria_id, p_consultorio_id, 'Eventos');

    -- Otros
    INSERT INTO categorias_gastos (consultorio_id, nombre, tipo, es_predefinida, icono, color, orden)
    VALUES (p_consultorio_id, 'Otros', 'variable', true, 'dots-horizontal', '#6B7280', 6)
    RETURNING id INTO v_categoria_id;
    
    INSERT INTO subcategorias_gastos (categoria_id, consultorio_id, nombre)
    VALUES 
        (v_categoria_id, p_consultorio_id, 'Gastos bancarios'),
        (v_categoria_id, p_consultorio_id, 'Impuestos'),
        (v_categoria_id, p_consultorio_id, 'Otros gastos');
END;
$$ LANGUAGE plpgsql;

-- Vista para obtener gastos con información completa
CREATE OR REPLACE VIEW vista_gastos_detalle AS
SELECT 
    g.id,
    g.consultorio_id,
    g.monto,
    g.fecha,
    g.descripcion,
    g.metodo_pago,
    g.estado,
    g.comprobante_url,
    g.notas,
    g.created_at,
    g.updated_at,
    g.usuario_id,
    sc.id as subcategoria_id,
    sc.nombre as subcategoria_nombre,
    c.id as categoria_id,
    c.nombre as categoria_nombre,
    c.tipo as categoria_tipo,
    c.icono as categoria_icono,
    c.color as categoria_color,
    u.email as usuario_email,
    COALESCE(p.nombre || ' ' || p.apellido, u.email) as usuario_nombre
FROM gastos g
INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
INNER JOIN categorias_gastos c ON sc.categoria_id = c.id
LEFT JOIN auth.users u ON g.usuario_id = u.id
LEFT JOIN perfiles_usuario p ON u.id = p.id;

-- Función para obtener estadísticas de gastos
CREATE OR REPLACE FUNCTION obtener_estadisticas_gastos(
    p_consultorio_id UUID,
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    total_gastos DECIMAL,
    total_fijos DECIMAL,
    total_variables DECIMAL,
    cantidad_gastos INTEGER,
    promedio_diario DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(g.monto), 0) as total_gastos,
        COALESCE(SUM(CASE WHEN c.tipo = 'fijo' THEN g.monto ELSE 0 END), 0) as total_fijos,
        COALESCE(SUM(CASE WHEN c.tipo = 'variable' THEN g.monto ELSE 0 END), 0) as total_variables,
        COUNT(*)::INTEGER as cantidad_gastos,
        CASE 
            WHEN (p_fecha_fin - p_fecha_inicio + 1) > 0 
            THEN COALESCE(SUM(g.monto), 0) / (p_fecha_fin - p_fecha_inicio + 1)
            ELSE 0
        END as promedio_diario
    FROM gastos g
    INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
    INNER JOIN categorias_gastos c ON sc.categoria_id = c.id
    WHERE g.consultorio_id = p_consultorio_id
        AND g.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        AND g.estado != 'cancelado';
END;
$$ LANGUAGE plpgsql; 