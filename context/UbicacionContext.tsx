"use client";
/**
 * UbicacionContext
 * -----------------
 * Fuente única de verdad para la ubicación del usuario.
 * La llenan (parcial o totalmente) tres flujos distintos:
 *   1. "Consulta Cobertura"  -> setUbicacionCompleta() (departamento, ciudad, barrio?, direccion?, estrato)
 *   2. Misión 3D / Perfil    -> setUbicacionMinima()   (solo departamento + ciudad)
 *   3. Nexus (chat)          -> setUbicacionMinima()   (extraída de la conversación)
 *
 * Cualquiera de los tres, al montar, primero pregunta si ya hay
 * ubicacion.ciudad — si la hay, no vuelve a pedirla.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const STORAGE_KEY = "ctp_ubicacion";

export interface Ubicacion {
  departamento: string;
  ciudad: string;
  barrio?: string;
  direccion?: string;
  estrato?: number;
  /** true solo si vino del flujo completo de Cobertura (tiene barrio/direccion/estrato) */
  completa: boolean;
  actualizadaEn: string; // ISO date
}

interface UbicacionContextValue {
  ubicacion: Ubicacion | null;
  /** Úsalo desde Misión 3D o Nexus: solo pide lo indispensable */
  setUbicacionMinima: (departamento: string, ciudad: string) => void;
  /** Úsalo desde el flujo de Cobertura: guarda todo lo capturado */
  setUbicacionCompleta: (u: Omit<Ubicacion, "completa" | "actualizadaEn">) => void;
  clearUbicacion: () => void;
  /** true si ya tenemos al menos departamento+ciudad, sin importar el flujo de origen */
  tieneUbicacionMinima: boolean;
}

const UbicacionContext = createContext<UbicacionContextValue | undefined>(undefined);

export function UbicacionProvider({ children }: { children: ReactNode }) {
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hidratar desde localStorage al montar (evita re-preguntar en cada visita)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUbicacion(JSON.parse(raw));
    } catch {
      /* localStorage no disponible (SSR) — no pasa nada, se pedirá de nuevo */
    } finally {
      setHydrated(true);
    }
  }, []);

  const persist = (u: Ubicacion) => {
    setUbicacion(u);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {}
    // TODO: si hay usuario autenticado (useAuth), sincronizar también a
    // supabase.from('perfiles').update({ ubicacion: u }).eq('id', user.id)
    // para que persista entre dispositivos, no solo en este navegador.
  };

  const setUbicacionMinima = (departamento: string, ciudad: string) => {
    // No pisa una ubicación completa ya existente con una mínima más pobre
    if (ubicacion?.completa) return;
    persist({
      departamento,
      ciudad,
      completa: false,
      actualizadaEn: new Date().toISOString(),
    });
  };

  const setUbicacionCompleta: UbicacionContextValue["setUbicacionCompleta"] = (u) => {
    persist({ ...u, completa: true, actualizadaEn: new Date().toISOString() });
  };

  const clearUbicacion = () => {
    setUbicacion(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  if (!hydrated) return null; // evita flash de "pedir ubicación" antes de leer localStorage

  return (
    <UbicacionContext.Provider
      value={{
        ubicacion,
        setUbicacionMinima,
        setUbicacionCompleta,
        clearUbicacion,
        tieneUbicacionMinima: !!ubicacion?.ciudad,
      }}
    >
      {children}
    </UbicacionContext.Provider>
  );
}

export function useUbicacion() {
  const ctx = useContext(UbicacionContext);
  if (!ctx) throw new Error("useUbicacion debe usarse dentro de <UbicacionProvider>");
  return ctx;
}
