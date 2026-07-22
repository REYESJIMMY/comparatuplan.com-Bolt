"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Incidencia {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  created_at: string;
}

const CATEGORIAS = [
  { id: "tecnica",   label: "Técnica" },
  { id: "cobertura", label: "Cobertura" },
  { id: "precio",    label: "Precio" },
  { id: "otro",      label: "Otro" },
];

const ESTADOS = [
  { id: "abierto",      label: "Abierto",      color: "#ef4444" },
  { id: "en_revision",  label: "En revisión",  color: "#f59e0b" },
  { id: "resuelto",     label: "Resuelto",     color: "#10b981" },
];

export default function PanelIncidenciasPage() {
  const { user, perfil } = useAuth();
  const puedeGestionar = ["admin", "supervisor"].includes((perfil as any)?.rol ?? "");

  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("otro");

  const cargar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("incidencias")
      .select("*")
      .order("created_at", { ascending: false });
    setIncidencias(data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const reportar = async () => {
    if (!titulo.trim() || !descripcion.trim() || !user) return;
    await supabase.from("incidencias").insert({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      categoria,
      reportado_por: user.id,
    });
    setTitulo(""); setDescripcion(""); setShowForm(false);
    cargar();
  };

  const cambiarEstado = async (id: string, estado: string) => {
    setIncidencias((prev) => prev.map((i) => (i.id === id ? { ...i, estado } : i)));
    await supabase.from("incidencias").update({ estado }).eq("id", id);
  };

  const inp: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Incidencias</h1>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>
            {puedeGestionar ? "Todas las incidencias reportadas por el equipo" : "Tus incidencias reportadas"}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", borderRadius: 9, padding: "9px 16px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
          <Plus size={14} /> Reportar incidencia
        </button>
      </div>

      {showForm && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 14 }}>
          <input style={inp} placeholder="Título breve del problema" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <textarea style={{ ...inp, resize: "vertical" }} rows={3} placeholder="Descripción detallada..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          <select style={inp} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <button onClick={reportar} style={{ background: "#0070cc", border: "none", borderRadius: 8, padding: "9px 0", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Enviar reporte</button>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#64748b", fontSize: 13 }}>Cargando…</div>
      ) : incidencias.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 13, padding: "30px 0", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10 }}>
          Sin incidencias reportadas.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {incidencias.map((inc) => {
            const estadoInfo = ESTADOS.find((e) => e.id === inc.estado);
            const catInfo = CATEGORIAS.find((c) => c.id === inc.categoria);
            return (
              <div key={inc.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${estadoInfo?.color}33`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{inc.titulo}</div>
                    <span style={{ color: "#64748b", fontSize: 10 }}>{catInfo?.label} · {new Date(inc.created_at).toLocaleDateString("es-CO")}</span>
                  </div>
                  {puedeGestionar ? (
                    <select
                      value={inc.estado}
                      onChange={(e) => cambiarEstado(inc.id, e.target.value)}
                      style={{ background: `${estadoInfo?.color}14`, border: `1px solid ${estadoInfo?.color}44`, color: estadoInfo?.color, borderRadius: 7, padding: "4px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}
                    >
                      {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                    </select>
                  ) : (
                    <span style={{ background: `${estadoInfo?.color}14`, color: estadoInfo?.color, borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{estadoInfo?.label}</span>
                  )}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: 12, lineHeight: 1.5 }}>{inc.descripcion}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
