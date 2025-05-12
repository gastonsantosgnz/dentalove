## Sidefolio - Portfolio website template

As seen on [Aceternity UI](https://ui.aceternity.com/templtes/sidefolio)

## Built with
- Next.js
- Tailwindcss
- Framer motion
- MDX

Checkout all the templates at [Aceternity UI](https://ui.aceternity.com/templates)

# Planes Dentales - Sistema de Gestión

## Configuración de Supabase

Este proyecto utiliza Supabase como base de datos. Sigue estos pasos para configurar la base de datos:

1. Crea una cuenta en [Supabase](https://supabase.com/)
2. Crea un nuevo proyecto
3. Una vez en el panel de control, ve a la sección "SQL Editor"
4. Crea una nueva consulta y pega el contenido del archivo `sql/create_pacientes_table.sql`
5. Ejecuta la consulta para crear la tabla de pacientes y configurar los permisos

## Conexión a Supabase

La conexión a Supabase ya está configurada en el archivo `src/lib/supabase.ts`. Para un entorno de producción, deberías mover estas credenciales a variables de entorno.

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Características

- Gestión de pacientes (CRUD)
- Tipos de pacientes basados en edad
- Planes de tratamiento
- Interfaz moderna y responsive
