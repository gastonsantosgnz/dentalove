-- CREAR VISTA COMPLETA DE GASTOS CON TODAS LAS RELACIONES
-- Esta vista incluye todos los campos necesarios para la aplicación

-- 1. PRIMERO AGREGAR CAMPOS FALTANTES A LA TABLA GASTOS (si no existen)
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS genera_factura BOOLEAN DEFAULT false;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS numero_factura VARCHAR(50);
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS proveedor_beneficiario VARCHAR(200);
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS es_deducible BOOLEAN DEFAULT true;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS periodo_fiscal VARCHAR(7);
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS doctor_id UUID;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS empleado_id UUID;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS proveedor_id UUID;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS laboratorio_id UUID;

-- 2. ELIMINAR VISTA EXISTENTE Y RECREARLA
DROP VIEW IF EXISTS vista_gastos_detalle_mejorada;

-- 3. CREAR VISTA COMPLETA CON TODOS LOS CAMPOS
CREATE VIEW vista_gastos_detalle_mejorada AS
SELECT 
    -- TODOS LOS CAMPOS DE LA TABLA GASTOS
    g.id,
    g.consultorio_id,
    g.subcategoria_id,
    g.monto,
    g.fecha,
    g.descripcion,
    g.metodo_pago,
    g.estado,
    g.comprobante_url,
    g.notas,
    g.usuario_id,
    g.created_at,
    g.updated_at,
    -- CAMPOS ADICIONALES DE GASTOS
    g.genera_factura,
    g.numero_factura,
    g.proveedor_beneficiario,
    g.es_deducible,
    g.fecha_vencimiento,
    g.periodo_fiscal,
    g.doctor_id,
    g.empleado_id,
    g.proveedor_id,
    g.laboratorio_id,
    
    -- INFORMACIÓN DE SUBCATEGORÍA Y CATEGORÍA
    sc.nombre as subcategoria_nombre,
    c.id as categoria_id,
    c.nombre as categoria_nombre,
    c.tipo as categoria_tipo,
    c.icono as categoria_icono,
    c.color as categoria_color,
    
    -- INFORMACIÓN DEL USUARIO
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

-- 4. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_gastos_proveedor_beneficiario ON gastos(proveedor_beneficiario);
CREATE INDEX IF NOT EXISTS idx_gastos_doctor_id ON gastos(doctor_id);
CREATE INDEX IF NOT EXISTS idx_gastos_empleado_id ON gastos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_gastos_proveedor_id ON gastos(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_gastos_laboratorio_id ON gastos(laboratorio_id);

-- 5. VERIFICAR CREACIÓN
SELECT 'Vista vista_gastos_detalle_mejorada creada correctamente' as resultado;

-- 6. MOSTRAR ESTRUCTURA DE LA VISTA
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vista_gastos_detalle_mejorada' 
ORDER BY ordinal_position; 