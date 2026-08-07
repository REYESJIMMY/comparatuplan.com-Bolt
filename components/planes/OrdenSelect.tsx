"use client";
import { ArrowUpDown } from "lucide-react";
import { C } from "@/lib/constants";
import { useTheme } from "@/context/ThemeContext";

export type OrdenId = "precio_asc" | "precio_desc" | "velocidad_desc" | "datos_desc";

const OPCIONES: { id: OrdenId; label: string }[] = [
  { id: "precio_asc",     label: "💰 Más barato primero" },
  { id: "precio_desc",    label: "💎 Más caro primero" },
  { id: "velocidad_desc", label: "⚡ Mayor velocidad" },
  { id: "datos_desc",     label: "📶 Más datos" },
];

export const OrdenSelect = ({ value, onChange }: { value: OrdenId; onChange: (o: OrdenId) => void }) => {
  const { theme } = useTheme();
  const L = theme === "light";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <ArrowUpDown size={13} color={L ? "#64748b" : C.muted} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as OrdenId)}
        style={{
          background: L ? "#fff" : "rgba(255,255,255,0.05)",
          border: `1px solid ${L ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 9, padding: "8px 12px", color: L ? "#0d1b2e" : "#fff",
          fontSize: 12.5, fontWeight: 600, appearance: "none", cursor: "pointer",
        }}
      >
        {OPCIONES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
};
