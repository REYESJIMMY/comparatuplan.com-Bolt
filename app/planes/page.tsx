"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { C } from "@/lib/constants";
import { Search, SlidersHorizontal } from "lucide-react";
import { FiltrosSidebar, FILTROS_INICIALES, type Filtros } from "@/components/planes/FiltrosSidebar";
import { OrdenSelect, type OrdenId } from "@/components/planes/OrdenSelect";
import { PlanCard, type Plan } from "@/components/planes/PlanCard";
import { CompareBar, CompareModal } from "@/components/planes/CompareBar";
import { useCompare } from "@/context/CompareContext";

const PAGE_SIZE = 24;


export default function PlanesPage() {
  const { user, favoritos, toggleFavorito } = useAuth();
  const { seleccionados, toggle, limpiar, quitarPlan, estaSeleccionado, puedeAgregar } = useCompare();

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);
  const [orden, setOrden] = useState<OrdenId>("precio_asc");
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get("tipo") ?? "";
    const op = params.get("operador") ?? "";
    if (tipo) setFiltros((f) => ({ ...f, tipo }));
    if (op) setFiltros((f) => ({ ...f, operadores: [op] }));
  }, []);

  const fetchPlanes = useCallback(async (reset = false) => {
    if (reset) { setLoading(true); setPage(0); }
    else setLoadingMore(true);

    const from = reset ? 0 : page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = supabase
      .from("catalogo_unificado")
      .select("id, id_crc, operador, nombre, tipo, precio, velocidad_mbps, datos_gb, canales_tv, minutos, modalidad, tecnologia, estrato_min, estrato_max, fuente", { count: "estimated" })
      .gte("precio", filtros.precioMin)
      .lte("precio", filtros.precioMax);

    if (filtros.tipo) q = q.eq("tipo", filtros.tipo);
    if (filtros.operadores.length > 0) q = q.in("operador", filtros.operadores);
    if (filtros.modalidad === "prepago") q = q.ilike("modalidad", "%PRE%");
    else if (filtros.modalidad === "pospago") q = q.ilike("modalidad", "%POS%");
    if (filtros.velocidadMin > 0) q = q.gte("velocidad_mbps", filtros.velocidadMin);
    if (filtros.canalesMin > 0) q = q.gte("canales_tv", filtros.canalesMin);
    if (filtros.tecnologia) q = q.ilike("tecnologia", `%${filtros.tecnologia}%`);
    if (filtros.datosMin === -1) q = q.eq("datos_gb", -1);
    else if (filtros.datosMin > 0) q = q.gte("datos_gb", filtros.datosMin);

    if (filtros.estrato > 0) {
      q = q.or(`estrato_min.is.null,and(estrato_min.lte.${filtros.estrato},estrato_max.gte.${filtros.estrato})`);
    }

    if (busqueda) q = q.ilike("nombre", `%${busqueda}%`);

    if (filtros.estrato > 0) q = q.order("fuente", { ascending: false });

    if (orden === "precio_asc") q = q.order("precio", { ascending: true });
    if (orden === "precio_desc") q = q.order("precio", { ascending: false });
    if (orden === "velocidad_desc") q = q.order("velocidad_mbps", { ascending: false, nullsFirst: false });
    if (orden === "datos_desc") q = q.order("datos_gb", { ascending: false, nullsFirst: false });

    q = q.range(from, to);

    const { data, count, error } = await q;
    if (!error && data) {
      setPlanes(reset ? (data as Plan[]) : (prev) => [...prev, ...(data as Plan[])]);
      setTotal(count ?? 0);
      if (!reset) setPage((p) => p + 1);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [filtros, orden, busqueda, page]);

  useEffect(() => { fetchPlanes(true); }, [filtros, orden, busqueda]);

  const isFav = (plan: Plan) => favoritos.some((f: any) => f.id_crc === plan.id_crc || f.id === plan.id);
  const handleFav = (plan: Plan) => toggleFavorito({ id_crc: plan.id_crc!, operador: plan.operador, nombre: plan.nombre, precio: plan.precio, tipo: plan.tipo });  

  const comparePlanes = useMemo(
    () => planes.filter((p) => estaSeleccionado(p.id_crc ?? p.id)),
    [planes, seleccionados]
  );
  const stats = useMemo(() => {
    if (planes.length === 0) return null;
    const precios = planes.map((p) => p.precio);
    return {
      min: Math.min(...precios),
      max: Math.max(...precios),
      avg: Math.round(precios.reduce((a, b) => a + b, 0) / precios.length),
    };
  }, [planes]);

  const activeFilterCount = [
    filtros.tipo, filtros.operadores.length > 0, filtros.modalidad,
    filtros.precioMax < 500000 || filtros.precioMin > 0,
    filtros.velocidadMin > 0, filtros.datosMin !== 0, filtros.canalesMin > 0,
    filtros.estrato > 0, filtros.tecnologia,
  ].filter(Boolean).length;

  return (
    <div style={{ background: "#04040f", minHeight: "100vh", color: "#fff", fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Header sticky */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(4,4,15,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 20px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" style={{ color: C.neon, fontSize: 13, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>← ComparaTuPlan</Link>
          <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(180,195,230,0.4)" }} />
            <input
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar plan, operador..."
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 12px 9px 34px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" as const }}
            />
          </div>
          <OrdenSelect value={orden} onChange={setOrden} />
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="filters-toggle-mobile"
            style={{ display: "none", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 14px", color: "rgba(180,195,230,0.6)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            <SlidersHorizontal size={14} />Filtros
            {activeFilterCount > 0 && <span style={{ background: C.neon, color: "#000", borderRadius: 99, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900 }}>{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      <div className="planes-grid-wrap" style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px 100px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>

        {/* Sidebar */}
        <aside style={{ display: showFilters ? "block" : "none" }}>
          <div style={{ position: "sticky", top: 90 }}>
            <FiltrosSidebar filtros={filtros} onChange={setFiltros} onClear={() => setFiltros(FILTROS_INICIALES)} activeCount={activeFilterCount} />
          </div>
        </aside>

        {/* Resultados */}
        <div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", fontWeight: 900, margin: 0 }}>Catálogo de planes</h1>
              {!loading && (
                <span style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: C.neon, borderRadius: 99, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>
                  {total.toLocaleString()} planes
                </span>
              )}
            </div>
            {stats && (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "8px 14px" }}>
                {[["Mínimo", stats.min, C.green], ["Promedio", stats.avg, C.neon], ["Máximo", stats.max, C.red]].map(([l, v, c]) => (
                  <span key={String(l)} style={{ fontSize: 11.5, color: "rgba(180,195,230,0.5)" }}>
                    {l}: <strong style={{ color: String(c) }}>${Number(v).toLocaleString("es-CO")}</strong>
                  </span>
                ))}
                <span style={{ fontSize: 10, color: "rgba(180,195,230,0.3)" }}>· sobre los planes cargados</span>
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, height: 260, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : planes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Sin resultados</div>
              <div style={{ color: "rgba(180,195,230,0.4)", fontSize: 13, marginBottom: 24 }}>Prueba ajustando los filtros</div>
              <button onClick={() => { setFiltros(FILTROS_INICIALES); setBusqueda(""); }} style={{ background: "linear-gradient(135deg,#0070cc,#0050aa)", border: "none", borderRadius: 10, padding: "11px 24px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Ver todos los planes
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14, marginBottom: 28 }}>
                {planes.map((plan) => (
                  <PlanCard
                    key={plan.id} plan={plan} isFav={isFav(plan)} onFav={handleFav}
                    isLoggedIn={!!user} onAuthPrompt={() => setShowBanner(true)}
                    compareChecked={estaSeleccionado(plan.id_crc ?? plan.id)}
                    onToggleCompare={(p) => toggle(p.id_crc ?? p.id)}
                    compareDisabled={!puedeAgregar}
                  />
                ))}
              </div>
              {planes.length < total && (
                <div style={{ textAlign: "center" }}>
                  <button onClick={() => fetchPlanes(false)} disabled={loadingMore} style={{ background: "rgba(0,212,255,0.08)", border: `1px solid ${C.neon}44`, borderRadius: 10, padding: "12px 32px", color: C.neon, fontWeight: 700, fontSize: 13, cursor: loadingMore ? "default" : "pointer", opacity: loadingMore ? 0.6 : 1 }}>
                    {loadingMore ? "Cargando..." : `Cargar más (${total - planes.length} restantes)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!user && planes.length > 0 && showBanner && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(8,6,28,0.97)", border: `1px solid ${C.neon}44`,
          borderRadius: 14, padding: "16px 20px", zIndex: 100,
          display: "flex", alignItems: "center", gap: 16,
          boxShadow: "0 8px 32px rgba(0,212,255,0.2)",
          maxWidth: 480, width: "calc(100% - 40px)", backdropFilter: "blur(20px)",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>💾 Guarda tus planes favoritos</div>
            <div style={{ color: "rgba(180,195,230,0.5)", fontSize: 11 }}>Regístrate gratis y accede desde cualquier dispositivo</div>
          </div>
          <Link href="/?auth=register" style={{ background: "linear-gradient(135deg,#0070cc,#0050aa)", borderRadius: 9, padding: "9px 16px", color: "#fff", fontWeight: 700, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}>
            Crear cuenta →
          </Link>
          <button onClick={() => setShowBanner(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 4, display: "flex" }}>✕</button>
        </div>
      )}

      <CompareBar
        planes={comparePlanes}
        onRemove={(id) => setCompareIds((prev) => prev.filter((i) => i !== id))}
        onClear={() => setCompareIds([])}
        onOpen={() => setShowCompareModal(true)}
      />
      {showCompareModal && <CompareModal planes={comparePlanes} onClose={() => setShowCompareModal(false)} />}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @media (max-width: 900px) {
          .filters-toggle-mobile { display: flex !important; }
          .planes-grid-wrap { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
