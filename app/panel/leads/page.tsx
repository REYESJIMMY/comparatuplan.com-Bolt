"use client";
import { useEffect, useState } from "react";
import { Plus, Phone, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { NuevoLeadModal } from "@/components/panel/NuevoLeadModal";
import { LeadDetallePanel } from "@/components/panel/LeadDetallePanel";

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

const ETAPAS = [
  { id: "nuevo",       label: "Nuevo",       color: "#00d4ff" },
  { id: "contactado",  label: "Contactado",  color: "#a855f7" },
  { id: "negociacion", label: "Negociación", color: "#f59e0b" },
  { id: "cerrado",     label: "Cerrado",     color: "#10b981" },
  { id: "perdido",     label: "Perdido",     color: "#ef4444" },
] as const;

export default function PanelLeadsPage() {
  const [leads,   setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [leadActivo, setLeadActivo] = useState<Lead | null>(null);
  const [dragOverEtapa, setDragOverEtapa] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    setLeads(data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const moverLead = async (leadId: string, nuevaEtapa: string) => {
    // Optimista: actualiza en pantalla antes de esperar la respuesta
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, etapa: nuevaEtapa } : l)));
    const { error } = await supabase.from("leads").update({ etapa: nuevaEtapa }).eq("id", leadId);
    if (error) cargar(); // si falla, recarga para revertir el cambio visual
  };

  const handleDrop = (e: React.DragEvent, etapa: string) => {
    e.preventDefault();
    setDragOverEtapa(null);
    const leadId = e.dataTransfer.getData("text/lead-id");
    if (leadId) moverLead(leadId, etapa);
  };

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>CRM / Leads</h1>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Arrastra las tarjetas entre columnas para cambiar la etapa</p>
        </div>
        <button
          onClick={() => setModalNuevo(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", borderRadius: 9, padding: "9px 16px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
        >
          <Plus size={14} /> Nuevo lead
        </button>
      </div>

      {loading ? (
        <div style={{ color: "#64748b", fontSize: 13 }}>Cargando leads…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(220px, 1fr))", gap: 12, overflowX: "auto" }}>
          {ETAPAS.map((etapa) => {
            const leadsEtapa = leads.filter((l) => l.etapa === etapa.id);
            const isOver = dragOverEtapa === etapa.id;
            return (
              <div
                key={etapa.id}
                onDragOver={(e) => { e.preventDefault(); setDragOverEtapa(etapa.id); }}
                onDragLeave={() => setDragOverEtapa(null)}
                onDrop={(e) => handleDrop(e, etapa.id)}
                style={{
                  background: isOver ? `${etapa.color}0c` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isOver ? etapa.color : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12, padding: 10, minHeight: 400, transition: "all .15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "0 4px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: etapa.color }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: etapa.color, letterSpacing: 0.5 }}>{etapa.label.toUpperCase()}</span>
                  <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 11 }}>{leadsEtapa.length}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {leadsEtapa.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/lead-id", lead.id)}
                      onClick={() => setLeadActivo(lead)}
                      style={{
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 9, padding: "10px 12px", cursor: "grab",
                      }}
                    >
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 12, marginBottom: 5 }}>{lead.nombre}</div>
                      {lead.servicio_interes && (
                        <span style={{ background: `${etapa.color}14`, color: etapa.color, borderRadius: 99, padding: "1px 8px", fontSize: 9, fontWeight: 700 }}>
                          {lead.servicio_interes}
                        </span>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        {lead.telefono && <Phone size={10} color="#64748b" />}
                        {lead.email && <Mail size={10} color="#64748b" />}
                      </div>
                    </div>
                  ))}
                  {leadsEtapa.length === 0 && (
                    <div style={{ color: "#3f4a5f", fontSize: 11, textAlign: "center", padding: "16px 0" }}>Sin leads aquí</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalNuevo && (
        <NuevoLeadModal
          onClose={() => setModalNuevo(false)}
          onCreado={() => { setModalNuevo(false); cargar(); }}
        />
      )}

      {leadActivo && (
        <LeadDetallePanel lead={leadActivo} onClose={() => setLeadActivo(null)} />
      )}
    </div>
  );
}
