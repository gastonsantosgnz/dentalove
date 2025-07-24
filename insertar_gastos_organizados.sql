-- INSERTAR GASTOS ORGANIZADOS SEGÚN CATEGORÍAS Y ENTIDADES EXISTENTES
-- Datos procesados y organizados desde los registros en sucio

-- Obtener consultorio_id y usuario_id para usar en las inserciones
WITH base_data AS (
    SELECT 
        c.id as consultorio_id,
        u.id as usuario_id
    FROM consultorios c
    CROSS JOIN auth.users u
    LIMIT 1
)

INSERT INTO gastos (
    consultorio_id,
    subcategoria_id,
    monto,
    fecha,
    descripcion,
    metodo_pago,
    estado,
    usuario_id,
    doctor_id,
    empleado_id,
    laboratorio_id,
    proveedor_id,
    proveedor_beneficiario
)
SELECT 
    bd.consultorio_id,
    subcategoria_id::UUID,
    monto,
    fecha::DATE,
    descripcion,
    'transferencia' as metodo_pago,
    'pagado' as estado,
    bd.usuario_id,
    doctor_id::UUID,
    empleado_id::UUID,
    laboratorio_id::UUID,
    proveedor_id::UUID,
    proveedor_beneficiario
FROM base_data bd
CROSS JOIN (
    VALUES
    -- MATERIALES DENTALES - PROVEEDORES
    ('bcd84f53-dadf-4ed9-a613-d9cd86f627e4', 5010.00, '2025-07-01', 'Deposito 21', NULL, NULL, NULL, 'f2f9da66-edf0-4a90-9b9a-a547060a3c86', 'Dental 21'),
    ('bcd84f53-dadf-4ed9-a613-d9cd86f627e4', 423.99, '2025-07-01', 'Deposito 21', NULL, NULL, NULL, 'f2f9da66-edf0-4a90-9b9a-a547060a3c86', 'Dental 21'),
    ('bcd84f53-dadf-4ed9-a613-d9cd86f627e4', 1813.00, '2025-07-01', '21', NULL, NULL, NULL, 'f2f9da66-edf0-4a90-9b9a-a547060a3c86', 'Dental 21'),
    ('bcd84f53-dadf-4ed9-a613-d9cd86f627e4', 1165.00, '2025-07-02', 'dentalist', NULL, NULL, NULL, NULL, 'Dentalist'),
    -- LABORATORIO DENTAL - PRIME (corregido)
    ('e6b13e46-6ae2-4d12-a5af-5396847313f7', 2448.00, '2025-07-09', 'prime dental', NULL, NULL, '17919bbd-aeb2-48e0-9b69-feb35c94fd42', NULL, 'Prime'),
    ('bcd84f53-dadf-4ed9-a613-d9cd86f627e4', 6693.98, '2025-07-11', 'MATERIAL DENTAL', NULL, NULL, NULL, NULL, 'Material Dental'),
    ('bcd84f53-dadf-4ed9-a613-d9cd86f627e4', 4007.14, '2025-07-19', 'jalisco', NULL, NULL, NULL, 'e74aafb4-7369-47cd-aa3f-171b75ad105b', 'Dental Jalísco'),
    ('bcd84f53-dadf-4ed9-a613-d9cd86f627e4', 1624.00, '2025-07-19', 'DEPOSITO 21', NULL, NULL, NULL, 'f2f9da66-edf0-4a90-9b9a-a547060a3c86', 'Dental 21'),
    
    -- RECOLECCIÓN DE BASURA
    ('26904c4b-0712-49c7-adac-0f0e850c9919', 200.00, '2025-07-01', 'Basura', NULL, NULL, NULL, NULL, 'Recolección Basura'),
    ('26904c4b-0712-49c7-adac-0f0e850c9919', 200.00, '2025-07-08', 'Basura', NULL, NULL, NULL, NULL, 'Recolección Basura'),
    ('26904c4b-0712-49c7-adac-0f0e850c9919', 200.00, '2025-07-15', 'BASURA SEMANAL', NULL, NULL, NULL, NULL, 'Recolección Basura'),
    ('26904c4b-0712-49c7-adac-0f0e850c9919', 200.00, '2025-07-22', 'basura', NULL, NULL, NULL, NULL, 'Recolección Basura'),
    
    -- EQUIPAMIENTO
    ('77f0de94-e45b-4546-b3bc-0a21f62529bb', 724.00, '2025-07-02', 'Home depot', NULL, NULL, NULL, NULL, 'Home Depot'),
    ('9f6ef3de-24f5-4cc9-8b04-da94472a720e', 158.76, '2025-07-02', 'primeros auxilios', NULL, NULL, NULL, NULL, 'Primeros Auxilios'),
    ('77f0de94-e45b-4546-b3bc-0a21f62529bb', 1158.00, '2025-07-12', 'lampara fotocurado', NULL, NULL, NULL, NULL, 'Lámpara Fotocurado'),
    
    -- SUELDOS EMPLEADOS
    ('0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', 4000.00, '2025-07-05', 'Yara', NULL, 'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', NULL, NULL, 'Yara Jiménez'),
    ('0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', 4500.00, '2025-07-05', 'Ximena', NULL, 'd403458a-76f5-4112-8e83-200c7173115b', NULL, NULL, 'Ximena López'),
    ('0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', 3500.00, '2025-07-05', 'Rubi', NULL, '4c5a3f60-a55f-44dc-949f-32f413e60cca', NULL, NULL, 'Rubi Santiago'),
    ('0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', 3500.00, '2025-07-12', 'RUBI RECEPCIÓN', NULL, '4c5a3f60-a55f-44dc-949f-32f413e60cca', NULL, NULL, 'Rubi Santiago'),
    ('0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', 4000.00, '2025-07-12', 'yara asistente', NULL, 'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', NULL, NULL, 'Yara Jiménez'),
    ('0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', 2525.00, '2025-07-12', 'ximena asistente', NULL, 'd403458a-76f5-4112-8e83-200c7173115b', NULL, NULL, 'Ximena López'),
    ('0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', 1000.00, '2025-07-14', 'Asistentes ayuda', NULL, NULL, NULL, NULL, 'Asistentes Ayuda'),
    ('0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', 4000.00, '2025-07-19', 'yara asistente', NULL, 'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', NULL, NULL, 'Yara Jiménez'),
    ('0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', 2000.00, '2025-07-19', 'ximena', NULL, 'd403458a-76f5-4112-8e83-200c7173115b', NULL, NULL, 'Ximena López'),
    ('0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', 3500.00, '2025-07-19', 'rubi', NULL, '4c5a3f60-a55f-44dc-949f-32f413e60cca', NULL, NULL, 'Rubi Santiago'),
    
    -- COMISIONES DOCTORES
    ('ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', 7480.00, '2025-07-05', 'Dra Ana', '75fd470b-b459-4f0b-8dcd-2688a049732a', NULL, NULL, NULL, 'Dra Ana Laura Gomez'),
    ('ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', 7385.00, '2025-07-05', 'Dra Stephany', '60624fac-0982-47f1-8c30-d8586a573d9d', NULL, NULL, NULL, 'Dra Stephanie De La Cruz'),
    ('ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', 6476.00, '2025-07-08', 'Dra Ana', '75fd470b-b459-4f0b-8dcd-2688a049732a', NULL, NULL, NULL, 'Dra Ana Laura Gomez'),
    ('ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', 3830.00, '2025-07-12', 'Dra Amairany', 'af864287-c6a4-4550-ad9f-10b1fb2429ce', NULL, NULL, NULL, 'Dra Amairany Esperano'),
    ('ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', 1665.00, '2025-07-12', 'dra stephamie', '60624fac-0982-47f1-8c30-d8586a573d9d', NULL, NULL, NULL, 'Dra Stephanie De La Cruz'),
    ('ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', 4050.00, '2025-07-18', 'Dr ulises orto', '30967c52-285e-4886-8ca1-24ec0f1881ba', NULL, NULL, NULL, 'Dr Ulises Medina'),
    ('ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', 3070.00, '2025-07-19', 'dra amairany', 'af864287-c6a4-4550-ad9f-10b1fb2429ce', NULL, NULL, NULL, 'Dra Amairany Esperano'),
    ('ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', 5400.00, '2025-07-22', 'dr ulises', '30967c52-285e-4886-8ca1-24ec0f1881ba', NULL, NULL, NULL, 'Dr Ulises Medina'),
    ('ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', 5615.00, '2025-07-22', 'dra amairany', 'af864287-c6a4-4550-ad9f-10b1fb2429ce', NULL, NULL, NULL, 'Dra Amairany Esperano'),
    
    -- RENTA
    ('0de3d248-b77e-4a68-b4d7-2d2ba796bb92', 36000.00, '2025-07-01', 'RENTA 2 CUBICULOS', NULL, NULL, NULL, NULL, 'Renta Consultorio'),
    
    -- MANTENIMIENTO
    ('b9b05780-a74c-4d3d-a31f-b2d5035c2723', 400.00, '2025-07-11', 'MANTENIMIENTO', NULL, NULL, NULL, NULL, 'Mantenimiento Plaza'),
    
    -- OTROS GASTOS
    ('d077d06c-caf6-4caa-81eb-a6f34c52e69e', 1600.00, '2025-07-14', 'Comida dra Vanessa', '1bb5cd91-c5b6-4805-843e-d9c2abd82b03', NULL, NULL, NULL, 'Dra Vanessa Machuca'),
    
    -- INTERNET Y TELÉFONO
    ('4452c373-583d-417d-a5e1-bf8e6c299ee0', 662.00, '2025-07-19', 'INTERNET', NULL, NULL, NULL, NULL, 'Internet'),
    
    -- PASES MÉDICOS
    ('e9f0efd6-f127-455e-8a5e-6fc4fa045c85', 4400.00, '2025-07-19', 'PASES MEDICOS', NULL, NULL, NULL, NULL, 'Pases Médicos'),
    ('e9f0efd6-f127-455e-8a5e-6fc4fa045c85', 2100.00, '2025-07-19', '5 PASES MEDICOS', NULL, NULL, NULL, NULL, 'Pases Médicos'),
    
    -- LABORATORIO DENTAL - SAÚL
    ('e6b13e46-6ae2-4d12-a5af-5396847313f7', 900.00, '2025-07-19', 'SAUL', NULL, NULL, '5d977ba3-ecb7-41b0-895f-8127127cdfe3', NULL, 'Saúl'),
    
    -- MATERIAL PROMOCIONAL
    ('a316eb88-5291-4577-983e-9cb14c62792e', 9691.00, '2025-07-13', 'Playeras dentalist', NULL, NULL, NULL, NULL, 'Playeras Dentalist'),
    
    -- IMPUESTOS LOCALES
    ('7cb9b450-f57e-499c-bfaf-114a52dc70ab', 4362.00, '2025-07-21', 'Ayuntamiento Tijuana', NULL, NULL, NULL, NULL, 'Ayuntamiento Tijuana'),
    
    -- CUOTAS IMSS
    ('416947e9-29e4-48f6-b08e-bda6ae55d13f', 1419.00, '2025-07-21', 'imss', NULL, NULL, NULL, NULL, 'IMSS'),
    
    -- IMPUESTOS FEDERALES
    ('6ffa4cff-2734-4fe7-9802-93eebcb29ea1', 2997.00, '2025-07-21', 'sat', NULL, NULL, NULL, NULL, 'SAT'),
    
    -- OTROS GASTOS
    ('d077d06c-caf6-4caa-81eb-a6f34c52e69e', 5000.00, '2025-07-21', 'Pagos', NULL, NULL, NULL, NULL, 'Pagos Varios'),
    
    -- SERVICIOS (LUZ, AGUA, GAS)
    ('3853fd83-6846-45e3-b2bb-cb736060a9ef', 3623.00, '2025-07-22', 'LUZ', NULL, NULL, NULL, NULL, 'Luz')
    
) AS datos(subcategoria_id, monto, fecha, descripcion, doctor_id, empleado_id, laboratorio_id, proveedor_id, proveedor_beneficiario);

-- VERIFICAR INSERCIÓN
SELECT 'GASTOS INSERTADOS CORRECTAMENTE' as resultado;
SELECT COUNT(*) as total_gastos_insertados FROM gastos;

-- MOSTRAR RESUMEN POR CATEGORÍA
SELECT 
    c.nombre as categoria,
    COUNT(*) as cantidad_gastos,
    SUM(g.monto) as total_monto
FROM gastos g
INNER JOIN subcategorias_gastos sc ON g.subcategoria_id = sc.id
INNER JOIN categorias_gastos c ON sc.categoria_id = c.id
GROUP BY c.nombre
ORDER BY total_monto DESC; 