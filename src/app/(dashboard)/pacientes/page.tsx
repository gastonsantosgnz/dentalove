"use client";

import PacientesTable from "@/components/PacientesTable";
import { motion } from "framer-motion";

export default function PacientesPage() {
  return (
    <div className="container px-4 py-8 md:py-12 flex flex-col items-center min-h-[calc(100vh-80px)]">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        Pacientes
      </motion.h1>
      <div className="w-full max-w-[1000px] mx-auto">
        <PacientesTable />
      </div>
    </div>
  );
} 