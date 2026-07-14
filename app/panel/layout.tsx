"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Tag, Users, TrendingUp, FileBarChart, GraduationCap, AlertCircle, Settings, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/panel",           label: "Dashboard",   icon: LayoutDashboard },
  { href: "/panel/ofertas",   label: "Ofertas",     icon: Tag },
  { href: "/panel/leads",     label: "CRM / Leads", icon: Users },
  { href: "/panel/ventas",    label: "Ventas",      icon: TrendingUp },
  { href: "/panel/reportes",  label: "Reportes",    icon: FileBarChart },
  { href: "/panel/recursos",  label: "Capacitación", icon: GraduationCap },
  { href: "/panel/incidencias", label: "Incidencias", icon: AlertCircle },
  { href: "/panel/config",    label: "Configuración", icon: Settings },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const { perfil } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0b1220" }}>
      <aside style={{
        width: open ? 240 : 64, flexShrink: 0, background: "#0f172a",
        borderRight: "1px solid rgba(255,255,255,0.06)", transition: "width .2s",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {open && <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Panel Asesores</span>}
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px" }}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 8, marginBottom: 2, textDecoration: "none",
                background: active ? "rgba(0,212,255,0.1)" : "transparent",
                color: active ? "#00d4ff" : "#94a3b8", fontSize: 13, fontWeight: 600,
              }}>
                <Icon size={16} />
                {open && item.label}
              </Link>
            );
          })}
        </nav>
        {open && perfil && (
          <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.06)", color: "#64748b", fontSize: 11 }}>
            {perfil.nombre} · <span style={{ textTransform: "capitalize" }}>{(perfil as any).rol ?? "asesor"}</span>
          </div>
        )}
      </aside>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
