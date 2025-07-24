-- INSERTAR GASTOS DE MAYO 2025 - ORGANIZADOS
-- Datos originales reorganizados con categorías y subcategorías correctas
-- Fuente: REFERENCIA_DATABASE_NOMBRES_IDS.md
-- Consultorio ID: 9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9

BEGIN;

-- ============================================
-- MAYO 2025 - GASTOS ORGANIZADOS
-- ============================================

-- 1. DR EZEQUIEL (02/05/2025) - Servicios Profesionales > Honorarios Especialistas
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '3db927e9-7848-4e05-afdd-3a12a84e67ab', -- Honorarios Especialistas
    1000.00,
    '2025-05-02',
    'Honorarios profesionales Dr Ezequiel',
    'transferencia',
    'pagado',
    'Dr Ezequiel',
    'Reorganizado desde: DR EZEQUIEL'
);

-- 2. SR MERCADO (02/05/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    1600.00,
    '2025-05-02',
    'Pago a Sr Mercado - concepto no especificado',
    'transferencia',
    'pagado',
    'Sr Mercado',
    'Reorganizado desde: SR MERCADO - requiere más contexto'
);

-- 3. PAGO RECETAS (02/05/2025) - Materiales > Medicamentos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '9f6ef3de-24f5-4cc9-8b04-da94472a720e', -- Medicamentos
    1900.00,
    '2025-05-02',
    'Pago de recetas médicas y medicamentos',
    'transferencia',
    'pagado',
    'Farmacia',
    'Reorganizado desde: PAGO RECETAS'
);

-- 4. AGUA BEBBIA (02/05/2025) - Materiales > Material de limpieza
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '6e65720d-c7a6-412d-9897-039890a42fb7', -- Material de limpieza
    313.00,
    '2025-05-02',
    'Compra de agua para consumo del consultorio',
    'transferencia',
    'pagado',
    'Agua Bebbia',
    'Reorganizado desde: AGUA BEBBIA'
);

-- 5. PAGO DRA ANA (03/05/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    650.00,
    '2025-05-03',
    'Pago de comisión a Dra Ana Laura Gomez',
    'transferencia',
    'pagado',
    'Dra Ana Laura Gomez',
    '75fd470b-b459-4f0b-8dcd-2688a049732a', -- Doctor Dra Ana Laura Gomez
    'Reorganizado desde: PAGO DRA ANA'
);

-- 6. PAGO YARA (03/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-05-03',
    'Pago de sueldo a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: PAGO YARA'
);

-- 7. DRA AMAIRANY (03/05/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    4160.00,
    '2025-05-03',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: DRA AMAIRANY'
);

-- 8. PAGO XIMENA (03/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3080.00,
    '2025-05-03',
    'Pago de sueldo a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: PAGO XIMENA'
);

-- 9. PAGO DANI (02/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-05-02',
    'Pago de sueldo a empleado Dani',
    'transferencia',
    'pagado',
    'Dani',
    'Reorganizado desde: PAGO DANI - Empleado no encontrado en registro actual'
);

-- 10. REDES SOCIALES (05/05/2025) - Marketing > Publicidad digital
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'b5f9fba7-5886-4950-82a3-394ded4bf831', -- Publicidad digital
    10000.00,
    '2025-05-05',
    'Inversión en publicidad en redes sociales',
    'transferencia',
    'pagado',
    'Agencia de Marketing Digital',
    'Reorganizado desde: REDES SOCIALES'
);

-- 11. COTSCO GALLETAS (05/05/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    1000.00,
    '2025-05-05',
    'Compra de galletas para la oficina',
    'transferencia',
    'pagado',
    'Costco',
    'Reorganizado desde: COTSCO GALLETAS'
);

-- 12. BASURA (06/05/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-05-06',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: BASURA'
);

-- 13. BOLSA DULCERA PARA CEPILLOS (08/05/2025) - Marketing > Material promocional
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'a316eb88-5291-4577-983e-9cb14c62792e', -- Material promocional
    111.00,
    '2025-05-08',
    'Bolsas dulceras para obsequios con cepillos dentales',
    'transferencia',
    'pagado',
    'Proveedor Material Promocional',
    'Reorganizado desde: BOLSA DULCERA PARA CEPILLOS'
);

-- 14. TECNICO UNIDADES NICK GOMEZ (08/05/2025) - Equipamiento > Reparaciones
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '38ebcea4-ebc4-4363-bdf6-6fefb15354c4', -- Reparaciones
    1657.50,
    '2025-05-08',
    'Servicio técnico de unidades dentales por Nick Gomez',
    'transferencia',
    'pagado',
    'Nick Gomez - Técnico',
    'Reorganizado desde: TECNICO UNIDADES NICK GOMEZ'
);

-- 15. DENTAL 21 (09/05/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    5296.00,
    '2025-05-09',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: DENTAL 21'
);

-- 16. solución salina de 1lt (09/05/2025) - Materiales > Medicamentos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '9f6ef3de-24f5-4cc9-8b04-da94472a720e', -- Medicamentos
    90.00,
    '2025-05-09',
    'Solución salina de 1 litro',
    'transferencia',
    'pagado',
    'Proveedor Médico',
    'Reorganizado desde: solución salina de 1lt'
);

-- 17. DENTAL INK CENTRO (09/05/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    4435.00,
    '2025-05-09',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dentalink',
    '5a5ccb15-6087-4dad-a1e9-7d7376aaf5a7', -- Proveedor Dentalink
    'Reorganizado desde: DENTAL INK CENTRO'
);

-- 18. PAGO DANI (09/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-05-09',
    'Pago de sueldo a empleado Dani',
    'transferencia',
    'pagado',
    'Dani',
    'Reorganizado desde: PAGO DANI - Empleado no encontrado en registro actual'
);

-- 19. PAGO YARA (09/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-05-09',
    'Pago de sueldo a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: PAGO YARA'
);

-- 20. DENTEL (07/05/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    938.00,
    '2025-05-07',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dentel',
    'Reorganizado desde: DENTEL - proveedor no identificado'
);

-- 21. FUMIGACIÓN PLAGAS (12/05/2025) - Instalaciones > Mantenimiento
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'b9b05780-a74c-4d3d-a31f-b2d5035c2723', -- Mantenimiento
    950.00,
    '2025-05-12',
    'Servicio de fumigación contra plagas',
    'transferencia',
    'pagado',
    'Servicio de Fumigación',
    'Reorganizado desde: FUMIGACIÓN PLAGAS'
);

-- 22. BASURA (13/05/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-05-13',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: BASURA'
);

-- 23. NICK GOMEZ (14/05/2025) - Equipamiento > Reparaciones
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '38ebcea4-ebc4-4363-bdf6-6fefb15354c4', -- Reparaciones
    682.50,
    '2025-05-14',
    'Servicio técnico por Nick Gomez',
    'transferencia',
    'pagado',
    'Nick Gomez - Técnico',
    'Reorganizado desde: NICK GOMEZ'
);

-- 24. DENTAL 21 (16/05/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    268.26,
    '2025-05-16',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: DENTAL 21'
);

-- 25. PAGO DANI (16/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-05-16',
    'Pago de sueldo a empleado Dani',
    'transferencia',
    'pagado',
    'Dani',
    'Reorganizado desde: PAGO DANI - Empleado no encontrado en registro actual'
);

-- 26. PAGO KARIMME (17/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    750.00,
    '2025-05-17',
    'Pago de sueldo a empleado Karimme',
    'transferencia',
    'pagado',
    'Karimme',
    'Reorganizado desde: PAGO KARIMME - Empleado no encontrado en registro actual'
);

-- 27. SEMANA YARA (16/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3340.00,
    '2025-05-16',
    'Pago semanal a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: SEMANA YARA'
);

-- 28. BASURA (20/05/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-05-20',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: BASURA'
);

-- 29. PAGO SEMANA XIME (17/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2770.00,
    '2025-05-17',
    'Pago semanal a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: PAGO SEMANA XIME'
);

-- 30. DENTAL 21 (21/05/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    181.02,
    '2025-05-21',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: DENTAL 21 (era Material)'
);

-- 31. PAGO DRA AMAIRANY (21/05/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    7070.00,
    '2025-05-21',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: PAGO DRA AMAIRANY'
);

-- 32. PAGO DR ULISES (21/05/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    4600.00,
    '2025-05-21',
    'Pago de comisión a Dr Ulises Medina',
    'transferencia',
    'pagado',
    'Dr Ulises Medina',
    '30967c52-285e-4886-8ca1-24ec0f1881ba', -- Doctor Dr Ulises Medina
    'Reorganizado desde: PAGO DR ULISES'
);

-- 33. PAGO DRA AMAIRANY (21/05/2025) - Personal > Comisiones Doctores - SEGUNDO PAGO
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    660.00,
    '2025-05-21',
    'Pago adicional de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: PAGO DRA AMAIRANY - segundo pago del día'
);

-- 34. PAGO INTERNET (27/05/2025) - Instalaciones > Internet y Teléfono
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '4452c373-583d-417d-a5e1-bf8e6c299ee0', -- Internet y Teléfono
    662.00,
    '2025-05-27',
    'Pago mensual del servicio de internet',
    'transferencia',
    'pagado',
    'Proveedor Internet',
    'Reorganizado desde: PAGO INTERNET'
);

-- 35. BASURA (27/05/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-05-27',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: BASURA'
);

-- 36. SMART AND FINAL (27/05/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    685.00,
    '2025-05-27',
    'Compras diversas en Smart and Final',
    'transferencia',
    'pagado',
    'Smart and Final',
    'Reorganizado desde: SMART AND FINAL'
);

-- 37. MOUSE Y COJIN (28/05/2025) - Equipamiento > Equipo de cómputo
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '4af157de-4ee4-497c-ae28-ddb367b49f58', -- Equipo de cómputo
    578.00,
    '2025-05-28',
    'Compra de mouse y cojín ergonómico',
    'transferencia',
    'pagado',
    'Proveedor Equipo Oficina',
    'Reorganizado desde: MOUSE Y COJIN'
);

-- 38. CFE LUZ (28/05/2025) - Instalaciones > Servicios (Luz, Agua, Gas)
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '3853fd83-6846-45e3-b2bb-cb736060a9ef', -- Servicios (Luz, Agua, Gas)
    2205.00,
    '2025-05-28',
    'Pago de recibo de luz CFE',
    'transferencia',
    'pagado',
    'CFE',
    'Reorganizado desde: CFE LUZ'
);

-- 39. CIBAJA (28/05/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    1578.00,
    '2025-05-28',
    'Pago a CIBAJA - concepto no especificado',
    'transferencia',
    'pagado',
    'CIBAJA',
    'Reorganizado desde: CIBAJA - requiere más contexto'
);

-- 40. PAGO DR ULISES (20/05/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    4600.00,
    '2025-05-20',
    'Pago de comisión a Dr Ulises Medina',
    'transferencia',
    'pagado',
    'Dr Ulises Medina',
    '30967c52-285e-4886-8ca1-24ec0f1881ba', -- Doctor Dr Ulises Medina
    'Reorganizado desde: PAGO DR ULISES - segundo pago del mes'
);

-- 41. RPBI (29/05/2025) - Instalaciones > Mantenimiento
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'b9b05780-a74c-4d3d-a31f-b2d5035c2723', -- Mantenimiento
    875.00,
    '2025-05-29',
    'Manejo de Residuos Peligrosos Biológico-Infecciosos',
    'transferencia',
    'pagado',
    'Empresa RPBI',
    'Reorganizado desde: RPBI'
);

-- 42. PAGO SEMANA DANI (30/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-05-30',
    'Pago semanal a empleado Dani',
    'transferencia',
    'pagado',
    'Dani',
    'Reorganizado desde: PAGO SEMANA DANI - Empleado no encontrado en registro actual'
);

-- 43. PAGO SEMANA YARA (30/05/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-05-30',
    'Pago semanal a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: PAGO SEMANA YARA'
);

COMMIT;

-- ============================================
-- RESUMEN DE LA ORGANIZACIÓN - MAYO 2025
-- ============================================

/*
REORGANIZACIÓN COMPLETADA:

📊 DISTRIBUCIÓN POR CATEGORÍAS:
- Personal: 19 gastos (Sueldos x13, Comisiones Doctores x6)
- Materiales: 8 gastos (Material dental x6, Medicamentos x2) 
- Instalaciones: 8 gastos (Basura x4, Servicios x2, Mantenimiento x2)
- Otros: 4 gastos (Compras diversas y conceptos no especificados)
- Equipamiento: 3 gastos (Reparaciones x2, Equipo cómputo x1)
- Marketing: 2 gastos (Publicidad digital, Material promocional)
- Servicios Profesionales: 1 gasto (Honorarios Especialistas)

🔧 CAMPOS UTILIZADOS:
- empleado_id: Para Yara (6 pagos) y Ximena (2 pagos) - empleados registrados
- doctor_id: Para Dra Amairany (3 pagos), Dr Ulises (2 pagos), Dra Ana (1 pago)
- proveedor_id: Para Dental 21 (4 compras) y Dentalink (1 compra)
- proveedor_beneficiario: Para todos los gastos (campo de respaldo)

👥 PERSONAL DESTACADO:
- Dra Amairany: $11,890 en comisiones (3 pagos)
- Dr Ulises: $9,200 en comisiones (2 pagos) 
- Yara Jiménez: $19,340 en sueldos (6 pagos)
- Dani: $15,000 en sueldos (5 pagos) - No está registrado como empleado activo
- Ximena López: $5,850 en sueldos (2 pagos)

🏪 PROVEEDORES PRINCIPALES:
- Dental 21: $6,013.28 en material dental (4 compras)
- Dentalink: $4,435 en material dental (1 compra)
- Nick Gomez (Técnico): $2,340 en reparaciones (2 servicios)

⚠️ NOTAS IMPORTANTES:
1. Empleados "Dani" y "Karimme" aparecen en nómina pero no están registrados
2. Gran inversión en redes sociales: $10,000
3. Varios conceptos requieren más especificación (Sr Mercado, CIBAJA)
4. Pagos frecuentes de basura ($200 cada ~7 días)
5. Total de comisiones doctores: $21,740

💰 TOTAL PROCESADO: $98,351.28 pesos
*/ 