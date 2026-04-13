"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { C, DEVICES } from "@/lib/constants";
import { GlowBtn, WABtn, Card, Chip } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

/* ── House SVG ───────────────────────────────────────────────── */
const HouseSVG = ({ floor2, devices, flash }: { floor2: boolean; devices: any[]; flash: boolean }) => {
  const mx = 200, my = floor2 ? 195 : 148;
  return (
    <svg viewBox="0 0 400 320" style={{ width: "100%", maxWidth: 400, display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="hGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={flash ? "#10b981" : "#00d4ff"} stopOpacity={flash ? 1 : .8} />
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

      {devices.length > 0 && <circle cx={mx} cy={my} r="20" fill="url(#hGlow)" opacity={flash ? 1 : .45} />}
      <circle cx={mx} cy={my} r="13" fill="rgba(6,4,20,0.96)" stroke={flash ? "#10b981" : "#00d4ff"} strokeWidth="2" filter="url(#gf)" />
      <text x={mx} y={my + 5} textAnchor="middle" fontSize="12">📡</text>

      {devices.map((d: any, i: number) => {
        const ang = (i / Math.max(devices.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const dx = mx + Math.cos(ang) * 68, dy = my + Math.sin(ang) * 68;
        const dev = DEVICES.find((x) => x.id === d.id);
        const col = dev?.color ?? "#00d4ff";
        return (
          <g key={d.uid}>
            <line x1={mx} y1={my} x2={dx} y2={dy} stroke={col} strokeWidth="1.5" strokeOpacity=".65" strokeDasharray="4,3">
              <animate attributeName="stroke-dashoffset" from="0" to="14" dur="1.2s" repeatCount="indefinite" />
            </line>
            <circle cx={dx} cy={dy} r="12" fill="rgba(6,4,20,0.94)" stroke={col} strokeWidth="1.8" filter="url(#gf)" />
            <text x={dx} y={dy + 4.5} textAnchor="middle" fontSize="10">{dev?.emoji ?? "📱"}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ── Avatars ─────────────────────────────────────────────────── */
const AVATARS = [
  { id: "gamer",       name: "Gamer",           emoji: "🎮", color: C.cyan,   desc: "Latencia ultra-baja",    factorVelocidad: 1.5, precioMax: 200000 },
  { id: "familia",     name: "Familia",          emoji: "👨‍👩‍👧‍👦", color: C.neon2,  desc: "Múltiples dispositivos", factorVelocidad: 1.2, precioMax: 300000 },
  { id: "teletrabajo", name: "Teletrabajador",   emoji: "💼", color: C.green,  desc: "Estabilidad máxima",     factorVelocidad: 1.3, precioMax: 250000 },
  { id: "nomada",      name: "Nómada Digital",   emoji: "📱", color: C.yellow, desc: "Datos sin límite",        factorVelocidad: 1.0, precioMax: 150000 },
] as const;

/* ── Level bar ───────────────────────────────────────────────── */
const LvlBar = ({ lvl }: { lvl: number }) => (
  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
    {(["🎯 Perfil", "🏠 Casa", "🏆 Plan"] as const).map((l, i) => {
      const n = i + 1;
      return (
        <div key={l} style={{
          padding: "5px 15px", borderRadius: 99,
          background: n === lvl ? "linear-gradient(135deg,#0070cc,#0050aa)" : n < lvl ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.03)",
          border: n === lvl ? "none" : `1px solid ${n < lvl ? C.border : C.borderSoft}`,
          color: n === lvl ? "#fff" : n < lvl ? C.neon : "rgba(255,255,255,0.25)",
          fontWeight: 700, fontSize: 11.5,
          boxShadow: n === lvl ? "0 0 16px rgba(0,212,255,0.25)" : "none",
        }}>{l}</div>
      );
    })}
  </div>
);

const BG = "linear-gradient(160deg,#04040f 0%,#080622 50%,#100830 100%)";
const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter',system-ui,sans-serif", padding: "90px 20px 60px" }}>
    <div style={{ maxWidth: 680, margin: "0 auto" }}>{children}</div>
  </div>
);

/* ── NOMBRES_INVALIDOS (scoring) ─────────────────────────────── */
const NOMBRES_INVALIDOS = [
  "ldi", "waze", "sms", "chat ilimitado", "redes sociales",
  "whatsapp", "minutos internacional", "internacional",
  "mensajes", "bolsa de minutos", "roaming", "llamadas internacionales",
];

/* ── GameFlow ────────────────────────────────────────────────── */
export const GameFlow = ({ onBack }: { onBack: () => void }) => {
  const { guardarAnalisis, toggleFavorito, isFavorito, user } = useAuth();
  const [lvl,       setLvl]       = useState(0);
  const [avatar,    setAvatar]    = useState<typeof AVATARS[number] | null>(null);
  const [devices,   setDevices]   = useState<any[]>([]);
  const [mbps,      setMbps]      = useState(0);
  const [floor2,    setFloor2]    = useState(false);
  const [flash,     setFlash]     = useState(false);
  const [planesDB,  setPlanesDB]  = useState<any[]>([]);
  const [necesidades, setNecesidades] = useState<any>(null);
  const [loading,   setLoading]   = useState(false);

  const addDev = (id: string) => {
    const dev = DEVICES.find((d) => d.id === id);
    if (!dev) return;
    const uid = `${id}-${Math.random().toString(36).slice(2)}`;
    const nd  = [...devices, { ...dev, uid }];
    setDevices(nd);
    setMbps((p) => p + dev.mbps);
    if (nd.length >= 4) { setFlash(true); setTimeout(() => setFlash(false), 1600); }
  };

  const remDev = (uid: string) => {
    const d = devices.find((x) => x.uid === uid);
    if (d) { setDevices((p) => p.filter((x) => x.uid !== uid)); setMbps((p) => p - d.mbps); }
  };

  const calcularRecomendacion = async () => {
    setLoading(true);
    const necesitaTV     = devices.some((d) => ["tv", "decoder"].includes(d.id));
    const necesitaGaming = devices.some((d) => ["console", "pc"].includes(d.id));
    const necesitaMovil  = devices.some((d) => d.id === "phone");
    const factor         = avatar?.factorVelocidad ?? 1.2;
    const mbpsNec        = Math.ceil(mbps * factor);
    const precioMax      = avatar?.precioMax ?? 300000;

    let tiposRelevantes: string[] = [];
    if (necesitaTV && mbpsNec > 0)        tiposRelevantes = ["paquete", "internet", "tv"];
    else if (necesitaTV)                  tiposRelevantes = ["paquete", "tv"];
    else if (necesitaMovil && mbps <= 20) tiposRelevantes = ["movil", "internet"];
    else                                  tiposRelevantes = ["internet", "paquete", "movil"];

    const eco: any[] = [];
    if (mbpsNec > 100) eco.push({ emoji: "📡", nombre: "Router WiFi 6 AX3000", razon: "Necesitas mayor cobertura y velocidad", precio: 189900 });
    if (devices.length > 3) eco.push({ emoji: "📶", nombre: "Sistema Mesh Tenda", razon: "Elimina zonas sin señal en casa", precio: 289900 });
    if (necesitaGaming) eco.push({ emoji: "🎮", nombre: "Cable Ethernet Cat8 10m", razon: "Latencia ultra-baja para gaming", precio: 29900 });

    setNecesidades({ mbpsNec, tipoRec: tiposRelevantes[0], necesitaTV, esGaming: necesitaGaming, tieneMovil: necesitaMovil, precioMax, eco });

    try {
      const { data: rawData, error } = await supabase
        .from("planes_unicos")
        .select("id_crc, operador, nombre, tipo, precio, velocidad_mbps, datos_gb, canales_tv, minutos, modalidad, tecnologia")
        .in("tipo", tiposRelevantes)
        .order("precio", { ascending: true })
        .limit(500);

      if (error) throw error;
      const rawPlanes = rawData ?? [];

      const scored = rawPlanes.map((p: any) => {
        const precio    = p.precio        ?? 0;
        const datos     = p.datos_gb      ?? 0;
        const canales   = p.canales_tv    ?? 0;
        const velocidad = p.velocidad_mbps ?? 0;
        const nombre    = (p.nombre       ?? "").toLowerCase();

        if (precio > 0 && precio < 20000)                           return { ...p, _score: -100 };
        if (!velocidad && !datos && p.tipo !== "tv")                 return { ...p, _score: -100 };
        if (NOMBRES_INVALIDOS.some((x) => nombre.includes(x)))      return { ...p, _score: -100 };

        let score = 0;
        if (precio > 0 && precioMax > 0) {
          if      (precio <= precioMax)         score += 40;
          else if (precio <= precioMax * 1.15)  score += 25;
          else if (precio <= precioMax * 1.3)   score += 10;
          else                                  score -= 10;
        }
        if      (p.tipo === tiposRelevantes[0])        score += 30;
        else if (tiposRelevantes.includes(p.tipo))     score += 15;
        if (necesitaTV) {
          if (canales > 50)                            score += 15;
          else if (canales > 0 || p.tipo === "tv")     score += 8;
          else if (p.tipo === "paquete")               score += 5;
        }
        if (necesitaMovil && (datos > 0 || datos === -1)) score += 10;
        if (necesitaGaming && velocidad >= 100)            score += 15;
        else if (necesitaGaming && velocidad >= 50)        score += 8;
        if (velocidad > 0 && mbpsNec > 0) {
          const ratio = velocidad / mbpsNec;
          if      (ratio >= 1.5) score += 20;
          else if (ratio >= 1.0) score += 15;
          else if (ratio >= 0.7) score += 8;
          else                   score += 2;
        }
        if      (datos === -1) score += 10;
        else if (datos >= 20)  score += 8;
        else if (datos >= 5)   score += 4;
        else if (datos > 0)    score += 2;
        if (devices.length >= 4 && p.tipo === "paquete") score += 8;
        return { ...p, _score: Math.round(score) };
      });

      const validos = scored
        .filter((p: any) => p._score > 0)
        .sort((a: any, b: any) => b._score !== a._score ? b._score - a._score : (a.precio ?? 0) - (b.precio ?? 0));

      const resultado: any[] = [];
      const ops = new Set<string>();
      for (const plan of validos) {
        if (resultado.length >= 3) break;
        const op = (plan.operador ?? "").toLowerCase().trim();
        if (!ops.has(op)) { resultado.push(plan); ops.add(op); }
      }

      const badges = ["🏆 Mejor Oferta", "⚡ Mejor Velocidad", "💰 Mejor Precio"];
      const glows  = ["#f59e0b",          "#00d4ff",            "#10b981"];
      const finalPlanes = resultado.map((p, i) => ({ ...p, badge: badges[i] ?? `#${i + 1}`, glow: glows[i] ?? "#fff", top: i === 0 }));
      setPlanesDB(finalPlanes);

      // Guardar análisis en historial (solo si hay sesión)
      await guardarAnalisis({
        avatar_tipo:    avatar?.id ?? "",
        dispositivos:   devices,
        mbps_base:      mbps,
        mbps_rec:       mbpsNec,
        tipo_plan_rec:  tiposRelevantes[0],
        planes_vistos:  finalPlanes.map((p) => p.id_crc).filter(Boolean),
      });
    } catch (e) {
      console.error("Error consultando Supabase:", e);
      setPlanesDB([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Level 0 — Intro ─────────────────────────────────────────── */
  if (lvl === 0) return (
    <Wrap>
      <div style={{ textAlign: "center", padding: "30px 0" }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🏠</div>
        <Chip color={C.neon}>ANÁLISIS INTELIGENTE · 3 NIVELES</Chip>
        <h1 style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", fontWeight: 900, margin: "14px 0 10px", background: "linear-gradient(90deg,#00d4ff,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Diseñar mi Hogar Digital
        </h1>
        <p style={{ color: C.muted, marginBottom: 32, fontSize: 14 }}>Conecta tus dispositivos y nuestro motor IA encontrará el plan perfecto para ti</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 36 }}>
          {[["🎯", "Perfil", "Tu avatar digital"], ["🏠", "Casa", "Conecta devices"], ["🤖", "IA", "Análisis inteligente"]].map(([ic, n, d]) => (
            <div key={n} style={{ background: "rgba(0,212,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", textAlign: "center", minWidth: 110 }}>
              <div style={{ fontSize: 26, marginBottom: 5 }}>{ic}</div>
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

  /* ── Level 1 — Avatar ────────────────────────────────────────── */
  if (lvl === 1) return (
    <Wrap>
      <LvlBar lvl={1} />
      <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 22, background: "linear-gradient(90deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        ¿Cuál es tu perfil digital?
      </h2>
      <p style={{ textAlign: "center", color: C.muted, fontSize: 12, marginBottom: 18 }}>Esto afina el análisis de velocidad y precio recomendado</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 22 }}>
        {AVATARS.map((av) => {
          const sel = avatar?.id === av.id;
          return (
            <div key={av.id} onClick={() => setAvatar(av)} style={{
              cursor: "pointer", textAlign: "center", padding: "20px 10px",
              background: sel ? `${av.color}12` : "rgba(255,255,255,0.02)",
              border: `2px solid ${sel ? av.color : C.borderSoft}`,
              borderRadius: 14, boxShadow: sel ? `0 0 24px ${av.color}28` : "none", transition: "all .2s",
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
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ padding: "9px 18px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "rgba(255,255,255,0.03)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>← Volver</button>
        <GlowBtn onClick={() => avatar && setLvl(2)} disabled={!avatar} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{ marginLeft: "auto", borderRadius: 10, padding: "9px 22px" }}>
          Siguiente → Diseñar Casa
        </GlowBtn>
      </div>
    </Wrap>
  );

  /* ── Level 2 — Devices ───────────────────────────────────────── */
  if (lvl === 2) return (
    <div style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div className="gameflow-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>

        {/* Left: house preview */}
        <div className="gameflow-devices-panel" style={{ padding: "90px 16px 24px", display: "flex", flexDirection: "column", borderRight: `1px solid ${C.borderSoft}` }}>
          <LvlBar lvl={2} />
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
            {[["🏠 1 Planta", false, C.neon], ["🏢 2 Plantas", true, C.neon2]].map(([l, v, col]: any) => (
              <button key={String(l)} onClick={() => setFloor2(v)} style={{
                padding: "6px 14px", borderRadius: 99,
                border: `2px solid ${floor2 === v ? col : C.borderSoft}`,
                background: floor2 === v ? `${col}14` : "transparent",
                color: floor2 === v ? col : C.muted,
                fontWeight: 700, fontSize: 11.5, cursor: "pointer", transition: "all .18s",
              }}>{l}</button>
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HouseSVG floor2={floor2} devices={devices} flash={flash} />
          </div>

          {/* Network load bar */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borderSoft}`, borderRadius: 11, padding: "10px 13px", marginTop: 10 }}>
            <div style={{ color: C.muted, fontSize: 9, fontWeight: 800, letterSpacing: 1, marginBottom: 5, textAlign: "center" }}>⚡ CARGA DE RED ESTIMADA</div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 4 }}>
              <div style={{
                height: "100%", borderRadius: 99, width: `${Math.min((mbps / 400) * 100, 100)}%`,
                background: `linear-gradient(90deg,${mbps < 100 ? "#10b981" : mbps < 250 ? "#f59e0b" : "#ef4444"},#00d4ff)`,
                transition: "width .5s",
              }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ color: C.neon, fontWeight: 900, fontSize: 16 }}>{mbps}</span>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}> Mbps base · recomendado: </span>
              <span style={{ color: C.yellow, fontWeight: 800, fontSize: 13 }}>{Math.ceil(mbps * (avatar?.factorVelocidad ?? 1.2))} Mbps</span>
            </div>
          </div>

          {devices.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
              {devices.map((d: any) => (
                <div key={d.uid} onClick={() => remDev(d.uid)} title="Quitar" style={{ cursor: "pointer", background: `${d.color}14`, border: `1px solid ${d.color}33`, borderRadius: 7, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12 }}>{d.emoji}</span>
                  <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>{d.name}</span>
                  <span style={{ color: C.red, fontSize: 11, fontWeight: 900, marginLeft: 2 }}>×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: device picker */}
        <div style={{ padding: "90px 16px 24px", overflowY: "auto" }}>
          <h3 style={{ fontWeight: 900, fontSize: 14, marginBottom: 4, textAlign: "center", color: "#fff" }}>Agregar Dispositivos</h3>
          <p style={{ color: C.muted, fontSize: 11, textAlign: "center", marginBottom: 14 }}>El motor IA calculará el plan ideal según tu combinación</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 18 }}>
            {DEVICES.map((d) => {
              const cnt = devices.filter((x: any) => x.id === d.id).length;
              return (
                <div
                  key={d.id} onClick={() => addDev(d.id)}
                  style={{
                    cursor: "pointer", textAlign: "center", padding: "13px 8px",
                    background: cnt > 0 ? `${d.color}0e` : "rgba(255,255,255,0.02)",
                    border: `2px solid ${cnt > 0 ? d.color : C.borderSoft}`,
                    borderRadius: 11, boxShadow: cnt > 0 ? `0 0 16px ${d.color}28` : "none",
                    transition: "all .2s", position: "relative",
                  }}
                  onMouseEnter={(e: any) => { if (!cnt) { e.currentTarget.style.border = `2px solid ${d.color}66`; } }}
                  onMouseLeave={(e: any) => { if (!cnt) { e.currentTarget.style.border = `2px solid ${C.borderSoft}`; } }}
                >
                  {cnt > 0 && (
                    <div style={{ position: "absolute", top: 6, right: 6, background: d.color, color: "#000", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900 }}>{cnt}</div>
                  )}
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{d.emoji}</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{d.name}</div>
                  <div style={{ color: d.color, fontSize: 10, fontWeight: 700 }}>+{d.mbps} Mbps</div>
                  <div style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>{d.desc}</div>
                </div>
              );
            })}
          </div>
          <GlowBtn
            full
            onClick={() => { if (devices.length > 0) { calcularRecomendacion(); setLvl(3); } }}
            disabled={devices.length === 0}
            gradient="linear-gradient(135deg,#a855f7,#ec4899)"
            glow={C.neon2}
            style={{ borderRadius: 12, padding: "12px 0" }}
          >
            🤖 Analizar y Ver Plan Ideal →
          </GlowBtn>
          <button onClick={() => setLvl(1)} style={{ width: "100%", marginTop: 8, padding: "8px 0", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            ← Cambiar perfil
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Level 3 — Results ───────────────────────────────────────── */
  return (
    <Wrap>
      <LvlBar lvl={3} />
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🤖</div>
          <div style={{ fontWeight: 900, fontSize: 18, background: "linear-gradient(90deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>
            Analizando tu hogar...
          </div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Consultando {necesidades?.tipoRec ?? "planes"} · Calculando velocidad óptima</div>
          <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
            {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.neon, animation: `blink 1.2s ${i * .2}s infinite` }} />)}
          </div>
        </div>
      ) : (
        <>
          {/* Analysis summary */}
          {necesidades && (
            <div style={{ background: "rgba(0,212,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 18px", marginBottom: 20 }}>
              <div style={{ color: C.neon, fontSize: 9, fontWeight: 800, letterSpacing: 1.5, marginBottom: 10 }}>🤖 ANÁLISIS COMPLETADO</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[
                  ["⚡", "Velocidad recomendada", `${necesidades.mbpsNec} Mbps`],
                  ["📦", "Tipo de plan", necesidades.tipoRec.toUpperCase()],
                  ["💰", "Presupuesto máx", `$${necesidades.precioMax.toLocaleString()}`],
                ].map(([ic, l, v]) => (
                  <div key={String(l)} style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: 9, padding: "8px 6px" }}>
                    <div style={{ fontSize: 18, marginBottom: 3 }}>{ic}</div>
                    <div style={{ color: C.muted, fontSize: 9, marginBottom: 2 }}>{l}</div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 12 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                {necesidades.necesitaTV   && <Chip color={C.neon2}>📺 Necesita TV</Chip>}
                {necesidades.esGaming     && <Chip color={C.red}>🎮 Gaming</Chip>}
                {necesidades.tieneMovil   && <Chip color={C.green}>📱 Móvil</Chip>}
              </div>
            </div>
          )}

          {/* Plan cards */}
          {planesDB.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
              <p style={{ fontSize: 14 }}>No encontramos planes exactos. Prueba otro perfil.</p>
              <button onClick={() => setLvl(1)} style={{ marginTop: 16, padding: "9px 22px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.neon, fontWeight: 700, cursor: "pointer" }}>← Ajustar perfil</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {planesDB.map((p: any) => (
                <Card key={p.id_crc} glow={p.glow} style={{ padding: 18, position: "relative", border: p.top ? `2px solid ${p.glow}` : undefined }}>
                  {p.top && <div style={{ position: "absolute", top: -1, right: 16, background: p.glow, color: "#000", fontSize: 9, fontWeight: 900, padding: "3px 10px", borderRadius: "0 0 8px 8px" }}>RECOMENDADO</div>}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                    <span style={{ background: `${p.glow}14`, border: `1px solid ${p.glow}33`, color: p.glow, borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 800 }}>{p.badge}</span>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{p.operador}</span>
                    <span style={{ color: C.muted, fontSize: 10, marginLeft: "auto" }}>{p.tipo}</span>
                    {/* Favorite button */}
                    <button
                      onClick={() => toggleFavorito({ id_crc: p.id_crc, operador: p.operador, nombre: p.nombre, precio: p.precio, tipo: p.tipo })}
                      title={user ? (isFavorito(p.id_crc) ? "Quitar favorito" : "Guardar favorito") : "Inicia sesión para guardar"}
                      style={{ background: isFavorito(p.id_crc) ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isFavorito(p.id_crc) ? "rgba(236,72,153,0.4)" : C.borderSoft}`, borderRadius: 8, padding: "5px 7px", cursor: "pointer", color: isFavorito(p.id_crc) ? "#ec4899" : C.muted, display: "flex", transition: "all .2s" }}
                    >
                      <Heart size={13} fill={isFavorito(p.id_crc) ? "#ec4899" : "none"} />
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#e8eaf6" }}>{p.nombre}</div>
                  <div style={{ fontWeight: 900, fontSize: 24, color: p.glow, marginBottom: 10 }}>
                    ${(p.precio ?? 0).toLocaleString()}
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/mes</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {p.velocidad_mbps && <Chip color={C.neon}>⚡ {p.velocidad_mbps} Mbps</Chip>}
                    {p.datos_gb && <Chip color={C.cyan}>{p.datos_gb === -1 ? "∞ Datos" : `${p.datos_gb} GB`}</Chip>}
                    {p.canales_tv && <Chip color={C.neon2}>📺 {p.canales_tv} canales</Chip>}
                    {p.modalidad && <Chip color={C.muted}>{p.modalidad}</Chip>}
                  </div>
                  <WABtn name={`${p.operador} - ${p.nombre}`} label="Lo Quiero 🚀" full style={{ borderRadius: 10, fontSize: 13 }} />
                </Card>
              ))}
            </div>
          )}

          {/* Eco-sistema recommendations */}
          {necesidades?.eco?.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: 16 }}>
              <div style={{ color: C.muted, fontSize: 9, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>🔧 TAMBIÉN NECESITARÁS</div>
              {necesidades.eco.map((e: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < necesidades.eco.length - 1 ? `1px solid ${C.borderSoft}` : "none" }}>
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

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => { setLvl(0); setDevices([]); setMbps(0); setAvatar(null); setPlanesDB([]); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              🔄 Reiniciar
            </button>
            <button onClick={onBack} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "transparent", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              ← Volver al inicio
            </button>
          </div>
        </>
      )}
    </Wrap>
  );
};
