"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Plan } from "@/components/planes/PlanCard";

const STORAGE_KEY = "ctp_comparar_planes";
const MAX_PLANES = 4;

interface CompareContextType {
  seleccionados: string[];
  planesSeleccionados: Plan[];
  agregarPlan: (plan: Plan) => { ok: boolean; mensaje?: string };
  quitarPlan: (id_crc: string) => void;
  toggle: (plan: Plan) => { ok: boolean; mensaje?: string };
  limpiar: () => void;
  estaSeleccionado: (id_crc: string) => boolean;
  puedeAgregar: boolean;
  cantidad: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);
const keyOf = (p: Plan) => p.id_crc ?? p.id;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [planesData, setPlanesData] = useState<Record<string, Plan>>({});
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const parsed = JSON.parse(guardado);
        // Migración: el formato viejo era un array de ids. Si detectamos
        // eso, lo ignoramos y arrancamos limpio en vez de romper.
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setPlanesData(parsed);
        }
      }
    } catch {
      // localStorage no disponible o corrupto
    } finally {
      setHidratado(true);
    }
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(planesData));
    } catch {
      // storage lleno o bloqueado — no crítico
    }
  }, [planesData, hidratado]);

  const seleccionados = Object.keys(planesData);
  const planesSeleccionados = Object.values(planesData);
  const estaSeleccionado = (id_crc: string) => id_crc in planesData;

  const agregarPlan = (plan: Plan) => {
    const key = keyOf(plan);
    if (key in planesData) return { ok: true };
    if (seleccionados.length >= MAX_PLANES) {
      return { ok: false, mensaje: `Ya tienes ${MAX_PLANES} planes seleccionados. Quita uno para agregar otro.` };
    }
    setPlanesData((prev) => ({ ...prev, [key]: plan }));
    return { ok: true };
  };

  const quitarPlan = (id_crc: string) => {
    setPlanesData((prev) => {
      const next = { ...prev };
      delete next[id_crc];
      return next;
    });
  };

  const toggle = (plan: Plan) => {
    const key = keyOf(plan);
    if (key in planesData) { quitarPlan(key); return { ok: true }; }
    return agregarPlan(plan);
  };

  const limpiar = () => setPlanesData({});

  return (
    <CompareContext.Provider value={{
      seleccionados, planesSeleccionados, agregarPlan, quitarPlan, toggle,
      limpiar, estaSeleccionado, puedeAgregar: seleccionados.length < MAX_PLANES,
      cantidad: seleccionados.length,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare debe usarse dentro de <CompareProvider>");
  return ctx;
}
