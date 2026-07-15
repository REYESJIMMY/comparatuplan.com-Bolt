"use client";
import { useEffect, useState } from "react";
import { Search, X, Scale } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface OfertaAsesor {
  id: string;
  operador: string;
  nombre: string;
  tipo: string | null;
  tecnologia: string | null;
  velocidad_mbps: number | null;
  precio: number;
  precio_promocion: number | null;
  promocion_vigente: boolean;
  notas_internas: string | null;
}

const TIPOS = ["internet", "movil", "tv", "paquete"];

export default function PanelOfertasPage() {
  const [ofertas, setOfertas] = useState<OfertaAsesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [operador, setOperador] = useState("");
  const [tipo, setTipo] = useState("");
  const [soloPromo, setSoloPromo] = useState(false);
  const [comparar, setComparar] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("ofertas_asesores")
      .select("*")
      .eq("activa", true)
      .order("operador", { ascending: true })
      .then(({ data }) => {
        setOfertas(data ?? []);
        setLoading(false);
      });
  }, []);

  const operadores = Array.from(new Set(ofertas.map((o) => o.operador))).sort();

  const filtradas = ofertas.filter((o) => {
    if (operador && o.operador !== operador) return false;
    if (tipo && o.tipo !== tipo) return false;
    if (soloPromo && !o.promocion_vigente) return false;
    if (busqueda && !`${o.operador} ${o.nombre}`.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const toggleComparar = (id: string) => {
    setComparar((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // máximo 3
      return [...prev, id];
    });
  };

  const ofertasComparadas = ofertas.filter((o) => comparar.includes(o.id));

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Ofertas para asesores</h1>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
        Catálogo interno — solo visible para el equipo de ventas
      </p>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar oferta u operador..."
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px 8px 32px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <select value={operador} onChange={(e) => setOperador(e.target.value)}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13 }}>
          <option value="">Todos los operadores</option>
          {operadores.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13 }}>
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          onClick={() => setSoloPromo(!soloPromo)}
          style={{
            padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${soloPromo ? "#f59e0b" : "rgba(255,255,255,0.1)"}`,
            background: soloPromo ? "rgba(245,158,11,0.12)" : "transparent",
            color: soloPromo ? "#f59e0b" : "#94a3b8",
          }}
        >
          🔥 Solo promociones
        </button>
      </div>

      {/* Barra de comparación */}
      {comparar.length > 0 && (
        <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
          <Scale size={15} color="#00d4ff" />
          <span style={{ fontSize: 12, color: "#00d4ff", fontWeight: 700 }}>
            {comparar.length} de 3 seleccionadas para comparar
          </span>
          {comparar.length >= 2 && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>— revisa la tabla comparativa abajo</span>
          )}
          <button onClick={() => setComparar([])} style={{ marginLeft: "auto", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <X size={12} /> limpiar
          </button>
        </div>
      )}

      {/* Comparador */}
      {ofertasComparadas.length >= 2 && (
        <div style={{ overflowX: "auto", marginBottom: 24, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "#64748b" }}>Característica</th>
                {ofertasComparadas.map((o) => (
                  <th key={o.id} style={{ textAlign: "left", padding: "10px 12px", color: "#fff" }}>{o.operador} — {o.nombre}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Tipo", (o: OfertaAsesor) => o.tipo ?? "—"],
                ["Tecnología", (o: OfertaAsesor) => o.tecnologia ?? "—"],
                ["Velocidad", (o: OfertaAsesor) => o.velocidad_mbps ? `${o.velocidad_mbps} Mbps` : "—"],
                ["Precio", (o: OfertaAsesor) => `$${o.precio.toLocaleString("es-CO")}`],
                ["Precio promo", (o: OfertaAsesor) => o.precio_promocion ? `$${o.precio_promocion.toLocaleString("es-CO")}` : "—"],
              ].map(([label, fn]: any) => (
                <tr key={label} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "9px 12px", color: "#94a3b8" }}>{label}</td>
                  {ofertasComparadas.map((o) => (
                    <td key={o.id} style={{ padding: "9px 12px", color: "#fff" }}>{fn(o)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Listado */}
      {loading ? (
        <div style={{ color: "#64748b", fontSize: 13 }}>Cargando ofertas…</div>
      ) : filtradas.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 13, padding: "30px 0", textAlign: "center" }}>
          {ofertas.length === 0
            ? "No hay ofertas internas cargadas todavía. Un admin puede agregarlas desde Supabase o desde el panel de administración (próximo sprint)."
            : "No hay ofertas que coincidan con los filtros."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
          {filtradas.map((o) => {
            const sel = comparar.includes(o.id);
            return (
              <div key={o.id} style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${sel ? "#00d4ff" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 12, padding: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ color: "#00d4ff", fontSize: 11, fontWeight: 700 }}>{o.operador}</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{o.nombre}</div>
                  </div>
                  {o.promocion_vigente && (
                    <span style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>PROMO</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  {o.precio_promocion ? (
                    <>
                      <span style={{ color: "#f59e0b", fontWeight: 900, fontSize: 20 }}>${o.precio_promocion.toLocaleString("es-CO")}</span>
                      <span style={{ color: "#64748b", fontSize: 11, textDecoration: "line-through", marginLeft: 6 }}>${o.precio.toLocaleString("es-CO")}</span>
                    </>
                  ) : (
                    <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: 20 }}>${o.precio.toLocaleString("es-CO")}</span>
                  )}
                </div>
                {o.velocidad_mbps && <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 8 }}>⚡ {o.velocidad_mbps} Mbps · {o.tecnologia}</div>}
                {o.notas_internas && <div style={{ color: "#64748b", fontSize: 10, marginBottom: 10, fontStyle: "italic" }}>{o.notas_internas}</div>}
                <button
                  onClick={() => toggleComparar(o.id)}
                  disabled={!sel && comparar.length >= 3}
                  style={{
                    width: "100%", padding: "7px 0", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    border: `1px solid ${sel ? "#00d4ff" : "rgba(255,255,255,0.1)"}`,
                    background: sel ? "rgba(0,212,255,0.12)" : "transparent",
                    color: sel ? "#00d4ff" : "#94a3b8",
                    opacity: !sel && comparar.length >= 3 ? 0.4 : 1,
                  }}
                >
                  {sel ? "✓ En comparación" : "+ Comparar"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
