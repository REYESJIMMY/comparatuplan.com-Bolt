"use client";
import { useState, useRef, useEffect } from "react";
import { User, Heart, Clock, LogOut, ChevronDown, Settings, Zap } from "lucide-react";
import { C } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

/* ── Avatar circle ───────────────────────────────────────────── */
const Avatar = ({ nombre, size = 32 }: { nombre: string | null; size?: number }) => {
  const initials = nombre
    ? nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#0070cc,#a855f7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.38,
      flexShrink: 0, boxShadow: "0 0 12px rgba(0,112,204,0.4)",
    }}>{initials}</div>
  );
};

/* ── Dropdown item ───────────────────────────────────────────── */
const MenuItem = ({ icon: Icon, label, sub, color = "#fff", onClick, badge }: any) => (
  <button
    onClick={onClick}
    style={{
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      padding: "9px 14px", border: "none", background: "transparent",
      color, cursor: "pointer", textAlign: "left", borderRadius: 8,
      transition: "background .14s",
    }}
    onMouseEnter={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
    onMouseLeave={(e: any) => e.currentTarget.style.background = "transparent"}
  >
    <Icon size={15} color={color} style={{ flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: C.muted }}>{sub}</div>}
    </div>
    {badge && (
      <span style={{ background: C.neon, color: "#04040f", borderRadius: 99, padding: "1px 7px", fontSize: 10, fontWeight: 900 }}>{badge}</span>
    )}
  </button>
);

/* ── Main component ──────────────────────────────────────────── */
export const UserMenu = ({ onOpenAuth }: { onOpenAuth: (mode: string) => void }) => {
  const { user, perfil, favoritos, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* ── Not logged in ─────────────────────────────────────────── */
  if (!user) return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => onOpenAuth("login")}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSoft}`, color: "rgba(180,195,230,0.7)", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "all .15s" }}
        onMouseEnter={(e: any) => { e.currentTarget.style.background = "rgba(0,212,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={(e: any) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(180,195,230,0.7)"; }}
      >
        <User size={13} />Ingresar
      </button>
      <button
        onClick={() => onOpenAuth("register")}
        className="desktop-nav"
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
      >
        Registrarse
      </button>
    </div>
  );

  /* ── Logged in ─────────────────────────────────────────────── */
  const nombre = perfil?.nombre ?? user.email?.split("@")[0] ?? "Usuario";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px",
          borderRadius: 99, background: open ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? C.border : C.borderSoft}`,
          cursor: "pointer", transition: "all .18s",
        }}
      >
        <Avatar nombre={nombre} size={28} />
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 12, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {nombre.split(" ")[0]}
        </span>
        <ChevronDown size={11} color={C.muted} style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          zIndex: 600, width: 260,
          background: "rgba(6,4,20,0.99)", border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "8px 6px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8),0 0 0 1px rgba(0,212,255,0.06)",
          backdropFilter: "blur(32px)", animation: "megaIn .15s ease-out",
        }}>
          {/* User info header */}
          <div style={{ padding: "10px 14px 12px", borderBottom: `1px solid ${C.borderSoft}`, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar nombre={nombre} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nombre}</div>
                <div style={{ color: C.muted, fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email ?? user.phone}</div>
              </div>
            </div>
            {/* Plan status */}
            {perfil?.avatar_tipo && (
              <div style={{ marginTop: 8, background: "rgba(0,212,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 7 }}>
                <Zap size={11} color={C.neon} />
                <span style={{ color: C.muted, fontSize: 10 }}>Perfil: </span>
                <span style={{ color: C.neon, fontSize: 10, fontWeight: 700, textTransform: "capitalize" }}>{perfil.avatar_tipo}</span>
                {perfil.tipo_plan_rec && <span style={{ color: C.muted, fontSize: 10 }}>· {perfil.tipo_plan_rec}</span>}
              </div>
            )}
          </div>

          <MenuItem icon={User}  label="Mi Perfil"   sub="Datos personales y preferencias" onClick={() => { window.location.href = "/perfil"; setOpen(false); }} />
          <MenuItem icon={Heart} label="Favoritos"   sub={`${favoritos.length} planes guardados`} badge={favoritos.length || undefined} onClick={() => { window.location.href = "/perfil#favoritos"; setOpen(false); }} />
          <MenuItem icon={Clock} label="Mi Historial" sub="Análisis anteriores" onClick={() => { window.location.href = "/perfil#historial"; setOpen(false); }} />
          <MenuItem icon={Settings} label="Configuración" sub="Alertas de precio y notificaciones" onClick={() => { window.location.href = "/perfil#config"; setOpen(false); }} />

          <div style={{ height: 1, background: C.borderSoft, margin: "6px 8px" }} />

          <MenuItem icon={LogOut} label="Cerrar sesión" color="rgba(239,68,68,0.8)" onClick={async () => { await signOut(); setOpen(false); }} />
        </div>
      )}
    </div>
  );
};
