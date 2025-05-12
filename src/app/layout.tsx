import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { twMerge } from "tailwind-merge";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Dentalove - Planes Dentales",
  description:
    "Dentalove ofrece planes dentales personalizados para el cuidado de tu salud bucal. Consulta y administra a tus pacientes de manera eficiente.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={twMerge(inter.className, "flex antialiased h-screen overflow-hidden bg-gray-100")}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
