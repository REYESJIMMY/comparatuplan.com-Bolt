"use client";
import { useState } from "react";
import { C } from "@/lib/constants";
import { GlowBtn, Card, Chip } from "@/components/ui";
import { DEPARTAMENTOS } from "@/lib/colombia";

/**
 * NomadaFlow — Mundo Nómada
 * -------------------------
 * Mini-flujo independiente (mismo patrón que MovilFlow.tsx: Wrap + Steps +
 * estado local por pasos) para el caso de uso "viajo a otra ciudad".
 *
 * OJO: el destino del viaje es una ubicación DISTINTA al domicilio del
 * usuario (UbicacionContext), así que este flujo NO usa setUbicacionMinima/
 * setUbicacionCompleta — mantiene su propio estado local de destino, igual
 * que MovilFlow mantiene su propio estado en vez de tocar contextos
 * compartidos que no le corresponden.
 *
 * Nivel 1 (implementado): Destino + Duración del viaje.
 * Niveles 2-4 (motivo, equipaje digital, recomendación + cross-sell):
 * pendientes — placeholder por ahora para poder desplegar el Nivel 1 sin
 * romper nada.
 */

// ── Tipos ────────────────────────────────────────────────────────
type SugerenciaModalidad = "prepago" | "pospago";

interface Duracion {
  id: string;
  label: string;
  desc: string;
  sugerenciaModalidad: SugerenciaModalidad;
  sugerenciaTexto: string;
}

interface NomadaData {
  destinoDepartamento: string | null;
  destinoMunicipio: string | null;
  duracion: Duracion | null;
  // Reservado para Nivel 2 (motivo del viaje) y Nivel 3 (equipaje digital)
  motivo: string | null;
  dispositivos: string[];
}

// ── Configuración ────────────────────────────────────────────────
const DURACIONES: Duracion[] = [
  {
    id: "corta",
    label: "1 – 3 días",
    desc: "Viaje relámpago",
    sugerenciaModalidad: "prepago",
    sugerenciaTexto: "Para tan pocos días, casi siempre conviene una SIM prepago o el roaming nacional de tu propia línea.",
  },
  {
    id: "media",
    label: "4 – 15 días",
    desc: "Viaje corto",
    sugerenciaModalidad: "prepago",
    sugerenciaTexto: "Una recarga prepago grande suele ser más flexible que abrir una línea nueva para tan poco tiempo.",
  },
  {
    id: "larga",
    label: "2 semanas – 3 meses",
    desc: "Viaje largo / trabajo remoto temporal",
    sugerenciaModalidad: "pospago",
    sugerenciaTexto: "A este plazo ya suele valer la pena una línea pospago o un plan de datos más grande.",
  },
  {
    id: "extendida",
    label: "Más de 3 meses",
    desc: "Estadía prolongada / mudanza temporal",
    sugerenciaModalidad: "pospago",
    sugerenciaTexto: "Para estadías tan largas, una línea pospago normal casi siempre sale más económica en el tiempo.",
  },
];

const BG = "linear-gradient(160deg,#04040f 0%,#080622 50%,#100830 100%)";
const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter',system-ui,sans-serif", padding: "90px 20px 60px" }}>
    <div style={{ maxWidth: 620, margin: "0 auto" }}>{children}</div>
  </div>
);

const selectStyle = (activo: boolean): React.CSSProperties => ({
  width: "100%",
  background: "#1a1a2e",
  border: `1px solid ${activo ? C.yellow : "rgba(255,255,255,0.1)"}`,
  borderRadius: 10,
  padding: "12px 14px",
  color: activo ? "#fff" : "rgba(255,255,255,0.3)",
  fontSize: 14,
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
  appearance: "none",
});

// ── Barra de progreso ────────────────────────────────────────────
const Steps = ({ step }: { step: number }) => (
  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
    {["🧭 Destino", "🎒 Motivo", "📱 Equipaje", "🏆 Plan"].map((l, i) => {
      const n = i + 1;
      return (
        <div key={l} style={{
          padding: "5px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700,
          background: n === step ? "linear-gradient(135deg,#f59e0b,#f97316)" : n < step ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
          border: n === step ? "none" : `1px solid ${n < step ? C.yellow : C.borderSoft}`,
          color: n === step ? "#fff" : n < step ? C.yellow : "rgba(255,255,255,0.25)",
          boxShadow: n === step ? "0 0 16px rgba(245,158,11,0.3)" : "none",
        }}>{l}</div>
      );
    })}
  </div>
);

// ── NomadaFlow ───────────────────────────────────────────────────
export const NomadaFlow = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<NomadaData>({
    destinoDepartamento: null,
    destinoMunicipio: null,
    duracion: null,
    motivo: null,
    dispositivos: [],
  });

  const municipiosDestino = data.destinoDepartamento ? (DEPARTAMENTOS[data.destinoDepartamento] ?? []) : [];
  const listoParaContinuar = !!data.destinoMunicipio && !!data.duracion;

  // ── Step 1 — Destino y duración ─────────────────────────────────
  if (step === 1) return (
    <Wrap>
      <Steps step={1} />
      <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 8, color: "#fff" }}>
        📱 ¿A dónde viajas?
      </h2>
      <p style={{ textAlign: "center", color: C.muted, fontSize: 13, marginBottom: 24 }}>
        Te ayudamos a llegar bien conectado a tu destino
      </p>

      <Card style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ color: C.yellow, fontWeight: 800, fontSize: 13, marginBottom: 12 }}>
          🧭 Destino del viaje
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <select
            style={selectStyle(!!data.destinoDepartamento)}
            value={data.destinoDepartamento ?? ""}
            onChange={(e) =>
              setData((d) => ({ ...d, destinoDepartamento: e.target.value || null, destinoMunicipio: null }))
            }
          >
            <option value="">Departamento</option>
            {Object.keys(DEPARTAMENTOS).sort().map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>

          <select
            style={{
              ...selectStyle(!!data.destinoMunicipio),
              opacity: data.destinoDepartamento ? 1 : 0.5,
              cursor: data.destinoDepartamento ? "pointer" : "not-allowed",
            }}
            disabled={!data.destinoDepartamento}
            value={data.destinoMunicipio ?? ""}
            onChange={(e) => setData((d) => ({ ...d, destinoMunicipio: e.target.value || null }))}
          >
            <option value="">Municipio / Ciudad</option>
            {municipiosDestino.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card style={{ padding: "18px 20px", marginBottom: 28 }}>
        <div style={{ color: C.yellow, fontWeight: 800, fontSize: 13, marginBottom: 12 }}>
          ⏳ ¿Cuánto tiempo estarás allá?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DURACIONES.map((dur) => {
            const sel = data.duracion?.id === dur.id;
            return (
              <button
                key={dur.id}
                onClick={() => setData((d) => ({ ...d, duracion: dur }))}
                style={{
                  background: sel ? `${C.yellow}12` : "rgba(255,255,255,0.02)",
                  border: `2px solid ${sel ? C.yellow : C.borderSoft}`,
                  borderRadius: 12, padding: "14px 18px",
                  cursor: "pointer", transition: "all .2s",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  textAlign: "left",
                }}
              >
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{dur.label}</div>
                  <div style={{ color: C.muted, fontSize: 12 }}>{dur.desc}</div>
                </div>
                {sel && <Chip color={C.yellow}>✓ Elegido</Chip>}
              </button>
            );
          })}
        </div>

        {data.duracion && (
          <div style={{
            marginTop: 14, padding: "10px 14px", borderRadius: 10,
            background: "rgba(245,158,11,0.08)", border: `1px solid ${C.yellow}33`,
            color: "rgba(255,255,255,0.75)", fontSize: 12.5, lineHeight: 1.5,
          }}>
            💡 {data.duracion.sugerenciaTexto}
          </div>
        )}
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <GlowBtn onClick={onBack} gradient="rgba(255,255,255,0.05)" glow="rgba(255,255,255,0.2)">
          ← Volver
        </GlowBtn>
        <GlowBtn
          onClick={() => setStep(2)}
          disabled={!listoParaContinuar}
          gradient="linear-gradient(135deg,#f59e0b,#f97316)"
          glow={C.yellow}
          style={{ padding: "10px 24px" }}
        >
          Continuar →
        </GlowBtn>
      </div>
    </Wrap>
  );

  // ── Steps 2-4 — pendientes ───────────────────────────────────────
  return (
    <Wrap>
      <Steps step={step} />
      <Card style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
        <h3 style={{ color: "#fff", fontWeight: 800, marginBottom: 8 }}>
          Este nivel está en construcción
        </h3>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>
          Ya sabemos que vas a <b style={{ color: "#fff" }}>{data.destinoMunicipio}</b>, {data.destinoDepartamento}
          {" "}por <b style={{ color: "#fff" }}>{data.duracion?.label}</b>. El resto del mundo Nómada llega pronto.
        </p>
        <GlowBtn onClick={() => setStep(1)} gradient="linear-gradient(135deg,#f59e0b,#f97316)" glow={C.yellow}>
          ← Ajustar destino
        </GlowBtn>
      </Card>
    </Wrap>
  );
};
