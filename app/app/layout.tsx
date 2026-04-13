import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title:       "ComparaTuPlan.com — Compara planes de internet, móvil y TV en Colombia",
  description: "Compara y encuentra el mejor plan de telecomunicaciones en Colombia. Internet, móvil, TV y paquetes de +15 operadores. Diseña tu hogar digital con IA.",
  keywords:    "planes internet colombia, planes moviles colombia, comparar planes telecomunicaciones, claro movistar tigo",
  openGraph: {
    title:       "ComparaTuPlan.com",
    description: "El comparador #1 de planes de telecomunicaciones en Colombia",
    locale:      "es_CO",
    type:        "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className={inter.variable}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
