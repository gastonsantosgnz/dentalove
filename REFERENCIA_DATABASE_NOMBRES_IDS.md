# 📊 REFERENCIA DATABASE - NOMBRES E IDs

## 🎯 **Propósito del Documento**
Este documento contiene todos los nombres e IDs de las entidades principales de la base de datos del consultorio dental. Se utiliza como referencia para crear códigos SQL y organizar datos de acuerdo a esta información.

## 📋 **Estructura de Tablas y Campos**

### **Nombres de Campos por Tabla:**
- **Categorías**: `categorias_gastos.nombre`
- **Subcategorías**: `subcategorias_gastos.nombre`  
- **Empleados**: `empleados.nombre_completo`
- **Doctores**: `doctores.nombre_completo`
- **Laboratorios**: `laboratorios.nombre_laboratorio`
- **Proveedores**: `proveedores.nombre_comercial`

---

## 🗂️ **CATEGORÍAS**
**Tabla:** `categorias_gastos` | **Campo Nombre:** `nombre`

```sql
-- Consulta de referencia:
SELECT id, nombre FROM categorias_gastos;
```

| ID | Nombre |
|---|---|
| 46924825-af4c-40f4-89ef-c59839600cfd | Equipamiento |
| 7dd0a5ab-26e8-4c66-87cf-9cbdf6a98f91 | Instalaciones |
| eca83586-f85b-4652-b0e9-96de56bc632a | Marketing |
| 8ef37521-de19-4608-8f59-b8c1b5af3055 | Materiales |
| 22cb0223-81e1-4885-bf70-0ab23bec3c19 | Obligaciones Fiscales |
| 357530b9-14bb-4dd7-b3b8-32cc94a40f15 | Otros |
| cebc0026-3f74-4e65-a514-6f71cd859d03 | Personal |
| eb7dde62-9878-4f73-a3b3-3f395f76d80d | Servicios Profesionales |

---

## 🏷️ **SUBCATEGORÍAS** 
**Tabla:** `subcategorias_gastos` | **Campo Nombre:** `nombre`

```sql
-- Consulta de referencia:
SELECT id, nombre FROM subcategorias_gastos;
```

| ID | Nombre |
|---|---|
| 71d46cfe-7261-4c17-b9de-480539c3cd9f | Capacitación |
| ca5ae4a4-61a8-4a13-b092-9b7bc77f390f | Comisiones Doctores |
| 416947e9-29e4-48f6-b08e-bda6ae55d13f | Cuotas IMSS |
| 4af157de-4ee4-497c-ae28-ddb367b49f58 | Equipo de cómputo |
| 77f0de94-e45b-4546-b3bc-0a21f62529bb | Equipo dental |
| f05e9842-59fc-4ae8-9bb9-e4c4e165901c | Eventos |
| ce73224a-e947-4ee7-a52d-db4c73da67c9 | Gastos bancarios |
| 3db927e9-7848-4e05-afdd-3a12a84e67ab | Honorarios Especialistas |
| 3e1003bb-12f4-453b-9d3a-5f326bc12aca | Impuestos |
| 6ffa4cff-2734-4fe7-9802-93eebcb29ea1 | Impuestos Federales |
| 7cb9b450-f57e-499c-bfaf-114a52dc70ab | Impuestos Locales |
| 4452c373-583d-417d-a5e1-bf8e6c299ee0 | Internet y Teléfono |
| e6b13e46-6ae2-4d12-a5af-5396847313f7 | Laboratorio Dental |
| b9b05780-a74c-4d3d-a31f-b2d5035c2723 | Mantenimiento |
| 6e65720d-c7a6-412d-9897-039890a42fb7 | Material de limpieza |
| bcd84f53-dadf-4ed9-a613-d9cd86f627e4 | Material dental |
| 7d411904-69b3-4018-9ca8-2ca70267bc41 | Material de oficina |
| a316eb88-5291-4577-983e-9cb14c62792e | Material promocional |
| 9f6ef3de-24f5-4cc9-8b04-da94472a720e | Medicamentos |
| 17363d6d-73ef-4489-bf88-f4e3853b0416 | Mobiliario |
| d077d06c-caf6-4caa-81eb-a6f34c52e69e | Otros gastos |
| e9f0efd6-f127-455e-8a5e-6fc4fa045c85 | Pases Médicos |
| 82d44bec-a78b-48d8-a431-db4c7775665b | Prestaciones |
| b5f9fba7-5886-4950-82a3-394ded4bf831 | Publicidad digital |
| 26904c4b-0712-49c7-adac-0f0e850c9919 | Recolección de Basura |
| 0de3d248-b77e-4a68-b4d7-2d2ba796bb92 | Renta |
| 38ebcea4-ebc4-4363-bdf6-6fefb15354c4 | Reparaciones |
| 5727a1ea-c6f8-4591-8567-780fe196e87a | Seguridad |
| 81f8a615-820b-4157-bf77-cda5897cbb3e | Seguros |
| 55a19ea5-3026-4598-a90b-d6ff65268f04 | Seguros |
| 1bed48ab-d0e3-4fea-bbf7-c4016e16b9f0 | Servicios Contables |
| 6ffb7bfd-2999-418f-8f2a-5beb4cb7fe88 | Servicios de Limpieza |
| 83fb8dd4-3289-4e24-a9cc-caa83f838c2c | Servicios Legales |
| 3853fd83-6846-45e3-b2bb-cb736060a9ef | Servicios (Luz, Agua, Gas) |
| 6e74f0a7-16ec-4e99-be57-cfcfa369e6c7 | Servicios Médicos |
| 0f77ebc4-0d12-4bf8-9fa7-6ead0b81ab78 | Sueldos |
| 5f27a3e2-bc7d-4320-9b8c-f5e011c1e016 | Trámites Legales |

---

## 👨‍⚕️ **DOCTORES**
**Tabla:** `doctores` | **Campo Nombre:** `nombre_completo`

```sql
-- Consulta de referencia:
SELECT id, nombre_completo FROM doctores;
```

| ID | Nombre Completo |
|---|---|
| af864287-c6a4-4550-ad9f-10b1fb2429ce | Dra Amairany Esperano |
| 75fd470b-b459-4f0b-8dcd-2688a049732a | Dra Ana Laura Gomez |
| 60624fac-0982-47f1-8c30-d8586a573d9d | Dra Stephanie De La Cruz |
| 1bb5cd91-c5b6-4805-843e-d9c2abd82b03 | Dra Vanessa Machuca |
| 1252287a-76f1-4a95-9e2c-a529dca4a864 | Dr Hugo Melgar |
| 30967c52-285e-4886-8ca1-24ec0f1881ba | Dr Ulises Medina |

---

## 👥 **EMPLEADOS**
**Tabla:** `empleados` | **Campo Nombre:** `nombre_completo`

```sql
-- Consulta de referencia:
SELECT id, nombre_completo FROM empleados WHERE activo = true;
```

| ID | Nombre Completo |
|---|---|
| 883f9bd9-5950-4f63-8b27-a51c01109ae7 | Daniela Alvarado |
| 134df8a0-16fd-4e5f-b8ae-e6fe908a8551 | Karime Burgueño |
| 4c5a3f60-a55f-44dc-949f-32f413e60cca | Rubi Santiago |
| d403458a-76f5-4112-8e83-200c7173115b | Ximena López |
| e324c450-3dc7-4cad-8fe3-fa1645c63a4d | Yara Jiménez |

---

## 🧪 **LABORATORIOS**
**Tabla:** `laboratorios` | **Campo Nombre:** `nombre_laboratorio`

```sql
-- Consulta de referencia:
SELECT id, nombre_laboratorio FROM laboratorios WHERE activo = true;
```

| ID | Nombre Laboratorio |
|---|---|
| 3c21fc44-57eb-46f3-b1c8-9b895064da95 | Ortolab |
| 17919bbd-aeb2-48e0-9b69-feb35c94fd42 | Prime |
| 5d977ba3-ecb7-41b0-895f-8127127cdfe3 | Saúl |

---

## 🏪 **PROVEEDORES**
**Tabla:** `proveedores` | **Campo Nombre:** `nombre_comercial`

```sql
-- Consulta de referencia:
SELECT id, nombre_comercial FROM proveedores WHERE activo = true;
```

| ID | Nombre Comercial |
|---|---|
| 3e36ffb9-d3b3-4286-b978-28af82147818 | Bodeguita Dental |
| f2f9da66-edf0-4a90-9b9a-a547060a3c86 | Dental 21 |
| e74aafb4-7369-47cd-aa3f-171b75ad105b | Dental Jalísco |
| 5a5ccb15-6087-4dad-a1e9-7d7376aaf5a7 | Dentalink |
| 4b617ec3-d611-4ac0-a731-488e0199318f | Dentel |
| 9f9cb125-826b-4374-8d95-e8f612f52e0e | Distrimedh |

---

## 📝 **NOTAS DE USO**

### **Para Consultas SQL:**
```sql
-- Ejemplo de consulta cruzada:
SELECT 
    g.descripcion,
    cat.nombre as categoria,
    sub.nombre as subcategoria,
    d.nombre_completo as doctor,
    emp.nombre_completo as empleado,
    prov.nombre_comercial as proveedor,
    lab.nombre_laboratorio as laboratorio
FROM gastos g
LEFT JOIN categorias_gastos cat ON g.categoria_id = cat.id
LEFT JOIN subcategorias_gastos sub ON g.subcategoria_id = sub.id
LEFT JOIN doctores d ON g.doctor_id = d.id
LEFT JOIN empleados emp ON g.empleado_id = emp.id
LEFT JOIN proveedores prov ON g.proveedor_id = prov.id
LEFT JOIN laboratorios lab ON g.laboratorio_id = lab.id;
```

### **Para Validaciones:**
- Todos los IDs son de tipo UUID
- Los nombres pueden contener espacios y caracteres especiales
- Usar siempre los nombres exactos como aparecen en las tablas
- Considerar campos `activo = true` para empleados, laboratorios y proveedores

### **Para Inserciones:**
```sql
-- Ejemplo usando estos IDs de referencia:
INSERT INTO gastos (subcategoria_id, doctor_id, monto, descripcion)
VALUES (
    'ca5ae4a4-61a8-4a13-b092-9b7bc77f390f', -- Comisiones Doctores
    'af864287-c6a4-4550-ad9f-10b1fb2429ce', -- Dra Amairany Esperano
    5000.00,
    'Comisión por tratamiento de ortodoncia'
);
```

---

**Última actualización:** Diciembre 2024  
**Fuente:** Base de datos Supabase del consultorio dental

---

## 📝 **HISTORIAL DE ACTUALIZACIONES**

### **Diciembre 2024 - Empleados Agregados**
Se agregaron empleados que aparecían en gastos pero no estaban registrados:

**Nuevos Empleados:**
- **Daniela Alvarado** (ID: 883f9bd9-5950-4f63-8b27-a51c01109ae7)
  - Puesto: Recepcionista
  - Aparecía en gastos como: "Dani", "DANI"
  - Vinculada retroactivamente con ~22 pagos de sueldos

- **Karime Burgueño** (ID: 134df8a0-16fd-4e5f-b8ae-e6fe908a8551)  
  - Puesto: Recepcionista
  - Aparecía en gastos como: "Karimme", "Kari", "KARIMME"
  - Vinculada retroactivamente con ~7 pagos de sueldos

**Total Empleados Activos:** 5 empleados registrados

### **Diciembre 2024 - Proveedores Agregados**
Se agregaron proveedores que aparecían en gastos pero no estaban registrados:

**Nuevos Proveedores:**
- **Dentel** (ID: 4b617ec3-d611-4ac0-a731-488e0199318f)
  - Categoría: Material Dental
  - Aparecía en gastos como: "DENTEL", "DEPOSITO DENTEL"
  - Vinculado retroactivamente con gastos de marzo (~$3,252.07)

- **Distrimedh** (ID: 9f9cb125-826b-4374-8d95-e8f612f52e0e)
  - Categoría: Material Dental
  - Aparecía en gastos como: "Distrimedh"
  - Vinculado retroactivamente con gastos de marzo (~$1,040)

**Total Proveedores Activos:** 6 proveedores registrados 