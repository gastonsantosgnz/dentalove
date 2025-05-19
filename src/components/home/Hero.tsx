import Link from 'next/link';
import { motion, useScroll } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export function Hero() {
  const { user } = useAuth();
  const [isHalf, setIsHalf] = useState(false);
  const { scrollY } = useScroll();
  
  // Patrón similar al del código de referencia
  const pattern = {
    y: -6,
    squares: Array.from({ length: 12 }, () => [
      Math.floor(Math.random() * 20) - 10,
      Math.floor(Math.random() * 20) - 10,
    ]),
  };
  
  useEffect(() => {
    const handleScroll = () => {
      if (scrollY.get() > (window.innerHeight * 2) / 10) {
        setIsHalf(true);
      } else {
        setIsHalf(false);
      }
    };
    scrollY.onChange(handleScroll);
    return () => {
      scrollY.clearListeners();
    };
  }, [scrollY]);
  
  return (
    <div className="px-4 bg-white relative h-[900px] md:h-[1000px] lg:h-[1100px]">
      <div className="relative z-10 max-w-7xl mx-auto pt-28 md:pt-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="font-semibold text-4xl sm:text-7xl text-center max-w-5xl mx-auto text-zinc-800 leading-tight tracking-tight">
            Gestione su <span className="text-[#0c7d74]">clínica dental</span> con total eficiencia
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl tracking-tight text-zinc-600 text-center leading-normal">
            Dentalove es una plataforma integral para gestionar planes dentales y administrar 
            pacientes de manera eficiente y profesional, optimizando el flujo de trabajo de su clínica.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center items-center mt-12">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 bg-[#0c7d74] hover:bg-[#0a6b63] text-white rounded-2xl py-6 px-8">
                  Ir al Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="gap-2 rounded-2xl border border-zinc-200 py-6 px-8">
                    Iniciar sesión
                  </Button>
                </Link>
                
                <Link href="/register">
                  <Button size="lg" className="gap-2 bg-[#0c7d74] hover:bg-[#0a6b63] text-white rounded-2xl py-6 px-8">
                    Comenzar ahora
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Imagen grande en la parte inferior */}
      <div
        style={{ perspective: "1000px" }}
        className="w-full absolute bottom-0 left-0 right-0 flex justify-center items-end"
      >
        <motion.div
          initial={{ rotateX: 15, scale: 0.9 }}
          animate={{ 
            rotateX: isHalf ? 0 : 15,
            scale: 0.95,
            y: isHalf ? 0 : 20,
          }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 30,
          }}
          className="w-[90%] md:w-[85%] h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px]"
        >
          {/* Aquí usamos una imagen estática */}
          <div className="absolute inset-0 rounded-t-xl md:rounded-t-3xl border border-zinc-200 overflow-hidden shadow-xl">
            <Image 
              src="/planes.PNG"
              alt="Panel de control dental"
              className="w-full h-full object-cover object-top"
              fill
              priority
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 