import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import PlanDetalle from "@/components/planes/PlanDetalle";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SELECT_PLAN = "id_crc, operador, nombre, tipo, precio, precio_mensual, velocidad_mbps, datos_gb, canales_tv, minutos, modalidad, tecnologia, beneficios, badge, emoji, color, estratos";

// Next.js 15: `params` llega como una Promesa, hay que resolverla con
// await antes de leer sus propiedades. Con el patrón anterior (params
// como objeto plano) cada campo llegaba como undefined en tiempo de
// ejecución, aunque el tipo no lo marcara como error en el build.
export default async function PlanPage({
  params,
}: {
  params: Promise<{ id_crc: string }>;
}) {
  const { id_crc: idBuscado } = await params;

  // Algunos planes (ofertas cargadas manual) no tienen id_crc — el link
  // les pasa el UUID de la columna `id` en su lugar. Se busca primero
  // por id_crc (caso normal) y, si no aparece, por id (fallback).
  let { data: plan } = await supabase
    .from("planes")
    .select(SELECT_PLAN)
    .eq("id_crc", idBuscado)
    .eq("activo", true)
    .limit(1)
    .single();

  if (!plan) {
    const fallback = await supabase
      .from("planes")
      .select(SELECT_PLAN)
      .eq("id", idBuscado)
      .eq("activo", true)
      .limit(1)
      .single();
    plan = fallback.data;
  }

  if (!plan) notFound();

  const { data: historial } = plan.id_crc
    ? await supabase
        .from("precios_historial")
        .select("precio_anterior, precio_nuevo, diferencia, registrado_at")
        .eq("plan_id", plan.id_crc)
        .order("registrado_at", { ascending: false })
        .limit(12)
    : { data: [] };

  const { data: similares } = await supabase
    .from("planes")
    .select("id_crc, operador, nombre, precio, tipo, velocidad_mbps, datos_gb, modalidad")
    .eq("operador", plan.operador)
    .eq("tipo", plan.tipo)
    .eq("activo", true)
    .neq("id_crc", plan.id_crc ?? "")
    .order("precio", { ascending: true })
    .limit(4);

  return (
    <PlanDetalle
      plan={plan}
      historial={historial ?? []}
      similares={similares ?? []}
    />
  );
}
