"use client";
import { useState, useEffect } from "react";
import { User, Heart, Clock, Settings, LogOut, Zap, Check, Trash2, Bell, BellOff, ExternalLink } from "lucide-react";
import { C, openWA } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { GlowBtn, WABtn, Chip } from "@/components/ui";

/* ── Types ───────────────────────────────────────────────────── */
interface HistorialItem {
  id: string; avatar_tipo: string; dispositivos: any[];
  mbps_base: number; mbps_rec: number; tipo_plan_rec: string;
  planes_vistos: string[]; created_at: string;
}

/* ── Sub-component: tab button ───────────────────────────────── */
const Tab = ({ active, icon: Icon, label, badge, onClick }: any) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 16px", borderRadius: 10, border: "none",
      background: active ? "rgba(0,212,255,0.1)" : "transparent",
      borderBottom: active ? `2px solid ${C.neon}` : "2px solid transparent",
      color: active ? C.neon : C.muted, fontWeight: active ? 700 : 600,
      fontSize: 13, cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap",
    }}
  >
    <Icon size={15} />
    {label}
    {badge > 0 && (
      <span style={{ background: C.neon, color: "#04040f", borderRadius: 99, padding: "1px 7px", fontSize: 10, fontWeight: 900 }}>{badge}</span>
    )}
  </button>
);

/* ── Avatar circle ───────────────────────────────────────────── */
const AvatarBig = ({ nombre }: { nombre: string | null }) => {
  const initials = nombre ? nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  return (
    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#0070cc,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 26, flexShrink: 0, boxShadow: "0 0 24px rgba(0,112,204,0.4)" }}>
      {initials}
    </div>
  );
};

/* ── Section: Perfil ─────────────────────────────────────────── */
const SeccionPerfil = () => {
  const { user, perfil, updatePerfil } = useAuth();
  const [nombre,    setNombre]    = useState(perfil?.nombre    ?? "");
  const [telefono,  setTelefono]  = useState(perfil?.telefono  ?? "");
  const [ciudad,    setCiudad]    = useState(perfil?.ciudad    ?? "");
  const [estrato,   setEstrato]   = useState<number | "">(perfil?.estrato ?? "");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const save = async () => {
    setSaving(true);
    await updatePerfil({ nombre, telefono, ciudad, estrato: estrato === "" ? null : Number(estrato) } as any);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inp: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: "10px 13px", color: "#fff", fontSize: 13, outline: "none", width: "100%" };
  const label: React.CSSProperties = { color: C.muted, fontSize: 11, fontWeight: 600, marginBottom: 5, display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <AvatarBig nombre={nombre || null} />
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{nombre || "Tu nombre"}</div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{user?.email ?? user?.phone}</div>
          {perfil?.avatar_tipo && <Chip color={C.neon} style={{ marginTop: 6 }}>{perfil.avatar_tipo}</Chip>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={label}>Nombre completo</label>
          <input style={inp} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
        </div>
        <div>
          <label style={label}>Celular</label>
          <input style={inp} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+57 300 000 0000" type="tel" />
        </div>
        <div>
          <label style={label}>Ciudad</label>
          <input style={inp} value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Bogotá" />
        </div>
        <div>
          <label style={label}>Estrato</label>
          <select
            style={{ ...inp, appearance: "none" }}
            value={estrato}
            onChange={(e) => setEstrato(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">Sin seleccionar</option>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>Estrato {n}</option>)}
          </select>
        </div>
      </div>

      <GlowBtn
        onClick={save}
        disabled={saving}
        gradient="linear-gradient(135deg,#0070cc,#0050aa)"
        glow={C.neon}
        style={{ borderRadius: 10, padding: "11px 0", alignSelf: "flex-start", minWidth: 160 }}
      >
        {saving ? "Guardando…" : saved ? "✓ Guardado" : "Guardar cambios"}
      </GlowBtn>

      {/* Plan profile summary */}
      {perfil?.avatar_tipo && (
        <div style={{ background: "rgba(0,212,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ color: C.neon, fontSize: 10, fontWeight: 800, letterSpacing: 1.2, marginBottom: 10 }}>⚡ TU PERFIL DIGITAL</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              ["Avatar",       perfil.avatar_tipo,                    C.neon],
              ["Velocidad rec", `${perfil.mbps_necesarios ?? "—"} Mbps`, C.yellow],
              ["Tipo de plan",  perfil.tipo_plan_rec ?? "—",            C.neon2],
            ].map(([l, v, c]) => (
              <div key={String(l)} style={{ textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 9, padding: "8px 6px" }}>
                <div style={{ color: C.muted, fontSize: 9, marginBottom: 3 }}>{l}</div>
                <div style={{ color: String(c), fontWeight: 800, fontSize: 13, textTransform: "capitalize" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Section: Favoritos ──────────────────────────────────────── */
const SeccionFavoritos = () => {
  const { favoritos, toggleFavorito } = useAuth();

  if (favoritos.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <Heart size={40} color={C.muted} style={{ margin: "0 auto 16px", display: "block", opacity: .3 }} />
      <p style={{ color: C.muted, fontSize: 14 }}>Todavía no tienes planes favoritos.</p>
      <p style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Usa el corazón ❤️ en los planes que te interesen.</p>
      <GlowBtn onClick={() => window.location.href = "/planes"} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{ marginTop: 20, borderRadius: 10, padding: "10px 24px" }}>
        Ver catálogo de planes →
      </GlowBtn>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
      {favoritos.map((f) => (
        <div key={f.id} style={{ background: "rgba(8,6,28,0.8)", border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ color: C.neon, fontWeight: 700, fontSize: 11, marginBottom: 3 }}>{f.operador}</div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>{f.nombre}</div>
            </div>
            <button
              onClick={() => toggleFavorito(f as any)}
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "6px", cursor: "pointer", color: "#ef4444", display: "flex" }}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div style={{ color: C.neon, fontWeight: 900, fontSize: 22, marginBottom: 8 }}>
            ${(f.precio ?? 0).toLocaleString()}
            <span style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>/mes</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {f.tipo && <Chip color={C.neon}>{f.tipo}</Chip>}
          </div>
          <WABtn name={`${f.operador} - ${f.nombre}`} label="Lo Quiero 🚀" full style={{ borderRadius: 9, fontSize: 12 }} />
        </div>
      ))}
    </div>
  );
};

/* ── Section: Historial ──────────────────────────────────────── */
const SeccionHistorial = () => {
  const { user } = useAuth();
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("historial_busquedas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setHistorial(data as HistorialItem[]); setLoading(false); });
  }, [user]);

  if (loading) return <div style={{ color: C.muted, textAlign: "center", padding: "40px 0" }}>Cargando historial…</div>;

  if (historial.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <Clock size={40} color={C.muted} style={{ margin: "0 auto 16px", display: "block", opacity: .3 }} />
      <p style={{ color: C.muted, fontSize: 14 }}>Aún no tienes análisis guardados.</p>
      <p style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Diseña tu hogar digital para ver tu historial aquí.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {historial.map((h) => {
        const fecha = new Date(h.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
        return (
          <div key={h.id} style={{ background: "rgba(8,6,28,0.8)", border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ background: "rgba(0,212,255,0.08)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 20 }}>
                  {h.avatar_tipo === "gamer" ? "🎮" : h.avatar_tipo === "familia" ? "👨‍👩‍👧‍👦" : h.avatar_tipo === "teletrabajo" ? "💼" : "📱"}
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, textTransform: "capitalize" }}>{h.avatar_tipo}</div>
                  <div style={{ color: C.muted, fontSize: 10 }}>{fecha}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: C.neon, fontWeight: 800, fontSize: 14 }}>{h.mbps_rec} Mbps</div>
                <div style={{ color: C.muted, fontSize: 10 }}>recomendado</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <Chip color={C.neon2}>{h.tipo_plan_rec}</Chip>
              <Chip color={C.muted}>{h.mbps_base} Mbps base</Chip>
              {Array.isArray(h.dispositivos) && <Chip color={C.cyan}>{h.dispositivos.length} dispositivos</Chip>}
              {Array.isArray(h.planes_vistos) && <Chip color={C.green}>{h.planes_vistos.length} planes sugeridos</Chip>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Section: Configuración ──────────────────────────────────── */
const SeccionConfig = () => {
  const { user } = useAuth();
  const [subs,    setSubs]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("suscripciones_precio")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setSubs(data); setLoading(false); });
  }, [user]);

  const toggle = async (id: string, activa: boolean) => {
    await supabase.from("suscripciones_precio").update({ activa: !activa }).eq("id", id);
    setSubs((p) => p.map((s) => s.id === id ? { ...s, activa: !activa } : s));
  };

  const remove = async (id: string) => {
    await supabase.from("suscripciones_precio").delete().eq("id", id);
    setSubs((p) => p.filter((s) => s.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Alertas de precio */}
      <div>
        <div style={{ color: C.muted, fontSize: 10, fontWeight: 800, letterSpacing: 1.2, marginBottom: 12 }}>🔔 ALERTAS DE PRECIO</div>
        {loading && <div style={{ color: C.muted, fontSize: 13 }}>Cargando…</div>}
        {!loading && subs.length === 0 && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: 16, textAlign: "center" }}>
            <Bell size={24} color={C.muted} style={{ margin: "0 auto 8px", display: "block", opacity: .4 }} />
            <p style={{ color: C.muted, fontSize: 12 }}>Sin alertas activas. Desde los planes puedes suscribirte cuando bajen de precio.</p>
          </div>
        )}
        {subs.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
            {s.activa ? <Bell size={16} color={C.neon} /> : <BellOff size={16} color={C.muted} />}
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>Plan ID: {s.plan_id}</div>
              <div style={{ color: C.muted, fontSize: 10 }}>{s.email ?? s.telefono}</div>
            </div>
            <button onClick={() => toggle(s.id, s.activa)} style={{ background: s.activa ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${s.activa ? C.border : C.borderSoft}`, borderRadius: 7, padding: "5px 10px", color: s.activa ? C.neon : C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {s.activa ? "Activa" : "Pausada"}
            </button>
            <button onClick={() => remove(s.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, padding: "5px", cursor: "pointer", color: "#ef4444", display: "flex" }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: 16 }}>
        <div style={{ color: "#ef4444", fontSize: 10, fontWeight: 800, letterSpacing: 1.2, marginBottom: 10 }}>ZONA DE PELIGRO</div>
        <p style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>¿Quieres eliminar tu cuenta? Esta acción es irreversible. Perderás tus favoritos e historial.</p>
        <WABtn name="solicitud de eliminación de cuenta" label="Solicitar eliminación" style={{ maxWidth: 200, borderRadius: 9, fontSize: 12, background: "rgba(239,68,68,0.8)" }} />
      </div>
    </div>
  );
};

/* ── Page ────────────────────────────────────────────────────── */
export default function PerfilPage() {
  const { user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<"perfil" | "favoritos" | "historial" | "config">("perfil");
  const { favoritos } = useAuth();

  useEffect(() => {
    // Handle hash navigation
    const hash = window.location.hash.replace("#", "");
    if (["favoritos", "historial", "config"].includes(hash)) setTab(hash as any);
  }, []);

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.neon, fontSize: 14 }}>Cargando…</div>
    </div>
  );

  if (!user) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 52 }}>🔐</div>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Inicia sesión para ver tu perfil</div>
      <GlowBtn onClick={() => window.location.href = "/"} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{ borderRadius: 10, padding: "11px 28px" }}>
        Ir al inicio →
      </GlowBtn>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: "#fff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Header bar */}
      <div style={{ background: "rgba(4,4,15,0.95)", borderBottom: `1px solid ${C.borderSoft}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(20px)" }}>
        <a href="/" style={{ color: C.neon, fontSize: 13, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          ← ComparaTuPlan
        </a>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Mi Perfil</span>
        <button onClick={signOut} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "6px 12px", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <LogOut size={12} />Salir
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 60px" }}>
        {/* Tab navigation */}
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.borderSoft}`, marginBottom: 28, overflowX: "auto" }}>
          <Tab active={tab === "perfil"}    icon={User}     label="Perfil"       onClick={() => setTab("perfil")} />
          <Tab active={tab === "favoritos"} icon={Heart}    label="Favoritos"    badge={favoritos.length} onClick={() => setTab("favoritos")} />
          <Tab active={tab === "historial"} icon={Clock}    label="Historial"    onClick={() => setTab("historial")} />
          <Tab active={tab === "config"}    icon={Settings} label="Configuración" onClick={() => setTab("config")} />
        </div>

        {/* Content */}
        <div style={{ animation: "fadeUp .3s ease-out" }}>
          {tab === "perfil"    && <SeccionPerfil />}
          {tab === "favoritos" && <SeccionFavoritos />}
          {tab === "historial" && <SeccionHistorial />}
          {tab === "config"    && <SeccionConfig />}
        </div>
      </div>

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
