"use client";
import { useEffect, useState } from "react";
import { Plus, FileText, Video, HelpCircle, Megaphone, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Recurso {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  url: string | null;
  destacado: boolean;
}

const TIPO_ICON: Record<string, any> = { documento: FileText, video: Video, faq: HelpCircle, anuncio: Megaphone };
const TIPO_COLOR: Record<string, string> = { documento: "#00d4ff", video: "#ef4444", faq: "#a855f7", anuncio: "#f59e0b" };

export default function PanelRecursosPage() {
  const { perfil } = useAuth();
  const puedeAgregar = ["admin", "supervisor"].includes((perfil as any)?.rol ?? "");

  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [titulo,   setTitulo]   = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo,     setTipo]     = useState("documento");
  const [url,      setUrl]      = useState("");

  const cargar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("recursos_capacitacion")
      .select("*")
      .order("destacado", { ascending: false })
      .order("created_at", { ascending: false });
    setRecursos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const crear = async () => {
    if (!titulo.trim()) return;
    await supabase.from("recursos_capacitacion").insert({
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      tipo,
      url: url.trim() || null,
    });
    setTitulo(""); setDescripcion(""); setUrl(""); setShowForm(false);
    cargar();
  };

  const inp: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box" };

  const destacados = recursos.filter((r) => r.destacado);
  const normales    = recursos.filter((r) => !r.destacado);

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Centro de capacitación</h1>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Documentos, videos, FAQs y anuncios para el equipo</p>
        </div>
        {puedeAgregar && (
          <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", borderRadius: 9, padding: "9px 16px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            <Plus size={14} /> Agregar recurso
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 14 }}>
          <input style={inp} placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <input style={inp} placeholder="Descripción breve (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}>
            <select style={{ ...inp, flex: 1 }} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="documento">📄 Documento</option>
              <option value="video">🎥 Video</option>
              <option value="faq">❓ FAQ</option>
              <option value="anuncio">📢 Anuncio</option>
            </select>
            <input style={{ ...inp, flex: 2 }} placeholder="URL (link al recurso)" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <button onClick={crear} style={{ background: "#0070cc", border: "none", borderRadius: 8, padding: "9px 0", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Publicar</button>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#64748b", fontSize: 13 }}>Cargando…</div>
      ) : recursos.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 13, padding: "30px 0", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10 }}>
          Sin recursos publicados todavía.
        </div>
      ) : (
        <>
          {destacados.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#f59e0b", fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>⭐ DESTACADOS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
                {destacados.map((r) => <RecursoCard key={r.id} r={r} />)}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
            {normales.map((r) => <RecursoCard key={r.id} r={r} />)}
          </div>
        </>
      )}
    </div>
  );
}

const RecursoCard = ({ r }: { r: Recurso }) => {
  const Icon = TIPO_ICON[r.tipo] ?? FileText;
  const color = TIPO_COLOR[r.tipo] ?? "#00d4ff";
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} color={color} />
        </div>
        <span style={{ color, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{r.tipo}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{r.titulo}</div>
      {r.descripcion && <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>{r.descripcion}</div>}
      {r.url && (
        <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
          Abrir <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
};
