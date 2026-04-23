"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search, ShoppingCart,
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
        { ic: "🏠", t: "Inicio",             d: "Página principal",        href: "/" },
        { ic: "🔍", t: "Consulta Cobertura", d: "Busca planes en tu zona", action: "cobertura" },
        { ic: "⭐", t: "Más Populares",      d: "Top planes del mes",      href: "/planes?tipo=internet" },
        { ic: "📊", t: "Todos los planes",   d: "Catálogo completo",       href: "/planes" },
      ]},
      { title: "Herramientas", color: C.neon2, items: [
        { ic: "🏠", t: "Diseñar Hogar Digital", d: "Configura tu casa",      action: "game" },
        { ic: "📱", t: "Planes Móviles",         d: "Compara planes móvil",  action: "movil" },
        { ic: "📡", t: "Internet Hogar",         d: "Planes de fibra",       href: "/planes?tipo=internet" },
        { ic: "📺", t: "TV + Paquetes",          d: "Combos disponibles",    href: "/planes?tipo=paquete" },
      ]},
    ],
  },
  ecosistema: {
    label: "Ecosistema", icon: "🌐",
    sections: [
      { title: "Servicio Técnico", color: C.yellow, items: [
        { ic: "🔧", t: "Reparación Dispositivos", d: "Laptops, PC, móviles",   href: "https://wa.me/573057876992?text=Hola, necesito servicio técnico", external: true },
        { ic: "💻", t: "Laptops & PCs",           d: "Diagnóstico gratis",     href: "https://wa.me/573057876992?text=Hola, necesito revisar mi laptop", external: true },
        { ic: "📱", t: "Smartphones",              d: "Pantallas, batería",     href: "https://wa.me/573057876992?text=Hola, necesito reparar mi smartphone", external: true },
        { ic: "📡", t: "Redes & WiFi",             d: "Instalación y config.", href: "https://wa.me/573057876992?text=Hola, necesito instalación de red WiFi", external: true },
      ]},
      { title: "Marketplace Tech", color: C.cyan, items: [
        { ic: "📶", t: "Equipos WiFi",    d: "Routers, mesh, extenders", href: "/planes" },
        { ic: "🎮", t: "Gaming Gear",     d: "PCs, consolas",            href: "/planes" },
        { ic: "🖥️", t: "Monitores",       d: "144Hz, 4K, ultrawide",     href: "/planes" },
        { ic: "🔋", t: "Accesorios Tech", d: "Cables, cargadores",       href: "/planes" },
      ]},
    ],
  },
  empresas: {
    label: "Empresas", icon: "🏢",
    sections: [
      { title: "Comunicaciones", color: C.neon, items: [
        { ic: "☎️", t: "PBX Virtual",     d: "Central en la nube",       href: "https://wa.me/573057876992?text=Hola, me interesa PBX Virtual para mi empresa", external: true },
        { ic: "💬", t: "WhatsApp IA",     d: "Chatbots y automatización", href: "https://wa.me/573057876992?text=Hola, me interesa WhatsApp IA", external: true },
        { ic: "🎙️", t: "VoIP Empresarial", d: "Llamadas sobre IP",       href: "https://wa.me/573057876992?text=Hola, me interesa VoIP empresarial", external: true },
        { ic: "📞", t: "Contact Center",  d: "Multiagente y reportes",   href: "https://wa.me/573057876992?text=Hola, me interesa Contact Center", external: true },
      ]},
      { title: "Conectividad B2B", color: C.neon2, items: [
        { ic: "🏢", t: "Fibra Dedicada", d: "Exclusiva para tu negocio", href: "https://wa.me/573057876992?text=Hola, me interesa Fibra Dedicada empresarial", external: true },
        { ic: "☁️", t: "Cloud & SD-WAN", d: "Redes privadas",            href: "https://wa.me/573057876992?text=Hola, me interesa Cloud y SD-WAN", external: true },
        { ic: "🛡️", t: "Ciberseguridad", d: "Protección 360°",           href: "https://wa.me/573057876992?text=Hola, me interesa ciberseguridad empresarial", external: true },
        { ic: "📊", t: "Analítica BI",   d: "Dashboard ejecutivo",       href: "https://wa.me/573057876992?text=Hola, me interesa Analítica BI", external: true },
      ]},
    ],
  },
  refiere: {
    label: "Refiere & Gana", icon: "🎁", badge: "🎁", badgeColor: C.neon2,
    sections: [
      { title: "Premios", color: C.yellow, items: [
        { ic: "🎁", t: "Premios Tech",  d: "Gana productos",   href: "https://www.apprecio.com.co", external: true },
        { ic: "💰", t: "Cashback",      d: "Hasta $200.000",   href: "https://www.apprecio.com.co", external: true },
        { ic: "🎟️", t: "Bonos Sodexo", d: "Miles de canjes",  href: "https://www.apprecio.com.co", external: true },
        { ic: "⭐", t: "Puntos VIP",    d: "Acumula y canjea", href: "https://www.apprecio.com.co", external: true },
      ]},
      { title: "Cómo Funciona", color: C.green, items: [
        { ic: "1️⃣", t: "Comparte tu link", d: "Invita amigos",               href: "https://www.apprecio.com.co", external: true },
        { ic: "2️⃣", t: "Ellos comparan",   d: "Encuentran su plan",          href: "https://www.apprecio.com.co", external: true },
        { ic: "3️⃣", t: "Contratan",        d: "Plan activo y verificado",    href: "https://www.apprecio.com.co", external: true },
        { ic: "4️⃣", t: "Tú Ganas",         d: "Premio automático",           href: "https://www.apprecio.com.co", external: true },
      ]},
    ],
  },
  ofertas: {
    label: "Ofertas", icon: "⚡", badge: "HOT", badgeColor: C.red,
    sections: [
      { title: "Planes Hot", color: C.red, items: [
        { ic: "⚡", t: "Flash Deals",     d: "Solo hoy",          href: "/ofertas" },
        { ic: "🎁", t: "Combos Familia",  d: "Ahorra hasta 40%",  href: "/planes?tipo=paquete" },
        { ic: "📦", t: "Triple Play",     d: "Internet+TV+Móvil", href: "/planes?tipo=paquete" },
        { ic: "🆕", t: "Nuevos Clientes", d: "Bono bienvenida",   href: "/planes" },
      ]},
      { title: "Equipos", color: C.neon2, items: [
        { ic: "📡", t: "Routers WiFi 6", d: "Desde $89.900",  href: "https://wa.me/573057876992?text=Hola, me interesa un Router WiFi 6", external: true },
        { ic: "🎮", t: "Gaming Gear",    d: "Hasta 50% off",  href: "https://wa.me/573057876992?text=Hola, me interesa Gaming Gear", external: true },
        { ic: "💻", t: "Laptops",        d: "Garantía 1 año", href: "https://wa.me/573057876992?text=Hola, me interesa comprar una laptop", external: true },
        { ic: "📱", t: "Smartphones",    d: "Planes desde $0", href: "https://wa.me/573057876992?text=Hola, me interesa un smartphone", external: true },
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
                  onClick={() => {
                    if (it.action) onAction(it.action);
                    if (it.href && !it.external) window.location.href = it.href;
                    if (it.href && it.external) window.open(it.href, "_blank");
                    onClose();
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "8px 10px", borderRadius: 10, cursor: "pointer",
                    border: "1px solid transparent", transition: "all .14s",
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.background  = `${sec.color}0c`;
                    e.currentTarget.style.borderColor = `${sec.color}22`;
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
    { label: "Inicio",                icon: "🏠", href: "/" },
    { label: "Consulta tu Cobertura", icon: "📍", action: "cobertura" },
    { label: "Diseñar Hogar Digital", icon: "🏠", action: "game" },
    { label: "Planes Móviles",        icon: "📱", action: "movil" },
    { label: "Ver catálogo",          icon: "📋", href: "/planes" },
    { label: "Ofertas Hot",           icon: "⚡", href: "/ofertas" },
    { label: "Ecosistema",            icon: "🌐", href: "https://wa.me/573057876992?text=Hola, me interesa el ecosistema de servicios" },
    { label: "Empresas",              icon: "🏢", href: "https://wa.me/573057876992?text=Hola, me interesa soluciones para empresas" },
    { label: "Refiere & Gana",        icon: "🎁", href: "https://www.apprecio.com.co" },
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
            if (s.href) window.open(s.href, s.href.startsWith("http") ? "_blank" : "_self");
            onClose();
          }}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 16px", borderRadius: 12,
            background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borderSoft}`,
            color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
            textAlign: "left", transition: "all .15s", width: "100%",
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
  onSearch:   () => void;
  onOpenAuth: (mode: string) => void;
  cartCount:  number;
  onCart:     () => void;
  onAction:   (a: string) => void;
}

export const Header = ({ onSearch, onOpenAuth, cartCount, onCart, onAction }: HeaderProps) => {
  const [active,     setActive]     = useState<string | null>(null);
  const [scrolled,   setScrolled]   = useState(false);
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
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onAction={(a) => { onAction(a); setMobileOpen(false); }}
      />

      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500 }}>
        {/* Top bar */}
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
          background:     scrolled ? "rgba(4,4,15,0.97)" : "rgba(4,4,15,0.92)",
          backdropFilter: "blur(28px)",
          borderBottom:   `1px solid ${scrolled ? "rgba(0,212,255,0.18)" : C.borderSoft}`,
          boxShadow:      scrolled ? "0 8px 40px rgba(0,0,0,0.6)" : "none",
          transition:     "all .3s",
        }}>
          <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 22px", height: 62, display: "flex", alignItems: "center", gap: 0 }}>

            {/* Logo */}
            <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0, marginRight: 28, padding: "8px 0" }}>
              <Image
                src="/logo.png"
                alt="ComparaTuPlan.com"
                width={220}
                height={70}
                style={{ objectFit: "contain", height: 58, width: "auto" }}
                priority
              />
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
                  }}>
                    <span style={{ fontSize: 13 }}>{m.icon}</span>
                    <span>{m.label}</span>
                    {m.badge && <Chip color={m.badgeColor}>{m.badge}</Chip>}
                    <ChevronDown size={11} style={{ transition: "transform .2s", transform: active === id ? "rotate(180deg)" : "rotate(0)", opacity: .5 }} />
                  </button>
                  {active === id && (
                    <MegaPanel
                      id={id}
                      onClose={() => setActive(null)}
                      onAction={(a) => { onAction(a); setActive(null); }}
                    />
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
              }}
                onMouseEnter={(e: any) => { e.currentTarget.style.background = "rgba(0,212,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(180,195,230,0.6)"; }}
              ><Search size={15} /></button>

              <button onClick={onCart} style={{
                position: "relative", width: 36, height: 36, borderRadius: 9,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSoft}`,
                color: "rgba(180,195,230,0.6)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
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

              <UserMenu onOpenAuth={onOpenAuth} />

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
