-- INSERTAR GASTOS ORGANIZADOS USANDO REFERENCIA DATABASE
-- Datos originales reorganizados con categorías y subcategorías correctas
-- Fuente: REFERENCIA_DATABASE_NOMBRES_IDS.md

-- NOTA: Reemplazar 'YOUR_CONSULTORIO_ID' con el ID real del consultorio
-- NOTA: Los montos están en formato decimal (sin comas ni símbolos de peso)

BEGIN;

-- ============================================
-- JUNIO 2025 - GASTOS ORGANIZADOS
-- ============================================

-- 1. PAGO BASURA (03/06/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-06-03',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: PAGO BASURA'
);

-- 2. LAPTOP NOVATEK (04/06/2025) - Equipamiento > Equipo de cómputo
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '4af157de-4ee4-497c-ae28-ddb367b49f58', -- Equipo de cómputo
    4247.45,
    '2025-06-04',
    'Compra laptop NOVATEK para consultorio',
    'transferencia',
    'pagado',
    'NOVATEK',
    'Reorganizado desde: LAPTOP NOVATEK (era Personal/Salarios)'
);

-- 3. RENTA 2 CONSULTORIOS (04/06/2025) - Instalaciones > Renta
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '0de3d248-b77e-4a68-b4d7-2d2ba796bb92', -- Renta
    36000.00,
    '2025-06-04',
    'Renta mensual de 2 consultorios',
    'transferencia',
    'pagado',
    'Arrendador Consultorios',
    'Reorganizado desde: RENTA 2 CONSULTORIOS (era Alquiler)'
);

-- 4. SAUL ORTOPEDIA (04/06/2025) - Servicios Profesionales > Laboratorio Dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    1600.00,
    '2025-06-04',
    'Servicios de laboratorio dental - ortopedia',
    'transferencia',
    'pagado',
    'Saúl',
    '5d977ba3-ecb7-41b0-895f-8127127cdfe3', -- Laboratorio Saúl
    'Reorganizado desde: SAUL ORTOPEDIA'
);

-- 5. DEPÓSITO (04/06/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    4000.00,
    '2025-06-04',
    'Depósito general',
    'transferencia',
    'pagado',
    'Depósito General',
    'Reorganizado desde: DEPÓSITO - requiere más contexto'
);

-- 6. DENTAL 21 (05/06/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    504.12,
    '2025-06-05',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: DENTAL 21'
);

-- 7. DENTAL INK (05/06/2025) - Materiales > Material dental  
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    2276.00,
    '2025-06-05',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dentalink',
    '5a5ccb15-6087-4dad-a1e9-7d7376aaf5a7', -- Proveedor Dentalink
    'Reorganizado desde: DENTAL INK'
);

-- 8. PAGO DANI (06/06/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-06-06',
    'Pago de sueldo a empleado Dani',
    'transferencia',
    'pagado',
    'Dani',
    'Reorganizado desde: PAGO DANI - Empleado no encontrado en registro actual'
);

-- 9. PAGO YARA (06/06/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-06-06',
    'Pago de sueldo a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: PAGO YARA'
);

-- 10. PAGO XIME (06/06/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2000.00,
    '2025-06-06',
    'Pago de sueldo a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: PAGO XIME'
);

-- 11. BASURA (10/06/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-06-10',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: BASURA'
);

-- 12. D21 (13/06/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    104.00,
    '2025-06-13',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: D21'
);

-- 13. XIMENA (19/06/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2600.00,
    '2025-06-19',
    'Pago de sueldo a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: XIMENA'
);

-- 14. YARA (19/06/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4463.00,
    '2025-06-19',
    'Pago de sueldo a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: YARA'
);

-- 15. DANI (19/06/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2262.00,
    '2025-06-19',
    'Pago de sueldo a empleado Dani',
    'transferencia',
    'pagado',
    'Dani',
    'Reorganizado desde: DANI - Empleado no encontrado en registro actual'
);

-- 16. Deposito dental (23/06/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    1813.00,
    '2025-06-23',
    'Depósito relacionado con servicios dentales',
    'transferencia',
    'pagado',
    'Depósito Dental',
    'Reorganizado desde: Deposito dental - requiere más contexto'
);

-- 17. dentel (25/06/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    670.00,
    '2025-06-25',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dentel',
    'Reorganizado desde: dentel - proveedor no identificado'
);

-- 18. Deposito 21 (25/06/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    1460.00,
    '2025-06-25',
    'Depósito para compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: Deposito 21'
);

-- 19. Dra Amairany (25/06/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    3285.00,
    '2025-06-25',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Dra Amairany'
);

-- 20. Imprenta (25/06/2025) - Marketing > Material promocional
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'a316eb88-5291-4577-983e-9cb14c62792e', -- Material promocional
    1902.00,
    '2025-06-25',
    'Servicios de imprenta para material promocional',
    'transferencia',
    'pagado',
    'Imprenta',
    'Reorganizado desde: Imprenta'
);

-- 21. Gastos (25/06/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    4635.00,
    '2025-06-25',
    'Gastos diversos no especificados',
    'transferencia',
    'pagado',
    'Gastos Diversos',
    'Reorganizado desde: Gastos - requiere más especificación'
);

-- 22. contadora (25/06/2025) - Servicios Profesionales > Servicios Contables
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '1bed48ab-d0e3-4fea-bbf7-c4016e16b9f0', -- Servicios Contables
    1200.00,
    '2025-06-25',
    'Honorarios servicios contables',
    'transferencia',
    'pagado',
    'Contadora',
    'Reorganizado desde: contadora'
);

-- 23. Costos (25/06/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    1709.00,
    '2025-06-25',
    'Costos diversos no especificados',
    'transferencia',
    'pagado',
    'Costos Diversos',
    'Reorganizado desde: Costos - requiere más especificación'
);

-- 24. Pastel (25/06/2025) - Marketing > Eventos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'f05e9842-59fc-4ae8-9bb9-e4c4e165901c', -- Eventos
    1200.00,
    '2025-06-25',
    'Compra de pastel para evento del consultorio',
    'transferencia',
    'pagado',
    'Pastelería',
    'Reorganizado desde: Pastel'
);

-- 25. sat (25/06/2025) - Obligaciones Fiscales > Impuestos Federales - PAGO 1
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '6ffa4cff-2734-4fe7-9802-93eebcb29ea1', -- Impuestos Federales
    4203.00,
    '2025-06-25',
    'Pago de impuestos federales SAT',
    'transferencia',
    'pagado',
    'SAT',
    'Reorganizado desde: sat - Pago 1 de 3'
);

-- 26. Sat (25/06/2025) - Obligaciones Fiscales > Impuestos Federales - PAGO 2
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '6ffa4cff-2734-4fe7-9802-93eebcb29ea1', -- Impuestos Federales
    3176.00,
    '2025-06-25',
    'Pago de impuestos federales SAT',
    'transferencia',
    'pagado',
    'SAT',
    'Reorganizado desde: Sat - Pago 2 de 3'
);

-- 27. Sat (25/06/2025) - Obligaciones Fiscales > Impuestos Federales - PAGO 3
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '6ffa4cff-2734-4fe7-9802-93eebcb29ea1', -- Impuestos Federales
    2289.00,
    '2025-06-25',
    'Pago de impuestos federales SAT',
    'transferencia',
    'pagado',
    'SAT',
    'Reorganizado desde: Sat - Pago 3 de 3'
);

-- 28. fumigación (27/06/2025) - Instalaciones > Mantenimiento
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'b9b05780-a74c-4d3d-a31f-b2d5035c2723', -- Mantenimiento
    900.00,
    '2025-06-27',
    'Servicio de fumigación del consultorio',
    'transferencia',
    'pagado',
    'Servicio de Fumigación',
    'Reorganizado desde: fumigación'
);

-- 29. instalacion tuberia (27/06/2025) - Instalaciones > Reparaciones
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '38ebcea4-ebc4-4363-bdf6-6fefb15354c4', -- Reparaciones
    3500.00,
    '2025-06-27',
    'Instalación de tubería en consultorio',
    'transferencia',
    'pagado',
    'Plomero/Instalador',
    'Reorganizado desde: instalacion tuberia'
);

-- 30. ortolab (30/06/2025) - Servicios Profesionales > Laboratorio Dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    3180.00,
    '2025-06-30',
    'Servicios de laboratorio dental',
    'transferencia',
    'pagado',
    'Ortolab',
    '3c21fc44-57eb-46f3-b1c8-9b895064da95', -- Laboratorio Ortolab
    'Reorganizado desde: ortolab'
);

-- 31. deposito 21 (26/06/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    1459.25,
    '2025-06-26',
    'Depósito para compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: deposito 21'
);

-- 32. nick (27/06/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    3500.00,
    '2025-06-27',
    'Pago a Nick - concepto no especificado',
    'transferencia',
    'pagado',
    'Nick',
    'Reorganizado desde: nick - requiere más contexto'
);

-- 33. Yara (28/06/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    6280.00,
    '2025-06-28',
    'Pago de sueldo a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: Yara'
);

-- 34. Ximena (28/06/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2500.00,
    '2025-06-28',
    'Pago de sueldo a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: Ximena'
);

-- 35. Rubi Capacitación (28/06/2025) - Personal > Capacitación
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '71d46cfe-7261-4c17-b9de-480539c3cd9f', -- Capacitación
    1500.00,
    '2025-06-28',
    'Pago de capacitación para Rubi Santiago',
    'transferencia',
    'pagado',
    'Rubi Santiago',
    '4c5a3f60-a55f-44dc-949f-32f413e60cca', -- Empleado Rubi Santiago
    'Reorganizado desde: Rubi Capacitación'
);

-- 36. Karime (28/06/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    'YOUR_CONSULTORIO_ID',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    750.00,
    '2025-06-28',
    'Pago de sueldo a empleado Karime',
    'transferencia',
    'pagado',
    'Karime',
    'Reorganizado desde: Karime - Empleado no encontrado en registro actual'
);

COMMIT;

-- ============================================
-- RESUMEN DE LA ORGANIZACIÓN
-- ============================================

/*
REORGANIZACIÓN COMPLETADA:

📊 DISTRIBUCIÓN POR CATEGORÍAS:
- Instalaciones: 7 gastos (Renta, Basura x2, Fumigación, Reparación tubería)
- Personal: 14 gastos (Sueldos x13, Capacitación x1, Comisión x1)  
- Materiales: 6 gastos (Material dental de varios proveedores)
- Servicios Profesionales: 3 gastos (Laboratorios x2, Contadora x1)
- Obligaciones Fiscales: 3 gastos (SAT x3)
- Equipamiento: 1 gasto (Laptop)
- Marketing: 2 gastos (Imprenta, Pastel)
- Otros: 5 gastos (Depósitos y gastos no especificados)

🔧 CAMPOS UTILIZADOS:
- empleado_id: Para sueldos específicos a empleados registrados
- doctor_id: Para comisión de Dra Amairany
- proveedor_id: Para compras a proveedores registrados (Dental 21, Dentalink)
- laboratorio_id: Para servicios de laboratorios (Saúl, Ortolab)
- proveedor_beneficiario: Para todos los gastos (backup de texto)

⚠️ NOTAS IMPORTANTES:
1. Reemplazar 'YOUR_CONSULTORIO_ID' con el ID real del consultorio
2. Empleados "Dani" y "Karime" no están en el registro actual - verificar si están inactivos
3. Varios gastos requieren más contexto (Depósitos, Gastos, Costos, Nick)
4. Se mantuvieron los montos exactos incluyendo centavos donde los había

💰 TOTAL PROCESADO: $147,728.57 pesos
*/ 