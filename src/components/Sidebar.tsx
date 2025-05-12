"use client";
import { navlinks } from "@/constants/navlinks";
import { Navlink } from "@/types/navlink";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Heading } from "./Heading";
import { socials } from "@/constants/socials";
import { Badge } from "./Badge";
import { AnimatePresence, motion } from "framer-motion";
import { IconLayoutSidebarRightCollapse, IconLogout, IconUser } from "@tabler/icons-react";
import { isMobile } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export const Sidebar = () => {
  const [open, setOpen] = useState(isMobile() ? false : true);
  const { signOut } = useAuth();

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2, ease: "linear" }}
            exit={{ x: -200 }}
            className="px-6  z-[100] py-10 bg-neutral-100 max-w-[14rem] lg:w-fit  fixed lg:relative  h-screen left-0 flex flex-col justify-between"
          >
            <div className="flex-1 overflow-auto">
              <SidebarHeader />
              <Navigation setOpen={setOpen} />
            </div>
            <div className="space-y-3">
              <Link
                href="/mi-cuenta"
                onClick={() => isMobile() && setOpen(false)}
                className="w-full flex items-center space-x-2 py-2 px-3 text-slate-700 text-sm transition-colors"
              >
                <IconUser className="h-4 w-4 flex-shrink-0" />
                <span>Mi cuenta</span>
              </Link>
              <button 
                onClick={() => {
                  signOut();
                  if (isMobile()) setOpen(false);
                }}
                className="w-full flex items-center space-x-2 py-2 px-3 text-red-700 text-sm transition-colors"
              >
                <IconLogout className="h-4 w-4 flex-shrink-0" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        className="fixed lg:hidden bottom-4 right-4 h-8 w-8 border border-neutral-200 rounded-full backdrop-blur-sm flex items-center justify-center z-50"
        onClick={() => setOpen(!open)}
      >
        <IconLayoutSidebarRightCollapse className="h-4 w-4 text-secondary" />
      </button>
    </>
  );
};

export const Navigation = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex flex-col space-y-1 my-10 relative z-[100]">
      {navlinks.map((link: Navlink) => (
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
      ))}

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
};

const SidebarHeader = () => {
  return (
    <div className="flex">
      <div className="flex text-sm flex-col">
        <p className="font-bold text-primary">Dentalove</p>
        <p className="font-light text-slate-600">Planes Dentales</p>
      </div>
    </div>
  );
};
