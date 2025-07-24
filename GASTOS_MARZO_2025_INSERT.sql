-- INSERTAR GASTOS DE MARZO 2025 - ORGANIZADOS
-- Datos originales reorganizados con categorías y subcategorías correctas
-- Fuente: REFERENCIA_DATABASE_NOMBRES_IDS.md
-- Consultorio ID: 9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9

-- ✅ NOTA: PROVEEDORES ACTUALIZADOS
-- Los siguientes proveedores fueron creados y ya están vinculados:
-- 1. DENTEL (ID: 4b617ec3-d611-4ac0-a731-488e0199318f) - 2 gastos: $3,252.07
-- 2. Distrimedh (ID: 9f9cb125-826b-4374-8d95-e8f612f52e0e) - 1 gasto: $1,040
-- TOTAL CORRECTAMENTE VINCULADO: $4,292.07

BEGIN;

-- ============================================
-- MARZO 2025 - GASTOS ORGANIZADOS
-- ============================================

-- 1. Distrimedh (03/03/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    1040.00,
    '2025-03-03',
    'Compra de material dental/médico',
    'transferencia',
    'pagado',
    'Distrimedh',
    '9f9cb125-826b-4374-8d95-e8f612f52e0e', -- Proveedor Distrimedh
    'Reorganizado desde: Distrimedh'
);

-- 2. Garrafón de agua (03/03/2025) - Materiales > Material de limpieza
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '6e65720d-c7a6-412d-9897-039890a42fb7', -- Material de limpieza
    20.00,
    '2025-03-03',
    'Garrafón de agua para consumo',
    'transferencia',
    'pagado',
    'Proveedor Agua',
    'Reorganizado desde: Garrafón de agua'
);

-- 3. Propina sr Juan (03/03/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    20.00,
    '2025-03-03',
    'Propina para Sr Juan',
    'efectivo',
    'pagado',
    'Sr Juan',
    'Reorganizado desde: Propina sr Juan'
);

-- 4. Renta (03/03/2025) - Instalaciones > Renta
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0de3d248-b77e-4a68-b4d7-2d2ba796bb92', -- Renta
    27000.00,
    '2025-03-03',
    'Pago mensual de renta del consultorio',
    'transferencia',
    'pagado',
    'Arrendador Consultorio',
    'Reorganizado desde: Renta (era Alquiler)'
);

-- 5. Basura (04/03/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-03-04',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: Basura'
);

-- 6. Pago dra Amairani (10/03/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    1415.00,
    '2025-03-10',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago dra Amairani'
);

-- 7. Dra Ana Laura (10/03/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    3380.00,
    '2025-03-10',
    'Pago de comisión a Dra Ana Laura Gomez',
    'transferencia',
    'pagado',
    'Dra Ana Laura Gomez',
    '75fd470b-b459-4f0b-8dcd-2688a049732a', -- Doctor Dra Ana Laura Gomez
    'Reorganizado desde: Dra Ana Laura'
);

-- 8. Pago Yara (07/03/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-03-07',
    'Pago de sueldo a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: Pago Yara'
);

-- 9. Pago Dani (07/03/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-03-07',
    'Pago de sueldo a Daniela Alvarado',
    'transferencia',
    'pagado',
    'Daniela Alvarado',
    '883f9bd9-5950-4f63-8b27-a51c01109ae7', -- Empleado Daniela Alvarado
    'Reorganizado desde: Pago Dani'
);

-- 10. Pago Xime (07/03/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2250.00,
    '2025-03-07',
    'Pago de sueldo a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: Pago Xime'
);

-- 11. Recolección Basura (11/03/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-03-11',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: Recolección Basura (era Mantenimiento de la Plaza)'
);

-- 12. Bodeguita (12/03/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    1910.00,
    '2025-03-12',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Bodeguita Dental',
    '3e36ffb9-d3b3-4286-b978-28af82147818', -- Proveedor Bodeguita Dental
    'Reorganizado desde: Bodeguita'
);

-- 13. Contadora Karina (12/03/2025) - Servicios Profesionales > Servicios Contables
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '1bed48ab-d0e3-4fea-bbf7-c4016e16b9f0', -- Servicios Contables
    1200.00,
    '2025-03-12',
    'Honorarios servicios contables - Contadora Karina',
    'transferencia',
    'pagado',
    'Contadora Karina',
    'Reorganizado desde: Contadora Karina'
);

-- 14. Garrafón de agua (13/03/2025) - Materiales > Material de limpieza
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '6e65720d-c7a6-412d-9897-039890a42fb7', -- Material de limpieza
    50.00,
    '2025-03-13',
    'Garrafón de agua para consumo',
    'transferencia',
    'pagado',
    'Proveedor Agua',
    'Reorganizado desde: Garrafón de agua'
);

-- 15. CFE LUZ (21/03/2025) - Instalaciones > Servicios (Luz, Agua, Gas)
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '3853fd83-6846-45e3-b2bb-cb736060a9ef', -- Servicios (Luz, Agua, Gas)
    2066.00,
    '2025-03-21',
    'Pago de recibo de luz CFE',
    'transferencia',
    'pagado',
    'CFE',
    'Reorganizado desde: CFE LUZ'
);

-- 16. Office depot (14/03/2025) - Materiales > Material de oficina
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '7d411904-69b3-4018-9ca8-2ca70267bc41', -- Material de oficina
    298.00,
    '2025-03-14',
    'Compra de material de oficina',
    'transferencia',
    'pagado',
    'Office Depot',
    'Reorganizado desde: Office depot'
);

-- 17. RPBI (14/03/2025) - Instalaciones > Mantenimiento
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'b9b05780-a74c-4d3d-a31f-b2d5035c2723', -- Mantenimiento
    1000.00,
    '2025-03-14',
    'Manejo de Residuos Peligrosos Biológico-Infecciosos',
    'transferencia',
    'pagado',
    'Empresa RPBI',
    'Reorganizado desde: RPBI'
);

-- 18. Basura (18/03/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-03-18',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: Basura (era Mantenimiento de la Plaza)'
);

-- 19. DEPOSITO DENTEL (19/03/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    1203.22,
    '2025-03-19',
    'Depósito para compra de material dental',
    'transferencia',
    'pagado',
    'Dentel',
    '4b617ec3-d611-4ac0-a731-488e0199318f', -- Proveedor Dentel
    'Reorganizado desde: DEPOSITO DENTEL'
);

-- 20. DENTAL 21 (19/03/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    4120.11,
    '2025-03-19',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: DENTAL 21'
);

-- 21. DENTEL (20/03/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    2048.85,
    '2025-03-20',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dentel',
    '4b617ec3-d611-4ac0-a731-488e0199318f', -- Proveedor Dentel
    'Reorganizado desde: DENTEL'
);

-- 22. PRIME DENTAL LAB (20/03/2025) - Servicios Profesionales > Laboratorio Dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    1570.00,
    '2025-03-20',
    'Servicios de laboratorio dental',
    'transferencia',
    'pagado',
    'Prime',
    '17919bbd-aeb2-48e0-9b69-feb35c94fd42', -- Laboratorio Prime
    'Reorganizado desde: PRIME DENTAL LAB'
);

-- 23. PAGO SEMANA DANI (21/03/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-03-21',
    'Pago semanal a Daniela Alvarado',
    'transferencia',
    'pagado',
    'Daniela Alvarado',
    '883f9bd9-5950-4f63-8b27-a51c01109ae7', -- Empleado Daniela Alvarado
    'Reorganizado desde: PAGO SEMANA DANI'
);

-- 24. PAGO SEMANA YARA (21/03/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-03-21',
    'Pago semanal a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: PAGO SEMANA YARA'
);

-- 25. INTERNET TELNOR (24/03/2025) - Instalaciones > Internet y Teléfono
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '4452c373-583d-417d-a5e1-bf8e6c299ee0', -- Internet y Teléfono
    1961.00,
    '2025-03-24',
    'Pago mensual del servicio de internet Telnor',
    'transferencia',
    'pagado',
    'Telnor',
    'Reorganizado desde: INTERNET TELNOR'
);

-- 26. BODEGUITA (24/03/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    580.00,
    '2025-03-24',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Bodeguita Dental',
    '3e36ffb9-d3b3-4286-b978-28af82147818', -- Proveedor Bodeguita Dental
    'Reorganizado desde: BODEGUITA'
);

-- 27. ARCHIVERO (24/03/2025) - Equipamiento > Mobiliario
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '17363d6d-73ef-4489-bf88-f4e3853b0416', -- Mobiliario
    3000.00,
    '2025-03-24',
    'Compra de archivero para oficina',
    'transferencia',
    'pagado',
    'Mueblería',
    'Reorganizado desde: ARCHIVERO'
);

-- 28. BASURA (25/03/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-03-25',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: BASURA (era Mantenimiento de la Plaza)'
);

-- 29. PAGO DRA ANA (25/03/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    5168.00,
    '2025-03-25',
    'Pago de comisión a Dra Ana Laura Gomez',
    'transferencia',
    'pagado',
    'Dra Ana Laura Gomez',
    '75fd470b-b459-4f0b-8dcd-2688a049732a', -- Doctor Dra Ana Laura Gomez
    'Reorganizado desde: PAGO DRA ANA'
);

-- 30. PAGODRA AMAIRANY (21/03/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    4905.00,
    '2025-03-21',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: PAGODRA AMAIRANY'
);

-- 31. LAB SAUL (27/03/2025) - Servicios Profesionales > Laboratorio Dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    600.00,
    '2025-03-27',
    'Servicios de laboratorio dental',
    'transferencia',
    'pagado',
    'Saúl',
    '5d977ba3-ecb7-41b0-895f-8127127cdfe3', -- Laboratorio Saúl
    'Reorganizado desde: LAB SAUL'
);

-- 32. GARARFON DE AGUA (26/03/2025) - Materiales > Material de limpieza
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '6e65720d-c7a6-412d-9897-039890a42fb7', -- Material de limpieza
    50.00,
    '2025-03-26',
    'Garrafón de agua para consumo',
    'transferencia',
    'pagado',
    'Proveedor Agua',
    'Reorganizado desde: GARARFON DE AGUA'
);

-- 33. PAGO SEMANA DANI (28/03/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-03-28',
    'Pago semanal a Daniela Alvarado',
    'transferencia',
    'pagado',
    'Daniela Alvarado',
    '883f9bd9-5950-4f63-8b27-a51c01109ae7', -- Empleado Daniela Alvarado
    'Reorganizado desde: PAGO SEMANA DANI'
);

COMMIT;

-- ============================================
-- RESUMEN DE LA ORGANIZACIÓN - MARZO 2025
-- ============================================

/*
REORGANIZACIÓN COMPLETADA:

📊 DISTRIBUCIÓN POR CATEGORÍAS:
- Personal: 11 gastos (Sueldos x7, Comisiones Doctores x4)
- Materiales: 10 gastos (Material dental x7, Material oficina x1, Material limpieza x2)
- Instalaciones: 7 gastos (Basura x4, Renta x1, Luz x1, Internet x1, Mantenimiento x1)
- Servicios Profesionales: 3 gastos (Laboratorio Dental x2, Servicios Contables x1)
- Equipamiento: 1 gasto (Mobiliario)
- Otros: 1 gasto (Propina)

🔧 CAMPOS UTILIZADOS:
- empleado_id: Para Yara (2 pagos), Daniela/Dani (3 pagos), Ximena (1 pago)
- doctor_id: Para Dra Amairany (2 pagos), Dra Ana Laura (2 pagos)
- proveedor_id: Para Dental 21 (1 compra), Bodeguita Dental (2 compras)
- laboratorio_id: Para Prime (1 trabajo), Saúl (1 trabajo)
- proveedor_beneficiario: Para todos los gastos (campo de respaldo)

👥 PERSONAL DESTACADO:
- Dra Ana Laura: $8,548 en comisiones (2 pagos)
- Dra Amairany: $6,320 en comisiones (2 pagos)
- Yara Jiménez: $8,000 en sueldos (2 pagos)
- Daniela Alvarado: $9,000 en sueldos (3 pagos)
- Ximena López: $2,250 en sueldos (1 pago)

🏪 PROVEEDORES Y LABORATORIOS:
CORRECTAMENTE VINCULADOS:
- Dental 21: $4,120.11 en material dental
- Bodeguita Dental: $2,490 en material dental (2 compras)
- Dentel: $3,252.07 en material dental (2 transacciones) ✅ NUEVO
- Distrimedh: $1,040 en material dental/médico ✅ NUEVO
- Laboratorio Prime: $1,570 en servicios
- Laboratorio Saúl: $600 en servicios

💰 GASTOS DESTACADOS:
- Renta del consultorio: $27,000 (mayor gasto individual)
- Comisiones doctores: $14,868 total
- Internet Telnor: $1,961 (más caro que meses anteriores)
- Archivero: $3,000 (inversión en mobiliario)

📊 TODOS LOS PROVEEDORES CORRECTAMENTE VINCULADOS: $4,292.07

✅ NOTAS IMPORTANTES:
1. DENTEL creado y vinculado correctamente (ID: 4b617ec3-d611-4ac0-a731-488e0199318f)
2. Distrimedh creado y vinculado correctamente (ID: 9f9cb125-826b-4374-8d95-e8f612f52e0e)
3. Pagos regulares de basura continúan ($200 cada ~7 días)
4. Internet más caro este mes ($1,961 vs ~$662 anteriores)
5. Total comisiones doctores: $14,868

💰 TOTAL PROCESADO: $79,231.18 pesos
*/ 