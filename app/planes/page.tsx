"use client";

import { useEffect, useState } from "react";
import { getPlanes, getOperadores } from "../../lib/supabase";

const TIPOS = ["internet", "movil", "tv", "paquete"];

export default function PlanesPage() {
  const [planes, setPlanes]       = useState<any[]>([]);
  const [operadores, setOperadores] = useState<string[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);

  // Filtros
  const [operador, setOperador]   = useState("");
  const [tipo, setTipo]           = useState("");
  const [precioMax, setPrecioMax] = useState("");

  const cargar = async () => {
    setLoading(true);
    try {
      const { planes, total } = await getPlanes({
        operador: operador || undefined,
        tipo:     tipo     || undefined,
        precioMax: precioMax ? Number(precioMax) : undefined,
        page,
        pageSize: 20,
      });
      setPlanes(planes || []);
      setTotal(total || 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { getOperadores().then(setOperadores); }, []);
  useEffect(() => { cargar(); }, [operador, tipo, precioMax, page]);

  return (
    <div style={{ background: "#04040f", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, background: "linear-gradient(90deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Planes disponibles
          </h1>
          <p style={{ color: "rgba(180,195,230,0.6)", marginTop: 6 }}>{total} planes encontrados</p>
        </div>

        {/* FILTROS */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <select value={operador} onChange={e => { setOperador(e.target.value); setPage(1); }}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 9, padding: "9px 14px", color: "#fff", fontSize: 13, outline: "none" }}>
            <option value="">Todos los operadores</option>
            {operadores.map(op => <option key={op} value={op}>{op}</option>)}
          </select>

          <select value={tipo} onChange={e => { setTipo(e.target.value); setPage(1); }}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 9, padding: "9px 14px", color: "#fff", fontSize: 13, outline: "none" }}>
            <option value="">Todos los tipos</option>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <input type="number" placeholder="Precio máximo" value={precioMax} onChange={e => { setPrecioMax(e.target.value); setPage(1); }}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 9, padding: "9px 14px", color: "#fff", fontSize: 13, outline: "none", width: 160 }} />
        </div>

        {/* PLANES */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(0,212,255,0.5)" }}>Cargando planes...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {planes.map((p, i) => (
              <div key={p.id || i} style={{ background: "rgba(8,6,28,0.8)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 14, padding: 20, transition: "transform .2s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{p.operador}</span>
                  <span style={{ color: "rgba(180,195,230,0.4)", fontSize: 10 }}>{p.tipo}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8, color: "#fff", lineHeight: 1.3 }}>{p.nombre}</div>
                <div style={{ fontWeight: 900, fontSize: 22, color: "#00d4ff", marginBottom: 10 }}>
                  ${(p.precio || 0).toLocaleString()}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/mes</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
                  {p.velocidad_mbps && <span style={{ color: "rgba(180,195,230,0.6)", fontSize: 12 }}>⚡ {p.velocidad_mbps} Mbps</span>}
                  {p.datos_gb && <span style={{ color: "rgba(180,195,230,0.6)", fontSize: 12 }}>📱 {p.datos_gb === -1 ? "Datos ilimitados" : `${p.datos_gb} GB`}</span>}
                  {p.minutos && <span style={{ color: "rgba(180,195,230,0.6)", fontSize: 12 }}>📞 {p.minutos === -1 ? "Minutos ilimitados" : `${p.minutos} min`}</span>}
                  {p.canales_tv && <span style={{ color: "rgba(180,195,230,0.6)", fontSize: 12 }}>📺 {p.canales_tv} canales</span>}
                  {p.modalidad && <span style={{ color: "rgba(180,195,230,0.6)", fontSize: 12 }}>🔄 {p.modalidad}</span>}
                </div>
                {p.url_origen && (
                  <a href={p.url_origen} target="_blank" rel="noopener noreferrer"
                    style={{ display: "block", width: "100%", background: "linear-gradient(135deg,#25d366,#128c7e)", color: "#fff", border: "none", borderRadius: 9, padding: "9px 0", fontWeight: 700, fontSize: 12, textAlign: "center", textDecoration: "none", cursor: "pointer" }}>
                    Ver plan →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PAGINACIÓN */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 32 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 9, padding: "8px 18px", color: "#00d4ff", fontWeight: 700, cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1 }}>← Anterior</button>
          <span style={{ color: "rgba(180,195,230,0.5)", alignSelf: "center", fontSize: 13 }}>Página {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 9, padding: "8px 18px", color: "#00d4ff", fontWeight: 700, cursor: page * 20 >= total ? "default" : "pointer", opacity: page * 20 >= total ? 0.4 : 1 }}>Siguiente →</button>
        </div>

      </div>
    </div>
  );
}