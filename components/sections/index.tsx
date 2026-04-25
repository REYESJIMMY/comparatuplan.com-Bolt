"use client";
import { useState, useEffect } from "react";
import { Check, Search, Zap, Shield, BookOpen, ShoppingCart, ArrowRight, MapPin, ExternalLink } from "lucide-react";
import { C, openWA } from "@/lib/constants";
import { GlowBtn, WABtn, Card, Chip, Particles } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";

const WA_NUMBER = "573057876992";

/* ── Hero ────────────────────────────────────────────────────── */
interface HeroProps {
  onGame:    () => void;
  onMovil:   () => void;
  onSegment: () => void;
  addToCart: (item: any) => void;
}

export const Hero = ({ onGame, onMovil, onSegment }: HeroProps) => {
  const { theme } = useTheme();
  const L = theme === "light";
  const [mayor, setMayor] = useState(false);
  const [habea, setHabea] = useState(false);
  const ready = mayor && habea;

  return (
    <section style={{
      position: "relative", borderRadius: 20, overflow: "hidden",
      border: `1px solid ${L ? "#e2e8f0" : C.border}`,
      background: L ? "#ffffff" : "rgba(6,4,22,0.7)",
      padding: "clamp(28px,5vw,48px) clamp(16px,4vw,32px) 40px",
      minHeight: 330,
      boxShadow: L ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
    }}>
      {!L && <Particles count={30} />}
      <div style={{ position: "relative", zIndex: 2 }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: L ? "#e8f5e9" : "rgba(0,212,255,0.08)",
          border: `1px solid ${L ? "#a5d6a7" : C.border}`,
          borderRadius: 99, padding: "5px 14px", marginBottom: 16,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: L ? "#3ab54a" : C.green, display: "inline-block", animation: "blink 1.5s infinite" }} />
          <span style={{ color: L ? "#2e7d32" : C.neon, fontSize: 11, fontWeight: 700 }}>+1.500 usuarios ahorran cada mes</span>
        </div>

        {/* H1 */}
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.7rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 12, color: L ? "#0d1b2e" : "#fff", letterSpacing: -1 }}>
          Compara y desbloquea el<br />
          <span style={{
            display: "block",
            background: L
              ? "linear-gradient(90deg,#1a56db,#3ab54a)"
              : "linear-gradient(90deg,#00d4ff,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            paddingBottom: 4,
          }}>
            máximo potencial de tu red,
          </span>
          <span style={{ display: "block" }}>todo desde un solo lugar</span>
        </h1>

        <p style={{ fontSize: 14, color: L ? "#475569" : "rgba(180,195,230,0.75)", marginBottom: 22, maxWidth: 460, lineHeight: 1.65 }}>
          Ahorra hasta un <strong style={{ color: L ? "#0d1b2e" : "#fff" }}>40% en tu factura</strong>. Análisis inteligente de planes en segundos.
        </p>

        {/* Auth box */}
        <div style={{
          background: L ? "#f8fafc" : "rgba(0,212,255,0.04)",
          border: `1px solid ${L ? "#e2e8f0" : C.border}`,
          borderRadius: 11, padding: "12px 15px", marginBottom: 20, maxWidth: 420,
        }}>
          <div style={{ color: L ? "#94a3b8" : "rgba(0,212,255,0.3)", fontSize: 9, fontWeight: 800, letterSpacing: 1, marginBottom: 9 }}>AUTORIZACIÓN DE DATOS</div>
          <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", marginBottom: 7 }}>
            <div onClick={() => setMayor(!mayor)} style={{
              width: 15, height: 15, borderRadius: 4,
              border: `2px solid ${mayor ? (L ? "#1a56db" : C.neon) : (L ? "#cbd5e1" : "rgba(255,255,255,0.15)")}`,
              background: mayor ? (L ? "#1a56db" : C.neon) : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .2s", flexShrink: 0, cursor: "pointer",
            }}>
              {mayor && <Check size={8} color="#fff" strokeWidth={3} />}
            </div>
            <span style={{ color: L ? "#475569" : "rgba(180,190,220,0.65)", fontSize: 11, fontWeight: 600 }}>Soy mayor de edad (18+)</span>
          </label>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer" }}>
            <div onClick={() => setHabea(!habea)} style={{
              width: 15, height: 15, borderRadius: 4,
              border: `2px solid ${habea ? (L ? "#1a56db" : C.neon) : (L ? "#cbd5e1" : "rgba(255,255,255,0.15)")}`,
              background: habea ? (L ? "#1a56db" : C.neon) : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .2s", flexShrink: 0, cursor: "pointer", marginTop: 1,
            }}>
              {habea && <Check size={8} color="#fff" strokeWidth={3} />}
            </div>
            <span style={{ color: L ? "#475569" : "rgba(180,190,220,0.65)", fontSize: 11, fontWeight: 600, lineHeight: 1.5 }}>
              Acepto la{" "}
              <a href="/politica-de-datos" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                style={{ color: L ? "#1a56db" : C.neon, textDecoration: "underline" }}>
                Política de Tratamiento de Datos Personales
              </a>{" "}
              conforme a la Ley 1581 de 2012
            </span>
          </label>
        </div>

        {/* CTAs */}
        <div className="hero-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <GlowBtn onClick={onSegment} disabled={!ready} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={L ? "#1a56db" : C.neon} style={{ borderRadius: 11, padding: "11px 24px", fontSize: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}><MapPin size={14} />Consulta tu Cobertura<ArrowRight size={12} /></span>
            </GlowBtn>
            <div style={{ marginTop: 5, color: L ? "#3ab54a" : C.green, fontSize: 10, fontWeight: 700, textAlign: "center" }}>🏠 Hogar · 📱 Móvil</div>
          </div>
          <div>
            <GlowBtn onClick={onGame} disabled={!ready} gradient={L ? "linear-gradient(135deg,#1a56db,#3b82f6)" : "linear-gradient(135deg,#6600cc,#a855f7)"} glow={L ? "#1a56db" : C.neon2} style={{ borderRadius: 11, padding: "11px 22px", fontSize: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Zap size={14} />Diseñar Hogar Digital</span>
            </GlowBtn>
            <div style={{ marginTop: 5, color: L ? "#1a56db" : C.neon2, fontSize: 10, fontWeight: 700, textAlign: "center" }}>🏠 Misión 3D</div>
          </div>
          <WABtn name="asesoría personalizada" label="Asesor WhatsApp" style={{ borderRadius: 11, padding: "11px 18px", fontSize: 14 }} />
        </div>
      </div>
    </section>
  );
};

/* ── Ofertas Hot ─────────────────────────────────────────────── */
export const OfertasHotSection = () => {
  const { theme } = useTheme();
  const L = theme === "light";
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("ofertas_hot")
      .select("id, titulo, operador, descripcion, precio, precio_antes, emoji, color, badge, fecha_fin")
      .eq("activa", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => { setOfertas(data ?? []); setLoading(false); });
  }, []);

  if (loading || ofertas.length === 0) return null;

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: L ? "#fef2f2" : "rgba(239,68,68,0.1)", border: `1px solid ${L ? "#fca5a5" : "rgba(239,68,68,0.3)"}`, borderRadius: 99, padding: "4px 12px", marginBottom: 8 }}>
            <span style={{ animation: "blink 1s infinite" }}>🔥</span>
            <span style={{ color: "#ef4444", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>OFERTAS HOT · TIEMPO LIMITADO</span>
          </div>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.5rem)", color: L ? "#0d1b2e" : "#fff" }}>Ofertas Flash del día</h2>
        </div>
        <a href="/ofertas" style={{ display: "flex", alignItems: "center", gap: 5, color: "#ef4444", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
          Ver todas <ExternalLink size={12} />
        </a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {ofertas.map((o) => {
          const descuento = o.precio && o.precio_antes ? Math.round(((o.precio_antes - o.precio) / o.precio_antes) * 100) : null;
          const waMsg = encodeURIComponent(`Hola, vi la oferta *${o.titulo}* en ComparaTuPlan.com y quiero más información 🚀`);
          return (
            <div key={o.id} style={{
              background: L ? "#ffffff" : "rgba(8,6,28,0.85)",
              border: `1px solid ${o.color}33`, borderRadius: 14, padding: 16, position: "relative", transition: "all .2s",
              boxShadow: L ? "0 1px 6px rgba(0,0,0,0.06)" : "none",
            }}
              onMouseEnter={(e: any) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = `${o.color}66`; }}
              onMouseLeave={(e: any) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = `${o.color}33`; }}
            >
              {descuento && <div style={{ position: "absolute", top: 10, right: 10, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 99 }}>-{descuento}%</div>}
              {o.badge && <div style={{ display: "inline-block", background: `${o.color}18`, border: `1px solid ${o.color}44`, color: o.color, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 99, marginBottom: 10 }}>{o.badge}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 26 }}>{o.emoji}</span>
                <div>
                  {o.operador && <div style={{ color: o.color, fontSize: 10, fontWeight: 700 }}>{o.operador}</div>}
                  <div style={{ color: L ? "#0d1b2e" : "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{o.titulo}</div>
                </div>
              </div>
              {o.descripcion && <p style={{ color: L ? "#64748b" : "rgba(180,195,230,0.6)", fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>{o.descripcion}</p>}
              {o.precio && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: o.color, fontWeight: 900, fontSize: 20 }}>${Number(o.precio).toLocaleString("es-CO")}</span>
                  <span style={{ color: L ? "#94a3b8" : "rgba(255,255,255,0.3)", fontSize: 10 }}>/mes</span>
                  {o.precio_antes && <div style={{ color: L ? "#94a3b8" : "rgba(180,195,230,0.4)", fontSize: 11, textDecoration: "line-through" }}>${Number(o.precio_antes).toLocaleString("es-CO")}</div>}
                </div>
              )}
              {o.fecha_fin && <div style={{ color: "#f59e0b", fontSize: 10, fontWeight: 700, marginBottom: 10 }}>⏰ Hasta: {new Date(o.fecha_fin).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}</div>}
              <a href={`https://wa.me/${WA_NUMBER}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", background: "#25D366", color: "#fff", borderRadius: 8, padding: "8px 0", fontWeight: 700, fontSize: 12, textAlign: "center", textDecoration: "none" }}>
                💬 Quiero esta oferta
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ── Featured Plans ──────────────────────────────────────────── */
const FEATURED = [
  { op: "Claro",    name: "Fibra 200 Mbps",  price: 89900,  speed: 200, benefits: ["HBO Max 3m", "WiFi 6", "Inst. gratis"],            glow: "#e2001a", emoji: "🔴" },
  { op: "Movistar", name: "Móvil 20GB Pro",  price: 45900,  benefits: ["20GB 4G", "Roaming LatAm", "Sin permanencia"],                 glow: "#00aa44", emoji: "🟢", badge: "MEJOR PRECIO" },
  { op: "Tigo",     name: "Internet+TV 300", price: 125900, speed: 300, benefits: ["140 Canales HD", "IP Fija", "Cloud DVR"],          glow: "#00a0e3", emoji: "🔵", badge: "TODO EN UNO" },
  { op: "ETB",      name: "Fibra ETB 100",   price: 69900,  speed: 100, benefits: ["Sin permanencia", "WiFi incluido", "Soporte 24/7"], glow: "#f59e0b", emoji: "🟡", badge: "SIN PERMANENCIA" },
];

export const FeaturedPlans = ({ onSegment, addToCart }: { onSegment?: () => void; addToCart: (item: any) => void }) => {
  const { theme } = useTheme();
  const L = theme === "light";
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <Chip color={L ? "#1a56db" : C.neon2}>PLANES DESTACADOS</Chip>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.5rem)", marginTop: 8, color: L ? "#0d1b2e" : "#fff" }}>Los mejores del mercado</h2>
        </div>
        {onSegment && (
          <GlowBtn onClick={onSegment} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={L ? "#1a56db" : C.neon} style={{ padding: "7px 14px", fontSize: 11, borderRadius: 9 }}>Ver todos →</GlowBtn>
        )}
      </div>
      <div className="plan-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 }}>
        {FEATURED.map((p, i) => (
          <div key={i} style={{
            background: L ? "#ffffff" : "rgba(8,6,28,0.7)",
            border: `1px solid ${L ? "#e2e8f0" : `${p.glow}22`}`,
            borderRadius: 14, padding: 18, position: "relative", cursor: "default", transition: "all .2s",
            boxShadow: L ? "0 2px 8px rgba(0,0,0,0.06)" : `0 0 24px ${p.glow}12`,
          }}
            onMouseEnter={(e: any) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = L ? "0 6px 20px rgba(0,0,0,0.1)" : `0 8px 28px ${p.glow}18`; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = L ? "0 2px 8px rgba(0,0,0,0.06)" : `0 0 24px ${p.glow}12`; }}
          >
            {(p as any).badge && <div style={{ position: "absolute", top: 0, right: 12, background: `linear-gradient(135deg,${p.glow},${p.glow}99)`, color: "#fff", fontSize: 8, fontWeight: 900, padding: "3px 9px", borderRadius: "0 0 7px 7px" }}>{(p as any).badge}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
              <span style={{ fontSize: 14 }}>{p.emoji}</span>
              <span style={{ color: p.glow, fontWeight: 800, fontSize: 11 }}>{p.op}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 7, color: L ? "#0d1b2e" : "#fff" }}>{p.name}</div>
            <div style={{ fontWeight: 900, fontSize: 22, color: p.glow, marginBottom: 8 }}>
              ${p.price.toLocaleString()}<span style={{ fontSize: 9, color: L ? "#94a3b8" : C.muted, fontWeight: 600 }}>/mes</span>
            </div>
            {(p as any).speed && <div style={{ color: L ? "#64748b" : C.muted, fontSize: 10, marginBottom: 7 }}>⚡ {(p as any).speed} Mbps</div>}
            {p.benefits.map((b) => (
              <div key={b} style={{ display: "flex", gap: 5, marginBottom: 3 }}>
                <Check size={9} color={p.glow} />
                <span style={{ color: L ? "#64748b" : C.muted, fontSize: 10 }}>{b}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, marginTop: 11 }}>
              <button onClick={() => addToCart({ id: `plan-${i}`, name: `${p.op} ${p.name}`, price: p.price, emoji: p.emoji, color: p.glow, qty: 1 })}
                style={{ flex: 1, background: `${p.glow}12`, border: `1px solid ${p.glow}28`, borderRadius: 8, padding: "7px 0", color: p.glow, fontWeight: 700, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <ShoppingCart size={11} />Agregar
              </button>
              <WABtn name={`${p.op} ${p.name}`} label="Contratar" style={{ flex: 1, borderRadius: 8, padding: "7px 0", fontSize: 11 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── Companies ───────────────────────────────────────────────── */
export const Companies = () => {
  const { theme } = useTheme();
  const L = theme === "light";
  return (
    <section>
      <Chip color={L ? "#00b8d4" : C.cyan}>SOLUCIONES EMPRESARIALES</Chip>
      <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.5rem)", margin: "8px 0 14px", color: L ? "#0d1b2e" : "#fff" }}>Comunicaciones para tu negocio</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
        {[
          { emoji: "☎️", name: "PBX Virtual",     desc: "Central telefónica en la nube sin hardware.",  price: "Desde $89.900/mes",  color: C.neon },
          { emoji: "💬", name: "WhatsApp IA",      desc: "Chatbots inteligentes y automatización 24/7.", price: "Desde $149.900/mes", color: C.green },
          { emoji: "🎙️", name: "VoIP Empresarial", desc: "Llamadas IP con alta calidad y bajo costo.",  price: "Desde $59.900/mes",  color: C.cyan },
        ].map((s, i) => (
          <div key={i} style={{
            background: L ? "#ffffff" : "rgba(8,6,28,0.7)",
            border: `1px solid ${L ? "#e2e8f0" : `${s.color}22`}`,
            borderRadius: 14, padding: 18, cursor: "pointer", transition: "all .2s",
            boxShadow: L ? "0 1px 6px rgba(0,0,0,0.06)" : "none",
          }}
            onMouseEnter={(e: any) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = L ? "#cbd5e1" : `${s.color}44`; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = L ? "#e2e8f0" : `${s.color}22`; }}
          >
            <div style={{ fontSize: 26, marginBottom: 9 }}>{s.emoji}</div>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 13, marginBottom: 5 }}>{s.name}</div>
            <div style={{ color: L ? "#64748b" : C.muted, fontSize: 11, marginBottom: 9, lineHeight: 1.5 }}>{s.desc}</div>
            <div style={{ color: L ? "#0d1b2e" : "#fff", fontWeight: 700, fontSize: 11, marginBottom: 11 }}>{s.price}</div>
            <WABtn name={s.name} label="Solicitar info" full style={{ borderRadius: 8, fontSize: 11, padding: "8px" }} />
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── Refiere & Gana ──────────────────────────────────────────── */
export const ReferieGanaSection = () => {
  const { theme } = useTheme();
  const L = theme === "light";
  return (
    <section>
      <div style={{
        borderRadius: 16, padding: "32px 28px", position: "relative", overflow: "hidden",
        background: L ? "linear-gradient(135deg,#f0f4ff,#fdf4ff)" : "linear-gradient(135deg,rgba(102,0,204,0.12),rgba(236,72,153,0.06))",
        border: `1px solid ${L ? "#e0d7ff" : `${C.neon2}22`}`,
        boxShadow: L ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(168,85,247,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(236,72,153,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>🎁</span>
              <Chip color={C.neon2}>PROGRAMA APPRECIO · EXCLUSIVO</Chip>
            </div>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.2rem,3vw,1.6rem)", marginBottom: 10, color: L ? "#0d1b2e" : "#fff" }}>
              Refiere amigos y{" "}
              <span style={{ background: "linear-gradient(90deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                gana premios reales
              </span>
            </h2>
            <p style={{ color: L ? "#475569" : C.muted, fontSize: 13, marginBottom: 18, lineHeight: 1.7, maxWidth: 460 }}>
              Comparte tu link, tus amigos comparan y contratan, y tú acumulas puntos para canjear por{" "}
              <strong style={{ color: L ? "#0d1b2e" : "#fff" }}>cashback, bonos Sodexo, productos tech</strong> y mucho más.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
              {[{ n: "1", t: "Comparte", d: "Tu link único" }, { n: "2", t: "Ellos comparan", d: "Y contratan" }, { n: "3", t: "Tú ganas", d: "Puntos y premios" }].map((s) => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{s.n}</div>
                  <div>
                    <div style={{ color: L ? "#0d1b2e" : "#fff", fontWeight: 700, fontSize: 12 }}>{s.t}</div>
                    <div style={{ color: L ? "#64748b" : C.muted, fontSize: 10 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="https://www.apprecio.com.co" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#a855f7,#ec4899)", color: "#fff", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                🚀 Inscribirme gratis <ExternalLink size={12} />
              </a>
              <WABtn name="programa Refiere y Gana" label="💬 Más información" style={{ borderRadius: 10, fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52 }}>🏆</div>
              <div style={{ color: C.neon2, fontWeight: 900, fontSize: 16 }}>Hasta</div>
              <div style={{ color: L ? "#0d1b2e" : "#fff", fontWeight: 900, fontSize: 24 }}>$200K</div>
              <div style={{ color: L ? "#64748b" : C.muted, fontSize: 11 }}>en premios</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Offers ──────────────────────────────────────────────────── */
export const Offers = ({ addToCart }: { addToCart: (item: any) => void }) => {
  const { theme } = useTheme();
  const L = theme === "light";
  const items = [
    { name: "Router WiFi 6 AX3000", price: 189900, old: 289900, emoji: "📡", badge: "-34%", color: C.neon },
    { name: "Repetidor Mesh Tenda",  price: 89900,  old: 129900, emoji: "📶", badge: "-31%", color: C.cyan },
    { name: "Cable Cat8 10m",        price: 29900,  old: 45900,  emoji: "🌐", badge: "-35%", color: C.green },
    { name: "Gaming Mouse 25K",      price: 149900, old: 249900, emoji: "🖱️", badge: "-40%", color: C.red },
    { name: "Auriculares ANC Pro",   price: 119900, old: 199900, emoji: "🎧", badge: "-40%", color: C.neon2 },
    { name: "Cargador 65W GaN",      price: 49900,  old: 79900,  emoji: "🔋", badge: "-37%", color: C.yellow },
  ];
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <Chip color={C.red}>🔥 OFERTAS ESPECIALES</Chip>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.5rem)", marginTop: 8, color: L ? "#0d1b2e" : "#fff" }}>Equipos y accesorios tech</h2>
        </div>
        <span style={{ color: C.red, fontSize: 11, fontWeight: 800, animation: "blink 2s infinite" }}>⚡ Solo hoy</span>
      </div>
      <div className="offers-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 11 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: L ? "#ffffff" : "rgba(8,6,28,0.7)",
            border: `1px solid ${L ? "#e2e8f0" : `${item.color}18`}`,
            borderRadius: 13, padding: "13px 11px", cursor: "pointer", transition: "all .2s", position: "relative",
            boxShadow: L ? "0 1px 4px rgba(0,0,0,0.05)" : "none",
          }}
            onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = L ? "#cbd5e1" : `${item.color}44`; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = L ? "#e2e8f0" : `${item.color}18`; e.currentTarget.style.transform = ""; }}
          >
            <div style={{ position: "absolute", top: 7, left: 7, background: C.red, color: "#fff", borderRadius: 6, padding: "2px 6px", fontSize: 9, fontWeight: 900 }}>{item.badge}</div>
            <div style={{ fontSize: 28, textAlign: "center", margin: "16px 0 9px" }}>{item.emoji}</div>
            <div style={{ color: L ? "#0d1b2e" : "#fff", fontWeight: 700, fontSize: 11, marginBottom: 4, textAlign: "center", lineHeight: 1.3 }}>{item.name}</div>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ color: item.color, fontWeight: 900, fontSize: 13 }}>${item.price.toLocaleString()}</span>
              <span style={{ color: L ? "#94a3b8" : C.muted, fontSize: 9, textDecoration: "line-through", marginLeft: 5 }}>${item.old.toLocaleString()}</span>
            </div>
            <button onClick={() => addToCart({ id: `offer-${i}`, name: item.name, price: item.price, emoji: item.emoji, color: item.color, qty: 1 })}
              style={{ width: "100%", background: `${item.color}12`, border: `1px solid ${item.color}28`, borderRadius: 7, padding: "6px 0", color: item.color, fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <ShoppingCart size={10} />Agregar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── ETB Social ──────────────────────────────────────────────── */
export const SocialSection = () => {
  const { theme } = useTheme();
  const L = theme === "light";
  return (
    <section>
      <div style={{
        borderRadius: 16, padding: "28px 26px",
        background: L ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "linear-gradient(135deg,rgba(16,185,129,0.06),rgba(5,150,105,0.03))",
        border: `1px solid ${L ? "#bbf7d0" : `${C.green}22`}`,
        boxShadow: L ? "0 2px 12px rgba(0,0,0,0.05)" : "none",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
              <Shield size={20} color={C.green} />
              <Chip color={C.green}>PROGRAMA SOCIAL ETB · GRATUITO</Chip>
            </div>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.4rem)", marginBottom: 7, color: L ? "#0d1b2e" : "#fff" }}>Conexión Social ETB</h2>
            <p style={{ color: L ? "#475569" : C.muted, marginBottom: 14, fontSize: 12, lineHeight: 1.6, maxWidth: 420 }}>
              Programa del Distrito de Bogotá para hogares de bajos recursos. Internet de alta velocidad{" "}
              <strong style={{ color: C.green }}>completamente gratuito</strong>. Estrato 1 y 2.
            </p>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              <input type="text" placeholder="Número de cédula" style={{
                background: L ? "#ffffff" : "rgba(255,255,255,0.05)",
                border: `1px solid ${L ? "#bbf7d0" : "rgba(16,185,129,0.25)"}`,
                borderRadius: 9, padding: "9px 13px",
                color: L ? "#0d1b2e" : "#fff", fontSize: 12, outline: "none", width: 175,
              }} />
              <GlowBtn onClick={() => window.open("https://sites.google.com/etb.com.co/portalcs", "_blank")} gradient="linear-gradient(135deg,#10b981,#059669)" glow={C.green} style={{ borderRadius: 9, padding: "9px 16px", fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Search size={12} />Consultar</span>
              </GlowBtn>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52 }}>🏠</div>
            <div style={{ color: C.green, fontWeight: 900, fontSize: 20, marginTop: 4 }}>$0<span style={{ fontSize: 11, color: L ? "#64748b" : C.muted, fontWeight: 600 }}>/mes</span></div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Blog ────────────────────────────────────────────────────── */
export const Blog = () => {
  const { theme } = useTheme();
  const L = theme === "light";
  const posts = [
    { e: "📡", t: "WiFi 6 vs WiFi 5: ¿Vale la pena?", tag: "Tecnología",  min: 4 },
    { e: "💡", t: "5 tips para mejorar tu señal",      tag: "Tips",        min: 3 },
    { e: "🔒", t: "Cómo proteger tu red doméstica",    tag: "Seguridad",   min: 5 },
    { e: "📱", t: "Mejores planes móviles 2025",       tag: "Comparativa", min: 6 },
  ];
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <BookOpen size={15} color={L ? "#1a56db" : C.neon} />
        <span style={{ color: L ? "#0d1b2e" : "#fff", fontWeight: 800, fontSize: 14 }}>Blog & Tips</span>
        <Chip color={L ? "#1a56db" : C.neon}>NEW</Chip>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 11 }}>
        {posts.map((p, i) => (
          <div key={i} style={{
            background: L ? "#ffffff" : "rgba(255,255,255,0.02)",
            border: `1px solid ${L ? "#e2e8f0" : C.borderSoft}`,
            borderRadius: 11, padding: "12px 13px", cursor: "pointer", transition: "all .15s",
            display: "flex", gap: 10, alignItems: "center",
            boxShadow: L ? "0 1px 4px rgba(0,0,0,0.05)" : "none",
          }}
            onMouseEnter={(e: any) => { e.currentTarget.style.background = L ? "#f8fafc" : "rgba(0,212,255,0.05)"; e.currentTarget.style.borderColor = L ? "#cbd5e1" : C.border; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.background = L ? "#ffffff" : "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = L ? "#e2e8f0" : C.borderSoft; }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{p.e}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: L ? "#0d1b2e" : "#fff", fontWeight: 700, fontSize: 12, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.t}</div>
              <div style={{ display: "flex", gap: 7 }}>
                <Chip color={L ? "#1a56db" : C.neon}>{p.tag}</Chip>
                <span style={{ color: L ? "#94a3b8" : C.muted, fontSize: 9, alignSelf: "center" }}>📖 {p.min} min</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── Sidebar ─────────────────────────────────────────────────── */
interface SidebarProps {
  onSearch:  () => void;
  onGame:    () => void;
  onMovil:   () => void;
  onSegment: () => void;
}
export const Sidebar = ({ onGame, onMovil, onSegment }: SidebarProps) => {
  const { theme } = useTheme();
  const L = theme === "light";

  const cardStyle = {
    background: L ? "#ffffff" : "rgba(255,255,255,0.02)",
    border: `1px solid ${L ? "#e2e8f0" : C.borderSoft}`,
    borderRadius: 11, padding: "12px",
    boxShadow: L ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
  };

  return (
    <aside className="side-col">
      {/* Accesos rápidos */}
      <div style={cardStyle}>
        <div style={{ color: L ? "#64748b" : "rgba(0,212,255,0.35)", fontSize: 9, fontWeight: 800, letterSpacing: 1.5, marginBottom: 9 }}>ACCESOS RÁPIDOS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { emoji: "📍", title: "Consulta Cobertura", desc: "Hogar o Móvil en tu zona",  color: L ? "#1a56db" : C.neon,   action: onSegment },
            { emoji: "📡", title: "Internet Hogar",     desc: "Fibra desde $59.900",        color: L ? "#00b8d4" : C.cyan,   action: onGame    },
            { emoji: "📱", title: "Planes Móviles",     desc: "Datos ilimitados",            color: L ? "#7c3aed" : C.neon2,  action: onMovil   },
            { emoji: "🏠", title: "Hogar Digital",      desc: "Diseña tu red ideal",         color: L ? "#f59e0b" : C.yellow, action: onGame    },
            { emoji: "⚡", title: "Ofertas Hot",         desc: "Promociones del día",         color: C.red,                    action: () => window.location.href = "/ofertas" },
            { emoji: "📋", title: "Ver catálogo",       desc: "Todos los planes",            color: L ? "#3ab54a" : C.green,  action: () => window.location.href = "/planes"  },
          ].map((item, i) => (
            <div key={i} onClick={item.action} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: L ? "#f8fafc" : "rgba(255,255,255,0.02)",
              border: `1px solid ${L ? "#e2e8f0" : C.borderSoft}`,
              borderRadius: 10, padding: "9px 11px", cursor: "pointer", transition: "all .15s",
            }}
              onMouseEnter={(e: any) => { e.currentTarget.style.background = `${item.color}08`; e.currentTarget.style.borderColor = `${item.color}30`; e.currentTarget.style.transform = "translateX(3px)"; }}
              onMouseLeave={(e: any) => { e.currentTarget.style.background = L ? "#f8fafc" : "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = L ? "#e2e8f0" : C.borderSoft; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${item.color}14`, border: `1px solid ${item.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{item.emoji}</div>
              <div>
                <div style={{ color: L ? "#0d1b2e" : "#fff", fontWeight: 700, fontSize: 12 }}>{item.title}</div>
                <div style={{ color: L ? "#64748b" : C.muted, fontSize: 10 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buscar planes */}
      <div style={cardStyle}>
        <div style={{ color: L ? "#64748b" : "rgba(0,212,255,0.35)", fontSize: 9, fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>BUSCAR PLANES</div>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: L ? "#94a3b8" : C.muted }} />
          <input type="text" placeholder="Buscar..." onClick={() => window.location.href = "/planes"} readOnly style={{
            width: "100%", background: L ? "#f8fafc" : "rgba(255,255,255,0.04)",
            border: `1px solid ${L ? "#e2e8f0" : C.borderSoft}`,
            borderRadius: 8, padding: "8px 10px 8px 30px",
            color: L ? "#0d1b2e" : "#fff", fontSize: 11, outline: "none", cursor: "pointer",
          }} />
        </div>
      </div>

      {/* Estadísticas */}
      <div style={cardStyle}>
        <div style={{ color: L ? "#64748b" : "rgba(0,212,255,0.35)", fontSize: 9, fontWeight: 800, letterSpacing: 1.5, marginBottom: 10 }}>ESTADÍSTICAS HOY</div>
        {[
          { label: "Operadores comparados", val: "+15",   color: L ? "#1a56db" : C.neon  },
          { label: "Usuarios beneficiados",  val: "1.5K+", color: L ? "#3ab54a" : C.green },
          { label: "Ahorro promedio (mes)",  val: "$38K",  color: L ? "#3ab54a" : C.green },
          { label: "Planes disponibles",     val: "+14K",  color: L ? "#1a56db" : C.neon  },
        ].map((s, i, arr) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < arr.length - 1 ? `1px solid ${L ? "#f1f5f9" : "rgba(255,255,255,0.04)"}` : "none" }}>
            <span style={{ color: L ? "#64748b" : C.muted, fontSize: 10 }}>{s.label}</span>
            <span style={{ color: s.color, fontWeight: 800, fontSize: 11 }}>{s.val}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

/* ── QuizFlow ────────────────────────────────────────────────── */
export const QuizFlow = ({ onBack }: { onBack: () => void }) => {
  const { theme } = useTheme();
  const L = theme === "light";
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: L ? "#0d1b2e" : "#fff" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
      <h2 style={{ fontWeight: 900, fontSize: "1.6rem", marginBottom: 12, background: "linear-gradient(90deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Comparador de Planes
      </h2>
      <p style={{ color: L ? "#64748b" : "rgba(180,195,230,0.6)", marginBottom: 24, fontSize: 14 }}>Próximamente: comparador inteligente con filtros avanzados.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <GlowBtn onClick={() => window.location.href = "/planes"} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{ padding: "11px 24px", borderRadius: 11 }}>
          Ver catálogo completo →
        </GlowBtn>
        <button onClick={onBack} style={{ padding: "11px 20px", borderRadius: 11, border: `1px solid ${L ? "#e2e8f0" : C.borderSoft}`, background: L ? "#ffffff" : "transparent", color: L ? "#475569" : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ← Volver
        </button>
      </div>
    </div>
  );
};
