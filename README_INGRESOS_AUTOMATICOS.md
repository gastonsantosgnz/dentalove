# 💰 Ingresos Automáticos desde Plan de Tratamiento

## 📋 Descripción

Esta funcionalidad permite que **al completar un tratamiento** en el Plan de Tratamiento, se genere **automáticamente un ingreso** en el sistema financiero del consultorio.

## ✨ ¿Cómo funciona?

### 1. **Completar Tratamiento**
- Desde el Plan de Tratamiento, hacer clic en el botón verde de "Completar" (✅) de cualquier tratamiento
- Se abre un diálogo mejorado con opciones adicionales

### 2. **Configurar Ingreso Automático**
El diálogo incluye:
- **Fecha de realización**: Cuándo se realizó el tratamiento
- **Monto**: Cantidad pagada (se auto-completa con el costo del servicio)
- **Notas**: Comentarios adicionales sobre el tratamiento
- **Doctor responsable**: Selector con todos los doctores del consultorio
- **Switch "Crear ingreso automáticamente"**: Activa/desactiva la creación automática

### 3. **Resultado**
Al confirmar:
- ✅ El tratamiento se marca como "Completado"
- ✅ Se crea automáticamente un ingreso en la sección de Ingresos
- ✅ Se calcula la comisión del doctor automáticamente
- ✅ El ingreso queda vinculado al servicio para trazabilidad completa

## 🔧 Configuración

### **Activar/Desactivar**
- El switch "Crear ingreso automáticamente" está **activado por defecto**
- Puedes desactivarlo si solo quieres marcar el tratamiento como completado sin crear ingreso

### **Selección de Doctor**
- **Obligatorio** cuando el ingreso automático está activado
- Muestra el porcentaje de comisión de cada doctor
- La comisión se calcula automáticamente basada en el porcentaje configurado

## 📊 Ventajas

### **Para el Consultorio**
- ✅ **Eliminación de trabajo duplicado**: No hay que registrar manualmente cada ingreso
- ✅ **Consistencia de datos**: Los ingresos siempre coinciden con los tratamientos realizados
- ✅ **Trazabilidad completa**: Cada ingreso está vinculado a su tratamiento original
- ✅ **Cálculo automático de comisiones**: Reduce errores manuales

### **Para los Doctores**
- ✅ **Transparencia**: Pueden ver exactamente qué tratamientos generan sus comisiones
- ✅ **Seguimiento en tiempo real**: Los ingresos se registran inmediatamente
- ✅ **Menos administración**: No necesitan reportar manualmente los servicios completados

### **Para el Control Financiero**
- ✅ **Datos en tiempo real**: Los ingresos aparecen inmediatamente en los reportes
- ✅ **Categorización automática**: Todos los ingresos se categorizan como "Tratamiento"
- ✅ **Vinculación con citas**: Si el tratamiento está asociado a una cita, se mantiene la relación

## 🔄 Base de Datos

### **Tablas Involucradas**
- `servicios_progreso`: Almacena el estado de cada tratamiento
- `ingresos`: Registra el ingreso financiero
- `pagos`: Maneja los pagos asociados al ingreso

### **Función de Base de Datos**
```sql
crear_ingreso_desde_servicio(
    p_servicio_progreso_id UUID,
    p_monto NUMERIC,
    p_doctor_id UUID,
    p_porcentaje_comision NUMERIC DEFAULT NULL
)
```

Esta función:
- Obtiene automáticamente datos del servicio y plan
- Vincula el ingreso con el tratamiento
- Calcula la comisión del doctor
- Crea el registro en la tabla de ingresos

## 🚀 Casos de Uso

### **Consulta Simple**
1. Paciente recibe consulta
2. Doctor completa el tratamiento en el plan
3. Se crea automáticamente el ingreso por el monto de la consulta
4. Aparece inmediatamente en los reportes financieros

### **Tratamiento Complejo**
1. Paciente con plan de ortodoncia
2. Se completan varios tratamientos a lo largo del tiempo
3. Cada tratamiento completado genera su respectivo ingreso
4. Se puede hacer seguimiento financiero detallado del plan completo

### **Trabajo en Equipo**
1. Varios doctores trabajan en el mismo consultorio
2. Cada uno completa sus tratamientos
3. Los ingresos se registran automáticamente con el doctor correcto
4. Las comisiones se calculan individualmente

## 📈 Reportes y Seguimiento

Los ingresos creados automáticamente:
- ✅ Aparecen en la sección **Ingresos** del dashboard
- ✅ Se incluyen en todos los reportes financieros
- ✅ Mantienen la vinculación con el tratamiento original
- ✅ Permiten seguimiento de comisiones por doctor
- ✅ Se pueden filtrar por fecha, paciente, doctor, etc.

## ⚙️ Configuración Técnica

### **Archivos Modificados**
- `src/components/treatment-plan/TreatmentsTab.tsx`
- `src/components/treatment-plan/dialogs/CompletarServicioDialog.tsx`
- `src/lib/ingresosService.ts`

### **Nuevas Dependencias**
- Contexto del consultorio para cargar doctores
- Servicio de ingresos para la creación automática
- Notificaciones toast para feedback del usuario

---

## 💡 **Resultado Final**

Con esta implementación, el flujo de trabajo se vuelve mucho más eficiente:
**Plan de Tratamiento → Completar Servicio → Ingreso Automático → Reporte Financiero**

¡Todo en un solo paso! 🎯 