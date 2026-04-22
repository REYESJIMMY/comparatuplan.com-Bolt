/**
 * smartComparator.ts — ComparaTuPlan.com
 * ─────────────────────────────────────────────────────────────
 * Motor de cálculo de consumo y recomendación de planes.
 * Separado del GameFlow para ser reutilizable en el catálogo,
 * la página de detalle y futuras integraciones.
 */

import { DeviceAdded, PersonasHogar, PERSONAS_CONFIG, NivelUso } from "./constants";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface AvatarConfig {
  id:              string;
  factorVelocidad: number;   // multiplicador adicional según perfil
  precioMax:       number;   // presupuesto máximo mensual en COP
}

export interface ResumenConsumo {
  // Por dispositivo
  desglose: Array<{
    uid:       string;
    name:      string;
    emoji:     string;
    nivel:     NivelUso;
    usoDesc:   string;
    mbps:      number;
    color:     string;
  }>;

  // Totales
  mbpsBase:           number;   // suma pura de todos los dispositivos
  factorSimultaneidad: number;  // según personas en el hogar
  factorAvatar:       number;   // según perfil seleccionado
  mbpsNecesarios:     number;   // base × factorSim × factorAvatar
  mbpsRecomendado:    number;   // necesarios × 1.2 (margen overhead)

  // Clasificación del hogar
  categoriaConsumo:   "basico" | "medio" | "intensivo";
  etiquetaConsumo:    string;
  colorConsumo:       string;

  // Flags de servicio (para filtrar planes)
  necesitaTV:         boolean;
  necesitaGaming:     boolean;
  necesitaMovil:      boolean;
  necesitaTrabajo:    boolean;

  // Para scoring de planes
  tiposRelevantes:    string[];
  precioMax:          number;
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

// ── Nombres inválidos (planes que no son comparables) ─────────────────────────
const NOMBRES_INVALIDOS = [
  "ldi", "waze", "sms", "chat ilimitado", "redes sociales",
  "whatsapp", "minutos internacional", "internacional",
  "mensajes", "bolsa de minutos", "roaming", "llamadas internacionales",
];

// ── 1. Calcular resumen de consumo del hogar ──────────────────────────────────
export function calcularConsumo(
  devices:   DeviceAdded[],
  personas:  PersonasHogar,
  avatar:    AvatarConfig,
  deviceDefs: readonly any[]  // DEVICES de constants.ts
): ResumenConsumo {

  const personasConf = PERSONAS_CONFIG[personas];

  // Desglose por dispositivo
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

  // Totales
  const mbpsBase           = desglose.reduce((acc, d) => acc + d.mbps, 0);
  const factorSimultaneidad = personasConf.factor;
  const factorAvatar       = avatar.factorVelocidad;
  const mbpsNecesarios     = Math.ceil(mbpsBase * factorSimultaneidad * factorAvatar);
  const mbpsRecomendado    = Math.ceil(mbpsNecesarios * 1.2);

  // Categoría de consumo
  let categoriaConsumo: "basico" | "medio" | "intensivo";
  let etiquetaConsumo:  string;
  let colorConsumo:     string;

  if (mbpsRecomendado <= 50) {
    categoriaConsumo = "basico";
    etiquetaConsumo  = "Consumo básico";
    colorConsumo     = "#10b981";
  } else if (mbpsRecomendado <= 150) {
    categoriaConsumo = "medio";
    etiquetaConsumo  = "Consumo moderado";
    colorConsumo     = "#f59e0b";
  } else {
    categoriaConsumo = "intensivo";
    etiquetaConsumo  = "Consumo intensivo";
    colorConsumo     = "#ef4444";
  }

  // Flags de servicio
  const ids              = devices.map((d) => d.id);
  const necesitaTV       = ids.some((id) => ["tv", "decoder"].includes(id));
  const necesitaGaming   = ids.some((id) => ["console", "pc"].includes(id));
  const necesitaMovil    = ids.some((id) => id === "phone");
  const necesitaTrabajo  = ids.some((id) => ["laptop", "pc"].includes(id));

  // Tipos de plan relevantes (orden de prioridad)
  let tiposRelevantes: string[];
  if (necesitaTV && mbpsBase > 0) {
    tiposRelevantes = ["paquete", "internet", "tv"];
  } else if (necesitaTV) {
    tiposRelevantes = ["paquete", "tv"];
  } else if (necesitaMovil && mbpsBase <= 20) {
    tiposRelevantes = ["movil", "internet"];
  } else {
    tiposRelevantes = ["internet", "paquete", "movil"];
  }

  return {
    desglose,
    mbpsBase,
    factorSimultaneidad,
    factorAvatar,
    mbpsNecesarios,
    mbpsRecomendado,
    categoriaConsumo,
    etiquetaConsumo,
    colorConsumo,
    necesitaTV,
    necesitaGaming,
    necesitaMovil,
    necesitaTrabajo,
    tiposRelevantes,
    precioMax: avatar.precioMax,
  };
}

// ── 2. Scorar y rankear planes ────────────────────────────────────────────────
export function scorarPlanes(
  planes:  any[],
  resumen: ResumenConsumo,
  maxResultados: number = 3
): PlanScorado[] {

  const { tiposRelevantes, precioMax, necesitaTV, necesitaGaming,
          necesitaMovil, mbpsRecomendado } = resumen;

  const scored = planes.map((p: any) => {
    const precio    = Number(p.precio)        || 0;
    const datos     = Number(p.datos_gb)      || 0;
    const canales   = Number(p.canales_tv)    || 0;
    const velocidad = Number(p.velocidad_mbps) || 0;
    const nombre    = (p.nombre ?? "").toLowerCase();

    // Descartar planes inválidos
    if (precio > 0 && precio < 20000)                            return { ...p, _score: -100 };
    if (!velocidad && !datos && !p.precio && p.tipo !== "tv") return { ...p, _score: -100 };
    if (NOMBRES_INVALIDOS.some((x) => nombre.includes(x)))       return { ...p, _score: -100 };

    let score = 0;

    // ── Precio vs presupuesto (40 puntos máx) ─────────────────
    if (precio > 0 && precioMax > 0) {
      if      (precio <= precioMax)         score += 40;
      else if (precio <= precioMax * 1.15)  score += 25;
      else if (precio <= precioMax * 1.30)  score += 10;
      else                                  score -= 15;
    }

    // ── Tipo de plan (30 puntos máx) ─────────────────────────
    if      (p.tipo === tiposRelevantes[0])       score += 30;
    else if (tiposRelevantes.includes(p.tipo))    score += 15;

    // ── TV (15 puntos máx) ────────────────────────────────────
    if (necesitaTV) {
      if      (canales > 50)                      score += 15;
      else if (canales > 0 || p.tipo === "tv")    score += 8;
      else if (p.tipo === "paquete")              score += 5;
    }

    // ── Gaming (15 puntos máx) ────────────────────────────────
    if (necesitaGaming) {
      if      (velocidad >= 200)                  score += 15;
      else if (velocidad >= 100)                  score += 10;
      else if (velocidad >= 50)                   score += 5;
    }

    // ── Velocidad vs consumo recomendado (20 puntos máx) ─────
    // Solo aplica cuando velocidad_mbps existe en Supabase
    if (velocidad > 0 && mbpsRecomendado > 0) {
      const ratio = velocidad / mbpsRecomendado;
      if      (ratio >= 2.0) score += 20;   // sobra velocidad — ideal
      else if (ratio >= 1.5) score += 15;
      else if (ratio >= 1.0) score += 10;   // justo lo necesario
      else if (ratio >= 0.7) score += 5;
      else                   score += 1;
    }

    // ── Datos móviles (10 puntos máx) ─────────────────────────
    if (necesitaMovil) {
      if      (datos === -1) score += 10;   // ilimitados
      else if (datos >= 20)  score += 8;
      else if (datos >= 5)   score += 4;
      else if (datos > 0)    score += 2;
    }

    // ── Bonus paquete para hogares con muchos dispositivos ────
    if (planes.length >= 4 && p.tipo === "paquete") score += 8;

    return { ...p, _score: Math.round(score) };
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

  // Asignar badges y colores
  const BADGES = ["🏆 Mejor Oferta", "⚡ Mejor Velocidad", "💰 Mejor Precio"];
  const GLOWS  = ["#f59e0b",          "#00d4ff",            "#10b981"];

  return resultado.map((p, i) => ({
    ...p,
    precio:   Number(p.precio) || 0,
    badge:    BADGES[i] ?? `#${i + 1}`,
    glow:     GLOWS[i]  ?? "#fff",
    top:      i === 0,
  }));
}

// ── 3. Recomendaciones de ecosistema (accesorios) ─────────────────────────────
export function recomendarEcosistema(resumen: ResumenConsumo) {
  const { mbpsRecomendado, necesitaGaming, desglose } = resumen;
  const eco: Array<{ emoji: string; nombre: string; razon: string; precio: number }> = [];

  if (mbpsRecomendado > 100) {
    eco.push({
      emoji:  "📡",
      nombre: "Router WiFi 6 AX3000",
      razon:  "Necesitas mayor cobertura y velocidad en el hogar",
      precio: 189900,
    });
  }
  if (desglose.length > 3) {
    eco.push({
      emoji:  "📶",
      nombre: "Sistema Mesh Tenda MW6",
      razon:  "Elimina zonas sin señal con múltiples dispositivos",
      precio: 289900,
    });
  }
  if (necesitaGaming) {
    eco.push({
      emoji:  "🎮",
      nombre: "Cable Ethernet Cat8 10m",
      razon:  "Latencia ultra-baja para gaming — sin pérdida de paquetes",
      precio: 29900,
    });
  }

  return eco;
}

// ── 4. Texto explicativo del resultado ────────────────────────────────────────
export function generarExplicacion(resumen: ResumenConsumo): string {
  const { mbpsBase, mbpsRecomendado, factorSimultaneidad,
          categoriaConsumo, desglose } = resumen;

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
