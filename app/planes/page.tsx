"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { C } from "@/lib/constants";

// ── Constantes ────────────────────────────────────────────────
const OPERADORES_FASE1 = ["Claro", "Movistar", "Etb", "Tigo"];

const TIPOS_CONFIG = [
  { id: "",          label: "Todos",    emoji: "🔍" },
  { id: "internet",  label: "Internet", emoji: "📡" },
  { id: "movil",     label: "Móvil",    emoji: "📱" },
  { id: "paquete",   label: "Paquete",  emoji: "📦" },
  { id: "tv",        label: "TV",       emoji: "📺" },
];

const OPERADORES_CONFIG = [
  { id: "",         label: "Todos",    color: "#00d4ff" },
  { id: "Claro",    label: "Claro",    color: "#e2001a" },
  { id: "Movistar", label: "Movistar", color: "#00aa44" },
  { id: "Etb",      label: "ETB",      color: "#f59e0b" },
  { id: "Tigo",     label: "Tigo",     color: "#00a0e3" },
];

const PRECIOS_CONFIG = [
  { id: "",       label: "Cualquier precio", max: 0 },
  { id: "30",     label: "Hasta $30.000",    max: 30000 },
  { id: "60",     label: "Hasta $60.000",    max: 60000 },
  { id: "100",    label: "Hasta $100.000",   max: 100000 },
  { id: "150",    label: "Hasta $150.000",   max: 150000 },
  { id: "200",    label: "Hasta $200.000",   max: 200000 },
];

const PAGE_SIZE = 24;

// ── Helpers ───────────────────────────────────────────────────
const formatPrecio = (p: number) =>
  p ? `$${Number(p).toLocaleString("es-CO")}` : "Consultar";

const getTipoColor = (tipo: string) => {
  const map: Record<string, string> = {
    internet: "#00d4ff", movil: "#a855f7",
    paquete: "#f59e0b", tv: "#ec4899", otro: "#10b981",
  };
  return map[tipo] ?? "#00d4ff";
};

// ── Componente principal ──────────────────────────────────────
export default function PlanesPage() {
  const { toggleFavorito, isFavorito, user } = useAuth();

  const [planes,   setPlanes]   = useState<any[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);

  // Filtros
  const [tipo,     setTipo]     = useState("");
  const [operador, setOperador] = useState("");
  const [precioId, setPrecioId] = useState("");

  const precioMax = PRECIOS_CONFIG.find((p) => p.id === precioId)?.max ?? 0;

  const cargar = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("planes_unicos")
        .select("id_crc, operador, nombre, tipo, precio, velocidad_mbps, datos_gb, minutos, canales_tv, modalidad, tecnologia", { count: "exact" })
        .in("operador", OPERADORES_FASE1)
        .order("precio", { ascending: true })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (tipo)     query = query.eq("tipo", tipo);
      if (operador) query = query.eq("operador", operador);
      if (precioMax) query = query.lte("precio", precioMax);

      const { data, count, error } = await query;
      if (error) throw error;
      setPlanes(data ?? []);
      setTotal(count ?? 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [tipo, operador, precioId, page]);

  const handleFiltro = (setter: (v: any) => void, val: any) => {
    setter(val);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ background: "#04040f", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <a href="/" style={{ color: "rgba(180,195,230,0.4)", fontSize: 12, textDecoration: "none" }}>Inicio</a>
            <span style={{ color: "rgba(180,195,230,0.2)" }}>›</span>
            <span style={{ color: "rgba(180,195,230,0.6)", fontSize: 12 }}>Planes</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 900, background: "linear-gradient(90deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>
            Catálogo de planes
          </h1>
          <p style={{ color: "rgba(180,195,230,0.5)", fontSize: 13 }}>
            {loading ? "Cargando..." : `${total.toLocaleString()} planes de Claro, Movistar, ETB y Tigo`}
          </p>
        </div>

        {/* ── Filtros visuales ───────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>

          {/* Tipo */}
          <div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>TIPO DE PLAN</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TIPOS_CONFIG.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleFiltro(setTipo, t.id)}
                  style={{
                    padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all .18s",
                    background: tipo === t.id ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${tipo === t.id ? "#00d4ff" : "rgba(255,255,255,0.08)"}`,
                    color: tipo === t.id ? "#00d4ff" : "rgba(180,195,230,0.5)",
                  }}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Operador */}
          <div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>OPERADOR</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {OPERADORES_CONFIG.map((op) => (
                <button
                  key={op.id}
                  onClick={() => handleFiltro(setOperador, op.id)}
                  style={{
                    padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all .18s",
                    background: operador === op.id ? `${op.color}18` : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${operador === op.id ? op.color : "rgba(255,255,255,0.08)"}`,
                    color: operador === op.id ? op.color : "rgba(180,195,230,0.5)",
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Precio */}
          <div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PRECIO MÁXIMO</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRECIOS_CONFIG.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleFiltro(setPrecioId, p.id)}
                  style={{
                    padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all .18s",
                    background: precioId === p.id ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${precioId === p.id ? "#f59e0b" : "rgba(255,255,255,0.08)"}`,
                    color: precioId === p.id ? "#f59e0b" : "rgba(180,195,230,0.5)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid de planes ─────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
            <div style={{ color: "rgba(0,212,255,0.5)", fontWeight: 600 }}>Cargando planes...</div>
          </div>
        ) : planes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(180,195,230,0.4)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
            <p>No encontramos planes con esos filtros.</p>
            <button
              onClick={() => { setTipo(""); setOperador(""); setPrecioId(""); setPage(1); }}
              style={{ marginTop: 16, padding: "9px 22px", borderRadius: 10, border: "1px solid rgba(0,212,255,0.3)", background: "transparent", color: "#00d4ff", fontWeight: 700, cursor: "pointer" }}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {planes.map((p, i) => {
              const color = getTipoColor(p.tipo);
              const precio = Number(p.precio) || 0;
              const esFav  = isFavorito(p.id_crc);
              return (
                <div
                  key={p.id_crc ?? i}
                  style={{
                    background: "rgba(8,6,28,0.85)",
                    border: `1px solid ${color}20`,
                    borderRadius: 14, padding: 18,
                    transition: "all .2s", position: "relative",
                    display: "flex", flexDirection: "column", gap: 0,
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = `${color}44`;
                    e.currentTarget.style.boxShadow = `0 8px 24px ${color}14`;
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.borderColor = `${color}20`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Botón favorito */}
                  <button
                    onClick={() => toggleFavorito({
                      id_crc:   p.id_crc,
                      operador: p.operador,
                      nombre:   p.nombre,
                      precio:   precio,
                      tipo:     p.tipo,
                    })}
                    title={user ? (esFav ? "Quitar favorito" : "Guardar favorito") : "Inicia sesión para guardar"}
                    style={{
                      position: "absolute", top: 12, right: 12,
                      background: esFav ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${esFav ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 8, padding: "5px 7px",
                      cursor: "pointer", transition: "all .2s",
                    }}
                  >
                    <Heart size={13} fill={esFav ? "#ec4899" : "none"} color={esFav ? "#ec4899" : "rgba(180,195,230,0.4)"} />
                  </button>

                  {/* Operador + Tipo */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingRight: 32 }}>
                    <span style={{
                      background: `${color}14`, border: `1px solid ${color}33`,
                      color, borderRadius: 99, padding: "3px 10px",
                      fontSize: 11, fontWeight: 700,
                    }}>{p.operador}</span>
                    <span style={{ color: "rgba(180,195,230,0.35)", fontSize: 10 }}>{p.tipo}</span>
                  </div>

                  {/* Nombre */}
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 8, lineHeight: 1.35, minHeight: 36 }}>
                    {p.nombre}
                  </div>

                  {/* Precio */}
                  <div style={{ fontWeight: 900, fontSize: 22, color, marginBottom: 10 }}>
                    {formatPrecio(precio)}
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>/mes</span>
                  </div>

                  {/* Specs */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14, flex: 1 }}>
                    {p.velocidad_mbps > 0 && (
                      <span style={{ fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 8px", color: "rgba(180,195,230,0.7)" }}>
                        ⚡ {p.velocidad_mbps} Mbps
                      </span>
                    )}
                    {p.datos_gb > 0 && (
                      <span style={{ fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 8px", color: "rgba(180,195,230,0.7)" }}>
                        📶 {p.datos_gb === -1 ? "∞" : p.datos_gb} GB
                      </span>
                    )}
                    {p.canales_tv > 0 && (
                      <span style={{ fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 8px", color: "rgba(180,195,230,0.7)" }}>
                        📺 {p.canales_tv} canales
                      </span>
                    )}
                    {p.minutos && p.minutos !== "0" && (
                      <span style={{ fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 8px", color: "rgba(180,195,230,0.7)" }}>
                        📞 {p.minutos === "-1" ? "∞" : p.minutos} min
                      </span>
                    )}
                    {p.modalidad && (
                      <span style={{ fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 8px", color: "rgba(180,195,230,0.7)" }}>
                        {p.modalidad}
                      </span>
                    )}
                  </div>

                  {/* Acciones — NUNCA sale del sitio */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <a
                      href={`/planes/${p.id_crc}`}
                      style={{
                        flex: 1, background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 9, padding: "9px 0",
                        color: "rgba(180,195,230,0.6)", fontSize: 12,
                        fontWeight: 600, textAlign: "center",
                        textDecoration: "none", transition: "all .18s",
                      }}
                      onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(180,195,230,0.6)"; }}
                    >
                      Ver detalle
                    </a>
                    <a
                      href={`https://wa.me/573057876992?text=${encodeURIComponent(`Hola, me interesa el plan *${p.nombre}* de ${p.operador} que vi en ComparaTuPlan.com 🚀`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, background: "#25D366",
                        borderRadius: 9, padding: "9px 0",
                        color: "#fff", fontSize: 12, fontWeight: 700,
                        textAlign: "center", textDecoration: "none",
                        transition: "opacity .18s",
                      }}
                      onMouseEnter={(e: any) => e.currentTarget.style.opacity = "0.9"}
                      onMouseLeave={(e: any) => e.currentTarget.style.opacity = "1"}
                    >
                      💬 Lo quiero
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Paginación ─────────────────────────────────────── */}
        {!loading && total > PAGE_SIZE && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 36 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
                borderRadius: 9, padding: "9px 20px", color: "#00d4ff",
                fontWeight: 700, cursor: page === 1 ? "default" : "pointer",
                opacity: page === 1 ? 0.4 : 1,
              }}
            >← Anterior</button>

            <span style={{ color: "rgba(180,195,230,0.4)", fontSize: 13 }}>
              Página {page} de {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              style={{
                background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
                borderRadius: 9, padding: "9px 20px", color: "#00d4ff",
                fontWeight: 700, cursor: page >= totalPages ? "default" : "pointer",
                opacity: page >= totalPages ? 0.4 : 1,
              }}
            >Siguiente →</button>
          </div>
        )}

      </div>
    </div>
  );
}
