-- CONSULTAR TODOS LOS DATOS ACTUALES
-- Solo ID y nombres de todas las entidades en una sola consulta

SELECT 
    id,
    nombre,
    'categoria' as tipo
FROM categorias_gastos 

UNION ALL

SELECT 
    sc.id,
    sc.nombre,
    'subcategoria' as tipo
FROM subcategorias_gastos sc

UNION ALL

SELECT 
    id,
    nombre_completo as nombre,
    'empleado' as tipo
FROM empleados 
WHERE activo = true

UNION ALL

SELECT 
    id,
    nombre_completo as nombre,
    'doctor' as tipo
FROM doctores 

UNION ALL

SELECT 
    id,
    nombre_laboratorio as nombre,
    'laboratorio' as tipo
FROM laboratorios 
WHERE activo = true

UNION ALL

SELECT 
    id,
    nombre_comercial as nombre,
    'proveedor' as tipo
FROM proveedores 
WHERE activo = true

ORDER BY tipo, nombre;

 