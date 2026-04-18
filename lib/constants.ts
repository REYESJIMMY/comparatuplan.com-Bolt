// ── Design tokens ────────────────────────────────────────────────────────────
export const C = {
  bg:        "#04040f",
  bg2:       "#080620",
  neon:      "#00d4ff",
  neon2:     "#a855f7",
  pink:      "#ec4899",
  green:     "#10b981",
  yellow:    "#f59e0b",
  red:       "#ef4444",
  cyan:      "#00e5ff",
  accent:    "#ff6b35",
  text:      "#fff",
  muted:     "rgba(180,190,220,0.5)",
  border:    "rgba(0,212,255,0.15)",
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

// ── Niveles de uso (compartido por todos los dispositivos) ────────────────────
export type NivelUso = "bajo" | "medio" | "alto";

export const NIVEL_LABELS: Record<NivelUso, { label: string; color: string; bg: string }> = {
  bajo:  { label: "Básico",    color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  medio: { label: "Medio",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  alto:  { label: "Intensivo", color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
};

// ── Devices for GameFlow ──────────────────────────────────────────────────────
// mbps ahora es un objeto con 3 niveles de consumo real
// usoDesc describe qué hace el usuario en cada nivel
export const DEVICES = [
  {
    id:      "tv",
    name:    "Smart TV",
    emoji:   "📺",
    color:   "#ec4899",
    mbps:    { bajo: 5, medio: 10, alto: 25 },
    usoDesc: {
      bajo:  "YouTube, redes sociales",
      medio: "Netflix HD, Disney+",
      alto:  "Streaming 4K, juegos en nube",
    },
    categoria: "entretenimiento",
  },
  {
    id:      "console",
    name:    "Consola",
    emoji:   "🎮",
    color:   "#ef4444",
    mbps:    { bajo: 3, medio: 10, alto: 30 },
    usoDesc: {
      bajo:  "Juegos offline / actualizaciones",
      medio: "Gaming online casual",
      alto:  "Gaming competitivo, streaming",
    },
    categoria: "gaming",
  },
  {
    id:      "laptop",
    name:    "Laptop",
    emoji:   "💻",
    color:   "#6366f1",
    mbps:    { bajo: 3, medio: 15, alto: 50 },
    usoDesc: {
      bajo:  "Navegar, email, redes",
      medio: "Videollamadas, Google Meet",
      alto:  "Trabajo remoto intensivo, Zoom 4K",
    },
    categoria: "trabajo",
  },
  {
    id:      "phone",
    name:    "Smartphone",
    emoji:   "📱",
    color:   "#10b981",
    mbps:    { bajo: 2, medio: 5, alto: 15 },
    usoDesc: {
      bajo:  "WhatsApp, llamadas, mapas",
      medio: "Redes sociales, videos HD",
      alto:  "TikTok, reels, videollamadas",
    },
    categoria: "comunicacion",
  },
  {
    id:      "tablet",
    name:    "Tablet",
    emoji:   "📲",
    color:   "#f59e0b",
    mbps:    { bajo: 3, medio: 8, alto: 20 },
    usoDesc: {
      bajo:  "Lectura, apps livianas",
      medio: "Videos HD, clases virtuales",
      alto:  "Streaming 4K, videollamadas",
    },
    categoria: "entretenimiento",
  },
  {
    id:      "pc",
    name:    "Gaming PC",
    emoji:   "🖥️",
    color:   "#00e5ff",
    mbps:    { bajo: 10, medio: 30, alto: 100 },
    usoDesc: {
      bajo:  "Ofimática, navegación",
      medio: "Gaming online, streaming",
      alto:  "Streaming en vivo, gaming competitivo",
    },
    categoria: "gaming",
  },
  {
    id:      "decoder",
    name:    "Decodificador",
    emoji:   "📡",
    color:   "#a855f7",
    mbps:    { bajo: 5, medio: 10, alto: 15 },
    usoDesc: {
      bajo:  "TV por cable básico",
      medio: "TV HD con VOD",
      alto:  "TV 4K, múltiples streams",
    },
    categoria: "entretenimiento",
  },
  {
    id:      "camera",
    name:    "Cámara IP",
    emoji:   "📷",
    color:   "#f97316",
    mbps:    { bajo: 1, medio: 2, alto: 5 },
    usoDesc: {
      bajo:  "Grabación local, resolución SD",
      medio: "Stream HD a la nube",
      alto:  "Stream 4K, múltiples cámaras",
    },
    categoria: "seguridad",
  },
] as const;

export type DeviceId = typeof DEVICES[number]["id"];

// ── Tipo para dispositivo agregado al hogar ───────────────────────────────────
export interface DeviceAdded {
  uid:   string;      // ID único de instancia
  id:    DeviceId;    // ID del tipo de dispositivo
  nivel: NivelUso;    // Nivel de uso seleccionado por el usuario
  mbps:  number;      // Mbps calculados según el nivel
  name:  string;
  emoji: string;
  color: string;
}

// ── Personas en el hogar ──────────────────────────────────────────────────────
export type PersonasHogar = "1-2" | "3-4" | "5+";

export const PERSONAS_CONFIG: Record<PersonasHogar, {
  label:    string;
  emoji:    string;
  desc:     string;
  factor:   number;   // factor de simultaneidad
}> = {
  "1-2": { label: "1 a 2 personas", emoji: "👤",   desc: "Solo o en pareja",         factor: 1.0 },
  "3-4": { label: "3 a 4 personas", emoji: "👨‍👩‍👧",  desc: "Familia pequeña",          factor: 1.4 },
  "5+":  { label: "5 o más",        emoji: "👨‍👩‍👧‍👦", desc: "Familia grande o colegas", factor: 1.8 },
};
