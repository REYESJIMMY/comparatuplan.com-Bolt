/**
 * smartComparator.ts — ComparaTuPlan.com
 * v5: Scoring mejorado para perfiles con TV/gaming/múltiples dispositivos,
 *     badges semánticos garantizados, penalización por velocidad insuficiente.
 */

import { DeviceAdded, PersonasHogar, PERSONAS_CONFIG, NivelUso } from "./constants";

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

// ── Colores ───────────────────────────────────────────────────
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

// ── Nombres inválidos ─────────────────────────────────────────
const INVALIDOS: RegExp[] = [
  /\bldi\b/i, /\bwaze\b/i, /\bsms\b/i, /chat ilimitado/i,
  /redes sociales/i, /\bwhatsapp\b/i, /minutos internacion/i,
  /\bbolsa\b/i, /\broaming\b/i, /\bhog\b/i, /\bhandoff\b/i,
  /\bwholesale\b/i, /^single internet \d+m hog/i,
];

function esInvalido(nombre: string): boolean {
  return INVALIDOS.some((re) => re.test(nombre));
}

// ── Limpiar nombre para UI ────────────────────────────────────
export function limpiarNombre(nombre: string): string {
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

// ── Inferir velocidad (case-insensitive) ──────────────────────
export function inferirVelocidad(nombre: string): number {
  const explicitoMatch = nombre.match(/(\d+)\s*mb(?:ps)?(?!\s*\/)/i);
  if (explicitoMatch) {
    const v = parseInt(explicitoMatch[1]);
    if (v >= 1 && v <= 10000) return v;
  }
  const bandaMatch = nombre.match(/[Bb]anda?\s*[Aa]ncha\s+(\d+)/i);
  if (bandaMatch) {
    const v = parseInt(bandaMatch[1]);
    if (v >= 1 && v <= 10000) return v;
  }
  const mMatch = nombre.match(/\b(\d+)\s*[Mm](?:egas?)?\b/);
  if (mMatch) {
    const v = parseInt(mMatch[1]);
    if (v >= 1 && v <= 10000) return v;
  }
  if (/1\s*gig(?:a|abit)?/i.test(nombre) || /1000\s*mbps/i.test(nombre)) return 1000;
  if (!/\d/.test(nombre)) {
    if (/fibra|fiber/i.test(nombre))                    return 100;
    if (/5g/i.test(nombre) && !/5\s*gb/i.test(nombre)) return 300;
    if (/4g|lte/i.test(nombre))                         return 50;
    if (/adsl/i.test(nombre))                           return 20;
  }
  return 0;
}

function inferirDatos(nombre: string, tipo: string): number {
  if (!["movil", "paquete"].includes(tipo)) return 0;
  if (/ilimitad|unlimited/i.test(nombre)) return -1;
  const gb = nombre.match(/(\d+)\s*gb/i);
  if (gb) return parseInt(gb[1]);
  const mb = nombre.match(/(\d+)\s*mb(?!\s*ps)(?!\s*\/s)/i);
  if (mb) return Math.round(parseInt(mb[1]) / 1024);
  return 0;
}

// ── 1. Calcular consumo ───────────────────────────────────────
export function calcularConsumo(
  devices:    DeviceAdded[],
  personas:   PersonasHogar,
  avatar:     AvatarConfig,
  deviceDefs: readonly any[]
): ResumenConsumo {
  const personasConf = PERSONAS_CONFIG[personas];
  const desglose = devices.map((d) => {
    const def = deviceDefs.find((x) => x.id === d.id);
    return { uid: d.uid, name: d.name, emoji: d.emoji, nivel: d.nivel, usoDesc: def?.usoDesc?.[d.nivel] ?? "", mbps: d.mbps, color: d.color };
  });

  const mbpsBase            = desglose.reduce((acc, d) => acc + d.mbps, 0);
  const factorSimultaneidad = personasConf.factor;
  const factorAvatar        = avatar.factorVelocidad;
  const mbpsNecesarios      = Math.ceil(mbpsBase * factorSimultaneidad * factorAvatar);
  const mbpsRecomendado     = Math.ceil(mbpsNecesarios * 1.2);

  let categoriaConsumo: "basico" | "medio" | "intensivo";
  let etiquetaConsumo: string;
  let colorConsumo: string;

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

  // Tipos relevantes — TV siempre empuja a paquete primero
  let tiposRelevantes: string[];
  if (necesitaTV) tiposRelevantes = ["paquete", "internet", "tv"];
  else            tiposRelevantes = ["internet", "paquete"];

  return {
    desglose, mbpsBase, factorSimultaneidad, factorAvatar,
    mbpsNecesarios, mbpsRecomendado, categoriaConsumo,
    etiquetaConsumo, colorConsumo, necesitaTV, necesitaGaming,
    necesitaMovil, necesitaTrabajo, tiposRelevantes,
    precioMax: avatar.precioMax,
  };
}

// ── 2. Scorar planes ──────────────────────────────────────────
export function scorarPlanes(
  planes:        any[],
  resumen:       ResumenConsumo,
  maxResultados: number = 4,
  presupuesto?:  number   // presupuesto manual del usuario (opcional)
): PlanScorado[] {
  const {
    tiposRelevantes, necesitaTV, necesitaGaming,
    necesitaMovil, mbpsRecomendado, categoriaConsumo, desglose,
  } = resumen;

  // Usar presupuesto manual si existe, si no el del avatar
  const precioMax = presupuesto ?? resumen.precioMax;

  // ── Deduplicar por operador+tipo+precio+velocidad ─────────
  const seen = new Map<string, any>();
  for (const p of planes) {
    const op    = (p.operador ?? "").toLowerCase().trim();
    const tipo  = (p.tipo ?? "").toLowerCase().trim();
    const precio = Number(p.precio) || 0;
    const vel   = Number(p.velocidad_mbps) || inferirVelocidad(p.nombre ?? "");
    const velKey = vel > 0 ? `v${vel}` : (p.nombre ?? "").toLowerCase().replace(/\s+/g, " ").trim();
    const key   = `${op}|${tipo}|${precio}|${velKey}`;
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
    if (esInvalido(nombre))                                     return { ...p, _score: -100, _velocidadInf: 0 };

    let score = 0;

    // ── 1. Precio vs presupuesto (35 pts) ─────────────────────
    if (precio > 0 && precioMax > 0) {
      if      (precio <= precioMax * 0.7)  score += 35; // muy por debajo → excelente valor
      else if (precio <= precioMax)        score += 30;
      else if (precio <= precioMax * 1.15) score += 18;
      else if (precio <= precioMax * 1.30) score += 8;
      else                                 score -= 25; // muy caro → penalizar fuerte
    }

    // ── 2. Tipo de plan (35 pts) ──────────────────────────────
    // v5: TV siempre necesita paquete → bonus fuerte
    if (tipo === tiposRelevantes[0])       score += 35;
    else if (tiposRelevantes.includes(tipo)) score += 18;
    // Bonus extra si necesita TV y el plan tiene canales
    if (necesitaTV && (canales > 0 || tipo === "tv" || tipo === "paquete")) score += 10;

    // ── 3. Velocidad vs consumo (30 pts) ──────────────────────
    if (velocidadInf > 0 && mbpsRecomendado > 0) {
      const ratio = velocidadInf / mbpsRecomendado;
      if      (ratio >= 2.0)  score += 30;
      else if (ratio >= 1.5)  score += 24;
      else if (ratio >= 1.0)  score += 18;
      else if (ratio >= 0.7)  score += 10;
      else                    score -= 10; // v5: penalizar si velocidad < 70% de lo necesario
    } else {
      // Sin velocidad conocida → bonus neutro proporcional al precio
      const r = precioMax > 0 && precio > 0 ? precio / precioMax : 1;
      const base = categoriaConsumo === "basico" ? 10 : categoriaConsumo === "medio" ? 6 : 3;
      score += Math.round(base * (1 - Math.min(r, 1) * 0.4));
    }

    // ── 4. Canales TV (20 pts) ────────────────────────────────
    if (necesitaTV) {
      if      (canales > 100) score += 20;
      else if (canales > 50)  score += 15;
      else if (canales > 0)   score += 10;
      else if (tipo === "tv" || tipo === "paquete") score += 5;
    }

    // ── 5. Gaming — bonus fibra/alta velocidad (15 pts) ───────
    if (necesitaGaming) {
      if      (velocidadInf >= 300)                       score += 15;
      else if (velocidadInf >= 200)                       score += 12;
      else if (velocidadInf >= 100)                       score += 8;
      else if (/fibra|fiber/i.test(nombre))               score += 6;
      else if (/fibra|fiber/i.test(p.tecnologia ?? ""))   score += 6;
    }

    // ── 6. Datos móviles (10 pts) ─────────────────────────────
    if (necesitaMovil) {
      if      (datosInf === -1) score += 10;
      else if (datosInf >= 20)  score += 7;
      else if (datosInf >= 5)   score += 4;
      else if (datosInf > 0)    score += 2;
    }

    // ── 7. Bonus hogar intensivo ──────────────────────────────
    // v5: hogar con 4+ dispositivos y consumo intensivo → paquete vale más
    if (desglose.length >= 4 && tipo === "paquete") score += 12;
    if (desglose.length >= 8 && tipo === "paquete") score += 8; // bonus adicional para hogares grandes

    // ── 8. Bonus fibra ────────────────────────────────────────
    const tec = (p.tecnologia ?? "").toLowerCase();
    if (/fibra|fiber/i.test(tec) || /fibra|fiber/i.test(nombre)) score += 6;

    return {
      ...p,
      _score:        Math.round(score),
      _velocidadInf: velocidadInf,
      velocidad_mbps: velocidadDB || (velocidadInf > 0 ? velocidadInf : null),
      datos_gb:       datosDB     || (datosInf !== 0 ? datosInf : null),
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

  // ── Badges semánticos garantizados ───────────────────────────
  // Cada plan recibe un badge distinto basado en su atributo real
  const scoreMax  = Math.max(...resultado.map((p: any) => p._score));
  const velMax    = Math.max(...resultado.map((p: any) => p._velocidadInf || 0));
  const precioMin = Math.min(...resultado.map((p: any) => Number(p.precio) || Infinity));

  // Asignar badges por posición garantizada — sin depender de empates
  return resultado.map((p: any, i: number) => {
    let badge: string;
    if (i === 0) {
      badge = "🏆 Mejor Oferta";
    } else if (i === 1) {
      // Segundo: ¿tiene la mayor velocidad? → Mejor Velocidad, si no → Mejor Precio
      const esElMasRapido = velMax > 0 && p._velocidadInf === velMax;
      badge = esElMasRapido ? "⚡ Mejor Velocidad" : "💰 Mejor Precio";
    } else if (i === 2) {
      // Tercero: el badge que no tomó el segundo
      const segundoBadge = resultado[1]._velocidadInf === velMax && velMax > 0
        ? "⚡ Mejor Velocidad" : "💰 Mejor Precio";
      badge = segundoBadge === "⚡ Mejor Velocidad" ? "💰 Mejor Precio" : "⚡ Mejor Velocidad";
    } else {
      // Cuarto en adelante
      const badgesUsados = resultado.slice(0, i).map((_: any, j: number) =>
        j === 0 ? "🏆 Mejor Oferta" :
        j === 1 ? (resultado[1]._velocidadInf === velMax && velMax > 0 ? "⚡ Mejor Velocidad" : "💰 Mejor Precio") :
        "💰 Mejor Precio"
      );
      if (!badgesUsados.includes("⚡ Mejor Velocidad")) badge = "⚡ Mejor Velocidad";
      else if (!badgesUsados.includes("💰 Mejor Precio")) badge = "💰 Mejor Precio";
      else badge = `#${i + 1}`;
    }

    return {
      ...p,
      precio:       Number(p.precio) || 0,
      nombreLimpio: limpiarNombre(p.nombre ?? ""),
      glow:         colorOperador(p.operador ?? ""),
      top:          i === 0,
      badge,
    };
  });
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
export interface PlanScorado {
export interface ResumenConsumo {
export function calcularConsumo(
export function scorarPlanes(
export function recomendarEcosistema(
  const { categoriaConsumo, desglose, necesitaTV, necesitaGaming } = resumen;
  const top = [...desglose].sort((a, b) => b.mbps - a.mbps).slice(0, 2).map((d) => `${d.emoji} ${d.name}`).join(" y ");

  if (necesitaTV && necesitaGaming) {
    return `Tu hogar combina entretenimiento y gaming de alto rendimiento. Con ${desglose.length} dispositivos activos simultáneamente, necesitas un paquete con alta velocidad y canales de TV.`;
  }
  if (necesitaTV) {
    return `Tu hogar tiene múltiples pantallas activas. Un paquete con internet de alta velocidad y TV incluida es tu mejor alternativa para ${desglose.length} dispositivos.`;
  }

  const mensajes: Record<string, string> = {
    basico:    `Tu hogar tiene un consumo liviano. Con ${top} como principales dispositivos, un plan de entrada te dará buena experiencia.`,
    medio:     `Tu hogar tiene un consumo moderado. ${top} son tus dispositivos más exigentes — necesitas un plan que soporte uso simultáneo.`,
    intensivo: `Tu hogar es de alto consumo. Con ${top} y ${desglose.length} dispositivos conectados, necesitas un plan robusto para evitar cortes.`,
  };
  return mensajes[categoriaConsumo] ?? "";
}
