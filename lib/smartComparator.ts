/**
 * smartComparator.ts — ComparaTuPlan.com
 * ─────────────────────────────────────────────────────────────
 * Motor de cálculo de consumo y recomendación de planes.
 * v3: inferencia de velocidad más robusta, badges semánticos,
 *     bonus proporcional sin velocidad, capitalización normalizada.
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
  id_crc:         string;
  operador:       string;
  nombre:         string;
  tipo:           string;
  precio:         number;
  velocidad_mbps: number | null;
  datos_gb:       number | null;
  canales_tv:     number | null;
  minutos:        string | null;
  modalidad:      string | null;
  tecnologia:     string | null;
  _score:         number;
  _velocidadInf:  number;   // ← NEW: velocidad efectiva usada en el score
  badge:          string;
  glow:           string;
  top:            boolean;
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
// v3: prioriza patrones explícitos "Mbps/Mb" para evitar
//     falsos positivos con números que son precios o GB.
export function inferirVelocidad(nombre: string): number {
  const n = nombre.toLowerCase();

  // 1. Patrón explícito: "100mbps", "100 mbps", "100mb", "100 mb"
  //    Sólo cuando va seguido de "mbps" o "mb" (no "mb/" que sería MB de datos)
  const explicitoMatch = n.match(/(\d+)\s*mb(?:ps)?(?!\s*\/|\s*mes|\s*dia|\s*día)/);
  if (explicitoMatch) return parseInt(explicitoMatch[1]);

  // 2. Número seguido de "m" aislada: "100m ", "200m+" (raro pero ocurre)
  const mMatch = n.match(/\b(\d+)\s*m\b/);
  if (mMatch) {
    const v = parseInt(mMatch[1]);
    // Sólo si el número es plausible como velocidad (1-10000)
    if (v >= 1 && v <= 10000) return v;
  }

  // 3. Gigabit / 1000 explícito
  if (/1\s*gig(?:a|abit)?(?:\s*bps)?/i.test(n) || n.includes("1000mbps") || n.includes("1gig")) return 1000;

  // 4. Tecnología de red como proxy de velocidad (sólo si no hay número en el nombre)
  //    Evitamos inferir velocidad de "5g" si el plan se llama "5gb datos"
  const tieneNumero = /\d/.test(n);
  if (!tieneNumero || /\b(fibra|fiber|adsl|4g|5g|lte)\b/.test(n)) {
    if (n.includes("fibra") || n.includes("fiber")) return 100;
    if (n.includes("5g") && !n.includes("5gb"))     return 300;
    if (n.includes("4g") || n.includes("lte"))      return 50;
    if (n.includes("adsl"))                         return 20;
  }

  return 0; // no se pudo inferir
}

// ── Inferir datos GB desde el nombre ─────────────────────────
function inferirDatos(nombre: string, tipo: string): number {
  if (!["movil", "paquete"].includes(tipo)) return 0;
  const n = nombre.toLowerCase();

  if (n.includes("ilimitad") || n.includes("unlimited")) return -1;

  const gbMatch = n.match(/(\d+)\s*gb/i);
  if (gbMatch) return parseInt(gbMatch[1]);

  // MB de datos (no confundir con Mbps)
  const mbMatch = n.match(/(\d+)\s*mb(?!\s*ps)(?!\s*\/s)/i);
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
    categoriaConsumo = "basico";    etiquetaConsumo = "Consumo básico";    colorConsumo = "#10b981";
  } else if (mbpsRecomendado <= 150) {
    categoriaConsumo = "medio";     etiquetaConsumo = "Consumo moderado";  colorConsumo = "#f59e0b";
  } else {
    categoriaConsumo = "intensivo"; etiquetaConsumo = "Consumo intensivo"; colorConsumo = "#ef4444";
  }

  const ids             = devices.map((d) => d.id);
  const necesitaTV      = ids.some((id) => ["tv", "decoder"].includes(id));
  const necesitaGaming  = ids.some((id) => ["console", "pc"].includes(id));
  const necesitaMovil   = ids.some((id) => id === "phone");
  const necesitaTrabajo = ids.some((id) => ["laptop", "pc"].includes(id));

  let tiposRelevantes: string[];
  if (necesitaTV && mbpsBase > 0) tiposRelevantes = ["paquete", "internet"];
  else if (necesitaTV)            tiposRelevantes = ["paquete", "tv"];
  else                            tiposRelevantes = ["internet", "paquete"];
  // móvil nunca aparece en GameFlow hogar

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

  // ── Deduplicar por operador+nombre (normalizado) ──────────
  // v3: normaliza capitalización antes de la clave para evitar
  //     duplicados por "ETB" vs "Etb" vs "etb"
  const seen = new Map<string, any>();
  for (const p of planes) {
    const op  = (p.operador ?? "").toLowerCase().trim().replace(/\s+/g, " ");
    const nom = (p.nombre   ?? "").toLowerCase().trim().replace(/\s+/g, " ");
    const key = `${op}|||${nom}`;
    if (!seen.has(key)) seen.set(key, p);
  }
  const deduplicados = Array.from(seen.values());

  const scored = deduplicados.map((p: any) => {
    const precio  = Number(p.precio)     || 0;
    const canales = Number(p.canales_tv) || 0;
    const nombre  = (p.nombre ?? "").toLowerCase();
    const tipo    = (p.tipo   ?? "").toLowerCase();

    // Velocidad efectiva: campo DB primero, luego inferir del nombre
    const velocidadDB  = Number(p.velocidad_mbps) > 0 ? Number(p.velocidad_mbps) : 0;
    const velocidadInf = velocidadDB > 0 ? velocidadDB : inferirVelocidad(p.nombre ?? "");

    // Datos: campo DB primero, luego inferir
    const datosDB  = Number(p.datos_gb) || 0;
    const datosInf = datosDB !== 0 ? datosDB : inferirDatos(p.nombre ?? "", tipo);

    // ── Descartar inválidos ──────────────────────────────────
    if (precio > 0 && precio < 20000)                              return { ...p, _score: -100, _velocidadInf: 0 };
    if (!precio && !velocidadInf && !datosInf && tipo !== "tv")    return { ...p, _score: -100, _velocidadInf: 0 };
    if (NOMBRES_INVALIDOS.some((x) => nombre.includes(x)))         return { ...p, _score: -100, _velocidadInf: 0 };

    let score = 0;

    // ── Precio vs presupuesto (40 pts) ────────────────────────
    if (precio > 0 && precioMax > 0) {
      if      (precio <= precioMax)        score += 40;
      else if (precio <= precioMax * 1.15) score += 25;
      else if (precio <= precioMax * 1.30) score += 10;
      else                                 score -= 20;
    }

    // ── Tipo de plan (30 pts) ─────────────────────────────────
    if      (tipo === tiposRelevantes[0])    score += 30;
    else if (tiposRelevantes.includes(tipo)) score += 15;

    // ── Velocidad vs consumo recomendado (25 pts) ─────────────
    if (velocidadInf > 0 && mbpsRecomendado > 0) {
      const ratio = velocidadInf / mbpsRecomendado;
      if      (ratio >= 2.0) score += 25;
      else if (ratio >= 1.5) score += 20;
      else if (ratio >= 1.0) score += 14;
      else if (ratio >= 0.7) score += 8;
      else                   score += 2;
    } else {
      // v3: sin velocidad → bonus proporcional al precio relativo
      // (plan más barato dentro de la categoría recibe más puntos)
      // Evita que planes caros sin velocidad compitan con planes con velocidad conocida
      const precioRatio = precioMax > 0 && precio > 0 ? precio / precioMax : 1;
      if      (categoriaConsumo === "basico")    score += Math.round(10 * (1 - Math.min(precioRatio, 1) * 0.4));
      else if (categoriaConsumo === "medio")     score += Math.round(6  * (1 - Math.min(precioRatio, 1) * 0.4));
      else                                       score += Math.round(3  * (1 - Math.min(precioRatio, 1) * 0.4));
    }

    // ── TV (15 pts) ───────────────────────────────────────────
    if (necesitaTV) {
      if      (canales > 50)                 score += 15;
      else if (canales > 0 || tipo === "tv") score += 8;
      else if (tipo === "paquete")           score += 5;
    }

    // ── Gaming — bonus fibra/alta velocidad (15 pts) ──────────
    if (necesitaGaming) {
      if      (velocidadInf >= 200)                                       score += 15;
      else if (velocidadInf >= 100)                                       score += 10;
      else if (velocidadInf >= 50)                                        score += 5;
      else if (nombre.includes("fibra") || nombre.includes("fiber"))      score += 7;
      else if ((p.tecnologia ?? "").toLowerCase().includes("fibra"))      score += 7;
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

    // ── Bonus tecnología fibra ─────────────────────────────────
    const tec = (p.tecnologia ?? "").toLowerCase();
    if (tec.includes("fibra") || tec.includes("fiber") || nombre.includes("fibra")) score += 5;

    return {
      ...p,
      _score:        Math.round(score),
      _velocidadInf: velocidadInf,
      // Exponer la velocidad efectiva al UI para mostrar el valor inferido
      velocidad_mbps: velocidadDB || (velocidadInf > 0 ? velocidadInf : null),
      datos_gb:       datosDB     || (datosInf   !== 0 ? datosInf    : null),
    };
  });

  // Filtrar inválidos y ordenar por score desc, luego precio asc
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

  // ── v3: Badges semánticos (no por posición fija) ─────────────
  // Identifica realmente cuál tiene mejor precio y cuál mejor velocidad
  if (resultado.length === 0) return [];

  const precioMin    = Math.min(...resultado.map((p) => Number(p.precio) || Infinity));
  const velMax       = Math.max(...resultado.map((p) => p._velocidadInf || 0));
  const usadosBadges = new Set<string>();

  const asignarBadge = (plan: any): string => {
    const esMasCaro  = Number(plan.precio) === precioMin;
    const esMasRapido = plan._velocidadInf > 0 && plan._velocidadInf === velMax;
    const esMejorOferta = plan._score === Math.max(...resultado.map((p: any) => p._score));

    // Mejor Oferta al de mayor score (top plan)
    if (esMejorOferta && !usadosBadges.has("oferta")) {
      usadosBadges.add("oferta");
      return "🏆 Mejor Oferta";
    }
    // Mejor Velocidad al de mayor velocidad inferida
    if (esMasRapido && !usadosBadges.has("velocidad")) {
      usadosBadges.add("velocidad");
      return "⚡ Mejor Velocidad";
    }
    // Mejor Precio al más económico
    if (esMasCaro && !usadosBadges.has("precio")) {
      usadosBadges.add("precio");
      return "💰 Mejor Precio";
    }
    // Fallback ordinal
    const idx = resultado.indexOf(plan);
    return `#${idx + 1}`;
  };

  // Primera pasada: asignar Mejor Oferta
  const withBadges = resultado.map((p) => ({ ...p, badge: "" }));
  for (const p of withBadges) {
    if (p._score === Math.max(...resultado.map((x: any) => x._score)) && !usadosBadges.has("oferta")) {
      p.badge = "🏆 Mejor Oferta";
      usadosBadges.add("oferta");
    }
  }
  // Segunda pasada: Mejor Velocidad
  for (const p of withBadges) {
    if (!p.badge && p._velocidadInf > 0 && p._velocidadInf === velMax && !usadosBadges.has("velocidad")) {
      p.badge = "⚡ Mejor Velocidad";
      usadosBadges.add("velocidad");
    }
  }
  // Tercera pasada: Mejor Precio
  for (const p of withBadges) {
    if (!p.badge && Number(p.precio) === precioMin && !usadosBadges.has("precio")) {
      p.badge = "💰 Mejor Precio";
      usadosBadges.add("precio");
    }
  }
  // Fallback ordinal para los que no tienen badge
  withBadges.forEach((p, i) => {
    if (!p.badge) p.badge = `#${i + 1}`;
  });

  return withBadges.map((p) => ({
    ...p,
    precio: Number(p.precio) || 0,
    glow:   colorOperador(p.operador ?? ""),
    top:    p.badge === "🏆 Mejor Oferta",
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
