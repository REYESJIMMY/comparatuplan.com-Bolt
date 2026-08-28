"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { C } from "@/lib/constants";
import { GlowBtn, WABtn, Card, Chip } from "@/components/ui";
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
  /** Días representativos, usados para estimar el consumo total de datos (tope 30, ya que los planes se cobran por mes) */
  diasEstimado: number;
}

interface NomadaData {
  destinoDepartamento: string | null;
  destinoMunicipio: string | null;
  duracion: Duracion | null;
  motivo: string | null;
  dispositivos: string[];
  necesitaHotspot: boolean;
}

interface Motivo {
  id: string;
  emoji: string;
  label: string;
  desc: string;
}

interface DispositivoViaje {
  id: string;
  emoji: string;
  label: string;
  /** Consumo estimado de datos móviles, en GB por día de viaje */
  gbDia: number;
}

interface PlanNomada {
  id_crc: string;
  operador: string;
  nombre: string;
  precio: number;
  datos_gb: number | null;
  minutos: string | null;
  modalidad: string | null;
  tecnologia: string | null;
  badge: string;
  glow: string;
  top: boolean;
}

const OPERADORES_FASE1 = ["Claro", "Movistar", "Etb", "Tigo"];

const CROSS_SELL = [
  { emoji: "🔋", label: "Power bank / batería externa", desc: "Para no quedarte sin batería lejos de un enchufe" },
  { emoji: "🛡️", label: "Seguro de dispositivo",         desc: "Cubre robo o daño de tu celular/laptop durante el viaje" },
  { emoji: "☁️", label: "Backup automático en la nube",   desc: "Tus fotos y archivos quedan a salvo aunque pierdas el equipo" },
];

// ── Configuración ────────────────────────────────────────────────
const DURACIONES: Duracion[] = [
  {
    id: "corta",
    label: "1 – 3 días",
    desc: "Viaje relámpago",
    sugerenciaModalidad: "prepago",
    sugerenciaTexto: "Para tan pocos días, casi siempre conviene una SIM prepago o el roaming nacional de tu propia línea.",
    diasEstimado: 2,
  },
  {
    id: "media",
    label: "4 – 15 días",
    desc: "Viaje corto",
    sugerenciaModalidad: "prepago",
    sugerenciaTexto: "Una recarga prepago grande suele ser más flexible que abrir una línea nueva para tan poco tiempo.",
    diasEstimado: 9,
  },
  {
    id: "larga",
    label: "2 semanas – 3 meses",
    desc: "Viaje largo / trabajo remoto temporal",
    sugerenciaModalidad: "pospago",
    sugerenciaTexto: "A este plazo ya suele valer la pena una línea pospago o un plan de datos más grande.",
    diasEstimado: 30,
  },
  {
    id: "extendida",
    label: "Más de 3 meses",
    desc: "Estadía prolongada / mudanza temporal",
    sugerenciaModalidad: "pospago",
    sugerenciaTexto: "Para estadías tan largas, una línea pospago normal casi siempre sale más económica en el tiempo.",
    diasEstimado: 30,
  },
];

const DISPOSITIVOS: DispositivoViaje[] = [
  { id: "celular", emoji: "📱", label: "Celular",                gbDia: 0.5 },
  { id: "laptop",  emoji: "💻", label: "Laptop / trabajo",        gbDia: 1.5 },
  { id: "tablet",  emoji: "📲", label: "Tablet",                  gbDia: 0.5 },
  { id: "camara",  emoji: "📷", label: "Cámara / dron (backup)",  gbDia: 0.3 },
];

const MOTIVOS: Motivo[] = [
  { id: "turismo",  emoji: "🏖️", label: "Turismo / Ocio",          desc: "Conocer, pasear, desconectarte del trabajo" },
  { id: "remoto",   emoji: "💻", label: "Trabajo remoto",          desc: "Necesitas conexión estable para trabajar desde allá" },
  { id: "mixto",    emoji: "🧳", label: "Trabajo + turismo",        desc: "Un poco de ambos: bleisure" },
  { id: "mudanza",  emoji: "🏡", label: "Mudanza temporal",         desc: "Te instalas por un tiempo largo en el destino" },
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
    necesitaHotspot: false,
  });

  const municipiosDestino = data.destinoDepartamento ? (DEPARTAMENTOS[data.destinoDepartamento] ?? []) : [];
  const listoParaContinuar = !!data.destinoMunicipio && !!data.duracion;

  const toggleDispositivo = (id: string) => {
    setData((d) => ({
      ...d,
      dispositivos: d.dispositivos.includes(id)
        ? d.dispositivos.filter((x) => x !== id)
        : [...d.dispositivos, id],
    }));
  };

  const gbEstimadoMes = (() => {
    if (!data.duracion) return 0;
    const gbDiaTotal = DISPOSITIVOS
      .filter((disp) => data.dispositivos.includes(disp.id))
      .reduce((sum, disp) => sum + disp.gbDia, 0);
    const factor = data.necesitaHotspot ? 1.4 : 1;
    return Math.round(gbDiaTotal * data.duracion.diasEstimado * factor * 10) / 10;
  })();

  const [planes, setPlanes] = useState<PlanNomada[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);

  useEffect(() => {
    if (step !== 4 || !data.duracion) return;

    const buscarPlanes = async () => {
      setLoadingPlanes(true);

      let query = supabase
        .from("catalogo_unificado")
        .select("id_crc, operador, nombre, precio, datos_gb, minutos, modalidad, tecnologia")
        .eq("tipo", "movil")
        .in("operador", OPERADORES_FASE1)
        .order("precio", { ascending: true })
        .limit(300);

      if (data.duracion!.sugerenciaModalidad === "prepago") query = query.ilike("modalidad", "%PRE%");
      else query = query.ilike("modalidad", "%POS%");

      const { data: rawData, error } = await query;
      if (error) console.error("Error buscando planes Nómada:", error);
      const rawPlanes = rawData ?? [];

      const scored = rawPlanes.map((p: any) => {
        const gb = Number(p.datos_gb);
        let score = 0;
        if (gb === -1) score += 40;
        else if (gb >= gbEstimadoMes) score += 30;
        else if (gb >= gbEstimadoMes * 0.6) score += 15;
        score += Math.max(0, 20 - (Number(p.precio) || 0) / 10000);
        return { ...p, _score: score };
      });

      const validos = scored
        .filter((p: any) => p._score > 0)
        .sort((a: any, b: any) => (b._score !== a._score ? b._score - a._score : (Number(a.precio) || 0) - (Number(b.precio) || 0)));

      const resultado: any[] = [];
      const ops = new Set<string>();
      for (const plan of validos) {
        if (resultado.length >= 3) break;
        const op = (plan.operador ?? "").toLowerCase().trim();
        if (!ops.has(op)) { resultado.push(plan); ops.add(op); }
      }

      const BADGES = ["🏆 Mejor Cobertura", "⚡ Más Datos", "💰 Más Económico"];
      const GLOWS  = ["#f59e0b", "#a855f7", "#10b981"];

      setPlanes(resultado.map((p, i) => ({
        ...p,
        precio: Number(p.precio) || 0,
        badge:  BADGES[i] ?? `#${i + 1}`,
        glow:   GLOWS[i]  ?? "#fff",
        top:    i === 0,
      })));

      setLoadingPlanes(false);
    };

    buscarPlanes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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

  // ── Step 2 — Motivo del viaje ─────────────────────────────────────
  if (step === 2) return (
    <Wrap>
      <Steps step={2} />
      <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 8, color: "#fff" }}>
        🎒 ¿Cuál es el motivo del viaje?
      </h2>
      <p style={{ textAlign: "center", color: C.muted, fontSize: 13, marginBottom: 24 }}>
        Con esto ajustamos qué priorizar: precio, velocidad o estabilidad
      </p>

      <Card style={{ padding: "18px 20px", marginBottom: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOTIVOS.map((m) => {
            const sel = data.motivo === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setData((d) => ({ ...d, motivo: m.id }))}
                style={{
                  background: sel ? `${C.yellow}12` : "rgba(255,255,255,0.02)",
                  border: `2px solid ${sel ? C.yellow : C.borderSoft}`,
                  borderRadius: 12, padding: "14px 18px",
                  cursor: "pointer", transition: "all .2s",
                  display: "flex", alignItems: "center", gap: 14,
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 22 }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{m.label}</div>
                  <div style={{ color: C.muted, fontSize: 12 }}>{m.desc}</div>
                </div>
                {sel && <Chip color={C.yellow}>✓ Elegido</Chip>}
              </button>
            );
          })}
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <GlowBtn onClick={() => setStep(1)} gradient="rgba(255,255,255,0.05)" glow="rgba(255,255,255,0.2)">
          ← Volver
        </GlowBtn>
        <GlowBtn
          onClick={() => setStep(3)}
          disabled={!data.motivo}
          gradient="linear-gradient(135deg,#f59e0b,#f97316)"
          glow={C.yellow}
          style={{ padding: "10px 24px" }}
        >
          Continuar →
        </GlowBtn>
      </div>
    </Wrap>
  );

  // ── Step 3 — Equipaje digital ──────────────────────────────────────
  if (step === 3) return (
    <Wrap>
      <Steps step={3} />
      <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 8, color: "#fff" }}>
        📱 ¿Qué te llevas de viaje?
      </h2>
      <p style={{ textAlign: "center", color: C.muted, fontSize: 13, marginBottom: 24 }}>
        Con esto calculamos cuántos datos vas a necesitar
      </p>

      <Card style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ color: C.yellow, fontWeight: 800, fontSize: 13, marginBottom: 12 }}>
          🎒 Dispositivos que llevas
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {DISPOSITIVOS.map((disp) => {
            const sel = data.dispositivos.includes(disp.id);
            return (
              <button
                key={disp.id}
                onClick={() => toggleDispositivo(disp.id)}
                style={{
                  background: sel ? `${C.yellow}12` : "rgba(255,255,255,0.02)",
                  border: `2px solid ${sel ? C.yellow : C.borderSoft}`,
                  borderRadius: 12, padding: "12px 14px",
                  cursor: "pointer", transition: "all .2s",
                  display: "flex", alignItems: "center", gap: 10,
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 18 }}>{disp.emoji}</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, flex: 1 }}>{disp.label}</div>
                {sel && <span style={{ color: C.yellow, fontWeight: 900 }}>✓</span>}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setData((d) => ({ ...d, necesitaHotspot: !d.necesitaHotspot }))}
          style={{
            marginTop: 12, width: "100%",
            background: data.necesitaHotspot ? `${C.yellow}12` : "rgba(255,255,255,0.02)",
            border: `2px solid ${data.necesitaHotspot ? C.yellow : C.borderSoft}`,
            borderRadius: 12, padding: "12px 14px",
            cursor: "pointer", transition: "all .2s",
            display: "flex", alignItems: "center", gap: 10, textAlign: "left",
          }}
        >
          <div style={{ fontSize: 18 }}>📶</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Necesito hotspot para varios dispositivos</div>
            <div style={{ color: C.muted, fontSize: 11 }}>Vas a compartir los datos de tu celular con otros equipos</div>
          </div>
          {data.necesitaHotspot && <span style={{ color: C.yellow, fontWeight: 900 }}>✓</span>}
        </button>
      </Card>

      {data.dispositivos.length > 0 && (
        <Card style={{ padding: "18px 20px", marginBottom: 28 }}>
          <div style={{ color: C.yellow, fontWeight: 800, fontSize: 13, marginBottom: 10 }}>
            📊 Datos estimados para tu plan
          </div>
          <div style={{
            height: 10, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 10,
          }}>
            <div style={{
              height: "100%", width: `${Math.min(100, (gbEstimadoMes / 30) * 100)}%`,
              background: "linear-gradient(90deg,#f59e0b,#f97316)", borderRadius: 99,
            }} />
          </div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>
            ~{gbEstimadoMes} GB<span style={{ color: C.muted, fontWeight: 600, fontSize: 12.5 }}> / mes</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
            {gbEstimadoMes >= 15
              ? "Con este consumo, un plan de datos ilimitados casi siempre te sale mejor que uno por franjas."
              : "Con este consumo, un plan mediano de datos debería alcanzarte sin problema."}
          </div>
        </Card>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <GlowBtn onClick={() => setStep(2)} gradient="rgba(255,255,255,0.05)" glow="rgba(255,255,255,0.2)">
          ← Volver
        </GlowBtn>
        <GlowBtn
          onClick={() => setStep(4)}
          disabled={data.dispositivos.length === 0}
          gradient="linear-gradient(135deg,#f59e0b,#f97316)"
          glow={C.yellow}
          style={{ padding: "10px 24px" }}
        >
          Ver recomendación →
        </GlowBtn>
      </div>
    </Wrap>
  );

  // ── Step 4 — Recomendación + cross-sell ────────────────────────────
  return (
    <Wrap>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontWeight: 900, fontSize: "clamp(1.2rem,4vw,1.7rem)", color: "#fff", marginBottom: 6 }}>
          🏆 Tu plan para {data.destinoMunicipio}
        </h2>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip color={C.yellow}>{data.duracion?.label}</Chip>
          <Chip color={C.yellow}>{data.duracion?.sugerenciaModalidad === "prepago" ? "Prepago" : "Pospago"}</Chip>
          <Chip color={C.yellow}>~{gbEstimadoMes} GB/mes</Chip>
        </div>
      </div>

      {loadingPlanes && (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧭</div>
          <p>Buscando los mejores planes para tu destino...</p>
        </div>
      )}

      {!loadingPlanes && planes.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
          <p style={{ marginBottom: 16 }}>No encontramos planes con esos criterios.</p>
          <button onClick={() => setStep(3)} style={{ padding: "10px 22px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.yellow, fontWeight: 700, cursor: "pointer" }}>
            ← Ajustar equipaje
          </button>
        </div>
      )}

      {!loadingPlanes && planes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {planes.map((p) => (
            <Card key={p.id_crc} glow={p.glow} style={{ padding: 18, position: "relative", border: p.top ? `2px solid ${p.glow}` : undefined }}>
              {p.top && (
                <div style={{ position: "absolute", top: -1, right: 16, background: p.glow, color: "#000", fontSize: 9, fontWeight: 900, padding: "3px 10px", borderRadius: "0 0 8px 8px" }}>
                  RECOMENDADO
                </div>
              )}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <span style={{ background: `${p.glow}14`, border: `1px solid ${p.glow}33`, color: p.glow, borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 800 }}>{p.badge}</span>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{p.operador}</span>
              </div>

              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#e8eaf6" }}>{p.nombre}</div>
              <div style={{ fontWeight: 900, fontSize: 26, color: p.glow, marginBottom: 10 }}>
                ${p.precio.toLocaleString()}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/mes</span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {p.datos_gb != null && <Chip color={C.neon2}>{p.datos_gb === -1 ? "∞ Datos" : `${p.datos_gb} GB`}</Chip>}
                {p.minutos && p.minutos !== "0" && <Chip color={C.cyan}>{p.minutos === "-1" ? "∞ Min" : `${p.minutos} min`}</Chip>}
                {p.tecnologia && <Chip color={C.green}>{p.tecnologia}</Chip>}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={`/planes/${p.id_crc}`}
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.borderSoft}`, color: C.muted, borderRadius: 10, padding: "9px", fontSize: 12, fontWeight: 600, textAlign: "center", textDecoration: "none" }}
                >
                  Ver detalle
                </a>
                <WABtn name={`${p.operador} - ${p.nombre} (viaje a ${data.destinoMunicipio})`} label="Lo Quiero 🚀" style={{ flex: 1, borderRadius: 10, fontSize: 12 }} />
              </div>
            </Card>
          ))}

          <div style={{
            padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)",
            border: `1px dashed ${C.borderSoft}`, color: C.muted, fontSize: 11.5, lineHeight: 1.5,
          }}>
            💡 Cobertura nacional garantizada con estos operadores. Muy pronto sumamos operadores regionales y
            recomendaciones de otros viajeros que ya estuvieron en {data.destinoMunicipio} para afinar aún más esta elección.
          </div>
        </div>
      )}

      <Card style={{ padding: "18px 20px", marginBottom: 24 }}>
        <div style={{ color: C.yellow, fontWeight: 800, fontSize: 13, marginBottom: 12 }}>
          🎒 También te puede servir para el viaje
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {CROSS_SELL.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 18 }}>{item.emoji}</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{item.label}</div>
                <div style={{ color: C.muted, fontSize: 11.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <WABtn name={`Accesorios para mi viaje a ${data.destinoMunicipio}`} label="Preguntar por estos accesorios" full style={{ borderRadius: 10, fontSize: 12 }} />
      </Card>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => {
            setStep(1);
            setData({ destinoDepartamento: null, destinoMunicipio: null, duracion: null, motivo: null, dispositivos: [], necesitaHotspot: false });
            setPlanes([]);
          }}
          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          🔄 Reiniciar
        </button>
        <button onClick={onBack} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          🏠 Inicio
        </button>
      </div>
    </Wrap>
  );
};
