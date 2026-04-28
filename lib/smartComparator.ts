/**
 * smartComparator.ts — ComparaTuPlan.com
 * ─────────────────────────────────────────────────────────────
 * v4: Fix regex Movistar (case-insensitive), deduplicación por
 *     operador+velocidad+precio (no por nombre técnico CRC),
 *     limpieza de nombres para UI, filtro planes mayoristas HOG,
 *     badges semánticos.
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
  nombreLimpio:   string;
  tipo:           string;
  precio:         number;
  velocidad_mbps: number | null;
  datos_gb:       number | null;
  canales_tv:     number | null;
  minutos:        string | null;
  modalidad:      string | null;
  tecnologia:     string | null;
  _score:         number;
  _velocidadInf:  number;
  badge:          string;
  glow:           string;
  top:            boolean;
}

// ── Colores por operador ──────────────────────────────────────
const OP_COLORS: Record<string, string> = {
  claro:    "#e2001a",
  movistar: "#009900",
  etb:      "#f59e0b",
  tigo:     "#00a0e3",
  wom:      "#9333ea",
  virgin:   "#dc2626",
  une:      "#7c3aed",
  emcali:   "#0ea5e9",
};

export function colorOperador(op: string): string {
  const key = op.toLowerCase().trim();
  for (const [k, v] of Object.entries(OP_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "#00d4ff";
}

// ── Patrones de nombres inválidos ─────────────────────────────
const NOMBRES_INVALIDOS_PATTERNS: RegExp[] = [
  /\bldi\b/i,
  /\bwaze\b/i,
  /\bsms\b/i,
  /chat ilimitado/i,
  /redes sociales/i,
  /\bwhatsapp\b/i,
  /minutos internacion/i,
  /\bbolsa\b/i,
  /\broaming\b/i,
  /\bhog\b/i,
  /\bhandoff\b/i,
  /\bwholesale\b/i,
  /^single internet \d+m hog/i,
];

function esNombreInvalido(nombre: string): boolean {
  return NOMBRES_INVALIDOS_PATTERNS.some((re) => re.test(nombre));
}

// ── Limpiar nombre para UI ────────────────────────────────────
export function limpiarNombre(nombre: string, operador: string): string {
  let n = nombre;
  n = n.replace(/_(?:Nac|Nal|Est_\d+-\d+|Nacional)?_?\d{4,}$/i, "");
  n = n.replace(/^Convergente_MTotal_Single_/i, "");
  n = n.replace(/^MTotal_/i, "");
  n = n.replace(/^Plan /i, "");
  n = n.replace(/_/g, " ").trim();
  n = n.charAt(0).toUpperCase() + n.slice(1);
  if (n.length > 60) n = n.slice(0, 57) + "…";
  return n || nombre;
}

// ── Inferir velocidad (v4: case-insensitive, fix Movistar) ────
export function inferirVelocidad(nombre: string): number {
  // 1. Explícito: "900Mbps", "100 mbps", "100mb"
  const explicitoMatch = nombre.match(/(\d+)\s*mb(?:ps)?(?!\s*\/)/i);
  if (explicitoMatch) {
    const v = parseInt(explicitoMatch[1]);
    if (v >= 1 && v <= 10000) return v;
  }

  // 2. "Banda Ancha 900" — patrón Movistar
  const bandaMatch = nombre.match(/[Bb]anda?\s*[Aa]ncha\s+(\d+)/i);
  if (bandaMatch) {
    const v = parseInt(bandaMatch[1]);
    if (v >= 1 && v <= 10000) return v;
  }

  // 3. "910M" aislado
  const mMatch = nombre.match(/\b(\d+)\s*[Mm]\b/);
  if (mMatch) {
    const v = parseInt(mMatch[1]);
    if (v >= 1 && v <= 10000) return v;
  }

  // 4. Gigabit
  if (/1\s*gig(?:a|abit)?(?:\s*bps)?/i.test(nombre) || /1000\s*mbps/i.test(nombre)) return 1000;

  // 5. Tecnología como proxy (solo si no hay números)
  if (!/\d/.test(nombre)) {
    if (/fibra|fiber/i.test(nombre))              return 100;
    if (/5g/i.test(nombre) && !/5\s*gb/i.test(nombre)) return 300;
    if (/4g|lte/i.test(nombre))                   return 50;
    if (/adsl/i.test(nombre))                     return 20;
  }

  return 0;
}

// ── Inferir datos GB ──────────────────────────────────────────
function inferirDatos(nombre: string, tipo: string): number {
  if (!["movil", "paquete"].includes(tipo)) return 0;
  if (/ilimitad|unlimited/i.test(nombre)) return -1;
  const gbMatch = nombre.match(/(\d+)\s*gb/i);
  if (gbMatch) return parseInt(gbMatch[1]);
  const mbMatch = nombre.match(/(\d+)\s*mb(?!\s*ps)(?!\s*\/s)/i);
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

  // ── Deduplicar por operador + tipo + precio + velocidad ───────
  // v4: NO deduplicar solo por nombre porque Movistar tiene el mismo
  // plan con ~32 nombres diferentes (uno por municipio).
  // Clave: operador + tipo + precio + velocidad efectiva
  const seen = new Map<string, any>();
  for (const p of planes) {
    const op     = (p.operador ?? "").toLowerCase().trim();
    const tipo   = (p.tipo ?? "").toLowerCase().trim();
    const precio = Number(p.precio) || 0;
    const vel    = Number(p.velocidad_mbps) || inferirVelocidad(p.nombre ?? "");
    // Si no hay velocidad conocida, usar nombre normalizado como discriminador
    const velKey = vel > 0 ? `v${vel}` : (p.nombre ?? "").toLowerCase().replace(/\s+/g, " ").trim();
    const key    = `${op}|${tipo}|${precio}|${velKey}`;
    if (!seen.has(key)) seen.set(key, p);
  }
  const deduplicados = Array.from(seen.values());

  const scored = deduplicados.map((p: any) => {
    const precio  = Number(p.precio)     || 0;
    const canales = Number(p.canales_tv) || 0;
    const nombre  = p.nombre ?? "";
    const tipo    = (p.tipo ?? "").toLowerCase();

    const velocidadDB  = Number(p.velocidad_mbps) > 0 ? Number(p.velocidad_mbps) : 0;
    const velocidadInf = velocidadDB > 0 ? velocidadDB : inferirVelocidad(nombre);
    const datosDB      = Number(p.datos_gb) || 0;
    const datosInf     = datosDB !== 0 ? datosDB : inferirDatos(nombre, tipo);

    // Descartar inválidos
    if (precio > 0 && precio < 20000)                           return { ...p, _score: -100, _velocidadInf: 0 };
    if (!precio && !velocidadInf && !datosInf && tipo !== "tv") return { ...p, _score: -100, _velocidadInf: 0 };
    if (esNombreInvalido(nombre))                               return { ...p, _score: -100, _velocidadInf: 0 };

    let score = 0;

    // Precio vs presupuesto (40 pts)
    if (precio > 0 && precioMax > 0) {
      if      (precio <= precioMax)        score += 40;
      else if (precio <= precioMax * 1.15) score += 25;
      else if (precio <= precioMax * 1.30) score += 10;
      else                                 score -= 20;
    }

    // Tipo de plan (30 pts)
    if      (tipo === tiposRelevantes[0])    score += 30;
    else if (tiposRelevantes.includes(tipo)) score += 15;

    // Velocidad vs consumo (25 pts)
    if (velocidadInf > 0 && mbpsRecomendado > 0) {
      const ratio = velocidadInf / mbpsRecomendado;
      if      (ratio >= 2.0) score += 25;
      else if (ratio >= 1.5) score += 20;
      else if (ratio >= 1.0) score += 14;
      else if (ratio >= 0.7) score += 8;
      else                   score += 2;
    } else {
      const precioRatio = precioMax > 0 && precio > 0 ? precio / precioMax : 1;
      const base = categoriaConsumo === "basico" ? 10 : categoriaConsumo === "medio" ? 6 : 3;
      score += Math.round(base * (1 - Math.min(precioRatio, 1) * 0.4));
    }

    // TV (15 pts)
    if (necesitaTV) {
      if      (canales > 50)                 score += 15;
      else if (canales > 0 || tipo === "tv") score += 8;
      else if (tipo === "paquete")           score += 5;
    }

    // Gaming (15 pts)
    if (necesitaGaming) {
      if      (velocidadInf >= 200)                     score += 15;
      else if (velocidadInf >= 100)                     score += 10;
      else if (velocidadInf >= 50)                      score += 5;
      else if (/fibra|fiber/i.test(nombre))             score += 7;
      else if (/fibra|fiber/i.test(p.tecnologia ?? "")) score += 7;
    }

    // Datos móviles (10 pts)
    if (necesitaMovil) {
      if      (datosInf === -1) score += 10;
      else if (datosInf >= 20)  score += 8;
      else if (datosInf >= 5)   score += 4;
      else if (datosInf > 0)    score += 2;
    }

    // Bonus paquete 4+ dispositivos
    if (resumen.desglose.length >= 4 && tipo === "paquete") score += 8;

    // Bonus fibra
    const tec = (p.tecnologia ?? "").toLowerCase();
    if (/fibra|fiber/i.test(tec) || /fibra|fiber/i.test(nombre)) score += 5;

    return {
      ...p,
      _score:        Math.round(score),
      _velocidadInf: velocidadInf,
      velocidad_mbps: velocidadDB || (velocidadInf > 0 ? velocidadInf : null),
      datos_gb:       datosDB     || (datosInf   !== 0 ? datosInf    : null),
    };
  });

  // Filtrar y ordenar
  const validos = scored
    .filter((p: any) => p._score > 0)
    .sort((a: any, b: any) =>
      b._score !== a._score
        ? b._score - a._score
        : (Number(a.precio) || 0) - (Number(b.precio) || 0)
    );

  // Un plan por operador
  const resultado: any[] = [];
  const ops = new Set<string>();
  for (const plan of validos) {
    if (resultado.length >= maxResultados) break;
    const op = (plan.operador ?? "").toLowerCase().trim();
    if (!ops.has(op)) { resultado.push(plan); ops.add(op); }
  }

  if (resultado.length === 0) return [];

  // Badges semánticos
  const scoreMax  = Math.max(...resultado.map((p: any) => p._score));
  const velMax    = Math.max(...resultado.map((p: any) => p._velocidadInf || 0));
  const precioMin = Math.min(...resultado.map((p: any) => Number(p.precio) || Infinity));
  const usados    = new Set<string>();

  const withBadges = resultado.map((p: any) => ({ ...p, badge: "" }));

  for (const p of withBadges) {
    if (!p.badge && p._score === scoreMax && !usados.has("oferta")) {
      p.badge = "🏆 Mejor Oferta"; usados.add("oferta");
    }
  }
  for (const p of withBadges) {
    if (!p.badge && velMax > 0 && p._velocidadInf === velMax && !usados.has("velocidad")) {
      p.badge = "⚡ Mejor Velocidad"; usados.add("velocidad");
    }
  }
  for (const p of withBadges) {
    if (!p.badge && Number(p.precio) === precioMin && !usados.has("precio")) {
      p.badge = "💰 Mejor Precio"; usados.add("precio");
    }
  }
  withBadges.forEach((p: any, i: number) => {
    if (!p.badge) p.badge = `#${i + 1}`;
  });

  return withBadges.map((p: any) => ({
    ...p,
    precio:       Number(p.precio) || 0,
    nombreLimpio: limpiarNombre(p.nombre ?? "", p.operador ?? ""),
    glow:         colorOperador(p.operador ?? ""),
    top:          p.badge === "🏆 Mejor Oferta",
  }));
}

// ── 3. Ecosistema ─────────────────────────────────────────────
export function recomendarEcosistema(resumen: ResumenConsumo) {
  const { mbpsRecomendado, necesitaGaming, desglose } = resumen;
  const eco: Array<{ emoji: string; nombre: string; razon: string; precio: number }> = [];
  if (mbpsRecomendado > 100) eco.push({ emoji: "📡", nombre: "Router WiFi 6 AX3000", razon: "Necesitas mayor cobertura y velocidad en el hogar", precio: 189900 });
  if (desglose.length > 3)   eco.push({ emoji: "📶", nombre: "Sistema Mesh Tenda MW6", razon: "Elimina zonas sin señal con múltiples dispositivos", precio: 289900 });
  if (necesitaGaming)        eco.push({ emoji: "🎮", nombre: "Cable Ethernet Cat8 10m", razon: "Latencia ultra-baja para gaming — sin pérdida de paquetes", precio: 29900 });
  return eco;
}

// ── 4. Explicación ────────────────────────────────────────────
export function generarExplicacion(resumen: ResumenConsumo): string {
  const { categoriaConsumo, desglose } = resumen;
  const top = [...desglose].sort((a, b) => b.mbps - a.mbps).slice(0, 2).map((d) => `${d.emoji} ${d.name}`).join(" y ");
  const mensajes: Record<string, string> = {
    basico:    `Tu hogar tiene un consumo liviano. Con ${top} como principales dispositivos, un plan de entrada te dará buena experiencia.`,
    medio:     `Tu hogar tiene un consumo moderado. ${top} son tus dispositivos más exigentes — necesitas un plan que soporte uso simultáneo.`,
    intensivo: `Tu hogar es de alto consumo. Con ${top} y ${desglose.length} dispositivos conectados, necesitas un plan robusto para evitar cortes.`,
  };
  return mensajes[categoriaConsumo] ?? "";
}
