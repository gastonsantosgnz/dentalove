-- =========================================
-- ACTUALIZACIÓN: Función crear_ingreso_desde_servicio MEJORADA
-- Date: Current  
-- Description: Crear ingreso desde servicio completado como PAGADO con pago automático
-- =========================================

-- Función mejorada para crear ingreso desde servicio completado
CREATE OR REPLACE FUNCTION crear_ingreso_desde_servicio(
    p_servicio_progreso_id UUID,
    p_monto NUMERIC,
    p_doctor_id UUID,
    p_porcentaje_comision NUMERIC DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_ingreso_id UUID;
    v_pago_id UUID;
    v_servicio RECORD;
    v_tratamiento RECORD;
BEGIN
    -- Obtener información del servicio
    SELECT sp.*, pt.paciente_id, pt.consultorio_id
    INTO v_servicio
    FROM servicios_progreso sp
    JOIN planes_tratamiento pt ON sp.plan_id = pt.id
    WHERE sp.id = p_servicio_progreso_id;
    
    -- Obtener información del tratamiento
    SELECT zt.nombre_tratamiento, s.nombre_servicio
    INTO v_tratamiento
    FROM zona_tratamientos zt
    LEFT JOIN servicios s ON zt.servicio_id = s.id
    WHERE zt.id = v_servicio.zona_tratamiento_id;
    
    -- Obtener porcentaje de comisión del doctor si no se especifica
    IF p_porcentaje_comision IS NULL THEN
        SELECT COALESCE(porcentaje_comision, 0) INTO p_porcentaje_comision
        FROM doctores
        WHERE id = p_doctor_id;
    END IF;
    
    -- Crear el ingreso con estado 'pagado_total'
    INSERT INTO ingresos (
        consultorio_id,
        paciente_id,
        doctor_id,
        categoria_id,
        plan_tratamiento_id,
        servicio_progreso_id,
        concepto,
        monto_total,
        porcentaje_comision,
        fecha_servicio,
        estado
    ) VALUES (
        v_servicio.consultorio_id,
        v_servicio.paciente_id,
        p_doctor_id,
        (SELECT id FROM categorias_ingreso WHERE nombre = 'Tratamiento' AND (consultorio_id = v_servicio.consultorio_id OR consultorio_id IS NULL) LIMIT 1),
        v_servicio.plan_id,
        p_servicio_progreso_id,
        COALESCE(v_tratamiento.nombre_servicio, v_tratamiento.nombre_tratamiento),
        p_monto,
        COALESCE(p_porcentaje_comision, 0),
        CURRENT_DATE,
        'pagado_total'  -- CAMBIADO: Crear como pagado_total en lugar de pendiente
    ) RETURNING id INTO v_ingreso_id;
    
    -- Crear automáticamente un pago por el monto completo
    INSERT INTO pagos (
        ingreso_id,
        monto,
        metodo_pago,
        fecha_pago,
        estado,
        notas
    ) VALUES (
        v_ingreso_id,
        p_monto,
        'efectivo',  -- Se puede cambiar por el método de pago deseado
        CURRENT_DATE,
        'completado',
        'Pago automático al completar tratamiento'
    ) RETURNING id INTO v_pago_id;
    
    RETURN v_ingreso_id;
END;
$$ LANGUAGE plpgsql;

-- Comentario explicativo
COMMENT ON FUNCTION crear_ingreso_desde_servicio IS 'Crea un ingreso marcado como pagado_total con un pago automático cuando se completa un tratamiento'; 