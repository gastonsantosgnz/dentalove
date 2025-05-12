-- Create servicios table
CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_servicio TEXT NOT NULL,
  costo NUMERIC(10, 2) NOT NULL,
  duracion INTEGER NOT NULL, -- en minutos
  descripcion TEXT,
  especialidad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches by name
CREATE INDEX idx_servicios_nombre_servicio ON servicios(nombre_servicio);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function
CREATE TRIGGER update_servicios_updated_at
BEFORE UPDATE ON servicios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" 
ON servicios
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true); 