'use client';
import { motion } from "framer-motion";
import { MiCuenta } from '@/components/cuenta/MiCuenta';

export default function MiCuentaPage() {
  return (
    <div className="container px-4 py-8 md:py-12 flex flex-col items-center min-h-[calc(100vh-80px)]">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        Mi Cuenta
      </motion.h1>
      <div className="w-full max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <MiCuenta />
        </motion.div>
      </div>
    </div>
  );
} 