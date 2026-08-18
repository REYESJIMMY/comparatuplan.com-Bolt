"use client";
import { C } from "@/lib/constants";

const NIVELES_JUGADOR = [
  { min: 0,   nombre: "Novato de Red" },
  { min: 150, nombre: "Explorador Conectado" },
  { min: 400, nombre: "Maestro de la Red" },
  { min: 800, nombre: "Arquitecto Digital" },
];

function nivelPorXp(xp: number) {
  return [...NIVELES_JUGADOR].reverse().find((n) => xp >= n.min) ?? NIVELES_JUGADOR[0];
}

export function XPBadge({ xp }: { xp: number }) {
  const nivel = nivelPorXp(xp);
  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 800,
      background: "#0d0d1a", border: `1px solid ${C.border}`,
      borderRadius: 99, padding: "6px 14px",
      display: "flex", alignItems: "center", gap: 6,
      boxShadow: "0 0 12px rgba(0,212,255,0.12)",
    }}>
      <span style={{ fontSize: 13 }}>⚡</span>
      <span style={{ color: C.neon, fontWeight: 800, fontSize: 12 }}>{xp}</span>
      <span style={{ color: C.muted, fontSize: 10 }}>· {nivel.nombre}</span>
    </div>
  );
}
