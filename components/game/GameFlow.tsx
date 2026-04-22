"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  C, DEVICES, NIVEL_LABELS, PERSONAS_CONFIG,
  type DeviceAdded, type NivelUso, type PersonasHogar,
} from "@/lib/constants";
import { GlowBtn, WABtn, Card, Chip } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  calcularConsumo, scorarPlanes, recomendarEcosistema,
  generarExplicacion, type ResumenConsumo, type PlanScorado,
} from "@/lib/smartComparator";

/* ── House SVG ───────────────────────────────────────────────── */
const HouseSVG = ({
  floor2, devices, flash,
}: { floor2: boolean; devices: DeviceAdded[]; flash: boolean }) => {
  const mx = 200, my = floor2 ? 195 : 148;
  return (
    <svg viewBox="0 0 400 320" style={{ width: "100%", maxWidth: 400, display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="hGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={flash ? "#10b981" : "#00d4ff"} stopOpacity={flash ? 1 : 0.8} />
          <stop offset="100%" stopColor={flash ? "#10b981" : "#00d4ff"} stopOpacity={0} />
        </radialGradient>
        <filter id="gf">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="200" cy="306" rx="165" ry="9" fill="rgba(0,212,255,0.12)" />
      <rect x="58" y={floor2 ? 190 : 145} width="284" height="123" rx="4" fill="rgba(6,4,20,0.92)" stroke="#00d4ff" strokeWidth="1.5" strokeOpacity=".35" />
      <polygon points={`38,${floor2 ? 192 : 147} 200,${floor2 ? 100 : 60} 362,${floor2 ? 192 : 147}`} fill="rgba(0,212,255,0.1)" stroke="#00d4ff" strokeWidth="1.8" strokeOpacity=".5" />
      {floor2 && (
        <>
          <rect x="78" y="110" width="244" height="82" rx="4" fill="rgba(6,4,20,0.88)" stroke="#a855f7" strokeWidth="1.5" strokeOpacity=".35" />
          <polygon points="58,112 200,38 342,112" fill="rgba(168,85,247,0.1)" stroke="#a855f7" strokeWidth="1.8" strokeOpacity=".5" />
          <line x1="58" y1="192" x2="342" y2="192" stroke="#00d4ff" strokeWidth=".8" strokeDasharray="5,4" strokeOpacity=".4" />
        </>
      )}
      <rect x="174" y={floor2 ? 248 : 200} width="52" height="65" rx="4" fill="rgba(0,212,255,0.07)" stroke="#00d4ff" strokeWidth="1" strokeOpacity=".4" />
      <circle cx="186" cy={floor2 ? 280 : 232} r="2.5" fill="#00d4ff" opacity=".6" />
      {devices.length > 0 && <circle cx={mx} cy={my} r="20" fill="url(#hGlow)" opacity={flash ? 1 : 0.45} />}
      <circle cx={mx} cy={my} r="13" fill="rgba(6,4,20,0.96)" stroke={flash ? "#10b981" : "#00d4ff"} strokeWidth="2" filter="url(#gf)" />
      <text x={mx} y={my + 5} textAnchor="middle" fontSize="12">📡</text>
      {devices.map((d, i) => {
        const ang = (i / Math.max(devices.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const dx = mx + Math.cos(ang) * 68, dy = my + Math.sin(ang) * 68;
        return (
          <g key={d.uid}>
            <line x1={mx} y1={my} x2={dx} y2={dy} stroke={d.color} strokeWidth="1.5" strokeOpacity=".65" strokeDasharray="4,3">
              <animate attributeName="stroke-dashoffset" from="0" to="14" dur="1.2s" repeatCount="indefinite" />
            </line>
            <circle cx={dx} cy={dy} r="12" fill="rgba(6,4,20,0.94)" stroke={d.color} strokeWidth="1.8" filter="url(#gf)" />
            <text x={dx} y={dy + 4.5} textAnchor="middle" fontSize="10">{d.emoji}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ── Avatars ─────────────────────────────────────────────────── */
const AVATARS = [
  { id: "gamer",       name: "Gamer",         emoji: "🎮", color: C.cyan,   desc: "Latencia ultra-baja",    factorVelocidad: 1.5, precioMax: 200000 },
  { id: "familia",     name: "Familia",        emoji: "👨‍👩‍👧‍👦", color: C.neon2,  desc: "Múltiples dispositivos", factorVelocidad: 1.2, precioMax: 300000 },
  { id: "teletrabajo", name: "Teletrabajador", emoji: "💼", color: C.green,  desc: "Estabilidad máxima",     factorVelocidad: 1.3, precioMax: 250000 },
  { id: "nomada",      name: "Nómada Digital", emoji: "📱", color: C.yellow, desc: "Datos sin límite",       factorVelocidad: 1.0, precioMax: 150000 },
] as const;

/* ── Level bar ───────────────────────────────────────────────── */
const LvlBar = ({ lvl }: { lvl: number }) => (
  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
    {(["🎯 Perfil", "🏠 Casa", "📊 Consumo", "🏆 Plan"] as const).map((l, i) => {
      const n = i + 1;
      return (
        <div key={l} style={{
          padding: "5px 14px", borderRadius: 99,
          background: n === lvl ? "linear-gradient(135deg,#0070cc,#0050aa)" : n < lvl ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.03)",
          border: n === lvl ? "none" : `1px solid ${n < lvl ? C.border : C.borderSoft}`,
          color: n === lvl ? "#fff" : n < lvl ? C.neon : "rgba(255,255,255,0.25)",
          fontWeight: 700, fontSize: 11,
          boxShadow: n === lvl ? "0 0 16px rgba(0,212,255,0.25)" : "none",
        }}>{l}</div>
      );
    })}
  </div>
);

const BG   = "linear-gradient(160deg,#04040f 0%,#080622 50%,#100830 100%)";
const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter',system-ui,sans-serif", padding: "90px 20px 60px" }}>
    <div style={{ maxWidth: 680, margin: "0 auto" }}>{children}</div>
  </div>
);

/* ── Modal selector de nivel de uso ─────────────────────────── */
const NivelModal = ({
  device, onSelect, onCancel,
}: {
  device: typeof DEVICES[number];
  onSelect: (nivel: NivelUso) => void;
  onCancel: () => void;
}) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
    <div style={{ background: "#0d0d1a", border: `1px solid ${C.border}`, borderRadius: 16, padding: "1.5rem", maxWidth: 360, width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: 40, marginBottom: 6 }}>{device.emoji}</div>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>{device.name}</div>
        <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>¿Cómo lo usas principalmente?</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(["bajo", "medio", "alto"] as NivelUso[]).map((nivel) => {
          const cfg = NIVEL_LABELS[nivel];
          return (
            <button
              key={nivel}
              onClick={() => onSelect(nivel)}
              style={{
                background: cfg.bg, border: `1.5px solid ${cfg.color}44`,
                borderRadius: 12, padding: "12px 16px", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "all .2s",
              }}
              onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = cfg.color; }}
              onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = `${cfg.color}44`; }}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ color: cfg.color, fontWeight: 700, fontSize: 13 }}>{cfg.label}</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{device.usoDesc[nivel]}</div>
              </div>
              <div style={{ color: cfg.color, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                +{device.mbps[nivel]} Mbps
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={onCancel}
        style={{ width: "100%", marginTop: 10, padding: "9px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}
      >
        Cancelar
      </button>
    </div>
  </div>
);

/* ── GameFlow ────────────────────────────────────────────────── */
export const GameFlow = ({ onBack }: { onBack: () => void }) => {
  const { guardarAnalisis, toggleFavorito, isFavorito, user } = useAuth();

  const [lvl,        setLvl]        = useState(0);
  const [avatar,     setAvatar]     = useState<typeof AVATARS[number] | null>(null);
  const [personas,   setPersonas]   = useState<PersonasHogar | null>(null);
  const [devices,    setDevices]    = useState<DeviceAdded[]>([]);
  const [floor2,     setFloor2]     = useState(false);
  const [flash,      setFlash]      = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [resumen,    setResumen]    = useState<ResumenConsumo | null>(null);
  const [planesDB,   setPlanesDB]   = useState<PlanScorado[]>([]);
  const [ecosistema, setEcosistema] = useState<any[]>([]);

  // Estado del modal de nivel de uso
  const [nivelModal,  setNivelModal]  = useState<typeof DEVICES[number] | null>(null);

  // Mbps totales en tiempo real
  const mbpsTotal = devices.reduce((acc, d) => acc + d.mbps, 0);
  const mbpsRec   = avatar ? Math.ceil(mbpsTotal * (personas ? PERSONAS_CONFIG[personas].factor : 1) * avatar.factorVelocidad * 1.2) : mbpsTotal;

  // Agregar dispositivo — abre modal de nivel
  const handleClickDevice = (devDef: typeof DEVICES[number]) => {
    setNivelModal(devDef);
  };

  const handleSelectNivel = (nivel: NivelUso) => {
    if (!nivelModal) return;
    const uid = `${nivelModal.id}-${Math.random().toString(36).slice(2)}`;
    const newDev: DeviceAdded = {
      uid,
      id:    nivelModal.id,
      nivel,
      mbps:  nivelModal.mbps[nivel],
      name:  nivelModal.name,
      emoji: nivelModal.emoji,
      color: nivelModal.color,
    };
    const nd = [...devices, newDev];
    setDevices(nd);
    if (nd.length >= 4) { setFlash(true); setTimeout(() => setFlash(false), 1600); }
    setNivelModal(null);
  };

  const remDev = (uid: string) => {
    setDevices((prev) => prev.filter((d) => d.uid !== uid));
  };

  // Calcular y buscar planes
  const calcularYBuscar = async () => {
    if (!avatar || !personas || devices.length === 0) return;
    setLoading(true);

    const res = calcularConsumo(devices, personas, avatar, DEVICES);
    setResumen(res);
    setEcosistema(recomendarEcosistema(res));

    try {
      const { data: rawData } = await supabase
        .from("planes_unicos")
        .select("id_crc, operador, nombre, tipo, precio, velocidad_mbps, datos_gb, canales_tv, minutos, modalidad, tecnologia")
        .in("tipo", res.tiposRelevantes)
        .in("operador", ["Claro", "Movistar", "Etb", "Tigo"])
        .order("precio", { ascending: true })
        .limit(500);

      const planes = scorarPlanes(rawData ?? [], res, 3);
      setPlanesDB(planes);

      await guardarAnalisis({
        avatar_tipo:   avatar.id,
        dispositivos:  devices,
        mbps_base:     res.mbpsBase,
        mbps_rec:      res.mbpsRecomendado,
        tipo_plan_rec: res.tiposRelevantes[0],
        planes_vistos: planes.map((p) => p.id_crc).filter(Boolean),
      });
    } catch (e) {
      console.error("Error consultando Supabase:", e);
    } finally {
      setLoading(false);
      setLvl(3); // ir a desglose
    }
  };

  /* ── Level 0 — Intro ────────────────────────────────────────── */
  if (lvl === 0) return (
    <Wrap>
      <div style={{ textAlign: "center", padding: "30px 0" }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🏠</div>
        <Chip color={C.neon}>ANÁLISIS INTELIGENTE · 4 PASOS</Chip>
        <h1 style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", fontWeight: 900, margin: "14px 0 10px", background: "linear-gradient(90deg,#00d4ff,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Diseñar mi Hogar Digital
        </h1>
        <p style={{ color: C.muted, marginBottom: 32, fontSize: 14 }}>
          Conecta tus dispositivos, indica cómo los usas y nuestro motor calculará exactamente cuántos Mbps necesitas
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 36 }}>
          {[
            ["🎯", "Perfil",   "Tu avatar digital"],
            ["🏠", "Casa",     "Dispositivos + uso"],
            ["📊", "Consumo",  "Mbps reales"],
            ["🤖", "Plan IA",  "Recomendación"],
          ].map(([ic, n, d]) => (
            <div key={n} style={{ background: "rgba(0,212,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: 24, marginBottom: 5 }}>{ic}</div>
              <div style={{ color: C.neon, fontWeight: 700, fontSize: 12 }}>{n}</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <GlowBtn onClick={() => setLvl(1)} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{ padding: "13px 36px", fontSize: 15, borderRadius: 12 }}>▶ INICIAR ANÁLISIS</GlowBtn>
          <button onClick={onBack} style={{ padding: "13px 24px", borderRadius: 12, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Volver</button>
        </div>
      </div>
    </Wrap>
  );

  /* ── Level 1 — Avatar + Personas ────────────────────────────── */
  if (lvl === 1) return (
    <Wrap>
      <LvlBar lvl={1} />
      <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 8, background: "linear-gradient(90deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        ¿Cuál es tu perfil digital?
      </h2>
      <p style={{ textAlign: "center", color: C.muted, fontSize: 12, marginBottom: 18 }}>Esto afina el análisis de velocidad y precio recomendado</p>

      {/* Avatars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 24 }}>
        {AVATARS.map((av) => {
          const sel = avatar?.id === av.id;
          return (
            <div key={av.id} onClick={() => setAvatar(av)} style={{
              cursor: "pointer", textAlign: "center", padding: "20px 10px",
              background: sel ? `${av.color}12` : "rgba(255,255,255,0.02)",
              border: `2px solid ${sel ? av.color : C.borderSoft}`,
              borderRadius: 14, transition: "all .2s",
            }}>
              <div style={{ fontSize: 36, marginBottom: 7 }}>{av.emoji}</div>
              <div style={{ color: av.color, fontWeight: 800, fontSize: 13, marginBottom: 3 }}>{av.name}</div>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{av.desc}</div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 9 }}>Presupuesto: ${av.precioMax.toLocaleString()}/mes</div>
              {sel && <div style={{ marginTop: 7, color: av.color, fontSize: 10, fontWeight: 800 }}>✓ Seleccionado</div>}
            </div>
          );
        })}
      </div>

      {/* Personas en el hogar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: C.muted, fontSize: 12, fontWeight: 700, marginBottom: 10, textAlign: "center" }}>
          ¿Cuántas personas usan internet simultáneamente?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {(Object.entries(PERSONAS_CONFIG) as [PersonasHogar, typeof PERSONAS_CONFIG[PersonasHogar]][]).map(([key, cfg]) => {
            const sel = personas === key;
            return (
              <div key={key} onClick={() => setPersonas(key)} style={{
                cursor: "pointer", textAlign: "center", padding: "14px 8px",
                background: sel ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.02)",
                border: `2px solid ${sel ? C.neon : C.borderSoft}`,
                borderRadius: 12, transition: "all .2s",
              }}>
                <div style={{ fontSize: 28, marginBottom: 5 }}>{cfg.emoji}</div>
                <div style={{ color: sel ? C.neon : "#fff", fontWeight: 700, fontSize: 12 }}>{cfg.label}</div>
                <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>{cfg.desc}</div>
                {sel && <div style={{ marginTop: 5, color: C.neon, fontSize: 9, fontWeight: 800 }}>✓</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ padding: "9px 18px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "rgba(255,255,255,0.03)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>← Volver</button>
        <GlowBtn
          onClick={() => avatar && personas && setLvl(2)}
          disabled={!avatar || !personas}
          gradient="linear-gradient(135deg,#0070cc,#0050aa)"
          glow={C.neon}
          style={{ marginLeft: "auto", borderRadius: 10, padding: "9px 22px" }}
        >
          Siguiente → Diseñar Casa
        </GlowBtn>
      </div>
    </Wrap>
  );

  /* ── Level 2 — Devices ───────────────────────────────────────── */
  if (lvl === 2) return (
    <div style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Modal de nivel de uso */}
      {nivelModal && (
        <NivelModal
          device={nivelModal}
          onSelect={handleSelectNivel}
          onCancel={() => setNivelModal(null)}
        />
      )}

      <div className="gameflow-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>

        {/* Left: house preview */}
        <div style={{ padding: "90px 16px 24px", display: "flex", flexDirection: "column", borderRight: `1px solid ${C.borderSoft}` }}>
          <LvlBar lvl={2} />
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
            {([["🏠 1 Planta", false], ["🏢 2 Plantas", true]] as const).map(([l, v]) => (
              <button key={String(l)} onClick={() => setFloor2(v)} style={{
                padding: "6px 14px", borderRadius: 99,
                border: `2px solid ${floor2 === v ? C.neon : C.borderSoft}`,
                background: floor2 === v ? `${C.neon}14` : "transparent",
                color: floor2 === v ? C.neon : C.muted,
                fontWeight: 700, fontSize: 11.5, cursor: "pointer",
              }}>{l}</button>
            ))}
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HouseSVG floor2={floor2} devices={devices} flash={flash} />
          </div>

          {/* Barra de consumo en tiempo real */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borderSoft}`, borderRadius: 11, padding: "10px 13px", marginTop: 10 }}>
            <div style={{ color: C.muted, fontSize: 9, fontWeight: 800, letterSpacing: 1, marginBottom: 5, textAlign: "center" }}>⚡ CONSUMO ESTIMADO EN TIEMPO REAL</div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 6 }}>
              <div style={{
                height: "100%", borderRadius: 99,
                width: `${Math.min((mbpsTotal / 300) * 100, 100)}%`,
                background: `linear-gradient(90deg,${mbpsTotal < 50 ? "#10b981" : mbpsTotal < 150 ? "#f59e0b" : "#ef4444"},#00d4ff)`,
                transition: "width .4s",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <div>
                <span style={{ color: C.muted }}>Suma base: </span>
                <span style={{ color: C.neon, fontWeight: 800 }}>{mbpsTotal} Mbps</span>
              </div>
              <div>
                <span style={{ color: C.muted }}>Recomendado: </span>
                <span style={{ color: C.yellow, fontWeight: 800 }}>{mbpsRec} Mbps</span>
              </div>
            </div>
          </div>

          {/* Chips de dispositivos agregados */}
          {devices.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
              {devices.map((d) => {
                const nivelCfg = NIVEL_LABELS[d.nivel];
                return (
                  <div key={d.uid} onClick={() => remDev(d.uid)} title="Clic para quitar" style={{
                    cursor: "pointer", background: `${d.color}14`,
                    border: `1px solid ${d.color}33`, borderRadius: 7,
                    padding: "3px 8px", display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <span style={{ fontSize: 11 }}>{d.emoji}</span>
                    <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>{d.name}</span>
                    <span style={{ color: nivelCfg.color, fontSize: 9 }}>{nivelCfg.label}</span>
                    <span style={{ color: C.neon, fontSize: 9, fontWeight: 700 }}>{d.mbps}M</span>
                    <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 900 }}>×</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: device picker */}
        <div style={{ padding: "90px 16px 24px", overflowY: "auto" }}>
          <h3 style={{ fontWeight: 900, fontSize: 14, marginBottom: 4, textAlign: "center", color: "#fff" }}>Agregar Dispositivos</h3>
          <p style={{ color: C.muted, fontSize: 11, textAlign: "center", marginBottom: 14 }}>
            Al agregar cada dispositivo te preguntaremos cómo lo usas — eso define el consumo real
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 18 }}>
            {DEVICES.map((d) => {
              const cnt = devices.filter((x) => x.id === d.id).length;
              return (
                <div
                  key={d.id}
                  onClick={() => handleClickDevice(d)}
                  style={{
                    cursor: "pointer", textAlign: "center", padding: "13px 8px",
                    background: cnt > 0 ? `${d.color}0e` : "rgba(255,255,255,0.02)",
                    border: `2px solid ${cnt > 0 ? d.color : C.borderSoft}`,
                    borderRadius: 11, position: "relative", transition: "all .2s",
                  }}
                >
                  {cnt > 0 && (
                    <div style={{ position: "absolute", top: 6, right: 6, background: d.color, color: "#000", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900 }}>{cnt}</div>
                  )}
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{d.emoji}</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{d.name}</div>
                  <div style={{ color: d.color, fontSize: 10, fontWeight: 700 }}>
                    {d.mbps.bajo}–{d.mbps.alto} Mbps
                  </div>
                  <div style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>{d.id === "tv" ? "Streaming" : d.id === "console" ? "Gaming" : d.id === "laptop" ? "Trabajo" : d.id === "phone" ? "Conectividad" : d.id === "pc" ? "Alto rendimiento" : d.id === "decoder" ? "TV suscripción" : "Seguridad"}</div>
                </div>
              );
            })}
          </div>
          <GlowBtn
            full
            onClick={() => { if (devices.length > 0) { calcularYBuscar(); } }}
            disabled={devices.length === 0 || loading}
            gradient="linear-gradient(135deg,#a855f7,#ec4899)"
            glow={C.neon2}
            style={{ borderRadius: 12, padding: "12px 0" }}
          >
            {loading ? "⏳ Calculando..." : "📊 Ver mi consumo y plan ideal →"}
          </GlowBtn>
          <button onClick={() => setLvl(1)} style={{ width: "100%", marginTop: 8, padding: "8px 0", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            ← Cambiar perfil
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Level 3 — Desglose de consumo ──────────────────────────── */
  if (lvl === 3) return (
    <Wrap>
      <LvlBar lvl={3} />
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📊</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: C.neon, marginBottom: 8 }}>Calculando tu consumo...</div>
          <div style={{ color: C.muted, fontSize: 12 }}>Analizando {devices.length} dispositivos</div>
        </div>
      ) : resumen && (
        <>
          {/* Título y explicación */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.3rem,4vw,1.8rem)", marginBottom: 8, color: "#fff" }}>
              Tu hogar necesita{" "}
              <span style={{ color: resumen.colorConsumo }}>{resumen.mbpsRecomendado} Mbps</span>
            </h2>
            <p style={{ color: C.muted, fontSize: 13, maxWidth: 480, margin: "0 auto" }}>
              {generarExplicacion(resumen)}
            </p>
          </div>

          {/* Desglose por dispositivo */}
          <div style={{ background: "rgba(0,212,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ color: C.muted, fontSize: 9, fontWeight: 800, letterSpacing: 1.5, marginBottom: 12 }}>📋 DESGLOSE POR DISPOSITIVO</div>
            {resumen.desglose.map((d) => {
              const nivelCfg = NIVEL_LABELS[d.nivel];
              const pct = Math.min((d.mbps / resumen.mbpsBase) * 100, 100);
              return (
                <div key={d.uid} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{d.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{d.name}</span>
                      <span style={{ color: nivelCfg.color, fontSize: 11 }}>{nivelCfg.label} — {d.mbps} Mbps</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 5, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: 99 }} />
                      </div>
                      <span style={{ color: C.muted, fontSize: 10, flexShrink: 0 }}>{d.usoDesc}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Totales */}
            <div style={{ borderTop: `1px solid ${C.borderSoft}`, marginTop: 10, paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
              {[
                ["Suma base",       `${resumen.mbpsBase} Mbps`,        C.neon],
                ["× Personas",      `×${resumen.factorSimultaneidad}`, C.yellow],
                ["× Perfil",        `×${resumen.factorAvatar}`,        C.neon2],
              ].map(([l, v, c]: any) => (
                <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 4px" }}>
                  <div style={{ color: C.muted, fontSize: 9, marginBottom: 3 }}>{l}</div>
                  <div style={{ color: c, fontWeight: 800, fontSize: 14 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 12, padding: "10px", background: `${resumen.colorConsumo}14`, border: `1px solid ${resumen.colorConsumo}44`, borderRadius: 10 }}>
              <div style={{ color: C.muted, fontSize: 10, marginBottom: 3 }}>Recomendación final (incluye 20% margen)</div>
              <div style={{ color: resumen.colorConsumo, fontWeight: 900, fontSize: 22 }}>{resumen.mbpsRecomendado} Mbps</div>
              <div style={{ color: resumen.colorConsumo, fontSize: 11, marginTop: 2 }}>{resumen.etiquetaConsumo}</div>
            </div>
          </div>

          <GlowBtn
            full
            onClick={() => setLvl(4)}
            gradient="linear-gradient(135deg,#a855f7,#ec4899)"
            glow={C.neon2}
            style={{ borderRadius: 12, padding: "13px 0", marginBottom: 10 }}
          >
            🏆 Ver planes recomendados →
          </GlowBtn>
          <button onClick={() => setLvl(2)} style={{ width: "100%", padding: "9px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            ← Ajustar dispositivos
          </button>
        </>
      )}
    </Wrap>
  );

  /* ── Level 4 — Planes recomendados ──────────────────────────── */
  // Scroll automático al top cuando llega a resultados
  useEffect(() => {
    if (lvl === 4) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [lvl]);

  return (
    <Wrap>
      <LvlBar lvl={4} />

      {/* Resumen del análisis */}
      {resumen && (
        <div style={{ background: "rgba(0,212,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ color: C.muted, fontSize: 12 }}>Tu hogar necesita <strong style={{ color: resumen.colorConsumo }}>{resumen.mbpsRecomendado} Mbps</strong></span>
          <span style={{ color: C.muted, fontSize: 12 }}>Presupuesto: <strong style={{ color: C.yellow }}>${resumen.precioMax.toLocaleString()}/mes</strong></span>
          <span style={{ color: C.muted, fontSize: 12 }}>Plan ideal: <strong style={{ color: "#fff" }}>{resumen.tiposRelevantes[0].toUpperCase()}</strong></span>
        </div>
      )}

      {planesDB.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
          <p>No encontramos planes exactos. Prueba otro perfil.</p>
          <button onClick={() => setLvl(1)} style={{ marginTop: 16, padding: "9px 22px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.neon, fontWeight: 700, cursor: "pointer" }}>← Ajustar perfil</button>
        </div>
      ) : (
        <>
          <div style={{ color: C.muted, fontSize: 11, marginBottom: 12, textAlign: "center" }}>
            🏆 <strong style={{ color: "#fff" }}>{planesDB.length} planes</strong> recomendados para tu hogar
          </div>

          {/* Grid horizontal en desktop, vertical en mobile */}
          <div
            className="planes-grid-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(260px, 1fr))",
              gap: 14,
              marginBottom: 20,
              overflowX: "auto",
              paddingBottom: 8,
            }}>
            {planesDB.map((p) => (
              <Card key={p.id_crc} glow={p.glow} style={{ padding: 18, position: "relative", border: p.top ? `2px solid ${p.glow}` : undefined, minWidth: 240 }}>
                {p.top && (
                  <div style={{ position: "absolute", top: -1, right: 16, background: p.glow, color: "#000", fontSize: 9, fontWeight: 900, padding: "3px 10px", borderRadius: "0 0 8px 8px" }}>
                    RECOMENDADO
                  </div>
                )}

                {/* Badge + Operador */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ background: `${p.glow}14`, border: `1px solid ${p.glow}33`, color: p.glow, borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 800 }}>{p.badge}</span>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{p.operador}</span>
                  <span style={{ color: C.muted, fontSize: 10, marginLeft: "auto" }}>{p.tipo}</span>
                  <button
                    onClick={() => toggleFavorito({ id_crc: p.id_crc, operador: p.operador, nombre: p.nombre, precio: p.precio, tipo: p.tipo })}
                    title={user ? (isFavorito(p.id_crc) ? "Quitar favorito" : "Guardar") : "Inicia sesión para guardar"}
                    style={{ background: isFavorito(p.id_crc) ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isFavorito(p.id_crc) ? "rgba(236,72,153,0.4)" : C.borderSoft}`, borderRadius: 8, padding: "5px 7px", cursor: "pointer" }}
                  >
                    <Heart size={13} fill={isFavorito(p.id_crc) ? "#ec4899" : "none"} color={isFavorito(p.id_crc) ? "#ec4899" : C.muted} />
                  </button>
                </div>

                {/* Nombre */}
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#e8eaf6", lineHeight: 1.35, minHeight: 36 }}>{p.nombre}</div>

                {/* Precio */}
                <div style={{ fontWeight: 900, fontSize: 26, color: p.glow, marginBottom: 10 }}>
                  ${(p.precio).toLocaleString()}
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/mes</span>
                </div>

                {/* Specs */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {p.velocidad_mbps && <Chip color={C.neon}>⚡ {p.velocidad_mbps} Mbps</Chip>}
                  {p.datos_gb && <Chip color={C.cyan}>{p.datos_gb === -1 ? "∞ Datos" : `${p.datos_gb} GB`}</Chip>}
                  {p.canales_tv && <Chip color={C.neon2}>📺 {p.canales_tv} canales</Chip>}
                  {p.modalidad && <Chip color={C.muted}>{p.modalidad}</Chip>}
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <WABtn name={`${p.operador} - ${p.nombre}`} label="💬 Lo Quiero" full style={{ borderRadius: 10, fontSize: 13 }} />
                  <a
                    href={`/planes/${p.id_crc}`}
                    style={{ display: "block", textAlign: "center", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.borderSoft}`, color: C.muted, borderRadius: 10, padding: "9px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                  >
                    Ver detalle completo
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Ecosistema */}
      {ecosistema.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ color: C.muted, fontSize: 9, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>🔧 TAMBIÉN NECESITARÁS</div>
          {ecosistema.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < ecosistema.length - 1 ? `1px solid ${C.borderSoft}` : "none" }}>
              <span style={{ fontSize: 20 }}>{e.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{e.nombre}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>{e.razon}</div>
              </div>
              <span style={{ color: C.yellow, fontWeight: 800, fontSize: 12 }}>${e.precio.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Botones de navegación */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => { setLvl(0); setDevices([]); setAvatar(null); setPersonas(null); setPlanesDB([]); setResumen(null); }}
          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          🔄 Reiniciar
        </button>
        <button
          onClick={() => setLvl(3)}
          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          ← Ver consumo
        </button>
        <button
          onClick={onBack}
          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          🏠 Inicio
        </button>
      </div>

      {/* CSS responsive */}
      <style>{`
        @media (max-width: 640px) {
          .planes-grid-mobile {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Wrap>
  );
};
