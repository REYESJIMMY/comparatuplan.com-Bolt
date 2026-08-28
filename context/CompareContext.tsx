// context/CompareContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const STORAGE_KEY = "ctp_comparar_planes";
const MAX_PLANES = 4;

interface CompareContextType {
  seleccionados: string[]; // ids_crc
  agregarPlan: (id_crc: string) => { ok: boolean; mensaje?: string };
  quitarPlan: (id_crc: string) => void;
  toggle: (id_crc: string) => { ok: boolean; mensaje?: string };
  limpiar: () => void;
  estaSeleccionado: (id_crc: string) => boolean;
  puedeAgregar: boolean; // false cuando ya hay 4
  cantidad: number;
}

const CompareContext = createContext<CompareContextType | undefined>(
  undefined
);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [hidratado, setHidratado] = useState(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed)) {
          setSeleccionados(parsed.slice(0, MAX_PLANES));
        }
      }
    } catch {
      // localStorage no disponible o corrupto — arrancar vacío
    } finally {
      setHidratado(true);
    }
  }, []);

  // Persistir cada cambio (solo después de hidratar, para no pisar con [])
  useEffect(() => {
    if (!hidratado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seleccionados));
    } catch {
      // storage lleno o bloqueado — no es crítico, seguimos en memoria
    }
  }, [seleccionados, hidratado]);

  const estaSeleccionado = (id_crc: string) =>
    seleccionados.includes(id_crc);

  const agregarPlan = (id_crc: string) => {
    if (seleccionados.includes(id_crc)) {
      return { ok: true };
    }
    if (seleccionados.length >= MAX_PLANES) {
      return {
        ok: false,
        mensaje: `Ya tienes ${MAX_PLANES} planes seleccionados. Quita uno para agregar otro.`,
      };
    }
    setSeleccionados((prev) => [...prev, id_crc]);
    return { ok: true };
  };

  const quitarPlan = (id_crc: string) => {
    setSeleccionados((prev) => prev.filter((id) => id !== id_crc));
  };

  const toggle = (id_crc: string) => {
    if (estaSeleccionado(id_crc)) {
      quitarPlan(id_crc);
      return { ok: true };
    }
    return agregarPlan(id_crc);
  };

  const limpiar = () => setSeleccionados([]);

  return (
    <CompareContext.Provider
      value={{
        seleccionados,
        agregarPlan,
        quitarPlan,
        toggle,
        limpiar,
        estaSeleccionado,
        puedeAgregar: seleccionados.length < MAX_PLANES,
        cantidad: seleccionados.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare debe usarse dentro de <CompareProvider>");
  }
  return ctx;
}
