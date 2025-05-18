import { ClipboardList, Users, Clock, Shield, LucideLifeBuoy, Database } from "lucide-react";

export const features = [
  {
    heading: "Gestión de Planes Dentales",
    description:
      "Cree y administre planes dentales personalizados para sus pacientes con facilidad. Organice tratamientos y mantenga un seguimiento preciso.",
    icon: <ClipboardList className="text-blue-600 h-5 w-5 relative z-50" />,
  },
  {
    heading: "Administración de Pacientes",
    description:
      "Mantenga registros detallados y organizados de todos sus pacientes en un solo lugar. Acceda rápidamente a historiales y detalles de contacto.",
    icon: <Users className="text-blue-600 h-5 w-5 relative z-50" />,
  },
  {
    heading: "Seguimiento de Tratamientos",
    description:
      "Realice un seguimiento del progreso de los tratamientos y mantenga a sus pacientes informados sobre su evolución y próximas citas.",
    icon: <Clock className="text-blue-600 h-5 w-5 relative z-50" />,
  },
  {
    heading: "Seguridad Confiable",
    description:
      "Sus datos están protegidos con las más altas medidas de seguridad. Cumplimos con todos los estándares de protección de información médica.",
    icon: <Shield className="text-blue-600 h-5 w-5 relative z-50" />,
  },
  {
    heading: "Soporte Técnico Dedicado",
    description:
      "Nuestro equipo de soporte está disponible para ayudarle con cualquier consulta o problema técnico que pueda surgir durante el uso de la plataforma.",
    icon: <LucideLifeBuoy className="text-blue-600 h-5 w-5 relative z-50" />,
  },
  {
    heading: "Almacenamiento en la Nube",
    description:
      "Todos sus datos se almacenan de forma segura en la nube, lo que le permite acceder a ellos desde cualquier dispositivo en cualquier momento.",
    icon: <Database className="text-blue-600 h-5 w-5 relative z-50" />,
  },
]; 