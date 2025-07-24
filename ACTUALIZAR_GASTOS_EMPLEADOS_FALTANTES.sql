-- ACTUALIZAR GASTOS CON EMPLEADOS FALTANTES
-- Vincular gastos existentes con los nuevos empleados creados
-- Consultorio ID: 9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9

BEGIN;

-- ============================================
-- OBTENER IDs DE LOS NUEVOS EMPLEADOS
-- ============================================

-- Verificar que los empleados existen
SELECT 
    id,
    nombre_completo,
    'ID obtenido correctamente' as status
FROM empleados 
WHERE nombre_completo IN ('Karime Burgueño', 'Daniela Alvarado')
AND consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9';

-- ============================================
-- ACTUALIZAR GASTOS - DANIELA ALVARADO (DANI)
-- ============================================

-- Actualizar todos los gastos que tenían "Dani" en diferentes variaciones
UPDATE gastos 
SET 
    empleado_id = (
        SELECT id 
        FROM empleados 
        WHERE nombre_completo = 'Daniela Alvarado' 
        AND consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
    ),
    proveedor_beneficiario = 'Daniela Alvarado',
    notas = REPLACE(notas, 'Empleado no encontrado en registro actual', 'Vinculado con empleado registrado'),
    updated_at = NOW()
WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
AND empleado_id IS NULL
AND (
    proveedor_beneficiario ILIKE '%Dani%' 
    OR descripcion ILIKE '%DANI%'
    OR descripcion ILIKE '%Dani%'
)
AND subcategoria_id = '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78'; -- Solo sueldos

-- ============================================
-- ACTUALIZAR GASTOS - KARIME BURGUEÑO (KARIMME/KARI)
-- ============================================

-- Actualizar todos los gastos que tenían "Karimme", "Kari", etc.
UPDATE gastos 
SET 
    empleado_id = (
        SELECT id 
        FROM empleados 
        WHERE nombre_completo = 'Karime Burgueño' 
        AND consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
    ),
    proveedor_beneficiario = 'Karime Burgueño',
    notas = REPLACE(notas, 'Empleado no encontrado en registro actual', 'Vinculado con empleado registrado'),
    updated_at = NOW()
WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
AND empleado_id IS NULL
AND (
    proveedor_beneficiario ILIKE '%Karim%' 
    OR proveedor_beneficiario ILIKE '%Kari%'
    OR descripcion ILIKE '%KARIM%'
    OR descripcion ILIKE '%Kari%'
)
AND subcategoria_id = '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78'; -- Solo sueldos

COMMIT;

-- ============================================
-- VERIFICAR ACTUALIZACIONES
-- ============================================

-- Contar gastos actualizados por empleado
SELECT 
    e.nombre_completo,
    COUNT(g.id) as total_gastos_vinculados,
    SUM(g.monto) as total_monto,
    MIN(g.fecha) as primer_pago,
    MAX(g.fecha) as ultimo_pago
FROM empleados e
LEFT JOIN gastos g ON e.id = g.empleado_id
WHERE e.nombre_completo IN ('Karime Burgueño', 'Daniela Alvarado')
AND e.consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
GROUP BY e.id, e.nombre_completo
ORDER BY e.nombre_completo;

-- Verificar que no quedaron gastos sin vincular (solo de estos empleados)
SELECT 
    fecha,
    descripcion,
    proveedor_beneficiario,
    monto,
    'SIN VINCULAR' as status
FROM gastos
WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
AND empleado_id IS NULL
AND subcategoria_id = '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78' -- Sueldos
AND (
    proveedor_beneficiario ILIKE '%Dani%' 
    OR proveedor_beneficiario ILIKE '%Karim%'
    OR proveedor_beneficiario ILIKE '%Kari%'
)
ORDER BY fecha;

-- ============================================
-- RESUMEN DE VINCULACIONES
-- ============================================

-- Resumen completo de empleados con gastos
SELECT 
    e.nombre_completo,
    e.puesto,
    e.salario_base,
    COUNT(g.id) as total_pagos,
    SUM(g.monto) as total_pagado,
    ROUND(AVG(g.monto), 2) as promedio_pago,
    EXTRACT(MONTH FROM MIN(g.fecha)) as mes_inicio,
    EXTRACT(MONTH FROM MAX(g.fecha)) as mes_fin
FROM empleados e
LEFT JOIN gastos g ON e.id = g.empleado_id
WHERE e.consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
AND e.activo = true
GROUP BY e.id, e.nombre_completo, e.puesto, e.salario_base
ORDER BY total_pagado DESC;

-- ============================================
-- INFORMACIÓN DE ACTUALIZACIÓN
-- ============================================

/*
ACTUALIZACIONES REALIZADAS:

🔗 CRITERIOS DE BÚSQUEDA:
- Solo gastos de subcategoría "Sueldos" (0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78)
- Solo gastos sin empleado_id (IS NULL)
- Búsqueda por texto en proveedor_beneficiario y descripcion

📋 DANIELA ALVARADO (Dani):
- Patrones buscados: "Dani", "DANI" 
- Campo proveedor_beneficiario actualizado a: "Daniela Alvarado"
- Campo empleado_id vinculado correctamente

📋 KARIME BURGUEÑO (Karimme/Kari):
- Patrones buscados: "Karim", "Kari", "KARIM"
- Campo proveedor_beneficiario actualizado a: "Karime Burgueño" 
- Campo empleado_id vinculado correctamente

✅ BENEFICIOS:
1. Análisis de nómina correctos por empleado
2. Reportes de sueldos precisos
3. Seguimiento de pagos por empleado
4. Datos consistentes para auditorías

📊 MESES AFECTADOS:
- Abril 2025: ~10 gastos vinculados
- Mayo 2025: ~6 gastos vinculados  
- Junio 2025: ~6 gastos vinculados

💰 TOTAL APROXIMADO VINCULADO: ~$50,000
*/ 