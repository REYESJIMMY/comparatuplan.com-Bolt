"use client";
import { useEffect, useState } from "react";
import { Plus, Check, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Venta {
  id: string;
  cliente_nombre: string;
  servicio: string | null;
  monto: number;
  estado: string;
  fecha_venta: string;
}

interface Tarea {
  id: string;
  titulo: string;
  fecha_venc: string | null;
  completada: boolean;
}

const ESTADOS = [
  { id: "en_proceso",             label: "En proceso",            color: "#00d4ff" },
  { id: "aprobada",               label: "Aprobada",              color: "#a855f7" },
  { id: "instalacion_programada", label: "Instalación programada", color: "#f59e0b" },
  { id: "instalada",              label: "Instalada",             color: "#10b981" },
  { id: "cancelada",              label: "Cancelada",             color: "#ef4444" },
];

const SERVICIOS = ["internet", "movil", "tv", "paquete"];

export default function PanelVentasPage() {
  const { user } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario nueva venta
  const [showForm, setShowForm] = useState(false);
  const [cliente, setCliente] = useState("");
  const [servicio, setServicio] = useState("internet");
  const [monto, setMonto] = useState("");

  // Formulario nueva tarea
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [fechaTarea, setFechaTarea] = useState("");

  const cargar = async () => {
    setLoading(true);
    const [ventasRes, tareasRes] = await Promise.all([
      supabase.from("ventas").select("*").order("fecha_venta", { ascending: false }),
      supabase.from("tareas").select("*").order("fecha_venc", { ascending: true, nullsFirst: false }),
    ]);
    setVentas(ventasRes.data ?? []);
    setTareas(tareasRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const crearVenta = async () => {
    if (!cliente.trim() || !user) return;
    await supabase.from("ventas").insert({
      cliente_nombre: cliente.trim(),
      servicio,
      monto: Number(monto) || 0,
      asesor_id: user.id,
    });
    setCliente(""); setMonto(""); setShowForm(false);
    cargar();
  };

  const cambiarEstado = async (id: string, estado: string) => {
    setVentas((prev) => prev.map((v) => (v.id === id ? { ...v, estado } : v)));
    await supabase.from("ventas").update({ estado }).eq("id", id);
  };

  const crearTarea = async () => {
    if (!nuevaTarea.trim() || !user) return;
    await supabase.from("tareas").insert({
      titulo: nuevaTarea.trim(),
      fecha_venc: fechaTarea || null,
      asesor_id: user.id,
    });
    setNuevaTarea(""); setFechaTarea("");
    cargar();
  };

  const toggleTarea = async (id: string, completada: boolean) => {
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, completada: !completada } : t)));
    await supabase.from("tareas").update({ completada: !completada }).eq("id", id);
  };

  const inp: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 12, outline: "none" };

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Ventas y seguimiento</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", borderRadius: 9, padding: "9px 16px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
          <Plus size={14} /> Nueva venta
        </button>
      </div>

      {showForm && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 14 }}>
          <input style={{ ...inp, flex: "1 1 180px" }} placeholder="Nombre del cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
          <select style={inp} value={servicio} onChange={(e) => setServicio(e.target.value)}>
            {SERVICIOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input style={{ ...inp, width: 130 }} type="number" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} />
          <button onClick={crearVenta} style={{ background: "#0070cc", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Guardar</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Pipeline de ventas */}
        <div>
          {loading ? (
            <div style={{ color: "#64748b", fontSize: 13 }}>Cargando…</div>
          ) : ventas.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 13, padding: "30px 0", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10 }}>
              Sin ventas registradas todavía.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ventas.map((v) => {
                const estadoInfo = ESTADOS.find((e) => e.id === v.estado);
                return (
                  <div key={v.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${estadoInfo?.color}33`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{v.cliente_nombre}</div>
                      <div style={{ color: "#64748b", fontSize: 11, textTransform: "capitalize" }}>{v.servicio} · {new Date(v.fecha_venta).toLocaleDateString("es-CO")}</div>
                    </div>
                    <div style={{ color: estadoInfo?.color, fontWeight: 800, fontSize: 14 }}>${v.monto.toLocaleString("es-CO")}</div>
                    <select
                      value={v.estado}
                      onChange={(e) => cambiarEstado(v.id, e.target.value)}
                      style={{ background: `${estadoInfo?.color}14`, border: `1px solid ${estadoInfo?.color}44`, color: estadoInfo?.color, borderRadius: 7, padding: "5px 8px", fontSize: 11, fontWeight: 700 }}
                    >
                      {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tareas de seguimiento */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
          <div style={{ color: "#64748b", fontSize: 10, fontWeight: 800, letterSpacing: 1, marginBottom: 12 }}>TAREAS PENDIENTES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            <input style={inp} placeholder="Ej: Llamar mañana a..." value={nuevaTarea} onChange={(e) => setNuevaTarea(e.target.value)} />
            <div style={{ display: "flex", gap: 6 }}>
              <input style={{ ...inp, flex: 1 }} type="date" value={fechaTarea} onChange={(e) => setFechaTarea(e.target.value)} />
              <button onClick={crearTarea} style={{ background: "#a855f7", border: "none", borderRadius: 8, padding: "0 12px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {tareas.length === 0 && <div style={{ color: "#3f4a5f", fontSize: 11 }}>Sin tareas pendientes.</div>}
            {tareas.map((t) => (
              <div key={t.id} onClick={() => toggleTarea(t.id, t.completada)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 7, cursor: "pointer", opacity: t.completada ? 0.4 : 1 }}>
                {t.completada ? <Check size={13} color="#10b981" /> : <Circle size={13} color="#64748b" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, textDecoration: t.completada ? "line-through" : "none" }}>{t.titulo}</div>
                  {t.fecha_venc && <div style={{ color: "#64748b", fontSize: 10 }}>{new Date(t.fecha_venc).toLocaleDateString("es-CO")}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
