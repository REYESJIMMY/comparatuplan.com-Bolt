"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { CAPSULAS, type Capsula } from "@/components/game/capsulas";
import { supabase } from "@/lib/supabase";

const AUTO_DISMISS_MS = 7000;

export function useCapsulas(userId?: string | null) {
  const [cola, setCola]     = useState<Capsula[]>([]);
  const [actual, setActual] = useState<Capsula | null>(null);
  const [xp, setXp]         = useState(0);
  const conocidasRef        = useRef<Set<string>>(new Set());
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cargadoRef          = useRef(false);

  // Al identificar al usuario, trae su XP y cápsulas ya vistas —
  // así no repite premios ni cápsulas entre sesiones distintas.
  useEffect(() => {
    if (!userId || cargadoRef.current) return;
    cargadoRef.current = true;
    supabase
      .from("perfiles")
      .select("megas_xp, capsulas_vistas")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) return;
        setXp(data.megas_xp ?? 0);
        (data.capsulas_vistas ?? []).forEach((id: string) => conocidasRef.current.add(id));
      });
  }, [userId]);

  // Llamar disparar("gamer-latencia") desde GameFlow en el momento exacto
  // del trigger. Si ya se mostró esa cápsula (esta sesión o una anterior
  // con cuenta), no hace nada.
  const disparar = useCallback((id: string) => {
    if (conocidasRef.current.has(id)) return;
    const capsula = CAPSULAS.find((c) => c.id === id);
    if (!capsula) return;
    conocidasRef.current.add(id);
    setCola((prev) => [...prev, capsula]);
  }, []);

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

  // Saca la siguiente cápsula de la cola cuando no hay una activa en pantalla.
  // Si trae XP, suma localmente y persiste en Supabase si hay usuario logueado.
  useEffect(() => {
    if (!actual && cola.length > 0) {
      const [siguiente, ...resto] = cola;
      setActual(siguiente);
      setCola(resto);
      if (siguiente.xp > 0) {
        setXp((prev) => {
          const nuevoXp = prev + siguiente.xp;
          if (userId) {
            supabase
              .from("perfiles")
              .update({
                megas_xp: nuevoXp,
                capsulas_vistas: Array.from(conocidasRef.current),
              })
              .eq("id", userId)
              .then(({ error }) => {
                if (error) console.error("Error guardando XP:", error);
              });
          }
          return nuevoXp;
        });
      }
    }
  }, [actual, cola, userId]);

  // Auto-cierre a los 7s si el usuario no la cierra antes
  useEffect(() => {
    if (actual) {
      timerRef.current = setTimeout(() => setActual(null), AUTO_DISMISS_MS);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [actual]);

  const cerrar = useCallback(() => setActual(null), []);

  return { actual, disparar, mostrarMensaje, cerrar, xp };
}
