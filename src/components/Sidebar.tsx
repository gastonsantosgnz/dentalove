"use client";
import { patientManagementLinks, administrativeLinks } from "@/constants/navlinks";
import { Navlink } from "@/types/navlink";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useRef, useEffect, memo, useMemo, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { Heading } from "./Heading";
import { socials } from "@/constants/socials";
import { Badge } from "./Badge";
import { IconLayoutSidebarRightCollapse, IconLogout, IconUser, IconChevronDown, IconBuilding } from "@tabler/icons-react";
import { isMobile } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useConsultorio } from "@/contexts/ConsultorioContext";

// Export the Sidebar component to make it work with dynamic imports
const Sidebar = memo(() => {
  const [open, setOpen] = useState(isMobile() ? false : true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Manejar la animación manualmente sin depender de framer-motion
  useEffect(() => {
    if (!sidebarRef.current) return;
    
    const sidebar = sidebarRef.current;
    
    if (open) {
      sidebar.style.transform = 'translateX(0)';
      sidebar.style.visibility = 'visible';
    } else {
      sidebar.style.transform = 'translateX(-100%)';
      // Mantener visible durante la transición
      setTimeout(() => {
        if (!open && sidebarRef.current) {
          sidebarRef.current.style.visibility = 'hidden';
        }
      }, 200); // Mismo tiempo que duration en la animación
    }
  }, [open]);

  // Cerrar el menú de usuario cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        ref={sidebarRef}
        style={{
          transition: 'transform 0.2s ease',
          transform: 'translateX(-100%)',
          visibility: 'hidden'
        }}
        className="px-6 z-[100] py-10 bg-neutral-100 max-w-[14rem] lg:w-fit fixed lg:relative h-screen left-0 flex flex-col justify-between"
      >
        <div className="flex-1 overflow-auto">
          <SidebarHeader />
          <Navigation setOpen={setOpen} />
        </div>
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center justify-between py-2 px-3 text-slate-700 text-sm transition-colors rounded-md hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <IconUser className="h-4 w-4 flex-shrink-0" />
              <span>Mi perfil</span>
            </div>
            <IconChevronDown 
              className={`h-4 w-4 transition-transform ${userMenuOpen ? 'transform rotate-180' : ''}`} 
            />
          </button>
          
          {userMenuOpen && (
            <div className="absolute bottom-full mb-1 left-0 right-0 bg-white rounded-md shadow-md py-1 border border-gray-100 min-w-[150px] w-[110%]">
              <Link
                href="/mi-cuenta"
                onClick={() => {
                  setUserMenuOpen(false);
                  if (isMobile()) setOpen(false);
                }}
                className="w-full flex items-center space-x-2 py-2 px-3 text-slate-700 text-sm transition-colors hover:bg-neutral-100"
              >
                <IconUser className="h-4 w-4 flex-shrink-0" />
                <span>Mi cuenta</span>
              </Link>
              
              <Link
                href="/mi-consultorio"
                onClick={() => {
                  setUserMenuOpen(false);
                  if (isMobile()) setOpen(false);
                }}
                className="w-full flex items-center space-x-2 py-2 px-3 text-slate-700 text-sm transition-colors hover:bg-neutral-100"
              >
                <IconBuilding className="h-4 w-4 flex-shrink-0" />
                <span>Mi consultorio</span>
              </Link>
              
              <button 
                onClick={() => {
                  signOut();
                  setUserMenuOpen(false);
                  if (isMobile()) setOpen(false);
                }}
                className="w-full flex items-center space-x-2 py-2 px-3 text-red-700 text-sm transition-colors hover:bg-neutral-100"
              >
                <IconLogout className="h-4 w-4 flex-shrink-0" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <button
        className="fixed lg:hidden bottom-4 right-4 h-8 w-8 border border-neutral-200 rounded-full backdrop-blur-sm flex items-center justify-center z-50"
        onClick={() => setOpen(!open)}
      >
        <IconLayoutSidebarRightCollapse className="h-4 w-4 text-secondary" />
      </button>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

// Export as both named and default export for compatibility
export { Sidebar };
export default Sidebar;

const Navigation = memo(({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const pathname = usePathname();

  // Envolver isActive en un useCallback para evitar que cambie en cada renderizado
  const isActive = useCallback((href: string) => pathname === href, [pathname]);
  
  // Memoizar los enlaces para evitar recálculos
  const patientNavElements = useMemo(() => {
    return patientManagementLinks.map((link: Navlink) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => isMobile() && setOpen(false)}
        className={twMerge(
          "text-slate-700 hover:text-primary transition duration-200 flex items-center space-x-2 py-2 px-2 rounded-md text-sm",
          isActive(link.href) && "bg-white shadow-lg text-primary"
        )}
      >
        <link.icon
          className={twMerge(
            "h-4 w-4 flex-shrink-0",
            isActive(link.href) && "text-sky-500"
          )}
        />
        <span>{link.label}</span>
      </Link>
    ));
  }, [setOpen, isActive]);

  const adminNavElements = useMemo(() => {
    return administrativeLinks.map((link: Navlink) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => isMobile() && setOpen(false)}
        className={twMerge(
          "text-slate-700 hover:text-primary transition duration-200 flex items-center space-x-2 py-2 px-2 rounded-md text-sm",
          isActive(link.href) && "bg-white shadow-lg text-primary"
        )}
      >
        <link.icon
          className={twMerge(
            "h-4 w-4 flex-shrink-0",
            isActive(link.href) && "text-sky-500"
          )}
        />
        <span>{link.label}</span>
      </Link>
    ));
  }, [setOpen, isActive]);

  return (
    <div className="flex flex-col space-y-1 my-10 relative z-[100]">
      {/* Grupo 1: Gestión de Pacientes */}
      <div className="space-y-1">
        {patientNavElements}
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Grupo 2: Gestión Administrativa */}
      <div className="space-y-1">
        {adminNavElements}
      </div>

      {/* Socials section - hidden for now */}
      <div className="hidden">
        <Heading as="p" className="text-sm md:text-sm lg:text-sm pt-10 px-2">
          Socials
        </Heading>
        {socials.map((link: Navlink) => (
          <Link
            key={link.href}
            href={link.href}
            className={twMerge(
              "text-slate-700 hover:text-primary transition duration-200 flex items-center space-x-2 py-2 px-2 rounded-md text-sm"
            )}
          >
            <link.icon
              className={twMerge(
                "h-4 w-4 flex-shrink-0",
                isActive(link.href) && "text-sky-500"
              )}
            />
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
});

Navigation.displayName = 'Navigation';

const SidebarHeader = memo(() => {
  const { consultorio } = useConsultorio();
  const [imageError, setImageError] = useState(false);

  if (consultorio) {
    return (
      <div className="flex items-center space-x-2">
        {consultorio.logo && !imageError ? (
          <div className="relative h-6 w-6 overflow-hidden rounded-md">
            <Image 
              src={consultorio.logo} 
              alt={consultorio.nombre}
              fill
              loading="lazy"
              sizes="24px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="h-6 w-6 bg-primary/10 flex items-center justify-center rounded-md">
            <IconBuilding className="h-3 w-3 text-primary" />
          </div>
        )}
        <div className="flex flex-col">
          <p className="font-bold text-primary text-base">{consultorio.nombre}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex flex-col">
        <p className="font-bold text-primary text-base">Dentalove</p>
        <p className="font-light text-slate-600">Planes Dentales</p>
      </div>
    </div>
  );
});

SidebarHeader.displayName = 'SidebarHeader';
