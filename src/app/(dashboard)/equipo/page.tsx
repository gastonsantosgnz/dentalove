"use client";

import DoctoresTable from "@/components/doctores/DoctoresTable";
import EmpleadosTable from "@/components/empleados/EmpleadosTable";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EquipoPage() {
  return (
    <div className="container px-4 py-8 md:py-12 flex flex-col items-center min-h-[calc(100vh-80px)]">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        Equipo
      </motion.h1>
      
      <div className="w-full max-w-[1000px] mx-auto">
        {/* Tabs para diferentes vistas */}
        <Tabs defaultValue="doctores" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctores">Doctores</TabsTrigger>
            <TabsTrigger value="empleados">Empleados</TabsTrigger>
          </TabsList>

          <TabsContent value="doctores">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DoctoresTable />
            </motion.div>
          </TabsContent>

          <TabsContent value="empleados">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EmpleadosTable />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 