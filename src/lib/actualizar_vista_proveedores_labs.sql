-- ACTUALIZAR VISTA DETALLE CON INFORMACIÓN DE PROVEEDORES Y LABORATORIOS
-- Complementa la vista existente con datos de proveedores y laboratorios

-- 1. ELIMINAR VISTA EXISTENTE Y RECREARLA CON TODOS LOS CAMPOS
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
    -- INFORMACIÓN DEL PROVEEDOR (si aplica)
    pr.id as proveedor_relacion_id,
    pr.nombre_comercial as proveedor_nombre,
    pr.categoria_proveedor as proveedor_categoria,
    pr.contacto_principal as proveedor_contacto,
    pr.telefono as proveedor_telefono,
    pr.email as proveedor_email,
    -- INFORMACIÓN DEL LABORATORIO (si aplica)
    lab.id as laboratorio_relacion_id,
    lab.nombre_laboratorio as laboratorio_nombre,
    lab.especialidades as laboratorio_especialidades,
    lab.tiempo_entrega_promedio as laboratorio_tiempo_entrega,
    lab.contacto_principal as laboratorio_contacto,
    lab.telefono as laboratorio_telefono,
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
LEFT JOIN empleados e ON g.empleado_id = e.id
LEFT JOIN proveedores pr ON g.proveedor_id = pr.id
LEFT JOIN laboratorios lab ON g.laboratorio_id = lab.id;

-- 2. FUNCIÓN PARA MIGRAR GASTOS EXISTENTES CON PROVEEDOR_ID
CREATE OR REPLACE FUNCTION actualizar_proveedor_ids_existentes()
RETURNS void AS $$
DECLARE
    gasto_record RECORD;
    proveedor_record RECORD;
    categoria_nombre TEXT;
BEGIN
    -- Buscar gastos de categoría "Equipamiento" que no tengan proveedor_id
    FOR gasto_record IN 
        SELECT g.id, g.proveedor_beneficiario, c.nombre as categoria
        FROM gastos g
        INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
        INNER JOIN categorias_gastos c ON sc.categoria_id = c.id
        WHERE LOWER(c.nombre) LIKE '%equipamiento%'
          AND g.proveedor_id IS NULL
          AND g.proveedor_beneficiario IS NOT NULL
          AND g.proveedor_beneficiario != ''
    LOOP
        -- Buscar proveedor que coincida con el nombre
        SELECT id INTO proveedor_record
        FROM proveedores 
        WHERE nombre_comercial = gasto_record.proveedor_beneficiario
           OR nombre_fiscal = gasto_record.proveedor_beneficiario
        LIMIT 1;
        
        -- Actualizar el gasto con el proveedor_id si se encontró coincidencia
        IF proveedor_record.id IS NOT NULL THEN
            UPDATE gastos 
            SET proveedor_id = proveedor_record.id
            WHERE id = gasto_record.id;
            
            RAISE NOTICE 'Actualizado gasto % con proveedor_id %', gasto_record.id, proveedor_record.id;
        ELSE
            RAISE NOTICE 'No se encontró proveedor para: %', gasto_record.proveedor_beneficiario;
        END IF;
        
        -- Limpiar para el siguiente loop
        proveedor_record.id := NULL;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. FUNCIÓN PARA MIGRAR GASTOS EXISTENTES CON LABORATORIO_ID
CREATE OR REPLACE FUNCTION actualizar_laboratorio_ids_existentes()
RETURNS void AS $$
DECLARE
    gasto_record RECORD;
    laboratorio_record RECORD;
BEGIN
    -- Buscar gastos de categoría "Materiales" que no tengan laboratorio_id
    FOR gasto_record IN 
        SELECT g.id, g.proveedor_beneficiario, c.nombre as categoria
        FROM gastos g
        INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
        INNER JOIN categorias_gastos c ON sc.categoria_id = c.id
        WHERE LOWER(c.nombre) LIKE '%materiales%'
          AND g.laboratorio_id IS NULL
          AND g.proveedor_beneficiario IS NOT NULL
          AND g.proveedor_beneficiario != ''
    LOOP
        -- Buscar laboratorio que coincida con el nombre
        SELECT id INTO laboratorio_record
        FROM laboratorios 
        WHERE nombre_laboratorio = gasto_record.proveedor_beneficiario
           OR nombre_fiscal = gasto_record.proveedor_beneficiario
        LIMIT 1;
        
        -- Actualizar el gasto con el laboratorio_id si se encontró coincidencia
        IF laboratorio_record.id IS NOT NULL THEN
            UPDATE gastos 
            SET laboratorio_id = laboratorio_record.id
            WHERE id = gasto_record.id;
            
            RAISE NOTICE 'Actualizado gasto % con laboratorio_id %', gasto_record.id, laboratorio_record.id;
        ELSE
            RAISE NOTICE 'No se encontró laboratorio para: %', gasto_record.proveedor_beneficiario;
        END IF;
        
        -- Limpiar para el siguiente loop
        laboratorio_record.id := NULL;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. VERIFICACIÓN DE INSTALACIÓN
SELECT 'Vista vista_gastos_detalle_mejorada actualizada con proveedores/laboratorios' as status;
SELECT 'Funciones de migración creadas: actualizar_proveedor_ids_existentes, actualizar_laboratorio_ids_existentes' as status; 