"use client";
/**
 * UbicacionContext
 * -----------------
 * Fuente única de verdad para la ubicación del usuario.
 * Campos alineados 1:1 con UbicacionData (components/game/CoberturaForm.tsx)
 * para no tener dos nombres distintos del mismo dato en el proyecto.
 *
 * La llenan tres flujos distintos:
 *   1. "Consulta Cobertura" (CoberturaForm) -> setUbicacionCompleta() (todos los campos)
 *   2. Misión 3D / tab Perfil                -> setUbicacionMinima()   (departamento + municipio)
 *   3. Nexus (chat)                          -> setUbicacionMinima()   (extraída de la conversación)
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const STORAGE_KEY = "ctp_ubicacion";

export interface Ubicacion {
  departamento: string;
  municipio: string;
  barrio?: string;
  direccion?: string;
  estrato?: number;
  /** true solo si vino del flujo completo de Cobertura (tiene estrato/barrio/direccion) */
  completa: boolean;
  actualizadaEn: string; // ISO date
}

interface UbicacionContextValue {
  ubicacion: Ubicacion | null;
  /** Úsalo desde Misión 3D o Nexus: solo pide lo indispensable */
  setUbicacionMinima: (departamento: string, municipio: string) => void;
  /** Úsalo desde CoberturaForm: guarda todo lo capturado */
  setUbicacionCompleta: (u: Omit<Ubicacion, "completa" | "actualizadaEn">) => void;
  clearUbicacion: () => void;
  /** true si ya tenemos al menos departamento+municipio, sin importar el flujo de origen */
  tieneUbicacionMinima: boolean;
}

const UbicacionContext = createContext<UbicacionContextValue | undefined>(undefined);

export function UbicacionProvider({ children }: { children: ReactNode }) {
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUbicacion(JSON.parse(raw));
    } catch {
      /* localStorage no disponible (SSR) */
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
  };

  const setUbicacionMinima = (departamento: string, municipio: string) => {
    // No pisa una ubicación completa ya existente con una mínima más pobre
    if (ubicacion?.completa) return;
    persist({
      departamento,
      municipio,
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

  if (!hydrated) return null;

  return (
    <UbicacionContext.Provider
      value={{
        ubicacion,
        setUbicacionMinima,
        setUbicacionCompleta,
        clearUbicacion,
        tieneUbicacionMinima: !!ubicacion?.municipio,
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
