// ── Design tokens ────────────────────────────────────────────────────────────
export const C = {
  bg:   "#04040f",
  bg2:  "#080620",
  neon: "#00d4ff",
  neon2:"#a855f7",
  pink: "#ec4899",
  green:"#10b981",
  yellow:"#f59e0b",
  red:  "#ef4444",
  cyan: "#00e5ff",
  accent:"#ff6b35",
  text: "#fff",
  muted:"rgba(180,190,220,0.5)",
  border:"rgba(0,212,255,0.15)",
  borderSoft:"rgba(255,255,255,0.06)",
} as const;

// ── WhatsApp ──────────────────────────────────────────────────────────────────
export const WA_NUMBER = "573057876992";
export const openWA = (name: string) =>
  window.open(
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
      `Hola, vi *${name}* en ComparaTuPlan y quiero más información 🚀`
    )}`,
    "_blank"
  );

// ── Operators ─────────────────────────────────────────────────────────────────
export const OPS = [
  { n: "Claro",         c: "#e2001a", e: "🔴" },
  { n: "Movistar",      c: "#00aa44", e: "🟢" },
  { n: "Tigo",          c: "#00a0e3", e: "🔵" },
  { n: "ETB",           c: "#f59e0b", e: "🟡" },
  { n: "WOM",           c: "#a855f7", e: "🟣" },
  { n: "Virgin Mobile", c: "#ef4444", e: "🔴" },
  { n: "Avantel",       c: "#06b6d4", e: "🔵" },
  { n: "Uff Móvil",     c: "#f97316", e: "🟠" },
  { n: "Flash Mobile",  c: "#6366f1", e: "🟣" },
  { n: "Éxito Móvil",   c: "#10b981", e: "🟢" },
  { n: "Alkosto Móvil", c: "#ef4444", e: "🔴" },
  { n: "Telefónica",    c: "#0084ff", e: "🔵" },
  { n: "DirecTV",       c: "#00c8ff", e: "🔵" },
  { n: "Starlink",      c: "#6366f1", e: "🌐" },
  { n: "InterNexa",     c: "#10b981", e: "🟢" },
  { n: "GT Internet",   c: "#f59e0b", e: "🟡" },
] as const;

// ── Devices for GameFlow ──────────────────────────────────────────────────────
export const DEVICES = [
  { id: "tv",      name: "Smart TV",      emoji: "📺", mbps: 25,  color: "#ec4899", desc: "Streaming 4K" },
  { id: "console", name: "Consola",       emoji: "🎮", mbps: 50,  color: "#ef4444", desc: "Gaming Online" },
  { id: "laptop",  name: "Laptop",        emoji: "💻", mbps: 25,  color: "#6366f1", desc: "Trabajo/Estudio" },
  { id: "phone",   name: "Smartphone",    emoji: "📱", mbps: 10,  color: "#10b981", desc: "Conectividad" },
  { id: "tablet",  name: "Tablet",        emoji: "📲", mbps: 15,  color: "#f59e0b", desc: "Entretenimiento" },
  { id: "pc",      name: "Gaming PC",     emoji: "🖥️", mbps: 100, color: "#00e5ff", desc: "Alto rendimiento" },
  { id: "decoder", name: "Decodificador", emoji: "📡", mbps: 15,  color: "#a855f7", desc: "TV por suscripción" },
  { id: "camera",  name: "Cámara IP",     emoji: "📷", mbps: 5,   color: "#f97316", desc: "Seguridad hogar" },
] as const;

export type DeviceId = typeof DEVICES[number]["id"];
