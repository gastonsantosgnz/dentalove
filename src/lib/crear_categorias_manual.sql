-- Script para verificar y completar categorías de gastos
-- Consultorio: Dentalist
-- ID: 9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9

-- Verificar que el consultorio existe:
SELECT id, nombre FROM consultorios WHERE id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9';

-- Verificar categorías existentes:
SELECT 
    id,
    nombre,
    tipo,
    es_predefinida,
    color,
    orden,
    activa
FROM categorias_gastos 
WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9' 
ORDER BY orden;

-- Verificar subcategorías existentes:
SELECT 
    sc.id,
    sc.nombre as subcategoria,
    c.nombre as categoria,
    c.tipo,
    sc.activa
FROM subcategorias_gastos sc
JOIN categorias_gastos c ON sc.categoria_id = c.id
WHERE sc.consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
ORDER BY c.orden, sc.nombre;

-- Contar categorías y subcategorías:
SELECT 
    'Categorías' as tipo,
    COUNT(*) as cantidad
FROM categorias_gastos 
WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
UNION ALL
SELECT 
    'Subcategorías' as tipo,
    COUNT(*) as cantidad
FROM subcategorias_gastos 
WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9';

-- Si necesitas eliminar todas las categorías y empezar de nuevo, descomenta estas líneas:
-- DELETE FROM subcategorias_gastos WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9';
-- DELETE FROM categorias_gastos WHERE consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9';
-- SELECT crear_categorias_predefinidas('9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'); 