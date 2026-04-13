"use client";
import { useState, useEffect, useRef } from "react";
import {
  Zap, Search, ShoppingCart,
  ChevronDown, ChevronRight, Menu, X,
} from "lucide-react";
import { C } from "@/lib/constants";
import { Chip } from "@/components/ui";
import { UserMenu } from "@/components/layout/UserMenu";

/* ── Mega menu data ──────────────────────────────────────────── */
const MENUS: Record<string, any> = {
  home: {
    label: "Home", icon: "🏠",
    sections: [
      { title: "Navegar", color: C.neon, items: [
        { ic: "🏠", t: "Inicio",          d: "Página principal" },
        { ic: "🔍", t: "Comparar Planes", d: "Busca y ahorra" },
        { ic: "⭐", t: "Más Populares",   d: "Top planes del mes" },
        { ic: "📊", t: "Ranking Operadores", d: "Mejor valorados" },
      ]},
      { title: "Herramientas", color: C.neon2, items: [
        { ic: "🏠", t: "Diseñar Hogar Digital", d: "Configura tu casa", action: "game" },
        { ic: "🧮", t: "Calculadora de Ahorro",  d: "Cuánto puedes ahorrar" },
        { ic: "📡", t: "Test de Velocidad",       d: "Mide tu conexión" },
        { ic: "🗺️", t: "Cobertura",               d: "Zonas disponibles" },
      ]},
    ],
  },
  ecosistema: {
    label: "Ecosistema", icon: "🌐",
    sections: [
      { title: "Servicio Técnico", color: C.yellow, items: [
        { ic: "🔧", t: "Reparación Dispositivos", d: "Laptops, PC, móviles" },
        { ic: "💻", t: "Laptops & PCs",           d: "Diagnóstico gratis" },
        { ic: "📱", t: "Smartphones",              d: "Pantallas, batería" },
        { ic: "📡", t: "Redes & WiFi",             d: "Instalación y config." },
      ]},
      { title: "Marketplace Tech", color: C.cyan, items: [
        { ic: "📶", t: "Equipos WiFi",   d: "Routers, mesh, extenders" },
        { ic: "🎮", t: "Gaming Gear",    d: "PCs, consolas, periféricos" },
        { ic: "🖥️", t: "Monitores",      d: "144Hz, 4K, ultrawide" },
        { ic: "🔋", t: "Accesorios Tech", d: "Cables, cargadores" },
      ]},
    ],
  },
  empresas: {
    label: "Empresas", icon: "🏢",
    sections: [
      { title: "Comunicaciones", color: C.neon, items: [
        { ic: "☎️", t: "PBX Virtual",         d: "Central en la nube" },
        { ic: "💬", t: "WhatsApp IA",          d: "Chatbots y automatización" },
        { ic: "🎙️", t: "VoIP Empresarial",     d: "Llamadas sobre IP" },
        { ic: "📞", t: "Contact Center",       d: "Multiagente y reportes" },
      ]},
      { title: "Conectividad B2B", color: C.neon2, items: [
        { ic: "🏢", t: "Fibra Dedicada",  d: "Exclusiva para tu negocio" },
        { ic: "☁️", t: "Cloud & SD-WAN",  d: "Redes privadas" },
        { ic: "🛡️", t: "Ciberseguridad",  d: "Protección 360°" },
        { ic: "📊", t: "Analítica BI",    d: "Dashboard ejecutivo" },
      ]},
    ],
  },
  refiere: {
    label: "Refiere & Gana", icon: "🎁", badge: "🎁", badgeColor: C.neon2,
    sections: [
      { title: "Premios", color: C.yellow, items: [
        { ic: "🎁", t: "Premios Tech",  d: "Gana productos" },
        { ic: "💰", t: "Cashback",      d: "Hasta $200.000" },
        { ic: "🎟️", t: "Bonos Sodexo", d: "Miles de canjes" },
        { ic: "⭐", t: "Puntos VIP",    d: "Acumula y canjea" },
      ]},
      { title: "Cómo Funciona", color: C.green, items: [
        { ic: "1️⃣", t: "Comparte tu link", d: "Invita amigos" },
        { ic: "2️⃣", t: "Ellos comparan",   d: "Encuentran su plan" },
        { ic: "3️⃣", t: "Contratan",        d: "Plan activo y verificado" },
        { ic: "4️⃣", t: "Tú Ganas",         d: "Premio automático" },
      ]},
    ],
  },
  ofertas: {
    label: "Ofertas", icon: "⚡", badge: "HOT", badgeColor: C.red,
    sections: [
      { title: "Planes", color: C.red, items: [
        { ic: "⚡", t: "Flash Deals",      d: "Solo hoy" },
        { ic: "🎁", t: "Combos Familia",   d: "Ahorra hasta 40%" },
        { ic: "📦", t: "Triple Play",      d: "Internet+TV+Móvil" },
        { ic: "🆕", t: "Nuevos Clientes",  d: "Bono bienvenida" },
      ]},
      { title: "Equipos", color: C.neon2, items: [
        { ic: "📡", t: "Routers WiFi 6",  d: "Desde $89.900" },
        { ic: "🎮", t: "Gaming Gear",     d: "Hasta 50% off" },
        { ic: "💻", t: "Laptops",         d: "Garantía 1 año" },
        { ic: "📱", t: "Smartphones",     d: "Planes desde $0" },
      ]},
    ],
  },
};

/* ── Mega panel ──────────────────────────────────────────────── */
const MegaPanel = ({ id, onClose, onAction }: { id: string; onClose: () => void; onAction: (a: string) => void }) => {
  const data = MENUS[id];
  if (!data) return null;
  return (
    <div
      onMouseLeave={onClose}
      style={{
        position: "absolute", top: "calc(100% + 2px)", left: "50%",
        transform: "translateX(-50%)", zIndex: 600,
        background: "rgba(6,4,20,0.98)", border: `1px solid ${C.border}`,
        borderRadius: 16, padding: 22, minWidth: 460, maxWidth: 520,
        boxShadow: "0 24px 80px rgba(0,0,0,0.85),0 0 0 1px rgba(0,212,255,0.06)",
        backdropFilter: "blur(32px)", animation: "megaIn .18s ease-out",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {data.sections.map((sec: any, si: number) => (
          <div key={si}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <div style={{ width: 3, height: 12, background: sec.color, borderRadius: 99 }} />
              <span style={{ color: sec.color, fontSize: 9, fontWeight: 800, letterSpacing: 1.5 }}>
                {sec.title.toUpperCase()}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sec.items.map((it: any, ii: number) => (
                <div
                  key={ii}
                  onClick={() => { if (it.action) onAction(it.action); onClose(); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "8px 10px", borderRadius: 10, cursor: "pointer",
                    border: "1px solid transparent", transition: "all .14s",
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.background    = `${sec.color}0c`;
                    e.currentTarget.style.borderColor   = `${sec.color}22`;
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.background  = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `${sec.color}14`, border: `1px solid ${sec.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, flexShrink: 0,
                  }}>{it.ic}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#e8eaf6", fontWeight: 700, fontSize: 12 }}>{it.t}</div>
                    <div style={{ color: C.muted, fontSize: 10, marginTop: 1 }}>{it.d}</div>
                  </div>
                  <ChevronRight size={10} color={C.muted} style={{ opacity: .4, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Mobile menu ─────────────────────────────────────────────── */
const MobileMenu = ({ open, onClose, onAction }: { open: boolean; onClose: () => void; onAction: (a: string) => void }) => {
  const sections = [
    { label: "Comparar Planes",      icon: "🔍", action: "quiz" },
    { label: "Diseñar Hogar Digital", icon: "🏠", action: "game" },
    { label: "Ver catálogo",          icon: "📋", href: "/planes" },
    { label: "Empresas",             icon: "🏢" },
    { label: "Refiere & Gana",       icon: "🎁" },
    { label: "Ofertas",              icon: "⚡" },
  ];
  return (
    <div className={`mobile-nav-overlay${open ? " open" : ""}`}>
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 18, right: 18,
          background: "rgba(255,255,255,0.06)", border: "none",
          borderRadius: "50%", width: 36, height: 36, cursor: "pointer",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={16} />
      </button>
      {sections.map((s, i) => (
        <button
          key={i}
          onClick={() => {
            if (s.action) onAction(s.action);
            if (s.href) window.location.href = s.href;
            onClose();
          }}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 16px", borderRadius: 12,
            background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borderSoft}`,
            color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
            textAlign: "left", transition: "all .15s",
          }}
          onMouseEnter={(e: any) => e.currentTarget.style.background = "rgba(0,212,255,0.08)"}
          onMouseLeave={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
        >
          <span style={{ fontSize: 20 }}>{s.icon}</span>
          {s.label}
        </button>
      ))}
    </div>
  );
};

/* ── Header ──────────────────────────────────────────────────── */
interface HeaderProps {
  onSearch:    () => void;
  onOpenAuth:  (mode: string) => void;
  cartCount:   number;
  onCart:      () => void;
  onAction:    (a: string) => void;
}

export const Header = ({ onSearch, onOpenAuth, cartCount, onCart, onAction }: HeaderProps) => {
  const [active,   setActive]   = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const enter = (id: string) => { if (timerRef.current) clearTimeout(timerRef.current); setActive(id); };
  const leave = () => { timerRef.current = setTimeout(() => setActive(null), 160); };

  return (
    <>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} onAction={(a) => { onAction(a); setMobileOpen(false); }} />

      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500 }}>
        {/* Top bar — desktop only */}
        <div
          className="desktop-topbar"
          style={{
            background: "linear-gradient(90deg,#0a0060,#1a0080,#0a0060)",
            borderBottom: "1px solid rgba(0,212,255,0.12)",
            padding: "5px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            {[["📞", "+57 305 787 6992"], ["📍", "Bogotá, Colombia"], ["🕐", "Atención 24/7"]].map(([ic, t]) => (
              <span key={t} style={{ color: "rgba(180,200,255,0.6)", fontSize: 10.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                {ic} {t}
              </span>
            ))}
          </div>
          <span style={{ background: "linear-gradient(90deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 11, fontWeight: 800 }}>
            ⚡ ¡Ahorra hasta 40% hoy! Comparamos +15 operadores
          </span>
        </div>

        {/* Main nav */}
        <div style={{
          background:   scrolled ? "rgba(4,4,15,0.97)" : "rgba(4,4,15,0.92)",
          backdropFilter: "blur(28px)",
          borderBottom: `1px solid ${scrolled ? "rgba(0,212,255,0.18)" : C.borderSoft}`,
          boxShadow:    scrolled ? "0 8px 40px rgba(0,0,0,0.6)" : "none",
          transition:   "all .3s",
        }}>
          <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 22px", height: 62, display: "flex", alignItems: "center", gap: 0 }}>

            {/* Logo */}
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0, marginRight: 28, padding: "8px 0" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: "linear-gradient(135deg,#00d4ff,#0080ff)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 20px #00d4ff55,0 0 40px #00d4ff22",
                }}>
                  <Zap size={20} color="#fff" strokeWidth={2.5} />
                </div>
                <div style={{
                  position: "absolute", top: -2, right: -2,
                  width: 10, height: 10, background: "#ff6b35",
                  borderRadius: "50%", border: "2px solid #04040f",
                  animation: "pulse 2s infinite",
                }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 900, fontSize: 17, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1 }}>Compara</span>
                  <span style={{ fontWeight: 900, fontSize: 17, background: "linear-gradient(90deg,#00d4ff,#0080ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.5px", lineHeight: 1 }}>Tu</span>
                  <span style={{ fontWeight: 900, fontSize: 17, color: "#ff6b35", letterSpacing: "-0.5px", lineHeight: 1 }}>Plan</span>
                  <span style={{ fontWeight: 700, fontSize: 12, color: "rgba(0,212,255,0.6)", letterSpacing: "-0.3px", lineHeight: 1 }}>.com</span>
                </div>
                <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: 1.8, color: "rgba(0,212,255,0.4)", marginTop: 2 }}>COLOMBIA · TELCO #1</div>
              </div>
            </a>

            {/* Desktop nav */}
            <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
              {Object.entries(MENUS).map(([id, m]) => (
                <div key={id} style={{ position: "relative", flexShrink: 0 }} onMouseEnter={() => enter(id)} onMouseLeave={leave}>
                  <button style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "8px 11px",
                    borderRadius: 9, background: active === id ? "rgba(0,212,255,0.08)" : "transparent",
                    border: `1px solid ${active === id ? "rgba(0,212,255,0.2)" : "transparent"}`,
                    color: active === id ? "#fff" : "rgba(180,195,230,0.7)",
                    fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                    transition: "all .15s", fontFamily: "inherit",
                    boxShadow: active === id ? "0 0 12px rgba(0,212,255,0.12)" : "none",
                  }}>
                    <span style={{ fontSize: 13 }}>{m.icon}</span>
                    <span>{m.label}</span>
                    {m.badge && <Chip color={m.badgeColor}>{m.badge}</Chip>}
                    <ChevronDown size={11} style={{ transition: "transform .2s", transform: active === id ? "rotate(180deg)" : "rotate(0)", opacity: .5 }} />
                  </button>
                  {active === id && (
                    <MegaPanel id={id} onClose={() => setActive(null)} onAction={(a) => { onAction(a); setActive(null); }} />
                  )}
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 12 }}>
              <button onClick={onSearch} title="Buscar (⌘K)" style={{
                width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.04)",
                border: `1px solid ${C.borderSoft}`, color: "rgba(180,195,230,0.6)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s",
              }}
                onMouseEnter={(e: any) => { e.currentTarget.style.background = "rgba(0,212,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(180,195,230,0.6)"; }}
              ><Search size={15} /></button>

              <button onClick={onCart} style={{
                position: "relative", width: 36, height: 36, borderRadius: 9,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSoft}`,
                color: "rgba(180,195,230,0.6)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s",
              }}
                onMouseEnter={(e: any) => { e.currentTarget.style.background = "rgba(0,212,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(180,195,230,0.6)"; }}
              >
                <ShoppingCart size={15} />
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4, width: 16, height: 16,
                    borderRadius: "50%", background: C.red, color: "#fff",
                    fontSize: 8, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #04040f",
                  }}>{cartCount}</span>
                )}
              </button>

              {/* UserMenu (handles logged in + logged out state) */}
              <UserMenu onOpenAuth={onOpenAuth} />

              {/* Hamburger — mobile */}
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(true)}
                style={{
                  display: "none", width: 36, height: 36, borderRadius: 9,
                  background: "rgba(255,255,255,0.06)", border: `1px solid ${C.borderSoft}`,
                  color: "#fff", cursor: "pointer", alignItems: "center", justifyContent: "center",
                }}
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
