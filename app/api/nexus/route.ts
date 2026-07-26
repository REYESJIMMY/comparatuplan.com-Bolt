import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ── Supabase admin — se instancia dentro del handler ────────
   No instanciar en module scope: Next.js evalúa el módulo
   en build time y las env vars aún no están disponibles.    */
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key);
}

const OPERADORES_FASE1 = ["Claro", "Movistar", "Etb", "Tigo", "Wom"]; // casings exactos de DB

/* ── Detectar intent del mensaje ────────────────────────────── */
function detectIntent(msg: string) {
  const s = msg.toLowerCase();
  const tipo =
    s.match(/móvil|movil|celular|prepago|pospago|datos|gb/) ? "movil" :
    s.match(/internet|fibra|hogar|casa|mbps|megas/)         ? "internet" :
    s.match(/tv|television|televisión|paquete|combo/)       ? "paquete" :
    null;

  const operador = OPERADORES_FASE1.find(op =>
    s.includes(op.toLowerCase())
  ) ?? null;

  const presupuesto = (() => {
    const m = s.match(/(\d[\d.,]*)\s*(mil|k|pesos|cop)?/);
    if (!m) return null;
    const n = parseFloat(m[1].replace(/[.,]/g, ""));
    return m[2]?.match(/mil|k/) ? n * 1000 : n > 500 ? n : null;
  })();

  return { tipo, operador, presupuesto };
}

/* ── Traer planes relevantes de Supabase ────────────────────── */
async function fetchPlanesContexto(intent: ReturnType<typeof detectIntent>) {
  const supabase = getSupabase();
  let query = supabase
    .from("planes")
    .select("operador, nombre, precio, tipo, duracion_unidad, servicios")
    .in("operador", OPERADORES_FASE1)
    .order("precio", { ascending: true });

  if (intent.tipo)      query = query.eq("tipo", intent.tipo);
  if (intent.operador)  query = query.eq("operador", intent.operador);
  if (intent.presupuesto) query = query.lte("precio", intent.presupuesto * 1.15);

  const { data, error } = await query.limit(25);
  if (error || !data?.length) {
    // Fallback: top planes sin filtro
    const { data: fallback } = await getSupabase()
      .from("planes")
      .select("operador, nombre, precio, tipo, duracion_unidad, servicios")
      .in("operador", OPERADORES_FASE1)
      .order("precio", { ascending: true })
      .limit(20);
    return fallback ?? [];
  }
  return data;
}

/* ── Construir system prompt con datos reales ───────────────── */
function buildSystemPrompt(planes: any[]) {
  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Agrupar por operador para el contexto
  const porOperador: Record<string, any[]> = {};
  for (const p of planes) {
    if (!porOperador[p.operador]) porOperador[p.operador] = [];
    porOperador[p.operador].push(p);
  }

  const planesTexto = Object.entries(porOperador)
    .map(([op, ps]) => {
      const lista = ps.map(p =>
        `  • ${p.nombre} | $${Number(p.precio).toLocaleString("es-CO")}/mes | tipo: ${p.tipo}${p.servicios ? ` | incluye: ${p.servicios}` : ""}`
      ).join("\n");
      return `${op}:\n${lista}`;
    }).join("\n\n");

  return `Eres Nexus, el asistente inteligente de ComparaTuPlan.com — el comparador #1 de telecomunicaciones en Colombia.

FECHA ACTUAL: ${fecha}
OPERADORES DISPONIBLES EN FASE 1: ${OPERADORES_FASE1.join(", ")}

PLANES REALES DEL CATÁLOGO (actualizados desde la CRC):
${planesTexto}

REGLAS ESTRICTAS:
- Solo recomienda planes que estén en la lista de arriba. NUNCA inventes precios ni planes.
- Si el usuario pregunta por un operador que no está en la lista, dile que próximamente se agregarán más operadores.
- Si no tienes suficiente info para recomendar (no sabes el tipo de servicio o presupuesto), PREGUNTA antes de recomendar.
- Responde siempre en español colombiano, tono amigable y directo.
- Sé conciso: máximo 3-4 líneas por respuesta. Si recomiendas planes, muestra máximo 3.
- Cuando menciones precios, usa formato colombiano: $89.900/mes
- Al final de una recomendación, siempre agrega: "¿Quieres ver más detalles? Visita [el catálogo](/planes)"
- NO repitas el mismo plan dos veces en la misma conversación.
- Si el usuario quiere contratar, dile que puede hacerlo por WhatsApp desde la card del plan.`;
}

/* ── POST handler ────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    const lastUserMsg = messages.findLast(m => m.role === "user")?.content ?? "";
    const intent = detectIntent(lastUserMsg);
    const planes = await fetchPlanesContexto(intent);
    const systemPrompt = buildSystemPrompt(planes);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // Haiku: rápido y barato para chat
        max_tokens: 400,
        system: systemPrompt,
        messages: messages.slice(-6), // Últimos 6 turnos de contexto
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[Nexus] Claude API error:", err);
      return NextResponse.json(
        { reply: "Lo siento, tuve un problema técnico. Intenta de nuevo 🙏" },
        { status: 200 }
      );
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? "No obtuve respuesta. Intenta de nuevo.";

    return NextResponse.json({ reply });

  } catch (err) {
    console.error("[Nexus] Error:", err);
    return NextResponse.json(
      { reply: "Ocurrió un error inesperado. Por favor intenta de nuevo." },
      { status: 200 } // 200 para que el frontend lo maneje sin crash
    );
  }
}
