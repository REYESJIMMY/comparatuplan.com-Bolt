import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PlanDetalle from "@/components/planes/PlanDetalle";

export default async function PlanPage({ params }: { params: { id_crc: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: plan, error } = await supabase
    .from("planes_unicos")
    .select("*")
    .eq("id_crc", params.id_crc)
    .single();

  console.log("plan:", plan, "error:", error);

  if (!plan) notFound();

  const { data: historial } = await supabase
    .from("precios_historial")
    .select("precio_anterior, precio_nuevo, diferencia, registrado_at")
    .eq("plan_id", params.id_crc)
    .order("registrado_at", { ascending: false })
    .limit(12);

  const { data: similares } = await supabase
    .from("planes_unicos")
    .select("id_crc, operador, nombre, precio, tipo, velocidad_mbps, datos_gb, modalidad")
    .eq("operador", plan!.operador)
    .eq("tipo", plan!.tipo)
    .neq("id_crc", params.id_crc)
    .order("precio", { ascending: true })
    .limit(4);

  return (
    <PlanDetalle
      plan={plan!}
      historial={historial ?? []}
      similares={similares ?? []}
    />
  );
}
