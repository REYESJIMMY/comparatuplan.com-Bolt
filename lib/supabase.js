import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Planes ──────────────────────────────────────────
export async function getPlanes({
  operador,
  tipo,
  modalidad,
  precioMax,
  precioMin,
  velocidadMin,
  ciudad,
  estrato,
  page = 1,
  pageSize = 20,
} = {}) {
  let query = supabase
    .from("planes")
    .select("*", { count: "exact" })
    .eq("activo", true)
    .order("precio", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (operador)     query = query.eq("operador", operador);
  if (tipo)         query = query.eq("tipo", tipo);
  if (modalidad)    query = query.eq("modalidad", modalidad);
  if (precioMax)    query = query.lte("precio", precioMax);
  if (precioMin)    query = query.gte("precio", precioMin);
  if (velocidadMin) query = query.gte("velocidad_mbps", velocidadMin);
  if (ciudad)       query = query.contains("ciudades", [ciudad]);
  if (estrato)      query = query.contains("estratos", [estrato]);

  const { data, error, count } = await query;
  if (error) throw error;
  return { planes: data, total: count };
}

// ── Operadores únicos ────────────────────────────────
export async function getOperadores() {
  const { data, error } = await supabase
    .from("planes")
    .select("operador")
    .eq("activo", true)
    .order("operador");
  if (error) throw error;
  return [...new Set(data.map(d => d.operador))];
}

// ── Tipos únicos ─────────────────────────────────────
export async function getTipos() {
  const { data, error } = await supabase
    .from("planes")
    .select("tipo")
    .eq("activo", true)
    .order("tipo");
  if (error) throw error;
  return [...new Set(data.map(d => d.tipo))];
}

// ── Stats generales ──────────────────────────────────
export async function getStats() {
  const { data, error } = await supabase
    .from("stats_planes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

// ── Historial de precios ─────────────────────────────
export async function getHistorialPrecios(planId) {
  const { data, error } = await supabase
    .from("precios_historial")
    .select("*")
    .eq("plan_id", planId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data;
}

// ── Suscribirse a cambios de precio ─────────────────
export async function suscribirPrecio({ planId, telefono, email }) {
  const { data, error } = await supabase
    .from("suscripciones_precio")
    .insert({ plan_id: planId, telefono, email })
    .select()
    .single();
  if (error) throw error;
  return data;
}
