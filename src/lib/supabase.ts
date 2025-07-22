import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Usamos variables estáticas para el desarrollo, pero en producción usarías variables de entorno
const supabaseUrl = 'https://qpwtknfbineefqazhmyn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwd3RrbmZiaW5lZWZxYXpobXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDkyMzAsImV4cCI6MjA2MTgyNTIzMH0.z25NlHRuYsHXaye7jTbeCtNiBXlFS4g4Qg3PRhupUlU';

// Creamos un cliente tipado solo cuando tenemos URL y KEY válidos
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

// Función para obtener el cliente de Supabase de forma lazy
export const getSupabaseClient = () => {
  console.log('Getting Supabase client...');
  console.log('supabaseUrl:', supabaseUrl);
  console.log('supabaseAnonKey exists:', !!supabaseAnonKey);
  
  // Solo inicializamos el cliente una vez
  if (!supabaseClient && supabaseUrl && supabaseAnonKey) {
    try {
      console.log('Initializing real Supabase client...');
      supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
      console.log('Real Supabase client initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      throw new Error('Failed to initialize Supabase client');
    }
  }
  
  if (!supabaseClient) {
    console.error('Supabase client not initialized: missing URL or key');
    throw new Error('Supabase client not initialized');
  }
  
  return supabaseClient;
};

// Para compatibilidad con código existente
export const supabase = getSupabaseClient(); 