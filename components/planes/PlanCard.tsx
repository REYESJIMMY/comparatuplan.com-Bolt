"use client";
import Link from "next/link";
import { Heart, Scale, Check } from "lucide-react";
import { C, openWA } from "@/lib/constants";

export interface Plan {
  id: string; id_crc: string | null; operador: string; nombre: string; tipo: string;
  precio: number | string; velocidad_mbps: number | null; datos_gb: number | null;
  canales_tv: number | null; minutos: string | null; modalidad: string | null; tecnologia: string | null;
  estrato_min?: number | null; estrato_max?: number | null; fuente?: "CRC" | "Exclusiva";
}

const OP_COLORS: Record<string, string> = { Claro: "#e2001a", Movistar: "#00aa44", Etb: "#f59e0b", Tigo: "#00a0e3" };
const OP_EMOJI:  Record<string, string> = { Claro: "🔴", Movistar: "🟢", Etb: "🟡", Tigo: "🔵" };

function getTags(p: Plan): { label: string; color: string }[] {
  const tags: { label: string; color: string }[] = [];
  if (p.datos_gb === -1) tags.push({ label: "Datos ilimitados", color: C.cyan });
  if ((p.canales_tv ?? 0) > 100) tags.push({ label: "+100 canales", color: C.yellow });
  if ((p.velocidad_mbps ?? 0) >= 300) tags.push({ label: "Ideal Gaming", color: C.neon2 });
  if (p.tecnologia?.toLowerCase().includes("fibra")) tags.push({ label: "Fibra óptica", color: C.green });
  return tags.slice(0, 2);
}

interface Props {
  plan: Plan; isFav: boolean; onFav: (p: Plan) => void;
  isLoggedIn: boolean; onAuthPrompt: () => void;
  compareChecked: boolean; onToggleCompare: (p: Plan) => void; compareDisabled: boolean;
}

export const PlanCard = ({ plan, isFav, onFav, isLoggedIn, onAuthPrompt, compareChecked, onToggleCompare, compareDisabled }: Props) => {
  const color = OP_COLORS[plan.operador] ?? C.neon;
  const emoji = OP_EMOJI[plan.operador] ?? "📡";
  const tags = getTags(plan);
  const precioNum = typeof plan.precio === "string" ? parseFloat(plan.precio) : plan.precio;
  
  return (
    <div
      style={{
        background: "rgba(8,6,28,0.85)", border: `1px solid ${compareChecked ? C.neon : `${color}22`}`,
        borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 10,
        transition: "all .2s", position: "relative",
        boxShadow: compareChecked ? `0 0 0 1px ${C.neon}` : "none",
      }}
      onMouseEnter={(e: any) => {
        if (compareChecked) return;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = `${color}55`;
        e.currentTarget.style.boxShadow = `0 8px 28px ${color}14`;
      }}
      onMouseLeave={(e: any) => {
        if (compareChecked) return;
        e.currentTarget.style.transform = "";
        e.currentTarget.style.borderColor = `${color}22`;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header: operador + acciones */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 14 }}>{emoji}</span>
          <span style={{ color, fontWeight: 800, fontSize: 11 }}>{plan.operador}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onToggleCompare(plan)}
            disabled={!compareChecked && compareDisabled}
            title={compareChecked ? "Quitar de comparación" : "Agregar a comparación"}
            style={{
              background: compareChecked ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${compareChecked ? C.neon : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8, padding: "5px 7px", cursor: (!compareChecked && compareDisabled) ? "not-allowed" : "pointer",
              opacity: (!compareChecked && compareDisabled) ? 0.35 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {compareChecked ? <Check size={13} color={C.neon} /> : <Scale size={13} color="rgba(255,255,255,0.4)" />}
          </button>
          <button
            onClick={() => isLoggedIn ? onFav(plan) : onAuthPrompt()}
            style={{
              background: isFav ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${isFav ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8, padding: "5px 7px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Heart size={13} fill={isFav ? "#ec4899" : "none"} color={isFav ? "#ec4899" : "rgba(255,255,255,0.3)"} />
          </button>
        </div>
      </div>

      <div style={{ color: "#e8eaf6", fontWeight: 700, fontSize: 13, lineHeight: 1.35, minHeight: 34 }}>
        {plan.nombre.length > 55 ? plan.nombre.slice(0, 55) + "…" : plan.nombre}
      </div>

      <div style={{ color, fontWeight: 900, fontSize: 26, lineHeight: 1 }}>
        ${plan.precio.toLocaleString("es-CO")}
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/mes</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {plan.velocidad_mbps && (
          <span style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: C.neon, borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>⚡ {plan.velocidad_mbps} Mbps</span>
        )}
        {plan.datos_gb != null && (
          <span style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", color: "#a855f7", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{plan.datos_gb === -1 ? "∞ Datos" : `${plan.datos_gb} GB`}</span>
        )}
        {plan.canales_tv && (
          <span style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>📺 {plan.canales_tv} canales</span>
        )}
        {plan.modalidad && (
          <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(180,195,230,0.5)", borderRadius: 99, padding: "2px 8px", fontSize: 9 }}>{plan.modalidad}</span>
        )}
      </div>

      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 5 }}>
          {tags.map((t) => (
            <span key={t.label} style={{ background: `${t.color}14`, border: `1px solid ${t.color}33`, color: t.color, borderRadius: 6, padding: "2px 7px", fontSize: 9.5, fontWeight: 700 }}>{t.label}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <Link
          href={`/planes/${plan.id_crc}`}
          style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: "10px 0", color: "rgba(220,230,255,0.7)", fontWeight: 700, fontSize: 12, textAlign: "center", textDecoration: "none" }}
        >
          Ver detalles
        </Link>
        <button
          onClick={() => openWA(`${plan.operador} - ${plan.nombre}`)}
          style={{ flex: 1, background: "linear-gradient(135deg,#25d366,#128c7e)", border: "none", borderRadius: 9, padding: "10px 0", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
        >
          Contratar
        </button>
      </div>
    </div>
  );
};
