-- INSERTAR GASTOS DE ABRIL 2025 - ORGANIZADOS
-- Datos originales reorganizados con categorías y subcategorías correctas
-- Fuente: REFERENCIA_DATABASE_NOMBRES_IDS.md
-- Consultorio ID: 9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9

BEGIN;

-- ============================================
-- ABRIL 2025 - GASTOS ORGANIZADOS
-- ============================================

-- 1. PAGO RENTA (04/04/2025) - Instalaciones > Renta
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0de3d248-b77e-4a68-b4d7-2d2ba796bb92', -- Renta
    27000.00,
    '2025-04-04',
    'Pago mensual de renta del consultorio',
    'transferencia',
    'pagado',
    'Arrendador Consultorio',
    'Reorganizado desde: PAGO RENTA (era Alquiler)'
);

-- 2. PAGO SEMANA DANI (04/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-04-04',
    'Pago semanal a empleado Dani',
    'transferencia',
    'pagado',
    'Dani',
    'Reorganizado desde: PAGO SEMANA DANI - Empleado no encontrado en registro actual'
);

-- 3. BASURA (08/04/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    400.00,
    '2025-04-08',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: BASURA'
);

-- 4. DENTAL 21 (16/04/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    3344.96,
    '2025-04-16',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: DENTAL 21'
);

-- 5. DR ULISES-ORTODONCIA (08/04/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    600.00,
    '2025-04-08',
    'Comisión Dr Ulises por servicios de ortodoncia',
    'transferencia',
    'pagado',
    'Dr Ulises Medina',
    '30967c52-285e-4886-8ca1-24ec0f1881ba', -- Doctor Dr Ulises Medina
    'Reorganizado desde: DR ULISES-ORTODONCIA'
);

-- 6. PAGO AMAIRANY (08/04/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    8800.00,
    '2025-04-08',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: PAGO AMAIRANY'
);

-- 7. PAGO XIME (08/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2500.00,
    '2025-04-08',
    'Pago de sueldo a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: PAGO XIME'
);

-- 8. PAGO ANA LAURA (08/04/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    3364.00,
    '2025-04-08',
    'Pago de comisión a Dra Ana Laura Gomez',
    'transferencia',
    'pagado',
    'Dra Ana Laura Gomez',
    '75fd470b-b459-4f0b-8dcd-2688a049732a', -- Doctor Dra Ana Laura Gomez
    'Reorganizado desde: PAGO ANA LAURA'
);

-- 9. BODEGUITA (09/04/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    2458.00,
    '2025-04-09',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Bodeguita Dental',
    '3e36ffb9-d3b3-4286-b978-28af82147818', -- Proveedor Bodeguita Dental
    'Reorganizado desde: BODEGUITA'
);

-- 10. CORONAS DE ZIRCONIA (09/04/2025) - Servicios Profesionales > Laboratorio Dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    3380.00,
    '2025-04-09',
    'Elaboración de coronas de zirconia',
    'transferencia',
    'pagado',
    'Laboratorio Coronas',
    'Reorganizado desde: CORONAS DE ZIRCONIA'
);

-- 11. PRIME DENTAL (14/04/2025) - Servicios Profesionales > Laboratorio Dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    1560.00,
    '2025-04-14',
    'Servicios de laboratorio dental',
    'transferencia',
    'pagado',
    'Prime',
    '17919bbd-aeb2-48e0-9b69-feb35c94fd42', -- Laboratorio Prime
    'Reorganizado desde: PRIME DENTAL'
);

-- 12. PAGO DANI (11/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    1900.00,
    '2025-04-11',
    'Pago de sueldo a empleado Dani',
    'transferencia',
    'pagado',
    'Dani',
    'Reorganizado desde: PAGO DANI - Empleado no encontrado en registro actual'
);

-- 13. DENTEL (15/04/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    2052.00,
    '2025-04-15',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dentel',
    'Reorganizado desde: DENTEL - proveedor no identificado'
);

-- 14. DENTAL 21 (15/04/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    5720.53,
    '2025-04-15',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: DENTAL 21'
);

-- 15. BASURA (15/04/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-04-15',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: BASURA'
);

-- 16. CIBAJA (15/04/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    890.03,
    '2025-04-15',
    'Pago a CIBAJA - concepto no especificado',
    'transferencia',
    'pagado',
    'CIBAJA',
    'Reorganizado desde: CIBAJA - requiere más contexto'
);

-- 17. Pago de consulta Periodoncia (18/04/2025) - Servicios Profesionales > Honorarios Especialistas
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '3db927e9-7848-4e05-afdd-3a12a84e67ab', -- Honorarios Especialistas
    600.00,
    '2025-04-18',
    'Honorarios por consulta de periodoncia',
    'transferencia',
    'pagado',
    'Especialista Periodoncia',
    'Reorganizado desde: Pago de consulta Periodoncia'
);

-- 18. Pago a Karimme (19/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    750.00,
    '2025-04-19',
    'Pago de sueldo a empleado Karimme',
    'transferencia',
    'pagado',
    'Karimme',
    'Reorganizado desde: Pago a Karimme - Empleado no encontrado en registro actual'
);

-- 19. Pago a Karimme (05/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    750.00,
    '2025-04-05',
    'Pago de sueldo a empleado Karimme',
    'transferencia',
    'pagado',
    'Karimme',
    'Reorganizado desde: Pago a Karimme - Empleado no encontrado en registro actual'
);

-- 20. SEMANA DANI (19/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    1800.00,
    '2025-04-19',
    'Pago semanal a empleado Dani',
    'transferencia',
    'pagado',
    'Dani',
    'Reorganizado desde: SEMANA DANI - Empleado no encontrado en registro actual'
);

-- 21. PAGO YARA (16/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4550.00,
    '2025-04-16',
    'Pago de sueldo a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: PAGO YARA'
);

-- 22. PAGO XIME (16/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2000.00,
    '2025-04-16',
    'Pago de sueldo a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: PAGO XIME'
);

-- 23. PAGO DRA ANA LAURA (16/04/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    2400.00,
    '2025-04-16',
    'Pago de comisión a Dra Ana Laura Gomez',
    'transferencia',
    'pagado',
    'Dra Ana Laura Gomez',
    '75fd470b-b459-4f0b-8dcd-2688a049732a', -- Doctor Dra Ana Laura Gomez
    'Reorganizado desde: PAGO DRA ANA LAURA'
);

-- 24. BASURA (22/04/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-04-22',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: BASURA (era Mantenimiento de la Plaza)'
);

-- 25. PAGO DRA AMAIRANY (23/04/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    9800.00,
    '2025-04-23',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: PAGO DRA AMAIRANY'
);

-- 26. PRIME DENTAL LAB (24/04/2025) - Servicios Profesionales > Laboratorio Dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    1600.00,
    '2025-04-24',
    'Servicios de laboratorio dental',
    'transferencia',
    'pagado',
    'Prime',
    '17919bbd-aeb2-48e0-9b69-feb35c94fd42', -- Laboratorio Prime
    'Reorganizado desde: PRIME DENTAL LAB'
);

-- 27. LABORATORIO SAUL /GUERRA (24/04/2025) - Servicios Profesionales > Laboratorio Dental - PAGO 1
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    400.00,
    '2025-04-24',
    'Servicios de laboratorio dental - Trabajo Guerra',
    'transferencia',
    'pagado',
    'Saúl',
    '5d977ba3-ecb7-41b0-895f-8127127cdfe3', -- Laboratorio Saúl
    'Reorganizado desde: LABORATORIO SAUL /GUERRA - Pago 1 de 5'
);

-- 28. LABORATORIO SAUL /GUERRA (24/04/2025) - Servicios Profesionales > Laboratorio Dental - PAGO 2
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    1100.00,
    '2025-04-24',
    'Servicios de laboratorio dental - Trabajo Guerra',
    'transferencia',
    'pagado',
    'Saúl',
    '5d977ba3-ecb7-41b0-895f-8127127cdfe3', -- Laboratorio Saúl
    'Reorganizado desde: LABORATORIO SAUL /GUERRA - Pago 2 de 5'
);

-- 29. LABORATORIO SAUL /GUERRA (24/04/2025) - Servicios Profesionales > Laboratorio Dental - PAGO 3
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    900.00,
    '2025-04-24',
    'Servicios de laboratorio dental - Trabajo Guerra',
    'transferencia',
    'pagado',
    'Saúl',
    '5d977ba3-ecb7-41b0-895f-8127127cdfe3', -- Laboratorio Saúl
    'Reorganizado desde: LABORATORIO SAUL /GUERRA - Pago 3 de 5'
);

-- 30. LABORATORIO SAUL /GUERRA (24/04/2025) - Servicios Profesionales > Laboratorio Dental - PAGO 4
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    600.00,
    '2025-04-24',
    'Servicios de laboratorio dental - Trabajo Guerra',
    'transferencia',
    'pagado',
    'Saúl',
    '5d977ba3-ecb7-41b0-895f-8127127cdfe3', -- Laboratorio Saúl
    'Reorganizado desde: LABORATORIO SAUL /GUERRA - Pago 4 de 5'
);

-- 31. LABORATORIO SAUL /GUERRA (24/04/2025) - Servicios Profesionales > Laboratorio Dental - PAGO 5
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    800.00,
    '2025-04-24',
    'Servicios de laboratorio dental - Trabajo Guerra',
    'transferencia',
    'pagado',
    'Saúl',
    '5d977ba3-ecb7-41b0-895f-8127127cdfe3', -- Laboratorio Saúl
    'Reorganizado desde: LABORATORIO SAUL /GUERRA - Pago 5 de 5'
);

-- 32. INTERNET (24/04/2025) - Instalaciones > Internet y Teléfono
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '4452c373-583d-417d-a5e1-bf8e6c299ee0', -- Internet y Teléfono
    662.00,
    '2025-04-24',
    'Pago mensual del servicio de internet',
    'transferencia',
    'pagado',
    'Proveedor Internet',
    'Reorganizado desde: INTERNET'
);

-- 33. Pago Dani (25/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-04-25',
    'Pago de sueldo a empleado Dani',
    'transferencia',
    'pagado',
    'Dani',
    'Reorganizado desde: Pago Dani - Empleado no encontrado en registro actual'
);

-- 34. PAGO YARA (25/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-04-25',
    'Pago de sueldo a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: PAGO YARA'
);

-- 35. PAGO XIME (25/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2840.00,
    '2025-04-25',
    'Pago de sueldo a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: PAGO XIME'
);

-- 36. PAGO KARI (26/04/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    750.00,
    '2025-04-26',
    'Pago de sueldo a empleado Kari',
    'transferencia',
    'pagado',
    'Kari',
    'Reorganizado desde: PAGO KARI - Empleado no encontrado en registro actual'
);

-- 37. BASURA (29/04/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-04-29',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: BASURA'
);

-- 38. TECNICO JAIME RAMIREZ (29/04/2025) - Equipamiento > Reparaciones
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '38ebcea4-ebc4-4363-bdf6-6fefb15354c4', -- Reparaciones
    2827.00,
    '2025-04-29',
    'Servicio técnico por Jaime Ramirez',
    'transferencia',
    'pagado',
    'Jaime Ramirez - Técnico',
    'Reorganizado desde: TECNICO JAIME RAMIREZ'
);

-- 39. DEPOSITO DENTAL 21 (30/04/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    442.97,
    '2025-04-30',
    'Depósito para compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: DEPOSITO DENTAL 21'
);

-- 40. RPBI (30/04/2025) - Instalaciones > Mantenimiento
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'b9b05780-a74c-4d3d-a31f-b2d5035c2723', -- Mantenimiento
    875.00,
    '2025-04-30',
    'Manejo de Residuos Peligrosos Biológico-Infecciosos',
    'transferencia',
    'pagado',
    'Empresa RPBI',
    'Reorganizado desde: RPBI'
);

COMMIT;

-- ============================================
-- RESUMEN DE LA ORGANIZACIÓN - ABRIL 2025
-- ============================================

/*
REORGANIZACIÓN COMPLETADA:

📊 DISTRIBUCIÓN POR CATEGORÍAS:
- Personal: 21 gastos (Sueldos x15, Comisiones Doctores x6)
- Servicios Profesionales: 9 gastos (Laboratorio Dental x8, Honorarios x1)
- Materiales: 6 gastos (Material dental de varios proveedores)
- Instalaciones: 7 gastos (Basura x4, Renta x1, Internet x1, Mantenimiento x1)
- Equipamiento: 1 gasto (Reparaciones técnicas)
- Otros: 1 gasto (CIBAJA - concepto no especificado)

🔧 CAMPOS UTILIZADOS:
- empleado_id: Para Yara (2 pagos) y Ximena (3 pagos) - empleados registrados
- doctor_id: Para Dra Amairany (2 pagos), Dra Ana Laura (2 pagos), Dr Ulises (1 pago)
- proveedor_id: Para Dental 21 (3 compras) y Bodeguita Dental (1 compra)
- laboratorio_id: Para Saúl (5 pagos), Prime (2 pagos)
- proveedor_beneficiario: Para todos los gastos (campo de respaldo)

👥 PERSONAL DESTACADO:
- Dra Amairany: $18,600 en comisiones (2 pagos)
- Dra Ana Laura: $5,764 en comisiones (2 pagos)
- Dr Ulises: $600 en comisiones (1 pago)
- Yara Jiménez: $8,550 en sueldos (2 pagos)
- Ximena López: $7,340 en sueldos (3 pagos)
- Dani: $9,700 en sueldos (4 pagos) - No está registrado como empleado activo
- Karimme/Kari: $2,250 en sueldos (3 pagos) - No está registrada como empleado activo

🏪 PROVEEDORES Y LABORATORIOS PRINCIPALES:
- Dental 21: $9,508.46 en material dental (3 compras + 1 depósito)
- Laboratorio Saúl: $3,800 en servicios (5 trabajos para Guerra)
- Laboratorio Prime: $3,160 en servicios (2 trabajos)
- Bodeguita Dental: $2,458 en material dental (1 compra)

💰 GASTOS DESTACADOS:
- Renta del consultorio: $27,000 (mayor gasto individual)
- Comisiones doctores: $24,964 total
- Servicios de laboratorio: $10,340 total
- Material dental: $12,020.46 total

⚠️ NOTAS IMPORTANTES:
1. Empleados "Dani", "Karimme/Kari" aparecen en nómina pero no están registrados
2. Múltiples pagos a Laboratorio Saúl el mismo día (posiblemente trabajos diferentes)
3. Concepto "CIBAJA" requiere más especificación
4. Pagos regulares de basura ($200 cada ~7 días)
5. Mayor mes en comisiones a doctores: $24,964

💰 TOTAL PROCESADO: $102,507.46 pesos
*/ 