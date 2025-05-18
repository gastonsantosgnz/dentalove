import { motion, useMotionValue } from 'framer-motion';
import { ClipboardList, Clock, Shield, Users } from "lucide-react";

export function Features() {
  // Motion values para efecto de hover
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: any) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const features = [
    {
      icon: <ClipboardList className="text-blue-500 h-4 w-4 relative z-50" />,
      title: "Gestión de Planes",
      description: "Cree y administre planes dentales personalizados para sus pacientes con facilidad. Optimice su flujo de trabajo y mejore la experiencia de sus clientes."
    },
    {
      icon: <Users className="text-blue-500 h-4 w-4 relative z-50" />,
      title: "Administración de Pacientes",
      description: "Mantenga registros detallados y organizados de todos sus pacientes en un solo lugar. Acceda rápidamente a historiales y preferencias."
    },
    {
      icon: <Clock className="text-blue-500 h-4 w-4 relative z-50" />,
      title: "Seguimiento de Tratamientos",
      description: "Realice un seguimiento del progreso de los tratamientos y mantenga a sus pacientes informados sobre cada etapa de su plan dental."
    },
    {
      icon: <Shield className="text-blue-500 h-4 w-4 relative z-50" />,
      title: "Seguridad Confiable",
      description: "Sus datos están protegidos con las más altas medidas de seguridad. Cumplimos con todos los estándares de privacidad del sector médico."
    },
    {
      icon: <Clock className="text-blue-500 h-4 w-4 relative z-50" />,
      title: "Análisis Avanzado",
      description: "Obtenga información valiosa sobre su práctica dental con nuestras herramientas de análisis. Tome decisiones basadas en datos reales."
    },
    {
      icon: <Users className="text-blue-500 h-4 w-4 relative z-50" />,
      title: "Soporte Personalizado",
      description: "Nuestro equipo de expertos está disponible para ayudarle en cada paso. Resolveremos sus dudas y le ayudaremos a optimizar su experiencia."
    }
  ];

  return (
    <div
      id="features"
      className="px-4 bg-zinc-900 py-20 md:py-40 relative group"
      onMouseMove={onMouseMove}
    >
      <div className="max-w-2xl md:mx-auto md:text-center xl:max-w-none">
        <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
          Sus necesidades dentales en un solo lugar
        </h2>
        <p className="mt-6 text-lg tracking-tight text-blue-100">
          Dentalove reúne todas las herramientas que necesita para gestionar su clínica dental de manera eficiente y profesional.
        </p>
      </div>

      {/* Patrón de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-top [mask-image:linear-gradient(transparent,white,transparent)] opacity-5"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto gap-20 my-20 md:my-40 px-4">
        {features.map((feature, idx) => (
          <Card
            key={`feature-${idx}`}
            heading={feature.title}
            description={feature.description}
            icon={feature.icon}
          />
        ))}
      </div>
    </div>
  );
}

type FeatureType = {
  heading: string;
  description: string;
  icon: React.ReactNode;
};

const Card = ({ heading, description, icon }: FeatureType) => {
  return (
    <div className="flex flex-col items-start">
      <IconContainer icon={icon} />
      <div className="mt-8">
        <h2 className="text-white text-2xl">{heading}</h2>
        <p className="text-sm text-zinc-100 mt-8 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const IconContainer = ({ icon }: { icon: React.ReactNode }) => {
  return (
    <div className="relative">
      <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-white overflow-hidden">
        {icon}
        <div className="absolute inset-0 bg-white [mask-image:linear-gradient(to_bottom,transparent,white_4rem,white_calc(100%-4rem),transparent)] z-40" />
      </div>
    </div>
  );
}; 