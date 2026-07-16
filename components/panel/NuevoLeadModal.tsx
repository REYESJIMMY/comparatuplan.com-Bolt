"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SERVICIOS = ["internet", "movil", "tv", "paquete"];

interface Props {
  onClose:  () => void;
  onCreado: () => void;
}

export const NuevoLeadModal = ({ onClose, onCreado }: Props) => {
  const [nombre,    setNombre]    = useState("");
  const [telefono,  setTelefono]  = useState("");
  const [email,     setEmail]     = useState("");
  const [servicio,  setServicio]  = useState("internet");
  const [zona,      setZona]      = useState("");
  const [notas,     setNotas]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState("");

  const handleSave = async () => {
    if (!nombre.trim()) { setErr("El nombre es obligatorio"); return; }
    setSaving(true);
    setErr("");

    const { error } = await supabase.from("leads").insert({
      nombre:           nombre.trim(),
      telefono:         telefono.trim() || null,
      email:            email.trim() || null,
      servicio_interes: servicio,
      zona:             zona.trim() || null,
      notas:            notas.trim() || null,
      // asesor_id se deja null a propósito — el trigger de Supabase
      // lo asigna automáticamente según zona y carga de trabajo.
    });

    setSaving(false);
    if (error) { setErr(error.message); return; }
    onCreado();
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const label: React.CSSProperties = { color: "#94a3b8", fontSize: 11, fontWeight: 600, marginBottom: 5, display: "block" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, maxWidth: 420, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>Nuevo lead</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={16} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={label}>Nombre *</label>
            <input style={inp} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Teléfono</label>
              <input style={inp} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="300 000 0000" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Email</label>
              <input style={inp} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Servicio de interés</label>
              <select style={{ ...inp, appearance: "none" }} value={servicio} onChange={(e) => setServicio(e.target.value)}>
                {SERVICIOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Zona</label>
              <input style={inp} value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Ej: Bogotá Norte" />
            </div>
          </div>
          <div>
            <label style={label}>Notas</label>
            <textarea style={{ ...inp, resize: "vertical" }} rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Contexto inicial del lead..." />
          </div>

          {err && <div style={{ color: "#f87171", fontSize: 12 }}>{err}</div>}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginTop: 4, background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none",
              borderRadius: 10, padding: "11px 0", color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Guardando..." : "Crear lead"}
          </button>
          <p style={{ color: "#64748b", fontSize: 10, textAlign: "center" }}>
            Se asignará automáticamente a un asesor disponible de la zona indicada.
          </p>
        </div>
      </div>
    </div>
  );
};
