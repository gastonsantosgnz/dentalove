-- CREAR EMPLEADOS FALTANTES
-- Insertar empleados que aparecían en gastos pero no estaban registrados
-- Consultorio ID: 9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9

BEGIN;

-- ============================================
-- INSERTAR EMPLEADOS FALTANTES
-- ============================================

-- 1. KARIME BURGUEÑO - Recepcionista
INSERT INTO empleados (
    id,
    consultorio_id,
    nombre_completo,
    puesto,
    departamento,
    salario_base,
    tipo_contrato,
    fecha_ingreso,
    activo,
    notas,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'Karime Burgueño',
    'Recepcionista',
    'Recepción',
    3000.00,
    'Indefinido',
    '2025-04-01', -- Fecha estimada basada en primeros pagos
    true,
    'Empleada agregada retroactivamente - aparecía en gastos como Karimme/Kari',
    NOW(),
    NOW()
);

-- 2. DANIELA ALVARADO - Recepcionista  
INSERT INTO empleados (
    id,
    consultorio_id,
    nombre_completo,
    puesto,
    departamento,
    salario_base,
    tipo_contrato,
    fecha_ingreso,
    activo,
    notas,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'Daniela Alvarado',
    'Recepcionista',
    'Recepción',
    3000.00,
    'Indefinido',
    '2025-04-01', -- Fecha estimada basada en primeros pagos
    true,
    'Empleada agregada retroactivamente - aparecía en gastos como Dani',
    NOW(),
    NOW()
);

COMMIT;

-- ============================================
-- VERIFICAR INSERCIÓN
-- ============================================

-- Consultar los empleados recién creados
SELECT 
    id,
    nombre_completo,
    puesto,
    salario_base,
    created_at
FROM empleados 
WHERE nombre_completo IN ('Karime Burgueño', 'Daniela Alvarado')
ORDER BY nombre_completo;

-- ============================================
-- INFORMACIÓN DE REFERENCIA
-- ============================================

/*
EMPLEADOS CREADOS:

1. 📋 KARIME BURGUEÑO
   - Puesto: Recepcionista
   - Departamento: Recepción  
   - Salario Base: $3,000
   - Aparecía en gastos como: "Karimme", "Kari", "KARIMME"

2. 📋 DANIELA ALVARADO
   - Puesto: Recepcionista
   - Departamento: Recepción
   - Salario Base: $3,000  
   - Aparecía en gastos como: "Dani", "DANI"

✅ PRÓXIMO PASO:
Ejecutar ACTUALIZAR_GASTOS_EMPLEADOS_FALTANTES.sql para vincular
los gastos existentes con estos nuevos empleados.

📊 GASTOS A ACTUALIZAR:
- Abril: ~7 pagos a Dani, ~3 pagos a Karimme
- Mayo: ~5 pagos a Dani, ~1 pago a Karimme  
- Junio: ~5 pagos a Dani, ~1 pago a Karimme

💰 TOTAL ESTIMADO: ~$50,000 en pagos sin vincular
*/ 