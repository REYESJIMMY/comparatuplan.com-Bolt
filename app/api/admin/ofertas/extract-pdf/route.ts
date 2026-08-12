import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/* ── Tipos ───────────────────────────────────────────────────── */
interface OfertaExtraida {
  titulo: string;
  operador: string | null;
  descripcion: string | null;
  precio: number | null;
  precio_antes: number | null;
  tipo: string | null; // internet | movil | paquete | tv
  badge: string | null;
  emoji: string;
  color: string;
  fecha_fin: string | null; // YYYY-MM-DD
  estrato_min: number | null;  // null = sin estrato específico, aplica a todos
  estrato_max: number | null;
  codigo_oferta: string | null; // ej. "FMC 25534", "101193"
  localidades: string[] | null; // null = nacional; array si es oferta regional/localidades específicas
}

const OP_COLORS: Record<string, string> = {
  claro: "#e2001a",
  movistar: "#00aa44",
  etb: "#f59e0b",
  tigo: "#00a0e3",
  wom: "#a855f7",
};

const TIPO_EMOJI: Record<string, string> = {
  internet: "📡",
  movil: "📱",
  paquete: "📺",
  tv: "📺",
  equipo: "💻",
};

/* ── Prompt de extracción ────────────────────────────────────── */
const SYSTEM_PROMPT = `Eres un extractor de ofertas comerciales de telecomunicaciones B2CB en Colombia (Movistar, Tigo, Claro, ETB, WOM).

Te llega un documento PDF (un "léeme" o brochure comercial interno) que contiene una o varias ofertas de internet fijo (fibra), planes móviles, paquetes convergentes (fijo+móvil) o TV, válidas por un período limitado.

Tu tarea: extraer SOLO las ofertas de cara al cliente final con un precio explícito y una vigencia clara (ej. "válida del 1 al 18 de agosto de 2026"), pensadas para publicarse en un comparador de planes dirigido al público.

IGNORA por completo:
- Diapositivas de contacto, redes sociales, canales de atención, portadas y agradecimientos
- Texto legal / términos y condiciones extensos (úsalo solo para inferir la fecha de vigencia si no aparece en la diapositiva de precio)
- Tablas internas de codificación (Nabis, códigos de descuento, "marcación especial", troncales SIP, cobro revertido, numerales especiales) salvo que tengan un precio final claro al cliente
- Contenido de catálogos de streaming (HBO, Paramount+) que no sea en sí mismo una oferta con precio propio

IMPORTANTE — Estrato socioeconómico:
Algunas ofertas de internet fijo/TV/paquetes muestran precios DISTINTOS según rangos de estrato socioeconómico (ej. "Estrato 1 al 3" con un precio y código, "Estrato 4 al 6" con otro precio y código, cada tramo con su propio código de plan/FMC). Cuando esto ocurra:
- Genera un objeto JSON SEPARADO por cada tramo de estrato, repitiendo título, operador, tipo, descripción, badge y fecha_fin, pero con el "precio", "estrato_min", "estrato_max" y "codigo_oferta" correspondientes a ESE tramo específico.
- Si la oferta NO menciona estrato en absoluto (la mayoría de ofertas móviles y muchas fijas nacionales), deja "estrato_min" y "estrato_max" en null — significa que aplica a todos los estratos por igual.

IMPORTANTE — Localidades:
Si la oferta indica que es exclusiva para una lista específica de ciudades/municipios o regionales (ej. "Oferta exclusiva para las siguientes localidades: Bogotá, Cali, Medellín..."), captura esa lista completa en "localidades". Si la oferta es nacional o no menciona restricción geográfica, deja "localidades" en null.

Para cada oferta detectada, genera un objeto con estos campos EXACTOS:
{
  "titulo": string corto y claro, ej. "Fibra 700 Mbps + IPTV",
  "operador": "Claro" | "Movistar" | "Etb" | "Tigo" | "Wom" | null,
  "descripcion": 1-2 frases con los beneficios clave (velocidad, datos, canales, roaming, etc.),
  "precio": number (precio final mensual en pesos COP, SIN separadores de miles, ej 101090). Si hay precio con y sin descuento, usa el precio final con descuento.
  "precio_antes": number o null (precio de lista antes de descuento, solo si aparece explícito, ej tachado),
  "tipo": "internet" | "movil" | "paquete" | "tv",
  "badge": string corto o null, ej. "OFERTA ESPECIAL B2B", "SOLO PYMES", "50% DTO",
  "fecha_fin": "YYYY-MM-DD" (última fecha de vigencia de la oferta, convertida de texto en español a formato ISO. Si el año no es explícito en esa diapositiva puntual, usa el año mencionado en el resto del documento.),
  "estrato_min": number o null,
  "estrato_max": number o null,
  "codigo_oferta": string o null (código de plan/FMC si aparece, ej. "FMC 25534", "101193"),
  "localidades": array de strings o null
}

Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin bloques de código markdown, sin explicaciones. Si el documento no tiene ninguna oferta con precio y vigencia claros, responde con [].`;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "El archivo debe ser un PDF" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64 },
              },
              {
                type: "text",
                text: "Extrae las ofertas comerciales de este documento siguiendo exactamente las instrucciones del sistema. Responde solo con el array JSON.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[extract-pdf] Claude API error:", errText);
      return NextResponse.json({ error: "Error al procesar el PDF con IA" }, { status: 502 });
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text ?? "[]";
    const clean = rawText.replace(/```json|```/g, "").trim();

    let ofertas: any[];
    try {
      ofertas = JSON.parse(clean);
    } catch {
      console.error("[extract-pdf] JSON inválido devuelto por el modelo:", rawText);
      return NextResponse.json(
        { error: "La IA no devolvió un JSON válido. Intenta de nuevo." },
        { status: 502 }
      );
    }

    const normalizadas: OfertaExtraida[] = (Array.isArray(ofertas) ? ofertas : []).map((o) => {
      const tipo = String(o.tipo ?? "internet").toLowerCase();
      const opKey = String(o.operador ?? "").toLowerCase().trim();
      return {
        titulo: String(o.titulo ?? "Oferta sin título"),
        operador: o.operador ?? null,
        descripcion: o.descripcion ?? null,
        precio: typeof o.precio === "number" ? o.precio : o.precio ? Number(o.precio) : null,
        precio_antes:
          typeof o.precio_antes === "number" ? o.precio_antes : o.precio_antes ? Number(o.precio_antes) : null,
        tipo,
        badge: o.badge ?? null,
        emoji: TIPO_EMOJI[tipo] ?? "⚡",
        color: OP_COLORS[opKey] ?? "#00d4ff",
        fecha_fin: o.fecha_fin ?? null,
        estrato_min: typeof o.estrato_min === "number" ? o.estrato_min : null,
        estrato_max: typeof o.estrato_max === "number" ? o.estrato_max : null,
        codigo_oferta: o.codigo_oferta ? String(o.codigo_oferta) : null,
        localidades: Array.isArray(o.localidades) && o.localidades.length > 0 ? o.localidades : null,
      };
    });

    return NextResponse.json({ ofertas: normalizadas, total: normalizadas.length });
  } catch (err) {
    console.error("[extract-pdf] Error:", err);
    return NextResponse.json({ error: "Error inesperado procesando el PDF" }, { status: 500 });
  }
}
