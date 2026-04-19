"use client";
import { C } from "@/lib/constants";
import { type UbicacionData } from "@/components/game/CoberturaForm";

interface Props {
  ubicacion: UbicacionData;
  onHogar:   () => void;
  onMovil:   () => void;
  onBack:    () => void;
  onCancel:  () => void;
}

export const SegmentSelector = ({ ubicacion, onHogar, onMovil, onBack, onCancel }: Props) => (
  <div style={{
    position: "fixed", inset: 0,
    background: "rgba(4,4,15,0.93)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 999, padding: "1rem",
    backdropFilter: "blur(8px)",
  }}>
    <div style={{
      background: "linear-gradient(160deg,#06041a,#0a0620)",
      border: `1px solid ${C.border}`,
      borderRadius: 20, padding: "1.75rem",
      maxWidth: 480, width: "100%",
      textAlign: "center",
    }}>

      {/* Progreso */}
      <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem" }}>
        {["Ubicación", "Tipo de plan", "Resultados"].map((l, i) => (
          <div key={l} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= 1 ? C.neon : "rgba(255,255,255,0.08)",
          }} />
        ))}
      </div>

      {/* Resumen ubicación */}
      <div style={{
        background: "rgba(0,212,255,0.06)",
        border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "10px 14px",
        marginBottom: "1.5rem",
        display: "flex", alignItems: "center", gap: 10,
        textAlign: "left",
      }}>
        <span style={{ fontSize: 20 }}>📍</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
            {ubicacion.municipio}, {ubicacion.departamento}
          </div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
            Estrato {ubicacion.estrato}
            {ubicacion.barrio ? ` · ${ubicacion.barrio}` : ""}
          </div>
        </div>
        <button
          onClick={onBack}
          style={{ background: "none", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 6, padding: "4px 10px", color: C.muted, fontSize: 11, cursor: "pointer" }}
        >
          Cambiar
        </button>
      </div>

      {/* Header */}
      <div style={{ color: C.neon, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>
        PASO 2 DE 2 — TIPO DE PLAN
      </div>
      <h2 style={{ fontWeight: 900, fontSize: "1.4rem", color: "#fff", marginBottom: 8 }}>
        ¿Qué tipo de plan buscas?
      </h2>
      <p style={{ color: C.muted, fontSize: 12, marginBottom: 24, lineHeight: 1.6 }}>
        Según tu elección te mostraremos los planes disponibles en{" "}
        <strong style={{ color: "#fff" }}>{ubicacion.municipio}</strong>
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
          background: "transparent",
          border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 10, padding: "10px 24px",
          color: C.muted, fontSize: 13, cursor: "pointer",
        }}
      >
        Cancelar
      </button>
    </div>
  </div>
);
