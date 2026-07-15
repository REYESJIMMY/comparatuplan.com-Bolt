"use client";
import { useAuth } from "@/context/AuthContext";

/**
 * Dashboard placeholder — Sprint A
 * Objetivo de este sprint: confirmar que el middleware deja pasar
 * a un usuario autenticado con rol válido. El contenido real
 * (KPIs, gráficos, notificaciones) llega en el Sprint B.
 */
export default function PanelDashboardPage() {
  const { perfil, user } = useAuth();

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
        Bienvenido{perfil?.nombre ? `, ${perfil.nombre}` : ""} 👋
      </h1>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 28 }}>
        Panel de Asesores · ComparaTuPlan.com
      </p>

      <div style={{
        background: "rgba(0,212,255,0.06)",
        border: "1px solid rgba(0,212,255,0.2)",
        borderRadius: 12, padding: "16px 20px",
        display: "flex", flexWrap: "wrap", gap: 24,
      }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 11, marginBottom: 3 }}>Usuario</div>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{user?.email ?? user?.phone ?? "—"}</div>
        </div>
        <div>
          <div style={{ color: "#64748b", fontSize: 11, marginBottom: 3 }}>Rol</div>
          <div style={{ color: "#00d4ff", fontSize: 13, fontWeight: 700, textTransform: "capitalize" }}>
            {(perfil as any)?.rol ?? "asesor"}
          </div>
        </div>
        <div>
          <div style={{ color: "#64748b", fontSize: 11, marginBottom: 3 }}>Zona</div>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{(perfil as any)?.zona ?? "Sin asignar"}</div>
        </div>
      </div>

      <div style={{ marginTop: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20 }}>
        <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
          PRÓXIMO SPRINT (B)
        </div>
        <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6 }}>
          Aquí llegarán las tarjetas de KPIs (ventas hoy, leads asignados, conversión %)
          conectadas a datos reales de Supabase, y el módulo de ofertas con comparador
          lado a lado.
        </p>
      </div>
    </div>
  );
}
