"use client";
import { X, Scale } from "lucide-react";
import { C } from "@/lib/constants";
import type { Plan } from "./PlanCard";

const OP_COLORS: Record<string, string> = { Claro: "#e2001a", Movistar: "#00aa44", Etb: "#f59e0b", Tigo: "#00a0e3" };

export const CompareBar = ({ planes, onRemove, onClear, onOpen }: {
  planes: Plan[]; onRemove: (id: string) => void; onClear: () => void; onOpen: () => void;
}) => {
  if (planes.length === 0) return null;
  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      background: "rgba(8,6,28,0.98)", border: `1px solid ${C.neon}44`,
      borderRadius: 14, padding: "12px 16px", zIndex: 200,
      display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 32px rgba(0,212,255,0.2)",
      backdropFilter: "blur(20px)", maxWidth: "calc(100% - 32px)",
    }}>
      <div style={{ display: "flex", gap: 6 }}>
        {planes.map((p) => (
          <div key={p.id_crc ?? p.id} style={{ display: "flex", alignItems: "center", gap: 5, background: `${OP_COLORS[p.operador] ?? C.neon}14`, borderRadius: 8, padding: "4px 8px" }}>
            <span style={{ color: "#fff", fontSize: 10.5, fontWeight: 700, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.operador}</span>
            <button onClick={() => onRemove(p.id_crc ?? p.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
              <X size={11} color="rgba(255,255,255,0.5)" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", borderRadius: 9, padding: "9px 16px", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}>
        <Scale size={13} />Comparar ({planes.length})
      </button>
      <button onClick={onClear} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer" }}>Limpiar</button>
    </div>
  );
};

export const CompareModal = ({ planes, onClose }: { planes: Plan[]; onClose: () => void }) => {
  const rows: { label: string; get: (p: Plan) => string }[] = [
    { label: "Operador",   get: (p) => p.operador },
    { label: "Plan",       get: (p) => p.nombre },
    { label: "Precio/mes", get: (p) => `$${p.precio.toLocaleString("es-CO")}` },
    { label: "Velocidad",  get: (p) => p.velocidad_mbps ? `${p.velocidad_mbps} Mbps` : "—" },
    { label: "Datos",      get: (p) => p.datos_gb == null ? "—" : p.datos_gb === -1 ? "Ilimitados" : `${p.datos_gb} GB` },
    { label: "Canales TV", get: (p) => p.canales_tv ? `${p.canales_tv}` : "—" },
    { label: "Minutos",    get: (p) => p.minutos && p.minutos !== "0" ? (p.minutos === "-1" ? "Ilimitados" : p.minutos) : "—" },
    { label: "Modalidad",  get: (p) => p.modalidad ?? "—" },
    { label: "Tecnología", get: (p) => p.tecnologia ?? "—" },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(4,4,15,0.92)", backdropFilter: "blur(12px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#0d0d1a", border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, maxWidth: 720, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 17 }}>Comparación de planes</h2>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#fff" }}>✕</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 10px", color: C.muted, fontSize: 11 }}></th>
                {planes.map((p) => (
                  <th key={p.id} style={{ textAlign: "left", padding: "8px 10px", color: C.neon, fontSize: 12, fontWeight: 800 }}>{p.operador}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                  <td style={{ padding: "9px 10px", color: C.muted, fontSize: 12, fontWeight: 600 }}>{r.label}</td>
                  {planes.map((p) => (
                    <td key={p.id} style={{ padding: "9px 10px", color: "#fff", fontSize: 12 }}>{r.get(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
