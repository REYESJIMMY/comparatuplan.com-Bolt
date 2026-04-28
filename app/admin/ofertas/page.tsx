"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { C } from "@/lib/constants";

// ── Tu email de admin ─────────────────────────────────────────
const ADMIN_EMAIL = "jimmy.reyes@voipcurp.com";

interface OfertaHot {
  id: number;
  titulo: string;
  operador: string | null;
  descripcion: string | null;
  precio: number | null;
  precio_antes: number | null;
  tipo: string | null;
  badge: string | null;
  emoji: string;
  color: string;
  activa: boolean;
  fecha_inicio: string;
  fecha_fin: string | null;
  created_at: string;
}

const OPERADORES = ["Claro", "Movistar", "Etb", "Tigo", "Otro"];
const TIPOS      = ["internet", "movil", "paquete", "tv", "equipo"];
const EMOJIS     = ["⚡", "🔥", "🎁", "📡", "📱", "💻", "🎮", "📺", "🌐", "💰"];
const COLORES    = ["#ef4444", "#f59e0b", "#10b981", "#00d4ff", "#a855f7", "#ec4899"];

const EMPTY = {
  titulo: "", operador: "", descripcion: "", precio: "",
  precio_antes: "", tipo: "internet", badge: "", emoji: "⚡",
  color: "#ef4444", fecha_fin: "",
};

export default function AdminOfertasPage() {
  const { user } = useAuth();
  const [ofertas,  setOfertas]  = useState<OfertaHot[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState<number | null>(null);
  const [msg,      setMsg]      = useState("");

  // Verificar acceso admin
  const isAdmin = user?.email === ADMIN_EMAIL;

  const cargar = async () => {
    const { data } = await supabase
      .from("ofertas_hot")
      .select("*")
      .order("created_at", { ascending: false });
    setOfertas(data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  if (!user) return (
    <div style={{ background: "#04040f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ marginBottom: 8 }}>Acceso restringido</h2>
        <p style={{ color: "rgba(180,195,230,0.5)" }}>Inicia sesión para continuar</p>
        <a href="/" style={{ display: "inline-block", marginTop: 16, color: C.neon }}>← Volver al inicio</a>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ background: "#04040f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h2 style={{ marginBottom: 8 }}>Sin permisos</h2>
        <p style={{ color: "rgba(180,195,230,0.5)" }}>No tienes acceso a esta página</p>
        <a href="/" style={{ display: "inline-block", marginTop: 16, color: C.neon }}>← Volver al inicio</a>
      </div>
    </div>
  );

  const handleSave = async () => {
    if (!form.titulo.trim()) { setMsg("El título es obligatorio"); return; }
    setSaving(true);
    setMsg("");

    const payload = {
      titulo:       form.titulo.trim(),
      operador:     form.operador || null,
      descripcion:  form.descripcion || null,
      precio:       form.precio ? Number(form.precio) : null,
      precio_antes: form.precio_antes ? Number(form.precio_antes) : null,
      tipo:         form.tipo || null,
      badge:        form.badge || null,
      emoji:        form.emoji,
      color:        form.color,
      fecha_fin:    form.fecha_fin || null,
      activa:       true,
      created_by:   user.id,
    };

    if (editId) {
      await supabase.from("ofertas_hot").update(payload).eq("id", editId);
      setMsg("✅ Oferta actualizada");
    } else {
      await supabase.from("ofertas_hot").insert(payload);
      setMsg("✅ Oferta publicada");
    }

    setForm(EMPTY);
    setEditId(null);
    setSaving(false);
    cargar();
  };

  const handleEdit = (o: OfertaHot) => {
    setEditId(o.id);
    setForm({
      titulo:       o.titulo,
      operador:     o.operador ?? "",
      descripcion:  o.descripcion ?? "",
      precio:       o.precio?.toString() ?? "",
      precio_antes: o.precio_antes?.toString() ?? "",
      tipo:         o.tipo ?? "internet",
      badge:        o.badge ?? "",
      emoji:        o.emoji,
      color:        o.color,
      fecha_fin:    o.fecha_fin ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (id: number, activa: boolean) => {
    await supabase.from("ofertas_hot").update({ activa: !activa }).eq("id", id);
    cargar();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta oferta?")) return;
    await supabase.from("ofertas_hot").delete().eq("id", id);
    cargar();
  };

  const inp = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div style={{ background: "#04040f", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <a href="/" style={{ color: "rgba(180,195,230,0.4)", fontSize: 12, textDecoration: "none" }}>Inicio</a>
            <span style={{ color: "rgba(180,195,230,0.2)" }}>›</span>
            <span style={{ color: "rgba(180,195,230,0.6)", fontSize: 12 }}>Admin Ofertas</span>
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, background: "linear-gradient(90deg,#ef4444,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🔥 Panel de Ofertas Hot
          </h1>
          <p style={{ color: "rgba(180,195,230,0.5)", fontSize: 13, marginTop: 4 }}>
            Carga ofertas diarias que no están en la CRC
          </p>
        </div>

        {/* Formulario */}
        <div style={{ background: "rgba(8,6,28,0.85)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "#fff" }}>
            {editId ? "✏️ Editar oferta" : "➕ Nueva oferta"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Título */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>TÍTULO *</label>
              <input value={form.titulo} onChange={(e) => inp("titulo", e.target.value)}
                placeholder="Ej: Claro Fibra 300 Mbps por $79.900 este fin de semana"
                style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
            </div>

            {/* Operador */}
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>OPERADOR</label>
              <select value={form.operador} onChange={(e) => inp("operador", e.target.value)}
                style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", appearance: "none" }}>
                <option value="">Sin operador específico</option>
                {OPERADORES.map((op) => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>TIPO</label>
              <select value={form.tipo} onChange={(e) => inp("tipo", e.target.value)}
                style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", appearance: "none" }}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Precio */}
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>PRECIO OFERTA</label>
              <input type="number" value={form.precio} onChange={(e) => inp("precio", e.target.value)}
                placeholder="79900"
                style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
            </div>

            {/* Precio antes */}
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>PRECIO ANTES (opcional)</label>
              <input type="number" value={form.precio_antes} onChange={(e) => inp("precio_antes", e.target.value)}
                placeholder="99900"
                style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
            </div>

            {/* Descripción */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>DESCRIPCIÓN</label>
              <textarea value={form.descripcion} onChange={(e) => inp("descripcion", e.target.value)}
                placeholder="Describe los beneficios de la oferta..."
                rows={3}
                style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif" }} />
            </div>

            {/* Badge */}
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>BADGE (opcional)</label>
              <input value={form.badge} onChange={(e) => inp("badge", e.target.value)}
                placeholder="Ej: SOLO HOY · OFERTA FLASH"
                style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
            </div>

            {/* Fecha fin */}
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>VÁLIDO HASTA (opcional)</label>
              <input type="date" value={form.fecha_fin} onChange={(e) => inp("fecha_fin", e.target.value)}
                style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
            </div>

            {/* Emoji */}
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>EMOJI</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => inp("emoji", e)}
                    style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${form.emoji === e ? "#fff" : "rgba(255,255,255,0.1)"}`, background: form.emoji === e ? "rgba(255,255,255,0.1)" : "transparent", fontSize: 18, cursor: "pointer" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>COLOR</label>
              <div style={{ display: "flex", gap: 8 }}>
                {COLORES.map((c) => (
                  <button key={c} onClick={() => inp("color", c)}
                    style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: `3px solid ${form.color === c ? "#fff" : "transparent"}`, cursor: "pointer" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.titulo && (
            <div style={{ marginTop: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14 }}>
              <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>PREVIEW</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>{form.emoji}</span>
                <div>
                  {form.operador && <div style={{ color: form.color, fontSize: 11, fontWeight: 700 }}>{form.operador}</div>}
                  <div style={{ color: "#fff", fontWeight: 700 }}>{form.titulo}</div>
                  {form.precio && <div style={{ color: form.color, fontWeight: 900, fontSize: 18, marginTop: 4 }}>${Number(form.precio).toLocaleString("es-CO")}/mes</div>}
                </div>
              </div>
            </div>
          )}

          {msg && <div style={{ marginTop: 14, color: msg.startsWith("✅") ? "#10b981" : "#ef4444", fontSize: 13, fontWeight: 600 }}>{msg}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {editId && (
              <button onClick={() => { setForm(EMPTY); setEditId(null); setMsg(""); }}
                style={{ padding: "11px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
            )}
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, background: saving ? "rgba(239,68,68,0.4)" : "linear-gradient(135deg,#ef4444,#f59e0b)", border: "none", borderRadius: 10, padding: "12px 0", color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "default" : "pointer" }}>
              {saving ? "Guardando..." : editId ? "Actualizar oferta" : "🔥 Publicar oferta"}
            </button>
          </div>
        </div>

        {/* Lista de ofertas */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#fff" }}>
            Ofertas publicadas ({ofertas.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: C.muted }}>Cargando...</div>
          ) : ofertas.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: C.muted }}>No hay ofertas aún</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ofertas.map((o) => (
                <div key={o.id} style={{
                  background: "rgba(8,6,28,0.85)", border: `1px solid ${o.activa ? o.color + "33" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  opacity: o.activa ? 1 : 0.5,
                }}>
                  <span style={{ fontSize: 24 }}>{o.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{o.titulo}</div>
                    <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                      {o.operador && `${o.operador} · `}
                      {o.tipo} · {o.precio ? `$${Number(o.precio).toLocaleString("es-CO")}` : "Sin precio"}
                      {o.fecha_fin && ` · Hasta ${new Date(o.fecha_fin).toLocaleDateString("es-CO")}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => handleToggle(o.id, o.activa)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${o.activa ? "#10b981" : "rgba(255,255,255,0.1)"}`, background: o.activa ? "rgba(16,185,129,0.1)" : "transparent", color: o.activa ? "#10b981" : C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      {o.activa ? "✓ Activa" : "Inactiva"}
                    </button>
                    <button onClick={() => handleEdit(o)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.08)", color: "#00d4ff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      ✏️ Editar
                    </button>
                    <button onClick={() => handleDelete(o.id)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link a página pública */}
        <div style={{ marginTop: 24, display: "flex", gap: 20, justifyContent: "center" }}>
          <a href="/ofertas" target="_blank"
            style={{ color: C.neon, fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
            Ver página pública de ofertas →
          </a>
          {isAdmin && (
            <a href="/admin/planes"
              style={{ color: "rgba(168,85,247,0.8)", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
              📡 Planes Manuales →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
