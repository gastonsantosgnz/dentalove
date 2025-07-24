-- INSERTAR EMPLEADOS DE EJEMPLO BASADOS EN DATOS REALES
-- Ejecutar después de crear la tabla empleados

-- Insertar empleados para todos los consultorios existentes
INSERT INTO empleados (consultorio_id, nombre_completo, puesto, departamento, salario_base, fecha_ingreso) 
SELECT DISTINCT
    consultorio_id,
    'Yara Asistente' as nombre_completo,
    'Asistente Dental' as puesto,
    'Asistencia' as departamento,
    4000.00 as salario_base,
    '2024-01-01'::DATE as fecha_ingreso
FROM categorias_gastos 
WHERE nombre = 'Personal'
ON CONFLICT (consultorio_id, nombre_completo) DO NOTHING;

INSERT INTO empleados (consultorio_id, nombre_completo, puesto, departamento, salario_base, fecha_ingreso) 
SELECT DISTINCT
    consultorio_id,
    'Ximena Asistente' as nombre_completo,
    'Asistente Dental' as puesto,
    'Asistencia' as departamento,
    4500.00 as salario_base,
    '2024-01-01'::DATE as fecha_ingreso
FROM categorias_gastos 
WHERE nombre = 'Personal'
ON CONFLICT (consultorio_id, nombre_completo) DO NOTHING;

INSERT INTO empleados (consultorio_id, nombre_completo, puesto, departamento, salario_base, fecha_ingreso) 
SELECT DISTINCT
    consultorio_id,
    'Rubi Recepción' as nombre_completo,
    'Recepcionista' as puesto,
    'Recepción' as departamento,
    3500.00 as salario_base,
    '2024-01-01'::DATE as fecha_ingreso
FROM categorias_gastos 
WHERE nombre = 'Personal'
ON CONFLICT (consultorio_id, nombre_completo) DO NOTHING;

INSERT INTO empleados (consultorio_id, nombre_completo, puesto, departamento, salario_base, fecha_ingreso) 
SELECT DISTINCT
    consultorio_id,
    'Saul' as nombre_completo,
    'Asistente General' as puesto,
    'Asistencia' as departamento,
    900.00 as salario_base,
    '2024-01-01'::DATE as fecha_ingreso
FROM categorias_gastos 
WHERE nombre = 'Personal'
ON CONFLICT (consultorio_id, nombre_completo) DO NOTHING;

-- Empleados adicionales comunes en consultorios dentales
INSERT INTO empleados (consultorio_id, nombre_completo, puesto, departamento, salario_base, fecha_ingreso) 
SELECT DISTINCT
    consultorio_id,
    'Asistente de Limpieza' as nombre_completo,
    'Personal de Limpieza' as puesto,
    'Limpieza' as departamento,
    2500.00 as salario_base,
    '2024-01-01'::DATE as fecha_ingreso
FROM categorias_gastos 
WHERE nombre = 'Personal'
ON CONFLICT (consultorio_id, nombre_completo) DO NOTHING;

-- Verificar empleados insertados
SELECT 
    e.nombre_completo,
    e.puesto,
    e.departamento,
    e.salario_base,
    c.nombre as consultorio_nombre
FROM empleados e
JOIN consultorios c ON e.consultorio_id = c.id
ORDER BY c.nombre, e.departamento, e.nombre_completo; 