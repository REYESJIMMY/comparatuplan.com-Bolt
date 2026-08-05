"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { C } from "@/lib/constants";

// ── Mismo admin que app/admin/ofertas/page.tsx ──────────────────
const ADMIN_EMAIL = "jimmy.reyes@voipcurp.com";

const TIPOS = ["internet", "movil", "paquete", "tv"];

interface OfertaDraft {
  _uid: string;
  seleccionada: boolean;
  titulo: string;
  operador: string;
  descripcion: string;
  precio: string;
  precio_antes: string;
  tipo: string;
  badge: string;
  emoji: string;
  color: string;
  fecha_fin: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#1a1a2e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "8px 10px",
  color: "#fff",
  fontSize: 13,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: C.muted,
  fontSize: 10,
  fontWeight: 700,
  marginBottom: 4,
};

export default function ImportarOfertasPdfPage() {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ofertas, setOfertas] = useState<OfertaDraft[]>([]);
  const [publicando, setPublicando] = useState(false);
  const [msg, setMsg] = useState("");

  if (!user) {
    return (
      <div style={{ background: "#04040f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2>Inicia sesión para continuar</h2>
          <a href="/" style={{ color: C.neon }}>← Volver al inicio</a>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div style={{ background: "#04040f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <h2>Sin permisos</h2>
          <a href="/" style={{ color: C.neon }}>← Volver al inicio</a>
        </div>
      </div>
    );
  }

  const handleFile = async (file: File) => {
    setError("");
    setMsg("");
    setOfertas([]);
    setFileName(file.name);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/ofertas/extract-pdf", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar el PDF");
        setLoading(false);
        return;
      }

      const drafts: OfertaDraft[] = (data.ofertas ?? []).map((o: any, i: number) => ({
        _uid: `${Date.now()}-${i}`,
        seleccionada: true,
        titulo: o.titulo ?? "",
        operador: o.operador ?? "",
        descripcion: o.descripcion ?? "",
        precio: o.precio?.toString() ?? "",
        precio_antes: o.precio_antes?.toString() ?? "",
        tipo: o.tipo ?? "internet",
        badge: o.badge ?? "",
        emoji: o.emoji ?? "⚡",
        color: o.color ?? "#00d4ff",
        fecha_fin: o.fecha_fin ?? "",
      }));

      if (drafts.length === 0) {
        setError("La IA no encontró ofertas con precio y vigencia claros en este PDF.");
      }
      setOfertas(drafts);
    } catch (e) {
      setError("Error de red al procesar el PDF");
    }
    setLoading(false);
  };

  const updateOferta = (uid: string, field: keyof OfertaDraft, value: any) => {
    setOfertas((prev) => prev.map((o) => (o._uid === uid ? { ...o, [field]: value } : o)));
  };

  const descartar = (uid: string) => setOfertas((prev) => prev.filter((o) => o._uid !== uid));

  const seleccionadas = ofertas.filter((o) => o.seleccionada);

  const publicar = async () => {
    if (seleccionadas.length === 0) return;
    setPublicando(true);
    setMsg("");

    const payload = seleccionadas.map((o) => ({
      titulo: o.titulo.trim(),
      operador: o.operador || null,
      descripcion: o.descripcion || null,
      precio: o.precio ? Number(o.precio) : null,
      precio_antes: o.precio_antes ? Number(o.precio_antes) : null,
      tipo: o.tipo || null,
      badge: o.badge || null,
      emoji: o.emoji,
      color: o.color,
      fecha_fin: o.fecha_fin || null,
      activa: true,
      created_by: user.id,
    }));

    const { error: insertError } = await supabase.from("ofertas_hot").insert(payload);

    if (insertError) {
      setMsg(`❌ Error al publicar: ${insertError.message}`);
    } else {
      setMsg(`✅ ${payload.length} oferta(s) publicada(s) correctamente`);
      setOfertas((prev) => prev.filter((o) => !o.seleccionada));
    }
    setPublicando(false);
  };

  return (
    <div style={{ background: "#04040f", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <a href="/admin/ofertas" style={{ color: "rgba(180,195,230,0.4)", fontSize: 12, textDecoration: "none" }}>Admin Ofertas</a>
            <span style={{ color: "rgba(180,195,230,0.2)" }}>›</span>
            <span style={{ color: "rgba(180,195,230,0.6)", fontSize: 12 }}>Importar desde PDF</span>
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, background: "linear-gradient(90deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📄 Importar ofertas hot desde PDF
          </h1>
          <p style={{ color: "rgba(180,195,230,0.5)", fontSize: 13, marginTop: 4 }}>
            Sube el brochure/léeme del operador. La IA propone las ofertas — revísalas y edítalas antes de publicar.
          </p>
        </div>

        {/* Uploader */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${loading ? C.neon : "rgba(255,255,255,0.15)"}`,
            borderRadius: 16, padding: "36px 20px", textAlign: "center",
            cursor: "pointer", marginBottom: 20, background: "rgba(255,255,255,0.02)",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div style={{ fontSize: 36, marginBottom: 10 }}>{loading ? "⏳" : "📎"}</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {loading ? "Analizando PDF con IA…" : fileName || "Haz clic para subir un PDF"}
          </div>
          <div style={{ color: "rgba(180,195,230,0.4)", fontSize: 12 }}>
            {loading ? "Esto puede tardar hasta 30 segundos" : "Léeme B2B, ofertas tácticas, brochures comerciales…"}
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#fca5a5", fontSize: 13 }}>
            {error}
          </div>
        )}
        {msg && (
          <div style={{ background: msg.startsWith("✅") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msg.startsWith("✅") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: msg.startsWith("✅") ? "#6ee7b7" : "#fca5a5", fontSize: 13 }}>
            {msg}
          </div>
        )}

        {/* Ofertas extraídas */}
        {ofertas.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "rgba(180,195,230,0.6)" }}>
                {ofertas.length} oferta(s) detectada(s) — revisa y edita antes de publicar
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {ofertas.map((o) => (
                <div key={o._uid} style={{ background: "rgba(8,6,28,0.85)", border: `1px solid ${o.color}33`, borderRadius: 14, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <input type="checkbox" checked={o.seleccionada} onChange={(e) => updateOferta(o._uid, "seleccionada", e.target.checked)} style={{ width: 16, height: 16 }} />
                    <span style={{ fontSize: 20 }}>{o.emoji}</span>
                    <input value={o.titulo} onChange={(e) => updateOferta(o._uid, "titulo", e.target.value)} style={{ ...inputStyle, fontWeight: 700, fontSize: 14, flex: 1 }} />
                    <button onClick={() => descartar(o._uid)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, padding: "6px 10px", color: "#ef4444", fontSize: 11, cursor: "pointer" }}>🗑️ Descartar</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={labelStyle}>OPERADOR</label>
                      <input value={o.operador} onChange={(e) => updateOferta(o._uid, "operador", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>TIPO</label>
                      <select value={o.tipo} onChange={(e) => updateOferta(o._uid, "tipo", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                        {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>PRECIO</label>
                      <input type="number" value={o.precio} onChange={(e) => updateOferta(o._uid, "precio", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>PRECIO ANTES</label>
                      <input type="number" value={o.precio_antes} onChange={(e) => updateOferta(o._uid, "precio_antes", e.target.value)} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>DESCRIPCIÓN</label>
                    <textarea value={o.descripcion} onChange={(e) => updateOferta(o._uid, "descripcion", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>BADGE</label>
                      <input value={o.badge} onChange={(e) => updateOferta(o._uid, "badge", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>VÁLIDO HASTA</label>
                      <input type="date" value={o.fecha_fin} onChange={(e) => updateOferta(o._uid, "fecha_fin", e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={publicar}
              disabled={seleccionadas.length === 0 || publicando}
              style={{
                width: "100%", background: seleccionadas.length ? "linear-gradient(135deg,#ef4444,#f59e0b)" : "rgba(255,255,255,0.05)",
                border: "none", borderRadius: 10, padding: "13px 0", color: "#fff", fontWeight: 700, fontSize: 14,
                cursor: seleccionadas.length ? "pointer" : "default",
              }}
            >
              {publicando ? "Publicando…" : `🔥 Publicar ${seleccionadas.length} oferta(s) seleccionada(s)`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
