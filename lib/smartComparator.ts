/**
 * smartComparator.ts — ComparaTuPlan.com
 * ─────────────────────────────────────────────────────────────
 * Motor de cálculo de consumo y recomendación de planes.
 * v2: scoring mejorado cuando velocidad_mbps es null (CRC API)
 */

import { DeviceAdded, PersonasHogar, PERSONAS_CONFIG, NivelUso } from "./constants";

// ── Tipos ─────────────────────────────────────────────────────

export interface AvatarConfig {
  id:              string;
  factorVelocidad: number;
  precioMax:       number;
}

export interface ResumenConsumo {
  desglose: Array<{
    uid:     string;
    name:    string;
    emoji:   string;
    nivel:   NivelUso;
    usoDesc: string;
    mbps:    number;
    color:   string;
  }>;
  mbpsBase:            number;
  factorSimultaneidad: number;
  factorAvatar:        number;
  mbpsNecesarios:      number;
  mbpsRecomendado:     number;
  categoriaConsumo:    "basico" | "medio" | "intensivo";
  etiquetaConsumo:     string;
  colorConsumo:        string;
  necesitaTV:          boolean;
  necesitaGaming:      boolean;
  necesitaMovil:       boolean;
  necesitaTrabajo:     boolean;
  tiposRelevantes:     string[];
  precioMax:           number;
}

export interface PlanScorado {
  id_crc:        string;
  operador:      string;
  nombre:        string;
  tipo:          string;
  precio:        number;
  velocidad_mbps: number | null;
  datos_gb:      number | null;
  canales_tv:    number | null;
  minutos:       string | null;
  modalidad:     string | null;
  tecnologia:    string | null;
  _score:        number;
  badge:         string;
  glow:          string;
  top:           boolean;
}

// ── Nombres inválidos ─────────────────────────────────────────
const NOMBRES_INVALIDOS = [
  "ldi", "waze", "sms", "chat ilimitado", "redes sociales",
  "whatsapp", "minutos internacional", "internacional",
  "mensajes", "bolsa de minutos", "roaming", "llamadas internacionales",
];

// ── Colores por operador ──────────────────────────────────────
const OP_COLORS: Record<string, string> = {
  claro:    "#e2001a",
  movistar: "#00aa44",
  tigo:     "#00a0e3",
  etb:      "#f59e0b",
  wom:      "#9333ea",
  virgin:   "#dc2626",
  avantel:  "#0ea5e9",
};

function colorOperador(op: string): string {
  const key = op.toLowerCase().trim();
  for (const [k, v] of Object.entries(OP_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "#00d4ff";
}

// ── Inferir velocidad desde el nombre del plan ────────────────
// La CRC no devuelve velocidad_mbps, pero muchos nombres la incluyen
function inferirVelocidad(nombre: string): number {
  const n = nombre.toLowerCase();

  // Patrones: "100mb", "100 mb", "100mbps", "100 mbps", "fibra 100"
  const mbpsMatch = n.match(/(\d+)\s*mb(?:ps)?/);
  if (mbpsMatch) return parseInt(mbpsMatch[1]);

  // Patrones: "100m ", "100m+"
  const mMatch = n.match(/(\d+)\s*m[\s+]/);
  if (mMatch) return parseInt(mMatch[1]);

  // Pistas por palabras clave
  if (n.includes("giga") || n.includes("1000")) return 1000;
  if (n.includes("500"))  return 500;
  if (n.includes("300"))  return 300;
  if (n.includes("200"))  return 200;
  if (n.includes("150"))  return 150;
  if (n.includes("100"))  return 100;
  if (n.includes("50"))   return 50;
  if (n.includes("30"))   return 30;
  if (n.includes("20"))   return 20;
  if (n.includes("10"))   return 10;

  // Por tipo de plan
  if (n.includes("fibra") || n.includes("fiber")) return 100;
  if (n.includes("adsl"))  return 20;
  if (n.includes("4g") || n.includes("lte")) return 50;
  if (n.includes("5g"))    return 300;

  return 0;
}

// ── Inferir datos GB desde el nombre ─────────────────────────
function inferirDatos(nombre: string, tipo: string): number {
  if (!["movil", "paquete"].includes(tipo)) return 0;
  const n = nombre.toLowerCase();

  if (n.includes("ilimitad") || n.includes("unlimited")) return -1;

  const gbMatch = n.match(/(\d+)\s*gb/i);
  if (gbMatch) return parseInt(gbMatch[1]);

  const mbMatch = n.match(/(\d+)\s*mb(?!\s*ps)/i);
  if (mbMatch) return Math.round(parseInt(mbMatch[1]) / 1024);

  return 0;
}

// ── 1. Calcular resumen de consumo ────────────────────────────
export function calcularConsumo(
  devices:    DeviceAdded[],
  personas:   PersonasHogar,
  avatar:     AvatarConfig,
  deviceDefs: readonly any[]
): ResumenConsumo {
  const personasConf = PERSONAS_CONFIG[personas];

  const desglose = devices.map((d) => {
    const def = deviceDefs.find((x) => x.id === d.id);
    return {
      uid:     d.uid,
      name:    d.name,
      emoji:   d.emoji,
      nivel:   d.nivel,
      usoDesc: def?.usoDesc?.[d.nivel] ?? "",
      mbps:    d.mbps,
      color:   d.color,
    };
  });

  const mbpsBase            = desglose.reduce((acc, d) => acc + d.mbps, 0);
  const factorSimultaneidad = personasConf.factor;
  const factorAvatar        = avatar.factorVelocidad;
  const mbpsNecesarios      = Math.ceil(mbpsBase * factorSimultaneidad * factorAvatar);
  const mbpsRecomendado     = Math.ceil(mbpsNecesarios * 1.2);

  let categoriaConsumo: "basico" | "medio" | "intensivo";
  let etiquetaConsumo:  string;
  let colorConsumo:     string;

  if (mbpsRecomendado <= 50) {
    categoriaConsumo = "basico";  etiquetaConsumo = "Consumo básico";    colorConsumo = "#10b981";
  } else if (mbpsRecomendado <= 150) {
    categoriaConsumo = "medio";   etiquetaConsumo = "Consumo moderado";  colorConsumo = "#f59e0b";
  } else {
    categoriaConsumo = "intensivo"; etiquetaConsumo = "Consumo intensivo"; colorConsumo = "#ef4444";
  }

  const ids             = devices.map((d) => d.id);
  const necesitaTV      = ids.some((id) => ["tv", "decoder"].includes(id));
  const necesitaGaming  = ids.some((id) => ["console", "pc"].includes(id));
  const necesitaMovil   = ids.some((id) => id === "phone");
  const necesitaTrabajo = ids.some((id) => ["laptop", "pc"].includes(id));

  // Busca el bloque de tiposRelevantes y reemplázalo por:
  let tiposRelevantes: string[];
  if (necesitaTV && mbpsBase > 0)   tiposRelevantes = ["paquete", "internet"];
  else if (necesitaTV)               tiposRelevantes = ["paquete", "tv"];
  else                               tiposRelevantes = ["internet", "paquete"];
  // ← móvil nunca aparece en GameFlow hogar                                 tiposRelevantes = ["internet", "paquete", "movil"];

  return {
    desglose, mbpsBase, factorSimultaneidad, factorAvatar,
    mbpsNecesarios, mbpsRecomendado, categoriaConsumo,
    etiquetaConsumo, colorConsumo, necesitaTV, necesitaGaming,
    necesitaMovil, necesitaTrabajo, tiposRelevantes,
    precioMax: avatar.precioMax,
  };
}

// ── 2. Scorar y rankear planes ────────────────────────────────
export function scorarPlanes(
  planes:        any[],
  resumen:       ResumenConsumo,
  maxResultados: number = 3
): PlanScorado[] {
  const {
    tiposRelevantes, precioMax, necesitaTV, necesitaGaming,
    necesitaMovil, mbpsRecomendado, categoriaConsumo,
  } = resumen;

  // Deduplicar por operador+nombre (ya que tabla planes tiene ~32 copias por municipio)
  const seen = new Map<string, any>();
  for (const p of planes) {
    const key = `${(p.operador ?? "").toLowerCase().trim()}|||${(p.nombre ?? "").toLowerCase().trim()}`;
    if (!seen.has(key)) seen.set(key, p);
  }
  const deduplicados = Array.from(seen.values());

  const scored = deduplicados.map((p: any) => {
    const precio   = Number(p.precio)     || 0;
    const canales  = Number(p.canales_tv) || 0;
    const nombre   = (p.nombre ?? "").toLowerCase();
    const tipo     = (p.tipo   ?? "").toLowerCase();

    // Velocidad: usar campo si existe, si no inferir del nombre
    const velocidadDB  = Number(p.velocidad_mbps) || 0;
    const velocidadInf = velocidadDB > 0 ? velocidadDB : inferirVelocidad(p.nombre ?? "");

    // Datos: usar campo si existe, si no inferir del nombre
    const datosDB  = Number(p.datos_gb) || 0;
    const datosInf = datosDB !== 0 ? datosDB : inferirDatos(p.nombre ?? "", tipo);

    // ── Descartar inválidos ───────────────────────────────────
    if (precio > 0 && precio < 20000)                        return { ...p, _score: -100 };
    if (!precio && !velocidadInf && !datosInf && tipo !== "tv") return { ...p, _score: -100 };
    if (NOMBRES_INVALIDOS.some((x) => nombre.includes(x)))   return { ...p, _score: -100 };

    let score = 0;

    // ── Precio vs presupuesto (40 pts) ────────────────────────
    if (precio > 0 && precioMax > 0) {
      if      (precio <= precioMax)         score += 40;
      else if (precio <= precioMax * 1.15)  score += 25;
      else if (precio <= precioMax * 1.30)  score += 10;
      else                                  score -= 20;
    }

    // ── Tipo de plan (30 pts) ─────────────────────────────────
    if      (tipo === tiposRelevantes[0])      score += 30;
    else if (tiposRelevantes.includes(tipo))   score += 15;

    // ── Velocidad vs consumo recomendado (25 pts) ─────────────
    // Ahora usa velocidadInf (inferida del nombre si no hay campo)
    if (velocidadInf > 0 && mbpsRecomendado > 0) {
      const ratio = velocidadInf / mbpsRecomendado;
      if      (ratio >= 2.0)  score += 25;
      else if (ratio >= 1.5)  score += 20;
      else if (ratio >= 1.0)  score += 14;
      else if (ratio >= 0.7)  score += 8;
      else                    score += 2;
    } else {
      // Sin velocidad → bonus neutro según categoría para no penalizar
      if      (categoriaConsumo === "basico")    score += 10;
      else if (categoriaConsumo === "medio")     score += 6;
      else                                       score += 3;
    }

    // ── TV (15 pts) ───────────────────────────────────────────
    if (necesitaTV) {
      if      (canales > 50)                   score += 15;
      else if (canales > 0 || tipo === "tv")   score += 8;
      else if (tipo === "paquete")             score += 5;
    }

    // ── Gaming — bonus fibra/alta velocidad (15 pts) ──────────
    if (necesitaGaming) {
      if      (velocidadInf >= 200) score += 15;
      else if (velocidadInf >= 100) score += 10;
      else if (velocidadInf >= 50)  score += 5;
      // Sin velocidad pero nombre tiene "fibra"
      else if (nombre.includes("fibra") || nombre.includes("fiber")) score += 7;
    }

    // ── Datos móviles (10 pts) ────────────────────────────────
    if (necesitaMovil) {
      if      (datosInf === -1) score += 10;
      else if (datosInf >= 20)  score += 8;
      else if (datosInf >= 5)   score += 4;
      else if (datosInf > 0)    score += 2;
    }

    // ── Bonus plan paquete para hogares con 4+ dispositivos ───
    if (resumen.desglose.length >= 4 && tipo === "paquete") score += 8;

    // ── Bonus tecnología fibra ────────────────────────────────
    const tec = (p.tecnologia ?? "").toLowerCase();
    if (tec.includes("fibra") || tec.includes("fiber") || nombre.includes("fibra")) score += 5;

    return {
      ...p,
      _score:        Math.round(score),
      velocidad_mbps: velocidadDB || (velocidadInf > 0 ? velocidadInf : null),
      datos_gb:       datosDB     || (datosInf   !== 0 ? datosInf    : null),
    };
  });

  // Filtrar inválidos y ordenar
  const validos = scored
    .filter((p: any) => p._score > 0)
    .sort((a: any, b: any) =>
      b._score !== a._score
        ? b._score - a._score
        : (Number(a.precio) || 0) - (Number(b.precio) || 0)
    );

  // Un plan por operador máximo
  const resultado: any[] = [];
  const ops = new Set<string>();
  for (const plan of validos) {
    if (resultado.length >= maxResultados) break;
    const op = (plan.operador ?? "").toLowerCase().trim();
    if (!ops.has(op)) { resultado.push(plan); ops.add(op); }
  }

  const BADGES = ["🏆 Mejor Oferta", "⚡ Mejor Velocidad", "💰 Mejor Precio"];

  return resultado.map((p, i) => ({
    ...p,
    precio: Number(p.precio) || 0,
    badge:  BADGES[i] ?? `#${i + 1}`,
    glow:   colorOperador(p.operador ?? ""),
    top:    i === 0,
  }));
}

// ── 3. Recomendaciones de ecosistema ─────────────────────────
export function recomendarEcosistema(resumen: ResumenConsumo) {
  const { mbpsRecomendado, necesitaGaming, desglose } = resumen;
  const eco: Array<{ emoji: string; nombre: string; razon: string; precio: number }> = [];

  if (mbpsRecomendado > 100) {
    eco.push({ emoji: "📡", nombre: "Router WiFi 6 AX3000", razon: "Necesitas mayor cobertura y velocidad en el hogar", precio: 189900 });
  }
  if (desglose.length > 3) {
    eco.push({ emoji: "📶", nombre: "Sistema Mesh Tenda MW6", razon: "Elimina zonas sin señal con múltiples dispositivos", precio: 289900 });
  }
  if (necesitaGaming) {
    eco.push({ emoji: "🎮", nombre: "Cable Ethernet Cat8 10m", razon: "Latencia ultra-baja para gaming — sin pérdida de paquetes", precio: 29900 });
  }
  return eco;
}

// ── 4. Texto explicativo ──────────────────────────────────────
export function generarExplicacion(resumen: ResumenConsumo): string {
  const { categoriaConsumo, desglose } = resumen;

  const topDispositivos = [...desglose]
    .sort((a, b) => b.mbps - a.mbps)
    .slice(0, 2)
    .map((d) => `${d.emoji} ${d.name}`)
    .join(" y ");

  const mensajes: Record<string, string> = {
    basico:    `Tu hogar tiene un consumo liviano. Con ${topDispositivos} como principales dispositivos, un plan de entrada te dará buena experiencia.`,
    medio:     `Tu hogar tiene un consumo moderado. ${topDispositivos} son tus dispositivos más exigentes — necesitas un plan que soporte uso simultáneo.`,
    intensivo: `Tu hogar es de alto consumo. Con ${topDispositivos} y ${desglose.length} dispositivos conectados, necesitas un plan robusto para evitar cortes.`,
  };

  return mensajes[categoriaConsumo] ?? "";
}
