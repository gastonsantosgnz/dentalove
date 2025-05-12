'use client';
import LoginForm from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex justify-center mb-8">
          <div className="flex text-sm flex-col items-center">
            <p className="font-bold text-slate-900 text-2xl">Dentalove</p>
            <p className="font-light text-slate-600">Planes Dentales</p>
          </div>
        </Link>
        
        <div className="bg-white rounded-lg border border-slate-200 shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-slate-900">Acceso al sistema</h1>
          <LoginForm />
        </div>
      </motion.div>
    </div>
  );
} 