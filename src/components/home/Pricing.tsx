import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Package = {
  title: string;
  description: string;
  monthly: number;
  yearly: number;
  features: string[];
  className?: string;
  type?: "monthly" | "yearly";
  highlight?: boolean;
};

export function Pricing() {
  const [type, setType] = useState<"monthly" | "yearly">("monthly");
  
  const packages = {
    basico: {
      title: "Básico",
      description: "Ideal para clínicas pequeñas",
      monthly: 29,
      yearly: 290,
      features: [
        "Hasta 100 pacientes",
        "Gestión de planes dentales básicos",
        "Hasta 3 usuarios",
        "Soporte por email",
        "Actualizaciones mensuales",
        "Respaldo de datos semanal"
      ],
    },
    profesional: {
      title: "Profesional",
      description: "Para clínicas en crecimiento",
      monthly: 79,
      yearly: 790,
      features: [
        "Pacientes ilimitados",
        "Planes dentales avanzados",
        "Hasta 10 usuarios",
        "Soporte prioritario",
        "Actualizaciones semanales",
        "Análisis de datos",
        "Personalización básica",
        "Integración con calendario",
        "Respaldo de datos diario"
      ],
    },
    empresarial: {
      monthly: 199,
      yearly: 1990,
      title: "Empresarial",
      description: "Para grandes organizaciones",
      features: [
        "Pacientes ilimitados",
        "Planes dentales premium",
        "Usuarios ilimitados",
        "Soporte 24/7",
        "Actualizaciones prioritarias",
        "Análisis avanzado de datos",
        "Personalización completa",
        "API acceso completo",
        "Capacitación personalizada",
        "Consultor de implementación"
      ],
    },
  };
  
  return (
    <div
      id="pricing"
      className="min-h-[40rem] px-4 bg-white py-20 md:py-40 relative group overflow-hidden"
    >
      <div className="max-w-xl md:mx-auto md:text-center xl:max-w-none relative z-10">
        <h2 className="font-display text-3xl tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
          Planes simples y transparentes
        </h2>
        <p className="mt-6 text-lg tracking-tight text-zinc-600">
          Elija el plan que mejor se adapte a las necesidades de su clínica dental
        </p>
      </div>
      
      <div className="mx-auto flex-row space-x-2 justify-center items-center border rounded-3xl border-gray-100 flex mt-20 overflow-hidden w-fit">
        <button
          className={cn(
            "text-sm px-4 py-2 inline-flex relative",
            type === "monthly" && "bg-gray-50"
          )}
          onClick={() => setType("monthly")}
        >
          Mensual
          {type === "monthly" && (
            <motion.span
              animate={{ x: -10 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-0 h-px inset-x-0 bg-gradient-to-r from-blue-500 to-blue-600 blur-[1px] z-50 mx-auto"
            ></motion.span>
          )}
        </button>
        <button
          className={cn(
            "text-sm px-4 py-2 inline-flex relative",
            type === "yearly" && "bg-gray-50"
          )}
          onClick={() => setType("yearly")}
        >
          Anual
          {type === "yearly" && (
            <motion.span
              animate={{ x: 10 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-0 h-px inset-x-0 bg-gradient-to-r from-blue-500 to-blue-600 blur-[1px] z-50 mx-auto"
            ></motion.span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto mt-20">
        <PricingCard {...packages.basico} type={type} />
        <PricingCard {...packages.profesional} type={type} highlight />
        <PricingCard {...packages.empresarial} type={type} />
      </div>
    </div>
  );
}

const PricingCard = (props: Package) => {
  const {
    title,
    description,
    monthly,
    yearly,
    features,
    className,
    type = "monthly",
    highlight,
  } = props;
  
  return (
    <div
      className={cn(
        "bg-white rounded-2xl px-8 py-12 relative border shadow-sm",
        highlight && "bg-blue-600 border-blue-600 shadow-lg",
        className
      )}
    >
      {highlight && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">MÁS POPULAR</span>
        </div>
      )}
      
      <h3
        className={cn(
          "leading-6 font-medium text-gray-900 text-2xl",
          highlight && "text-white"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-4 text-sm text-gray-500",
          highlight && "text-blue-50"
        )}
      >
        {description}
      </p>
      <p className="mt-8">
        <span
          className={cn(
            "text-5xl font-extrabold text-gray-900",
            highlight && "text-white"
          )}
        >
          ${type === "monthly" ? monthly : yearly}
        </span>
        <span
          className={cn(
            "text-base font-medium text-gray-500 ml-2",
            highlight && "text-blue-50"
          )}
        >
          {type === "monthly" ? "/mes" : "/año"}
        </span>
      </p>
      
      <Button
        className={cn(
          "w-full mt-8 rounded-xl py-6",
          highlight 
            ? "bg-white text-blue-600 hover:bg-blue-50" 
            : "bg-blue-600 text-white hover:bg-blue-700"
        )}
      >
        <Link href="/register">
          {highlight ? "Comenzar prueba" : "Comenzar ahora"}
        </Link>
      </Button>
      
      <div className="mt-8">
        <ul className="mt-6 space-y-4 relative">
          {!highlight && (
            <div className="absolute w-px h-[90%] inset-y-4 bg-gray-200 left-2" />
          )}
          {features.map((feature) => (
            <li key={feature} className="flex items-center relative z-10">
              <div className="flex-shrink-0">
                <CheckCircle2
                  className={cn(
                    "h-5 w-5 text-blue-500 bg-white rounded-full",
                    highlight && "text-white bg-transparent"
                  )}
                />
              </div>
              <p
                className={cn(
                  "ml-3 text-sm text-gray-600",
                  highlight && "text-white"
                )}
              >
                {feature}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 