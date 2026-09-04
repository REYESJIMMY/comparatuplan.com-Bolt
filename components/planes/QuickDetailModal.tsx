"use client";
import { X } from "lucide-react";
import { C, openWA } from "@/lib/constants";
import type { Plan } from "./PlanCard";

const OP_COLORS: Record<string, string> = { Claro: "#e2001a", Movistar: "#00aa44", Etb: "#f59e0b", Tigo: "#00a0e3" };
const OP_EMOJI: Record<string, string> = { Claro: "🔴", Movistar: "🟢", Etb: "🟡", Tigo: "🔵" };

interface Props {
  plan: Plan;
  onClose: () => void;
}

export const QuickDetailModal = ({ plan, onClose }: Props) => {
  const color = OP_COLORS[plan.operador] ?? C.neon;
  const emoji = OP_EMOJI[plan.operador] ?? "📡";
  const precioNum = typeof plan.precio === "string" ? parseFloat(plan.precio) : plan.precio;

  const segmento =
    plan.estrato_min != null
      ? plan.estrato_min === plan.estrato_max
        ? `Residencial - Estrato ${plan.estrato_min}`
        : `Residencial - Estrato ${plan.estrato_min}-${plan.estrato_max}`
      : null;

  const otras: string[] = [];
  if (plan.canales_tv) otras.push(`${plan.canales_tv} canales TV`);
  if (plan.datos_gb != null) otras.push(plan.datos_gb === -1 ? "Datos ilimitados" : `${plan.datos_gb} GB de datos`);
  if (plan.minutos && plan.minutos !== "0") otras.push(plan.minutos === "-1" ? "Minutos ilimitados" : `${plan.minutos} minutos`);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(4,4,15,0.85)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d0d1a", border: `1px solid ${C.border}`, borderRadius: 18,
          maxWidth: 640, width: "100%", maxHeight: "88vh", overflowY: "auto",
          boxShadow: `0 0 60px ${color}22`,
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${C.borderSoft}`,
          position: "sticky", top: 0, background: "#0d0d1a", borderRadius: "18px 18px 0 0",
        }}>
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 16, margin: 0 }}>Detalles del plan</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar detalles del plan"
            style={{
              background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%",
              width: 30, height: 30, cursor: "pointer", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="quickdetail-grid" style={{ padding: 22, display: "grid", gridTemplateColumns: "180px 1fr", gap: 22 }}>
          {/* Columna izquierda — identidad + precio */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              background: `${color}14`, border: `1px solid ${color}33`,
              borderRadius: 10, padding: "8px 10px",
            }}>
              <span style={{ fontSize: 16 }}>{emoji}</span>
              <span style={{ color, fontWeight: 800, fontSize: 12 }}>{plan.operador}</span>
            </div>

            <div>
              <div style={{ color: "rgba(180,195,230,0.4)", fontSize: 9, fontWeight: 800, letterSpacing: 0.5, marginBottom: 3 }}>NOMBRE DEL PLAN</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.4 }}>{plan.nombre}</div>
            </div>

            <div style={{
              background: `${color}0e`, border: `1px solid ${color}33`, borderRadius: 12,
              padding: "12px 14px", textAlign: "center", marginTop: 4,
            }}>
              <div style={{ color: "rgba(180,195,230,0.5)", fontSize: 10, marginBottom: 3 }}>Valor / mes</div>
              <div style={{ color, fontWeight: 900, fontSize: 22 }}>${precioNum.toLocaleString("es-CO")}</div>
            </div>
          </div>

          {/* Columna derecha — specs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {plan.modalidad && (
                <div>
                  <div style={{ color: "rgba(180,195,230,0.4)", fontSize: 9, fontWeight: 800, letterSpacing: 0.5, marginBottom: 3 }}>MODALIDAD</div>
                  <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}>{plan.modalidad}</div>
                </div>
              )}
              {plan.tecnologia && (
                <div>
                  <div style={{ color: "rgba(180,195,230,0.4)", fontSize: 9, fontWeight: 800, letterSpacing: 0.5, marginBottom: 3 }}>TECNOLOGÍA</div>
                  <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}>{plan.tecnologia}</div>
                </div>
              )}
              {plan.velocidad_mbps && (
                <div>
                  <div style={{ color: "rgba(180,195,230,0.4)", fontSize: 9, fontWeight: 800, letterSpacing: 0.5, marginBottom: 3 }}>VELOCIDAD</div>
                  <div style={{ color: C.neon, fontSize: 12.5, fontWeight: 700 }}>{plan.velocidad_mbps} Mbps</div>
                </div>
              )}
              {segmento && (
                <div>
                  <div style={{ color: "rgba(180,195,230,0.4)", fontSize: 9, fontWeight: 800, letterSpacing: 0.5, marginBottom: 3 }}>SEGMENTO</div>
                  <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}>{segmento}</div>
                </div>
              )}
            </div>

            {otras.length > 0 && (
              <div>
                <div style={{ color: "rgba(180,195,230,0.4)", fontSize: 9, fontWeight: 800, letterSpacing: 0.5, marginBottom: 6 }}>OTRAS CARACTERÍSTICAS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {otras.map((o) => (
                    <div key={o} style={{ color: "rgba(220,230,255,0.8)", fontSize: 12.5, display: "flex", gap: 6 }}>
                      <span style={{ color: C.neon }}>✓</span>{o}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => openWA(`${plan.operador} - ${plan.nombre}`)}
              style={{
                marginTop: 6, background: "linear-gradient(135deg,#25d366,#128c7e)",
                border: "none", borderRadius: 10, padding: "11px 0",
                color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              💬 Quiero este plan
            </button>
          </div>
        </div>

        <div style={{ padding: "0 22px 18px", color: "rgba(180,195,230,0.3)", fontSize: 10, textAlign: "center" }}>
          Disponibilidad sujeta a cobertura — se confirma directamente con {plan.operador}
        </div>

        <style>{`
          @media (max-width: 560px) {
            .quickdetail-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
};
