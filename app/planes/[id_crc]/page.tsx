import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import PlanDetalle from "@/components/planes/PlanDetalle";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SELECT_PLAN = "id_crc, operador, nombre, tipo, precio, precio_mensual, velocidad_mbps, datos_gb, canales_tv, minutos, modalidad, tecnologia, beneficios, badge, emoji, color, estratos";

export default async function PlanPage({ params }: { params: { id_crc: string } }) {
  // Algunos planes (ofertas cargadas manual) no tienen id_crc — el link
  // les pasa el UUID de la columna `id` en su lugar. Se busca primero
  // por id_crc (caso normal) y, si no aparece, por id (fallback).
  let { data: plan, error: errorPrincipal } = await supabase
    .from("planes")
    .select(SELECT_PLAN)
    .eq("id_crc", params.id_crc)
    .eq("activo", true)
    .limit(1)
    .single();

  if (!plan) {
    const fallback = await supabase
      .from("planes")
      .select(SELECT_PLAN)
      .eq("id", params.id_crc)
      .eq("activo", true)
      .limit(1)
      .single();
    plan = fallback.data;

    console.error("DEBUG plan_page — id_crc buscado:", params.id_crc);
    console.error("DEBUG plan_page — error consulta principal:", JSON.stringify(errorPrincipal));
    console.error("DEBUG plan_page — error consulta fallback:", JSON.stringify(fallback.error));
  }

    if (!plan) {
    return <div style={{ color: "red", padding: 40, fontSize: 18 }}>DEBUG: plan es null/undefined, se habría llamado notFound()</div>;
  }

  return <div style={{ color: "lime", padding: 40, fontSize: 18 }}>DEBUG: plan SÍ se encontró — {JSON.stringify(plan)}</div>;
}
