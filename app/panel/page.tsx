"use client";
import { useEffect, useState } from "react";
import { TrendingUp, Users, Percent, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Kpis {
  ventasHoy: number;
  leadsActivos: number;
  conversion: number;
  ingresosMes: number;
}

const KpiCard = ({ icon: Icon, label, value, color, loading }: any) => (
  <div style={{
    background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`,
    borderRadius: 14, padding: "18px 20px", flex: "1 1 200px", minWidth: 180,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color={color} />
      </div>
      <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{label}</span>
    </div>
    <div style={{ color: "#fff", fontWeight: 900, fontSize: 26 }}>
      {loading ? "…" : value}
    </div>
  </div>
);

export default function PanelDashboardPage() {
  const { perfil, user } = useAuth();
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const cargar = async () => {
      const hoy = new Date().toISOString().slice(0, 10);
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const inicioMesStr = inicioMes.toISOString().slice(0, 10);

      // RLS filtra automáticamente por asesor/equipo/todo según el rol —
      // no hace falta agregar .eq("asesor_id", user.id) a mano.
      const [ventasHoyRes, leadsRes, ventasCerradasRes, ventasMesRes] = await Promise.all([
        supabase.from("ventas").select("id", { count: "exact", head: true }).eq("fecha_venta", hoy),
        supabase.from("leads").select("id", { count: "exact", head: true }).not("etapa", "in", "(cerrado,perdido)"),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("etapa", "cerrado"),
        supabase.from("ventas").select("monto").gte("fecha_venta", inicioMesStr),
      ]);

      const totalLeadsRes = await supabase.from("leads").select("id", { count: "exact", head: true });

      const totalLeads = totalLeadsRes.count ?? 0;
      const cerrados = ventasCerradasRes.count ?? 0;
      const conversion = totalLeads > 0 ? Math.round((cerrados / totalLeads) * 100) : 0;
      const ingresosMes = (ventasMesRes.data ?? []).reduce((acc, v: any) => acc + (Number(v.monto) || 0), 0);

      setKpis({
        ventasHoy: ventasHoyRes.count ?? 0,
        leadsActivos: leadsRes.count ?? 0,
        conversion,
        ingresosMes,
      });
      setLoading(false);
    };

    cargar();
  }, [user]);

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
        Bienvenido{perfil?.nombre ? `, ${perfil.nombre}` : ""} 👋
      </h1>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>
        {(perfil as any)?.rol === "admin"
          ? "Vista global — todos los asesores"
          : (perfil as any)?.rol === "supervisor"
          ? "Vista de tu equipo"
          : "Tu resumen personal"}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <KpiCard icon={TrendingUp} label="VENTAS HOY" value={kpis?.ventasHoy ?? 0} color="#00d4ff" loading={loading} />
        <KpiCard icon={Users}      label="LEADS ACTIVOS" value={kpis?.leadsActivos ?? 0} color="#a855f7" loading={loading} />
        <KpiCard icon={Percent}    label="CONVERSIÓN" value={`${kpis?.conversion ?? 0}%`} color="#10b981" loading={loading} />
        <KpiCard icon={DollarSign} label="INGRESOS DEL MES" value={`$${(kpis?.ingresosMes ?? 0).toLocaleString("es-CO")}`} color="#f59e0b" loading={loading} />
      </div>

      {!loading && kpis && kpis.leadsActivos === 0 && kpis.ventasHoy === 0 && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20 }}>
          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
            SIN DATOS TODAVÍA
          </div>
          <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6 }}>
            Las tablas <code>leads</code> y <code>ventas</code> están vacías — es normal, recién se crearon.
            En cuanto el módulo CRM (Sprint C) esté listo para cargar leads, estas tarjetas empezarán
            a mostrar números reales.
          </p>
        </div>
      )}
    </div>
  );
}
