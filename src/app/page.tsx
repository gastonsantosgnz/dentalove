"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Si el usuario ya está autenticado, redirigirlo al dashboard
  useEffect(() => {
    if (!isLoading && user) {
      // Usar cookies para evitar parámetros en la URL
      Cookies.set('skip_auth', 'true', { expires: 1/24/60, path: '/' }); // 1 minuto
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Bienvenido a <span className="text-slate-900">Dentalove</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Su plataforma para gestionar planes dentales y administrar pacientes de manera eficiente
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-slate-900 text-white font-medium rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
            >
              Iniciar sesión
            </motion.button>
          </Link>
          
          <Link href="https://qpwtknfbineefqazhmyn.supabase.co" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white border border-slate-300 text-slate-800 font-medium rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
            >
              Más información
            </motion.button>
          </Link>
        </div>
      </motion.div>
      

    </div>
  );
}
