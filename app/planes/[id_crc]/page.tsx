// app/planes/[id_crc]/page.tsx
// Página interna de detalle de plan — el usuario NUNCA sale de comparatuplan.com

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import PlanDetalle from "@/components/planes/PlanDetalle";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: { id_crc: string } }) {
  const { data: plan } = await supabase
    .from("planes_unicos")
    .select("nombre, operador, precio, tipo")
    .eq("id_crc", params.id_crc)
    .single();

  if (!plan) return { title: "Plan no encontrado — ComparaTuPlan" };

  return {
    title: `${plan.nombre} de ${plan.operador} — ComparaTuPlan.com`,
    description: `Compara el plan ${plan.nombre} de ${plan.operador}. Precio desde $${Number(plan.precio).toLocaleString("es-CO")}/mes. Sin salir de ComparaTuPlan.`,
  };
}

export default async function PlanPage({ params }: { params: { id_crc: string } }) {
  // Datos del plan principal desde planes_unicos (sin duplicados)
  const { data: plan } = await supabase
    .from("planes_unicos")
    .select("*")
    .eq("id_crc", params.id_crc)
    .single();

  if (!plan) notFound();

  // Historial de precios
  const { data: historial } = await supabase
    .from("precios_historial")
    .select("precio_anterior, precio_nuevo, diferencia, registrado_at")
    .eq("plan_id", params.id_crc)
    .order("registrado_at", { ascending: false })
    .limit(12);

  // Planes similares del mismo operador y tipo
  const { data: similares } = await supabase
    .from("planes_unicos")
    .select("id_crc, operador, nombre, precio, tipo, velocidad_mbps, datos_gb, modalidad")
    .eq("operador", plan.operador)
    .eq("tipo", plan.tipo)
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
