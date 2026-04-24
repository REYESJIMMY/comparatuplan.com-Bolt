"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, LogIn, UserPlus, MessageCircle, Send, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { C, openWA } from "@/lib/constants";
import { GlowBtn, WaIco } from "@/components/ui";

/* ── SearchBar ───────────────────────────────────────────────── */
const QUICK_SEARCHES = [
  { label: "Fibra 200 Mbps",  url: "/planes?tipo=internet" },
  { label: "Planes móviles",  url: "/planes?tipo=movil" },
  { label: "Triple Play",     url: "/planes?tipo=paquete" },
  { label: "Internet hogar",  url: "/planes?tipo=internet" },
];

export const SearchBar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    window.location.href = `/planes?q=${encodeURIComponent(query.trim())}`;
    onClose();
  };

  const handleQuick = (url: string) => {
    window.location.href = url;
    onClose();
  };

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(4,4,15,0.85)", backdropFilter: "blur(20px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560, margin: "0 20px",
          background: "rgba(8,6,24,0.99)", border: `1px solid ${C.border}`,
          borderRadius: 16, padding: 16, boxShadow: `0 0 60px ${C.neon}14`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={18} color={C.neon} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter") handleSearch(q);
            }}
            placeholder="Buscar planes, operadores, velocidad…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#fff", fontSize: 15, fontWeight: 500,
            }}
          />
          <kbd style={{ color: C.muted, fontSize: 10, border: `1px solid ${C.borderSoft}`, borderRadius: 4, padding: "1px 6px" }}>Esc</kbd>
        </div>

        {q.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}` }}>
            <button
              onClick={() => handleSearch(q)}
              style={{
                width: "100%", background: "rgba(0,212,255,0.08)", border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13,
                fontWeight: 600, cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <Search size={14} color={C.neon} />
              Buscar <strong style={{ color: C.neon }}>&quot;{q}&quot;</strong> en el catálogo →
            </button>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <div style={{ color: "rgba(0,212,255,0.3)", fontSize: 9, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>BÚSQUEDAS RÁPIDAS</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QUICK_SEARCHES.map((s) => (
              <button
                key={s.label}
                onClick={() => handleQuick(s.url)}
                style={{
                  background: "rgba(0,212,255,0.06)", border: `1px solid ${C.border}`,
                  color: C.neon, borderRadius: 99, padding: "5px 12px", fontSize: 11,
                  fontWeight: 600, cursor: "pointer", transition: "all .15s",
                }}
                onMouseEnter={(e: any) => { e.currentTarget.style.background = "rgba(0,212,255,0.14)"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.background = "rgba(0,212,255,0.06)"; }}
              >{s.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── AuthModal ───────────────────────────────────────────────── */
export const AuthModal = ({ mode, onClose }: { mode: string; onClose: () => void }) => {
  const [tab, setTab] = useState(mode ?? "login");
  const isL = tab === "login";
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(4,4,15,0.92)", backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(8,6,24,0.99)", border: `1px solid ${C.border}`,
          borderRadius: 20, padding: 28, maxWidth: 360, width: "100%",
          boxShadow: `0 0 80px ${C.neon}14`, position: "relative",
        }}
      >
        <button onClick={onClose} style={{
          position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.05)",
          border: "none", borderRadius: "50%", width: 27, height: 27, cursor: "pointer",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        }}><X size={13} /></button>

        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 9, padding: 3, marginBottom: 20 }}>
          {[["login", "Iniciar Sesión"], ["register", "Registrarse"]].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: "7px 0", borderRadius: 7, border: "none",
              background: tab === id ? "linear-gradient(135deg,#0070cc,#0050aa)" : "transparent",
              color: tab === id ? "#fff" : C.muted, fontWeight: 700, fontSize: 12, cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: "linear-gradient(135deg,#0070cc,#0050aa)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 9px" }}>
            {isL ? <LogIn size={18} color="#fff" /> : <UserPlus size={18} color="#fff" />}
          </div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{isL ? "¡Bienvenido!" : "Crea tu cuenta gratis"}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {!isL && <input placeholder="Nombre completo" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSoft}`, borderRadius: 9, padding: "10px 13px", color: "#fff", fontSize: 12, outline: "none" }} />}
          <input placeholder="Correo electrónico" type="email" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSoft}`, borderRadius: 9, padding: "10px 13px", color: "#fff", fontSize: 12, outline: "none" }} />
          <input placeholder="Contraseña" type="password" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSoft}`, borderRadius: 9, padding: "10px 13px", color: "#fff", fontSize: 12, outline: "none" }} />
        </div>

        <button onClick={onClose} style={{ width: "100%", marginTop: 13, background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", borderRadius: 9, padding: "11px 0", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
          {isL ? "Entrar" : "Crear cuenta"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "11px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.borderSoft }} />
          <span style={{ color: C.muted, fontSize: 10 }}>o continúa con</span>
          <div style={{ flex: 1, height: 1, background: C.borderSoft }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["G", "#ea4335", "Google"], ["f", "#1877f2", "Facebook"]].map(([l, col, name]) => (
            <button key={name} style={{ flex: 1, padding: "8px 0", borderRadius: 9, background: `${col}12`, border: `1px solid ${col}25`, color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span style={{ color: col, fontWeight: 900, fontSize: 13 }}>{l}</span>{name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── CartDrawer ──────────────────────────────────────────────── */
interface CartItem { id: string; name: string; price: number; emoji: string; color: string; qty: number; }
interface CartDrawerProps { cart: CartItem[]; setCart: (c: CartItem[]) => void; open: boolean; onClose: () => void; }

export const CartDrawer = ({ cart, setCart, open, onClose }: CartDrawerProps) => {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const update = (id: string, delta: number) =>
    setCart(cart.map((i) => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter((i) => i.qty > 0));

  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,0.4)" }} />}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 320, zIndex: 701,
        background: "rgba(6,4,20,0.99)", borderLeft: `1px solid ${C.borderSoft}`,
        backdropFilter: "blur(24px)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform .3s ease", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingCart size={17} color={C.neon} />
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Mi carrito</span>
            {cart.length > 0 && <span style={{ background: C.neon, color: "#04040f", borderRadius: 99, padding: "1px 7px", fontSize: 10, fontWeight: 900 }}>{cart.reduce((s, i) => s + i.qty, 0)}</span>}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 27, height: 27, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
              <ShoppingCart size={32} style={{ margin: "0 auto 12px", display: "block", opacity: .3 }} />
              <p style={{ fontSize: 13 }}>Tu carrito está vacío</p>
            </div>
          ) : cart.map((item) => (
            <div key={item.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borderSoft}`, borderRadius: 11, padding: "10px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 12, flex: 1 }}>{item.name}</span>
                <button onClick={() => update(item.id, -item.qty)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}><Trash2 size={13} /></button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: item.color, fontWeight: 900, fontSize: 14 }}>${(item.price * item.qty).toLocaleString()}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => update(item.id, -1)} style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={11} /></button>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => update(item.id, 1)} style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={11} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: "16px 18px", borderTop: `1px solid ${C.borderSoft}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ color: C.muted, fontSize: 13 }}>Total estimado</span>
              <span style={{ color: C.neon, fontWeight: 900, fontSize: 16 }}>${total.toLocaleString()}/mes</span>
            </div>
            <button
              onClick={() => openWA(`consulta sobre mi carrito con ${cart.length} plan(es)`)}
              style={{ width: "100%", background: "linear-gradient(135deg,#25d366,#128c7e)", border: "none", borderRadius: 10, padding: "12px 0", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <WaIco s={15} />Solicitar por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/* ── Chatbot Nexus ───────────────────────────────────────────── */
const getReply = (t: string): string => {
  const s = t.toLowerCase();
  if (s.match(/hola|buenas|hey/))         return "¡Hola! 👋 Soy **Nexus**. ¿En qué te ayudo hoy?";
  if (s.match(/internet|fibra/))          return "📡 Fibra desde **$59.900/mes** hasta 900 Mbps. [Ver planes de internet](/planes?tipo=internet)";
  if (s.match(/precio|costo|cuánto/))     return "💰 Planes desde **$45.900/mes**. ¡Hasta 40% de ahorro! [Ver catálogo](/planes)";
  if (s.match(/móvil|movil|celular/))     return "📱 Planes móviles desde **$20.000**. Prepago y pospago. [Ver planes móviles](/planes?tipo=movil)";
  if (s.match(/cobertura/))              return "📍 Verifica tu cobertura aquí → [Consulta tu Cobertura](/?action=cobertura)";
  if (s.match(/reparar|técnico|roto/))    return "🔧 Diagnóstico **gratis**. Escríbenos por WhatsApp 💬";
  if (s.match(/planes|comparar/))        return "🔍 Ve todos los planes en nuestro [catálogo completo](/planes)";
  if (s.match(/oferta|descuento|promo/)) return "⚡ Tenemos **Ofertas Hot** del día. [Ver ofertas](/ofertas)";
  if (s.match(/refiere|gana|premio/))    return "🎁 Gana hasta **$200.000** con Apprecio. [Inscribirte gratis](https://www.apprecio.com.co)";
  return "Para asesoría personalizada escríbenos por **WhatsApp** 💬";
};
interface Msg { from: "bot" | "user"; text: string; }

export const Chatbot = () => {
  const [open,   setOpen]   = useState(false);
  const [msgs,   setMsgs]   = useState<Msg[]>([{ from: "bot", text: "¡Hola! 👋 Soy **Nexus**, tu asistente de ComparaTuPlan. ¿Cómo puedo ayudarte?" }]);
  const [input,  setInput]  = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const botRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { botRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);
  useEffect(() => { if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 80); } }, [open]);

  const send = (t?: string) => {
    const m = t ?? input.trim();
    if (!m) return;
    setInput("");
    setMsgs((p) => [...p, { from: "user", text: m }]);
    setTyping(true);
    setTimeout(() => {
      setMsgs((p) => [...p, { from: "bot", text: getReply(m) }]);
      setTyping(false);
    }, 750 + Math.random() * 400);
  };

  const rt = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
     .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#00d4ff;text-decoration:underline;cursor:pointer">$1</a>');

  return (
    <>
      {/* FAB */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            width: 50, height: 50, borderRadius: "50%",
            background: open ? "linear-gradient(135deg,#ef4444,#b91c1c)" : "linear-gradient(135deg,#00d4ff,#0070cc)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 22px ${open ? "#ef444488" : "#00d4ff66"}`,
            position: "relative", transition: "all .2s",
          }}
        >
          {open ? <X size={19} color="#fff" /> : <MessageCircle size={21} color="#fff" />}
          {unread > 0 && !open && (
            <span style={{ position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: C.red, color: "#fff", fontSize: 8, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #04040f" }}>{unread}</span>
          )}
        </button>
      </div>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 84, right: 24, zIndex: 999,
          width: 295, display: "flex", flexDirection: "column",
          background: "rgba(6,4,20,0.99)", border: `1px solid ${C.border}`,
          borderRadius: 18, boxShadow: `0 0 50px ${C.neon}18`,
          backdropFilter: "blur(24px)", overflow: "hidden",
        }}>
          <div style={{ background: "linear-gradient(135deg,#0070cc,#0050aa)", padding: "11px 14px", display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={15} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>Nexus IA</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 600 }}>● En línea · ComparaTuPlan</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 23, height: 23, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={11} color="#fff" />
            </button>
          </div>

          <div style={{ overflowY: "auto", padding: "9px 9px 4px", display: "flex", flexDirection: "column", gap: 7, maxHeight: 240 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "80%", padding: "7px 11px",
                    borderRadius: m.from === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                    background: m.from === "user" ? "linear-gradient(135deg,#0070cc,#0050aa)" : "rgba(255,255,255,0.06)",
                    color: "#fff", fontSize: 11, lineHeight: 1.5,
                  }}
                  dangerouslySetInnerHTML={{ __html: rt(m.text) }}
                />
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex" }}>
                <div style={{ padding: "7px 11px", borderRadius: "14px 14px 14px 3px", background: "rgba(255,255,255,0.06)", display: "flex", gap: 3, alignItems: "center" }}>
                  {[0, 1, 2].map((j) => <div key={j} style={{ width: 4, height: 4, borderRadius: "50%", background: C.neon, animation: `blink 1.2s ${j * .2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={botRef} />
          </div>

          <div style={{ padding: "4px 7px", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["Internet", "Móvil", "Ofertas"].map((q) => (
              <button key={q} onClick={() => send(q)} style={{ background: "rgba(0,212,255,0.08)", border: `1px solid ${C.border}`, color: C.neon, borderRadius: 99, padding: "3px 8px", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>{q}</button>
            ))}

            <a href={`https://wa.me/573057876992?text=${encodeURIComponent("Hola, necesito asesoría personalizada sobre planes de telecomunicaciones 🚀")}`} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", color: "#25D366", borderRadius: 99, padding: "3px 8px", fontSize: 9, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>💬 Asesor</a>
          </div>

          <div style={{ padding: "5px 7px 9px", display: "flex", gap: 5 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escribe tu pregunta…"
              style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.borderSoft}`, borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 11, outline: "none" }}
            />
            <button onClick={() => send()} style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={12} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
