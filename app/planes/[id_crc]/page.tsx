import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import PlanDetalle from "@/components/planes/PlanDetalle";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function PlanPage({ params }: { params: { id_crc: string } }) {
  const { data: plan } = await supabase
    .from("planes")
    .select("id_crc, operador, nombre, tipo, precio, precio_mensual, velocidad_mbps, datos_gb, canales_tv, minutos, modalidad, tecnologia, beneficios, badge, emoji, color, estratos")
    .eq("id_crc", params.id_crc)
    .eq("activo", true)
    .limit(1)
    .single();

  if (!plan) notFound();

  const { data: historial } = await supabase
    .from("precios_historial")
    .select("precio_anterior, precio_nuevo, diferencia, registrado_at")
    .eq("plan_id", params.id_crc)
    .order("registrado_at", { ascending: false })
    .limit(12);

  const { data: similares } = await supabase
    .from("planes")
    .select("id_crc, operador, nombre, precio, tipo, velocidad_mbps, datos_gb, modalidad")
    .eq("operador", plan.operador)
    .eq("tipo", plan.tipo)
    .eq("activo", true)
    .neq("id_crc", params.id_crc)
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
