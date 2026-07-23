"use client";
import { useEffect, useState } from "react";
import { Trash2, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface OfertaAsesor {
  id: string;
  operador: string;
  nombre: string;
  tipo: string | null;
  tecnologia: string | null;
  velocidad_mbps: number | null;
  precio: number;
  precio_promocion: number | null;
  promocion_vigente: boolean;
  notas_internas: string | null;
  activa: boolean;
}

const TIPOS = ["internet", "movil", "tv", "paquete"];
const EMPTY = {
  operador: "", nombre: "", tipo: "internet", tecnologia: "", velocidad_mbps: "",
  precio: "", precio_promocion: "", promocion_vigente: false, notas_internas: "",
};

export default function AdminOfertasAsesoresPage() {
  const [ofertas, setOfertas] = useState<OfertaAsesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [msg,     setMsg]     = useState("");

  const cargar = async () => {
    const { data } = await supabase.from("ofertas_asesores").select("*").order("created_at", { ascending: false });
    setOfertas(data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    if (!form.operador.trim() || !form.nombre.trim() || !form.precio) { setMsg("Operador, nombre y precio son obligatorios"); return; }
    setSaving(true); setMsg("");

    const payload = {
      operador: form.operador.trim(),
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      tecnologia: form.tecnologia.trim() || null,
      velocidad_mbps: form.velocidad_mbps ? Number(form.velocidad_mbps) : null,
      precio: Number(form.precio),
      precio_promocion: form.precio_promocion ? Number(form.precio_promocion) : null,
      promocion_vigente: form.promocion_vigente,
      notas_internas: form.notas_internas.trim() || null,
    };

    if (editId) {
      await supabase.from("ofertas_asesores").update(payload).eq("id", editId);
      setMsg("✅ Oferta actualizada");
    } else {
      await supabase.from("ofertas_asesores").insert(payload);
      setMsg("✅ Oferta publicada");
    }

    setForm(EMPTY); setEditId(null); setSaving(false);
    cargar();
  };

  const editar = (o: OfertaAsesor) => {
    setEditId(o.id);
    setForm({
      operador: o.operador, nombre: o.nombre, tipo: o.tipo ?? "internet",
      tecnologia: o.tecnologia ?? "", velocidad_mbps: o.velocidad_mbps?.toString() ?? "",
      precio: o.precio.toString(), precio_promocion: o.precio_promocion?.toString() ?? "",
      promocion_vigente: o.promocion_vigente, notas_internas: o.notas_internas ?? "",
    });
  };

  const toggleActiva = async (id: string, activa: boolean) => {
    await supabase.from("ofertas_asesores").update({ activa: !activa }).eq("id", id);
    cargar();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta oferta interna?")) return;
    await supabase.from("ofertas_asesores").delete().eq("id", id);
    cargar();
  };

  const inp: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const label: React.CSSProperties = { color: "#94a3b8", fontSize: 11, fontWeight: 700, marginBottom: 5, display: "block" };

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Administrar ofertas internas</h1>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>Solo visible para admin — estas ofertas alimentan /panel/ofertas</p>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={label}>OPERADOR *</label><input style={inp} value={form.operador} onChange={(e) => setForm({ ...form, operador: e.target.value })} placeholder="Claro" /></div>
          <div><label style={label}>TIPO</label>
            <select style={inp} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}><label style={label}>NOMBRE DEL PLAN *</label><input style={inp} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Fibra 300 Asesores" /></div>
          <div><label style={label}>TECNOLOGÍA</label><input style={inp} value={form.tecnologia} onChange={(e) => setForm({ ...form, tecnologia: e.target.value })} placeholder="Fibra" /></div>
          <div><label style={label}>VELOCIDAD (Mbps)</label><input style={inp} type="number" value={form.velocidad_mbps} onChange={(e) => setForm({ ...form, velocidad_mbps: e.target.value })} placeholder="300" /></div>
          <div><label style={label}>PRECIO *</label><input style={inp} type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="99900" /></div>
          <div><label style={label}>PRECIO PROMOCIÓN</label><input style={inp} type="number" value={form.precio_promocion} onChange={(e) => setForm({ ...form, precio_promocion: e.target.value })} placeholder="79900" /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={label}>NOTAS INTERNAS</label><input style={inp} value={form.notas_internas} onChange={(e) => setForm({ ...form, notas_internas: e.target.value })} placeholder="Ej: válida solo para clientes nuevos" /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.promocion_vigente} onChange={(e) => setForm({ ...form, promocion_vigente: e.target.checked })} />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Marcar como promoción vigente</span>
          </div>
        </div>

        {msg && <div style={{ marginTop: 12, color: msg.startsWith("✅") ? "#10b981" : "#ef4444", fontSize: 12, fontWeight: 600 }}>{msg}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {editId && (
            <button onClick={() => { setForm(EMPTY); setEditId(null); setMsg(""); }} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>Cancelar</button>
          )}
          <button onClick={guardar} disabled={saving} style={{ flex: 1, background: saving ? "rgba(0,112,204,0.4)" : "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", borderRadius: 8, padding: "10px 0", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "default" : "pointer" }}>
            {saving ? "Guardando..." : editId ? "Actualizar oferta" : "+ Publicar oferta"}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "#64748b", fontSize: 13 }}>Cargando…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ofertas.map((o) => (
            <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${o.activa ? "rgba(0,212,255,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "10px 14px", opacity: o.activa ? 1 : 0.5 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{o.operador} — {o.nombre}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>${o.precio.toLocaleString("es-CO")}{o.precio_promocion ? ` → $${o.precio_promocion.toLocaleString("es-CO")}` : ""}</div>
              </div>
              <button onClick={() => toggleActiva(o.id, o.activa)} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${o.activa ? "#10b981" : "rgba(255,255,255,0.1)"}`, background: o.activa ? "rgba(16,185,129,0.1)" : "transparent", color: o.activa ? "#10b981" : "#64748b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {o.activa ? "Activa" : "Inactiva"}
              </button>
              <button onClick={() => editar(o)} style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 7, padding: 6, color: "#00d4ff", cursor: "pointer", display: "flex" }}><Edit2 size={13} /></button>
              <button onClick={() => eliminar(o.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, padding: 6, color: "#ef4444", cursor: "pointer", display: "flex" }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
