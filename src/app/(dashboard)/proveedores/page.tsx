"use client";

import ProveedoresTable from "@/components/proveedores/ProveedoresTable";
import LaboratoriosTable from "@/components/laboratorios/LaboratoriosTable";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProveedoresPage() {
  return (
    <div className="container px-4 py-8 md:py-12 flex flex-col items-center min-h-[calc(100vh-80px)]">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        Proveedores y Laboratorios
      </motion.h1>
      
      <div className="w-full max-w-[1000px] mx-auto">
        {/* Tabs para diferentes vistas */}
        <Tabs defaultValue="proveedores" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
            <TabsTrigger value="laboratorios">Laboratorios</TabsTrigger>
          </TabsList>

          <TabsContent value="proveedores">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProveedoresTable />
            </motion.div>
          </TabsContent>

          <TabsContent value="laboratorios">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LaboratoriosTable />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 