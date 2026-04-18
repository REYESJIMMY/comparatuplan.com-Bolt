"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { C } from "@/lib/constants";
import { GlowBtn, WABtn, Card, Chip } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

// ── Tipos ────────────────────────────────────────────────────────
type Modalidad  = "prepago" | "pospago";
type DatosGB    = 1 | 3 | 5 | 10 | 20 | 50 | -1;   // -1 = ilimitado
type Presupuesto = { min: number; max: number; label: string };

interface MovilData {
  modalidad:  Modalidad | null;
  habitos:    string[];          // usos seleccionados
  datosGB:    DatosGB | null;
  presupuesto: Presupuesto | null;
}

interface PlanMovil {
  id_crc:     string;
  operador:   string;
  nombre:     string;
  tipo:       string;
  precio:     number;
  datos_gb:   number | null;
  minutos:    string | null;
  modalidad:  string | null;
  tecnologia: string | null;
  badge:      string;
  glow:       string;
  top:        boolean;
}

// ── Configuración ────────────────────────────────────────────────
const OPERADORES_FASE1 = ["Claro", "Movistar", "Etb", "Tigo"];

const HABITOS = [
  { id: "redes",       emoji: "📲", label: "Redes sociales",     desc: "Instagram, TikTok, Facebook",   peso: 2 },
  { id: "streaming",   emoji: "🎬", label: "Videos / Streaming", desc: "YouTube, Netflix, Twitch",       peso: 5 },
  { id: "llamadas",    emoji: "📞", label: "Llamadas",           desc: "Mucho tiempo en llamada",        peso: 1 },
  { id: "whatsapp",    emoji: "💬", label: "WhatsApp",           desc: "Mensajes y llamadas por app",    peso: 1 },
  { id: "trabajo",     emoji: "💼", label: "Trabajo remoto",     desc: "Email, Meet, Teams, Drive",      peso: 3 },
  { id: "juegos",      emoji: "🎮", label: "Gaming móvil",       desc: "Free Fire, PUBG, Clash",         peso: 4 },
  { id: "musica",      emoji: "🎵", label: "Música / Podcast",   desc: "Spotify, Apple Music",           peso: 1 },
  { id: "navegacion",  emoji: "🌐", label: "Navegación GPS",     desc: "Google Maps, Waze",              peso: 1 },
];

const DATOS_OPTIONS: { value: DatosGB; label: string; desc: string }[] = [
  { value: 1,   label: "1 GB",         desc: "Uso muy básico" },
  { value: 3,   label: "3 GB",         desc: "WhatsApp y redes" },
  { value: 5,   label: "5 GB",         desc: "Uso diario moderado" },
  { value: 10,  label: "10 GB",        desc: "Videos y streaming" },
  { value: 20,  label: "20 GB",        desc: "Uso intensivo" },
  { value: 50,  label: "50 GB",        desc: "Heavy user" },
  { value: -1,  label: "Ilimitados",   desc: "Sin restricciones" },
];

const PRESUPUESTOS: Presupuesto[] = [
  { min: 0,      max: 20000,  label: "Hasta $20.000" },
  { min: 20000,  max: 40000,  label: "$20.000 – $40.000" },
  { min: 40000,  max: 70000,  label: "$40.000 – $70.000" },
  { min: 70000,  max: 120000, label: "$70.000 – $120.000" },
  { min: 120000, max: 999999, label: "Más de $120.000" },
];

const NOMBRES_INVALIDOS = [
  "sms", "chat ilimitado", "whatsapp", "minutos internacional",
  "mensajes", "bolsa de minutos", "roaming", "llamadas internacionales",
  "ldi", "internacional",
];

const BG   = "linear-gradient(160deg,#04040f 0%,#080622 50%,#100830 100%)";
const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter',system-ui,sans-serif", padding: "90px 20px 60px" }}>
    <div style={{ maxWidth: 620, margin: "0 auto" }}>{children}</div>
  </div>
);

// ── Barra de progreso ────────────────────────────────────────────
const Steps = ({ step }: { step: number }) => (
  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
    {["📋 Modalidad", "📱 Hábitos", "💾 Datos", "💰 Presupuesto"].map((l, i) => {
      const n = i + 1;
      return (
        <div key={l} style={{
          padding: "5px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700,
          background: n === step ? "linear-gradient(135deg,#6600cc,#a855f7)" : n < step ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.03)",
          border: n === step ? "none" : `1px solid ${n < step ? C.neon2 : C.borderSoft}`,
          color: n === step ? "#fff" : n < step ? C.neon2 : "rgba(255,255,255,0.25)",
          boxShadow: n === step ? "0 0 16px rgba(168,85,247,0.3)" : "none",
        }}>{l}</div>
      );
    })}
  </div>
);

// ── Calcular GB recomendados según hábitos ───────────────────────
function calcularGBRecomendado(habitos: string[]): DatosGB {
  const total = habitos.reduce((acc, h) => {
    const hab = HABITOS.find((x) => x.id === h);
    return acc + (hab?.peso ?? 0);
  }, 0);
  if (total <= 2)  return 3;
  if (total <= 5)  return 5;
  if (total <= 8)  return 10;
  if (total <= 12) return 20;
  if (total <= 16) return 50;
  return -1;
}

// ── MovilFlow ────────────────────────────────────────────────────
export const MovilFlow = ({ onBack }: { onBack: () => void }) => {
  const { toggleFavorito, isFavorito, user } = useAuth();

  const [step,     setStep]     = useState(1);
  const [data,     setData]     = useState<MovilData>({ modalidad: null, habitos: [], datosGB: null, presupuesto: null });
  const [planes,   setPlanes]   = useState<PlanMovil[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [gbRec,    setGbRec]    = useState<DatosGB | null>(null);

  const toggleHabito = (id: string) => {
    setData((d) => ({
      ...d,
      habitos: d.habitos.includes(id)
        ? d.habitos.filter((h) => h !== id)
        : [...d.habitos, id],
    }));
  };

  const irADatos = () => {
    const rec = calcularGBRecomendado(data.habitos);
    setGbRec(rec);
    setData((d) => ({ ...d, datosGB: rec }));
    setStep(3);
  };

  const buscarPlanes = async (presupuesto: Presupuesto) => {
    setLoading(true);
    const gb = data.datosGB;

    // Construir query base
    let query = supabase
      .from("planes_unicos")
      .select("id_crc, operador, nombre, tipo, precio, datos_gb, minutos, modalidad, tecnologia")
      .eq("tipo", "movil")
      .in("operador", OPERADORES_FASE1)
      .order("precio", { ascending: true })
      .limit(300);

    // Filtro por modalidad
    if (data.modalidad === "prepago") {
      query = query.ilike("modalidad", "%PRE%");
    } else if (data.modalidad === "pospago") {
      query = query.ilike("modalidad", "%POS%");
    }

    const { data: rawData } = await query;
    const rawPlanes = rawData ?? [];

    // Scoring
    const scored = rawPlanes.map((p: any) => {
      const precio  = Number(p.precio)  || 0;
      const datos   = Number(p.datos_gb) || 0;
      const nombre  = (p.nombre ?? "").toLowerCase();

      if (precio > 0 && precio < 5000)                              return { ...p, _score: -100 };
      if (NOMBRES_INVALIDOS.some((x) => nombre.includes(x)))        return { ...p, _score: -100 };
      if (precio > presupuesto.max && presupuesto.max < 999999)     return { ...p, _score: -50 };

      let score = 0;

      // Precio vs presupuesto
      if (precio <= presupuesto.max) {
        if (precio >= presupuesto.min) score += 40;   // dentro del rango exacto
        else                          score += 20;   // debajo del rango
      } else {
        score -= 20;
      }

      // GB vs lo que necesita
      if (gb !== null) {
        if (gb === -1) {
          if (datos === -1) score += 35;
          else if (datos >= 50) score += 20;
          else if (datos >= 20) score += 10;
        } else {
          if (datos === -1)        score += 30;
          else if (datos >= gb * 1.5) score += 25;
          else if (datos >= gb)    score += 20;
          else if (datos >= gb * 0.7) score += 10;
          else                     score -= 10;
        }
      }

      // Hábitos específicos
      if (data.habitos.includes("streaming") && datos >= 10) score += 10;
      if (data.habitos.includes("juegos"))                   score += 5;
      if (data.habitos.includes("llamadas") && p.minutos)    score += 8;
      if (data.habitos.includes("trabajo") && datos >= 5)    score += 8;

      return { ...p, _score: Math.round(score) };
    });

    const validos = scored
      .filter((p: any) => p._score > 0)
      .sort((a: any, b: any) =>
        b._score !== a._score ? b._score - a._score : (Number(a.precio) || 0) - (Number(b.precio) || 0)
      );

    // Un plan por operador
    const resultado: any[] = [];
    const ops = new Set<string>();
    for (const plan of validos) {
      if (resultado.length >= 3) break;
      const op = (plan.operador ?? "").toLowerCase().trim();
      if (!ops.has(op)) { resultado.push(plan); ops.add(op); }
    }

    const BADGES = ["🏆 Mejor Oferta", "⚡ Más Datos", "💰 Mejor Precio"];
    const GLOWS  = ["#f59e0b", "#a855f7", "#10b981"];

    const finales: PlanMovil[] = resultado.map((p, i) => ({
      ...p,
      precio: Number(p.precio) || 0,
      badge:  BADGES[i] ?? `#${i + 1}`,
      glow:   GLOWS[i]  ?? "#fff",
      top:    i === 0,
    }));

    setPlanes(finales);

    // Guardar en Supabase para métricas
    await supabase.from("consultas_cobertura").insert({
      segmento:        "movil",
      modalidad_movil: data.modalidad,
      datos_gb_req:    gb === -1 ? 999 : gb,
      presupuesto_min: presupuesto.min,
      presupuesto_max: presupuesto.max,
      planes_mostrados: finales.map((p) => p.id_crc),
      user_id:         user?.id ?? null,
      fuente:          "hero",
    });

    setLoading(false);
    setStep(5);
  };

  // ── Step 1 — Modalidad ─────────────────────────────────────────
  if (step === 1) return (
    <Wrap>
      <Steps step={1} />
      <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.3rem,4vw,1.8rem)", marginBottom: 8, background: "linear-gradient(90deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        ¿Qué tipo de plan buscas?
      </h2>
      <p style={{ textAlign: "center", color: C.muted, fontSize: 13, marginBottom: 28 }}>
        Esto define si el plan tiene fecha de vencimiento o es mensual
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {([
          {
            id: "prepago" as Modalidad,
            emoji: "🎯",
            title: "Prepago",
            desc: "Paga solo lo que usas. Sin compromisos ni facturas mensuales.",
            bullets: ["Sin permanencia", "Recargas cuando quieras", "Ideal para uso variable"],
            color: C.neon,
          },
          {
            id: "pospago" as Modalidad,
            emoji: "💳",
            title: "Pospago",
            desc: "Plan mensual fijo con más beneficios y datos garantizados.",
            bullets: ["Factura mensual fija", "Más GB por el mismo precio", "Roaming y beneficios extra"],
            color: C.neon2,
          },
        ] as const).map((opt) => {
          const sel = data.modalidad === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setData((d) => ({ ...d, modalidad: opt.id }))}
              style={{
                background: sel ? `${opt.color}12` : "rgba(255,255,255,0.02)",
                border: `2px solid ${sel ? opt.color : C.borderSoft}`,
                borderRadius: 16, padding: "24px 18px",
                cursor: "pointer", transition: "all .2s",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>{opt.emoji}</div>
              <div style={{ color: opt.color, fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{opt.title}</div>
              <div style={{ color: C.muted, fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>{opt.desc}</div>
              {opt.bullets.map((b) => (
                <div key={b} style={{ color: sel ? "#fff" : C.muted, fontSize: 11, display: "flex", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: opt.color }}>✓</span> {b}
                </div>
              ))}
              {sel && <div style={{ marginTop: 10, color: opt.color, fontSize: 10, fontWeight: 800 }}>✓ Seleccionado</div>}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          ← Volver
        </button>
        <GlowBtn
          onClick={() => data.modalidad && setStep(2)}
          disabled={!data.modalidad}
          gradient="linear-gradient(135deg,#6600cc,#a855f7)"
          glow={C.neon2}
          style={{ marginLeft: "auto", borderRadius: 10, padding: "10px 24px" }}
        >
          Siguiente →
        </GlowBtn>
      </div>
    </Wrap>
  );

  // ── Step 2 — Hábitos ───────────────────────────────────────────
  if (step === 2) return (
    <Wrap>
      <Steps step={2} />
      <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 8, color: "#fff" }}>
        ¿Cómo usas tu celular?
      </h2>
      <p style={{ textAlign: "center", color: C.muted, fontSize: 13, marginBottom: 6 }}>
        Selecciona todos los que apliquen — calculamos los GB que necesitas
      </p>
      {data.habitos.length > 0 && (
        <p style={{ textAlign: "center", color: C.neon2, fontSize: 12, fontWeight: 700, marginBottom: 18 }}>
          {data.habitos.length} uso{data.habitos.length > 1 ? "s" : ""} seleccionado{data.habitos.length > 1 ? "s" : ""}
          {" "}→ ~{(() => {
            const rec = calcularGBRecomendado(data.habitos);
            return rec === -1 ? "ilimitados" : `${rec} GB`;
          })()} recomendados
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {HABITOS.map((h) => {
          const sel = data.habitos.includes(h.id);
          return (
            <button
              key={h.id}
              onClick={() => toggleHabito(h.id)}
              style={{
                background: sel ? `${C.neon2}10` : "rgba(255,255,255,0.02)",
                border: `2px solid ${sel ? C.neon2 : C.borderSoft}`,
                borderRadius: 12, padding: "14px 12px",
                cursor: "pointer", transition: "all .2s",
                display: "flex", alignItems: "center", gap: 10,
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{h.emoji}</span>
              <div>
                <div style={{ color: sel ? "#fff" : "#ccc", fontWeight: 700, fontSize: 12 }}>{h.label}</div>
                <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>{h.desc}</div>
              </div>
              {sel && <span style={{ marginLeft: "auto", color: C.neon2, fontSize: 16, flexShrink: 0 }}>✓</span>}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setStep(1)} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          ← Volver
        </button>
        <GlowBtn
          onClick={irADatos}
          disabled={data.habitos.length === 0}
          gradient="linear-gradient(135deg,#6600cc,#a855f7)"
          glow={C.neon2}
          style={{ marginLeft: "auto", borderRadius: 10, padding: "10px 24px" }}
        >
          Ver datos recomendados →
        </GlowBtn>
      </div>
    </Wrap>
  );

  // ── Step 3 — Datos GB ──────────────────────────────────────────
  if (step === 3) return (
    <Wrap>
      <Steps step={3} />
      <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 8, color: "#fff" }}>
        ¿Cuántos datos necesitas?
      </h2>
      {gbRec && (
        <div style={{ textAlign: "center", background: `${C.neon2}10`, border: `1px solid ${C.neon2}33`, borderRadius: 10, padding: "10px 16px", marginBottom: 20 }}>
          <span style={{ color: C.neon2, fontWeight: 700, fontSize: 13 }}>
            🤖 Según tus hábitos te recomendamos:{" "}
            <strong>{gbRec === -1 ? "Datos Ilimitados" : `${gbRec} GB`}</strong>
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
        {DATOS_OPTIONS.map((opt) => {
          const sel   = data.datosGB === opt.value;
          const isRec = gbRec === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setData((d) => ({ ...d, datosGB: opt.value }))}
              style={{
                background: sel ? `${C.neon2}14` : "rgba(255,255,255,0.02)",
                border: `2px solid ${sel ? C.neon2 : isRec ? `${C.neon2}55` : C.borderSoft}`,
                borderRadius: 12, padding: "16px 12px",
                cursor: "pointer", transition: "all .2s",
                textAlign: "center", position: "relative",
              }}
            >
              {isRec && (
                <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", background: C.neon2, color: "#000", fontSize: 8, fontWeight: 900, padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>
                  RECOMENDADO
                </div>
              )}
              <div style={{ color: sel ? C.neon2 : "#fff", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
                {opt.label}
              </div>
              <div style={{ color: C.muted, fontSize: 10 }}>{opt.desc}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setStep(2)} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          ← Volver
        </button>
        <GlowBtn
          onClick={() => data.datosGB !== null && setStep(4)}
          disabled={data.datosGB === null}
          gradient="linear-gradient(135deg,#6600cc,#a855f7)"
          glow={C.neon2}
          style={{ marginLeft: "auto", borderRadius: 10, padding: "10px 24px" }}
        >
          Definir presupuesto →
        </GlowBtn>
      </div>
    </Wrap>
  );

  // ── Step 4 — Presupuesto ───────────────────────────────────────
  if (step === 4) return (
    <Wrap>
      <Steps step={4} />
      <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 8, color: "#fff" }}>
        ¿Cuánto quieres pagar al mes?
      </h2>
      <p style={{ textAlign: "center", color: C.muted, fontSize: 13, marginBottom: 24 }}>
        {data.modalidad === "prepago" ? "Equivalente mensual de tus recargas" : "Factura mensual fija"}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {PRESUPUESTOS.map((p) => {
          const sel = data.presupuesto?.label === p.label;
          return (
            <button
              key={p.label}
              onClick={() => setData((d) => ({ ...d, presupuesto: p }))}
              style={{
                background: sel ? `${C.neon2}12` : "rgba(255,255,255,0.02)",
                border: `2px solid ${sel ? C.neon2 : C.borderSoft}`,
                borderRadius: 12, padding: "14px 18px",
                cursor: "pointer", transition: "all .2s",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span style={{ color: sel ? "#fff" : "#ccc", fontWeight: 700, fontSize: 14 }}>{p.label}</span>
              {sel && <span style={{ color: C.neon2, fontWeight: 800 }}>✓</span>}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setStep(3)} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          ← Volver
        </button>
        <GlowBtn
          onClick={() => data.presupuesto && buscarPlanes(data.presupuesto)}
          disabled={!data.presupuesto || loading}
          gradient="linear-gradient(135deg,#6600cc,#a855f7)"
          glow={C.neon2}
          style={{ marginLeft: "auto", borderRadius: 10, padding: "10px 24px" }}
        >
          {loading ? "⏳ Buscando..." : "🔍 Ver planes →"}
        </GlowBtn>
      </div>
    </Wrap>
  );

  // ── Step 5 — Resultados ────────────────────────────────────────
  return (
    <Wrap>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontWeight: 900, fontSize: "clamp(1.2rem,4vw,1.7rem)", color: "#fff", marginBottom: 6 }}>
          📱 Planes recomendados para ti
        </h2>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip color={C.neon2}>{data.modalidad === "prepago" ? "Prepago" : "Pospago"}</Chip>
          <Chip color={C.cyan}>{data.datosGB === -1 ? "Ilimitados" : `${data.datosGB} GB`}</Chip>
          <Chip color={C.yellow}>{data.presupuesto?.label}</Chip>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
          <p>Buscando los mejores planes móviles...</p>
        </div>
      )}

      {!loading && planes.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
          <p style={{ marginBottom: 16 }}>No encontramos planes con esos criterios.</p>
          <button onClick={() => setStep(4)} style={{ padding: "10px 22px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.neon2, fontWeight: 700, cursor: "pointer" }}>
            ← Ajustar presupuesto
          </button>
        </div>
      )}

      {!loading && planes.length > 0 && (
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
                <span style={{ color: C.muted, fontSize: 10, marginLeft: "auto" }}>{p.modalidad}</span>
                <button
                  onClick={() => toggleFavorito({ id_crc: p.id_crc, operador: p.operador, nombre: p.nombre, precio: p.precio, tipo: p.tipo })}
                  title={user ? (isFavorito(p.id_crc) ? "Quitar favorito" : "Guardar") : "Inicia sesión para guardar"}
                  style={{ background: isFavorito(p.id_crc) ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isFavorito(p.id_crc) ? "rgba(236,72,153,0.4)" : C.borderSoft}`, borderRadius: 8, padding: "5px 7px", cursor: "pointer" }}
                >
                  <Heart size={13} fill={isFavorito(p.id_crc) ? "#ec4899" : "none"} color={isFavorito(p.id_crc) ? "#ec4899" : C.muted} />
                </button>
              </div>

              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#e8eaf6" }}>{p.nombre}</div>
              <div style={{ fontWeight: 900, fontSize: 26, color: p.glow, marginBottom: 10 }}>
                ${p.precio.toLocaleString()}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/mes</span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {p.datos_gb && <Chip color={C.neon2}>{p.datos_gb === -1 ? "∞ Datos" : `${p.datos_gb} GB`}</Chip>}
                {p.minutos && p.minutos !== "0" && <Chip color={C.cyan}>{p.minutos === "-1" ? "∞ Min" : `${p.minutos} min`}</Chip>}
                {p.modalidad && <Chip color={C.muted}>{p.modalidad}</Chip>}
                {p.tecnologia && <Chip color={C.green}>{p.tecnologia}</Chip>}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={`/planes/${p.id_crc}`}
                  onClick={async () => {
                    // Registrar plan elegido
                    await supabase.from("consultas_cobertura")
                      .update({ plan_elegido: p.id_crc })
                      .eq("user_id", user?.id ?? "00000000-0000-0000-0000-000000000000")
                      .order("created_at", { ascending: false })
                      .limit(1);
                  }}
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.borderSoft}`, color: C.muted, borderRadius: 10, padding: "9px", fontSize: 12, fontWeight: 600, textAlign: "center", textDecoration: "none" }}
                >
                  Ver detalle
                </a>
                <WABtn name={`${p.operador} - ${p.nombre}`} label="Lo Quiero 🚀" style={{ flex: 1, borderRadius: 10, fontSize: 12 }} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => { setStep(1); setData({ modalidad: null, habitos: [], datosGB: null, presupuesto: null }); setPlanes([]); }}
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
