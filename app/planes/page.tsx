"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { C } from "@/lib/constants";

const ADMIN_EMAIL = "jimmy.reyes@voipcurp.com";

const OPERADORES = ["Claro", "Movistar", "Etb", "Tigo", "Une Epm Telco", "Wom", "Virgin", "Emcali", "Otro"];
const TIPOS      = ["internet", "paquete", "movil", "tv", "otro"];
const MODALIDADES = ["pospago", "prepago"];
const TECNOLOGIAS = ["Fibra FTTH", "Fibra GPON", "HFC", "4G LTE", "5G", "ADSL", "Cable", "Otro"];

interface PlanManual {
  id: string;
  operador: string;
  nombre: string;
  tipo: string;
  modalidad: string | null;
  precio: number;
  velocidad_mbps: number | null;
  datos_gb: number | null;
  canales_tv: number | null;
  minutos: string | null;
  tecnologia: string | null;
  fuente: string;
  activo: boolean;
  created_at: string;
}

const EMPTY = {
  operador: "Tigo",
  nombre: "",
  tipo: "internet",
  modalidad: "pospago",
  precio: "",
  velocidad_mbps: "",
  datos_gb: "",
  canales_tv: "",
  minutos: "",
  tecnologia: "Fibra FTTH",
  tiene_internet_fijo: false,
  tiene_television: false,
  tiene_telefonia: false,
  tiene_telefonia_movil: false,
  tiene_internet_movil: false,
};

const BG = "#04040f";
const CARD = "rgba(8,6,28,0.9)";
const BORDER = "rgba(255,255,255,0.08)";
const BORDER_ACCENT = "rgba(0,212,255,0.25)";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", color: "rgba(180,195,230,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: "10px 12px",
  color: "#fff",
  fontSize: 13,
  outline: "none",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box" as const,
};

const selectStyle = {
  ...inputStyle,
  appearance: "none" as const,
  cursor: "pointer",
};

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
        padding: "8px 12px", borderRadius: 8,
        background: checked ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${checked ? "rgba(0,212,255,0.3)" : BORDER}`,
        transition: "all .15s",
      }}
    >
      <div style={{
        width: 32, height: 18, borderRadius: 99,
        background: checked ? C.neon : "rgba(255,255,255,0.1)",
        position: "relative", transition: "background .2s",
        flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 3, left: checked ? 17 : 3,
          width: 12, height: 12, borderRadius: "50%",
          background: "#fff", transition: "left .2s",
        }} />
      </div>
      <span style={{ color: checked ? C.neon : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

export default function AdminPlanesPage() {
  const { user } = useAuth();
  const [planes,   setPlanes]   = useState<PlanManual[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [msg,      setMsg]      = useState("");
  const [search,   setSearch]   = useState("");
  const [filterOp, setFilterOp] = useState("Todos");

  const isAdmin = user?.email === ADMIN_EMAIL;

  const cargar = async () => {
    const { data } = await supabase
      .from("planes")
      .select("id, operador, nombre, tipo, modalidad, precio, velocidad_mbps, datos_gb, canales_tv, minutos, tecnologia, fuente, activo, created_at")
      .eq("fuente", "Manual")
      .order("created_at", { ascending: false });
    setPlanes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  if (!user || !isAdmin) return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{!user ? "🔒" : "🚫"}</div>
        <h2>{!user ? "Inicia sesión para continuar" : "Sin permisos"}</h2>
        <a href="/" style={{ color: C.neon, marginTop: 16, display: "inline-block" }}>← Volver</a>
      </div>
    </div>
  );

  const inp = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  // Auto-detectar flags de servicios según tipo
  const handleTipoChange = (tipo: string) => {
    const flags = {
      tiene_internet_fijo:   ["internet", "paquete"].includes(tipo),
      tiene_television:      ["tv", "paquete"].includes(tipo),
      tiene_telefonia_movil: tipo === "movil",
      tiene_internet_movil:  tipo === "movil",
      tiene_telefonia:       tipo === "paquete",
    };
    setForm((f) => ({ ...f, tipo, ...flags }));
  };

  const handleSave = async () => {
    if (!form.operador || !form.nombre.trim() || !form.precio) {
      setMsg("❌ Operador, nombre y precio son obligatorios");
      return;
    }
    setSaving(true);
    setMsg("");

    // ID único para planes manuales: "manual-operador-slug-timestamp"
    const slug = form.nombre.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
    const id   = editId ?? `manual-${form.operador.toLowerCase()}-${slug}-${Date.now()}`;

    const payload = {
      id,
      id_crc:               editId ? undefined : null,
      operador:             form.operador,
      nombre:               form.nombre.trim(),
      tipo:                 form.tipo,
      modalidad:            form.modalidad || null,
      precio:               Number(form.precio),
      precio_mensual:       Number(form.precio),
      velocidad_mbps:       form.velocidad_mbps ? Number(form.velocidad_mbps) : null,
      datos_gb:             form.datos_gb ? Number(form.datos_gb) : null,
      canales_tv:           form.canales_tv ? Number(form.canales_tv) : null,
      minutos:              form.minutos || null,
      tecnologia:           form.tecnologia || null,
      tiene_internet_fijo:  form.tiene_internet_fijo,
      tiene_television:     form.tiene_television,
      tiene_telefonia:      form.tiene_telefonia,
      tiene_telefonia_movil: form.tiene_telefonia_movil,
      tiene_internet_movil: form.tiene_internet_movil,
      fuente:               "Manual",
      activo:               true,
    };

    if (editId) {
      const { error } = await supabase.from("planes").update(payload).eq("id", editId);
      setMsg(error ? `❌ ${error.message}` : "✅ Plan actualizado");
    } else {
      const { error } = await supabase.from("planes").insert(payload);
      setMsg(error ? `❌ ${error.message}` : "✅ Plan agregado al catálogo");
    }

    setForm(EMPTY);
    setEditId(null);
    setSaving(false);
    cargar();
  };

  const handleEdit = (p: PlanManual) => {
    setEditId(p.id);
    setForm({
      operador:    p.operador,
      nombre:      p.nombre,
      tipo:        p.tipo,
      modalidad:   p.modalidad ?? "pospago",
      precio:      p.precio.toString(),
      velocidad_mbps: p.velocidad_mbps?.toString() ?? "",
      datos_gb:    p.datos_gb?.toString() ?? "",
      canales_tv:  p.canales_tv?.toString() ?? "",
      minutos:     p.minutos ?? "",
      tecnologia:  p.tecnologia ?? "Fibra FTTH",
      tiene_internet_fijo:   ["internet", "paquete"].includes(p.tipo),
      tiene_television:      ["tv", "paquete"].includes(p.tipo),
      tiene_telefonia:       p.tipo === "paquete",
      tiene_telefonia_movil: p.tipo === "movil",
      tiene_internet_movil:  p.tipo === "movil",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (id: string, activo: boolean) => {
    await supabase.from("planes").update({ activo: !activo }).eq("id", id);
    cargar();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este plan?")) return;
    await supabase.from("planes").delete().eq("id", id);
    cargar();
  };

  const planesFiltrados = planes.filter((p) => {
    const matchOp = filterOp === "Todos" || p.operador === filterOp;
    const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase());
    return matchOp && matchSearch;
  });

  const operadoresEnDB = ["Todos", ...Array.from(new Set(planes.map((p) => p.operador)))];

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 12 }}>
            <a href="/" style={{ color: "rgba(180,195,230,0.3)", textDecoration: "none" }}>Inicio</a>
            <span style={{ color: "rgba(180,195,230,0.2)" }}>›</span>
            <a href="/admin/ofertas" style={{ color: "rgba(180,195,230,0.3)", textDecoration: "none" }}>Admin</a>
            <span style={{ color: "rgba(180,195,230,0.2)" }}>›</span>
            <span style={{ color: "rgba(180,195,230,0.6)" }}>Planes Manuales</span>
          </div>
          <h1 style={{
            fontSize: "1.8rem", fontWeight: 900,
            background: "linear-gradient(90deg,#00d4ff,#a855f7)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 6,
          }}>
            📡 Planes Manuales
          </h1>
          <p style={{ color: "rgba(180,195,230,0.4)", fontSize: 13 }}>
            Planes que no están en la CRC — aparecen en el catálogo y en GameFlow igual que los demás
          </p>
        </div>

        {/* Formulario */}
        <div style={{ background: CARD, border: `1px solid ${BORDER_ACCENT}`, borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, marginBottom: 20, color: C.neon, letterSpacing: 0.5 }}>
            {editId ? "✏️ Editar plan" : "➕ Agregar plan"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Operador */}
            <Field label="OPERADOR *">
              <select value={form.operador} onChange={(e) => inp("operador", e.target.value)} style={selectStyle}>
                {OPERADORES.map((op) => <option key={op} value={op}>{op}</option>)}
              </select>
            </Field>

            {/* Tipo */}
            <Field label="TIPO *">
              <select value={form.tipo} onChange={(e) => handleTipoChange(e.target.value)} style={selectStyle}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            {/* Nombre */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="NOMBRE DEL PLAN *">
                <input
                  value={form.nombre}
                  onChange={(e) => inp("nombre", e.target.value)}
                  placeholder="Ej: Internet Tigo 300 Mbps Fibra"
                  style={inputStyle}
                />
              </Field>
            </div>

            {/* Precio */}
            <Field label="PRECIO MENSUAL (COP) *">
              <input
                type="number"
                value={form.precio}
                onChange={(e) => inp("precio", e.target.value)}
                placeholder="78900"
                style={inputStyle}
              />
            </Field>

            {/* Modalidad */}
            <Field label="MODALIDAD">
              <select value={form.modalidad} onChange={(e) => inp("modalidad", e.target.value)} style={selectStyle}>
                {MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>

            {/* Velocidad */}
            <Field label="VELOCIDAD (Mbps)">
              <input
                type="number"
                value={form.velocidad_mbps}
                onChange={(e) => inp("velocidad_mbps", e.target.value)}
                placeholder="300"
                style={inputStyle}
              />
            </Field>

            {/* Tecnología */}
            <Field label="TECNOLOGÍA">
              <select value={form.tecnologia} onChange={(e) => inp("tecnologia", e.target.value)} style={selectStyle}>
                {TECNOLOGIAS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            {/* Canales TV */}
            <Field label="CANALES TV">
              <input
                type="number"
                value={form.canales_tv}
                onChange={(e) => inp("canales_tv", e.target.value)}
                placeholder="116"
                style={inputStyle}
              />
            </Field>

            {/* Datos GB */}
            <Field label="DATOS MÓVILES (GB) — -1 = ilimitado">
              <input
                type="number"
                value={form.datos_gb}
                onChange={(e) => inp("datos_gb", e.target.value)}
                placeholder="-1"
                style={inputStyle}
              />
            </Field>

            {/* Minutos */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="MINUTOS / DESCRIPCIÓN ADICIONAL">
                <input
                  value={form.minutos}
                  onChange={(e) => inp("minutos", e.target.value)}
                  placeholder="Ej: Ilimitados Nal + LDI EEUU/Canadá"
                  style={inputStyle}
                />
              </Field>
            </div>

            {/* Flags de servicios */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ color: "rgba(180,195,230,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
                SERVICIOS INCLUIDOS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                <Toggle label="Internet Fijo"    checked={form.tiene_internet_fijo}   onChange={() => inp("tiene_internet_fijo",   !form.tiene_internet_fijo)} />
                <Toggle label="Televisión"       checked={form.tiene_television}      onChange={() => inp("tiene_television",      !form.tiene_television)} />
                <Toggle label="Telefonía Fija"   checked={form.tiene_telefonia}       onChange={() => inp("tiene_telefonia",       !form.tiene_telefonia)} />
                <Toggle label="Móvil Datos"      checked={form.tiene_internet_movil}  onChange={() => inp("tiene_internet_movil",  !form.tiene_internet_movil)} />
                <Toggle label="Telefonía Móvil"  checked={form.tiene_telefonia_movil} onChange={() => inp("tiene_telefonia_movil", !form.tiene_telefonia_movil)} />
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.nombre && form.precio && (
            <div style={{ marginTop: 18, background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 10, padding: 14 }}>
              <div style={{ color: "rgba(180,195,230,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PREVIEW</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ color: "rgba(180,195,230,0.5)", fontSize: 11 }}>{form.operador} · {form.tipo} · {form.modalidad}</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginTop: 2 }}>{form.nombre}</div>
                  {form.velocidad_mbps && <div style={{ color: C.neon, fontSize: 12, marginTop: 3 }}>⚡ {form.velocidad_mbps} Mbps · {form.tecnologia}</div>}
                </div>
                <div style={{ color: C.neon, fontWeight: 900, fontSize: 22 }}>
                  ${Number(form.precio).toLocaleString("es-CO")}
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 400 }}>/mes</span>
                </div>
              </div>
            </div>
          )}

          {msg && (
            <div style={{ marginTop: 14, color: msg.startsWith("✅") ? "#10b981" : "#ef4444", fontSize: 13, fontWeight: 600 }}>
              {msg}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {editId && (
              <button
                onClick={() => { setForm(EMPTY); setEditId(null); setMsg(""); }}
                style={{ padding: "11px 20px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "transparent", color: "rgba(180,195,230,0.4)", fontSize: 13, cursor: "pointer" }}
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, border: "none", borderRadius: 10, padding: "12px 0",
                background: saving ? "rgba(0,212,255,0.3)" : "linear-gradient(135deg,#0070cc,#0050aa)",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "default" : "pointer",
                boxShadow: saving ? "none" : "0 0 20px rgba(0,112,204,0.4)",
              }}
            >
              {saving ? "Guardando..." : editId ? "Actualizar plan" : "📡 Publicar en catálogo"}
            </button>
          </div>
        </div>

        {/* Lista */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
              Planes manuales ({planesFiltrados.length})
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                style={{ ...inputStyle, width: 160, padding: "8px 12px", fontSize: 12 }}
              />
              <select value={filterOp} onChange={(e) => setFilterOp(e.target.value)} style={{ ...selectStyle, width: 130, padding: "8px 12px", fontSize: 12 }}>
                {operadoresEnDB.map((op) => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(180,195,230,0.4)" }}>Cargando...</div>
          ) : planesFiltrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(180,195,230,0.4)" }}>
              {planes.length === 0 ? "Aún no hay planes manuales — agrega el primero arriba" : "Sin resultados para ese filtro"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {planesFiltrados.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: CARD,
                    border: `1px solid ${p.activo ? "rgba(0,212,255,0.15)" : BORDER}`,
                    borderRadius: 12, padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                    opacity: p.activo ? 1 : 0.45,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: C.neon, borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                        {p.operador}
                      </span>
                      <span style={{ color: "rgba(180,195,230,0.4)", fontSize: 10 }}>{p.tipo} · {p.modalidad}</span>
                      {p.tecnologia && <span style={{ color: "rgba(180,195,230,0.3)", fontSize: 10 }}>{p.tecnologia}</span>}
                    </div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{p.nombre}</div>
                    <div style={{ display: "flex", gap: 10, fontSize: 11, flexWrap: "wrap" }}>
                      <span style={{ color: C.neon, fontWeight: 800 }}>${p.precio.toLocaleString("es-CO")}/mes</span>
                      {p.velocidad_mbps && <span style={{ color: "rgba(180,195,230,0.5)" }}>⚡ {p.velocidad_mbps} Mbps</span>}
                      {p.canales_tv && <span style={{ color: "rgba(180,195,230,0.5)" }}>📺 {p.canales_tv} ch</span>}
                      {p.datos_gb && <span style={{ color: "rgba(180,195,230,0.5)" }}>{p.datos_gb === -1 ? "∞ Datos" : `${p.datos_gb} GB`}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleToggle(p.id, p.activo)}
                      style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${p.activo ? "rgba(16,185,129,0.4)" : BORDER}`, background: p.activo ? "rgba(16,185,129,0.1)" : "transparent", color: p.activo ? "#10b981" : "rgba(180,195,230,0.3)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
                    >
                      {p.activo ? "✓ Activo" : "Inactivo"}
                    </button>
                    <button
                      onClick={() => handleEdit(p)}
                      style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid rgba(0,212,255,0.25)", background: "rgba(0,212,255,0.06)", color: C.neon, fontSize: 10, fontWeight: 700, cursor: "pointer" }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", color: "#ef4444", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        <div style={{ marginTop: 24, display: "flex", gap: 16, justifyContent: "center", fontSize: 13 }}>
          <a href="/admin/ofertas" style={{ color: "rgba(180,195,230,0.4)", textDecoration: "none" }}>← Ofertas Hot</a>
          <a href="/planes" target="_blank" style={{ color: C.neon, textDecoration: "none", fontWeight: 600 }}>Ver catálogo →</a>
        </div>
      </div>
    </div>
  );
}
