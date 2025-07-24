-- SCRIPT PARA INSERTAR DATOS INICIALES
-- Limpiar datos existentes e insertar empleados, laboratorios y proveedores

-- ====================================
-- 1. LIMPIAR DATOS EXISTENTES
-- ====================================

-- Limpiar empleados existentes
DELETE FROM empleados;

-- Limpiar laboratorios existentes  
DELETE FROM laboratorios;

-- Limpiar proveedores existentes
DELETE FROM proveedores;

-- ====================================
-- 2. INSERTAR EMPLEADOS
-- ====================================

-- Obtener consultorio_id para usar en las inserciones
-- (Asumiendo que existe al menos un consultorio)
WITH consultorio_data AS (
    SELECT id as consultorio_id FROM consultorios LIMIT 1
)

-- Insertar empleados
INSERT INTO empleados (
    consultorio_id, 
    nombre_completo, 
    puesto, 
    salario_base,
    departamento,
    tipo_contrato,
    fecha_ingreso,
    activo
)
SELECT 
    consultorio_id,
    'Rubi Santiago' as nombre_completo,
    'Recepcionista' as puesto,
    3500.00 as salario_base,
    'Recepción' as departamento,
    'Indefinido' as tipo_contrato,
    CURRENT_DATE as fecha_ingreso,
    true as activo
FROM consultorio_data

UNION ALL

SELECT 
    consultorio_id,
    'Yara Jiménez' as nombre_completo,
    'Asistente Dental' as puesto,
    4000.00 as salario_base,
    'Asistencia' as departamento,
    'Indefinido' as tipo_contrato,
    CURRENT_DATE as fecha_ingreso,
    true as activo
FROM consultorio_data

UNION ALL

SELECT 
    consultorio_id,
    'Ximena López' as nombre_completo,
    'Asistente Dental' as puesto,
    2000.00 as salario_base,
    'Asistencia' as departamento,
    'Indefinido' as tipo_contrato,
    CURRENT_DATE as fecha_ingreso,
    true as activo
FROM consultorio_data;

-- ====================================
-- 3. INSERTAR LABORATORIOS
-- ====================================

WITH consultorio_data AS (
    SELECT id as consultorio_id FROM consultorios LIMIT 1
)

INSERT INTO laboratorios (
    consultorio_id,
    nombre_laboratorio,
    especialidades,
    tiempo_entrega_promedio,
    activo
)
SELECT 
    consultorio_id,
    'Saúl' as nombre_laboratorio,
    ARRAY['Prótesis', 'Coronas'] as especialidades,
    7 as tiempo_entrega_promedio,
    true as activo
FROM consultorio_data

UNION ALL

SELECT 
    consultorio_id,
    'Ortolab' as nombre_laboratorio,
    ARRAY['Ortodoncia', 'Aparatos'] as especialidades,
    5 as tiempo_entrega_promedio,
    true as activo
FROM consultorio_data

UNION ALL

SELECT 
    consultorio_id,
    'Prime' as nombre_laboratorio,
    ARRAY['Prótesis', 'Implantes', 'Coronas'] as especialidades,
    6 as tiempo_entrega_promedio,
    true as activo
FROM consultorio_data;

-- ====================================
-- 4. INSERTAR PROVEEDORES
-- ====================================

WITH consultorio_data AS (
    SELECT id as consultorio_id FROM consultorios LIMIT 1
)

INSERT INTO proveedores (
    consultorio_id,
    nombre_comercial,
    categoria_proveedor,
    activo
)
SELECT 
    consultorio_id,
    'Bodeguita Dental' as nombre_comercial,
    'Material Dental' as categoria_proveedor,
    true as activo
FROM consultorio_data

UNION ALL

SELECT 
    consultorio_id,
    'Dental 21' as nombre_comercial,
    'Material Dental' as categoria_proveedor,
    true as activo
FROM consultorio_data

UNION ALL

SELECT 
    consultorio_id,
    'Dental Jalísco' as nombre_comercial,
    'Material Dental' as categoria_proveedor,
    true as activo
FROM consultorio_data

UNION ALL

SELECT 
    consultorio_id,
    'Dentalink' as nombre_comercial,
    'Material Dental' as categoria_proveedor,
    true as activo
FROM consultorio_data;

-- ====================================
-- 5. VERIFICAR INSERCIÓN
-- ====================================

-- Mostrar empleados insertados
SELECT 'EMPLEADOS INSERTADOS:' as resultado;
SELECT nombre_completo, puesto, salario_base FROM empleados ORDER BY nombre_completo;

-- Mostrar laboratorios insertados
SELECT 'LABORATORIOS INSERTADOS:' as resultado;
SELECT nombre_laboratorio, especialidades, tiempo_entrega_promedio FROM laboratorios ORDER BY nombre_laboratorio;

-- Mostrar proveedores insertados
SELECT 'PROVEEDORES INSERTADOS:' as resultado;
SELECT nombre_comercial, categoria_proveedor FROM proveedores ORDER BY nombre_comercial;

-- Mostrar conteos
SELECT 
    (SELECT COUNT(*) FROM empleados) as total_empleados,
    (SELECT COUNT(*) FROM laboratorios) as total_laboratorios,
    (SELECT COUNT(*) FROM proveedores) as total_proveedores; 