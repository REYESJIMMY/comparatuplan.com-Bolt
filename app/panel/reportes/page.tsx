"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface FilaReporte {
  asesor: string;
  leadsTotal: number;
  leadsCerrados: number;
  ventasTotal: number;
  ingresos: number;
  conversion: number;
}

/**
 * Genera y descarga un CSV en el navegador sin librerías externas.
 */
function descargarCSV(filas: FilaReporte[]) {
  const encabezado = ["Asesor", "Leads totales", "Leads cerrados", "Ventas", "Ingresos", "Conversión %"];
  const filasCSV = filas.map((f) => [f.asesor, f.leadsTotal, f.leadsCerrados, f.ventasTotal, f.ingresos, f.conversion]);
  const contenido = [encabezado, ...filasCSV].map((fila) => fila.join(",")).join("\n");
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte_asesores_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PanelReportesPage() {
  const { perfil } = useAuth();
  const [filas, setFilas] = useState<FilaReporte[]>([]);
  const [loading, setLoading] = useState(true);
  const esSupervisorOAdmin = ["admin", "supervisor"].includes((perfil as any)?.rol ?? "");

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      // RLS ya limita a lo que el usuario puede ver: si es asesor, solo
      // sus propios datos; si es supervisor, los de su equipo; admin, todo.
      const [leadsRes, ventasRes, perfilesRes] = await Promise.all([
        supabase.from("leads").select("id, etapa, asesor_id"),
        supabase.from("ventas").select("id, monto, asesor_id"),
        supabase.from("perfiles").select("id, nombre"),
      ]);

      const leads = leadsRes.data ?? [];
      const ventas = ventasRes.data ?? [];
      const nombrePorId = new Map((perfilesRes.data ?? []).map((p: any) => [p.id, p.nombre]));

      const porAsesor = new Map<string, FilaReporte>();
      const getFila = (asesorId: string | null) => {
        const key = asesorId ?? "sin_asignar";
        if (!porAsesor.has(key)) {
          porAsesor.set(key, {
            asesor: asesorId ? (nombrePorId.get(asesorId) ?? "—") : "Sin asignar",
            leadsTotal: 0, leadsCerrados: 0, ventasTotal: 0, ingresos: 0, conversion: 0,
          });
        }
        return porAsesor.get(key)!;
      };

      leads.forEach((l: any) => {
        const fila = getFila(l.asesor_id);
        fila.leadsTotal += 1;
        if (l.etapa === "cerrado") fila.leadsCerrados += 1;
      });
      ventas.forEach((v: any) => {
        const fila = getFila(v.asesor_id);
        fila.ventasTotal += 1;
        fila.ingresos += Number(v.monto) || 0;
      });

      const resultado = Array.from(porAsesor.values()).map((f) => ({
        ...f,
        conversion: f.leadsTotal > 0 ? Math.round((f.leadsCerrados / f.leadsTotal) * 100) : 0,
      }));

      setFilas(resultado);
      setLoading(false);
    };

    cargar();
  }, []);

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Reportes</h1>
        <button
          onClick={() => descargarCSV(filas)}
          disabled={filas.length === 0}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 8, padding: "8px 14px", color: "#00d4ff", fontWeight: 700, fontSize: 12, cursor: filas.length ? "pointer" : "default", opacity: filas.length ? 1 : 0.5 }}
        >
          <Download size={13} /> Exportar CSV
        </button>
      </div>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
        {esSupervisorOAdmin ? "Comparativo por asesor" : "Tu desempeño individual"}
      </p>

      {loading ? (
        <div style={{ color: "#64748b", fontSize: 13 }}>Calculando…</div>
      ) : filas.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 13, padding: "30px 0", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10 }}>
          Sin datos suficientes todavía para generar el reporte.
        </div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                {["Asesor", "Leads totales", "Leads cerrados", "Ventas", "Ingresos", "Conversión"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#64748b", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700 }}>{f.asesor}</td>
                  <td style={{ padding: "10px 14px" }}>{f.leadsTotal}</td>
                  <td style={{ padding: "10px 14px" }}>{f.leadsCerrados}</td>
                  <td style={{ padding: "10px 14px" }}>{f.ventasTotal}</td>
                  <td style={{ padding: "10px 14px", color: "#f59e0b", fontWeight: 700 }}>${f.ingresos.toLocaleString("es-CO")}</td>
                  <td style={{ padding: "10px 14px", color: "#10b981", fontWeight: 700 }}>{f.conversion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
