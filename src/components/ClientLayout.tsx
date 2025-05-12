"use client";

import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Determinar si se debe mostrar el Sidebar
  const showSidebar = pathname !== "/" && pathname !== "/login";
  
  return (
    <AuthProvider>
      {showSidebar && <Sidebar />}
      <div className={twMerge(
        "lg:pt-2 bg-gray-100 flex-1 overflow-y-auto",
        showSidebar ? "lg:pl-2" : "")}>
        <div className={twMerge(
          "flex-1 bg-white min-h-screen border border-transparent overflow-y-auto flex flex-col",
          showSidebar ? "lg:rounded-tl-xl lg:border-neutral-200" : "")}>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </div>
      <Toaster />
    </AuthProvider>
  );
} 