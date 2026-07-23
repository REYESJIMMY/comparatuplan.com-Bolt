"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function PanelConfigPage() {
  const { perfil, user, updatePerfil } = useAuth();
  const [nombre,   setNombre]   = useState(perfil?.nombre ?? "");
  const [telefono, setTelefono] = useState(perfil?.telefono ?? "");
  const [notifEmail, setNotifEmail] = useState((perfil as any)?.notif_email ?? true);
  const [notifSms,   setNotifSms]   = useState((perfil as any)?.notif_sms ?? false);
  const [notifPush,  setNotifPush]  = useState((perfil as any)?.notif_push ?? true);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const guardar = async () => {
    setSaving(true);
    await updatePerfil({
      nombre, telefono,
      notif_email: notifEmail, notif_sms: notifSms, notif_push: notifPush,
    } as any);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inp: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const label: React.CSSProperties = { color: "#94a3b8", fontSize: 11, fontWeight: 700, marginBottom: 5, display: "block" };

  return (
    <div style={{ color: "#fff", maxWidth: 480 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Configuración</h1>

      {/* Perfil */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, marginBottom: 16 }}>
        <div style={{ color: "#64748b", fontSize: 10, fontWeight: 800, letterSpacing: 1, marginBottom: 14 }}>DATOS DE CONTACTO</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={label}>Nombre</label>
            <input style={inp} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label style={label}>Teléfono</label>
            <input style={inp} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
          <div>
            <label style={label}>Correo</label>
            <div style={{ ...inp, color: "#64748b" }}>{user?.email ?? "—"}</div>
          </div>
          <div>
            <label style={label}>Zona asignada</label>
            <div style={{ ...inp, color: "#64748b" }}>{(perfil as any)?.zona ?? "Sin asignar — la define tu supervisor"}</div>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, marginBottom: 16 }}>
        <div style={{ color: "#64748b", fontSize: 10, fontWeight: 800, letterSpacing: 1, marginBottom: 14 }}>NOTIFICACIONES</div>
        {[
          { label: "Notificarme por correo", value: notifEmail, set: setNotifEmail },
          { label: "Notificarme por SMS",     value: notifSms,   set: setNotifSms },
          { label: "Notificaciones push",     value: notifPush,  set: setNotifPush },
        ].map((n) => (
          <label key={n.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer" }}>
            <input type="checkbox" checked={n.value} onChange={(e) => n.set(e.target.checked)} />
            <span style={{ fontSize: 13, color: "#e2e8f0" }}>{n.label}</span>
          </label>
        ))}
      </div>

      {/* Apariencia */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 10, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>APARIENCIA</div>
          <div style={{ fontSize: 12, color: "#e2e8f0" }}>Modo claro / oscuro</div>
        </div>
        <ThemeToggle />
      </div>

      <button
        onClick={guardar}
        disabled={saving}
        style={{ background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", borderRadius: 10, padding: "11px 28px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "default" : "pointer" }}
      >
        {saving ? "Guardando…" : saved ? "✓ Guardado" : "Guardar cambios"}
      </button>
    </div>
  );
}
