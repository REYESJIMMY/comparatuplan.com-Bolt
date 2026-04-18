"use client";
import { C } from "@/lib/constants";
import { GlowBtn } from "@/components/ui";

interface SegmentSelectorProps {
  onHogar:  () => void;
  onMovil:  () => void;
  onCancel: () => void;
}

export const SegmentSelector = ({ onHogar, onMovil, onCancel }: SegmentSelectorProps) => (
  <div style={{
    position: "fixed", inset: 0,
    background: "rgba(4,4,15,0.92)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 999, padding: "1rem",
    backdropFilter: "blur(8px)",
  }}>
    <div style={{
      background: "linear-gradient(160deg,#06041a,#0a0620)",
      border: `1px solid ${C.border}`,
      borderRadius: 20, padding: "2rem",
      maxWidth: 480, width: "100%",
      textAlign: "center",
    }}>
      {/* Header */}
      <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
      <div style={{ color: C.neon, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>
        CONSULTA TU COBERTURA
      </div>
      <h2 style={{
        fontWeight: 900, fontSize: "clamp(1.3rem,4vw,1.7rem)",
        color: "#fff", marginBottom: 8, lineHeight: 1.2,
      }}>
        ¿Qué tipo de plan buscas?
      </h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
        Según tu elección te guiaremos al análisis perfecto para tu situación
      </p>

      {/* Opciones */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {/* Hogar */}
        <button
          onClick={onHogar}
          style={{
            background: "rgba(0,212,255,0.06)",
            border: `2px solid ${C.border}`,
            borderRadius: 16, padding: "24px 16px",
            cursor: "pointer", transition: "all .2s",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 10,
          }}
          onMouseEnter={(e: any) => {
            e.currentTarget.style.background = "rgba(0,212,255,0.12)";
            e.currentTarget.style.borderColor = C.neon;
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e: any) => {
            e.currentTarget.style.background = "rgba(0,212,255,0.06)";
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.transform = "";
          }}
        >
          <div style={{ fontSize: 44 }}>🏠</div>
          <div style={{ color: C.neon, fontWeight: 800, fontSize: 16 }}>Hogar</div>
          <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5 }}>
            Internet fijo, TV<br />y paquetes para tu casa
          </div>
          <div style={{
            background: `${C.neon}14`, border: `1px solid ${C.neon}33`,
            borderRadius: 8, padding: "4px 12px",
            color: C.neon, fontSize: 10, fontWeight: 700,
          }}>
            Diseño inteligente →
          </div>
        </button>

        {/* Móvil */}
        <button
          onClick={onMovil}
          style={{
            background: "rgba(168,85,247,0.06)",
            border: `2px solid rgba(168,85,247,0.2)`,
            borderRadius: 16, padding: "24px 16px",
            cursor: "pointer", transition: "all .2s",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 10,
          }}
          onMouseEnter={(e: any) => {
            e.currentTarget.style.background = "rgba(168,85,247,0.12)";
            e.currentTarget.style.borderColor = C.neon2;
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e: any) => {
            e.currentTarget.style.background = "rgba(168,85,247,0.06)";
            e.currentTarget.style.borderColor = "rgba(168,85,247,0.2)";
            e.currentTarget.style.transform = "";
          }}
        >
          <div style={{ fontSize: 44 }}>📱</div>
          <div style={{ color: C.neon2, fontWeight: 800, fontSize: 16 }}>Móvil</div>
          <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5 }}>
            Planes de datos y minutos<br />para tu celular
          </div>
          <div style={{
            background: `${C.neon2}14`, border: `1px solid ${C.neon2}33`,
            borderRadius: 8, padding: "4px 12px",
            color: C.neon2, fontSize: 10, fontWeight: 700,
          }}>
            Comparar planes →
          </div>
        </button>
      </div>

      <button
        onClick={onCancel}
        style={{
          background: "transparent", border: `1px solid ${C.borderSoft}`,
          borderRadius: 10, padding: "10px 24px",
          color: C.muted, fontSize: 13, cursor: "pointer",
        }}
      >
        Cancelar
      </button>
    </div>
  </div>
);
