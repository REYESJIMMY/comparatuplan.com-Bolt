"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { CAPSULAS, type Capsula } from "@/components/game/capsulas";

const AUTO_DISMISS_MS = 7000;

export function useCapsulas() {
  const [cola, setCola]     = useState<Capsula[]>([]);
  const [actual, setActual] = useState<Capsula | null>(null);
  const [xp, setXp]         = useState(0);
  const conocidasRef        = useRef<Set<string>>(new Set());
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Llamar disparar("gamer-latencia") desde GameFlow en el momento exacto
  // del trigger. Si ya se mostró esa cápsula en esta sesión, no hace nada.
  const disparar = useCallback((id: string) => {
    if (conocidasRef.current.has(id)) return;
    const capsula = CAPSULAS.find((c) => c.id === id);
    if (!capsula) return;
    conocidasRef.current.add(id);
    setCola((prev) => [...prev, capsula]);
  }, []);

  // Saca la siguiente cápsula de la cola cuando no hay una activa en pantalla
  useEffect(() => {
    if (!actual && cola.length > 0) {
      const [siguiente, ...resto] = cola;
      setActual(siguiente);
      setCola(resto);
      setXp((prev) => prev + siguiente.xp);
    }
  }, [actual, cola]);

  // Auto-cierre a los 7s si el usuario no la cierra antes
  useEffect(() => {
    if (actual) {
      timerRef.current = setTimeout(() => setActual(null), AUTO_DISMISS_MS);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [actual]);

  // Para eventos de Nexi que no son cápsulas de conocimiento (NEXI_EVENTOS),
  // como el mensaje de misión completada. No suman XP ni se repiten dos
  // veces con el mismo texto en la sesión.
  const mostrarMensaje = useCallback((texto: string, opts?: { icono?: string; titulo?: string }) => {
    if (conocidasRef.current.has(texto)) return;
    conocidasRef.current.add(texto);
    const item: Capsula = {
      id: `evento-${Date.now()}`,
      trigger: "evento",
      categoria: "confianza",
      icono: opts?.icono ?? "🤖",
      titulo: opts?.titulo ?? "Nexi",
      texto,
      puente: "",
      xp: 0,
    };
    setCola((prev) => [...prev, item]);
  }, []);

  const cerrar = useCallback(() => setActual(null), []);

  return { actual, disparar, mostrarMensaje, cerrar, xp };
}
