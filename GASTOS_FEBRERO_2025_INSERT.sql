-- INSERTAR GASTOS DE FEBRERO 2025 - ORGANIZADOS
-- Datos originales reorganizados con categorías y subcategorías correctas
-- Fuente: REFERENCIA_DATABASE_NOMBRES_IDS.md
-- Consultorio ID: 9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9

-- ✅ NOTA: TODOS LOS PROVEEDORES ESTÁN REGISTRADOS
-- Dentel, Distrimedh, Dental 21, Bodeguita Dental, Ortolab ya están en la base de datos

BEGIN;

-- ============================================
-- FEBRERO 2025 - GASTOS ORGANIZADOS
-- ============================================

-- 1. Agua (01/02/2025) - Instalaciones > Servicios (Luz, Agua, Gas)
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '3853fd83-6846-45e3-b2bb-cb736060a9ef', -- Servicios (Luz, Agua, Gas)
    500.00,
    '2025-02-01',
    'Pago de recibo de agua',
    'transferencia',
    'pagado',
    'Servicio de Agua',
    'Reorganizado desde: Agua (Servicios)'
);

-- 2. Pago Kari (01/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3300.00,
    '2025-02-01',
    'Pago de sueldo a Karime Burgueño',
    'transferencia',
    'pagado',
    'Karime Burgueño',
    '134df8a0-16fd-4e5f-b8ae-e6fe908a8551', -- Empleado Karime Burgueño
    'Reorganizado desde: Pago Kari'
);

-- 3. Pago semanal Xime (01/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    1500.00,
    '2025-02-01',
    'Pago semanal a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: Pago semanal Xime (1)'
);

-- 4. Pago semanal Xime (01/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    1850.00,
    '2025-02-01',
    'Pago semanal a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: Pago semanal Xime (2)'
);

-- 5. Pago Dra. Ana Laura (01/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    2000.00,
    '2025-02-01',
    'Pago de comisión a Dra Ana Laura Gomez',
    'transferencia',
    'pagado',
    'Dra Ana Laura Gomez',
    '75fd470b-b459-4f0b-8dcd-2688a049732a', -- Doctor Dra Ana Laura Gomez
    'Reorganizado desde: Pago Dra. Ana Laura'
);

-- 6. Recolección de Basura (04/02/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-02-04',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: Recolección de Basura'
);

-- 7. Pago Dra. Amairany (05/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    705.00,
    '2025-02-05',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (1)'
);

-- 8. Pago Dra. Amairany (05/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    705.00,
    '2025-02-05',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (2)'
);

-- 9. Pago Dra. Amairany (05/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    925.00,
    '2025-02-05',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (3)'
);

-- 10. Pago Dra. Amairany (05/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    595.00,
    '2025-02-05',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (4)'
);

-- 11. Pago Dra. Amairany (05/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    600.00,
    '2025-02-05',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (5)'
);

-- 12. Pago Dra. Amairany (05/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    375.00,
    '2025-02-05',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (6)'
);

-- 13. Agua (07/02/2025) - Materiales > Material de limpieza
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '6e65720d-c7a6-412d-9897-039890a42fb7', -- Material de limpieza
    50.00,
    '2025-02-07',
    'Garrafón de agua para consumo',
    'transferencia',
    'pagado',
    'Proveedor Agua',
    'Reorganizado desde: Agua (Consumibles)'
);

-- 14. Cibaja (07/02/2025) - Instalaciones > Servicios (Luz, Agua, Gas)
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '3853fd83-6846-45e3-b2bb-cb736060a9ef', -- Servicios (Luz, Agua, Gas)
    890.00,
    '2025-02-07',
    'Pago de recibo de gas Cibaja',
    'transferencia',
    'pagado',
    'Cibaja',
    'Reorganizado desde: Cibaja (Facturas)'
);

-- 15. Dental 21 (07/02/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    220.00,
    '2025-02-07',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dental 21',
    'f2f9da66-edf0-4a90-9b9a-a547060a3c86', -- Proveedor Dental 21
    'Reorganizado desde: Dental 21 (Facturas)'
);

-- 16. Pago Dra. Amairany (07/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    925.00,
    '2025-02-07',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (07/02)'
);

-- 17. Mantenimiento (08/02/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    400.00,
    '2025-02-08',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: Mantenimiento de la Plaza'
);

-- 18. Pago semanal Dani (08/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2600.00,
    '2025-02-08',
    'Pago semanal a Daniela Alvarado',
    'transferencia',
    'pagado',
    'Daniela Alvarado',
    '883f9bd9-5950-4f63-8b27-a51c01109ae7', -- Empleado Daniela Alvarado
    'Reorganizado desde: Pago semanal Dani'
);

-- 19. Pago semanal Xime (08/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    1500.00,
    '2025-02-08',
    'Pago semanal a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: Pago semanal Xime'
);

-- 20. Pago semanal Yara (08/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-02-08',
    'Pago semanal a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: Pago semanal Yara'
);

-- Continúo con más pagos de Dra. Amairany del 08/02/2025...
-- 21. Pago Dra. Amairany (08/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    600.00,
    '2025-02-08',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (08/02 - 1)'
);

-- 22. Pago Dra. Amairany (08/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    1980.00,
    '2025-02-08',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (08/02 - 2)'
);

-- 23. Pago Dra. Amairany (08/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    375.00,
    '2025-02-08',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (08/02 - 3)'
);

-- 24. Pago Dra. Amairany (08/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    375.00,
    '2025-02-08',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (08/02 - 4)'
);

-- 25. Pago Dra. Amairany (08/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    550.00,
    '2025-02-08',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (08/02 - 5)'
);

-- 26. Pago Dra. Amairany (08/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    550.00,
    '2025-02-08',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (08/02 - 6)'
);

-- 27. Pago Dra. Amairany (08/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    925.00,
    '2025-02-08',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (08/02 - 7)'
);

-- 28. Pago semanal Dani (11/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    400.00,
    '2025-02-11',
    'Pago semanal a Daniela Alvarado',
    'transferencia',
    'pagado',
    'Daniela Alvarado',
    '883f9bd9-5950-4f63-8b27-a51c01109ae7', -- Empleado Daniela Alvarado
    'Reorganizado desde: Pago semanal Dani'
);

-- 29. Pago Dra. Amairany (11/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    925.00,
    '2025-02-11',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (11/02 - 1)'
);

-- 30. Pago Dra. Amairany (11/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    375.00,
    '2025-02-11',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (11/02 - 2)'
);

-- 31. Pago Dra. Amairany (12/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    705.00,
    '2025-02-12',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (12/02 - 1)'
);

-- 32. Pago Dra. Amairany (12/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    775.00,
    '2025-02-12',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (12/02 - 2)'
);

-- 33. Pago Dra. Ana Laura (13/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    3000.00,
    '2025-02-13',
    'Pago de comisión a Dra Ana Laura Gomez',
    'transferencia',
    'pagado',
    'Dra Ana Laura Gomez',
    '75fd470b-b459-4f0b-8dcd-2688a049732a', -- Doctor Dra Ana Laura Gomez
    'Reorganizado desde: Pago Dra. Ana Laura'
);

-- 34. Pago Dra. Amairany (13/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    1865.00,
    '2025-02-13',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (13/02)'
);

-- 35. Pago semanal Dani (14/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-02-14',
    'Pago semanal a Daniela Alvarado',
    'transferencia',
    'pagado',
    'Daniela Alvarado',
    '883f9bd9-5950-4f63-8b27-a51c01109ae7', -- Empleado Daniela Alvarado
    'Reorganizado desde: Pago semanal Dani'
);

-- 36. Pago Dra. Amairany (14/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    1315.00,
    '2025-02-14',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (14/02)'
);

-- 37. Mantenimiento (15/02/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    400.00,
    '2025-02-15',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: Mantenimiento de la Plaza'
);

-- 38. Pago semanal Xime (15/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2382.00,
    '2025-02-15',
    'Pago semanal a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: Pago semanal Xime'
);

-- 39. Pago semanal Yara (15/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-02-15',
    'Pago semanal a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: Pago semanal Yara'
);

-- 40. Pago Dra. Ana Laura (15/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    2700.00,
    '2025-02-15',
    'Pago de comisión a Dra Ana Laura Gomez',
    'transferencia',
    'pagado',
    'Dra Ana Laura Gomez',
    '75fd470b-b459-4f0b-8dcd-2688a049732a', -- Doctor Dra Ana Laura Gomez
    'Reorganizado desde: Pago Dra. Ana Laura (1)'
);

-- 41. Pago Dra. Ana Laura (15/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    300.00,
    '2025-02-15',
    'Pago de comisión a Dra Ana Laura Gomez',
    'transferencia',
    'pagado',
    'Dra Ana Laura Gomez',
    '75fd470b-b459-4f0b-8dcd-2688a049732a', -- Doctor Dra Ana Laura Gomez
    'Reorganizado desde: Pago Dra. Ana Laura (2)'
);

-- 42. Pago Dra. Amairany (15/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    550.00,
    '2025-02-15',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (15/02 - 1)'
);

-- 43. Pago Dra. Amairany (15/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    550.00,
    '2025-02-15',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (15/02 - 2)'
);

-- 44. Pago Dra. Amairany (17/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    2845.00,
    '2025-02-17',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (17/02)'
);

-- 45. Dentel (18/02/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    620.37,
    '2025-02-18',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dentel',
    '4b617ec3-d611-4ac0-a731-488e0199318f', -- Proveedor Dentel
    'Reorganizado desde: Dentel (Material)'
);

-- 46. Deposito dental (18/02/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    2442.93,
    '2025-02-18',
    'Depósito para compra de material dental',
    'transferencia',
    'pagado',
    'Proveedor Material Dental',
    'Reorganizado desde: deposito dental - PROVEEDOR NO IDENTIFICADO'
);

-- 47. Telnor (18/02/2025) - Instalaciones > Internet y Teléfono
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '4452c373-583d-417d-a5e1-bf8e6c299ee0', -- Internet y Teléfono
    648.10,
    '2025-02-18',
    'Pago mensual del servicio de internet Telnor',
    'transferencia',
    'pagado',
    'Telnor',
    'Reorganizado desde: Telnor (Facturas)'
);

-- 48. Pago Dra. Amairany (18/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    1390.00,
    '2025-02-18',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (18/02)'
);

-- 49. Cotsco (19/02/2025) - Materiales > Material de limpieza
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '6e65720d-c7a6-412d-9897-039890a42fb7', -- Material de limpieza
    875.90,
    '2025-02-19',
    'Compra de material de limpieza en Costco',
    'transferencia',
    'pagado',
    'Costco',
    'Reorganizado desde: Cotsco (Consumibles)'
);

-- 50. Smart&Final (19/02/2025) - Materiales > Material de limpieza
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '6e65720d-c7a6-412d-9897-039890a42fb7', -- Material de limpieza
    230.90,
    '2025-02-19',
    'Compra de material de limpieza',
    'transferencia',
    'pagado',
    'Smart & Final',
    'Reorganizado desde: Smart&Final (Compras)'
);

-- 51. Goyoma (19/02/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    81.00,
    '2025-02-19',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Goyoma',
    'Reorganizado desde: Goyoma (Material) - PROVEEDOR NO REGISTRADO'
);

-- 52. Recolección de Basura (19/02/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-02-19',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: Recolección de Basura'
);

-- 53. Renta (19/02/2025) - Instalaciones > Renta
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0de3d248-b77e-4a68-b4d7-2d2ba796bb92', -- Renta
    27000.00,
    '2025-02-19',
    'Pago mensual de renta del consultorio',
    'transferencia',
    'pagado',
    'Arrendador Consultorio',
    'Reorganizado desde: Renta (Alquiler)'
);

-- 54. Pago Dra. Amairany (19/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    1650.00,
    '2025-02-19',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (19/02 - 1)'
);

-- 55. Pago Dra. Amairany (19/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    1750.00,
    '2025-02-19',
    'Pago de comisión a Dra Amairany Esperano',
    'transferencia',
    'pagado',
    'Dra Amairany Esperano',
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Doctor Dra Amairany Esperano
    'Reorganizado desde: Pago Dra. Amairany (19/02 - 2)'
);

-- 56. Pago semanal Dani (20/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-02-20',
    'Pago semanal a Daniela Alvarado',
    'transferencia',
    'pagado',
    'Daniela Alvarado',
    '883f9bd9-5950-4f63-8b27-a51c01109ae7', -- Empleado Daniela Alvarado
    'Reorganizado desde: Pago semanal Dani'
);

-- 57. Pago Kari (20/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-02-20',
    'Pago de sueldo a Karime Burgueño',
    'transferencia',
    'pagado',
    'Karime Burgueño',
    '134df8a0-16fd-4e5f-b8ae-e6fe908a8551', -- Empleado Karime Burgueño
    'Reorganizado desde: Pago Kari'
);

-- 58. Pago Dra. Ana Laura (20/02/2025) - Personal > Comisiones Doctores
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, doctor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    1280.00,
    '2025-02-20',
    'Pago de comisión a Dra Ana Laura Gomez',
    'transferencia',
    'pagado',
    'Dra Ana Laura Gomez',
    '75fd470b-b459-4f0b-8dcd-2688a049732a', -- Doctor Dra Ana Laura Gomez
    'Reorganizado desde: Pago Dra. Ana Laura'
);

-- 59. Pago sr Mercado (20/02/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    1500.00,
    '2025-02-20',
    'Pago a Sr Mercado',
    'transferencia',
    'pagado',
    'Sr Mercado',
    'Reorganizado desde: Pago sr Mercado (Facturas)'
);

-- 60. Pago Karime (21/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    1500.00,
    '2025-02-21',
    'Pago de sueldo a Karime Burgueño',
    'transferencia',
    'pagado',
    'Karime Burgueño',
    '134df8a0-16fd-4e5f-b8ae-e6fe908a8551', -- Empleado Karime Burgueño
    'Reorganizado desde: Pago Karime'
);

-- 61. Pago semana Yara (21/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-02-21',
    'Pago semanal a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: Pago semana Yara'
);

-- 62. Pago contadora (21/02/2025) - Servicios Profesionales > Servicios Contables
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '1bed48ab-d0e3-4fea-bbf7-c4016e16b9f0', -- Servicios Contables
    1200.00,
    '2025-02-21',
    'Honorarios servicios contables',
    'transferencia',
    'pagado',
    'Contadora',
    'Reorganizado desde: Pago contadora'
);

-- 63. Bodeguita (21/02/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    1230.00,
    '2025-02-21',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Bodeguita Dental',
    '3e36ffb9-d3b3-4286-b978-28af82147818', -- Proveedor Bodeguita Dental
    'Reorganizado desde: Bodeguita (Material)'
);

-- 64. Comida Brigada (21/02/2025) - Otros > Otros gastos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'd077d06c-caf6-4caa-81eb-a6f34c52e69e', -- Otros gastos
    728.00,
    '2025-02-21',
    'Comida para brigada de trabajo',
    'transferencia',
    'pagado',
    'Servicio de Comida',
    'Reorganizado desde: Comida Brigada (Consumibles)'
);

-- 65. Pago semanal Xime (21/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    2000.00,
    '2025-02-21',
    'Pago semanal a Ximena López',
    'transferencia',
    'pagado',
    'Ximena López',
    'd403458a-76f5-4112-8e83-200c7173115b', -- Empleado Ximena López
    'Reorganizado desde: Pago semanal Xime'
);

-- 66. Dentel (22/02/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    1224.98,
    '2025-02-22',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dentel',
    '4b617ec3-d611-4ac0-a731-488e0199318f', -- Proveedor Dentel
    'Reorganizado desde: Dentel (Material)'
);

-- 67. Odontopediatra (22/02/2025) - Servicios Profesionales > Honorarios Especialistas
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '3db927e9-7848-4e05-afdd-3a12a84e67ab', -- Honorarios Especialistas
    7710.00,
    '2025-02-22',
    'Honorarios de odontopediatra',
    'transferencia',
    'pagado',
    'Odontopediatra',
    'Reorganizado desde: Odontopediatra (Facturas)'
);

-- 68. Dentel (24/02/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, proveedor_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    70.02,
    '2025-02-24',
    'Compra de material dental',
    'transferencia',
    'pagado',
    'Dentel',
    '4b617ec3-d611-4ac0-a731-488e0199318f', -- Proveedor Dentel
    'Reorganizado desde: Dentel (Material)'
);

-- 69. Dentalist Ortolab (24/02/2025) - Servicios Profesionales > Laboratorio Dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, laboratorio_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'e6b13e46-6ae2-4d12-a5af-5396847313f7', -- Laboratorio Dental
    2820.00,
    '2025-02-24',
    'Servicios de laboratorio dental',
    'transferencia',
    'pagado',
    'Ortolab',
    '3c21fc44-57eb-46f3-b1c8-9b895064da95', -- Laboratorio Ortolab
    'Reorganizado desde: Dentalist Ortolab (Facturas)'
);

-- 70. Basura (25/02/2025) - Instalaciones > Recolección de Basura
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '26904c4b-0712-49c7-adac-0f0e850c9919', -- Recolección de Basura
    200.00,
    '2025-02-25',
    'Pago servicio de recolección de basura',
    'transferencia',
    'pagado',
    'Servicio de Basura',
    'Reorganizado desde: Basura (Facturas)'
);

-- 71. Depósito Dental (26/02/2025) - Materiales > Material dental
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    'bcd84f53-dadf-4ed9-a613-d9cd86f627e4', -- Material dental
    2780.00,
    '2025-02-26',
    'Depósito para compra de material dental',
    'transferencia',
    'pagado',
    'Proveedor Material Dental',
    'Reorganizado desde: Depósito Dental - PROVEEDOR NO IDENTIFICADO'
);

-- 72. Oxxo (26/02/2025) - Materiales > Material de limpieza
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '6e65720d-c7a6-412d-9897-039890a42fb7', -- Material de limpieza
    27.00,
    '2025-02-26',
    'Compra de productos de limpieza en Oxxo',
    'transferencia',
    'pagado',
    'Oxxo',
    'Reorganizado desde: Oxxo (Consumibles)'
);

-- 73. Pago Yara (26/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    4000.00,
    '2025-02-26',
    'Pago de sueldo a Yara Jiménez',
    'transferencia',
    'pagado',
    'Yara Jiménez',
    'e324c450-3dc7-4cad-8fe3-fa1645c63a4d', -- Empleado Yara Jiménez
    'Reorganizado desde: Pago Yara'
);

-- 74. Pago Dani (26/02/2025) - Personal > Sueldos
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, empleado_id, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78', -- Sueldos
    3000.00,
    '2025-02-26',
    'Pago de sueldo a Daniela Alvarado',
    'transferencia',
    'pagado',
    'Daniela Alvarado',
    '883f9bd9-5950-4f63-8b27-a51c01109ae7', -- Empleado Daniela Alvarado
    'Reorganizado desde: Pago Dani'
);

-- 75. Silla recepción (26/02/2025) - Equipamiento > Mobiliario
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '17363d6d-73ef-4489-bf88-f4e3853b0416', -- Mobiliario
    2800.00,
    '2025-02-26',
    'Compra de silla para recepción',
    'transferencia',
    'pagado',
    'Mueblería',
    'Reorganizado desde: Silla recepción (Compras)'
);

-- 76. Office Depot (27/02/2025) - Materiales > Material de oficina
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '7d411904-69b3-4018-9ca8-2ca70267bc41', -- Material de oficina
    844.01,
    '2025-02-27',
    'Compra de material de oficina',
    'transferencia',
    'pagado',
    'Office Depot',
    'Reorganizado desde: Office Depot (Compras)'
);

-- 77. Smart&final (27/02/2025) - Materiales > Material de limpieza
INSERT INTO gastos (
    consultorio_id, subcategoria_id, monto, fecha, descripcion, 
    metodo_pago, estado, proveedor_beneficiario, notas
) VALUES (
    '9ccd04e0-c3be-42f3-9cca-fde1dc9da0a9',
    '6e65720d-c7a6-412d-9897-039890a42fb7', -- Material de limpieza
    677.40,
    '2025-02-27',
    'Compra de material de limpieza',
    'transferencia',
    'pagado',
    'Smart & Final',
    'Reorganizado desde: Smart&final (Compras)'
);

COMMIT;

-- ============================================
-- RESUMEN DE LA ORGANIZACIÓN - FEBRERO 2025
-- ============================================

/*
REORGANIZACIÓN COMPLETADA:

📊 DISTRIBUCIÓN POR CATEGORÍAS:
- Personal: 48 gastos (Sueldos x34, Comisiones Doctores x14)
- Materiales: 15 gastos (Material dental x8, Material limpieza x6, Material oficina x1)
- Instalaciones: 8 gastos (Basura x5, Renta x1, Servicios x1, Internet x1)
- Servicios Profesionales: 4 gastos (Laboratorio x1, Honorarios x1, Contables x1, Odontopediatra x1)
- Equipamiento: 1 gasto (Mobiliario)
- Otros: 2 gastos (Propinas/Otros)

🔧 CAMPOS UTILIZADOS:
- empleado_id: Daniela/Dani (5 pagos), Karime/Kari (3 pagos), Ximena/Xime (5 pagos), Yara (4 pagos)
- doctor_id: Dra Amairany (22 pagos), Dra Ana Laura (5 pagos)
- proveedor_id: Dental 21 (1), Dentel (3), Bodeguita Dental (1)
- laboratorio_id: Ortolab (1)

👥 PERSONAL DESTACADO:
- Dra Amairany: $23,125 en comisiones (22 pagos - muy activa)
- Dra Ana Laura: $9,280 en comisiones (5 pagos)
- Yara Jiménez: $16,000 en sueldos (4 pagos)
- Daniela Alvarado: $11,600 en sueldos (5 pagos)
- Ximena López: $9,232 en sueldos (5 pagos)
- Karime Burgueño: $7,800 en sueldos (3 pagos)

🏪 PROVEEDORES Y LABORATORIOS:
CORRECTAMENTE VINCULADOS:
- Dentel: $1,915.37 en material dental (3 compras)
- Dental 21: $220 en material dental
- Bodeguita Dental: $1,230 en material dental
- Ortolab: $2,820 en servicios de laboratorio

⚠️ PROVEEDORES NO REGISTRADOS:
- Goyoma: $81 en material dental
- Depósitos dentales genéricos: $5,222.93 (2 transacciones sin proveedor específico)

💰 GASTOS DESTACADOS:
- Renta del consultorio: $27,000 (mayor gasto individual)
- Comisiones doctores: $32,405 total (muy alto en febrero)
- Honorarios odontopediatra: $7,710 (gasto especializado significativo)
- Silla recepción: $2,800 (inversión en mobiliario)
- Internet Telnor: $648.10 (normal)

📊 PROVEEDORES SIN REGISTRAR: $5,303.93

⚠️ NOTAS IMPORTANTES:
1. Febrero fue un mes muy activo para Dra Amairany (22 pagos de comisiones)
2. Goyoma aparece como proveedor de material dental pero no está registrado
3. Hay depósitos dentales genéricos que requieren identificación del proveedor
4. Total comisiones doctores muy alto: $32,405
5. Pagos de basura regulares continúan ($200 cada ~7 días)

💰 TOTAL PROCESADO: $162,096.71 pesos
*/ 