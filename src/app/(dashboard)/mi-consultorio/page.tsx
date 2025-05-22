'use client';

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultorioForm } from "@/components/consultorio/ConsultorioForm";
import { MiembrosConsultorio } from "@/components/consultorio/MiembrosConsultorio";
import { IconSettings, IconUsers } from "@tabler/icons-react";

export default function MiConsultorioPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="container px-4 py-8 md:py-12 flex flex-col min-h-[calc(100vh-80px)]">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8"
      >
        Mi Consultorio
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[1000px] mx-auto"
      >
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general" className="flex items-center gap-1">
              <IconSettings className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="miembros" className="flex items-center gap-1">
              <IconUsers className="h-4 w-4" />
              <span>Miembros</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-0">
            <ConsultorioForm />
          </TabsContent>
          
          <TabsContent value="miembros" className="mt-0">
            <MiembrosConsultorio />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
} 