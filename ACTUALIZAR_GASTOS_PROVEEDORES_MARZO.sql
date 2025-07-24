-- ACTUALIZAR GASTOS CON PROVEEDORES FALTANTES - MARZO 2025
-- Vincular gastos existentes de marzo con los nuevos proveedores creados
-- Consultorio ID: 9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9

BEGIN;

-- ============================================
-- OBTENER IDs DE LOS NUEVOS PROVEEDORES
-- ============================================

-- Verificar que los proveedores existen
SELECT 
    id,
    nombre_comercial,
    categoria_proveedor,
    'ID obtenido correctamente' as status
FROM proveedores 
WHERE nombre_comercial IN ('Dentel', 'Distrimedh')
AND consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9';

-- ============================================
-- ACTUALIZAR GASTOS - DENTEL
-- ============================================

-- Actualizar todos los gastos que tenían "DENTEL" o "DEPOSITO DENTEL"
UPDATE gastos 
SET 
    proveedor_id = (
        SELECT id 
        FROM proveedores 
        WHERE nombre_comercial = 'Dentel' 
        AND consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
    ),
    proveedor_beneficiario = 'Dentel',
    notas = REPLACE(
        COALESCE(notas, ''), 
        'PROVEEDOR NO REGISTRADO', 
        'Vinculado con proveedor registrado'
    ),
    updated_at = NOW()
WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
AND proveedor_id IS NULL
AND (
    proveedor_beneficiario ILIKE '%Dentel%' 
    OR descripcion ILIKE '%DENTEL%'
    OR descripcion ILIKE '%DEPOSITO DENTEL%'
)
AND subcategoria_id = 'bcd84f53-dadf-4ed9-a613-d9cd86f627e4' -- Solo material dental
AND fecha >= '2025-03-01' AND fecha <= '2025-03-31'; -- Solo marzo 2025

-- ============================================
-- ACTUALIZAR GASTOS - DISTRIMEDH
-- ============================================

-- Actualizar todos los gastos que tenían "Distrimedh"
UPDATE gastos 
SET 
    proveedor_id = (
        SELECT id 
        FROM proveedores 
        WHERE nombre_comercial = 'Distrimedh' 
        AND consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
    ),
    proveedor_beneficiario = 'Distrimedh',
    notas = REPLACE(
        COALESCE(notas, ''), 
        'PROVEEDOR NO REGISTRADO', 
        'Vinculado con proveedor registrado'
    ),
    updated_at = NOW()
WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
AND proveedor_id IS NULL
AND (
    proveedor_beneficiario ILIKE '%Distrimedh%' 
    OR descripcion ILIKE '%Distrimedh%'
)
AND subcategoria_id = 'bcd84f53-dadf-4ed9-a613-d9cd86f627e4' -- Solo material dental
AND fecha >= '2025-03-01' AND fecha <= '2025-03-31'; -- Solo marzo 2025

COMMIT;

-- ============================================
-- VERIFICAR ACTUALIZACIONES
-- ============================================

-- Contar gastos actualizados por proveedor
SELECT 
    p.nombre_comercial,
    COUNT(g.id) as total_gastos_vinculados,
    SUM(g.monto) as total_monto,
    MIN(g.fecha) as primer_gasto,
    MAX(g.fecha) as ultimo_gasto,
    STRING_AGG(DISTINCT g.descripcion, ' | ') as descripciones
FROM proveedores p
LEFT JOIN gastos g ON p.id = g.proveedor_id
WHERE p.nombre_comercial IN ('Dentel', 'Distrimedh')
AND p.consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
GROUP BY p.id, p.nombre_comercial
ORDER BY p.nombre_comercial;

-- Verificar que no quedaron gastos sin vincular de estos proveedores en marzo
SELECT 
    fecha,
    descripcion,
    proveedor_beneficiario,
    monto,
    'SIN VINCULAR' as status
FROM gastos
WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
AND proveedor_id IS NULL
AND subcategoria_id = 'bcd84f53-dadf-4ed9-a613-d9cd86f627e4' -- Material dental
AND fecha >= '2025-03-01' AND fecha <= '2025-03-31'
AND (
    proveedor_beneficiario ILIKE '%Dentel%' 
    OR proveedor_beneficiario ILIKE '%Distrimedh%'
    OR descripcion ILIKE '%DENTEL%'
    OR descripcion ILIKE '%Distrimedh%'
)
ORDER BY fecha;

-- ============================================
-- RESUMEN DE VINCULACIONES
-- ============================================

-- Resumen completo de proveedores con gastos en marzo
SELECT 
    p.nombre_comercial,
    p.categoria_proveedor,
    COUNT(g.id) as total_gastos_marzo,
    SUM(g.monto) as total_comprado_marzo,
    ROUND(AVG(g.monto), 2) as promedio_compra,
    MIN(g.fecha) as primera_compra,
    MAX(g.fecha) as ultima_compra
FROM proveedores p
LEFT JOIN gastos g ON p.id = g.proveedor_id 
    AND g.fecha >= '2025-03-01' 
    AND g.fecha <= '2025-03-31'
WHERE p.consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
AND p.activo = true
GROUP BY p.id, p.nombre_comercial, p.categoria_proveedor
HAVING COUNT(g.id) > 0
ORDER BY total_comprado_marzo DESC;

-- ============================================
-- INFORMACIÓN DE ACTUALIZACIÓN
-- ============================================

/*
ACTUALIZACIONES REALIZADAS:

🔗 CRITERIOS DE BÚSQUEDA:
- Solo gastos de subcategoría "Material dental" (bcd84f53-dadf-4ed9-a613-d9cd86f627e4)
- Solo gastos de marzo 2025 (fecha >= '2025-03-01' AND fecha <= '2025-03-31')
- Solo gastos sin proveedor_id (IS NULL)
- Búsqueda por texto en proveedor_beneficiario y descripcion

🏪 DENTEL:
- Patrones buscados: "Dentel", "DENTEL", "DEPOSITO DENTEL"
- Campo proveedor_beneficiario actualizado a: "Dentel"
- Campo proveedor_id vinculado correctamente
- Gastos esperados: 2 transacciones ($1,203.22 + $2,048.85)

🏪 DISTRIMEDH:
- Patrones buscados: "Distrimedh"
- Campo proveedor_beneficiario actualizado a: "Distrimedh"
- Campo proveedor_id vinculado correctamente
- Gastos esperados: 1 transacción ($1,040)

✅ BENEFICIOS:
1. Análisis de compras correctos por proveedor
2. Reportes de gastos por proveedor precisos
3. Seguimiento de relaciones comerciales
4. Datos consistentes para análisis de proveedores
5. Preparación para análisis de tendencias de compra

📊 MARZO 2025 - GASTOS VINCULADOS:
- DENTEL: $3,252.07 en material dental
- Distrimedh: $1,040 en material dental/médico

💰 TOTAL VINCULADO: $4,292.07

🔄 PRÓXIMO PASO:
Los gastos de marzo ya están completamente organizados y vinculados.
Ahora todos los análisis de proveedores serán precisos y completos.
*/ 