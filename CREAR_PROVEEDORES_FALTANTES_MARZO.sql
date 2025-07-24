-- CREAR PROVEEDORES FALTANTES - MARZO 2025
-- Insertar proveedores que aparecían en gastos pero no estaban registrados
-- Consultorio ID: 9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9

BEGIN;

-- ============================================
-- INSERTAR PROVEEDORES FALTANTES
-- ============================================

-- 1. DENTEL - Proveedor de Material Dental
INSERT INTO proveedores (
    id,
    consultorio_id,
    nombre_comercial,
    nombre_fiscal,
    rfc,
    contacto_principal,
    telefono,
    email,
    direccion,
    categoria_proveedor,
    activo,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'Dentel',
    'Dentel S.A. de C.V.',
    NULL, -- RFC pendiente de obtener
    'Representante Ventas',
    NULL, -- Teléfono pendiente
    NULL, -- Email pendiente
    NULL, -- Dirección pendiente
    'Material Dental',
    true,
    NOW(),
    NOW()
);

-- 2. DISTRIMEDH - Proveedor de Material Médico/Dental
INSERT INTO proveedores (
    id,
    consultorio_id,
    nombre_comercial,
    nombre_fiscal,
    rfc,
    contacto_principal,
    telefono,
    email,
    direccion,
    categoria_proveedor,
    activo,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'Distrimedh',
    'Distribuidora Médica Hospitalaria S.A. de C.V.',
    NULL, -- RFC pendiente de obtener
    'Departamento de Ventas',
    NULL, -- Teléfono pendiente
    NULL, -- Email pendiente
    NULL, -- Dirección pendiente
    'Material Dental',
    true,
    NOW(),
    NOW()
);

COMMIT;

-- ============================================
-- VERIFICAR INSERCIÓN
-- ============================================

-- Consultar los proveedores recién creados
SELECT 
    id,
    nombre_comercial,
    categoria_proveedor,
    activo,
    created_at
FROM proveedores 
WHERE nombre_comercial IN ('Dentel', 'Distrimedh')
AND consultorio_id = '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9'
ORDER BY nombre_comercial;

-- ============================================
-- INFORMACIÓN DE REFERENCIA
-- ============================================

/*
PROVEEDORES CREADOS:

1. 🏪 DENTEL
   - Categoría: Material Dental
   - Aparecía en gastos como: "DENTEL", "DEPOSITO DENTEL"
   - Total en gastos marzo: $3,252.07 (2 transacciones)
   - Tipo: Proveedor de material dental
   - Nota: Proveedor agregado retroactivamente

2. 🏪 DISTRIMEDH  
   - Categoría: Material Dental
   - Aparecía en gastos como: "Distrimedh"
   - Total en gastos marzo: $1,040 (1 transacción)
   - Tipo: Distribuidora médica hospitalaria
   - Nota: Proveedor agregado retroactivamente

✅ PRÓXIMO PASO:
Ejecutar ACTUALIZAR_GASTOS_PROVEEDORES_MARZO.sql para vincular
los gastos existentes de marzo con estos nuevos proveedores.

📊 GASTOS A ACTUALIZAR EN MARZO:
- DENTEL: 2 gastos ($1,203.22 + $2,048.85)
- Distrimedh: 1 gasto ($1,040)

💰 TOTAL A VINCULAR: $4,292.07

📝 INFORMACIÓN PENDIENTE:
- RFC de ambos proveedores
- Datos de contacto completos
- Direcciones físicas
- Actualizar información cuando se obtenga
*/ 