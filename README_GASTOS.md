# Sistema de Registro de Gastos

## Descripción

El sistema de registro de gastos permite a los consultorios dentales llevar un control detallado de sus egresos, organizados por categorías y subcategorías personalizables.

## Características

### 1. **Categorías Flexibles**
- Categorías predefinidas comunes para todos los consultorios
- Capacidad de crear categorías personalizadas
- Dos tipos de gastos: Fijos y Variables
- Sistema de colores para identificación visual

### 2. **Subcategorías**
- Cada categoría puede tener múltiples subcategorías
- Permite mayor granularidad en la clasificación
- Campo de notas adicionales para detalles específicos

### 3. **Registro de Gastos**
- Campos completos: monto, fecha, descripción, método de pago, estado
- Soporte para adjuntar comprobantes (imágenes o PDF)
- Estados: Pagado, Pendiente, Cancelado
- Métodos de pago: Efectivo, Transferencia, Tarjetas, Cheque, Otro

### 4. **Análisis y Reportes**
- Estadísticas por período (día, semana, mes, año)
- Distribución de gastos por categoría
- Separación entre gastos fijos y variables
- Promedio diario de gastos

## Instalación

### 1. Base de Datos (Supabase)

Ejecuta los siguientes scripts SQL en orden:

#### a) Estructura de tablas principales
```sql
-- Copiar y pegar el contenido de src/lib/gastos_migration.sql
```

#### b) Storage para comprobantes
```sql
-- Copiar y pegar el contenido de src/lib/gastos_storage.sql
```

### 2. Categorías Predefinidas

Las categorías predefinidas se crean automáticamente cuando un consultorio registra su primer gasto. Incluyen:

**Gastos Fijos:**
- **Instalaciones**: Renta, Servicios, Internet, Mantenimiento
- **Personal**: Sueldos, Prestaciones, Seguros, Capacitación

**Gastos Variables:**
- **Materiales**: Material dental, limpieza, oficina, medicamentos
- **Equipamiento**: Equipo dental, mobiliario, cómputo, reparaciones
- **Marketing**: Publicidad digital, material promocional, eventos
- **Otros**: Gastos bancarios, impuestos, otros gastos

### 3. Permisos

Todos los miembros del consultorio pueden:
- Ver todos los gastos del consultorio
- Registrar nuevos gastos
- Editar gastos existentes
- Eliminar gastos (con confirmación)
- Gestionar categorías y subcategorías

## Uso

### Registrar un Gasto

1. Navegar a la sección "Gastos" desde el menú lateral
2. Click en "Registrar Gasto"
3. Seleccionar categoría y subcategoría
4. Llenar los campos requeridos
5. Opcionalmente adjuntar comprobante
6. Guardar

### Gestionar Categorías

1. En la página de Gastos, click en "Categorías"
2. Crear nuevas categorías o editar existentes
3. Agregar subcategorías según necesidad
4. Las categorías predefinidas no pueden eliminarse

### Filtros y Búsqueda

- Filtrar por período de tiempo
- Buscar por descripción, categoría o subcategoría
- Filtrar por estado del gasto
- Filtrar por categoría específica

## Estructura de Archivos

```
src/
├── app/(dashboard)/gastos/
│   ├── page.tsx                    # Página principal de gastos
│   └── categorias/
│       └── page.tsx                # Gestión de categorías
├── components/gastos/
│   ├── AddGastoDialog.tsx          # Dialog para agregar gastos
│   └── GastosTable.tsx             # Tabla de gastos
├── lib/
│   ├── gastosService.ts            # Servicios y funciones
│   ├── gastos_migration.sql        # SQL de tablas
│   └── gastos_storage.sql          # SQL de storage
└── constants/
    └── navlinks.tsx                # Actualizado con enlace a gastos
```

## Futuras Mejoras

1. **Automatización**
   - Gastos recurrentes automáticos
   - Alertas de gastos pendientes
   - Presupuestos y límites

2. **Integración con Informes**
   - Balance general (ingresos - gastos)
   - Proyecciones financieras
   - Comparativas por período

3. **Funcionalidades Avanzadas**
   - Importación masiva de gastos
   - Exportación a Excel/PDF
   - Integración con sistemas contables

## Notas Técnicas

- El sistema está preparado para multi-tenancy
- Las políticas RLS garantizan aislamiento entre consultorios
- Los comprobantes se almacenan en Supabase Storage
- Todas las operaciones requieren autenticación 