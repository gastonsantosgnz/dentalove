import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function Navbar() {
  const { user } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const navItems = [
    { name: "Características", link: "#features" },
    { name: "Testimonios", link: "#testimonials" },
    { name: "Precios", link: "#pricing" },
  ];
  
  return (
    <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4 py-2">
      <div className="flex flex-row space-x-4 items-center justify-between antialiased rounded-2xl bg-white border border-slate-200 shadow-sm px-6 py-3">
        <Link href="/" className="font-bold text-2xl text-slate-900 flex items-center">
          <span className="text-[#0c7d74]">Dental</span>ove
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((navItem, idx) => (
            <NavLink 
              key={`link-${idx}`}
              href={navItem.link} 
              isActive={hoveredIndex === idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {navItem.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-[#0c7d74] hover:bg-[#0a6b63] text-white rounded-xl">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button className="bg-[#0c7d74] hover:bg-[#0a6b63] text-white rounded-xl">
                  Entrar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function NavLink({ href, children, isActive, onMouseEnter, onMouseLeave }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className="text-slate-700 text-sm relative px-3 py-2"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <AnimatePresence>
        {isActive && (
          <motion.span
            className="absolute inset-0 bg-slate-100 rounded-lg -z-10"
            layoutId="hoverBackground"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.15 },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, delay: 0.2 },
            }}
          />
        )}
      </AnimatePresence>
      <span className="relative z-10">{children}</span>
    </Link>
  );
} 