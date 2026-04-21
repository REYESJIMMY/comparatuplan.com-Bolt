"use client";
import { useState } from "react";
import { Check, Search, Zap, Shield, BookOpen, ShoppingCart, ArrowRight, MapPin } from "lucide-react";
import { C, openWA } from "@/lib/constants";
import { GlowBtn, WABtn, Card, Chip, Particles } from "@/components/ui";

/* ── Hero ────────────────────────────────────────────────────── */
interface HeroProps {
  onGame:    () => void;
  onMovil:   () => void;
  onSegment: () => void;
  addToCart: (item: any) => void;
}

export const Hero = ({ onGame, onMovil, onSegment }: HeroProps) => {
  const [mayor, setMayor] = useState(false);
  const [habea, setHabea] = useState(false);
  const ready = mayor && habea;

  return (
    <section style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, background: "rgba(6,4,22,0.7)", padding: "clamp(28px,5vw,48px) clamp(16px,4vw,32px) 40px", minHeight: 330 }}>
      <Particles count={30} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(0,212,255,0.08)", border: `1px solid ${C.border}`, borderRadius: 99, padding: "5px 14px", marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block", animation: "blink 1.5s infinite" }} />
          <span style={{ color: C.neon, fontSize: 11, fontWeight: 700 }}>+1.500 usuarios ahorran cada mes</span>
        </div>

        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.7rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 12, color: "#fff", letterSpacing: -1 }}>
          Compara y desbloquea el<br />
          <span style={{ background: "linear-gradient(90deg,#00d4ff,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            máximo potencial de tu red
          </span>
        </h1>
        <p style={{ fontSize: 14, color: "rgba(180,195,230,0.75)", marginBottom: 22, maxWidth: 460, lineHeight: 1.65 }}>
          Ahorra hasta un <strong style={{ color: "#fff" }}>40% en tu factura</strong>. Análisis inteligente de planes en segundos.
        </p>

        {/* Autorización de datos */}
        <div style={{ background: "rgba(0,212,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 15px", marginBottom: 20, maxWidth: 420 }}>
          <div style={{ color: "rgba(0,212,255,0.3)", fontSize: 9, fontWeight: 800, letterSpacing: 1, marginBottom: 9 }}>AUTORIZACIÓN DE DATOS</div>

          <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", marginBottom: 7 }}>
            <div
              onClick={() => setMayor(!mayor)}
              style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${mayor ? C.neon : "rgba(255,255,255,0.15)"}`, background: mayor ? C.neon : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0, cursor: "pointer" }}
            >
              {mayor && <Check size={8} color="#04040f" strokeWidth={3} />}
            </div>
            <span style={{ color: "rgba(180,190,220,0.65)", fontSize: 11, fontWeight: 600 }}>Soy mayor de edad (18+)</span>
          </label>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer" }}>
            <div
              onClick={() => setHabea(!habea)}
              style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${habea ? C.neon : "rgba(255,255,255,0.15)"}`, background: habea ? C.neon : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0, cursor: "pointer", marginTop: 1 }}
            >
              {habea && <Check size={8} color="#04040f" strokeWidth={3} />}
            </div>
            <span style={{ color: "rgba(180,190,220,0.65)", fontSize: 11, fontWeight: 600, lineHeight: 1.5 }}>
              Acepto la{" "}
              <a
                href="/politica-de-datos"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: C.neon, textDecoration: "underline" }}
              >
                Política de Tratamiento de Datos Personales
              </a>{" "}
              conforme a la Ley 1581 de 2012
            </span>
          </label>
        </div>

        {/* CTA buttons */}
        <div className="hero-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <GlowBtn
              onClick={onSegment}
              disabled={!ready}
              gradient="linear-gradient(135deg,#0070cc,#0050aa)"
              glow={C.neon}
              style={{ borderRadius: 11, padding: "11px 24px", fontSize: 14 }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <MapPin size={14} />Consulta tu Cobertura<ArrowRight size={12} />
              </span>
            </GlowBtn>
            <div style={{ marginTop: 5, color: C.green, fontSize: 10, fontWeight: 700, textAlign: "center" }}>
              🏠 Hogar · 📱 Móvil
            </div>
          </div>

          <div>
            <GlowBtn
              onClick={onGame}
              disabled={!ready}
              gradient="linear-gradient(135deg,#6600cc,#a855f7)"
              glow={C.neon2}
              style={{ borderRadius: 11, padding: "11px 22px", fontSize: 14 }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Zap size={14} />Diseñar Hogar Digital
              </span>
            </GlowBtn>
            <div style={{ marginTop: 5, color: C.neon2, fontSize: 10, fontWeight: 700, textAlign: "center" }}>🏠 Misión 3D</div>
          </div>

          <WABtn name="asesoría personalizada" label="Asesor WhatsApp" style={{ borderRadius: 11, padding: "11px 18px", fontSize: 14 }} />
        </div>
      </div>
    </section>
  );
};

/* ── Featured plans ──────────────────────────────────────────── */
const FEATURED = [
  { op: "Claro",    name: "Fibra 200 Mbps",  price: 89900,  speed: 200, benefits: ["HBO Max 3m", "WiFi 6", "Inst. gratis"],            glow: "#e2001a", emoji: "🔴" },
  { op: "Movistar", name: "Móvil 20GB Pro",  price: 45900,  benefits: ["20GB 4G", "Roaming LatAm", "Sin permanencia"],                 glow: "#00aa44", emoji: "🟢", badge: "MEJOR PRECIO" },
  { op: "Tigo",     name: "Internet+TV 300", price: 125900, speed: 300, benefits: ["140 Canales HD", "IP Fija", "Cloud DVR"],          glow: "#00a0e3", emoji: "🔵", badge: "TODO EN UNO" },
  { op: "ETB",      name: "Fibra ETB 100",   price: 69900,  speed: 100, benefits: ["Sin permanencia", "WiFi incluido", "Soporte 24/7"], glow: "#f59e0b", emoji: "🟡", badge: "SIN PERMANENCIA" },
];
export const FeaturedPlans = ({ onSegment, addToCart }: { onSegment?: () => void; addToCart: (item: any) => void }) => (
  <section>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div>
        <Chip color={C.neon2}>PLANES DESTACADOS</Chip>
        <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.5rem)", marginTop: 8, color: "#fff" }}>Los mejores del mercado</h2>
      </div>
      {onSegment && (
        <GlowBtn onClick={onSegment} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{ padding: "7px 14px", fontSize: 11, borderRadius: 9 }}>Ver todos →</GlowBtn>
      )}
    </div>
    <div className="plan-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 }}>
      {FEATURED.map((p, i) => (
        <Card key={i} glow={p.glow} style={{ padding: 18, position: "relative", cursor: "default" }}
          onMouseEnter={(e: any) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${p.glow}18`; }}
          onMouseLeave={(e: any) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 0 24px ${p.glow}12`; }}
        >
          {(p as any).badge && <div style={{ position: "absolute", top: 0, right: 12, background: `linear-gradient(135deg,${p.glow},${p.glow}99)`, color: "#fff", fontSize: 8, fontWeight: 900, padding: "3px 9px", borderRadius: "0 0 7px 7px" }}>{(p as any).badge}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
            <span style={{ fontSize: 14 }}>{p.emoji}</span>
            <span style={{ color: p.glow, fontWeight: 800, fontSize: 11 }}>{p.op}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 7, color: "#fff" }}>{p.name}</div>
          <div style={{ fontWeight: 900, fontSize: 22, color: p.glow, marginBottom: 8 }}>
            {p.price === 0 ? "GRATIS" : `$${p.price.toLocaleString()}`}
            <span style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>/mes</span>
          </div>
          {(p as any).speed && <div style={{ color: C.muted, fontSize: 10, marginBottom: 7 }}>⚡ {(p as any).speed} Mbps</div>}
          {p.benefits.map((b) => (
            <div key={b} style={{ display: "flex", gap: 5, marginBottom: 3 }}>
              <Check size={9} color={p.glow} />
              <span style={{ color: C.muted, fontSize: 10 }}>{b}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 11 }}>
            <button
              onClick={() => addToCart({ id: `plan-${i}`, name: `${p.op} ${p.name}`, price: p.price, emoji: p.emoji, color: p.glow, qty: 1 })}
              style={{ flex: 1, background: `${p.glow}12`, border: `1px solid ${p.glow}28`, borderRadius: 8, padding: "7px 0", color: p.glow, fontWeight: 700, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            >
              <ShoppingCart size={11} />Agregar
            </button>
            <WABtn name={`${p.op} ${p.name}`} label="Contratar" style={{ flex: 1, borderRadius: 8, padding: "7px 0", fontSize: 11 }} />
          </div>
        </Card>
      ))}
    </div>
  </section>
);

/* ── Companies ───────────────────────────────────────────────── */
export const Companies = () => (
  <section>
    <Chip color={C.cyan}>SOLUCIONES EMPRESARIALES</Chip>
    <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.5rem)", margin: "8px 0 14px", color: "#fff" }}>Comunicaciones para tu negocio</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
      {[
        { emoji: "☎️", name: "PBX Virtual",     desc: "Central telefónica en la nube sin hardware.",  price: "Desde $89.900/mes",  color: C.neon },
        { emoji: "💬", name: "WhatsApp IA",      desc: "Chatbots inteligentes y automatización 24/7.", price: "Desde $149.900/mes", color: C.green },
        { emoji: "🎙️", name: "VoIP Empresarial", desc: "Llamadas IP con alta calidad y bajo costo.",  price: "Desde $59.900/mes",  color: C.cyan },
      ].map((s, i) => (
        <Card key={i} glow={s.color} style={{ padding: 18, cursor: "pointer" }}
          onMouseEnter={(e: any) => e.currentTarget.style.transform = "translateY(-3px)"}
          onMouseLeave={(e: any) => e.currentTarget.style.transform = ""}
        >
          <div style={{ fontSize: 26, marginBottom: 9 }}>{s.emoji}</div>
          <div style={{ color: s.color, fontWeight: 800, fontSize: 13, marginBottom: 5 }}>{s.name}</div>
          <div style={{ color: C.muted, fontSize: 11, marginBottom: 9, lineHeight: 1.5 }}>{s.desc}</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 11, marginBottom: 11 }}>{s.price}</div>
          <WABtn name={s.name} label="Solicitar info" full style={{ borderRadius: 8, fontSize: 11, padding: "8px" }} />
        </Card>
      ))}
    </div>
  </section>
);

/* ── Offers ──────────────────────────────────────────────────── */
export const Offers = ({ addToCart }: { addToCart: (item: any) => void }) => {
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
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.5rem)", marginTop: 8, color: "#fff" }}>Equipos y accesorios tech</h2>
        </div>
        <span style={{ color: C.red, fontSize: 11, fontWeight: 800, animation: "blink 2s infinite" }}>⚡ Solo hoy</span>
      </div>
      <div className="offers-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 11 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{ background: "rgba(8,6,28,0.7)", border: `1px solid ${item.color}18`, borderRadius: 13, padding: "13px 11px", cursor: "pointer", transition: "all .2s", position: "relative" }}
            onMouseEnter={(e: any) => { e.currentTarget.style.border = `1px solid ${item.color}44`; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.border = `1px solid ${item.color}18`; e.currentTarget.style.transform = ""; }}
          >
            <div style={{ position: "absolute", top: 7, left: 7, background: C.red, color: "#fff", borderRadius: 6, padding: "2px 6px", fontSize: 9, fontWeight: 900 }}>{item.badge}</div>
            <div style={{ fontSize: 28, textAlign: "center", margin: "16px 0 9px" }}>{item.emoji}</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 11, marginBottom: 4, textAlign: "center", lineHeight: 1.3 }}>{item.name}</div>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ color: item.color, fontWeight: 900, fontSize: 13 }}>${item.price.toLocaleString()}</span>
              <span style={{ color: C.muted, fontSize: 9, textDecoration: "line-through", marginLeft: 5 }}>${item.old.toLocaleString()}</span>
            </div>
            <button
              onClick={() => addToCart({ id: `offer-${i}`, name: item.name, price: item.price, emoji: item.emoji, color: item.color, qty: 1 })}
              style={{ width: "100%", background: `${item.color}12`, border: `1px solid ${item.color}28`, borderRadius: 7, padding: "6px 0", color: item.color, fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            >
              <ShoppingCart size={10} />Agregar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── ETB Social ──────────────────────────────────────────────── */
export const SocialSection = () => (
  <section>
    <Card glow={C.green} style={{ padding: "28px 26px", background: "linear-gradient(135deg,rgba(16,185,129,0.06),rgba(5,150,105,0.03))" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
            <Shield size={20} color={C.green} />
            <Chip color={C.green}>PROGRAMA SOCIAL ETB · GRATUITO</Chip>
          </div>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.4rem)", marginBottom: 7, color: "#fff" }}>Conexión Social ETB</h2>
          <p style={{ color: C.muted, marginBottom: 14, fontSize: 12, lineHeight: 1.6, maxWidth: 420 }}>
            Programa del Distrito de Bogotá para hogares de bajos recursos. Internet de alta velocidad{" "}
            <strong style={{ color: C.green }}>completamente gratuito</strong>. Estrato 1 y 2.
          </p>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <input type="text" placeholder="Número de cédula" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(16,185,129,0.25)`, borderRadius: 9, padding: "9px 13px", color: "#fff", fontSize: 12, outline: "none", width: 175 }} />
            <GlowBtn onClick={() => window.open("https://sites.google.com/etb.com.co/portalcs", "_blank")} gradient="linear-gradient(135deg,#10b981,#059669)" glow={C.green} style={{ borderRadius: 9, padding: "9px 16px", fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Search size={12} />Consultar</span>
            </GlowBtn>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52 }}>🏠</div>
          <div style={{ color: C.green, fontWeight: 900, fontSize: 20, marginTop: 4 }}>$0<span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>/mes</span></div>
        </div>
      </div>
    </Card>
  </section>
);

/* ── Blog ────────────────────────────────────────────────────── */
export const Blog = () => {
  const posts = [
    { e: "📡", t: "WiFi 6 vs WiFi 5: ¿Vale la pena?", tag: "Tecnología",  min: 4 },
    { e: "💡", t: "5 tips para mejorar tu señal",      tag: "Tips",        min: 3 },
    { e: "🔒", t: "Cómo proteger tu red doméstica",    tag: "Seguridad",   min: 5 },
    { e: "📱", t: "Mejores planes móviles 2025",       tag: "Comparativa", min: 6 },
  ];
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <BookOpen size={15} color={C.neon} />
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Blog & Tips</span>
        <Chip color={C.neon}>NEW</Chip>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 11 }}>
        {posts.map((p, i) => (
          <div
            key={i}
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.borderSoft}`, borderRadius: 11, padding: "12px 13px", cursor: "pointer", transition: "all .15s", display: "flex", gap: 10, alignItems: "center" }}
            onMouseEnter={(e: any) => { e.currentTarget.style.background = "rgba(0,212,255,0.05)"; e.currentTarget.style.borderColor = C.border; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = C.borderSoft; }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{p.e}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 12, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.t}</div>
              <div style={{ display: "flex", gap: 7 }}>
                <Chip color={C.neon}>{p.tag}</Chip>
                <span style={{ color: C.muted, fontSize: 9, alignSelf: "center" }}>📖 {p.min} min</span>
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
export const Sidebar = ({ onSearch, onGame, onMovil, onSegment }: SidebarProps) => (
  <aside className="side-col">
    <div>
      <div style={{ color: "rgba(0,212,255,0.35)", fontSize: 9, fontWeight: 800, letterSpacing: 1.5, marginBottom: 9 }}>ACCESOS RÁPIDOS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { emoji: "📡", title: "Internet Hogar",  desc: "Fibra desde $59.900",  color: C.neon,   action: onGame    },
          { emoji: "📱", title: "Planes Móviles",  desc: "Datos ilimitados",      color: C.neon2,  action: onMovil   },
          { emoji: "📺", title: "TV + Streaming",  desc: "Combos desde $89.900", color: C.cyan,   action: onSegment },
          { emoji: "🏠", title: "Hogar Digital",   desc: "Diseña tu red ideal",   color: C.yellow, action: onGame    },
        ].map((item, i) => (
          <div
            key={i}
            onClick={item.action}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.borderSoft}`, borderRadius: 11, padding: "10px 12px", cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={(e: any) => { e.currentTarget.style.background = `${item.color}08`; e.currentTarget.style.borderColor = `${item.color}28`; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = C.borderSoft; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${item.color}12`, border: `1px solid ${item.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.emoji}</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{item.title}</div>
              <div style={{ color: C.muted, fontSize: 10 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ background: "rgba(8,6,28,0.7)", border: `1px solid ${C.borderSoft}`, borderRadius: 13, padding: "13px 13px" }}>
      <div style={{ color: "rgba(0,212,255,0.3)", fontSize: 9, fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>BUSCAR PLANES</div>
      <div
        onClick={onSearch}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borderSoft}`, borderRadius: 9, padding: "8px 11px", cursor: "pointer" }}
        onMouseEnter={(e: any) => e.currentTarget.style.borderColor = C.border}
        onMouseLeave={(e: any) => e.currentTarget.style.borderColor = C.borderSoft}
      >
        <Search size={12} color={C.muted} />
        <span style={{ color: "rgba(180,190,220,0.3)", fontSize: 11 }}>Buscar…</span>
        <kbd style={{ marginLeft: "auto", color: C.muted, fontSize: 9, border: `1px solid ${C.borderSoft}`, borderRadius: 4, padding: "1px 5px" }}>⌘K</kbd>
      </div>
    </div>

    <div style={{ background: "rgba(8,6,28,0.7)", border: `1px solid ${C.borderSoft}`, borderRadius: 13, padding: "13px 13px" }}>
      <div style={{ color: "rgba(0,212,255,0.3)", fontSize: 9, fontWeight: 800, letterSpacing: 1.5, marginBottom: 11 }}>ESTADÍSTICAS HOY</div>
      {[
        { l: "Operadores comparados", v: "+15",   c: C.neon },
        { l: "Usuarios beneficiados",  v: "1.5K+", c: C.green },
        { l: "Ahorro promedio/mes",    v: "$38K",  c: C.yellow },
        { l: "Planes disponibles",     v: "+14K",  c: C.neon2 },
      ].map((s, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
          <span style={{ color: C.muted, fontSize: 10.5 }}>{s.l}</span>
          <span style={{ color: s.c, fontWeight: 900, fontSize: 13 }}>{s.v}</span>
        </div>
      ))}
    </div>

    <div style={{ background: "linear-gradient(135deg,rgba(102,0,204,0.15),rgba(236,72,153,0.1))", border: `1px solid rgba(168,85,247,0.25)`, borderRadius: 13, padding: "15px 13px", textAlign: "center" }}>
      <div style={{ fontSize: 30, marginBottom: 7 }}>🎁</div>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 12, marginBottom: 4 }}>Refiere & Gana</div>
      <div style={{ color: C.muted, fontSize: 10, marginBottom: 11, lineHeight: 1.5 }}>Premios · Cashback<br />Bonos Sodexo y más</div>
      <WABtn name="programa Refiere y Gana" label="Inscribirte Gratis" full style={{ borderRadius: 9, fontSize: 11, padding: "8px 12px" }} />
    </div>

    <div style={{ background: "linear-gradient(135deg,rgba(0,80,170,0.15),rgba(0,212,255,0.08))", border: `1px solid ${C.border}`, borderRadius: 13, padding: "15px 13px", textAlign: "center" }}>
      <div style={{ fontSize: 30, marginBottom: 7 }}>🏠</div>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 12, marginBottom: 4 }}>Diseñar Hogar Digital</div>
      <div style={{ color: C.muted, fontSize: 10, marginBottom: 11, lineHeight: 1.5 }}>Conecta tus dispositivos<br />y encuentra tu plan ideal</div>
      <GlowBtn onClick={onGame} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{ width: "100%", borderRadius: 9, fontSize: 11, padding: "8px 12px" }}>🚀 Iniciar Misión</GlowBtn>
    </div>
  </aside>
);

/* ── QuizFlow placeholder ────────────────────────────────────── */
export const QuizFlow = ({ onBack }: { onBack: () => void }) => (
  <div style={{ textAlign: "center", padding: "60px 20px", color: "#fff" }}>
    <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
    <h2 style={{ fontWeight: 900, fontSize: "1.6rem", marginBottom: 12, background: "linear-gradient(90deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
      Comparador de Planes
    </h2>
    <p style={{ color: "rgba(180,195,230,0.6)", marginBottom: 24, fontSize: 14 }}>
      Próximamente: comparador inteligente con filtros avanzados.
    </p>
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      <GlowBtn onClick={() => window.location.href = "/planes"} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{ padding: "11px 24px", borderRadius: 11 }}>
        Ver catálogo completo →
      </GlowBtn>
      <button onClick={onBack} style={{ padding: "11px 20px", borderRadius: 11, border: `1px solid ${C.borderSoft}`, background: "transparent", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        ← Volver
      </button>
    </div>
  </div>
);
