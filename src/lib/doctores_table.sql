-- Create doctores table
CREATE TABLE doctores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    especialidad TEXT NOT NULL,
    celular TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_doctores_nombre ON doctores(nombre_completo);

-- Insert sample data (optional)
INSERT INTO doctores (nombre_completo, especialidad, celular) VALUES
('Dr. Juan Pérez', 'Odontología General', '555-1234'),
('Dra. María González', 'Ortodoncia', '555-5678'),
('Dr. Carlos Rodríguez', 'Cirugía Maxilofacial', '555-9012'); 