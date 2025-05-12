import { createClient } from '@supabase/supabase-js';

// Usamos variables estáticas para el desarrollo, pero en producción usarías variables de entorno
const supabaseUrl = 'https://qpwtknfbineefqazhmyn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwd3RrbmZiaW5lZWZxYXpobXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDkyMzAsImV4cCI6MjA2MTgyNTIzMH0.z25NlHRuYsHXaye7jTbeCtNiBXlFS4g4Qg3PRhupUlU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 