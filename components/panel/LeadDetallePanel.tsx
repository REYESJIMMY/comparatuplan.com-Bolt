"use client";
import { useEffect, useState } from "react";
import { X, Phone, Mail, MapPin, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Lead {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  servicio_interes: string | null;
  etapa: string;
  zona: string | null;
  notas: string | null;
  created_at: string;
}

interface Interaccion {
  id: string;
  tipo: string;
  contenido: string;
  created_at: string;
}

const TIPOS = [
  { id: "nota",     label: "📝 Nota" },
  { id: "llamada",  label: "📞 Llamada" },
  { id: "whatsapp", label: "💬 WhatsApp" },
  { id: "email",    label: "📧 Email" },
  { id: "reunion",  label: "🤝 Reunión" },
];

interface Props {
  lead:      Lead;
  onClose:   () => void;
}

export const LeadDetallePanel = ({ lead, onClose }: Props) => {
  const { user } = useAuth();
  const [interacciones, setInteracciones] = useState<Interaccion[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tipo,     setTipo]     = useState("nota");
  const [texto,    setTexto]    = useState("");
  const [sending,  setSending]  = useState(false);

  const cargar = async () => {
    const { data } = await supabase
      .from("interacciones_lead")
      .select("id, tipo, contenido, created_at")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });
    setInteracciones(data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [lead.id]);

  const enviar = async () => {
    if (!texto.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("interacciones_lead").insert({
      lead_id: lead.id,
      asesor_id: user.id,
      tipo,
      contenido: texto.trim(),
    });
    setSending(false);
    if (!error) { setTexto(""); cargar(); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 380, maxWidth: "100%", height: "100%", background: "#0f172a",
        borderLeft: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{lead.nombre}</div>
              <div style={{ color: "#00d4ff", fontSize: 11, fontWeight: 700, textTransform: "capitalize", marginTop: 2 }}>{lead.etapa}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={16} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
            {lead.telefono && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#cbd5e1", fontSize: 12 }}><Phone size={12} />{lead.telefono}</div>}
            {lead.email    && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#cbd5e1", fontSize: 12 }}><Mail size={12} />{lead.email}</div>}
            {lead.zona     && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#cbd5e1", fontSize: 12 }}><MapPin size={12} />{lead.zona}</div>}
          </div>
          {lead.notas && (
            <div style={{ marginTop: 10, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", color: "#94a3b8", fontSize: 12 }}>
              {lead.notas}
            </div>
          )}
        </div>

        {/* Historial */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          <div style={{ color: "#64748b", fontSize: 10, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>HISTORIAL DE INTERACCIONES</div>
          {loading ? (
            <div style={{ color: "#64748b", fontSize: 12 }}>Cargando…</div>
          ) : interacciones.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 12 }}>Sin interacciones registradas todavía.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {interacciones.map((i) => {
                const tipoInfo = TIPOS.find((t) => t.id === i.tipo);
                const fecha = new Date(i.created_at).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={i.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff" }}>{tipoInfo?.label ?? i.tipo}</span>
                      <span style={{ fontSize: 10, color: "#64748b" }}>{fecha}</span>
                    </div>
                    <div style={{ color: "#e2e8f0", fontSize: 12, lineHeight: 1.5 }}>{i.contenido}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nueva interacción */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{ width: "100%", marginBottom: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12 }}
          >
            {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              placeholder="Agregar nota o registrar contacto..."
              style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 12, outline: "none" }}
            />
            <button
              onClick={enviar}
              disabled={sending || !texto.trim()}
              style={{ width: 38, borderRadius: 8, border: "none", background: "#0070cc", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: sending || !texto.trim() ? 0.5 : 1 }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
