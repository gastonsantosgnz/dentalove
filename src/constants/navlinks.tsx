import {
  IconBolt,
  IconUsers,
  IconBriefcase2,
  IconArticle,
  IconDental,
  IconCalendar,
  IconCurrencyDollar,
  IconReceipt,
} from "@tabler/icons-react";

// Grupo 1: Inicio y Gestión de Pacientes
export const patientManagementLinks = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: IconBolt,
  },
  {
    href: "/calendario",
    label: "Calendario",
    icon: IconCalendar,
  },
  {
    href: "/pacientes",
    label: "Pacientes",
    icon: IconUsers,
  },
  {
    href: "/planes",
    label: "Planes",
    icon: IconArticle,
  },
];

// Grupo 2: Gestión Administrativa
export const administrativeLinks = [
  {
    href: "/ingresos",
    label: "Ingresos",
    icon: IconCurrencyDollar,
  },
  {
    href: "/gastos",
    label: "Gastos",
    icon: IconReceipt,
  },
  {
    href: "/servicios",
    label: "Servicios",
    icon: IconBriefcase2,
  },
  {
    href: "/doctores",
    label: "Doctores",
    icon: IconDental,
  },
];

// Exportar todos los links (para compatibilidad)
export const navlinks = [...patientManagementLinks, ...administrativeLinks];
