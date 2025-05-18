import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";

export function CTA() {
  const { user } = useAuth();
  
  const headerText = "Empiece hoy a optimizar su práctica dental";
  const bodyText = "Únase a cientos de profesionales que confían en Dentalove para el manejo de sus planes dentales y pacientes. Nuestra plataforma le ayudará a mejorar la eficiencia y calidad de su servicio.";
  
  return (
    <div className="relative rounded-2xl bg-slate-900 mx-4 mb-20 mt-20 text-gray-100 max-w-6xl lg:mx-auto min-h-96 h-full overflow-hidden pb-4">
      <div
        className="absolute inset-0 top-0 bg-grid-slate-800/30"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, white, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, white, transparent)",
        }}
      ></div>

      <div className="lg:grid lg:grid-cols-1 gap-10 p-8 md:p-16 relative z-20">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-bold my-4 text-center">
            {headerText}
          </h2>
          <p className="my-6 text-base text-gray-300 md:text-lg tracking-wide font-light text-center max-w-xl mx-auto">
            {bodyText}
          </p>

          {!user && (
            <div className="flex justify-center mt-10">
              <Button 
                size="lg" 
                className="rounded-xl py-6 px-8 bg-white text-slate-900 hover:bg-blue-50"
              >
                <Link href="/register">
                  Comenzar ahora
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 