import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title:       "ComparaTuPlan.com — Compara planes de internet, móvil y TV en Colombia",
  description: "Compara y encuentra el mejor plan de telecomunicaciones en Colombia. Internet, móvil, TV y paquetes de +15 operadores. Diseña tu hogar digital con IA.",
  keywords:    "planes internet colombia, planes moviles colombia, comparar planes telecomunicaciones, claro movistar tigo",
  manifest:    "/manifest.json",
  themeColor:  "#00d4ff",
  openGraph: {
    title:       "ComparaTuPlan.com",
    description: "El comparador #1 de planes de telecomunicaciones en Colombia",
    locale:      "es_CO",
    type:        "website",
    url:         "https://www.comparatuplan.com",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "ComparaTuPlan.com" }],
  },
  icons: {
    icon:  "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00d4ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ComparaTuPlan" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={inter.variable}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
