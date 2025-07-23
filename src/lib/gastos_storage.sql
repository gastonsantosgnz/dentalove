-- Crear bucket para comprobantes de gastos
INSERT INTO storage.buckets (id, name, public)
VALUES ('gastos', 'gastos', true);

-- Políticas para el bucket de gastos
CREATE POLICY "Usuarios pueden ver comprobantes de su consultorio" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'gastos' AND
        auth.uid() IN (
            SELECT usuario_id FROM usuarios_consultorios 
            WHERE consultorio_id IN (
                SELECT consultorio_id FROM gastos 
                WHERE id = SPLIT_PART(name, '-', 1)::uuid
            )
        )
    );

CREATE POLICY "Usuarios pueden subir comprobantes a su consultorio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'gastos' AND
        auth.uid() IN (
            SELECT usuario_id FROM usuarios_consultorios 
            WHERE consultorio_id IN (
                SELECT consultorio_id FROM gastos 
                WHERE id = SPLIT_PART(name, '-', 1)::uuid
            )
        )
    );

CREATE POLICY "Usuarios pueden actualizar comprobantes de su consultorio" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'gastos' AND
        auth.uid() IN (
            SELECT usuario_id FROM usuarios_consultorios 
            WHERE consultorio_id IN (
                SELECT consultorio_id FROM gastos 
                WHERE id = SPLIT_PART(name, '-', 1)::uuid
            )
        )
    );

CREATE POLICY "Usuarios pueden eliminar comprobantes de su consultorio" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'gastos' AND
        auth.uid() IN (
            SELECT usuario_id FROM usuarios_consultorios 
            WHERE consultorio_id IN (
                SELECT consultorio_id FROM gastos 
                WHERE id = SPLIT_PART(name, '-', 1)::uuid
            )
        )
    ); 