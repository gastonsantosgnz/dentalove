'use client';
import LoginForm from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link href="/" className="flex justify-center mb-8">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-4">
              <Image
                src="/dentalove-favicon.ico"
                alt="Dentalove Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="font-bold text-slate-900 text-2xl">Dentalove</p>
            <p className="font-light text-slate-600">Planes Dentales</p>
          </div>
        </Link>
        
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h1>
            <p className="mt-2 text-sm text-gray-600">
              Accede a tu cuenta para gestionar tu clínica dental
            </p>
          </div>
          
          <LoginForm />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            ¿Eres un profesional dental?{' '}
            <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-700">
              Contáctanos
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
} 